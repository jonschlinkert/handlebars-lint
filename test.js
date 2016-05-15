'use strict';

require('mocha');
var assert = require('assert');
var lint = require('./');
var options;

describe('handlebars-variables', function() {
  describe('main export', function() {
    it('should export a function', function() {
      assert.equal(typeof lint, 'function');
    });
  });

  describe('partials', function () {
    it('should return a list of missing partials', function () {
      var fixture = '{{> foo }}{{> bar }}';
      var options = {
        context: {
          partials: ['foo', 'qux']
        }
      };
      assert.deepEqual(lint(fixture, options), { partials: ['bar'] });
    });
  });

  describe('variables', function () {
    it('should return a list of missing variables', function () {
      var fixture = '{{foo one}}{{bar two}}';
      var options = {
        context: {
          helpers: ['foo', 'bar'],
          variables: ['xxx', 'yyy']
        }
      };
      assert.deepEqual(lint(fixture, options), { variables: ['one', 'two'] });
    });
  });

  describe('partials', function () {
    it('should return a list of missing block helpers', function () {
      assert.deepEqual(lint('{{#foo}}...{{/foo}}', {context: {helpers: ['foo', 'qux']}}), {});
      assert.deepEqual(lint('{{#bar}}...{{/bar}}', {context: {helpers: ['foo', 'qux']}}), {
        blockHelpers: ['bar']
      });
      assert.deepEqual(lint('{{#bar}}{{#baz}}...{{/baz}}{{/bar}}', {context: {helpers: ['foo', 'qux']}}), {
        blockHelpers: ['bar', 'baz']
      });
    });
  });

  describe('helpers', function () {
    it('should return a list of missing helpers', function () {
      var fixture = '{{foo}}{{bar}}';
      options = {
        context: {
          helpers: ['foo']
        }
      };
      assert.deepEqual(lint(fixture, options), { helpers: ['bar'] });
    });

    it('should return a list of missing variables', function () {
      options = {context: {helpers: ['foo']}};
      assert.deepEqual(lint('{{foo one}}{{bar two}}', options), {
        helpers: ['bar'],
        variables: ['one', 'two']
      });

      options = {context: {helpers: ['foo'], variables: ['two']}};
      assert.deepEqual(lint('{{foo one}}{{bar two}}', options), {
        helpers: ['bar'],
        variables: ['one']
      });

      options = {context: {variables: ['foo']}};
      assert.deepEqual(lint('{{foo}}{{bar two}}', options), {
        helpers: ['bar'],
        variables: ['two']
      });

      options = {context: {helpers: ['foo']}};
      assert.deepEqual(lint('{{foo}}{{bar two}}', options), {
        helpers: ['bar'],
        variables: ['two']
      });
    });
  });
});
