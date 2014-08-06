'use strict';

var fs = require('fs');
var path = require('path');

/**
 * Route model class.
 * @constructor
 */
function Route() {
}

/**
 * Holds the router actionClass value.
 * @type {String}
 */
Route.prototype.actionClass = null;

/**
 * Holds the router action method value.
 * @type {String}
 */
Route.prototype.actionMethod = null;

/**
 * Holds the router alias value.
 * @type {String}
 */
Route.prototype.alias = null;

/**
 * Holds the router async value.
 * @type {Boolean}
 */
Route.prototype.async = false;

/**
 * Holds the router http method value.
 * @type {String}
 */
Route.prototype.httpMethod = 'GET';

/**
 * Holds the router path value.
 * @type {String}
 */
Route.prototype.path = null;

/**
 * Gets the router action class.
 * @return {String}
 */
Route.prototype.getActionClass = function() {
  return this.actionClass;
};

/**
 * Gets the router action method.
 * @return {String}
 */
Route.prototype.getActionMethod = function() {
  return this.actionMethod;
};

/**
 * Gets the router alias.
 * @return {String}
 */
Route.prototype.getAlias = function() {
  return this.alias;
};

/**
 * Gets the router async value.
 * @return {String}
 */
Route.prototype.getAsync = function() {
  return this.async;
};

/**
 * Gets the router http method.
 * @return {String}
 */
Route.prototype.getHttpMethod = function() {
  return this.httpMethod;
};

/**
 * Gets the router path.
 * @return {String}
 */
Route.prototype.getPath = function() {
  return this.path;
};

/**
 * Sets the router action class.
 * @param {String} actionClass
 */
Route.prototype.setActionClass = function(actionClass) {
  this.actionClass = actionClass;
};

/**
 * Sets the router action method.
 * @param {String} actionMethod
 */
Route.prototype.setActionMethod = function(actionMethod) {
  this.actionMethod = actionMethod;
};

/**
 * Sets the router alias.
 * @param {String} alias
 */
Route.prototype.setAlias = function(alias) {
  this.alias = alias;
};

/**
 * Sets the router async value.
 * @param {Boolean} async
 */
Route.prototype.setAsync = function(async) {
  this.async = async;
};

/**
 * Sets the router http method.
 * @param {String} httpMethod
 */
Route.prototype.setHttpMethod = function(httpMethod) {
  this.httpMethod = httpMethod;
};

/**
 * Sets the router path.
 * @param {String} path
 */
Route.prototype.setPath = function(path) {
  this.path = path;
};

/**
 * @return {String}
 */
Route.prototype.toString = function() {
  return '[' +
    'actionClass=' + this.actionClass + ',' +
    'actionMethod=' + this.actionMethod + ',' +
    'alias=' + this.alias + ',' +
    'async=' + this.async + ',' +
    'httpMethod=' + this.httpMethod + ',' +
    'path=' + this.path +
    ']';
};




/**
 * Router configuration class. This class loads routes information from a file
 * path or parsed from <code>parse</code> method.
 * @param {String} opt_routesFilepath
 * @constructor
 */
function RouteConfigurator(opt_routesFilepath) {
  if (opt_routesFilepath) {
    this.setRoutesFilepath(opt_routesFilepath);
    this.parse(fs.readFileSync(this.routesFilepath).toString());
  }
}

/**
 * Holds parser ignored fixes.
 * @type {Array.<String>}
 */
RouteConfigurator.IGNORED_FIXES = [
  '"', '"',
  '\'', '\'',
  '`', '`',
  '{', '}',
  '(', ')',
  '[', ']',
  '', ',',
  '', ';',
  '', ':'
];

/**
 * Holds all reserved aliases values.
 * @type {Array.<String>}
 */
RouteConfigurator.RESERVED_ALIASES = [
  '->'
];

/**
 * Holds all supported HTTP methods.
 * @type {Array.<String>}
 */
RouteConfigurator.VALID_HTTP_METHODS = [
  'CONNECT',
  'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'PATCH',
  'POST',
  'PUT',
  'TRACE'
];

/**
 * Holds the parsed routes.
 * @type {Array.<Route>}
 */
RouteConfigurator.prototype.routes = null;

/**
 * Holds the routes file path.
 * @type {String}
 */
RouteConfigurator.prototype.routesFilepath = null;

/**
* Splits routes content into lines and parses madvoc route values.
* @param {String} routes Routes content separated by line break.
*/
RouteConfigurator.prototype.parse = function(routes) {
  var start = 0;
  var line = null;
  var lines = [];

  while (start < routes.length) {
    var ndx = routes.indexOf('\n', start);

    if (ndx === -1) {
      ndx = routes.length;
    }

    var newLine = routes.substring(start, ndx).trim();

    start = ndx + 1;

    var join = false;

    if (newLine.charAt(newLine.length - 1) === '\\') {
      newLine = newLine.slice(0, -1);
      join = true;
    }

    if (line === null) {
      line = newLine;
    } else {
      line += newLine;
    }

    if (join) {
      continue;
    }

    if (line.length) {
      lines.push(line);
    }

    line = null;
  }

  this.routes = [];
  for (var i = 0; i < lines.length; i++) {
    var route = this.parseLine(lines[i]);
    // Valid routes requires a parsed path
    if (route.getPath()) {
      this.routes.push(route);
    }
  }
};

/**
 * Parses madvoc route values from line.
 * @param {String} line The line to be parsed.
 * @return {Route} route The route instance filled with parsed information.
 * @protected
 */
RouteConfigurator.prototype.parseLine = function(line) {
  var route = new Route();
  switch (line.charAt(0)) {
    case '@':
      throw new Error('Madvoc group definition not supported.');
    case '#': break;
    case '[':
      throw new Error('Madvoc wrapper groups not supported.');
    default:
      this.subparseLine(line, route);
  }
  return route;
};

/**
 * Parses action class and method information from line.
 * @param {String} line The line to be parsed.
 * @param {Route} route The route instance to be filled with parsed
 *     information.
 * @protected
 */
RouteConfigurator.prototype.subparseLine = function(line, route) {
  var chunks = line.split(/\s+/);

  for (var c = 0; c < chunks.length; c++) {
    var chunk = this.trimPrefixAndSuffix(chunks[c]);

    // action path (starts with '/')
    if (chunk.charAt(0) === '/') {
      if (!route.getPath()) {
        route.setPath(chunk);
        continue;
      }
    }

    // flag (starts with '#')
    if (chunk.charAt(0) === '#') {
      var flag = chunk.substring(1);
      if (flag === 'async') {
        route.setAsync(true);
      }
      continue;
    }

    // class#method (has '#')
    if (chunk.indexOf('#') > 0) {
      var names = chunk.split('#');
      if (names.length !== 2) {
        continue;
      }
      route.setActionClass(names[0]);
      route.setActionMethod(names[1]);
    }

    // class name (ends with ".class")
    if (chunk.slice(-6) === '.class') {
      var className = chunk.slice(0, -6);
      route.setActionClass(className);
      continue;
    }

    // http method
    if (this.isValidHttpMethod(chunk)) {
      route.setHttpMethod(chunk);
      continue;
    }

    // last remaining chunk is an alias
    if (this.isValidAlias(chunk)) {
      route.setAlias(chunk);
    }
  }
};

/**
 * Trim prefixes and sufixes from chunk.
 * @param {String} chunk
 * @return {String} Returns trimmed chunk.
 */
RouteConfigurator.prototype.trimPrefixAndSuffix = function(chunk) {
  for (var i = 0; i < RouteConfigurator.IGNORED_FIXES.length; i += 2) {
    var left = RouteConfigurator.IGNORED_FIXES[i];
    var right = RouteConfigurator.IGNORED_FIXES[i + 1];
    if (chunk.charAt(0) === left && chunk.charAt(chunk.length - 1) === right) {
      chunk = chunk.slice(left.length, -right.length);
      break;
    }
  }
  return chunk;
};

/**
 * Checks whether passed chunk is a valid alias. Relevant to prevent reserved
 * tokens such as "->" to be captured as an aliases.
 * @param {String} chunk
 * @return {Boolean}
 */
RouteConfigurator.prototype.isValidAlias = function(chunk) {
  return RouteConfigurator.RESERVED_ALIASES.indexOf(chunk) === -1;
};

/**
 * Checks whether the passed chunk is a valid HTTP method.
 * @param {String} chunk
 * @return {Boolean}
 */
RouteConfigurator.prototype.isValidHttpMethod = function(chunk) {
  return RouteConfigurator.VALID_HTTP_METHODS.indexOf(chunk) > -1;
};

/**
 * Gets the parsed routes.
 * @return {Array.<Route>}
 */
RouteConfigurator.prototype.getRoutes = function() {
  return this.routes;
};

/**
 * Gets the routes filepath. Relevant when parsing routes from a configuration
 * file.
 * @return {String}
 */
RouteConfigurator.prototype.getRoutesFilepath = function() {
  return this.routesFilepath;
};

/**
 * Sets the parsed routes.
 * @param {Array.<Route>} routes
 */
RouteConfigurator.prototype.setRoutes = function(routes) {
  this.routes = routes;
};

/**
 * Sets the routes configuration file path.
 * @param {String} routesFilepath
 */
RouteConfigurator.prototype.setRoutesFilepath = function(routesFilepath) {
  this.routesFilepath = path.resolve(process.cwd(), routesFilepath);
};

module.exports.Route = Route;
module.exports.RouteConfigurator = RouteConfigurator;
