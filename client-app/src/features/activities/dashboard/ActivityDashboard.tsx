import React, { useEffect, useState } from "react";
import { Grid } from "semantic-ui-react";
import { IActivity } from "../../../app/models/activity";
import axios from "axios";
import ActivityList from "./ActivityList";
import ActivityDetails from "./ActivityDetails";
import { ActivityForm } from "../form/ActivityForm";
import { v4 as uuid } from "uuid";

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
    setActivities([
      ...activities,
      {
        ...activity,
        id: uuid(),
      },
    ]);
    setSelectedActivity(activity);
    activityCreationCancelled();
  };

  const editActivity = (activity: IActivity) => {
    setActivities([
      ...activities.filter((a) => a.id !== activity.id),
      activity,
    ]);
    setSelectedActivity(activity);
    setEditMode(false);
  };

  const handleSubmit = (activity: IActivity) => {
    if (activity.id.length === 0) {
      createActivity(activity);
    } else {
      editActivity(activity);
    }
  };

  const handleDelete = (id: string) => {
    setActivities([...activities.filter((a) => a.id !== id)]);
  };

  useEffect(() => {
    axios
      .get<IActivity[]>("http://localhost:5000/api/activities")
      .then((res) => {
        let activities: IActivity[] = [];
        res.data.forEach((activity) => {
          activity.date = activity.date.split(".")[0];
          activities.push(activity);
        });
        setActivities(activities);
      });
  }, []);

  return (
    <Grid>
      <Grid.Column width={10}>
        <ActivityList
          activities={activities}
          didSelectActivity={didSelectActivity}
          didSelectDelete={handleDelete}
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
          />
        )}
      </Grid.Column>
    </Grid>
  );
};

export default ActivityDashboard;
