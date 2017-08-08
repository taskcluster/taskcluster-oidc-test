import React, { PureComponent } from 'react';
import Heading from 'grommet/components/Heading';
import Box from 'grommet/components/Box';

export default class Home extends PureComponent {
  render() {
    return (
      <div style={{ width: '100%', paddingTop: 80 }}>
        <Box pad={{ vertical: 'medium' }}>
          <Heading align="center">
            Welcome!
          </Heading>
          <Heading align="center" tag="h3">
            Sign in to view your profile.
          </Heading>
        </Box>
      </div>
    );
  }
}
