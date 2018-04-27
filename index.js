/*!
 * handlebars-lint <https://github.com/jonschlinkert/handlebars-lint>
 *
 * Copyright (c) 2016-2018, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

const union = require('arr-union');

/**
 * Pass a string with handlebars templates and an optional context to lint for
 * missing variables, helpers, block helpers or partials.
 *
 * ```js
 * const lint = require('handlebars-lint');
 * lint(string[, options]);
 * ```
 * @param {String} `str` The string to lint.
 * @param {Object} `options` Pass a context on `options.context` or your own instance of handlebars on `options.hbs`.
 * @return {Object}
 * @api public
 */

function lint(str, options) {
  const opts = Object.assign({ hbs: require('handlebars'), context: {} }, options);
  const ast = opts.hbs.parse(str);
  const obj = filter(ast.body);
  const report = createReport(obj, opts.context);
  if (report.variables) report.variables.sort();
  if (report.blockHelpers) report.blockHelpers.sort();
  if (report.partials) report.partials.sort();
  if (report.helpers) report.helpers.sort();
  return report;
}

function filter(body, tokens = {}) {
  for (const node of body) {
    if (node.type === 'ContentStatement') {
      continue;
    }

    if (node.type === 'PartialBlockStatement') {
      set(tokens, 'partialBlocks', node.name.parts[0]);
    }

    if (node.type === 'PartialStatement') {
      if (node.name.parts) {
        set(tokens, 'partials', node.name.parts[0]);
      } else if (node.name && node.name.type === 'SubExpression') {
        set(tokens, 'helpers', node.name.path.parts[0]);
      }
    }

    if (node.type === 'DecoratorBlock') {
      set(tokens, 'decoratorBlocks', node.path.parts[0]);
    }

    if (node.type === 'BlockStatement') {
      set(tokens, 'blockHelpers', node.path.parts[0]);
    }

    if (node.type === 'SubExpression' || node.type === 'MustacheStatement') {
      set(tokens, node.params.length || node.hash ? 'helpers' : 'variables', node.path.parts[0]);
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

    if (node.name && node.name.hash) {
      filter(node.name.hash.pairs, tokens);
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

function visit(node, fn) {
  fn(node);
  return node.nodes ? mapVisit(node, fn) : node;
}

function mapVisit(node, fn) {
  node.nodes.forEach(child => fn(child));
  return node;
}

function set(tokens, key, val) {
  tokens[key] = union(tokens[key] || [], val);
}

function createReport(tokens, context) {
  const report = {};

  for (const key of Object.keys(tokens)) {
    var actual = toArray(key, context);
    var expected = tokens[key];

    for (const name of expected) {
      if (!actual.includes(name)) {
        set(report, key, name);
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

function isObject(val) {
  return val && typeof val === 'object' && !Array.isArray(val);
}

module.exports = lint;
