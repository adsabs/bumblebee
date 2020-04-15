define(['react', 'react-prop-types', 'react-redux'], function(
  React,
  PropTypes,
  { useSelector }
) {
  const Dropdown = ({ activeFacets, onSubmitFilter }) => {
    const { logicOptions, facetTitle } = useSelector((state) => ({
      logicOptions: state.config.logicOptions,
      facetTitle: state.config.facetTitle,
    }));

    // no dropdown if no selected facets!
    if (activeFacets.length === 0) {
      return <div style={{ display: 'none' }} />;
    }

    if (activeFacets.length > 25) {
      return (
        <div className="facet__dropdown">
          <div>select no more than 25 facets at a time</div>
        </div>
      );
    }

    const arr = logicOptions[activeFacets.length === 1 ? 'single' : 'multiple'];

    if (arr[0] === 'invalid choice') {
      return (
        <div className="facet__dropdown">
          <div>invalid choice!</div>
        </div>
      );
    }
    return (
      <div className="facet__dropdown">
        <div
          className="facet__dropdown__title"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <div>{facetTitle}</div>
          <div>
            <b>{activeFacets.length}</b> selected
          </div>
        </div>
        <div
          className="btn-group-vertical"
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          {arr.map((val) => (
            <button
              key={val}
              className="btn btn-default"
              type="button"
              onClick={() => onSubmitFilter(val)}
            >
              {val}
            </button>
          ))}
        </div>
      </div>
    );
  };

  Dropdown.defaultProps = {
    activeFacets: [],
    onSubmitFilter: () => {},
  };

  Dropdown.propTypes = {
    activeFacets: PropTypes.arrayOf(PropTypes.string),
    onSubmitFilter: PropTypes.func,
  };

  return Dropdown;
});
