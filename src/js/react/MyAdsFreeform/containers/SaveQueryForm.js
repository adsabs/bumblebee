define([
  'es6!js/react/MyAdsFreeform/components/SaveQueryForm.jsx.js',
  'react-redux',
  'js/react/MyAdsFreeform/actions',
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
