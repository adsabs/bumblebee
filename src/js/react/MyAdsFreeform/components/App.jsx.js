define([
  'react',
  'react-prop-types',
  'react-bootstrap',
  'es6!./CollapsePanel.jsx',
  '../containers/SaveQueryForm',
], function(React, PropTypes, { Alert }, CollapsePanel, SaveQueryForm) {
  const Message = ({ children, show, type, ...otherProps }) => {
    return show ? (
      <Alert bsStyle={type} {...otherProps}>
        {children}
      </Alert>
    ) : null;
  };

  class MyADSFreeform extends React.Component {
    constructor(props) {
      super(props);
      this.loginStatusCheckTimer = null;
    }

    componentDidMount() {
      const check = () => {
        requestAnimationFrame(() => this.props.checkLoginStatus());
        this.loginStatusCheckTimer = setTimeout(check, 1000);
      };
      check();
    }

    componentWillUnmount() {
      window.clearTimeout(this.loginStatusCheckTimer);
    }

    render() {
      const {
        requests,
        saveNewNotification,
        generalError,
        loggedIn,
      } = this.props;

      if (!loggedIn) {
        return null;
      }

      const addNotificationStatus = requests.addNotification.status;
      const getQIDStatus = requests.getQID.status;
      const isPending =
        addNotificationStatus === 'pending' || getQIDStatus === 'pending';
      return (
        <section>
          <CollapsePanel
            render={({ collapse }) => (
              <section>
                <SaveQueryForm
                  onSubmit={saveNewNotification}
                  onCancel={collapse}
                  disabled={isPending}
                />
                <Message show={isPending} type="info">
                  <i className="fa fa-spinner fa-spin" aria-hidden="true" />{' '}
                  Creating...
                </Message>
                <Message
                  show={addNotificationStatus === 'success'}
                  type="success"
                >
                  <strong>Success!</strong> Notification created.
                </Message>
                <Message
                  show={addNotificationStatus === 'failure'}
                  type="danger"
                >
                  <strong>
                    <i
                      className="fa fa-exclamation-triangle"
                      aria-hidden="true"
                    />{' '}
                    Error!
                  </strong>{' '}
                  {requests.addNotification.error}
                </Message>
                <Message show={getQIDStatus === 'failure'} type="danger">
                  <strong>
                    <i
                      className="fa fa-exclamation-triangle"
                      aria-hidden="true"
                    />{' '}
                    Error!
                  </strong>{' '}
                  {requests.getQID.error}
                </Message>
                <Message show={generalError} type="danger">
                  <strong>
                    <i
                      className="fa fa-exclamation-triangle"
                      aria-hidden="true"
                    />{' '}
                    Error!
                  </strong>{' '}
                  {generalError}
                </Message>
              </section>
            )}
          />
        </section>
      );
    }
  }

  MyADSFreeform.defaultProps = {
    saveNewNotification: () => {},
    requests: {},
    generalError: null,
  };
  MyADSFreeform.propTypes = {
    saveNewNotification: PropTypes.func,
    requests: PropTypes.object,
    generalError: PropTypes.object,
  };

  return MyADSFreeform;
});
