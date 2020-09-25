import { history } from "./../../index";
import { RootStore } from "./rootStore";
import { IUserFormValues } from "./../models/user";
import { observable, action, computed, runInAction } from "mobx";
import { IUser } from "../models/user";
import agent from "../api/agent";

export default class UserStore {
  rootStore: RootStore;
  refreshTokenTimeout: any;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }
  @observable user: IUser | null = null;
  @observable loading = false;

  @computed get isLoggedIn() {
    return !!this.user;
  }

  @action login = async (values: IUserFormValues) => {
    try {
      const user = await agent.User.login(values);
      runInAction("logging in", () => {
        this.user = user;
      });
      this.rootStore.commonStore.setToken(user.token);
      this.rootStore.modalStore.closeModal();
      history.push("/activities");
    } catch (error) {
      throw error;
    }
  };

  @action refreshToken = async () => {
    try {
      const user = await agent.User.refreshToken();
      runInAction(() => {
        this.user = user;
      });
      this.rootStore.commonStore.setToken(user.token);
      this.startRefreshTokenTimer(user);
    } catch (error) {
      console.log(error);
    }
  };

  @action getUser = async () => {
    try {
      const user = await agent.User.current();
      runInAction("getting user", () => {
        this.user = user;
      });
      this.rootStore.commonStore.setToken(user.token);
      this.startRefreshTokenTimer(user);
      this.rootStore.modalStore.closeModal();
    } catch (error) {
      console.log(error);
    }
  };

  @action logout = () => {
    this.rootStore.commonStore.setToken(null);
    this.stopRefreshTokenTimer();
    this.user = null;
    history.push("/");
  };

  @action register = async (values: IUserFormValues) => {
    try {
      const user = await agent.User.register(values);
      runInAction("setting user", () => {
        this.user = user;
      });
      this.rootStore.commonStore.setToken(user.token);
      this.startRefreshTokenTimer(user);
      this.rootStore.modalStore.closeModal();
      history.push("/activities");
    } catch (error) {
      throw error;
    }
  };

  @action fbLogin = async (response: any) => {
    this.loading = true;
    try {
      const user = await agent.User.fbLogin(response.accessToken);
      runInAction(() => {
        this.user = user;
        this.rootStore.commonStore.setToken(user.token);
        this.startRefreshTokenTimer(user);
        this.rootStore.modalStore.closeModal();
        this.loading = false;
      });
      history.push("/activities");
    } catch (error) {
      runInAction(() => {
        this.loading = false;
      });
      throw error;
    }
  };

  private startRefreshTokenTimer(user: IUser) {
    const jwtToken = JSON.parse(atob(user.token.split(".")[1]));
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - 60 * 1000;
    this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
