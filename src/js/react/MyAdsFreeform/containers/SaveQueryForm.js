define([
  'es6!../components/SaveQueryForm.jsx',
  'react-redux',
  '../actions',
], function(SaveQueryForm, { connect }, actions) {
  const mapStateToProps = ({ requests }) => ({
    requests: {
      addNotification: requests.ADD_NOTIFICATION,
    },
  });

  const {} = actions;

  const actionCreators = {};

  return connect(mapStateToProps, actionCreators)(SaveQueryForm);
});
