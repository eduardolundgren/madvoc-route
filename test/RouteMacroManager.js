'use strict';

var RouteMacroManager = require('../lib/RouteMacroManager');

module.exports = {
  testMatch: function(test) {
    var macroManager = new RouteMacroManager('/user/${id:\\d+}/${name:[a-zA-Z]+}/${bio}');

    test.ok(!macroManager.match('/route'), 'Route shouldn\'t match');
    test.ok(!macroManager.match('/user'), 'Route shouldn\'t match');
    test.ok(!macroManager.match('/user/123'), 'Route shouldn\'t match');
    test.ok(!macroManager.match('/user/123/Maira'), 'Route shouldn\'t match');
    test.ok(!macroManager.match('/user/123/123/Something'), 'Route shouldn\'t match');
    test.ok(!macroManager.match('/user/Maira/123/Something'), 'Route shouldn\'t match');
    test.ok(!macroManager.match('/user/123/Maira/Something/adadsa'), 'Route shouldn\'t match');

    test.ok(macroManager.match('/user/123/Maira/Something'), 'Route should match');
    test.done();
  },

  testReplaceMacrosNone: function(test) {
    var macroManager = new RouteMacroManager('/route/path');
    var replacedRoute = macroManager.replaceMacros(':$1($2)', ':$1');

    test.strictEqual(
      '/route/path',
      replacedRoute,
      'The path should be same as the original one'
    );
    test.done();
  },

  testReplaceMacros: function(test) {
    var macroManager = new RouteMacroManager('/user/${id:\\d+}/${name:[a-zA-Z]+}/${bio}');
    var replacedRoute = macroManager.replaceMacros(':$1($2)', ':$1');

    test.strictEqual(
      '/user/:id(\\d+)/:name([a-zA-Z]+)/:bio',
      replacedRoute,
      'Macros should have been converted into the specified format'
    );
    test.done();
  },

  testGetMacros: function(test) {
    var macroManager = new RouteMacroManager('/user/${id:\\d+}/${name:[a-zA-Z]+}/${bio}');
    var macros = macroManager.getMacros();

    test.strictEqual(
      '[{"name":"id","pattern":"\\\\d+"},{"name":"name","pattern":"[a-zA-Z]+"},{"name":"bio"}]',
      JSON.stringify(macros),
      'Macros should have been converted into the specified format'
    );
    test.done();
  },

  testExtractParams: function(test) {
    var macroManager = new RouteMacroManager('/user/${id:\\d+}/${name:[a-zA-Z]+}/${bio}');
    var params = macroManager.extractParams('/user/123/Maira/Something');

    test.strictEqual(
      '{"id":"123","name":"Maira","bio":"Something"}',
      JSON.stringify(params),
      'Extracted params should contain all expected values.'
    );
    test.done();
  },

  testExtractParamsNone: function(test) {
    var macroManager = new RouteMacroManager('/route/path');
    var params = macroManager.extractParams('/route/path');

    test.strictEqual(
      '{}',
      JSON.stringify(params),
      'Route has no params, so result should be empty'
    );
    test.done();
  },

  testExtractParamsNoMatch: function(test) {
    var macroManager = new RouteMacroManager('/user/${id:\\d+}/${name:[a-zA-Z]+}/${bio}');
    var params = macroManager.extractParams('/route/path');

    test.strictEqual(
      params,
      false,
      'Route doesn\'t match, so result should be false.'
    );
    test.done();
  },

  testCustomSeparators: function(test) {
    var macroManager = new RouteMacroManager(
      '/user/{{id$\\d+}}/{{name$[a-zA-Z]+}}/{{bio}}',
      ['{{', '$', '}}']
    );

    test.ok(!macroManager.match('/route'), 'Route shouldn\'t match');
    test.ok(macroManager.match('/user/123/Maira/Something'), 'Route should match');

    var replacedRoute = macroManager.replaceMacros(':$1($2)', ':$1');
    test.strictEqual(
      '/user/:id(\\d+)/:name([a-zA-Z]+)/:bio',
      replacedRoute,
      'Macros should have been converted into the specified format'
    );

    var macros = macroManager.getMacros();
    test.strictEqual(
      '[{"name":"id","pattern":"\\\\d+"},{"name":"name","pattern":"[a-zA-Z]+"},{"name":"bio"}]',
      JSON.stringify(macros),
      'Macros should have been converted into the specified format'
    );

    var params = macroManager.extractParams('/user/123/Maira/Something');
    test.strictEqual(
      '{"id":"123","name":"Maira","bio":"Something"}',
      JSON.stringify(params),
      'Extracted params should contain all expected values.'
    );

    test.done();
  }
};
