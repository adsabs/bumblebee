define(['react', 'react-bootstrap'], function(
  React,
  { Form, FormGroup, FormControl, ControlLabel, HelpBlock, Button, Alert }
) {
  const loginStatusMessage = ({ status, error }) => {
    switch (status) {
      case 'pending':
        return (
          <span className="text-info">
            <i className="fa fa-spinner fa-spin" aria-hidden="true" /> Sending
            request...
          </span>
        );
      case 'failure':
        return (
          <span className="text-danger">
            {error ? error : 'Login failed, try changing the mirror site.'}
          </span>
        );
      case 'success':
        return <span className="text-success">Login Successful!</span>;
    }
  };

  const initialState = {
    email: '',
    password: '',
    mirror: '',
    mirrors: [],
    mirrorsFail: false,
    loginSuccessful: false,
    message: null,
    showCancel: false,
  };

  class ClassicLoginForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = initialState;
      this.onSubmit = this.onSubmit.bind(this);
      this.onChangeUser = this.onChangeUser.bind(this);
      this.onCancel = this.onCancel.bind(this);
    }

    onChange(prop) {
      return (e) => {
        this.setState({ [prop]: e.target.value });
      };
    }

    showMessage(message, timing) {
      this.setState({ message }, () => {
        if (timing) {
          setTimeout(() => this.setState({ message: null }), timing);
        }
      });
    }

    componentDidMount() {
      this.props.loginClassicCheck();
      this.props.fetchClassicMirrors();
    }

    onChangeUser(e) {
      e.preventDefault();
      this.setState({
        loginSuccessful: null,
        showCancel: true,
      });
      this.props.onChangeUser();
    }

    onCancel(e) {
      e.preventDefault();
      this.setState({
        loginSuccessful: true,
        showCancel: false,
      });
      this.props.onLogin();
    }

    componentWillReceiveProps(next) {
      if (
        this.props.classicMirrorsRequest.status !==
          next.classicMirrorsRequest.status &&
        next.classicMirrorsRequest.status === 'success'
      ) {
        this.setState({
          mirrors: next.classicMirrorsRequest.result,
          mirror: 'adsabs.harvard.edu',
        });
      } else if (
        this.props.classicMirrorsRequest.status !==
          next.classicMirrorsRequest.status &&
        next.classicMirrorsRequest.status === 'failure'
      ) {
        this.setState({
          mirrorsFail: true,
        });
      }

      if (
        this.props.loginClassicCheckRequest.status !==
          next.loginClassicCheckRequest.status &&
        next.loginClassicCheckRequest.status === 'success'
      ) {
        const {
          classic_email,
          classic_mirror,
        } = next.loginClassicCheckRequest.result;
        this.setState({
          loginSuccessful: true,
          email: classic_email,
          mirror: classic_mirror,
        });
        next.onLogin();
      }

      if (
        this.props.loginClassicRequest.status !==
          next.loginClassicRequest.status &&
        next.loginClassicRequest.status === 'success'
      ) {
        this.setState({
          loginSuccessful: true,
        });
        next.onLogin();
      }
    }

    onSubmit(e) {
      e.preventDefault();
      this.props.loginClassic({
        classic_email: this.state.email,
        classic_mirror: this.state.mirror,
        classic_password: this.state.password,
      });
    }

    render() {
      if (this.props.loginClassicCheckRequest.status === 'pending') {
        return <div>loading...</div>;
      } else if (this.state.loginSuccessful) {
        return (
          <div>
            logged in as <strong>{this.state.email}</strong> on the{' '}
            <strong>{this.state.mirror}</strong> mirror site.{' '}
            <a
              href="javascript:void(0);"
              title="Change user"
              onClick={this.onChangeUser}
            >
              Change user?
            </a>
          </div>
        );
      }

      return (
        <Form onSubmit={this.onSubmit}>
          <FormGroup>
            <ControlLabel>Email Address</ControlLabel>
            <FormControl
              type="email"
              bsSize="large"
              value={this.state.email}
              onChange={this.onChange('email')}
            />
            <FormControl.Feedback />
            <HelpBlock>Enter your ADS classic email address</HelpBlock>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Password</ControlLabel>
            <FormControl
              type="password"
              bsSize="large"
              value={this.state.password}
              onChange={this.onChange('password')}
            />
            <FormControl.Feedback />
            <HelpBlock>Enter classic password</HelpBlock>
          </FormGroup>
          {this.state.mirrorsFail ? (
            <div>
              <FormGroup>
                <ControlLabel>ADS Classic Mirror Site</ControlLabel>
                <FormControl
                  type="text"
                  bsSize="large"
                  value={this.state.mirror}
                  onChange={this.onChange('mirror')}
                />
                <FormControl.Feedback />
                <HelpBlock>Enter your ADS classic mirror site</HelpBlock>
              </FormGroup>
              <Alert bsStyle="warning">
                There was a problem loading classic mirror sites. Please enter
                the mirror site directly.
              </Alert>
            </div>
          ) : (
            <FormGroup>
              <ControlLabel>ADS Classic Mirror Site</ControlLabel>
              <FormControl
                componentClass="select"
                bsSize="large"
                value={this.state.mirror}
                onChange={this.onChange('mirror')}
              >
                {this.state.mirrors.map((m) => (
                  <option value={m}>{m}</option>
                ))}
              </FormControl>
              <FormControl.Feedback />
              <HelpBlock>Select a mirror site to use</HelpBlock>
            </FormGroup>
          )}
          <div
            className="row"
            style={{ borderTop: 'solid 1px #d9d9d9', paddingTop: '1rem' }}
          >
            <div className="col-sm-4">
              <div className="btn-toolbar">
                <Button type="submit" bsStyle="primary" bsSize="large">
                  Login
                </Button>
                {this.state.showCancel && (
                  <Button
                    bsSize="large"
                    bsStyle="default"
                    onClick={this.onCancel}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
            <div
              className="col-sm-4 text-center"
              style={{ paddingTop: '1rem' }}
            >
              {loginStatusMessage(this.props.loginClassicRequest)}
            </div>
          </div>
        </Form>
      );
    }
  }

  ClassicLoginForm.defaultProps = {
    classicMirrorsRequest: {},
    loginClassicRequest: {},
    loginClassicCheckRequest: {},
    fetchClassicMirrors: () => {},
    loginClassic: () => {},
    loginClassicCheck: () => {},
    onSubmit: () => {},
    onLogin: () => {},
    onChangeUser: () => {},
  };

  return ClassicLoginForm;
});
