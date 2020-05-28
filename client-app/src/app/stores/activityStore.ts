import { IActivity } from "./../models/activity";
import { observable, action, computed, configure, runInAction } from "mobx";
import { createContext } from "react";
import agent from "../api/agent";
import { v4 as uuid } from "uuid";

export enum ActivityDashboardMode {
  NONE,
  EDIT,
  CREATE,
}

configure({ enforceActions: "always" });

class ActivityStore {
  @observable activityRegistry = new Map();
  @observable selectedActivity: IActivity | null = null;
  @observable deletingId: string | null = null;
  @observable loading = false;
  @observable mode = ActivityDashboardMode.NONE;
  @observable submitting = false;

  @computed get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a, b) => Date.parse(a.date) - Date.parse(b.date)
    );
  }

  @action loadActivities = async () => {
    this.loading = true;
    try {
      const activities = await agent.Activities.list();
      runInAction("loading acitvities", () => {
        activities.forEach((activity) => {
          activity.date = activity.date.split(".")[0];
          this.activityRegistry.set(activity.id, activity);
        });
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction("loading acitvities stop", () => {
        this.loading = false;
      });
    }
  };

  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.update(activity);
      runInAction("edit acitvity success", () => {
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
        this.mode = ActivityDashboardMode.NONE;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction("edit acitvity finally", () => {
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
      runInAction("create acitvity success", () => {
        this.selectedActivity = newActivity;
        this.activityRegistry.set(newActivity.id, newActivity);
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction("create acitvity finally", () => {
        this.submitting = false;
        this.mode = ActivityDashboardMode.NONE;
      });
    }
  };

  @action deleteActivity = async (activity: IActivity) => {
    this.deletingId = activity.id;
    try {
      await agent.Activities.delete(activity.id);
      runInAction("delete acitvity success", () => {
        this.activityRegistry.delete(activity.id);
        this.selectedActivity = null;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction("deleting activity finally", () => {
        this.deletingId = null;
        this.mode = ActivityDashboardMode.NONE;
      });
    }
  };

  @action setSelectedActivity = (activity: IActivity | null) => {
    this.mode = ActivityDashboardMode.NONE;
    this.selectedActivity = activity;
  };

  @action setSubmittingActivity = (editting: boolean) => {
    this.submitting = false;
  };

  @action setDashboardMode = (mode: ActivityDashboardMode) => {
    this.mode = mode;
  };
}

export default createContext(new ActivityStore());
