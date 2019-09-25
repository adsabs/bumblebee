define(['react', 'react-bootstrap', 'js/react/shared/helpers'], function(
  React,
  { Form, FormGroup, ControlLabel, FormControl, Checkbox, Radio, Button },
  { isEmpty }
) {
  const getStatusMessage = ({ status, error, noSuccess }) => {
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
            {noSuccess ? '' : 'Notification Created!'}
          </span>
        );
    }
  };

  const GeneralFormInitialState = {
    stateful: false,
    frequency: 'daily',
    message: '',
    name: '',
    editing: false,
    pending: false,
  };
  class GeneralForm extends React.Component {
    constructor(props) {
      super(props);
      this.onSubmit = this.onSubmit.bind(this);
      this.onFormChange = this.onFormChange.bind(this);
      this.onGotoResults = this.onGotoResults.bind(this);
      let updatedState = {};
      if (this.props.editingNotification) {
        const { stateful, frequency, name } = this.props.editingNotification;
        updatedState = {
          editing: true,
          stateful,
          frequency,
          name,
        };
      }
      this.state = { ...GeneralFormInitialState, ...updatedState };
    }

    showMessage(message) {
      this.setState({ message }, () => {
        setTimeout(() => this.setState({ message: null }), 3000);
      });
    }

    onGotoResults() {
      if (!this.state.pending) {
        this.props.getQuery(this.props.editingNotification.qid);
      }
    }

    onSubmit(e) {
      e.preventDefault();
      const { name, frequency, stateful, pending } = this.state;

      if (pending) {
        return;
      }

      if (isEmpty(name)) {
        return this.showMessage('Notification name cannot be empty');
      }
      const payload = { name, frequency, stateful };

      this.props.updateNotification({
        ...this.props.editingNotification,
        ...payload,
      });
    }

    componentWillReceiveProps(next) {
      const updateStatus = next.requests.updateNotification.status;
      const getQueryStatus = next.requests.getQuery.status;

      // fires success handler if our request was successful
      if (updateStatus === 'success') {
        setTimeout(() => this.props.onSuccess(), 1000);
      }

      // won't allow a request to go through if we're pending or had just failed
      if (
        updateStatus === 'pending' ||
        updateStatus === 'failure' ||
        getQueryStatus === 'pending' ||
        getQueryStatus === 'failure'
      ) {
        this.setState({ pending: true });
      }

      if (!updateStatus && !getQueryStatus) {
        this.setState({ pending: false });
      }
    }

    onFormChange(prop) {
      return (e) => {
        const value =
          e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        this.setState({
          [prop]: value,
          updated: true,
        });
      };
    }

    render() {
      return (
        <div>
          {this.state.editing ? (
            <Form onSubmit={this.onSubmit}>
              <FormGroup controlId="notification-name">
                <ControlLabel>Notification Name</ControlLabel>
                <FormControl
                  type="text"
                  placeholder="My Notification"
                  value={this.state.name}
                  onChange={this.onFormChange('name')}
                  bsSize="large"
                  required
                />
              </FormGroup>
              <FormGroup controlId="notification-stateful">
                <Checkbox
                  checked={this.state.stateful}
                  onChange={this.onFormChange('stateful')}
                >
                  Only receive new results
                </Checkbox>
              </FormGroup>
              <FormGroup controlId="notification-frequency">
                <ControlLabel id="frequency-check">Frequency</ControlLabel>
                <Radio
                  name="frequency"
                  checked={this.state.frequency === 'daily'}
                  value="daily"
                  onChange={this.onFormChange('frequency')}
                  aria-labelledby="frequency-check"
                >
                  Daily
                </Radio>
                <Radio
                  name="frequency"
                  checked={this.state.frequency === 'weekly'}
                  value="weekly"
                  onChange={this.onFormChange('frequency')}
                  aria-labelledby="frequency-check"
                >
                  Weekly
                </Radio>
              </FormGroup>
              <div
                className="row"
                style={{ borderTop: 'solid 1px #d9d9d9', paddingTop: '1rem' }}
              >
                <div className="col-sm-6">
                  <div className="btn-toolbar">
                    <button type="submit" className="btn btn-primary">
                      Save notification
                    </button>
                    <button
                      className="btn btn-default"
                      onClick={this.props.onCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div className="col-sm-6" style={{ paddingTop: '1rem' }}>
                  {getStatusMessage(this.props.requests.updateNotification)}
                  {getStatusMessage({
                    ...this.props.requests.getQuery,
                    noSuccess: true,
                  })}
                  <span className="text-info">{this.state.message}</span>
                </div>
              </div>
            </Form>
          ) : (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 className="h3" id="create-new-general-title">
                  How to create a new general notification:
                </h3>
                <ul
                  className="list-unstyled"
                  aria-labelledby="create-new-general-title"
                >
                  <li>
                    <strong>1.</strong> Perform a new search
                  </li>
                  <li>
                    <strong>2.</strong> While on results page, expand "Create
                    email notification" menu
                  </li>
                  <li>
                    <strong>3.</strong> Add a name and frequency
                  </li>
                  <li>
                    <strong>4.</strong> Click "Create"
                  </li>
                </ul>
                <span className="text-primary">
                  <i className="fa fa-bullhorn" aria-hidden="true"></i> Check
                  out the Gif on the right for an example.{' '}
                  <i className="fa fa-arrow-right" aria-hidden="true"></i>
                </span>
                <p style={{ marginTop: '1em' }}>
                  <a href="/" className="btn btn-primary">
                    Start a new search
                  </a>
                </p>
              </div>
              <div>
                <img
                  src="styles/img/myADS.gif"
                  alt="how to edit query on results page"
                  style={{ maxWidth: '800px' }}
                />
              </div>
            </div>
          )}
        </div>
      );
    }
  }

  return GeneralForm;
});
