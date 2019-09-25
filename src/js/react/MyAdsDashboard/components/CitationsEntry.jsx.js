define(['underscore', 'react', 'react-bootstrap'], function(
  { escape },
  React,
  { Alert, FormGroup, ControlLabel, FormControl, HelpBlock, Radio }
) {
  const TYPES = {
    name: 'Author Name',
    orcid: 'ORCiD',
  };

  const INPUTS = {
    name: {
      label: 'Author Name (Last, First)',
      placeholder: 'Huchra, John',
      helpText: 'Enter author name (ex. Huchra, John)',
    },
    orcid: {
      label: 'ORCiD ID',
      placeholder: '0000-0002-3843-3472',
      helpText: 'Enter ORCiD id (ex. 0000-0002-3843-3472)',
    },
  };

  const renderTable = (entries, onDelete) => {
    return (
      <div>
        {entries.length ? (
          <ul className="list-unstyled">
            {entries.map(({ field, value }, idx) => {
              return (
                <li key={field + idx}>
                  <strong>{idx + 1}</strong>
                  {'   '}
                  {escape(value)}
                  {'   '}
                  <button
                    className="btn btn-link btn-xs"
                    onClick={(e) => onDelete(e, idx)}
                    aria-description="delete entry"
                    title="delete entry"
                  >
                    <i
                      className="fa fa-times text-danger"
                      aria-hidden="true"
                    ></i>
                    <span className="sr-only">Delete entry</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <Alert bsStyle="info">Please add at least one entry</Alert>
        )}
      </div>
    );
  };

  const initialState = {
    field: 'name',
    value: '',
    error: null,
    entries: [],
  };
  class CitationsEntry extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        ...initialState,
        ...props.initialState,
      };
      this.input = null;
      this.onDelete = this.onDelete.bind(this);
    }

    onChangeField(field) {
      this.setState({ field }, () => {
        this.input.focus();
      });
    }

    setError(msg) {
      this.setState({ error: msg });
    }

    onChangeValue(value) {
      this.setState({ value });
      this.props.onChange({ field: this.state.field, value });
    }

    shouldAdd() {
      const { value, field } = this.state;
      if (field === 'orcid') {
        if (value.trim().match(/^\d{4}-\d{4}-\d{4}-\d{4}$/)) {
          return true;
        }
        this.setError('Not a valid ORCiD id');
      } else if (field === 'name') {
        return value.trim() !== '';
      }
      return false;
    }

    onAdd(e) {
      e.preventDefault();
      if (this.shouldAdd()) {
        const entries = [
          ...this.state.entries,
          { field: this.state.field, value: this.state.value },
        ];
        this.setState({
          entries,
          value: '',
        });
        this.props.entriesUpdated(entries);
      }
    }

    onDelete(e, idx) {
      e.preventDefault();
      const entries = [
        ...this.state.entries.slice(0, idx),
        ...this.state.entries.slice(idx + 1),
      ];
      this.setState({
        entries,
      });
      this.props.entriesUpdated(entries);
    }

    componentDidUpdate(prevProps, prevState) {
      if (
        this.state.error !== null &&
        (prevState.field !== this.state.field ||
          prevState.value !== this.state.value)
      ) {
        this.setState({ error: null });
      }
    }

    render() {
      return (
        <div>
          <FormGroup>
            <ControlLabel>Type</ControlLabel>
            {Object.keys(TYPES).map((field) => (
              <Radio
                key={field}
                name="type"
                checked={this.state.field === field}
                onChange={() => this.onChangeField(field)}
              >
                {TYPES[field]}
              </Radio>
            ))}
          </FormGroup>
          {Object.keys(INPUTS)
            .filter((k) => k === this.state.field)
            .map((field) => {
              const { label, placeholder, helpText } = INPUTS[field];
              return (
                <FormGroup validationState={this.state.error ? 'error' : null}>
                  <ControlLabel>{label}</ControlLabel>
                  <FormControl
                    bsSize="large"
                    type="text"
                    value={this.state.value}
                    onChange={(e) => this.onChangeValue(e.target.value)}
                    inputRef={(ref) => {
                      this.input = ref;
                      this.props.inputRef(ref);
                    }}
                    placeholder={placeholder}
                    autofocus
                  />
                  <HelpBlock>{helpText}</HelpBlock>
                  {this.state.error && (
                    <small className="text-danger">{this.state.error}</small>
                  )}
                </FormGroup>
              );
            })}
          {this.props.multiple && (
            <div>
              <button
                className="btn btn-success"
                onClick={(e) => this.onAdd(e)}
              >
                Add
              </button>
              <div className="container-fluid" style={{ paddingTop: '1rem' }}>
                {renderTable(this.state.entries, this.onDelete)}
              </div>
            </div>
          )}
        </div>
      );
    }
  }

  CitationsEntry.defaultProps = {
    initialState: {},
    multiple: false,
    inputRef: () => {},
    entriesUpdated: [],
    onChange: () => {}
  };

  return CitationsEntry;
});
