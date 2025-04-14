define([
  'react-redux',
  'es6!.js/widgets/sort/redux/modules/sort-app',
  'es6!.js/widgets/sort/components/sort-app.jsx',
], function(ReactRedux, actions, SortApp) {
  // actions
  const { setSort, setDirection } = actions;

  // mapping state to props
  const mapStateToProps = (state) => ({
    app: state, // state is available on sub-components as 'app'
  });

  // dispatch to props
  const mapDispatchToProps = (dispatch) => ({
    setSort: (value) => dispatch(setSort(value)),
    setDirection: () => dispatch(setDirection()),
  });

  return ReactRedux.connect(mapStateToProps, mapDispatchToProps)(SortApp);
});
