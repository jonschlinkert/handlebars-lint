/*!
 * handlebars-lint <https://github.com/jonschlinkert/handlebars-lint>
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isObject = require('isobject');
var extend = require('extend-shallow');
var union = require('arr-union');

/**
 * Pass a context and a string with handlebars templates and lint for
 * missing variables, helpers, block helpers or partials.
 *
 * ```js
 * var lint = require('handlebars-lint');
 * lint(string, options);
 * ```
 * @param {String} `str` The string to lint.
 * @param {Object} `options` Pass a context on `options.context` or your own instance of handlebars on `options.hbs`.
 * @return {Object}
 * @api public
 */

module.exports = function(str, options) {
  var opts = extend({hbs: require('handlebars')}, options);
  var ast = opts.hbs.parse(str);
  var obj = filter(ast.body);
  return lint(obj, opts.context);
};

function filter(body, tokens) {
  tokens = tokens || {};
  var len = body.length;
  var idx = -1;

  while (++idx < len) {
    var node = body[idx];
    if (node.type === 'ContentStatement') {
      continue;
    }

    if (node.type === 'PartialStatement') {
      set(tokens, 'partials', node.name.parts[0]);
    }

    if (node.type === 'BlockStatement') {
      set(tokens, 'blockHelpers', node.path.parts[0]);
    }

    if (node.type === 'SubExpression' || node.type === 'MustacheStatement') {
      set(tokens, 'helpers', node.path.parts[0]);
    }

    if (node.type === 'PathExpression') {
      set(tokens, 'variables', node.parts[0]);
    }

    if (node.type === 'HashPair') {
      filter([node.value], tokens);
    }

    if (node.hasOwnProperty('program')) {
      filter(node.program.body, tokens);
    }
    if (node.hash) {
      filter(node.hash.pairs, tokens);
    }
    if (node.params) {
      filter(node.params, tokens);
    }
  }
  return tokens;
}

function set(tokens, key, val) {
  tokens[key] = union(tokens[key] || [], val);
}

function lint(tokens, context) {
  var report = {};
  for (var key in tokens) {
    if (tokens.hasOwnProperty(key)) {
      var actual = toArray(key, context);
      var expected = tokens[key];
      var len = expected.length;
      var idx = -1;
      while (++idx < len) {
        var name = expected[idx];
        if (actual.indexOf(name) === -1) {
          set(report, key, name);
        }
      }
    }
  }
  return report;
}

function toArray(key, context) {
  if (isObject(context[key])) {
    context[key] = Object.keys(context[key]);
  }
  if (isObject(context.variables)) {
    context.variables = Object.keys(context.variables);
  }
  if (isObject(context.helpers)) {
    context.helpers = Object.keys(context.helpers);
  }
  if (isObject(context.asyncHelpers)) {
    context.asyncHelpers = Object.keys(context.asyncHelpers);
  }
  if (key === 'variables' || key === 'helpers' || key === 'blockHelpers') {
    return union([], context.variables, context.helpers, context.asyncHelpers);
  }
  if (Array.isArray(context[key])) {
    return context[key];
  }
  return [];
}
