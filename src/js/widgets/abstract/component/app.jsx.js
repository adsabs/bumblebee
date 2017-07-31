'use strict';
define([
  '../actions',
  'react',
  'react-redux',
  'es6!./abstract.jsx',
  'es6!js/mixins/common_components.jsx'
], function (actions, React, ReactRedux, Abstract, common) {

  var App = React.createClass({
    render: function () {
      return (
        <article className="s-abstract-metadata">
          <common.LoadingIcon show={this.props.isLoading}/>
          <common.ErrorMessage options={this.props.error}/>
          <Abstract docs={this.props.docs}/>
        </article>
      );
    }
  });

  var mapStateToProps = function (state) {
    return {
      docs: state.docs,
      isLoading: state.loading,
      error: state.error
    };
  };

  var mapDispatchToProps = function () {
    return {};
  };

  return ReactRedux.connect(mapStateToProps, mapDispatchToProps)(App);
});
