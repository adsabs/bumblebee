define([
  'es6!js/react/MyAdsDashboard/components/ArxivForm.jsx',
  'react-redux',
  'js/react/MyAdsDashboard/actions/index',
  'js/react/MyAdsDashboard/constants',
], function(ArxivForm, { connect }, actions, { page }) {
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

  const { addNotification, goTo, updateNotification } = actions;

  const actionCreators = {
    addNotification: (notification) =>
      addNotification({ ...notification, template: 'arxiv', type: 'template' }),
    updateNotification,
    onSuccess: () => goTo(page.DASHBOARD),
    onCancel: () => goTo(page.DASHBOARD),
  };

  return connect(mapStateToProps, actionCreators)(ArxivForm);
});
