define([
  'es6!js/react/MyAdsDashboard/components/Dashboard.jsx',
  'react-redux',
  '../actions',
  '../constants',
], function(Dashboard, { connect }, actions, { page }) {
  const mapStateToProps = ({ notifications, requests }) => ({
    notifications,
    getNotificationsRequest: requests.GET_NOTIFICATIONS,
    updateNotificationRequest: requests.UPDATE_NOTIFICATION,
    removeNotificationRequest: requests.REMOVE_NOTIFICATION,
    getNotificationRequest: requests.GET_NOTIFICATION,
  });

  const {
    updateNotification,
    getNotifications,
    getNotification,
    removeNotification,
    goTo,
    toggleActive,
    importNotifications,
    runQuery,
  } = actions;

  const actionCreators = {
    updateNotification,
    getNotifications,
    getNotification,
    removeNotification,
    toggleActive,
    importNotifications,
    runQuery,
    editNotification: (id) => getNotification(id),
    createNewNotification: () => goTo(page.SELECT_TEMPLATE),
  };

  return connect(mapStateToProps, actionCreators)(Dashboard);
});
