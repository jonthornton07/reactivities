import { setActivityProps, createAttendee } from "./../../common/util/util";
import { toast } from "react-toastify";
import { IActivity } from "./../models/activity";
import {
  observable,
  action,
  computed,
  runInAction,
  reaction,
  toJS,
} from "mobx";
import agent from "../api/agent";
import { v4 as uuid } from "uuid";
import { history } from "../..";
import { RootStore } from "./rootStore";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";

const LIMIT = 2;

export default class ActivityStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    reaction(
      () => this.predicate.keys(),
      () => {
        this.page = 0;
        this.activityRegistry.clear();
        this.loadActivities();
      }
    );
  }

  @observable activityRegistry = new Map();
  @observable activity: IActivity | null = null;
  @observable deletingId: string | null = null;
  @observable loading = false;
  @observable submitting = false;
  @observable.ref hubConnection: HubConnection | null = null;
  @observable activityCount = 0;
  @observable page = 0;
  @observable predicate = new Map();

  @action setPredicate = (predicate: string, value: string | Date) => {
    this.predicate.clear();
    if (predicate !== "all") {
      this.predicate.set(predicate, value);
    }
  };

  @computed get axiosParams() {
    const params = new URLSearchParams();
    params.append("limit", String(LIMIT));
    params.append("offset", `${this.page ? this.page * LIMIT : 0}`);
    this.predicate.forEach((value, key) => {
      if (key === "startDate") {
        params.append(key, value.toISOString());
      } else {
        params.append(key, value);
      }
    });
    return params;
  }

  @computed get totalPages() {
    return Math.ceil(this.activityCount / LIMIT);
  }

  @action setPage = (page: number) => {
    this.page = page;
  };

  @action createHubConnection = (activityId: string) => {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5000/chat", {
        accessTokenFactory: () => this.rootStore.commonStore.token!,
      })
      .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection.start().then(() => {
      if (this.hubConnection!.state === "Connected") {
        this.hubConnection!.invoke("AddToGroup", activityId).catch((error) =>
          console.log(error)
        );
      }
    });

    this.hubConnection.on("ReceiveComment", (comment) => {
      runInAction(() => {
        this.activity!.comments.push(comment);
      });
    });
  };

  @action stopHubConnection = () => {
    this.hubConnection!.invoke("RemoveFromGroup", this.activity!.id)
      .then(() => this.hubConnection!.stop())
      .catch((error) => console.log(error));
  };

  @computed get activitiesByDate() {
    return this.groupActivitiesByDate(
      Array.from(this.activityRegistry.values())
    );
  }

  @action addComment = async (values: any) => {
    values.activityId = this.activity!.id;
    try {
      this.hubConnection!.invoke("SendComment", values);
    } catch (error) {
      console.log(error);
    }
  };

  groupActivitiesByDate(activities: IActivity[]) {
    const sortedActivities = activities.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    return Object.entries(
      sortedActivities.reduce((activities, activity) => {
        const date = activity.date.toISOString().split("T")[0];
        activities[date] = activities[date]
          ? [...activities[date], activity]
          : [activity];
        return activities;
      }, {} as { [key: string]: IActivity[] })
    );
  }

  @action loadActivities = async () => {
    this.loading = true;
    try {
      const activitiesEnvelope = await agent.Activities.list(this.axiosParams);
      const { activities, activityCount } = activitiesEnvelope;
      runInAction("loading activity", () => {
        activities.forEach((activity) => {
          setActivityProps(activity, this.rootStore.userStore.user!);
          this.activityRegistry.set(activity.id, activity);
          this.activityCount = activityCount;
        });
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction("loading activity stop", () => {
        this.loading = false;
      });
    }
  };

  @action loadActivity = async (id: string) => {
    let activity = this.getActivity(id);
    if (activity) {
      this.activity = activity;
      return toJS(activity);
    }
    this.loading = true;
    try {
      const activity = await agent.Activities.details(id);
      runInAction("loading activity", () => {
        setActivityProps(activity, this.rootStore.userStore.user!);
        this.activity = activity;
        this.activityRegistry.set(activity.id, activity);
        this.loading = false;
      });
      return activity;
    } catch (error) {
      console.log(error);
    } finally {
      runInAction("loading activity stop", () => {
        this.loading = false;
      });
    }
  };

  getActivity = (id: string) => {
    return this.activityRegistry.get(id);
  };

  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.update(activity);
      runInAction("edit activity success", () => {
        this.activityRegistry.set(activity.id, activity);
        this.activity = activity;
      });
      history.push(`/activities/${activity.id}`);
    } catch (error) {
      console.log(error.response);
      toast.error("Problem submitting data");
    } finally {
      runInAction("edit activity finally", () => {
        this.submitting = false;
      });
    }
  };

  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    const newActivity = {
      ...activity,
      id: uuid(),
    };
    try {
      await agent.Activities.create(newActivity);
      const attendee = createAttendee(this.rootStore.userStore.user!);
      attendee.isHost = true;
      let attendees = [];
      attendees.push(attendee);
      newActivity.attendees = attendees;
      newActivity.comments = [];
      newActivity.isHost = true;
      runInAction("create activity success", () => {
        this.activity = newActivity;
        this.activityRegistry.set(newActivity.id, newActivity);
      });
      history.push(`/activities/${newActivity.id}`);
    } catch (error) {
      console.log(error.response);
      toast.error("Problem submitting data");
    } finally {
      runInAction("create activity finally", () => {
        this.submitting = false;
      });
    }
  };

  @action deleteActivity = async (activity: IActivity) => {
    this.deletingId = activity.id;
    try {
      await agent.Activities.delete(activity.id);
      runInAction("delete acitvity success", () => {
        this.activityRegistry.delete(activity.id);
        this.activity = null;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction("deleting activity finally", () => {
        this.deletingId = null;
      });
    }
  };

  @action setActivity = (activity: IActivity | null) => {
    this.activity = activity;
  };

  @action setSubmittingActivity = (editting: boolean) => {
    this.submitting = false;
  };

  @action clearActivity = () => (this.activity = null);

  @action attendActivity = async () => {
    const attendee = createAttendee(this.rootStore.userStore.user!);
    this.submitting = true;
    try {
      await agent.Activities.attend(this.activity!.id);
      runInAction("attending activity success", () => {
        if (this.activity) {
          this.activity?.attendees.push(attendee);
          this.activity.isGoing = true;
          this.activityRegistry.set(this.activity.id, this.activity);
          this.submitting = false;
        }
      });
    } catch (error) {
      runInAction("attending activity fail", () => {
        this.submitting = false;
      });
      toast.error("Problem signing up to activity");
    }
  };

  @action cancelAttendance = async () => {
    this.submitting = true;
    try {
      await agent.Activities.unattend(this.activity!.id);
      runInAction("unattend activity success", () => {
        if (this.activity) {
          this.activity.attendees = this.activity.attendees.filter(
            (attendee) =>
              attendee.username !== this.rootStore.userStore.user!.username
          );
          this.activity.isGoing = false;
          this.activityRegistry.set(this.activity.id, this.activity);
          this.submitting = false;
        }
      });
    } catch (error) {
      runInAction("unattend activity fail", () => {
        this.submitting = false;
      });
      toast.error("Problem signing up to activity");
    }
  };
}
