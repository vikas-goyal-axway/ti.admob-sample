'use strict';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
  return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global_1 =
// eslint-disable-next-line no-undef
check(typeof globalThis == 'object' && globalThis) ||
check(typeof window == 'object' && window) ||
check(typeof self == 'object' && self) ||
check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
// eslint-disable-next-line no-new-func
Function('return this')();

var fails = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

// Thank's IE8 for his funny defineProperty
var descriptors = !fails(function () {
  return Object.defineProperty({}, 'a', { get: function () {return 7;} }).a != 7;
});

var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;

var objectPropertyIsEnumerable = {
  f: f };


var createPropertyDescriptor = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value };

};

var toString = {}.toString;

var classofRaw = function (it) {
  return toString.call(it).slice(8, -1);
};

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var indexedObject = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;

// `RequireObjectCoercible` abstract operation
// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};

// toObject with fallback for non-array-like ES3 strings



var toIndexedObject = function (it) {
  return indexedObject(requireObjectCoercible(it));
};

var isObject = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

// `ToPrimitive` abstract operation
// https://tc39.github.io/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
var toPrimitive = function (input, PREFERRED_STRING) {
  if (!isObject(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var hasOwnProperty = {}.hasOwnProperty;

var has = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var document$1 = global_1.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document$1) && isObject(document$1.createElement);

var documentCreateElement = function (it) {
  return EXISTS ? document$1.createElement(it) : {};
};

// Thank's IE8 for his funny defineProperty
var ie8DomDefine = !descriptors && !fails(function () {
  return Object.defineProperty(documentCreateElement('div'), 'a', {
    get: function () {return 7;} }).
  a != 7;
});

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (ie8DomDefine) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) {/* empty */}
  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
};

var objectGetOwnPropertyDescriptor = {
  f: f$1 };


var anObject = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  }return it;
};

var nativeDefineProperty = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (ie8DomDefine) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) {/* empty */}
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var objectDefineProperty = {
  f: f$2 };


var createNonEnumerableProperty = descriptors ? function (object, key, value) {
  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var setGlobal = function (key, value) {
  try {
    createNonEnumerableProperty(global_1, key, value);
  } catch (error) {
    global_1[key] = value;
  }return value;
};

var SHARED = '__core-js_shared__';
var store = global_1[SHARED] || setGlobal(SHARED, {});

var sharedStore = store;

var functionToString = Function.toString;

// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
if (typeof sharedStore.inspectSource != 'function') {
  sharedStore.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

var inspectSource = sharedStore.inspectSource;

var WeakMap = global_1.WeakMap;

var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

var shared = createCommonjsModule(function (module) {
  (module.exports = function (key, value) {
    return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: '3.6.1',
    mode: 'global',
    copyright: '© 2019 Denis Pushkarev (zloirock.ru)' });

});

var id = 0;
var postfix = Math.random();

var uid = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};

var keys = shared('keys');

var sharedKey = function (key) {
  return keys[key] || (keys[key] = uid(key));
};

var hiddenKeys = {};

var WeakMap$1 = global_1.WeakMap;
var set, get, has$1;

var enforce = function (it) {
  return has$1(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    }return state;
  };
};

if (nativeWeakMap) {
  var store$1 = new WeakMap$1();
  var wmget = store$1.get;
  var wmhas = store$1.has;
  var wmset = store$1.set;
  set = function (it, metadata) {
    wmset.call(store$1, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget.call(store$1, it) || {};
  };
  has$1 = function (it) {
    return wmhas.call(store$1, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return has(it, STATE) ? it[STATE] : {};
  };
  has$1 = function (it) {
    return has(it, STATE);
  };
}

var internalState = {
  set: set,
  get: get,
  has: has$1,
  enforce: enforce,
  getterFor: getterFor };


var redefine = createCommonjsModule(function (module) {
  var getInternalState = internalState.get;
  var enforceInternalState = internalState.enforce;
  var TEMPLATE = String(String).split('String');

  (module.exports = function (O, key, value, options) {
    var unsafe = options ? !!options.unsafe : false;
    var simple = options ? !!options.enumerable : false;
    var noTargetGet = options ? !!options.noTargetGet : false;
    if (typeof value == 'function') {
      if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
      enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
    }
    if (O === global_1) {
      if (simple) O[key] = value;else
      setGlobal(key, value);
      return;
    } else if (!unsafe) {
      delete O[key];
    } else if (!noTargetGet && O[key]) {
      simple = true;
    }
    if (simple) O[key] = value;else
    createNonEnumerableProperty(O, key, value);
    // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  })(Function.prototype, 'toString', function toString() {
    return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
  });
});

var path = global_1;

var aFunction = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

var getBuiltIn = function (namespace, method) {
  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace]) :
  path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
};

var ceil = Math.ceil;
var floor = Math.floor;

// `ToInteger` abstract operation
// https://tc39.github.io/ecma262/#sec-tointeger
var toInteger = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.github.io/ecma262/#sec-tolength
var toLength = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

var max = Math.max;
var min$1 = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
var toAbsoluteIndex = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
};

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
      // Array#indexOf ignores holes, Array#includes - not
    } else for (; length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    }return !IS_INCLUDES && -1;
  };
};

var arrayIncludes = {
  // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false) };


var indexOf = arrayIncludes.indexOf;


var objectKeysInternal = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }
  return result;
};

// IE8- don't enum bug keys
var enumBugKeys = [
'constructor',
'hasOwnProperty',
'isPrototypeOf',
'propertyIsEnumerable',
'toLocaleString',
'toString',
'valueOf'];


var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return objectKeysInternal(O, hiddenKeys$1);
};

var objectGetOwnPropertyNames = {
  f: f$3 };


var f$4 = Object.getOwnPropertySymbols;

var objectGetOwnPropertySymbols = {
  f: f$4 };


// all object keys, includes non-enumerable and symbols
var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = objectGetOwnPropertyNames.f(anObject(it));
  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};

var copyConstructorProperties = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = objectDefineProperty.f;
  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true :
  value == NATIVE ? false :
  typeof detection == 'function' ? fails(detection) :
  !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

var isForced_1 = isForced;

var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






/*
                                                                     options.target      - name of the target object
                                                                     options.global      - target is the global object
                                                                     options.stat        - export as static methods of target
                                                                     options.proto       - export as prototype methods of target
                                                                     options.real        - real prototype method for the `pure` version
                                                                     options.forced      - export even if the native feature is available
                                                                     options.bind        - bind methods to the target, required for the `pure` version
                                                                     options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
                                                                     options.unsafe      - use the simple assignment of property instead of delete + defineProperty
                                                                     options.sham        - add a flag to not completely full polyfills
                                                                     options.enumerable  - export as enumerable property
                                                                     options.noTargetGet - prevent calling a getter on target
                                                                   */
var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global_1;
  } else if (STATIC) {
    target = global_1[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global_1[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor$1(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || targetProperty && targetProperty.sham) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    // extend global
    redefine(target, key, sourceProperty, options);
  }
};

var defineProperty = objectDefineProperty.f;


var NativeSymbol = global_1.Symbol;

if (descriptors && typeof NativeSymbol == 'function' && (!('description' in NativeSymbol.prototype) ||
// Safari 12 bug
NativeSymbol().description !== undefined))
{
  var EmptyStringDescriptionStore = {};
  // wrap Symbol constructor for correct work with undefined description
  var SymbolWrapper = function Symbol() {
    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : String(arguments[0]);
    var result = this instanceof SymbolWrapper ?
    new NativeSymbol(description)
    // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
    : description === undefined ? NativeSymbol() : NativeSymbol(description);
    if (description === '') EmptyStringDescriptionStore[result] = true;
    return result;
  };
  copyConstructorProperties(SymbolWrapper, NativeSymbol);
  var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
  symbolPrototype.constructor = SymbolWrapper;

  var symbolToString = symbolPrototype.toString;
  var native = String(NativeSymbol('test')) == 'Symbol(test)';
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  defineProperty(symbolPrototype, 'description', {
    configurable: true,
    get: function description() {
      var symbol = isObject(this) ? this.valueOf() : this;
      var string = symbolToString.call(symbol);
      if (has(EmptyStringDescriptionStore, symbol)) return '';
      var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
      return desc === '' ? undefined : desc;
    } });


  _export({ global: true, forced: true }, {
    Symbol: SymbolWrapper });

}

var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
  // Chrome 38 Symbol has incorrect toString conversion
  // eslint-disable-next-line no-undef
  return !String(Symbol());
});

var useSymbolAsUid = nativeSymbol
// eslint-disable-next-line no-undef
&& !Symbol.sham
// eslint-disable-next-line no-undef
&& typeof Symbol.iterator == 'symbol';

var WellKnownSymbolsStore = shared('wks');
var Symbol$1 = global_1.Symbol;
var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

var wellKnownSymbol = function (name) {
  if (!has(WellKnownSymbolsStore, name)) {
    if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];else
    WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
  }return WellKnownSymbolsStore[name];
};

var f$5 = wellKnownSymbol;

var wrappedWellKnownSymbol = {
  f: f$5 };


var defineProperty$1 = objectDefineProperty.f;

var defineWellKnownSymbol = function (NAME) {
  var Symbol = path.Symbol || (path.Symbol = {});
  if (!has(Symbol, NAME)) defineProperty$1(Symbol, NAME, {
    value: wrappedWellKnownSymbol.f(NAME) });

};

// `Symbol.asyncIterator` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.asynciterator
defineWellKnownSymbol('asyncIterator');

// `IsArray` abstract operation
// https://tc39.github.io/ecma262/#sec-isarray
var isArray = Array.isArray || function isArray(arg) {
  return classofRaw(arg) == 'Array';
};

var aFunction$1 = function (it) {
  if (typeof it != 'function') {
    throw TypeError(String(it) + ' is not a function');
  }return it;
};

// optional / simple context binding
var bindContext = function (fn, that, length) {
  aFunction$1(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 0:return function () {
        return fn.call(that);
      };
    case 1:return function (a) {
        return fn.call(that, a);
      };
    case 2:return function (a, b) {
        return fn.call(that, a, b);
      };
    case 3:return function (a, b, c) {
        return fn.call(that, a, b, c);
      };}

  return function () /* ...args */{
    return fn.apply(that, arguments);
  };
};

// `FlattenIntoArray` abstract operation
// https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray
var flattenIntoArray = function (target, original, source, sourceLen, start, depth, mapper, thisArg) {
  var targetIndex = start;
  var sourceIndex = 0;
  var mapFn = mapper ? bindContext(mapper, thisArg, 3) : false;
  var element;

  while (sourceIndex < sourceLen) {
    if (sourceIndex in source) {
      element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];

      if (depth > 0 && isArray(element)) {
        targetIndex = flattenIntoArray(target, original, element, toLength(element.length), targetIndex, depth - 1) - 1;
      } else {
        if (targetIndex >= 0x1FFFFFFFFFFFFF) throw TypeError('Exceed the acceptable array length');
        target[targetIndex] = element;
      }

      targetIndex++;
    }
    sourceIndex++;
  }
  return targetIndex;
};

var flattenIntoArray_1 = flattenIntoArray;

// `ToObject` abstract operation
// https://tc39.github.io/ecma262/#sec-toobject
var toObject = function (argument) {
  return Object(requireObjectCoercible(argument));
};

var SPECIES = wellKnownSymbol('species');

// `ArraySpeciesCreate` abstract operation
// https://tc39.github.io/ecma262/#sec-arrayspeciescreate
var arraySpeciesCreate = function (originalArray, length) {
  var C;
  if (isArray(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;else
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  }return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
};

// `Array.prototype.flat` method
// https://github.com/tc39/proposal-flatMap
_export({ target: 'Array', proto: true }, {
  flat: function flat() /* depthArg = 1 */{
    var depthArg = arguments.length ? arguments[0] : undefined;
    var O = toObject(this);
    var sourceLen = toLength(O.length);
    var A = arraySpeciesCreate(O, 0);
    A.length = flattenIntoArray_1(A, O, O, sourceLen, 0, depthArg === undefined ? 1 : toInteger(depthArg));
    return A;
  } });


// `Array.prototype.flatMap` method
// https://github.com/tc39/proposal-flatMap
_export({ target: 'Array', proto: true }, {
  flatMap: function flatMap(callbackfn /* , thisArg */) {
    var O = toObject(this);
    var sourceLen = toLength(O.length);
    var A;
    aFunction$1(callbackfn);
    A = arraySpeciesCreate(O, 0);
    A.length = flattenIntoArray_1(A, O, O, sourceLen, 0, 1, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return A;
  } });


var nativeReverse = [].reverse;
var test = [1, 2];

// `Array.prototype.reverse` method
// https://tc39.github.io/ecma262/#sec-array.prototype.reverse
// fix for Safari 12.0 bug
// https://bugs.webkit.org/show_bug.cgi?id=188794
_export({ target: 'Array', proto: true, forced: String(test) === String(test.reverse()) }, {
  reverse: function reverse() {
    // eslint-disable-next-line no-self-assign
    if (isArray(this)) this.length = this.length;
    return nativeReverse.call(this);
  } });


var sloppyArrayMethod = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !method || !fails(function () {
    // eslint-disable-next-line no-useless-call,no-throw-literal
    method.call(null, argument || function () {throw 1;}, 1);
  });
};

var test$1 = [];
var nativeSort = test$1.sort;

// IE8-
var FAILS_ON_UNDEFINED = fails(function () {
  test$1.sort(undefined);
});
// V8 bug
var FAILS_ON_NULL = fails(function () {
  test$1.sort(null);
});
// Old WebKit
var SLOPPY_METHOD = sloppyArrayMethod('sort');

var FORCED = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || SLOPPY_METHOD;

// `Array.prototype.sort` method
// https://tc39.github.io/ecma262/#sec-array.prototype.sort
_export({ target: 'Array', proto: true, forced: FORCED }, {
  sort: function sort(comparefn) {
    return comparefn === undefined ?
    nativeSort.call(toObject(this)) :
    nativeSort.call(toObject(this), aFunction$1(comparefn));
  } });


// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
var objectKeys = Object.keys || function keys(O) {
  return objectKeysInternal(O, enumBugKeys);
};

// `Object.defineProperties` method
// https://tc39.github.io/ecma262/#sec-object.defineproperties
var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);
  return O;
};

var html = getBuiltIn('document', 'documentElement');

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey('IE_PROTO');

var EmptyConstructor = function () {/* empty */};

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    /* global ActiveXObject */
    activeXDocument = document.domain && new ActiveXObject('htmlfile');
  } catch (error) {/* ignore */}
  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys[IE_PROTO] = true;

// `Object.create` method
// https://tc39.github.io/ecma262/#sec-object.create
var objectCreate = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : objectDefineProperties(result, Properties);
};

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] == undefined) {
  objectDefineProperty.f(ArrayPrototype, UNSCOPABLES, {
    configurable: true,
    value: objectCreate(null) });

}

// add a key to Array.prototype[@@unscopables]
var addToUnscopables = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};

// this method was added to unscopables after implementation
// in popular engines, so it's moved to a separate module


addToUnscopables('flat');

// this method was added to unscopables after implementation
// in popular engines, so it's moved to a separate module


addToUnscopables('flatMap');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test$2 = {};

test$2[TO_STRING_TAG] = 'z';

var toStringTagSupport = String(test$2) === '[object z]';

var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () {return arguments;}()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) {/* empty */}
};

// getting tag from ES6+ `Object.prototype.toString`
var classof = toStringTagSupport ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
  // @@toStringTag case
  : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$1)) == 'string' ? tag
  // builtinTag case
  : CORRECT_ARGUMENTS ? classofRaw(O)
  // ES3 arguments fallback
  : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
};

var correctPrototypeGetter = !fails(function () {
  function F() {/* empty */}
  F.prototype.constructor = null;
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

var IE_PROTO$1 = sharedKey('IE_PROTO');
var ObjectPrototype = Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.getprototypeof
var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO$1)) return O[IE_PROTO$1];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  }return O instanceof Object ? ObjectPrototype : null;
};

var aPossiblePrototype = function (it) {
  if (!isObject(it) && it !== null) {
    throw TypeError("Can't set " + String(it) + ' as a prototype');
  }return it;
};

// `Object.setPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
    setter.call(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) {/* empty */}
  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter.call(O, proto);else
    O.__proto__ = proto;
    return O;
  };
}() : undefined);

var defineProperty$2 = objectDefineProperty.f;





var DataView = global_1.DataView;
var DataViewPrototype = DataView && DataView.prototype;
var Int8Array$1 = global_1.Int8Array;
var Int8ArrayPrototype = Int8Array$1 && Int8Array$1.prototype;
var Uint8ClampedArray$1 = global_1.Uint8ClampedArray;
var Uint8ClampedArrayPrototype = Uint8ClampedArray$1 && Uint8ClampedArray$1.prototype;
var TypedArray = Int8Array$1 && objectGetPrototypeOf(Int8Array$1);
var TypedArrayPrototype = Int8ArrayPrototype && objectGetPrototypeOf(Int8ArrayPrototype);
var ObjectPrototype$1 = Object.prototype;
var isPrototypeOf = ObjectPrototype$1.isPrototypeOf;

var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');
var TYPED_ARRAY_TAG = uid('TYPED_ARRAY_TAG');
var NATIVE_ARRAY_BUFFER = !!(global_1.ArrayBuffer && DataView);
// Fixing native typed arrays in Opera Presto crashes the browser, see #595
var NATIVE_ARRAY_BUFFER_VIEWS = NATIVE_ARRAY_BUFFER && !!objectSetPrototypeOf && classof(global_1.opera) !== 'Opera';
var TYPED_ARRAY_TAG_REQIRED = false;
var NAME;

var TypedArrayConstructorsList = {
  Int8Array: 1,
  Uint8Array: 1,
  Uint8ClampedArray: 1,
  Int16Array: 2,
  Uint16Array: 2,
  Int32Array: 4,
  Uint32Array: 4,
  Float32Array: 4,
  Float64Array: 8 };


var isView = function isView(it) {
  var klass = classof(it);
  return klass === 'DataView' || has(TypedArrayConstructorsList, klass);
};

var isTypedArray = function (it) {
  return isObject(it) && has(TypedArrayConstructorsList, classof(it));
};

var aTypedArray = function (it) {
  if (isTypedArray(it)) return it;
  throw TypeError('Target is not a typed array');
};

var aTypedArrayConstructor = function (C) {
  if (objectSetPrototypeOf) {
    if (isPrototypeOf.call(TypedArray, C)) return C;
  } else for (var ARRAY in TypedArrayConstructorsList) if (has(TypedArrayConstructorsList, NAME)) {
    var TypedArrayConstructor = global_1[ARRAY];
    if (TypedArrayConstructor && (C === TypedArrayConstructor || isPrototypeOf.call(TypedArrayConstructor, C))) {
      return C;
    }
  }throw TypeError('Target is not a typed array constructor');
};

var exportTypedArrayMethod = function (KEY, property, forced) {
  if (!descriptors) return;
  if (forced) for (var ARRAY in TypedArrayConstructorsList) {
    var TypedArrayConstructor = global_1[ARRAY];
    if (TypedArrayConstructor && has(TypedArrayConstructor.prototype, KEY)) {
      delete TypedArrayConstructor.prototype[KEY];
    }
  }
  if (!TypedArrayPrototype[KEY] || forced) {
    redefine(TypedArrayPrototype, KEY, forced ? property :
    NATIVE_ARRAY_BUFFER_VIEWS && Int8ArrayPrototype[KEY] || property);
  }
};

var exportTypedArrayStaticMethod = function (KEY, property, forced) {
  var ARRAY, TypedArrayConstructor;
  if (!descriptors) return;
  if (objectSetPrototypeOf) {
    if (forced) for (ARRAY in TypedArrayConstructorsList) {
      TypedArrayConstructor = global_1[ARRAY];
      if (TypedArrayConstructor && has(TypedArrayConstructor, KEY)) {
        delete TypedArrayConstructor[KEY];
      }
    }
    if (!TypedArray[KEY] || forced) {
      // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
      try {
        return redefine(TypedArray, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS && Int8Array$1[KEY] || property);
      } catch (error) {/* empty */}
    } else return;
  }
  for (ARRAY in TypedArrayConstructorsList) {
    TypedArrayConstructor = global_1[ARRAY];
    if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
      redefine(TypedArrayConstructor, KEY, property);
    }
  }
};

for (NAME in TypedArrayConstructorsList) {
  if (!global_1[NAME]) NATIVE_ARRAY_BUFFER_VIEWS = false;
}

// WebKit bug - typed arrays constructors prototype is Object.prototype
if (!NATIVE_ARRAY_BUFFER_VIEWS || typeof TypedArray != 'function' || TypedArray === Function.prototype) {
  // eslint-disable-next-line no-shadow
  TypedArray = function TypedArray() {
    throw TypeError('Incorrect invocation');
  };
  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME in TypedArrayConstructorsList) {
    if (global_1[NAME]) objectSetPrototypeOf(global_1[NAME], TypedArray);
  }
}

if (!NATIVE_ARRAY_BUFFER_VIEWS || !TypedArrayPrototype || TypedArrayPrototype === ObjectPrototype$1) {
  TypedArrayPrototype = TypedArray.prototype;
  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME in TypedArrayConstructorsList) {
    if (global_1[NAME]) objectSetPrototypeOf(global_1[NAME].prototype, TypedArrayPrototype);
  }
}

// WebKit bug - one more object in Uint8ClampedArray prototype chain
if (NATIVE_ARRAY_BUFFER_VIEWS && objectGetPrototypeOf(Uint8ClampedArrayPrototype) !== TypedArrayPrototype) {
  objectSetPrototypeOf(Uint8ClampedArrayPrototype, TypedArrayPrototype);
}

if (descriptors && !has(TypedArrayPrototype, TO_STRING_TAG$2)) {
  TYPED_ARRAY_TAG_REQIRED = true;
  defineProperty$2(TypedArrayPrototype, TO_STRING_TAG$2, { get: function () {
      return isObject(this) ? this[TYPED_ARRAY_TAG] : undefined;
    } });
  for (NAME in TypedArrayConstructorsList) if (global_1[NAME]) {
    createNonEnumerableProperty(global_1[NAME], TYPED_ARRAY_TAG, NAME);
  }
}

// WebKit bug - the same parent prototype for typed arrays and data view
if (NATIVE_ARRAY_BUFFER && objectSetPrototypeOf && objectGetPrototypeOf(DataViewPrototype) !== ObjectPrototype$1) {
  objectSetPrototypeOf(DataViewPrototype, ObjectPrototype$1);
}

var arrayBufferViewCore = {
  NATIVE_ARRAY_BUFFER: NATIVE_ARRAY_BUFFER,
  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS,
  TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQIRED && TYPED_ARRAY_TAG,
  aTypedArray: aTypedArray,
  aTypedArrayConstructor: aTypedArrayConstructor,
  exportTypedArrayMethod: exportTypedArrayMethod,
  exportTypedArrayStaticMethod: exportTypedArrayStaticMethod,
  isView: isView,
  isTypedArray: isTypedArray,
  TypedArray: TypedArray,
  TypedArrayPrototype: TypedArrayPrototype };


var redefineAll = function (target, src, options) {
  for (var key in src) redefine(target, key, src[key], options);
  return target;
};

var anInstance = function (it, Constructor, name) {
  if (!(it instanceof Constructor)) {
    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
  }return it;
};

// `ToIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-toindex
var toIndex = function (it) {
  if (it === undefined) return 0;
  var number = toInteger(it);
  var length = toLength(number);
  if (number !== length) throw RangeError('Wrong length or index');
  return length;
};

// IEEE754 conversions based on https://github.com/feross/ieee754
// eslint-disable-next-line no-shadow-restricted-names
var Infinity$1 = 1 / 0;
var abs = Math.abs;
var pow = Math.pow;
var floor$1 = Math.floor;
var log = Math.log;
var LN2 = Math.LN2;

var pack = function (number, mantissaLength, bytes) {
  var buffer = new Array(bytes);
  var exponentLength = bytes * 8 - mantissaLength - 1;
  var eMax = (1 << exponentLength) - 1;
  var eBias = eMax >> 1;
  var rt = mantissaLength === 23 ? pow(2, -24) - pow(2, -77) : 0;
  var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
  var index = 0;
  var exponent, mantissa, c;
  number = abs(number);
  // eslint-disable-next-line no-self-compare
  if (number != number || number === Infinity$1) {
    // eslint-disable-next-line no-self-compare
    mantissa = number != number ? 1 : 0;
    exponent = eMax;
  } else {
    exponent = floor$1(log(number) / LN2);
    if (number * (c = pow(2, -exponent)) < 1) {
      exponent--;
      c *= 2;
    }
    if (exponent + eBias >= 1) {
      number += rt / c;
    } else {
      number += rt * pow(2, 1 - eBias);
    }
    if (number * c >= 2) {
      exponent++;
      c /= 2;
    }
    if (exponent + eBias >= eMax) {
      mantissa = 0;
      exponent = eMax;
    } else if (exponent + eBias >= 1) {
      mantissa = (number * c - 1) * pow(2, mantissaLength);
      exponent = exponent + eBias;
    } else {
      mantissa = number * pow(2, eBias - 1) * pow(2, mantissaLength);
      exponent = 0;
    }
  }
  for (; mantissaLength >= 8; buffer[index++] = mantissa & 255, mantissa /= 256, mantissaLength -= 8);
  exponent = exponent << mantissaLength | mantissa;
  exponentLength += mantissaLength;
  for (; exponentLength > 0; buffer[index++] = exponent & 255, exponent /= 256, exponentLength -= 8);
  buffer[--index] |= sign * 128;
  return buffer;
};

var unpack = function (buffer, mantissaLength) {
  var bytes = buffer.length;
  var exponentLength = bytes * 8 - mantissaLength - 1;
  var eMax = (1 << exponentLength) - 1;
  var eBias = eMax >> 1;
  var nBits = exponentLength - 7;
  var index = bytes - 1;
  var sign = buffer[index--];
  var exponent = sign & 127;
  var mantissa;
  sign >>= 7;
  for (; nBits > 0; exponent = exponent * 256 + buffer[index], index--, nBits -= 8);
  mantissa = exponent & (1 << -nBits) - 1;
  exponent >>= -nBits;
  nBits += mantissaLength;
  for (; nBits > 0; mantissa = mantissa * 256 + buffer[index], index--, nBits -= 8);
  if (exponent === 0) {
    exponent = 1 - eBias;
  } else if (exponent === eMax) {
    return mantissa ? NaN : sign ? -Infinity$1 : Infinity$1;
  } else {
    mantissa = mantissa + pow(2, mantissaLength);
    exponent = exponent - eBias;
  }return (sign ? -1 : 1) * mantissa * pow(2, exponent - mantissaLength);
};

var ieee754 = {
  pack: pack,
  unpack: unpack };


// `Array.prototype.fill` method implementation
// https://tc39.github.io/ecma262/#sec-array.prototype.fill
var arrayFill = function fill(value /* , start = 0, end = @length */) {
  var O = toObject(this);
  var length = toLength(O.length);
  var argumentsLength = arguments.length;
  var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : undefined, length);
  var end = argumentsLength > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};

var defineProperty$3 = objectDefineProperty.f;



var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');

var setToStringTag = function (it, TAG, STATIC) {
  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG$3)) {
    defineProperty$3(it, TO_STRING_TAG$3, { configurable: true, value: TAG });
  }
};

var NATIVE_ARRAY_BUFFER$1 = arrayBufferViewCore.NATIVE_ARRAY_BUFFER;








var getOwnPropertyNames = objectGetOwnPropertyNames.f;
var defineProperty$4 = objectDefineProperty.f;




var getInternalState = internalState.get;
var setInternalState = internalState.set;
var ARRAY_BUFFER = 'ArrayBuffer';
var DATA_VIEW = 'DataView';
var PROTOTYPE$1 = 'prototype';
var WRONG_LENGTH = 'Wrong length';
var WRONG_INDEX = 'Wrong index';
var NativeArrayBuffer = global_1[ARRAY_BUFFER];
var $ArrayBuffer = NativeArrayBuffer;
var $DataView = global_1[DATA_VIEW];
var RangeError$1 = global_1.RangeError;

var packIEEE754 = ieee754.pack;
var unpackIEEE754 = ieee754.unpack;

var packInt8 = function (number) {
  return [number & 0xFF];
};

var packInt16 = function (number) {
  return [number & 0xFF, number >> 8 & 0xFF];
};

var packInt32 = function (number) {
  return [number & 0xFF, number >> 8 & 0xFF, number >> 16 & 0xFF, number >> 24 & 0xFF];
};

var unpackInt32 = function (buffer) {
  return buffer[3] << 24 | buffer[2] << 16 | buffer[1] << 8 | buffer[0];
};

var packFloat32 = function (number) {
  return packIEEE754(number, 23, 4);
};

var packFloat64 = function (number) {
  return packIEEE754(number, 52, 8);
};

var addGetter = function (Constructor, key) {
  defineProperty$4(Constructor[PROTOTYPE$1], key, { get: function () {return getInternalState(this)[key];} });
};

var get$1 = function (view, count, index, isLittleEndian) {
  var intIndex = toIndex(index);
  var store = getInternalState(view);
  if (intIndex + count > store.byteLength) throw RangeError$1(WRONG_INDEX);
  var bytes = getInternalState(store.buffer).bytes;
  var start = intIndex + store.byteOffset;
  var pack = bytes.slice(start, start + count);
  return isLittleEndian ? pack : pack.reverse();
};

var set$1 = function (view, count, index, conversion, value, isLittleEndian) {
  var intIndex = toIndex(index);
  var store = getInternalState(view);
  if (intIndex + count > store.byteLength) throw RangeError$1(WRONG_INDEX);
  var bytes = getInternalState(store.buffer).bytes;
  var start = intIndex + store.byteOffset;
  var pack = conversion(+value);
  for (var i = 0; i < count; i++) bytes[start + i] = pack[isLittleEndian ? i : count - i - 1];
};

if (!NATIVE_ARRAY_BUFFER$1) {
  $ArrayBuffer = function ArrayBuffer(length) {
    anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
    var byteLength = toIndex(length);
    setInternalState(this, {
      bytes: arrayFill.call(new Array(byteLength), 0),
      byteLength: byteLength });

    if (!descriptors) this.byteLength = byteLength;
  };

  $DataView = function DataView(buffer, byteOffset, byteLength) {
    anInstance(this, $DataView, DATA_VIEW);
    anInstance(buffer, $ArrayBuffer, DATA_VIEW);
    var bufferLength = getInternalState(buffer).byteLength;
    var offset = toInteger(byteOffset);
    if (offset < 0 || offset > bufferLength) throw RangeError$1('Wrong offset');
    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
    if (offset + byteLength > bufferLength) throw RangeError$1(WRONG_LENGTH);
    setInternalState(this, {
      buffer: buffer,
      byteLength: byteLength,
      byteOffset: offset });

    if (!descriptors) {
      this.buffer = buffer;
      this.byteLength = byteLength;
      this.byteOffset = offset;
    }
  };

  if (descriptors) {
    addGetter($ArrayBuffer, 'byteLength');
    addGetter($DataView, 'buffer');
    addGetter($DataView, 'byteLength');
    addGetter($DataView, 'byteOffset');
  }

  redefineAll($DataView[PROTOTYPE$1], {
    getInt8: function getInt8(byteOffset) {
      return get$1(this, 1, byteOffset)[0] << 24 >> 24;
    },
    getUint8: function getUint8(byteOffset) {
      return get$1(this, 1, byteOffset)[0];
    },
    getInt16: function getInt16(byteOffset /* , littleEndian */) {
      var bytes = get$1(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
    },
    getUint16: function getUint16(byteOffset /* , littleEndian */) {
      var bytes = get$1(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
      return bytes[1] << 8 | bytes[0];
    },
    getInt32: function getInt32(byteOffset /* , littleEndian */) {
      return unpackInt32(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined));
    },
    getUint32: function getUint32(byteOffset /* , littleEndian */) {
      return unpackInt32(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined)) >>> 0;
    },
    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
      return unpackIEEE754(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 23);
    },
    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
      return unpackIEEE754(get$1(this, 8, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 52);
    },
    setInt8: function setInt8(byteOffset, value) {
      set$1(this, 1, byteOffset, packInt8, value);
    },
    setUint8: function setUint8(byteOffset, value) {
      set$1(this, 1, byteOffset, packInt8, value);
    },
    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
      set$1(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
      set$1(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
      set$1(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
      set$1(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
      set$1(this, 4, byteOffset, packFloat32, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
      set$1(this, 8, byteOffset, packFloat64, value, arguments.length > 2 ? arguments[2] : undefined);
    } });

} else {
  if (!fails(function () {
    NativeArrayBuffer(1);
  }) || !fails(function () {
    new NativeArrayBuffer(-1); // eslint-disable-line no-new
  }) || fails(function () {
    new NativeArrayBuffer(); // eslint-disable-line no-new
    new NativeArrayBuffer(1.5); // eslint-disable-line no-new
    new NativeArrayBuffer(NaN); // eslint-disable-line no-new
    return NativeArrayBuffer.name != ARRAY_BUFFER;
  })) {
    $ArrayBuffer = function ArrayBuffer(length) {
      anInstance(this, $ArrayBuffer);
      return new NativeArrayBuffer(toIndex(length));
    };
    var ArrayBufferPrototype = $ArrayBuffer[PROTOTYPE$1] = NativeArrayBuffer[PROTOTYPE$1];
    for (var keys$1 = getOwnPropertyNames(NativeArrayBuffer), j = 0, key; keys$1.length > j;) {
      if (!((key = keys$1[j++]) in $ArrayBuffer)) {
        createNonEnumerableProperty($ArrayBuffer, key, NativeArrayBuffer[key]);
      }
    }
    ArrayBufferPrototype.constructor = $ArrayBuffer;
  }
  // iOS Safari 7.x bug
  var testView = new $DataView(new $ArrayBuffer(2));
  var nativeSetInt8 = $DataView[PROTOTYPE$1].setInt8;
  testView.setInt8(0, 2147483648);
  testView.setInt8(1, 2147483649);
  if (testView.getInt8(0) || !testView.getInt8(1)) redefineAll($DataView[PROTOTYPE$1], {
    setInt8: function setInt8(byteOffset, value) {
      nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value) {
      nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
    } },
  { unsafe: true });
}

setToStringTag($ArrayBuffer, ARRAY_BUFFER);
setToStringTag($DataView, DATA_VIEW);

var arrayBuffer = {
  ArrayBuffer: $ArrayBuffer,
  DataView: $DataView };


var SPECIES$1 = wellKnownSymbol('species');

var setSpecies = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
  var defineProperty = objectDefineProperty.f;

  if (descriptors && Constructor && !Constructor[SPECIES$1]) {
    defineProperty(Constructor, SPECIES$1, {
      configurable: true,
      get: function () {return this;} });

  }
};

var ARRAY_BUFFER$1 = 'ArrayBuffer';
var ArrayBuffer$1 = arrayBuffer[ARRAY_BUFFER$1];
var NativeArrayBuffer$1 = global_1[ARRAY_BUFFER$1];

// `ArrayBuffer` constructor
// https://tc39.github.io/ecma262/#sec-arraybuffer-constructor
_export({ global: true, forced: NativeArrayBuffer$1 !== ArrayBuffer$1 }, {
  ArrayBuffer: ArrayBuffer$1 });


setSpecies(ARRAY_BUFFER$1);

var SPECIES$2 = wellKnownSymbol('species');

// `SpeciesConstructor` abstract operation
// https://tc39.github.io/ecma262/#sec-speciesconstructor
var speciesConstructor = function (O, defaultConstructor) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES$2]) == undefined ? defaultConstructor : aFunction$1(S);
};

var ArrayBuffer$2 = arrayBuffer.ArrayBuffer;
var DataView$1 = arrayBuffer.DataView;
var nativeArrayBufferSlice = ArrayBuffer$2.prototype.slice;

var INCORRECT_SLICE = fails(function () {
  return !new ArrayBuffer$2(2).slice(1, undefined).byteLength;
});

// `ArrayBuffer.prototype.slice` method
// https://tc39.github.io/ecma262/#sec-arraybuffer.prototype.slice
_export({ target: 'ArrayBuffer', proto: true, unsafe: true, forced: INCORRECT_SLICE }, {
  slice: function slice(start, end) {
    if (nativeArrayBufferSlice !== undefined && end === undefined) {
      return nativeArrayBufferSlice.call(anObject(this), start); // FF fix
    }
    var length = anObject(this).byteLength;
    var first = toAbsoluteIndex(start, length);
    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
    var result = new (speciesConstructor(this, ArrayBuffer$2))(toLength(fin - first));
    var viewSource = new DataView$1(this);
    var viewTarget = new DataView$1(result);
    var index = 0;
    while (first < fin) {
      viewTarget.setUint8(index++, viewSource.getUint8(first++));
    }return result;
  } });


// a string of all valid unicode whitespaces
// eslint-disable-next-line max-len
var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var whitespace = '[' + whitespaces + ']';
var ltrim = RegExp('^' + whitespace + whitespace + '*');
var rtrim = RegExp(whitespace + whitespace + '*$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod$1 = function (TYPE) {
  return function ($this) {
    var string = String(requireObjectCoercible($this));
    if (TYPE & 1) string = string.replace(ltrim, '');
    if (TYPE & 2) string = string.replace(rtrim, '');
    return string;
  };
};

var stringTrim = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
  start: createMethod$1(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
  end: createMethod$1(2),
  // `String.prototype.trim` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.trim
  trim: createMethod$1(3) };


var trim = stringTrim.trim;


var nativeParseFloat = global_1.parseFloat;
var FORCED$1 = 1 / nativeParseFloat(whitespaces + '-0') !== -Infinity;

// `parseFloat` method
// https://tc39.github.io/ecma262/#sec-parsefloat-string
var _parseFloat = FORCED$1 ? function parseFloat(string) {
  var trimmedString = trim(String(string));
  var result = nativeParseFloat(trimmedString);
  return result === 0 && trimmedString.charAt(0) == '-' ? -0 : result;
} : nativeParseFloat;

// `Number.parseFloat` method
// https://tc39.github.io/ecma262/#sec-number.parseFloat
_export({ target: 'Number', stat: true, forced: Number.parseFloat != _parseFloat }, {
  parseFloat: _parseFloat });


var propertyIsEnumerable = objectPropertyIsEnumerable.f;

// `Object.{ entries, values }` methods implementation
var createMethod$2 = function (TO_ENTRIES) {
  return function (it) {
    var O = toIndexedObject(it);
    var keys = objectKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) {
      key = keys[i++];
      if (!descriptors || propertyIsEnumerable.call(O, key)) {
        result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
      }
    }
    return result;
  };
};

var objectToArray = {
  // `Object.entries` method
  // https://tc39.github.io/ecma262/#sec-object.entries
  entries: createMethod$2(true),
  // `Object.values` method
  // https://tc39.github.io/ecma262/#sec-object.values
  values: createMethod$2(false) };


var $entries = objectToArray.entries;

// `Object.entries` method
// https://tc39.github.io/ecma262/#sec-object.entries
_export({ target: 'Object', stat: true }, {
  entries: function entries(O) {
    return $entries(O);
  } });


var iterators = {};

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype$1 = Array.prototype;

// check on default Array iterator
var isArrayIteratorMethod = function (it) {
  return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR] === it);
};

var ITERATOR$1 = wellKnownSymbol('iterator');

var getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR$1] ||
  it['@@iterator'] ||
  iterators[classof(it)];
};

// call something on iterator step with safe closing on error
var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
    // 7.4.6 IteratorClose(iterator, completion)
  } catch (error) {
    var returnMethod = iterator['return'];
    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
    throw error;
  }
};

var iterate_1 = createCommonjsModule(function (module) {
  var Result = function (stopped, result) {
    this.stopped = stopped;
    this.result = result;
  };

  var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
    var boundFunction = bindContext(fn, that, AS_ENTRIES ? 2 : 1);
    var iterator, iterFn, index, length, result, next, step;

    if (IS_ITERATOR) {
      iterator = iterable;
    } else {
      iterFn = getIteratorMethod(iterable);
      if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
      // optimisation for array iterators
      if (isArrayIteratorMethod(iterFn)) {
        for (index = 0, length = toLength(iterable.length); length > index; index++) {
          result = AS_ENTRIES ?
          boundFunction(anObject(step = iterable[index])[0], step[1]) :
          boundFunction(iterable[index]);
          if (result && result instanceof Result) return result;
        }return new Result(false);
      }
      iterator = iterFn.call(iterable);
    }

    next = iterator.next;
    while (!(step = next.call(iterator)).done) {
      result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
      if (typeof result == 'object' && result && result instanceof Result) return result;
    }return new Result(false);
  };

  iterate.stop = function (result) {
    return new Result(true, result);
  };
});

var createProperty = function (object, key, value) {
  var propertyKey = toPrimitive(key);
  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));else
  object[propertyKey] = value;
};

// `Object.fromEntries` method
// https://github.com/tc39/proposal-object-from-entries
_export({ target: 'Object', stat: true }, {
  fromEntries: function fromEntries(iterable) {
    var obj = {};
    iterate_1(iterable, function (k, v) {
      createProperty(obj, k, v);
    }, undefined, true);
    return obj;
  } });


var $values = objectToArray.values;

// `Object.values` method
// https://tc39.github.io/ecma262/#sec-object.values
_export({ target: 'Object', stat: true }, {
  values: function values(O) {
    return $values(O);
  } });


var nativePromiseConstructor = global_1.Promise;

var ITERATOR$2 = wellKnownSymbol('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return { done: !!called++ };
    },
    'return': function () {
      SAFE_CLOSING = true;
    } };

  iteratorWithReturn[ITERATOR$2] = function () {
    return this;
  };
  // eslint-disable-next-line no-throw-literal
  Array.from(iteratorWithReturn, function () {throw 2;});
} catch (error) {/* empty */}

var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR$2] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        } };

    };
    exec(object);
  } catch (error) {/* empty */}
  return ITERATION_SUPPORT;
};

var userAgent = getBuiltIn('navigator', 'userAgent') || '';

var isIos = /(iphone|ipod|ipad).*applewebkit/i.test(userAgent);

var location = global_1.location;
var set$2 = global_1.setImmediate;
var clear = global_1.clearImmediate;
var process$1 = global_1.process;
var MessageChannel = global_1.MessageChannel;
var Dispatch = global_1.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;

var run = function (id) {
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};

var runner = function (id) {
  return function () {
    run(id);
  };
};

var listener = function (event) {
  run(event.data);
};

var post = function (id) {
  // old engines have not location.origin
  global_1.postMessage(id + '', location.protocol + '//' + location.host);
};

// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!set$2 || !clear) {
  set$2 = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
    };
    defer(counter);
    return counter;
  };
  clear = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (classofRaw(process$1) == 'process') {
    defer = function (id) {
      process$1.nextTick(runner(id));
    };
    // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(runner(id));
    };
    // Browsers with MessageChannel, includes WebWorkers
    // except iOS - https://github.com/zloirock/core-js/issues/624
  } else if (MessageChannel && !isIos) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = bindContext(port.postMessage, port, 1);
    // Browsers with postMessage, skip WebWorkers
    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global_1.addEventListener && typeof postMessage == 'function' && !global_1.importScripts && !fails(post)) {
    defer = post;
    global_1.addEventListener('message', listener, false);
    // IE8-
  } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
    defer = function (id) {
      html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run(id);
      };
    };
    // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(runner(id), 0);
    };
  }
}

var task = {
  set: set$2,
  clear: clear };


var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;

var macrotask = task.set;


var MutationObserver = global_1.MutationObserver || global_1.WebKitMutationObserver;
var process$2 = global_1.process;
var Promise$1 = global_1.Promise;
var IS_NODE = classofRaw(process$2) == 'process';
// Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
var queueMicrotaskDescriptor = getOwnPropertyDescriptor$2(global_1, 'queueMicrotask');
var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

var flush, head, last, notify, toggle, node, promise, then;

// modern engines have queueMicrotask method
if (!queueMicrotask) {
  flush = function () {
    var parent, fn;
    if (IS_NODE && (parent = process$2.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (error) {
        if (head) notify();else
        last = undefined;
        throw error;
      }
    }last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (IS_NODE) {
    notify = function () {
      process$2.nextTick(flush);
    };
    // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
  } else if (MutationObserver && !isIos) {
    toggle = true;
    node = document.createTextNode('');
    new MutationObserver(flush).observe(node, { characterData: true });
    notify = function () {
      node.data = toggle = !toggle;
    };
    // environments with maybe non-completely correct, but existent Promise
  } else if (Promise$1 && Promise$1.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    promise = Promise$1.resolve(undefined);
    then = promise.then;
    notify = function () {
      then.call(promise, flush);
    };
    // for other environments - macrotask based on:
    // - setImmediate
    // - MessageChannel
    // - window.postMessag
    // - onreadystatechange
    // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global_1, flush);
    };
  }
}

var microtask = queueMicrotask || function (fn) {
  var task = { fn: fn, next: undefined };
  if (last) last.next = task;
  if (!head) {
    head = task;
    notify();
  }last = task;
};

var PromiseCapability = function (C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction$1(resolve);
  this.reject = aFunction$1(reject);
};

// 25.4.1.5 NewPromiseCapability(C)
var f$6 = function (C) {
  return new PromiseCapability(C);
};

var newPromiseCapability = {
  f: f$6 };


var promiseResolve = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

var hostReportErrors = function (a, b) {
  var console = global_1.console;
  if (console && console.error) {
    arguments.length === 1 ? console.error(a) : console.error(a, b);
  }
};

var perform = function (exec) {
  try {
    return { error: false, value: exec() };
  } catch (error) {
    return { error: true, value: error };
  }
};

var process$3 = global_1.process;
var versions = process$3 && process$3.versions;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  version = match[0] + match[1];
} else if (userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version = match[1];
  }
}

var v8Version = version && +version;

var task$1 = task.set;










var SPECIES$3 = wellKnownSymbol('species');
var PROMISE = 'Promise';
var getInternalState$1 = internalState.get;
var setInternalState$1 = internalState.set;
var getInternalPromiseState = internalState.getterFor(PROMISE);
var PromiseConstructor = nativePromiseConstructor;
var TypeError$1 = global_1.TypeError;
var document$2 = global_1.document;
var process$4 = global_1.process;
var $fetch = getBuiltIn('fetch');
var newPromiseCapability$1 = newPromiseCapability.f;
var newGenericPromiseCapability = newPromiseCapability$1;
var IS_NODE$1 = classofRaw(process$4) == 'process';
var DISPATCH_EVENT = !!(document$2 && document$2.createEvent && global_1.dispatchEvent);
var UNHANDLED_REJECTION = 'unhandledrejection';
var REJECTION_HANDLED = 'rejectionhandled';
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;
var HANDLED = 1;
var UNHANDLED = 2;
var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

var FORCED$2 = isForced_1(PROMISE, function () {
  var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);
  if (!GLOBAL_CORE_JS_PROMISE) {
    // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
    // We can't detect it synchronously, so just check versions
    if (v8Version === 66) return true;
    // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    if (!IS_NODE$1 && typeof PromiseRejectionEvent != 'function') return true;
  }
  // We can't use @@species feature detection in V8 since it causes
  // deoptimization and performance degradation
  // https://github.com/zloirock/core-js/issues/679
  if (v8Version >= 51 && /native code/.test(PromiseConstructor)) return false;
  // Detect correctness of subclassing with @@species support
  var promise = PromiseConstructor.resolve(1);
  var FakePromise = function (exec) {
    exec(function () {/* empty */}, function () {/* empty */});
  };
  var constructor = promise.constructor = {};
  constructor[SPECIES$3] = FakePromise;
  return !(promise.then(function () {/* empty */}) instanceof FakePromise);
});

var INCORRECT_ITERATION = FORCED$2 || !checkCorrectnessOfIteration(function (iterable) {
  PromiseConstructor.all(iterable)['catch'](function () {/* empty */});
});

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};

var notify$1 = function (promise, state, isReject) {
  if (state.notified) return;
  state.notified = true;
  var chain = state.reactions;
  microtask(function () {
    var value = state.value;
    var ok = state.state == FULFILLED;
    var index = 0;
    // variable length - can't use forEach
    while (chain.length > index) {
      var reaction = chain[index++];
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (state.rejection === UNHANDLED) onHandleUnhandled(promise, state);
            state.rejection = HANDLED;
          }
          if (handler === true) result = value;else
          {
            if (domain) domain.enter();
            result = handler(value); // can throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError$1('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (error) {
        if (domain && !exited) domain.exit();
        reject(error);
      }
    }
    state.reactions = [];
    state.notified = false;
    if (isReject && !state.rejection) onUnhandled(promise, state);
  });
};

var dispatchEvent = function (name, promise, reason) {
  var event, handler;
  if (DISPATCH_EVENT) {
    event = document$2.createEvent('Event');
    event.promise = promise;
    event.reason = reason;
    event.initEvent(name, false, true);
    global_1.dispatchEvent(event);
  } else event = { promise: promise, reason: reason };
  if (handler = global_1['on' + name]) handler(event);else
  if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
};

var onUnhandled = function (promise, state) {
  task$1.call(global_1, function () {
    var value = state.value;
    var IS_UNHANDLED = isUnhandled(state);
    var result;
    if (IS_UNHANDLED) {
      result = perform(function () {
        if (IS_NODE$1) {
          process$4.emit('unhandledRejection', value, promise);
        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      state.rejection = IS_NODE$1 || isUnhandled(state) ? UNHANDLED : HANDLED;
      if (result.error) throw result.value;
    }
  });
};

var isUnhandled = function (state) {
  return state.rejection !== HANDLED && !state.parent;
};

var onHandleUnhandled = function (promise, state) {
  task$1.call(global_1, function () {
    if (IS_NODE$1) {
      process$4.emit('rejectionHandled', promise);
    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
  });
};

var bind = function (fn, promise, state, unwrap) {
  return function (value) {
    fn(promise, state, value, unwrap);
  };
};

var internalReject = function (promise, state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  state.value = value;
  state.state = REJECTED;
  notify$1(promise, state, true);
};

var internalResolve = function (promise, state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  try {
    if (promise === value) throw TypeError$1("Promise can't be resolved itself");
    var then = isThenable(value);
    if (then) {
      microtask(function () {
        var wrapper = { done: false };
        try {
          then.call(value,
          bind(internalResolve, promise, wrapper, state),
          bind(internalReject, promise, wrapper, state));

        } catch (error) {
          internalReject(promise, wrapper, error, state);
        }
      });
    } else {
      state.value = value;
      state.state = FULFILLED;
      notify$1(promise, state, false);
    }
  } catch (error) {
    internalReject(promise, { done: false }, error, state);
  }
};

// constructor polyfill
if (FORCED$2) {
  // 25.4.3.1 Promise(executor)
  PromiseConstructor = function Promise(executor) {
    anInstance(this, PromiseConstructor, PROMISE);
    aFunction$1(executor);
    Internal.call(this);
    var state = getInternalState$1(this);
    try {
      executor(bind(internalResolve, this, state), bind(internalReject, this, state));
    } catch (error) {
      internalReject(this, state, error);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    setInternalState$1(this, {
      type: PROMISE,
      done: false,
      notified: false,
      parent: false,
      reactions: [],
      rejection: false,
      state: PENDING,
      value: undefined });

  };
  Internal.prototype = redefineAll(PromiseConstructor.prototype, {
    // `Promise.prototype.then` method
    // https://tc39.github.io/ecma262/#sec-promise.prototype.then
    then: function then(onFulfilled, onRejected) {
      var state = getInternalPromiseState(this);
      var reaction = newPromiseCapability$1(speciesConstructor(this, PromiseConstructor));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = IS_NODE$1 ? process$4.domain : undefined;
      state.parent = true;
      state.reactions.push(reaction);
      if (state.state != PENDING) notify$1(this, state, false);
      return reaction.promise;
    },
    // `Promise.prototype.catch` method
    // https://tc39.github.io/ecma262/#sec-promise.prototype.catch
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    } });

  OwnPromiseCapability = function () {
    var promise = new Internal();
    var state = getInternalState$1(promise);
    this.promise = promise;
    this.resolve = bind(internalResolve, promise, state);
    this.reject = bind(internalReject, promise, state);
  };
  newPromiseCapability.f = newPromiseCapability$1 = function (C) {
    return C === PromiseConstructor || C === PromiseWrapper ?
    new OwnPromiseCapability(C) :
    newGenericPromiseCapability(C);
  };

  if (typeof nativePromiseConstructor == 'function') {
    nativeThen = nativePromiseConstructor.prototype.then;

    // wrap native Promise#then for native async functions
    redefine(nativePromiseConstructor.prototype, 'then', function then(onFulfilled, onRejected) {
      var that = this;
      return new PromiseConstructor(function (resolve, reject) {
        nativeThen.call(that, resolve, reject);
      }).then(onFulfilled, onRejected);
      // https://github.com/zloirock/core-js/issues/640
    }, { unsafe: true });

    // wrap fetch result
    if (typeof $fetch == 'function') _export({ global: true, enumerable: true, forced: true }, {
      // eslint-disable-next-line no-unused-vars
      fetch: function fetch(input /* , init */) {
        return promiseResolve(PromiseConstructor, $fetch.apply(global_1, arguments));
      } });

  }
}

_export({ global: true, wrap: true, forced: FORCED$2 }, {
  Promise: PromiseConstructor });


setToStringTag(PromiseConstructor, PROMISE, false);
setSpecies(PROMISE);

PromiseWrapper = getBuiltIn(PROMISE);

// statics
_export({ target: PROMISE, stat: true, forced: FORCED$2 }, {
  // `Promise.reject` method
  // https://tc39.github.io/ecma262/#sec-promise.reject
  reject: function reject(r) {
    var capability = newPromiseCapability$1(this);
    capability.reject.call(undefined, r);
    return capability.promise;
  } });


_export({ target: PROMISE, stat: true, forced: FORCED$2 }, {
  // `Promise.resolve` method
  // https://tc39.github.io/ecma262/#sec-promise.resolve
  resolve: function resolve(x) {
    return promiseResolve(this, x);
  } });


_export({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION }, {
  // `Promise.all` method
  // https://tc39.github.io/ecma262/#sec-promise.all
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability$1(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var $promiseResolve = aFunction$1(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate_1(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        $promiseResolve.call(C, promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.error) reject(result.value);
    return capability.promise;
  },
  // `Promise.race` method
  // https://tc39.github.io/ecma262/#sec-promise.race
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability$1(C);
    var reject = capability.reject;
    var result = perform(function () {
      var $promiseResolve = aFunction$1(C.resolve);
      iterate_1(iterable, function (promise) {
        $promiseResolve.call(C, promise).then(capability.resolve, reject);
      });
    });
    if (result.error) reject(result.value);
    return capability.promise;
  } });


// Safari bug https://bugs.webkit.org/show_bug.cgi?id=200829
var NON_GENERIC = !!nativePromiseConstructor && fails(function () {
  nativePromiseConstructor.prototype['finally'].call({ then: function () {/* empty */} }, function () {/* empty */});
});

// `Promise.prototype.finally` method
// https://tc39.github.io/ecma262/#sec-promise.prototype.finally
_export({ target: 'Promise', proto: true, real: true, forced: NON_GENERIC }, {
  'finally': function (onFinally) {
    var C = speciesConstructor(this, getBuiltIn('Promise'));
    var isFunction = typeof onFinally == 'function';
    return this.then(
    isFunction ? function (x) {
      return promiseResolve(C, onFinally()).then(function () {return x;});
    } : onFinally,
    isFunction ? function (e) {
      return promiseResolve(C, onFinally()).then(function () {throw e;});
    } : onFinally);

  } });


// patch native Promise.prototype for native async functions
if (typeof nativePromiseConstructor == 'function' && !nativePromiseConstructor.prototype['finally']) {
  redefine(nativePromiseConstructor.prototype, 'finally', getBuiltIn('Promise').prototype['finally']);
}

// `String.prototype.repeat` method implementation
// https://tc39.github.io/ecma262/#sec-string.prototype.repeat
var stringRepeat = ''.repeat || function repeat(count) {
  var str = String(requireObjectCoercible(this));
  var result = '';
  var n = toInteger(count);
  if (n < 0 || n == Infinity) throw RangeError('Wrong number of repetitions');
  for (; n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
  return result;
};

// https://github.com/tc39/proposal-string-pad-start-end




var ceil$1 = Math.ceil;

// `String.prototype.{ padStart, padEnd }` methods implementation
var createMethod$3 = function (IS_END) {
  return function ($this, maxLength, fillString) {
    var S = String(requireObjectCoercible($this));
    var stringLength = S.length;
    var fillStr = fillString === undefined ? ' ' : String(fillString);
    var intMaxLength = toLength(maxLength);
    var fillLen, stringFiller;
    if (intMaxLength <= stringLength || fillStr == '') return S;
    fillLen = intMaxLength - stringLength;
    stringFiller = stringRepeat.call(fillStr, ceil$1(fillLen / fillStr.length));
    if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
    return IS_END ? S + stringFiller : stringFiller + S;
  };
};

var stringPad = {
  // `String.prototype.padStart` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.padstart
  start: createMethod$3(false),
  // `String.prototype.padEnd` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.padend
  end: createMethod$3(true) };


// https://github.com/zloirock/core-js/issues/280


// eslint-disable-next-line unicorn/no-unsafe-regex
var webkitStringPadBug = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(userAgent);

var $padEnd = stringPad.end;


// `String.prototype.padEnd` method
// https://tc39.github.io/ecma262/#sec-string.prototype.padend
_export({ target: 'String', proto: true, forced: webkitStringPadBug }, {
  padEnd: function padEnd(maxLength /* , fillString = ' ' */) {
    return $padEnd(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
  } });


var $padStart = stringPad.start;


// `String.prototype.padStart` method
// https://tc39.github.io/ecma262/#sec-string.prototype.padstart
_export({ target: 'String', proto: true, forced: webkitStringPadBug }, {
  padStart: function padStart(maxLength /* , fillString = ' ' */) {
    return $padStart(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
  } });


// `RegExp.prototype.flags` getter implementation
// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
var regexpFlags = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.dotAll) result += 's';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

// babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
// so we use an intermediate function.
function RE(s, f) {
  return RegExp(s, f);
}

var UNSUPPORTED_Y = fails(function () {
  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
  var re = RE('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') != null;
});

var BROKEN_CARET = fails(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = RE('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') != null;
});

var regexpStickyHelpers = {
  UNSUPPORTED_Y: UNSUPPORTED_Y,
  BROKEN_CARET: BROKEN_CARET };


var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var UPDATES_LAST_INDEX_WRONG = function () {
  var re1 = /a/;
  var re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
}();

var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;
    var sticky = UNSUPPORTED_Y$1 && re.sticky;
    var flags = regexpFlags.call(re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = flags.replace('y', '');
      if (flags.indexOf('g') === -1) {
        flags += 'g';
      }

      strCopy = String(str).slice(re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
        source = '(?: ' + source + ')';
        strCopy = ' ' + strCopy;
        charsAdded++;
      }
      // ^(? + rx + ) is needed, in combination with some str slicing, to
      // simulate the 'y' flag.
      reCopy = new RegExp('^(?:' + source + ')', flags);
    }

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

    match = nativeExec.call(sticky ? reCopy : re, strCopy);

    if (sticky) {
      if (match) {
        match.input = match.input.slice(charsAdded);
        match[0] = match[0].slice(charsAdded);
        match.index = re.lastIndex;
        re.lastIndex += match[0].length;
      } else re.lastIndex = 0;
    } else if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

var regexpExec = patchedExec;

var SPECIES$4 = wellKnownSymbol('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  return ''.replace(re, '$<a>') !== '7';
});

// IE <= 11 replaces $0 with the whole match, as if it was $&
// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
var REPLACE_KEEPS_$0 = function () {
  return 'a'.replace(/./, '$0') === '$0';
}();

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () {return originalExec.apply(this, arguments);};
  var result = 'ab'.split(re);
  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
});

var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
  var SYMBOL = wellKnownSymbol(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () {return 7;};
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;

    if (KEY === 'split') {
      // We can't use real regex here since it causes deoptimization
      // and serious performance degradation in V8
      // https://github.com/zloirock/core-js/issues/306
      re = {};
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES$4] = function () {return re;};
      re.flags = '';
      re[SYMBOL] = /./[SYMBOL];
    }

    re.exec = function () {execCalled = true;return null;};

    re[SYMBOL]('');
    return !execCalled;
  });

  if (
  !DELEGATES_TO_SYMBOL ||
  !DELEGATES_TO_EXEC ||
  KEY === 'replace' && !(REPLACE_SUPPORTS_NAMED_GROUPS && REPLACE_KEEPS_$0) ||
  KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  {
    var nativeRegExpMethod = /./[SYMBOL];
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      if (regexp.exec === regexpExec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
        }
        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
      }
      return { done: false };
    }, { REPLACE_KEEPS_$0: REPLACE_KEEPS_$0 });
    var stringMethod = methods[0];
    var regexMethod = methods[1];

    redefine(String.prototype, KEY, stringMethod);
    redefine(RegExp.prototype, SYMBOL, length == 2
    // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
    // 21.2.5.11 RegExp.prototype[@@split](string, limit)
    ? function (string, arg) {return regexMethod.call(string, this, arg);}
    // 21.2.5.6 RegExp.prototype[@@match](string)
    // 21.2.5.9 RegExp.prototype[@@search](string)
    : function (string) {return regexMethod.call(string, this);});

  }

  if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
};

// `String.prototype.{ codePointAt, at }` methods implementation
var createMethod$4 = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = String(requireObjectCoercible($this));
    var position = toInteger(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = S.charCodeAt(position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size ||
    (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF ?
    CONVERT_TO_STRING ? S.charAt(position) : first :
    CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

var stringMultibyte = {
  // `String.prototype.codePointAt` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod$4(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod$4(true) };


var charAt = stringMultibyte.charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
var advanceStringIndex = function (S, index, unicode) {
  return index + (unicode ? charAt(S, index).length : 1);
};

// `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
var regexpExecAbstract = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }

  if (classofRaw(R) !== 'RegExp') {
    throw TypeError('RegExp#exec called on incompatible receiver');
  }

  return regexpExec.call(R, S);
};

var max$1 = Math.max;
var min$2 = Math.min;
var floor$2 = Math.floor;
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// @@replace logic
fixRegexpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
  return [
  // `String.prototype.replace` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.replace
  function replace(searchValue, replaceValue) {
    var O = requireObjectCoercible(this);
    var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
    return replacer !== undefined ?
    replacer.call(searchValue, O, replaceValue) :
    nativeReplace.call(String(O), searchValue, replaceValue);
  },
  // `RegExp.prototype[@@replace]` method
  // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
  function (regexp, replaceValue) {
    if (reason.REPLACE_KEEPS_$0 || typeof replaceValue === 'string' && replaceValue.indexOf('$0') === -1) {
      var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
      if (res.done) return res.value;
    }

    var rx = anObject(regexp);
    var S = String(this);

    var functionalReplace = typeof replaceValue === 'function';
    if (!functionalReplace) replaceValue = String(replaceValue);

    var global = rx.global;
    if (global) {
      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
    }
    var results = [];
    while (true) {
      var result = regexpExecAbstract(rx, S);
      if (result === null) break;

      results.push(result);
      if (!global) break;

      var matchStr = String(result[0]);
      if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
    }

    var accumulatedResult = '';
    var nextSourcePosition = 0;
    for (var i = 0; i < results.length; i++) {
      result = results[i];

      var matched = String(result[0]);
      var position = max$1(min$2(toInteger(result.index), S.length), 0);
      var captures = [];
      // NOTE: This is equivalent to
      //   captures = result.slice(1).map(maybeToString)
      // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
      // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
      // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
      for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
      var namedCaptures = result.groups;
      if (functionalReplace) {
        var replacerArgs = [matched].concat(captures, position, S);
        if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
        var replacement = String(replaceValue.apply(undefined, replacerArgs));
      } else {
        replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
      }
      if (position >= nextSourcePosition) {
        accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
        nextSourcePosition = position + matched.length;
      }
    }
    return accumulatedResult + S.slice(nextSourcePosition);
  }];


  // https://tc39.github.io/ecma262/#sec-getsubstitution
  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
    if (namedCaptures !== undefined) {
      namedCaptures = toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }
    return nativeReplace.call(replacement, symbols, function (match, ch) {
      var capture;
      switch (ch.charAt(0)) {
        case '$':return '$';
        case '&':return matched;
        case '`':return str.slice(0, position);
        case "'":return str.slice(tailPos);
        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;
        default: // \d\d?
          var n = +ch;
          if (n === 0) return match;
          if (n > m) {
            var f = floor$2(n / 10);
            if (f === 0) return match;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return match;
          }
          capture = captures[n - 1];}

      return capture === undefined ? '' : capture;
    });
  }
});

var non = '\u200B\u0085\u180E';

// check that a method works with the correct list
// of whitespaces and has a correct name
var forcedStringTrimMethod = function (METHOD_NAME) {
  return fails(function () {
    return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces[METHOD_NAME].name !== METHOD_NAME;
  });
};

var $trim = stringTrim.trim;


// `String.prototype.trim` method
// https://tc39.github.io/ecma262/#sec-string.prototype.trim
_export({ target: 'String', proto: true, forced: forcedStringTrimMethod('trim') }, {
  trim: function trim() {
    return $trim(this);
  } });


var $trimEnd = stringTrim.end;


var FORCED$3 = forcedStringTrimMethod('trimEnd');

var trimEnd = FORCED$3 ? function trimEnd() {
  return $trimEnd(this);
} : ''.trimEnd;

// `String.prototype.{ trimEnd, trimRight }` methods
// https://github.com/tc39/ecmascript-string-left-right-trim
_export({ target: 'String', proto: true, forced: FORCED$3 }, {
  trimEnd: trimEnd,
  trimRight: trimEnd });


var $trimStart = stringTrim.start;


var FORCED$4 = forcedStringTrimMethod('trimStart');

var trimStart = FORCED$4 ? function trimStart() {
  return $trimStart(this);
} : ''.trimStart;

// `String.prototype.{ trimStart, trimLeft }` methods
// https://github.com/tc39/ecmascript-string-left-right-trim
_export({ target: 'String', proto: true, forced: FORCED$4 }, {
  trimStart: trimStart,
  trimLeft: trimStart });


/* eslint-disable no-new */



var NATIVE_ARRAY_BUFFER_VIEWS$1 = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

var ArrayBuffer$3 = global_1.ArrayBuffer;
var Int8Array$2 = global_1.Int8Array;

var typedArraysConstructorsRequiresWrappers = !NATIVE_ARRAY_BUFFER_VIEWS$1 || !fails(function () {
  Int8Array$2(1);
}) || !fails(function () {
  new Int8Array$2(-1);
}) || !checkCorrectnessOfIteration(function (iterable) {
  new Int8Array$2();
  new Int8Array$2(null);
  new Int8Array$2(1.5);
  new Int8Array$2(iterable);
}, true) || fails(function () {
  // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
  return new Int8Array$2(new ArrayBuffer$3(2), 1, undefined).length !== 1;
});

var toPositiveInteger = function (it) {
  var result = toInteger(it);
  if (result < 0) throw RangeError("The argument can't be less than 0");
  return result;
};

var toOffset = function (it, BYTES) {
  var offset = toPositiveInteger(it);
  if (offset % BYTES) throw RangeError('Wrong offset');
  return offset;
};

var aTypedArrayConstructor$1 = arrayBufferViewCore.aTypedArrayConstructor;

var typedArrayFrom = function from(source /* , mapfn, thisArg */) {
  var O = toObject(source);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var iteratorMethod = getIteratorMethod(O);
  var i, length, result, step, iterator, next;
  if (iteratorMethod != undefined && !isArrayIteratorMethod(iteratorMethod)) {
    iterator = iteratorMethod.call(O);
    next = iterator.next;
    O = [];
    while (!(step = next.call(iterator)).done) {
      O.push(step.value);
    }
  }
  if (mapping && argumentsLength > 2) {
    mapfn = bindContext(mapfn, arguments[2], 2);
  }
  length = toLength(O.length);
  result = new (aTypedArrayConstructor$1(this))(length);
  for (i = 0; length > i; i++) {
    result[i] = mapping ? mapfn(O[i], i) : O[i];
  }
  return result;
};

var push = [].push;

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
var createMethod$5 = function (TYPE) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject($this);
    var self = indexedObject(O);
    var boundFunction = bindContext(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate;
    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var value, result;
    for (; length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
            case 3:return true; // some
            case 5:return value; // find
            case 6:return index; // findIndex
            case 2:push.call(target, value); // filter
          } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

var arrayIteration = {
  // `Array.prototype.forEach` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
  forEach: createMethod$5(0),
  // `Array.prototype.map` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.map
  map: createMethod$5(1),
  // `Array.prototype.filter` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
  filter: createMethod$5(2),
  // `Array.prototype.some` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.some
  some: createMethod$5(3),
  // `Array.prototype.every` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.every
  every: createMethod$5(4),
  // `Array.prototype.find` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.find
  find: createMethod$5(5),
  // `Array.prototype.findIndex` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod$5(6) };


// makes subclassing work correct for wrapped built-ins
var inheritIfRequired = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
  // it can work only with native `setPrototypeOf`
  objectSetPrototypeOf &&
  // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
  typeof (NewTarget = dummy.constructor) == 'function' &&
  NewTarget !== Wrapper &&
  isObject(NewTargetPrototype = NewTarget.prototype) &&
  NewTargetPrototype !== Wrapper.prototype)
  objectSetPrototypeOf($this, NewTargetPrototype);
  return $this;
};

var typedArrayConstructor = createCommonjsModule(function (module) {


















  var getOwnPropertyNames = objectGetOwnPropertyNames.f;

  var forEach = arrayIteration.forEach;






  var getInternalState = internalState.get;
  var setInternalState = internalState.set;
  var nativeDefineProperty = objectDefineProperty.f;
  var nativeGetOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
  var round = Math.round;
  var RangeError = global_1.RangeError;
  var ArrayBuffer = arrayBuffer.ArrayBuffer;
  var DataView = arrayBuffer.DataView;
  var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;
  var TYPED_ARRAY_TAG = arrayBufferViewCore.TYPED_ARRAY_TAG;
  var TypedArray = arrayBufferViewCore.TypedArray;
  var TypedArrayPrototype = arrayBufferViewCore.TypedArrayPrototype;
  var aTypedArrayConstructor = arrayBufferViewCore.aTypedArrayConstructor;
  var isTypedArray = arrayBufferViewCore.isTypedArray;
  var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
  var WRONG_LENGTH = 'Wrong length';

  var fromList = function (C, list) {
    var index = 0;
    var length = list.length;
    var result = new (aTypedArrayConstructor(C))(length);
    while (length > index) result[index] = list[index++];
    return result;
  };

  var addGetter = function (it, key) {
    nativeDefineProperty(it, key, { get: function () {
        return getInternalState(this)[key];
      } });
  };

  var isArrayBuffer = function (it) {
    var klass;
    return it instanceof ArrayBuffer || (klass = classof(it)) == 'ArrayBuffer' || klass == 'SharedArrayBuffer';
  };

  var isTypedArrayIndex = function (target, key) {
    return isTypedArray(target) &&
    typeof key != 'symbol' &&
    key in target &&
    String(+key) == String(key);
  };

  var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
    return isTypedArrayIndex(target, key = toPrimitive(key, true)) ?
    createPropertyDescriptor(2, target[key]) :
    nativeGetOwnPropertyDescriptor(target, key);
  };

  var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
    if (isTypedArrayIndex(target, key = toPrimitive(key, true)) &&
    isObject(descriptor) &&
    has(descriptor, 'value') &&
    !has(descriptor, 'get') &&
    !has(descriptor, 'set')
    // TODO: add validation descriptor w/o calling accessors
    && !descriptor.configurable && (
    !has(descriptor, 'writable') || descriptor.writable) && (
    !has(descriptor, 'enumerable') || descriptor.enumerable))
    {
      target[key] = descriptor.value;
      return target;
    }return nativeDefineProperty(target, key, descriptor);
  };

  if (descriptors) {
    if (!NATIVE_ARRAY_BUFFER_VIEWS) {
      objectGetOwnPropertyDescriptor.f = wrappedGetOwnPropertyDescriptor;
      objectDefineProperty.f = wrappedDefineProperty;
      addGetter(TypedArrayPrototype, 'buffer');
      addGetter(TypedArrayPrototype, 'byteOffset');
      addGetter(TypedArrayPrototype, 'byteLength');
      addGetter(TypedArrayPrototype, 'length');
    }

    _export({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
      getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
      defineProperty: wrappedDefineProperty });


    module.exports = function (TYPE, wrapper, CLAMPED) {
      var BYTES = TYPE.match(/\d+$/)[0] / 8;
      var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
      var GETTER = 'get' + TYPE;
      var SETTER = 'set' + TYPE;
      var NativeTypedArrayConstructor = global_1[CONSTRUCTOR_NAME];
      var TypedArrayConstructor = NativeTypedArrayConstructor;
      var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
      var exported = {};

      var getter = function (that, index) {
        var data = getInternalState(that);
        return data.view[GETTER](index * BYTES + data.byteOffset, true);
      };

      var setter = function (that, index, value) {
        var data = getInternalState(that);
        if (CLAMPED) value = (value = round(value)) < 0 ? 0 : value > 0xFF ? 0xFF : value & 0xFF;
        data.view[SETTER](index * BYTES + data.byteOffset, value, true);
      };

      var addElement = function (that, index) {
        nativeDefineProperty(that, index, {
          get: function () {
            return getter(this, index);
          },
          set: function (value) {
            return setter(this, index, value);
          },
          enumerable: true });

      };

      if (!NATIVE_ARRAY_BUFFER_VIEWS) {
        TypedArrayConstructor = wrapper(function (that, data, offset, $length) {
          anInstance(that, TypedArrayConstructor, CONSTRUCTOR_NAME);
          var index = 0;
          var byteOffset = 0;
          var buffer, byteLength, length;
          if (!isObject(data)) {
            length = toIndex(data);
            byteLength = length * BYTES;
            buffer = new ArrayBuffer(byteLength);
          } else if (isArrayBuffer(data)) {
            buffer = data;
            byteOffset = toOffset(offset, BYTES);
            var $len = data.byteLength;
            if ($length === undefined) {
              if ($len % BYTES) throw RangeError(WRONG_LENGTH);
              byteLength = $len - byteOffset;
              if (byteLength < 0) throw RangeError(WRONG_LENGTH);
            } else {
              byteLength = toLength($length) * BYTES;
              if (byteLength + byteOffset > $len) throw RangeError(WRONG_LENGTH);
            }
            length = byteLength / BYTES;
          } else if (isTypedArray(data)) {
            return fromList(TypedArrayConstructor, data);
          } else {
            return typedArrayFrom.call(TypedArrayConstructor, data);
          }
          setInternalState(that, {
            buffer: buffer,
            byteOffset: byteOffset,
            byteLength: byteLength,
            length: length,
            view: new DataView(buffer) });

          while (index < length) addElement(that, index++);
        });

        if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
        TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = objectCreate(TypedArrayPrototype);
      } else if (typedArraysConstructorsRequiresWrappers) {
        TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
          anInstance(dummy, TypedArrayConstructor, CONSTRUCTOR_NAME);
          return inheritIfRequired(function () {
            if (!isObject(data)) return new NativeTypedArrayConstructor(toIndex(data));
            if (isArrayBuffer(data)) return $length !== undefined ?
            new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES), $length) :
            typedArrayOffset !== undefined ?
            new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES)) :
            new NativeTypedArrayConstructor(data);
            if (isTypedArray(data)) return fromList(TypedArrayConstructor, data);
            return typedArrayFrom.call(TypedArrayConstructor, data);
          }(), dummy, TypedArrayConstructor);
        });

        if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
        forEach(getOwnPropertyNames(NativeTypedArrayConstructor), function (key) {
          if (!(key in TypedArrayConstructor)) {
            createNonEnumerableProperty(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
          }
        });
        TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
      }

      if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
        createNonEnumerableProperty(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
      }

      if (TYPED_ARRAY_TAG) {
        createNonEnumerableProperty(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
      }

      exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

      _export({
        global: true, forced: TypedArrayConstructor != NativeTypedArrayConstructor, sham: !NATIVE_ARRAY_BUFFER_VIEWS },
      exported);

      if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
        createNonEnumerableProperty(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
      }

      if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
        createNonEnumerableProperty(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
      }

      setSpecies(CONSTRUCTOR_NAME);
    };
  } else module.exports = function () {/* empty */};
});

// `Float32Array` constructor
// https://tc39.github.io/ecma262/#sec-typedarray-objects
typedArrayConstructor('Float32', function (init) {
  return function Float32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

// `Float64Array` constructor
// https://tc39.github.io/ecma262/#sec-typedarray-objects
typedArrayConstructor('Float64', function (init) {
  return function Float64Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

// `Int8Array` constructor
// https://tc39.github.io/ecma262/#sec-typedarray-objects
typedArrayConstructor('Int8', function (init) {
  return function Int8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

// `Int16Array` constructor
// https://tc39.github.io/ecma262/#sec-typedarray-objects
typedArrayConstructor('Int16', function (init) {
  return function Int16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

// `Int32Array` constructor
// https://tc39.github.io/ecma262/#sec-typedarray-objects
typedArrayConstructor('Int32', function (init) {
  return function Int32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

// `Uint8Array` constructor
// https://tc39.github.io/ecma262/#sec-typedarray-objects
typedArrayConstructor('Uint8', function (init) {
  return function Uint8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

// `Uint8ClampedArray` constructor
// https://tc39.github.io/ecma262/#sec-typedarray-objects
typedArrayConstructor('Uint8', function (init) {
  return function Uint8ClampedArray(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
}, true);

// `Uint16Array` constructor
// https://tc39.github.io/ecma262/#sec-typedarray-objects
typedArrayConstructor('Uint16', function (init) {
  return function Uint16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

// `Uint32Array` constructor
// https://tc39.github.io/ecma262/#sec-typedarray-objects
typedArrayConstructor('Uint32', function (init) {
  return function Uint32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var exportTypedArrayStaticMethod$1 = arrayBufferViewCore.exportTypedArrayStaticMethod;


// `%TypedArray%.from` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.from
exportTypedArrayStaticMethod$1('from', typedArrayFrom, typedArraysConstructorsRequiresWrappers);

var aTypedArrayConstructor$2 = arrayBufferViewCore.aTypedArrayConstructor;
var exportTypedArrayStaticMethod$2 = arrayBufferViewCore.exportTypedArrayStaticMethod;

// `%TypedArray%.of` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.of
exportTypedArrayStaticMethod$2('of', function of() /* ...items */{
  var index = 0;
  var length = arguments.length;
  var result = new (aTypedArrayConstructor$2(this))(length);
  while (length > index) result[index] = arguments[index++];
  return result;
}, typedArraysConstructorsRequiresWrappers);

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
    args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true });

  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys$1(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys$1(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys$1(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

// Copyright Node.js contributors. All rights reserved.
var kNodeModulesRE = /^(.*)[\\/]node_modules[\\/]/;
var customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');
var isBuffer = Symbol.for('titanium.buffer.isBuffer');
var colorRegExp = /\u001b\[\d\d?m/g; // eslint-disable-line no-control-regex

function removeColors(str) {
  return str.replace(colorRegExp, '');
}
function isError(e) {
  // An error could be an instance of Error while not being a native error
  // or could be from a different realm and not be instance of Error but still
  // be a native error.
  return isNativeError(e) || e instanceof Error;
}
var getStructuredStack;

class StackTraceError extends Error {}

StackTraceError.prepareStackTrace = (err, trace) => trace;

StackTraceError.stackTraceLimit = Infinity;
function isInsideNodeModules() {
  if (getStructuredStack === undefined) {
    getStructuredStack = () => new StackTraceError().stack;
  }

  var stack = getStructuredStack(); // stack is only an array on v8, try to convert manually if string

  if (typeof stack === 'string') {
    var stackFrames = [];
    var lines = stack.split(/\n/);

    for (var line of lines) {
      var lineInfo = line.match(/(.*)@(.*):(\d+):(\d+)/);

      if (lineInfo) {
        (function () {
          var filename = lineInfo[2].replace('file://', '');
          stackFrames.push({
            getFileName: () => filename });

        })();
      }
    }

    stack = stackFrames;
  } // Iterate over all stack frames and look for the first one not coming
  // from inside Node.js itself:


  if (Array.isArray(stack)) {
    for (var frame of stack) {
      var filename = frame.getFileName(); // If a filename does not start with / or contain \,
      // it's likely from Node.js core.

      if (!/^\/|\\/.test(filename)) {
        continue;
      }

      return kNodeModulesRE.test(filename);
    }
  }

  return false;
}
function join(output, separator) {
  var str = '';

  if (output.length !== 0) {
    var lastIndex = output.length - 1;

    for (var i = 0; i < lastIndex; i++) {
      // It is faster not to use a template string here
      str += output[i];
      str += separator;
    }

    str += output[lastIndex];
  }

  return str;
}
function uncurryThis(f) {
  return function () {
    return f.call.apply(f, arguments);
  };
}
var ALL_PROPERTIES = 0;
var ONLY_ENUMERABLE = 2;
var propertyFilter = {
  ALL_PROPERTIES,
  ONLY_ENUMERABLE };

function getOwnNonIndexProperties(obj, filter) {
  var props = [];
  var keys = filter === ONLY_ENUMERABLE ? Object.keys(obj) : Object.getOwnPropertyNames(obj);

  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];

    if (!isAllDigits(key)) {
      props.push(key);
    }
  }

  return props;
}

function isAllDigits(s) {
  if (s.length === 0) {
    return false;
  }

  for (var i = 0; i < s.length; ++i) {
    var code = s.charCodeAt(i);

    if (code < 48 || code > 57) {
      return false;
    }
  }

  return true;
}

// Copyright Node.js contributors. All rights reserved.
var TypedArrayPrototype$1 = Object.getPrototypeOf(Uint8Array.prototype);
var TypedArrayProto_toStringTag = uncurryThis(Object.getOwnPropertyDescriptor(TypedArrayPrototype$1, Symbol.toStringTag).get);

function checkPrototype(value, name) {
  if (typeof value !== 'object') {
    return false;
  }

  return Object.prototype.toString.call(value) === "[object ".concat(name, "]");
}

function isAnyArrayBuffer(value) {
  if (isArrayBuffer(value)) {
    return true;
  }

  return isSharedArrayBuffer(value);
}
function isArgumentsObject(value) {
  return checkPrototype(value, 'Arguments');
}
function isArrayBuffer(value) {
  return checkPrototype(value, 'ArrayBuffer');
} // Cached to make sure no userland code can tamper with it.

var isArrayBufferView = ArrayBuffer.isView;
function isAsyncFunction(value) {
  return checkPrototype(value, 'AsyncFunction');
}
function isBigInt64Array(value) {
  return TypedArrayProto_toStringTag(value) === 'BigInt64Array';
}
function isBigUint64Array(value) {
  return TypedArrayProto_toStringTag(value) === 'BigUint64Array';
}
function isBooleanObject(value) {
  return checkPrototype(value, 'Boolean');
}
function isBoxedPrimitive(value) {
  if (typeof value !== 'object') {
    return false;
  }

  return isNumberObject(value) || isStringObject(value) || isBooleanObject(value) // || isBigIntObject(value)
  || isSymbolObject(value);
}
function isDataView(value) {
  return checkPrototype(value, 'DataView');
}
function isDate(value) {
  return checkPrototype(value, 'Date');
} // @todo isExternal

function isFloat32Array(value) {
  return TypedArrayProto_toStringTag(value) === 'Float32Array';
}
function isFloat64Array(value) {
  return TypedArrayProto_toStringTag(value) === 'Float64Array';
}
function isGeneratorFunction(value) {
  return checkPrototype(value, 'GeneratorFunction');
}
function isGeneratorObject(value) {
  return checkPrototype(value, 'GeneratorObject');
}
function isInt8Array(value) {
  return TypedArrayProto_toStringTag(value) === 'Int8Array';
}
function isInt16Array(value) {
  return TypedArrayProto_toStringTag(value) === 'Int16Array';
}
function isInt32Array(value) {
  return TypedArrayProto_toStringTag(value) === 'Int32Array';
}
function isMap(value) {
  return checkPrototype(value, 'Map');
}
function isMapIterator(value) {
  if (typeof value !== 'object') {
    return false;
  }

  var prototype = Object.getPrototypeOf(value);
  return prototype && prototype[Symbol.toStringTag] === 'Map Iterator';
} // @todo isModuleNamespaceObject

function isNativeError(value) {
  // if not an instance of an Error, definitely not a native error
  if (!(value instanceof Error)) {
    return false;
  }

  if (!value || !value.constructor) {
    return false;
  }

  return ['Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError'].includes(value.constructor.name);
}
function isNumberObject(value) {
  return checkPrototype(value, 'Number');
}
function isPromise(value) {
  return checkPrototype(value, 'Promise');
} // @todo isProxy

function isRegExp(value) {
  return checkPrototype(value, 'RegExp');
}
function isSet(value) {
  return checkPrototype(value, 'Set');
}
function isSetIterator(value) {
  if (typeof value !== 'object') {
    return false;
  }

  var prototype = Object.getPrototypeOf(value);
  return prototype && prototype[Symbol.toStringTag] === 'Set Iterator';
}
function isSharedArrayBuffer(value) {
  if (!global.SharedArrayBuffer) {
    return false;
  }

  return checkPrototype(value, 'SharedArrayBuffer');
}
function isStringObject(value) {
  return checkPrototype(value, 'String');
}
function isSymbolObject(value) {
  return checkPrototype(value, 'Symbol');
}
function isTypedArray$1(value) {
  var isBuiltInTypedArray = TypedArrayProto_toStringTag(value) !== undefined;

  if (isBuiltInTypedArray) {
    return true;
  }

  return value[isBuffer] === true;
}
function isUint8Array(value) {
  return TypedArrayProto_toStringTag(value) === 'Uint8Array';
}
function isUint8ClampedArray(value) {
  return TypedArrayProto_toStringTag(value) === 'Uint8ClampedArray';
}
function isUint16Array(value) {
  return TypedArrayProto_toStringTag(value) === 'Uint16Array';
}
function isUint32Array(value) {
  return TypedArrayProto_toStringTag(value) === 'Uint32Array';
}
function isWeakMap(value) {
  return checkPrototype(value, 'WeakMap');
}
function isWeakSet(value) {
  return checkPrototype(value, 'WeakSet');
} // @todo isWebAssemblyCompiledModule

var types = /*#__PURE__*/Object.freeze({
  __proto__: null,
  isAnyArrayBuffer: isAnyArrayBuffer,
  isArgumentsObject: isArgumentsObject,
  isArrayBuffer: isArrayBuffer,
  isArrayBufferView: isArrayBufferView,
  isAsyncFunction: isAsyncFunction,
  isBigInt64Array: isBigInt64Array,
  isBigUint64Array: isBigUint64Array,
  isBooleanObject: isBooleanObject,
  isBoxedPrimitive: isBoxedPrimitive,
  isDataView: isDataView,
  isDate: isDate,
  isFloat32Array: isFloat32Array,
  isFloat64Array: isFloat64Array,
  isGeneratorFunction: isGeneratorFunction,
  isGeneratorObject: isGeneratorObject,
  isInt8Array: isInt8Array,
  isInt16Array: isInt16Array,
  isInt32Array: isInt32Array,
  isMap: isMap,
  isMapIterator: isMapIterator,
  isNativeError: isNativeError,
  isNumberObject: isNumberObject,
  isPromise: isPromise,
  isRegExp: isRegExp,
  isSet: isSet,
  isSetIterator: isSetIterator,
  isSharedArrayBuffer: isSharedArrayBuffer,
  isStringObject: isStringObject,
  isSymbolObject: isSymbolObject,
  isTypedArray: isTypedArray$1,
  isUint8Array: isUint8Array,
  isUint8ClampedArray: isUint8ClampedArray,
  isUint16Array: isUint16Array,
  isUint32Array: isUint32Array,
  isWeakMap: isWeakMap,
  isWeakSet: isWeakSet });


// Copyright Node.js contributors. All rights reserved.
var error;

function lazyError() {
  if (!error) {
    // @fixme rollup cannot handle lazy loaded modules, maybe move to webpack?
    // error = require('./errors').codes.ERR_INTERNAL_ASSERTION;
    error = codes.ERR_INTERNAL_ASSERTION;
  }

  return error;
}

function assert(value, message) {
  if (!value) {
    var ERR_INTERNAL_ASSERTION = lazyError();
    throw new ERR_INTERNAL_ASSERTION(message);
  }
}

function fail(message) {
  var ERR_INTERNAL_ASSERTION = lazyError();
  throw new ERR_INTERNAL_ASSERTION(message);
}

assert.fail = fail;

// Copyright Node.js contributors. All rights reserved.
var messages = new Map();
var codes = {}; // @todo implement this once needed

class SystemError extends Error {} // Utility function for registering the error codes.


function E(sym, val, def, ...otherClasses) {
  // Special case for SystemError that formats the error message differently
  // The SystemErrors only have SystemError as their base classes.
  messages.set(sym, val);

  if (def === SystemError) {
    throw new Error('Node compatible SystemError not yet implemented.');
  } else {
    def = makeNodeErrorWithCode(def, sym);
  }

  if (otherClasses.length !== 0) {
    otherClasses.forEach(clazz => {
      def[clazz.name] = makeNodeErrorWithCode(clazz, sym);
    });
  }

  codes[sym] = def;
}

function makeNodeErrorWithCode(Base, key) {
  return class NodeError extends Base {
    constructor(...args) {
      super();
      var message = getMessage(key, args, this);
      Object.defineProperty(this, 'message', {
        value: message,
        enumerable: false,
        writable: true,
        configurable: true });

      addCodeToName(this, super.name, key);
    }

    get code() {
      return key;
    }

    set code(value) {
      Object.defineProperty(this, 'code', {
        configurable: true,
        enumerable: true,
        value,
        writable: true });

    }

    toString() {
      return "".concat(this.name, " [").concat(key, "]: ").concat(this.message);
    }};


}

function getMessage(key, args, self) {
  var msg = messages.get(key);
  /*
                               // @fixme rollup cannot handle lazy loaded modules, maybe move to webpack?
                               if (assert === undefined) {
                               	assert = require('./internal/assert');
                               }
                               */

  if (typeof msg === 'function') {
    assert(msg.length <= args.length, // Default options do not count.
    "Code: ".concat(key, "; The provided arguments length (").concat(args.length, ") does not ") + "match the required ones (".concat(msg.length, ")."));
    return msg.apply(self, args);
  }

  var expectedLength = (msg.match(/%[dfijoOs]/g) || []).length;
  assert(expectedLength === args.length, "Code: ".concat(key, "; The provided arguments length (").concat(args.length, ") does not ") + "match the required ones (".concat(expectedLength, ")."));

  if (args.length === 0) {
    return msg;
  }

  args.unshift(msg);
  return format.apply(null, args); // @fixme rollup cannot handle lazy loaded modules, maybe move to webpack?
  // return lazyInternalUtilInspect().format.apply(null, args);
}

function addCodeToName(err, name, code) {
  // Add the error code to the name to include it in the stack trace.
  err.name = "".concat(name, " [").concat(code, "]"); // Access the stack to generate the error message including the error code
  // from the name.
  // @fixme: This only works on V8/Android, iOS/JSC has a different Error structure.
  // should we try to make errors behave the same across platforms?
  // eslint-disable-next-line no-unused-expressions

  err.stack; // Reset the name to the actual name.

  if (name === 'SystemError') {
    Object.defineProperty(err, 'name', {
      value: name,
      enumerable: false,
      writable: true,
      configurable: true });

  } else {
    delete err.name;
  }
}

E('ERR_INTERNAL_ASSERTION', message => {
  var suffix = 'This is caused by either a bug in Titanium ' + 'or incorrect usage of Titanium internals.\n' + 'Please open an issue with this stack trace at ' + 'https://jira.appcelerator.org\n';
  return message === undefined ? suffix : "".concat(message, "\n").concat(suffix);
}, Error);
E('ERR_INVALID_ARG_TYPE', (name, expected, actual) => {
  assert(typeof name === 'string', '\'name\' must be a string'); // determiner: 'must be' or 'must not be'

  var determiner;

  if (typeof expected === 'string' && expected.startsWith('not ')) {
    determiner = 'must not be';
    expected = expected.replace(/^not /, '');
  } else {
    determiner = 'must be';
  }

  var msg;

  if (name.endsWith(' argument')) {
    // For cases like 'first argument'
    msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  } else {
    var type = name.includes('.') ? 'property' : 'argument';
    msg = "The \"".concat(name, "\" ").concat(type, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  } // TODO(BridgeAR): Improve the output by showing `null` and similar.


  msg += ". Received type ".concat(typeof actual);
  return msg;
}, TypeError);
var maxStack_ErrorName;
var maxStack_ErrorMessage;
/**
                            * Returns true if `err.name` and `err.message` are equal to engine-specific
                            * values indicating max call stack size has been exceeded.
                            * "Maximum call stack size exceeded" in V8.
                            *
                            * @param {Error} err The error to check
                            * @returns {boolean}
                            */

function isStackOverflowError(err) {
  if (maxStack_ErrorMessage === undefined) {
    try {
      function overflowStack() {
        overflowStack();
      }

      overflowStack();
    } catch (e) {
      maxStack_ErrorMessage = e.message;
      maxStack_ErrorName = e.name;
    }
  }

  return err.name === maxStack_ErrorName && err.message === maxStack_ErrorMessage;
}

function oneOf(expected, thing) {
  assert(typeof thing === 'string', '`thing` has to be of type string');

  if (Array.isArray(expected)) {
    var len = expected.length;
    assert(len > 0, 'At least one expected value needs to be specified');
    expected = expected.map(i => String(i));

    if (len > 2) {
      return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(', '), ", or ") + expected[len - 1];
    } else if (len === 2) {
      return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
    } else {
      return "of ".concat(thing, " ").concat(expected[0]);
    }
  } else {
    return "of ".concat(thing, " ").concat(String(expected));
  }
}

var {
  ALL_PROPERTIES: ALL_PROPERTIES$1,
  ONLY_ENUMERABLE: ONLY_ENUMERABLE$1 } =
propertyFilter; // https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings

var TI_CODEC_MAP = new Map();
TI_CODEC_MAP.set('utf-8', Ti.Codec.CHARSET_UTF8);
TI_CODEC_MAP.set('utf8', Ti.Codec.CHARSET_UTF8);
TI_CODEC_MAP.set('utf-16le', Ti.Codec.CHARSET_UTF16LE);
TI_CODEC_MAP.set('utf16le', Ti.Codec.CHARSET_UTF16LE);
TI_CODEC_MAP.set('ucs2', Ti.Codec.CHARSET_UTF16LE);
TI_CODEC_MAP.set('ucs-2', Ti.Codec.CHARSET_UTF16LE);
TI_CODEC_MAP.set('latin1', Ti.Codec.CHARSET_ISO_LATIN_1);
TI_CODEC_MAP.set('binary', Ti.Codec.CHARSET_ISO_LATIN_1);
TI_CODEC_MAP.set('ascii', Ti.Codec.CHARSET_ASCII); // We have no equivalents of base64 or hex, so we convert them internally here

var VALID_ENCODINGS = ['hex', 'utf8', 'utf-8', 'ascii', 'latin1', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le']; // Used to cheat for read/writes of doubles

var doubleArray = new Float64Array(1);
var uint8DoubleArray = new Uint8Array(doubleArray.buffer); // Used to cheat to read/write floats

var floatArray = new Float32Array(1);
var uint8FloatArray = new Uint8Array(floatArray.buffer);
var INSPECT_MAX_BYTES = 50;

class Buffer$1 {
  /**
                 * Constructs a new buffer.
                 *
                 * Primarily used internally in this module together with `newBuffer` to
                 * create a new Buffer instance wrapping a Ti.Buffer.
                 *
                 * Also supports the deprecated Buffer() constructors which are safe
                 * to use outside of this module.
                 *
                 * @param {integer[]|Buffer|integer|string|Ti.Buffer} arg
                 * @param {string|integer} encodingOrOffset
                 * @param {integer} length
                 */
  constructor(arg, encodingOrOffset, length) {
    if (typeof arg !== 'object' || arg.apiName !== 'Ti.Buffer') {
      showFlaggedDeprecation();

      if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
          throw new TypeError("The \"string\" argument must be of type \"string\". Received type ".concat(typeof arg));
        }

        return Buffer$1.alloc(arg);
      }

      return Buffer$1.from(arg, encodingOrOffset, length);
    }

    var tiBuffer = arg;
    var start = encodingOrOffset;

    if (start === undefined) {
      start = 0;
    }

    if (length === undefined) {
      length = tiBuffer.length - start;
    }

    Object.defineProperties(this, {
      byteOffset: {
        value: start },

      length: {
        value: length },

      _tiBuffer: {
        value: tiBuffer } });

    // FIXME: Support .buffer property that holds an ArrayBuffer!
  }
  /**
     * 0 is returned if target is the same as buf
     * 1 is returned if target should come before buf when sorted.
     * -1 is returned if target should come after buf when sorted.
     * @param {Buffer} target Buffer to compare against
     * @param {integer} [targetStart=0] index to start in target
     * @param {integer} [targetEnd=target.length] index to end in target
     * @param {integer} [sourceStart=0] index to start in this Buffer
     * @param {integer} [sourceEnd=this.length] index to end in this Buffer
     * @returns {integer}
     */


  compare(target, targetStart, targetEnd, sourceStart, sourceEnd) {
    if (!Buffer$1.isBuffer(target)) {
      throw new TypeError("The \"target\" argument must be one of type Buffer or Uint8Array. Received type ".concat(typeof buf1));
    }

    if (targetStart === undefined) {
      targetStart = 0;
    }

    if (sourceStart === undefined) {
      sourceStart = 0;
    }

    if (targetEnd === undefined) {
      targetEnd = target.length;
    }

    if (sourceEnd === undefined) {
      sourceEnd = this.length;
    } // ERR_OUT_OF_RANGE is thrown if targetStart < 0, sourceStart < 0, targetEnd > target.byteLength, or sourceEnd > source.byteLength


    if (targetStart < 0 || sourceStart < 0 || targetEnd > target.length || sourceEnd > this.length) {
      throw new RangeError('Index out of range'); // FIXME: set "code" to ERR_INDEX_OUT_OF_RANGE
    } // Use slices to make the loop easier


    var source = this.slice(sourceStart, sourceEnd);
    var sourceLength = source.length;
    var dest = target.slice(targetStart, targetEnd);
    var destLength = dest.length;
    var length = Math.min(sourceLength, destLength);

    for (var i = 0; i < length; i++) {
      var targetValue = getAdjustedIndex(dest, i);
      var sourceValue = getAdjustedIndex(source, i);

      if (targetValue !== sourceValue) {
        // No match! Return 1 or -1 based on what is greater!
        if (sourceValue < targetValue) {
          return -1;
        }

        return 1;
      }
    } // sort based on length!


    if (sourceLength < destLength) {
      return -1;
    }

    if (sourceLength > destLength) {
      return 1;
    }

    return 0;
  }
  /**
     * Copies from this to target
     * @param {Buffer} target destination we're copying into
     * @param {integer} [targetStart=0] start index to copy into in destination Buffer
     * @param {integer} [sourceStart=0] start index to copy from within `this`
     * @param {integer} [sourceEnd=this.length] end index to copy from within `this`
     * @returns {integer} number of bytes copied
     */


  copy(target, targetStart, sourceStart, sourceEnd) {
    if (targetStart === undefined) {
      targetStart = 0;
    }

    if (sourceStart === undefined) {
      sourceStart = 0;
    }

    if (sourceEnd === undefined) {
      sourceEnd = this.length;
    }

    if (sourceStart === sourceEnd) {
      return 0;
    }

    if (target.length === 0 || this.length === 0) {
      return 0;
    } // TODO: check for out of bounds?


    var length = sourceEnd - sourceStart; // Cap length to remaining bytes in target!

    var remaining = target.length - targetStart;

    if (length > remaining) {
      length = remaining;
    } // TODO: handle overlap when target === this!
    // TODO: Do we need to take target or this.byteOffset into account here?


    target._tiBuffer.copy(this._tiBuffer, targetStart, sourceStart, length);

    return length;
  }
  /**
     * Creates and returns an iterator of [index, byte] pairs from the contents of buf.
     * @returns {Iterator}
     */


  entries() {
    var buffer = this;
    var nextIndex = 0;
    var end = this.length;
    var entryIterator = {
      next: function () {
        if (nextIndex < end) {
          var result = {
            value: [nextIndex, getAdjustedIndex(buffer, nextIndex)],
            done: false };

          nextIndex++;
          return result;
        }

        return {
          value: undefined,
          done: true };

      },
      [Symbol.iterator]: function () {
        return this;
      } };

    return entryIterator;
  }

  equals(otherBuffer) {
    if (!Buffer$1.isBuffer(otherBuffer)) {
      throw new TypeError('argument must be a Buffer');
    }

    if (otherBuffer === this) {
      return true;
    }

    return this.compare(otherBuffer) === 0;
  }
  /**
     * @param {string|Buffer|UInt8Array|integer} value The value with which to fill `buf`.
     * @param {integer} [offset=0] Number of bytes to skip before starting to fill `buf`
     * @param {integer} [end] Where to stop filling buf (not inclusive). `buf.length` by default
     * @param {string} [encoding='utf8'] The encoding for `value` if `value` is a string.
     * @returns {this}
     */


  fill(value, offset, end, encoding) {
    var offsetType = typeof offset;

    if (offsetType === 'undefined') {
      // value supplied
      offset = 0;
      end = this.length;
      encoding = 'utf8';
    } else if (offsetType === 'string') {
      // value, encoding supplied
      encoding = offset;
      offset = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      // value, offset, encoding supplied
      encoding = end;
      end = this.length;
    }

    var valueType = typeof value;

    if (valueType === 'string') {
      var bufToFillWith = Buffer$1.from(value, encoding);
      var fillBufLength = bufToFillWith.length;

      if (fillBufLength === 0) {
        throw new Error('no valid fill data');
      } // If the buffer length === 1, we can just do this._tiBuffer.fill(value, offset, end);


      if (fillBufLength === 1) {
        this._tiBuffer.fill(bufToFillWith._tiBuffer[0], offset, end);

        return this;
      } // multiple byte fill!


      var length = end - offset;

      for (var i = 0; i < length; i++) {
        // TODO: Do we need to account for byteOffset here (on `this`, not on the buffer we just created)?
        var fillChar = bufToFillWith._tiBuffer[i % fillBufLength];
        this._tiBuffer[i + offset] = fillChar;
      }

      return this;
    } // if the value is a number (or a buffer with a single byte) we can use tiBuffer.fill();


    this._tiBuffer.fill(value, offset, end);

    return this;
  }

  includes(value, byteOffset, encoding) {
    return this.indexOf(value, byteOffset, encoding) !== -1;
  }
  /**
     * @param {string|Buffer|integer} value What to search for
     * @param {integer} [byteOffset=0] Where to begin searching in buf. If negative, then offset is calculated from the end of buf
     * @param {string} [encoding='utf8'] If value is a string, this is the encoding used to determine the binary representation of the string that will be searched for in buf
     * @returns {integer} The index of the first occurrence of value in buf, or -1 if buf does not contain value.
     */


  indexOf(value, byteOffset, encoding) {
    if (this.length === 0) {
      // empty buffer? can't find anything!
      return -1;
    } // if byteOffset is undefined, make it 0


    if (typeof byteOffset === 'undefined') {
      byteOffset = 0;
    } else if (typeof byteOffset === 'string') {
      // if it's a string, that's actually encoding
      encoding = byteOffset;
      byteOffset = 0;
    } // if we don't have an encoding yet, use utf8


    if (typeof encoding !== 'string') {
      encoding = 'utf8';
    }

    if (byteOffset < 0) {
      // convert negative indices
      byteOffset = this.length + byteOffset;

      if (byteOffset < 0) {
        // still negative? start at 0
        byteOffset = 0;
      }
    } else if (byteOffset >= this.length) {
      return -1; // can't find past end of buffer!
    }

    if (typeof value === 'number') {
      value &= 0xFF; // clamp to 255
      // This is a simpler case, we have a single byte we need to search for
      // so just loop through and try to find it

      return indexOf$1(this, value, byteOffset);
    } // coerce a string to a Buffer


    if (typeof value === 'string') {
      value = Buffer$1.from(value, encoding);
    } // value is now a Buffer...


    var matchLength = value.length;

    if (matchLength === 0) {
      return -1; // never find empty value!
    }

    if (matchLength === 1) {
      // simple case, match one byte!
      return indexOf$1(this, value[0], byteOffset);
    }

    var currentIndex = byteOffset;
    var thisLength = this.length;

    if (matchLength > thisLength) {
      return -1; // can't match if the value is longer than this Buffer!
    } // FIXME: Can we rewrite this in a less funky way?
    // FIXME: Can stop earlier based on matchLength!


    firstMatch: while (currentIndex < thisLength) {
      // eslint-disable-line no-labels
      // match first byte!
      var firstByteMatch = indexOf$1(this, value[0], currentIndex);

      if (firstByteMatch === -1) {
        // couldn't even match the very first byte, so no match overall!
        return -1;
      } // ok, we found the first byte, now we need to see if the next consecutive bytes match!


      for (var x = 1; x < matchLength; x++) {
        if (firstByteMatch + x >= thisLength) {
          currentIndex = firstByteMatch + 1; // move past our first match

          continue firstMatch; // eslint-disable-line no-labels
        }

        if (this[firstByteMatch + x] !== value[x]) {
          // didn't match!
          currentIndex = firstByteMatch + 1; // move past our first match

          continue firstMatch; // eslint-disable-line no-labels
        }
      }

      return firstByteMatch; // the rest matched, hurray!
    }

    return -1;
  }

  keys() {
    var nextIndex = 0;
    var end = this.length;
    var myIterator = {
      next: function () {
        if (nextIndex < end) {
          var result = {
            value: nextIndex,
            done: false };

          nextIndex++;
          return result;
        }

        return {
          value: undefined,
          done: true };

      },
      [Symbol.iterator]: function () {
        return this;
      } };

    return myIterator;
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 8
     * @returns {double} Reads a 64-bit double from buf at the specified offset with specified endian format
     */


  readDoubleBE(offset = 0) {
    checkOffset(this, offset, 8); // Node cheats and uses a Float64Array and UInt8Array backed by the same buffer
    // so basically it reads in the bytes stuffing them into Uint8Array, then returns the value from the Float64Array
    // FIXME: This assumes LE system byteOrder

    uint8DoubleArray[7] = this[offset++];
    uint8DoubleArray[6] = this[offset++];
    uint8DoubleArray[5] = this[offset++];
    uint8DoubleArray[4] = this[offset++];
    uint8DoubleArray[3] = this[offset++];
    uint8DoubleArray[2] = this[offset++];
    uint8DoubleArray[1] = this[offset++];
    uint8DoubleArray[0] = this[offset++];
    return doubleArray[0];
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 8
     * @returns {double} Reads a 64-bit double from buf at the specified offset with specified endian format
     */


  readDoubleLE(offset = 0) {
    checkOffset(this, offset, 8); // Node cheats and uses a Float64Array and UInt8Array backed by the same buffer
    // so basically it reads in the bytes stuffing them into Uint8Array, then returns the value from the Float64Array
    // FIXME: This assumes LE system byteOrder

    uint8DoubleArray[0] = this[offset++];
    uint8DoubleArray[1] = this[offset++];
    uint8DoubleArray[2] = this[offset++];
    uint8DoubleArray[3] = this[offset++];
    uint8DoubleArray[4] = this[offset++];
    uint8DoubleArray[5] = this[offset++];
    uint8DoubleArray[6] = this[offset++];
    uint8DoubleArray[7] = this[offset++];
    return doubleArray[0];
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 4
     * @returns {float} Reads a 32-bit float from buf at the specified offset with specified endian format
     */


  readFloatBE(offset = 0) {
    checkOffset(this, offset, 4); // Node cheats and uses a Float32Array and UInt8Array backed by the same buffer
    // so basically it reads in the bytes stuffing them into Uint8Array, then returns the value from the Float32Array
    // FIXME: This assumes LE system byteOrder

    uint8FloatArray[3] = this[offset++];
    uint8FloatArray[2] = this[offset++];
    uint8FloatArray[1] = this[offset++];
    uint8FloatArray[0] = this[offset++];
    return floatArray[0];
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 4
     * @returns {float} Reads a 32-bit float from buf at the specified offset with specified endian format
     */


  readFloatLE(offset = 0) {
    checkOffset(this, offset, 4); // Node cheats and uses a Float32Array and UInt8Array backed by the same buffer
    // so basically it reads in the bytes stuffing them into Uint8Array, then returns the value from the Float32Array
    // FIXME: This assumes LE system byteOrder

    uint8FloatArray[0] = this[offset++];
    uint8FloatArray[1] = this[offset++];
    uint8FloatArray[2] = this[offset++];
    uint8FloatArray[3] = this[offset++];
    return floatArray[0];
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 1.
     * @returns {integer}
     */


  readInt8(offset = 0) {
    var unsignedValue = this.readUInt8(offset);
    return unsignedToSigned(unsignedValue, 1);
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 2.
     * @returns {integer}
     */


  readInt16BE(offset) {
    var unsignedValue = this.readUInt16BE(offset);
    return unsignedToSigned(unsignedValue, 2);
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 2.
     * @returns {integer}
     */


  readInt16LE(offset = 0) {
    var unsignedValue = this.readUInt16LE(offset);
    return unsignedToSigned(unsignedValue, 2);
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 4.
     * @returns {integer}
     */


  readInt32BE(offset = 0) {
    var unsignedValue = this.readUInt32BE(offset);
    return unsignedToSigned(unsignedValue, 4);
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 4.
     * @returns {integer}
     */


  readInt32LE(offset = 0) {
    var unsignedValue = this.readUInt32LE(offset);
    return unsignedToSigned(unsignedValue, 4);
  }
  /**
     * Reads byteLength number of bytes from buf at the specified offset and interprets the result as a two's complement signed value. Supports up to 48 bits of accuracy.
     * @param {integer} offset Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - byteLength.
     * @param {integer} byteLength umber of bytes to read. Must satisfy 0 < byteLength <= 6.
     * @returns {integer}
     */


  readIntBE(offset, byteLength) {
    var unsignedValue = this.readUIntBE(offset, byteLength);
    return unsignedToSigned(unsignedValue, byteLength);
  }
  /**
     * Reads byteLength number of bytes from buf at the specified offset and interprets the result as a two's complement signed value. Supports up to 48 bits of accuracy.
     * @param {integer} offset Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - byteLength.
     * @param {integer} byteLength umber of bytes to read. Must satisfy 0 < byteLength <= 6.
     * @returns {integer}
     */


  readIntLE(offset, byteLength) {
    var unsignedValue = this.readUIntLE(offset, byteLength);
    return unsignedToSigned(unsignedValue, byteLength);
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 1.
     * @returns {integer}
     */


  readUInt8(offset = 0) {
    checkOffset(this, offset, 1);
    return this[offset];
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 2.
     * @returns {integer}
     */


  readUInt16BE(offset = 0) {
    checkOffset(this, offset, 2); // first byte shifted and OR'd with second byte

    return this[offset] << 8 | this[offset + 1];
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 2.
     * @returns {integer}
     */


  readUInt16LE(offset = 0) {
    checkOffset(this, offset, 2); // first byte OR'd with second byte shifted

    return this[offset] | this[offset + 1] << 8;
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 4.
     * @returns {integer}
     */


  readUInt32BE(offset = 0) {
    checkOffset(this, offset, 4);
    return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]); // rather than shifting by << 24, multiply the first byte and add it in so we don't retain the "sign bit"
    // (because bit-wise operators assume a 32-bit number)
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 4.
     * @returns {integer}
     */


  readUInt32LE(offset = 0) {
    checkOffset(this, offset, 4);
    return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000; // rather than shifting by << 24, multiply the last byte and add it in so we don't retain the "sign bit"
  }
  /**
     * @param {integer} offset Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - byteLength.
     * @param {integer} byteLength Number of bytes to read. Must satisfy 0 < byteLength <= 6.
     * @returns {integer}
     */


  readUIntBE(offset, byteLength) {
    if (byteLength <= 0 || byteLength > 6) {
      throw new RangeError('Index out of range');
    }

    checkOffset(this, offset, byteLength);
    var result = 0;
    var multiplier = 1; // we use a multipler for each byte
    // we're doing the same loop as #readUIntLE, just backwards!

    for (var i = byteLength - 1; i >= 0; i--) {
      result += getAdjustedIndex(this, offset + i) * multiplier;
      multiplier *= 0x100; // move multiplier to next byte
    }

    return result;
  }
  /**
     * @param {integer} offset Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - byteLength.
     * @param {integer} byteLength Number of bytes to read. Must satisfy 0 < byteLength <= 6.
     * @returns {integer}
     */


  readUIntLE(offset, byteLength) {
    if (byteLength <= 0 || byteLength > 6) {
      throw new RangeError('Index out of range');
    }

    checkOffset(this, offset, byteLength);
    var result = 0;
    var multiplier = 1; // we use a multipler for each byte

    for (var i = 0; i < byteLength; i++) {
      result += getAdjustedIndex(this, offset + i) * multiplier;
      multiplier *= 0x100; // move multiplier to next byte
    }

    return result;
  }
  /**
     * @param {integer} [start=0] Where the new `Buffer` will start.
     * @param {integer} [end=this.length] Where the new Buffer will end (not inclusive). Default: `buf.length`.
     * @returns {Buffer}
     */


  slice(start, end) {
    var thisLength = this.length;

    if (typeof start === 'undefined') {
      start = 0;
    } else if (start < 0) {
      start = thisLength + start;

      if (start < 0) {
        // if this is still negative, use 0 (that matches Node)
        start = 0;
      }
    }

    if (typeof end === 'undefined') {
      end = thisLength;
    } else if (end < 0) {
      end = thisLength + end;
    } // Specifying end greater than buf.length will return the same result as that of end equal to buf.length.


    if (end > thisLength) {
      end = thisLength;
    } // What if end is less than start?


    var length = end - start;

    if (length <= 0) {
      length = 0; // return empty view of Buffer! retain byte offset, set length to 0
    } // Wrap the same Ti.Buffer object but specify the start/end to "crop" with


    return newBuffer(this._tiBuffer, this.byteOffset + start, length);
  }
  /**
     * @param {integer} [start=0] Where the new `Buffer` will start.
     * @param {integer} [end=this.length] Where the new Buffer will end (not inclusive). Default: `buf.length`.
     * @returns {Buffer}
     */


  subarray(start, end) {
    return this.slice(start, end);
  }
  /**
     * Interprets buf as an array of unsigned 16-bit integers and swaps the byte order in-place.
     * Throws ERR_INVALID_BUFFER_SIZE if buf.length is not a multiple of 2.
     * @returns {Buffer}
     */


  swap16() {
    var length = this.length;

    if (length % 2 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 16-bits');
    }

    for (var i = 0; i < length; i += 2) {
      var first = getAdjustedIndex(this, i);
      var second = getAdjustedIndex(this, i + 1);
      setAdjustedIndex(this, i, second);
      setAdjustedIndex(this, i + 1, first);
    }

    return this;
  }
  /**
     * Interprets buf as an array of unsigned 32-bit integers and swaps the byte order in-place.
     * Throws ERR_INVALID_BUFFER_SIZE if buf.length is not a multiple of 4.
     * @returns {Buffer}
     */


  swap32() {
    var length = this.length;

    if (length % 4 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 32-bits');
    }

    for (var i = 0; i < length; i += 4) {
      var first = getAdjustedIndex(this, i);
      var second = getAdjustedIndex(this, i + 1);
      var third = getAdjustedIndex(this, i + 2);
      var fourth = getAdjustedIndex(this, i + 3);
      setAdjustedIndex(this, i, fourth);
      setAdjustedIndex(this, i + 1, third);
      setAdjustedIndex(this, i + 2, second);
      setAdjustedIndex(this, i + 3, first);
    }

    return this;
  }
  /**
     * Interprets buf as an array of unsigned 64-bit integers and swaps the byte order in-place.
     * Throws ERR_INVALID_BUFFER_SIZE if buf.length is not a multiple of 8.
     * @returns {Buffer}
     */


  swap64() {
    var length = this.length;

    if (length % 8 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 64-bits');
    }

    for (var i = 0; i < length; i += 8) {
      var first = getAdjustedIndex(this, i);
      var second = getAdjustedIndex(this, i + 1);
      var third = getAdjustedIndex(this, i + 2);
      var fourth = getAdjustedIndex(this, i + 3);
      var fifth = getAdjustedIndex(this, i + 4);
      var sixth = getAdjustedIndex(this, i + 5);
      var seventh = getAdjustedIndex(this, i + 6);
      var eighth = getAdjustedIndex(this, i + 7);
      setAdjustedIndex(this, i, eighth);
      setAdjustedIndex(this, i + 1, seventh);
      setAdjustedIndex(this, i + 2, sixth);
      setAdjustedIndex(this, i + 3, fifth);
      setAdjustedIndex(this, i + 4, fourth);
      setAdjustedIndex(this, i + 5, third);
      setAdjustedIndex(this, i + 6, second);
      setAdjustedIndex(this, i + 7, first);
    }

    return this;
  }
  /**
     * @returns {object}
     */


  toJSON() {
    return {
      type: 'Buffer',
      // Take advantage of slice working on "Array-like" objects (juts like `arguments`)
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice#Array-like_objects
      data: [].slice.call(this) };

  }
  /**
     * @param {string} [encoding='utf8'] The character encoding to use
     * @param {integer} [start=0] The byte offset to start decoding at
     * @param {integer} [end] The byte offset to stop decoding at (not inclusive). `buf.length` default
     * @returns {string}
     */


  toString(encoding, start, end) {
    // fast case of no args
    if (arguments.length === 0) {
      return this._tiBuffer.toString();
    }

    var length = this.length;

    if (start >= length) {
      return ''; // start is past end of buffer, return empty string
    }

    if (start < 0 || typeof start !== 'number') {
      start = 0;
    }

    if (end > length || typeof end !== 'number') {
      // no end specified, or past end of buffer, use length of buffer
      end = length;
    } // else keep end as passed in


    if (end <= start) {
      return ''; // if end is before start return empty string
    } // If start !== 0 and end !== length, maybe we should do a Buffer.subarray/slice over the range and call toString() on that?


    if (start !== 0 || end !== length) {
      return this.slice(start, end).toString(encoding);
    } // base case, start is 0, end is length


    if (encoding === undefined) {
      encoding = 'utf8';
    } else {
      encoding = encoding.toLowerCase(); // Throw if bad encoding!

      if (!Buffer$1.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: ".concat(encoding));
      }
    }

    if (encoding === 'utf8' || encoding === 'utf-8') {
      // if this is the original underlying buffer just return it's toString() value
      if (this.byteOffset === 0 && this.length === this._tiBuffer.length) {
        return this._tiBuffer.toString(); // we return utf-8 by default natively
      } // if we're offset or cropping in nay way, clone the range and return that buffer's toString()


      return this._tiBuffer.clone(this.byteOffset, this.length).toString();
    }

    if (encoding === 'base64') {
      var blob; // if this is the original underlying buffer just return it's toString() value

      if (this.byteOffset === 0 && this.length === this._tiBuffer.length) {
        blob = Ti.Utils.base64encode(this._tiBuffer.toBlob());
      } else {
        // if we're offset or cropping in any way, clone the range and return that buffer's toString()
        blob = Ti.Utils.base64encode(this._tiBuffer.clone(this.byteOffset, this.length).toBlob());
      }

      return blob.toString();
    }

    if (encoding === 'hex') {
      var hexStr = '';

      for (var i = 0; i < length; i++) {
        // each one is a "byte"
        var hex = (getAdjustedIndex(this, i) & 0xff).toString(16);
        hex = hex.length === 1 ? '0' + hex : hex;
        hexStr += hex;
      }

      return hexStr;
    }

    if (encoding === 'latin1' || encoding === 'binary') {
      var latin1String = '';

      for (var _i = 0; _i < length; _i++) {
        // each one is a "byte"
        latin1String += String.fromCharCode(getAdjustedIndex(this, _i));
      }

      return latin1String;
    }

    if (encoding === 'ascii') {
      var ascii = '';

      for (var _i2 = 0; _i2 < length; _i2++) {
        // we store bytes (8-bit), but ascii is 7-bit. Node "masks" the last bit off, so let's do the same
        ascii += String.fromCharCode(getAdjustedIndex(this, _i2) & 0x7F);
      }

      return ascii;
    } // UCS2/UTF16


    return bufferToUTF16String(this._tiBuffer, this.byteOffset, this.length);
  }
  /**
     * Provides a conversion method for interacting with Ti APIs taht require a Ti.Buffer
     * @returns {Ti.Buffer} the underlying Ti.Buffer backing this Buffer instance
     */


  toTiBuffer() {
    return this._tiBuffer;
  }
  /**
     * Creates and returns an iterator for buf values (bytes)
     * @returns {Iterator}
     */


  values() {
    var buffer = this;
    var nextIndex = 0;
    var end = this.length;
    var myIterator = {
      next: function () {
        if (nextIndex < end) {
          var result = {
            value: getAdjustedIndex(buffer, nextIndex),
            done: false };

          nextIndex++;
          return result;
        }

        return {
          value: undefined,
          done: true };

      },
      [Symbol.iterator]: function () {
        return this;
      } };

    return myIterator;
  }
  /**
     * Called when buffer is used in a for..of loop. Delegates to #values()
     * @returns {Iterator}
     */


  [Symbol.iterator]() {
    return this.values();
  }
  /**
     * Writes string to buf at offset according to the character encoding in encoding.
     * The length parameter is the number of bytes to write. If buf did not contain enough space to
     * fit the entire string, only part of string will be written. However, partially encoded
     * characters will not be written.
     * @param {string} string String to write to `buf`.
     * @param {integer} [offset=0] Number of bytes to skip before starting to write string
     * @param {integer} [length=buf.length - offset] Number of bytes to write
     * @param {string} [encoding='utf8'] The character encoding of string
     * @returns {integer}
     */


  write(string, offset, length, encoding) {
    if (typeof offset === 'string') {
      encoding = offset;
      offset = 0;
      length = this.length;
    } else if (typeof length === 'string') {
      encoding = length;
      length = this.length - offset;
    } else {
      // we cap `length` at the length of our buffer
      var remaining = this.length - offset;

      if (length > remaining) {
        length = remaining;
      }
    }

    encoding = encoding || 'utf8'; // so we need to convert `remaining` bytes of our string into a byte array/buffer

    var src = Buffer$1.from(string, encoding); // FIXME: Can we let it know to only convert `remaining` bytes?
    // then stick that into our buffer starting at `offset`!

    return copyBuffer(src._tiBuffer, this._tiBuffer, offset, length);
  }

  writeDoubleBE(value, offset = 0) {
    checkOffset(this, offset, 8);
    doubleArray[0] = value;
    setAdjustedIndex(this, offset++, uint8DoubleArray[7]);
    setAdjustedIndex(this, offset++, uint8DoubleArray[6]);
    setAdjustedIndex(this, offset++, uint8DoubleArray[5]);
    setAdjustedIndex(this, offset++, uint8DoubleArray[4]);
    setAdjustedIndex(this, offset++, uint8DoubleArray[3]);
    setAdjustedIndex(this, offset++, uint8DoubleArray[2]);
    setAdjustedIndex(this, offset++, uint8DoubleArray[1]);
    setAdjustedIndex(this, offset++, uint8DoubleArray[0]);
    return offset; // at this point, we should have already added 8 to offset
  }

  writeDoubleLE(value, offset = 0) {
    checkOffset(this, offset, 8);
    doubleArray[0] = value;
    setAdjustedIndex(this, offset++, uint8DoubleArray[0]);
    setAdjustedIndex(this, offset++, uint8DoubleArray[1]);
    setAdjustedIndex(this, offset++, uint8DoubleArray[2]);
    setAdjustedIndex(this, offset++, uint8DoubleArray[3]);
    setAdjustedIndex(this, offset++, uint8DoubleArray[4]);
    setAdjustedIndex(this, offset++, uint8DoubleArray[5]);
    setAdjustedIndex(this, offset++, uint8DoubleArray[6]);
    setAdjustedIndex(this, offset++, uint8DoubleArray[7]);
    return offset; // at this point, we should have already added 8 to offset
  }

  writeFloatBE(value, offset = 0) {
    checkOffset(this, offset, 4);
    floatArray[0] = value;
    setAdjustedIndex(this, offset++, uint8FloatArray[3]);
    setAdjustedIndex(this, offset++, uint8FloatArray[2]);
    setAdjustedIndex(this, offset++, uint8FloatArray[1]);
    setAdjustedIndex(this, offset++, uint8FloatArray[0]);
    return offset; // at this point, we should have already added 4 to offset
  }

  writeFloatLE(value, offset = 0) {
    checkOffset(this, offset, 4);
    floatArray[0] = value;
    setAdjustedIndex(this, offset++, uint8FloatArray[0]);
    setAdjustedIndex(this, offset++, uint8FloatArray[1]);
    setAdjustedIndex(this, offset++, uint8FloatArray[2]);
    setAdjustedIndex(this, offset++, uint8FloatArray[3]);
    return offset; // at this point, we should have already added 4 to offset
  }
  /**
     * @param {integer} value Number to be written to buf.
     * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 1.
     * @returns {integer}
     */


  writeInt8(value, offset = 0) {
    checkOffset(this, offset, 1);
    checkValue(value, -128, 127);

    if (value >= 0) {
      // just write it normally
      setAdjustedIndex(this, offset, value);
    } else {
      // convert from signed to 2's complement bits
      setAdjustedIndex(this, offset, 0xFF + value + 1); // max value, plus the negative number, add one
    }

    return offset + 1;
  }
  /**
     * @param {integer} value Number to be written to buf.
     * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 2.
     * @returns {integer}
     */


  writeInt16BE(value, offset = 0) {
    checkOffset(this, offset, 2);
    checkValue(value, -32768, 32767);
    setAdjustedIndex(this, offset, value >>> 8); // just shift over a byte

    setAdjustedIndex(this, offset + 1, value & 0xFF); // mask to first byte

    return offset + 2;
  }
  /**
     * @param {integer} value Number to be written to buf.
     * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 2.
     * @returns {integer}
     */


  writeInt16LE(value, offset = 0) {
    checkOffset(this, offset, 2);
    checkValue(value, -32768, 32767);
    setAdjustedIndex(this, offset, value & 0xFF);
    setAdjustedIndex(this, offset + 1, value >>> 8);
    return offset + 2;
  }
  /**
     * @param {integer} value Number to be written to buf.
     * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 4.
     * @returns {integer}
     */


  writeInt32BE(value, offset = 0) {
    checkOffset(this, offset, 4);
    checkValue(value, -2147483648, 2147483647);
    setAdjustedIndex(this, offset, value >>> 24);
    setAdjustedIndex(this, offset + 1, value >>> 16);
    setAdjustedIndex(this, offset + 2, value >>> 8);
    setAdjustedIndex(this, offset + 3, value & 0xFF);
    return offset + 4;
  }
  /**
     * @param {integer} value Number to be written to buf.
     * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 4.
     * @returns {integer}
     */


  writeInt32LE(value, offset = 0) {
    checkOffset(this, offset, 4);
    checkValue(value, -2147483648, 2147483647);
    setAdjustedIndex(this, offset, value & 0xFF);
    setAdjustedIndex(this, offset + 1, value >>> 8);
    setAdjustedIndex(this, offset + 2, value >>> 16);
    setAdjustedIndex(this, offset + 3, value >>> 24);
    return offset + 4;
  }
  /**
     * @param {integer} value Number to be written to buf.
     * @param {integer} offset Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - byteLength.
     * @param {integer} byteLength Number of bytes to write. Must satisfy 0 < byteLength <= 6.
     * @returns {integer}
     */


  writeIntBE(value, offset, byteLength) {
    if (byteLength <= 0 || byteLength > 6) {
      throw new RangeError('Index out of range');
    }

    checkOffset(this, offset, byteLength);
    var minMaxBase = Math.pow(2, 8 * byteLength - 1);
    checkValue(value, -minMaxBase, minMaxBase - 1);

    if (value < 0) {
      value = minMaxBase * 2 + value;
    }

    var multiplier = 1;

    for (var i = byteLength - 1; i >= 0; i--) {
      var byteValue = value / multiplier & 0xFF;
      setAdjustedIndex(this, offset + i, byteValue);
      multiplier *= 0x100;
    }

    return offset + byteLength;
  }
  /**
     * @param {integer} value Number to be written to buf.
     * @param {integer} offset Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - byteLength.
     * @param {integer} byteLength Number of bytes to write. Must satisfy 0 < byteLength <= 6.
     * @returns {integer}
     */


  writeIntLE(value, offset, byteLength) {
    if (byteLength <= 0 || byteLength > 6) {
      throw new RangeError('Index out of range');
    }

    checkOffset(this, offset, byteLength);
    var minMaxBase = Math.pow(2, 8 * byteLength - 1);
    checkValue(value, -minMaxBase, minMaxBase - 1);

    if (value < 0) {
      value = minMaxBase * 2 + value;
    }

    var multiplier = 1;

    for (var i = 0; i < byteLength; i++) {
      var byteValue = value / multiplier & 0xFF;
      setAdjustedIndex(this, offset + i, byteValue);
      multiplier *= 0X100;
    }

    return offset + byteLength;
  }
  /**
     * @param {integer} value Number to be written to buf.
     * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 1.
     * @returns {integer}
     */


  writeUInt8(value, offset = 0) {
    checkOffset(this, offset, 1);
    checkValue(value, 0, 255);
    setAdjustedIndex(this, offset, value);
    return offset + 1;
  }
  /**
     * @param {integer} value Number to be written to buf.
     * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 2.
     * @returns {integer}
     */


  writeUInt16BE(value, offset = 0) {
    checkOffset(this, offset, 2);
    checkValue(value, 0, 65535);
    setAdjustedIndex(this, offset, value >>> 8);
    setAdjustedIndex(this, offset + 1, value & 0xff);
    return offset + 2;
  }
  /**
     * @param {integer} value Number to be written to buf.
     * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 2.
     * @returns {integer}
     */


  writeUInt16LE(value, offset = 0) {
    checkOffset(this, offset, 2);
    checkValue(value, 0, 65535);
    setAdjustedIndex(this, offset, value & 0xff);
    setAdjustedIndex(this, offset + 1, value >>> 8);
    return offset + 2;
  }
  /**
     * @param {integer} value Number to be written to buf.
     * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 4.
     * @returns {integer}
     */


  writeUInt32BE(value, offset = 0) {
    checkOffset(this, offset, 4);
    checkValue(value, 0, 4294967295);
    setAdjustedIndex(this, offset, value >>> 24);
    setAdjustedIndex(this, offset + 1, value >>> 16);
    setAdjustedIndex(this, offset + 2, value >>> 8);
    setAdjustedIndex(this, offset + 3, value & 0xff);
    return offset + 4;
  }
  /**
     * @param {integer} value Number to be written to buf.
     * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 4.
     * @returns {integer}
     */


  writeUInt32LE(value, offset = 0) {
    checkOffset(this, offset, 4);
    checkValue(value, 0, 4294967295);
    setAdjustedIndex(this, offset, value & 0xff);
    setAdjustedIndex(this, offset + 1, value >>> 8);
    setAdjustedIndex(this, offset + 2, value >>> 16);
    setAdjustedIndex(this, offset + 3, value >>> 24);
    return offset + 4;
  }
  /**
     * @param {integer} value Number to be written to buf.
     * @param {integer} offset Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - byteLength.
     * @param {integer} byteLength Number of bytes to write. Must satisfy 0 < byteLength <= 6.
     * @returns {integer}
     */


  writeUIntBE(value, offset, byteLength) {
    if (byteLength <= 0 || byteLength > 6) {
      throw new RangeError('Index out of range');
    }

    checkOffset(this, offset, byteLength);
    checkValue(value, 0, Math.pow(2, 8 * byteLength) - 1);
    var multiplier = 1;

    for (var i = byteLength - 1; i >= 0; i--) {
      var byteValue = value / multiplier & 0xFF;
      setAdjustedIndex(this, offset + i, byteValue);
      multiplier *= 0X100;
    }

    return offset + byteLength;
  }
  /**
     * @param {integer} value Number to be written to buf.
     * @param {integer} offset Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - byteLength.
     * @param {integer} byteLength Number of bytes to write. Must satisfy 0 < byteLength <= 6.
     * @returns {integer}
     */


  writeUIntLE(value, offset, byteLength) {
    if (byteLength <= 0 || byteLength > 6) {
      throw new RangeError('Index out of range');
    }

    checkOffset(this, offset, byteLength);
    checkValue(value, 0, Math.pow(2, 8 * byteLength) - 1);
    var multiplier = 1;

    for (var i = 0; i < byteLength; i++) {
      var byteValue = value / multiplier & 0xFF;
      setAdjustedIndex(this, offset + i, byteValue);
      multiplier *= 0X100;
    }

    return offset + byteLength;
  } // TODO: Implement remaining instance methods:
  // buf.lastIndexOf(value[, byteOffset][, encoding])
  // buf.readBigInt64BE([offset])
  // buf.readBigInt64LE([offset])
  // buf.readBigUInt64BE([offset])
  // buf.readBigUInt64LE([offset])
  // buf.writeBigInt64BE(value[, offset])
  // buf.writeBigInt64LE(value[, offset])
  // buf.writeBigUInt64BE(value[, offset])
  // buf.writeBigUInt64LE(value[, offset])


  static allocUnsafe(length) {
    return newBuffer(Ti.createBuffer({
      length }));

  }

  static allocUnsafeSlow(length) {
    return Buffer$1.allocUnsafe(length);
  }

  static alloc(length, fill = 0, encoding = 'utf8') {
    var buf = Buffer$1.allocUnsafe(length);
    buf.fill(fill, encoding);
    return buf;
  }
  /**
     * @param {string|Buffer|TypedArray|DataView|ArrayBuffer|SharedArrayBuffer} string original string
     * @param {string} [encoding='utf8'] encoding whose byte length we need to grab
     * @returns {integer}
     */


  static byteLength(string, encoding = 'utf8') {
    if (typeof string !== 'string') {
      if (Buffer$1.isBuffer(string)) {
        return string.length; // return Buffer's length
      }

      return string.byteLength; // TypedArray, ArrayBuffer, SharedArrayBuffer, DataView
    }

    var length = string.length;

    switch (encoding.toLowerCase()) {
      case 'utf8':
      case 'utf-8':
        return utf8ByteLength(string);

      case 'latin1':
      case 'binary':
      case 'ascii':
        return length;

      case 'ucs-2':
      case 'ucs2':
      case 'utf16le':
      case 'utf16-le':
        return 2 * length;

      case 'hex':
        return length / 2;

      case 'base64':
        // Subtract up to two padding chars from end of string!
        if (length > 1 && string.charAt(length - 1) === '=') {
          length--;
        }

        if (length > 1 && string.charAt(length - 1) === '=') {
          length--;
        }

        return Math.floor(length * 3 / 4);
      // drop fractional value
    }

    return utf8ByteLength(string);
  }

  static compare(buf1, buf2) {
    if (!Buffer$1.isBuffer(buf1)) {
      throw new TypeError("The \"buf1\" argument must be one of type Buffer or Uint8Array. Received type ".concat(typeof buf1));
    } // TODO: Wrap UInt8Array args in buffers?


    return buf1.compare(buf2);
  }
  /**
     * @param {Buffer[]|UInt8Array[]} list list of Buffers to concatenate
     * @param {integer} [totalLength] Total length of the Buffer instances in list when concatenated.
     * @returns {Buffer}
     */


  static concat(list, totalLength) {
    if (!Array.isArray(list)) {
      throw new TypeError('list argument must be an Array');
    }

    if (list.length === 0) {
      return Buffer$1.alloc(0); // one empty Buffer!
    } // allocate one Buffer of `totalLength`? Cap at totalLength?


    if (totalLength === undefined) {
      totalLength = 0; // generate the total length from each buffer's length?

      for (var i = 0; i < list.length; i++) {
        totalLength += list[i].length;
      }
    }

    var result = Buffer$1.allocUnsafe(totalLength);
    var position = 0;

    for (var _i3 = 0; _i3 < list.length; _i3++) {
      var buf = list[_i3];
      buf.copy(result, position);
      position += buf.length;

      if (position >= totalLength) {
        break;
      }
    }

    return result;
  }
  /**
     * @param {integer[]|Buffer|string} value value we're wrapping
     * @param {string} [encoding='utf8'] The encoding of string.
     * @returns {Buffer}
     */


  static from(value, encoding = 'utf8') {
    var valueType = typeof value;

    if (valueType === 'string') {
      if (!Buffer$1.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: ".concat(encoding));
      }

      encoding = encoding.toLowerCase();

      if (encoding === 'base64') {
        var blob = Ti.Utils.base64decode(value);
        var blobStream = Ti.Stream.createStream({
          source: blob,
          mode: Ti.Stream.MODE_READ });

        var buffer = Ti.Stream.readAll(blobStream);
        blobStream.close();
        return newBuffer(buffer);
      }

      if (encoding === 'hex') {
        return Buffer$1.from(stringToHexBytes(value));
      }

      return newBuffer(Ti.createBuffer({
        value: value,
        type: getTiCodecCharset(encoding) }));

    } else if (valueType === 'object') {
      if (Buffer$1.isBuffer(value)) {
        var length = value.length;

        var _buffer = Buffer$1.allocUnsafe(length);

        if (length === 0) {
          return _buffer;
        }

        value.copy(_buffer, 0, 0, length);
        return _buffer;
      }

      if (Array.isArray(value) || value instanceof Uint8Array) {
        var _length = value.length;

        if (_length === 0) {
          return Buffer$1.allocUnsafe(0);
        }

        var tiBuffer = Ti.createBuffer({
          length: _length });


        for (var i = 0; i < _length; i++) {
          tiBuffer[i] = value[i] & 0xFF; // mask to one byte
        }

        return newBuffer(tiBuffer);
      }

      if (value.apiName && value.apiName === 'Ti.Buffer') {
        return newBuffer(value);
      }
    }

    throw new TypeError('The \'value\' argument must be one of type: \'string\', \'Array\', \'Buffer\', \'Ti.Buffer\'');
  }
  /**
     * @param {string} encoding possible encoding name
     * @returns {boolean}
     */


  static isEncoding(encoding) {
    if (typeof encoding !== 'string') {
      return false;
    }

    return VALID_ENCODINGS.includes(encoding.toLowerCase());
  }
  /**
     * @param {*} obj possible Buffer instance
     * @returns {boolean}
     */


  static isBuffer(obj) {
    return obj !== null && obj !== undefined && obj[isBuffer] === true;
  } // Override how buffers are presented by util.inspect().


  [customInspectSymbol](recurseTimes, ctx) {
    var max = INSPECT_MAX_BYTES;
    var actualMax = Math.min(max, this.length);
    var remaining = this.length - max;
    var str = this.slice(0, actualMax).toString('hex').replace(/(.{2})/g, '$1 ').trim();

    if (remaining > 0) {
      str += " ... ".concat(remaining, " more byte").concat(remaining > 1 ? 's' : '');
    } // Inspect special properties as well, if possible.


    if (ctx) {
      var extras = false;
      var filter = ctx.showHidden ? ALL_PROPERTIES$1 : ONLY_ENUMERABLE$1;
      var obj = getOwnNonIndexProperties(this, filter).reduce((obj, key) => {
        extras = true;
        obj[key] = this[key];
        return obj;
      }, Object.create(null));

      if (extras) {
        if (this.length !== 0) {
          str += ', ';
        } // '[Object: null prototype] {'.length === 26
        // This is guarded with a test.


        str += inspect(obj, _objectSpread2({}, ctx, {
          breakLength: Infinity,
          compact: true })).
        slice(27, -2);
      }
    }

    return "<".concat(this.constructor.name, " ").concat(str, ">");
  }}



Buffer$1.prototype.inspect = Buffer$1.prototype[customInspectSymbol];
Buffer$1.poolSize = 8192;
var BufferModule = {
  Buffer: Buffer$1,
  // TODO: Implement transcode()!
  transcode: (_source, _fromEncoding, _toEncoding) => {},
  INSPECT_MAX_BYTES: 50,
  kMaxLength: 2147483647,
  kStringMaxLength: 1073741799,
  constants: {
    MAX_LENGTH: 2147483647,
    MAX_STRING_LENGTH: 1073741799 } };


/**
                                        * Searches a Buffer for the index of a single byte.
                                        * @param {Buffer} buffer buffer to search
                                        * @param {integer} singleByte byte we're looking for
                                        * @param {integer} offset start offset we search at
                                        * @returns {integer}
                                        */

function indexOf$1(buffer, singleByte, offset) {
  var length = buffer.length;

  for (var i = offset; i < length; i++) {
    if (getAdjustedIndex(buffer, i) === singleByte) {
      return i;
    }
  }

  return -1;
}
/**
   * This function explicitly avoids bitwise operations because JS assumes 32-bit sequences for those.
   * It's possible we may be able to use them when byteLength < 4 if that's faster.
   *
   * @param {integer} unsignedValue value before converting back to signed
   * @param {integer} byteLength number of bytes
   * @returns {integer} the signed value that is represented by the unsigned value's bytes
   */


function unsignedToSigned(unsignedValue, byteLength) {
  var bitLength = byteLength * 8;
  var maxPositiveValue = Math.pow(2, bitLength - 1);

  if (unsignedValue < maxPositiveValue) {
    return unsignedValue;
  }

  var maxUnsignedValue = Math.pow(2, bitLength);
  unsignedValue -= maxUnsignedValue;
  return unsignedValue;
}
/**
   * @param {Ti.Buffer} src source Buffer we're copying from
   * @param {Ti.Buffer} dest destination Buffer we're copying into
   * @param {integer} offset start offset we're copying to in destination
   * @param {integer} length number of bytes to copy
   * @returns {integer} actual number of bytes copied
   */


function copyBuffer(src, dest, offset, length) {
  var srcLength = src.length;
  var destLength = dest.length;
  var i = 0;

  for (; i < length; i++) {
    var destIndex = i + offset; // are we trying to write past end of destination? Or read past end of source? Stop!

    if (destIndex >= destLength || i >= srcLength) {
      break;
    }

    dest[destIndex] = src[i];
  }

  return i;
}
/**
   * @param {string} string utf-8 string
   * @returns {integer}
   */


function utf8ByteLength(string) {
  // Just convert to a Ti.Buffer and let it tell us the length
  var buf = Ti.createBuffer({
    value: string,
    type: Ti.Codec.CHARSET_UTF8 });

  var length = buf.length;
  buf.release(); // release the buffer since we just needed the length

  return length;
}
/**
   * @param {string} encoding desired encoding name
   * @returns {integer} Ti.Codec constant that maps to the encoding
   */


function getTiCodecCharset(encoding) {
  return TI_CODEC_MAP.get(encoding);
}

function bufferToUTF16String(tiBuffer, start, length) {
  var out = '';
  var i = start;

  while (i < length) {
    // utf-16/ucs-2 is 2-bytes per character
    var byte1 = tiBuffer[i++];
    var byte2 = tiBuffer[i++];
    var code_unit = (byte2 << 8) + byte1; // we mash together the two bytes

    out += String.fromCodePoint(code_unit);
  }

  return out;
}
/**
   * loop over input, every 2 characters, parse as an int
   * basically each two characters are a "byte" or an 8-bit uint
   * we append them all together to form a single buffer holding all the values
   * @param {string} value string we're encoding in hex
   * @returns {integer[]} array of encoded bytes
   */


function stringToHexBytes(value) {
  var length = value.length / 2;
  var byteArray = [];

  for (var i = 0; i < length; i++) {
    var numericValue = parseInt(value.substr(i * 2, 2), 16);

    if (!Number.isNaN(numericValue)) {
      // drop bad hex characters
      byteArray.push(numericValue);
    }
  }

  return byteArray;
} // Use a Proxy to hack array style index accessors


var arrayIndexHandler = {
  get(target, propKey, receiver) {
    if (typeof propKey === 'string') {
      var num = Number(propKey);

      if (Number.isSafeInteger(num)) {
        return getAdjustedIndex(target, num);
      }
    } else if (propKey === isBuffer) {
      return true;
    }

    return Reflect.get(target, propKey, receiver);
  },

  set(target, propKey, value, receiver) {
    if (typeof propKey === 'string') {
      var num = Number(propKey);

      if (Number.isSafeInteger(num)) {
        return setAdjustedIndex(target, num, value);
      }
    }

    return Reflect.set(target, propKey, value, receiver);
  },

  has(target, key) {
    if (typeof key === 'string') {
      var num = Number(key);

      if (Number.isSafeInteger(num)) {
        // ensure it's a positive "safe" integer within the range of the buffer
        return num >= 0 && num < target._tiBuffer.length;
      }
    }

    return key in target;
  } };



function getAdjustedIndex(buf, index) {
  if (index < 0 || index >= buf._tiBuffer.length) {
    return undefined;
  }

  return buf._tiBuffer[index + buf.byteOffset];
}

function setAdjustedIndex(buf, index, value) {
  if (index >= 0 || index < buf._tiBuffer.length) {
    buf._tiBuffer[index + buf.byteOffset] = value;
  }

  return value;
}
/**
   * Wraps creation of a Buffer instance inside a Proxy so we can handle array index access
   * @param  {...any} args argunents ot Buffer constructor
   * @returns {Buffer} wrapped inside a Proxy
   */


function newBuffer(...args) {
  return new Proxy(new Buffer$1(...args), arrayIndexHandler); // eslint-disable-line security/detect-new-buffer
}
/**
   * Throws a RangeError if offset is out of bounds
   * @param {Buffer} buffer buffer we're operating on
   * @param {integer} offset user supplied offset
   * @param {integer} byteLength number of bytes needed in range
   * @throws {RangeError}
   */


function checkOffset(buffer, offset, byteLength) {
  var endOffset = buffer.length - byteLength;

  if (offset < 0 || offset > endOffset) {
    throw new RangeError("The value of \"offset\" is out of range. It must be >= 0 and <= ".concat(endOffset, ". Received ").concat(offset));
  }
}
/**
   * @param {integer} value user-supplied value
   * @param {integer} min minimum valid value
   * @param {integer} max maximum valid value
   * @throws {RangeError}
   */


function checkValue(value, min, max) {
  if (value < min || value > max) {
    throw new RangeError("The value of \"value\" is out of range. It must be >= ".concat(min, " and <= ").concat(max, ". Received ").concat(value));
  }
}

var bufferWarningAlreadyEmitted = false;
var nodeModulesCheckCounter = 0;
var bufferWarning = 'Buffer() is deprecated due to security and usability ' + 'issues. Please use the Buffer.alloc(), ' + 'Buffer.allocUnsafe(), or Buffer.from() methods instead.';

function showFlaggedDeprecation() {
  if (bufferWarningAlreadyEmitted || ++nodeModulesCheckCounter > 10000 || isInsideNodeModules()) {
    // We don't emit a warning, because we either:
    // - Already did so, or
    // - Already checked too many times whether a call is coming
    //   from node_modules and want to stop slowing down things, or
    // - The code is inside `node_modules`.
    return;
  }

  process.emitWarning(bufferWarning, 'DeprecationWarning', 'DEP0005');
  bufferWarningAlreadyEmitted = true;
}

var {
  ALL_PROPERTIES: ALL_PROPERTIES$2,
  ONLY_ENUMERABLE: ONLY_ENUMERABLE$2 } =
propertyFilter;
var BooleanPrototype = Boolean.prototype;
var DatePrototype = Date.prototype;
var ErrorPrototype = Error.prototype;
var NumberPrototype = Number.prototype;
var MapPrototype = Map.prototype;
var RegExpPrototype = RegExp.prototype;
var StringPrototype = String.prototype;
var SetPrototype = Set.prototype;
var SymbolPrototype = Symbol.prototype;
var isIos$1 = ['ipad', 'iphone'].includes(Ti.Platform.osname);
var {
  ERR_INVALID_ARG_TYPE } =
codes;
var hasOwnProperty$1 = uncurryThis(Object.prototype.hasOwnProperty);
var propertyIsEnumerable$1 = uncurryThis(Object.prototype.propertyIsEnumerable);
var hexSlice = uncurryThis(BufferModule.Buffer.prototype.hexSlice);
var builtInObjects = new Set(Object.getOwnPropertyNames(global).filter(e => /^([A-Z][a-z]+)+$/.test(e)));
var inspectDefaultOptions = Object.seal({
  showHidden: false,
  depth: 2,
  colors: false,
  customInspect: true,
  showProxy: false,
  maxArrayLength: 100,
  breakLength: 80,
  compact: 3,
  sorted: false,
  getters: false });

var kObjectType = 0;
var kArrayType = 1;
var kArrayExtrasType = 2;
/* eslint-disable no-control-regex */

var strEscapeSequencesRegExp = /[\x00-\x1f\x27\x5c]/;
var strEscapeSequencesReplacer = /[\x00-\x1f\x27\x5c]/g;
var strEscapeSequencesRegExpSingle = /[\x00-\x1f\x5c]/;
var strEscapeSequencesReplacerSingle = /[\x00-\x1f\x5c]/g;
/* eslint-enable no-control-regex */

var keyStrRegExp = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
var numberRegExp = /^(0|[1-9][0-9]*)$/;
var nodeModulesRegExp = /[/\\]node_modules[/\\](.+?)(?=[/\\])/g;
var kMinLineLength = 16; // Constants to map the iterator state.

var kWeak = 0;
var kIterator = 1;
var kMapEntries = 2; // Escaped special characters. Use empty strings to fill up unused entries.

/* eslint-disable quotes */

var meta = ['\\u0000', '\\u0001', '\\u0002', '\\u0003', '\\u0004', '\\u0005', '\\u0006', '\\u0007', '\\b', '\\t', '\\n', '\\u000b', '\\f', '\\r', '\\u000e', '\\u000f', '\\u0010', '\\u0011', '\\u0012', '\\u0013', '\\u0014', '\\u0015', '\\u0016', '\\u0017', '\\u0018', '\\u0019', '\\u001a', '\\u001b', '\\u001c', '\\u001d', '\\u001e', '\\u001f', '', '', '', '', '', '', '', "\\'", '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '\\\\'];
/* eslint-enable quotes */

function getUserOptions(ctx) {
  var obj = {
    stylize: ctx.stylize };


  for (var key of Object.keys(inspectDefaultOptions)) {
    obj[key] = ctx[key];
  }

  if (ctx.userOptions === undefined) {
    return obj;
  }

  return _objectSpread2({}, obj, {}, ctx.userOptions);
}
/**
   * Echos the value of any input. Tries to print the value out
   * in the best way possible given the different types.
   *
   * @param {any} value The value to print out.
   * @param {Object} opts Optional options object that alters the output.
   * @return {string} The string representation of `value`
   */


function inspect(value, opts) {
  // Default options
  var ctx = {
    budget: {},
    indentationLvl: 0,
    seen: [],
    currentDepth: 0,
    stylize: stylizeNoColor,
    showHidden: inspectDefaultOptions.showHidden,
    depth: inspectDefaultOptions.depth,
    colors: inspectDefaultOptions.colors,
    customInspect: inspectDefaultOptions.customInspect,
    showProxy: inspectDefaultOptions.showProxy,
    maxArrayLength: inspectDefaultOptions.maxArrayLength,
    breakLength: inspectDefaultOptions.breakLength,
    compact: inspectDefaultOptions.compact,
    sorted: inspectDefaultOptions.sorted,
    getters: inspectDefaultOptions.getters };


  if (arguments.length > 1) {
    // Legacy...
    if (arguments.length > 2) {
      if (arguments[2] !== undefined) {
        ctx.depth = arguments[2];
      }

      if (arguments.length > 3 && arguments[3] !== undefined) {
        ctx.colors = arguments[3];
      }
    } // Set user-specified options


    if (typeof opts === 'boolean') {
      ctx.showHidden = opts;
    } else if (opts) {
      var optKeys = Object.keys(opts);

      for (var key of optKeys) {
        // TODO(BridgeAR): Find a solution what to do about stylize. Either make
        // this function public or add a new API with a similar or better
        // functionality.
        if (hasOwnProperty$1(inspectDefaultOptions, key) || key === 'stylize') {
          ctx[key] = opts[key];
        } else if (ctx.userOptions === undefined) {
          // This is required to pass through the actual user input.
          ctx.userOptions = opts;
        }
      }
    }
  }

  if (ctx.colors) {
    ctx.stylize = stylizeWithColor;
  }

  if (ctx.maxArrayLength === null) {
    ctx.maxArrayLength = Infinity;
  }

  return formatValue(ctx, value, 0);
}
inspect.custom = customInspectSymbol;
Object.defineProperty(inspect, 'defaultOptions', {
  get() {
    return inspectDefaultOptions;
  },

  set(options) {
    if (options === null || typeof options !== 'object') {
      throw new ERR_INVALID_ARG_TYPE('options', 'Object', options);
    }

    return Object.assign(inspectDefaultOptions, options);
  } });

// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics

inspect.colors = Object.assign(Object.create(null), {
  bold: [1, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  white: [37, 39],
  grey: [90, 39],
  black: [30, 39],
  blue: [34, 39],
  cyan: [36, 39],
  green: [32, 39],
  magenta: [35, 39],
  red: [31, 39],
  yellow: [33, 39] });
// Don't use 'blue' not visible on cmd.exe

inspect.styles = Object.assign(Object.create(null), {
  special: 'cyan',
  number: 'yellow',
  bigint: 'yellow',
  boolean: 'yellow',
  undefined: 'grey',
  null: 'bold',
  string: 'green',
  symbol: 'green',
  date: 'magenta',
  // "name": intentionally not styling
  regexp: 'red',
  module: 'underline' });


function addQuotes(str, quotes) {
  if (quotes === -1) {
    return "\"".concat(str, "\"");
  }

  if (quotes === -2) {
    return "`".concat(str, "`");
  }

  return "'".concat(str, "'");
}

var escapeFn = str => meta[str.charCodeAt(0)]; // Escape control characters, single quotes and the backslash.
// This is similar to JSON stringify escaping.


function strEscape(str) {
  var escapeTest = strEscapeSequencesRegExp;
  var escapeReplace = strEscapeSequencesReplacer;
  var singleQuote = 39; // Check for double quotes. If not present, do not escape single quotes and
  // instead wrap the text in double quotes. If double quotes exist, check for
  // backticks. If they do not exist, use those as fallback instead of the
  // double quotes.
  // eslint-disable-next-line quotes

  if (str.includes("'")) {
    // This invalidates the charCode and therefore can not be matched for
    // anymore.
    if (!str.includes('"')) {
      singleQuote = -1;
    } else if (!str.includes('`') && !str.includes('${')) {
      singleQuote = -2;
    }

    if (singleQuote !== 39) {
      escapeTest = strEscapeSequencesRegExpSingle;
      escapeReplace = strEscapeSequencesReplacerSingle;
    }
  } // Some magic numbers that worked out fine while benchmarking with v8 6.0


  if (str.length < 5000 && !escapeTest.test(str)) {
    return addQuotes(str, singleQuote);
  }

  if (str.length > 100) {
    str = str.replace(escapeReplace, escapeFn);
    return addQuotes(str, singleQuote);
  }

  var result = '';
  var last = 0;
  var lastIndex = str.length;

  for (var i = 0; i < lastIndex; i++) {
    var point = str.charCodeAt(i);

    if (point === singleQuote || point === 92 || point < 32) {
      if (last === i) {
        result += meta[point];
      } else {
        result += "".concat(str.slice(last, i)).concat(meta[point]);
      }

      last = i + 1;
    }
  }

  if (last !== lastIndex) {
    result += str.slice(last);
  }

  return addQuotes(result, singleQuote);
}

function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style !== undefined) {
    var color = inspect.colors[style];
    return "\x1B[".concat(color[0], "m").concat(str, "\x1B[").concat(color[1], "m");
  }

  return str;
}

function stylizeNoColor(str) {
  return str;
} // Return a new empty array to push in the results of the default formatter.


function getEmptyFormatArray() {
  return [];
}

function getConstructorName(obj, _ctx) {
  var firstProto; // const tmp = obj;

  while (obj) {
    var descriptor = Object.getOwnPropertyDescriptor(obj, 'constructor');

    if (descriptor !== undefined && typeof descriptor.value === 'function' && descriptor.value.name !== '') {
      return descriptor.value.name;
    }

    obj = Object.getPrototypeOf(obj);

    if (firstProto === undefined) {
      firstProto = obj;
    }
  }

  if (firstProto === null) {
    return null;
  }
  /*
     @todo this calls into native, can we replace this somehow?
    return `${internalGetConstructorName(tmp)} <${inspect(firstProto, {
    	...ctx,
    	customInspect: false
    })}>`;
    */


  return null;
}

function getPrefix(constructor, tag, fallback) {
  if (constructor === null) {
    if (tag !== '') {
      return "[".concat(fallback, ": null prototype] [").concat(tag, "] ");
    }

    return "[".concat(fallback, ": null prototype] ");
  }

  if (tag !== '' && constructor !== tag) {
    return "".concat(constructor, " [").concat(tag, "] ");
  }

  return "".concat(constructor, " ");
} // Look up the keys of the object.


function getKeys(value, showHidden) {
  var keys;
  var symbols = Object.getOwnPropertySymbols(value);

  if (showHidden) {
    keys = Object.getOwnPropertyNames(value);

    if (symbols.length !== 0) {
      keys.push(...symbols);
    }
  } else {
    // This might throw if `value` is a Module Namespace Object from an
    // unevaluated module, but we don't want to perform the actual type
    // check because it's expensive.
    // TODO(devsnek): track https://github.com/tc39/ecma262/issues/1209
    // and modify this logic as needed.
    try {
      keys = Object.keys(value);
    } catch (err) {
      // @fixme how to du isModuleNamespaceObject?

      /*
      assert(isNativeError(err) && err.name === 'ReferenceError' &&
      			 isModuleNamespaceObject(value));
      */
      keys = Object.getOwnPropertyNames(value);
    }

    if (symbols.length !== 0) {
      keys.push(...symbols.filter(key => propertyIsEnumerable$1(value, key)));
    }
  }

  return keys;
}

function getCtxStyle(value, constructor, tag) {
  var fallback = '';

  if (constructor === null) {
    fallback = 'Object';
  }

  return getPrefix(constructor, tag, fallback);
}

function findTypedConstructor(value) {
  for (var [check, clazz] of [[isUint8Array, Uint8Array], [isUint8ClampedArray, Uint8ClampedArray], [isUint16Array, Uint16Array], [isUint32Array, Uint32Array], [isInt8Array, Int8Array], [isInt16Array, Int16Array], [isInt32Array, Int32Array], [isFloat32Array, Float32Array], [isFloat64Array, Float64Array]]) {
    if (check(value)) {
      return clazz;
    }
  }
}

var lazyNullPrototypeCache; // Creates a subclass and name
// the constructor as `${clazz} : null prototype`

function clazzWithNullPrototype(clazz, name) {
  if (lazyNullPrototypeCache === undefined) {
    lazyNullPrototypeCache = new Map();
  } else {
    var cachedClass = lazyNullPrototypeCache.get(clazz);

    if (cachedClass !== undefined) {
      return cachedClass;
    }
  }

  class NullPrototype extends clazz {
    get [Symbol.toStringTag]() {
      return '';
    }}



  Object.defineProperty(NullPrototype.prototype.constructor, 'name', {
    value: "[".concat(name, ": null prototype]") });

  lazyNullPrototypeCache.set(clazz, NullPrototype);
  return NullPrototype;
}

function noPrototypeIterator(ctx, value, recurseTimes) {
  var newVal;

  if (isSet(value)) {
    var clazz = clazzWithNullPrototype(Set, 'Set');
    newVal = new clazz(SetPrototype.values(value));
  } else if (isMap(value)) {
    var _clazz = clazzWithNullPrototype(Map, 'Map');

    newVal = new _clazz(MapPrototype.entries(value));
  } else if (Array.isArray(value)) {
    var _clazz2 = clazzWithNullPrototype(Array, 'Array');

    newVal = new _clazz2(value.length);
  } else if (isTypedArray$1(value)) {
    var _constructor = findTypedConstructor(value);

    var _clazz3 = clazzWithNullPrototype(_constructor, _constructor.name);

    newVal = new _clazz3(value);
  }

  if (newVal !== undefined) {
    Object.defineProperties(newVal, Object.getOwnPropertyDescriptors(value));
    return formatRaw(ctx, newVal, recurseTimes);
  }
}

function formatValue(ctx, value, recurseTimes, typedArray) {
  // Primitive types cannot have properties.
  if (typeof value !== 'object' && typeof value !== 'function') {
    return formatPrimitive(ctx.stylize, value, ctx);
  }

  if (value === null) {
    return ctx.stylize('null', 'null');
  } // Memorize the context for custom inspection on proxies.


  var context = value;
  /*
                       @fixme check for proxies
                       // Always check for proxies to prevent side effects and to prevent triggering
                       // any proxy handlers.
                       const proxy = getProxyDetails(value);
                       if (proxy !== undefined) {
                       	if (ctx.showProxy) {
                       		return formatProxy(ctx, proxy, recurseTimes);
                       	}
                       	value = proxy[0];
                       }
                       */
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it.

  if (ctx.customInspect) {
    var maybeCustom = value[customInspectSymbol];

    if (typeof maybeCustom === 'function' // Filter out the util module, its inspect function is special.
    && maybeCustom !== inspect // Also filter out any prototype objects using the circular check.
    && !(value.constructor && value.constructor.prototype === value)) {
      // This makes sure the recurseTimes are reported as before while using
      // a counter internally.
      var depth = ctx.depth === null ? null : ctx.depth - recurseTimes;
      var ret = maybeCustom.call(context, depth, getUserOptions(ctx)); // If the custom inspection method returned `this`, don't go into
      // infinite recursion.

      if (ret !== context) {
        if (typeof ret !== 'string') {
          return formatValue(ctx, ret, recurseTimes);
        }

        return ret.replace(/\n/g, "\n".concat(' '.repeat(ctx.indentationLvl)));
      }
    }
  } // Using an array here is actually better for the average case than using
  // a Set. `seen` will only check for the depth and will never grow too large.


  if (ctx.seen.includes(value)) {
    var index = 1;

    if (ctx.circular === undefined) {
      ctx.circular = new Map([[value, index]]);
    } else {
      index = ctx.circular.get(value);

      if (index === undefined) {
        index = ctx.circular.size + 1;
        ctx.circular.set(value, index);
      }
    }

    return ctx.stylize("[Circular *".concat(index, "]"), 'special');
  }

  return formatRaw(ctx, value, recurseTimes, typedArray);
}

function formatRaw(ctx, value, recurseTimes, typedArray) {
  var keys;
  var constructor = getConstructorName(value);
  var tag = value[Symbol.toStringTag]; // Only list the tag in case it's non-enumerable / not an own property.
  // Otherwise we'd print this twice.

  if (typeof tag !== 'string' || tag !== '' && (ctx.showHidden ? hasOwnProperty$1 : propertyIsEnumerable$1)(value, Symbol.toStringTag)) {
    tag = '';
  }

  var base = '';
  var formatter = getEmptyFormatArray;
  var braces;
  var noIterator = true;
  var i = 0;
  var filter = ctx.showHidden ? ALL_PROPERTIES$2 : ONLY_ENUMERABLE$2;
  var extrasType = kObjectType; // Iterators and the rest are split to reduce checks.

  if (value[Symbol.iterator]) {
    noIterator = false;

    if (Array.isArray(value)) {
      keys = getOwnNonIndexProperties(value, filter); // Only set the constructor for non ordinary ("Array [...]") arrays.

      var prefix = getPrefix(constructor, tag, 'Array');
      braces = ["".concat(prefix === 'Array ' ? '' : prefix, "["), ']'];

      if (value.length === 0 && keys.length === 0) {
        return "".concat(braces[0], "]");
      }

      extrasType = kArrayExtrasType;
      formatter = formatArray;
    } else if (isSet(value)) {
      keys = getKeys(value, ctx.showHidden);

      var _prefix = getPrefix(constructor, tag, 'Set');

      if (value.size === 0 && keys.length === 0) {
        return "".concat(_prefix, "{}");
      }

      braces = ["".concat(_prefix, "{"), '}'];
      formatter = formatSet;
    } else if (isMap(value)) {
      keys = getKeys(value, ctx.showHidden);

      var _prefix2 = getPrefix(constructor, tag, 'Map');

      if (value.size === 0 && keys.length === 0) {
        return "".concat(_prefix2, "{}");
      }

      braces = ["".concat(_prefix2, "{"), '}'];
      formatter = formatMap;
    } else if (isTypedArray$1(value)) {
      keys = getOwnNonIndexProperties(value, filter);

      var _prefix3 = constructor !== null ? getPrefix(constructor, tag) : getPrefix(constructor, tag, findTypedConstructor(value).name);

      braces = ["".concat(_prefix3, "["), ']'];

      if (value.length === 0 && keys.length === 0 && !ctx.showHidden) {
        return "".concat(braces[0], "]");
      }

      formatter = formatTypedArray;
      extrasType = kArrayExtrasType;
    } else if (isMapIterator(value)) {
      keys = getKeys(value, ctx.showHidden);
      braces = getIteratorBraces('Map', tag);
      formatter = formatIterator;
    } else if (isSetIterator(value)) {
      keys = getKeys(value, ctx.showHidden);
      braces = getIteratorBraces('Set', tag);
      formatter = formatIterator;
    } else {
      noIterator = true;
    }
  }

  if (noIterator) {
    keys = getKeys(value, ctx.showHidden);
    braces = ['{', '}'];

    if (constructor === 'Object') {
      if (isArgumentsObject(value)) {
        braces[0] = '[Arguments] {';
      } else if (tag !== '') {
        braces[0] = "".concat(getPrefix(constructor, tag, 'Object'), "{");
      }

      if (keys.length === 0) {
        return "".concat(braces[0], "}");
      }
    } else if (typeof value === 'function') {
      base = getFunctionBase(value, constructor, tag);

      if (keys.length === 0) {
        return ctx.stylize(base, 'special');
      }
    } else if (isRegExp(value)) {
      // Make RegExps say that they are RegExps
      // eslint-disable-next-line security/detect-non-literal-regexp
      var regExp = constructor !== null ? value : new RegExp(value);
      base = RegExpPrototype.toString.call(regExp);

      var _prefix4 = getPrefix(constructor, tag, 'RegExp');

      if (_prefix4 !== 'RegExp ') {
        base = "".concat(_prefix4).concat(base);
      }

      if (keys.length === 0 || recurseTimes > ctx.depth && ctx.depth !== null) {
        return ctx.stylize(base, 'regexp');
      }
    } else if (isDate(value)) {
      // Make dates with properties first say the date
      base = Number.isNaN(DatePrototype.getTime.call(value)) ? DatePrototype.toString.call(value) : DatePrototype.toISOString.call(value);

      var _prefix5 = getPrefix(constructor, tag, 'Date');

      if (_prefix5 !== 'Date ') {
        base = "".concat(_prefix5).concat(base);
      }

      if (keys.length === 0) {
        return ctx.stylize(base, 'date');
      }
    } else if (isError(value)) {
      base = formatError(value, constructor, tag, ctx);

      if (keys.length === 0) {
        return base;
      } else if (isIos$1) {
        var nativeErrorProps = ['line', 'column', 'sourceURL'];

        if (keys.every(key => nativeErrorProps.includes(key))) {
          return base;
        }
      }
    } else if (isAnyArrayBuffer(value)) {
      // Fast path for ArrayBuffer and SharedArrayBuffer.
      // Can't do the same for DataView because it has a non-primitive
      // .buffer property that we need to recurse for.
      var arrayType = isArrayBuffer(value) ? 'ArrayBuffer' : 'SharedArrayBuffer';

      var _prefix6 = getPrefix(constructor, tag, arrayType);

      if (typedArray === undefined) {
        formatter = formatArrayBuffer;
      } else if (keys.length === 0) {
        return "".concat(_prefix6, "{ byteLength: ").concat(formatNumber(ctx.stylize, value.byteLength), " }");
      }

      braces[0] = "".concat(_prefix6, "{");
      keys.unshift('byteLength');
    } else if (isDataView(value)) {
      braces[0] = "".concat(getPrefix(constructor, tag, 'DataView'), "{"); // .buffer goes last, it's not a primitive like the others.

      keys.unshift('byteLength', 'byteOffset', 'buffer');
    } else if (isPromise(value)) {
      braces[0] = "".concat(getPrefix(constructor, tag, 'Promise'), "{");
      formatter = formatPromise;
    } else if (isWeakSet(value)) {
      braces[0] = "".concat(getPrefix(constructor, tag, 'WeakSet'), "{");
      formatter = ctx.showHidden ? formatWeakSet : formatWeakCollection;
    } else if (isWeakMap(value)) {
      braces[0] = "".concat(getPrefix(constructor, tag, 'WeakMap'), "{");
      formatter = ctx.showHidden ? formatWeakMap : formatWeakCollection;
      /*
                                                                          * @fixme how to do isModuleNamespaceObject?
                                                                         } else if (isModuleNamespaceObject(value)) {
                                                                         	braces[0] = `[${tag}] {`;
                                                                         	formatter = formatNamespaceObject;
                                                                         */
    } else if (isBoxedPrimitive(value)) {
      base = getBoxedBase(value, ctx, keys, constructor, tag);

      if (keys.length === 0) {
        return base;
      }
    } else {
      // The input prototype got manipulated. Special handle these. We have to
      // rebuild the information so we are able to display everything.
      if (constructor === null) {
        var specialIterator = noPrototypeIterator(ctx, value, recurseTimes);

        if (specialIterator) {
          return specialIterator;
        }
      }

      if (isMapIterator(value)) {
        braces = getIteratorBraces('Map', tag);
        formatter = formatIterator;
      } else if (isSetIterator(value)) {
        braces = getIteratorBraces('Set', tag);
        formatter = formatIterator; // Handle other regular objects again.
      } else {
        if (keys.length === 0) {
          return "".concat(getCtxStyle(value, constructor, tag), "{}");
        }

        braces[0] = "".concat(getCtxStyle(value, constructor, tag), "{");
      }
    }
  }

  if (recurseTimes > ctx.depth && ctx.depth !== null) {
    var constructorName = getCtxStyle(value, constructor, tag).slice(0, -1);

    if (constructor !== null) {
      constructorName = "[".concat(constructorName, "]");
    }

    return ctx.stylize(constructorName, 'special');
  }

  recurseTimes += 1;
  ctx.seen.push(value);
  ctx.currentDepth = recurseTimes;
  var output;
  var indentationLvl = ctx.indentationLvl;

  try {
    output = formatter(ctx, value, recurseTimes, keys, braces);

    for (i = 0; i < keys.length; i++) {
      output.push(formatProperty(ctx, value, recurseTimes, keys[i], extrasType));
    }
  } catch (err) {
    var _constructorName = getCtxStyle(value, constructor, tag).slice(0, -1);

    return handleMaxCallStackSize(ctx, err, _constructorName, indentationLvl);
  }

  if (ctx.circular !== undefined) {
    var index = ctx.circular.get(value);

    if (index !== undefined) {
      var reference = ctx.stylize("<ref *".concat(index, ">"), 'special'); // Add reference always to the very beginning of the output.

      if (ctx.compact !== true) {
        base = base === '' ? reference : "".concat(reference, " ").concat(base);
      } else {
        braces[0] = "".concat(reference, " ").concat(braces[0]);
      }
    }
  }

  ctx.seen.pop();

  if (ctx.sorted) {
    var comparator = ctx.sorted === true ? undefined : ctx.sorted;

    if (extrasType === kObjectType) {
      output = output.sort(comparator);
    } else if (keys.length > 1) {
      var sorted = output.slice(output.length - keys.length).sort(comparator);
      output.splice(output.length - keys.length, keys.length, ...sorted);
    }
  }

  var res = reduceToSingleString(ctx, output, base, braces, extrasType, recurseTimes, value);
  var budget = ctx.budget[ctx.indentationLvl] || 0;
  var newLength = budget + res.length;
  ctx.budget[ctx.indentationLvl] = newLength; // If any indentationLvl exceeds this limit, limit further inspecting to the
  // minimum. Otherwise the recursive algorithm might continue inspecting the
  // object even though the maximum string size (~2 ** 28 on 32 bit systems and
  // ~2 ** 30 on 64 bit systems) exceeded. The actual output is not limited at
  // exactly 2 ** 27 but a bit higher. This depends on the object shape.
  // This limit also makes sure that huge objects don't block the event loop
  // significantly.

  if (newLength > Math.pow(2, 27)) {
    ctx.depth = -1;
  }

  return res;
}

function getIteratorBraces(type, tag) {
  if (tag !== "".concat(type, " Iterator")) {
    if (tag !== '') {
      tag += '] [';
    }

    tag += "".concat(type, " Iterator");
  }

  return ["[".concat(tag, "] {"), '}'];
}

function getBoxedBase(value, ctx, keys, constructor, tag) {
  var fn;
  var type;

  if (isNumberObject(value)) {
    fn = NumberPrototype;
    type = 'Number';
  } else if (isStringObject(value)) {
    fn = StringPrototype;
    type = 'String'; // For boxed Strings, we have to remove the 0-n indexed entries,
    // since they just noisy up the output and are redundant
    // Make boxed primitive Strings look like such

    keys.splice(0, value.length);
  } else if (isBooleanObject(value)) {
    fn = BooleanPrototype;
    type = 'Boolean';
  } else {
    fn = SymbolPrototype;
    type = 'Symbol';
  }

  var base = "[".concat(type);

  if (type !== constructor) {
    if (constructor === null) {
      base += ' (null prototype)';
    } else {
      base += " (".concat(constructor, ")");
    }
  }

  base += ": ".concat(formatPrimitive(stylizeNoColor, fn.valueOf(value), ctx), "]");

  if (tag !== '' && tag !== constructor) {
    base += " [".concat(tag, "]");
  }

  if (keys.length !== 0 || ctx.stylize === stylizeNoColor) {
    return base;
  }

  return ctx.stylize(base, type.toLowerCase());
}

function getFunctionBase(value, constructor, tag) {
  var type = 'Function';

  if (isGeneratorFunction(value)) {
    type = "Generator".concat(type);
  }

  if (isAsyncFunction(value)) {
    type = "Async".concat(type);
  }

  var base = "[".concat(type);

  if (constructor === null) {
    base += ' (null prototype)';
  }

  if (value.name === '') {
    base += ' (anonymous)';
  } else {
    base += ": ".concat(value.name);
  }

  base += ']';

  if (constructor !== type && constructor !== null) {
    base += " ".concat(constructor);
  }

  if (tag !== '' && constructor !== tag) {
    base += " [".concat(tag, "]");
  }

  return base;
}

function formatError(err, constructor, tag, ctx) {
  var stack = err.stack || ErrorPrototype.toString.call(err); // try to normalize JavaScriptCore stack to match v8

  if (isIos$1) {
    var lines = stack.split('\n');
    stack = "".concat(err.name, ": ").concat(err.message);

    if (lines.length > 0) {
      stack += lines.map(stackLine => {
        var atSymbolIndex = stackLine.indexOf('@');
        var source = stackLine.slice(atSymbolIndex + 1);
        var sourcePattern = /(.*):(\d+):(\d+)/;
        var symbolName = 'unknown';

        if (atSymbolIndex !== -1) {
          symbolName = stackLine.slice(0, atSymbolIndex);
        }

        var sourceMatch = source.match(sourcePattern);

        if (sourceMatch) {
          var filePath = sourceMatch[1];
          var lineNumber = sourceMatch[2];
          var column = sourceMatch[3];

          if (filePath.startsWith('file:')) {
            filePath = filePath.replace("file://".concat(Ti.Filesystem.resourcesDirectory), '');
          }

          return "\n    at ".concat(symbolName, " (").concat(filePath, ":").concat(lineNumber, ":").concat(column, ")");
        } else {
          return "\n    at ".concat(symbolName, " (").concat(source, ")");
        }
      }).join('');
    }
  } // A stack trace may contain arbitrary data. Only manipulate the output
  // for "regular errors" (errors that "look normal") for now.


  var name = err.name || 'Error';
  var len = name.length;

  if (constructor === null || name.endsWith('Error') && stack.startsWith(name) && (stack.length === len || stack[len] === ':' || stack[len] === '\n')) {
    var fallback = 'Error';

    if (constructor === null) {
      var start = stack.match(/^([A-Z][a-z_ A-Z0-9[\]()-]+)(?::|\n {4}at)/) || stack.match(/^([a-z_A-Z0-9-]*Error)$/);
      fallback = start && start[1] || '';
      len = fallback.length;
      fallback = fallback || 'Error';
    }

    var prefix = getPrefix(constructor, tag, fallback).slice(0, -1);

    if (name !== prefix) {
      if (prefix.includes(name)) {
        if (len === 0) {
          stack = "".concat(prefix, ": ").concat(stack);
        } else {
          stack = "".concat(prefix).concat(stack.slice(len));
        }
      } else {
        stack = "".concat(prefix, " [").concat(name, "]").concat(stack.slice(len));
      }
    }
  } // Ignore the error message if it's contained in the stack.


  var pos = err.message && stack.indexOf(err.message) || -1;

  if (pos !== -1) {
    pos += err.message.length;
  } // Wrap the error in brackets in case it has no stack trace.


  var stackStart = stack.indexOf('\n    at', pos);

  if (stackStart === -1) {
    stack = "[".concat(stack, "]");
  } else if (ctx.colors) {
    // Highlight userland code and node modules.
    var newStack = stack.slice(0, stackStart);

    var _lines = stack.slice(stackStart + 1).split('\n');

    for (var line of _lines) {
      // This adds underscores to all node_modules to quickly identify them.
      var nodeModule = void 0;
      newStack += '\n';
      var _pos = 0;

      while (nodeModule = nodeModulesRegExp.exec(line)) {
        // '/node_modules/'.length === 14
        newStack += line.slice(_pos, nodeModule.index + 14);
        newStack += ctx.stylize(nodeModule[1], 'module');
        _pos = nodeModule.index + nodeModule[0].length;
      }

      newStack += _pos === 0 ? line : line.slice(_pos);
    }

    stack = newStack;
  } // The message and the stack have to be indented as well!


  if (ctx.indentationLvl !== 0) {
    var indentation = ' '.repeat(ctx.indentationLvl);
    stack = stack.replace(/\n/g, "\n".concat(indentation));
  }

  return stack;
}

function formatPromise(ctx, _value, _recurseTimes) {
  // Node calls into native to get promise details which we can't do
  return [ctx.stylize('<unknown>', 'special')];
}

function formatProperty(ctx, value, recurseTimes, key, type) {
  var name, str;
  var extra = ' ';
  var desc = Object.getOwnPropertyDescriptor(value, key) || {
    value: value[key],
    enumerable: true };


  if (desc.value !== undefined) {
    var diff = type !== kObjectType || ctx.compact !== true ? 2 : 3;
    ctx.indentationLvl += diff;
    str = formatValue(ctx, desc.value, recurseTimes);

    if (diff === 3) {
      var len = ctx.colors ? removeColors(str).length : str.length;

      if (ctx.breakLength < len) {
        extra = "\n".concat(' '.repeat(ctx.indentationLvl));
      }
    }

    ctx.indentationLvl -= diff;
  } else if (desc.get !== undefined) {
    var label = desc.set !== undefined ? 'Getter/Setter' : 'Getter';
    var s = ctx.stylize;
    var sp = 'special';

    if (ctx.getters && (ctx.getters === true || ctx.getters === 'get' && desc.set === undefined || ctx.getters === 'set' && desc.set !== undefined)) {
      try {
        var tmp = value[key];
        ctx.indentationLvl += 2;

        if (tmp === null) {
          str = "".concat(s("[".concat(label, ":"), sp), " ").concat(s('null', 'null')).concat(s(']', sp));
        } else if (typeof tmp === 'object') {
          str = "".concat(s("[".concat(label, "]"), sp), " ").concat(formatValue(ctx, tmp, recurseTimes));
        } else {
          var primitive = formatPrimitive(s, tmp, ctx);
          str = "".concat(s("[".concat(label, ":"), sp), " ").concat(primitive).concat(s(']', sp));
        }

        ctx.indentationLvl -= 2;
      } catch (err) {
        var message = "<Inspection threw (".concat(err.message, ")>");
        str = "".concat(s("[".concat(label, ":"), sp), " ").concat(message).concat(s(']', sp));
      }
    } else {
      str = ctx.stylize("[".concat(label, "]"), sp);
    }
  } else if (desc.set !== undefined) {
    str = ctx.stylize('[Setter]', 'special');
  } else {
    str = ctx.stylize('undefined', 'undefined');
  }

  if (type === kArrayType) {
    return str;
  }

  if (typeof key === 'symbol') {
    var _tmp = key.toString().replace(strEscapeSequencesReplacer, escapeFn);

    name = "[".concat(ctx.stylize(_tmp, 'symbol'), "]");
  } else if (desc.enumerable === false) {
    name = "[".concat(key.replace(strEscapeSequencesReplacer, escapeFn), "]");
  } else if (keyStrRegExp.test(key)) {
    name = ctx.stylize(key, 'name');
  } else {
    name = ctx.stylize(strEscape(key), 'string');
  }

  return "".concat(name, ":").concat(extra).concat(str);
}

function groupArrayElements(ctx, output, value) {
  var totalLength = 0;
  var maxLength = 0;
  var i = 0;
  var outputLength = output.length;

  if (ctx.maxArrayLength < output.length) {
    // This makes sure the "... n more items" part is not taken into account.
    outputLength--;
  }

  var separatorSpace = 2; // Add 1 for the space and 1 for the separator.

  var dataLen = new Array(outputLength); // Calculate the total length of all output entries and the individual max
  // entries length of all output entries. We have to remove colors first,
  // otherwise the length would not be calculated properly.

  for (; i < outputLength; i++) {
    var len = ctx.colors ? removeColors(output[i]).length : output[i].length;
    dataLen[i] = len;
    totalLength += len + separatorSpace;

    if (maxLength < len) {
      maxLength = len;
    }
  } // Add two to `maxLength` as we add a single whitespace character plus a comma
  // in-between two entries.


  var actualMax = maxLength + separatorSpace; // Check if at least three entries fit next to each other and prevent grouping
  // of arrays that contains entries of very different length (i.e., if a single
  // entry is longer than 1/5 of all other entries combined). Otherwise the
  // space in-between small entries would be enormous.

  if (actualMax * 3 + ctx.indentationLvl < ctx.breakLength && (totalLength / actualMax > 5 || maxLength <= 6)) {
    var approxCharHeights = 2.5;
    var averageBias = Math.sqrt(actualMax - totalLength / output.length);
    var biasedMax = Math.max(actualMax - 3 - averageBias, 1); // Dynamically check how many columns seem possible.

    var columns = Math.min( // Ideally a square should be drawn. We expect a character to be about 2.5
    // times as high as wide. This is the area formula to calculate a square
    // which contains n rectangles of size `actualMax * approxCharHeights`.
    // Divide that by `actualMax` to receive the correct number of columns.
    // The added bias increases the columns for short entries.
    Math.round(Math.sqrt(approxCharHeights * biasedMax * outputLength) / biasedMax), // Do not exceed the breakLength.
    Math.floor((ctx.breakLength - ctx.indentationLvl) / actualMax), // Limit array grouping for small `compact` modes as the user requested
    // minimal grouping.
    ctx.compact * 4, // Limit the columns to a maximum of fifteen.
    15); // Return with the original output if no grouping should happen.

    if (columns <= 1) {
      return output;
    }

    var tmp = [];
    var maxLineLength = [];

    for (var _i = 0; _i < columns; _i++) {
      var lineMaxLength = 0;

      for (var j = _i; j < output.length; j += columns) {
        if (dataLen[j] > lineMaxLength) {
          lineMaxLength = dataLen[j];
        }
      }

      lineMaxLength += separatorSpace;
      maxLineLength[_i] = lineMaxLength;
    }

    var order = 'padStart';

    if (value !== undefined) {
      for (var _i2 = 0; _i2 < output.length; _i2++) {
        if (typeof value[_i2] !== 'number') {
          order = 'padEnd';
          break;
        }
      }
    } // Each iteration creates a single line of grouped entries.


    for (var _i3 = 0; _i3 < outputLength; _i3 += columns) {
      // The last lines may contain less entries than columns.
      var max = Math.min(_i3 + columns, outputLength);
      var str = '';
      var _j = _i3;

      for (; _j < max - 1; _j++) {
        // Calculate extra color padding in case it's active. This has to be
        // done line by line as some lines might contain more colors than
        // others.
        var padding = maxLineLength[_j - _i3] + output[_j].length - dataLen[_j];
        str += "".concat(output[_j], ", ")[order](padding, ' ');
      }

      if (order === 'padStart') {
        var _padding = maxLineLength[_j - _i3] + output[_j].length - dataLen[_j] - separatorSpace;

        str += output[_j].padStart(_padding, ' ');
      } else {
        str += output[_j];
      }

      tmp.push(str);
    }

    if (ctx.maxArrayLength < output.length) {
      tmp.push(output[outputLength]);
    }

    output = tmp;
  }

  return output;
}

function handleMaxCallStackSize(ctx, err, constructorName, indentationLvl) {
  if (isStackOverflowError(err)) {
    ctx.seen.pop();
    ctx.indentationLvl = indentationLvl;
    return ctx.stylize("[".concat(constructorName, ": Inspection interrupted 'prematurely. Maximum call stack size exceeded.]"), 'special');
  }

  throw err;
}

function formatNumber(fn, value) {
  // Format -0 as '-0'. Checking `value === -0` won't distinguish 0 from -0.
  return fn(Object.is(value, -0) ? '-0' : "".concat(value), 'number');
}

function formatBigInt(fn, value) {
  return fn("".concat(value, "n"), 'bigint');
}

function formatPrimitive(fn, value, ctx) {
  if (typeof value === 'string') {
    if (ctx.compact !== true && value.length > kMinLineLength && value.length > ctx.breakLength - ctx.indentationLvl - 4) {
      return value.split(/\n/).map(line => fn(strEscape(line), 'string')).join(" +\n".concat(' '.repeat(ctx.indentationLvl + 2)));
    }

    return fn(strEscape(value), 'string');
  }

  if (typeof value === 'number') {
    return formatNumber(fn, value);
  }
  /*
    if (typeof value === 'bigint') {
    	return formatBigInt(fn, value);
    }
    */


  if (typeof value === 'boolean') {
    return fn("".concat(value), 'boolean');
  }

  if (typeof value === 'undefined') {
    return fn('undefined', 'undefined');
  } // es6 symbol primitive


  return fn(SymbolPrototype.toString.call(value), 'symbol');
} // The array is sparse and/or has extra keys


function formatSpecialArray(ctx, value, recurseTimes, maxLength, output, i) {
  var keys = Object.keys(value);
  var index = i;

  for (; i < keys.length && output.length < maxLength; i++) {
    var key = keys[i];
    var tmp = +key; // Arrays can only have up to 2^32 - 1 entries

    if (tmp > Math.pow(2, 32) - 2) {
      break;
    }

    if ("".concat(index) !== key) {
      if (!numberRegExp.test(key)) {
        break;
      }

      var emptyItems = tmp - index;
      var ending = emptyItems > 1 ? 's' : '';
      var message = "<".concat(emptyItems, " empty item").concat(ending, ">");
      output.push(ctx.stylize(message, 'undefined'));
      index = tmp;

      if (output.length === maxLength) {
        break;
      }
    }

    output.push(formatProperty(ctx, value, recurseTimes, key, kArrayType));
    index++;
  }

  var remaining = value.length - index;

  if (output.length !== maxLength) {
    if (remaining > 0) {
      var _ending = remaining > 1 ? 's' : '';

      var _message = "<".concat(remaining, " empty item").concat(_ending, ">");

      output.push(ctx.stylize(_message, 'undefined'));
    }
  } else if (remaining > 0) {
    output.push("... ".concat(remaining, " more item").concat(remaining > 1 ? 's' : ''));
  }

  return output;
}

function formatArrayBuffer(ctx, value) {
  var buffer = new Uint8Array(value);
  /*
                                      // @fixme rollup cannot handle lazy loaded modules, maybe move to webpack?
                                      if (hexSlice === undefined) {
                                      	hexSlice = uncurryThis(require('../../buffer').default.Buffer.prototype.hexSlice);
                                      }
                                      */

  var str = hexSlice(buffer, 0, Math.min(ctx.maxArrayLength, buffer.length)).replace(/(.{2})/g, '$1 ').trim();
  var remaining = buffer.length - ctx.maxArrayLength;

  if (remaining > 0) {
    str += " ... ".concat(remaining, " more byte").concat(remaining > 1 ? 's' : '');
  }

  return ["".concat(ctx.stylize('[Uint8Contents]', 'special'), ": <").concat(str, ">")];
}

function formatArray(ctx, value, recurseTimes) {
  var valLen = value.length;
  var len = Math.min(Math.max(0, ctx.maxArrayLength), valLen);
  var remaining = valLen - len;
  var output = [];

  for (var i = 0; i < len; i++) {
    // Special handle sparse arrays.
    if (!hasOwnProperty$1(value, i)) {
      return formatSpecialArray(ctx, value, recurseTimes, len, output, i);
    }

    output.push(formatProperty(ctx, value, recurseTimes, i, kArrayType));
  }

  if (remaining > 0) {
    output.push("... ".concat(remaining, " more item").concat(remaining > 1 ? 's' : ''));
  }

  return output;
}

function formatTypedArray(ctx, value, recurseTimes) {
  var maxLength = Math.min(Math.max(0, ctx.maxArrayLength), value.length);
  var remaining = value.length - maxLength;
  var output = new Array(maxLength);
  var elementFormatter = value.length > 0 && typeof value[0] === 'number' ? formatNumber : formatBigInt;

  for (var i = 0; i < maxLength; ++i) {
    output[i] = elementFormatter(ctx.stylize, value[i]);
  }

  if (remaining > 0) {
    output[maxLength] = "... ".concat(remaining, " more item").concat(remaining > 1 ? 's' : '');
  }

  if (ctx.showHidden) {
    // .buffer goes last, it's not a primitive like the others.
    ctx.indentationLvl += 2;

    for (var key of ['BYTES_PER_ELEMENT', 'length', 'byteLength', 'byteOffset', 'buffer']) {
      var str = formatValue(ctx, value[key], recurseTimes, true);
      output.push("[".concat(key, "]: ").concat(str));
    }

    ctx.indentationLvl -= 2;
  }

  return output;
}

function formatSet(ctx, value, recurseTimes) {
  var output = [];
  ctx.indentationLvl += 2;

  for (var v of value) {
    output.push(formatValue(ctx, v, recurseTimes));
  }

  ctx.indentationLvl -= 2; // With `showHidden`, `length` will display as a hidden property for
  // arrays. For consistency's sake, do the same for `size`, even though this
  // property isn't selected by Object.getOwnPropertyNames().

  if (ctx.showHidden) {
    output.push("[size]: ".concat(ctx.stylize("".concat(value.size), 'number')));
  }

  return output;
}

function formatMap(ctx, value, recurseTimes) {
  var output = [];
  ctx.indentationLvl += 2;

  for (var [k, v] of value) {
    output.push("".concat(formatValue(ctx, k, recurseTimes), " => ").concat(formatValue(ctx, v, recurseTimes)));
  }

  ctx.indentationLvl -= 2; // See comment in formatSet

  if (ctx.showHidden) {
    output.push("[size]: ".concat(ctx.stylize("".concat(value.size), 'number')));
  }

  return output;
}

function formatSetIterInner(ctx, recurseTimes, entries, state) {
  var maxArrayLength = Math.max(ctx.maxArrayLength, 0);
  var maxLength = Math.min(maxArrayLength, entries.length);
  var output = new Array(maxLength);
  ctx.indentationLvl += 2;

  for (var i = 0; i < maxLength; i++) {
    output[i] = formatValue(ctx, entries[i], recurseTimes);
  }

  ctx.indentationLvl -= 2;

  if (state === kWeak && !ctx.sorted) {
    // Sort all entries to have a halfway reliable output (if more entries than
    // retrieved ones exist, we can not reliably return the same output) if the
    // output is not sorted anyway.
    output = output.sort();
  }

  var remaining = entries.length - maxLength;

  if (remaining > 0) {
    output.push("... ".concat(remaining, " more item").concat(remaining > 1 ? 's' : ''));
  }

  return output;
}

function formatMapIterInner(ctx, recurseTimes, entries, state) {
  var maxArrayLength = Math.max(ctx.maxArrayLength, 0); // Entries exist as [key1, val1, key2, val2, ...]

  var len = entries.length / 2;
  var remaining = len - maxArrayLength;
  var maxLength = Math.min(maxArrayLength, len);
  var output = new Array(maxLength);
  var i = 0;
  ctx.indentationLvl += 2;

  if (state === kWeak) {
    for (; i < maxLength; i++) {
      var pos = i * 2;
      output[i] = "".concat(formatValue(ctx, entries[pos], recurseTimes)) + " => ".concat(formatValue(ctx, entries[pos + 1], recurseTimes));
    } // Sort all entries to have a halfway reliable output (if more entries than
    // retrieved ones exist, we can not reliably return the same output) if the
    // output is not sorted anyway.


    if (!ctx.sorted) {
      output = output.sort();
    }
  } else {
    for (; i < maxLength; i++) {
      var _pos2 = i * 2;

      var res = [formatValue(ctx, entries[_pos2], recurseTimes), formatValue(ctx, entries[_pos2 + 1], recurseTimes)];
      output[i] = reduceToSingleString(ctx, res, '', ['[', ']'], kArrayExtrasType, recurseTimes);
    }
  }

  ctx.indentationLvl -= 2;

  if (remaining > 0) {
    output.push("... ".concat(remaining, " more item").concat(remaining > 1 ? 's' : ''));
  }

  return output;
}

function formatWeakCollection(ctx) {
  return [ctx.stylize('<items unknown>', 'special')];
}

function formatWeakSet(ctx, _value, _recurseTimes) {
  // Node calls into native to get a preview of actual values which we can't do
  return formatWeakCollection(ctx);
}

function formatWeakMap(ctx, _value, _recurseTimes) {
  // Node calls into native to get a preview of actual values which we can't do
  return formatWeakCollection(ctx);
}

function formatIterator(ctx, value, recurseTimes, _keys, braces) {
  var entries = [];
  var isKeyValue = false;
  var result = value.next();

  while (!result.done) {
    var currentEntry = result.value;
    entries.push(currentEntry);

    if (currentEntry[0] !== currentEntry[1]) {
      isKeyValue = true;
    }

    result = value.next();
  }

  if (isKeyValue) {
    // Mark entry iterators as such.
    braces[0] = braces[0].replace(/ Iterator] {$/, ' Entries] {');
    return formatMapIterInner(ctx, recurseTimes, entries, kMapEntries);
  }

  return formatSetIterInner(ctx, recurseTimes, entries, kIterator);
}

function isBelowBreakLength(ctx, output, start, base) {
  // Each entry is separated by at least a comma. Thus, we start with a total
  // length of at least `output.length`. In addition, some cases have a
  // whitespace in-between each other that is added to the total as well.
  var totalLength = output.length + start;

  if (totalLength + output.length > ctx.breakLength) {
    return false;
  }

  for (var i = 0; i < output.length; i++) {
    if (ctx.colors) {
      totalLength += removeColors(output[i]).length;
    } else {
      totalLength += output[i].length;
    }

    if (totalLength > ctx.breakLength) {
      return false;
    }
  } // Do not line up properties on the same line if `base` contains line breaks.


  return base === '' || !base.includes('\n');
}

function reduceToSingleString(ctx, output, base, braces, extrasType, recurseTimes, value) {
  if (ctx.compact !== true) {
    if (typeof ctx.compact === 'number' && ctx.compact >= 1) {
      // Memorize the original output length. In case the the output is grouped,
      // prevent lining up the entries on a single line.
      var entries = output.length; // Group array elements together if the array contains at least six
      // separate entries.

      if (extrasType === kArrayExtrasType && entries > 6) {
        output = groupArrayElements(ctx, output, value);
      } // `ctx.currentDepth` is set to the most inner depth of the currently
      // inspected object part while `recurseTimes` is the actual current depth
      // that is inspected.
      //
      // Example:
      //
      // const a = { first: [ 1, 2, 3 ], second: { inner: [ 1, 2, 3 ] } }
      //
      // The deepest depth of `a` is 2 (a.second.inner) and `a.first` has a max
      // depth of 1.
      //
      // Consolidate all entries of the local most inner depth up to
      // `ctx.compact`, as long as the properties are smaller than
      // `ctx.breakLength`.


      if (ctx.currentDepth - recurseTimes < ctx.compact && entries === output.length) {
        // Line up all entries on a single line in case the entries do not
        // exceed `breakLength`. Add 10 as constant to start next to all other
        // factors that may reduce `breakLength`.
        var start = output.length + ctx.indentationLvl + braces[0].length + base.length + 10;

        if (isBelowBreakLength(ctx, output, start, base)) {
          return "".concat(base ? "".concat(base, " ") : '').concat(braces[0], " ").concat(join(output, ', '), " ").concat(braces[1]);
        }
      }
    } // Line up each entry on an individual line.


    var _indentation = "\n".concat(' '.repeat(ctx.indentationLvl));

    return "".concat(base ? "".concat(base, " ") : '').concat(braces[0]).concat(_indentation, "  ") + "".concat(join(output, ",".concat(_indentation, "  "))).concat(_indentation).concat(braces[1]);
  } // Line up all entries on a single line in case the entries do not exceed
  // `breakLength`.


  if (isBelowBreakLength(ctx, output, 0, base)) {
    return "".concat(braces[0]).concat(base ? " ".concat(base) : '', " ").concat(join(output, ', '), " ") + braces[1];
  }

  var indentation = ' '.repeat(ctx.indentationLvl); // If the opening "brace" is too large, like in the case of "Set {",
  // we need to force the first item to be on the next line or the
  // items will not line up correctly.

  var ln = base === '' && braces[0].length === 1 ? ' ' : "".concat(base ? " ".concat(base) : '', "\n").concat(indentation, "  "); // Line up each entry on an individual line.

  return "".concat(braces[0]).concat(ln).concat(join(output, ",\n".concat(indentation, "  ")), " ").concat(braces[1]);
}

function format(...args) {
  return formatWithOptions(undefined, ...args);
}

var firstErrorLine = error => error.message.split('\n')[0];

var CIRCULAR_ERROR_MESSAGE;

function tryStringify(arg) {
  try {
    return JSON.stringify(arg);
  } catch (err) {
    // Populate the circular error message lazily
    if (!CIRCULAR_ERROR_MESSAGE) {
      try {
        var a = {};
        a.a = a;
        JSON.stringify(a);
      } catch (e) {
        CIRCULAR_ERROR_MESSAGE = firstErrorLine(e);
      }
    }

    if (err.name === 'TypeError' && firstErrorLine(err) === CIRCULAR_ERROR_MESSAGE) {
      return '[Circular]';
    }

    throw err;
  }
}
/* eslint-disable max-depth */


function formatWithOptions(inspectOptions, ...args) {
  var first = args[0];
  var a = 0;
  var str = '';
  var join = '';

  if (typeof first === 'string') {
    if (args.length === 1) {
      return first;
    }

    var tempStr;
    var lastPos = 0;

    for (var i = 0; i < first.length - 1; i++) {
      if (first.charCodeAt(i) === 37) {
        // '%'
        var nextChar = first.charCodeAt(++i);

        if (a + 1 !== args.length) {
          switch (nextChar) {
            case 115:
              // 's'
              var tempArg = args[++a];

              if (typeof tempArg === 'number') {
                tempStr = formatNumber(stylizeNoColor, tempArg);
                /*
                                                                 } else if (typeof tempArg === 'bigint') {
                                                                 	tempStr = `${tempArg}n`;
                                                                 */
              } else {
                var constr = void 0;

                if (typeof tempArg !== 'object' || tempArg === null || typeof tempArg.toString === 'function' && (hasOwnProperty$1(tempArg, 'toString') // A direct own property on the constructor prototype in
                // case the constructor is not an built-in object.
                || (constr = tempArg.constructor) && !builtInObjects.has(constr.name) && constr.prototype && hasOwnProperty$1(constr.prototype, 'toString'))) {
                  tempStr = String(tempArg);
                } else {
                  tempStr = inspect(tempArg, _objectSpread2({}, inspectOptions, {
                    compact: 3,
                    colors: false,
                    depth: 0 }));

                }
              }

              break;

            case 106:
              // 'j'
              tempStr = tryStringify(args[++a]);
              break;

            case 100:
              // 'd'
              var tempNum = args[++a];
              /*
                                       if (typeof tempNum === 'bigint') {
                                       	tempStr = `${tempNum}n`;
                                       } else
                                       */

              if (typeof tempNum === 'symbol') {
                tempStr = 'NaN';
              } else {
                tempStr = formatNumber(stylizeNoColor, Number(tempNum));
              }

              break;

            case 79:
              // 'O'
              tempStr = inspect(args[++a], inspectOptions);
              break;

            case 111:
              // 'o'
              {
                tempStr = inspect(args[++a], _objectSpread2({}, inspectOptions, {
                  showHidden: true,
                  showProxy: true,
                  depth: 4 }));

                break;
              }

            case 105:
              // 'i'
              var tempInteger = args[++a];
              /*
                                           if (typeof tempInteger === 'bigint') {
                                           	tempStr = `${tempInteger}n`;
                                           } else */

              if (typeof tempInteger === 'symbol') {
                tempStr = 'NaN';
              } else {
                tempStr = formatNumber(stylizeNoColor, parseInt(tempInteger));
              }

              break;

            case 102:
              // 'f'
              var tempFloat = args[++a];

              if (typeof tempFloat === 'symbol') {
                tempStr = 'NaN';
              } else {
                tempStr = formatNumber(stylizeNoColor, parseFloat(tempFloat));
              }

              break;

            case 37:
              // '%'
              str += first.slice(lastPos, i);
              lastPos = i + 1;
              continue;

            default:
              // Any other character is not a correct placeholder
              continue;}


          if (lastPos !== i - 1) {
            str += first.slice(lastPos, i - 1);
          }

          str += tempStr;
          lastPos = i + 1;
        } else if (nextChar === 37) {
          str += first.slice(lastPos, i);
          lastPos = i + 1;
        }
      }
    }

    if (lastPos !== 0) {
      a++;
      join = ' ';

      if (lastPos < first.length) {
        str += first.slice(lastPos);
      }
    }
  }

  while (a < args.length) {
    var value = args[a];
    str += join;
    str += typeof value !== 'string' ? inspect(value, inspectOptions) : value;
    join = ' ';
    a++;
  }

  return str;
}
/* eslint-enable max-depth */

var nativeDebug = console.debug;
var nativeError = console.error;
var nativeInfo = console.info;
var nativeLog = console.log;
var nativeWarn = console.warn;
var kColorInspectOptions = {
  colors: true };

var kNoColorInspectOptions = {};

console.debug = function (...args) {
  nativeDebug.call(console, formatWithOptions(kColorInspectOptions, ...args));
};

console.error = function (...args) {
  nativeError.call(console, formatWithOptions(kNoColorInspectOptions, ...args));
};

console.info = function (...args) {
  nativeInfo.call(console, formatWithOptions(kColorInspectOptions, ...args));
};

console.log = function (...args) {
  nativeLog.call(console, formatWithOptions(kColorInspectOptions, ...args));
};

console.warn = function (...args) {
  nativeWarn.call(console, formatWithOptions(kNoColorInspectOptions, ...args));
};

/**
    * Appcelerator Titanium Mobile
    * Copyright (c) 2018 by Axway, Inc. All Rights Reserved.
    * Licensed under the terms of the Apache Public License
    * Please see the LICENSE included with this distribution for details.
    */
// Add a toJSON() method to all Error objects needed to output non-enumerable properties.
// The JSON.stringify() will automatically call this method if it exists to provide custom output.
// Notes:
// - In V8, all Error properties are not enumerable. We need this or else stringify() will return "{}".
// - In JavaScriptCore, only the "stack" property is not enumerable. We want to reveal this.
if (typeof Error.prototype.toJSON !== 'function') {
  Error.prototype.toJSON = function () {
    var properties = {};
    Object.getOwnPropertyNames(this).forEach(function (name) {
      properties[name] = this[name];
    }, this);
    return properties;
  };
}

/**
   * Appcelerator Titanium Mobile
   * Copyright (c) 2019 by Axway, Inc. All Rights Reserved.
   * Licensed under the terms of the Apache Public License
   * Please see the LICENSE included with this distribution for details.
   */
{
  var buffer = Ti.createBuffer({
    value: '' });

  var blob = buffer.toBlob();

  blob.constructor.prototype.toString = function () {
    var value = this.text;
    return value === undefined ? '[object TiBlob]' : value;
  };

  if (parseInt(Ti.Platform.version.split('.')[0]) < 11) {
    // This is hack to fix TIMOB-27707. Remove it after minimum target set iOS 11+
    setTimeout(function () {}, Infinity);
  }
}

/**
   * Appcelerator Titanium Mobile
   * Copyright (c) 2019 by Axway, Inc. All Rights Reserved.
   * Licensed under the terms of the Apache Public License
   * Please see the LICENSE included with this distribution for details.
   */
var colorset;
var osVersion; // As Android passes a new instance of Ti.UI to every JS file we can't just
// Ti.UI within this file, we must call kroll.binding to get the Titanium
// namespace that is passed in with require and that deal with the .UI
// namespace that is on that directly.

var uiModule = Ti.UI;

if (Ti.Android) {
  uiModule = kroll.binding('Titanium').Titanium.UI;
}

uiModule.SEMANTIC_COLOR_TYPE_LIGHT = 'light';
uiModule.SEMANTIC_COLOR_TYPE_DARK = 'dark'; // We need to track this manually with a getter/setter
// due to the same reasons we use uiModule instead of Ti.UI

var currentColorType = uiModule.SEMANTIC_COLOR_TYPE_LIGHT;
Object.defineProperty(uiModule, 'semanticColorType', {
  get: () => {
    return currentColorType;
  },
  set: colorType => {
    currentColorType = colorType;
  } });


uiModule.fetchSemanticColor = function fetchSemanticColor(colorName) {
  if (!osVersion) {
    osVersion = parseInt(Ti.Platform.version.split('.')[0]);
  }

  if (Ti.App.iOS && osVersion >= 13) {
    return Ti.UI.iOS.fetchSemanticColor(colorName);
  } else {
    if (!colorset) {
      try {
        var colorsetFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'semantic.colors.json');

        if (colorsetFile.exists()) {
          colorset = JSON.parse(colorsetFile.read().text);
        }
      } catch (error) {
        console.error('Failed to load colors file \'semantic.colors.json\'');
        return;
      }
    }

    try {
      return colorset[colorName][uiModule.semanticColorType].color || colorset[colorName][uiModule.semanticColorType];
    } catch (error) {
      console.error("Failed to lookup color for ".concat(colorName));
    }
  }
};

/**
    * @param {EventEmitter} emitter the EventEmitter instance to use to register for it's events
    * @param {string} eventName the name of the event to register for
    * @param {function} listener the listener callback/function to invoke when the event is emitted
    * @param {boolean} prepend whether to prepend or append the listener
    * @returns {EventEmitter}
    */
function _addListener(emitter, eventName, listener, prepend) {
  if (!emitter._eventsToListeners) {
    // no events/listeners registered
    emitter._eventsToListeners = {}; // initialize it
  } // if there's someone listening to 'newListener' events, emit that **before** we add the listener (to avoid infinite recursion)


  if (emitter._eventsToListeners.newListener) {
    emitter.emit('newListener', eventName, listener);
  }

  var eventListeners = emitter._eventsToListeners[eventName] || [];

  if (prepend) {
    eventListeners.unshift(listener);
  } else {
    eventListeners.push(listener);
  }

  emitter._eventsToListeners[eventName] = eventListeners; // Check max listeners and spit out warning if >

  var max = emitter.getMaxListeners();
  var length = eventListeners.length;

  if (max > 0 && length > max) {
    var w = new Error("Possible EventEmitter memory leak detected. ".concat(length, " ").concat(eventName, " listeners added. Use emitter.setMaxListeners() to increase limit"));
    w.name = 'MaxListenersExceededWarning';
    w.emitter = emitter;
    w.type = eventName;
    w.count = length;
    process.emitWarning(w);
  }

  return emitter;
}

function onceWrap(emitter, eventName, listener) {
  function wrapper(...args) {
    this.emitter.removeListener(this.eventName, this.wrappedFunc); // remove ourselves

    this.listener.apply(this.emitter, args); // then forward the event callback
  } // we have to use bind with a custom 'this', because events fire with 'this' pointing at the emitter


  var wrapperThis = {
    emitter,
    eventName,
    listener };

  var bound = wrapper.bind(wrapperThis); // bind to force "this" to refer to our custom object tracking the wrapper/emitter/listener

  bound.listener = listener; // have to add listener property for "unwrapping"

  wrapperThis.wrappedFunc = bound;
  return bound;
} // many consumers make use of this via util.inherits, which does not chain constructor calls!
// so we need to be aware that _eventsToListeners maye be null/undefined on instances, and check in methods before accessing it


class EventEmitter {
  constructor() {
    this._eventsToListeners = {};
    this._maxListeners = undefined;
  }

  addListener(eventName, listener) {
    return _addListener(this, eventName, listener, false);
  }

  on(eventName, listener) {
    return this.addListener(eventName, listener);
  }

  prependListener(eventName, listener) {
    return _addListener(this, eventName, listener, true);
  }

  once(eventName, listener) {
    this.on(eventName, onceWrap(this, eventName, listener));
  }

  prependOnceListener(eventName, listener) {
    this.prependListener(eventName, onceWrap(this, eventName, listener));
  }

  removeListener(eventName, listener) {
    if (!this._eventsToListeners) {
      // no events/listeners registered
      return this;
    }

    var eventListeners = this._eventsToListeners[eventName] || [];
    var length = eventListeners.length;
    var foundIndex = -1;
    var unwrappedListener; // Need to search LIFO, and need to handle wrapped functions (once wrappers)

    for (var i = length - 1; i >= 0; i--) {
      if (eventListeners[i] === listener || eventListeners[i].listener === listener) {
        foundIndex = i;
        unwrappedListener = eventListeners[i].listener;
        break;
      }
    }

    if (foundIndex !== -1) {
      if (length === 1) {
        // length was 1 and we want to remove last entry, so delete the event type from our listener mapping now!
        delete this._eventsToListeners[eventName];
      } else {
        // we had 2+ listeners, so store array without this given listener
        eventListeners.splice(foundIndex, 1); // modifies in place, no need to assign to this.listeners[eventName]
      } // Don't emit if there's no listeners for 'removeListener' type!


      if (this._eventsToListeners.removeListener) {
        this.emit('removeListener', eventName, unwrappedListener || listener);
      }
    }

    return this;
  }

  off(eventName, listener) {
    return this.removeListener(eventName, listener);
  }

  emit(eventName, ...args) {
    if (!this._eventsToListeners) {
      // no events/listeners registered
      return false;
    }

    var eventListeners = this._eventsToListeners[eventName] || [];

    for (var listener of eventListeners.slice()) {
      // must operate on copy because listeners ,ay get remove as side-effect of calling
      listener.call(this, ...args);
    }

    return eventListeners.length !== 0;
  }

  listenerCount(eventName) {
    if (!this._eventsToListeners) {
      // no events/listeners registered
      return 0;
    }

    var eventListeners = this._eventsToListeners[eventName] || [];
    return eventListeners.length;
  }

  eventNames() {
    return Object.getOwnPropertyNames(this._eventsToListeners || {});
  }

  listeners(eventName) {
    if (!this._eventsToListeners) {
      // no events/listeners registered
      return [];
    } // Need to "unwrap" once wrappers!


    var raw = this._eventsToListeners[eventName] || [];
    return raw.map(l => l.listener || l); // here we unwrap the once wrapper if there is one or fall back to listener function
  }

  rawListeners(eventName) {
    if (!this._eventsToListeners) {
      // no events/listeners registered
      return [];
    }

    return (this._eventsToListeners[eventName] || []).slice(0); // return a copy
  }

  getMaxListeners() {
    return this._maxListeners || EventEmitter.defaultMaxListeners;
  }

  setMaxListeners(n) {
    this._maxListeners = n; // TODO: Type check n, make sure >= 0 (o equals no limit)

    return this;
  }

  removeAllListeners(eventName) {
    if (!this._eventsToListeners) {
      // no events/listeners registered
      this._eventsToListeners = {}; // initialize it
    }

    if (!this._eventsToListeners.removeListener) {
      // no need to emit! we can just wipe!
      if (eventName === undefined) {
        // remove every type!
        this._eventsToListeners = {};
      } else {
        // remove specific type
        delete this._eventsToListeners[eventName];
      }

      return this;
    } // yuck, we'll have to emit 'removeListener' events as we go


    if (eventName === undefined) {
      // Remove all types (but do 'removeListener' last!)
      var names = Object.keys(this._eventsToListeners).filter(name => name !== 'removeListener');
      names.forEach(name => this.removeAllListeners(name));
      this.removeAllListeners('removeListener');
      this._eventsToListeners = {};
    } else {
      // remove listeners for one type, back to front (Last-in, first-out, except where prepend f-ed it up)
      var listeners = this._eventsToListeners[eventName] || [];

      for (var i = listeners.length - 1; i >= 0; i--) {
        this.removeListener(eventName, listeners[i]);
      }
    }

    return this;
  }}


EventEmitter.defaultMaxListeners = 10;

EventEmitter.listenerCount = function (emitter, eventName) {
  return emitter.listenerCount(eventName);
};

EventEmitter.EventEmitter = EventEmitter;

/**
                                           * @param  {*} arg passed in argument value
                                           * @param  {string} name name of the argument
                                           * @param  {string} typename i.e. 'string', 'Function' (value is compared to typeof after lowercasing)
                                           * @return {void}
                                           * @throws {TypeError}
                                           */
function assertArgumentType(arg, name, typename) {
  var type = typeof arg;

  if (type !== typename.toLowerCase()) {
    throw new TypeError("The \"".concat(name, "\" argument must be of type ").concat(typename, ". Received type ").concat(type));
  }
}

var startTime = Date.now();
/**
                             * This function 'standardizes' the reported architectures to the equivalents reported by Node.js
                             * node values: 'arm', 'arm64', 'ia32', 'mips', 'mipsel', 'ppc', 'ppc64', 's390', 's390x', 'x32', and 'x64'.
                             * iOS values: "arm64", "armv7", "x86_64", "i386", "Unknown"
                             * Android values: "armeabi", "armeabi-v7a", "arm64-v8a", "x86", "x86_64", "mips", "mips64", "unknown"
                             * Windows values: "x64", "ia64", "ARM", "x86", "unknown"
                             * @param {string} original original architecture reported by Ti.Platform
                             * @returns {string}
                             */

function standardizeArch(original) {
  switch (original) {
    // coerce 'armv7', 'armeabi', 'armeabi-v7a', 'ARM' -> 'arm'
    // 'armeabi' is a dead ABI for Android, removed in NDK r17
    case 'armv7':
    case 'armeabi':
    case 'armeabi-v7a':
    case 'ARM':
      return 'arm';
    // coerce 'arm64-v8a' -> 'arm64'

    case 'arm64-v8a':
      return 'arm64';
    // coerce 'i386', 'x86' -> 'ia32'

    case 'i386':
    case 'x86':
      return 'ia32';
    // coerce 'x86_64', 'ia64', 'x64' -> 'x64'

    case 'x86_64':
    case 'ia64':
      return 'x64';
    // coerce 'mips64' -> 'mips' // 'mips' and 'mips64' are dead ABIs for Android, removed in NDK r17

    case 'mips64':
      return 'mips';
    // coerce 'Unknown' -> 'unknown'

    case 'Unknown':
      return 'unknown';

    default:
      return original;}

}

var process$5 = new EventEmitter();

process$5.abort = () => {}; // TODO: Do we have equivalent of forcibly killing the process? We have restart, but I think we just want a no-op stub here


process$5.arch = standardizeArch(Ti.Platform.architecture);
process$5.argv = []; // TODO: What makes sense here? path to titanium cli for first arg? path to ti.main/app.js for second?

Object.defineProperty(process$5, 'argv0', {
  value: '',
  // TODO: Path to .app on iOS?
  writable: false,
  enumerable: true,
  configurable: false });


process$5.binding = () => {
  throw new Error('process.binding is unsupported and not user-facing API');
};

process$5.channel = undefined;

process$5.chdir = () => {
  throw new Error('process.chdir is unsupported');
};

process$5.config = {};
process$5.connected = false;

process$5.cpuUsage = () => {
  // FIXME: Can we look at OS.cpus to get this data?
  return {
    user: 0,
    system: 0 };

};

process$5.cwd = () => __dirname;

Object.defineProperty(process$5, 'debugPort', {
  get: function () {
    var value = 0; // default to 0

    try {
      if (Ti.Platform.osname === 'android') {
        var assets = kroll.binding('assets');
        var json = assets.readAsset('deploy.json');

        if (json) {
          var deployData = JSON.parse(json);

          if (deployData.debuggerPort !== -1) {
            // -1 means not set (not in debug mode)
            value = deployData.debuggerPort;
          }
        }
      } else if (true) {
        // iOS is 27753 as of ios < 11.3 for simulators
        // for 11.3+ it uses a unix socket
        // for devices, it uses usbmuxd
        value = 27753; // TODO: Can we only return this for simulator < 11.3?
      }
    } catch (error) {} // ignore
    // overwrite this getter with static value


    Object.defineProperty(this, 'debugPort', {
      value: value,
      writable: true,
      enumerable: true,
      configurable: true });

    return value;
  },
  enumerable: true,
  configurable: true });


process$5.disconnect = () => {}; // no-op


process$5.dlopen = () => {
  throw new Error('process.dlopen is not supported');
};

process$5.emitWarning = function (warning, options, code, ctor) {
  // eslint-disable-line no-unused-vars
  var type;
  var detail;

  if (typeof options === 'string') {
    type = options;
  } else if (typeof options === 'object') {
    type = options.type;
    code = options.code;
    detail = options.detail;
  }

  if (typeof warning === 'string') {
    // TODO: make use of `ctor` arg for limiting stack traces? Can only really be used on V8
    // set stack trace limit to 0, then call Error.captureStackTrace(warning, ctor);
    warning = new Error(warning);
    warning.name = type || 'Warning';

    if (code !== undefined) {
      warning.code = code;
    }

    if (detail !== undefined) {
      warning.detail = detail;
    }
  } // TODO: Throw TypeError if not an instanceof Error at this point!


  var isDeprecation = warning.name === 'DeprecationWarning';

  if (isDeprecation && process$5.noDeprecation) {
    return; // ignore
  }

  if (isDeprecation && process$5.throwDeprecation) {
    throw warning;
  }

  this.emit('warning', warning);
};

function loadEnvJson() {
  try {
    var jsonFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, '_env_.json');

    if (jsonFile.exists()) {
      return JSON.parse(jsonFile.read().text);
    }
  } catch (error) {
    Ti.API.error("Failed to read \"_env_.json\". Reason: ".concat(error.message));
  }

  return {};
}

Object.defineProperty(process$5, 'env', {
  get: function () {
    delete this.env;
    return this.env = loadEnvJson();
  },
  enumerable: true,
  configurable: true });

process$5.execArgv = [];
process$5.execPath = ''; // FIXME: What makes sense here? Path to titanium CLI here?

process$5.exit = () => {
  throw new Error('process.exit is not supported');
};

process$5.exitCode = undefined;
process$5.noDeprecation = false;
process$5.pid = 0; // FIXME: Should we try and adopt 'ipad'/'iphone' to 'darwin'? or 'ios'?

process$5.platform = Ti.Platform.osname;
process$5.ppid = 0; // TODO: Add release property (Object)
// TODO: Can we expose stdout/stderr/stdin natively?

process$5.stderr = {
  isTTY: false,
  writable: true,
  write: (chunk, encoding, callback) => {
    console.error(chunk);

    if (callback) {
      callback();
    }

    return true;
  } };

process$5.stdout = {
  isTTY: false,
  writable: true,
  write: (chunk, encoding, callback) => {
    console.log(chunk);

    if (callback) {
      callback();
    }

    return true;
  } };

process$5.title = Ti.App.name;
process$5.throwDeprecation = false;
process$5.traceDeprecation = false;

process$5.umask = () => 0; // just always return 0


process$5.uptime = () => {
  var diffMs = Date.now() - startTime;
  return diffMs / 1000.0; // convert to "seconds" with fractions
};

process$5.version = "9.1.0";
process$5.versions = {
  modules: '',
  // TODO: Report module api version (for current platform!)
  v8: '',
  // TODO: report android's v8 version (if on Android!)
  jsc: '' // TODO: report javascriptcore version for iOS/WIndows?
  // TODO: Report ios/Android/Windows platform versions?
};

global.process = process$5; // handle spitting out warnings

var WARNING_PREFIX = "(titanium:".concat(process$5.pid, ") ");
process$5.on('warning', warning => {
  var isDeprecation = warning.name === 'DeprecationWarning'; // if we're not doing deprecations, ignore!

  if (isDeprecation && process$5.noDeprecation) {
    return;
  } // TODO: Check process.traceDeprecation and if set, include stack trace in message!


  var msg = WARNING_PREFIX;

  if (warning.code !== undefined) {
    msg += "[".concat(warning.code, "] ");
  }

  if (warning.toString) {
    msg += warning.toString();
  }

  if (warning.detail) {
    msg += "\n".concat(warning.detail);
  }

  console.error(msg);
});
var uncaughtExceptionCallback = null;

process$5.hasUncaughtExceptionCaptureCallback = () => uncaughtExceptionCallback !== null;

process$5.setUncaughtExceptionCaptureCallback = fn => {
  if (fn === null) {
    uncaughtExceptionCallback = null;
    return;
  }

  assertArgumentType(fn, 'fn', 'function');

  if (uncaughtExceptionCallback !== null) {
    throw new Error('`process.setUncaughtExceptionCaptureCallback()` was called while a capture callback was already active');
  }

  uncaughtExceptionCallback = fn;
};

Ti.App.addEventListener('uncaughtException', function (event) {
  // Create an Error instance that wraps the data from the event
  // ideally we'd just forward along the original Error!
  var error = new Error(event.message);
  error.stack = event.backtrace;
  error.fileName = event.sourceName;
  error.lineNumber = event.line;
  error.columnNumber = event.lineOffset;

  if (process$5.hasUncaughtExceptionCaptureCallback()) {
    return uncaughtExceptionCallback(error);
  } // otherwise forward the event!


  process$5.emit('uncaughtException', error);
});
// JS engine should be able to optimize easier

class CallbackWithArgs {
  constructor(func, args) {
    this.func = func;
    this.args = args;
  }

  run() {
    if (this.args) {
      this.func.apply(null, this.args);
    } else {
      this.fun();
    }
  }}

// nextTick vs setImmediate should be handled in a semi-smart way
// Basically nextTick needs to drain the full queue (and can cause infinite loops if nextTick callback calls nextTick!)
// Then we should go through the "immediate" queue
// http://plafer.github.io/2015/09/08/nextTick-vs-setImmediate/


var tickQueue = [];
var immediateQueue = [];
var drainingTickQueue = false;
var drainQueuesTimeout = null;
/**
                                * Iteratively runs all "ticks" until there are no more.
                                * This can cause infinite recursion if a tick schedules another forever.
                                */

function drainTickQueue() {
  if (drainingTickQueue) {
    return;
  }

  drainingTickQueue = true;

  while (tickQueue.length) {
    var tick = tickQueue.shift();
    tick.run();
  }

  drainingTickQueue = false;
}

function drainQueues() {
  // drain the full tick queue first...
  drainTickQueue(); // tick queue should be empty!

  var immediatesRemaining = processImmediateQueue();

  if (immediatesRemaining !== 0) {
    // re-schedule draining our queues, as we have at least one more "immediate" to handle
    drainQueuesTimeout = setTimeout(drainQueues, 0);
  } else {
    drainQueuesTimeout = null;
  }
}
/**
   * Attempts to process "immediates" (in a much more leisurely way than ticks)
   * We give a 100ms window to run them in before re-scheduling the timeout to process them again.
   * If any ticks are added during invocation of immediate, we drain the tick queue fully before
   * proceeding to next immediate (if we still have time in our window).
   * @returns {number} number of remaining immediates to be processed
   */


function processImmediateQueue() {
  var immediateDeadline = Date.now() + 100; // give us up to 100ms to process immediates

  while (immediateQueue.length && Date.now() < immediateDeadline) {
    var immediate = immediateQueue.shift();
    immediate.run();

    if (tickQueue.length > 0) {
      // they added a tick! drain the tick queue before we do anything else (this *may* eat up our deadline/window to process any more immediates)
      drainTickQueue();
    }
  }

  return immediateQueue.length;
}

process$5.nextTick = function (callback, ...args) {
  assertArgumentType(callback, 'callback', 'function');
  tickQueue.push(new CallbackWithArgs(callback, args));

  if (!drainQueuesTimeout) {
    drainQueuesTimeout = setTimeout(drainQueues, 0);
  }
};

global.setImmediate = function (callback, ...args) {
  assertArgumentType(callback, 'callback', 'function');
  var immediate = new CallbackWithArgs(callback, args);
  immediateQueue.push(immediate);

  if (!drainQueuesTimeout) {
    drainQueuesTimeout = setTimeout(drainQueues, 0);
  }

  return immediate;
};

global.clearImmediate = function (immediate) {
  var index = immediateQueue.indexOf(immediate);

  if (index !== -1) {
    immediateQueue.splice(index, 1);
  }
};

var FORWARD_SLASH = 47; // '/'

var BACKWARD_SLASH = 92; // '\\'

/**
 * Is this [a-zA-Z]?
 * @param  {number}  charCode value from String.charCodeAt()
 * @return {Boolean}          [description]
 */

function isWindowsDeviceName(charCode) {
  return charCode >= 65 && charCode <= 90 || charCode >= 97 && charCode <= 122;
}
/**
   * [isAbsolute description]
   * @param  {boolean} isPosix whether this impl is for POSIX or not
   * @param  {string} filepath   input file path
   * @return {Boolean}          [description]
   */


function isAbsolute(isPosix, filepath) {
  assertArgumentType(filepath, 'path', 'string');
  var length = filepath.length; // empty string special case

  if (length === 0) {
    return false;
  }

  var firstChar = filepath.charCodeAt(0);

  if (firstChar === FORWARD_SLASH) {
    return true;
  } // we already did our checks for posix


  if (isPosix) {
    return false;
  } // win32 from here on out


  if (firstChar === BACKWARD_SLASH) {
    return true;
  }

  if (length > 2 && isWindowsDeviceName(firstChar) && filepath.charAt(1) === ':') {
    var thirdChar = filepath.charAt(2);
    return thirdChar === '/' || thirdChar === '\\';
  }

  return false;
}
/**
   * [dirname description]
   * @param  {string} separator  platform-specific file separator
   * @param  {string} filepath   input file path
   * @return {string}            [description]
   */


function dirname(separator, filepath) {
  assertArgumentType(filepath, 'path', 'string');
  var length = filepath.length;

  if (length === 0) {
    return '.';
  } // ignore trailing separator


  var fromIndex = length - 1;
  var hadTrailing = filepath.endsWith(separator);

  if (hadTrailing) {
    fromIndex--;
  }

  var foundIndex = filepath.lastIndexOf(separator, fromIndex); // no separators

  if (foundIndex === -1) {
    // handle special case of root windows paths
    if (length >= 2 && separator === '\\' && filepath.charAt(1) === ':') {
      var firstChar = filepath.charCodeAt(0);

      if (isWindowsDeviceName(firstChar)) {
        return filepath; // it's a root windows path
      }
    }

    return '.';
  } // only found root separator


  if (foundIndex === 0) {
    return separator; // if it was '/', return that
  } // Handle special case of '//something'


  if (foundIndex === 1 && separator === '/' && filepath.charAt(0) === '/') {
    return '//';
  }

  return filepath.slice(0, foundIndex);
}
/**
   * [extname description]
   * @param  {string} separator  platform-specific file separator
   * @param  {string} filepath   input file path
   * @return {string}            [description]
   */


function extname(separator, filepath) {
  assertArgumentType(filepath, 'path', 'string');
  var index = filepath.lastIndexOf('.');

  if (index === -1 || index === 0) {
    return '';
  } // ignore trailing separator


  var endIndex = filepath.length;

  if (filepath.endsWith(separator)) {
    endIndex--;
  }

  return filepath.slice(index, endIndex);
}

function lastIndexWin32Separator(filepath, index) {
  for (var i = index; i >= 0; i--) {
    var char = filepath.charCodeAt(i);

    if (char === BACKWARD_SLASH || char === FORWARD_SLASH) {
      return i;
    }
  }

  return -1;
}
/**
   * [basename description]
   * @param  {string} separator  platform-specific file separator
   * @param  {string} filepath   input file path
   * @param  {string} [ext]      file extension to drop if it exists
   * @return {string}            [description]
   */


function basename(separator, filepath, ext) {
  assertArgumentType(filepath, 'path', 'string');

  if (ext !== undefined) {
    assertArgumentType(ext, 'ext', 'string');
  }

  var length = filepath.length;

  if (length === 0) {
    return '';
  }

  var isPosix = separator === '/';
  var endIndex = length; // drop trailing separator (if there is one)

  var lastCharCode = filepath.charCodeAt(length - 1);

  if (lastCharCode === FORWARD_SLASH || !isPosix && lastCharCode === BACKWARD_SLASH) {
    endIndex--;
  } // Find last occurence of separator


  var lastIndex = -1;

  if (isPosix) {
    lastIndex = filepath.lastIndexOf(separator, endIndex - 1);
  } else {
    // On win32, handle *either* separator!
    lastIndex = lastIndexWin32Separator(filepath, endIndex - 1); // handle special case of root path like 'C:' or 'C:\\'

    if ((lastIndex === 2 || lastIndex === -1) && filepath.charAt(1) === ':' && isWindowsDeviceName(filepath.charCodeAt(0))) {
      return '';
    }
  } // Take from last occurrence of separator to end of string (or beginning to end if not found)


  var base = filepath.slice(lastIndex + 1, endIndex); // drop trailing extension (if specified)

  if (ext === undefined) {
    return base;
  }

  return base.endsWith(ext) ? base.slice(0, base.length - ext.length) : base;
}
/**
   * The `path.normalize()` method normalizes the given path, resolving '..' and '.' segments.
   *
   * When multiple, sequential path segment separation characters are found (e.g.
   * / on POSIX and either \ or / on Windows), they are replaced by a single
   * instance of the platform-specific path segment separator (/ on POSIX and \
   * on Windows). Trailing separators are preserved.
   *
   * If the path is a zero-length string, '.' is returned, representing the
   * current working directory.
   *
   * @param  {string} separator  platform-specific file separator
   * @param  {string} filepath  input file path
   * @return {string} [description]
   */


function normalize$1(separator, filepath) {
  assertArgumentType(filepath, 'path', 'string');

  if (filepath.length === 0) {
    return '.';
  } // Windows can handle '/' or '\\' and both should be turned into separator


  var isWindows = separator === '\\';

  if (isWindows) {
    filepath = filepath.replace(/\//g, separator);
  }

  var hadLeading = filepath.startsWith(separator); // On Windows, need to handle UNC paths (\\host-name\\resource\\dir) special to retain leading double backslash

  var isUNC = hadLeading && isWindows && filepath.length > 2 && filepath.charAt(1) === '\\';
  var hadTrailing = filepath.endsWith(separator);
  var parts = filepath.split(separator);
  var result = [];

  for (var segment of parts) {
    if (segment.length !== 0 && segment !== '.') {
      if (segment === '..') {
        result.pop(); // FIXME: What if this goes above root? Should we throw an error?
      } else {
        result.push(segment);
      }
    }
  }

  var normalized = hadLeading ? separator : '';
  normalized += result.join(separator);

  if (hadTrailing) {
    normalized += separator;
  }

  if (isUNC) {
    normalized = '\\' + normalized;
  }

  return normalized;
}
/**
   * [assertSegment description]
   * @param  {*} segment [description]
   * @return {void}         [description]
   */


function assertSegment(segment) {
  if (typeof segment !== 'string') {
    throw new TypeError("Path must be a string. Received ".concat(segment));
  }
}
/**
   * The `path.join()` method joins all given path segments together using the
   * platform-specific separator as a delimiter, then normalizes the resulting path.
   * Zero-length path segments are ignored. If the joined path string is a zero-
   * length string then '.' will be returned, representing the current working directory.
   * @param  {string} separator platform-specific file separator
   * @param  {string[]} paths [description]
   * @return {string}       The joined filepath
   */


function join$1(separator, paths) {
  var result = []; // naive impl: just join all the paths with separator

  for (var segment of paths) {
    assertSegment(segment);

    if (segment.length !== 0) {
      result.push(segment);
    }
  }

  return normalize$1(separator, result.join(separator));
}
/**
   * The `path.resolve()` method resolves a sequence of paths or path segments into an absolute path.
   *
   * @param  {string} separator platform-specific file separator
   * @param  {string[]} paths [description]
   * @return {string}       [description]
   */


function resolve(separator, paths) {
  var resolved = '';
  var hitRoot = false;
  var isPosix = separator === '/'; // go from right to left until we hit absolute path/root

  for (var i = paths.length - 1; i >= 0; i--) {
    var segment = paths[i];
    assertSegment(segment);

    if (segment.length === 0) {
      continue; // skip empty
    }

    resolved = segment + separator + resolved; // prepend new segment

    if (isAbsolute(isPosix, segment)) {
      // have we backed into an absolute path?
      hitRoot = true;
      break;
    }
  } // if we didn't hit root, prepend cwd


  if (!hitRoot) {
    resolved = process.cwd() + separator + resolved;
  }

  var normalized = normalize$1(separator, resolved);

  if (normalized.charAt(normalized.length - 1) === separator) {
    // FIXME: Handle UNC paths on Windows as well, so we don't trim trailing separator on something like '\\\\host-name\\resource\\'
    // Don't remove trailing separator if this is root path on windows!
    if (!isPosix && normalized.length === 3 && normalized.charAt(1) === ':' && isWindowsDeviceName(normalized.charCodeAt(0))) {
      return normalized;
    } // otherwise trim trailing separator


    return normalized.slice(0, normalized.length - 1);
  }

  return normalized;
}
/**
   * The `path.relative()` method returns the relative path `from` from to `to` based
   * on the current working directory. If from and to each resolve to the same
   * path (after calling `path.resolve()` on each), a zero-length string is returned.
   *
   * If a zero-length string is passed as `from` or `to`, the current working directory
   * will be used instead of the zero-length strings.
   *
   * @param  {string} separator platform-specific file separator
   * @param  {string} from [description]
   * @param  {string} to   [description]
   * @return {string}      [description]
   */


function relative(separator, from, to) {
  assertArgumentType(from, 'from', 'string');
  assertArgumentType(to, 'to', 'string');

  if (from === to) {
    return '';
  }

  from = resolve(separator, [from]);
  to = resolve(separator, [to]);

  if (from === to) {
    return '';
  } // we now have two absolute paths,
  // lets "go up" from `from` until we reach common base dir of `to`
  // const originalFrom = from;


  var upCount = 0;
  var remainingPath = '';

  while (true) {
    if (to.startsWith(from)) {
      // match! record rest...?
      remainingPath = to.slice(from.length);
      break;
    } // FIXME: Break/throw if we hit bad edge case of no common root!


    from = dirname(separator, from);
    upCount++;
  } // remove leading separator from remainingPath if there is any


  if (remainingPath.length > 0) {
    remainingPath = remainingPath.slice(1);
  }

  return ('..' + separator).repeat(upCount) + remainingPath;
}
/**
   * The `path.parse()` method returns an object whose properties represent
   * significant elements of the path. Trailing directory separators are ignored,
   * see `path.sep`.
   *
   * The returned object will have the following properties:
   *
   * - dir <string>
   * - root <string>
   * - base <string>
   * - name <string>
   * - ext <string>
   * @param  {string} separator platform-specific file separator
   * @param  {string} filepath [description]
   * @return {object}
   */


function parse(separator, filepath) {
  assertArgumentType(filepath, 'path', 'string');
  var result = {
    root: '',
    dir: '',
    base: '',
    ext: '',
    name: '' };

  var length = filepath.length;

  if (length === 0) {
    return result;
  } // Cheat and just call our other methods for dirname/basename/extname?


  result.base = basename(separator, filepath);
  result.ext = extname(separator, result.base);
  var baseLength = result.base.length;
  result.name = result.base.slice(0, baseLength - result.ext.length);
  var toSubtract = baseLength === 0 ? 0 : baseLength + 1;
  result.dir = filepath.slice(0, filepath.length - toSubtract); // drop trailing separator!

  var firstCharCode = filepath.charCodeAt(0); // both win32 and POSIX return '/' root

  if (firstCharCode === FORWARD_SLASH) {
    result.root = '/';
    return result;
  } // we're done with POSIX...


  if (separator === '/') {
    return result;
  } // for win32...


  if (firstCharCode === BACKWARD_SLASH) {
    // FIXME: Handle UNC paths like '\\\\host-name\\resource\\file_path'
    // need to retain '\\\\host-name\\resource\\' as root in that case!
    result.root = '\\';
    return result;
  } // check for C: style root


  if (length > 1 && isWindowsDeviceName(firstCharCode) && filepath.charAt(1) === ':') {
    if (length > 2) {
      // is it like C:\\?
      var thirdCharCode = filepath.charCodeAt(2);

      if (thirdCharCode === FORWARD_SLASH || thirdCharCode === BACKWARD_SLASH) {
        result.root = filepath.slice(0, 3);
        return result;
      }
    } // nope, just C:, no trailing separator


    result.root = filepath.slice(0, 2);
  }

  return result;
}
/**
   * The `path.format()` method returns a path string from an object. This is the
   * opposite of `path.parse()`.
   *
   * @param  {string} separator platform-specific file separator
   * @param  {object} pathObject object of format returned by `path.parse()`
   * @param  {string} pathObject.dir directory name
   * @param  {string} pathObject.root file root dir, ignored if `pathObject.dir` is provided
   * @param  {string} pathObject.base file basename
   * @param  {string} pathObject.name basename minus extension, ignored if `pathObject.base` exists
   * @param  {string} pathObject.ext file extension, ignored if `pathObject.base` exists
   * @return {string}
   */


function format$1(separator, pathObject) {
  assertArgumentType(pathObject, 'pathObject', 'object');
  var base = pathObject.base || "".concat(pathObject.name || '').concat(pathObject.ext || ''); // append base to root if `dir` wasn't specified, or if
  // dir is the root

  if (!pathObject.dir || pathObject.dir === pathObject.root) {
    return "".concat(pathObject.root || '').concat(base);
  } // combine dir + / + base


  return "".concat(pathObject.dir).concat(separator).concat(base);
}
/**
   * On Windows systems only, returns an equivalent namespace-prefixed path for
   * the given path. If path is not a string, path will be returned without modifications.
   * See https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file#namespaces
   * @param  {string} filepath [description]
   * @return {string}          [description]
   */


function toNamespacedPath(filepath) {
  if (typeof filepath !== 'string') {
    return filepath;
  }

  if (filepath.length === 0) {
    return '';
  }

  var resolvedPath = resolve('\\', [filepath]);
  var length = resolvedPath.length;

  if (length < 2) {
    // need '\\\\' or 'C:' minimum
    return filepath;
  }

  var firstCharCode = resolvedPath.charCodeAt(0); // if start with '\\\\', prefix with UNC root, drop the slashes

  if (firstCharCode === BACKWARD_SLASH && resolvedPath.charAt(1) === '\\') {
    // return as-is if it's an aready long path ('\\\\?\\' or '\\\\.\\' prefix)
    if (length >= 3) {
      var thirdChar = resolvedPath.charAt(2);

      if (thirdChar === '?' || thirdChar === '.') {
        return filepath;
      }
    }

    return '\\\\?\\UNC\\' + resolvedPath.slice(2);
  } else if (isWindowsDeviceName(firstCharCode) && resolvedPath.charAt(1) === ':') {
    return '\\\\?\\' + resolvedPath;
  }

  return filepath;
}

var Win32Path = {
  sep: '\\',
  delimiter: ';',
  basename: function (filepath, ext) {
    return basename(this.sep, filepath, ext);
  },
  normalize: function (filepath) {
    return normalize$1(this.sep, filepath);
  },
  join: function (...paths) {
    return join$1(this.sep, paths);
  },
  extname: function (filepath) {
    return extname(this.sep, filepath);
  },
  dirname: function (filepath) {
    return dirname(this.sep, filepath);
  },
  isAbsolute: function (filepath) {
    return isAbsolute(false, filepath);
  },
  relative: function (from, to) {
    return relative(this.sep, from, to);
  },
  resolve: function (...paths) {
    return resolve(this.sep, paths);
  },
  parse: function (filepath) {
    return parse(this.sep, filepath);
  },
  format: function (pathObject) {
    return format$1(this.sep, pathObject);
  },
  toNamespacedPath: toNamespacedPath };

var PosixPath = {
  sep: '/',
  delimiter: ':',
  basename: function (filepath, ext) {
    return basename(this.sep, filepath, ext);
  },
  normalize: function (filepath) {
    return normalize$1(this.sep, filepath);
  },
  join: function (...paths) {
    return join$1(this.sep, paths);
  },
  extname: function (filepath) {
    return extname(this.sep, filepath);
  },
  dirname: function (filepath) {
    return dirname(this.sep, filepath);
  },
  isAbsolute: function (filepath) {
    return isAbsolute(true, filepath);
  },
  relative: function (from, to) {
    return relative(this.sep, from, to);
  },
  resolve: function (...paths) {
    return resolve(this.sep, paths);
  },
  parse: function (filepath) {
    return parse(this.sep, filepath);
  },
  format: function (pathObject) {
    return format$1(this.sep, pathObject);
  },
  toNamespacedPath: function (filepath) {
    return filepath; // no-op
  } };

var path$1 = PosixPath;
path$1.win32 = Win32Path;
path$1.posix = PosixPath;

var isAndroid = Ti.Platform.osname === 'android';
var isIOS = !isAndroid && true;
var PosixConstants = {
  UV_UDP_REUSEADDR: 4,
  dlopen: {},
  errno: {
    E2BIG: 7,
    EACCES: 13,
    EADDRINUSE: 48,
    EADDRNOTAVAIL: 49,
    EAFNOSUPPORT: 47,
    EAGAIN: 35,
    EALREADY: 37,
    EBADF: 9,
    EBADMSG: 94,
    EBUSY: 16,
    ECANCELED: 89,
    ECHILD: 10,
    ECONNABORTED: 53,
    ECONNREFUSED: 61,
    ECONNRESET: 54,
    EDEADLK: 11,
    EDESTADDRREQ: 39,
    EDOM: 33,
    EDQUOT: 69,
    EEXIST: 17,
    EFAULT: 14,
    EFBIG: 27,
    EHOSTUNREACH: 65,
    EIDRM: 90,
    EILSEQ: 92,
    EINPROGRESS: 36,
    EINTR: 4,
    EINVAL: 22,
    EIO: 5,
    EISCONN: 56,
    EISDIR: 21,
    ELOOP: 62,
    EMFILE: 24,
    EMLINK: 31,
    EMSGSIZE: 40,
    EMULTIHOP: 95,
    ENAMETOOLONG: 63,
    ENETDOWN: 50,
    ENETRESET: 52,
    ENETUNREACH: 51,
    ENFILE: 23,
    ENOBUFS: 55,
    ENODATA: 96,
    ENODEV: 19,
    ENOENT: 2,
    ENOEXEC: 8,
    ENOLCK: 77,
    ENOLINK: 97,
    ENOMEM: 12,
    ENOMSG: 91,
    ENOPROTOOPT: 42,
    ENOSPC: 28,
    ENOSR: 98,
    ENOSTR: 99,
    ENOSYS: 78,
    ENOTCONN: 57,
    ENOTDIR: 20,
    ENOTEMPTY: 66,
    ENOTSOCK: 38,
    ENOTSUP: 45,
    ENOTTY: 25,
    ENXIO: 6,
    EOPNOTSUPP: 102,
    EOVERFLOW: 84,
    EPERM: 1,
    EPIPE: 32,
    EPROTO: 100,
    EPROTONOSUPPORT: 43,
    EPROTOTYPE: 41,
    ERANGE: 34,
    EROFS: 30,
    ESPIPE: 29,
    ESRCH: 3,
    ESTALE: 70,
    ETIME: 101,
    ETIMEDOUT: 60,
    ETXTBSY: 26,
    EWOULDBLOCK: 35,
    EXDEV: 18 },

  signals: {
    SIGHUP: 1,
    SIGINT: 2,
    SIGQUIT: 3,
    SIGILL: 4,
    SIGTRAP: 5,
    SIGABRT: 6,
    SIGIOT: 6,
    SIGBUS: 10,
    SIGFPE: 8,
    SIGKILL: 9,
    SIGUSR1: 30,
    SIGSEGV: 11,
    SIGUSR2: 31,
    SIGPIPE: 13,
    SIGALRM: 14,
    SIGTERM: 15,
    SIGCHLD: 20,
    SIGCONT: 19,
    SIGSTOP: 17,
    SIGTSTP: 18,
    SIGTTIN: 21,
    SIGTTOU: 22,
    SIGURG: 16,
    SIGXCPU: 24,
    SIGXFSZ: 25,
    SIGVTALRM: 26,
    SIGPROF: 27,
    SIGWINCH: 28,
    SIGIO: 23,
    SIGINFO: 29,
    SIGSYS: 12 },

  priority: {
    PRIORITY_LOW: 19,
    PRIORITY_BELOW_NORMAL: 10,
    PRIORITY_NORMAL: 0,
    PRIORITY_ABOVE_NORMAL: -7,
    PRIORITY_HIGH: -14,
    PRIORITY_HIGHEST: -20 } };

// default implementations

var OS = {
  EOL: '\n',
  arch: () => process.arch,
  constants: PosixConstants,
  cpus: () => {
    var count = Ti.Platform.processorCount;
    var array = [];

    for (var i = 0; i < count; i++) {
      array.push({
        model: 'unknown',
        speed: 0,
        times: {
          user: 0,
          nice: 0,
          sys: 0,
          idle: 0,
          irq: 0 } });


    }

    return array;
  },
  endianness: () => {
    // TODO: Cache the value!
    var result = Ti.Codec.getNativeByteOrder();

    if (result === Ti.Codec.LITTLE_ENDIAN) {
      return 'LE';
    }

    return 'BE';
  },
  freemem: () => Ti.Platform.availableMemory,
  getPriority: () => 0,
  // fake it
  homedir: () => Ti.Filesystem.applicationDataDirectory,
  // fake it
  hostname: () => Ti.Platform.address,
  // fake it
  loadavg: () => [0, 0, 0],
  // fake it
  networkInterfaces: () => {},
  // FIXME: What do we do here? We might be able to piece some of this together using Ti.Platform.netmask, Ti.Platform.address
  platform: () => process.platform,
  release: () => Ti.Platform.version,
  setPriority: () => {},
  // no-op, fake it

  /**
   * The `os.tmpdir()` method returns a string specifying the operating system's default directory for temporary files.
   * @return {string} [description]
   */
  tmpdir: () => Ti.Filesystem.tempDirectory,

  /**
                                              * The `os.totalmem()` method returns the total amount of system memory in bytes as an integer.
                                              * @return {integer} [description]
                                              */
  totalmem: () => Ti.Platform.totalMemory,
  type: () => 'Unknown',
  // overridden per-platform at bottom

  /**
   * The `os.uptime()` method returns the system uptime in number of seconds.
   * @return {integer} [description]
   */
  uptime: () => Ti.Platform.uptime,
  userInfo: () => {
    // fake it!
    return {
      uid: -1,
      guid: -1,
      username: Ti.Platform.username,
      homedir: Ti.Filesystem.applicationDataDirectory,
      shell: null };

  } };
// On specific platforms, override implementations because we don't have them
// yet and need to fake it, or to hack them
// I'm also doing this in blocks to assign implementations that don't need to consult platform
// type at runtime (hopefully speeding up execution at runtime)

if (isIOS) {
  OS.type = () => 'Darwin'; // Now a giant hack for looking up CPU info for OS.cpus() on iOS
  // https://www.theiphonewiki.com/wiki/List_of_iPhones


  var AppleMap = {
    // iPhone 11 Pro Max
    'iPhone12,5': ['Apple A13 Bionic @ 2.66 GHz', 2660],
    // iPhone 11 Pro
    'iPhone12,3': ['Apple A13 Bionic @ 2.66 GHz', 2660],
    // iPhone 11
    'iPhone12,1': ['Apple A13 Bionic @ 2.66 GHz', 2660],
    // iPhone XR
    'iPhone11,8': ['Apple A12 Bionic @ 2.49 GHz', 2490],
    // iPhone XS Max
    'iPhone11,6': ['Apple A12 Bionic @ 2.49 GHz', 2490],
    'iPhone11,4': ['Apple A12 Bionic @ 2.49 GHz', 2490],
    // iPhone XS
    'iPhone11,2': ['Apple A12 Bionic @ 2.49 GHz', 2490],
    // iPhone X
    'iPhone10,6': ['Apple A11 Bionic @ 2.39 GHz', 2390],
    'iPhone10,3': ['Apple A11 Bionic @ 2.39 GHz', 2390],
    // iPhone 8 Plus
    'iPhone10,5': ['Apple A11 Bionic @ 2.39 GHz', 2390],
    'iPhone10,2': ['Apple A11 Bionic @ 2.39 GHz', 2390],
    // iPhone 8
    'iPhone10,4': ['Apple A11 Bionic @ 2.39 GHz', 2390],
    'iPhone10,1': ['Apple A11 Bionic @ 2.39 GHz', 2390],
    // iPhone 7 Plus
    'iPhone9,4': ['Apple A10 Fusion @ 2.34 GHz', 2340],
    'iPhone9,2': ['Apple A10 Fusion @ 2.34 GHz', 2340],
    // iPhone 7
    'iPhone9,3': ['Apple A10 Fusion @ 2.34 GHz', 2340],
    'iPhone9,1': ['Apple A10 Fusion @ 2.34 GHz', 2340],
    // iPhone SE
    'iPhone8,4': ['Apple A9 Twister @ 1.85 GHz', 1850],
    // iPhone 6s Plus
    'iPhone8,2': ['Apple A9 Twister @ 1.85 GHz', 1850],
    // iPhone 6s
    'iPhone8,1': ['Apple A9 Twister @ 1.85 GHz', 1850],
    // iPhone 6 Plus
    'iPhone7,1': ['Apple A8 Typhoon @ 1.38 GHz', 1380],
    // iPhone 6
    'iPhone7,2': ['Apple A8 Typhoon @ 1.38 GHz', 1380],
    // iPhone 5s
    'iPhone6,2': ['Apple A7 Cyclone @ 1.3 GHz', 1300],
    'iPhone6,1': ['Apple A7 Cyclone @ 1.3 GHz', 1300],
    // iPhone 5c
    'iPhone5,4': ['Apple A6 Swift @ 1.2 GHz', 1200],
    'iPhone5,3': ['Apple A6 Swift @ 1.2 GHz', 1200],
    // iPhone 5
    'iPhone5,1': ['Apple A6 Swift @ 1.2 GHz', 1200],
    'iPhone5,2': ['Apple A6 Swift @ 1.2 GHz', 1200],
    // iPhone 4s
    'iPhone4,1': ['Apple A5 @ 800 MHz', 800],
    // iPhone 4
    'iPhone3,3': ['Apple A4 @ 800 MHz', 800],
    'iPhone3,2': ['Apple A4 @ 800 MHz', 800],
    'iPhone3,1': ['Apple A4 @ 800 MHz', 800],
    // iPhone 3GS
    'iPhone2,1': ['Samsung S5L8920 @ 620 MHz', 620],
    // iPhone 3G
    'iPhone1,2': ['Samsung S5L8900 @ 412 MHz', 412],
    // iPhone
    'iPhone1,1': ['Samsung S5L8900 @ 412 MHz', 412],
    // ////// iPads
    // https://www.theiphonewiki.com/wiki/List_of_iPads
    // https://en.wikipedia.org/wiki/IPad
    // iPad Pro (12.9" 3rd gen)
    'iPad8,8': ['Apple A12X @ 2.49 GHz', 2490],
    'iPad8,7': ['Apple A12X @ 2.49 GHz', 2490],
    'iPad8,6': ['Apple A12X @ 2.49 GHz', 2490],
    'iPad8,5': ['Apple A12X @ 2.49 GHz', 2490],
    // iPad Pro (11")
    'iPad8,4': ['Apple A12X @ 2.49 GHz', 2490],
    'iPad8,3': ['Apple A12X @ 2.49 GHz', 2490],
    'iPad8,2': ['Apple A12X @ 2.49 GHz', 2490],
    'iPad8,1': ['Apple A12X @ 2.49 GHz', 2490],
    // iPad (6th gen)
    'iPad7,6': ['Apple A10 @ 2.31 GHz', 2310],
    // FIXME: Wikipedia says 2.34 GHz
    'iPad7,5': ['Apple A10 @ 2.31 GHz', 2310],
    // iPad Pro (10.5")
    'iPad7,4': ['Apple A10X @ 2.38 GHz', 2380],
    'iPad7,3': ['Apple A10X @ 2.38 GHz', 2380],
    // iPad Pro (12.9" 2nd gen)
    'iPad7,2': ['Apple A10X @ 2.38 GHz', 2380],
    'iPad7,1': ['Apple A10X @ 2.38 GHz', 2380],
    // iPad (5th gen)
    'iPad6,12': ['Apple A9 @ 1.85 GHz', 1850],
    'iPad6,11': ['Apple A9 @ 1.85 GHz', 1850],
    // iPad Pro (12.9" 1st gen)
    'iPad6,8': ['Apple A9X @ 2.24 GHz', 2240],
    'iPad6,7': ['Apple A9X @ 2.24 GHz', 2240],
    // iPad Pro (9.7")
    'iPad6,4': ['Apple A9X @ 2.16 GHz', 2160],
    'iPad6,3': ['Apple A9X @ 2.16 GHz', 2160],
    // iPad Air 2
    'iPad5,4': ['Apple A8X @ 1.5 GHz', 1500],
    'iPad5,3': ['Apple A8X @ 1.5 GHz', 1500],
    // iPad Mini 4
    'iPad5,2': ['Apple A8 @ 1.49 GHz', 1490],
    'iPad5,1': ['Apple A8 @ 1.49 GHz', 1490],
    // iPad Mini 3
    'iPad4,9': ['Apple A7 @ 1.3 GHz', 1300],
    'iPad4,8': ['Apple A7 @ 1.3 GHz', 1300],
    'iPad4,7': ['Apple A7 @ 1.3 GHz', 1300],
    // iPad Mini 2
    'iPad4,6': ['Apple A7 @ 1.3 GHz', 1300],
    'iPad4,5': ['Apple A7 @ 1.3 GHz', 1300],
    'iPad4,4': ['Apple A7 @ 1.3 GHz', 1300],
    // iPad Air 2
    'iPad4,3': ['Apple A7 Rev A @ 1.4 GHz', 1400],
    'iPad4,2': ['Apple A7 Rev A @ 1.4 GHz', 1400],
    'iPad4,1': ['Apple A7 Rev A @ 1.4 GHz', 1400],
    // iPad (4th gen)
    'iPad3,6': ['Apple A6X @ 1.4 GHz', 1400],
    'iPad3,5': ['Apple A6X @ 1.4 GHz', 1400],
    'iPad3,4': ['Apple A6X @ 1.4 GHz', 1400],
    // iPad (3rd gen)
    'iPad3,3': ['Apple A5X @ 1 GHz', 1000],
    'iPad3,2': ['Apple A5X @ 1 GHz', 1000],
    'iPad3,1': ['Apple A5X @ 1 GHz', 1000],
    // iPad Mini
    'iPad2,7': ['Apple A5 Rev A @ 1 GHz', 1000],
    'iPad2,6': ['Apple A5 Rev A @ 1 GHz', 1000],
    'iPad2,5': ['Apple A5 Rev A @ 1 GHz', 1000],
    // iPad 2
    'iPad2,4': ['Apple A5 @ 1 GHz', 1000],
    'iPad2,3': ['Apple A5 @ 1 GHz', 1000],
    'iPad2,2': ['Apple A5 @ 1 GHz', 1000],
    'iPad2,1': ['Apple A5 @ 1 GHz', 1000],
    // iPad
    'iPad1,1': ['Apple A4 @ 1 GHz', 1000] };

  /**
                                              * [cpuModel description]
                                              * @param  {string} model [description]
                                              * @return {array}       [description]
                                              */

  var cpuModelAndSpeed = model => {
    var trimmed = model.replace(' (Simulator)', '').trim();
    return AppleMap[trimmed] || ['Unknown', 0];
  }; // override cpus impl


  OS.cpus = () => {
    // TODO: Cache the result!
    var count = Ti.Platform.processorCount;
    var modelAndSpeed = cpuModelAndSpeed(Ti.Platform.model);
    var array = [];

    for (var i = 0; i < count; i++) {
      array.push({
        model: modelAndSpeed[0],
        speed: modelAndSpeed[1],
        times: {} });

    }

    return array;
  };
} else if (isAndroid) {
  OS.cpus = () => Ti.Platform.cpus();

  OS.type = () => 'Linux';
}

var tty = {
  isatty: () => false,
  ReadStream: () => {
    throw new Error('tty.ReadStream is not implemented');
  },
  WriteStream: () => {
    throw new Error('tty.WriteStream is not implemented');
  } };


var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var util = {
  format,
  formatWithOptions,
  inspect,
  isArray: Array.isArray,
  isBoolean: value => typeof value === 'boolean',
  isBuffer: BufferModule.Buffer.isBuffer,
  isFunction: value => typeof value === 'function',
  isNull: value => value === null,
  isNullOrUndefined: value => value === undefined || value === null,
  isNumber: value => typeof value === 'number',
  isObject: value => value !== null && typeof value === 'object',
  isPrimitive: value => typeof value !== 'object' && typeof value !== 'function' || value === null,
  isString: value => typeof value === 'string',
  isSymbol: value => typeof value === 'symbol',
  isUndefined: value => value === undefined,
  isRegExp: isRegExp,
  isDate: isDate,
  isError: e => Object.prototype.toString.call(e) === '[object Error]' || e instanceof Error,
  log: string => {
    var date = new Date();
    var time = "".concat(date.getHours().toString().padStart(2, '0'), ":").concat(date.getMinutes().toString().padStart(2, '0'), ":").concat(date.getSeconds().toString().padStart(2, '0')); // Produces output like: "21 Feb 10:04:23 - message"

    console.log("".concat(date.getDate(), " ").concat(MONTHS[date.getMonth()], " ").concat(time, " - ").concat(string));
  },
  print: (...args) => console.log(args.join('')),
  // FIXME: Shouldn't add trailing newline like console.log does!
  puts: (...args) => console.log(args.join('\n')),
  error: (...args) => console.error(args.join('\n')),
  debug: string => console.error("DEBUG: ".concat(string)),
  types };

/**
            * @param {Function} constructor subclass
            * @param {Function} superConstructor base class
            * @returns {void}
            */

util.inherits = function (constructor, superConstructor) {
  assertArgumentType(constructor, 'constructor', 'Function');
  assertArgumentType(superConstructor, 'superConstructor', 'Function');
  assertArgumentType(superConstructor.prototype, 'superConstructor.prototype', 'Object');
  Object.defineProperty(constructor, 'super_', {
    value: superConstructor });

  Object.setPrototypeOf(constructor.prototype, superConstructor.prototype);
};
/**
    * @param {Function} original original function to wrap which is expected to have a final callback argument
    * @returns {Function} function that returns a Promise
    */


util.promisify = function (original) {
  assertArgumentType(original, 'original', 'Function');

  function wrapped(...args) {
    return new Promise((resolve, reject) => {
      original.call(this, ...args, (err, result) => {
        if (err) {
          return reject(err);
        }

        return resolve(result);
      });
    });
  } // TODO: Copy properties from original to wrapped
  // TODO: hook prototype chain up from wrapped to original
  // TODO: Support custom promisify hooks


  return wrapped;
};
/**
    * @param {Function} original original function to convert from async/Promise return value to a callback style
    * @returns {Function} wrapped function
    */


util.callbackify = function (original) {
  assertArgumentType(original, 'original', 'Function');

  function wrapped(...args) {
    var callback = args.pop();
    var promise = original.apply(this, args);
    promise.then(result => {
      // eslint-disable-line promise/always-return
      callback(null, result); // eslint-disable-line promise/no-callback-in-promise
    }).catch(err => {
      if (!err) {
        var wrappedError = new Error('Promise was rejected with falsy value');
        wrappedError.reason = err;
        err = wrappedError;
      }

      callback(err); // eslint-disable-line promise/no-callback-in-promise
    });
  }

  return wrapped;
};
/**
    * @param {Function} func function to deprecate/wrap
    * @param {string} string message to give when deprecation warning is emitted
    * @param {string} code deprecation code to use to group warnings
    * @returns {Function} wrapped function
    */


util.deprecate = function (func, string, code) {
  // eslint-disable-line no-unused-vars
  if (process.noDeprecation) {
    return func; // skip the wrapping!
  } // TODO: Support `code` argument by tracking a map of codes we've warned about


  function wrapped(...args) {
    var warned = false;

    if (!warned) {
      process.emitWarning(string, 'DeprecationWarning');
      warned = true;
    }

    return func.apply(this, args);
  }

  return wrapped;
}; // TODO: Support debuglog? What is our equivalent of process.env('NODE_DEBUG')?


var noop = () => {};

util.debuglog = () => {
  return noop;
};

var DEFAULT_MESSAGES = {
  deepStrictEqual: 'Expected values to be strictly deep-equal:',
  strictEqual: 'Expected values to be strictly equal:',
  deepEqual: 'Expected values to be loosely deep-equal:',
  equal: 'Expected values to be loosely equal:',
  notDeepStrictEqual: 'Expected "actual" not to be strictly deep-equal to:',
  notStrictEqual: 'Expected "actual" to be strictly unequal to:',
  notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:',
  notEqual: 'Expected "actual" to be loosely unequal to:' };
// Fake enums to use internally

var COMPARE_TYPE = {
  Object: 0,
  Map: 1,
  Set: 2 };

var STRICTNESS = {
  Strict: 0,
  Loose: 1 };


class AssertionError extends Error {
  constructor(options) {
    var {
      actual,
      expected,
      message,
      operator } =
    options;

    if (!message) {
      // FIXME: Generate the rest of the message with diff of actual/expected!
      message = "".concat(DEFAULT_MESSAGES[operator], "\n\n");
    }

    super(message);
    this.actual = actual;
    this.expected = expected;
    this.operator = operator;
    this.generatedMessage = !message;
    this.name = 'AssertionError [ERR_ASSERTION]';
    this.code = 'ERR_ASSERTION';
  }}

// TODO: Can we define AssertStrict and AssertLoose as subclasses of a base Assert class
// that class holds impls for shared methods, subclasses override specific
// comparisons used (Object.is vs ===)?


var assert$1 = (value, message) => assert$1.ok(value, message);

assert$1.AssertionError = AssertionError;

assert$1.ok = (...args) => {
  var value = args[0];

  if (value) {
    return;
  }

  var message = args[1];
  var generatedMessage = false; // Check if value (1st arg) was not supplied!
  // Have to use ugly hack on args definition to do so

  if (args.length === 0) {
    message = 'No value argument passed to `assert.ok()`';
    generatedMessage = true;
  } else if (message == null) {
    // eslint-disable-line no-eq-null,eqeqeq
    // TODO: generate rest of the message. Node actually reads the input file! The hacked browserify does not do this
    // It treates ok failing like `value == true` failing
    message = 'The expression evaluated to a falsy value:\n\n';
    generatedMessage = true;
  } else if (message instanceof Error) {
    throw message;
  }

  var err = new AssertionError({
    actual: value,
    expected: true,
    message,
    operator: '==' });

  err.generatedMessage = generatedMessage;
  throw err;
};

function throwError(obj) {
  // If message is an Error object, throw that instead!
  if (obj.message instanceof Error) {
    throw obj.message;
  }

  throw new AssertionError(obj);
}

assert$1.equal = (actual, expected, message) => {
  if (actual == expected) {
    // eslint-disable-line eqeqeq
    return;
  }

  throwError({
    actual,
    expected,
    message,
    operator: 'equal' });

};

assert$1.strictEqual = (actual, expected, message) => {
  if (Object.is(actual, expected)) {
    // provides SameValue comparison for us
    return;
  }

  throwError({
    actual,
    expected,
    message,
    operator: 'strictEqual' });

};

assert$1.notEqual = (actual, expected, message) => {
  if (actual != expected) {
    // eslint-disable-line eqeqeq
    return;
  }

  throwError({
    actual,
    expected,
    message,
    operator: 'notEqual' });

};

assert$1.notStrictEqual = (actual, expected, message) => {
  if (!Object.is(actual, expected)) {
    // provides SameValue comparison for us
    return;
  }

  throwError({
    actual,
    expected,
    message,
    operator: 'notStrictEqual' });

};

var isPrimitive = value => {
  return typeof value !== 'object' && typeof value !== 'function' || value === null;
};
/**
    * @param {Map} actual map we are comparing
    * @param {Map} expected map we're comparing against
    * @param {STRICTNESS.Loose|strictness.Strict} strictness how to compare
    * @param {object} references memoized references to objects in the deepEqual hierarchy
    * @returns {boolean}
    */


function compareMaps(actual, expected, strictness, references) {
  var looseChecks = new Set(); // keep track of objects we need to test more extensively than using #get()/#has()

  for (var [key, value] of actual) {
    if (typeof key === 'object' && key !== null) {
      // non-null object. We need to do our own checking, not use get()/has()
      looseChecks.add(key);
    } else {
      // handle "primitives"
      if (expected.has(key) && deepEqual(value, expected.get(key), strictness, references)) {
        // yay! a nice easy match - both key and value matched exactly - move on
        continue;
      }

      if (strictness === STRICTNESS.Strict) {
        // if we didn't match key/value perfectly in strict mode, fail right away
        return false;
      } // ok, so it didn't match key/value perfectly - but we're in loose mode, so fall back to try again


      looseChecks.add(key);
    }
  }

  if (looseChecks.size === 0) {
    // no loose ends to tie up, everything matched
    return true;
  } // only go through the second Map once!


  for (var [expectedKey, expectedValue] of expected) {
    // if it's not a non-null object in strict mode, fail!
    // (i.e. if it's a primitive that failed a match, don't fall back to more loosely match it)
    // Note that this shouldn't ever happen since we should be returning false immediately above
    if (strictness === STRICTNESS.Strict && !(typeof expectedKey === 'object' && expectedKey !== null)) {
      return false;
    } // otherwise, test it // TODO: Wish we could use #find() like on an Array, but Set doesn't have it!


    var found = false;

    for (var _key of looseChecks) {
      // if both key and value matches
      if (deepEqual(_key, expectedKey, strictness, references) && deepEqual(actual.get(_key), expectedValue, strictness, references)) {
        found = true;
        looseChecks.delete(_key); // remove from our looseChecks Set since we already matched it

        break;
      }
    } // if not found, we failed to match


    if (!found) {
      return false;
    }
  } // did we leave un-matched keys? if so, fail


  return looseChecks.size === 0;
}
/**
   * @param {Set} actual map we are comparing
   * @param {Set} expected map we're comparing against
   * @param {strictness.Loose|strictness.Strict} strictness how to compare
   * @param {object} references memoized references to objects in the deepEqual hierarchy
   * @returns {boolean}
   */


function compareSets(actual, expected, strictness, references) {
  var looseChecks = new Set(); // keep track of values we need to test more extensively than using #has()

  for (var value of actual) {
    if (typeof value === 'object' && value !== null) {
      // non-null object. We need to do our own checking, not use has()
      looseChecks.add(value);
    } else if (!expected.has(value)) {
      // FIXME: has does "same-value-zero" check, which is like Object.is except for -0/+0 being considered equal
      // so may need to special case that here, that'd have to be in an else below (since has will return true here)
      if (strictness === STRICTNESS.Strict) {
        // failed "same-value" match for primitive in strict mode, so fail right away
        return false;
      } // When doing loose check, we need to fall back to looser check than #has(), so we can't just return false immediately here
      // add to set of values to check more thoroughly


      looseChecks.add(value);
    }
  }

  if (looseChecks.size === 0) {
    // no loose ends to tie up, everything matched
    return true;
  } // Try to whittle down the loose checks set to be empty...
  // only go through the second Set once!


  for (var expectedValue of expected) {
    // if it's not a non-null object in strict mode, fail!
    // (i.e. if it's a primitive that failed a match, don't fall back to more loosely match it)
    // Note that this shouldn't ever happen since we should be returning false immediately above
    if (strictness === STRICTNESS.Strict && !(typeof expectedValue === 'object' && expectedValue !== null)) {
      return false;
    }

    var found = false;

    for (var object of looseChecks) {
      if (deepEqual(object, expectedValue, strictness, references)) {
        found = true; // found a match!

        looseChecks.delete(object); // remove from our looseChecks Set since we matched it

        break;
      }
    } // if not found, we failed to match


    if (!found) {
      return false;
    }
  } // did we leave un-matched values? if so, fail


  return looseChecks.size === 0;
}
/**
   * @param {*} actual value we are comparing
   * @param {*} expected values we're comparing against
   * @param {STRICTNESS.Strict|STRICTNESS.Loose} strictness how strict a comparison to do
   * @param {object} [references] optional object to keep track of circular references in the hierarchy
   * @param {Map<object,number>} [references.actual] mapping from objects visited (on `actual`) to their depth
   * @param {Map<object,number>} [references.expected] mapping from objects visited (on `expected`) to their depth
   * @param {number} [references.depth] The current depth of the hierarchy
   * @returns {boolean}
   */


function deepEqual(actual, expected, strictness, references) {
  // if primitives, compare using Object.is
  // This handles: null, undefined, number, string, boolean
  if (isPrimitive(actual) && isPrimitive(expected)) {
    if (strictness === STRICTNESS.Strict) {
      return Object.is(actual, expected);
    } else {
      return actual == expected; // eslint-disable-line eqeqeq
    }
  } // Now we have various objects/functions:
  // Date, Error, RegExp, Array, Map, Set, Object, Function, Arrow functions, WeakMap, DataView, ArrayBuffer, WeakSet, typed arrays
  // notably, this includes "boxed" primitives created by new Boolean(false), new String('value'), Symbol('whatever'), etc
  // Type tags of objects should be the same


  var actualTag = Object.prototype.toString.call(actual);
  var expectedTag = Object.prototype.toString.call(expected);

  if (actualTag !== expectedTag) {
    return false;
  } // [[Prototype]] of objects are compared using the Strict Equality Comparison.


  if (strictness === STRICTNESS.Strict) {
    // don't check prototype when doing "loose"
    var actualPrototype = Object.getPrototypeOf(actual);
    var expectedPrototype = Object.getPrototypeOf(expected);

    if (actualPrototype !== expectedPrototype) {
      return false;
    }
  }

  var comparison = COMPARE_TYPE.Object;

  if (util.types.isRegExp(actual)) {
    // RegExp source and flags should match
    if (!util.types.isRegExp(expected) || actual.flags !== expected.flags || actual.source !== expected.source) {
      return false;
    } // continue on to check properties...

  } else if (util.types.isDate(actual)) {
    // Date's underlying time should match
    if (!util.types.isDate(expected) || actual.getTime() !== expected.getTime()) {
      return false;
    } // continue on to check properties...

  } else if (actual instanceof Error) {
    // Error's name and message must match
    if (!(expected instanceof Error) || actual.name !== expected.name || actual.message !== expected.message) {
      return false;
    } // continue on to check properties...

  } else if (Array.isArray(actual)) {
    // if array lengths differ, quick fail
    if (!Array.isArray(expected) || actual.length !== expected.length) {
      return false;
    } // continue on to check properties...

  } else if (util.types.isBoxedPrimitive(actual)) {
    if (!util.types.isBoxedPrimitive(expected)) {
      return false;
    } // check that they're the same type of wrapped primitive and then call the relevant valueOf() for that type to compare them!


    if (util.types.isNumberObject(actual) && (!util.types.isNumberObject(expected) || !Object.is(Number.prototype.valueOf.call(actual), Number.prototype.valueOf.call(expected)))) {
      return false;
    } else if (util.types.isStringObject(actual) && (!util.types.isStringObject(expected) || String.prototype.valueOf.call(actual) !== String.prototype.valueOf.call(expected))) {
      return false;
    } else if (util.types.isBooleanObject(actual) && (!util.types.isBooleanObject(expected) || Boolean.prototype.valueOf.call(actual) !== Boolean.prototype.valueOf.call(expected))) {
      return false; // FIXME: Uncomment when we support BigInt cross-platform!
      // } else if (util.types.isBigIntObject(actual)
      // 	&& (!util.types.isBigIntObject(expected)
      // 		|| BigInt.prototype.valueOf.call(actual) !== BigInt.prototype.valueOf.call(expected))) {
      // 	return false;
    } else if (util.types.isSymbolObject(actual) && (!util.types.isSymbolObject(expected) || Symbol.prototype.valueOf.call(actual) !== Symbol.prototype.valueOf.call(expected))) {
      return false;
    } // continue on to check properties...

  } else if (util.types.isSet(actual)) {
    if (!util.types.isSet(expected) || actual.size !== expected.size) {
      return false;
    }

    comparison = COMPARE_TYPE.Set; // continue on to check properties...
  } else if (util.types.isMap(actual)) {
    if (!util.types.isMap(expected) || actual.size !== expected.size) {
      return false;
    }

    comparison = COMPARE_TYPE.Map; // continue on to check properties...
  } // Now iterate over properties and compare them!


  var actualKeys = Object.keys(actual); // for an array, this will return the indices that have values

  var expectedKeys = Object.keys(expected); // and it just magically works
  // Must have same number of properties

  if (actualKeys.length !== expectedKeys.length) {
    return false;
  } // Are they the same keys? If one is missing, then no, fail right away


  if (!actualKeys.every(key => Object.prototype.hasOwnProperty.call(expected, key))) {
    return false;
  } // Don't check own symbols when doing "loose"


  if (strictness === STRICTNESS.Strict) {
    var actualSymbols = Object.getOwnPropertySymbols(actual);
    var expectedSymbols = Object.getOwnPropertySymbols(expected); // Must have same number of symbols

    if (actualSymbols.length !== expectedSymbols.length) {
      return false;
    }

    if (actualSymbols.length > 0) {
      // Have to filter them down to enumerable symbols!
      for (var key of actualSymbols) {
        var actualIsEnumerable = Object.prototype.propertyIsEnumerable.call(actual, key);
        var expectedIsEnumerable = Object.prototype.propertyIsEnumerable.call(expected, key);

        if (actualIsEnumerable !== expectedIsEnumerable) {
          return false; // they differ on whetehr symbol is enumerable, fail!
        } else if (actualIsEnumerable) {
          // it's enumerable, add to keys to check
          actualKeys.push(key);
          expectedKeys.push(key);
        }
      }
    }
  } // Avoid circular references!
  // Record map from objects to depth in the hierarchy


  if (references === undefined) {
    references = {
      actual: new Map(),
      expected: new Map(),
      depth: 0 };

  } else {
    // see if we've already recorded these objects.
    // if so, make sure they refer to same depth in object hierarchy
    var memoizedActual = references.actual.get(actual);

    if (memoizedActual !== undefined) {
      var memoizedExpected = references.expected.get(expected);

      if (memoizedExpected !== undefined) {
        return memoizedActual === memoizedExpected;
      }
    }

    references.depth++;
  } // store the object -> depth mapping


  references.actual.set(actual, references.depth);
  references.expected.set(expected, references.depth); // When comparing Maps/Sets, compare elements before custom properties

  var result = true;

  if (comparison === COMPARE_TYPE.Set) {
    result = compareSets(actual, expected, strictness, references);
  } else if (comparison === COMPARE_TYPE.Map) {
    result = compareMaps(actual, expected, strictness, references);
  }

  if (result) {
    // Now loop over keys and compare them to each other!
    for (var _key2 of actualKeys) {
      if (!deepEqual(actual[_key2], expected[_key2], strictness, references)) {
        result = false;
        break;
      }
    }
  } // wipe the object to depth mapping for these objects now


  references.actual.delete(actual);
  references.expected.delete(expected);
  return result;
}

assert$1.deepStrictEqual = (actual, expected, message) => {
  if (!deepEqual(actual, expected, STRICTNESS.Strict)) {
    throwError({
      actual,
      expected,
      message,
      operator: 'deepStrictEqual' });

  }
};

assert$1.notDeepStrictEqual = (actual, expected, message) => {
  if (deepEqual(actual, expected, STRICTNESS.Strict)) {
    throwError({
      actual,
      expected,
      message,
      operator: 'notDeepStrictEqual' });

  }
};

assert$1.deepEqual = (actual, expected, message) => {
  if (!deepEqual(actual, expected, STRICTNESS.Loose)) {
    throwError({
      actual,
      expected,
      message,
      operator: 'deepEqual' });

  }
};

assert$1.notDeepEqual = (actual, expected, message) => {
  if (deepEqual(actual, expected, STRICTNESS.Loose)) {
    throwError({
      actual,
      expected,
      message,
      operator: 'notDeepEqual' });

  }
};

assert$1.fail = (message = 'Failed') => throwError({
  message });


var NO_EXCEPTION = {};

function execute(fn) {
  assertArgumentType(fn, 'fn', 'Function');

  try {
    fn();
  } catch (e) {
    return e;
  }

  return NO_EXCEPTION;
}

function isPromiseLike(fn) {
  return util.types.isPromise(fn) || fn && typeof fn === 'object' && typeof fn.then === 'function';
}

function executePromise(_x) {
  return _executePromise.apply(this, arguments);
}

function _executePromise() {
  _executePromise = _asyncToGenerator(function* (fn) {
    var promise;
    var fnType = typeof fn;

    if (fnType === 'function') {
      promise = fn();

      if (!isPromiseLike(promise)) {
        throw new TypeError("Expected instanceof Promise to be returned from the \"fn\" function but got ".concat(typeof promise));
      }
    } else {
      if (!isPromiseLike(fn)) {
        throw new TypeError("The \"fn\" argument must be of type Function or Promise. Received type ".concat(fnType));
      }

      promise = fn;
    }

    try {
      yield promise;
    } catch (e) {
      return e;
    }

    return NO_EXCEPTION;
  });
  return _executePromise.apply(this, arguments);
}

assert$1.throws = (fn, error, message) => {
  var actual = execute(fn);

  if (actual === NO_EXCEPTION) {
    // FIXME: append message if not null
    throwError({
      actual: undefined,
      expected: error,
      message: 'Missing expected exception.',
      operator: 'throws' });

    return;
  } // They didn't specify how to validate, so just roll with it


  if (!error) {
    return;
  }

  if (!checkError(actual, error, message)) {
    throw actual; // throw the Error it did generate
  }
};

assert$1.rejects =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (asyncFn, error, message) {
    var actual = yield executePromise(asyncFn);

    if (actual === NO_EXCEPTION) {
      // FIXME: append message if not null
      throwError({
        actual: undefined,
        expected: error,
        message: 'Missing expected exception.',
        operator: 'rejects' });

      return;
    } // They didn't specify how to validate, so just roll with it


    if (!error) {
      return;
    }

    if (!checkError(actual, error, message)) {
      throw actual; // throw the Error it did generate
    }
  });

  return function (_x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

assert$1.doesNotThrow = (fn, error, message) => {
  var actual = execute(fn); // no Error, just return

  if (actual === NO_EXCEPTION) {
    return;
  } // They didn't specify how to validate, so just re-throw


  if (!error) {
    throw actual;
  } // If error matches expected, throw an AssertionError


  if (checkError(actual, error)) {
    throwError({
      actual,
      expected: error,
      operator: 'doesNotThrow',
      message: "Got unwanted exception".concat(message ? ': ' + message : '.') });

    return;
  } // doesn't match, re-throw


  throw actual;
};

assert$1.doesNotReject =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (fn, error, message) {
    var actual = yield executePromise(fn); // no Error, just return

    if (actual === NO_EXCEPTION) {
      return;
    } // They didn't specify how to validate, so just re-throw


    if (!error) {
      throw actual;
    } // If error matches expected, throw an AssertionError


    if (checkError(actual, error)) {
      throwError({
        actual,
        expected: error,
        operator: 'doesNotThrow',
        message: "Got unwanted exception".concat(message ? ': ' + message : '.') });

      return;
    } // doesn't match, re-throw


    throw actual;
  });

  return function (_x5, _x6, _x7) {
    return _ref2.apply(this, arguments);
  };
}();
/**
      * @param {Error} actual the actual Error generated by the wrapped function/block
      * @param {object|RegExp|Function|Error|Class} expected The value to test against the Error
      * @param {string} [message] custom message to append
      * @returns {boolean} true if the Error matches the expected value/object
      */


function checkError(actual, expected, message) {
  // What we do here depends on what `expected` is:
  // function - call it to validate
  // object - test properties against actual
  // Regexp - test against actual.toString()
  // Error type - check type matches
  // Error instance - compare properties
  if (typeof expected === 'object') {
    if (util.types.isRegExp(expected)) {
      return expected.test(actual); // does the error match the RegExp expression? if so, pass
    } // Test properties (`expected` is either a generic Object or an Error instance)


    var keys = Object.keys(expected); // If we're testing against an instance of an Error, we need to hack in name/message properties.

    if (expected instanceof Error) {
      keys.unshift('name', 'message'); // we want to compare name and message, but they're not set as enumerable on Error
    }

    for (var key of keys) {
      if (!deepEqual(actual[key], expected[key], STRICTNESS.Strict)) {
        if (!message) {
          // generate a meaningful message! Cheat by treating like equality check of values
          // then steal the message it generated
          try {
            throwError({
              actual: actual[key],
              expected: expected[key],
              operator: 'deepStrictEqual' });

          } catch (err) {
            message = err.message;
          }
        }

        throwError({
          actual,
          expected,
          message,
          operator: 'throws' });

        return false;
      }
    }

    return true; // They all matched, pass!
  } else if (typeof expected === 'function') {
    // if `expected` is a "type" and actual is an instance of that type, then pass
    if (expected.prototype != null && actual instanceof expected) {
      // eslint-disable-line no-eq-null,eqeqeq
      return true;
    } // If `expected` is a subclass of Error but `actual` wasn't an instance of it (above), fail


    if (Object.prototype.isPrototypeOf.call(Error, expected)) {
      return false;
    } // ok, let's assume what's left is that `expected` was a validation function,
    // so call it with empty `this` and single argument of the actual error we received


    return expected.call({}, actual);
  }

  return false;
}

assert$1.ifError = value => {
  if (value === null || value === undefined) {
    return;
  }

  throwError({
    actual: value,
    expected: null,
    message: "ifError got unwanted exception: ".concat(value),
    operator: 'ifError' });

}; // Create "strict" copy which overrides "loose" methods to call strict equivalents


assert$1.strict = (value, message) => assert$1.ok(value, message); // "Copy" methods from assert to assert.strict!


Object.assign(assert$1.strict, assert$1); // Override the "loose" methods to point to the strict ones

assert$1.strict.deepEqual = assert$1.deepStrictEqual;
assert$1.strict.notDeepEqual = assert$1.notDeepStrictEqual;
assert$1.strict.equal = assert$1.strictEqual;
assert$1.strict.notEqual = assert$1.notStrictEqual; // hang strict off itself

assert$1.strict.strict = assert$1.strict;

/**
                                           * @param {string} [encoding='utf8'] The character encoding the `StringDecoder` will use.
                                           */
function StringDecoder(encoding = 'utf8') {
  this.encoding = encoding.toLowerCase();

  switch (this.encoding) {
    case 'utf8':
    case 'utf-8':
      this._impl = new Utf8StringDecoder();
      break;

    case 'ucs2':
    case 'ucs-2':
    case 'utf16-le':
    case 'utf16le':
      this._impl = new Utf16StringDecoder();
      break;

    case 'base64':
      this._impl = new Base64StringDecoder();
      break;

    default:
      this._impl = new StringDecoderImpl(this.encoding);
      break;}

}
/**
   * Returns any remaining input stored in the internal buffer as a string.
   * Bytes representing incomplete UTF-8 and UTF-16 characters will be replaced with substitution
   * characters appropriate for the character encoding.
   *
   * If the buffer argument is provided, one final call to stringDecoder.write() is performed before returning the remaining input.
   * @param {Buffer} [buffer] containing the bytes to decode.
   * @returns {string}
   */


StringDecoder.prototype.end = function end(buffer) {
  return this._impl.end(buffer);
};
/**
    * Returns a decoded string, ensuring that any incomplete multibyte characters at the end of the Buffer, or
    * TypedArray, or DataView are omitted from the returned string and stored in an internal buffer for the
    * next call to stringDecoder.write() or stringDecoder.end().
    * @param {Buffer|TypedArray|DataView} buffer containing the bytes to decode.
    * @returns {string}
    */


StringDecoder.prototype.write = function write(buffer) {
  if (typeof buffer === 'string') {
    return buffer;
  } // empty string for empty buffer


  if (buffer.length === 0) {
    return '';
  }

  return this._impl.write(buffer);
};
/**
    * This is the base class. We override parts of it for certain encodings. For ascii/hex/binary/latin1 the impl is super-easy
    */


class StringDecoderImpl {
  constructor(encoding = 'utf8') {
    this.encoding = encoding;
    this.byteCount = 0;
    this.charLength = 1;
  } // the actual underlying implementation!


  end(buffer) {
    if (buffer && buffer.length !== 0) {
      return this.write(buffer);
    }

    return '';
  }

  write(buffer) {
    if (buffer && buffer.length !== 0) {
      return buffer.toString(this.encoding); // single byte character encodings are a cinch
    }

    return ''; // no buffer, or empty
  }}

// For multi-byte encodings, let's implement some base logic...


class MultiByteStringDecoderImpl extends StringDecoderImpl {
  constructor(encoding, bytesPerChar) {
    super(encoding);
    this.incomplete = Buffer.allocUnsafe(bytesPerChar); // temporary incomplete character buffer
  }
  /**
     * @typedef {Object} IncompleteCharObject
     * @property {integer} bytesNeeded bytes missing to complete the character
     * @property {integer} charLength bytes expected to complete the character
     * @property {integer} index location in the buffer where the character starts
     */

  /**
         * Given a Buffer, sees if we have an incomplete "character" at the end of it.
         * Returns info on that:
         * - bytesNeeded: 0-3, number of bytes still remaining
         * - charLength: expected number of bytes for the incomplete character
         * - index: index in the buffer where the incomplete character begins
         * @param {Buffer} _buffer Buffer we are checking to see if it has an incompelte "character" at the end
         * @returns {IncompleteCharObject}
         */


  _checkIncompleteBytes(_buffer) {
    throw new Error('subclasses must override!');
  }

  _incompleteEnd() {
    throw new Error('subclasses must override!');
  }

  _incompleteBufferEmptied() {
    // typically we reset byte count back to 0 and character length to 1
    this.byteCount = 0;
    this.charLength = 1;
  }

  end(buffer) {
    var result = super.end(buffer);

    if (this.byteCount !== 0) {
      // we have incomplete characters!
      result += this._incompleteEnd();
    }

    this._incompleteBufferEmptied(); // reset our internals to "wipe" the incomplete buffer


    return result;
  }

  write(buffer) {
    // first let's see if we had some multi-byte character we didn't finish...
    var char = '';

    if (this.byteCount !== 0) {
      // we still needed some bytes to finish the character
      // How many bytes do we still need? charLength - bytes we received
      var left = this.charLength - this.byteCount; // need 4, have 1? then we have 3 "left"

      var bytesCopied = Math.min(left, buffer.length); // copy up to that many bytes
      // copy bytes from `buffer` to our incomplete buffer

      buffer.copy(this.incomplete, this.byteCount, 0, bytesCopied);
      this.byteCount += bytesCopied; // record how many more bytes we copied...

      if (bytesCopied < left) {
        // still need more bytes to complete!
        return '';
      } // we were able to complete, yay!
      // grab the character we completed


      char = this.incomplete.slice(0, this.charLength).toString(this.encoding); // reset our counters

      this._incompleteBufferEmptied(); // do we have any bytes left in this buffer?


      if (bytesCopied === buffer.length) {
        return char; // if not, return the character we finished!
      } // we still have more bytes, so slice the buffer up


      buffer = buffer.slice(bytesCopied, buffer.length);
    } // check this buffer to see if it indicates we need more bytes?


    var incompleteCharData = this._checkIncompleteBytes(buffer);

    if (incompleteCharData.bytesNeeded === 0) {
      return char + buffer.toString(this.encoding); // no incomplete bytes, return any character we completed plus the buffer
    } // ok so the buffer holds an incomplete character at it's end


    this.charLength = incompleteCharData.charLength; // record how many bytes we need for the 'character'

    var incompleteCharIndex = incompleteCharData.index; // this is the index of the multibyte character that is incomplete
    // copy from index of incomplete character to end of buffer

    var bytesToCopy = buffer.length - incompleteCharIndex;
    buffer.copy(this.incomplete, 0, incompleteCharIndex, buffer.length);
    this.byteCount = bytesToCopy; // record how many bytes we actually copied

    if (bytesToCopy < buffer.length) {
      // buffer had bytes before the incomplete character
      // so smush any character we may have completed with any complete characters in the buffer
      return char + buffer.toString(this.encoding, 0, incompleteCharIndex);
    }

    return char; // any now-completed character that was previously incomplete, possibly empty
  }}



class Utf8StringDecoder extends MultiByteStringDecoderImpl {
  constructor() {
    super('utf8', 4);
  }

  _checkIncompleteBytes(buffer) {
    var length = buffer.length; // FIXME: In Node, they check the last character first!
    // And they rely on Buffer#toString() to handle injecting the '\ufffd' character for busted multi-byte sequences!
    // iOS apparently just returns undefined in that special case and
    // Android differs here because we don't work backwards from the last char
    // Can we cheat here and...
    // see https://github.com/nodejs/string_decoder/blob/master/lib/string_decoder.js#L173-L198
    // - if we see a multi-byte character start, validate the next characters are continuation chars
    // - if they're not replace the sequence with '\ufffd', treat like that multi-byte character was "completed"
    // Note that even if we do hack this, if there's some invalid multi-byte UTF-8 in the buffer that isn't at the last 3 bytes
    // then we're at the mercy of the JS engine/platform code for handling that
    // Here's someone's hack there: https://gist.github.com/oleganza/997155
    // if buffer.length >= 3, check 3rd to last byte

    if (length >= 3) {
      var charLength = checkCharLengthForUTF8(buffer[length - 3]);

      if (charLength === 4) {
        return {
          bytesNeeded: 1,
          // we have 3 last bytes, need 4th
          index: length - 3,
          charLength: 4 };

      }
    } // if buffer.length >= 2, check 2nd to last byte


    if (length >= 2) {
      var _charLength = checkCharLengthForUTF8(buffer[length - 2]);

      if (_charLength >= 3) {
        return {
          bytesNeeded: _charLength - 2,
          // we have 2 bytes of whatever we need
          index: length - 2,
          charLength: _charLength };

      }
    } // if buffer.length >= 1, check last byte


    if (length >= 1) {
      var _charLength2 = checkCharLengthForUTF8(buffer[length - 1]);

      if (_charLength2 >= 2) {
        return {
          bytesNeeded: _charLength2 - 1,
          // we have 1 byte of whatever we need
          index: length - 1,
          charLength: _charLength2 };

      }
    } // base case, no bytes needed - ends on complete character


    return {
      bytesNeeded: 0,
      index: length - 1,
      charLength: 1 };

  }

  _incompleteEnd() {
    return '\ufffd'; // we replace the missing character with a special utf8 char
  }}



class Utf16StringDecoder extends MultiByteStringDecoderImpl {
  constructor() {
    super('utf16le', 4);
  }

  _checkIncompleteBytes(buffer) {
    var length = buffer.length;
    var modulo = length % 2; // ok, we have a multiple of 2 bytes

    if (modulo === 0) {
      // is the last byte a leading/high surrogate?
      var byte = buffer[buffer.length - 1];

      if (byte >= 0xD8 && byte <= 0xDB) {
        return {
          bytesNeeded: 2,
          charLength: 4,
          index: length - 2 };

      } // we're good, not a surrogate, so we have our needed 2 bytes


      return {
        bytesNeeded: 0,
        charLength: 2 };

    } // ok we have 1 byte left over, assume we need 2 to form the character


    return {
      bytesNeeded: 1,
      index: length - 1,
      charLength: 2 };

  }

  _incompleteEnd() {
    // Just write out the last N bytes, hopefully the engine can handle it for us?
    return this.incomplete.toString('utf16le', 0, this.byteCount);
  }}



class Base64StringDecoder extends MultiByteStringDecoderImpl {
  constructor() {
    super('base64', 3);
    this.charLength = 3; // always 3!
  }

  _checkIncompleteBytes(buffer) {
    var length = buffer.length;
    var modulo = length % 3; // base64 needs 3 bytes always, so if we have that many (or a multiple), we have a complete buffer

    if (modulo === 0) {
      return {
        bytesNeeded: 0,
        charLength: 3 };

    } // ok we have 1 or 2 bytes left over


    return {
      bytesNeeded: 3 - modulo,
      // always need 3, so if we have 1 left over -> need 2
      index: length - modulo,
      charLength: 3 // always need 3
    };

  }

  _incompleteBufferEmptied() {
    this.byteCount = 0;
    this.charLength = 3; // always 3!
  }

  _incompleteEnd() {
    // Just write out the last N bytes, it should insert the '=' placeholders
    // it's not really 'missing'/'incomplete', just needs placeholder insertion
    return this.incomplete.toString('base64', 0, this.byteCount);
  }}



function checkCharLengthForUTF8(byte) {
  // 11110XXX => 1110 => 0x1E
  if (byte >> 3 === 0x1E) {
    return 4;
  } // 1110XXXX => 1110 => 0x1E


  if (byte >> 4 === 0x0E) {
    return 3;
  } // 110XXXXX => 110 => 0x06


  if (byte >> 5 === 0x06) {
    return 2;
  }

  return 1;
}

var StringDecoder$1 = {
  StringDecoder };


var isAndroid$1 = Ti.Platform.name === 'android'; // Keep track of printing out one-time warning messages for unsupported operations/options/arguments

var printedWarnings = {};

function oneTimeWarning(key, msg) {
  if (!printedWarnings[key]) {
    console.warn(msg);
    printedWarnings[key] = true;
  }
}
/**
   * Prints a one-time warning message that we do not support the given API and performs an effective no-op
   * @param {string} moduleName name of the module/object
   * @param {string} name name of the function.property we don't support
   * @returns {Function} no-op function
   */


function unsupportedNoop(moduleName, name) {
  return () => {
    var fqn = "".concat(moduleName, ".").concat(name);
    oneTimeWarning(fqn, "\"".concat(fqn, "\" is not supported yet on Titanium and uses a no-op fallback."));
    return undefined;
  };
}
/**
   * @param {string} moduleName name of the module/object
   * @param {string} name name of the function.property we don't support
   * @param {Function} callback async callback we call in a quick setTimeout
   */


function asyncUnsupportedNoop(moduleName, name, callback) {
  callback = maybeCallback(callback); // enforce we have a valid callback

  unsupportedNoop(moduleName, name)();
  setTimeout(callback, 1);
} // Used to choose the buffer/chunk size when pumping bytes during copies


var COPY_FILE_CHUNK_SIZE = 8092; // what should we use here?
// Keep track of integer -> FileStream mappings

var fileDescriptors = new Map();
var fileDescriptorCount = 4; // global counter used to report file descriptor integers
// Map file system access flags to Ti.Filesystem.MODE_* constants

var FLAGS_TO_TI_MODE = new Map();
FLAGS_TO_TI_MODE.set('a', Ti.Filesystem.MODE_APPEND);
FLAGS_TO_TI_MODE.set('ax', Ti.Filesystem.MODE_APPEND);
FLAGS_TO_TI_MODE.set('a+', Ti.Filesystem.MODE_APPEND);
FLAGS_TO_TI_MODE.set('ax+', Ti.Filesystem.MODE_APPEND);
FLAGS_TO_TI_MODE.set('as+', Ti.Filesystem.MODE_APPEND);
FLAGS_TO_TI_MODE.set('r', Ti.Filesystem.MODE_READ);
FLAGS_TO_TI_MODE.set('r+', Ti.Filesystem.MODE_READ);
FLAGS_TO_TI_MODE.set('rs+', Ti.Filesystem.MODE_READ);
FLAGS_TO_TI_MODE.set('w', Ti.Filesystem.MODE_WRITE);
FLAGS_TO_TI_MODE.set('wx', Ti.Filesystem.MODE_WRITE);
FLAGS_TO_TI_MODE.set('w+', Ti.Filesystem.MODE_WRITE);
FLAGS_TO_TI_MODE.set('wx+', Ti.Filesystem.MODE_WRITE); // Common errors

var permissionDenied = (syscall, path) => makeError('EACCES', 'permission denied', -13, syscall, path);

var noSuchFile = (syscall, path) => makeError('ENOENT', 'no such file or directory', -2, syscall, path);

var fileAlreadyExists = (syscall, path) => makeError('EEXIST', 'file already exists', -17, syscall, path);

var notADirectory = (syscall, path) => makeError('ENOTDIR', 'not a directory', -20, syscall, path);

var directoryNotEmpty = (syscall, path) => makeError('ENOTEMPTY', 'directory not empty', -66, syscall, path);

var illegalOperationOnADirectory = (syscall, path) => makeError('EISDIR', 'illegal operation on a directory', -21, syscall, path);

var fs = {
  constants: {
    O_RDONLY: 0,
    O_WRONLY: 1,
    O_RDWR: 2,
    S_IFMT: 61440,
    S_IFREG: 32768,
    S_IFDIR: 16384,
    S_IFCHR: 8192,
    S_IFBLK: 24576,
    S_IFIFO: 4096,
    S_IFLNK: 40960,
    S_IFSOCK: 49152,
    O_CREAT: 512,
    O_EXCL: 2048,
    O_NOCTTY: 131072,
    O_TRUNC: 1024,
    O_APPEND: 8,
    O_DIRECTORY: 1048576,
    O_NOFOLLOW: 256,
    O_SYNC: 128,
    O_DSYNC: 4194304,
    O_SYMLINK: 2097152,
    O_NONBLOCK: 4,
    S_IRWXU: 448,
    S_IRUSR: 256,
    S_IWUSR: 128,
    S_IXUSR: 64,
    S_IRWXG: 56,
    S_IRGRP: 32,
    S_IWGRP: 16,
    S_IXGRP: 8,
    S_IRWXO: 7,
    S_IROTH: 4,
    S_IWOTH: 2,
    S_IXOTH: 1,
    F_OK: 0,
    R_OK: 4,
    W_OK: 2,
    X_OK: 1,
    UV_FS_COPYFILE_EXCL: 1,
    COPYFILE_EXCL: 1 } };



class Stats {
  constructor(path) {
    this._file = null;
    this.dev = 0;
    this.ino = 0;
    this.mode = 0;
    this.nlink = 0;
    this.uid = 0;
    this.gid = 0;
    this.rdev = 0;
    this.size = 0;
    this.blksize = 4096; // FIXME: https://stackoverflow.com/questions/1315311/what-is-the-block-size-of-the-iphone-filesystem

    this.blocks = 0;
    this.atimeMs = this.mtimeMs = this.ctimeMs = this.birthtimeMs = 0;
    this.atime = this.mtime = this.ctime = this.birthtime = new Date(0);

    if (path) {
      this._file = getTiFileFromPathLikeValue(path); // TODO: use lazy getters here?

      this.ctime = this.birthtime = this._file.createdAt();
      this.atime = this.mtime = this._file.modifiedAt();
      this.atimeMs = this.atime.getTime();
      this.birthtimeMs = this.birthtime.getTime();
      this.ctimeMs = this.ctime.getTime();
      this.mtimeMs = this.mtime.getTime();
      this.size = this._file.size;
      this.blocks = Math.ceil(this.size / this.blksize); // TODO: Can we fake out the mode based on the readonly/writable/executable properties?
    }
  }

  isFile() {
    return this._file.isFile();
  }

  isDirectory() {
    return this._file.isDirectory();
  }

  isBlockDevice() {
    return false;
  }

  isCharacterDevice() {
    return false;
  }

  isSymbolicLink() {
    return this._file.symbolicLink;
  }

  isFIFO() {
    return false;
  }

  isSocket() {
    return false;
  }}



fs.Stats = Stats;

class ReadStream {}

fs.ReadStream = ReadStream;

class WriteStream {}

fs.WriteStream = WriteStream;
/**
                               * @callback statsCallback
                               * @param {Error} err - Error if one occurred
                               * @param {fs.Stats} stats - file stats
                               */

/**
                                   * @param {string|URL|Buffer} path file path
                                   * @param {integer} [mode=fs.constants.F_OK] accessibility mode/check
                                   * @param {function} callback async callback
                                   */

fs.access = function (path, mode, callback) {
  if (typeof mode === 'function') {
    callback = mode;
    mode = fs.constants.F_OK;
  }

  callback = maybeCallback(callback);
  setTimeout(() => {
    try {
      fs.accessSync(path, mode);
    } catch (e) {
      callback(e);
      return;
    }

    callback();
  }, 1);
};
/**
    * @param {string|URL|Buffer} path file path
    * @param {integer} [mode=fs.constants.F_OK] accessibility mode/check
    */


fs.accessSync = function (path, mode = fs.constants.F_OK) {
  // F_OK is just whether file exists or not, no permissions check
  // R_OK is read check
  // W_OK is write check
  // X_OK is execute check (acts like F_OK on Windows)
  var fileHandle = getTiFileFromPathLikeValue(path);

  if (!fileHandle.exists()) {
    throw noSuchFile('access', path);
  } // TODO: We have no means of testing if a file is readable. It's assumed all files that exist under the app are?


  if (mode & fs.constants.W_OK && !fileHandle.writable) {
    throw permissionDenied('access', path);
  }

  if (mode & fs.constants.X_OK && !fileHandle.executable && fileHandle.isFile()) {
    throw permissionDenied('access', path);
  }
};
/**
    * Asynchronously append data to a file, creating the file if it does not yet exist. data can be a string or a Buffer.
    * @param {string|Buffer|URL|FileStream} file filepath to file
    * @param {string|Buffer} data data to append to file
    * @param {object|string} [options] options
    * @param {string} [options.encoding='utf8'] encoding to use
    * @param {integer} [options.mode=0o666] mode to create file, if not created
    * @param {string} [options.flag='a'] file system flag
    * @param {Function} callback function to call back with error if failed
    */


fs.appendFile = (file, data, options, callback) => {
  callback = maybeCallback(callback || options);
  options = mergeDefaultOptions(options, {
    encoding: 'utf8',
    mode: 0o666,
    flag: 'a' });

  fs.writeFile(file, data, options, callback);
};
/**
    * Synchronously append data to a file, creating the file if it does not yet exist. data can be a string or a Buffer.
    * @param {string|Buffer|URL|FileStream} file filepath to file
    * @param {string|Buffer} data data to append to file
    * @param {object|string} [options] options
    * @param {string} [options.encoding='utf8'] encoding to use
    * @param {integer} [options.mode=0o666] mode to create file, if not created
    * @param {string} [options.flag='a'] file system flag
    */


fs.appendFileSync = (file, data, options) => {
  options = mergeDefaultOptions(options, {
    encoding: 'utf8',
    mode: 0o666,
    flag: 'a' });

  fs.writeFileSync(file, data, options); // TODO: Use Ti.Filesystem.File.append() instead?
};

fs.chmod = (path, mode, callback) => asyncUnsupportedNoop('fs', 'chmod', callback);

fs.chmodSync = unsupportedNoop('fs', 'chmodSync');
/**
                                                    * Callback for functions that can only throw errors
                                                    *
                                                    * @callback errorCallback
                                                    * @param {Error} [err] - Error thrown
                                                    */

/**
                                                        * @param {integer} fd file descriptor
                                                        * @param {errorCallback} callback callback function
                                                        */

fs.close = (fd, callback) => {
  callback = maybeCallback(callback);
  setTimeout(() => {
    try {
      fs.closeSync(fd);
    } catch (e) {
      callback(e);
      return;
    }

    callback();
  }, 1);
};
/**
    * @param {integer} fd file descriptor
    */


fs.closeSync = fd => {
  var stream = streamForDescriptor(fd);
  stream.close();
}; // Rather than use a hack to wrap sync version in setTimeout, use actual async APIs!

/**
 * @param {string|Buffer|URL} src source filename to copy
 * @param {string|Buffer|URL} dest destination filename of the copy operation
 * @param {number} [flags=0] modifiers for copy operation
 * @param {errorCallback} callback callback called at end of operation
 */


fs.copyFile = function (src, dest, flags, callback) {
  if (typeof flags === 'function') {
    callback = flags;
    flags = 0;
  }

  callback = maybeCallback(callback); // FIXME: I don't know why, but changing this to use Ti.Filesystem.openStream(mode, path) fails (at least on iOS)

  var srcFile = Ti.Filesystem.getFile(src);
  var srcStream = srcFile.open(Ti.Filesystem.MODE_READ);
  var destFile = Ti.Filesystem.getFile(dest);
  var destStream = destFile.open(Ti.Filesystem.MODE_WRITE);
  pipe(srcStream, destStream, callback);
};
/**
    * @param {string|Buffer|URL} src source filename to copy
    * @param {string|Buffer|URL} dest destination filename of the copy operation
    * @param {number} [flags=0] modifiers for copy operation
    */


fs.copyFileSync = function (src, dest, flags = 0) {
  var srcFile = Ti.Filesystem.getFile(src);

  if (flags === fs.constants.COPYFILE_EXCL && fs.existsSync(dest)) {
    throw fileAlreadyExists('copyFile', dest);
  }

  if (!srcFile.copy(dest)) {
    throw new Error("Unable to copy ".concat(src, " to ").concat(dest)); // FIXME: What error should we give?
  }
}; // TODO: fs.createReadStream(path, options)
// /**
//  * @param {string|Buffer|URL} path path like
//  * @param {string|object} [options] options, if a string, it's the encoding
//  * @param {string} [options.flags='r'] See support of file system flags.
//  * @param {string} [options.encoding=null] encoding
//  * @param {integer} [options.fd=null] file descriptor, if specified, `path` is ignored
//  * @param {integer} [options.mode=0o666] permissions to set if file is created
//  * @param {boolean} [options.autoClose=true] if false, file descriptor will not be closed; if true even on error it will be closed
//  * @param {integer} [options.start] start index of range of bytes to read from file
//  * @param {integer} [options.end=Infinity] end index of range of bytes to read from file
//  * @param {integer} [options.highWaterMark=64 * 1024]
//  * @returns {fs.ReadStream}
//  */
// fs.createReadStream = (path, options) => {
// 	options = mergeDefaultOptions(options, { flags: 'r', encoding: null, fd: null, mode: 0o666, autoClose: true, end: Infinity, highWaterMark: 64 * 1024 });
// 	// FIXME: If options.fd, use that in place of path!
// 	const tiFile = getTiFileFromPathLikeValue(path);
// };
// TODO: fs.createWriteStream(path, options)

/**
 * @callback existsCallback
 * @param {boolean} exists - whether path exists
 */

/**
     * @param {string} path path to check
     * @param {existsCallback} callback callback function
     * @returns {void}
     */


fs.exists = function (path, callback) {
  callback = maybeCallback(callback);
  setTimeout(() => {
    callback(fs.existsSync(path));
  }, 1);
};
/**
    * @param {string} path path to check
    * @returns {boolean} whether a file or directory exists at that path
    */


fs.existsSync = function (path) {
  try {
    fs.accessSync(path);
    return true;
  } catch (e) {
    return false;
  }
};

fs.fchmod = (fd, mode, callback) => asyncUnsupportedNoop('fs', 'fchmod', callback);

fs.fchmodSync = unsupportedNoop('fs', 'fchmodSync');

fs.fchown = (fd, uid, gid, callback) => asyncUnsupportedNoop('fs', 'fchown', callback);

fs.fchownSync = unsupportedNoop('fs', 'fchownSync');

fs.fdatasync = (fd, callback) => asyncUnsupportedNoop('fs', 'fdatasync', callback);

fs.fdatasyncSync = unsupportedNoop('fs', 'fdatasyncSync');
/**
                                                            * @param {integer} fd file descriptor
                                                            * @param {object} [options] options
                                                            * @param {boolean} [options.bigint] whether stat values should be bigint
                                                            * @param {function} callback async callback function
                                                            */

fs.fstat = (fd, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  callback = maybeCallback(callback);
  setTimeout(() => {
    var stats;

    try {
      stats = fs.fstatSync(fd, options);
    } catch (e) {
      callback(e);
      return;
    }

    callback(null, stats);
  }, 1);
};
/**
    * @param {integer} fd file descriptor
    * @param {object} [_options] options
    * @param {boolean} [_options.bigint] whether stat values should be bigint
    * @returns {fs.Stats} stats for file descriptor
    */


fs.fstatSync = (fd, _options) => {
  var path = pathForFileDescriptor(fd);
  return fs.statSync(path);
}; // TODO: Add versions of these APIs:
// fs.fsync(fd, callback)
// fs.fsyncSync(fd)
// fs.ftruncate(fd[, len], callback)
// fs.ftruncateSync(fd[, len])
// fs.futimes(fd, atime, mtime, callback)
// fs.futimesSync(fd, atime, mtime)
// fs.lchmod(path, mode, callback)
// fs.lchmodSync(path, mode)
// fs.lchown(path, uid, gid, callback)
// fs.lchownSync(path, uid, gid)
// fs.link(existingPath, newPath, callback)
// fs.linkSync(existingPath, newPath)
// FIXME: If symbolic link we need to follow link to target to get stats! Our API doesn't support that!


fs.lstat = (path, options, callback) => fs.stat(path, options, callback);

fs.lstatSync = (path, options) => fs.statSync(path, options);
/**
                                                               * @param {string|Buffer|URL} path file path
                                                               * @param {string|object} [options] options
                                                               * @param {boolean} [options.recursive=false] recursivley create dirs?
                                                               * @param {integer} [options.mode=0o777] permissions
                                                               * @param {errorCallback} callback async callback
                                                               */


fs.mkdir = (path, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {
      recursive: false,
      mode: 0o777 };

  }

  callback = maybeCallback(callback);
  setTimeout(() => {
    try {
      fs.mkdirSync(path, options);
    } catch (e) {
      callback(e);
      return;
    }

    callback(null);
  }, 1);
};
/**
    * @param {string|Buffer|URL} path file path
    * @param {string|object} [options] options
    * @param {boolean} [options.recursive=false] recursivley create dirs?
    * @param {integer} [options.mode=0o777] permissions
    */


fs.mkdirSync = (path, options) => {
  var tiFile = getTiFileFromPathLikeValue(path);

  if (typeof options === 'number') {
    options = {
      recursive: false,
      mode: options };

  } else {
    options = mergeDefaultOptions(options, {
      recursive: false,
      mode: 0o777 });

  }

  if (!tiFile.createDirectory(options.recursive) && !options.recursive) {
    if (tiFile.exists()) {
      // already existed!
      throw fileAlreadyExists('mkdir', path);
    } // We failed, probably because we didn't ask for recursive and parent doesn't exist, so reproduce node's error


    throw noSuchFile('mkdir', path);
  }
};
/**
    * @callback tempDirCallback
    * @param {Error} err - Error if one occurred
    * @param {string} folder - generated folder name
    */

/**
        * @param {string} prefix directory name prefix
        * @param {string|object} [options] options
        * @param {string} [options.encoding='utf-8'] prefix encoding
        * @param {tempDirCallback} callback async callback
        */


fs.mkdtemp = (prefix, options, callback) => {
  assertArgumentType(prefix, 'prefix', 'string');

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  callback = maybeCallback(callback);
  options = mergeDefaultOptions(options, {
    encoding: 'utf-8' });
  // try to be all async

  var tryMkdtemp = () => {
    var generated = randomCharacters(6, options.encoding); // generate six random characters

    var path = "".concat(prefix).concat(generated);
    fs.mkdir(path, 0o700, err => {
      if (err) {
        if (err.code === 'EEXIST') {
          // retry!
          setTimeout(tryMkdtemp, 1);
          return;
        } // bubble up error


        callback(err);
        return;
      } // succeeded! Hurray!


      callback(null, path);
    });
  };

  setTimeout(tryMkdtemp, 1);
};
/**
    * Creates a unique temporary directory.
    * @param {string} prefix directory name prefix
    * @param {string|object} [options] options
    * @param {string} [options.encoding='utf-8'] prefix encoding
    * @returns {string} path to created directory
    */


fs.mkdtempSync = (prefix, options) => {
  assertArgumentType(prefix, 'prefix', 'string');
  options = mergeDefaultOptions(options, {
    encoding: 'utf-8' });

  var retryCount = 0;
  var MAX_RETRIES = 100;

  while (retryCount < MAX_RETRIES) {
    var generated = randomCharacters(6, options.encoding); // generate six random characters

    var _path = "".concat(prefix).concat(generated);

    try {
      fs.mkdirSync(_path, 0o700); // don't try recursive

      return _path;
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e; // bubble up error
      } // name was not unique, so retry


      retryCount++;
    }
  }

  throw new Error("Failed to create a unique directory name with prefix ".concat(prefix));
};
/**
    * @callback fileDescriptorCallback
    * @param {Error} err - Error if one occurred
    * @param {integer} fileDescriptor - generated file descriptor
    */

/**
        * @param {string|Buffer|URL} path path to file
        * @param {string} [flags='r'] file system access flags
        * @param {integer} [mode=0o666] file mode to use when creating file
        * @param {fileDescriptorCallback} callback async callback
        */


fs.open = (path, flags, mode, callback) => {
  // flags and mode are optional, we need to handle if not supplied!
  if (typeof flags === 'function') {
    callback = flags;
    flags = 'r';
    mode = 0o666;
  } else if (typeof mode === 'function') {
    callback = mode;
    mode = 0o666;
  }

  callback = maybeCallback(callback);
  setTimeout(() => {
    var fileDescriptor;

    try {
      fileDescriptor = fs.openSync(path, flags, mode);
    } catch (e) {
      callback(e);
      return;
    }

    callback(null, fileDescriptor);
  }, 1);
};
/**
    * @param {string|Buffer|URL} path path to file
    * @param {string} [flags='r'] file system access flags
    * @param {integer} [_mode=0o666] file mode to use when creating file
    * @returns {integer}
    */


fs.openSync = (path, flags = 'r', _mode = 0o666) => {
  var tiFile = getTiFileFromPathLikeValue(path);

  if (!tiFile.exists()) {
    // TODO: Support creating file with specific mode
    oneTimeWarning('fs.openSync.mode', 'fs.openSync\'s mode parameter is unsupported in Titanium and will be ignored');

    if (!tiFile.createFile()) {
      // Oh crap, we failed to create the file. why?
      if (!tiFile.parent.exists()) {
        // parent does not exist!
        throw noSuchFile('open', path);
      }

      throw new Error("failed to create file at path ".concat(path));
    }
  } else if (flags) {
    // file/dir exists...
    if ((flags.charAt(0) === 'w' || flags.charAt(0) === 'a') && tiFile.isDirectory()) {
      // If user is trying to write or append and it's a directory, fail
      throw illegalOperationOnADirectory('open', path);
    }

    if (flags.length > 1 && flags.charAt(1) === 'x') {
      // If user has "exclusive" flag on, fail if file already exists
      throw fileAlreadyExists('open', path);
    }
  }

  var tiMode = FLAGS_TO_TI_MODE.get(flags);

  if (tiMode === undefined) {
    // TODO: Make use of common error type/code for this once we have internal/errors.js
    var err = new TypeError("The value \"".concat(String(flags), "\" is invalid for option \"flags\""));
    err.code = 'ERR_INVALID_OPT_VALUE';
    throw err;
  }

  return createFileDescriptor(path, tiFile.open(tiMode));
};
/**
    * @callback readCallback
    * @param {Error} err - Error if one occurred
    * @param {integer} bytesRead - number of bytes read
    * @param {Buffer} buffer buffer
    */

/**
        * @param {integer} fd file descriptor
        * @param {Buffer|Ti.Buffer} buffer buffer to read into
        * @param {integer} offset the offset in the buffer to start writing at.
        * @param {integer} length integer specifying the number of bytes to read.
        * @param {integer} position where to begin reading from in the file
        * @param {readCallback} callback async callback
        */


fs.read = (fd, buffer, offset, length, position, callback) => {
  callback = maybeCallback(callback);
  var tiFileStream = streamForDescriptor(fd);

  if (!Buffer.isBuffer(buffer)) {
    buffer = Buffer.from(buffer);
  } // FIXME: Allow using position argument!


  if (position !== null) {
    oneTimeWarning('fs.readSync.position', 'fs.readSync\'s position argument is unsupported by Titanium and will be treated as null');
  }

  tiFileStream.read(buffer.toTiBuffer(), offset, length, readObj => {
    if (!readObj.success) {
      callback(new Error(readObj.error));
      return;
    }

    callback(null, readObj.bytesProcessed, buffer);
  });
};
/**
    * @param {integer} fd file descriptor
    * @param {Buffer|Ti.Buffer} buffer buffer to read into
    * @param {integer} offset the offset in the buffer to start writing at.
    * @param {integer} length integer specifying the number of bytes to read.
    * @param {integer} _position where to begin reading from in the file
    * @returns {integer} bytes read
    */


fs.readSync = (fd, buffer, offset, length, _position) => {
  var fileStream = streamForDescriptor(fd);

  if (!Buffer.isBuffer(buffer)) {
    buffer = Buffer.from(buffer);
  } // FIXME: Allow using position argument!


  if (_position !== null) {
    oneTimeWarning('fs.readSync.position', 'fs.readSync\'s position argument is unsupported by Titanium and will be treated as null');
  }

  return fileStream.read(buffer.toTiBuffer(), offset, length);
};
/**
    * @callback filesCallback
    * @param {Error} err - Error if one occurred
    * @param {string[]|Buffer[]|fs.Dirent[]} files - file listing
    */

/**
        * @param {string} path directory to list
        * @param {string|object} [options] optional options
        * @param {string} [options.encoding='utf8'] encoding to use for filenames, if `'buffer'`, returns `Buffer` objects
        * @param {boolean} [options.withFileTypes=false] if true, returns `fs.Dirent` objects
        * @param {filesCallback} callback async callback
        */


fs.readdir = (path, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  callback = maybeCallback(callback);
  setTimeout(() => {
    var result;

    try {
      result = fs.readdirSync(path, options);
    } catch (e) {
      callback(e);
      return;
    }

    callback(null, result);
  }, 1);
};
/**
    * @param {string} filepath directory to list
    * @param {string|object} [options] optional options
    * @param {string} [options.encoding='utf8'] encoding to use for filenames, if `'buffer'`, returns `Buffer` objects
    * @param {boolean} [options.withFileTypes=false] if true, returns `fs.Dirent` objects
    * @returns {string[]|Buffer[]|fs.Dirent[]}
    */


fs.readdirSync = (filepath, options) => {
  var file = getTiFileFromPathLikeValue(filepath);

  if (!file.exists()) {
    throw noSuchFile('scandir', filepath);
  }

  if (!file.isDirectory()) {
    throw notADirectory('scandir', filepath);
  }

  options = mergeDefaultOptions(options, {
    encoding: 'utf-8',
    withFileTypes: false });

  var listing = file.getDirectoryListing();

  if (options.withFileTypes === true) {
    // TODO: if options.withFileTypes === true, return fs.Dirent objects
    oneTimeWarning('fs.readdir\'s options.withFileTypes is unsupported by Titanium and strings will be returned');
  } else if (options.encoding === 'buffer') {
    return listing.map(name => Buffer.from(name));
  }

  return listing;
};
/**
    * @callback readFilePostOpenCallback
    * @param {Error} err - Error if one occurred
    * @param {Ti.Buffer} buffer
    */

/**
        * @param {integer} fileDescriptor file descriptor
        * @param {readFilePostOpenCallback} callback async callback
        */


function readFilePostOpen(fileDescriptor, callback) {
  callback = maybeCallback(callback);
  fs.fstat(fileDescriptor, (err, stats) => {
    if (err) {
      callback(err);
      return;
    }

    var fileSize = stats.size; // Create a Ti.Buffer to read into

    var buffer = Ti.createBuffer({
      length: fileSize });
    // Use Ti.Stream.readAll(sourceStream, buffer, callback) which spins off a separate thread to read in while loop!

    var sourceStream = streamForDescriptor(fileDescriptor);
    Ti.Stream.readAll(sourceStream, buffer, readAllObj => {
      if (!readAllObj.success) {
        callback(new Error(readAllObj.error));
        return;
      }

      callback(null, buffer);
    });
  });
}
/**
   * @callback readFileCallback
   * @param {Error} err - Error if one occurred
   * @param {string|Buffer} data
   */

/**
       * Asynchronously read entire contents of file
       * @param {string|Buffer|URL|integer} path filename or file descriptor
       * @param {object|string} [options] options
       * @param {string} [options.encoding=null] encoding to use
       * @param {string} [options.flag='r'] file system flag
       * @param {readFileCallback} callback async callback
       */


fs.readFile = (path, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {
      encoding: null,
      flag: 'r' };

  } else {
    options = mergeDefaultOptions(options, {
      encoding: null,
      flag: 'r' });

  }

  callback = maybeCallback(callback);
  var wasFileDescriptor = typeof path === 'number';
  var fileDescriptor = path; // may be overriden later

  /**
   * @param {Error} err possible Error
   * @param {Ti.Buffer} buffer Ti.Buffer instance
   */

  var handleBuffer = (err, buffer) => {
    if (err) {
      callback(err);
      return;
    } // fs.closeSync if it was not originally a file descriptor


    if (!wasFileDescriptor) {
      fs.closeSync(fileDescriptor);
    } // TODO: trim buffer if we didn't read full size?


    callback(null, encodeBuffer(options.encoding, buffer));
  };

  if (!wasFileDescriptor) {
    fs.open(path, options.flag, (err, fd) => {
      if (err) {
        callback(err);
        return;
      }

      fileDescriptor = fd;
      readFilePostOpen(fd, handleBuffer);
    });
  } else {
    readFilePostOpen(path, handleBuffer);
  }
};
/**
    * Returns the contents of the path.
    * @param {string|Buffer|URL|integer} path path to file
    * @param {object|string} [options] options
    * @param {string} [options.encoding=null] encoding to use
    * @param {string} [options.flag='r'] file system flag
    * @returns {string|Buffer} string if encoding is specified, otherwise Buffer
    */


fs.readFileSync = (path, options) => {
  options = mergeDefaultOptions(options, {
    encoding: null,
    flag: 'r' });

  var wasFileDescriptor = typeof path === 'number';
  var fileDescriptor = wasFileDescriptor ? path : fs.openSync(path, options.flag); // use default mode

  var tiFileStream = streamForDescriptor(fileDescriptor); // Just use our own API that reads full stream in

  var buffer = Ti.Stream.readAll(tiFileStream); // fs.closeSync if it was not originally a file descriptor

  if (!wasFileDescriptor) {
    fs.closeSync(fileDescriptor);
  } // TODO: trim buffer if we didn't read full size?


  return encodeBuffer(options.encoding, buffer);
}; // TODO: fs.readlink(path[, options], callback)
// TODO: fs.readlinkSync(path[, options])

/**
 * @callback realpathCallback
 * @param {Error} err - Error if one occurred
 * @param {string|Buffer} resolvedPath the resolved path
 */

/**
     * @param {string|Buffer|URL} filepath original filepath
     * @param {object} [options] optiosn object
     * @param {string} [options.encoding='utf8'] encoding used for returned object. If 'buffer", we'll return a Buffer in palce of a string
     * @param {realpathCallback} callback async callback
     */


fs.realpath = (filepath, options, callback) => {
  callback = maybeCallback(callback || options);
  options = mergeDefaultOptions(options, {
    encoding: 'utf8' });

  setTimeout(() => {
    // FIXME: This assumes no symlinks, which we really don't have full support for in our SDK anyways.
    var result = path$1.normalize(filepath);
    fs.exists(result, resultExists => {
      if (resultExists) {
        if (options.encoding === 'buffer') {
          return callback(null, Buffer.from(result));
        }

        return callback(null, result);
      } // this path doesn't exist, try each segment until we find first that doesn't


      var segments = result.split(path$1.sep); // FIXME: Drop last segment as we already know the full path doesn't exist?

      var partialFilePath = '';
      var index = 0; // handle typical case of empty first segment so we don't need to do an async setTimeout to get to first real case

      if (segments[index].length === 0) {
        index++;
      }

      setTimeout(tryPath, 1);

      function tryPath() {
        if (index >= segments.length) {
          // don't run past end of segments, throw error for resolved path
          return callback(noSuchFile(result));
        } // grab next segment


        var segment = segments[index++];

        if (segment.length === 0) {
          // if it's an empty segment...
          // try again at next index
          return setTimeout(tryPath, 1);
        } // normal case


        partialFilePath += path$1.sep + segment; // check if path up to this point exists...

        fs.exists(partialFilePath, partialExists => {
          if (!partialExists) {
            // nope, throw the Error
            return callback(noSuchFile('lstat', partialFilePath));
          } // try again at next depth of dir tree


          setTimeout(tryPath, 1);
        });
      }
    });
  }, 1);
};

fs.realpath.native = (path, options, callback) => {
  fs.realpath(path, options, callback);
};
/**
    * @param {string|Buffer|URL} filepath original filepath
    * @param {object} [options] options object
    * @param {string} [options.encoding='utf8'] encoding used for returned object. If 'buffer", we'll return a Buffer in palce of a string
    * @returns {string|Buffer}
    */


fs.realpathSync = (filepath, options) => {
  options = mergeDefaultOptions(options, {
    encoding: 'utf8' });
  // FIXME: This assumes no symlinks, which we really don't have full support for in our SDK anyways.

  var result = path$1.normalize(filepath);

  if (!fs.existsSync(result)) {
    // this path doesn't exist, try each segment until we find first that doesn't
    var segments = result.split(path$1.sep);
    var partialFilePath = '';

    for (var segment of segments) {
      if (segment.length === 0) {
        continue;
      }

      partialFilePath += path$1.sep + segment;

      if (!fs.existsSync(partialFilePath)) {
        throw noSuchFile('lstat', partialFilePath);
      }
    }
  }

  if (options.encoding === 'buffer') {
    return Buffer.from(result);
  }

  return result;
};

fs.realpathSync.native = (path, options) => {
  fs.realpathSync(path, options);
};
/**
    * @param {string|Buffer|URL} oldPath source filepath
    * @param {string|Buffer|URL} newPath destination filepath
    * @param {errorCallback} callback async callback
    */


fs.rename = (oldPath, newPath, callback) => {
  callback = maybeCallback(callback);
  setTimeout(() => {
    try {
      fs.renameSync(oldPath, newPath);
    } catch (e) {
      callback(e);
      return;
    }

    callback();
  }, 1);
};
/**
    * @param {string|Buffer|URL} oldPath source filepath
    * @param {string|Buffer|URL} newPath destination filepath
    */


fs.renameSync = (oldPath, newPath) => {
  var tiFile = getTiFileFromPathLikeValue(oldPath); // src doesn't actually exist?

  if (!tiFile.exists()) {
    var err = noSuchFile('rename', oldPath);
    err.message = "".concat(err.message, " -> '").concat(newPath, "'");
    err.dest = newPath;
    throw err;
  }

  var destFile = getTiFileFromPathLikeValue(newPath);

  if (destFile.isDirectory()) {
    // dest is a directory that already exists
    var _err2 = illegalOperationOnADirectory('rename', oldPath);

    _err2.message = "".concat(_err2.message, " -> '").concat(newPath, "'");
    _err2.dest = newPath;
    throw _err2;
  }

  var tempPath;

  if (destFile.isFile()) {
    // destination file exists, we should overwrite
    // Our APIs will fail if we try, so first let's make a backup copy and delete the the original
    tempPath = path$1.join(fs.mkdtempSync(path$1.join(Ti.Filesystem.tempDirectory, 'rename-')), path$1.basename(newPath));
    destFile.move(tempPath);
  }

  var success = false;

  try {
    success = tiFile.move(newPath);
  } finally {
    if (tempPath) {
      // we temporarily copied the existing destination to back it up...
      if (success) {
        // move worked, so we can wipe it away whenever...
        fs.unlink(tempPath, _err => {});
      } else {
        // move it back, because we failed!
        var tmpFile = getTiFileFromPathLikeValue(tempPath);
        tmpFile.move(newPath);
      }
    }
  }
};
/**
    * @param {string|Buffer|URL} path file path
    * @param {errorCallback} callback async callback
    */


fs.rmdir = (path, callback) => {
  callback = maybeCallback(callback);
  setTimeout(() => {
    try {
      fs.rmdirSync(path);
    } catch (e) {
      callback(e);
      return;
    }

    callback();
  }, 1);
};
/**
    * @param {string|Buffer|URL} path file path
    */


fs.rmdirSync = path => {
  var tiFile = getTiFileFromPathLikeValue(path);

  if (!tiFile.deleteDirectory(false)) {
    // do not delete contents!
    // we failed to delete, but why?
    // does it exist?
    if (!tiFile.exists()) {
      throw noSuchFile('rmdir', path);
    } // is it a file?


    if (tiFile.isFile()) {
      throw notADirectory('rmdir', path);
    } // is it not empty?


    var subFiles = tiFile.getDirectoryListing();

    if (subFiles && subFiles.length > 0) {
      throw directoryNotEmpty('rmdir', path);
    }
  }
};
/**
    * @param {string|Buffer|URL} path file path
    * @param {object} [options] options
    * @param {boolean} [options.bigint] whether stat values should be bigint
    * @param {statsCallback} callback async callback
    */


fs.stat = (path, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  callback = maybeCallback(callback);
  setTimeout(() => {
    callback(null, new fs.Stats(path));
  }, 1);
};
/**
    * @param {string|Buffer|URL|integer} path filepath or file descriptor
    * @param {object} [_options] options
    * @param {boolean} [_options.bigint] whether stat values should be bigint
    * @returns {fs.Stats}
    */


fs.statSync = (path, _options) => new fs.Stats(path);

fs.symlink = (target, path, type, callback) => asyncUnsupportedNoop('fs', 'symlink', callback);

fs.symlinkSync = unsupportedNoop('fs', 'symlinkSync');
/**
                                                        * @param {string} path file path
                                                        * @param {integer} [len=0] bytes to trim to
                                                        * @param {errorCallback} callback async callback
                                                        */

fs.truncate = (path, len, callback) => {
  callback = maybeCallback(callback || len);

  if (typeof len !== 'number') {
    len = 0;
  }

  if (len <= 0) {
    fs.writeFile(path, '', callback); // empty the file

    return;
  } // we have to retain some of the file!
  // yuck, so let's read what we need to retain, then overwrite file with it


  fs.open(path, (err, fd) => {
    if (err) {
      return callback(err);
    }

    var buffer = Buffer.alloc(len);
    fs.read(fd, buffer, 0, len, null, (err, bytesRead, buffer) => {
      if (err) {
        fs.closeSync(fd);
        return callback(err);
      }

      fs.close(fd, err => {
        if (err) {
          return callback(err);
        }

        fs.writeFile(path, buffer, callback);
      });
    });
  });
};
/**
    * @param {string} path file path
    * @param {integer} [len=0] bytes to trim to
    */


fs.truncateSync = (path, len = 0) => {
  if (len <= 0) {
    // empty the file
    fs.writeFileSync(path, '');
    return;
  } // we have to retain some of the file!
  // yuck, so let's read what we need to retain, then overwrite file with it


  var fd = fs.openSync(path);
  var buffer = Buffer.alloc(len);
  fs.readSync(fd, buffer, 0, len, null);
  fs.closeSync(fd);
  fs.writeFileSync(path, buffer);
};
/**
    * @param {string|Buffer|URL} path file path
    * @param {errorCallback} callback async callback
    */


fs.unlink = (path, callback) => {
  callback = maybeCallback(callback);
  setTimeout(() => {
    try {
      fs.unlinkSync(path);
    } catch (err) {
      callback(err);
      return;
    }

    callback();
  }, 1);
};
/**
    * @param {string|Buffer|URL} path file path
    * @returns {undefined}
    */


fs.unlinkSync = path => {
  var tiFile = getTiFileFromPathLikeValue(path);

  if (!tiFile.deleteFile()) {
    // we failed, but why?
    if (!tiFile.exists()) {
      throw noSuchFile('unlink', path);
    }

    if (tiFile.isDirectory()) {
      throw illegalOperationOnADirectory('unlink', path);
    }
  }
};

fs.unwatchFile = unsupportedNoop('fs', 'unwatchFile');

fs.utimes = (path, atime, mtime, callback) => asyncUnsupportedNoop('fs', 'utimes', callback);

fs.utimesSync = unsupportedNoop('fs', 'utimesSync');
fs.watch = unsupportedNoop('fs', 'watch');
fs.watchFile = unsupportedNoop('fs', 'watchFile');
/**
                                                    * @param {string|Buffer|URL|integer} file file path or descriptor
                                                    * @param {string|Buffer|TypedArray|DataView} data data to write
                                                    * @param {object|string} [options] options, encoding if string
                                                    * @param {string|null} [options.encoding='utf-8'] options
                                                    * @param {object} [options.mode=0o666] options
                                                    * @param {object} [options.flag='w'] options
                                                    * @param {errorCallback} callback async callback
                                                    */

fs.writeFile = (file, data, options, callback) => {
  callback = maybeCallback(callback || options);
  options = mergeDefaultOptions(options, {
    encoding: 'utf8',
    mode: 0o666,
    flag: 'w' });
  // Turn into file descriptor

  var wasFileDescriptor = typeof file === 'number';
  var fileDescriptor = file; // may be overriden later

  var finish = err => {
    if (err) {
      callback(err);
      return;
    }

    if (wasFileDescriptor) {
      callback();
      return;
    } // fs.close if it was not originally a file descriptor


    fs.close(fileDescriptor, callback);
  };

  if (!wasFileDescriptor) {
    fs.open(file, options.flag, options.mode, (err, fd) => {
      if (err) {
        callback(err);
        return;
      }

      fileDescriptor = fd;
      fs.write(fileDescriptor, data, finish);
    });
  } else {
    fs.write(fileDescriptor, data, finish);
  }
};
/**
    * @param {string|Buffer|URL|integer} file file path or descriptor
    * @param {string|Buffer|TypedArray|DataView} data data to write
    * @param {object|string} [options] options, encoding if string
    * @param {string} [options.encoding='utf-8'] options
    * @param {object} [options.mode=0o666] options
    * @param {object} [options.flag='w'] options
    */


fs.writeFileSync = (file, data, options) => {
  options = mergeDefaultOptions(options, {
    encoding: 'utf8',
    mode: 0o666,
    flag: 'w' });
  // Turn into file descriptor

  var wasFileDescriptor = typeof file === 'number';
  var fileDescriptor = wasFileDescriptor ? file : fs.openSync(file, options.flag, options.mode); // if data is a string, make it a buffer first

  if (!Buffer.isBuffer(data)) {
    data = Buffer.from('' + data, options.encoding); // force data to be a string, handles case where it's undefined and writes 'undefined' to file!
  }

  fs.writeSync(fileDescriptor, data); // close if user didn't give us file descriptor

  if (!wasFileDescriptor) {
    fs.closeSync(fileDescriptor);
  }
};
/**
    * @callback writeTiFileStreamCallback
    * @param {Error} err - Error if one occurred
    * @param {integer} written - bytes written
    */

/**
        * @param {Ti.Filesystem.FileStream} tiFileStream file stream
        * @param {Buffer} buffer buffer we're writing
        * @param {writeTiFileStreamCallback} callback async callback
        */


function writeTiFileStream(tiFileStream, buffer, callback) {
  callback = maybeCallback(callback);
  Ti.Stream.write(tiFileStream, buffer.toTiBuffer(), writeObj => {
    if (!writeObj.success) {
      callback(new Error(writeObj.error));
      return;
    }

    callback(null, writeObj.bytesProcessed);
  });
}
/**
   * @param {integer} fd file descriptor
   * @param {string|Buffer} buffer contents to write: Buffer or string
   * @param {integer} [offset] offset within Buffer to write; OR offset from the beginning of the file where this data should be written (if string)
   * @param {string|integer} [length] length of bytes to write if Buffer; OR expected string encoding
   * @param {writeCallback|integer} [position] offset from the beginning of the file where this data should be written (if Buffer); OR async callback if string
   * @param {writeCallback} [callback] async callback (if Buffer)
   */


fs.write = (fd, buffer, offset, length, position, callback) => {
  var isBuffer = Buffer.isBuffer(buffer);

  if (isBuffer) {
    writeBuffer(fd, buffer, offset, length, position, callback);
  } else {
    writeString(fd, buffer, offset, length, position);
  }
};
/**
    * @param {integer} fd file descriptor
    * @param {string|Buffer} buffer contents to write
    * @param {integer} [offset] offset from the beginning of the file where this data should be written
    * @param {string|integer} [length]  expected string encoding
    * @param {integer} [position] position
    * @returns {integer} number of bytes written
    */


fs.writeSync = (fd, buffer, offset, length, position) => {
  var isBuffer = Buffer.isBuffer(buffer);

  if (isBuffer) {
    return writeBufferSync(fd, buffer, offset, length);
  }

  return writeStringSync(fd, buffer, offset, length);
}; // TODO: Add FileHandle class to match Node's wrapper for file descriptors. Re-purpose our own wrapper?
// TODO: Add the fs.promises API!
// TODO: Define fs.Dirent class, which can simply wrap a Ti.Filesystem.File (and is very similar to fs.Stats!)
// Helper functions
// --------------------------------------------------------

/**
 * Tracks the pairing of the number we use to represent the file externally, the filepath it's pointing at, and the stream pointing at it.
 */


class FileDescriptor {
  constructor(number, path, stream) {
    this.path = path;
    this.number = number;
    this.stream = stream;
  }}


/**
      * @param {Ti.IOStream} srcStream input stream we're reading from
      * @param {Ti.IOStream} destStream output stream we're writing to
      * @param {errorCallback} callback async callback
      */


function pipe(srcStream, destStream, callback) {
  if (isAndroid$1) {
    // Android is probably better off with Ti.Stream.writeStream, less overhead back and forth the bridge
    // Though Android does support the Ti.Stream.pump/Ti.Stream.write pattern using both APIs async
    pipeViaWriteStream(srcStream, destStream, callback);
    return;
  } // iOS has some... issues with writeStream calling the callback every iteration of the loop *and* at the end
  // it also doesn't play as expected when doing Ti.Stream.pump and Ti.Stream.write async each
  // it ends up doing all reads first and then all writes
  // so we have to hack here and do Ti.Stream.pump async, but each time the read callback happens we do a *sync* write inside it
  // See https://jira.appcelerator.org/browse/TIMOB-27321


  pipeViaPump(srcStream, destStream, callback);
}
/**
   * @param {Ti.IOStream} srcStream input stream we're reading from
   * @param {Ti.IOStream} destStream output stream we're writing to
   * @param {errorCallback} callback async callback
   */


function pipeViaWriteStream(srcStream, destStream, callback) {
  Ti.Stream.writeStream(srcStream, destStream, COPY_FILE_CHUNK_SIZE, result => {
    if (!result.success) {
      return callback(new Error(result.error));
    } // Android will only call this at the end or error, so we can safely assume we're done here.
    // iOS will call per loop iteration, see https://jira.appcelerator.org/browse/TIMOB-27320


    callback();
  });
}
/**
   * @param {Ti.IOStream} srcStream input stream we're reading from
   * @param {Ti.IOStream} destStream output stream we're writing to
   * @param {errorCallback} callback async callback
   */


function pipeViaPump(srcStream, destStream, callback) {
  Ti.Stream.pump(srcStream, obj => {
    if (!obj.success) {
      return callback(new Error(obj.error)); // TODO: set code via writeObj.code?
    }

    if (obj.bytesProcessed === -1) {
      // reached EOF
      return callback();
    } // we read some segment of the input stream and have not reached EOF yet


    var bytesWritten = 0;
    var offset = 0;
    var length = obj.bytesProcessed;

    try {
      while (true) {
        // try to write all of the current buffer
        var bytesWrittenThisChunk = destStream.write(obj.buffer, offset, length);
        bytesWritten += bytesWrittenThisChunk;

        if (bytesWritten === obj.bytesProcessed) {
          // wrote same amount of bytes as we read, move on
          break;
        } // NOTE: This shouldn't ever happen because our APIs should write the entire byte array or fail, but just in case...
        // we didn't write it all, so move on to try and write the rest of buffer...


        offset = bytesWritten;
        length = obj.bytesProcessed - bytesWritten;
      }
    } catch (e) {
      return callback(e);
    }
  }, COPY_FILE_CHUNK_SIZE, true);
}
/**
   * @param {string|Buffer|URL} path file path
   * @param {Ti.Filesystem.FileStream} fileStream file stream
   * @returns {integer} file descriptor
   */


function createFileDescriptor(path, fileStream) {
  var pointer = fileDescriptorCount++; // increment global counter

  var fd = new FileDescriptor(pointer, path, fileStream);
  fileDescriptors.set(pointer, fd); // use it to refer to this file stream as the "descriptor"

  return pointer;
}
/**
   * @param {integer} fd file descriptor
   * @returns {Ti.Filesystem.FileStream} matching stream
   */


function streamForDescriptor(fd) {
  var wrapper = fileDescriptors.get(fd);
  return wrapper.stream;
}
/**
   * @param {integer} fd file descriptor
   * @returns {string} matching stream
   */


function pathForFileDescriptor(fd) {
  var wrapper = fileDescriptors.get(fd);
  return wrapper.path;
}
/**
   * Used to merge the user-supplied options with the defaults for a function. Special cases a string to be encoding.
   * @param {*} options user-supplied options
   * @param {object} defaults defaults to use
   * @return {object}
   */


function mergeDefaultOptions(options, defaults) {
  if (options === null) {
    return defaults;
  }

  var optionsType = typeof options;

  switch (optionsType) {
    case 'undefined':
    case 'function':
      return defaults;

    case 'string':
      // Use copy of defaults but with encoding set to the 'options' value!
      var merged = Object.assign({}, defaults);
      merged.encoding = options;
      return merged;

    case 'object':
      return options;

    default:
      assertArgumentType(options, 'options', 'object');
      return null;
    // should never get reached
  }
}
/**
   * Enforces that we have a valid callback function. Throws TypeError if not.
   * @param {*} cb possible callback function
   * @returns {Function}
   * @throws {TypeError}
   */


function maybeCallback(cb) {
  if (typeof cb === 'function') {
    return cb;
  }

  var err = new TypeError("Callback must be a function. Received ".concat(cb));
  err.code = 'ERR_INVALID_CALLBACK';
  throw err;
}
/**
   * returns randomly generated characters of given length 1-16
   * @param {integer} length 1 - 16
   * @param {string} [_encoding='utf8'] encoding of the string generated
   * @returns {string}
   */


function randomCharacters(length, _encoding = 'utf8') {
  // FIXME: use the encoding specified!
  return (Math.random().toString(36) + '00000000000000000').slice(2, length + 2);
}

function makeError(code, message, errno, syscall, path) {
  var error = new Error("".concat(code, ": ").concat(message, ", ").concat(syscall, " '").concat(path, "'"));
  error.errno = errno;
  error.syscall = syscall;
  error.code = code;
  error.path = path;
  return error;
}
/**
   * @param {string} encoding what we're encoding to
   * @param {Ti.Buffer} tiBuffer Ti.Buffer instance
   * @returns {Buffer} node-compatible Buffer instance
   */


function encodeBuffer(encoding, tiBuffer) {
  var buffer = Buffer.from(tiBuffer);

  switch (encoding) {
    case 'buffer':
    case null:
    case undefined:
      return buffer;

    default:
      return buffer.toString(encoding);}

}
/**
   * @param {string|Buffer|URL} path file path
   * @return {Ti.Filesystem.File}
   */


function getTiFileFromPathLikeValue(path) {
  // This is a hack that is likely to work in most cases?
  // Basically assumes Buffer is holding a utf-8 string filename/path
  // Node just copies the bytes from the buffer as-is on the native side and adds a null terminator
  if (Buffer.isBuffer(path)) {
    path = path.toString(); // assumes utf-8 string
  } // FIXME: Handle URLs! We don't have an URL shim yet, so no way to handle those yet


  assertArgumentType(path, 'path', 'string');
  return Ti.Filesystem.getFile(path);
}
/**
   * @callback writeBufferCallback
   * @param {Error} err - Error if one occurred
   * @param {integer} written - bytes written
   * @param {Buffer} buffer - original Buffer being written
   */

/**
       * @param {integer} fd file descriptor
       * @param {Buffer} buffer contents to write
       * @param {integer} [offset] offset within Buffer to write
       * @param {integer} [length] length of bytes to write if Buffer
       * @param {integer} [position] offset from the beginning of the file where this data should be written
       * @param {writeBufferCallback} callback async callback
       */


function writeBuffer(fd, buffer, offset, length, position, callback) {
  callback = maybeCallback(callback || position || length || offset);

  if (typeof offset !== 'number') {
    offset = 0;
  }

  if (typeof length !== 'number') {
    length = buffer.length - offset;
  }

  if (typeof position !== 'number') {
    position = null;
  } // ok now what?


  var tiFileStream = streamForDescriptor(fd); // Make use of the buffer slice that's specified by offset/length

  if (offset !== 0 || length !== buffer.length) {
    buffer = buffer.slice(offset, length);
  } // TODO: Support use of position argument. I assume we'd need a way to add a method to move to stream position somehow


  writeTiFileStream(tiFileStream, buffer, (err, bytesProcessed) => {
    if (err) {
      callback(err);
      return;
    }

    callback(null, bytesProcessed, buffer);
  });
}
/**
   * @param {integer} fd file descriptor
   * @param {Buffer} buffer contents to write
   * @param {integer} [offset] offset within Buffer to write
   * @param {integer} [length] length of bytes to write if Buffer
   * @param {integer} [position] offset from the beginning of the file where this data should be written
   * @returns {integer} number of bytes written
   */


function writeBufferSync(fd, buffer, offset, length, position) {
  if (typeof offset !== 'number') {
    offset = 0;
  }

  if (typeof length !== 'number') {
    length = buffer.length - offset;
  }


  var tiFileStream = streamForDescriptor(fd); // Make use of the buffer slice that's specified by offset/length

  if (offset !== 0 || length !== buffer.length) {
    buffer = buffer.slice(offset, length);
  } // TODO: Support use of position argument. I assume we'd need a way to add a method to move to stream position somehow


  return tiFileStream.write(buffer.toTiBuffer());
}
/**
   * @callback writeStringCallback
   * @param {Error} err - Error if one occurred
   * @param {integer} written - bytes written
   * @param {string} string - original string being written
   */

/**
       * @param {integer} fd file descriptor
       * @param {string} string contents to write
       * @param {integer} [position] offset from the beginning of the file where this data should be written
       * @param {string} [encoding='utf8'] expected string encoding
       * @param {writeStringCallback} [callback] async callback
       */


function writeString(fd, string, position, encoding, callback) {
  callback = maybeCallback(callback || encoding || position); // position could be: number, function (callback)

  if (typeof position !== 'number') {
    position = null;
  } // encoding could be: function (callback) or string


  if (typeof encoding !== 'string') {
    encoding = 'utf8';
  }

  var tiFileStream = streamForDescriptor(fd);
  string += ''; // coerce to string

  var buffer = Buffer.from(string, encoding); // TODO: Support use of position argument. I assume we'd need a way to add a method to move to stream position somehow

  writeTiFileStream(tiFileStream, buffer, (err, bytesProcessed) => {
    if (err) {
      callback(err);
      return;
    }

    callback(null, bytesProcessed, string);
  });
}
/**
   * @param {integer} fd file descriptor
   * @param {string} string contents to write
   * @param {integer} [position] offset from the beginning of the file where this data should be written
   * @param {string} [encoding='utf8'] expected string encoding
   * @returns {integer} number of bytes written
   */


function writeStringSync(fd, string, position, encoding) {

  if (typeof encoding !== 'string') {
    encoding = 'utf8';
  }

  var tiFileStream = streamForDescriptor(fd);
  string += ''; // coerce to string

  var buffer = Buffer.from(string, encoding); // TODO: Support use of position argument. I assume we'd need a way to add a method to move to stream position somehow

  return tiFileStream.write(buffer.toTiBuffer());
}

/**
   * This file is used to hijack the standard require to allow for JS
   * implementations of "core" modules.
   *
   * You add a binding from the "core" module id to the under the hood JS
   * implementation. We then intercept require calls to handle requests for these modules
   * and lazily load the file.
   */

/**
       * Used by @function bindObjectToCoreModuleId
       * @type {map<string, object>}
       */
var bindings = new Map();
/**
                           * Used by @function redirectCoreModuleIdToPath
                           * @type {map<string, string>}
                           */

var redirects = new Map();
/**
                            * Does the request look like a typical core module? (no '.' or '/' characters)
                            * @param {string} path original require path/id
                            * @returns {boolean}
                            */

function isHijackableModuleId(path) {
  if (!path || path.length < 1) {
    return false;
  }

  var firstChar = path.charAt(0);
  return firstChar !== '.' && firstChar !== '/';
} // Hack require to point to this as a core module "binding"


var originalRequire = global.require; // This works for iOS as-is, and also intercepts the call on Android for ti.main.js (the first file executed)

global.require = function (moduleId) {
  if (bindings.has(moduleId)) {
    return bindings.get(moduleId);
  }

  if (redirects.has(moduleId)) {
    moduleId = redirects.get(moduleId);
  }

  return originalRequire(moduleId);
};

if (Ti.Platform.name === 'android') {
  // ... but we still need to hack it when requiring from other files for Android
  var originalModuleRequire = global.Module.prototype.require;

  global.Module.prototype.require = function (path, context) {
    if (bindings.has(path)) {
      return bindings.get(path);
    }

    if (redirects.has(path)) {
      path = redirects.get(path);
    }

    return originalModuleRequire.call(this, path, context);
  };
}
/**
   * Registers a binding from a short module id to an already loaded/constructed object/value to export for that core module id
   *
   * @param {string} moduleId the module id to "hijack"
   * @param {*} binding an already constructured value/object to return
   */


function register(moduleId, binding) {
  if (!isHijackableModuleId(moduleId)) {
    throw new Error("Cannot register for relative/absolute file paths; no leading '.' or '/' allowed (was given ".concat(moduleId, ")"));
  }

  if (redirects.has(moduleId)) {
    Ti.API.warn("Another binding has already registered for module id: '".concat(moduleId, "', it will be overwritten..."));
    redirects.delete(moduleId);
  } else if (bindings.has(moduleId)) {
    Ti.API.warn("Another binding has already registered for module id: '".concat(moduleId, "', it will be overwritten..."));
  }

  bindings.set(moduleId, binding);
}
/**
   * Registers a binding from a short module id to the full under the hood filepath if given a string.
   * This allows for lazy instantiation of the module on-demand
   *
   * @param {string} moduleId the module id to "hijack"
   * @param {string} filepath the full filepath to require under the hood.
   *                              This should be an already resolved absolute path,
   *                              as otherwise the context of the call could change what gets loaded!
   */

function redirect(moduleId, filepath) {
  if (!isHijackableModuleId(moduleId)) {
    throw new Error("Cannot register for relative/absolute file paths; no leading '.' or '/' allowed (was given ".concat(moduleId, ")"));
  }

  if (bindings.has(moduleId)) {
    Ti.API.warn("Another binding has already registered for module id: '".concat(moduleId, "', it will be overwritten..."));
    bindings.delete(moduleId);
  } else if (redirects.has(moduleId)) {
    Ti.API.warn("Another binding has already registered for module id: '".concat(moduleId, "', it will be overwritten..."));
  }

  redirects.set(moduleId, filepath);
}
var binding = {
  register,
  redirect };

global.binding = binding;

// Load all the node compatible core modules
register('path', path$1);
register('os', OS);
register('tty', tty);
register('util', util);
register('assert', assert$1);
register('events', EventEmitter);
register('buffer', BufferModule);
register('string_decoder', StringDecoder$1);
register('fs', fs); // Register require('buffer').Buffer as global

global.Buffer = BufferModule.Buffer;

/**
                                      * Appcelerator Titanium Mobile
                                      * Copyright (c) 2018 by Axway, Inc. All Rights Reserved.
                                      * Licensed under the terms of the Apache Public License
                                      * Please see the LICENSE included with this distribution for details.
                                      *
                                      * Description:
                                      * This script loads all JavaScript files ending with the name "*.bootstrap.js" and then executes them.
                                      * The main intention of this feature is to allow JavaScript files to kick-off functionality or
                                      * display UI to the end-user before the "app.js" gets loaded. This feature is the CommonJS
                                      * equivalent to Titanium's Android module onAppCreate() or iOS module load() features.
                                      *
                                      * Use-Cases:
                                      * - Automatically kick-off analytics functionality on app startup.
                                      * - Ensure "Google Play Services" is installed/updated on app startup on Android.
                                      */

/**
                                          * Attempts to load all bootstraps from a "bootstrap.json" file created by the app build system.
                                          * This is an optional feature and is the fastest method of acquiring boostraps configured for the app.
                                          * This JSON file, if provided, must be in the same directory as this script.
                                          * @returns {string[]}
                                          * Returns an array of require() compatible strings if bootstraps were successfully loaded from JSON.
                                          * Returns an empty array if JSON file was found, but no bootstraps were configured for the app.
                                          * Returns null if JSON file was not found.
                                          */
function fetchScriptsFromJson() {
  var JSON_FILE_NAME = 'bootstrap.json';

  try {
    var jsonFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "ti.internal/".concat(JSON_FILE_NAME));

    if (jsonFile.exists()) {
      var settings = JSON.parse(jsonFile.read().text);

      if (Array.isArray(settings.scripts)) {
        return settings.scripts;
      }

      return [];
    }
  } catch (error) {
    Ti.API.error("Failed to read \"".concat(JSON_FILE_NAME, "\". Reason: ").concat(error.message));
  }

  return null;
}
/**
   * Recursively searches the "Resources" directory for all "*.bootstrap.js" files.
   * @returns {Array.<string>}
   * Returns an array of require() compatible strings for each bootstrap found in the search.
   * Returns an empty array if no bootstrap files were found.
   */


function fetchScriptsFromResourcesDirectory() {
  var resourceDirectory = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory);
  var resourceDirectoryPathLength = resourceDirectory.nativePath.length;
  var bootstrapScripts = [];

  function loadFrom(file) {
    if (file) {
      if (file.isDirectory()) {
        // This is a directory. Recursively look for bootstrap files under it.
        var fileNameArray = file.getDirectoryListing();

        if (fileNameArray) {
          for (var index = 0; index < fileNameArray.length; index++) {
            loadFrom(Ti.Filesystem.getFile(file.nativePath, fileNameArray[index]));
          }
        }
      } else if (file.name.search(/.bootstrap.js$/) >= 0) {
        // This is a bootstrap file.
        // Convert its path to something loadable via require() and add it to the array.
        var bootstrapPath = file.nativePath;
        bootstrapPath = bootstrapPath.substr(resourceDirectoryPathLength, bootstrapPath.length - resourceDirectoryPathLength - '.js'.length);
        bootstrapScripts.push(bootstrapPath);
      }
    }
  }

  loadFrom(resourceDirectory);
  return bootstrapScripts;
}
/**
   * Non-blocking function which loads and executes all bootstrap scripts configured for the app.
   * @param {function} finished Callback to be invoked once all bootstraps have finished executing. Cannot be null.
   */


function loadAsync(finished) {
  // Acquire an array of all bootstrap scripts included with the app.
  // - For best performance, attempt to fetch scripts via an optional JSON file created by the build system.
  // - If JSON file not found (will return null), then search "Resources" directory for bootstrap files.
  var bootstrapScripts = fetchScriptsFromJson();

  if (!bootstrapScripts) {
    bootstrapScripts = fetchScriptsFromResourcesDirectory();
  } // Do not continue if no bootstraps were found.


  if (!bootstrapScripts || bootstrapScripts.length <= 0) {
    finished();
    return;
  } // Sort the bootstraps so that they'll be loaded in a consistent order between platforms.


  bootstrapScripts.sort(); // Loads all bootstrap scripts found.

  function loadBootstrapScripts(finished) {
    var bootstrapIndex = 0;

    function doLoad() {
      // Attempt to load all bootstrap scripts.
      while (bootstrapIndex < bootstrapScripts.length) {
        // Load the next bootstrap.
        var fileName = bootstrapScripts[bootstrapIndex];

        var bootstrap = require(fileName); // eslint-disable-line security/detect-non-literal-require
        // Invoke the bootstrap's execute() method if it has one. (This is optional.)
        // We must wait for the given callback to be invoked before loading the next script.
        // Note: This is expected to be used to display UI to the end-user.


        if (bootstrap.execute) {
          bootstrap.execute(onBootstrapExecutionFinished);
          return;
        } // We're done with the current bootstrap. Time to load the next one.


        bootstrapIndex++;
      } // Invoke given callback to inform caller that all loading is done.


      finished();
    }

    function onBootstrapExecutionFinished() {
      // Last bootstrap has finished execution. Time to load the next one.
      // Note: Add a tiny delay so whatever UI the last bootstrap loaded has time to close.
      bootstrapIndex++;
      setTimeout(() => doLoad(), 1);
    }

    doLoad();
  } // We've finished loading/executing all bootstrap scripts.
  // Inform caller by invoking the callback given to loadAsync().


  loadBootstrapScripts(finished);
}

/**
   * Appcelerator Titanium Mobile
   * Copyright (c) 2018 by Axway, Inc. All Rights Reserved.
   * Licensed under the terms of the Apache Public License
   * Please see the LICENSE included with this distribution for details.
   *
   * This script is loaded on app startup on all platforms. It is used to do the following:
   * - Provide consistent startup behavior between platforms, such as logging Titanium version.
   * - Load Titanium's core JavaScript extensions shared by all platforms.
   * - Provide "*.bootstrap.js" script support. (Similar to native module onAppCreate()/load() support.)
   * - Load the app developer's main "app.js" script after doing all of the above.
   */
// Log the app name, app version, and Titanium version on startup.
Ti.API.info("".concat(Ti.App.name, " ").concat(Ti.App.version, " (Powered by Titanium ").concat("9.1.0", ".").concat("b8e966d0c9", ")")); // Attempt to load crash analytics module.
// NOTE: This should be the first module that loads on startup.

try {
  require('com.appcelerator.aca');
} catch (e) {} // Could not load module, silently ignore exception.
loadAsync(function () {
  // We've finished loading/executing all bootstrap scripts.
  // We can now proceed to run the main "app.js" script.
  require('./app'); // This event is to be fired after "app.js" execution. Reasons:
  // - Allow system to queue startup related events until "app.js" has had a chance to add listeners.
  // - For Alloy apps, we now know that Alloy has been initialized and its globals were added.


  Ti.App.fireEvent('started');
});