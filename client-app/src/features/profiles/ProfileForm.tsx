import React, { useContext } from "react";
import { Segment, Form, Button, Grid, GridColumn } from "semantic-ui-react";
import { observer } from "mobx-react-lite";
import { Form as FinalForm, Field } from "react-final-form";
import { combineValidators, isRequired } from "revalidate";
import { RootStoreContext } from "../../app/stores/rootStore";
import TextInput from "../../common/form/TextInput";
import TextAreaInput from "../../common/form/TextAreaInput";

const validate = combineValidators({
  displayName: isRequired({ message: "Display name is required" }),
});

interface IProps {
  profileUpdated: () => void;
}

const ProfileForm: React.FC<IProps> = ({ profileUpdated }) => {
  const rootStore = useContext(RootStoreContext);
  const { profile, updateProfile, updatingProfile } = rootStore.profileStore;

  const handFinalFormSubmit = (values: any) => {
    const { bio, displayName } = values;
    if (profile) {
      updateProfile({ ...profile, bio, displayName }).then(() =>
        profileUpdated()
      );
    }
  };

  return (
    <Grid>
      <GridColumn width={16}>
        <Segment clearing basic>
          <FinalForm
            initialValues={profile}
            onSubmit={handFinalFormSubmit}
            validate={validate}
            render={({ handleSubmit, invalid, pristine }) => (
              <Form onSubmit={handleSubmit} loading={updatingProfile}>
                <Field
                  placeholder="Display Name"
                  value={profile?.displayName}
                  name="displayName"
                  component={TextInput}
                />
                <Field
                  placeholder="Bio"
                  rows={2}
                  value={profile?.bio}
                  name="bio"
                  component={TextAreaInput}
                />

                <Button
                  loading={updatingProfile}
                  floated="right"
                  positive
                  type="submit"
                  content="Update"
                  disabled={updatingProfile || invalid || pristine}
                />
              </Form>
            )}
          />
        </Segment>
      </GridColumn>
    </Grid>
  );
};

export default observer(ProfileForm);
