
define([
  'react',
  'react-prop-types'
], function (React, PropTypes) {
  const SortApp = ({ setSort, setDirection, app }) => {
    const { options, sort, direction } = app;

    /**
     * Call the handler after a selection is made from the dropdown
     *
     * @param {object} item - the sort option
     * @param {object} e - the event object
     */
    const onSelect = (item, e) => {
      e.preventDefault();
      e.stopPropagation && e.stopPropagation();
      setSort(item);
    };

    return (
      <div className="btn-group">
        <button
          type="button"
          className="btn btn-default"
          onClick={setDirection}
          title={direction === 'asc'
            ? 'Change sort direction to descending'
            : 'Change sort direction to ascending'
          }
          >
          <i className={`fa fa-sort-amount-${direction}`} aria-hidden="true"/>
        </button>
        <button
          style={{ minWidth: 100 }}
          type="button"
          className="btn btn-default dropdown-toggle"
          data-toggle="dropdown"
          title="Select a sort option"
          >
          {sort.text} <span className="caret" aria-hidden="true"/>
        </button>
        <ul className="dropdown-menu" role="menu">
          {
            options.map(o => (
              <li key={o.id}>
                <a
                  href="javascript:void(0)"
                  title={o.desc}
                  onClick={e => onSelect(o, e)}
                >{o.text}</a>
              </li>
            ))
          }
        </ul>
      </div>
    );
  };

  SortApp.propTypes = {
    app: PropTypes.object.isRequired,
    setSort: PropTypes.func.isRequired,
    setDirection: PropTypes.func.isRequired
  };

  return SortApp;
});
