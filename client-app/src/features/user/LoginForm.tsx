import React, { useContext } from "react";
import { Form as FinalForm, Field } from "react-final-form";
import { Form, Button, Header, Divider } from "semantic-ui-react";
import TextInput from "../../common/form/TextInput";
import { RootStoreContext } from "../../app/stores/rootStore";
import { IUserFormValues } from "../../app/models/user";
import { FORM_ERROR } from "final-form";
import { combineValidators, isRequired } from "revalidate";
import { ErrorMessage } from "../../common/form/ErrorMessage";
import SocialLogin from "./SocialLogin";
import { observer } from "mobx-react-lite";

const validate = combineValidators({
  email: isRequired("email"),
  password: isRequired("password"),
});

const LoginForm = () => {
  const rootStore = useContext(RootStoreContext);
  const { login, fbLogin, loading } = rootStore.userStore;

  return (
    <FinalForm
      onSubmit={(values: IUserFormValues) =>
        login(values).catch((error) => ({
          [FORM_ERROR]: error,
        }))
      }
      validate={validate}
      render={({
        handleSubmit,
        submitting,
        submitError,
        invalid,
        pristine,
        dirtySinceLastSubmit,
      }) => (
        <Form onSubmit={handleSubmit} error>
          <Header
            as="h2"
            content="Login to Reactivieis"
            color="teal"
            textAlign="center"
          />
          <Field name="email" component={TextInput} placeholder="Email" />
          <Field
            name="password"
            component={TextInput}
            placeholder="Password"
            type="password"
          />
          {submitError && !dirtySinceLastSubmit && (
            <ErrorMessage
              error={submitError}
              text="Invalid username or password"
            />
          )}
          <Button
            disabled={(!dirtySinceLastSubmit && invalid) || pristine}
            loading={submitting}
            color="teal"
            content="Login"
            fluid
          />
          <Divider horizontal>Or</Divider>
          <SocialLogin fbCallback={fbLogin} loading={loading} />
        </Form>
      )}
    />
  );
};

export default observer(LoginForm);
