'use strict';

var lint = require('./');

var str = [
  'Title: {{upper foo}}',
  '',
  'Hi, my name is {{proper name}}',
].join('\n');

var missing = lint(str, {
  context: {
    helpers: {
      upper: function() {},
      proper: function() {},
    },
    variables: {
      name: 'Brian'
    }
  }
});
console.log(missing);

// var str = [
//   'foo',
//   '{{upper "bar"}}',
//   '{{upper varname}}',
//   '{{baz}}',
//   '{{zzz name=name}}',
//   'qux',
//   '{{abc (sub blah)}}',
//   '{{> onetwo (three blah)}}',
//   '{{> four five}}',
//   '{{#markdown foo}}',
//   '> bar',
//   '{{> six (seven eight)}}',
//   '{{lower whatever}}',
//   '{{/markdown}}',
//   'bar'
// ].join('\n');

// var missing = lint(str, {
//   context: {
//     helpers: {
//       upper: function() {},
//       lower: function() {},
//     },
//     variables: {
//       name: 'Brian'
//     }
//   }
// });
// console.log(missing);
