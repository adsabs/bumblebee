define([
  'es6!js/react/MyAdsDashboard/components/GeneralForm.jsx',
  'react-redux',
  '../actions',
  '../constants',
], function(GeneralForm, { connect }, actions, { page }) {
  const mapStateToProps = ({
    requests,
    notifications,
    editingNotification,
  }) => ({
    requests: {
      updateNotification: requests.UPDATE_NOTIFICATION,
      getQuery: requests.GET_QUERY,
    },
    editingNotification,
    notifications,
  });

  const { goTo, updateNotification, getQuery } = actions;

  const actionCreators = {
    updateNotification,
    getQuery,
    onSuccess: () => goTo(page.DASHBOARD),
    onCancel: () => goTo(page.DASHBOARD),
  };

  return connect(mapStateToProps, actionCreators)(GeneralForm);
});
