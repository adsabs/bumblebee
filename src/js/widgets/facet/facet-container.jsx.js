define([
  'react',
  'react-redux',
  'react-prop-types',
  'es6!./toggle_list.jsx',
  './reducers',
], function(
  React,
  { connect, useSelector },
  PropTypes,
  ToggleList,
  { getActiveFacets }
) {
  const Dropdown = React.memo(({ activeFacets, onSubmitFilter }) => {
    const { logicOptions, facetTitle } = useSelector((state) => ({
      logicOptions: state.config.logicOptions,
      facetTitle: state.config.facetTitle,
    }));

    // no dropdown if no selected facets!
    if (activeFacets.length === 0) {
      return <div />;
    }

    if (activeFacets.length > 25) {
      return (
        <div className="facet__dropdown">
          select no more than 25 facets at a time
        </div>
      );
    }

    const arr = logicOptions[activeFacets.length === 1 ? 'single' : 'multiple'];

    if (arr[0] === 'invalid choice') {
      return <div className="facet__dropdown">invalid choice!</div>;
    }
    return (
      <div className="facet__dropdown">
        <div className="facet__dropdown__title">
          <b>{activeFacets.length}</b> selected
        </div>
        {arr.map(function(val, i) {
          return (
            <label key={val} htmlFor={`facet_${facetTitle}_${i}`}>
              <input
                id={`facet_${facetTitle}_${i}`}
                type="radio"
                onChange={() => onSubmitFilter(val)}
              />{' '}
              {val}
            </label>
          );
        }, this)}
      </div>
    );
  });

  Dropdown.defaultProps = {
    activeFacets: [],
    onSubmitFilter: () => {},
  };

  Dropdown.propTypes = {
    activeFacets: PropTypes.arrayOf(PropTypes.string),
    onSubmitFilter: PropTypes.func,
  };

  const ContainerComponent = ({
    activeFacets,
    reduxState: state,
    resetVisibleFacets,
    selectFacet,
    showMoreFacets,
    submitFilter,
    toggleFacet,
    unselectFacet,
  }) => {
    var header = (
      <div
        role="button"
        tabIndex="0"
        onClick={() => toggleFacet(undefined)}
        onKeyPress={(e) => {
          if (e.which === 13) {
            toggleFacet(undefined);
          }
        }}
        style={{ display: 'inline-block' }}
      >
        <h3 className="facet__header">{state.config.facetTitle}</h3>
      </div>
    );

    return (
      <div className="facet__container">
        <ToggleList
          reduxState={state}
          currentLevel={1}
          showMoreFacets={showMoreFacets}
          resetVisibleFacets={resetVisibleFacets}
          toggleFacet={toggleFacet}
          selectFacet={selectFacet}
          unselectFacet={unselectFacet}
        >
          {header}
        </ToggleList>
        <Dropdown activeFacets={activeFacets} onSubmitFilter={submitFilter} />
      </div>
    );
  };

  ContainerComponent.defaultProps = {};

  ContainerComponent.propTypes = {
    activeFacets: PropTypes.arrayOf(PropTypes.object).isRequired,
    reduxState: PropTypes.shape({
      config: PropTypes.object,
      state: PropTypes.object,
      pagination: PropTypes.object,
      children: PropTypes.array,
      facets: PropTypes.object,
    }).isRequired,
    showMoreFacets: PropTypes.func.isRequired,
    resetVisibleFacets: PropTypes.func.isRequired,
    toggleFacet: PropTypes.func.isRequired,
    selectFacet: PropTypes.func.isRequired,
    unselectFacet: PropTypes.func.isRequired,
    submitFilter: PropTypes.func.isRequired,
  };

  const mapStateToProps = (state) => {
    return {
      reduxState: state,
      activeFacets: getActiveFacets(state, state.state.selected),
    };
  };

  // ownProps contains the widget's actions object which has
  // overridden certain methods to be unique to the widget
  const mapDispatchToProps = (dispatch, ownProps) => {
    return {
      selectFacet: function(id) {
        dispatch(ownProps.actions.select_facet(id));
      },
      unselectFacet: function(id) {
        dispatch(ownProps.actions.unselect_facet(id));
      },
      toggleFacet: function(id, open) {
        dispatch(ownProps.actions.toggle_facet(id, open));
      },
      showMoreFacets: function(id) {
        dispatch(ownProps.actions.increase_visible(id));
      },
      resetVisibleFacets: function(id) {
        dispatch(ownProps.actions.reset_visible(id));
      },
      submitFilter: function(logicOption) {
        dispatch(ownProps.actions.submit_filter(logicOption));
      },
    };
  };

  return connect(mapStateToProps, mapDispatchToProps)(ContainerComponent);
});
