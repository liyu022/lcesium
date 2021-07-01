/**
 * Returns the first parameter if not undefined, otherwise the second parameter.
 * Useful for setting a default value for a parameter.
 *
 * @function
 *
 * @param {*} a
 * @param {*} b
 * @returns {*} Returns the first parameter if not undefined, otherwise the second parameter.
 *
 * @example
 * param = Cesium.defaultValue(param, 'default');
 */
function defaultValue(a, b) {
  if (a !== undefined && a !== null) {
    return a;
  }
  return b;
}

/**
 * Object.freeze({})方法可以冻结一个对象。一个被冻结的对象再也不能被修改；
 * 冻结了一个对象则不能向这个对象添加新的属性，
 * 不能删除已有属性，不能修改该对象已有属性的可枚举性、
 * 可配置性、可写性，以及不能修改已有属性的值。
 * 此外，冻结一个对象后该对象的原型也不能被修改。freeze() 返回和传入的参数相同的对象。
 * @type {Object}
 * @memberof defaultValue
 */
defaultValue.EMPTY_OBJECT = Object.freeze({});

export default defaultValue;
