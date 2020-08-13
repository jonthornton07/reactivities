import { history } from "./../../index";
import { RootStore } from "./rootStore";
import { IUserFormValues } from "./../models/user";
import { observable, action, computed, configure, runInAction } from "mobx";
import { IUser } from "../models/user";
import agent from "../api/agent";

export default class UserStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }
  @observable user: IUser | null = null;

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
      history.push("/activities");
    } catch (error) {
      throw error;
    }
  };

  @action logout = () => {
    this.rootStore.commonStore.setToken(null);
    this.user = null;
    history.push("/");
  };
}
