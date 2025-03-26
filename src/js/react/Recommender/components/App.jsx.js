define([
  'react',
  'react-bootstrap',
  'prop-types',
  'react-redux',
  'js/react/Recommender/actions',
  'es6!js/react/Recommender/components/RecommendedList.jsx',
  'es6!js/react/Recommender/components/SearchExamples.jsx',
], function (
  React,
  {Nav, NavItem},
  PropTypes,
  {useDispatch, useSelector},
  {setTab, emitAnalytics},
  RecommendedList,
  SearchExamples,
) {
  const selector = (state) => ({
    tab: state.tab,
  });

  const App = () => {
    const dispatch = useDispatch();
    const {tab} = useSelector(selector);
    const onSelected = (key) => {
      dispatch(setTab(key));
      dispatch(
        emitAnalytics([
          'send',
          'event',
          'interaction', 'main-page',
          key === 1 ? 'recommender' : 'help',
        ]),
      );
    };

    return (
      <div>
        <Nav
          className="hidden-xs"
          bsStyle="tabs"
          justified
          activeKey={tab}
          onSelect={(key) => onSelected(key)}
        >
          <NavItem eventKey={1} href="javascript:void(0);">
            Recommendations
          </NavItem>
          <NavItem eventKey={2} href="javascript:void(0);">
            Search examples
          </NavItem>
        </Nav>
        <Nav
          className="hidden-sm hidden-md hidden-lg"
          bsStyle="tabs"
          activeKey={tab}
          onSelect={(key) => onSelected(key)}
        >
          <NavItem eventKey={1} href="javascript:void(0);">
            Recommendations
          </NavItem>
          <NavItem eventKey={2} href="javascript:void(0);">
            Search examples
          </NavItem>
        </Nav>
        <div style={{minHeight: 200, padding: '1rem 0'}}>
          {tab === 1 ? <RecommendedList/> : <SearchExamples/>}
        </div>
      </div>
    );
  };

  return App;
});
