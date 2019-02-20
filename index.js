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
    this.swcOptions = {
      ...this.options.swc
    };

    if (this.swcOptions.module === undefined) {
      this.swcOptions.module = { type: 'amd' };
    }
    this.extensions = ['js', 'ts'];
  }

  async processString(content, relativePath) {
    const options = {...this.swcOptions};
    options.module = options.module || {};

    if (options.module.type === 'amd') {
      options.module.moduleId = relativePath.replace(/\.(?:js|ts)$/, '');
    }

    const { code } = await swc.transform(content, options);
    return code;
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

