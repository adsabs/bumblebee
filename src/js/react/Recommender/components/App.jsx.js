define([
  'react',
  'react-bootstrap',
  'react-prop-types',
  'es6!./RecommendedList.jsx',
  'es6!./SearchExamples.jsx',
], function(
  React,
  { Nav, NavItem },
  PropTypes,
  RecommendedList,
  SearchExamples
) {
  const App = () => {
    const [selected, onSelected] = React.useState(1);

    return (
      <div>
        <Nav
          bsStyle="tabs"
          justified
          activeKey={selected}
          onSelect={(key) => onSelected(key)}
        >
          <NavItem eventKey={1} href="javascript:void(0);">
            Recommended for you
          </NavItem>
          <NavItem eventKey={2} href="javascript:void(0);">
            Search examples
          </NavItem>
        </Nav>
        {selected === 1 ? <RecommendedList /> : <SearchExamples />}
      </div>
    );
  };

  return App;
});
