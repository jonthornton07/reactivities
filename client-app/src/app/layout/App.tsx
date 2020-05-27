import React, { Fragment, useState } from "react";
import { IActivity } from "../models/activity";
import NavBar from "../../features/nav/NavBar";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import { Container } from "semantic-ui-react";

interface IState {
  activities: IActivity[];
}

function App() {
  const [isCreatingActivity, setCreatingActivity] = useState(false);
  const createActivity = () => {
    setCreatingActivity(true);
  };

  return (
    <Fragment>
      <NavBar createActivity={createActivity} />
      <Container style={{ marginTop: "7em" }}>
        <ActivityDashboard
          creatingActivity={isCreatingActivity}
          activityCreationCancelled={() => setCreatingActivity(false)}
        />
      </Container>
    </Fragment>
  );
}

export default App;
