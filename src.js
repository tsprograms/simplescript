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
  var getType = function(val) {
    switch (typeof val) {
      case 'function':
        return 'function';
      case 'undefined':
        return 'nil';
      case 'boolean':
        return 'boolean';
      case 'string':
        return 'string';
      case 'object':
        if (val instanceof window.Array) {
          return 'list';
        }
        return 'nil';
    }
  };
  var getString = function(val) {
    switch (getType(val)) {
      case 'function':
        return '( function )';
      case 'nil':
        return '( nil )';
      case 'list':
        var result = '[ ';
        for (var i = 0; i < val.length; ++i) {
          if (i !== 0) {
            result += ', ';
          }
          result += getString(val[i]);
        }
        return result + ' ]';
      default:
        return '' + val;
    }
  };
  var Context = function() {
    var undefined;
    var isTruthy = function(val) {
      return !!val;
    };
    var call = function(funcName, args) {
      if (typeof funcName === 'function') {
        return funcName.apply(variables, args);
      }
      else if (typeof variables[funcName] === 'function') {
        return variables[funcName].apply(variables, args);
      }
      return undefined;
    };
    var variables = {
      "=": function(key, val) {
        if (typeof key === 'string' && RESERVED.indexOf(key) === -1) {
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
        var loopCount = 0;
        var isTrue;
        while (isTruthy(isTrue = condition(loopCount))) {
          if (typeof action === 'function') {
            result = action.call(variables, isTrue);
          }
          if (loopCount >= 65536) {
            throw 'SimpleScript: ResponseError: Maximum loop count exceeded (65535)';
          }
          ++loopCount;
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
      "-": function() {
        for (var i = 0; i < arguments.length; ++i) {
          if (typeof arguments[i] !== 'number') {
            return undefined;
          }
          sum -= arguments[i];
        }
        return sum;
      },
      "++": function() {
        return arguments[arguments.length - 1];
      },
      '"': function(val) {
        val = getString(val);
        for (var i = 1; i < arguments.length; i++) {
          val += ' ' + getString(arguments[i]);
        }
        return val;
      },
      "==": function() {
        var orig = arguments[0];
        for (var i = 1; i < arguments.length; ++i) {
          if (arguments[i] !== orig) {
            return false;
          }
        }
        return true;
      },
      "!=": function() {
        var orig = arguments[0];
        for (var i = 1; i < arguments.length; ++i) {
          if (arguments[i] === orig) {
            return false;
          }
        }
        return true;
      },
      "*": function() {
        var first = arguments[0];
        if (typeof first === 'string' && typeof arguments[1] === 'number') {
          return (new Array(arguments[1] + 1)).join(first);
        }
        else if (typeof first === 'number') {
          var product = first;
          for (var i = 1; i < arguments.length; i++) {
            if (typeof arguments[i] !== 'number') {
              return undefined;
            }
            product *= arguments[i];
          }
          if (!window.isNaN(product)) {
            return product;
          }
        }
        return undefined;
      },
      ">": function(val1, val2) {
        if (typeof val1 === 'number' && typeof val2 === 'number') {
          return val1 > val2;
        }
        return undefined;
      },
      ">=": function(val1, val2) {
        if (typeof val1 === 'number' && typeof val2 === 'number') {
          return val1 >= val2;
        }
        return undefined;
      },
      "<": function(val1, val2) {
        if (typeof val1 === 'number' && typeof val2 === 'number') {
          return val1 < val2;
        }
        return undefined;
      },
      "<=": function(val1, val2) {
        if (typeof val1 === 'number' && typeof val2 === 'number') {
          return val1 <= val2;
        }
        return undefined;
      },
      "/": function(val1, val2) {
        if (typeof val1 === 'number' && typeof val2 === 'number') {
          var result = (val1 / val2);
          if (!window.isNaN(result)) {
            return result;
          }
        }
        return undefined;
      },
      "%": function(val1, val2) {
        if (typeof val1 === 'number' && typeof val2 === 'number') {
          return val1 % val2; // Trailing decmals are cut off
        }
        return undefined;
      },
      "&": function() {
        for (var i = 0; i < arguments.length; ++i) {
          if (!isTruthy(arguments[i])) {
            return false;
          }
        }
        return true;
      },
      "|": function() {
        for (var i = 0; i < arguments.length; ++i) {
          if (isTruthy(arguments[i])) {
            return true;
          }
        }
        return false;
      },
      "^": function(number, power) {
        if (typeof number === 'number' && typeof 'power' === 'number') {
          var result = window.Math.pow(number, power);
          if (!window.isNaN(result)) {
            return result;
          }
        }
        return undefined;
      },
      "√": function(number, rootPower) {
        var result = undefined;
        if (typeof number === 'number') {
          if (typeof rootPower !== 'undefined') {
            if (typeof rootPower === 'number') {
              result = window.Math.pow(number, 1/rootPower);
            }
          }
          else {
            result = window.Math.sqrt(number);
          }
        }
        if (window.isNaN(result)) {
          return undefined;
        }
        return result;
      },
      '[]': function() {
        return window.Array.prototype.slice.call(arguments);
      },
      "true": true,
      "false": false,
      "nil": undefined
    };
    var RESERVED = Object.keys(variables); // All above presets are reserved
    
    this.call = call;
    this._vars = variables;
  };
  var context = new Context();
  var tokenize = function(codeString) {
    codeString = ('' + codeString).trim(); // Make sure codeString is a string.
    var levels = 0;
    var tokenized = [''];
    var index = 0;
    var containsParts = codeString.charAt(0) === '(' || (/\s/).test(codeString);
    if (!containsParts) {
      return codeString;
    }
    if (codeString.charAt(0) === '(' && codeString.charAt(codeString.length - 1) === ')') {
      codeString = codeString.slice(1, -1);
    }
    for (var i = 0; i < codeString.length; ++i) {
      if ((tokenized[index] === '' || (/\s|\)/).test(codeString.charAt(i - 1))) && codeString.charAt(i) === '(') {
        ++levels;
      }
      else if (codeString.charAt(i) === ')' && (/\s|\)|(^$)/).test(codeString.charAt(i + 1))) {
        --levels;
      }
      if (levels === 0 && (/\s/).test(codeString.charAt(i))) {
        ++index;
        tokenized[index] = '';
      }
      else {
        tokenized[index] += codeString.charAt(i);
      }
    }
    if (levels !== 0) {
      throw "SimpleScript: ParseError: Unmatched parenthesis"
    }
    var retokenized = [];
    for (var i = 0; i < tokenized.length; ++i) {
      if (tokenized[i] !== '') {
        retokenized.push(tokenize(tokenized[i]));
      }
    }
    return retokenized;
  };
  var escape = function(letter) {
    switch (letter) {
      case 'b': return '\b';
      case 'f': return '\f';
      case 'n': return '\n';
      case 'r': return '\r';
      case 's': return ' ';
      case 't': return '\t';
      default: return letter;
    }
  };
  
  var evaluate = function(tokenized, args) {
    if (!(tokenized instanceof window.Array)) {
      var token = '' + tokenized;
      if ((/^(-?)([0-9]*)(\.?)([0-9]+)$/).test(token)) {
        if ((/^(-?)([0-9]+)$/).test(token)) {
          token = window.parseInt(token, 10);
        }
        else {
          token = window.parseFloat(token);
        }
      }
      else {
        var oldToken = token;
        token = '';
        for (var i = 0; i < oldToken.length; ++i) {
          if (oldToken.charAt(i) === '\\') {
            token += escape(oldToken.charAt(i + 1));
            ++i;
          }
          else {
            token += oldToken.charAt(i);
          }
        }
      }
      return token;
    }
    if (tokenized.length === 1) {
      return evaluate(tokenized[0], args);
    }
    switch (tokenized[0]) {
      case "'":
        var firstArg = tokenized[1];
        return (function() {
          var tempFirstArg = firstArg.slice(0);
          return evaluate(tempFirstArg, arguments);
        });
      case '::':
        var evaled = evaluate(tokenized[1], args);
        if (typeof evaled === 'number') {
          return args[evaled];
        }
        return undefined;
      default:
        var func = evaluate(tokenized[0], args);
        tokenized.shift();
        for (var i = 0; i < tokenized.length; ++i) {
          tokenized[i] = evaluate(tokenized[i], args);
        }
        return context.call(func, tokenized);
    }
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
      result = execute(tokenize('(' + codeString[i].trim() + ')'), reuseContext || i !== 0, args);
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
