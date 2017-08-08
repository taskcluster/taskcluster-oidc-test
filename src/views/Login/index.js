import React, { PureComponent } from 'react';
import { WebAuth } from 'auth0-js';

const auth = new WebAuth({
  domain: process.env.AUTH_DOMAIN,
  clientID: process.env.AUTH_CLIENT_ID,
  audience: process.env.AUTH_AUDIENCE,
  redirectUri: process.env.AUTH_REDIRECT_URI,
  responseType: process.env.AUTH_RESPONSE_TYPE,
  scope: process.env.AUTH_SCOPE
});

const parseHash = () => new Promise((resolve, reject) => {
  auth.parseHash((err, result) => {
    if (err) {
      reject(err);
    } else if (!result || !result.idTokenPayload) {
      reject(new Error('Authentication missing payload'));
    } else {
      resolve(result);
    }
  });
});

const getCredentials = async (accessToken) => {
  const response = await fetch('https://taskcluster-login.ngrok.io/v1/oidc-credentials/mozilla-auth0', {
    headers: new Headers({
      Authorization: `Bearer ${accessToken}`
    })
  });

  return response.json();
};

export default class Login extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      credentials: null
    };
  }

  // eslint-disable-next-line consistent-return
  async componentDidMount() {
    const { saveCredentials, history } = this.props;

    if (!window.location.hash) {
      return auth.authorize();
    }

    try {
      const result = await parseHash();
      const credentials = await getCredentials(result.accessToken);

      saveCredentials(credentials);
      localStorage.setItem('auth-profile', JSON.stringify(result.idTokenPayload));

      // eslint-disable-next-line no-unused-expressions
      window.opener ? window.close() : history.push('/');
    } catch (err) {
      this.setState({ error: err });
    }
  }

  render() {
    if (this.state.error) {
      return <pre>{`${this.state.error}`}</pre>;
    }

    return null;
  }
}
