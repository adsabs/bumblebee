define([
  'es6!js/react/MyAdsDashboard/components/CitationsForm.jsx',
  'react-redux',
  'js/react/MyAdsDashboard/actions/index',
  'js/react/MyAdsDashboard/constants',
], function(CitationsForm, { connect }, actions, { page }) {
  const mapStateToProps = ({
    requests,
    notifications,
    editingNotification,
  }) => ({
    addNotificationRequest: requests.ADD_NOTIFICATION,
    updateNotificationRequest: requests.UPDATE_NOTIFICATION,
    editingNotification,
    notifications,
  });

  const { addNotification, updateNotification, goTo } = actions;

  const actionCreators = {
    addNotification: (notification) =>
      addNotification({
        ...notification,
        template: 'citations',
        type: 'template',
      }),
    updateNotification,
    onSuccess: () => goTo(page.DASHBOARD),
    onCancel: () => goTo(page.DASHBOARD),
  };
  return connect(mapStateToProps, actionCreators)(CitationsForm);
});
