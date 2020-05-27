import React from "react";
import { Menu, Container, Button } from "semantic-ui-react";

interface IProps {
  createActivity: () => void;
}

const NavBar: React.FC<IProps> = ({ createActivity }) => {
  return (
    <Menu fixed="top" inverted>
      <Container>
        <Menu.Item header>
          <img
            src="/assets/logo.png"
            alt="logo"
            style={{ marginRight: "10px" }}
          />
        </Menu.Item>
        <Menu.Item name="Activities" />
        <Menu.Item>
          <Button onClick={createActivity} positive content="Create Activity" />
        </Menu.Item>
      </Container>
    </Menu>
  );
};

export default NavBar;
