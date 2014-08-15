'use strict';

var globToRegExp = require('glob-to-regexp');

/**
 * Handles macros presence on a route path. Assumes that macros are defined in
 * the following way: <code>[prefix]name[split]pattern[suffix]</code>.
 * @param {!String} routePathFormat The original path string for a route.
 * @param {String=} opt_patternFormat The format the macro patterns are in. The
 *     default is the regex format, but other formats are also supported (see
 *     the PATTERN_FORMAT) functions in this file).
 * @param {Array.String=} opt_separators The separators to be used as the prefix,
 *     split and suffix of the macro pattern. If none are given,
 *     RouteMacroManager.SEPARATORS will be used.
 * @constructor
 */
function RouteMacroManager(routePathFormat, opt_patternFormat, opt_separators) {
  this.routePathFormat = routePathFormat;

  this.convertPatternsToRegex(opt_patternFormat);

  if (opt_separators) {
    this.separators = opt_separators;
  }

  this.macros = this.extractMacros();
}

/**
 * Macro pattern regex format.
 * @type {Number}
 * @static
 */
RouteMacroManager.PATTERN_FORMAT_REGEX = 1;

/**
 * Macro pattern wildcard format.
 * @type {Number}
 * @static
 */
RouteMacroManager.PATTERN_FORMAT_WILDCARD = 2;

/**
 * Macro pattern bash glob format.
 * @type {Number}
 * @static
 */
RouteMacroManager.PATTERN_FORMAT_BASH_GLOB = 3;

/**
 * The regex for a macro term. Can have any character besides the group :/{}.
 * @type {Array.String}
 * @static
 */
RouteMacroManager.REGEX_MACRO_TERM = '([^:/{}]+)';

/**
 * The default separators to be used as the prefix, split and suffix of the
 * macro pattern.
 * @type {Array.String}
 * @static
 */
RouteMacroManager.SEPARATORS = ['${', ':', '}'];

/**
 * Holds the original path string for a route.
 * @type {String}
 * @private
 */
RouteMacroManager.prototype.routePathFormat = null;

/**
 * The separators to be used as the prefix, split and suffix of the macro pattern.
 * @type {Array.String}
 * @private
 */
RouteMacroManager.prototype.separators = RouteMacroManager.SEPARATORS;

/**
 * Builds the regex string for the complete macro format (name and pattern).
 * @return {String} The regex string.
 */
RouteMacroManager.prototype.buildCompleteFormatRegex = function() {
  return this.escapeToRegex(this.separators[0]) +
    RouteMacroManager.REGEX_MACRO_TERM +
    this.escapeToRegex(this.separators[1]) +
    RouteMacroManager.REGEX_MACRO_TERM +
    this.escapeToRegex(this.separators[2]);
};

/**
 * Converts the route path string to a single regex, replacing macros with their
 * regex values.
 * @return {String} The path converted to a regex string.
 */
RouteMacroManager.prototype.buildPathAsRegex = function() {
  return '^' + this.replaceMacros('($2)', RouteMacroManager.REGEX_MACRO_TERM) + '$';
};

/**
 * Builds the regex string for the single macro format (just name).
 * @return {String} The regex string.
 */
RouteMacroManager.prototype.buildSingleFormatRegex = function() {
  return this.escapeToRegex(this.separators[0]) +
    RouteMacroManager.REGEX_MACRO_TERM +
    this.escapeToRegex(this.separators[2]);
};

/**
 * Converts the macro patterns to regex.
 *
 * @method convertPatternsToRegex
 * @protected
 */
RouteMacroManager.prototype.convertPatternsToRegex = function(patternFormat) {
  if (!patternFormat || patternFormat === RouteMacroManager.PATTERN_FORMAT_REGEX) {
    return;
  }

  var instance = this;

  this.routePathFormat = this.replaceMacros(
    function(macro, name, pattern) {
      pattern = globToRegExp(
        pattern,
        {extended: patternFormat === RouteMacroManager.PATTERN_FORMAT_BASH_GLOB}
      );
      pattern = pattern.source;

      // globToRegExp adds '^' to the beginning of the regex and '$' to the end,
      // which we don't want since our patterns are inside a string.
      pattern = pattern.substr(0, pattern.length - 1).substr(1);

      return instance.separators[0] +
        name +
        instance.separators[1] +
        pattern +
        instance.separators[2];
    },
    function(macro) {
      return macro;
    }
  );
};

/**
 * Escapes the given string so it can be looked up as part of a regex.
 * @param {String} string The string to escape.
 * @protected
 */
RouteMacroManager.prototype.escapeToRegex = function(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * Extracts all macros from the route path format.
 */
RouteMacroManager.prototype.extractMacros = function() {
  var macros = [];
  var regex = new RegExp(
    this.buildCompleteFormatRegex() + '|' + this.buildSingleFormatRegex(),
    'g'
  );

  var currentMatch = regex.exec(this.routePathFormat);
  while (currentMatch) {
    macros.push({
      name: currentMatch[1] || currentMatch[3],
      pattern: currentMatch[2]
    });

    currentMatch = regex.exec(this.routePathFormat);
  }

  return macros;
};

/**
 * Extracts all params from the given route path.
 * @param {String} routePath
 * @return {Boolean | Object} A map from param name to param value for each
 *     param, or false if the path doesn't match the the format handled by this
 *     macro manager.
 */
RouteMacroManager.prototype.extractParams = function(routePath) {
  if (!this.match(routePath)) {
    return false;
  }

  var params = {};
  var regex = new RegExp(this.buildPathAsRegex(), 'g');
  var match = regex.exec(routePath);
  var macros = this.getMacros();

  for (var i = 1; i < match.length; i++) {
    params[macros[i - 1].name] = match[i];
  }

  return params;
};

/**
 * Returns an array with all extracted macros from the route path format.
 * @return {Array.Object}
 */
RouteMacroManager.prototype.getMacros = function() {
  return this.macros;
};

/**
 * Checks if the given route path matched the format handled by this macro manager.
 * @param {String} routePath
 * @return {Boolean}
 */
RouteMacroManager.prototype.match = function(routePath) {
  return new RegExp(this.buildPathAsRegex(), 'g').test(routePath);
};

/**
 * Returns the route path string with all macros converted to the specified format.
 * @param {String} completeFormat The format the macro should follow if it has both
 *     a name and a pattern.
 * @param {string} singleFormat The format the macro should follow if it only has
 *     a name (no pattern).
 * @return {String} The converted route path string.
 */
RouteMacroManager.prototype.replaceMacros = function(completeFormat, singleFormat) {
  var completeRegex = new RegExp(this.buildCompleteFormatRegex(), 'g');
  var singleRegex = new RegExp(this.buildSingleFormatRegex(), 'g');

  var finalRoutePath = this.routePathFormat.replace(completeRegex, completeFormat);
  finalRoutePath = finalRoutePath.replace(singleRegex, singleFormat);

  return finalRoutePath;
};

module.exports = RouteMacroManager;
