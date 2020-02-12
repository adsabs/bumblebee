define(['react'], function(React) {
  const capitalize = (word) => {
    if (word.length < 3) return word;
    return word.toLowerCase()[0].toUpperCase() + word.slice(1);
  };

  class RadioGroup extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        selection: props.options[0],
      };

      this.onChange = (selection) => {
        this.setState({ selection });
        this.props.onChange(selection);
      };
    }

    render() {
      const { options, label, direction } = this.props;
      const { selection } = this.state;

      const radioClass = direction === 'inline' ? 'radio-inline' : 'radio';
      const id = label.replace(/\W/g, '_').toLowerCase();

      return (
        <div className="form-group">
          <p
            style={{
              fontWeight: 'bold',
              marginBottom: '5px',
              fontSize: '15px',
            }}
          >
            {label}
          </p>
          {options.map((val, i) => (
            <label className={radioClass} key={id + i}>
              <input
                type="radio"
                name={id + i}
                value={val}
                checked={selection === val}
                onChange={(e) => this.onChange(val)}
              />{' '}
              {capitalize(val)}
            </label>
          ))}
        </div>
      );
    }
  }

  RadioGroup.defaultProps = {
    options: [],
    label: 'Radio Group',
    direction: null,
    onChange: () => {},
  };

  return RadioGroup;
});
