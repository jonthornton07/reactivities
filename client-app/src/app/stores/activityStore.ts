import { toast } from "react-toastify";
import { IActivity } from "./../models/activity";
import { observable, action, computed, configure, runInAction } from "mobx";
import { createContext } from "react";
import agent from "../api/agent";
import { v4 as uuid } from "uuid";
import { history } from "../..";

configure({ enforceActions: "always" });

class ActivityStore {
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
          activity.date = new Date(activity.date);
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
        activity.date = new Date(activity.date);
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
}

export default createContext(new ActivityStore());
