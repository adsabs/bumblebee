define(['react', 'react-bootstrap', 'react-prop-types'], function(
  React,
  { Form, FormGroup, ControlLabel, FormControl, HelpBlock },
  PropTypes
) {
  const getStatusMessage = ({ status, error, editing }) => {
    switch (status) {
      case 'pending':
        return (
          <span className="text-info">
            <i className="fa fa-spinner fa-spin" aria-hidden="true" /> Sending
            request...
          </span>
        );
      case 'failure':
        return <span className="text-danger">Request failed. ({error})</span>;
      case 'success':
        return (
          <span className="text-success">
            Notification {editing ? 'saved' : 'created'}!
          </span>
        );
      default:
        return null;
    }
  };
  getStatusMessage.defaultProps = {
    status: '',
    error: '',
    editing: false,
  };

  getStatusMessage.propTypes = {
    status: PropTypes.string,
    error: PropTypes.string,
    editing: PropTypes.bool,
  };

  const KeywordFormInitialState = {
    keywords: '',
    message: '',
    name: '',
    editing: false,
    pending: false,
  };
  class KeywordForm extends React.Component {
    constructor(props) {
      super(props);
      this.onSubmit = this.onSubmit.bind(this);
      this.onChange = this.onChange.bind(this);
      let updatedState = {};
      if (this.props.editingNotification) {
        updatedState = {
          editing: true,
          keywords: this.props.editingNotification.data,
          name: this.props.editingNotification.name,
        };
      }
      this.state = { ...KeywordFormInitialState, ...updatedState };
    }

    showMessage(message) {
      this.setState({ message }, () => {
        setTimeout(() => this.setState({ message: null }), 3000);
      });
    }

    createQueryString() {
      const { keywords } = this.state;
      return keywords.trim();
    }

    onSubmit(e) {
      e.preventDefault();
      const data = this.createQueryString();
      const { name, pending } = this.state;

      if (pending) {
        return;
      }

      if (data === '') {
        return this.showMessage('Must add at least one keyword');
      }
      const payload = { data, name };

      if (this.state.editing) {
        this.props.updateNotification({
          ...this.props.editingNotification,
          ...payload,
        });
      } else {
        this.props.addNotification(payload);
      }
    }

    componentWillReceiveProps(next) {
      const addStatus = next.addNotificationRequest.status;
      const updateStatus = next.updateNotificationRequest.status;

      // fires success handler if our request was successful
      if (addStatus === 'success' || updateStatus === 'success') {
        setTimeout(() => this.props.onSuccess(), 1000);
      }

      // won't allow a request to go through if we're pending or had just failed
      if (
        addStatus === 'pending' ||
        updateStatus === 'pending' ||
        addStatus === 'failure' ||
        updateStatus === 'failure'
      ) {
        this.setState({ pending: true });
      } else if (!addStatus && !updateStatus) {
        this.setState({ pending: false });
      }
    }

    onChange(e) {
      this.setState({
        keywords: e.target.value,
      });
    }

    render() {
      return (
        <Form onSubmit={this.onSubmit}>
          {this.state.editing && (
            <FormGroup>
              <ControlLabel>Name</ControlLabel>
              <FormControl
                type="text"
                bsSize="large"
                value={this.state.name}
                onChange={(e) => this.setState({ name: e.target.value })}
              />
              <FormControl.Feedback />
              <HelpBlock>Set the name for this notification</HelpBlock>
            </FormGroup>
          )}
          <FormGroup>
            <ControlLabel>Set of Keywords </ControlLabel>
            <FormControl
              bsSize="large"
              type="text"
              value={this.state.keywords}
              placeholder="star OR planet"
              onChange={(e) => this.setState({ keywords: e.target.value })}
            />
            <FormControl.Feedback />
            <HelpBlock>
              Boolean "AND" is assumed, but can be overriden by using explicit
              logical operators between keywords
            </HelpBlock>
          </FormGroup>
          <div
            className="row"
            style={{ borderTop: 'solid 1px #d9d9d9', paddingTop: '1rem' }}
          >
            <div className="col-sm-4">
              <div className="btn-toolbar">
                <button type="submit" className="btn btn-primary">
                  {this.state.editing
                    ? 'Save notification'
                    : 'Create notification'}
                </button>
                <button
                  className="btn btn-default"
                  onClick={this.props.onCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
            <div
              className="col-sm-7 col-sm-offset-1"
              style={{ paddingTop: '1rem' }}
            >
              {getStatusMessage({
                ...(this.state.editing
                  ? this.props.updateNotificationRequest
                  : this.props.addNotificationRequest),
                editing: this.state.editing,
              })}
              <span className="text-info">{this.state.message}</span>
            </div>
          </div>
        </Form>
      );
    }
  }

  return KeywordForm;
});
