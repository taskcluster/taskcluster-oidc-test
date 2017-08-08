import React, { PureComponent } from 'react';
import Heading from 'grommet/components/Heading';
import Box from 'grommet/components/Box';
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';
import Clients from '../../components/Clients';

class Profile extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      profile: JSON.parse(localStorage.getItem('auth-profile')),
      scopes: []
    };
  }

  async componentWillMount() {
    const { scopes } = await this.props.auth.currentScopes();

    this.setState({ scopes });
  }

  render() {
    const { profile, scopes } = this.state;

    return (
      <div style={{ width: '100%', padding: 80 }}>
        <Box pad={{ vertical: 'medium' }}>
          <Heading align="center">
            Hey, {profile.given_name}!<br /><br />
            <img src={profile.picture} style={{ height: 100, width: 100, borderRadius: 50 }} />
          </Heading>

          <Heading tag="h3">
            <strong>Your Taskcluster scopes:</strong>
          </Heading>
          <List>
            {scopes.map((scope, index) => (
              <ListItem justify="between" separator={index ? 'bottom' : 'horizontal'} key={scope}>
                <code>{scope}</code>
              </ListItem>
            ))}
          </List>
        </Box>
      </div>
    );
  }
}

export default ({ credentials }) => (
  <Clients credentials={credentials} Auth>
    {({ auth }) => <Profile auth={auth} />}
  </Clients>
);
