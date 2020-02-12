define(['underscore', 'react'], function(_, React) {
  class MultiControl extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        count: 1,
        selected: [props.items[0].id],
      };

      this.updateCount = (e, val) => {
        e.preventDefault();
        const { items } = this.props;
        const { selected, count } = this.state;
        const arr = [...selected];
        val === 1 ? arr.push(items[0].id) : arr.pop();
        this.setState({
          count: count + val,
          selected: arr,
        });
        this.props.onChange(arr);
      };

      this.createOnChangeHandler = (index) => {
        return (value) => {
          this.setState(
            ({ selected }) => ({
              selected: [
                ...selected.slice(0, index),
                value,
                ...selected.slice(index + 1),
              ],
            }),
            () => {
              this.props.onChange(this.state.selected);
            }
          );
        };
      };
    }

    render() {
      const { count } = this.state;
      const {
        addIcon,
        removeIcon,
        addLabel,
        disableControls,
        max,
        children,
      } = this.props;

      return (
        <div>
          {_.range(0, count).map((i) =>
            children(i > 0 ? i + 1 : null, this.createOnChangeHandler(i))
          )}
          {!disableControls && (
            <div className="form-group btn-toolbar">
              <button
                id="addLibrary"
                className="btn btn-default btn-sm"
                disabled={count >= max}
                onClick={(e) => this.updateCount(e, 1)}
              >
                <fa className={`fa fa-${addIcon}`} /> {addLabel}
              </button>
              {count > 1 && (
                <button
                  id="removeLibrary"
                  className="btn btn-danger btn-sm"
                  onClick={(e) => this.updateCount(e, -1)}
                >
                  <fa className={`fa fa-${removeIcon}-o`} />
                </button>
              )}
            </div>
          )}
        </div>
      );
    }
  }

  MultiControl.defaultProps = {
    addIcon: 'plus',
    removeIcon: 'trash',
    addLabel: 'Add',
    disableControls: false,
    max: Number.MAX_SAFE_INTEGER,
  };

  return MultiControl;
});
