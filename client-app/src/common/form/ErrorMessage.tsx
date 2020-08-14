import React from "react";
import { AxiosResponse } from "axios";
import { Message } from "semantic-ui-react";

interface IProps {
  error: AxiosResponse;
  text?: string;
}

export const ErrorMessage: React.FC<IProps> = ({ error, text }) => {
  return (
    <Message error>
      <Message.Header>{error.statusText}</Message.Header>
      {error.data && Object.keys(error.data.errors).length > 0 && (
        <Message.List>
          {Object.values(error.data.errors)
            .flat()
            .map((err, i) => {
              const errorText = String(err);
              return <Message.Item key={i}>{errorText}</Message.Item>;
            })}
        </Message.List>
      )}
      {text && <Message.Content content={text} />}
    </Message>
  );
};
