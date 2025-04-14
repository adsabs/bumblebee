define([
  'es6!js/react/MyAdsDashboard/components/AuthorsForm.jsx',
  'react-redux',
  '../actions',
  '../constants',
], function(KeywordForm, { connect }, actions, { page }) {
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
        template: 'authors',
        type: 'template',
      }),
    updateNotification,
    onSuccess: () => goTo(page.DASHBOARD),
    onCancel: () => goTo(page.DASHBOARD),
  };
  return connect(mapStateToProps, actionCreators)(KeywordForm);
});
