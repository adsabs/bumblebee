define(['underscore', 'react', 'react-bootstrap', 'react-prop-types'], function(
  { uniqueId },
  React,
  {
    FormControl,
    Button,
    FormGroup,
    Tooltip,
    OverlayTrigger,
    Alert,
    InputGroup,
  },
  PropTypes
) {
  const initialState = {
    text: '',
    type: '',
    valid: true,
    error: '',
    entries: [],
  };
  class CitationsEntry extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        ...initialState,
        ...props.initialState,
      };
      this.inputRef = null;
    }

    removeEntry(id) {
      const { entries } = this.state;
      const idx = entries.findIndex((entry) => entry.id === id);
      if (idx >= 0) {
        this.setState(
          {
            entries: [...entries.slice(0, idx), ...entries.slice(idx + 1)],
          },
          () => {
            const { entries } = this.state;
            const { entriesUpdated } = this.props;
            entriesUpdated(entries);
          }
        );
      }
    }

    addEntry() {
      const { type, text, entries } = this.state;

      // check if entry is valid first
      if (this.isValid()) {
        const formattedText =
          type === 'ORCiD'
            ? text
                .replace(/-/g, '')
                .match(/\d{4}/g)
                .join('-')
            : text;

        this.setState(
          {
            entries: [
              ...entries,
              {
                id: uniqueId(),
                text: formattedText,
                type: type,
              },
            ],
            text: '',
            type: '',
          },
          () => {
            // refocus on input, call updated callback
            const { entries } = this.state;
            const { entriesUpdated } = this.props;
            this.inputRef.focus();
            entriesUpdated(entries);
          }
        );
      }
    }

    /**
     * Detects the type of entry from the text the user typed in
     */
    detectType() {
      const { text } = this.state;
      let type = '';
      if (text.match(/^\d/)) {
        type = 'ORCiD';
      } else if (text.length > 0) {
        type = 'Name';
      }
      this.setState({
        type,
      });
    }

    isValid() {
      const { text, type, entries } = this.state;

      let valid = true;
      let error = '';

      if (type === 'ORCiD' && !text.match(/^\d{4}-?\d{4}-?\d{4}-?\d{4}$/)) {
        // orcid formatting is off
        valid = false;
        error = 'ORCiD must in the format: 9999-9999-9999-9999';
      } else if (entries.some((e) => e.text === text)) {
        // there are duplicate(s)
        valid = false;
        error = 'Already in the list!';
      } else if (text.length === 0) {
        valid = false;
      }

      this.setState({ valid, error });
      return valid;
    }

    render() {
      const { entries, valid, type, text, error } = this.state;

      return (
        <div style={{ marginBottom: '50px' }}>
          <table className="table">
            <thead>
              <tr>
                <th id="author-heading">Author (name or ORCiD)</th>
                <th id="type-heading">Type</th>
                <th id="action-heading">Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.length <= 0 && (
                <tr>
                  <td colSpan="3">
                    <Alert style={{ marginBottom: 0 }} className="text-center">
                      No entries! Add a new entry below
                    </Alert>
                  </td>
                </tr>
              )}
              {entries.map(({ text, type, id }) => (
                <Entry
                  text={text}
                  type={type}
                  onRemove={() => this.removeEntry(id)}
                />
              ))}
            </tbody>
          </table>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this.addEntry();
            }}
            style={{ borderTop: 'solid 1px gray', padding: '1em 0' }}
          >
            <div className="col-xs-10">
              <FormGroup validationState={valid ? null : 'error'}>
                <InputGroup>
                  <FormControl
                    type="text"
                    name="author"
                    id="author-input"
                    aria-labelledby="author-heading"
                    placeholder="Huchra, J. or 1111-2222-3333-4444"
                    value={text}
                    inputRef={(ref) => {
                      this.inputRef = ref;
                    }}
                    onChange={(e) => {
                      this.setState(
                        {
                          text: e.target.value,
                          valid: true,
                          error: '',
                        },
                        () => {
                          this.detectType();
                        }
                      );
                    }}
                  />
                  <InputGroup.Addon>{type}</InputGroup.Addon>
                </InputGroup>
                {!valid && <small className="text-danger">{error}</small>}
              </FormGroup>
            </div>
            <div className="col-xs-2">
              <Button type="submit" aria-labelledby="action-heading">
                Add
              </Button>
            </div>
          </form>
        </div>
      );
    }
  }

  CitationsEntry.propTypes = {
    entriesUpdated: () => {},
    initialState: PropTypes.shape({
      entries: PropTypes.array,
    }),
  };

  CitationsEntry.defaultProps = {
    initialState: {},
    entriesUpdated: [],
  };

  const getWarning = (text, type) => {
    if (type === 'Name' && !text.match(/^[^,]*,[^,]*$/)) {
      return "Author names should be formatted as 'Last, First M'";
    }
    return null;
  };

  const Entry = ({ text, type, onRemove }) => {
    const warning = getWarning(text, type);

    return (
      <tr>
        <td>
          {text}
          {warning && (
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip id="warning-tooltip">{warning}</Tooltip>}
            >
              <small className="text-warning" style={{ marginLeft: '1rem' }}>
                <i className="fa fa-exclamation-triangle" aria-hidden="true" />
              </small>
            </OverlayTrigger>
          )}
        </td>
        <td>{type}</td>
        <td>
          <Button bsSize="sm" bsStyle="default" onClick={onRemove}>
            Remove
          </Button>
        </td>
      </tr>
    );
  };

  Entry.propTypes = {
    onRemove: PropTypes.func,
    text: PropTypes.string,
    type: PropTypes.string,
  };

  Entry.defaultProps = {
    text: '',
    type: '',
    onRemove: () => {},
  };

  return CitationsEntry;
});
