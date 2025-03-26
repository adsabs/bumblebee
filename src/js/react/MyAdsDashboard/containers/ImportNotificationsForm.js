define([
  'es6!js/react/MyAdsDashboard/components/ImportNotificationsForm.jsx',
  'react-redux',
  'js/react/MyAdsDashboard/actions/index',
  'js/react/MyAdsDashboard/constants',
], function(ImportNotificationsForm, { connect }, actions, { page }) {
  const mapStateToProps = ({ requests }) => ({
    importClassicRequest: requests.IMPORT_CLASSIC,
  });

  const { goTo, importClassic } = actions;

  const actionCreators = {
    onSuccess: () => goTo(page.DASHBOARD),
    importClassic,
  };

  return connect(mapStateToProps, actionCreators)(ImportNotificationsForm);
});
