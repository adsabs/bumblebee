'use strict';
define([], function () {
 var exports = {
   triggerPageManagerEvent: function (event, obj) {
     return function (dispatch, getState, ctx) {
       return ctx.trigger('page-manager-event', event, obj);
     };
   }
 };

 return exports;
});
