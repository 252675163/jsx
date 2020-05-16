'use strict';
var esutils = require('esutils');
var groupProps = require('./lib/group-props');
var addDefault = require('@babel/helper-module-imports').addDefault;
var addNamed = require('@babel/helper-module-imports').addNamed;
function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}
function isEmptyJSXText(node) {
  return node && node.type === 'JSXText' && !node.value.trim();
}

const syntaxJsx = _interopDefault(require('@babel/plugin-syntax-jsx'));
var isInsideJsxExpression = function (t, path) {
  if (!path.parentPath) {
    return false;
  }
  if (t.isJSXExpressionContainer(path.parentPath)) {
    return true;
  }
  return isInsideJsxExpression(t, path.parentPath);
};

module.exports = function (babel) {
  var t = babel.types;

  return {
    inherits: syntaxJsx,
    visitor: {
      JSXNamespacedName(path) {
        throw path.buildCodeFrameError(
          'Namespaced tags/attributes are not supported. JSX is not XML.\n' +
            'For attributes like xlink:href, use xlinkHref instead.',
        );
      },
      Program(path) {
        path.traverse({
          'ObjectMethod|ClassMethod|ArrowFunctionExpression|FunctionDeclaration'(path) {
            const params = path.get('params');

            // do nothing if there is no JSX inside
            const jsxChecker = {
              hasJsx: false,
            };
            path.traverse(
              {
                JSXElement() {
                  this.hasJsx = true;
                },
              },
              jsxChecker,
            );
            if (!jsxChecker.hasJsx) {
              return;
            }
            // do nothing if this method is a part of JSX expression
            if (isInsideJsxExpression(t, path)) {
              return;
            }

            // inject h otherwise
            var _h = addDefault(path, 'babel-plugin-transform-jsx-vue3/injectCode/dynamicRender');
            path.traverse({
              'JSXElement|JSXFragment': {
                exit(path2) {
                  var callExpr;
                  if (path2.type === 'JSXFragment') {
                    callExpr = t.callExpression(_h, [addNamed(path2, 'Fragment', 'vue')]);
                  } else {
                    // turn tag into createElement call
                    callExpr = buildElementCall(path2.get('openingElement'), _h);
                  }
                  const withoutEmptynodes = path2.node.children.filter(
                    (node) => !isEmptyJSXText(node),
                  );
                  if (withoutEmptynodes.length) {
                    // add children array as 3rd arg
                    callExpr.arguments.push(t.arrayExpression(withoutEmptynodes));
                  }
                  path2.replaceWith(t.inherits(callExpr, path2.node));
                },
              },
            });
          },
          JSXOpeningElement(path) {
            const tag = path.get('name').node.name;
            const attributes = path.get('attributes');
            const typeAttribute = attributes.find(
              (attributePath) => attributePath.node.name && attributePath.node.name.name === 'type',
            );
            const type =
              typeAttribute && t.isStringLiteral(typeAttribute.node.value)
                ? typeAttribute.node.value.value
                : null;

            attributes.forEach((attributePath) => {
              const attribute = attributePath.get('name');

              if (!attribute.node) {
                return;
              }
            });
          },
        });
      },
    },
  };

  function buildElementCall(path, _h) {
    path.parent.children = t.react.buildChildren(path.parent);
    var tagExpr = convertJSXIdentifier(path.node.name, path.node);
    var args = [];

    var tagName;
    if (t.isIdentifier(tagExpr)) {
      tagName = tagExpr.name;
    } else if (t.isLiteral(tagExpr)) {
      tagName = tagExpr.value;
    }

    if (t.react.isCompatTag(tagName)) {
      args.push(t.stringLiteral(tagName));
    } else {
      args.push(tagExpr);
    }

    var attribs = path.node.attributes;
    if (attribs.length) {
      attribs = buildOpeningElementAttributes(attribs, path);
      args.push(attribs);
    }
    return t.callExpression(_h, args);
  }

  function convertJSXIdentifier(node, parent) {
    if (t.isJSXIdentifier(node)) {
      if (node.name === 'this' && t.isReferenced(node, parent)) {
        return t.thisExpression();
      } else if (esutils.keyword.isIdentifierNameES6(node.name)) {
        node.type = 'Identifier';
      } else {
        return t.stringLiteral(node.name);
      }
    } else if (t.isJSXMemberExpression(node)) {
      return t.memberExpression(
        convertJSXIdentifier(node.object, node),
        convertJSXIdentifier(node.property, node),
      );
    }
    return node;
  }

  /**
   * The logic for this is quite terse. It's because we need to
   * support spread elements. We loop over all attributes,
   * breaking on spreads, we then push a new object containing
   * all prior attributes to an array for later processing.
   */

  function buildOpeningElementAttributes(attribs, path) {
    var _props = [];
    var objs = [];

    function pushProps() {
      if (!_props.length) return;
      objs.push(t.objectExpression(_props));
      _props = [];
    }

    while (attribs.length) {
      var prop = attribs.shift();
      if (t.isJSXSpreadAttribute(prop)) {
        pushProps();
        prop.argument._isSpread = true;
        objs.push(prop.argument);
      } else {
        _props.push(convertAttribute(prop));
      }
    }

    pushProps();

    objs = objs.map(function (o) {
      return o._isSpread ? o : groupProps(o.properties, t);
    });
    if (objs.length === 1 && !objs[0]._isSpread) {
      attribs = objs[0];
      return attribs;
    }

    // add prop merging helper
    var helper = addNamed(path, 'mergeProps', 'vue');
    // mergeProps function does not support one argument
    if (objs.length === 1) objs = [t.objectExpression([])].concat(objs);
    // spread it
    attribs = t.callExpression(helper, [...objs]);
    return attribs;
  }

  function convertAttribute(node) {
    var value = convertAttributeValue(node.value || t.booleanLiteral(true));
    if (t.isStringLiteral(value) && !t.isJSXExpressionContainer(node.value)) {
      value.value = value.value.replace(/\n\s+/g, ' ');
    }
    if (t.isValidIdentifier(node.name.name)) {
      node.name.type = 'Identifier';
    } else {
      node.name = t.stringLiteral(node.name.name);
    }
    return t.inherits(t.objectProperty(node.name, value), node);
  }

  function convertAttributeValue(node) {
    if (t.isJSXExpressionContainer(node)) {
      return node.expression;
    } else {
      return node;
    }
  }
};
