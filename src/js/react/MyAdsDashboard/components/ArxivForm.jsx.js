define([
  'react',
  'react-bootstrap',
  'es6!./ArxivClassList.jsx',
  'react-prop-types',
], function(
  React,
  { Form, FormGroup, ControlLabel, FormControl, HelpBlock },
  ArxivClassList,
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

  class ArxivForm extends React.Component {
    constructor(props) {
      super(props);

      let updatedState = {};
      const { editingNotification } = this.props;
      if (editingNotification) {
        updatedState = {
          groups: editingNotification.classes,
          keywords: editingNotification.data,
          name: editingNotification.name,
          editing: true,
        };
      }

      this.state = {
        groups: [],
        keywords: '',
        name: '',
        message: null,
        editing: false,
        pending: false,
        ...updatedState,
      };
      this.onClassSelection = this.onClassSelection.bind(this);
    }

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillReceiveProps(next) {
      const addStatus = next.addNotificationRequest.status;
      const updateStatus = next.updateNotificationRequest.status;
      const { onSuccess } = this.props;

      // fires success handler if our request was successful
      if (addStatus === 'success' || updateStatus === 'success') {
        setTimeout(() => onSuccess(), 1000);
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

    onClassSelection(groups) {
      this.setState({
        groups,
      });
    }

    onSubmit(e) {
      e.preventDefault();
      const { keywords, groups, name, pending, editing } = this.state;
      const {
        updateNotification,
        editingNotification,
        addNotification,
      } = this.props;

      if (pending) {
        return;
      }

      if (groups.length <= 0) {
        this.showMessage('must select at least one group');
      } else {
        const payload = {
          data: keywords,
          classes: groups,
          name: name,
        };

        if (editing) {
          updateNotification({
            ...editingNotification,
            ...payload,
          });
        } else {
          addNotification(payload);
        }
      }
    }

    showMessage(message) {
      this.setState({ message }, () => {
        setTimeout(() => this.setState({ message: null }), 3000);
      });
    }

    render() {
      const { editing, keywords, name, groups, message } = this.state;
      const {
        onCancel,
        updateNotificationRequest,
        addNotificationRequest,
      } = this.props;

      return (
        <Form onSubmit={(e) => this.onSubmit(e)}>
          {editing && (
            <FormGroup>
              <ControlLabel>Name</ControlLabel>
              <FormControl
                type="text"
                bsSize="large"
                value={name}
                onChange={(e) => this.setState({ name: e.target.value })}
              />
              <FormControl.Feedback />
              <HelpBlock>Set the name for this notification</HelpBlock>
            </FormGroup>
          )}
          <FormGroup>
            <ControlLabel>Keywords (optional)</ControlLabel>
            <HelpBlock>
              Used to rank papers from selected arXiv categories (below)
            </HelpBlock>
            <FormControl
              bsSize="large"
              type="text"
              value={keywords}
              placeholder="star OR planet"
              onChange={(e) => this.setState({ keywords: e.target.value })}
            />
            <FormControl.Feedback />
            <HelpBlock>
              Boolean &quot;AND&quot; is assumed, but can be overriden by using
              explicit logical operators between keywords
            </HelpBlock>
          </FormGroup>

          <FormGroup>
            <ControlLabel>
              arXiv categories{' '}
              <span className="text-danger" aria-hidden="true">
                *
              </span>{' '}
              <span className="text-muted">(must choose at least one)</span>
              <span className="help-block" style={{ fontWeight: 'normal' }}>
                Notification will include all papers from selected categories
              </span>
            </ControlLabel>
            <ArxivClassList
              onSelection={this.onClassSelection}
              initialSelected={groups}
            />
            <HelpBlock>Select the groups to query</HelpBlock>
          </FormGroup>

          <div
            className="row"
            style={{ borderTop: 'solid 1px #d9d9d9', paddingTop: '1rem' }}
          >
            <div className="col-sm-4">
              <div className="btn-toolbar">
                <button type="submit" className="btn btn-primary">
                  {editing ? 'Save notification' : 'Create notification'}
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={onCancel}
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
                ...(editing
                  ? updateNotificationRequest
                  : addNotificationRequest),
                editing,
              })}
              <span className="text-info">{message}</span>
            </div>
          </div>
        </Form>
      );
    }
  }

  ArxivForm.defaultProps = {
    addNotification: () => {},
    addNotificationRequest: PropTypes.shape({
      status: null,
      result: null,
      error: null,
    }),
    editingNotification: () => {},
    onCancel: () => {},
    onSuccess: () => {},
    updateNotification: () => {},
    updateNotificationRequest: PropTypes.shape({
      status: null,
      result: null,
      error: null,
    }),
  };

  ArxivForm.propTypes = {
    addNotification: PropTypes.func,
    addNotificationRequest: PropTypes.shape({
      status: PropTypes.string,
      result: PropTypes.string,
      error: PropTypes.string,
    }),
    editingNotification: PropTypes.func,
    onCancel: PropTypes.func,
    onSuccess: PropTypes.func,
    updateNotification: PropTypes.func,
    updateNotificationRequest: PropTypes.shape({
      status: PropTypes.string,
      result: PropTypes.string,
      error: PropTypes.string,
    }),
  };

  return ArxivForm;
});
