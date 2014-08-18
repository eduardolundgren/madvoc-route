'use strict';

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
Route.prototype.httpMethod = null;

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

module.exports = Route;
