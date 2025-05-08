define([
  'react',
  'prop-types',
  'react-redux',
  'js/react/Recommender/actions',
  'js/react/Recommender/components/RecommendedList.jsx',
  'js/react/Recommender/components/SearchExamples.jsx',
  'bootstrap-sass',
], function(
  React,
  PropTypes,
  { useDispatch, useSelector },
  { setTab, emitAnalytics },
  RecommendedList,
  SearchExamples
) {
  return () => {
    const dispatch = useDispatch();
    const tab = useSelector((state) => state.tab);

    const handleSelect = (key) => {
      console.log('key', key);
      dispatch(setTab(key));
      dispatch(emitAnalytics(['send', 'event', 'interaction', 'main-page', key === 1 ? 'recommender' : 'help']));
    };

    const handleTabClick = (e) => {
      console.log('click', e);
      e.preventDefault();
      const key = parseInt(e.currentTarget.getAttribute('data-key'), 10);
      handleSelect(key);
    };

    return (
      <div>
        {/* Desktop tabs */}
        <ul className="nav nav-tabs nav-justified hidden-xs">
          <li className={tab === 1 ? 'active' : ''}>
            <a href="javascript:void(0)" data-key="1" onClick={handleTabClick}>
              Recommendations
            </a>
          </li>
          <li className={tab === 2 ? 'active' : ''}>
            <a href="javascript:void(0)" data-key="2" onClick={handleTabClick}>
              Search examples
            </a>
          </li>
        </ul>

        {/* Mobile tabs */}
        <ul className="nav nav-tabs nav-justified hidden-sm hidden-md hidden-lg">
          <li className={tab === 1 ? 'active' : ''}>
            <a href="#" onClick={() => handleSelect(1)}>
              Recommendations
            </a>
          </li>
          <li className={tab === 2 ? 'active' : ''}>
            <a href="#" onClick={() => handleSelect(2)}>
              Search examples
            </a>
          </li>
        </ul>

        <div style={{ minHeight: 200, padding: '1rem 0' }}>{tab === 1 ? <RecommendedList /> : <SearchExamples />}</div>
      </div>
    );
  };
});
