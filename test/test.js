'use strict';

var madvoc = require('../index');

module.exports = {
  testEmptyConstructor: function(test) {
    var routeConfigurator = new madvoc.RouteConfigurator();
    test.strictEqual(routeConfigurator.getRoutes(), null);
    test.done();
  },

  testParseRouteFromFile: function(test) {
    var routeConfigurator = new madvoc.RouteConfigurator('./test/fixtures/routes.txt');
    var routes = routeConfigurator.getRoutes();
    test.equal(routes.length, 2);
    test.equal(routes[0], '[actionClass=my.app.HelloAction,actionMethod=world,alias=my.app.HelloAction#world,async=false,httpMethod=GET,path=/helloworld]');
    test.equal(routes[1], '[actionClass=my.app.HelloAction,actionMethod=world,alias=my.app.HelloAction#world,async=false,httpMethod=GET,path=/helloworld]');
    test.done();
  },

  testParseRouteSimple: function(test) {
    var routeConfigurator = new madvoc.RouteConfigurator();

    routeConfigurator.parse(
      '/helloworld #async\n' +
      '/helloworld HelloAction\n' +
      '/helloworld HelloAction#method\n' +
      '/helloworld my.app.HelloAction#method\n' +
      '/helloworld my.app.HelloAction#method /alias\n');

    var routes = routeConfigurator.getRoutes();
    test.equal(routes.length, 5);
    test.equal(routes[0], '[actionClass=null,actionMethod=null,alias=null,async=true,httpMethod=GET,path=/helloworld]');
    test.equal(routes[1], '[actionClass=null,actionMethod=null,alias=HelloAction,async=false,httpMethod=GET,path=/helloworld]');
    test.equal(routes[2], '[actionClass=HelloAction,actionMethod=method,alias=HelloAction#method,async=false,httpMethod=GET,path=/helloworld]');
    test.equal(routes[3], '[actionClass=my.app.HelloAction,actionMethod=method,alias=my.app.HelloAction#method,async=false,httpMethod=GET,path=/helloworld]');
    test.equal(routes[4], '[actionClass=my.app.HelloAction,actionMethod=method,alias=/alias,async=false,httpMethod=GET,path=/helloworld]');
    test.done();
  },

  testParseRouteRegex: function(test) {
    var routeConfigurator = new madvoc.RouteConfigurator();

    routeConfigurator.parse(
      '/helloworld/${bar:regex}.html #async\n' +
      '/helloworld/${bar:regex}.html HelloAction\n' +
      '/helloworld/${bar:regex}.html HelloAction#method\n' +
      '/helloworld/${bar:regex}.html my.app.HelloAction#method\n' +
      '/helloworld/${bar:regex}.html my.app.HelloAction#method alias\n');

    var routes = routeConfigurator.getRoutes();
    test.equal(routes.length, 5);
    test.equal(routes[0], '[actionClass=null,actionMethod=null,alias=null,async=true,httpMethod=GET,path=/helloworld/${bar:regex}.html]');
    test.equal(routes[1], '[actionClass=null,actionMethod=null,alias=HelloAction,async=false,httpMethod=GET,path=/helloworld/${bar:regex}.html]');
    test.equal(routes[2], '[actionClass=HelloAction,actionMethod=method,alias=HelloAction#method,async=false,httpMethod=GET,path=/helloworld/${bar:regex}.html]');
    test.equal(routes[3], '[actionClass=my.app.HelloAction,actionMethod=method,alias=my.app.HelloAction#method,async=false,httpMethod=GET,path=/helloworld/${bar:regex}.html]');
    test.equal(routes[4], '[actionClass=my.app.HelloAction,actionMethod=method,alias=alias,async=false,httpMethod=GET,path=/helloworld/${bar:regex}.html]');
    test.done();
  },

  testParseRouteHttpMethods: function(test) {
    var routeConfigurator = new madvoc.RouteConfigurator();

    routeConfigurator.parse(
      'GET /helloworld\n' +
      'HEAD /helloworld\n' +
      'POST /helloworld\n' +
      'PUT /helloworld\n' +
      'DELETE /helloworld\n' +
      'TRACE /helloworld\n' +
      'OPTIONS /helloworld\n' +
      'CONNECT /helloworld\n' +
      'PATCH /helloworld\n');

    var routes = routeConfigurator.getRoutes();
    test.equal(routes.length, 9);
    test.equal(routes[0], '[actionClass=null,actionMethod=null,alias=null,async=false,httpMethod=GET,path=/helloworld]');
    test.equal(routes[1], '[actionClass=null,actionMethod=null,alias=null,async=false,httpMethod=HEAD,path=/helloworld]');
    test.equal(routes[2], '[actionClass=null,actionMethod=null,alias=null,async=false,httpMethod=POST,path=/helloworld]');
    test.equal(routes[3], '[actionClass=null,actionMethod=null,alias=null,async=false,httpMethod=PUT,path=/helloworld]');
    test.equal(routes[4], '[actionClass=null,actionMethod=null,alias=null,async=false,httpMethod=DELETE,path=/helloworld]');
    test.equal(routes[5], '[actionClass=null,actionMethod=null,alias=null,async=false,httpMethod=TRACE,path=/helloworld]');
    test.equal(routes[6], '[actionClass=null,actionMethod=null,alias=null,async=false,httpMethod=OPTIONS,path=/helloworld]');
    test.equal(routes[7], '[actionClass=null,actionMethod=null,alias=null,async=false,httpMethod=CONNECT,path=/helloworld]');
    test.equal(routes[8], '[actionClass=null,actionMethod=null,alias=null,async=false,httpMethod=PATCH,path=/helloworld]');
    test.done();
  },

  testParseRouteMultipleLines: function(test) {
    var routeConfigurator = new madvoc.RouteConfigurator();

    routeConfigurator.parse(
      '/helloworld \\\n' +
      'my.app.HelloAction#method\n');

    var routes = routeConfigurator.getRoutes();
    test.equal(routes.length, 1);
    test.equal(routes[0], '[actionClass=my.app.HelloAction,actionMethod=method,alias=my.app.HelloAction#method,async=false,httpMethod=GET,path=/helloworld]');
    test.done();
  },

  testParseRouteVariables: function(test) {
    var routeConfigurator = new madvoc.RouteConfigurator();

    routeConfigurator.parse(
      '@package = my.app\n' +
      '@methodName = method\n' +
      '/helloworld @package.HelloAction#@methodName\n');

    var routes = routeConfigurator.getRoutes();
    test.equal(routes.length, 1);
    test.equal(routes[0], '[actionClass=my.app.HelloAction,actionMethod=method,alias=my.app.HelloAction#method,async=false,httpMethod=GET,path=/helloworld]');
    test.done();
  }
};
