import { IProfile, IPhoto } from "./../models/Profile";
import { RootStore } from "./rootStore";
import { observable, action, runInAction, computed } from "mobx";
import agent from "../api/agent";
import { toast } from "react-toastify";

export default class ProfileStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  @observable profile: IProfile | null = null;
  @observable loading = true;
  @observable uplading = false;
  @observable loadingPhotos = false;
  @observable updatingProfile = false;

  @computed get isCurrentUser() {
    if (this.rootStore.userStore.user && this.profile) {
      return this.rootStore.userStore.user.username === this.profile.username;
    } else {
      return false;
    }
  }

  @action loadProfile = async (username: string) => {
    this.loading = true;
    try {
      const profile = await agent.Profiles.get(username);
      runInAction(() => {
        this.profile = profile;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
      });
      console.log(error);
    }
  };

  @action uploadPhoto = async (file: Blob) => {
    this.uplading = true;
    try {
      const photo = await agent.Profiles.uploadPhoto(file);
      runInAction(() => {
        if (this.profile) {
          this.profile.photos.push(photo);
          if (photo.isMain && this.rootStore.userStore.user) {
            this.rootStore.userStore.user.image = photo.url;
            this.profile.image = photo.url;
          }
        }
        this.uplading = false;
      });
    } catch (error) {
      toast.error("Problem uploading photo");
      runInAction(() => {
        this.uplading = false;
      });
    }
  };

  @action setMainPhoto = async (photo: IPhoto) => {
    this.loadingPhotos = true;
    try {
      await agent.Profiles.setMainPhoto(photo.id);
      runInAction(() => {
        this.rootStore.userStore.user!.image = photo.url;
        this.profile!.photos.find((a) => a.isMain)!.isMain = false;
        this.profile!.photos.find((a) => a.id === photo.id)!.isMain = true;
        this.profile!.image = photo.url;
        this.loadingPhotos = false;
      });
    } catch (error) {
      toast.error("Problem setting photo as main");
      runInAction(() => {
        this.loadingPhotos = false;
      });
    }
  };

  @action deletePhoto = async (photo: IPhoto) => {
    this.loadingPhotos = true;
    try {
      await agent.Profiles.deletePhoto(photo.id);
      runInAction(() => {
        this.profile!.photos = this.profile!.photos.filter(
          (a) => a.id !== photo.id
        );
        this.loadingPhotos = false;
      });
    } catch (error) {
      toast.error("Problem deleting photo");
      runInAction(() => {
        this.loadingPhotos = false;
      });
    }
  };

  @action updateProfile = async (profile: IProfile) => {
    this.updatingProfile = true;
    try {
      await agent.Profiles.updateProfile(profile);
      runInAction(() => {
        this.rootStore.userStore.user!.bio = profile.bio;
        this.rootStore.userStore.user!.displayName = profile.displayName;
        this.profile!.bio = profile.bio;
        this.profile!.displayName = profile.displayName;
        this.updatingProfile = false;
      });
    } catch (error) {
      toast.error("Problem updating profile");
      runInAction(() => {
        this.updatingProfile = false;
      });
    }
  };
}
