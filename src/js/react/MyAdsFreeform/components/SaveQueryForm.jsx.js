define([
  'underscore',
  'react',
  'react-prop-types',
  'react-bootstrap',
  '../constants',
  'js/react/shared/helpers',
], function(
  _,
  React,
  PropTypes,
  {
    FormGroup,
    FormControl,
    ControlLabel,
    Checkbox,
    Radio,
    Button,
    ButtonToolbar,
  },
  { Frequency },
  { isEmpty }
) {
  const initialState = {
    name: '',
    frequency: Frequency.DAILY,
  };
  class SaveQueryForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = initialState;
      this.onSubmit = this.onSubmit.bind(this);
      this.onFormChange = this.onFormChange.bind(this);
      this.onCancel = this.onCancel.bind(this);
      this._onSubmit = _.debounce(this._onSubmit, 1000, {
        leading: true,
        trailing: false,
      });
    }

    reset() {
      this.setState(initialState);
    }

    _onSubmit() {
      const { name, frequency } = this.state;
      if (!isEmpty(name)) {
        this.props.onSubmit({ name, frequency });
      }
    }

    onSubmit(e) {
      e.preventDefault();
      this._onSubmit();
    }

    onCancel() {
      this.props.onCancel();
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

    componentWillReceiveProps(nextProps) {
      if (nextProps.requests.addNotification.status === 'success') {
        this.reset();
      }
    }

    render() {
      const isDisabled = this.props.disabled;
      return (
        <form onSubmit={this.onSubmit}>
          <FormGroup>
            <i className="fa fa-question-circle" aria-hidden="true" /> Create
            myADS email notification for this query
          </FormGroup>
          <FormGroup controlId="notification-name">
            <ControlLabel>Notification Name</ControlLabel>
            <FormControl
              type="text"
              placeholder="My Notification"
              value={this.state.name}
              onChange={this.onFormChange('name')}
              disabled={isDisabled}
              bsSize="small"
              required
            />
          </FormGroup>
          <FormGroup controlId="notification-frequency">
            <ControlLabel id="frequency-check">Frequency</ControlLabel>
            <Radio
              name="frequency"
              checked={this.state.frequency === Frequency.DAILY}
              value="daily"
              onChange={this.onFormChange('frequency')}
              aria-labelledby="frequency-check"
              disabled={isDisabled}
            >
              Daily
            </Radio>
            <Radio
              name="frequency"
              checked={this.state.frequency === Frequency.WEEKLY}
              value="weekly"
              onChange={this.onFormChange('frequency')}
              aria-labelledby="frequency-check"
              disabled={isDisabled}
            >
              Weekly
            </Radio>
          </FormGroup>
          <FormGroup>
            <ButtonToolbar>
              <Button
                type="submit"
                bsStyle="primary-faded"
                bsSize="sm"
                disabled={isDisabled}
              >
                Create
              </Button>
              <Button
                bsStyle="default"
                bsSize="sm"
                onClick={this.onCancel}
                disabled={isDisabled}
              >
                Cancel
              </Button>
            </ButtonToolbar>
          </FormGroup>
          <FormGroup>
            <a href="#/user/settings/myads">Go to myADS settings</a>
          </FormGroup>
        </form>
      );
    }
  }
  SaveQueryForm.defaultProps = {
    onSubmit: () => {},
    onCancel: () => {},
    disabled: false,
    requests: {},
  };
  SaveQueryForm.propTypes = {
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    disabled: PropTypes.bool,
    requests: PropTypes.object,
  };

  return SaveQueryForm;
});
