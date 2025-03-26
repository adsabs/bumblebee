define([
  'underscore',
  'react-redux',
  'es6!js/widgets/resources/redux/modules/ui',
  'es6!js/widgets/resources/components/app.jsx',
], function(_, ReactRedux, ui, App) {
  // actions
  const { handleLinkClick, handleResetClick } = ui;

  // mapping state to props
  const mapStateToProps = (state) => ({
    loading: state.ui.loading,
    noResults: state.ui.noResults,
    hasError: state.ui.hasError,
    fullTextSources: state.ui.fullTextSources,
    dataProducts: state.ui.dataProducts,
  });

  // dispatch to props
  const mapDispatchToProps = (dispatch) => ({
    onLinkClick: (source, link) => dispatch(handleLinkClick(source, link)),
  });

  return ReactRedux.connect(mapStateToProps, mapDispatchToProps)(App);
});
