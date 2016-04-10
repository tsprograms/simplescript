/*
This file created on 4/9/16 by TSPrograms.
Copyright © 2016 TSPrograms.
*/

(function() {
  var outFunc = function(output) {
    window.alert(output);
    return true;
  };
  var inFunc = function(msg) {
    return window.prompt(msg);
  };
  var getString = function(val) {
    switch (typeof val) {
      case 'function':
        return '( function )';
      case 'undefined':
        return '( nil )';
      default:
        return '' + val;
    }
  };
  var Context = function() {
    var undefined;
    var RESERVED = ['=', ':', '?', '?..', '>>', '<<', '+', '++', '::', "'", 'true', 'false', 'nil'];
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
          return undefined;
        }
      },
      "!": function(val) {
        return !isTruthy(val);
      },
      "?": function(condition, action, elseAction) {
        if (isTruthy(condition)) {
          if (typeof action === 'function') {
            return action.call(variables, condition);
          }
          else {
            return true;
          }
        }
        else {
          if (typeof elseAction === 'function') {
            return elseAction.call(variables, condition);
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
            result = action.call(variables, condition);
          }
        }
        return result;
      },
      ">>": function(output) {
        return outFunc(getString(output));
      },
      "<<": function(msg) {
        var input = inFunc(msg);
        return input === null ? undefined : input;
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
      "++": function() {
        var args = arguments;
        for (var i = 0; i < args.length; ++i) {
          if (typeof args[i] !== 'function') {
            return undefined;
          }
        }
        return (function() {
          var result = undefined;
          for (var i = 0; i < args.length; i++) {
            result = args[i].apply(variables, arguments);
          }
          return result;
        });
      },
      "true": true,
      "false": false,
      "nil": undefined
    };
    
    this.call = call;
    this._vars = variables;
  };
  var context = new Context();
  var tokenize = function(codeString) {
    codeString += ''; // Make sure codeString is a string.
    var levels = 0;
    var tokenized = [''];
    var index = 0;
    var containsParts = codeString.charAt(0) === '(' || (/\s/).test(codeString);
    if (!containsParts) {
      return codeString;
    }
    for (var i = 0; i < codeString.length; ++i) {
      if (levels === 0 && (/\s/).test(codeString.charAt(i))) {
        ++index;
        tokenized[index] = '';
      }
      else if (tokenized[index] === '' && codeString.charAt(i) === '(') {
        ++levels;
      }
      else if (codeString.charAt(i) === ')' && (/\s|$|\)/).test(codeString.charAt(i + 1))) {
        --levels;
      }
      else {
        tokenized[index] += codeString.charAt(i);
      }
    }
    var retokenized = [];
    for (var i = 0; i < tokenized.length; ++i) {
      if (tokenized[i] !== '') {
        retokenized.push(tokenize(tokenized[i]));
      }
    }
    return retokenized;
  };
  var evaluate = function(tokenized, args) {
    if (!(tokenized instanceof window.Array)) {
      var token = '' + tokenized;
      if (!(/[^0-9]/).test(token)) {
        token = window.parseInt(token, 10);
      }
      else {
        token = token.replace('\\s', ' ').replace('\\n', '\n').replace('\\r', '\r').replace('\\f', '\f').replace('\\\\', '\\');
      }
      return token;
    }
    if (tokenized.length === 1) {
      return evaluate(tokenized[0]);
    }
    if (tokenized[0] === "'") {
      var firstArg = tokenized[1];
      return (function() {
        return evaluate(firstArg, arguments);
      });
    }
    else if (tokenized[0] === '::') {
      var evaled = evaluate(tokenized[1]);
      if (typeof evaled === 'number') {
        return args[evaled];
      }
      return undefined;
    }
    var func = evaluate(tokenized[0]);
    tokenized.shift();
    for (var i = 0; i < tokenized.length; ++i) {
      tokenized[i] = evaluate(tokenized[i]);
    }
    return context.call(func, tokenized);
  };
  var execute = function(tokenized, useOldEnv, args) {
    if (!useOldEnv) {
      context = new Context();
    }
    if (tokenized.length === 0) {
      throw 'SimpleScript: ParseError: tokenized.length is 0';
    }
    if (tokenized.length === 1 && typeof tokenized !== 'string') {
      return execute(tokenized[0], useOldEnv, args);
    }
    return evaluate(tokenized, args);
  };
  var runCode = function(codeString, argIn, argOut, args, reuseContext) {
    inFunc  = (typeof argIn  === 'function') ? argIn  : (function(output) { window.alert(output); return true; });
    outFunc = (typeof argOut === 'function') ? argOut : (function(msg) { return window.prompt(msg); });
    args = args || [];
    codeString = (codeString + '').split(';');
    var result = undefined;
    for (var i = 0; i < codeString.length; ++i) {
      result = execute(tokenize(codeString[i].trim()), reuseContext || i !== 0, args);
    }
    return result;
  };
  
  window.simpleScript = {
    run: function() {
      return runCode.apply(this, arguments);
    },
    valToString: function(val) {
      return getString(val);
    }
  };
})();
