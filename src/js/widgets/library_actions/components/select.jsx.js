define(['react'], function(React) {
  class Select extends React.Component {
    onChange(e) {
      this.props.onChange(e.target.value);
    }

    render() {
      const { label, value, items, index } = this.props;
      const id = label.replace(/\W/, '_').toLowerCase();
      const defaultValue = items[index] && items[index].id;
      return (
        <div className="form-group">
          <label htmlFor={id} className="control-label">
            {label} {index}
          </label>
          <select
            name={id}
            id={id}
            className="form-control"
            onChange={(e) => this.onChange(e)}
            value={value}
          >
            {items.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      );
    }
  }

  Select.defaultProps = {
    label: '',
    items: [],
    index: null,
    onChange: () => {},
  };

  return Select;
});
