import React, { PureComponent } from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
import App from 'grommet/components/App';
import Split from 'grommet/components/Split';
import Box from 'grommet/components/Box';
import Loadable from 'react-loadable';
import PropsRoute from './components/PropsRoute';
import Loading from './components/Loading';

// eslint-disable-next-line babel/new-cap
export const loadable = loader => Loadable({
  loading: Loading,
  loader
});
const Home = loadable(() => import(/* webpackChunkName: 'Home' */ './views/Home'));
const Navigation = loadable(() => import(/* webpackChunkName: 'Navigation' */ './components/Navigation'));
const Login = loadable(() => import(/* webpackChunkName: 'Login' */ './views/Login'));
const Profile = loadable(() => import(/* webpackChunkName: 'Profile' */ './views/Profile'));
const expirationTimeout = 5 * 60 * 1000; // time before expiration at which we warn

export default class Taskcluster extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      navIsActive: false,
      ...this.loadCredentials()
    };
  }

  componentWillMount() {
    window.addEventListener('storage', this.handleStorage);
  }

  componentDidMount() {
    this.startExpirationTimer();
  }

  componentWillUnmount() {
    this.stopExpirationTimer();
  }

  handleStorage = ({ storageArea, key, newValue }) => {
    if (storageArea === localStorage && key === 'credentials') {
      this.setState({ credentials: newValue ? JSON.parse(newValue) : null });
    }
  };

  handleCredentialsChanged = () => {
    this.setState({ ...this.loadCredentials(), credentialsExpiringSoon: false });
    this.startExpirationTimer();
  };

  saveCredentials = (credentials) => {
    if (!credentials) {
      localStorage.removeItem('credentials');
      this.setState({ credentials: null });
    } else {
      const clone = {
        ...credentials,
        certificate: typeof credentials.certificate === 'string' ?
          JSON.parse(credentials.certificate) :
          credentials.certificate
      };

      this.setState({ credentials: clone });
      localStorage.setItem('credentials', JSON.stringify(clone));
    }
  };

  loadCredentials() {
    const storedCredentials = localStorage.getItem('credentials');

    // We have no credentials
    if (!storedCredentials) {
      return { credentials: null };
    }

    const credentials = JSON.parse(storedCredentials);
    const { certificate } = credentials;
    const isExpired = certificate && certificate.expiry < Date.now();

    if (isExpired && this.state && this.state.credentialsExpiredTimeout) {
      clearTimeout(this.state.credentialsExpiredTimeout);
    }

    return {
      credentials: isExpired ? null : credentials,
      credentialsExpiredTimeout: credentials && certificate && certificate.expiry ?
        setTimeout(() => this.setState({ credentials: null }), certificate.expiry - Date.now()) :
        null
    };
  }

  startExpirationTimer = () => {
    this.stopExpirationTimer();

    const { credentials } = this.state;

    // We only support monitoring expiration of temporary credentials.
    // Anything else requires hitting the auth API, and temporary credentials are the common case.
    if (!credentials || !credentials.certificate || !credentials.certificate.expiry) {
      return;
    }

    const { expiry } = credentials.certificate;

    if (expiry < (Date.now() + expirationTimeout)) {
      this.setState({ credentialsExpiringSoon: true });
      return;
    }

    const timeout = (expiry - Date.now()) - (expirationTimeout + 500);

    this.setState({
      expirationTimer: setTimeout(() => this.setState({ credentialsExpiringSoon: true }), timeout)
    });
  };

  stopExpirationTimer = () => {
    if (this.state.expirationTimer) {
      clearTimeout(this.state.expirationTimer);
      this.setState({ expirationTimer: null });
    }
  };

  signIn = () => window.open('/login');

  signOut = () => this.saveCredentials(null);

  render() {
    const { credentials } = this.state;

    return (
      <BrowserRouter>
        <App centered={false}>
          <Split flex="right" separator={false} showOnResponsive="both">
            <PropsRoute
              path="/"
              exact
              component={Navigation}
              credentials={credentials}
              signIn={this.signIn}
              signOut={this.signOut} />
            <Box>
              <Switch>
                <PropsRoute path="/login" component={Login} saveCredentials={this.saveCredentials} />
                <PropsRoute path="/" exact component={credentials ? Profile : Home} credentials={credentials} />
              </Switch>
            </Box>
          </Split>
        </App>
      </BrowserRouter>
    );
  }
}
