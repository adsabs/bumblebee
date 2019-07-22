
define([
  'react-redux',
  'es6!../redux/modules/orcid-selector-app',
  'es6!../components/orcid-selector-app.jsx'
], function (ReactRedux, actions, OrcidSelectorApp) {
  // actions
  const {
    sendEvent
  } = actions;

  // mapping state to props
  const mapStateToProps = state => ({
    app: state // state is available on sub-components as 'app'
  });

  // dispatch to props
  const mapDispatchToProps = dispatch => ({
    onClaim: () => dispatch(sendEvent('orcid-bulk-claim')),
    onDelete: () => dispatch(sendEvent('orcid-bulk-delete')),
    onUpdate: () => dispatch(sendEvent('orcid-bulk-update'))
  });

  return ReactRedux.connect(mapStateToProps, mapDispatchToProps)(OrcidSelectorApp);
});
