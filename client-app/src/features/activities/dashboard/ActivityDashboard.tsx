import React, { useEffect, useContext } from "react";
import { Grid } from "semantic-ui-react";
import ActivityList from "./ActivityList";
import ActivityDetails from "./ActivityDetails";
import ActivityForm from "../form/ActivityForm";
import { LoadingComponent } from "../../../app/layout/LoadingComponent";
import ActivityStore, {
  ActivityDashboardMode,
} from "../../../app/stores/activityStore";
import { observer } from "mobx-react-lite";

const ActivityDashboard = () => {
  const activityStore = useContext(ActivityStore);
  const { selectedActivity, mode } = activityStore;

  useEffect(() => {
    activityStore.loadActivities();
  }, [activityStore]);

  if (activityStore.loading)
    return <LoadingComponent content="Loading Activities..." />;

  return (
    <Grid>
      <Grid.Column width={10}>
        <ActivityList />
      </Grid.Column>
      <Grid.Column width={6}>
        {selectedActivity && mode === ActivityDashboardMode.NONE && (
          <ActivityDetails />
        )}
        {(mode === ActivityDashboardMode.EDIT ||
          mode === ActivityDashboardMode.CREATE) && <ActivityForm />}
      </Grid.Column>
    </Grid>
  );
};

export default observer(ActivityDashboard);
