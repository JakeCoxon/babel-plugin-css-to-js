const fs = require('fs');
const test = require('tape');
const babel = require('babel-core');

const pluginPath = require.resolve('../');

const outputExpected = name => plugins => {
  const output = babel.transformFileSync(`${__dirname}/fixtures/${name}.source`, {
    plugins: [[pluginPath, {
      plugins: plugins
    }]]
  }).code.trim();

  const expected = fs.readFileSync(`${__dirname}/fixtures/${name}.expected`, 'utf-8').trim();

  return { output, expected }
}

test('basic rules', (t) => {
  const { output, expected } = outputExpected("rules")([]);
  t.equal(output, expected, 'output matches expected');
  t.end();
});

test('basic declarations', (t) => {
  const { output, expected } = outputExpected("declarations")([])
  t.equal(output, expected, 'output matches expected');
  t.end();
});

test('basic media', (t) => {
  const { output, expected } = outputExpected("media")([])
  t.equal(output, expected, 'output matches expected');
  t.end();
});

test('different values', (t) => {
  const { output, expected } = outputExpected("values")([])
  t.equal(output, expected, 'output matches expected');
  t.end();
});

test('basic autoprefixing', (t) => {
  const { output, expected } = outputExpected("autoprefixer")([require('autoprefixer')])
  t.equal(output, expected, 'output matches expected');
  t.end();
});

test('important', (t) => {
  const { output, expected } = outputExpected("important")([])
  t.equal(output, expected, 'output matches expected');
  t.end();
});

test('names', (t) => {
  const { output, expected } = outputExpected("names")([])
  t.equal(output, expected, 'output matches expected');
  t.end();
});
