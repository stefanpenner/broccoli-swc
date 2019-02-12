'use strict';

const { expect } = require('chai');
const { createBuilder, createTempDir } = require("broccoli-test-helper");
const swc = require('./index')

describe('broccoli-swc-transpiler', function() {
  let input;

  function evalAndGetAmdExport(code, expectedModuleId) {
    let module = new Function('define', code);
    let moduleId;
    let dependencies;
    let cb;
    function define(_moduleId, _dependencies, _cb) {
      moduleId = _moduleId;
      dependencies = _dependencies;
      cb = _cb;
    }

    module(define);

    expect(moduleId).to.eql(expectedModuleId);
    expect(dependencies).to.eql(['exports', 'require']);
    const exports = {};
    cb(exports);
    return exports;
  }

  function evalAndGetCJSExport(code) {
    let module = new Function('exports', code);
    const exports = {};
    module(exports);
    return exports;
  }

  beforeEach(async function() {
    input = await createTempDir();
  });

  it('it supports CJS compilation', async function() {
    const subject = swc(input.path(), {
      swc: {
        jsc: {
        }
      }
    });
    const output = createBuilder(subject);

    input.write({
      'a.js': `
      export default class Foo {
        get foo() {
          return 1;
        }

        async apple() {
          await Promise.resolve(1);
        }
      }
      `,

      'b': {
        'b.js': `
      export default class Foo {
        get foo() {
          return 1;
        }

        async apple() {
          await Promise.resolve(1);
        }
      }
      `
      },
      'foo.txt': 'do not compile'
    });

    await output.build();

    expect(output.changes()).to.deep.eql({
      'a.js': 'create',
      'b/': 'mkdir',
      'b/b.js': 'create',
      'foo.txt': 'create'
    });


    await output.build();

    expect(output.changes()).to.deep.eql({});

    expect(Object.keys(output.read())).to.deep.eql([ 'a.js', 'b', 'foo.txt' ])

    const A_JS = output.read()['a.js'];
    const Foo = evalAndGetCJSExport(A_JS).default;
    expect(new Foo().foo).to.eql(1);
  });

  it('it can wrap into named amd', async function() {
    const subject = swc(input.path(), {
      namedAmd: true,
      swc: {
        jsc: {
        }
      }
    });
    const output = createBuilder(subject);

    input.write({
      'a.js': `
      export default class Foo {
        get foo() {
          return 1;
        }

        async apple() {
          await Promise.resolve(1);
        }
      }
      `,

      'b': {
        'b.js': `
      export default class Foo {
        get foo() {
          return 1;
        }

        async apple() {
          await Promise.resolve(1);
        }
      }
      `
      },
      'foo.txt': 'do not compile'
    });

    await output.build();

    expect(output.changes()).to.deep.eql({
      'a.js': 'create',
      'b/': 'mkdir',
      'b/b.js': 'create',
      'foo.txt': 'create'
    });


    await output.build();

    expect(output.changes()).to.deep.eql({});

    expect(Object.keys(output.read())).to.deep.eql([ 'a.js', 'b', 'foo.txt' ])

    const A_JS = output.read()['a.js'];
    const Foo = evalAndGetAmdExport(A_JS, 'a').default;
    expect(new Foo().foo).to.eql(1);
  });
});
