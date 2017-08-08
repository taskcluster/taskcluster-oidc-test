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
  const response = await fetch(process.env.AUTH_LOGIN_API, {
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
      saveCredentials(null);
      localStorage.removeItem('auth-profile');
      this.setState({ error: err });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ margin: 80 }}>
          {this.state.error.errorDescription &&
            <h3 style={{ fontWeight: 'bold' }}>{this.state.error.errorDescription}</h3>}
          {this.state.error instanceof Error && <h3 style={{ fontWeight: 'bold' }}>{this.state.error.toString()}</h3>}
          <pre>
            {this.state.error instanceof Error ? process.env.AUTH_LOGIN_API : JSON.stringify(this.state.error, null, 2)}
          </pre>
        </div>
      );
    }

    return null;
  }
}
