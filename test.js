'use strict';

require('mocha');
const assert = require('assert');
const lint = require('./');
let options;

describe('handlebars-variables', function() {
  describe('partials', function() {
    it('should return a list of missing partials', function() {
      const fixture = '{{> foo }}{{> bar }}';
      const options = {
        context: {
          partials: ['foo', 'qux']
        }
      };
      assert.deepEqual(lint(fixture, options), { partials: ['bar'] });
    });
  });

  describe('variables', function() {
    it('should return a list of missing variables', function() {
      const fixture = '{{foo one}}{{bar two}}';
      const options = {
        context: {
          helpers: ['foo', 'bar'],
          variables: ['xxx', 'yyy']
        }
      };
      assert.deepEqual(lint(fixture, options), { variables: ['one', 'two'] });
    });

    it('should get hash variables', function() {
      const fixture = '{{foo abc=bar}}';
      assert.deepEqual(lint(fixture), { helpers: ['foo'], variables: ['bar'] });
    });

    it('should get subexpressions', function() {
      const fixture = '{{foo (bar baz)}}';
      assert.deepEqual(lint(fixture), { helpers: ['bar', 'foo'], variables: ['baz'] });
    });

    it('should get', function() {
      const fixture = `{
        "name": "{{name}}",
        "description": "{{description}}",
        "version": "{{version}}",
        "homepage": "{{homepage}}",
        "author": "{{author.name}} ({{author_url}})",
        "repository": "{{owner}}/{{name}}",
        "bugs": {
          "url": "https://github.com/{{owner}}/{{name}}/issues"
        },
        "engines": {
          "node": ">=4"
        },
        "license": "{{license}}",
        "scripts": {
          "test": "mocha"
        },
        "keywords": []
      }
      `;

      assert.deepEqual(lint(fixture), {
        variables: ['author', 'author_url', 'description', 'homepage', 'license', 'name', 'owner', 'version']
      });
    });
  });

  describe('partials', function() {
    it('should return a list of missing block helpers', function() {
      assert.deepEqual(lint('{{#foo}}...{{/foo}}', { context: { helpers: ['foo', 'qux'] } }), {});
      assert.deepEqual(lint('{{#bar}}...{{/bar}}', { context: { helpers: ['foo', 'qux'] } }), {
        blockHelpers: ['bar']
      });
      assert.deepEqual(lint('{{#bar}}{{#baz}}...{{/baz}}{{/bar}}', { context: { helpers: ['foo', 'qux'] } }), {
        blockHelpers: ['bar', 'baz']
      });
    });
  });

  describe('helpers', function() {
    it('should return a list of missing helpers', function() {
      const fixture = '{{foo}}{{bar}}';
      options = {
        context: {
          helpers: ['foo']
        }
      };
      assert.deepEqual(lint(fixture, options), { variables: ['bar'] });
    });

    it('should return a list of missing variables', function() {
      options = { context: { helpers: ['foo'] } };
      assert.deepEqual(lint('{{foo one}}{{bar two}}', options), {
        helpers: ['bar'],
        variables: ['one', 'two']
      });

      options = { context: { helpers: ['foo'], variables: ['two'] } };
      assert.deepEqual(lint('{{foo one}}{{bar two}}', options), {
        helpers: ['bar'],
        variables: ['one']
      });

      options = { context: { variables: ['foo'] } };
      assert.deepEqual(lint('{{foo}}{{bar two}}', options), {
        helpers: ['bar'],
        variables: ['two']
      });

      options = { context: { helpers: ['foo'] } };
      assert.deepEqual(lint('{{foo}}{{bar two}}', options), {
        helpers: ['bar'],
        variables: ['two']
      });
    });
  });
});
