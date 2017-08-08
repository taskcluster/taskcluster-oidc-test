import React, { PureComponent } from 'react';
import { NavLink } from 'react-router-dom';
import Box from 'grommet/components/Box';
import Sidebar from 'grommet/components/Sidebar';
import Title from 'grommet/components/Title';
import Header from 'grommet/components/Header';
import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
import Button from 'grommet/components/Button';
import UserIcon from 'grommet/components/icons/base/User';
import logoUrl from '../../images/icon.png';

export default class Navigation extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { navIsActive: false };
  }

  handleToggleNav = () => this.setState({
    navIsActive: !this.state.navIsActive
  });

  render() {
    const { credentials, signIn, signOut } = this.props;

    return (
      <Sidebar fixed={true} colorIndex="neutral-4-t">
        <Header pad="medium" justify="between">
          <Title>
            <img src={logoUrl} style={{ width: 50 }} /> Taskcluster
          </Title>
        </Header>
        <Box flex="grow" justify="start">
          <Menu primary={true}>
            <NavLink to="/" activeStyle={{ textDecoration: 'none' }}>
              {credentials ? 'Profile' : 'Home'}
            </NavLink>
          </Menu>
        </Box>
        <Footer pad="medium">
          <Button
            icon={<UserIcon />}
            label={credentials ? 'Sign Out' : 'Sign In'}
            onClick={credentials ? signOut : signIn} />
        </Footer>
      </Sidebar>
    );
  }
}
