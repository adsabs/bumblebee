define([
  'react',
  'react-bootstrap',
  'react-prop-types',
  'react-redux',
  '../actions',
  'es6!./RecommendedList.jsx',
  'es6!./SearchExamples.jsx',
], function(
  React,
  { Nav, NavItem },
  PropTypes,
  { useDispatch, useSelector },
  { setTab, emitAnalytics },
  RecommendedList,
  SearchExamples
) {
  const selector = (state) => ({
    tab: state.tab,
  });

  const App = () => {
    const dispatch = useDispatch();
    const { tab } = useSelector(selector);
    const onSelected = (key) => {
      dispatch(setTab(key));
      dispatch(
        emitAnalytics([
          'send',
          'event',
          'interaction.main-page',
          key === 1 ? 'recommender' : 'help',
        ])
      );
    };

    return (
      <div>
        <Nav
          bsStyle="tabs"
          justified
          activeKey={tab}
          onSelect={(key) => onSelected(key)}
        >
          <NavItem eventKey={1} href="javascript:void(0);">
            Recommended for you
          </NavItem>
          <NavItem eventKey={2} href="javascript:void(0);">
            Search examples
          </NavItem>
        </Nav>
        <div style={{ minHeight: 200, padding: '1rem 0' }}>
          {tab === 1 ? <RecommendedList /> : <SearchExamples />}
        </div>
      </div>
    );
  };

  return App;
});
