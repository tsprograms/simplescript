/*
This file created on 4/9/16 by TSPrograms.
Copyright © 2016 TSPrograms.
*/

(function() {
  var out = function(output) {
    window.alert(output);
    return true;
  };
  var in = function(msg) {
    return window.prompt(msg);
  };
  
  var Context = function() {
    var undefined;
    var RESERVED = ['=', ':', '?', '?..', '>>', '<<', '+', '++', 'true', 'false', 'nil'];
    var isTruthy = function(val) {
      return !!val;
    };
    var call = function(funcName, args) {
      if (typeof variables[funcName] === 'function') {
        return variables[funcName].apply(variables, args);
      }
      return undefined;
    };
    var variables = {
      "=": function(key, val) {
        if (typeof key === 'string' && typeof val === 'string' && RESERVED.indexOf(key) === -1) {
          variables[key] = val;
          return true;
        }
        return undefined;
      },
      ":": function(key) {
        if (typeof key == 'string' && variables.hasOwnProperty(key)) {
          return variables[key];
        }
        else {
          return false;
        }
      },
      "!": function(val) {
        return !isTruthy(val);
      },
      "?": function(condition, action, elseAction) {
        if (isTruthy(condition)) {
          if (typeof action === 'function') {
            return call(action, [condition]);
          }
          else {
            return true;
          }
        }
        else {
          if (typeof elseAction === 'function') {
            return call(elseAction, [condition]);
          }
          else {
            return false;
          }
        }
      },
      "?..": function(condition, action) {
        var result = undefined;
        while (isTruthy(condition)) {
          if (typeof action === 'function') {
            result = call(action, [condition]);
          }
        }
        return result;
      },
      ">>": function(output) {
        return out(output);
      },
      "<<": function(msg) {
        return in(msg);
      },
      "+": function() {
        var sum = arguments[0];
        var origType = typeof sum;
        if (origType === 'number' || origType === 'string') {
          for (var i = 1; i < arguments.length; ++i) {
            if (typeof arguments[i] !== origType) {
              return undefined;
            }
            sum += arguments[i];
          }
          return sum;
        }
        return undefined;
      },
      "++": function(func1, func2) {
        if (typeof func1 !== 'function' || typeof func2 !== 'function') {
          return undefined;
        }
        return (function() {
          func1.apply(variables, arguments);
          return func2.apply(variables, arguments);
        });
      },
      "true": true,
      "false": false,
      "nil": undefined
    };
    
    this.call = call;
    this._vars = variables;
  };
})();
