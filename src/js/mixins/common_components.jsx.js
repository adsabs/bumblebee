'use strict';
define([
  'react'
],
function (React) {

  var exports = {

    /**
     * Create the Loading Icon
     *
     * Only shown when *show* is true
     * @param props
     * @returns {XML}
     * @constructor
     */
    LoadingIcon: function LoadingIcon(props) {
      if (!props.show) {
        return null;
      }

      return (
        <span>
          <i className="icon-loading" aria-hidden="true"></i> Loading...
        </span>
      );
    },

    ErrorMessage: function ErrorMessage(props) {
      var options = props.options;

      if (!options || !options.show) {
        return null;
      }
      options.type = options.type || 'danger';

      return (
        <div className={'alert alert-' + options.type}>
          <i className="fa fa-exclamation-triangle fa-1x" aria-hidden="true"></i>
          &nbsp;
          <strong>OOPS!</strong>
          <p>{options.message}</p>
        </div>
      );
    }
  };

  return exports;
});
