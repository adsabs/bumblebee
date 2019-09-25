define([
  'es6!js/react/MyAdsDashboard/components/ClassicLoginForm.jsx',
  'react-redux',
  '../actions',
], function(ClassicLoginForm, { connect }, actions) {
  const mapStateToProps = ({ requests }) => ({
    classicMirrorsRequest: requests.FETCH_CLASSIC_MIRRORS,
    loginClassicRequest: requests.LOGIN_CLASSIC,
    loginClassicCheckRequest: requests.LOGIN_CLASSIC_CHECK,
  });

  const {
    goTo,
    fetchClassicMirrors,
    loginClassic,
    loginClassicCheck,
  } = actions;

  const actionCreators = {
    goTo,
    fetchClassicMirrors,
    loginClassic,
    loginClassicCheck,
  };

  return connect(mapStateToProps, actionCreators)(ClassicLoginForm);
});
