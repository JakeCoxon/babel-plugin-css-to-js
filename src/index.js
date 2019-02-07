const postcss = require('postcss');
const safe = require('postcss-safe-parser');
const camelCase = require('camelcase');

module.exports = function({types: t}) {
  return {
    visitor: {
      TaggedTemplateExpression: function(path, state) {
        if (path.node.tag.name !== 'css') {
          return false;
        }

        const nodeQuasis = path.node.quasi.quasis;
        const nodeExprs = path.node.quasi.expressions;

        const css = nodeQuasis.reduce((acc, quasi, i) => {
          const expr = nodeExprs[i] ? expressionPlaceholder(i) : '';
          return acc + quasi.value.raw + expr;
        }, '');

        const pluginsOpts = state.opts.plugins || [];

        const plugins = pluginsOpts.map(handlePlugin);

        const processed = postcss(plugins)
          .process(css, {parser: safe, from: this.file.opts.filename}).root;

        const objectExpression = buildObjectAst(t, processed.nodes, nodeExprs);
        path.replaceWith(objectExpression);

      },
    }
  };
};

function buildObjectAst(t, nodes, nodeExprs) {
  const properties = nodes.map(node => {

    let key, valueExpr;
    if (node.type == 'decl') {
      key = node.prop;
      valueExpr = buildInterpolatedAst(
        t, 
        node.important ? `${node.value} !important` : node.value, 
        nodeExprs, 
      )[0];
    } else if (node.type == 'rule') {
      key = node.selector;
      valueExpr = buildObjectAst(t, node.nodes, nodeExprs)
    } else if (node.type == 'atrule') {
      key = `@${node.name} ${node.params}`;
      valueExpr = buildObjectAst(t, node.nodes, nodeExprs);
    }
    
    let [keyExpr, computed] = buildInterpolatedAst(t, key, nodeExprs);

    if (node.type == 'decl' && !computed && t.isStringLiteral(keyExpr)) {
      keyExpr = t.identifier(camelCase(keyExpr.value));
    }

    return t.objectProperty(keyExpr, valueExpr, computed)

  })

  return t.objectExpression(properties);
}

function isNumeric(x) {
  return !isNaN(x);
}

function buildInterpolatedAst(t, value, nodeExprs) {

  const { quasis, exprs } = splitExpressions(value);
  if (quasis.length == 2 && quasis[0].length == 0 && quasis[1].length == 0) {
    return [nodeExprs[exprs[0]], true];
  }

  if (quasis.length == 1) {
    if (isNumeric(quasis[0])) {
      return [t.numericLiteral(+quasis[0]), false];
    }
    return [t.stringLiteral(quasis[0]), false]
  }

  const quasisAst = buildQuasisAst(t, quasis);
  const exprsAst = exprs.map(exprIndex => nodeExprs[exprIndex]);
  return [t.templateLiteral(quasisAst, exprsAst), true];
}

function handlePlugin(pluginArg) {
  if (Array.isArray(pluginArg)) {
    return require(pluginArg[0]).apply(null, pluginArg.slice(1));
  } else if (typeof pluginArg === 'string') {
    return require(pluginArg);
  } else {
    return pluginArg;
  }
}

function expressionPlaceholder(i) {
  return 'QUASI_EXPR_' + i + '___';
}

function buildQuasisAst(t, quasis) {
  return quasis.map((quasi, i) => {
    const isTail = i === quasis.length - 1;
    return t.templateElement({raw: quasi, cooked: quasi}, isTail);
  });
}

const regex = /QUASI_EXPR_(\d+)___/g;

function splitExpressions(css) {
  let found, matches = [];
  while (found = regex.exec(css)) {
    matches.push(found);
  }

  const reduction = matches.reduce((acc, match) => {
    acc.quasis.push(css.substring(acc.prevEnd, match.index));
    const [placeholder, exprIndex] = match;
    acc.exprs.push(exprIndex);
    acc.prevEnd = match.index + placeholder.length;
    return acc;
  }, {prevEnd: 0, quasis: [], exprs: []});

  reduction.quasis.push(css.substring(reduction.prevEnd, css.length));

  return {
    quasis: reduction.quasis,
    exprs: reduction.exprs
  };
}
