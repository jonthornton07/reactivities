import React, { useContext, useState } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "../../app/stores/rootStore";
import { Tab, Grid, Header, Button, Segment } from "semantic-ui-react";
import ProfileForm from "./ProfileForm";

const ProfileDetails = () => {
  const rootStore = useContext(RootStoreContext);
  const { profile, isCurrentUser } = rootStore.profileStore;

  const [updatingProfile, setUpdatingProfile] = useState(false);

  return (
    <Tab.Pane>
      <Grid>
        <Grid.Column width={16} style={{ paddingBottom: 0 }}>
          <Header
            floated="left"
            icon="user"
            content={`About ${profile?.displayName}`}
          />
          {isCurrentUser && (
            <Button
              floated="right"
              basic
              content={updatingProfile ? "Cancel" : "Edit Profile"}
              onClick={() => setUpdatingProfile(!updatingProfile)}
            />
          )}
        </Grid.Column>
        <Grid.Column width={16}>
          {updatingProfile ? (
            <ProfileForm profileUpdated={() => setUpdatingProfile(false)} />
          ) : (
            <Segment clearing basic>
              {profile && <span>{profile.bio}</span>}
            </Segment>
          )}
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  );
};

export default observer(ProfileDetails);
