define([
  'es6!js/react/MyAdsDashboard/components/SelectTemplate.jsx',
  'react-redux',
  'js/react/MyAdsDashboard/actions/index'
], function(
  SelectTemplate,
  {connect},
  actions
) {

  const mapStateToProps = ({}) => ({});

  const {
    goTo
  } = actions;

  const actionCreators = {
    goTo
  };

  return connect(mapStateToProps, actionCreators)(SelectTemplate);
});
