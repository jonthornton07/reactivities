import React, { useEffect, useState, FormEvent, useContext } from "react";
import { Segment, Form, Button, Grid, GridColumn } from "semantic-ui-react";
import { IActivity } from "../../../app/models/activity";
import ActivityStore from "../../../app/stores/activityStore";
import { observer } from "mobx-react-lite";
import { RouteComponentProps } from "react-router-dom";

interface DetailParams {
  id: string;
}

const ActivityForm: React.FC<RouteComponentProps<DetailParams>> = ({
  match,
  history,
}) => {
  const activityStore = useContext(ActivityStore);
  const {
    activity: edittingActivity,
    submitting,
    clearActivity,
    loadActivity,
  } = activityStore;

  const [activity, setActivity] = useState<IActivity>({
    id: "",
    title: "",
    description: "",
    category: "",
    date: "",
    city: "",
    venue: "",
  });

  useEffect(() => {
    if (match.params.id && activity.id.length === 0) {
      loadActivity(match.params.id).then(
        () => edittingActivity && setActivity(edittingActivity)
      );
    }
    return () => {
      clearActivity();
    };
  }, [
    loadActivity,
    match.params.id,
    clearActivity,
    edittingActivity,
    activity,
  ]);

  const submit = () => {
    if (match.params.id) {
      activityStore
        .editActivity(activity)
        .then(() => history.push(`/activities/${activity.id}`));
    } else {
      activityStore
        .createActivity(activity)
        .then(() => history.push(`/activities/${activity.id}`));
    }
  };

  const handleInputChange = (
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.currentTarget;
    setActivity({ ...activity, [name]: value });
  };

  const handleCancelClicked = () => {
    activityStore.setActivity(null);
    activityStore.setSubmittingActivity(false);
    history.push("/activities");
  };

  return (
    <Grid>
      <GridColumn width={10}>
        <Segment clearing>
          <Form onSubmit={submit}>
            <Form.Input
              placeholder="Title"
              value={activity.title}
              onChange={handleInputChange}
              name="title"
            />
            <Form.TextArea
              row={2}
              placeholder="Description"
              value={activity.description}
              onChange={handleInputChange}
              name="description"
            />
            <Form.Input
              placeholder="Category"
              value={activity.category}
              onChange={handleInputChange}
              name="category"
            />
            <Form.Input
              type="datetime-local"
              placeholder="Date"
              value={activity.date}
              onChange={handleInputChange}
              name="date"
            />
            <Form.Input
              placeholder="City"
              value={activity.city}
              name="city"
              onChange={handleInputChange}
            />
            <Form.Input
              placeholder="Venue"
              value={activity.venue}
              name="venue"
              onChange={handleInputChange}
            />
            <Button
              loading={submitting}
              floated="right"
              positive
              type="submit"
              content="Submit"
            />
            <Button
              onClick={handleCancelClicked}
              floated="right"
              type="button"
              content="cancel"
            />
          </Form>
        </Segment>
      </GridColumn>
    </Grid>
  );
};

export default observer(ActivityForm);
