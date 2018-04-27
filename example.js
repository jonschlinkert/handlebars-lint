'use strict';

const lint = require('./');
const str = `
foo
{{upper "bar"}}
{{upper varname}}
{{baz}}
{{zzz name=name}}
qux
{{abc (sub blah)}}
{{> onetwo (three blah)}}
{{> four five}}
{{#markdown foo}}
> bar
{{> six (seven eight)}}
{{lower whatever}}
{{/markdown}}
bar`;

const missing = lint(str, {
  context: {
    helpers: {
      upper: () => {},
      lower: () => {},
      seven: () => {}
    },
    variables: {
      name: 'Brian'
    }
  }
});

console.log(missing);
