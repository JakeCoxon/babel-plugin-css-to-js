const fs = require('fs');
const test = require('tape');
const babel = require('babel-core');

const pluginPath = require.resolve('../');

test('basic autoprefixing', (t) => {
  var output = babel.transformFileSync(__dirname + '/fixtures/basic.source', {
    plugins: [[pluginPath, {
      plugins: [require('autoprefixer')]
    }]]
  });

  var expected = fs.readFileSync(__dirname + '/fixtures/basic.expected', 'utf-8');

  t.equal(output.code.trim(), expected.trim(), 'output matches expected');
  t.end();
});
