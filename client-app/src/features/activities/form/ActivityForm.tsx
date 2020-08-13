import React, { useEffect, useState, useContext } from "react";
import { Segment, Form, Button, Grid, GridColumn } from "semantic-ui-react";
import { ActivityFormValues } from "../../../app/models/activity";
import { observer } from "mobx-react-lite";
import { RouteComponentProps } from "react-router-dom";
import { Form as FinalForm, Field } from "react-final-form";
import TextInput from "../../../common/form/TextInput";
import TextAreaInput from "../../../common/form/TextAreaInput";
import SelectInput from "../../../common/form/SelectInput";
import { category } from "../../../common/options/categoryOptions";
import DateInput from "../../../common/form/DateInput";
import { RootStoreContext } from "../../../app/stores/rootStore";
import { combineDateAndTime } from "../../../common/util/util";
import {
  combineValidators,
  composeValidators,
  isRequired,
  hasLengthGreaterThan,
} from "revalidate";

const validate = combineValidators({
  title: isRequired({ message: "The event title is required" }),
  category: isRequired("Category"),
  description: composeValidators(
    isRequired("Description"),
    hasLengthGreaterThan(4)({
      message: "The description needs to be at least 5 characters",
    })
  )(),
  city: isRequired("City"),
  venue: isRequired("Venue"),
  date: isRequired("Date"),
  time: isRequired("Time"),
});

interface DetailParams {
  id: string;
}

const ActivityForm: React.FC<RouteComponentProps<DetailParams>> = ({
  match,
  history,
}) => {
  const rootStore = useContext(RootStoreContext);
  const activityStore = rootStore.activityStore;
  const { submitting, loadActivity } = activityStore;

  const [activity, setActivity] = useState(new ActivityFormValues());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (match.params.id) {
      setLoading(true);
      loadActivity(match.params.id)
        .then((activity) => setActivity(new ActivityFormValues(activity)))
        .finally(() => setLoading(false));
    }
  }, [loadActivity, setLoading, match.params.id]);

  const handleCancelClicked = () => {
    activityStore.setActivity(null);
    activityStore.setSubmittingActivity(false);

    if (match.params.id) {
      history.push(`/activities/${match.params.id}`);
    } else {
      history.push("/activities");
    }
  };

  const handFinalFormSubmit = (values: any) => {
    const dateAndTime = combineDateAndTime(values.date, values.time);
    const { date, time, ...activity } = values;
    activity.date = dateAndTime;
    if (match.params.id) {
      activityStore.editActivity(activity);
    } else {
      activityStore.createActivity(activity);
    }
  };

  return (
    <Grid>
      <GridColumn width={10}>
        <Segment clearing>
          <FinalForm
            initialValues={activity}
            onSubmit={handFinalFormSubmit}
            validate={validate}
            render={({ handleSubmit, invalid, pristine }) => (
              <Form onSubmit={handleSubmit} loading={loading}>
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
                    placeholder="Time"
                    value={activity.date}
                    name="time"
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
                  disabled={loading || invalid || pristine}
                />
                <Button
                  onClick={handleCancelClicked}
                  floated="right"
                  type="button"
                  content="Cancel"
                  disabled={loading}
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
