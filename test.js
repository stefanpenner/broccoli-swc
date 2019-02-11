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
    const subject = swc(input.path());
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
      }
    });

    await output.build();

    expect(output.changes()).to.deep.eql({
      'a.js': 'create',
      'b/': 'mkdir',
      'b/b.js': 'create'
    });


    await output.build();

    expect(output.changes()).to.deep.eql({});

    expect(Object.keys(output.read())).to.deep.eql([ 'a.js', 'b' ])

    const A_JS = output.read()['a.js'];
    // TODO:
    // let a = new Function(A_JS);
  })
});
