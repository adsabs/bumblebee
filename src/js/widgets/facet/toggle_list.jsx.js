define(['react', 'd3', 'react-prop-types'], function(React, d3, PropTypes) {
  const format = (count) => {
    return d3
      .format('s')(count)
      .replace(/\.\d{2,}/, function(m) {
        return m.slice(0, 2);
      })
      .replace('.0', '');
  };

  const FacetCheckbox = ({
    reduxState: state,
    toggleFacet,
    unselectFacet,
    value,
    currentLevel,
    showMoreFacets,
    resetVisibleFacets,
    selectFacet,
    hierarchical,
    isChecked,
    name,
    count,
    id,
  }) => {
    const updateFacetSelect = (e) => {
      if (e.target.checked) {
        // toggle open author hierarchical facets here, so users can see what the hierarchy means
        selectFacet(id);
        if (state && state.config.hierMaxLevels === 2) {
          toggleFacet(id, true);
        }
      } else {
        unselectFacet(id);
      }
    };

    let label = '';
    if (state) {
      label = `facet-label__title_${state.config.facetField}_${label}`;
    }
    var checkbox = (
      <label className="facet-label" htmlFor={label}>
        <input
          type="checkbox"
          id={label}
          onChange={updateFacetSelect}
          checked={isChecked}
          aria-describedby={label}
        />
        &nbsp;
        <span>
          <span className="facet-label__title" id={label}>
            {name}
          </span>
          <span className="facet-label__amount" title={count}>
            {format(count)}
          </span>
        </span>
      </label>
    );

    if (hierarchical) {
      return (
        <ToggleList
          id={value}
          reduxState={state}
          currentLevel={currentLevel + 1}
          showMoreFacets={showMoreFacets}
          resetVisibleFacets={resetVisibleFacets}
          toggleFacet={toggleFacet}
          selectFacet={selectFacet}
          unselectFacet={unselectFacet}
        >
          {checkbox}
        </ToggleList>
      );
    }
    return checkbox;
  };

  FacetCheckbox.propTypes = {
    isChecked: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    reduxState: PropTypes.shape({
      config: PropTypes.object,
      state: PropTypes.object,
      pagination: PropTypes.object,
      children: PropTypes.array,
      facets: PropTypes.object,
    }).isRequired,
    currentLevel: PropTypes.number,
    showMoreFacets: PropTypes.func,
    resetVisibleFacets: PropTypes.func,
    toggleFacet: PropTypes.func,
    selectFacet: PropTypes.func,
    unselectFacet: PropTypes.func,
    id: PropTypes.string,
  };

  const ToggleList = ({
    reduxState: state,
    currentLevel,
    children,
    selectFacet,
    unselectFacet,
    showMoreFacets,
    resetVisibleFacets,
    toggleFacet,
    id,
  }) => {
    const data = currentLevel === 1 ? state : state.facets[id];
    const open = data.state.open;
    const visible = data.state.visible;
    const finished = data.pagination.finished || false;
    const facets = _.values(_.pick(state.facets, data.children));

    let stateMessage = '';
    if (data.pagination.state === 'loading') {
      stateMessage = <span>loading...</span>;
    } else if (data.pagination.state === 'failure') {
      stateMessage = (
        <span>
          <i className="icon-danger" />
          request failed
        </span>
      );
    } else if (data.pagination.state === 'success' && !facets.length) {
      stateMessage = <span>no data retrieved</span>;
    }

    let list = null;
    if (!facets.length) {
      list = <li />;
    } else {
      list = facets.slice(0, visible).map(function(c, i) {
        let checkboxProps = {
          isChecked: state.state.selected.indexOf(c.value) > -1,
          name: c.name,
          count: c.count,
          hierarchical: state.config.hierMaxLevels > currentLevel,
          value: c.value,
          id: c.value,
          selectFacet: selectFacet,
          unselectFacet: unselectFacet,
          label: i,
        };
        // if it's hierarchical, pass down some more data so that the checkbox can instantiate its own toggleList
        if (checkboxProps.hierarchical) {
          checkboxProps = {
            ...checkboxProps,
            showMoreFacets,
            resetVisibleFacets,
            toggleFacet,
            reduxState: state,
            currentLevel,
          };
        }

        return (
          <li key={c.value}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <FacetCheckbox {...checkboxProps} />
          </li>
        );
      }, this);
    }

    var showMore = !finished || facets.length > visible;
    var moreButtonClasses = showMore
      ? 'btn btn-default btn-xs facet__pagination-button'
      : ' hidden';
    var lessButtonClasses =
      visible > 5
        ? 'btn btn-default btn-xs facet__pagination-button'
        : 'hidden';

    var facetList;
    // level will be either 1 or 2
    var parentClass =
      currentLevel > 1
        ? 'facet__list-container facet__list-container--child'
        : 'facet__list-container';

    if (open) {
      facetList = (
        <div className={parentClass}>
          <ul className="facet__list">{list}</ul>
          <div className="facet__state-message">{stateMessage}</div>
          <div className="facet__pagination-container">
            <button
              type="button"
              className={lessButtonClasses}
              onClick={() => resetVisibleFacets(id)}
            >
              less
            </button>
            <button
              type="button"
              className={moreButtonClasses}
              onClick={() => showMoreFacets(id)}
            >
              more
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="facet__toggle">
          <i
            role="button"
            aria-label="facet toggle"
            tabIndex="0"
            className={
              open
                ? 'facet__icon facet__icon--open'
                : 'facet__icon facet__icon--closed'
            }
            onClick={() => toggleFacet(id, !open)}
            onKeyPress={(e) => {
              if (e.which === 13) {
                toggleFacet(id, !open);
              }
            }}
          />{' '}
          {children}
        </div>
        {facetList}
      </div>
    );
  };

  ToggleList.defaultProps = {
    children: [],
  };

  ToggleList.propTypes = {
    reduxState: PropTypes.shape({
      config: PropTypes.object,
      state: PropTypes.object,
      pagination: PropTypes.object,
      children: PropTypes.array,
      facets: PropTypes.object,
    }).isRequired,
    children: PropTypes.children,
    currentLevel: PropTypes.number.isRequired,
    showMoreFacets: PropTypes.func.isRequired,
    resetVisibleFacets: PropTypes.func.isRequired,
    toggleFacet: PropTypes.func.isRequired,
    selectFacet: PropTypes.func.isRequired,
    unselectFacet: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
  };

  return ToggleList;
});
