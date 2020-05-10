var h = require('vue').h;
var resolveDirective = require('vue').resolveDirective;
var withDirectives = require('vue').withDirectives;
function isObject(val) {
  return val !== null && typeof val === 'object';
}
function isVNode(value) {
  return value ? value._isVNode === true : false;
}
module.exports = function dynamicRender(type, propsOrChildren) {
  if (
    arguments.length > 1 &&
    isObject(propsOrChildren) &&
    !Array.isArray(propsOrChildren) &&
    !isVNode(propsOrChildren)
  ) {
    let directives = propsOrChildren['directives'];
    if (directives && directives.length > 0) {
      let directivesArr = directives.map((item) => {
        if (typeof item.dir === 'string') {
          item.name = item.dir;
        }
        if (typeof item.name === 'string') {
          item.dir = resolveDirective(item.name);
        }
        return [item.dir, item.value, item.arg, item.modifiers];
      });
      delete propsOrChildren['directives'];
      return withDirectives(h.call(this, ...arguments), directivesArr);
    }
  }
  return h.call(this, ...arguments);
};
