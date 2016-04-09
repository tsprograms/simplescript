/*
This file created on 4/9/16 by TSPrograms.
Copyright © 2016 TSPrograms.
*/

// Enclose code in an anonymous function to prevent implicit globals.
(function() {
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
      else if (codeString.charAt(i) === ')' && (/\s|$/).test(codeString.charAt(i + 1))) {
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
  var execute = function(tokenized) {
    if (tokenized.length === 0) {
      return;
    }
    if (tokenized.length === 1) {
      return execute(tokenized[0]);
    }
    var specials = ['=', ':', '?', '?..', ">>", "<<"];
    var TRUE = " ";
    var FALSE = "";
    var call = function(funcName, args) {
      if (functions.hasOwnProperty(funcName)) {
        return functions[funcName].apply(this, args);
      }
      else {
        return FALSE;
      }
    };
    var variables = {};
    var functions = {
      "=": function(key, val) {
        variables[key] = val;
        return TRUE;
      },
      ":": function(key) {
        if (variables.hasOwnProperty(key)) {
          return variables[key];
        }
        else {
          return FALSE;
        }
      },
      "!": function(val) {
        return val === FALSE ? TRUE : FALSE;
      },
      "?": function(condition, action, elseAction) {
        if (condition !== FALSE) {
          if (typeof action !== 'undefined') {
            return call(action, [condition]);
          }
          else {
            return TRUE;
          }
        }
        else {
          if (typeof elseAction !== 'undefined') {
            return call(elseAction, [condition]);
          }
          else {
            return FALSE;
          }
        }
      },
      "?..": function(condition, action) {
        while (condition !== FALSE) {
          if (typeof action !== 'undefined') {
            call(action, [condition]);
          }
        }
      },
      ">>": function(output) {
        window.alert(output);
      },
      "<<": function() {
        return window.prompt('<<input>>');
      }
    };
    var evaluate = function(tokenized) {
      if (!(tokenized instanceof window.Array)) {
        return '' + tokenized;
      }
      var func = tokenized[0];
      tokenized.shift();
      for (var i = 0; i < tokenized.length; ++i) {
        tokenized[i] = evaluate(tokenized);
      }
      return call(func, tokenized);
    };
    return evaluate(tokenized);
  };
  var runCode = function(codeString) {
    return execute(tokenize(codeString));
  };
  
  window.simpleScript = {};
  window.simpleScript.run = function(codeString) {
    return runCode(codeString);
  };
  window.simpleScript._tokenize = tokenize;
  window.simpleScript._execute  = execute;
  window.simpleScript._runCode  = runCode;
})();
