import React, { useEffect, useState, useContext } from "react";
import { Segment, Form, Button, Grid, GridColumn } from "semantic-ui-react";
import { IActivityFormValues } from "../../../app/models/activity";
import ActivityStore from "../../../app/stores/activityStore";
import { observer } from "mobx-react-lite";
import { RouteComponentProps } from "react-router-dom";
import { Form as FinalForm, Field } from "react-final-form";
import TextInput from "../../../common/form/TextInput";
import TextAreaInput from "../../../common/form/TextAreaInput";
import SelectInput from "../../../common/form/SelectInput";
import { category } from "../../../common/options/categoryOptions";
import DateInput from "../../../common/form/DateInput";

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

  const [activity, setActivity] = useState<IActivityFormValues>({
    id: undefined,
    title: "",
    description: "",
    category: "",
    date: undefined,
    time: undefined,
    city: "",
    venue: "",
  });

  useEffect(() => {
    if (match.params.id && activity.id) {
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
    activity.id,
  ]);

  // const submit = () => {
  //   if (match.params.id) {
  //     activityStore
  //       .editActivity(activity)
  //       .then(() => history.push(`/activities/${activity.id}`));
  //   } else {
  //     activityStore
  //       .createActivity(activity)
  //       .then(() => history.push(`/activities/${activity.id}`));
  //   }
  // };

  const handleCancelClicked = () => {
    activityStore.setActivity(null);
    activityStore.setSubmittingActivity(false);
    history.push("/activities");
  };

  const handFinalFormSubmit = (values: any) => {
    console.log(values);
  };

  return (
    <Grid>
      <GridColumn width={10}>
        <Segment clearing>
          <FinalForm
            onSubmit={handFinalFormSubmit}
            render={({ handleSubmit }) => (
              <Form onSubmit={handleSubmit}>
                <Field
                  placeholder="Title"
                  value={activity.title}
                  name="title"
                  component={TextInput}
                />
                <Field
                  placeholder="Description"
                  rows={2}
                  value={activity.description}
                  name="description"
                  component={TextAreaInput}
                />
                <Field
                  placeholder="Category"
                  options={category}
                  value={activity.category}
                  name="category"
                  component={SelectInput}
                />
                <Form.Group widths="equal">
                  <Field<Date>
                    placeholder="Date"
                    value={activity.date}
                    name="date"
                    date={true}
                    component={DateInput}
                  />
                  <Field<Date>
                    placeholder="time"
                    value={activity.date}
                    name="Time"
                    time={true}
                    component={DateInput}
                  />
                </Form.Group>
                <Field
                  placeholder="City"
                  value={activity.city}
                  name="city"
                  component={TextInput}
                />
                <Field
                  placeholder="Venue"
                  value={activity.venue}
                  name="venue"
                  component={TextInput}
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
            )}
          />
        </Segment>
      </GridColumn>
    </Grid>
  );
};

export default observer(ActivityForm);
