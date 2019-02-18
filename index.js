'use strict';

const Plugin = require('broccoli-persistent-filter');
const swc = require('@swc/core')

class SWC extends Plugin {
  constructor(inputTree, options = {}) {
    super(inputTree, {
      // in theory, it is possible for swc to use native threads to achieve per
      // transform parallelism. To utilize that we enable async here, which
      // processes all processStrings in parallel. I'll need to investigate if
      // this is actually possible with SWC...
      async: true,

      // TODO: lets experiment with this some, maybe SWC is fast enough to not need this? persist: true
    });
    this.options = options;
    this.extensions = ['js', 'ts'];
  }

  async processString(content, relativePath) {
    const { code } = (await swc.transform(content, {
      ...this.options.swc,
      ...{
        module: {
          type: 'commonjs'
        }
      }
    }
    ));

    if (this.options.namedAmd) {
      return wrapInNamedAmd(code, relativePath.replace(/\.(?:js|ts)$/, ''));
    } else {
      return code;
    }
  }

  // this is implemented for persistent cache key creation by broccoli-persistent-filter
  baseDir() {
    return __dirname;
  }
}

module.exports = function swc(input, options) {
  return new SWC(input, options);
};

module.exports.Plugin = SWC;
function wrapInNamedAmd(cjs, name) {
  return `define('${name}', ['exports', 'require'], function(exports, require) {
        ;${cjs};
      });`
}

module.exports.wrapInNamedAmd = wrapInNamedAmd;

