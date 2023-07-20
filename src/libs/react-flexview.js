(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FlexView = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var React = require("react");
var PropTypes = require("prop-types");
function warn(warning) {
    if (process.env.NODE_ENV !== "production") {
        console.warn(warning); // eslint-disable-line no-console
    }
}
function some(array, predicate) {
    return array.filter(predicate).length > 0;
}
var FlexViewInternal = /** @class */ (function (_super) {
    __extends(FlexViewInternal, _super);
    function FlexViewInternal() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FlexViewInternal.prototype.componentDidMount = function () {
        this.logWarnings();
    };
    FlexViewInternal.prototype.logWarnings = function () {
        var _a = this.props, basis = _a.basis, shrink = _a.shrink, grow = _a.grow, hAlignContent = _a.hAlignContent, vAlignContent = _a.vAlignContent, children = _a.children, column = _a.column;
        if (basis === "auto") {
            warn('basis is "auto" by default: forcing it to "auto"  will leave "shrink:true" as default');
        }
        if ((shrink === false || shrink === 0) &&
            (grow === true || (typeof grow === "number" && grow > 0))) {
            warn('passing both "grow" and "shrink={false}" is a no-op!');
        }
        if (process.env.NODE_ENV !== "production" &&
            typeof children !== "undefined" &&
            !column &&
            hAlignContent === "center") {
            var atLeastOneChildHasHMarginAuto = some([].concat(children), function (child) {
                var props = (typeof child === "object" && child !== null
                    ? child.props
                    : undefined) || {};
                var style = props.style || {};
                var marginLeft = style.marginLeft || props.marginLeft;
                var marginRight = style.marginRight || props.marginRight;
                return marginLeft === "auto" && marginRight === "auto";
            });
            atLeastOneChildHasHMarginAuto &&
                warn('In a row with hAlignContent="center" there should be no child with marginLeft and marginRight set to "auto"\nhttps://github.com/buildo/react-flexview/issues/30');
        }
        if (process.env.NODE_ENV !== "production" &&
            typeof children !== "undefined" &&
            column &&
            vAlignContent === "center") {
            var atLeastOneChildHasVMarginAuto = some([].concat(children), function (child) {
                var props = (typeof child === "object" && child !== null
                    ? child.props
                    : undefined) || {};
                var style = props.style || {};
                var marginTop = style.marginTop || props.marginTop;
                var marginBottom = style.marginBottom || props.marginBottom;
                return marginTop === "auto" && marginBottom === "auto";
            });
            atLeastOneChildHasVMarginAuto &&
                warn('In a column with vAlignContent="center" there should be no child with marginTop and marginBottom set to "auto"\nhttps://github.com/buildo/react-flexview/issues/30');
        }
    };
    FlexViewInternal.prototype.getGrow = function () {
        var grow = this.props.grow;
        if (typeof grow === "number") {
            return grow;
        }
        else if (grow) {
            return 1;
        }
        return 0; // default
    };
    FlexViewInternal.prototype.getShrink = function () {
        var _a = this.props, shrink = _a.shrink, basis = _a.basis;
        if (typeof shrink === "number") {
            return shrink;
        }
        else if (shrink) {
            return 1;
        }
        else if (shrink === false) {
            return 0;
        }
        if (basis && basis !== "auto") {
            return 0;
        }
        return 1; // default
    };
    FlexViewInternal.prototype.getBasis = function () {
        var basis = this.props.basis;
        if (basis) {
            var suffix = typeof basis === "number" ||
                String(parseInt(basis, 10)) === basis
                ? "px"
                : "";
            return basis + suffix;
        }
        return "auto"; // default
    };
    FlexViewInternal.prototype.getStyle = function () {
        var _a = this.props, column = _a.column, wrap = _a.wrap, vAlignContent = _a.vAlignContent, hAlignContent = _a.hAlignContent;
        var style = {
            width: this.props.width,
            height: this.props.height,
            marginLeft: this.props.marginLeft,
            marginTop: this.props.marginTop,
            marginRight: this.props.marginRight,
            marginBottom: this.props.marginBottom
        };
        function alignPropToFlex(align) {
            switch (align) {
                case "top":
                case "left":
                    return "flex-start";
                case "center":
                    return "center";
                case "bottom":
                case "right":
                    return "flex-end";
            }
        }
        return __assign(__assign({ boxSizing: "border-box", 
            // some browsers don't set these by default on flex
            minWidth: 0, minHeight: 0, 
            // flex properties
            display: "flex", flexDirection: column ? "column" : "row", flexWrap: wrap ? "wrap" : "nowrap", flex: this.getGrow() + " " + this.getShrink() + " " + this.getBasis(), justifyContent: alignPropToFlex(column ? vAlignContent : hAlignContent), alignItems: alignPropToFlex(column ? hAlignContent : vAlignContent) }, style), this.props.style);
    };
    FlexViewInternal.prototype.getDivProps = function () {
        var _a = this.props, children = _a.children, className = _a.className, style = _a.style, column = _a.column, grow = _a.grow, shrink = _a.shrink, basis = _a.basis, wrap = _a.wrap, vAlignContent = _a.vAlignContent, hAlignContent = _a.hAlignContent, width = _a.width, height = _a.height, marginBottom = _a.marginBottom, marginTop = _a.marginTop, marginLeft = _a.marginLeft, marginRight = _a.marginRight, divRef = _a.divRef, rest = __rest(_a, ["children", "className", "style", "column", "grow", "shrink", "basis", "wrap", "vAlignContent", "hAlignContent", "width", "height", "marginBottom", "marginTop", "marginLeft", "marginRight", "divRef"]);
        return rest;
    };
    FlexViewInternal.prototype.render = function () {
        return (React.createElement("div", __assign({ ref: this.props.divRef, className: this.props.className, style: this.getStyle() }, this.getDivProps()), this.props.children));
    };
    FlexViewInternal.propTypes = {
        children: PropTypes.node,
        column: PropTypes.bool,
        vAlignContent: PropTypes.oneOf(["top", "center", "bottom"]),
        hAlignContent: PropTypes.oneOf(["left", "center", "right"]),
        marginLeft: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        marginTop: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        marginRight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        marginBottom: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        grow: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
        shrink: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
        basis: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        wrap: PropTypes.bool,
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        className: PropTypes.string,
        style: PropTypes.object
    };
    return FlexViewInternal;
}(React.Component));
exports.FlexViewInternal = FlexViewInternal;
exports.FlexView = React.forwardRef(function (props, ref) { return React.createElement(FlexViewInternal, __assign({}, props, { divRef: ref })); });
exports["default"] = exports.FlexView;

}).call(this,require('_process'))
},{"_process":1,"prop-types":"prop-types","react":"react"}],3:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var FlexView_1 = require("./FlexView");
exports["default"] = FlexView_1.FlexView;

},{"./FlexView":2}]},{},[3])(3)
});
