import React from "react";
import { Loader, Dimmer } from "semantic-ui-react";

interface IProps {
  inverted?: boolean;
  content?: string;
}

export const LoadingComponent: React.FC<IProps> = ({
  inverted = true,
  content,
}): JSX.Element => {
  return (
    <Dimmer active inverted={inverted}>
      <Loader>{content}</Loader>
    </Dimmer>
  );
};
