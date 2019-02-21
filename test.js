'use strict';

const { expect } = require('chai');
const { createBuilder, createTempDir } = require("broccoli-test-helper");
const swc = require('./index')

describe('broccoli-swc-transpiler', function() {
  let input;

  function evalAndGetAmdExport(code) {
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
    const exports = {};
    cb(exports);

    return {
      moduleId,
      dependencies,
      exports
    };
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
        module: {
          type: 'commonjs'
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

  it('it supports typescript compilation', async function() {
    const subject = swc(input.path(), {
      swc: {
        module: {
          type: 'commonjs'
        }
      }
    });
    const output = createBuilder(subject);

    input.write({
      'a.ts': `
      export default class Foo {
        get foo() : number {
          return 1;
        }

        async apple(name: string) {
          await Promise.resolve(1);
        }
      }
      `,

      'b': {
        'b.ts': `
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
      'a.ts': 'create',
      'b/': 'mkdir',
      'b/b.ts': 'create',
      'foo.txt': 'create'
    });


    await output.build();

    expect(output.changes()).to.deep.eql({});

    expect(Object.keys(output.read())).to.deep.eql([ 'a.ts', 'b', 'foo.txt' ])

    const A_JS = output.read()['a.ts'];
    const Foo = evalAndGetCJSExport(A_JS).default;
    expect(new Foo().foo).to.eql(1);
  });


  it('it supports named AMD compilation via moduleId=true', async function() {
    const subject = swc(input.path(), {
      swc: {
        module: {
          type: 'amd',
          moduleId: true
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

    expect(Object.keys(output.read())).to.deep.eql([ 'a.js', 'b', 'foo.txt' ]);

    const A_JS = output.read()['a.js'];
    const result = evalAndGetAmdExport(A_JS)
    expect(result.moduleId).to.eql('a');
    expect(result.dependencies).to.eql(['exports']);
    const Foo = result.exports.default;
    expect(new Foo().foo).to.eql(1);
  });

  it('it supports named AMD compilation', async function() {
    const subject = swc(input.path(), {
      namedAmd: true,
      swc: {
        module: {
          type: 'amd'
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

    expect(Object.keys(output.read())).to.deep.eql([ 'a.js', 'b', 'foo.txt' ]);

    const A_JS = output.read()['a.js'];
    const result = evalAndGetAmdExport(A_JS)
    expect(result.moduleId).to.eql('a');
    expect(result.dependencies).to.eql(['exports']);
    const Foo = result.exports.default;
    expect(new Foo().foo).to.eql(1);
  });

 it.skip('it supports AMD compilation with externalHelpers', async function() {
    const subject = swc(input.path(), {
      swc: {
        jsc: {
          externalHelpers: true,
        },
        module: {
          type: 'amd'
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

    expect(Object.keys(output.read())).to.deep.eql([ 'a.js', 'b', 'foo.txt' ]);

    const A_JS = output.read()['a.js'];
    const result = evalAndGetAmdExport(A_JS)
    expect(result.moduleId).to.eql('a');
    expect(result.dependencies).to.eql(['exports', '@swc/helpers']);
    const Foo = result.exports.default;
    expect(new Foo().foo).to.eql(1);
  });
});
