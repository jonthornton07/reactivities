import React from "react";
import { RouteComponentProps } from "react-router-dom";
import queryString from "query-string";
import { Button, Header, Icon, Segment } from "semantic-ui-react";
import agent from "../../app/api/agent";
import { toast } from "react-toastify";

const RegisterSuccess: React.FC<RouteComponentProps> = ({ location }) => {
  const { email } = queryString.parse(location.search);

  const handleConfirmEmailResend = () => {
    agent.User.resendVerificationEmail(email as string)
      .then(() => {
        toast.success("Verification email resent - please check your email");
      })
      .catch((error) => console.log(error));
  };

  return (
    <Segment placeholder>
      <Header icon>
        <Icon name="check" />
        Successfully Registered
      </Header>

      <Segment.Inline>
        <div className="center">
          <p>
            Please check your email (including spam folder) for the
            verfification email
          </p>
          {email && (
            <>
              <p>Didn't recieve the email? Please click below to resend</p>
              <Button
                primary
                content="Resend Email"
                size="huge"
                onClick={handleConfirmEmailResend}
              />
            </>
          )}
        </div>
      </Segment.Inline>
    </Segment>
  );
};

export default RegisterSuccess;
