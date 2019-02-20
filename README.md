# broccoli-swc
[![Build Status](https://travis-ci.org/stefanpenner/broccoli-swc.svg?branch=master)](https://travis-ci.org/stefanpenner/broccoli-swc)

Experimental SWC compiler for broccoli (mostly using this to explore SWC, and see what it still needs to be an option for us).

> Super-fast javascript to javascript compiler written in rust

TL;DR SWC is a alternative to babel / buble for the JS ecosystem.

* SWC Repo: https://github.com/swc-project/swc
* SWC Site: https://swc-project.github.io/

This module aims to experiment using SWC in the broccoli and ember-cli ecosystems.


## usage

### Basic via Brocfile.js or Broccoli pipeline

```js
// Brocfile.js
const swc = require('broccoli-swc');
module.exports = swc(__dirname + '/src', {
  namedAmd: true | false, // defaults to false, but if true will wrap the CJS in named AMD output
  swc: {/* swc options */ }
}); // where src/**/*.js contains ecmascript
```

### Extension / Subclassing

```js
// Brocfile.js
const swc = require('broccoli-swc');

module.exports = class CustomSWC extends swc.Plugin {
  // custom behavior
}
```

## SWC Issues:

* ~https://github.com/swc-project/swc/issues/151 commonjs transformation not working via JS API #151~
* https://github.com/swc-project/swc/issues/154 add support for "named amd" module targets
* https://github.com/swc-project/swc/issues/104 Something like @babel/preset-env
* https://github.com/swc-project/swc/issues/155 add support for external helpers
* https://github.com/swc-project/swc/issues/18 Plugin system (we often rely on custom build steps such as debug/assert/feature flag stripping)
* ~https://github.com/swc-project/swc/issues/248 correct include externalized helpers in amd output~
