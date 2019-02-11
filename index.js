'use strict';

const Plugin = require('broccoli-persistent-filter');
const swc = require('swc')

class SWC extends Plugin {
  constructor(inputTree, options = {}) {
    super(inputTree);
    this.options = options;
  }

  async processString(content, relativePath) {
    return (await swc.transform(content, this.options.swc)).code;
  }
}
