import { setActivityProps, createAttendee } from "./../../common/util/util";
import { toast } from "react-toastify";
import { IActivity } from "./../models/activity";
import { observable, action, computed, runInAction } from "mobx";
import agent from "../api/agent";
import { v4 as uuid } from "uuid";
import { history } from "../..";
import { RootStore } from "./rootStore";

export default class ActivityStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  @observable activityRegistry = new Map();
  @observable activity: IActivity | null = null;
  @observable deletingId: string | null = null;
  @observable loading = false;
  @observable submitting = false;

  @computed get activitiesByDate() {
    return this.groupActivitiesByDate(
      Array.from(this.activityRegistry.values())
    );
  }

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
      const activities = await agent.Activities.list();
      runInAction("loading activity", () => {
        activities.forEach((activity) => {
          setActivityProps(activity, this.rootStore.userStore.user!);
          this.activityRegistry.set(activity.id, activity);
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
      return activity;
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
