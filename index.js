'use strict';

const Plugin = require('broccoli-persistent-filter');
const swc = require('@swc/core')

class SWC extends Plugin {
  constructor(inputTree, options = {}) {
    super(inputTree, {
      // swc uses native parallelism to achieve improved throughput
      async: true,

      // TODO: lets experiment with this some, maybe SWC is fast enough to not need this? persist: true
    });
    this.options = options;
    this.swcOptions = {
      ...this.options.swc
    };

    if (this.swcOptions.module === undefined) {
      this.swcOptions.module = { type: 'amd', moduleId: true };
    }


    this.extensions = ['js', 'ts'];
  }

  async processString(content, relativePath) {
    const options = {...this.swcOptions};
    options.module = {...options.module} || {};

    if (options.module.type === 'amd' && this.options.namedAmd || options.module.moduleId === true) {
      options.module.moduleId = relativePath.replace(/\.(?:js|ts)$/, '');
    }

    options.jsc = options.jsc || {};
    if (relativePath.endsWith('.ts') && options.jsc.parser === undefined) {
      options.jsc.parser = {
        "syntax": "typescript",
      }
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

