madvoc-route
============

[![Build Status](http://img.shields.io/travis/eduardolundgren/madvoc-route.svg?style=flat)](https://travis-ci.org/eduardolundgren/madvoc-route)

JavaScript parser for Madvoc routes configuration file.

[Madvoc](http://jodd.org/doc/madvoc/) is MVC framework that uses CoC and annotations in a pragmatic way to simplify web application development. It is easy to use, learning curve is small and it is easy to extend. There are no external (xml) configuration, actions are simple POJOs, it is compatible with any view technology, its pluggable and so on…

## Introduction

Parses madvoc routes syntax into a `madvoc.Route` JavaScript object model. Supported routes:

```
/helloworld my.app.HelloAction#method
GET /helloworld my.app.HelloAction#method
POST /helloworld my.app.HelloAction#method route_alias
/helloworld/${boo:regex} my.app.HelloAction#method
```

See more routing options [in the test case file](https://github.com/eduardolundgren/madvoc-route/blob/master/test/test.js).

## Examples

#### Require the module

```js
var madvoc = require('madvoc-route');
```

Madvoc route module exposes two classes: `madvoc.RouteConfigurator` and `madvoc.Route`.

#### Parse routes:

The `parse` method could be manually invoked from a `madvoc.RouteConfiguration` instance:


```js
var routeConfigurator = new madvoc.RouteConfigurator();

routeConfigurator.parse('/helloworld my.app.HelloAction#hello');

routeConfigurator.getRoutes();
// [[actionClass=my.app.HelloAction,actionMethod='hello',alias=null,async=false,httpMethod=GET,path=/helloworld]]
```

Or you can parse multiple routes:

```js
var routeConfigurator = new madvoc.RouteConfigurator();

routeConfigurator.parse(
    '/helloworld1 my.app.HelloAction#hello\n' + 
    '/helloworld2 my.app.HelloAction#hello');

routeConfigurator.getRoutes();
// [[actionClass=my.app.HelloAction,actionMethod='hello',alias=null,async=false,httpMethod=GET,path=/helloworld1],
//  [actionClass=my.app.HelloAction,actionMethod='hello',alias=null,async=false,httpMethod=GET,path=/helloworld2]]
```

#### Setup `routes.txt`

To keep your project organized and easier to maintain you can place all routes of your application into a file called, for example, `routes.txt` and we parse that for you:

Routes.txt

```
/helloworld1 my.app.HelloAction#hello
/helloworld2 my.app.HelloAction#hello
```

```js
var routeConfigurator = new madvoc.RouteConfigurator('routes.txt');

routeConfigurator.getRoutes();
// [[actionClass=my.app.HelloAction,actionMethod='hello',alias=null,async=false,httpMethod=GET,path=/helloworld1],
//  [actionClass=my.app.HelloAction,actionMethod='hello',alias=null,async=false,httpMethod=GET,path=/helloworld2]]
```
