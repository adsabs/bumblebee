define([
  'underscore',
  'react',
  'redux',
  'react-redux',
  'es6!../redux/modules/resources-app',
  'es6!../components/resources-app.jsx'
], function (_, React, Redux, ReactRedux, actions, ResourcesApp) {

  // actions
  const {
    handleLinkClick,
    setModal
  } = actions;

  // mapping state to props
  const mapStateToProps = state => ({
    app: state.get('ResourcesApp') // state is available on sub-components as 'app'
  });

  // dispatch to props
  const mapDispatchToProps = dispatch => ({
    onLinkClick: link => dispatch(handleLinkClick(link)),
    setModal: val => dispatch(setModal(val))
  });

  return ReactRedux.connect(mapStateToProps, mapDispatchToProps)(ResourcesApp);
});
