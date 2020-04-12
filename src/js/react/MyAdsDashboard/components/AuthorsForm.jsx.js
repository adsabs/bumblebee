define([
  'underscore',
  'react',
  'react-bootstrap',
  'es6!./CitationsEntry.jsx',
  'js/react/shared/helpers',
  'react-prop-types',
], function(
  _,
  React,
  { Form, Alert, FormGroup, FormControl, ControlLabel, HelpBlock },
  CitationsEntry,
  { escape, unescape },
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

  const AuthorsFormInitialState = {
    message: null,
    name: '',
    orcid: '',
    editing: false,
    notificationName: '',
    entries: [],
    pending: false,
  };
  class AuthorsForm extends React.Component {
    constructor(props) {
      super(props);
      this.onSubmit = this.onSubmit.bind(this);
      this.entriesUpdated = this.entriesUpdated.bind(this);
      let updatedState = {};
      if (this.props.editingNotification) {
        updatedState = {
          editing: true,
          ...this.parseQueryString(this.props.editingNotification.data),
          notificationName: this.props.editingNotification.name,
        };
      }
      this.state = { ...AuthorsFormInitialState, ...updatedState };
    }

    parseQueryString(query) {
      try {
        const parts = query.split(' OR ');
        let entries = {};
        if (parts.length > 0) {
          entries = parts.map((str) => {
            const [p, type, text] = /^(author|orcid):"(.*)"$/.exec(str);
            return {
              type: type === 'author' ? 'Name' : 'ORCiD',
              text,
            };
          });
        }
        return { entries };
      } catch (e) {
        return { editing: false };
      }
    }

    entriesUpdated(entries) {
      this.setState({ entries });
    }

    createQueryString() {
      const { entries } = this.state;
      return entries
        .map(({ type, text }) => {
          return `${type === 'Name' ? 'author' : 'orcid'}:"${text}"`;
        })
        .join(' OR ');
    }

    showMessage(message) {
      this.setState({ message }, () => {
        setTimeout(() => this.setState({ message: null }), 3000);
      });
    }

    onSubmit(e) {
      e.preventDefault();

      if (this.state.pending) {
        return;
      }

      const data = this.createQueryString();
      if (data === '') {
        return this.showMessage('Must add an author name or orcid ID');
      }

      const payload = { data, name: this.state.notificationName };

      if (this.state.editing) {
        this.props.updateNotification({
          ...this.props.editingNotification,
          ...payload,
        });
      } else {
        this.props.addNotification(payload);
        this.setState({ reset: true });
      }
    }

    onChange({ type, value }) {
      // set the value and clear the other
      this.setState({
        [type]: value,
        [type === 'name' ? 'orcid' : 'name']: '',
      });
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

    render() {
      return (
        <Form onSubmit={this.onSubmit}>
          {this.state.editing && (
            <FormGroup>
              <ControlLabel>Name</ControlLabel>
              <FormControl
                type="text"
                bsSize="large"
                value={this.state.notificationName}
                onChange={(e) =>
                  this.setState({ notificationName: e.target.value })
                }
              />
              <FormControl.Feedback />
              <HelpBlock>Set the name for this notification</HelpBlock>
            </FormGroup>
          )}
          <CitationsEntry
            entriesUpdated={this.entriesUpdated}
            initialState={{
              entries: this.state.entries,
            }}
          />
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

  return AuthorsForm;
});
