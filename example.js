'use strict';

var parse = require('./');

var str = [
  'foo',
  '{{upper "bar"}}',
  '{{baz}}',
  'qux',
  '{{abc (sub blah)}}',
  '{{> onetwo (three blah)}}',
  '{{> four five}}',
  '{{#markdown foo}}',
  '> bar',
  '{{lower whatever}}',
  '{{/markdown}}'
].join('\n');

var res = parse(str);
console.log(res)
