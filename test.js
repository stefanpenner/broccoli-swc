'use strict';

const { expect } = require('chai');
const { createBuilder, createTempDir } = require("broccoli-test-helper");
const swc = require('./index')

describe('broccoli-swc-transpiler', function() {
  let input;

  beforeEach(async function() {
    input = await createTempDir();
  });

  it('is ok', async function() {
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
    // TODO: once we can correctly configure swc and once it in a custom vm
    // context, and confirm the compiled output is:
    // * around the expected size
    // * interopts with the loader we expect given how we configured it
    //
    // I didn't want to have to load babel to convert the output, so we can
    // test it. So let's wait for swc to fix/update
  })
});
