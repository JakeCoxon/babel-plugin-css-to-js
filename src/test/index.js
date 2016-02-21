const fs = require('fs');
const test = require('tape');
const babel = require('babel-core');

const pluginPath = require.resolve('../');

test('basic autoprefixing', (t) => {
  var output = babel.transformFileSync(__dirname + '/fixtures/autoprefixer.source', {
    plugins: [[pluginPath, {
      plugins: [require('autoprefixer')]
    }]]
  });

  var expected = fs.readFileSync(__dirname + '/fixtures/autoprefixer.expected', 'utf-8');

  t.equal(output.code.trim(), expected.trim(), 'output matches expected');
  t.end();
});

test('basic autoprefixing (string plugin name)', (t) => {
  var output = babel.transformFileSync(__dirname + '/fixtures/autoprefixer.source', {
    plugins: [[pluginPath, {
      plugins: ['autoprefixer']
    }]]
  });

  var expected = fs.readFileSync(__dirname + '/fixtures/autoprefixer.expected', 'utf-8');

  t.equal(output.code.trim(), expected.trim(), 'output matches expected');
  t.end();
});

test('basic autoprefixing (arguments)', (t) => {
  var output = babel.transformFileSync(__dirname + '/fixtures/autoprefixer.source', {
    plugins: [[pluginPath, {
      plugins: [
        ['autoprefixer', {browsers: ['last 2 versions']}]
      ]
    }]]
  });

  var expected = fs.readFileSync(__dirname + '/fixtures/autoprefixer.expected', 'utf-8');

  t.equal(output.code.trim(), expected.trim(), 'output matches expected');
  t.end();
});
