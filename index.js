/*!
 * handlebars-lint <https://github.com/jonschlinkert/handlebars-lint>
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var hbs = require('handlebars');

module.exports = function(str, options) {
  var ast = hbs.parse(str);
  return filter(ast.body);
};

function filter(body, arr) {
  var len = body.length;
  var idx = -1;
  arr = arr || { variables: [], blockHelpers: [] };

  while (++idx < len) {
    var node = body[idx];
    if (node.type === 'ContentStatement') {
      continue;
    }

    if (node.type === 'MustacheStatement') {
      arr.variables.push(node.path.parts[0]);
    }
    if (node.type === 'BlockStatement') {
      arr.blockHelpers.push(node.path.parts[0]);
    }
    if (node.type === 'SubExpression') {
      arr.variables.push(node.path.parts[0]);
    }

    if (node.hasOwnProperty('program')) {
      filter(node.program.body, arr);
    }
    if (node.params) {
      filter(node.params, arr);
    }
  }
  return arr;
}
