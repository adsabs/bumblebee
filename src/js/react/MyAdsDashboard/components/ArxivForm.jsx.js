define(['react', 'react-bootstrap', 'es6!./ArxivClassList.jsx'], function(
  React,
  { Form, FormGroup, ControlLabel, FormControl, HelpBlock },
  ArxivClassList
) {
  const getStatusMessage = ({ status, error }) => {
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
        return <span className="text-success">Notification Created!</span>;
    }
  };

  class ArxivForm extends React.Component {
    constructor(props) {
      super(props);

      let updatedState = {};
      if (this.props.editingNotification) {
        updatedState = {
          groups: this.props.editingNotification.classes,
          keywords: this.props.editingNotification.data,
          name: this.props.editingNotification.name,
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

    onClassSelection(groups) {
      this.setState({
        groups,
      });
    }

    showMessage(message) {
      this.setState({ message }, () => {
        setTimeout(() => this.setState({ message: null }), 3000);
      });
    }

    onSubmit(e) {
      e.preventDefault();
      const { keywords, groups, name, pending } = this.state;

      if (pending) {
        return;
      }

      if (groups.length <= 0) {
        return this.showMessage('must select at least one group');
      }

      const payload = {
        data: keywords,
        classes: groups,
        name: name
      };

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
      if (
        addStatus === 'success' || updateStatus === 'success'
      ) {
        setTimeout(() => this.props.onSuccess(), 1000);
      }

      // won't allow a request to go through if we're pending or had just failed
      if (
        addStatus === 'pending' || updateStatus === 'pending' ||
        addStatus === 'failure' || updateStatus === 'failure'
      ) {
        this.setState({ pending: true });
      } else if (!addStatus && !updateStatus) {
        this.setState({ pending: false });
      }
    }

    render() {
      return (
        <Form onSubmit={(e) => this.onSubmit(e)}>
          {this.state.editing &&
            <FormGroup>
              <ControlLabel>Name</ControlLabel>
              <FormControl
                type="text"
                bsSize="large"
                value={this.state.name}
                onChange={(e) => this.setState({ name: e.target.value })}
              />
              <FormControl.Feedback/>
              <HelpBlock>Set the name for this notification</HelpBlock>
            </FormGroup>
          }
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

          <FormGroup>
            <ControlLabel>
              arXiv Groups{' '}
              <span className="text-danger" aria-hidden="true">
                *
              </span>{' '}
              <span className="text-muted">(must choose one)</span>
            </ControlLabel>
            <ArxivClassList
              onSelection={this.onClassSelection}
              initialSelected={this.state.groups}
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
              {getStatusMessage(
                this.state.editing
                  ? this.props.updateNotificationRequest
                  : this.props.addNotificationRequest
              )}
              <span className="text-info">{this.state.message}</span>
            </div>
          </div>
        </Form>
      );
    }
  }

  return ArxivForm;
});
