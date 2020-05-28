import React, { useEffect, useState, SyntheticEvent } from "react";
import { Grid } from "semantic-ui-react";
import { IActivity } from "../../../app/models/activity";
import ActivityList from "./ActivityList";
import ActivityDetails from "./ActivityDetails";
import { ActivityForm } from "../form/ActivityForm";
import { v4 as uuid } from "uuid";
import agent from "../../../app/api/agent";
import { LoadingComponent } from "../../../app/layout/LoadingComponent";

interface IProps {
  creatingActivity: boolean;
  activityCreationCancelled: () => void;
}

export const ActivityDashboard: React.FC<IProps> = ({
  activityCreationCancelled,
  creatingActivity,
}) => {
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(
    null
  );
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState("");

  const didSelectActivity = (id: string) => {
    activityCreationCancelled();
    setEditMode(false);
    setSelectedActivity(activities.filter((activity) => activity.id === id)[0]);
  };

  const cancelForm = () => {
    setSelectedActivity(null);
    setEditMode(false);
    creatingActivity && activityCreationCancelled();
  };

  const createActivity = (activity: IActivity) => {
    setSubmitting(true);
    const newActivity = {
      ...activity,
      id: uuid(),
    };
    agent.Activities.create(newActivity)
      .then(() => {
        setActivities([...activities, newActivity]);
        setSelectedActivity(newActivity);
        activityCreationCancelled();
      })
      .then(() => setSubmitting(false));
  };

  const editActivity = (activity: IActivity) => {
    setSubmitting(true);
    agent.Activities.update(activity)
      .then(() => {
        setActivities([
          ...activities.filter((a) => a.id !== activity.id),
          activity,
        ]);
        setSelectedActivity(activity);
        setEditMode(false);
      })
      .then(() => setSubmitting(false));
  };

  const handleSubmit = (activity: IActivity) => {
    if (activity.id.length === 0) {
      createActivity(activity);
    } else {
      editActivity(activity);
    }
  };

  const handleDelete = (
    event: SyntheticEvent<HTMLButtonElement>,
    id: string
  ) => {
    setDeleting(event.currentTarget.name);
    agent.Activities.delete(id)
      .then(() => {
        setActivities([...activities.filter((a) => a.id !== id)]);
      })
      .then(() => setDeleting(""));
  };

  useEffect(() => {
    agent.Activities.list()
      .then((res) => {
        let activities: IActivity[] = [];
        res.forEach((activity) => {
          activity.date = activity.date.split(".")[0];
          activities.push(activity);
        });
        setActivities(activities);
      })
      .then(() => setLoading(false));
  }, []);

  if (loading) return <LoadingComponent content="Loading Activities..." />;

  return (
    <Grid>
      <Grid.Column width={10}>
        <ActivityList
          activities={activities}
          didSelectActivity={didSelectActivity}
          didSelectDelete={handleDelete}
          deletingName={deleting}
        />
      </Grid.Column>
      <Grid.Column width={6}>
        {selectedActivity && !editMode && !creatingActivity && (
          <ActivityDetails
            activity={selectedActivity}
            setEditMode={setEditMode}
            cancelClicked={() => setSelectedActivity(null)}
          />
        )}
        {((selectedActivity && editMode) || creatingActivity) && (
          <ActivityForm
            key={
              (!creatingActivity && selectedActivity && selectedActivity.id) ||
              0
            }
            activity={creatingActivity ? null : selectedActivity}
            cancelClicked={cancelForm}
            handleSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </Grid.Column>
    </Grid>
  );
};

export default ActivityDashboard;
