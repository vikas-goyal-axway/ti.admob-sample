'use strict';

// Copyright Node.js contributors. All rights reserved.
const kNodeModulesRE = /^(.*)[\\/]node_modules[\\/]/;
const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');
const isBuffer = Symbol.for('titanium.buffer.isBuffer');
const colorRegExp = /\u001b\[\d\d?m/g; // eslint-disable-line no-control-regex

function removeColors(str) {
  return str.replace(colorRegExp, '');
}
function isError(e) {
  // An error could be an instance of Error while not being a native error
  // or could be from a different realm and not be instance of Error but still
  // be a native error.
  return isNativeError(e) || e instanceof Error;
}
let getStructuredStack;

class StackTraceError extends Error {}

StackTraceError.prepareStackTrace = (err, trace) => trace;

StackTraceError.stackTraceLimit = Infinity;
function isInsideNodeModules() {
  if (getStructuredStack === undefined) {
    getStructuredStack = () => new StackTraceError().stack;
  }

  let stack = getStructuredStack(); // stack is only an array on v8, try to convert manually if string

  if (typeof stack === 'string') {
    const stackFrames = [];
    const lines = stack.split(/\n/);

    for (const line of lines) {
      const lineInfo = line.match(/(.*)@(.*):(\d+):(\d+)/);

      if (lineInfo) {
        const filename = lineInfo[2].replace('file://', '');
        stackFrames.push({
          getFileName: () => filename });

      }
    }

    stack = stackFrames;
  } // Iterate over all stack frames and look for the first one not coming
  // from inside Node.js itself:


  if (Array.isArray(stack)) {
    for (const frame of stack) {
      const filename = frame.getFileName(); // If a filename does not start with / or contain \,
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
  let str = '';

  if (output.length !== 0) {
    const lastIndex = output.length - 1;

    for (let i = 0; i < lastIndex; i++) {
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
const ALL_PROPERTIES = 0;
const ONLY_ENUMERABLE = 2;
const propertyFilter = {
  ALL_PROPERTIES,
  ONLY_ENUMERABLE };

function getOwnNonIndexProperties(obj, filter) {
  const props = [];
  const keys = filter === ONLY_ENUMERABLE ? Object.keys(obj) : Object.getOwnPropertyNames(obj);

  for (var i = 0; i < keys.length; ++i) {
    const key = keys[i];

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
    const code = s.charCodeAt(i);

    if (code < 48 || code > 57) {
      return false;
    }
  }

  return true;
}

// Copyright Node.js contributors. All rights reserved.
const TypedArrayPrototype = Object.getPrototypeOf(Uint8Array.prototype);
const TypedArrayProto_toStringTag = uncurryThis(Object.getOwnPropertyDescriptor(TypedArrayPrototype, Symbol.toStringTag).get);

function checkPrototype(value, name) {
  if (typeof value !== 'object') {
    return false;
  }

  return Object.prototype.toString.call(value) === `[object ${name}]`;
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

const isArrayBufferView = ArrayBuffer.isView;
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

  const prototype = Object.getPrototypeOf(value);
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

  const prototype = Object.getPrototypeOf(value);
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
function isTypedArray(value) {
  const isBuiltInTypedArray = TypedArrayProto_toStringTag(value) !== undefined;

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
  isTypedArray: isTypedArray,
  isUint8Array: isUint8Array,
  isUint8ClampedArray: isUint8ClampedArray,
  isUint16Array: isUint16Array,
  isUint32Array: isUint32Array,
  isWeakMap: isWeakMap,
  isWeakSet: isWeakSet });


// Copyright Node.js contributors. All rights reserved.
let error;

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
    const ERR_INTERNAL_ASSERTION = lazyError();
    throw new ERR_INTERNAL_ASSERTION(message);
  }
}

function fail(message) {
  const ERR_INTERNAL_ASSERTION = lazyError();
  throw new ERR_INTERNAL_ASSERTION(message);
}

assert.fail = fail;

// Copyright Node.js contributors. All rights reserved.
const messages = new Map();
const codes = {}; // @todo implement this once needed

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
      const message = getMessage(key, args, this);
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
      return `${this.name} [${key}]: ${this.message}`;
    }};


}

function getMessage(key, args, self) {
  const msg = messages.get(key);
  /*
                                 // @fixme rollup cannot handle lazy loaded modules, maybe move to webpack?
                                 if (assert === undefined) {
                                 	assert = require('./internal/assert');
                                 }
                                 */

  if (typeof msg === 'function') {
    assert(msg.length <= args.length, // Default options do not count.
    `Code: ${key}; The provided arguments length (${args.length}) does not ` + `match the required ones (${msg.length}).`);
    return msg.apply(self, args);
  }

  const expectedLength = (msg.match(/%[dfijoOs]/g) || []).length;
  assert(expectedLength === args.length, `Code: ${key}; The provided arguments length (${args.length}) does not ` + `match the required ones (${expectedLength}).`);

  if (args.length === 0) {
    return msg;
  }

  args.unshift(msg);
  return format.apply(null, args); // @fixme rollup cannot handle lazy loaded modules, maybe move to webpack?
  // return lazyInternalUtilInspect().format.apply(null, args);
}

function addCodeToName(err, name, code) {
  // Add the error code to the name to include it in the stack trace.
  err.name = `${name} [${code}]`; // Access the stack to generate the error message including the error code
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
  const suffix = 'This is caused by either a bug in Titanium ' + 'or incorrect usage of Titanium internals.\n' + 'Please open an issue with this stack trace at ' + 'https://jira.appcelerator.org\n';
  return message === undefined ? suffix : `${message}\n${suffix}`;
}, Error);
E('ERR_INVALID_ARG_TYPE', (name, expected, actual) => {
  assert(typeof name === 'string', '\'name\' must be a string'); // determiner: 'must be' or 'must not be'

  let determiner;

  if (typeof expected === 'string' && expected.startsWith('not ')) {
    determiner = 'must not be';
    expected = expected.replace(/^not /, '');
  } else {
    determiner = 'must be';
  }

  let msg;

  if (name.endsWith(' argument')) {
    // For cases like 'first argument'
    msg = `The ${name} ${determiner} ${oneOf(expected, 'type')}`;
  } else {
    const type = name.includes('.') ? 'property' : 'argument';
    msg = `The "${name}" ${type} ${determiner} ${oneOf(expected, 'type')}`;
  } // TODO(BridgeAR): Improve the output by showing `null` and similar.


  msg += `. Received type ${typeof actual}`;
  return msg;
}, TypeError);
let maxStack_ErrorName;
let maxStack_ErrorMessage;
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
    const len = expected.length;
    assert(len > 0, 'At least one expected value needs to be specified');
    expected = expected.map(i => String(i));

    if (len > 2) {
      return `one of ${thing} ${expected.slice(0, len - 1).join(', ')}, or ` + expected[len - 1];
    } else if (len === 2) {
      return `one of ${thing} ${expected[0]} or ${expected[1]}`;
    } else {
      return `of ${thing} ${expected[0]}`;
    }
  } else {
    return `of ${thing} ${String(expected)}`;
  }
}

/**
   * This implementation of Buffer uses a Ti.Buffer internally to back it.
   * This is likley an order of magnitude slower than using a variant that extends Uint8Array!
   * I think if we're not already wrapping a Ti.Buffer, it may be better to have two implementations
   * and, like browserify, just extend Uint8Array for any Buffers we need to read/write a lot
   * and then add a simple conversion method to turn it into a Ti.Buffer when needed.
   *
   * The Ti.Buffer impl has to go through the binding layer for reading/writing every byte.
   * If we anticipate the Buffer staying on the JS side, I'm willing to bet that the Uint8Array
   * the JS engine provides would be *way* faster.
   *
   * Also note that both Ti.Buffer and Node's Buffer were created before the JS engines had typed arrays
   * (and Uint8Array in particular) as a means of encapsulating a byte array. We should consider accepting
   * a Uint8Array in any of our APIs that take a Ti.Buffer and eventually deprecating/removing Ti.Buffer.
   */
const {
  ALL_PROPERTIES: ALL_PROPERTIES$1,
  ONLY_ENUMERABLE: ONLY_ENUMERABLE$1 } =
propertyFilter; // https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings

const TI_CODEC_MAP = new Map();
TI_CODEC_MAP.set('utf-8', Ti.Codec.CHARSET_UTF8);
TI_CODEC_MAP.set('utf8', Ti.Codec.CHARSET_UTF8);
TI_CODEC_MAP.set('utf-16le', Ti.Codec.CHARSET_UTF16LE);
TI_CODEC_MAP.set('utf16le', Ti.Codec.CHARSET_UTF16LE);
TI_CODEC_MAP.set('ucs2', Ti.Codec.CHARSET_UTF16LE);
TI_CODEC_MAP.set('ucs-2', Ti.Codec.CHARSET_UTF16LE);
TI_CODEC_MAP.set('latin1', Ti.Codec.CHARSET_ISO_LATIN_1);
TI_CODEC_MAP.set('binary', Ti.Codec.CHARSET_ISO_LATIN_1);
TI_CODEC_MAP.set('ascii', Ti.Codec.CHARSET_ASCII); // We have no equivalents of base64 or hex, so we convert them internally here

const VALID_ENCODINGS = ['hex', 'utf8', 'utf-8', 'ascii', 'latin1', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le']; // Used to cheat for read/writes of doubles

const doubleArray = new Float64Array(1);
const uint8DoubleArray = new Uint8Array(doubleArray.buffer); // Used to cheat to read/write floats

const floatArray = new Float32Array(1);
const uint8FloatArray = new Uint8Array(floatArray.buffer);
let INSPECT_MAX_BYTES = 50;

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
          throw new TypeError(`The "string" argument must be of type "string". Received type ${typeof arg}`);
        }

        return Buffer$1.alloc(arg);
      }

      return Buffer$1.from(arg, encodingOrOffset, length);
    }

    const tiBuffer = arg;
    let start = encodingOrOffset;

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
      throw new TypeError(`The "target" argument must be one of type Buffer or Uint8Array. Received type ${typeof buf1}`);
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


    const source = this.slice(sourceStart, sourceEnd);
    const sourceLength = source.length;
    const dest = target.slice(targetStart, targetEnd);
    const destLength = dest.length;
    const length = Math.min(sourceLength, destLength);

    for (let i = 0; i < length; i++) {
      const targetValue = getAdjustedIndex(dest, i);
      const sourceValue = getAdjustedIndex(source, i);

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


    let length = sourceEnd - sourceStart; // Cap length to remaining bytes in target!

    const remaining = target.length - targetStart;

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
    const buffer = this;
    let nextIndex = 0;
    const end = this.length;
    const entryIterator = {
      next: function () {
        if (nextIndex < end) {
          const result = {
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
    const offsetType = typeof offset;

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

    const valueType = typeof value;

    if (valueType === 'string') {
      const bufToFillWith = Buffer$1.from(value, encoding);
      const fillBufLength = bufToFillWith.length;

      if (fillBufLength === 0) {
        throw new Error('no valid fill data');
      } // If the buffer length === 1, we can just do this._tiBuffer.fill(value, offset, end);


      if (fillBufLength === 1) {
        this._tiBuffer.fill(bufToFillWith._tiBuffer[0], offset, end);

        return this;
      } // multiple byte fill!


      const length = end - offset;

      for (let i = 0; i < length; i++) {
        // TODO: Do we need to account for byteOffset here (on `this`, not on the buffer we just created)?
        const fillChar = bufToFillWith._tiBuffer[i % fillBufLength];
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

      return indexOf(this, value, byteOffset);
    } // coerce a string to a Buffer


    if (typeof value === 'string') {
      value = Buffer$1.from(value, encoding);
    } // value is now a Buffer...


    const matchLength = value.length;

    if (matchLength === 0) {
      return -1; // never find empty value!
    }

    if (matchLength === 1) {
      // simple case, match one byte!
      return indexOf(this, value[0], byteOffset);
    }

    let currentIndex = byteOffset;
    const thisLength = this.length;

    if (matchLength > thisLength) {
      return -1; // can't match if the value is longer than this Buffer!
    } // FIXME: Can we rewrite this in a less funky way?
    // FIXME: Can stop earlier based on matchLength!


    firstMatch: while (currentIndex < thisLength) {
      // eslint-disable-line no-labels
      // match first byte!
      let firstByteMatch = indexOf(this, value[0], currentIndex);

      if (firstByteMatch === -1) {
        // couldn't even match the very first byte, so no match overall!
        return -1;
      } // ok, we found the first byte, now we need to see if the next consecutive bytes match!


      for (let x = 1; x < matchLength; x++) {
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
    let nextIndex = 0;
    const end = this.length;
    const myIterator = {
      next: function () {
        if (nextIndex < end) {
          const result = {
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
    const unsignedValue = this.readUInt8(offset);
    return unsignedToSigned(unsignedValue, 1);
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 2.
     * @returns {integer}
     */


  readInt16BE(offset) {
    const unsignedValue = this.readUInt16BE(offset);
    return unsignedToSigned(unsignedValue, 2);
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 2.
     * @returns {integer}
     */


  readInt16LE(offset = 0) {
    const unsignedValue = this.readUInt16LE(offset);
    return unsignedToSigned(unsignedValue, 2);
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 4.
     * @returns {integer}
     */


  readInt32BE(offset = 0) {
    const unsignedValue = this.readUInt32BE(offset);
    return unsignedToSigned(unsignedValue, 4);
  }
  /**
     * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 4.
     * @returns {integer}
     */


  readInt32LE(offset = 0) {
    const unsignedValue = this.readUInt32LE(offset);
    return unsignedToSigned(unsignedValue, 4);
  }
  /**
     * Reads byteLength number of bytes from buf at the specified offset and interprets the result as a two's complement signed value. Supports up to 48 bits of accuracy.
     * @param {integer} offset Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - byteLength.
     * @param {integer} byteLength umber of bytes to read. Must satisfy 0 < byteLength <= 6.
     * @returns {integer}
     */


  readIntBE(offset, byteLength) {
    const unsignedValue = this.readUIntBE(offset, byteLength);
    return unsignedToSigned(unsignedValue, byteLength);
  }
  /**
     * Reads byteLength number of bytes from buf at the specified offset and interprets the result as a two's complement signed value. Supports up to 48 bits of accuracy.
     * @param {integer} offset Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - byteLength.
     * @param {integer} byteLength umber of bytes to read. Must satisfy 0 < byteLength <= 6.
     * @returns {integer}
     */


  readIntLE(offset, byteLength) {
    const unsignedValue = this.readUIntLE(offset, byteLength);
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
    let result = 0;
    let multiplier = 1; // we use a multipler for each byte
    // we're doing the same loop as #readUIntLE, just backwards!

    for (let i = byteLength - 1; i >= 0; i--) {
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
    let result = 0;
    let multiplier = 1; // we use a multipler for each byte

    for (let i = 0; i < byteLength; i++) {
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
    const thisLength = this.length;

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


    let length = end - start;

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
    const length = this.length;

    if (length % 2 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 16-bits');
    }

    for (let i = 0; i < length; i += 2) {
      const first = getAdjustedIndex(this, i);
      const second = getAdjustedIndex(this, i + 1);
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
    const length = this.length;

    if (length % 4 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 32-bits');
    }

    for (let i = 0; i < length; i += 4) {
      const first = getAdjustedIndex(this, i);
      const second = getAdjustedIndex(this, i + 1);
      const third = getAdjustedIndex(this, i + 2);
      const fourth = getAdjustedIndex(this, i + 3);
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
    const length = this.length;

    if (length % 8 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 64-bits');
    }

    for (let i = 0; i < length; i += 8) {
      const first = getAdjustedIndex(this, i);
      const second = getAdjustedIndex(this, i + 1);
      const third = getAdjustedIndex(this, i + 2);
      const fourth = getAdjustedIndex(this, i + 3);
      const fifth = getAdjustedIndex(this, i + 4);
      const sixth = getAdjustedIndex(this, i + 5);
      const seventh = getAdjustedIndex(this, i + 6);
      const eighth = getAdjustedIndex(this, i + 7);
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

    const length = this.length;

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
        throw new TypeError(`Unknown encoding: ${encoding}`);
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
      let blob; // if this is the original underlying buffer just return it's toString() value

      if (this.byteOffset === 0 && this.length === this._tiBuffer.length) {
        blob = Ti.Utils.base64encode(this._tiBuffer.toBlob());
      } else {
        // if we're offset or cropping in any way, clone the range and return that buffer's toString()
        blob = Ti.Utils.base64encode(this._tiBuffer.clone(this.byteOffset, this.length).toBlob());
      }

      return blob.toString();
    }

    if (encoding === 'hex') {
      let hexStr = '';

      for (let i = 0; i < length; i++) {
        // each one is a "byte"
        let hex = (getAdjustedIndex(this, i) & 0xff).toString(16);
        hex = hex.length === 1 ? '0' + hex : hex;
        hexStr += hex;
      }

      return hexStr;
    }

    if (encoding === 'latin1' || encoding === 'binary') {
      let latin1String = '';

      for (let i = 0; i < length; i++) {
        // each one is a "byte"
        latin1String += String.fromCharCode(getAdjustedIndex(this, i));
      }

      return latin1String;
    }

    if (encoding === 'ascii') {
      let ascii = '';

      for (let i = 0; i < length; i++) {
        // we store bytes (8-bit), but ascii is 7-bit. Node "masks" the last bit off, so let's do the same
        ascii += String.fromCharCode(getAdjustedIndex(this, i) & 0x7F);
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
    const buffer = this;
    let nextIndex = 0;
    const end = this.length;
    const myIterator = {
      next: function () {
        if (nextIndex < end) {
          const result = {
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
      const remaining = this.length - offset;

      if (length > remaining) {
        length = remaining;
      }
    }

    encoding = encoding || 'utf8'; // so we need to convert `remaining` bytes of our string into a byte array/buffer

    const src = Buffer$1.from(string, encoding); // FIXME: Can we let it know to only convert `remaining` bytes?
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
    const minMaxBase = Math.pow(2, 8 * byteLength - 1);
    checkValue(value, -minMaxBase, minMaxBase - 1);

    if (value < 0) {
      value = minMaxBase * 2 + value;
    }

    let multiplier = 1;

    for (let i = byteLength - 1; i >= 0; i--) {
      let byteValue = value / multiplier & 0xFF;
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
    const minMaxBase = Math.pow(2, 8 * byteLength - 1);
    checkValue(value, -minMaxBase, minMaxBase - 1);

    if (value < 0) {
      value = minMaxBase * 2 + value;
    }

    let multiplier = 1;

    for (let i = 0; i < byteLength; i++) {
      let byteValue = value / multiplier & 0xFF;
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
    let multiplier = 1;

    for (let i = byteLength - 1; i >= 0; i--) {
      let byteValue = value / multiplier & 0xFF;
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
    let multiplier = 1;

    for (let i = 0; i < byteLength; i++) {
      let byteValue = value / multiplier & 0xFF;
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
    const buf = Buffer$1.allocUnsafe(length);
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

    let length = string.length;

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
      throw new TypeError(`The "buf1" argument must be one of type Buffer or Uint8Array. Received type ${typeof buf1}`);
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

      for (let i = 0; i < list.length; i++) {
        totalLength += list[i].length;
      }
    }

    const result = Buffer$1.allocUnsafe(totalLength);
    let position = 0;

    for (let i = 0; i < list.length; i++) {
      const buf = list[i];
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
    const valueType = typeof value;

    if (valueType === 'string') {
      if (!Buffer$1.isEncoding(encoding)) {
        throw new TypeError(`Unknown encoding: ${encoding}`);
      }

      encoding = encoding.toLowerCase();

      if (encoding === 'base64') {
        const blob = Ti.Utils.base64decode(value);
        const blobStream = Ti.Stream.createStream({
          source: blob,
          mode: Ti.Stream.MODE_READ });

        const buffer = Ti.Stream.readAll(blobStream);
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
        const length = value.length;
        const buffer = Buffer$1.allocUnsafe(length);

        if (length === 0) {
          return buffer;
        }

        value.copy(buffer, 0, 0, length);
        return buffer;
      }

      if (Array.isArray(value) || value instanceof Uint8Array) {
        const length = value.length;

        if (length === 0) {
          return Buffer$1.allocUnsafe(0);
        }

        const tiBuffer = Ti.createBuffer({
          length });


        for (let i = 0; i < length; i++) {
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
    const max = INSPECT_MAX_BYTES;
    const actualMax = Math.min(max, this.length);
    const remaining = this.length - max;
    let str = this.slice(0, actualMax).toString('hex').replace(/(.{2})/g, '$1 ').trim();

    if (remaining > 0) {
      str += ` ... ${remaining} more byte${remaining > 1 ? 's' : ''}`;
    } // Inspect special properties as well, if possible.


    if (ctx) {
      let extras = false;
      const filter = ctx.showHidden ? ALL_PROPERTIES$1 : ONLY_ENUMERABLE$1;
      const obj = getOwnNonIndexProperties(this, filter).reduce((obj, key) => {
        extras = true;
        obj[key] = this[key];
        return obj;
      }, Object.create(null));

      if (extras) {
        if (this.length !== 0) {
          str += ', ';
        } // '[Object: null prototype] {'.length === 26
        // This is guarded with a test.


        str += inspect(obj, { ...ctx,
          breakLength: Infinity,
          compact: true }).
        slice(27, -2);
      }
    }

    return `<${this.constructor.name} ${str}>`;
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

function indexOf(buffer, singleByte, offset) {
  const length = buffer.length;

  for (let i = offset; i < length; i++) {
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
  const bitLength = byteLength * 8;
  const maxPositiveValue = Math.pow(2, bitLength - 1);

  if (unsignedValue < maxPositiveValue) {
    return unsignedValue;
  }

  const maxUnsignedValue = Math.pow(2, bitLength);
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
  const srcLength = src.length;
  const destLength = dest.length;
  let i = 0;

  for (; i < length; i++) {
    const destIndex = i + offset; // are we trying to write past end of destination? Or read past end of source? Stop!

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
  const buf = Ti.createBuffer({
    value: string,
    type: Ti.Codec.CHARSET_UTF8 });

  const length = buf.length;
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
  let out = '';
  let i = start;

  while (i < length) {
    // utf-16/ucs-2 is 2-bytes per character
    const byte1 = tiBuffer[i++];
    const byte2 = tiBuffer[i++];
    const code_unit = (byte2 << 8) + byte1; // we mash together the two bytes

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
  const length = value.length / 2;
  const byteArray = [];

  for (let i = 0; i < length; i++) {
    const numericValue = parseInt(value.substr(i * 2, 2), 16);

    if (!Number.isNaN(numericValue)) {
      // drop bad hex characters
      byteArray.push(numericValue);
    }
  }

  return byteArray;
} // Use a Proxy to hack array style index accessors


const arrayIndexHandler = {
  get(target, propKey, receiver) {
    if (typeof propKey === 'string') {
      const num = Number(propKey);

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
      const num = Number(propKey);

      if (Number.isSafeInteger(num)) {
        return setAdjustedIndex(target, num, value);
      }
    }

    return Reflect.set(target, propKey, value, receiver);
  },

  has(target, key) {
    if (typeof key === 'string') {
      const num = Number(key);

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
  const endOffset = buffer.length - byteLength;

  if (offset < 0 || offset > endOffset) {
    throw new RangeError(`The value of "offset" is out of range. It must be >= 0 and <= ${endOffset}. Received ${offset}`);
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
    throw new RangeError(`The value of "value" is out of range. It must be >= ${min} and <= ${max}. Received ${value}`);
  }
}

let bufferWarningAlreadyEmitted = false;
let nodeModulesCheckCounter = 0;
const bufferWarning = 'Buffer() is deprecated due to security and usability ' + 'issues. Please use the Buffer.alloc(), ' + 'Buffer.allocUnsafe(), or Buffer.from() methods instead.';

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

// Copyright Node.js contributors. All rights reserved.
const {
  ALL_PROPERTIES: ALL_PROPERTIES$2,
  ONLY_ENUMERABLE: ONLY_ENUMERABLE$2 } =
propertyFilter;
const BooleanPrototype = Boolean.prototype;
const DatePrototype = Date.prototype;
const ErrorPrototype = Error.prototype;
const NumberPrototype = Number.prototype;
const MapPrototype = Map.prototype;
const RegExpPrototype = RegExp.prototype;
const StringPrototype = String.prototype;
const SetPrototype = Set.prototype;
const SymbolPrototype = Symbol.prototype;
const isIos = ['ipad', 'iphone'].includes("android");
const {
  ERR_INVALID_ARG_TYPE } =
codes;
const hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
const propertyIsEnumerable = uncurryThis(Object.prototype.propertyIsEnumerable);
let hexSlice = uncurryThis(BufferModule.Buffer.prototype.hexSlice);
const builtInObjects = new Set(Object.getOwnPropertyNames(global).filter(e => /^([A-Z][a-z]+)+$/.test(e)));
const inspectDefaultOptions = Object.seal({
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

const kObjectType = 0;
const kArrayType = 1;
const kArrayExtrasType = 2;
/* eslint-disable no-control-regex */

const strEscapeSequencesRegExp = /[\x00-\x1f\x27\x5c]/;
const strEscapeSequencesReplacer = /[\x00-\x1f\x27\x5c]/g;
const strEscapeSequencesRegExpSingle = /[\x00-\x1f\x5c]/;
const strEscapeSequencesReplacerSingle = /[\x00-\x1f\x5c]/g;
/* eslint-enable no-control-regex */

const keyStrRegExp = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
const numberRegExp = /^(0|[1-9][0-9]*)$/;
const nodeModulesRegExp = /[/\\]node_modules[/\\](.+?)(?=[/\\])/g;
const kMinLineLength = 16; // Constants to map the iterator state.

const kWeak = 0;
const kIterator = 1;
const kMapEntries = 2; // Escaped special characters. Use empty strings to fill up unused entries.

/* eslint-disable quotes */

const meta = ['\\u0000', '\\u0001', '\\u0002', '\\u0003', '\\u0004', '\\u0005', '\\u0006', '\\u0007', '\\b', '\\t', '\\n', '\\u000b', '\\f', '\\r', '\\u000e', '\\u000f', '\\u0010', '\\u0011', '\\u0012', '\\u0013', '\\u0014', '\\u0015', '\\u0016', '\\u0017', '\\u0018', '\\u0019', '\\u001a', '\\u001b', '\\u001c', '\\u001d', '\\u001e', '\\u001f', '', '', '', '', '', '', '', "\\'", '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '\\\\'];
/* eslint-enable quotes */

function getUserOptions(ctx) {
  const obj = {
    stylize: ctx.stylize };


  for (const key of Object.keys(inspectDefaultOptions)) {
    obj[key] = ctx[key];
  }

  if (ctx.userOptions === undefined) {
    return obj;
  }

  return { ...obj,
    ...ctx.userOptions };

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
  const ctx = {
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
      const optKeys = Object.keys(opts);

      for (const key of optKeys) {
        // TODO(BridgeAR): Find a solution what to do about stylize. Either make
        // this function public or add a new API with a similar or better
        // functionality.
        if (hasOwnProperty(inspectDefaultOptions, key) || key === 'stylize') {
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
    return `"${str}"`;
  }

  if (quotes === -2) {
    return `\`${str}\``;
  }

  return `'${str}'`;
}

const escapeFn = str => meta[str.charCodeAt(0)]; // Escape control characters, single quotes and the backslash.
// This is similar to JSON stringify escaping.


function strEscape(str) {
  let escapeTest = strEscapeSequencesRegExp;
  let escapeReplace = strEscapeSequencesReplacer;
  let singleQuote = 39; // Check for double quotes. If not present, do not escape single quotes and
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

  let result = '';
  let last = 0;
  const lastIndex = str.length;

  for (let i = 0; i < lastIndex; i++) {
    const point = str.charCodeAt(i);

    if (point === singleQuote || point === 92 || point < 32) {
      if (last === i) {
        result += meta[point];
      } else {
        result += `${str.slice(last, i)}${meta[point]}`;
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
  const style = inspect.styles[styleType];

  if (style !== undefined) {
    const color = inspect.colors[style];
    return `\u001b[${color[0]}m${str}\u001b[${color[1]}m`;
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
  let firstProto; // const tmp = obj;

  while (obj) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, 'constructor');

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
      return `[${fallback}: null prototype] [${tag}] `;
    }

    return `[${fallback}: null prototype] `;
  }

  if (tag !== '' && constructor !== tag) {
    return `${constructor} [${tag}] `;
  }

  return `${constructor} `;
} // Look up the keys of the object.


function getKeys(value, showHidden) {
  let keys;
  const symbols = Object.getOwnPropertySymbols(value);

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
      keys.push(...symbols.filter(key => propertyIsEnumerable(value, key)));
    }
  }

  return keys;
}

function getCtxStyle(value, constructor, tag) {
  let fallback = '';

  if (constructor === null) {
    fallback = 'Object';
  }

  return getPrefix(constructor, tag, fallback);
}

function findTypedConstructor(value) {
  for (const [check, clazz] of [[isUint8Array, Uint8Array], [isUint8ClampedArray, Uint8ClampedArray], [isUint16Array, Uint16Array], [isUint32Array, Uint32Array], [isInt8Array, Int8Array], [isInt16Array, Int16Array], [isInt32Array, Int32Array], [isFloat32Array, Float32Array], [isFloat64Array, Float64Array]]) {
    if (check(value)) {
      return clazz;
    }
  }
}

let lazyNullPrototypeCache; // Creates a subclass and name
// the constructor as `${clazz} : null prototype`

function clazzWithNullPrototype(clazz, name) {
  if (lazyNullPrototypeCache === undefined) {
    lazyNullPrototypeCache = new Map();
  } else {
    const cachedClass = lazyNullPrototypeCache.get(clazz);

    if (cachedClass !== undefined) {
      return cachedClass;
    }
  }

  class NullPrototype extends clazz {
    get [Symbol.toStringTag]() {
      return '';
    }}



  Object.defineProperty(NullPrototype.prototype.constructor, 'name', {
    value: `[${name}: null prototype]` });

  lazyNullPrototypeCache.set(clazz, NullPrototype);
  return NullPrototype;
}

function noPrototypeIterator(ctx, value, recurseTimes) {
  let newVal;

  if (isSet(value)) {
    const clazz = clazzWithNullPrototype(Set, 'Set');
    newVal = new clazz(SetPrototype.values(value));
  } else if (isMap(value)) {
    const clazz = clazzWithNullPrototype(Map, 'Map');
    newVal = new clazz(MapPrototype.entries(value));
  } else if (Array.isArray(value)) {
    const clazz = clazzWithNullPrototype(Array, 'Array');
    newVal = new clazz(value.length);
  } else if (isTypedArray(value)) {
    const constructor = findTypedConstructor(value);
    const clazz = clazzWithNullPrototype(constructor, constructor.name);
    newVal = new clazz(value);
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


  const context = value;
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
    const maybeCustom = value[customInspectSymbol];

    if (typeof maybeCustom === 'function' // Filter out the util module, its inspect function is special.
    && maybeCustom !== inspect // Also filter out any prototype objects using the circular check.
    && !(value.constructor && value.constructor.prototype === value)) {
      // This makes sure the recurseTimes are reported as before while using
      // a counter internally.
      const depth = ctx.depth === null ? null : ctx.depth - recurseTimes;
      const ret = maybeCustom.call(context, depth, getUserOptions(ctx)); // If the custom inspection method returned `this`, don't go into
      // infinite recursion.

      if (ret !== context) {
        if (typeof ret !== 'string') {
          return formatValue(ctx, ret, recurseTimes);
        }

        return ret.replace(/\n/g, `\n${' '.repeat(ctx.indentationLvl)}`);
      }
    }
  } // Using an array here is actually better for the average case than using
  // a Set. `seen` will only check for the depth and will never grow too large.


  if (ctx.seen.includes(value)) {
    let index = 1;

    if (ctx.circular === undefined) {
      ctx.circular = new Map([[value, index]]);
    } else {
      index = ctx.circular.get(value);

      if (index === undefined) {
        index = ctx.circular.size + 1;
        ctx.circular.set(value, index);
      }
    }

    return ctx.stylize(`[Circular *${index}]`, 'special');
  }

  return formatRaw(ctx, value, recurseTimes, typedArray);
}

function formatRaw(ctx, value, recurseTimes, typedArray) {
  let keys;
  const constructor = getConstructorName(value);
  let tag = value[Symbol.toStringTag]; // Only list the tag in case it's non-enumerable / not an own property.
  // Otherwise we'd print this twice.

  if (typeof tag !== 'string' || tag !== '' && (ctx.showHidden ? hasOwnProperty : propertyIsEnumerable)(value, Symbol.toStringTag)) {
    tag = '';
  }

  let base = '';
  let formatter = getEmptyFormatArray;
  let braces;
  let noIterator = true;
  let i = 0;
  const filter = ctx.showHidden ? ALL_PROPERTIES$2 : ONLY_ENUMERABLE$2;
  let extrasType = kObjectType; // Iterators and the rest are split to reduce checks.

  if (value[Symbol.iterator]) {
    noIterator = false;

    if (Array.isArray(value)) {
      keys = getOwnNonIndexProperties(value, filter); // Only set the constructor for non ordinary ("Array [...]") arrays.

      const prefix = getPrefix(constructor, tag, 'Array');
      braces = [`${prefix === 'Array ' ? '' : prefix}[`, ']'];

      if (value.length === 0 && keys.length === 0) {
        return `${braces[0]}]`;
      }

      extrasType = kArrayExtrasType;
      formatter = formatArray;
    } else if (isSet(value)) {
      keys = getKeys(value, ctx.showHidden);
      const prefix = getPrefix(constructor, tag, 'Set');

      if (value.size === 0 && keys.length === 0) {
        return `${prefix}{}`;
      }

      braces = [`${prefix}{`, '}'];
      formatter = formatSet;
    } else if (isMap(value)) {
      keys = getKeys(value, ctx.showHidden);
      const prefix = getPrefix(constructor, tag, 'Map');

      if (value.size === 0 && keys.length === 0) {
        return `${prefix}{}`;
      }

      braces = [`${prefix}{`, '}'];
      formatter = formatMap;
    } else if (isTypedArray(value)) {
      keys = getOwnNonIndexProperties(value, filter);
      const prefix = constructor !== null ? getPrefix(constructor, tag) : getPrefix(constructor, tag, findTypedConstructor(value).name);
      braces = [`${prefix}[`, ']'];

      if (value.length === 0 && keys.length === 0 && !ctx.showHidden) {
        return `${braces[0]}]`;
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
        braces[0] = `${getPrefix(constructor, tag, 'Object')}{`;
      }

      if (keys.length === 0) {
        return `${braces[0]}}`;
      }
    } else if (typeof value === 'function') {
      base = getFunctionBase(value, constructor, tag);

      if (keys.length === 0) {
        return ctx.stylize(base, 'special');
      }
    } else if (isRegExp(value)) {
      // Make RegExps say that they are RegExps
      // eslint-disable-next-line security/detect-non-literal-regexp
      const regExp = constructor !== null ? value : new RegExp(value);
      base = RegExpPrototype.toString.call(regExp);
      const prefix = getPrefix(constructor, tag, 'RegExp');

      if (prefix !== 'RegExp ') {
        base = `${prefix}${base}`;
      }

      if (keys.length === 0 || recurseTimes > ctx.depth && ctx.depth !== null) {
        return ctx.stylize(base, 'regexp');
      }
    } else if (isDate(value)) {
      // Make dates with properties first say the date
      base = Number.isNaN(DatePrototype.getTime.call(value)) ? DatePrototype.toString.call(value) : DatePrototype.toISOString.call(value);
      const prefix = getPrefix(constructor, tag, 'Date');

      if (prefix !== 'Date ') {
        base = `${prefix}${base}`;
      }

      if (keys.length === 0) {
        return ctx.stylize(base, 'date');
      }
    } else if (isError(value)) {
      base = formatError(value, constructor, tag, ctx);

      if (keys.length === 0) {
        return base;
      } else if (isIos) {
        const nativeErrorProps = ['line', 'column', 'sourceURL'];

        if (keys.every(key => nativeErrorProps.includes(key))) {
          return base;
        }
      }
    } else if (isAnyArrayBuffer(value)) {
      // Fast path for ArrayBuffer and SharedArrayBuffer.
      // Can't do the same for DataView because it has a non-primitive
      // .buffer property that we need to recurse for.
      const arrayType = isArrayBuffer(value) ? 'ArrayBuffer' : 'SharedArrayBuffer';
      const prefix = getPrefix(constructor, tag, arrayType);

      if (typedArray === undefined) {
        formatter = formatArrayBuffer;
      } else if (keys.length === 0) {
        return `${prefix}{ byteLength: ${formatNumber(ctx.stylize, value.byteLength)} }`;
      }

      braces[0] = `${prefix}{`;
      keys.unshift('byteLength');
    } else if (isDataView(value)) {
      braces[0] = `${getPrefix(constructor, tag, 'DataView')}{`; // .buffer goes last, it's not a primitive like the others.

      keys.unshift('byteLength', 'byteOffset', 'buffer');
    } else if (isPromise(value)) {
      braces[0] = `${getPrefix(constructor, tag, 'Promise')}{`;
      formatter = formatPromise;
    } else if (isWeakSet(value)) {
      braces[0] = `${getPrefix(constructor, tag, 'WeakSet')}{`;
      formatter = ctx.showHidden ? formatWeakSet : formatWeakCollection;
    } else if (isWeakMap(value)) {
      braces[0] = `${getPrefix(constructor, tag, 'WeakMap')}{`;
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
        const specialIterator = noPrototypeIterator(ctx, value, recurseTimes);

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
          return `${getCtxStyle(value, constructor, tag)}{}`;
        }

        braces[0] = `${getCtxStyle(value, constructor, tag)}{`;
      }
    }
  }

  if (recurseTimes > ctx.depth && ctx.depth !== null) {
    let constructorName = getCtxStyle(value, constructor, tag).slice(0, -1);

    if (constructor !== null) {
      constructorName = `[${constructorName}]`;
    }

    return ctx.stylize(constructorName, 'special');
  }

  recurseTimes += 1;
  ctx.seen.push(value);
  ctx.currentDepth = recurseTimes;
  let output;
  const indentationLvl = ctx.indentationLvl;

  try {
    output = formatter(ctx, value, recurseTimes, keys, braces);

    for (i = 0; i < keys.length; i++) {
      output.push(formatProperty(ctx, value, recurseTimes, keys[i], extrasType));
    }
  } catch (err) {
    const constructorName = getCtxStyle(value, constructor, tag).slice(0, -1);
    return handleMaxCallStackSize(ctx, err, constructorName, indentationLvl);
  }

  if (ctx.circular !== undefined) {
    const index = ctx.circular.get(value);

    if (index !== undefined) {
      const reference = ctx.stylize(`<ref *${index}>`, 'special'); // Add reference always to the very beginning of the output.

      if (ctx.compact !== true) {
        base = base === '' ? reference : `${reference} ${base}`;
      } else {
        braces[0] = `${reference} ${braces[0]}`;
      }
    }
  }

  ctx.seen.pop();

  if (ctx.sorted) {
    const comparator = ctx.sorted === true ? undefined : ctx.sorted;

    if (extrasType === kObjectType) {
      output = output.sort(comparator);
    } else if (keys.length > 1) {
      const sorted = output.slice(output.length - keys.length).sort(comparator);
      output.splice(output.length - keys.length, keys.length, ...sorted);
    }
  }

  const res = reduceToSingleString(ctx, output, base, braces, extrasType, recurseTimes, value);
  const budget = ctx.budget[ctx.indentationLvl] || 0;
  const newLength = budget + res.length;
  ctx.budget[ctx.indentationLvl] = newLength; // If any indentationLvl exceeds this limit, limit further inspecting to the
  // minimum. Otherwise the recursive algorithm might continue inspecting the
  // object even though the maximum string size (~2 ** 28 on 32 bit systems and
  // ~2 ** 30 on 64 bit systems) exceeded. The actual output is not limited at
  // exactly 2 ** 27 but a bit higher. This depends on the object shape.
  // This limit also makes sure that huge objects don't block the event loop
  // significantly.

  if (newLength > 2 ** 27) {
    ctx.depth = -1;
  }

  return res;
}

function getIteratorBraces(type, tag) {
  if (tag !== `${type} Iterator`) {
    if (tag !== '') {
      tag += '] [';
    }

    tag += `${type} Iterator`;
  }

  return [`[${tag}] {`, '}'];
}

function getBoxedBase(value, ctx, keys, constructor, tag) {
  let fn;
  let type;

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

  let base = `[${type}`;

  if (type !== constructor) {
    if (constructor === null) {
      base += ' (null prototype)';
    } else {
      base += ` (${constructor})`;
    }
  }

  base += `: ${formatPrimitive(stylizeNoColor, fn.valueOf(value), ctx)}]`;

  if (tag !== '' && tag !== constructor) {
    base += ` [${tag}]`;
  }

  if (keys.length !== 0 || ctx.stylize === stylizeNoColor) {
    return base;
  }

  return ctx.stylize(base, type.toLowerCase());
}

function getFunctionBase(value, constructor, tag) {
  let type = 'Function';

  if (isGeneratorFunction(value)) {
    type = `Generator${type}`;
  }

  if (isAsyncFunction(value)) {
    type = `Async${type}`;
  }

  let base = `[${type}`;

  if (constructor === null) {
    base += ' (null prototype)';
  }

  if (value.name === '') {
    base += ' (anonymous)';
  } else {
    base += `: ${value.name}`;
  }

  base += ']';

  if (constructor !== type && constructor !== null) {
    base += ` ${constructor}`;
  }

  if (tag !== '' && constructor !== tag) {
    base += ` [${tag}]`;
  }

  return base;
}

function formatError(err, constructor, tag, ctx) {
  let stack = err.stack || ErrorPrototype.toString.call(err); // try to normalize JavaScriptCore stack to match v8

  if (isIos) {
    const lines = stack.split('\n');
    stack = `${err.name}: ${err.message}`;

    if (lines.length > 0) {
      stack += lines.map(stackLine => {
        const atSymbolIndex = stackLine.indexOf('@');
        const source = stackLine.slice(atSymbolIndex + 1);
        const sourcePattern = /(.*):(\d+):(\d+)/;
        let symbolName = 'unknown';

        if (atSymbolIndex !== -1) {
          symbolName = stackLine.slice(0, atSymbolIndex);
        }

        const sourceMatch = source.match(sourcePattern);

        if (sourceMatch) {
          let filePath = sourceMatch[1];
          const lineNumber = sourceMatch[2];
          const column = sourceMatch[3];

          if (filePath.startsWith('file:')) {
            filePath = filePath.replace(`file://${Ti.Filesystem.resourcesDirectory}`, '');
          }

          return `\n    at ${symbolName} (${filePath}:${lineNumber}:${column})`;
        } else {
          return `\n    at ${symbolName} (${source})`;
        }
      }).join('');
    }
  } // A stack trace may contain arbitrary data. Only manipulate the output
  // for "regular errors" (errors that "look normal") for now.


  const name = err.name || 'Error';
  let len = name.length;

  if (constructor === null || name.endsWith('Error') && stack.startsWith(name) && (stack.length === len || stack[len] === ':' || stack[len] === '\n')) {
    let fallback = 'Error';

    if (constructor === null) {
      const start = stack.match(/^([A-Z][a-z_ A-Z0-9[\]()-]+)(?::|\n {4}at)/) || stack.match(/^([a-z_A-Z0-9-]*Error)$/);
      fallback = start && start[1] || '';
      len = fallback.length;
      fallback = fallback || 'Error';
    }

    const prefix = getPrefix(constructor, tag, fallback).slice(0, -1);

    if (name !== prefix) {
      if (prefix.includes(name)) {
        if (len === 0) {
          stack = `${prefix}: ${stack}`;
        } else {
          stack = `${prefix}${stack.slice(len)}`;
        }
      } else {
        stack = `${prefix} [${name}]${stack.slice(len)}`;
      }
    }
  } // Ignore the error message if it's contained in the stack.


  let pos = err.message && stack.indexOf(err.message) || -1;

  if (pos !== -1) {
    pos += err.message.length;
  } // Wrap the error in brackets in case it has no stack trace.


  let stackStart = stack.indexOf('\n    at', pos);

  if (stackStart === -1) {
    stack = `[${stack}]`;
  } else if (ctx.colors) {
    // Highlight userland code and node modules.
    let newStack = stack.slice(0, stackStart);
    const lines = stack.slice(stackStart + 1).split('\n');

    for (const line of lines) {
      // This adds underscores to all node_modules to quickly identify them.
      let nodeModule;
      newStack += '\n';
      let pos = 0;

      while (nodeModule = nodeModulesRegExp.exec(line)) {
        // '/node_modules/'.length === 14
        newStack += line.slice(pos, nodeModule.index + 14);
        newStack += ctx.stylize(nodeModule[1], 'module');
        pos = nodeModule.index + nodeModule[0].length;
      }

      newStack += pos === 0 ? line : line.slice(pos);
    }

    stack = newStack;
  } // The message and the stack have to be indented as well!


  if (ctx.indentationLvl !== 0) {
    const indentation = ' '.repeat(ctx.indentationLvl);
    stack = stack.replace(/\n/g, `\n${indentation}`);
  }

  return stack;
}

function formatPromise(ctx, _value, _recurseTimes) {
  // Node calls into native to get promise details which we can't do
  return [ctx.stylize('<unknown>', 'special')];
}

function formatProperty(ctx, value, recurseTimes, key, type) {
  let name, str;
  let extra = ' ';
  const desc = Object.getOwnPropertyDescriptor(value, key) || {
    value: value[key],
    enumerable: true };


  if (desc.value !== undefined) {
    const diff = type !== kObjectType || ctx.compact !== true ? 2 : 3;
    ctx.indentationLvl += diff;
    str = formatValue(ctx, desc.value, recurseTimes);

    if (diff === 3) {
      const len = ctx.colors ? removeColors(str).length : str.length;

      if (ctx.breakLength < len) {
        extra = `\n${' '.repeat(ctx.indentationLvl)}`;
      }
    }

    ctx.indentationLvl -= diff;
  } else if (desc.get !== undefined) {
    const label = desc.set !== undefined ? 'Getter/Setter' : 'Getter';
    const s = ctx.stylize;
    const sp = 'special';

    if (ctx.getters && (ctx.getters === true || ctx.getters === 'get' && desc.set === undefined || ctx.getters === 'set' && desc.set !== undefined)) {
      try {
        const tmp = value[key];
        ctx.indentationLvl += 2;

        if (tmp === null) {
          str = `${s(`[${label}:`, sp)} ${s('null', 'null')}${s(']', sp)}`;
        } else if (typeof tmp === 'object') {
          str = `${s(`[${label}]`, sp)} ${formatValue(ctx, tmp, recurseTimes)}`;
        } else {
          const primitive = formatPrimitive(s, tmp, ctx);
          str = `${s(`[${label}:`, sp)} ${primitive}${s(']', sp)}`;
        }

        ctx.indentationLvl -= 2;
      } catch (err) {
        const message = `<Inspection threw (${err.message})>`;
        str = `${s(`[${label}:`, sp)} ${message}${s(']', sp)}`;
      }
    } else {
      str = ctx.stylize(`[${label}]`, sp);
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
    const tmp = key.toString().replace(strEscapeSequencesReplacer, escapeFn);
    name = `[${ctx.stylize(tmp, 'symbol')}]`;
  } else if (desc.enumerable === false) {
    name = `[${key.replace(strEscapeSequencesReplacer, escapeFn)}]`;
  } else if (keyStrRegExp.test(key)) {
    name = ctx.stylize(key, 'name');
  } else {
    name = ctx.stylize(strEscape(key), 'string');
  }

  return `${name}:${extra}${str}`;
}

function groupArrayElements(ctx, output, value) {
  let totalLength = 0;
  let maxLength = 0;
  let i = 0;
  let outputLength = output.length;

  if (ctx.maxArrayLength < output.length) {
    // This makes sure the "... n more items" part is not taken into account.
    outputLength--;
  }

  const separatorSpace = 2; // Add 1 for the space and 1 for the separator.

  const dataLen = new Array(outputLength); // Calculate the total length of all output entries and the individual max
  // entries length of all output entries. We have to remove colors first,
  // otherwise the length would not be calculated properly.

  for (; i < outputLength; i++) {
    const len = ctx.colors ? removeColors(output[i]).length : output[i].length;
    dataLen[i] = len;
    totalLength += len + separatorSpace;

    if (maxLength < len) {
      maxLength = len;
    }
  } // Add two to `maxLength` as we add a single whitespace character plus a comma
  // in-between two entries.


  const actualMax = maxLength + separatorSpace; // Check if at least three entries fit next to each other and prevent grouping
  // of arrays that contains entries of very different length (i.e., if a single
  // entry is longer than 1/5 of all other entries combined). Otherwise the
  // space in-between small entries would be enormous.

  if (actualMax * 3 + ctx.indentationLvl < ctx.breakLength && (totalLength / actualMax > 5 || maxLength <= 6)) {
    const approxCharHeights = 2.5;
    const averageBias = Math.sqrt(actualMax - totalLength / output.length);
    const biasedMax = Math.max(actualMax - 3 - averageBias, 1); // Dynamically check how many columns seem possible.

    const columns = Math.min( // Ideally a square should be drawn. We expect a character to be about 2.5
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

    const tmp = [];
    const maxLineLength = [];

    for (let i = 0; i < columns; i++) {
      let lineMaxLength = 0;

      for (let j = i; j < output.length; j += columns) {
        if (dataLen[j] > lineMaxLength) {
          lineMaxLength = dataLen[j];
        }
      }

      lineMaxLength += separatorSpace;
      maxLineLength[i] = lineMaxLength;
    }

    let order = 'padStart';

    if (value !== undefined) {
      for (let i = 0; i < output.length; i++) {
        if (typeof value[i] !== 'number') {
          order = 'padEnd';
          break;
        }
      }
    } // Each iteration creates a single line of grouped entries.


    for (let i = 0; i < outputLength; i += columns) {
      // The last lines may contain less entries than columns.
      const max = Math.min(i + columns, outputLength);
      let str = '';
      let j = i;

      for (; j < max - 1; j++) {
        // Calculate extra color padding in case it's active. This has to be
        // done line by line as some lines might contain more colors than
        // others.
        const padding = maxLineLength[j - i] + output[j].length - dataLen[j];
        str += `${output[j]}, `[order](padding, ' ');
      }

      if (order === 'padStart') {
        const padding = maxLineLength[j - i] + output[j].length - dataLen[j] - separatorSpace;
        str += output[j].padStart(padding, ' ');
      } else {
        str += output[j];
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
    return ctx.stylize(`[${constructorName}: Inspection interrupted 'prematurely. Maximum call stack size exceeded.]`, 'special');
  }

  throw err;
}

function formatNumber(fn, value) {
  // Format -0 as '-0'. Checking `value === -0` won't distinguish 0 from -0.
  return fn(Object.is(value, -0) ? '-0' : `${value}`, 'number');
}

function formatBigInt(fn, value) {
  return fn(`${value}n`, 'bigint');
}

function formatPrimitive(fn, value, ctx) {
  if (typeof value === 'string') {
    if (ctx.compact !== true && value.length > kMinLineLength && value.length > ctx.breakLength - ctx.indentationLvl - 4) {
      return value.split(/\n/).map(line => fn(strEscape(line), 'string')).join(` +\n${' '.repeat(ctx.indentationLvl + 2)}`);
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
    return fn(`${value}`, 'boolean');
  }

  if (typeof value === 'undefined') {
    return fn('undefined', 'undefined');
  } // es6 symbol primitive


  return fn(SymbolPrototype.toString.call(value), 'symbol');
} // The array is sparse and/or has extra keys


function formatSpecialArray(ctx, value, recurseTimes, maxLength, output, i) {
  const keys = Object.keys(value);
  let index = i;

  for (; i < keys.length && output.length < maxLength; i++) {
    const key = keys[i];
    const tmp = +key; // Arrays can only have up to 2^32 - 1 entries

    if (tmp > 2 ** 32 - 2) {
      break;
    }

    if (`${index}` !== key) {
      if (!numberRegExp.test(key)) {
        break;
      }

      const emptyItems = tmp - index;
      const ending = emptyItems > 1 ? 's' : '';
      const message = `<${emptyItems} empty item${ending}>`;
      output.push(ctx.stylize(message, 'undefined'));
      index = tmp;

      if (output.length === maxLength) {
        break;
      }
    }

    output.push(formatProperty(ctx, value, recurseTimes, key, kArrayType));
    index++;
  }

  const remaining = value.length - index;

  if (output.length !== maxLength) {
    if (remaining > 0) {
      const ending = remaining > 1 ? 's' : '';
      const message = `<${remaining} empty item${ending}>`;
      output.push(ctx.stylize(message, 'undefined'));
    }
  } else if (remaining > 0) {
    output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
  }

  return output;
}

function formatArrayBuffer(ctx, value) {
  const buffer = new Uint8Array(value);
  /*
                                        // @fixme rollup cannot handle lazy loaded modules, maybe move to webpack?
                                        if (hexSlice === undefined) {
                                        	hexSlice = uncurryThis(require('../../buffer').default.Buffer.prototype.hexSlice);
                                        }
                                        */

  let str = hexSlice(buffer, 0, Math.min(ctx.maxArrayLength, buffer.length)).replace(/(.{2})/g, '$1 ').trim();
  const remaining = buffer.length - ctx.maxArrayLength;

  if (remaining > 0) {
    str += ` ... ${remaining} more byte${remaining > 1 ? 's' : ''}`;
  }

  return [`${ctx.stylize('[Uint8Contents]', 'special')}: <${str}>`];
}

function formatArray(ctx, value, recurseTimes) {
  const valLen = value.length;
  const len = Math.min(Math.max(0, ctx.maxArrayLength), valLen);
  const remaining = valLen - len;
  const output = [];

  for (var i = 0; i < len; i++) {
    // Special handle sparse arrays.
    if (!hasOwnProperty(value, i)) {
      return formatSpecialArray(ctx, value, recurseTimes, len, output, i);
    }

    output.push(formatProperty(ctx, value, recurseTimes, i, kArrayType));
  }

  if (remaining > 0) {
    output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
  }

  return output;
}

function formatTypedArray(ctx, value, recurseTimes) {
  const maxLength = Math.min(Math.max(0, ctx.maxArrayLength), value.length);
  const remaining = value.length - maxLength;
  const output = new Array(maxLength);
  const elementFormatter = value.length > 0 && typeof value[0] === 'number' ? formatNumber : formatBigInt;

  for (let i = 0; i < maxLength; ++i) {
    output[i] = elementFormatter(ctx.stylize, value[i]);
  }

  if (remaining > 0) {
    output[maxLength] = `... ${remaining} more item${remaining > 1 ? 's' : ''}`;
  }

  if (ctx.showHidden) {
    // .buffer goes last, it's not a primitive like the others.
    ctx.indentationLvl += 2;

    for (const key of ['BYTES_PER_ELEMENT', 'length', 'byteLength', 'byteOffset', 'buffer']) {
      const str = formatValue(ctx, value[key], recurseTimes, true);
      output.push(`[${key}]: ${str}`);
    }

    ctx.indentationLvl -= 2;
  }

  return output;
}

function formatSet(ctx, value, recurseTimes) {
  const output = [];
  ctx.indentationLvl += 2;

  for (const v of value) {
    output.push(formatValue(ctx, v, recurseTimes));
  }

  ctx.indentationLvl -= 2; // With `showHidden`, `length` will display as a hidden property for
  // arrays. For consistency's sake, do the same for `size`, even though this
  // property isn't selected by Object.getOwnPropertyNames().

  if (ctx.showHidden) {
    output.push(`[size]: ${ctx.stylize(`${value.size}`, 'number')}`);
  }

  return output;
}

function formatMap(ctx, value, recurseTimes) {
  const output = [];
  ctx.indentationLvl += 2;

  for (const [k, v] of value) {
    output.push(`${formatValue(ctx, k, recurseTimes)} => ${formatValue(ctx, v, recurseTimes)}`);
  }

  ctx.indentationLvl -= 2; // See comment in formatSet

  if (ctx.showHidden) {
    output.push(`[size]: ${ctx.stylize(`${value.size}`, 'number')}`);
  }

  return output;
}

function formatSetIterInner(ctx, recurseTimes, entries, state) {
  const maxArrayLength = Math.max(ctx.maxArrayLength, 0);
  const maxLength = Math.min(maxArrayLength, entries.length);
  let output = new Array(maxLength);
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

  const remaining = entries.length - maxLength;

  if (remaining > 0) {
    output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
  }

  return output;
}

function formatMapIterInner(ctx, recurseTimes, entries, state) {
  const maxArrayLength = Math.max(ctx.maxArrayLength, 0); // Entries exist as [key1, val1, key2, val2, ...]

  const len = entries.length / 2;
  const remaining = len - maxArrayLength;
  const maxLength = Math.min(maxArrayLength, len);
  let output = new Array(maxLength);
  let i = 0;
  ctx.indentationLvl += 2;

  if (state === kWeak) {
    for (; i < maxLength; i++) {
      const pos = i * 2;
      output[i] = `${formatValue(ctx, entries[pos], recurseTimes)}` + ` => ${formatValue(ctx, entries[pos + 1], recurseTimes)}`;
    } // Sort all entries to have a halfway reliable output (if more entries than
    // retrieved ones exist, we can not reliably return the same output) if the
    // output is not sorted anyway.


    if (!ctx.sorted) {
      output = output.sort();
    }
  } else {
    for (; i < maxLength; i++) {
      const pos = i * 2;
      const res = [formatValue(ctx, entries[pos], recurseTimes), formatValue(ctx, entries[pos + 1], recurseTimes)];
      output[i] = reduceToSingleString(ctx, res, '', ['[', ']'], kArrayExtrasType, recurseTimes);
    }
  }

  ctx.indentationLvl -= 2;

  if (remaining > 0) {
    output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
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
  const entries = [];
  let isKeyValue = false;
  let result = value.next();

  while (!result.done) {
    const currentEntry = result.value;
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
  let totalLength = output.length + start;

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
      const entries = output.length; // Group array elements together if the array contains at least six
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
        const start = output.length + ctx.indentationLvl + braces[0].length + base.length + 10;

        if (isBelowBreakLength(ctx, output, start, base)) {
          return `${base ? `${base} ` : ''}${braces[0]} ${join(output, ', ')} ${braces[1]}`;
        }
      }
    } // Line up each entry on an individual line.


    const indentation = `\n${' '.repeat(ctx.indentationLvl)}`;
    return `${base ? `${base} ` : ''}${braces[0]}${indentation}  ` + `${join(output, `,${indentation}  `)}${indentation}${braces[1]}`;
  } // Line up all entries on a single line in case the entries do not exceed
  // `breakLength`.


  if (isBelowBreakLength(ctx, output, 0, base)) {
    return `${braces[0]}${base ? ` ${base}` : ''} ${join(output, ', ')} ` + braces[1];
  }

  const indentation = ' '.repeat(ctx.indentationLvl); // If the opening "brace" is too large, like in the case of "Set {",
  // we need to force the first item to be on the next line or the
  // items will not line up correctly.

  const ln = base === '' && braces[0].length === 1 ? ' ' : `${base ? ` ${base}` : ''}\n${indentation}  `; // Line up each entry on an individual line.

  return `${braces[0]}${ln}${join(output, `,\n${indentation}  `)} ${braces[1]}`;
}

function format(...args) {
  return formatWithOptions(undefined, ...args);
}

const firstErrorLine = error => error.message.split('\n')[0];

let CIRCULAR_ERROR_MESSAGE;

function tryStringify(arg) {
  try {
    return JSON.stringify(arg);
  } catch (err) {
    // Populate the circular error message lazily
    if (!CIRCULAR_ERROR_MESSAGE) {
      try {
        const a = {};
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
  const first = args[0];
  let a = 0;
  let str = '';
  let join = '';

  if (typeof first === 'string') {
    if (args.length === 1) {
      return first;
    }

    let tempStr;
    let lastPos = 0;

    for (var i = 0; i < first.length - 1; i++) {
      if (first.charCodeAt(i) === 37) {
        // '%'
        const nextChar = first.charCodeAt(++i);

        if (a + 1 !== args.length) {
          switch (nextChar) {
            case 115:
              // 's'
              const tempArg = args[++a];

              if (typeof tempArg === 'number') {
                tempStr = formatNumber(stylizeNoColor, tempArg);
                /*
                                                                 } else if (typeof tempArg === 'bigint') {
                                                                 	tempStr = `${tempArg}n`;
                                                                 */
              } else {
                let constr;

                if (typeof tempArg !== 'object' || tempArg === null || typeof tempArg.toString === 'function' && (hasOwnProperty(tempArg, 'toString') // A direct own property on the constructor prototype in
                // case the constructor is not an built-in object.
                || (constr = tempArg.constructor) && !builtInObjects.has(constr.name) && constr.prototype && hasOwnProperty(constr.prototype, 'toString'))) {
                  tempStr = String(tempArg);
                } else {
                  tempStr = inspect(tempArg, { ...inspectOptions,
                    compact: 3,
                    colors: false,
                    depth: 0 });

                }
              }

              break;

            case 106:
              // 'j'
              tempStr = tryStringify(args[++a]);
              break;

            case 100:
              // 'd'
              const tempNum = args[++a];
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
                tempStr = inspect(args[++a], { ...inspectOptions,
                  showHidden: true,
                  showProxy: true,
                  depth: 4 });

                break;
              }

            case 105:
              // 'i'
              const tempInteger = args[++a];
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
              const tempFloat = args[++a];

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
    const value = args[a];
    str += join;
    str += typeof value !== 'string' ? inspect(value, inspectOptions) : value;
    join = ' ';
    a++;
  }

  return str;
}
/* eslint-enable max-depth */

const nativeDebug = console.debug;
const nativeError = console.error;
const nativeInfo = console.info;
const nativeLog = console.log;
const nativeWarn = console.warn;
const kColorInspectOptions = {
  colors: true };

const kNoColorInspectOptions = {};

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
let colorset;
let osVersion; // As Android passes a new instance of Ti.UI to every JS file we can't just
// Ti.UI within this file, we must call kroll.binding to get the Titanium
// namespace that is passed in with require and that deal with the .UI
// namespace that is on that directly.

let uiModule = Ti.UI;

if (Ti.Android) {
  uiModule = kroll.binding('Titanium').Titanium.UI;
}

uiModule.SEMANTIC_COLOR_TYPE_LIGHT = 'light';
uiModule.SEMANTIC_COLOR_TYPE_DARK = 'dark'; // We need to track this manually with a getter/setter
// due to the same reasons we use uiModule instead of Ti.UI

let currentColorType = uiModule.SEMANTIC_COLOR_TYPE_LIGHT;
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
        const colorsetFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'semantic.colors.json');

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
      console.error(`Failed to lookup color for ${colorName}`);
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

  const eventListeners = emitter._eventsToListeners[eventName] || [];

  if (prepend) {
    eventListeners.unshift(listener);
  } else {
    eventListeners.push(listener);
  }

  emitter._eventsToListeners[eventName] = eventListeners; // Check max listeners and spit out warning if >

  const max = emitter.getMaxListeners();
  const length = eventListeners.length;

  if (max > 0 && length > max) {
    const w = new Error(`Possible EventEmitter memory leak detected. ${length} ${eventName} listeners added. Use emitter.setMaxListeners() to increase limit`);
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


  const wrapperThis = {
    emitter,
    eventName,
    listener };

  const bound = wrapper.bind(wrapperThis); // bind to force "this" to refer to our custom object tracking the wrapper/emitter/listener

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

    const eventListeners = this._eventsToListeners[eventName] || [];
    const length = eventListeners.length;
    let foundIndex = -1;
    let unwrappedListener; // Need to search LIFO, and need to handle wrapped functions (once wrappers)

    for (let i = length - 1; i >= 0; i--) {
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

    const eventListeners = this._eventsToListeners[eventName] || [];

    for (const listener of eventListeners.slice()) {
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

    const eventListeners = this._eventsToListeners[eventName] || [];
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


    const raw = this._eventsToListeners[eventName] || [];
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
      const names = Object.keys(this._eventsToListeners).filter(name => name !== 'removeListener');
      names.forEach(name => this.removeAllListeners(name));
      this.removeAllListeners('removeListener');
      this._eventsToListeners = {};
    } else {
      // remove listeners for one type, back to front (Last-in, first-out, except where prepend f-ed it up)
      const listeners = this._eventsToListeners[eventName] || [];

      for (let i = listeners.length - 1; i >= 0; i--) {
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
  const type = typeof arg;

  if (type !== typename.toLowerCase()) {
    throw new TypeError(`The "${name}" argument must be of type ${typename}. Received type ${type}`);
  }
}

const startTime = Date.now();
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

const process$1 = new EventEmitter();

process$1.abort = () => {}; // TODO: Do we have equivalent of forcibly killing the process? We have restart, but I think we just want a no-op stub here


process$1.arch = standardizeArch(Ti.Platform.architecture);
process$1.argv = []; // TODO: What makes sense here? path to titanium cli for first arg? path to ti.main/app.js for second?

Object.defineProperty(process$1, 'argv0', {
  value: '',
  // TODO: Path to .app on iOS?
  writable: false,
  enumerable: true,
  configurable: false });


process$1.binding = () => {
  throw new Error('process.binding is unsupported and not user-facing API');
};

process$1.channel = undefined;

process$1.chdir = () => {
  throw new Error('process.chdir is unsupported');
};

process$1.config = {};
process$1.connected = false;

process$1.cpuUsage = () => {
  // FIXME: Can we look at OS.cpus to get this data?
  return {
    user: 0,
    system: 0 };

};

process$1.cwd = () => __dirname;

Object.defineProperty(process$1, 'debugPort', {
  get: function () {
    let value = 0; // default to 0

    try {
      if ("android" === 'android') {
        const assets = kroll.binding('assets');
        const json = assets.readAsset('deploy.json');

        if (json) {
          const deployData = JSON.parse(json);

          if (deployData.debuggerPort !== -1) {
            // -1 means not set (not in debug mode)
            value = deployData.debuggerPort;
          }
        }
      } else if (false) {
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


process$1.disconnect = () => {}; // no-op


process$1.dlopen = () => {
  throw new Error('process.dlopen is not supported');
};

process$1.emitWarning = function (warning, options, code, ctor) {
  // eslint-disable-line no-unused-vars
  let type;
  let detail;

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


  const isDeprecation = warning.name === 'DeprecationWarning';

  if (isDeprecation && process$1.noDeprecation) {
    return; // ignore
  }

  if (isDeprecation && process$1.throwDeprecation) {
    throw warning;
  }

  this.emit('warning', warning);
};

function loadEnvJson() {
  try {
    const jsonFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, '_env_.json');

    if (jsonFile.exists()) {
      return JSON.parse(jsonFile.read().text);
    }
  } catch (error) {
    Ti.API.error(`Failed to read "_env_.json". Reason: ${error.message}`);
  }

  return {};
}

Object.defineProperty(process$1, 'env', {
  get: function () {
    delete this.env;
    return this.env = loadEnvJson();
  },
  enumerable: true,
  configurable: true });

process$1.execArgv = [];
process$1.execPath = ''; // FIXME: What makes sense here? Path to titanium CLI here?

process$1.exit = () => {
  throw new Error('process.exit is not supported');
};

process$1.exitCode = undefined;
process$1.noDeprecation = false;
process$1.pid = 0; // FIXME: Should we try and adopt 'ipad'/'iphone' to 'darwin'? or 'ios'?

process$1.platform = "android";
process$1.ppid = 0; // TODO: Add release property (Object)
// TODO: Can we expose stdout/stderr/stdin natively?

process$1.stderr = {
  isTTY: false,
  writable: true,
  write: (chunk, encoding, callback) => {
    console.error(chunk);

    if (callback) {
      callback();
    }

    return true;
  } };

process$1.stdout = {
  isTTY: false,
  writable: true,
  write: (chunk, encoding, callback) => {
    console.log(chunk);

    if (callback) {
      callback();
    }

    return true;
  } };

process$1.title = Ti.App.name;
process$1.throwDeprecation = false;
process$1.traceDeprecation = false;

process$1.umask = () => 0; // just always return 0


process$1.uptime = () => {
  const diffMs = Date.now() - startTime;
  return diffMs / 1000.0; // convert to "seconds" with fractions
};

process$1.version = "9.1.0";
process$1.versions = {
  modules: '',
  // TODO: Report module api version (for current platform!)
  v8: '',
  // TODO: report android's v8 version (if on Android!)
  jsc: '' // TODO: report javascriptcore version for iOS/WIndows?
  // TODO: Report ios/Android/Windows platform versions?
};

global.process = process$1; // handle spitting out warnings

const WARNING_PREFIX = `(titanium:${process$1.pid}) `;
process$1.on('warning', warning => {
  const isDeprecation = warning.name === 'DeprecationWarning'; // if we're not doing deprecations, ignore!

  if (isDeprecation && process$1.noDeprecation) {
    return;
  } // TODO: Check process.traceDeprecation and if set, include stack trace in message!


  let msg = WARNING_PREFIX;

  if (warning.code !== undefined) {
    msg += `[${warning.code}] `;
  }

  if (warning.toString) {
    msg += warning.toString();
  }

  if (warning.detail) {
    msg += `\n${warning.detail}`;
  }

  console.error(msg);
});
let uncaughtExceptionCallback = null;

process$1.hasUncaughtExceptionCaptureCallback = () => uncaughtExceptionCallback !== null;

process$1.setUncaughtExceptionCaptureCallback = fn => {
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
  const error = new Error(event.message);
  error.stack = event.backtrace;
  error.fileName = event.sourceName;
  error.lineNumber = event.line;
  error.columnNumber = event.lineOffset;

  if (process$1.hasUncaughtExceptionCaptureCallback()) {
    return uncaughtExceptionCallback(error);
  } // otherwise forward the event!


  process$1.emit('uncaughtException', error);
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


const tickQueue = [];
const immediateQueue = [];
let drainingTickQueue = false;
let drainQueuesTimeout = null;
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
    const tick = tickQueue.shift();
    tick.run();
  }

  drainingTickQueue = false;
}

function drainQueues() {
  // drain the full tick queue first...
  drainTickQueue(); // tick queue should be empty!

  const immediatesRemaining = processImmediateQueue();

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
  const immediateDeadline = Date.now() + 100; // give us up to 100ms to process immediates

  while (immediateQueue.length && Date.now() < immediateDeadline) {
    const immediate = immediateQueue.shift();
    immediate.run();

    if (tickQueue.length > 0) {
      // they added a tick! drain the tick queue before we do anything else (this *may* eat up our deadline/window to process any more immediates)
      drainTickQueue();
    }
  }

  return immediateQueue.length;
}

process$1.nextTick = function (callback, ...args) {
  assertArgumentType(callback, 'callback', 'function');
  tickQueue.push(new CallbackWithArgs(callback, args));

  if (!drainQueuesTimeout) {
    drainQueuesTimeout = setTimeout(drainQueues, 0);
  }
};

global.setImmediate = function (callback, ...args) {
  assertArgumentType(callback, 'callback', 'function');
  const immediate = new CallbackWithArgs(callback, args);
  immediateQueue.push(immediate);

  if (!drainQueuesTimeout) {
    drainQueuesTimeout = setTimeout(drainQueues, 0);
  }

  return immediate;
};

global.clearImmediate = function (immediate) {
  const index = immediateQueue.indexOf(immediate);

  if (index !== -1) {
    immediateQueue.splice(index, 1);
  }
};

const FORWARD_SLASH = 47; // '/'

const BACKWARD_SLASH = 92; // '\\'

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
  const length = filepath.length; // empty string special case

  if (length === 0) {
    return false;
  }

  const firstChar = filepath.charCodeAt(0);

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
    const thirdChar = filepath.charAt(2);
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
  const length = filepath.length;

  if (length === 0) {
    return '.';
  } // ignore trailing separator


  let fromIndex = length - 1;
  const hadTrailing = filepath.endsWith(separator);

  if (hadTrailing) {
    fromIndex--;
  }

  const foundIndex = filepath.lastIndexOf(separator, fromIndex); // no separators

  if (foundIndex === -1) {
    // handle special case of root windows paths
    if (length >= 2 && separator === '\\' && filepath.charAt(1) === ':') {
      const firstChar = filepath.charCodeAt(0);

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
  const index = filepath.lastIndexOf('.');

  if (index === -1 || index === 0) {
    return '';
  } // ignore trailing separator


  let endIndex = filepath.length;

  if (filepath.endsWith(separator)) {
    endIndex--;
  }

  return filepath.slice(index, endIndex);
}

function lastIndexWin32Separator(filepath, index) {
  for (let i = index; i >= 0; i--) {
    const char = filepath.charCodeAt(i);

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

  const length = filepath.length;

  if (length === 0) {
    return '';
  }

  const isPosix = separator === '/';
  let endIndex = length; // drop trailing separator (if there is one)

  const lastCharCode = filepath.charCodeAt(length - 1);

  if (lastCharCode === FORWARD_SLASH || !isPosix && lastCharCode === BACKWARD_SLASH) {
    endIndex--;
  } // Find last occurence of separator


  let lastIndex = -1;

  if (isPosix) {
    lastIndex = filepath.lastIndexOf(separator, endIndex - 1);
  } else {
    // On win32, handle *either* separator!
    lastIndex = lastIndexWin32Separator(filepath, endIndex - 1); // handle special case of root path like 'C:' or 'C:\\'

    if ((lastIndex === 2 || lastIndex === -1) && filepath.charAt(1) === ':' && isWindowsDeviceName(filepath.charCodeAt(0))) {
      return '';
    }
  } // Take from last occurrence of separator to end of string (or beginning to end if not found)


  const base = filepath.slice(lastIndex + 1, endIndex); // drop trailing extension (if specified)

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


function normalize(separator, filepath) {
  assertArgumentType(filepath, 'path', 'string');

  if (filepath.length === 0) {
    return '.';
  } // Windows can handle '/' or '\\' and both should be turned into separator


  const isWindows = separator === '\\';

  if (isWindows) {
    filepath = filepath.replace(/\//g, separator);
  }

  const hadLeading = filepath.startsWith(separator); // On Windows, need to handle UNC paths (\\host-name\\resource\\dir) special to retain leading double backslash

  const isUNC = hadLeading && isWindows && filepath.length > 2 && filepath.charAt(1) === '\\';
  const hadTrailing = filepath.endsWith(separator);
  const parts = filepath.split(separator);
  const result = [];

  for (const segment of parts) {
    if (segment.length !== 0 && segment !== '.') {
      if (segment === '..') {
        result.pop(); // FIXME: What if this goes above root? Should we throw an error?
      } else {
        result.push(segment);
      }
    }
  }

  let normalized = hadLeading ? separator : '';
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
    throw new TypeError(`Path must be a string. Received ${segment}`);
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
  const result = []; // naive impl: just join all the paths with separator

  for (const segment of paths) {
    assertSegment(segment);

    if (segment.length !== 0) {
      result.push(segment);
    }
  }

  return normalize(separator, result.join(separator));
}
/**
   * The `path.resolve()` method resolves a sequence of paths or path segments into an absolute path.
   *
   * @param  {string} separator platform-specific file separator
   * @param  {string[]} paths [description]
   * @return {string}       [description]
   */


function resolve(separator, paths) {
  let resolved = '';
  let hitRoot = false;
  const isPosix = separator === '/'; // go from right to left until we hit absolute path/root

  for (let i = paths.length - 1; i >= 0; i--) {
    const segment = paths[i];
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

  const normalized = normalize(separator, resolved);

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


  let upCount = 0;
  let remainingPath = '';

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
  const result = {
    root: '',
    dir: '',
    base: '',
    ext: '',
    name: '' };

  const length = filepath.length;

  if (length === 0) {
    return result;
  } // Cheat and just call our other methods for dirname/basename/extname?


  result.base = basename(separator, filepath);
  result.ext = extname(separator, result.base);
  const baseLength = result.base.length;
  result.name = result.base.slice(0, baseLength - result.ext.length);
  const toSubtract = baseLength === 0 ? 0 : baseLength + 1;
  result.dir = filepath.slice(0, filepath.length - toSubtract); // drop trailing separator!

  const firstCharCode = filepath.charCodeAt(0); // both win32 and POSIX return '/' root

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
      const thirdCharCode = filepath.charCodeAt(2);

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
  const base = pathObject.base || `${pathObject.name || ''}${pathObject.ext || ''}`; // append base to root if `dir` wasn't specified, or if
  // dir is the root

  if (!pathObject.dir || pathObject.dir === pathObject.root) {
    return `${pathObject.root || ''}${base}`;
  } // combine dir + / + base


  return `${pathObject.dir}${separator}${base}`;
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

  const resolvedPath = resolve('\\', [filepath]);
  const length = resolvedPath.length;

  if (length < 2) {
    // need '\\\\' or 'C:' minimum
    return filepath;
  }

  const firstCharCode = resolvedPath.charCodeAt(0); // if start with '\\\\', prefix with UNC root, drop the slashes

  if (firstCharCode === BACKWARD_SLASH && resolvedPath.charAt(1) === '\\') {
    // return as-is if it's an aready long path ('\\\\?\\' or '\\\\.\\' prefix)
    if (length >= 3) {
      const thirdChar = resolvedPath.charAt(2);

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

const Win32Path = {
  sep: '\\',
  delimiter: ';',
  basename: function (filepath, ext) {
    return basename(this.sep, filepath, ext);
  },
  normalize: function (filepath) {
    return normalize(this.sep, filepath);
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

const PosixPath = {
  sep: '/',
  delimiter: ':',
  basename: function (filepath, ext) {
    return basename(this.sep, filepath, ext);
  },
  normalize: function (filepath) {
    return normalize(this.sep, filepath);
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

const path = PosixPath;
path.win32 = Win32Path;
path.posix = PosixPath;

const PosixConstants = {
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

const OS = {
  EOL: '\n',
  arch: () => process.arch,
  constants: PosixConstants,
  cpus: () => {
    const count = Ti.Platform.processorCount;
    const array = [];

    for (let i = 0; i < count; i++) {
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
    const result = Ti.Codec.getNativeByteOrder();

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

{
  OS.cpus = () => Ti.Platform.cpus();

  OS.type = () => 'Linux';
}

const tty = {
  isatty: () => false,
  ReadStream: () => {
    throw new Error('tty.ReadStream is not implemented');
  },
  WriteStream: () => {
    throw new Error('tty.WriteStream is not implemented');
  } };


const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const util = {
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
    const date = new Date();
    const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`; // Produces output like: "21 Feb 10:04:23 - message"

    console.log(`${date.getDate()} ${MONTHS[date.getMonth()]} ${time} - ${string}`);
  },
  print: (...args) => console.log(args.join('')),
  // FIXME: Shouldn't add trailing newline like console.log does!
  puts: (...args) => console.log(args.join('\n')),
  error: (...args) => console.error(args.join('\n')),
  debug: string => console.error(`DEBUG: ${string}`),
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
    const callback = args.pop();
    const promise = original.apply(this, args);
    promise.then(result => {
      // eslint-disable-line promise/always-return
      callback(null, result); // eslint-disable-line promise/no-callback-in-promise
    }).catch(err => {
      if (!err) {
        const wrappedError = new Error('Promise was rejected with falsy value');
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
    let warned = false;

    if (!warned) {
      process.emitWarning(string, 'DeprecationWarning');
      warned = true;
    }

    return func.apply(this, args);
  }

  return wrapped;
}; // TODO: Support debuglog? What is our equivalent of process.env('NODE_DEBUG')?


const noop = () => {};

util.debuglog = () => {
  return noop;
};

const DEFAULT_MESSAGES = {
  deepStrictEqual: 'Expected values to be strictly deep-equal:',
  strictEqual: 'Expected values to be strictly equal:',
  deepEqual: 'Expected values to be loosely deep-equal:',
  equal: 'Expected values to be loosely equal:',
  notDeepStrictEqual: 'Expected "actual" not to be strictly deep-equal to:',
  notStrictEqual: 'Expected "actual" to be strictly unequal to:',
  notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:',
  notEqual: 'Expected "actual" to be loosely unequal to:' };
// Fake enums to use internally

const COMPARE_TYPE = {
  Object: 0,
  Map: 1,
  Set: 2 };

const STRICTNESS = {
  Strict: 0,
  Loose: 1 };


class AssertionError extends Error {
  constructor(options) {
    let {
      actual,
      expected,
      message,
      operator } =
    options;

    if (!message) {
      // FIXME: Generate the rest of the message with diff of actual/expected!
      message = `${DEFAULT_MESSAGES[operator]}\n\n`;
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


const assert$1 = (value, message) => assert$1.ok(value, message);

assert$1.AssertionError = AssertionError;

assert$1.ok = (...args) => {
  const value = args[0];

  if (value) {
    return;
  }

  let message = args[1];
  let generatedMessage = false; // Check if value (1st arg) was not supplied!
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

  const err = new AssertionError({
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

const isPrimitive = value => {
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
  const looseChecks = new Set(); // keep track of objects we need to test more extensively than using #get()/#has()

  for (const [key, value] of actual) {
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


  for (const [expectedKey, expectedValue] of expected) {
    // if it's not a non-null object in strict mode, fail!
    // (i.e. if it's a primitive that failed a match, don't fall back to more loosely match it)
    // Note that this shouldn't ever happen since we should be returning false immediately above
    if (strictness === STRICTNESS.Strict && !(typeof expectedKey === 'object' && expectedKey !== null)) {
      return false;
    } // otherwise, test it // TODO: Wish we could use #find() like on an Array, but Set doesn't have it!


    let found = false;

    for (const key of looseChecks) {
      // if both key and value matches
      if (deepEqual(key, expectedKey, strictness, references) && deepEqual(actual.get(key), expectedValue, strictness, references)) {
        found = true;
        looseChecks.delete(key); // remove from our looseChecks Set since we already matched it

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
  const looseChecks = new Set(); // keep track of values we need to test more extensively than using #has()

  for (const value of actual) {
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


  for (const expectedValue of expected) {
    // if it's not a non-null object in strict mode, fail!
    // (i.e. if it's a primitive that failed a match, don't fall back to more loosely match it)
    // Note that this shouldn't ever happen since we should be returning false immediately above
    if (strictness === STRICTNESS.Strict && !(typeof expectedValue === 'object' && expectedValue !== null)) {
      return false;
    }

    let found = false;

    for (const object of looseChecks) {
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


  const actualTag = Object.prototype.toString.call(actual);
  const expectedTag = Object.prototype.toString.call(expected);

  if (actualTag !== expectedTag) {
    return false;
  } // [[Prototype]] of objects are compared using the Strict Equality Comparison.


  if (strictness === STRICTNESS.Strict) {
    // don't check prototype when doing "loose"
    const actualPrototype = Object.getPrototypeOf(actual);
    const expectedPrototype = Object.getPrototypeOf(expected);

    if (actualPrototype !== expectedPrototype) {
      return false;
    }
  }

  let comparison = COMPARE_TYPE.Object;

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


  const actualKeys = Object.keys(actual); // for an array, this will return the indices that have values

  const expectedKeys = Object.keys(expected); // and it just magically works
  // Must have same number of properties

  if (actualKeys.length !== expectedKeys.length) {
    return false;
  } // Are they the same keys? If one is missing, then no, fail right away


  if (!actualKeys.every(key => Object.prototype.hasOwnProperty.call(expected, key))) {
    return false;
  } // Don't check own symbols when doing "loose"


  if (strictness === STRICTNESS.Strict) {
    const actualSymbols = Object.getOwnPropertySymbols(actual);
    const expectedSymbols = Object.getOwnPropertySymbols(expected); // Must have same number of symbols

    if (actualSymbols.length !== expectedSymbols.length) {
      return false;
    }

    if (actualSymbols.length > 0) {
      // Have to filter them down to enumerable symbols!
      for (const key of actualSymbols) {
        const actualIsEnumerable = Object.prototype.propertyIsEnumerable.call(actual, key);
        const expectedIsEnumerable = Object.prototype.propertyIsEnumerable.call(expected, key);

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
    const memoizedActual = references.actual.get(actual);

    if (memoizedActual !== undefined) {
      const memoizedExpected = references.expected.get(expected);

      if (memoizedExpected !== undefined) {
        return memoizedActual === memoizedExpected;
      }
    }

    references.depth++;
  } // store the object -> depth mapping


  references.actual.set(actual, references.depth);
  references.expected.set(expected, references.depth); // When comparing Maps/Sets, compare elements before custom properties

  let result = true;

  if (comparison === COMPARE_TYPE.Set) {
    result = compareSets(actual, expected, strictness, references);
  } else if (comparison === COMPARE_TYPE.Map) {
    result = compareMaps(actual, expected, strictness, references);
  }

  if (result) {
    // Now loop over keys and compare them to each other!
    for (const key of actualKeys) {
      if (!deepEqual(actual[key], expected[key], strictness, references)) {
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


const NO_EXCEPTION = {};

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

async function executePromise(fn) {
  let promise;
  const fnType = typeof fn;

  if (fnType === 'function') {
    promise = fn();

    if (!isPromiseLike(promise)) {
      throw new TypeError(`Expected instanceof Promise to be returned from the "fn" function but got ${typeof promise}`);
    }
  } else {
    if (!isPromiseLike(fn)) {
      throw new TypeError(`The "fn" argument must be of type Function or Promise. Received type ${fnType}`);
    }

    promise = fn;
  }

  try {
    await promise;
  } catch (e) {
    return e;
  }

  return NO_EXCEPTION;
}

assert$1.throws = (fn, error, message) => {
  const actual = execute(fn);

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

assert$1.rejects = async function (asyncFn, error, message) {
  const actual = await executePromise(asyncFn);

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
};

assert$1.doesNotThrow = (fn, error, message) => {
  const actual = execute(fn); // no Error, just return

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
      message: `Got unwanted exception${message ? ': ' + message : '.'}` });

    return;
  } // doesn't match, re-throw


  throw actual;
};

assert$1.doesNotReject = async function (fn, error, message) {
  const actual = await executePromise(fn); // no Error, just return

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
      message: `Got unwanted exception${message ? ': ' + message : '.'}` });

    return;
  } // doesn't match, re-throw


  throw actual;
};
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


    const keys = Object.keys(expected); // If we're testing against an instance of an Error, we need to hack in name/message properties.

    if (expected instanceof Error) {
      keys.unshift('name', 'message'); // we want to compare name and message, but they're not set as enumerable on Error
    }

    for (const key of keys) {
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
    message: `ifError got unwanted exception: ${value}`,
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
    let result = super.end(buffer);

    if (this.byteCount !== 0) {
      // we have incomplete characters!
      result += this._incompleteEnd();
    }

    this._incompleteBufferEmptied(); // reset our internals to "wipe" the incomplete buffer


    return result;
  }

  write(buffer) {
    // first let's see if we had some multi-byte character we didn't finish...
    let char = '';

    if (this.byteCount !== 0) {
      // we still needed some bytes to finish the character
      // How many bytes do we still need? charLength - bytes we received
      const left = this.charLength - this.byteCount; // need 4, have 1? then we have 3 "left"

      const bytesCopied = Math.min(left, buffer.length); // copy up to that many bytes
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


    const incompleteCharData = this._checkIncompleteBytes(buffer);

    if (incompleteCharData.bytesNeeded === 0) {
      return char + buffer.toString(this.encoding); // no incomplete bytes, return any character we completed plus the buffer
    } // ok so the buffer holds an incomplete character at it's end


    this.charLength = incompleteCharData.charLength; // record how many bytes we need for the 'character'

    const incompleteCharIndex = incompleteCharData.index; // this is the index of the multibyte character that is incomplete
    // copy from index of incomplete character to end of buffer

    const bytesToCopy = buffer.length - incompleteCharIndex;
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
    const length = buffer.length; // FIXME: In Node, they check the last character first!
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
      let charLength = checkCharLengthForUTF8(buffer[length - 3]);

      if (charLength === 4) {
        return {
          bytesNeeded: 1,
          // we have 3 last bytes, need 4th
          index: length - 3,
          charLength: 4 };

      }
    } // if buffer.length >= 2, check 2nd to last byte


    if (length >= 2) {
      let charLength = checkCharLengthForUTF8(buffer[length - 2]);

      if (charLength >= 3) {
        return {
          bytesNeeded: charLength - 2,
          // we have 2 bytes of whatever we need
          index: length - 2,
          charLength };

      }
    } // if buffer.length >= 1, check last byte


    if (length >= 1) {
      let charLength = checkCharLengthForUTF8(buffer[length - 1]);

      if (charLength >= 2) {
        return {
          bytesNeeded: charLength - 1,
          // we have 1 byte of whatever we need
          index: length - 1,
          charLength };

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
    const length = buffer.length;
    const modulo = length % 2; // ok, we have a multiple of 2 bytes

    if (modulo === 0) {
      // is the last byte a leading/high surrogate?
      const byte = buffer[buffer.length - 1];

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
    const length = buffer.length;
    const modulo = length % 3; // base64 needs 3 bytes always, so if we have that many (or a multiple), we have a complete buffer

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


const printedWarnings = {};

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
    const fqn = `${moduleName}.${name}`;
    oneTimeWarning(fqn, `"${fqn}" is not supported yet on Titanium and uses a no-op fallback.`);
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


const COPY_FILE_CHUNK_SIZE = 8092; // what should we use here?
// Keep track of integer -> FileStream mappings

const fileDescriptors = new Map();
let fileDescriptorCount = 4; // global counter used to report file descriptor integers
// Map file system access flags to Ti.Filesystem.MODE_* constants

const FLAGS_TO_TI_MODE = new Map();
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

const permissionDenied = (syscall, path) => makeError('EACCES', 'permission denied', -13, syscall, path);

const noSuchFile = (syscall, path) => makeError('ENOENT', 'no such file or directory', -2, syscall, path);

const fileAlreadyExists = (syscall, path) => makeError('EEXIST', 'file already exists', -17, syscall, path);

const notADirectory = (syscall, path) => makeError('ENOTDIR', 'not a directory', -20, syscall, path);

const directoryNotEmpty = (syscall, path) => makeError('ENOTEMPTY', 'directory not empty', -66, syscall, path);

const illegalOperationOnADirectory = (syscall, path) => makeError('EISDIR', 'illegal operation on a directory', -21, syscall, path);

const fs = {
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
  const fileHandle = getTiFileFromPathLikeValue(path);

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
  const stream = streamForDescriptor(fd);
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

  const srcFile = Ti.Filesystem.getFile(src);
  const srcStream = srcFile.open(Ti.Filesystem.MODE_READ);
  const destFile = Ti.Filesystem.getFile(dest);
  const destStream = destFile.open(Ti.Filesystem.MODE_WRITE);
  pipe(srcStream, destStream, callback);
};
/**
    * @param {string|Buffer|URL} src source filename to copy
    * @param {string|Buffer|URL} dest destination filename of the copy operation
    * @param {number} [flags=0] modifiers for copy operation
    */


fs.copyFileSync = function (src, dest, flags = 0) {
  const srcFile = Ti.Filesystem.getFile(src);

  if (flags === fs.constants.COPYFILE_EXCL && fs.existsSync(dest)) {
    throw fileAlreadyExists('copyFile', dest);
  }

  if (!srcFile.copy(dest)) {
    throw new Error(`Unable to copy ${src} to ${dest}`); // FIXME: What error should we give?
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
    let stats;

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
  const path = pathForFileDescriptor(fd);
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
  const tiFile = getTiFileFromPathLikeValue(path);

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

  const tryMkdtemp = () => {
    const generated = randomCharacters(6, options.encoding); // generate six random characters

    const path = `${prefix}${generated}`;
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

  let retryCount = 0;
  const MAX_RETRIES = 100;

  while (retryCount < MAX_RETRIES) {
    const generated = randomCharacters(6, options.encoding); // generate six random characters

    const path = `${prefix}${generated}`;

    try {
      fs.mkdirSync(path, 0o700); // don't try recursive

      return path;
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e; // bubble up error
      } // name was not unique, so retry


      retryCount++;
    }
  }

  throw new Error(`Failed to create a unique directory name with prefix ${prefix}`);
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
    let fileDescriptor;

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
  const tiFile = getTiFileFromPathLikeValue(path);

  if (!tiFile.exists()) {
    // TODO: Support creating file with specific mode
    oneTimeWarning('fs.openSync.mode', 'fs.openSync\'s mode parameter is unsupported in Titanium and will be ignored');

    if (!tiFile.createFile()) {
      // Oh crap, we failed to create the file. why?
      if (!tiFile.parent.exists()) {
        // parent does not exist!
        throw noSuchFile('open', path);
      }

      throw new Error(`failed to create file at path ${path}`);
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

  const tiMode = FLAGS_TO_TI_MODE.get(flags);

  if (tiMode === undefined) {
    // TODO: Make use of common error type/code for this once we have internal/errors.js
    const err = new TypeError(`The value "${String(flags)}" is invalid for option "flags"`);
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
  const tiFileStream = streamForDescriptor(fd);

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
  const fileStream = streamForDescriptor(fd);

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
    let result;

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
  const file = getTiFileFromPathLikeValue(filepath);

  if (!file.exists()) {
    throw noSuchFile('scandir', filepath);
  }

  if (!file.isDirectory()) {
    throw notADirectory('scandir', filepath);
  }

  options = mergeDefaultOptions(options, {
    encoding: 'utf-8',
    withFileTypes: false });

  const listing = file.getDirectoryListing();

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

    const fileSize = stats.size; // Create a Ti.Buffer to read into

    const buffer = Ti.createBuffer({
      length: fileSize });
    // Use Ti.Stream.readAll(sourceStream, buffer, callback) which spins off a separate thread to read in while loop!

    const sourceStream = streamForDescriptor(fileDescriptor);
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
  const wasFileDescriptor = typeof path === 'number';
  let fileDescriptor = path; // may be overriden later

  /**
   * @param {Error} err possible Error
   * @param {Ti.Buffer} buffer Ti.Buffer instance
   */

  const handleBuffer = (err, buffer) => {
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

  const wasFileDescriptor = typeof path === 'number';
  const fileDescriptor = wasFileDescriptor ? path : fs.openSync(path, options.flag); // use default mode

  const tiFileStream = streamForDescriptor(fileDescriptor); // Just use our own API that reads full stream in

  const buffer = Ti.Stream.readAll(tiFileStream); // fs.closeSync if it was not originally a file descriptor

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
    const result = path.normalize(filepath);
    fs.exists(result, resultExists => {
      if (resultExists) {
        if (options.encoding === 'buffer') {
          return callback(null, Buffer.from(result));
        }

        return callback(null, result);
      } // this path doesn't exist, try each segment until we find first that doesn't


      const segments = result.split(path.sep); // FIXME: Drop last segment as we already know the full path doesn't exist?

      let partialFilePath = '';
      let index = 0; // handle typical case of empty first segment so we don't need to do an async setTimeout to get to first real case

      if (segments[index].length === 0) {
        index++;
      }

      setTimeout(tryPath, 1);

      function tryPath() {
        if (index >= segments.length) {
          // don't run past end of segments, throw error for resolved path
          return callback(noSuchFile(result));
        } // grab next segment


        const segment = segments[index++];

        if (segment.length === 0) {
          // if it's an empty segment...
          // try again at next index
          return setTimeout(tryPath, 1);
        } // normal case


        partialFilePath += path.sep + segment; // check if path up to this point exists...

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

  const result = path.normalize(filepath);

  if (!fs.existsSync(result)) {
    // this path doesn't exist, try each segment until we find first that doesn't
    const segments = result.split(path.sep);
    let partialFilePath = '';

    for (const segment of segments) {
      if (segment.length === 0) {
        continue;
      }

      partialFilePath += path.sep + segment;

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
  const tiFile = getTiFileFromPathLikeValue(oldPath); // src doesn't actually exist?

  if (!tiFile.exists()) {
    const err = noSuchFile('rename', oldPath);
    err.message = `${err.message} -> '${newPath}'`;
    err.dest = newPath;
    throw err;
  }

  const destFile = getTiFileFromPathLikeValue(newPath);

  if (destFile.isDirectory()) {
    // dest is a directory that already exists
    const err = illegalOperationOnADirectory('rename', oldPath);
    err.message = `${err.message} -> '${newPath}'`;
    err.dest = newPath;
    throw err;
  }

  let tempPath;

  if (destFile.isFile()) {
    // destination file exists, we should overwrite
    // Our APIs will fail if we try, so first let's make a backup copy and delete the the original
    tempPath = path.join(fs.mkdtempSync(path.join(Ti.Filesystem.tempDirectory, 'rename-')), path.basename(newPath));
    destFile.move(tempPath);
  }

  let success = false;

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
        const tmpFile = getTiFileFromPathLikeValue(tempPath);
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
  const tiFile = getTiFileFromPathLikeValue(path);

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


    const subFiles = tiFile.getDirectoryListing();

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

    const buffer = Buffer.alloc(len);
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


  const fd = fs.openSync(path);
  const buffer = Buffer.alloc(len);
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
  const tiFile = getTiFileFromPathLikeValue(path);

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

  const wasFileDescriptor = typeof file === 'number';
  let fileDescriptor = file; // may be overriden later

  const finish = err => {
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

  const wasFileDescriptor = typeof file === 'number';
  const fileDescriptor = wasFileDescriptor ? file : fs.openSync(file, options.flag, options.mode); // if data is a string, make it a buffer first

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
  const isBuffer = Buffer.isBuffer(buffer);

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
  const isBuffer = Buffer.isBuffer(buffer);

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
  {
    // Android is probably better off with Ti.Stream.writeStream, less overhead back and forth the bridge
    // Though Android does support the Ti.Stream.pump/Ti.Stream.write pattern using both APIs async
    pipeViaWriteStream(srcStream, destStream, callback);
    return;
  } // iOS has some... issues with writeStream calling the callback every iteration of the loop *and* at the end
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
   * @param {string|Buffer|URL} path file path
   * @param {Ti.Filesystem.FileStream} fileStream file stream
   * @returns {integer} file descriptor
   */


function createFileDescriptor(path, fileStream) {
  const pointer = fileDescriptorCount++; // increment global counter

  const fd = new FileDescriptor(pointer, path, fileStream);
  fileDescriptors.set(pointer, fd); // use it to refer to this file stream as the "descriptor"

  return pointer;
}
/**
   * @param {integer} fd file descriptor
   * @returns {Ti.Filesystem.FileStream} matching stream
   */


function streamForDescriptor(fd) {
  const wrapper = fileDescriptors.get(fd);
  return wrapper.stream;
}
/**
   * @param {integer} fd file descriptor
   * @returns {string} matching stream
   */


function pathForFileDescriptor(fd) {
  const wrapper = fileDescriptors.get(fd);
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

  const optionsType = typeof options;

  switch (optionsType) {
    case 'undefined':
    case 'function':
      return defaults;

    case 'string':
      // Use copy of defaults but with encoding set to the 'options' value!
      const merged = Object.assign({}, defaults);
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

  const err = new TypeError(`Callback must be a function. Received ${cb}`);
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
  const error = new Error(`${code}: ${message}, ${syscall} '${path}'`);
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
  const buffer = Buffer.from(tiBuffer);

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


  const tiFileStream = streamForDescriptor(fd); // Make use of the buffer slice that's specified by offset/length

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


  const tiFileStream = streamForDescriptor(fd); // Make use of the buffer slice that's specified by offset/length

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

  const tiFileStream = streamForDescriptor(fd);
  string += ''; // coerce to string

  const buffer = Buffer.from(string, encoding); // TODO: Support use of position argument. I assume we'd need a way to add a method to move to stream position somehow

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

  const tiFileStream = streamForDescriptor(fd);
  string += ''; // coerce to string

  const buffer = Buffer.from(string, encoding); // TODO: Support use of position argument. I assume we'd need a way to add a method to move to stream position somehow

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
const bindings = new Map();
/**
                             * Used by @function redirectCoreModuleIdToPath
                             * @type {map<string, string>}
                             */

const redirects = new Map();
/**
                              * Does the request look like a typical core module? (no '.' or '/' characters)
                              * @param {string} path original require path/id
                              * @returns {boolean}
                              */

function isHijackableModuleId(path) {
  if (!path || path.length < 1) {
    return false;
  }

  const firstChar = path.charAt(0);
  return firstChar !== '.' && firstChar !== '/';
} // Hack require to point to this as a core module "binding"


const originalRequire = global.require; // This works for iOS as-is, and also intercepts the call on Android for ti.main.js (the first file executed)

global.require = function (moduleId) {
  if (bindings.has(moduleId)) {
    return bindings.get(moduleId);
  }

  if (redirects.has(moduleId)) {
    moduleId = redirects.get(moduleId);
  }

  return originalRequire(moduleId);
};

{
  // ... but we still need to hack it when requiring from other files for Android
  const originalModuleRequire = global.Module.prototype.require;

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
    throw new Error(`Cannot register for relative/absolute file paths; no leading '.' or '/' allowed (was given ${moduleId})`);
  }

  if (redirects.has(moduleId)) {
    Ti.API.warn(`Another binding has already registered for module id: '${moduleId}', it will be overwritten...`);
    redirects.delete(moduleId);
  } else if (bindings.has(moduleId)) {
    Ti.API.warn(`Another binding has already registered for module id: '${moduleId}', it will be overwritten...`);
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
    throw new Error(`Cannot register for relative/absolute file paths; no leading '.' or '/' allowed (was given ${moduleId})`);
  }

  if (bindings.has(moduleId)) {
    Ti.API.warn(`Another binding has already registered for module id: '${moduleId}', it will be overwritten...`);
    bindings.delete(moduleId);
  } else if (redirects.has(moduleId)) {
    Ti.API.warn(`Another binding has already registered for module id: '${moduleId}', it will be overwritten...`);
  }

  redirects.set(moduleId, filepath);
}
const binding = {
  register,
  redirect };

global.binding = binding;

// Load all the node compatible core modules
register('path', path);
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
  const JSON_FILE_NAME = 'bootstrap.json';

  try {
    const jsonFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, `ti.internal/${JSON_FILE_NAME}`);

    if (jsonFile.exists()) {
      const settings = JSON.parse(jsonFile.read().text);

      if (Array.isArray(settings.scripts)) {
        return settings.scripts;
      }

      return [];
    }
  } catch (error) {
    Ti.API.error(`Failed to read "${JSON_FILE_NAME}". Reason: ${error.message}`);
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
  const resourceDirectory = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory);
  const resourceDirectoryPathLength = resourceDirectory.nativePath.length;
  const bootstrapScripts = [];

  function loadFrom(file) {
    if (file) {
      if (file.isDirectory()) {
        // This is a directory. Recursively look for bootstrap files under it.
        const fileNameArray = file.getDirectoryListing();

        if (fileNameArray) {
          for (let index = 0; index < fileNameArray.length; index++) {
            loadFrom(Ti.Filesystem.getFile(file.nativePath, fileNameArray[index]));
          }
        }
      } else if (file.name.search(/.bootstrap.js$/) >= 0) {
        // This is a bootstrap file.
        // Convert its path to something loadable via require() and add it to the array.
        let bootstrapPath = file.nativePath;
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
  let bootstrapScripts = fetchScriptsFromJson();

  if (!bootstrapScripts) {
    bootstrapScripts = fetchScriptsFromResourcesDirectory();
  } // Do not continue if no bootstraps were found.


  if (!bootstrapScripts || bootstrapScripts.length <= 0) {
    finished();
    return;
  } // Sort the bootstraps so that they'll be loaded in a consistent order between platforms.


  bootstrapScripts.sort(); // Loads all bootstrap scripts found.

  function loadBootstrapScripts(finished) {
    let bootstrapIndex = 0;

    function doLoad() {
      // Attempt to load all bootstrap scripts.
      while (bootstrapIndex < bootstrapScripts.length) {
        // Load the next bootstrap.
        const fileName = bootstrapScripts[bootstrapIndex];

        const bootstrap = require(fileName); // eslint-disable-line security/detect-non-literal-require
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
Ti.API.info(`${Ti.App.name} ${Ti.App.version} (Powered by Titanium ${"9.1.0"}.${"b8e966d0c9"})`); // Attempt to load crash analytics module.
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRpLm1haW4uanMiXSwibmFtZXMiOlsia05vZGVNb2R1bGVzUkUiLCJjdXN0b21JbnNwZWN0U3ltYm9sIiwiU3ltYm9sIiwiZm9yIiwiaXNCdWZmZXIiLCJjb2xvclJlZ0V4cCIsInJlbW92ZUNvbG9ycyIsInN0ciIsInJlcGxhY2UiLCJpc0Vycm9yIiwiZSIsImlzTmF0aXZlRXJyb3IiLCJFcnJvciIsImdldFN0cnVjdHVyZWRTdGFjayIsIlN0YWNrVHJhY2VFcnJvciIsInByZXBhcmVTdGFja1RyYWNlIiwiZXJyIiwidHJhY2UiLCJzdGFja1RyYWNlTGltaXQiLCJJbmZpbml0eSIsImlzSW5zaWRlTm9kZU1vZHVsZXMiLCJ1bmRlZmluZWQiLCJzdGFjayIsInN0YWNrRnJhbWVzIiwibGluZXMiLCJzcGxpdCIsImxpbmUiLCJsaW5lSW5mbyIsIm1hdGNoIiwiZmlsZW5hbWUiLCJwdXNoIiwiZ2V0RmlsZU5hbWUiLCJBcnJheSIsImlzQXJyYXkiLCJmcmFtZSIsInRlc3QiLCJqb2luIiwib3V0cHV0Iiwic2VwYXJhdG9yIiwibGVuZ3RoIiwibGFzdEluZGV4IiwiaSIsInVuY3VycnlUaGlzIiwiZiIsImNhbGwiLCJhcHBseSIsImFyZ3VtZW50cyIsIkFMTF9QUk9QRVJUSUVTIiwiT05MWV9FTlVNRVJBQkxFIiwicHJvcGVydHlGaWx0ZXIiLCJnZXRPd25Ob25JbmRleFByb3BlcnRpZXMiLCJvYmoiLCJmaWx0ZXIiLCJwcm9wcyIsImtleXMiLCJPYmplY3QiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwia2V5IiwiaXNBbGxEaWdpdHMiLCJzIiwiY29kZSIsImNoYXJDb2RlQXQiLCJUeXBlZEFycmF5UHJvdG90eXBlIiwiZ2V0UHJvdG90eXBlT2YiLCJVaW50OEFycmF5IiwicHJvdG90eXBlIiwiVHlwZWRBcnJheVByb3RvX3RvU3RyaW5nVGFnIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwidG9TdHJpbmdUYWciLCJnZXQiLCJjaGVja1Byb3RvdHlwZSIsInZhbHVlIiwibmFtZSIsInRvU3RyaW5nIiwiaXNBbnlBcnJheUJ1ZmZlciIsImlzQXJyYXlCdWZmZXIiLCJpc1NoYXJlZEFycmF5QnVmZmVyIiwiaXNBcmd1bWVudHNPYmplY3QiLCJpc0FycmF5QnVmZmVyVmlldyIsIkFycmF5QnVmZmVyIiwiaXNWaWV3IiwiaXNBc3luY0Z1bmN0aW9uIiwiaXNCaWdJbnQ2NEFycmF5IiwiaXNCaWdVaW50NjRBcnJheSIsImlzQm9vbGVhbk9iamVjdCIsImlzQm94ZWRQcmltaXRpdmUiLCJpc051bWJlck9iamVjdCIsImlzU3RyaW5nT2JqZWN0IiwiaXNTeW1ib2xPYmplY3QiLCJpc0RhdGFWaWV3IiwiaXNEYXRlIiwiaXNGbG9hdDMyQXJyYXkiLCJpc0Zsb2F0NjRBcnJheSIsImlzR2VuZXJhdG9yRnVuY3Rpb24iLCJpc0dlbmVyYXRvck9iamVjdCIsImlzSW50OEFycmF5IiwiaXNJbnQxNkFycmF5IiwiaXNJbnQzMkFycmF5IiwiaXNNYXAiLCJpc01hcEl0ZXJhdG9yIiwiY29uc3RydWN0b3IiLCJpbmNsdWRlcyIsImlzUHJvbWlzZSIsImlzUmVnRXhwIiwiaXNTZXQiLCJpc1NldEl0ZXJhdG9yIiwiZ2xvYmFsIiwiU2hhcmVkQXJyYXlCdWZmZXIiLCJpc1R5cGVkQXJyYXkiLCJpc0J1aWx0SW5UeXBlZEFycmF5IiwiaXNVaW50OEFycmF5IiwiaXNVaW50OENsYW1wZWRBcnJheSIsImlzVWludDE2QXJyYXkiLCJpc1VpbnQzMkFycmF5IiwiaXNXZWFrTWFwIiwiaXNXZWFrU2V0IiwidHlwZXMiLCJmcmVlemUiLCJfX3Byb3RvX18iLCJlcnJvciIsImxhenlFcnJvciIsImNvZGVzIiwiRVJSX0lOVEVSTkFMX0FTU0VSVElPTiIsImFzc2VydCIsIm1lc3NhZ2UiLCJmYWlsIiwibWVzc2FnZXMiLCJNYXAiLCJTeXN0ZW1FcnJvciIsIkUiLCJzeW0iLCJ2YWwiLCJkZWYiLCJvdGhlckNsYXNzZXMiLCJzZXQiLCJtYWtlTm9kZUVycm9yV2l0aENvZGUiLCJmb3JFYWNoIiwiY2xhenoiLCJCYXNlIiwiTm9kZUVycm9yIiwiYXJncyIsImdldE1lc3NhZ2UiLCJkZWZpbmVQcm9wZXJ0eSIsImVudW1lcmFibGUiLCJ3cml0YWJsZSIsImNvbmZpZ3VyYWJsZSIsImFkZENvZGVUb05hbWUiLCJzZWxmIiwibXNnIiwiZXhwZWN0ZWRMZW5ndGgiLCJ1bnNoaWZ0IiwiZm9ybWF0Iiwic3VmZml4IiwiZXhwZWN0ZWQiLCJhY3R1YWwiLCJkZXRlcm1pbmVyIiwic3RhcnRzV2l0aCIsImVuZHNXaXRoIiwib25lT2YiLCJ0eXBlIiwiVHlwZUVycm9yIiwibWF4U3RhY2tfRXJyb3JOYW1lIiwibWF4U3RhY2tfRXJyb3JNZXNzYWdlIiwiaXNTdGFja092ZXJmbG93RXJyb3IiLCJvdmVyZmxvd1N0YWNrIiwidGhpbmciLCJsZW4iLCJtYXAiLCJTdHJpbmciLCJzbGljZSIsIkFMTF9QUk9QRVJUSUVTJDEiLCJPTkxZX0VOVU1FUkFCTEUkMSIsIlRJX0NPREVDX01BUCIsIlRpIiwiQ29kZWMiLCJDSEFSU0VUX1VURjgiLCJDSEFSU0VUX1VURjE2TEUiLCJDSEFSU0VUX0lTT19MQVRJTl8xIiwiQ0hBUlNFVF9BU0NJSSIsIlZBTElEX0VOQ09ESU5HUyIsImRvdWJsZUFycmF5IiwiRmxvYXQ2NEFycmF5IiwidWludDhEb3VibGVBcnJheSIsImJ1ZmZlciIsImZsb2F0QXJyYXkiLCJGbG9hdDMyQXJyYXkiLCJ1aW50OEZsb2F0QXJyYXkiLCJJTlNQRUNUX01BWF9CWVRFUyIsIkJ1ZmZlciQxIiwiYXJnIiwiZW5jb2RpbmdPck9mZnNldCIsImFwaU5hbWUiLCJzaG93RmxhZ2dlZERlcHJlY2F0aW9uIiwiYWxsb2MiLCJmcm9tIiwidGlCdWZmZXIiLCJzdGFydCIsImRlZmluZVByb3BlcnRpZXMiLCJieXRlT2Zmc2V0IiwiX3RpQnVmZmVyIiwiY29tcGFyZSIsInRhcmdldCIsInRhcmdldFN0YXJ0IiwidGFyZ2V0RW5kIiwic291cmNlU3RhcnQiLCJzb3VyY2VFbmQiLCJidWYxIiwiUmFuZ2VFcnJvciIsInNvdXJjZSIsInNvdXJjZUxlbmd0aCIsImRlc3QiLCJkZXN0TGVuZ3RoIiwiTWF0aCIsIm1pbiIsInRhcmdldFZhbHVlIiwiZ2V0QWRqdXN0ZWRJbmRleCIsInNvdXJjZVZhbHVlIiwiY29weSIsInJlbWFpbmluZyIsImVudHJpZXMiLCJuZXh0SW5kZXgiLCJlbmQiLCJlbnRyeUl0ZXJhdG9yIiwibmV4dCIsInJlc3VsdCIsImRvbmUiLCJpdGVyYXRvciIsImVxdWFscyIsIm90aGVyQnVmZmVyIiwiZmlsbCIsIm9mZnNldCIsImVuY29kaW5nIiwib2Zmc2V0VHlwZSIsInZhbHVlVHlwZSIsImJ1ZlRvRmlsbFdpdGgiLCJmaWxsQnVmTGVuZ3RoIiwiZmlsbENoYXIiLCJpbmRleE9mIiwibWF0Y2hMZW5ndGgiLCJjdXJyZW50SW5kZXgiLCJ0aGlzTGVuZ3RoIiwiZmlyc3RNYXRjaCIsImZpcnN0Qnl0ZU1hdGNoIiwieCIsIm15SXRlcmF0b3IiLCJyZWFkRG91YmxlQkUiLCJjaGVja09mZnNldCIsInJlYWREb3VibGVMRSIsInJlYWRGbG9hdEJFIiwicmVhZEZsb2F0TEUiLCJyZWFkSW50OCIsInVuc2lnbmVkVmFsdWUiLCJyZWFkVUludDgiLCJ1bnNpZ25lZFRvU2lnbmVkIiwicmVhZEludDE2QkUiLCJyZWFkVUludDE2QkUiLCJyZWFkSW50MTZMRSIsInJlYWRVSW50MTZMRSIsInJlYWRJbnQzMkJFIiwicmVhZFVJbnQzMkJFIiwicmVhZEludDMyTEUiLCJyZWFkVUludDMyTEUiLCJyZWFkSW50QkUiLCJieXRlTGVuZ3RoIiwicmVhZFVJbnRCRSIsInJlYWRJbnRMRSIsInJlYWRVSW50TEUiLCJtdWx0aXBsaWVyIiwibmV3QnVmZmVyIiwic3ViYXJyYXkiLCJzd2FwMTYiLCJmaXJzdCIsInNlY29uZCIsInNldEFkanVzdGVkSW5kZXgiLCJzd2FwMzIiLCJ0aGlyZCIsImZvdXJ0aCIsInN3YXA2NCIsImZpZnRoIiwic2l4dGgiLCJzZXZlbnRoIiwiZWlnaHRoIiwidG9KU09OIiwiZGF0YSIsInRvTG93ZXJDYXNlIiwiaXNFbmNvZGluZyIsImNsb25lIiwiYmxvYiIsIlV0aWxzIiwiYmFzZTY0ZW5jb2RlIiwidG9CbG9iIiwiaGV4U3RyIiwiaGV4IiwibGF0aW4xU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiYXNjaWkiLCJidWZmZXJUb1VURjE2U3RyaW5nIiwidG9UaUJ1ZmZlciIsInZhbHVlcyIsIndyaXRlIiwic3RyaW5nIiwic3JjIiwiY29weUJ1ZmZlciIsIndyaXRlRG91YmxlQkUiLCJ3cml0ZURvdWJsZUxFIiwid3JpdGVGbG9hdEJFIiwid3JpdGVGbG9hdExFIiwid3JpdGVJbnQ4IiwiY2hlY2tWYWx1ZSIsIndyaXRlSW50MTZCRSIsIndyaXRlSW50MTZMRSIsIndyaXRlSW50MzJCRSIsIndyaXRlSW50MzJMRSIsIndyaXRlSW50QkUiLCJtaW5NYXhCYXNlIiwicG93IiwiYnl0ZVZhbHVlIiwid3JpdGVJbnRMRSIsIndyaXRlVUludDgiLCJ3cml0ZVVJbnQxNkJFIiwid3JpdGVVSW50MTZMRSIsIndyaXRlVUludDMyQkUiLCJ3cml0ZVVJbnQzMkxFIiwid3JpdGVVSW50QkUiLCJ3cml0ZVVJbnRMRSIsImFsbG9jVW5zYWZlIiwiY3JlYXRlQnVmZmVyIiwiYWxsb2NVbnNhZmVTbG93IiwiYnVmIiwidXRmOEJ5dGVMZW5ndGgiLCJjaGFyQXQiLCJmbG9vciIsImJ1ZjIiLCJjb25jYXQiLCJsaXN0IiwidG90YWxMZW5ndGgiLCJwb3NpdGlvbiIsImJhc2U2NGRlY29kZSIsImJsb2JTdHJlYW0iLCJTdHJlYW0iLCJjcmVhdGVTdHJlYW0iLCJtb2RlIiwiTU9ERV9SRUFEIiwicmVhZEFsbCIsImNsb3NlIiwic3RyaW5nVG9IZXhCeXRlcyIsImdldFRpQ29kZWNDaGFyc2V0IiwicmVjdXJzZVRpbWVzIiwiY3R4IiwibWF4IiwiYWN0dWFsTWF4IiwidHJpbSIsImV4dHJhcyIsInNob3dIaWRkZW4iLCJyZWR1Y2UiLCJjcmVhdGUiLCJpbnNwZWN0IiwiYnJlYWtMZW5ndGgiLCJjb21wYWN0IiwicG9vbFNpemUiLCJCdWZmZXJNb2R1bGUiLCJCdWZmZXIiLCJ0cmFuc2NvZGUiLCJfc291cmNlIiwiX2Zyb21FbmNvZGluZyIsIl90b0VuY29kaW5nIiwia01heExlbmd0aCIsImtTdHJpbmdNYXhMZW5ndGgiLCJjb25zdGFudHMiLCJNQVhfTEVOR1RIIiwiTUFYX1NUUklOR19MRU5HVEgiLCJzaW5nbGVCeXRlIiwiYml0TGVuZ3RoIiwibWF4UG9zaXRpdmVWYWx1ZSIsIm1heFVuc2lnbmVkVmFsdWUiLCJzcmNMZW5ndGgiLCJkZXN0SW5kZXgiLCJyZWxlYXNlIiwib3V0IiwiYnl0ZTEiLCJieXRlMiIsImNvZGVfdW5pdCIsImZyb21Db2RlUG9pbnQiLCJieXRlQXJyYXkiLCJudW1lcmljVmFsdWUiLCJwYXJzZUludCIsInN1YnN0ciIsIk51bWJlciIsImlzTmFOIiwiYXJyYXlJbmRleEhhbmRsZXIiLCJwcm9wS2V5IiwicmVjZWl2ZXIiLCJudW0iLCJpc1NhZmVJbnRlZ2VyIiwiUmVmbGVjdCIsImhhcyIsImluZGV4IiwiUHJveHkiLCJlbmRPZmZzZXQiLCJidWZmZXJXYXJuaW5nQWxyZWFkeUVtaXR0ZWQiLCJub2RlTW9kdWxlc0NoZWNrQ291bnRlciIsImJ1ZmZlcldhcm5pbmciLCJwcm9jZXNzIiwiZW1pdFdhcm5pbmciLCJBTExfUFJPUEVSVElFUyQyIiwiT05MWV9FTlVNRVJBQkxFJDIiLCJCb29sZWFuUHJvdG90eXBlIiwiQm9vbGVhbiIsIkRhdGVQcm90b3R5cGUiLCJEYXRlIiwiRXJyb3JQcm90b3R5cGUiLCJOdW1iZXJQcm90b3R5cGUiLCJNYXBQcm90b3R5cGUiLCJSZWdFeHBQcm90b3R5cGUiLCJSZWdFeHAiLCJTdHJpbmdQcm90b3R5cGUiLCJTZXRQcm90b3R5cGUiLCJTZXQiLCJTeW1ib2xQcm90b3R5cGUiLCJpc0lvcyIsIkVSUl9JTlZBTElEX0FSR19UWVBFIiwiaGFzT3duUHJvcGVydHkiLCJwcm9wZXJ0eUlzRW51bWVyYWJsZSIsImhleFNsaWNlIiwiYnVpbHRJbk9iamVjdHMiLCJpbnNwZWN0RGVmYXVsdE9wdGlvbnMiLCJzZWFsIiwiZGVwdGgiLCJjb2xvcnMiLCJjdXN0b21JbnNwZWN0Iiwic2hvd1Byb3h5IiwibWF4QXJyYXlMZW5ndGgiLCJzb3J0ZWQiLCJnZXR0ZXJzIiwia09iamVjdFR5cGUiLCJrQXJyYXlUeXBlIiwia0FycmF5RXh0cmFzVHlwZSIsInN0ckVzY2FwZVNlcXVlbmNlc1JlZ0V4cCIsInN0ckVzY2FwZVNlcXVlbmNlc1JlcGxhY2VyIiwic3RyRXNjYXBlU2VxdWVuY2VzUmVnRXhwU2luZ2xlIiwic3RyRXNjYXBlU2VxdWVuY2VzUmVwbGFjZXJTaW5nbGUiLCJrZXlTdHJSZWdFeHAiLCJudW1iZXJSZWdFeHAiLCJub2RlTW9kdWxlc1JlZ0V4cCIsImtNaW5MaW5lTGVuZ3RoIiwia1dlYWsiLCJrSXRlcmF0b3IiLCJrTWFwRW50cmllcyIsIm1ldGEiLCJnZXRVc2VyT3B0aW9ucyIsInN0eWxpemUiLCJ1c2VyT3B0aW9ucyIsIm9wdHMiLCJidWRnZXQiLCJpbmRlbnRhdGlvbkx2bCIsInNlZW4iLCJjdXJyZW50RGVwdGgiLCJzdHlsaXplTm9Db2xvciIsIm9wdEtleXMiLCJzdHlsaXplV2l0aENvbG9yIiwiZm9ybWF0VmFsdWUiLCJjdXN0b20iLCJvcHRpb25zIiwiYXNzaWduIiwiYm9sZCIsIml0YWxpYyIsInVuZGVybGluZSIsImludmVyc2UiLCJ3aGl0ZSIsImdyZXkiLCJibGFjayIsImJsdWUiLCJjeWFuIiwiZ3JlZW4iLCJtYWdlbnRhIiwicmVkIiwieWVsbG93Iiwic3R5bGVzIiwic3BlY2lhbCIsIm51bWJlciIsImJpZ2ludCIsImJvb2xlYW4iLCJudWxsIiwic3ltYm9sIiwiZGF0ZSIsInJlZ2V4cCIsIm1vZHVsZSIsImFkZFF1b3RlcyIsInF1b3RlcyIsImVzY2FwZUZuIiwic3RyRXNjYXBlIiwiZXNjYXBlVGVzdCIsImVzY2FwZVJlcGxhY2UiLCJzaW5nbGVRdW90ZSIsImxhc3QiLCJwb2ludCIsInN0eWxlVHlwZSIsInN0eWxlIiwiY29sb3IiLCJnZXRFbXB0eUZvcm1hdEFycmF5IiwiZ2V0Q29uc3RydWN0b3JOYW1lIiwiX2N0eCIsImZpcnN0UHJvdG8iLCJkZXNjcmlwdG9yIiwiZ2V0UHJlZml4IiwidGFnIiwiZmFsbGJhY2siLCJnZXRLZXlzIiwic3ltYm9scyIsImdldE93blByb3BlcnR5U3ltYm9scyIsImdldEN0eFN0eWxlIiwiZmluZFR5cGVkQ29uc3RydWN0b3IiLCJjaGVjayIsIlVpbnQ4Q2xhbXBlZEFycmF5IiwiVWludDE2QXJyYXkiLCJVaW50MzJBcnJheSIsIkludDhBcnJheSIsIkludDE2QXJyYXkiLCJJbnQzMkFycmF5IiwibGF6eU51bGxQcm90b3R5cGVDYWNoZSIsImNsYXp6V2l0aE51bGxQcm90b3R5cGUiLCJjYWNoZWRDbGFzcyIsIk51bGxQcm90b3R5cGUiLCJub1Byb3RvdHlwZUl0ZXJhdG9yIiwibmV3VmFsIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyIsImZvcm1hdFJhdyIsInR5cGVkQXJyYXkiLCJmb3JtYXRQcmltaXRpdmUiLCJjb250ZXh0IiwibWF5YmVDdXN0b20iLCJyZXQiLCJyZXBlYXQiLCJjaXJjdWxhciIsInNpemUiLCJiYXNlIiwiZm9ybWF0dGVyIiwiYnJhY2VzIiwibm9JdGVyYXRvciIsImV4dHJhc1R5cGUiLCJwcmVmaXgiLCJmb3JtYXRBcnJheSIsImZvcm1hdFNldCIsImZvcm1hdE1hcCIsImZvcm1hdFR5cGVkQXJyYXkiLCJnZXRJdGVyYXRvckJyYWNlcyIsImZvcm1hdEl0ZXJhdG9yIiwiZ2V0RnVuY3Rpb25CYXNlIiwicmVnRXhwIiwiZ2V0VGltZSIsInRvSVNPU3RyaW5nIiwiZm9ybWF0RXJyb3IiLCJuYXRpdmVFcnJvclByb3BzIiwiZXZlcnkiLCJhcnJheVR5cGUiLCJmb3JtYXRBcnJheUJ1ZmZlciIsImZvcm1hdE51bWJlciIsImZvcm1hdFByb21pc2UiLCJmb3JtYXRXZWFrU2V0IiwiZm9ybWF0V2Vha0NvbGxlY3Rpb24iLCJmb3JtYXRXZWFrTWFwIiwiZ2V0Qm94ZWRCYXNlIiwic3BlY2lhbEl0ZXJhdG9yIiwiY29uc3RydWN0b3JOYW1lIiwiZm9ybWF0UHJvcGVydHkiLCJoYW5kbGVNYXhDYWxsU3RhY2tTaXplIiwicmVmZXJlbmNlIiwicG9wIiwiY29tcGFyYXRvciIsInNvcnQiLCJzcGxpY2UiLCJyZXMiLCJyZWR1Y2VUb1NpbmdsZVN0cmluZyIsIm5ld0xlbmd0aCIsImZuIiwidmFsdWVPZiIsInN0YWNrTGluZSIsImF0U3ltYm9sSW5kZXgiLCJzb3VyY2VQYXR0ZXJuIiwic3ltYm9sTmFtZSIsInNvdXJjZU1hdGNoIiwiZmlsZVBhdGgiLCJsaW5lTnVtYmVyIiwiY29sdW1uIiwiRmlsZXN5c3RlbSIsInJlc291cmNlc0RpcmVjdG9yeSIsInBvcyIsInN0YWNrU3RhcnQiLCJuZXdTdGFjayIsIm5vZGVNb2R1bGUiLCJleGVjIiwiaW5kZW50YXRpb24iLCJfdmFsdWUiLCJfcmVjdXJzZVRpbWVzIiwiZXh0cmEiLCJkZXNjIiwiZGlmZiIsImxhYmVsIiwic3AiLCJ0bXAiLCJwcmltaXRpdmUiLCJncm91cEFycmF5RWxlbWVudHMiLCJtYXhMZW5ndGgiLCJvdXRwdXRMZW5ndGgiLCJzZXBhcmF0b3JTcGFjZSIsImRhdGFMZW4iLCJhcHByb3hDaGFySGVpZ2h0cyIsImF2ZXJhZ2VCaWFzIiwic3FydCIsImJpYXNlZE1heCIsImNvbHVtbnMiLCJyb3VuZCIsIm1heExpbmVMZW5ndGgiLCJsaW5lTWF4TGVuZ3RoIiwiaiIsIm9yZGVyIiwicGFkZGluZyIsInBhZFN0YXJ0IiwiaXMiLCJmb3JtYXRCaWdJbnQiLCJmb3JtYXRTcGVjaWFsQXJyYXkiLCJlbXB0eUl0ZW1zIiwiZW5kaW5nIiwidmFsTGVuIiwiZWxlbWVudEZvcm1hdHRlciIsInYiLCJrIiwiZm9ybWF0U2V0SXRlcklubmVyIiwic3RhdGUiLCJmb3JtYXRNYXBJdGVySW5uZXIiLCJfa2V5cyIsImlzS2V5VmFsdWUiLCJjdXJyZW50RW50cnkiLCJpc0JlbG93QnJlYWtMZW5ndGgiLCJsbiIsImZvcm1hdFdpdGhPcHRpb25zIiwiZmlyc3RFcnJvckxpbmUiLCJDSVJDVUxBUl9FUlJPUl9NRVNTQUdFIiwidHJ5U3RyaW5naWZ5IiwiSlNPTiIsInN0cmluZ2lmeSIsImEiLCJpbnNwZWN0T3B0aW9ucyIsInRlbXBTdHIiLCJsYXN0UG9zIiwibmV4dENoYXIiLCJ0ZW1wQXJnIiwiY29uc3RyIiwidGVtcE51bSIsInRlbXBJbnRlZ2VyIiwidGVtcEZsb2F0IiwicGFyc2VGbG9hdCIsIm5hdGl2ZURlYnVnIiwiY29uc29sZSIsImRlYnVnIiwibmF0aXZlRXJyb3IiLCJuYXRpdmVJbmZvIiwiaW5mbyIsIm5hdGl2ZUxvZyIsImxvZyIsIm5hdGl2ZVdhcm4iLCJ3YXJuIiwia0NvbG9ySW5zcGVjdE9wdGlvbnMiLCJrTm9Db2xvckluc3BlY3RPcHRpb25zIiwicHJvcGVydGllcyIsImNvbG9yc2V0Iiwib3NWZXJzaW9uIiwidWlNb2R1bGUiLCJVSSIsIkFuZHJvaWQiLCJrcm9sbCIsImJpbmRpbmciLCJUaXRhbml1bSIsIlNFTUFOVElDX0NPTE9SX1RZUEVfTElHSFQiLCJTRU1BTlRJQ19DT0xPUl9UWVBFX0RBUksiLCJjdXJyZW50Q29sb3JUeXBlIiwiY29sb3JUeXBlIiwiZmV0Y2hTZW1hbnRpY0NvbG9yIiwiY29sb3JOYW1lIiwiUGxhdGZvcm0iLCJ2ZXJzaW9uIiwiQXBwIiwiaU9TIiwiY29sb3JzZXRGaWxlIiwiZ2V0RmlsZSIsImV4aXN0cyIsInBhcnNlIiwicmVhZCIsInRleHQiLCJzZW1hbnRpY0NvbG9yVHlwZSIsIl9hZGRMaXN0ZW5lciIsImVtaXR0ZXIiLCJldmVudE5hbWUiLCJsaXN0ZW5lciIsInByZXBlbmQiLCJfZXZlbnRzVG9MaXN0ZW5lcnMiLCJuZXdMaXN0ZW5lciIsImVtaXQiLCJldmVudExpc3RlbmVycyIsImdldE1heExpc3RlbmVycyIsInciLCJjb3VudCIsIm9uY2VXcmFwIiwid3JhcHBlciIsInJlbW92ZUxpc3RlbmVyIiwid3JhcHBlZEZ1bmMiLCJ3cmFwcGVyVGhpcyIsImJvdW5kIiwiYmluZCIsIkV2ZW50RW1pdHRlciIsIl9tYXhMaXN0ZW5lcnMiLCJhZGRMaXN0ZW5lciIsIm9uIiwicHJlcGVuZExpc3RlbmVyIiwib25jZSIsInByZXBlbmRPbmNlTGlzdGVuZXIiLCJmb3VuZEluZGV4IiwidW53cmFwcGVkTGlzdGVuZXIiLCJvZmYiLCJsaXN0ZW5lckNvdW50IiwiZXZlbnROYW1lcyIsImxpc3RlbmVycyIsInJhdyIsImwiLCJyYXdMaXN0ZW5lcnMiLCJkZWZhdWx0TWF4TGlzdGVuZXJzIiwic2V0TWF4TGlzdGVuZXJzIiwibiIsInJlbW92ZUFsbExpc3RlbmVycyIsIm5hbWVzIiwiYXNzZXJ0QXJndW1lbnRUeXBlIiwidHlwZW5hbWUiLCJzdGFydFRpbWUiLCJub3ciLCJzdGFuZGFyZGl6ZUFyY2giLCJvcmlnaW5hbCIsInByb2Nlc3MkMSIsImFib3J0IiwiYXJjaCIsImFyY2hpdGVjdHVyZSIsImFyZ3YiLCJjaGFubmVsIiwiY2hkaXIiLCJjb25maWciLCJjb25uZWN0ZWQiLCJjcHVVc2FnZSIsInVzZXIiLCJzeXN0ZW0iLCJjd2QiLCJfX2Rpcm5hbWUiLCJhc3NldHMiLCJqc29uIiwicmVhZEFzc2V0IiwiZGVwbG95RGF0YSIsImRlYnVnZ2VyUG9ydCIsImRpc2Nvbm5lY3QiLCJkbG9wZW4iLCJ3YXJuaW5nIiwiY3RvciIsImRldGFpbCIsImlzRGVwcmVjYXRpb24iLCJub0RlcHJlY2F0aW9uIiwidGhyb3dEZXByZWNhdGlvbiIsImxvYWRFbnZKc29uIiwianNvbkZpbGUiLCJBUEkiLCJlbnYiLCJleGVjQXJndiIsImV4ZWNQYXRoIiwiZXhpdCIsImV4aXRDb2RlIiwicGlkIiwicGxhdGZvcm0iLCJwcGlkIiwic3RkZXJyIiwiaXNUVFkiLCJjaHVuayIsImNhbGxiYWNrIiwic3Rkb3V0IiwidGl0bGUiLCJ0cmFjZURlcHJlY2F0aW9uIiwidW1hc2siLCJ1cHRpbWUiLCJkaWZmTXMiLCJ2ZXJzaW9ucyIsIm1vZHVsZXMiLCJ2OCIsImpzYyIsIldBUk5JTkdfUFJFRklYIiwidW5jYXVnaHRFeGNlcHRpb25DYWxsYmFjayIsImhhc1VuY2F1Z2h0RXhjZXB0aW9uQ2FwdHVyZUNhbGxiYWNrIiwic2V0VW5jYXVnaHRFeGNlcHRpb25DYXB0dXJlQ2FsbGJhY2siLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJiYWNrdHJhY2UiLCJmaWxlTmFtZSIsInNvdXJjZU5hbWUiLCJjb2x1bW5OdW1iZXIiLCJsaW5lT2Zmc2V0IiwiQ2FsbGJhY2tXaXRoQXJncyIsImZ1bmMiLCJydW4iLCJmdW4iLCJ0aWNrUXVldWUiLCJpbW1lZGlhdGVRdWV1ZSIsImRyYWluaW5nVGlja1F1ZXVlIiwiZHJhaW5RdWV1ZXNUaW1lb3V0IiwiZHJhaW5UaWNrUXVldWUiLCJ0aWNrIiwic2hpZnQiLCJkcmFpblF1ZXVlcyIsImltbWVkaWF0ZXNSZW1haW5pbmciLCJwcm9jZXNzSW1tZWRpYXRlUXVldWUiLCJzZXRUaW1lb3V0IiwiaW1tZWRpYXRlRGVhZGxpbmUiLCJpbW1lZGlhdGUiLCJuZXh0VGljayIsInNldEltbWVkaWF0ZSIsImNsZWFySW1tZWRpYXRlIiwiRk9SV0FSRF9TTEFTSCIsIkJBQ0tXQVJEX1NMQVNIIiwiaXNXaW5kb3dzRGV2aWNlTmFtZSIsImNoYXJDb2RlIiwiaXNBYnNvbHV0ZSIsImlzUG9zaXgiLCJmaWxlcGF0aCIsImZpcnN0Q2hhciIsInRoaXJkQ2hhciIsImRpcm5hbWUiLCJmcm9tSW5kZXgiLCJoYWRUcmFpbGluZyIsImxhc3RJbmRleE9mIiwiZXh0bmFtZSIsImVuZEluZGV4IiwibGFzdEluZGV4V2luMzJTZXBhcmF0b3IiLCJjaGFyIiwiYmFzZW5hbWUiLCJleHQiLCJsYXN0Q2hhckNvZGUiLCJub3JtYWxpemUiLCJpc1dpbmRvd3MiLCJoYWRMZWFkaW5nIiwiaXNVTkMiLCJwYXJ0cyIsInNlZ21lbnQiLCJub3JtYWxpemVkIiwiYXNzZXJ0U2VnbWVudCIsImpvaW4kMSIsInBhdGhzIiwicmVzb2x2ZSIsInJlc29sdmVkIiwiaGl0Um9vdCIsInJlbGF0aXZlIiwidG8iLCJ1cENvdW50IiwicmVtYWluaW5nUGF0aCIsInJvb3QiLCJkaXIiLCJiYXNlTGVuZ3RoIiwidG9TdWJ0cmFjdCIsImZpcnN0Q2hhckNvZGUiLCJ0aGlyZENoYXJDb2RlIiwiZm9ybWF0JDEiLCJwYXRoT2JqZWN0IiwidG9OYW1lc3BhY2VkUGF0aCIsInJlc29sdmVkUGF0aCIsIldpbjMyUGF0aCIsInNlcCIsImRlbGltaXRlciIsIlBvc2l4UGF0aCIsInBhdGgiLCJ3aW4zMiIsInBvc2l4IiwiUG9zaXhDb25zdGFudHMiLCJVVl9VRFBfUkVVU0VBRERSIiwiZXJybm8iLCJFMkJJRyIsIkVBQ0NFUyIsIkVBRERSSU5VU0UiLCJFQUREUk5PVEFWQUlMIiwiRUFGTk9TVVBQT1JUIiwiRUFHQUlOIiwiRUFMUkVBRFkiLCJFQkFERiIsIkVCQURNU0ciLCJFQlVTWSIsIkVDQU5DRUxFRCIsIkVDSElMRCIsIkVDT05OQUJPUlRFRCIsIkVDT05OUkVGVVNFRCIsIkVDT05OUkVTRVQiLCJFREVBRExLIiwiRURFU1RBRERSUkVRIiwiRURPTSIsIkVEUVVPVCIsIkVFWElTVCIsIkVGQVVMVCIsIkVGQklHIiwiRUhPU1RVTlJFQUNIIiwiRUlEUk0iLCJFSUxTRVEiLCJFSU5QUk9HUkVTUyIsIkVJTlRSIiwiRUlOVkFMIiwiRUlPIiwiRUlTQ09OTiIsIkVJU0RJUiIsIkVMT09QIiwiRU1GSUxFIiwiRU1MSU5LIiwiRU1TR1NJWkUiLCJFTVVMVElIT1AiLCJFTkFNRVRPT0xPTkciLCJFTkVURE9XTiIsIkVORVRSRVNFVCIsIkVORVRVTlJFQUNIIiwiRU5GSUxFIiwiRU5PQlVGUyIsIkVOT0RBVEEiLCJFTk9ERVYiLCJFTk9FTlQiLCJFTk9FWEVDIiwiRU5PTENLIiwiRU5PTElOSyIsIkVOT01FTSIsIkVOT01TRyIsIkVOT1BST1RPT1BUIiwiRU5PU1BDIiwiRU5PU1IiLCJFTk9TVFIiLCJFTk9TWVMiLCJFTk9UQ09OTiIsIkVOT1RESVIiLCJFTk9URU1QVFkiLCJFTk9UU09DSyIsIkVOT1RTVVAiLCJFTk9UVFkiLCJFTlhJTyIsIkVPUE5PVFNVUFAiLCJFT1ZFUkZMT1ciLCJFUEVSTSIsIkVQSVBFIiwiRVBST1RPIiwiRVBST1RPTk9TVVBQT1JUIiwiRVBST1RPVFlQRSIsIkVSQU5HRSIsIkVST0ZTIiwiRVNQSVBFIiwiRVNSQ0giLCJFU1RBTEUiLCJFVElNRSIsIkVUSU1FRE9VVCIsIkVUWFRCU1kiLCJFV09VTERCTE9DSyIsIkVYREVWIiwic2lnbmFscyIsIlNJR0hVUCIsIlNJR0lOVCIsIlNJR1FVSVQiLCJTSUdJTEwiLCJTSUdUUkFQIiwiU0lHQUJSVCIsIlNJR0lPVCIsIlNJR0JVUyIsIlNJR0ZQRSIsIlNJR0tJTEwiLCJTSUdVU1IxIiwiU0lHU0VHViIsIlNJR1VTUjIiLCJTSUdQSVBFIiwiU0lHQUxSTSIsIlNJR1RFUk0iLCJTSUdDSExEIiwiU0lHQ09OVCIsIlNJR1NUT1AiLCJTSUdUU1RQIiwiU0lHVFRJTiIsIlNJR1RUT1UiLCJTSUdVUkciLCJTSUdYQ1BVIiwiU0lHWEZTWiIsIlNJR1ZUQUxSTSIsIlNJR1BST0YiLCJTSUdXSU5DSCIsIlNJR0lPIiwiU0lHSU5GTyIsIlNJR1NZUyIsInByaW9yaXR5IiwiUFJJT1JJVFlfTE9XIiwiUFJJT1JJVFlfQkVMT1dfTk9STUFMIiwiUFJJT1JJVFlfTk9STUFMIiwiUFJJT1JJVFlfQUJPVkVfTk9STUFMIiwiUFJJT1JJVFlfSElHSCIsIlBSSU9SSVRZX0hJR0hFU1QiLCJPUyIsIkVPTCIsImNwdXMiLCJwcm9jZXNzb3JDb3VudCIsImFycmF5IiwibW9kZWwiLCJzcGVlZCIsInRpbWVzIiwibmljZSIsInN5cyIsImlkbGUiLCJpcnEiLCJlbmRpYW5uZXNzIiwiZ2V0TmF0aXZlQnl0ZU9yZGVyIiwiTElUVExFX0VORElBTiIsImZyZWVtZW0iLCJhdmFpbGFibGVNZW1vcnkiLCJnZXRQcmlvcml0eSIsImhvbWVkaXIiLCJhcHBsaWNhdGlvbkRhdGFEaXJlY3RvcnkiLCJob3N0bmFtZSIsImFkZHJlc3MiLCJsb2FkYXZnIiwibmV0d29ya0ludGVyZmFjZXMiLCJzZXRQcmlvcml0eSIsInRtcGRpciIsInRlbXBEaXJlY3RvcnkiLCJ0b3RhbG1lbSIsInRvdGFsTWVtb3J5IiwidXNlckluZm8iLCJ1aWQiLCJndWlkIiwidXNlcm5hbWUiLCJzaGVsbCIsInR0eSIsImlzYXR0eSIsIlJlYWRTdHJlYW0iLCJXcml0ZVN0cmVhbSIsIk1PTlRIUyIsInV0aWwiLCJpc0Jvb2xlYW4iLCJpc0Z1bmN0aW9uIiwiaXNOdWxsIiwiaXNOdWxsT3JVbmRlZmluZWQiLCJpc051bWJlciIsImlzT2JqZWN0IiwiaXNQcmltaXRpdmUiLCJpc1N0cmluZyIsImlzU3ltYm9sIiwiaXNVbmRlZmluZWQiLCJ0aW1lIiwiZ2V0SG91cnMiLCJnZXRNaW51dGVzIiwiZ2V0U2Vjb25kcyIsImdldERhdGUiLCJnZXRNb250aCIsInByaW50IiwicHV0cyIsImluaGVyaXRzIiwic3VwZXJDb25zdHJ1Y3RvciIsInNldFByb3RvdHlwZU9mIiwicHJvbWlzaWZ5Iiwid3JhcHBlZCIsIlByb21pc2UiLCJyZWplY3QiLCJjYWxsYmFja2lmeSIsInByb21pc2UiLCJ0aGVuIiwiY2F0Y2giLCJ3cmFwcGVkRXJyb3IiLCJyZWFzb24iLCJkZXByZWNhdGUiLCJ3YXJuZWQiLCJub29wIiwiZGVidWdsb2ciLCJERUZBVUxUX01FU1NBR0VTIiwiZGVlcFN0cmljdEVxdWFsIiwic3RyaWN0RXF1YWwiLCJkZWVwRXF1YWwiLCJlcXVhbCIsIm5vdERlZXBTdHJpY3RFcXVhbCIsIm5vdFN0cmljdEVxdWFsIiwibm90RGVlcEVxdWFsIiwibm90RXF1YWwiLCJDT01QQVJFX1RZUEUiLCJTVFJJQ1RORVNTIiwiU3RyaWN0IiwiTG9vc2UiLCJBc3NlcnRpb25FcnJvciIsIm9wZXJhdG9yIiwiZ2VuZXJhdGVkTWVzc2FnZSIsImFzc2VydCQxIiwib2siLCJ0aHJvd0Vycm9yIiwiY29tcGFyZU1hcHMiLCJzdHJpY3RuZXNzIiwicmVmZXJlbmNlcyIsImxvb3NlQ2hlY2tzIiwiYWRkIiwiZXhwZWN0ZWRLZXkiLCJleHBlY3RlZFZhbHVlIiwiZm91bmQiLCJkZWxldGUiLCJjb21wYXJlU2V0cyIsIm9iamVjdCIsImFjdHVhbFRhZyIsImV4cGVjdGVkVGFnIiwiYWN0dWFsUHJvdG90eXBlIiwiZXhwZWN0ZWRQcm90b3R5cGUiLCJjb21wYXJpc29uIiwiZmxhZ3MiLCJhY3R1YWxLZXlzIiwiZXhwZWN0ZWRLZXlzIiwiYWN0dWFsU3ltYm9scyIsImV4cGVjdGVkU3ltYm9scyIsImFjdHVhbElzRW51bWVyYWJsZSIsImV4cGVjdGVkSXNFbnVtZXJhYmxlIiwibWVtb2l6ZWRBY3R1YWwiLCJtZW1vaXplZEV4cGVjdGVkIiwiTk9fRVhDRVBUSU9OIiwiZXhlY3V0ZSIsImlzUHJvbWlzZUxpa2UiLCJleGVjdXRlUHJvbWlzZSIsImZuVHlwZSIsInRocm93cyIsImNoZWNrRXJyb3IiLCJyZWplY3RzIiwiYXN5bmNGbiIsImRvZXNOb3RUaHJvdyIsImRvZXNOb3RSZWplY3QiLCJpc1Byb3RvdHlwZU9mIiwiaWZFcnJvciIsInN0cmljdCIsIlN0cmluZ0RlY29kZXIiLCJfaW1wbCIsIlV0ZjhTdHJpbmdEZWNvZGVyIiwiVXRmMTZTdHJpbmdEZWNvZGVyIiwiQmFzZTY0U3RyaW5nRGVjb2RlciIsIlN0cmluZ0RlY29kZXJJbXBsIiwiYnl0ZUNvdW50IiwiY2hhckxlbmd0aCIsIk11bHRpQnl0ZVN0cmluZ0RlY29kZXJJbXBsIiwiYnl0ZXNQZXJDaGFyIiwiaW5jb21wbGV0ZSIsIl9jaGVja0luY29tcGxldGVCeXRlcyIsIl9idWZmZXIiLCJfaW5jb21wbGV0ZUVuZCIsIl9pbmNvbXBsZXRlQnVmZmVyRW1wdGllZCIsImxlZnQiLCJieXRlc0NvcGllZCIsImluY29tcGxldGVDaGFyRGF0YSIsImJ5dGVzTmVlZGVkIiwiaW5jb21wbGV0ZUNoYXJJbmRleCIsImJ5dGVzVG9Db3B5IiwiY2hlY2tDaGFyTGVuZ3RoRm9yVVRGOCIsIm1vZHVsbyIsImJ5dGUiLCJTdHJpbmdEZWNvZGVyJDEiLCJwcmludGVkV2FybmluZ3MiLCJvbmVUaW1lV2FybmluZyIsInVuc3VwcG9ydGVkTm9vcCIsIm1vZHVsZU5hbWUiLCJmcW4iLCJhc3luY1Vuc3VwcG9ydGVkTm9vcCIsIm1heWJlQ2FsbGJhY2siLCJDT1BZX0ZJTEVfQ0hVTktfU0laRSIsImZpbGVEZXNjcmlwdG9ycyIsImZpbGVEZXNjcmlwdG9yQ291bnQiLCJGTEFHU19UT19USV9NT0RFIiwiTU9ERV9BUFBFTkQiLCJNT0RFX1dSSVRFIiwicGVybWlzc2lvbkRlbmllZCIsInN5c2NhbGwiLCJtYWtlRXJyb3IiLCJub1N1Y2hGaWxlIiwiZmlsZUFscmVhZHlFeGlzdHMiLCJub3RBRGlyZWN0b3J5IiwiZGlyZWN0b3J5Tm90RW1wdHkiLCJpbGxlZ2FsT3BlcmF0aW9uT25BRGlyZWN0b3J5IiwiZnMiLCJPX1JET05MWSIsIk9fV1JPTkxZIiwiT19SRFdSIiwiU19JRk1UIiwiU19JRlJFRyIsIlNfSUZESVIiLCJTX0lGQ0hSIiwiU19JRkJMSyIsIlNfSUZJRk8iLCJTX0lGTE5LIiwiU19JRlNPQ0siLCJPX0NSRUFUIiwiT19FWENMIiwiT19OT0NUVFkiLCJPX1RSVU5DIiwiT19BUFBFTkQiLCJPX0RJUkVDVE9SWSIsIk9fTk9GT0xMT1ciLCJPX1NZTkMiLCJPX0RTWU5DIiwiT19TWU1MSU5LIiwiT19OT05CTE9DSyIsIlNfSVJXWFUiLCJTX0lSVVNSIiwiU19JV1VTUiIsIlNfSVhVU1IiLCJTX0lSV1hHIiwiU19JUkdSUCIsIlNfSVdHUlAiLCJTX0lYR1JQIiwiU19JUldYTyIsIlNfSVJPVEgiLCJTX0lXT1RIIiwiU19JWE9USCIsIkZfT0siLCJSX09LIiwiV19PSyIsIlhfT0siLCJVVl9GU19DT1BZRklMRV9FWENMIiwiQ09QWUZJTEVfRVhDTCIsIlN0YXRzIiwiX2ZpbGUiLCJkZXYiLCJpbm8iLCJubGluayIsImdpZCIsInJkZXYiLCJibGtzaXplIiwiYmxvY2tzIiwiYXRpbWVNcyIsIm10aW1lTXMiLCJjdGltZU1zIiwiYmlydGh0aW1lTXMiLCJhdGltZSIsIm10aW1lIiwiY3RpbWUiLCJiaXJ0aHRpbWUiLCJnZXRUaUZpbGVGcm9tUGF0aExpa2VWYWx1ZSIsImNyZWF0ZWRBdCIsIm1vZGlmaWVkQXQiLCJjZWlsIiwiaXNGaWxlIiwiaXNEaXJlY3RvcnkiLCJpc0Jsb2NrRGV2aWNlIiwiaXNDaGFyYWN0ZXJEZXZpY2UiLCJpc1N5bWJvbGljTGluayIsInN5bWJvbGljTGluayIsImlzRklGTyIsImlzU29ja2V0IiwiYWNjZXNzIiwiYWNjZXNzU3luYyIsImZpbGVIYW5kbGUiLCJleGVjdXRhYmxlIiwiYXBwZW5kRmlsZSIsImZpbGUiLCJtZXJnZURlZmF1bHRPcHRpb25zIiwiZmxhZyIsIndyaXRlRmlsZSIsImFwcGVuZEZpbGVTeW5jIiwid3JpdGVGaWxlU3luYyIsImNobW9kIiwiY2htb2RTeW5jIiwiZmQiLCJjbG9zZVN5bmMiLCJzdHJlYW0iLCJzdHJlYW1Gb3JEZXNjcmlwdG9yIiwiY29weUZpbGUiLCJzcmNGaWxlIiwic3JjU3RyZWFtIiwib3BlbiIsImRlc3RGaWxlIiwiZGVzdFN0cmVhbSIsInBpcGUiLCJjb3B5RmlsZVN5bmMiLCJleGlzdHNTeW5jIiwiZmNobW9kIiwiZmNobW9kU3luYyIsImZjaG93biIsImZjaG93blN5bmMiLCJmZGF0YXN5bmMiLCJmZGF0YXN5bmNTeW5jIiwiZnN0YXQiLCJzdGF0cyIsImZzdGF0U3luYyIsIl9vcHRpb25zIiwicGF0aEZvckZpbGVEZXNjcmlwdG9yIiwic3RhdFN5bmMiLCJsc3RhdCIsInN0YXQiLCJsc3RhdFN5bmMiLCJta2RpciIsInJlY3Vyc2l2ZSIsIm1rZGlyU3luYyIsInRpRmlsZSIsImNyZWF0ZURpcmVjdG9yeSIsIm1rZHRlbXAiLCJ0cnlNa2R0ZW1wIiwiZ2VuZXJhdGVkIiwicmFuZG9tQ2hhcmFjdGVycyIsIm1rZHRlbXBTeW5jIiwicmV0cnlDb3VudCIsIk1BWF9SRVRSSUVTIiwiZmlsZURlc2NyaXB0b3IiLCJvcGVuU3luYyIsIl9tb2RlIiwiY3JlYXRlRmlsZSIsInBhcmVudCIsInRpTW9kZSIsImNyZWF0ZUZpbGVEZXNjcmlwdG9yIiwidGlGaWxlU3RyZWFtIiwicmVhZE9iaiIsInN1Y2Nlc3MiLCJieXRlc1Byb2Nlc3NlZCIsInJlYWRTeW5jIiwiX3Bvc2l0aW9uIiwiZmlsZVN0cmVhbSIsInJlYWRkaXIiLCJyZWFkZGlyU3luYyIsIndpdGhGaWxlVHlwZXMiLCJsaXN0aW5nIiwiZ2V0RGlyZWN0b3J5TGlzdGluZyIsInJlYWRGaWxlUG9zdE9wZW4iLCJmaWxlU2l6ZSIsInNvdXJjZVN0cmVhbSIsInJlYWRBbGxPYmoiLCJyZWFkRmlsZSIsIndhc0ZpbGVEZXNjcmlwdG9yIiwiaGFuZGxlQnVmZmVyIiwiZW5jb2RlQnVmZmVyIiwicmVhZEZpbGVTeW5jIiwicmVhbHBhdGgiLCJyZXN1bHRFeGlzdHMiLCJzZWdtZW50cyIsInBhcnRpYWxGaWxlUGF0aCIsInRyeVBhdGgiLCJwYXJ0aWFsRXhpc3RzIiwibmF0aXZlIiwicmVhbHBhdGhTeW5jIiwicmVuYW1lIiwib2xkUGF0aCIsIm5ld1BhdGgiLCJyZW5hbWVTeW5jIiwidGVtcFBhdGgiLCJtb3ZlIiwidW5saW5rIiwiX2VyciIsInRtcEZpbGUiLCJybWRpciIsInJtZGlyU3luYyIsImRlbGV0ZURpcmVjdG9yeSIsInN1YkZpbGVzIiwic3ltbGluayIsInN5bWxpbmtTeW5jIiwidHJ1bmNhdGUiLCJieXRlc1JlYWQiLCJ0cnVuY2F0ZVN5bmMiLCJ1bmxpbmtTeW5jIiwiZGVsZXRlRmlsZSIsInVud2F0Y2hGaWxlIiwidXRpbWVzIiwidXRpbWVzU3luYyIsIndhdGNoIiwid2F0Y2hGaWxlIiwiZmluaXNoIiwid3JpdGVTeW5jIiwid3JpdGVUaUZpbGVTdHJlYW0iLCJ3cml0ZU9iaiIsIndyaXRlQnVmZmVyIiwid3JpdGVTdHJpbmciLCJ3cml0ZUJ1ZmZlclN5bmMiLCJ3cml0ZVN0cmluZ1N5bmMiLCJGaWxlRGVzY3JpcHRvciIsInBpcGVWaWFXcml0ZVN0cmVhbSIsIndyaXRlU3RyZWFtIiwicG9pbnRlciIsImRlZmF1bHRzIiwib3B0aW9uc1R5cGUiLCJtZXJnZWQiLCJjYiIsIl9lbmNvZGluZyIsInJhbmRvbSIsImJpbmRpbmdzIiwicmVkaXJlY3RzIiwiaXNIaWphY2thYmxlTW9kdWxlSWQiLCJvcmlnaW5hbFJlcXVpcmUiLCJyZXF1aXJlIiwibW9kdWxlSWQiLCJvcmlnaW5hbE1vZHVsZVJlcXVpcmUiLCJNb2R1bGUiLCJyZWdpc3RlciIsInJlZGlyZWN0IiwiZmV0Y2hTY3JpcHRzRnJvbUpzb24iLCJKU09OX0ZJTEVfTkFNRSIsInNldHRpbmdzIiwic2NyaXB0cyIsImZldGNoU2NyaXB0c0Zyb21SZXNvdXJjZXNEaXJlY3RvcnkiLCJyZXNvdXJjZURpcmVjdG9yeSIsInJlc291cmNlRGlyZWN0b3J5UGF0aExlbmd0aCIsIm5hdGl2ZVBhdGgiLCJib290c3RyYXBTY3JpcHRzIiwibG9hZEZyb20iLCJmaWxlTmFtZUFycmF5Iiwic2VhcmNoIiwiYm9vdHN0cmFwUGF0aCIsImxvYWRBc3luYyIsImZpbmlzaGVkIiwibG9hZEJvb3RzdHJhcFNjcmlwdHMiLCJib290c3RyYXBJbmRleCIsImRvTG9hZCIsImJvb3RzdHJhcCIsIm9uQm9vdHN0cmFwRXhlY3V0aW9uRmluaXNoZWQiLCJmaXJlRXZlbnQiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0EsTUFBTUEsY0FBYyxHQUFHLDZCQUF2QjtBQUNBLE1BQU1DLG1CQUFtQixHQUFHQyxNQUFNLENBQUNDLEdBQVAsQ0FBVyw0QkFBWCxDQUE1QjtBQUNBLE1BQU1DLFFBQVEsR0FBR0YsTUFBTSxDQUFDQyxHQUFQLENBQVcsMEJBQVgsQ0FBakI7QUFDQSxNQUFNRSxXQUFXLEdBQUcsaUJBQXBCLEMsQ0FBdUM7O0FBRXZDLFNBQVNDLFlBQVQsQ0FBc0JDLEdBQXRCLEVBQTJCO0FBQ3pCLFNBQU9BLEdBQUcsQ0FBQ0MsT0FBSixDQUFZSCxXQUFaLEVBQXlCLEVBQXpCLENBQVA7QUFDRDtBQUNELFNBQVNJLE9BQVQsQ0FBaUJDLENBQWpCLEVBQW9CO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBLFNBQU9DLGFBQWEsQ0FBQ0QsQ0FBRCxDQUFiLElBQW9CQSxDQUFDLFlBQVlFLEtBQXhDO0FB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QUFDdEM7QUFDQTtBQUNBSCxNQUFBQSxjQUFjO0FBQ2Q1a0IsTUFBQUEsVUFBVSxDQUFDLE1BQU02a0IsTUFBTSxFQUFiLEVBQWlCLENBQWpCLENBQVY7QUFDRDs7QUFFREEsSUFBQUEsTUFBTTtBQUNQLEdBdkQwQixDQXVEekI7QUFDRjs7O0FBR0FGLEVBQUFBLG9CQUFvQixDQUFDRCxRQUFELENBQXBCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7OztBQVlBO0FBQ0Exc0MsRUFBRSxDQUFDZ2xCLEdBQUgsQ0FBTzVHLElBQVAsQ0FBYSxHQUFFcGUsRUFBRSxDQUFDNGYsR0FBSCxDQUFPam1CLElBQUssSUFBR3FHLEVBQUUsQ0FBQzRmLEdBQUgsQ0FBT0QsT0FBUSx5QkFBd0IsT0FBUSxJQUFHLFlBQWEsR0FBN0YsRSxDQUFrRztBQUNsRzs7QUFFQSxJQUFJO0FBQ0YyckIsRUFBQUEsT0FBTyxDQUFDLHNCQUFELENBQVA7QUFDRCxDQUZELENBRUUsT0FBT3oxQyxDQUFQLEVBQVUsQ0FBRSxDLENBQUM7QUFDZjQyQyxTQUFTLENBQUMsWUFBWTtBQUNwQjtBQUNBO0FBQ0FuQixFQUFBQSxPQUFPLENBQUMsT0FBRCxDQUFQLENBSG9CLENBR0Y7QUFDbEI7QUFDQTs7O0FBR0F0ckMsRUFBQUEsRUFBRSxDQUFDNGYsR0FBSCxDQUFPb3RCLFNBQVAsQ0FBaUIsU0FBakI7QUFDRCxDQVRRLENBQVQiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8vIENvcHlyaWdodCBOb2RlLmpzIGNvbnRyaWJ1dG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbmNvbnN0IGtOb2RlTW9kdWxlc1JFID0gL14oLiopW1xcXFwvXW5vZGVfbW9kdWxlc1tcXFxcL10vO1xuY29uc3QgY3VzdG9tSW5zcGVjdFN5bWJvbCA9IFN5bWJvbC5mb3IoJ25vZGVqcy51dGlsLmluc3BlY3QuY3VzdG9tJyk7XG5jb25zdCBpc0J1ZmZlciA9IFN5bWJvbC5mb3IoJ3RpdGFuaXVtLmJ1ZmZlci5pc0J1ZmZlcicpO1xuY29uc3QgY29sb3JSZWdFeHAgPSAvXFx1MDAxYlxcW1xcZFxcZD9tL2c7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29udHJvbC1yZWdleFxuXG5mdW5jdGlvbiByZW1vdmVDb2xvcnMoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShjb2xvclJlZ0V4cCwgJycpO1xufVxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIC8vIEFuIGVycm9yIGNvdWxkIGJlIGFuIGluc3RhbmNlIG9mIEVycm9yIHdoaWxlIG5vdCBiZWluZyBhIG5hdGl2ZSBlcnJvclxuICAvLyBvciBjb3VsZCBiZSBmcm9tIGEgZGlmZmVyZW50IHJlYWxtIGFuZCBub3QgYmUgaW5zdGFuY2Ugb2YgRXJyb3IgYnV0IHN0aWxsXG4gIC8vIGJlIGEgbmF0aXZlIGVycm9yLlxuICByZXR1cm4gaXNOYXRpdmVFcnJvcihlKSB8fCBlIGluc3RhbmNlb2YgRXJyb3I7XG59XG5sZXQgZ2V0U3RydWN0dXJlZFN0YWNrO1xuXG5jbGFzcyBTdGFja1RyYWNlRXJyb3IgZXh0ZW5kcyBFcnJvciB7fVxuXG5TdGFja1RyYWNlRXJyb3IucHJlcGFyZVN0YWNrVHJhY2UgPSAoZXJyLCB0cmFjZSkgPT4gdHJhY2U7XG5cblN0YWNrVHJhY2VFcnJvci5zdGFja1RyYWNlTGltaXQgPSBJbmZpbml0eTtcbmZ1bmN0aW9uIGlzSW5zaWRlTm9kZU1vZHVsZXMoKSB7XG4gIGlmIChnZXRTdHJ1Y3R1cmVkU3RhY2sgPT09IHVuZGVmaW5lZCkge1xuICAgIGdldFN0cnVjdHVyZWRTdGFjayA9ICgpID0+IG5ldyBTdGFja1RyYWNlRXJyb3IoKS5zdGFjaztcbiAgfVxuXG4gIGxldCBzdGFjayA9IGdldFN0cnVjdHVyZWRTdGFjaygpOyAvLyBzdGFjayBpcyBvbmx5IGFuIGFycmF5IG9uIHY4LCB0cnkgdG8gY29udmVydCBtYW51YWxseSBpZiBzdHJpbmdcblxuICBpZiAodHlwZW9mIHN0YWNrID09PSAnc3RyaW5nJykge1xuICAgIGNvbnN0IHN0YWNrRnJhbWVzID0gW107XG4gICAgY29uc3QgbGluZXMgPSBzdGFjay5zcGxpdCgvXFxuLyk7XG5cbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgIGNvbnN0IGxpbmVJbmZvID0gbGluZS5tYXRjaCgvKC4qKUAoLiopOihcXGQrKTooXFxkKykvKTtcblxuICAgICAgaWYgKGxpbmVJbmZvKSB7XG4gICAgICAgIGNvbnN0IGZpbGVuYW1lID0gbGluZUluZm9bMl0ucmVwbGFjZSgnZmlsZTovLycsICcnKTtcbiAgICAgICAgc3RhY2tGcmFtZXMucHVzaCh7XG4gICAgICAgICAgZ2V0RmlsZU5hbWU6ICgpID0+IGZpbGVuYW1lXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YWNrID0gc3RhY2tGcmFtZXM7XG4gIH0gLy8gSXRlcmF0ZSBvdmVyIGFsbCBzdGFjayBmcmFtZXMgYW5kIGxvb2sgZm9yIHRoZSBmaXJzdCBvbmUgbm90IGNvbWluZ1xuICAvLyBmcm9tIGluc2lkZSBOb2RlLmpzIGl0c2VsZjpcblxuXG4gIGlmIChBcnJheS5pc0FycmF5KHN0YWNrKSkge1xuICAgIGZvciAoY29uc3QgZnJhbWUgb2Ygc3RhY2spIHtcbiAgICAgIGNvbnN0IGZpbGVuYW1lID0gZnJhbWUuZ2V0RmlsZU5hbWUoKTsgLy8gSWYgYSBmaWxlbmFtZSBkb2VzIG5vdCBzdGFydCB3aXRoIC8gb3IgY29udGFpbiBcXCxcbiAgICAgIC8vIGl0J3MgbGlrZWx5IGZyb20gTm9kZS5qcyBjb3JlLlxuXG4gICAgICBpZiAoIS9eXFwvfFxcXFwvLnRlc3QoZmlsZW5hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ga05vZGVNb2R1bGVzUkUudGVzdChmaWxlbmFtZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gam9pbihvdXRwdXQsIHNlcGFyYXRvcikge1xuICBsZXQgc3RyID0gJyc7XG5cbiAgaWYgKG91dHB1dC5sZW5ndGggIT09IDApIHtcbiAgICBjb25zdCBsYXN0SW5kZXggPSBvdXRwdXQubGVuZ3RoIC0gMTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFzdEluZGV4OyBpKyspIHtcbiAgICAgIC8vIEl0IGlzIGZhc3RlciBub3QgdG8gdXNlIGEgdGVtcGxhdGUgc3RyaW5nIGhlcmVcbiAgICAgIHN0ciArPSBvdXRwdXRbaV07XG4gICAgICBzdHIgKz0gc2VwYXJhdG9yO1xuICAgIH1cblxuICAgIHN0ciArPSBvdXRwdXRbbGFzdEluZGV4XTtcbiAgfVxuXG4gIHJldHVybiBzdHI7XG59XG5mdW5jdGlvbiB1bmN1cnJ5VGhpcyhmKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGYuY2FsbC5hcHBseShmLCBhcmd1bWVudHMpO1xuICB9O1xufVxuY29uc3QgQUxMX1BST1BFUlRJRVMgPSAwO1xuY29uc3QgT05MWV9FTlVNRVJBQkxFID0gMjtcbmNvbnN0IHByb3BlcnR5RmlsdGVyID0ge1xuICBBTExfUFJPUEVSVElFUyxcbiAgT05MWV9FTlVNRVJBQkxFXG59O1xuZnVuY3Rpb24gZ2V0T3duTm9uSW5kZXhQcm9wZXJ0aWVzKG9iaiwgZmlsdGVyKSB7XG4gIGNvbnN0IHByb3BzID0gW107XG4gIGNvbnN0IGtleXMgPSBmaWx0ZXIgPT09IE9OTFlfRU5VTUVSQUJMRSA/IE9iamVjdC5rZXlzKG9iaikgOiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IGtleSA9IGtleXNbaV07XG5cbiAgICBpZiAoIWlzQWxsRGlnaXRzKGtleSkpIHtcbiAgICAgIHByb3BzLnB1c2goa2V5KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcHJvcHM7XG59XG5cbmZ1bmN0aW9uIGlzQWxsRGlnaXRzKHMpIHtcbiAgaWYgKHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzLmxlbmd0aDsgKytpKSB7XG4gICAgY29uc3QgY29kZSA9IHMuY2hhckNvZGVBdChpKTtcblxuICAgIGlmIChjb2RlIDwgNDggfHwgY29kZSA+IDU3KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIENvcHlyaWdodCBOb2RlLmpzIGNvbnRyaWJ1dG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbmNvbnN0IFR5cGVkQXJyYXlQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoVWludDhBcnJheS5wcm90b3R5cGUpO1xuY29uc3QgVHlwZWRBcnJheVByb3RvX3RvU3RyaW5nVGFnID0gdW5jdXJyeVRoaXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihUeXBlZEFycmF5UHJvdG90eXBlLCBTeW1ib2wudG9TdHJpbmdUYWcpLmdldCk7XG5cbmZ1bmN0aW9uIGNoZWNrUHJvdG90eXBlKHZhbHVlLCBuYW1lKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09IGBbb2JqZWN0ICR7bmFtZX1dYDtcbn1cblxuZnVuY3Rpb24gaXNBbnlBcnJheUJ1ZmZlcih2YWx1ZSkge1xuICBpZiAoaXNBcnJheUJ1ZmZlcih2YWx1ZSkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBpc1NoYXJlZEFycmF5QnVmZmVyKHZhbHVlKTtcbn1cbmZ1bmN0aW9uIGlzQXJndW1lbnRzT2JqZWN0KHZhbHVlKSB7XG4gIHJldHVybiBjaGVja1Byb3RvdHlwZSh2YWx1ZSwgJ0FyZ3VtZW50cycpO1xufVxuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWx1ZSkge1xuICByZXR1cm4gY2hlY2tQcm90b3R5cGUodmFsdWUsICdBcnJheUJ1ZmZlcicpO1xufSAvLyBDYWNoZWQgdG8gbWFrZSBzdXJlIG5vIHVzZXJsYW5kIGNvZGUgY2FuIHRhbXBlciB3aXRoIGl0LlxuXG5jb25zdCBpc0FycmF5QnVmZmVyVmlldyA9IEFycmF5QnVmZmVyLmlzVmlldztcbmZ1bmN0aW9uIGlzQXN5bmNGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gY2hlY2tQcm90b3R5cGUodmFsdWUsICdBc3luY0Z1bmN0aW9uJyk7XG59XG5mdW5jdGlvbiBpc0JpZ0ludDY0QXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIFR5cGVkQXJyYXlQcm90b190b1N0cmluZ1RhZyh2YWx1ZSkgPT09ICdCaWdJbnQ2NEFycmF5Jztcbn1cbmZ1bmN0aW9uIGlzQmlnVWludDY0QXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIFR5cGVkQXJyYXlQcm90b190b1N0cmluZ1RhZyh2YWx1ZSkgPT09ICdCaWdVaW50NjRBcnJheSc7XG59XG5mdW5jdGlvbiBpc0Jvb2xlYW5PYmplY3QodmFsdWUpIHtcbiAgcmV0dXJuIGNoZWNrUHJvdG90eXBlKHZhbHVlLCAnQm9vbGVhbicpO1xufVxuZnVuY3Rpb24gaXNCb3hlZFByaW1pdGl2ZSh2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBpc051bWJlck9iamVjdCh2YWx1ZSkgfHwgaXNTdHJpbmdPYmplY3QodmFsdWUpIHx8IGlzQm9vbGVhbk9iamVjdCh2YWx1ZSkgLy8gfHwgaXNCaWdJbnRPYmplY3QodmFsdWUpXG4gIHx8IGlzU3ltYm9sT2JqZWN0KHZhbHVlKTtcbn1cbmZ1bmN0aW9uIGlzRGF0YVZpZXcodmFsdWUpIHtcbiAgcmV0dXJuIGNoZWNrUHJvdG90eXBlKHZhbHVlLCAnRGF0YVZpZXcnKTtcbn1cbmZ1bmN0aW9uIGlzRGF0ZSh2YWx1ZSkge1xuICByZXR1cm4gY2hlY2tQcm90b3R5cGUodmFsdWUsICdEYXRlJyk7XG59IC8vIEB0b2RvIGlzRXh0ZXJuYWxcblxuZnVuY3Rpb24gaXNGbG9hdDMyQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIFR5cGVkQXJyYXlQcm90b190b1N0cmluZ1RhZyh2YWx1ZSkgPT09ICdGbG9hdDMyQXJyYXknO1xufVxuZnVuY3Rpb24gaXNGbG9hdDY0QXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIFR5cGVkQXJyYXlQcm90b190b1N0cmluZ1RhZyh2YWx1ZSkgPT09ICdGbG9hdDY0QXJyYXknO1xufVxuZnVuY3Rpb24gaXNHZW5lcmF0b3JGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gY2hlY2tQcm90b3R5cGUodmFsdWUsICdHZW5lcmF0b3JGdW5jdGlvbicpO1xufVxuZnVuY3Rpb24gaXNHZW5lcmF0b3JPYmplY3QodmFsdWUpIHtcbiAgcmV0dXJuIGNoZWNrUHJvdG90eXBlKHZhbHVlLCAnR2VuZXJhdG9yT2JqZWN0Jyk7XG59XG5mdW5jdGlvbiBpc0ludDhBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gVHlwZWRBcnJheVByb3RvX3RvU3RyaW5nVGFnKHZhbHVlKSA9PT0gJ0ludDhBcnJheSc7XG59XG5mdW5jdGlvbiBpc0ludDE2QXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIFR5cGVkQXJyYXlQcm90b190b1N0cmluZ1RhZyh2YWx1ZSkgPT09ICdJbnQxNkFycmF5Jztcbn1cbmZ1bmN0aW9uIGlzSW50MzJBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gVHlwZWRBcnJheVByb3RvX3RvU3RyaW5nVGFnKHZhbHVlKSA9PT0gJ0ludDMyQXJyYXknO1xufVxuZnVuY3Rpb24gaXNNYXAodmFsdWUpIHtcbiAgcmV0dXJuIGNoZWNrUHJvdG90eXBlKHZhbHVlLCAnTWFwJyk7XG59XG5mdW5jdGlvbiBpc01hcEl0ZXJhdG9yKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKTtcbiAgcmV0dXJuIHByb3RvdHlwZSAmJiBwcm90b3R5cGVbU3ltYm9sLnRvU3RyaW5nVGFnXSA9PT0gJ01hcCBJdGVyYXRvcic7XG59IC8vIEB0b2RvIGlzTW9kdWxlTmFtZXNwYWNlT2JqZWN0XG5cbmZ1bmN0aW9uIGlzTmF0aXZlRXJyb3IodmFsdWUpIHtcbiAgLy8gaWYgbm90IGFuIGluc3RhbmNlIG9mIGFuIEVycm9yLCBkZWZpbml0ZWx5IG5vdCBhIG5hdGl2ZSBlcnJvclxuICBpZiAoISh2YWx1ZSBpbnN0YW5jZW9mIEVycm9yKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghdmFsdWUgfHwgIXZhbHVlLmNvbnN0cnVjdG9yKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIFsnRXJyb3InLCAnRXZhbEVycm9yJywgJ1JhbmdlRXJyb3InLCAnUmVmZXJlbmNlRXJyb3InLCAnU3ludGF4RXJyb3InLCAnVHlwZUVycm9yJywgJ1VSSUVycm9yJ10uaW5jbHVkZXModmFsdWUuY29uc3RydWN0b3IubmFtZSk7XG59XG5mdW5jdGlvbiBpc051bWJlck9iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gY2hlY2tQcm90b3R5cGUodmFsdWUsICdOdW1iZXInKTtcbn1cbmZ1bmN0aW9uIGlzUHJvbWlzZSh2YWx1ZSkge1xuICByZXR1cm4gY2hlY2tQcm90b3R5cGUodmFsdWUsICdQcm9taXNlJyk7XG59IC8vIEB0b2RvIGlzUHJveHlcblxuZnVuY3Rpb24gaXNSZWdFeHAodmFsdWUpIHtcbiAgcmV0dXJuIGNoZWNrUHJvdG90eXBlKHZhbHVlLCAnUmVnRXhwJyk7XG59XG5mdW5jdGlvbiBpc1NldCh2YWx1ZSkge1xuICByZXR1cm4gY2hlY2tQcm90b3R5cGUodmFsdWUsICdTZXQnKTtcbn1cbmZ1bmN0aW9uIGlzU2V0SXRlcmF0b3IodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpO1xuICByZXR1cm4gcHJvdG90eXBlICYmIHByb3RvdHlwZVtTeW1ib2wudG9TdHJpbmdUYWddID09PSAnU2V0IEl0ZXJhdG9yJztcbn1cbmZ1bmN0aW9uIGlzU2hhcmVkQXJyYXlCdWZmZXIodmFsdWUpIHtcbiAgaWYgKCFnbG9iYWwuU2hhcmVkQXJyYXlCdWZmZXIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gY2hlY2tQcm90b3R5cGUodmFsdWUsICdTaGFyZWRBcnJheUJ1ZmZlcicpO1xufVxuZnVuY3Rpb24gaXNTdHJpbmdPYmplY3QodmFsdWUpIHtcbiAgcmV0dXJuIGNoZWNrUHJvdG90eXBlKHZhbHVlLCAnU3RyaW5nJyk7XG59XG5mdW5jdGlvbiBpc1N5bWJvbE9iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gY2hlY2tQcm90b3R5cGUodmFsdWUsICdTeW1ib2wnKTtcbn1cbmZ1bmN0aW9uIGlzVHlwZWRBcnJheSh2YWx1ZSkge1xuICBjb25zdCBpc0J1aWx0SW5UeXBlZEFycmF5ID0gVHlwZWRBcnJheVByb3RvX3RvU3RyaW5nVGFnKHZhbHVlKSAhPT0gdW5kZWZpbmVkO1xuXG4gIGlmIChpc0J1aWx0SW5UeXBlZEFycmF5KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gdmFsdWVbaXNCdWZmZXJdID09PSB0cnVlO1xufVxuZnVuY3Rpb24gaXNVaW50OEFycmF5KHZhbHVlKSB7XG4gIHJldHVybiBUeXBlZEFycmF5UHJvdG9fdG9TdHJpbmdUYWcodmFsdWUpID09PSAnVWludDhBcnJheSc7XG59XG5mdW5jdGlvbiBpc1VpbnQ4Q2xhbXBlZEFycmF5KHZhbHVlKSB7XG4gIHJldHVybiBUeXBlZEFycmF5UHJvdG9fdG9TdHJpbmdUYWcodmFsdWUpID09PSAnVWludDhDbGFtcGVkQXJyYXknO1xufVxuZnVuY3Rpb24gaXNVaW50MTZBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gVHlwZWRBcnJheVByb3RvX3RvU3RyaW5nVGFnKHZhbHVlKSA9PT0gJ1VpbnQxNkFycmF5Jztcbn1cbmZ1bmN0aW9uIGlzVWludDMyQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIFR5cGVkQXJyYXlQcm90b190b1N0cmluZ1RhZyh2YWx1ZSkgPT09ICdVaW50MzJBcnJheSc7XG59XG5mdW5jdGlvbiBpc1dlYWtNYXAodmFsdWUpIHtcbiAgcmV0dXJuIGNoZWNrUHJvdG90eXBlKHZhbHVlLCAnV2Vha01hcCcpO1xufVxuZnVuY3Rpb24gaXNXZWFrU2V0KHZhbHVlKSB7XG4gIHJldHVybiBjaGVja1Byb3RvdHlwZSh2YWx1ZSwgJ1dlYWtTZXQnKTtcbn0gLy8gQHRvZG8gaXNXZWJBc3NlbWJseUNvbXBpbGVkTW9kdWxlXG5cbnZhciB0eXBlcyA9IC8qI19fUFVSRV9fKi9PYmplY3QuZnJlZXplKHtcblx0X19wcm90b19fOiBudWxsLFxuXHRpc0FueUFycmF5QnVmZmVyOiBpc0FueUFycmF5QnVmZmVyLFxuXHRpc0FyZ3VtZW50c09iamVjdDogaXNBcmd1bWVudHNPYmplY3QsXG5cdGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG5cdGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcblx0aXNBc3luY0Z1bmN0aW9uOiBpc0FzeW5jRnVuY3Rpb24sXG5cdGlzQmlnSW50NjRBcnJheTogaXNCaWdJbnQ2NEFycmF5LFxuXHRpc0JpZ1VpbnQ2NEFycmF5OiBpc0JpZ1VpbnQ2NEFycmF5LFxuXHRpc0Jvb2xlYW5PYmplY3Q6IGlzQm9vbGVhbk9iamVjdCxcblx0aXNCb3hlZFByaW1pdGl2ZTogaXNCb3hlZFByaW1pdGl2ZSxcblx0aXNEYXRhVmlldzogaXNEYXRhVmlldyxcblx0aXNEYXRlOiBpc0RhdGUsXG5cdGlzRmxvYXQzMkFycmF5OiBpc0Zsb2F0MzJBcnJheSxcblx0aXNGbG9hdDY0QXJyYXk6IGlzRmxvYXQ2NEFycmF5LFxuXHRpc0dlbmVyYXRvckZ1bmN0aW9uOiBpc0dlbmVyYXRvckZ1bmN0aW9uLFxuXHRpc0dlbmVyYXRvck9iamVjdDogaXNHZW5lcmF0b3JPYmplY3QsXG5cdGlzSW50OEFycmF5OiBpc0ludDhBcnJheSxcblx0aXNJbnQxNkFycmF5OiBpc0ludDE2QXJyYXksXG5cdGlzSW50MzJBcnJheTogaXNJbnQzMkFycmF5LFxuXHRpc01hcDogaXNNYXAsXG5cdGlzTWFwSXRlcmF0b3I6IGlzTWFwSXRlcmF0b3IsXG5cdGlzTmF0aXZlRXJyb3I6IGlzTmF0aXZlRXJyb3IsXG5cdGlzTnVtYmVyT2JqZWN0OiBpc051bWJlck9iamVjdCxcblx0aXNQcm9taXNlOiBpc1Byb21pc2UsXG5cdGlzUmVnRXhwOiBpc1JlZ0V4cCxcblx0aXNTZXQ6IGlzU2V0LFxuXHRpc1NldEl0ZXJhdG9yOiBpc1NldEl0ZXJhdG9yLFxuXHRpc1NoYXJlZEFycmF5QnVmZmVyOiBpc1NoYXJlZEFycmF5QnVmZmVyLFxuXHRpc1N0cmluZ09iamVjdDogaXNTdHJpbmdPYmplY3QsXG5cdGlzU3ltYm9sT2JqZWN0OiBpc1N5bWJvbE9iamVjdCxcblx0aXNUeXBlZEFycmF5OiBpc1R5cGVkQXJyYXksXG5cdGlzVWludDhBcnJheTogaXNVaW50OEFycmF5LFxuXHRpc1VpbnQ4Q2xhbXBlZEFycmF5OiBpc1VpbnQ4Q2xhbXBlZEFycmF5LFxuXHRpc1VpbnQxNkFycmF5OiBpc1VpbnQxNkFycmF5LFxuXHRpc1VpbnQzMkFycmF5OiBpc1VpbnQzMkFycmF5LFxuXHRpc1dlYWtNYXA6IGlzV2Vha01hcCxcblx0aXNXZWFrU2V0OiBpc1dlYWtTZXRcbn0pO1xuXG4vLyBDb3B5cmlnaHQgTm9kZS5qcyBjb250cmlidXRvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5sZXQgZXJyb3I7XG5cbmZ1bmN0aW9uIGxhenlFcnJvcigpIHtcbiAgaWYgKCFlcnJvcikge1xuICAgIC8vIEBmaXhtZSByb2xsdXAgY2Fubm90IGhhbmRsZSBsYXp5IGxvYWRlZCBtb2R1bGVzLCBtYXliZSBtb3ZlIHRvIHdlYnBhY2s/XG4gICAgLy8gZXJyb3IgPSByZXF1aXJlKCcuL2Vycm9ycycpLmNvZGVzLkVSUl9JTlRFUk5BTF9BU1NFUlRJT047XG4gICAgZXJyb3IgPSBjb2Rlcy5FUlJfSU5URVJOQUxfQVNTRVJUSU9OO1xuICB9XG5cbiAgcmV0dXJuIGVycm9yO1xufVxuXG5mdW5jdGlvbiBhc3NlcnQodmFsdWUsIG1lc3NhZ2UpIHtcbiAgaWYgKCF2YWx1ZSkge1xuICAgIGNvbnN0IEVSUl9JTlRFUk5BTF9BU1NFUlRJT04gPSBsYXp5RXJyb3IoKTtcbiAgICB0aHJvdyBuZXcgRVJSX0lOVEVSTkFMX0FTU0VSVElPTihtZXNzYWdlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmYWlsKG1lc3NhZ2UpIHtcbiAgY29uc3QgRVJSX0lOVEVSTkFMX0FTU0VSVElPTiA9IGxhenlFcnJvcigpO1xuICB0aHJvdyBuZXcgRVJSX0lOVEVSTkFMX0FTU0VSVElPTihtZXNzYWdlKTtcbn1cblxuYXNzZXJ0LmZhaWwgPSBmYWlsO1xuXG4vLyBDb3B5cmlnaHQgTm9kZS5qcyBjb250cmlidXRvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5jb25zdCBtZXNzYWdlcyA9IG5ldyBNYXAoKTtcbmNvbnN0IGNvZGVzID0ge307IC8vIEB0b2RvIGltcGxlbWVudCB0aGlzIG9uY2UgbmVlZGVkXG5cbmNsYXNzIFN5c3RlbUVycm9yIGV4dGVuZHMgRXJyb3Ige30gLy8gVXRpbGl0eSBmdW5jdGlvbiBmb3IgcmVnaXN0ZXJpbmcgdGhlIGVycm9yIGNvZGVzLlxuXG5cbmZ1bmN0aW9uIEUoc3ltLCB2YWwsIGRlZiwgLi4ub3RoZXJDbGFzc2VzKSB7XG4gIC8vIFNwZWNpYWwgY2FzZSBmb3IgU3lzdGVtRXJyb3IgdGhhdCBmb3JtYXRzIHRoZSBlcnJvciBtZXNzYWdlIGRpZmZlcmVudGx5XG4gIC8vIFRoZSBTeXN0ZW1FcnJvcnMgb25seSBoYXZlIFN5c3RlbUVycm9yIGFzIHRoZWlyIGJhc2UgY2xhc3Nlcy5cbiAgbWVzc2FnZXMuc2V0KHN5bSwgdmFsKTtcblxuICBpZiAoZGVmID09PSBTeXN0ZW1FcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcignTm9kZSBjb21wYXRpYmxlIFN5c3RlbUVycm9yIG5vdCB5ZXQgaW1wbGVtZW50ZWQuJyk7XG4gIH0gZWxzZSB7XG4gICAgZGVmID0gbWFrZU5vZGVFcnJvcldpdGhDb2RlKGRlZiwgc3ltKTtcbiAgfVxuXG4gIGlmIChvdGhlckNsYXNzZXMubGVuZ3RoICE9PSAwKSB7XG4gICAgb3RoZXJDbGFzc2VzLmZvckVhY2goY2xhenogPT4ge1xuICAgICAgZGVmW2NsYXp6Lm5hbWVdID0gbWFrZU5vZGVFcnJvcldpdGhDb2RlKGNsYXp6LCBzeW0pO1xuICAgIH0pO1xuICB9XG5cbiAgY29kZXNbc3ltXSA9IGRlZjtcbn1cblxuZnVuY3Rpb24gbWFrZU5vZGVFcnJvcldpdGhDb2RlKEJhc2UsIGtleSkge1xuICByZXR1cm4gY2xhc3MgTm9kZUVycm9yIGV4dGVuZHMgQmFzZSB7XG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlKGtleSwgYXJncywgdGhpcyk7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ21lc3NhZ2UnLCB7XG4gICAgICAgIHZhbHVlOiBtZXNzYWdlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgICBhZGRDb2RlVG9OYW1lKHRoaXMsIHN1cGVyLm5hbWUsIGtleSk7XG4gICAgfVxuXG4gICAgZ2V0IGNvZGUoKSB7XG4gICAgICByZXR1cm4ga2V5O1xuICAgIH1cblxuICAgIHNldCBjb2RlKHZhbHVlKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NvZGUnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLm5hbWV9IFske2tleX1dOiAke3RoaXMubWVzc2FnZX1gO1xuICAgIH1cblxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRNZXNzYWdlKGtleSwgYXJncywgc2VsZikge1xuICBjb25zdCBtc2cgPSBtZXNzYWdlcy5nZXQoa2V5KTtcbiAgLypcbiAgLy8gQGZpeG1lIHJvbGx1cCBjYW5ub3QgaGFuZGxlIGxhenkgbG9hZGVkIG1vZHVsZXMsIG1heWJlIG1vdmUgdG8gd2VicGFjaz9cbiAgaWYgKGFzc2VydCA9PT0gdW5kZWZpbmVkKSB7XG4gIFx0YXNzZXJ0ID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9hc3NlcnQnKTtcbiAgfVxuICAqL1xuXG4gIGlmICh0eXBlb2YgbXNnID09PSAnZnVuY3Rpb24nKSB7XG4gICAgYXNzZXJ0KG1zZy5sZW5ndGggPD0gYXJncy5sZW5ndGgsIC8vIERlZmF1bHQgb3B0aW9ucyBkbyBub3QgY291bnQuXG4gICAgYENvZGU6ICR7a2V5fTsgVGhlIHByb3ZpZGVkIGFyZ3VtZW50cyBsZW5ndGggKCR7YXJncy5sZW5ndGh9KSBkb2VzIG5vdCBgICsgYG1hdGNoIHRoZSByZXF1aXJlZCBvbmVzICgke21zZy5sZW5ndGh9KS5gKTtcbiAgICByZXR1cm4gbXNnLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG5cbiAgY29uc3QgZXhwZWN0ZWRMZW5ndGggPSAobXNnLm1hdGNoKC8lW2RmaWpvT3NdL2cpIHx8IFtdKS5sZW5ndGg7XG4gIGFzc2VydChleHBlY3RlZExlbmd0aCA9PT0gYXJncy5sZW5ndGgsIGBDb2RlOiAke2tleX07IFRoZSBwcm92aWRlZCBhcmd1bWVudHMgbGVuZ3RoICgke2FyZ3MubGVuZ3RofSkgZG9lcyBub3QgYCArIGBtYXRjaCB0aGUgcmVxdWlyZWQgb25lcyAoJHtleHBlY3RlZExlbmd0aH0pLmApO1xuXG4gIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBtc2c7XG4gIH1cblxuICBhcmdzLnVuc2hpZnQobXNnKTtcbiAgcmV0dXJuIGZvcm1hdC5hcHBseShudWxsLCBhcmdzKTsgLy8gQGZpeG1lIHJvbGx1cCBjYW5ub3QgaGFuZGxlIGxhenkgbG9hZGVkIG1vZHVsZXMsIG1heWJlIG1vdmUgdG8gd2VicGFjaz9cbiAgLy8gcmV0dXJuIGxhenlJbnRlcm5hbFV0aWxJbnNwZWN0KCkuZm9ybWF0LmFwcGx5KG51bGwsIGFyZ3MpO1xufVxuXG5mdW5jdGlvbiBhZGRDb2RlVG9OYW1lKGVyciwgbmFtZSwgY29kZSkge1xuICAvLyBBZGQgdGhlIGVycm9yIGNvZGUgdG8gdGhlIG5hbWUgdG8gaW5jbHVkZSBpdCBpbiB0aGUgc3RhY2sgdHJhY2UuXG4gIGVyci5uYW1lID0gYCR7bmFtZX0gWyR7Y29kZX1dYDsgLy8gQWNjZXNzIHRoZSBzdGFjayB0byBnZW5lcmF0ZSB0aGUgZXJyb3IgbWVzc2FnZSBpbmNsdWRpbmcgdGhlIGVycm9yIGNvZGVcbiAgLy8gZnJvbSB0aGUgbmFtZS5cbiAgLy8gQGZpeG1lOiBUaGlzIG9ubHkgd29ya3Mgb24gVjgvQW5kcm9pZCwgaU9TL0pTQyBoYXMgYSBkaWZmZXJlbnQgRXJyb3Igc3RydWN0dXJlLlxuICAvLyBzaG91bGQgd2UgdHJ5IHRvIG1ha2UgZXJyb3JzIGJlaGF2ZSB0aGUgc2FtZSBhY3Jvc3MgcGxhdGZvcm1zP1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLWV4cHJlc3Npb25zXG5cbiAgZXJyLnN0YWNrOyAvLyBSZXNldCB0aGUgbmFtZSB0byB0aGUgYWN0dWFsIG5hbWUuXG5cbiAgaWYgKG5hbWUgPT09ICdTeXN0ZW1FcnJvcicpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXJyLCAnbmFtZScsIHtcbiAgICAgIHZhbHVlOiBuYW1lLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGRlbGV0ZSBlcnIubmFtZTtcbiAgfVxufVxuXG5FKCdFUlJfSU5URVJOQUxfQVNTRVJUSU9OJywgbWVzc2FnZSA9PiB7XG4gIGNvbnN0IHN1ZmZpeCA9ICdUaGlzIGlzIGNhdXNlZCBieSBlaXRoZXIgYSBidWcgaW4gVGl0YW5pdW0gJyArICdvciBpbmNvcnJlY3QgdXNhZ2Ugb2YgVGl0YW5pdW0gaW50ZXJuYWxzLlxcbicgKyAnUGxlYXNlIG9wZW4gYW4gaXNzdWUgd2l0aCB0aGlzIHN0YWNrIHRyYWNlIGF0ICcgKyAnaHR0cHM6Ly9qaXJhLmFwcGNlbGVyYXRvci5vcmdcXG4nO1xuICByZXR1cm4gbWVzc2FnZSA9PT0gdW5kZWZpbmVkID8gc3VmZml4IDogYCR7bWVzc2FnZX1cXG4ke3N1ZmZpeH1gO1xufSwgRXJyb3IpO1xuRSgnRVJSX0lOVkFMSURfQVJHX1RZUEUnLCAobmFtZSwgZXhwZWN0ZWQsIGFjdHVhbCkgPT4ge1xuICBhc3NlcnQodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnLCAnXFwnbmFtZVxcJyBtdXN0IGJlIGEgc3RyaW5nJyk7IC8vIGRldGVybWluZXI6ICdtdXN0IGJlJyBvciAnbXVzdCBub3QgYmUnXG5cbiAgbGV0IGRldGVybWluZXI7XG5cbiAgaWYgKHR5cGVvZiBleHBlY3RlZCA9PT0gJ3N0cmluZycgJiYgZXhwZWN0ZWQuc3RhcnRzV2l0aCgnbm90ICcpKSB7XG4gICAgZGV0ZXJtaW5lciA9ICdtdXN0IG5vdCBiZSc7XG4gICAgZXhwZWN0ZWQgPSBleHBlY3RlZC5yZXBsYWNlKC9ebm90IC8sICcnKTtcbiAgfSBlbHNlIHtcbiAgICBkZXRlcm1pbmVyID0gJ211c3QgYmUnO1xuICB9XG5cbiAgbGV0IG1zZztcblxuICBpZiAobmFtZS5lbmRzV2l0aCgnIGFyZ3VtZW50JykpIHtcbiAgICAvLyBGb3IgY2FzZXMgbGlrZSAnZmlyc3QgYXJndW1lbnQnXG4gICAgbXNnID0gYFRoZSAke25hbWV9ICR7ZGV0ZXJtaW5lcn0gJHtvbmVPZihleHBlY3RlZCwgJ3R5cGUnKX1gO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHR5cGUgPSBuYW1lLmluY2x1ZGVzKCcuJykgPyAncHJvcGVydHknIDogJ2FyZ3VtZW50JztcbiAgICBtc2cgPSBgVGhlIFwiJHtuYW1lfVwiICR7dHlwZX0gJHtkZXRlcm1pbmVyfSAke29uZU9mKGV4cGVjdGVkLCAndHlwZScpfWA7XG4gIH0gLy8gVE9ETyhCcmlkZ2VBUik6IEltcHJvdmUgdGhlIG91dHB1dCBieSBzaG93aW5nIGBudWxsYCBhbmQgc2ltaWxhci5cblxuXG4gIG1zZyArPSBgLiBSZWNlaXZlZCB0eXBlICR7dHlwZW9mIGFjdHVhbH1gO1xuICByZXR1cm4gbXNnO1xufSwgVHlwZUVycm9yKTtcbmxldCBtYXhTdGFja19FcnJvck5hbWU7XG5sZXQgbWF4U3RhY2tfRXJyb3JNZXNzYWdlO1xuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgYGVyci5uYW1lYCBhbmQgYGVyci5tZXNzYWdlYCBhcmUgZXF1YWwgdG8gZW5naW5lLXNwZWNpZmljXG4gKiB2YWx1ZXMgaW5kaWNhdGluZyBtYXggY2FsbCBzdGFjayBzaXplIGhhcyBiZWVuIGV4Y2VlZGVkLlxuICogXCJNYXhpbXVtIGNhbGwgc3RhY2sgc2l6ZSBleGNlZWRlZFwiIGluIFY4LlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyciBUaGUgZXJyb3IgdG8gY2hlY2tcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGlzU3RhY2tPdmVyZmxvd0Vycm9yKGVycikge1xuICBpZiAobWF4U3RhY2tfRXJyb3JNZXNzYWdlID09PSB1bmRlZmluZWQpIHtcbiAgICB0cnkge1xuICAgICAgZnVuY3Rpb24gb3ZlcmZsb3dTdGFjaygpIHtcbiAgICAgICAgb3ZlcmZsb3dTdGFjaygpO1xuICAgICAgfVxuXG4gICAgICBvdmVyZmxvd1N0YWNrKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbWF4U3RhY2tfRXJyb3JNZXNzYWdlID0gZS5tZXNzYWdlO1xuICAgICAgbWF4U3RhY2tfRXJyb3JOYW1lID0gZS5uYW1lO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBlcnIubmFtZSA9PT0gbWF4U3RhY2tfRXJyb3JOYW1lICYmIGVyci5tZXNzYWdlID09PSBtYXhTdGFja19FcnJvck1lc3NhZ2U7XG59XG5cbmZ1bmN0aW9uIG9uZU9mKGV4cGVjdGVkLCB0aGluZykge1xuICBhc3NlcnQodHlwZW9mIHRoaW5nID09PSAnc3RyaW5nJywgJ2B0aGluZ2AgaGFzIHRvIGJlIG9mIHR5cGUgc3RyaW5nJyk7XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkoZXhwZWN0ZWQpKSB7XG4gICAgY29uc3QgbGVuID0gZXhwZWN0ZWQubGVuZ3RoO1xuICAgIGFzc2VydChsZW4gPiAwLCAnQXQgbGVhc3Qgb25lIGV4cGVjdGVkIHZhbHVlIG5lZWRzIHRvIGJlIHNwZWNpZmllZCcpO1xuICAgIGV4cGVjdGVkID0gZXhwZWN0ZWQubWFwKGkgPT4gU3RyaW5nKGkpKTtcblxuICAgIGlmIChsZW4gPiAyKSB7XG4gICAgICByZXR1cm4gYG9uZSBvZiAke3RoaW5nfSAke2V4cGVjdGVkLnNsaWNlKDAsIGxlbiAtIDEpLmpvaW4oJywgJyl9LCBvciBgICsgZXhwZWN0ZWRbbGVuIC0gMV07XG4gICAgfSBlbHNlIGlmIChsZW4gPT09IDIpIHtcbiAgICAgIHJldHVybiBgb25lIG9mICR7dGhpbmd9ICR7ZXhwZWN0ZWRbMF19IG9yICR7ZXhwZWN0ZWRbMV19YDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBvZiAke3RoaW5nfSAke2V4cGVjdGVkWzBdfWA7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBgb2YgJHt0aGluZ30gJHtTdHJpbmcoZXhwZWN0ZWQpfWA7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGlzIGltcGxlbWVudGF0aW9uIG9mIEJ1ZmZlciB1c2VzIGEgVGkuQnVmZmVyIGludGVybmFsbHkgdG8gYmFjayBpdC5cbiAqIFRoaXMgaXMgbGlrbGV5IGFuIG9yZGVyIG9mIG1hZ25pdHVkZSBzbG93ZXIgdGhhbiB1c2luZyBhIHZhcmlhbnQgdGhhdCBleHRlbmRzIFVpbnQ4QXJyYXkhXG4gKiBJIHRoaW5rIGlmIHdlJ3JlIG5vdCBhbHJlYWR5IHdyYXBwaW5nIGEgVGkuQnVmZmVyLCBpdCBtYXkgYmUgYmV0dGVyIHRvIGhhdmUgdHdvIGltcGxlbWVudGF0aW9uc1xuICogYW5kLCBsaWtlIGJyb3dzZXJpZnksIGp1c3QgZXh0ZW5kIFVpbnQ4QXJyYXkgZm9yIGFueSBCdWZmZXJzIHdlIG5lZWQgdG8gcmVhZC93cml0ZSBhIGxvdFxuICogYW5kIHRoZW4gYWRkIGEgc2ltcGxlIGNvbnZlcnNpb24gbWV0aG9kIHRvIHR1cm4gaXQgaW50byBhIFRpLkJ1ZmZlciB3aGVuIG5lZWRlZC5cbiAqXG4gKiBUaGUgVGkuQnVmZmVyIGltcGwgaGFzIHRvIGdvIHRocm91Z2ggdGhlIGJpbmRpbmcgbGF5ZXIgZm9yIHJlYWRpbmcvd3JpdGluZyBldmVyeSBieXRlLlxuICogSWYgd2UgYW50aWNpcGF0ZSB0aGUgQnVmZmVyIHN0YXlpbmcgb24gdGhlIEpTIHNpZGUsIEknbSB3aWxsaW5nIHRvIGJldCB0aGF0IHRoZSBVaW50OEFycmF5XG4gKiB0aGUgSlMgZW5naW5lIHByb3ZpZGVzIHdvdWxkIGJlICp3YXkqIGZhc3Rlci5cbiAqXG4gKiBBbHNvIG5vdGUgdGhhdCBib3RoIFRpLkJ1ZmZlciBhbmQgTm9kZSdzIEJ1ZmZlciB3ZXJlIGNyZWF0ZWQgYmVmb3JlIHRoZSBKUyBlbmdpbmVzIGhhZCB0eXBlZCBhcnJheXNcbiAqIChhbmQgVWludDhBcnJheSBpbiBwYXJ0aWN1bGFyKSBhcyBhIG1lYW5zIG9mIGVuY2Fwc3VsYXRpbmcgYSBieXRlIGFycmF5LiBXZSBzaG91bGQgY29uc2lkZXIgYWNjZXB0aW5nXG4gKiBhIFVpbnQ4QXJyYXkgaW4gYW55IG9mIG91ciBBUElzIHRoYXQgdGFrZSBhIFRpLkJ1ZmZlciBhbmQgZXZlbnR1YWxseSBkZXByZWNhdGluZy9yZW1vdmluZyBUaS5CdWZmZXIuXG4gKi9cbmNvbnN0IHtcbiAgQUxMX1BST1BFUlRJRVM6IEFMTF9QUk9QRVJUSUVTJDEsXG4gIE9OTFlfRU5VTUVSQUJMRTogT05MWV9FTlVNRVJBQkxFJDFcbn0gPSBwcm9wZXJ0eUZpbHRlcjsgLy8gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9idWZmZXIuaHRtbCNidWZmZXJfYnVmZmVyc19hbmRfY2hhcmFjdGVyX2VuY29kaW5nc1xuXG5jb25zdCBUSV9DT0RFQ19NQVAgPSBuZXcgTWFwKCk7XG5USV9DT0RFQ19NQVAuc2V0KCd1dGYtOCcsIFRpLkNvZGVjLkNIQVJTRVRfVVRGOCk7XG5USV9DT0RFQ19NQVAuc2V0KCd1dGY4JywgVGkuQ29kZWMuQ0hBUlNFVF9VVEY4KTtcblRJX0NPREVDX01BUC5zZXQoJ3V0Zi0xNmxlJywgVGkuQ29kZWMuQ0hBUlNFVF9VVEYxNkxFKTtcblRJX0NPREVDX01BUC5zZXQoJ3V0ZjE2bGUnLCBUaS5Db2RlYy5DSEFSU0VUX1VURjE2TEUpO1xuVElfQ09ERUNfTUFQLnNldCgndWNzMicsIFRpLkNvZGVjLkNIQVJTRVRfVVRGMTZMRSk7XG5USV9DT0RFQ19NQVAuc2V0KCd1Y3MtMicsIFRpLkNvZGVjLkNIQVJTRVRfVVRGMTZMRSk7XG5USV9DT0RFQ19NQVAuc2V0KCdsYXRpbjEnLCBUaS5Db2RlYy5DSEFSU0VUX0lTT19MQVRJTl8xKTtcblRJX0NPREVDX01BUC5zZXQoJ2JpbmFyeScsIFRpLkNvZGVjLkNIQVJTRVRfSVNPX0xBVElOXzEpO1xuVElfQ09ERUNfTUFQLnNldCgnYXNjaWknLCBUaS5Db2RlYy5DSEFSU0VUX0FTQ0lJKTsgLy8gV2UgaGF2ZSBubyBlcXVpdmFsZW50cyBvZiBiYXNlNjQgb3IgaGV4LCBzbyB3ZSBjb252ZXJ0IHRoZW0gaW50ZXJuYWxseSBoZXJlXG5cbmNvbnN0IFZBTElEX0VOQ09ESU5HUyA9IFsnaGV4JywgJ3V0ZjgnLCAndXRmLTgnLCAnYXNjaWknLCAnbGF0aW4xJywgJ2JpbmFyeScsICdiYXNlNjQnLCAndWNzMicsICd1Y3MtMicsICd1dGYxNmxlJywgJ3V0Zi0xNmxlJ107IC8vIFVzZWQgdG8gY2hlYXQgZm9yIHJlYWQvd3JpdGVzIG9mIGRvdWJsZXNcblxuY29uc3QgZG91YmxlQXJyYXkgPSBuZXcgRmxvYXQ2NEFycmF5KDEpO1xuY29uc3QgdWludDhEb3VibGVBcnJheSA9IG5ldyBVaW50OEFycmF5KGRvdWJsZUFycmF5LmJ1ZmZlcik7IC8vIFVzZWQgdG8gY2hlYXQgdG8gcmVhZC93cml0ZSBmbG9hdHNcblxuY29uc3QgZmxvYXRBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoMSk7XG5jb25zdCB1aW50OEZsb2F0QXJyYXkgPSBuZXcgVWludDhBcnJheShmbG9hdEFycmF5LmJ1ZmZlcik7XG5sZXQgSU5TUEVDVF9NQVhfQllURVMgPSA1MDtcblxuY2xhc3MgQnVmZmVyJDEge1xuICAvKipcbiAgICogQ29uc3RydWN0cyBhIG5ldyBidWZmZXIuXG4gICAqXG4gICAqIFByaW1hcmlseSB1c2VkIGludGVybmFsbHkgaW4gdGhpcyBtb2R1bGUgdG9nZXRoZXIgd2l0aCBgbmV3QnVmZmVyYCB0b1xuICAgKiBjcmVhdGUgYSBuZXcgQnVmZmVyIGluc3RhbmNlIHdyYXBwaW5nIGEgVGkuQnVmZmVyLlxuICAgKlxuICAgKiBBbHNvIHN1cHBvcnRzIHRoZSBkZXByZWNhdGVkIEJ1ZmZlcigpIGNvbnN0cnVjdG9ycyB3aGljaCBhcmUgc2FmZVxuICAgKiB0byB1c2Ugb3V0c2lkZSBvZiB0aGlzIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIHtpbnRlZ2VyW118QnVmZmVyfGludGVnZXJ8c3RyaW5nfFRpLkJ1ZmZlcn0gYXJnXG4gICAqIEBwYXJhbSB7c3RyaW5nfGludGVnZXJ9IGVuY29kaW5nT3JPZmZzZXRcbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBsZW5ndGhcbiAgICovXG4gIGNvbnN0cnVjdG9yKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gICAgaWYgKHR5cGVvZiBhcmcgIT09ICdvYmplY3QnIHx8IGFyZy5hcGlOYW1lICE9PSAnVGkuQnVmZmVyJykge1xuICAgICAgc2hvd0ZsYWdnZWREZXByZWNhdGlvbigpO1xuXG4gICAgICBpZiAodHlwZW9mIGFyZyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbmNvZGluZ09yT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFRoZSBcInN0cmluZ1wiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBcInN0cmluZ1wiLiBSZWNlaXZlZCB0eXBlICR7dHlwZW9mIGFyZ31gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBCdWZmZXIkMS5hbGxvYyhhcmcpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQnVmZmVyJDEuZnJvbShhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCk7XG4gICAgfVxuXG4gICAgY29uc3QgdGlCdWZmZXIgPSBhcmc7XG4gICAgbGV0IHN0YXJ0ID0gZW5jb2RpbmdPck9mZnNldDtcblxuICAgIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuXG4gICAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBsZW5ndGggPSB0aUJ1ZmZlci5sZW5ndGggLSBzdGFydDtcbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICBieXRlT2Zmc2V0OiB7XG4gICAgICAgIHZhbHVlOiBzdGFydFxuICAgICAgfSxcbiAgICAgIGxlbmd0aDoge1xuICAgICAgICB2YWx1ZTogbGVuZ3RoXG4gICAgICB9LFxuICAgICAgX3RpQnVmZmVyOiB7XG4gICAgICAgIHZhbHVlOiB0aUJ1ZmZlclxuICAgICAgfVxuICAgIH0pOyAvLyBGSVhNRTogU3VwcG9ydCAuYnVmZmVyIHByb3BlcnR5IHRoYXQgaG9sZHMgYW4gQXJyYXlCdWZmZXIhXG4gIH1cbiAgLyoqXG4gICAqIDAgaXMgcmV0dXJuZWQgaWYgdGFyZ2V0IGlzIHRoZSBzYW1lIGFzIGJ1ZlxuICAgKiAxIGlzIHJldHVybmVkIGlmIHRhcmdldCBzaG91bGQgY29tZSBiZWZvcmUgYnVmIHdoZW4gc29ydGVkLlxuICAgKiAtMSBpcyByZXR1cm5lZCBpZiB0YXJnZXQgc2hvdWxkIGNvbWUgYWZ0ZXIgYnVmIHdoZW4gc29ydGVkLlxuICAgKiBAcGFyYW0ge0J1ZmZlcn0gdGFyZ2V0IEJ1ZmZlciB0byBjb21wYXJlIGFnYWluc3RcbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbdGFyZ2V0U3RhcnQ9MF0gaW5kZXggdG8gc3RhcnQgaW4gdGFyZ2V0XG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gW3RhcmdldEVuZD10YXJnZXQubGVuZ3RoXSBpbmRleCB0byBlbmQgaW4gdGFyZ2V0XG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gW3NvdXJjZVN0YXJ0PTBdIGluZGV4IHRvIHN0YXJ0IGluIHRoaXMgQnVmZmVyXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gW3NvdXJjZUVuZD10aGlzLmxlbmd0aF0gaW5kZXggdG8gZW5kIGluIHRoaXMgQnVmZmVyXG4gICAqIEByZXR1cm5zIHtpbnRlZ2VyfVxuICAgKi9cblxuXG4gIGNvbXBhcmUodGFyZ2V0LCB0YXJnZXRTdGFydCwgdGFyZ2V0RW5kLCBzb3VyY2VTdGFydCwgc291cmNlRW5kKSB7XG4gICAgaWYgKCFCdWZmZXIkMS5pc0J1ZmZlcih0YXJnZXQpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBUaGUgXCJ0YXJnZXRcIiBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIEJ1ZmZlciBvciBVaW50OEFycmF5LiBSZWNlaXZlZCB0eXBlICR7dHlwZW9mIGJ1ZjF9YCk7XG4gICAgfVxuXG4gICAgaWYgKHRhcmdldFN0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRhcmdldFN0YXJ0ID0gMDtcbiAgICB9XG5cbiAgICBpZiAoc291cmNlU3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgc291cmNlU3RhcnQgPSAwO1xuICAgIH1cblxuICAgIGlmICh0YXJnZXRFbmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGFyZ2V0RW5kID0gdGFyZ2V0Lmxlbmd0aDtcbiAgICB9XG5cbiAgICBpZiAoc291cmNlRW5kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHNvdXJjZUVuZCA9IHRoaXMubGVuZ3RoO1xuICAgIH0gLy8gRVJSX09VVF9PRl9SQU5HRSBpcyB0aHJvd24gaWYgdGFyZ2V0U3RhcnQgPCAwLCBzb3VyY2VTdGFydCA8IDAsIHRhcmdldEVuZCA+IHRhcmdldC5ieXRlTGVuZ3RoLCBvciBzb3VyY2VFbmQgPiBzb3VyY2UuYnl0ZUxlbmd0aFxuXG5cbiAgICBpZiAodGFyZ2V0U3RhcnQgPCAwIHx8IHNvdXJjZVN0YXJ0IDwgMCB8fCB0YXJnZXRFbmQgPiB0YXJnZXQubGVuZ3RoIHx8IHNvdXJjZUVuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJyk7IC8vIEZJWE1FOiBzZXQgXCJjb2RlXCIgdG8gRVJSX0lOREVYX09VVF9PRl9SQU5HRVxuICAgIH0gLy8gVXNlIHNsaWNlcyB0byBtYWtlIHRoZSBsb29wIGVhc2llclxuXG5cbiAgICBjb25zdCBzb3VyY2UgPSB0aGlzLnNsaWNlKHNvdXJjZVN0YXJ0LCBzb3VyY2VFbmQpO1xuICAgIGNvbnN0IHNvdXJjZUxlbmd0aCA9IHNvdXJjZS5sZW5ndGg7XG4gICAgY29uc3QgZGVzdCA9IHRhcmdldC5zbGljZSh0YXJnZXRTdGFydCwgdGFyZ2V0RW5kKTtcbiAgICBjb25zdCBkZXN0TGVuZ3RoID0gZGVzdC5sZW5ndGg7XG4gICAgY29uc3QgbGVuZ3RoID0gTWF0aC5taW4oc291cmNlTGVuZ3RoLCBkZXN0TGVuZ3RoKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHRhcmdldFZhbHVlID0gZ2V0QWRqdXN0ZWRJbmRleChkZXN0LCBpKTtcbiAgICAgIGNvbnN0IHNvdXJjZVZhbHVlID0gZ2V0QWRqdXN0ZWRJbmRleChzb3VyY2UsIGkpO1xuXG4gICAgICBpZiAodGFyZ2V0VmFsdWUgIT09IHNvdXJjZVZhbHVlKSB7XG4gICAgICAgIC8vIE5vIG1hdGNoISBSZXR1cm4gMSBvciAtMSBiYXNlZCBvbiB3aGF0IGlzIGdyZWF0ZXIhXG4gICAgICAgIGlmIChzb3VyY2VWYWx1ZSA8IHRhcmdldFZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG4gICAgfSAvLyBzb3J0IGJhc2VkIG9uIGxlbmd0aCFcblxuXG4gICAgaWYgKHNvdXJjZUxlbmd0aCA8IGRlc3RMZW5ndGgpIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICBpZiAoc291cmNlTGVuZ3RoID4gZGVzdExlbmd0aCkge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfVxuXG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgLyoqXG4gICAqIENvcGllcyBmcm9tIHRoaXMgdG8gdGFyZ2V0XG4gICAqIEBwYXJhbSB7QnVmZmVyfSB0YXJnZXQgZGVzdGluYXRpb24gd2UncmUgY29weWluZyBpbnRvXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gW3RhcmdldFN0YXJ0PTBdIHN0YXJ0IGluZGV4IHRvIGNvcHkgaW50byBpbiBkZXN0aW5hdGlvbiBCdWZmZXJcbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbc291cmNlU3RhcnQ9MF0gc3RhcnQgaW5kZXggdG8gY29weSBmcm9tIHdpdGhpbiBgdGhpc2BcbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbc291cmNlRW5kPXRoaXMubGVuZ3RoXSBlbmQgaW5kZXggdG8gY29weSBmcm9tIHdpdGhpbiBgdGhpc2BcbiAgICogQHJldHVybnMge2ludGVnZXJ9IG51bWJlciBvZiBieXRlcyBjb3BpZWRcbiAgICovXG5cblxuICBjb3B5KHRhcmdldCwgdGFyZ2V0U3RhcnQsIHNvdXJjZVN0YXJ0LCBzb3VyY2VFbmQpIHtcbiAgICBpZiAodGFyZ2V0U3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGFyZ2V0U3RhcnQgPSAwO1xuICAgIH1cblxuICAgIGlmIChzb3VyY2VTdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBzb3VyY2VTdGFydCA9IDA7XG4gICAgfVxuXG4gICAgaWYgKHNvdXJjZUVuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBzb3VyY2VFbmQgPSB0aGlzLmxlbmd0aDtcbiAgICB9XG5cbiAgICBpZiAoc291cmNlU3RhcnQgPT09IHNvdXJjZUVuZCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH0gLy8gVE9ETzogY2hlY2sgZm9yIG91dCBvZiBib3VuZHM/XG5cblxuICAgIGxldCBsZW5ndGggPSBzb3VyY2VFbmQgLSBzb3VyY2VTdGFydDsgLy8gQ2FwIGxlbmd0aCB0byByZW1haW5pbmcgYnl0ZXMgaW4gdGFyZ2V0IVxuXG4gICAgY29uc3QgcmVtYWluaW5nID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0O1xuXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nO1xuICAgIH0gLy8gVE9ETzogaGFuZGxlIG92ZXJsYXAgd2hlbiB0YXJnZXQgPT09IHRoaXMhXG4gICAgLy8gVE9ETzogRG8gd2UgbmVlZCB0byB0YWtlIHRhcmdldCBvciB0aGlzLmJ5dGVPZmZzZXQgaW50byBhY2NvdW50IGhlcmU/XG5cblxuICAgIHRhcmdldC5fdGlCdWZmZXIuY29weSh0aGlzLl90aUJ1ZmZlciwgdGFyZ2V0U3RhcnQsIHNvdXJjZVN0YXJ0LCBsZW5ndGgpO1xuXG4gICAgcmV0dXJuIGxlbmd0aDtcbiAgfVxuICAvKipcbiAgICogQ3JlYXRlcyBhbmQgcmV0dXJucyBhbiBpdGVyYXRvciBvZiBbaW5kZXgsIGJ5dGVdIHBhaXJzIGZyb20gdGhlIGNvbnRlbnRzIG9mIGJ1Zi5cbiAgICogQHJldHVybnMge0l0ZXJhdG9yfVxuICAgKi9cblxuXG4gIGVudHJpZXMoKSB7XG4gICAgY29uc3QgYnVmZmVyID0gdGhpcztcbiAgICBsZXQgbmV4dEluZGV4ID0gMDtcbiAgICBjb25zdCBlbmQgPSB0aGlzLmxlbmd0aDtcbiAgICBjb25zdCBlbnRyeUl0ZXJhdG9yID0ge1xuICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAobmV4dEluZGV4IDwgZW5kKSB7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdmFsdWU6IFtuZXh0SW5kZXgsIGdldEFkanVzdGVkSW5kZXgoYnVmZmVyLCBuZXh0SW5kZXgpXSxcbiAgICAgICAgICAgIGRvbmU6IGZhbHNlXG4gICAgICAgICAgfTtcbiAgICAgICAgICBuZXh0SW5kZXgrKztcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB2YWx1ZTogdW5kZWZpbmVkLFxuICAgICAgICAgIGRvbmU6IHRydWVcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBbU3ltYm9sLml0ZXJhdG9yXTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBlbnRyeUl0ZXJhdG9yO1xuICB9XG5cbiAgZXF1YWxzKG90aGVyQnVmZmVyKSB7XG4gICAgaWYgKCFCdWZmZXIkMS5pc0J1ZmZlcihvdGhlckJ1ZmZlcikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2FyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXInKTtcbiAgICB9XG5cbiAgICBpZiAob3RoZXJCdWZmZXIgPT09IHRoaXMpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNvbXBhcmUob3RoZXJCdWZmZXIpID09PSAwO1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ3xCdWZmZXJ8VUludDhBcnJheXxpbnRlZ2VyfSB2YWx1ZSBUaGUgdmFsdWUgd2l0aCB3aGljaCB0byBmaWxsIGBidWZgLlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IFtvZmZzZXQ9MF0gTnVtYmVyIG9mIGJ5dGVzIHRvIHNraXAgYmVmb3JlIHN0YXJ0aW5nIHRvIGZpbGwgYGJ1ZmBcbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbZW5kXSBXaGVyZSB0byBzdG9wIGZpbGxpbmcgYnVmIChub3QgaW5jbHVzaXZlKS4gYGJ1Zi5sZW5ndGhgIGJ5IGRlZmF1bHRcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtlbmNvZGluZz0ndXRmOCddIFRoZSBlbmNvZGluZyBmb3IgYHZhbHVlYCBpZiBgdmFsdWVgIGlzIGEgc3RyaW5nLlxuICAgKiBAcmV0dXJucyB7dGhpc31cbiAgICovXG5cblxuICBmaWxsKHZhbHVlLCBvZmZzZXQsIGVuZCwgZW5jb2RpbmcpIHtcbiAgICBjb25zdCBvZmZzZXRUeXBlID0gdHlwZW9mIG9mZnNldDtcblxuICAgIGlmIChvZmZzZXRUeXBlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gdmFsdWUgc3VwcGxpZWRcbiAgICAgIG9mZnNldCA9IDA7XG4gICAgICBlbmQgPSB0aGlzLmxlbmd0aDtcbiAgICAgIGVuY29kaW5nID0gJ3V0ZjgnO1xuICAgIH0gZWxzZSBpZiAob2Zmc2V0VHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIHZhbHVlLCBlbmNvZGluZyBzdXBwbGllZFxuICAgICAgZW5jb2RpbmcgPSBvZmZzZXQ7XG4gICAgICBvZmZzZXQgPSAwO1xuICAgICAgZW5kID0gdGhpcy5sZW5ndGg7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZW5kID09PSAnc3RyaW5nJykge1xuICAgICAgLy8gdmFsdWUsIG9mZnNldCwgZW5jb2Rpbmcgc3VwcGxpZWRcbiAgICAgIGVuY29kaW5nID0gZW5kO1xuICAgICAgZW5kID0gdGhpcy5sZW5ndGg7XG4gICAgfVxuXG4gICAgY29uc3QgdmFsdWVUeXBlID0gdHlwZW9mIHZhbHVlO1xuXG4gICAgaWYgKHZhbHVlVHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IGJ1ZlRvRmlsbFdpdGggPSBCdWZmZXIkMS5mcm9tKHZhbHVlLCBlbmNvZGluZyk7XG4gICAgICBjb25zdCBmaWxsQnVmTGVuZ3RoID0gYnVmVG9GaWxsV2l0aC5sZW5ndGg7XG5cbiAgICAgIGlmIChmaWxsQnVmTGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbm8gdmFsaWQgZmlsbCBkYXRhJyk7XG4gICAgICB9IC8vIElmIHRoZSBidWZmZXIgbGVuZ3RoID09PSAxLCB3ZSBjYW4ganVzdCBkbyB0aGlzLl90aUJ1ZmZlci5maWxsKHZhbHVlLCBvZmZzZXQsIGVuZCk7XG5cblxuICAgICAgaWYgKGZpbGxCdWZMZW5ndGggPT09IDEpIHtcbiAgICAgICAgdGhpcy5fdGlCdWZmZXIuZmlsbChidWZUb0ZpbGxXaXRoLl90aUJ1ZmZlclswXSwgb2Zmc2V0LCBlbmQpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSAvLyBtdWx0aXBsZSBieXRlIGZpbGwhXG5cblxuICAgICAgY29uc3QgbGVuZ3RoID0gZW5kIC0gb2Zmc2V0O1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIFRPRE86IERvIHdlIG5lZWQgdG8gYWNjb3VudCBmb3IgYnl0ZU9mZnNldCBoZXJlIChvbiBgdGhpc2AsIG5vdCBvbiB0aGUgYnVmZmVyIHdlIGp1c3QgY3JlYXRlZCk/XG4gICAgICAgIGNvbnN0IGZpbGxDaGFyID0gYnVmVG9GaWxsV2l0aC5fdGlCdWZmZXJbaSAlIGZpbGxCdWZMZW5ndGhdO1xuICAgICAgICB0aGlzLl90aUJ1ZmZlcltpICsgb2Zmc2V0XSA9IGZpbGxDaGFyO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IC8vIGlmIHRoZSB2YWx1ZSBpcyBhIG51bWJlciAob3IgYSBidWZmZXIgd2l0aCBhIHNpbmdsZSBieXRlKSB3ZSBjYW4gdXNlIHRpQnVmZmVyLmZpbGwoKTtcblxuXG4gICAgdGhpcy5fdGlCdWZmZXIuZmlsbCh2YWx1ZSwgb2Zmc2V0LCBlbmQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpbmNsdWRlcyh2YWx1ZSwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5pbmRleE9mKHZhbHVlLCBieXRlT2Zmc2V0LCBlbmNvZGluZykgIT09IC0xO1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ3xCdWZmZXJ8aW50ZWdlcn0gdmFsdWUgV2hhdCB0byBzZWFyY2ggZm9yXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gW2J5dGVPZmZzZXQ9MF0gV2hlcmUgdG8gYmVnaW4gc2VhcmNoaW5nIGluIGJ1Zi4gSWYgbmVnYXRpdmUsIHRoZW4gb2Zmc2V0IGlzIGNhbGN1bGF0ZWQgZnJvbSB0aGUgZW5kIG9mIGJ1ZlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2VuY29kaW5nPSd1dGY4J10gSWYgdmFsdWUgaXMgYSBzdHJpbmcsIHRoaXMgaXMgdGhlIGVuY29kaW5nIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBiaW5hcnkgcmVwcmVzZW50YXRpb24gb2YgdGhlIHN0cmluZyB0aGF0IHdpbGwgYmUgc2VhcmNoZWQgZm9yIGluIGJ1ZlxuICAgKiBAcmV0dXJucyB7aW50ZWdlcn0gVGhlIGluZGV4IG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHZhbHVlIGluIGJ1Ziwgb3IgLTEgaWYgYnVmIGRvZXMgbm90IGNvbnRhaW4gdmFsdWUuXG4gICAqL1xuXG5cbiAgaW5kZXhPZih2YWx1ZSwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgICBpZiAodGhpcy5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIGVtcHR5IGJ1ZmZlcj8gY2FuJ3QgZmluZCBhbnl0aGluZyFcbiAgICAgIHJldHVybiAtMTtcbiAgICB9IC8vIGlmIGJ5dGVPZmZzZXQgaXMgdW5kZWZpbmVkLCBtYWtlIGl0IDBcblxuXG4gICAgaWYgKHR5cGVvZiBieXRlT2Zmc2V0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgYnl0ZU9mZnNldCA9IDA7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYnl0ZU9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIGlmIGl0J3MgYSBzdHJpbmcsIHRoYXQncyBhY3R1YWxseSBlbmNvZGluZ1xuICAgICAgZW5jb2RpbmcgPSBieXRlT2Zmc2V0O1xuICAgICAgYnl0ZU9mZnNldCA9IDA7XG4gICAgfSAvLyBpZiB3ZSBkb24ndCBoYXZlIGFuIGVuY29kaW5nIHlldCwgdXNlIHV0ZjhcblxuXG4gICAgaWYgKHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gJ3V0ZjgnO1xuICAgIH1cblxuICAgIGlmIChieXRlT2Zmc2V0IDwgMCkge1xuICAgICAgLy8gY29udmVydCBuZWdhdGl2ZSBpbmRpY2VzXG4gICAgICBieXRlT2Zmc2V0ID0gdGhpcy5sZW5ndGggKyBieXRlT2Zmc2V0O1xuXG4gICAgICBpZiAoYnl0ZU9mZnNldCA8IDApIHtcbiAgICAgICAgLy8gc3RpbGwgbmVnYXRpdmU/IHN0YXJ0IGF0IDBcbiAgICAgICAgYnl0ZU9mZnNldCA9IDA7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChieXRlT2Zmc2V0ID49IHRoaXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gLTE7IC8vIGNhbid0IGZpbmQgcGFzdCBlbmQgb2YgYnVmZmVyIVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICB2YWx1ZSAmPSAweEZGOyAvLyBjbGFtcCB0byAyNTVcbiAgICAgIC8vIFRoaXMgaXMgYSBzaW1wbGVyIGNhc2UsIHdlIGhhdmUgYSBzaW5nbGUgYnl0ZSB3ZSBuZWVkIHRvIHNlYXJjaCBmb3JcbiAgICAgIC8vIHNvIGp1c3QgbG9vcCB0aHJvdWdoIGFuZCB0cnkgdG8gZmluZCBpdFxuXG4gICAgICByZXR1cm4gaW5kZXhPZih0aGlzLCB2YWx1ZSwgYnl0ZU9mZnNldCk7XG4gICAgfSAvLyBjb2VyY2UgYSBzdHJpbmcgdG8gYSBCdWZmZXJcblxuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gQnVmZmVyJDEuZnJvbSh2YWx1ZSwgZW5jb2RpbmcpO1xuICAgIH0gLy8gdmFsdWUgaXMgbm93IGEgQnVmZmVyLi4uXG5cblxuICAgIGNvbnN0IG1hdGNoTGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xuXG4gICAgaWYgKG1hdGNoTGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gLTE7IC8vIG5ldmVyIGZpbmQgZW1wdHkgdmFsdWUhXG4gICAgfVxuXG4gICAgaWYgKG1hdGNoTGVuZ3RoID09PSAxKSB7XG4gICAgICAvLyBzaW1wbGUgY2FzZSwgbWF0Y2ggb25lIGJ5dGUhXG4gICAgICByZXR1cm4gaW5kZXhPZih0aGlzLCB2YWx1ZVswXSwgYnl0ZU9mZnNldCk7XG4gICAgfVxuXG4gICAgbGV0IGN1cnJlbnRJbmRleCA9IGJ5dGVPZmZzZXQ7XG4gICAgY29uc3QgdGhpc0xlbmd0aCA9IHRoaXMubGVuZ3RoO1xuXG4gICAgaWYgKG1hdGNoTGVuZ3RoID4gdGhpc0xlbmd0aCkge1xuICAgICAgcmV0dXJuIC0xOyAvLyBjYW4ndCBtYXRjaCBpZiB0aGUgdmFsdWUgaXMgbG9uZ2VyIHRoYW4gdGhpcyBCdWZmZXIhXG4gICAgfSAvLyBGSVhNRTogQ2FuIHdlIHJld3JpdGUgdGhpcyBpbiBhIGxlc3MgZnVua3kgd2F5P1xuICAgIC8vIEZJWE1FOiBDYW4gc3RvcCBlYXJsaWVyIGJhc2VkIG9uIG1hdGNoTGVuZ3RoIVxuXG5cbiAgICBmaXJzdE1hdGNoOiB3aGlsZSAoY3VycmVudEluZGV4IDwgdGhpc0xlbmd0aCkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1sYWJlbHNcbiAgICAgIC8vIG1hdGNoIGZpcnN0IGJ5dGUhXG4gICAgICBsZXQgZmlyc3RCeXRlTWF0Y2ggPSBpbmRleE9mKHRoaXMsIHZhbHVlWzBdLCBjdXJyZW50SW5kZXgpO1xuXG4gICAgICBpZiAoZmlyc3RCeXRlTWF0Y2ggPT09IC0xKSB7XG4gICAgICAgIC8vIGNvdWxkbid0IGV2ZW4gbWF0Y2ggdGhlIHZlcnkgZmlyc3QgYnl0ZSwgc28gbm8gbWF0Y2ggb3ZlcmFsbCFcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfSAvLyBvaywgd2UgZm91bmQgdGhlIGZpcnN0IGJ5dGUsIG5vdyB3ZSBuZWVkIHRvIHNlZSBpZiB0aGUgbmV4dCBjb25zZWN1dGl2ZSBieXRlcyBtYXRjaCFcblxuXG4gICAgICBmb3IgKGxldCB4ID0gMTsgeCA8IG1hdGNoTGVuZ3RoOyB4KyspIHtcbiAgICAgICAgaWYgKGZpcnN0Qnl0ZU1hdGNoICsgeCA+PSB0aGlzTGVuZ3RoKSB7XG4gICAgICAgICAgY3VycmVudEluZGV4ID0gZmlyc3RCeXRlTWF0Y2ggKyAxOyAvLyBtb3ZlIHBhc3Qgb3VyIGZpcnN0IG1hdGNoXG5cbiAgICAgICAgICBjb250aW51ZSBmaXJzdE1hdGNoOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWxhYmVsc1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXNbZmlyc3RCeXRlTWF0Y2ggKyB4XSAhPT0gdmFsdWVbeF0pIHtcbiAgICAgICAgICAvLyBkaWRuJ3QgbWF0Y2ghXG4gICAgICAgICAgY3VycmVudEluZGV4ID0gZmlyc3RCeXRlTWF0Y2ggKyAxOyAvLyBtb3ZlIHBhc3Qgb3VyIGZpcnN0IG1hdGNoXG5cbiAgICAgICAgICBjb250aW51ZSBmaXJzdE1hdGNoOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWxhYmVsc1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmaXJzdEJ5dGVNYXRjaDsgLy8gdGhlIHJlc3QgbWF0Y2hlZCwgaHVycmF5IVxuICAgIH1cblxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIGtleXMoKSB7XG4gICAgbGV0IG5leHRJbmRleCA9IDA7XG4gICAgY29uc3QgZW5kID0gdGhpcy5sZW5ndGg7XG4gICAgY29uc3QgbXlJdGVyYXRvciA9IHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG5leHRJbmRleCA8IGVuZCkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHZhbHVlOiBuZXh0SW5kZXgsXG4gICAgICAgICAgICBkb25lOiBmYWxzZVxuICAgICAgICAgIH07XG4gICAgICAgICAgbmV4dEluZGV4Kys7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdmFsdWU6IHVuZGVmaW5lZCxcbiAgICAgICAgICBkb25lOiB0cnVlXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgW1N5bWJvbC5pdGVyYXRvcl06IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gbXlJdGVyYXRvcjtcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbb2Zmc2V0PTBdIE51bWJlciBvZiBieXRlcyB0byBza2lwIGJlZm9yZSBzdGFydGluZyB0byByZWFkLiBNdXN0IHNhdGlzZnkgMCA8PSBvZmZzZXQgPD0gYnVmLmxlbmd0aCAtIDhcbiAgICogQHJldHVybnMge2RvdWJsZX0gUmVhZHMgYSA2NC1iaXQgZG91YmxlIGZyb20gYnVmIGF0IHRoZSBzcGVjaWZpZWQgb2Zmc2V0IHdpdGggc3BlY2lmaWVkIGVuZGlhbiBmb3JtYXRcbiAgICovXG5cblxuICByZWFkRG91YmxlQkUob2Zmc2V0ID0gMCkge1xuICAgIGNoZWNrT2Zmc2V0KHRoaXMsIG9mZnNldCwgOCk7IC8vIE5vZGUgY2hlYXRzIGFuZCB1c2VzIGEgRmxvYXQ2NEFycmF5IGFuZCBVSW50OEFycmF5IGJhY2tlZCBieSB0aGUgc2FtZSBidWZmZXJcbiAgICAvLyBzbyBiYXNpY2FsbHkgaXQgcmVhZHMgaW4gdGhlIGJ5dGVzIHN0dWZmaW5nIHRoZW0gaW50byBVaW50OEFycmF5LCB0aGVuIHJldHVybnMgdGhlIHZhbHVlIGZyb20gdGhlIEZsb2F0NjRBcnJheVxuICAgIC8vIEZJWE1FOiBUaGlzIGFzc3VtZXMgTEUgc3lzdGVtIGJ5dGVPcmRlclxuXG4gICAgdWludDhEb3VibGVBcnJheVs3XSA9IHRoaXNbb2Zmc2V0KytdO1xuICAgIHVpbnQ4RG91YmxlQXJyYXlbNl0gPSB0aGlzW29mZnNldCsrXTtcbiAgICB1aW50OERvdWJsZUFycmF5WzVdID0gdGhpc1tvZmZzZXQrK107XG4gICAgdWludDhEb3VibGVBcnJheVs0XSA9IHRoaXNbb2Zmc2V0KytdO1xuICAgIHVpbnQ4RG91YmxlQXJyYXlbM10gPSB0aGlzW29mZnNldCsrXTtcbiAgICB1aW50OERvdWJsZUFycmF5WzJdID0gdGhpc1tvZmZzZXQrK107XG4gICAgdWludDhEb3VibGVBcnJheVsxXSA9IHRoaXNbb2Zmc2V0KytdO1xuICAgIHVpbnQ4RG91YmxlQXJyYXlbMF0gPSB0aGlzW29mZnNldCsrXTtcbiAgICByZXR1cm4gZG91YmxlQXJyYXlbMF07XG4gIH1cbiAgLyoqXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gW29mZnNldD0wXSBOdW1iZXIgb2YgYnl0ZXMgdG8gc2tpcCBiZWZvcmUgc3RhcnRpbmcgdG8gcmVhZC4gTXVzdCBzYXRpc2Z5IDAgPD0gb2Zmc2V0IDw9IGJ1Zi5sZW5ndGggLSA4XG4gICAqIEByZXR1cm5zIHtkb3VibGV9IFJlYWRzIGEgNjQtYml0IGRvdWJsZSBmcm9tIGJ1ZiBhdCB0aGUgc3BlY2lmaWVkIG9mZnNldCB3aXRoIHNwZWNpZmllZCBlbmRpYW4gZm9ybWF0XG4gICAqL1xuXG5cbiAgcmVhZERvdWJsZUxFKG9mZnNldCA9IDApIHtcbiAgICBjaGVja09mZnNldCh0aGlzLCBvZmZzZXQsIDgpOyAvLyBOb2RlIGNoZWF0cyBhbmQgdXNlcyBhIEZsb2F0NjRBcnJheSBhbmQgVUludDhBcnJheSBiYWNrZWQgYnkgdGhlIHNhbWUgYnVmZmVyXG4gICAgLy8gc28gYmFzaWNhbGx5IGl0IHJlYWRzIGluIHRoZSBieXRlcyBzdHVmZmluZyB0aGVtIGludG8gVWludDhBcnJheSwgdGhlbiByZXR1cm5zIHRoZSB2YWx1ZSBmcm9tIHRoZSBGbG9hdDY0QXJyYXlcbiAgICAvLyBGSVhNRTogVGhpcyBhc3N1bWVzIExFIHN5c3RlbSBieXRlT3JkZXJcblxuICAgIHVpbnQ4RG91YmxlQXJyYXlbMF0gPSB0aGlzW29mZnNldCsrXTtcbiAgICB1aW50OERvdWJsZUFycmF5WzFdID0gdGhpc1tvZmZzZXQrK107XG4gICAgdWludDhEb3VibGVBcnJheVsyXSA9IHRoaXNbb2Zmc2V0KytdO1xuICAgIHVpbnQ4RG91YmxlQXJyYXlbM10gPSB0aGlzW29mZnNldCsrXTtcbiAgICB1aW50OERvdWJsZUFycmF5WzRdID0gdGhpc1tvZmZzZXQrK107XG4gICAgdWludDhEb3VibGVBcnJheVs1XSA9IHRoaXNbb2Zmc2V0KytdO1xuICAgIHVpbnQ4RG91YmxlQXJyYXlbNl0gPSB0aGlzW29mZnNldCsrXTtcbiAgICB1aW50OERvdWJsZUFycmF5WzddID0gdGhpc1tvZmZzZXQrK107XG4gICAgcmV0dXJuIGRvdWJsZUFycmF5WzBdO1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IFtvZmZzZXQ9MF0gTnVtYmVyIG9mIGJ5dGVzIHRvIHNraXAgYmVmb3JlIHN0YXJ0aW5nIHRvIHJlYWQuIE11c3Qgc2F0aXNmeSAwIDw9IG9mZnNldCA8PSBidWYubGVuZ3RoIC0gNFxuICAgKiBAcmV0dXJucyB7ZmxvYXR9IFJlYWRzIGEgMzItYml0IGZsb2F0IGZyb20gYnVmIGF0IHRoZSBzcGVjaWZpZWQgb2Zmc2V0IHdpdGggc3BlY2lmaWVkIGVuZGlhbiBmb3JtYXRcbiAgICovXG5cblxuICByZWFkRmxvYXRCRShvZmZzZXQgPSAwKSB7XG4gICAgY2hlY2tPZmZzZXQodGhpcywgb2Zmc2V0LCA0KTsgLy8gTm9kZSBjaGVhdHMgYW5kIHVzZXMgYSBGbG9hdDMyQXJyYXkgYW5kIFVJbnQ4QXJyYXkgYmFja2VkIGJ5IHRoZSBzYW1lIGJ1ZmZlclxuICAgIC8vIHNvIGJhc2ljYWxseSBpdCByZWFkcyBpbiB0aGUgYnl0ZXMgc3R1ZmZpbmcgdGhlbSBpbnRvIFVpbnQ4QXJyYXksIHRoZW4gcmV0dXJucyB0aGUgdmFsdWUgZnJvbSB0aGUgRmxvYXQzMkFycmF5XG4gICAgLy8gRklYTUU6IFRoaXMgYXNzdW1lcyBMRSBzeXN0ZW0gYnl0ZU9yZGVyXG5cbiAgICB1aW50OEZsb2F0QXJyYXlbM10gPSB0aGlzW29mZnNldCsrXTtcbiAgICB1aW50OEZsb2F0QXJyYXlbMl0gPSB0aGlzW29mZnNldCsrXTtcbiAgICB1aW50OEZsb2F0QXJyYXlbMV0gPSB0aGlzW29mZnNldCsrXTtcbiAgICB1aW50OEZsb2F0QXJyYXlbMF0gPSB0aGlzW29mZnNldCsrXTtcbiAgICByZXR1cm4gZmxvYXRBcnJheVswXTtcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbb2Zmc2V0PTBdIE51bWJlciBvZiBieXRlcyB0byBza2lwIGJlZm9yZSBzdGFydGluZyB0byByZWFkLiBNdXN0IHNhdGlzZnkgMCA8PSBvZmZzZXQgPD0gYnVmLmxlbmd0aCAtIDRcbiAgICogQHJldHVybnMge2Zsb2F0fSBSZWFkcyBhIDMyLWJpdCBmbG9hdCBmcm9tIGJ1ZiBhdCB0aGUgc3BlY2lmaWVkIG9mZnNldCB3aXRoIHNwZWNpZmllZCBlbmRpYW4gZm9ybWF0XG4gICAqL1xuXG5cbiAgcmVhZEZsb2F0TEUob2Zmc2V0ID0gMCkge1xuICAgIGNoZWNrT2Zmc2V0KHRoaXMsIG9mZnNldCwgNCk7IC8vIE5vZGUgY2hlYXRzIGFuZCB1c2VzIGEgRmxvYXQzMkFycmF5IGFuZCBVSW50OEFycmF5IGJhY2tlZCBieSB0aGUgc2FtZSBidWZmZXJcbiAgICAvLyBzbyBiYXNpY2FsbHkgaXQgcmVhZHMgaW4gdGhlIGJ5dGVzIHN0dWZmaW5nIHRoZW0gaW50byBVaW50OEFycmF5LCB0aGVuIHJldHVybnMgdGhlIHZhbHVlIGZyb20gdGhlIEZsb2F0MzJBcnJheVxuICAgIC8vIEZJWE1FOiBUaGlzIGFzc3VtZXMgTEUgc3lzdGVtIGJ5dGVPcmRlclxuXG4gICAgdWludDhGbG9hdEFycmF5WzBdID0gdGhpc1tvZmZzZXQrK107XG4gICAgdWludDhGbG9hdEFycmF5WzFdID0gdGhpc1tvZmZzZXQrK107XG4gICAgdWludDhGbG9hdEFycmF5WzJdID0gdGhpc1tvZmZzZXQrK107XG4gICAgdWludDhGbG9hdEFycmF5WzNdID0gdGhpc1tvZmZzZXQrK107XG4gICAgcmV0dXJuIGZsb2F0QXJyYXlbMF07XG4gIH1cbiAgLyoqXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gW29mZnNldD0wXSBOdW1iZXIgb2YgYnl0ZXMgdG8gc2tpcCBiZWZvcmUgc3RhcnRpbmcgdG8gcmVhZC4gTXVzdCBzYXRpc2Z5IDAgPD0gb2Zmc2V0IDw9IGJ1Zi5sZW5ndGggLSAxLlxuICAgKiBAcmV0dXJucyB7aW50ZWdlcn1cbiAgICovXG5cblxuICByZWFkSW50OChvZmZzZXQgPSAwKSB7XG4gICAgY29uc3QgdW5zaWduZWRWYWx1ZSA9IHRoaXMucmVhZFVJbnQ4KG9mZnNldCk7XG4gICAgcmV0dXJuIHVuc2lnbmVkVG9TaWduZWQodW5zaWduZWRWYWx1ZSwgMSk7XG4gIH1cbiAgLyoqXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gW29mZnNldD0wXSBOdW1iZXIgb2YgYnl0ZXMgdG8gc2tpcCBiZWZvcmUgc3RhcnRpbmcgdG8gcmVhZC4gTXVzdCBzYXRpc2Z5IDAgPD0gb2Zmc2V0IDw9IGJ1Zi5sZW5ndGggLSAyLlxuICAgKiBAcmV0dXJucyB7aW50ZWdlcn1cbiAgICovXG5cblxuICByZWFkSW50MTZCRShvZmZzZXQpIHtcbiAgICBjb25zdCB1bnNpZ25lZFZhbHVlID0gdGhpcy5yZWFkVUludDE2QkUob2Zmc2V0KTtcbiAgICByZXR1cm4gdW5zaWduZWRUb1NpZ25lZCh1bnNpZ25lZFZhbHVlLCAyKTtcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbb2Zmc2V0PTBdIE51bWJlciBvZiBieXRlcyB0byBza2lwIGJlZm9yZSBzdGFydGluZyB0byByZWFkLiBNdXN0IHNhdGlzZnkgMCA8PSBvZmZzZXQgPD0gYnVmLmxlbmd0aCAtIDIuXG4gICAqIEByZXR1cm5zIHtpbnRlZ2VyfVxuICAgKi9cblxuXG4gIHJlYWRJbnQxNkxFKG9mZnNldCA9IDApIHtcbiAgICBjb25zdCB1bnNpZ25lZFZhbHVlID0gdGhpcy5yZWFkVUludDE2TEUob2Zmc2V0KTtcbiAgICByZXR1cm4gdW5zaWduZWRUb1NpZ25lZCh1bnNpZ25lZFZhbHVlLCAyKTtcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbb2Zmc2V0PTBdIE51bWJlciBvZiBieXRlcyB0byBza2lwIGJlZm9yZSBzdGFydGluZyB0byByZWFkLiBNdXN0IHNhdGlzZnkgMCA8PSBvZmZzZXQgPD0gYnVmLmxlbmd0aCAtIDQuXG4gICAqIEByZXR1cm5zIHtpbnRlZ2VyfVxuICAgKi9cblxuXG4gIHJlYWRJbnQzMkJFKG9mZnNldCA9IDApIHtcbiAgICBjb25zdCB1bnNpZ25lZFZhbHVlID0gdGhpcy5yZWFkVUludDMyQkUob2Zmc2V0KTtcbiAgICByZXR1cm4gdW5zaWduZWRUb1NpZ25lZCh1bnNpZ25lZFZhbHVlLCA0KTtcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbb2Zmc2V0PTBdIE51bWJlciBvZiBieXRlcyB0byBza2lwIGJlZm9yZSBzdGFydGluZyB0byByZWFkLiBNdXN0IHNhdGlzZnkgMCA8PSBvZmZzZXQgPD0gYnVmLmxlbmd0aCAtIDQuXG4gICAqIEByZXR1cm5zIHtpbnRlZ2VyfVxuICAgKi9cblxuXG4gIHJlYWRJbnQzMkxFKG9mZnNldCA9IDApIHtcbiAgICBjb25zdCB1bnNpZ25lZFZhbHVlID0gdGhpcy5yZWFkVUludDMyTEUob2Zmc2V0KTtcbiAgICByZXR1cm4gdW5zaWduZWRUb1NpZ25lZCh1bnNpZ25lZFZhbHVlLCA0KTtcbiAgfVxuICAvKipcbiAgICogUmVhZHMgYnl0ZUxlbmd0aCBudW1iZXIgb2YgYnl0ZXMgZnJvbSBidWYgYXQgdGhlIHNwZWNpZmllZCBvZmZzZXQgYW5kIGludGVycHJldHMgdGhlIHJlc3VsdCBhcyBhIHR3bydzIGNvbXBsZW1lbnQgc2lnbmVkIHZhbHVlLiBTdXBwb3J0cyB1cCB0byA0OCBiaXRzIG9mIGFjY3VyYWN5LlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IG9mZnNldCBOdW1iZXIgb2YgYnl0ZXMgdG8gc2tpcCBiZWZvcmUgc3RhcnRpbmcgdG8gcmVhZC4gTXVzdCBzYXRpc2Z5IDAgPD0gb2Zmc2V0IDw9IGJ1Zi5sZW5ndGggLSBieXRlTGVuZ3RoLlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IGJ5dGVMZW5ndGggdW1iZXIgb2YgYnl0ZXMgdG8gcmVhZC4gTXVzdCBzYXRpc2Z5IDAgPCBieXRlTGVuZ3RoIDw9IDYuXG4gICAqIEByZXR1cm5zIHtpbnRlZ2VyfVxuICAgKi9cblxuXG4gIHJlYWRJbnRCRShvZmZzZXQsIGJ5dGVMZW5ndGgpIHtcbiAgICBjb25zdCB1bnNpZ25lZFZhbHVlID0gdGhpcy5yZWFkVUludEJFKG9mZnNldCwgYnl0ZUxlbmd0aCk7XG4gICAgcmV0dXJuIHVuc2lnbmVkVG9TaWduZWQodW5zaWduZWRWYWx1ZSwgYnl0ZUxlbmd0aCk7XG4gIH1cbiAgLyoqXG4gICAqIFJlYWRzIGJ5dGVMZW5ndGggbnVtYmVyIG9mIGJ5dGVzIGZyb20gYnVmIGF0IHRoZSBzcGVjaWZpZWQgb2Zmc2V0IGFuZCBpbnRlcnByZXRzIHRoZSByZXN1bHQgYXMgYSB0d28ncyBjb21wbGVtZW50IHNpZ25lZCB2YWx1ZS4gU3VwcG9ydHMgdXAgdG8gNDggYml0cyBvZiBhY2N1cmFjeS5cbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBvZmZzZXQgTnVtYmVyIG9mIGJ5dGVzIHRvIHNraXAgYmVmb3JlIHN0YXJ0aW5nIHRvIHJlYWQuIE11c3Qgc2F0aXNmeSAwIDw9IG9mZnNldCA8PSBidWYubGVuZ3RoIC0gYnl0ZUxlbmd0aC5cbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBieXRlTGVuZ3RoIHVtYmVyIG9mIGJ5dGVzIHRvIHJlYWQuIE11c3Qgc2F0aXNmeSAwIDwgYnl0ZUxlbmd0aCA8PSA2LlxuICAgKiBAcmV0dXJucyB7aW50ZWdlcn1cbiAgICovXG5cblxuICByZWFkSW50TEUob2Zmc2V0LCBieXRlTGVuZ3RoKSB7XG4gICAgY29uc3QgdW5zaWduZWRWYWx1ZSA9IHRoaXMucmVhZFVJbnRMRShvZmZzZXQsIGJ5dGVMZW5ndGgpO1xuICAgIHJldHVybiB1bnNpZ25lZFRvU2lnbmVkKHVuc2lnbmVkVmFsdWUsIGJ5dGVMZW5ndGgpO1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IFtvZmZzZXQ9MF0gTnVtYmVyIG9mIGJ5dGVzIHRvIHNraXAgYmVmb3JlIHN0YXJ0aW5nIHRvIHJlYWQuIE11c3Qgc2F0aXNmeSAwIDw9IG9mZnNldCA8PSBidWYubGVuZ3RoIC0gMS5cbiAgICogQHJldHVybnMge2ludGVnZXJ9XG4gICAqL1xuXG5cbiAgcmVhZFVJbnQ4KG9mZnNldCA9IDApIHtcbiAgICBjaGVja09mZnNldCh0aGlzLCBvZmZzZXQsIDEpO1xuICAgIHJldHVybiB0aGlzW29mZnNldF07XG4gIH1cbiAgLyoqXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gW29mZnNldD0wXSBOdW1iZXIgb2YgYnl0ZXMgdG8gc2tpcCBiZWZvcmUgc3RhcnRpbmcgdG8gcmVhZC4gTXVzdCBzYXRpc2Z5IDAgPD0gb2Zmc2V0IDw9IGJ1Zi5sZW5ndGggLSAyLlxuICAgKiBAcmV0dXJucyB7aW50ZWdlcn1cbiAgICovXG5cblxuICByZWFkVUludDE2QkUob2Zmc2V0ID0gMCkge1xuICAgIGNoZWNrT2Zmc2V0KHRoaXMsIG9mZnNldCwgMik7IC8vIGZpcnN0IGJ5dGUgc2hpZnRlZCBhbmQgT1InZCB3aXRoIHNlY29uZCBieXRlXG5cbiAgICByZXR1cm4gdGhpc1tvZmZzZXRdIDw8IDggfCB0aGlzW29mZnNldCArIDFdO1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IFtvZmZzZXQ9MF0gTnVtYmVyIG9mIGJ5dGVzIHRvIHNraXAgYmVmb3JlIHN0YXJ0aW5nIHRvIHJlYWQuIE11c3Qgc2F0aXNmeSAwIDw9IG9mZnNldCA8PSBidWYubGVuZ3RoIC0gMi5cbiAgICogQHJldHVybnMge2ludGVnZXJ9XG4gICAqL1xuXG5cbiAgcmVhZFVJbnQxNkxFKG9mZnNldCA9IDApIHtcbiAgICBjaGVja09mZnNldCh0aGlzLCBvZmZzZXQsIDIpOyAvLyBmaXJzdCBieXRlIE9SJ2Qgd2l0aCBzZWNvbmQgYnl0ZSBzaGlmdGVkXG5cbiAgICByZXR1cm4gdGhpc1tvZmZzZXRdIHwgdGhpc1tvZmZzZXQgKyAxXSA8PCA4O1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IFtvZmZzZXQ9MF0gTnVtYmVyIG9mIGJ5dGVzIHRvIHNraXAgYmVmb3JlIHN0YXJ0aW5nIHRvIHJlYWQuIE11c3Qgc2F0aXNmeSAwIDw9IG9mZnNldCA8PSBidWYubGVuZ3RoIC0gNC5cbiAgICogQHJldHVybnMge2ludGVnZXJ9XG4gICAqL1xuXG5cbiAgcmVhZFVJbnQzMkJFKG9mZnNldCA9IDApIHtcbiAgICBjaGVja09mZnNldCh0aGlzLCBvZmZzZXQsIDQpO1xuICAgIHJldHVybiB0aGlzW29mZnNldF0gKiAweDEwMDAwMDAgKyAodGhpc1tvZmZzZXQgKyAxXSA8PCAxNiB8IHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCB8IHRoaXNbb2Zmc2V0ICsgM10pOyAvLyByYXRoZXIgdGhhbiBzaGlmdGluZyBieSA8PCAyNCwgbXVsdGlwbHkgdGhlIGZpcnN0IGJ5dGUgYW5kIGFkZCBpdCBpbiBzbyB3ZSBkb24ndCByZXRhaW4gdGhlIFwic2lnbiBiaXRcIlxuICAgIC8vIChiZWNhdXNlIGJpdC13aXNlIG9wZXJhdG9ycyBhc3N1bWUgYSAzMi1iaXQgbnVtYmVyKVxuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IFtvZmZzZXQ9MF0gTnVtYmVyIG9mIGJ5dGVzIHRvIHNraXAgYmVmb3JlIHN0YXJ0aW5nIHRvIHJlYWQuIE11c3Qgc2F0aXNmeSAwIDw9IG9mZnNldCA8PSBidWYubGVuZ3RoIC0gNC5cbiAgICogQHJldHVybnMge2ludGVnZXJ9XG4gICAqL1xuXG5cbiAgcmVhZFVJbnQzMkxFKG9mZnNldCA9IDApIHtcbiAgICBjaGVja09mZnNldCh0aGlzLCBvZmZzZXQsIDQpO1xuICAgIHJldHVybiAodGhpc1tvZmZzZXRdIHwgdGhpc1tvZmZzZXQgKyAxXSA8PCA4IHwgdGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgKyB0aGlzW29mZnNldCArIDNdICogMHgxMDAwMDAwOyAvLyByYXRoZXIgdGhhbiBzaGlmdGluZyBieSA8PCAyNCwgbXVsdGlwbHkgdGhlIGxhc3QgYnl0ZSBhbmQgYWRkIGl0IGluIHNvIHdlIGRvbid0IHJldGFpbiB0aGUgXCJzaWduIGJpdFwiXG4gIH1cbiAgLyoqXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gb2Zmc2V0IE51bWJlciBvZiBieXRlcyB0byBza2lwIGJlZm9yZSBzdGFydGluZyB0byByZWFkLiBNdXN0IHNhdGlzZnkgMCA8PSBvZmZzZXQgPD0gYnVmLmxlbmd0aCAtIGJ5dGVMZW5ndGguXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gYnl0ZUxlbmd0aCBOdW1iZXIgb2YgYnl0ZXMgdG8gcmVhZC4gTXVzdCBzYXRpc2Z5IDAgPCBieXRlTGVuZ3RoIDw9IDYuXG4gICAqIEByZXR1cm5zIHtpbnRlZ2VyfVxuICAgKi9cblxuXG4gIHJlYWRVSW50QkUob2Zmc2V0LCBieXRlTGVuZ3RoKSB7XG4gICAgaWYgKGJ5dGVMZW5ndGggPD0gMCB8fCBieXRlTGVuZ3RoID4gNikge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpO1xuICAgIH1cblxuICAgIGNoZWNrT2Zmc2V0KHRoaXMsIG9mZnNldCwgYnl0ZUxlbmd0aCk7XG4gICAgbGV0IHJlc3VsdCA9IDA7XG4gICAgbGV0IG11bHRpcGxpZXIgPSAxOyAvLyB3ZSB1c2UgYSBtdWx0aXBsZXIgZm9yIGVhY2ggYnl0ZVxuICAgIC8vIHdlJ3JlIGRvaW5nIHRoZSBzYW1lIGxvb3AgYXMgI3JlYWRVSW50TEUsIGp1c3QgYmFja3dhcmRzIVxuXG4gICAgZm9yIChsZXQgaSA9IGJ5dGVMZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgcmVzdWx0ICs9IGdldEFkanVzdGVkSW5kZXgodGhpcywgb2Zmc2V0ICsgaSkgKiBtdWx0aXBsaWVyO1xuICAgICAgbXVsdGlwbGllciAqPSAweDEwMDsgLy8gbW92ZSBtdWx0aXBsaWVyIHRvIG5leHQgYnl0ZVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgLyoqXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gb2Zmc2V0IE51bWJlciBvZiBieXRlcyB0byBza2lwIGJlZm9yZSBzdGFydGluZyB0byByZWFkLiBNdXN0IHNhdGlzZnkgMCA8PSBvZmZzZXQgPD0gYnVmLmxlbmd0aCAtIGJ5dGVMZW5ndGguXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gYnl0ZUxlbmd0aCBOdW1iZXIgb2YgYnl0ZXMgdG8gcmVhZC4gTXVzdCBzYXRpc2Z5IDAgPCBieXRlTGVuZ3RoIDw9IDYuXG4gICAqIEByZXR1cm5zIHtpbnRlZ2VyfVxuICAgKi9cblxuXG4gIHJlYWRVSW50TEUob2Zmc2V0LCBieXRlTGVuZ3RoKSB7XG4gICAgaWYgKGJ5dGVMZW5ndGggPD0gMCB8fCBieXRlTGVuZ3RoID4gNikge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpO1xuICAgIH1cblxuICAgIGNoZWNrT2Zmc2V0KHRoaXMsIG9mZnNldCwgYnl0ZUxlbmd0aCk7XG4gICAgbGV0IHJlc3VsdCA9IDA7XG4gICAgbGV0IG11bHRpcGxpZXIgPSAxOyAvLyB3ZSB1c2UgYSBtdWx0aXBsZXIgZm9yIGVhY2ggYnl0ZVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlTGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdCArPSBnZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCArIGkpICogbXVsdGlwbGllcjtcbiAgICAgIG11bHRpcGxpZXIgKj0gMHgxMDA7IC8vIG1vdmUgbXVsdGlwbGllciB0byBuZXh0IGJ5dGVcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IFtzdGFydD0wXSBXaGVyZSB0aGUgbmV3IGBCdWZmZXJgIHdpbGwgc3RhcnQuXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gW2VuZD10aGlzLmxlbmd0aF0gV2hlcmUgdGhlIG5ldyBCdWZmZXIgd2lsbCBlbmQgKG5vdCBpbmNsdXNpdmUpLiBEZWZhdWx0OiBgYnVmLmxlbmd0aGAuXG4gICAqIEByZXR1cm5zIHtCdWZmZXJ9XG4gICAqL1xuXG5cbiAgc2xpY2Uoc3RhcnQsIGVuZCkge1xuICAgIGNvbnN0IHRoaXNMZW5ndGggPSB0aGlzLmxlbmd0aDtcblxuICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfSBlbHNlIGlmIChzdGFydCA8IDApIHtcbiAgICAgIHN0YXJ0ID0gdGhpc0xlbmd0aCArIHN0YXJ0O1xuXG4gICAgICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgICAgIC8vIGlmIHRoaXMgaXMgc3RpbGwgbmVnYXRpdmUsIHVzZSAwICh0aGF0IG1hdGNoZXMgTm9kZSlcbiAgICAgICAgc3RhcnQgPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZW5kID09PSAndW5kZWZpbmVkJykge1xuICAgICAgZW5kID0gdGhpc0xlbmd0aDtcbiAgICB9IGVsc2UgaWYgKGVuZCA8IDApIHtcbiAgICAgIGVuZCA9IHRoaXNMZW5ndGggKyBlbmQ7XG4gICAgfSAvLyBTcGVjaWZ5aW5nIGVuZCBncmVhdGVyIHRoYW4gYnVmLmxlbmd0aCB3aWxsIHJldHVybiB0aGUgc2FtZSByZXN1bHQgYXMgdGhhdCBvZiBlbmQgZXF1YWwgdG8gYnVmLmxlbmd0aC5cblxuXG4gICAgaWYgKGVuZCA+IHRoaXNMZW5ndGgpIHtcbiAgICAgIGVuZCA9IHRoaXNMZW5ndGg7XG4gICAgfSAvLyBXaGF0IGlmIGVuZCBpcyBsZXNzIHRoYW4gc3RhcnQ/XG5cblxuICAgIGxldCBsZW5ndGggPSBlbmQgLSBzdGFydDtcblxuICAgIGlmIChsZW5ndGggPD0gMCkge1xuICAgICAgbGVuZ3RoID0gMDsgLy8gcmV0dXJuIGVtcHR5IHZpZXcgb2YgQnVmZmVyISByZXRhaW4gYnl0ZSBvZmZzZXQsIHNldCBsZW5ndGggdG8gMFxuICAgIH0gLy8gV3JhcCB0aGUgc2FtZSBUaS5CdWZmZXIgb2JqZWN0IGJ1dCBzcGVjaWZ5IHRoZSBzdGFydC9lbmQgdG8gXCJjcm9wXCIgd2l0aFxuXG5cbiAgICByZXR1cm4gbmV3QnVmZmVyKHRoaXMuX3RpQnVmZmVyLCB0aGlzLmJ5dGVPZmZzZXQgKyBzdGFydCwgbGVuZ3RoKTtcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbc3RhcnQ9MF0gV2hlcmUgdGhlIG5ldyBgQnVmZmVyYCB3aWxsIHN0YXJ0LlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IFtlbmQ9dGhpcy5sZW5ndGhdIFdoZXJlIHRoZSBuZXcgQnVmZmVyIHdpbGwgZW5kIChub3QgaW5jbHVzaXZlKS4gRGVmYXVsdDogYGJ1Zi5sZW5ndGhgLlxuICAgKiBAcmV0dXJucyB7QnVmZmVyfVxuICAgKi9cblxuXG4gIHN1YmFycmF5KHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gdGhpcy5zbGljZShzdGFydCwgZW5kKTtcbiAgfVxuICAvKipcbiAgICogSW50ZXJwcmV0cyBidWYgYXMgYW4gYXJyYXkgb2YgdW5zaWduZWQgMTYtYml0IGludGVnZXJzIGFuZCBzd2FwcyB0aGUgYnl0ZSBvcmRlciBpbi1wbGFjZS5cbiAgICogVGhyb3dzIEVSUl9JTlZBTElEX0JVRkZFUl9TSVpFIGlmIGJ1Zi5sZW5ndGggaXMgbm90IGEgbXVsdGlwbGUgb2YgMi5cbiAgICogQHJldHVybnMge0J1ZmZlcn1cbiAgICovXG5cblxuICBzd2FwMTYoKSB7XG4gICAgY29uc3QgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG5cbiAgICBpZiAobGVuZ3RoICUgMiAhPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAxNi1iaXRzJyk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMikge1xuICAgICAgY29uc3QgZmlyc3QgPSBnZXRBZGp1c3RlZEluZGV4KHRoaXMsIGkpO1xuICAgICAgY29uc3Qgc2Vjb25kID0gZ2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBpICsgMSk7XG4gICAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIGksIHNlY29uZCk7XG4gICAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIGkgKyAxLCBmaXJzdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqXG4gICAqIEludGVycHJldHMgYnVmIGFzIGFuIGFycmF5IG9mIHVuc2lnbmVkIDMyLWJpdCBpbnRlZ2VycyBhbmQgc3dhcHMgdGhlIGJ5dGUgb3JkZXIgaW4tcGxhY2UuXG4gICAqIFRocm93cyBFUlJfSU5WQUxJRF9CVUZGRVJfU0laRSBpZiBidWYubGVuZ3RoIGlzIG5vdCBhIG11bHRpcGxlIG9mIDQuXG4gICAqIEByZXR1cm5zIHtCdWZmZXJ9XG4gICAqL1xuXG5cbiAgc3dhcDMyKCkge1xuICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuXG4gICAgaWYgKGxlbmd0aCAlIDQgIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMzItYml0cycpO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDQpIHtcbiAgICAgIGNvbnN0IGZpcnN0ID0gZ2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBpKTtcbiAgICAgIGNvbnN0IHNlY29uZCA9IGdldEFkanVzdGVkSW5kZXgodGhpcywgaSArIDEpO1xuICAgICAgY29uc3QgdGhpcmQgPSBnZXRBZGp1c3RlZEluZGV4KHRoaXMsIGkgKyAyKTtcbiAgICAgIGNvbnN0IGZvdXJ0aCA9IGdldEFkanVzdGVkSW5kZXgodGhpcywgaSArIDMpO1xuICAgICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBpLCBmb3VydGgpO1xuICAgICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBpICsgMSwgdGhpcmQpO1xuICAgICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBpICsgMiwgc2Vjb25kKTtcbiAgICAgIHNldEFkanVzdGVkSW5kZXgodGhpcywgaSArIDMsIGZpcnN0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogSW50ZXJwcmV0cyBidWYgYXMgYW4gYXJyYXkgb2YgdW5zaWduZWQgNjQtYml0IGludGVnZXJzIGFuZCBzd2FwcyB0aGUgYnl0ZSBvcmRlciBpbi1wbGFjZS5cbiAgICogVGhyb3dzIEVSUl9JTlZBTElEX0JVRkZFUl9TSVpFIGlmIGJ1Zi5sZW5ndGggaXMgbm90IGEgbXVsdGlwbGUgb2YgOC5cbiAgICogQHJldHVybnMge0J1ZmZlcn1cbiAgICovXG5cblxuICBzd2FwNjQoKSB7XG4gICAgY29uc3QgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG5cbiAgICBpZiAobGVuZ3RoICUgOCAhPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA2NC1iaXRzJyk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gOCkge1xuICAgICAgY29uc3QgZmlyc3QgPSBnZXRBZGp1c3RlZEluZGV4KHRoaXMsIGkpO1xuICAgICAgY29uc3Qgc2Vjb25kID0gZ2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBpICsgMSk7XG4gICAgICBjb25zdCB0aGlyZCA9IGdldEFkanVzdGVkSW5kZXgodGhpcywgaSArIDIpO1xuICAgICAgY29uc3QgZm91cnRoID0gZ2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBpICsgMyk7XG4gICAgICBjb25zdCBmaWZ0aCA9IGdldEFkanVzdGVkSW5kZXgodGhpcywgaSArIDQpO1xuICAgICAgY29uc3Qgc2l4dGggPSBnZXRBZGp1c3RlZEluZGV4KHRoaXMsIGkgKyA1KTtcbiAgICAgIGNvbnN0IHNldmVudGggPSBnZXRBZGp1c3RlZEluZGV4KHRoaXMsIGkgKyA2KTtcbiAgICAgIGNvbnN0IGVpZ2h0aCA9IGdldEFkanVzdGVkSW5kZXgodGhpcywgaSArIDcpO1xuICAgICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBpLCBlaWdodGgpO1xuICAgICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBpICsgMSwgc2V2ZW50aCk7XG4gICAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIGkgKyAyLCBzaXh0aCk7XG4gICAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIGkgKyAzLCBmaWZ0aCk7XG4gICAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIGkgKyA0LCBmb3VydGgpO1xuICAgICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBpICsgNSwgdGhpcmQpO1xuICAgICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBpICsgNiwgc2Vjb25kKTtcbiAgICAgIHNldEFkanVzdGVkSW5kZXgodGhpcywgaSArIDcsIGZpcnN0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKipcbiAgICogQHJldHVybnMge29iamVjdH1cbiAgICovXG5cblxuICB0b0pTT04oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdCdWZmZXInLFxuICAgICAgLy8gVGFrZSBhZHZhbnRhZ2Ugb2Ygc2xpY2Ugd29ya2luZyBvbiBcIkFycmF5LWxpa2VcIiBvYmplY3RzIChqdXRzIGxpa2UgYGFyZ3VtZW50c2ApXG4gICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9zbGljZSNBcnJheS1saWtlX29iamVjdHNcbiAgICAgIGRhdGE6IFtdLnNsaWNlLmNhbGwodGhpcylcbiAgICB9O1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2VuY29kaW5nPSd1dGY4J10gVGhlIGNoYXJhY3RlciBlbmNvZGluZyB0byB1c2VcbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbc3RhcnQ9MF0gVGhlIGJ5dGUgb2Zmc2V0IHRvIHN0YXJ0IGRlY29kaW5nIGF0XG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gW2VuZF0gVGhlIGJ5dGUgb2Zmc2V0IHRvIHN0b3AgZGVjb2RpbmcgYXQgKG5vdCBpbmNsdXNpdmUpLiBgYnVmLmxlbmd0aGAgZGVmYXVsdFxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cblxuXG4gIHRvU3RyaW5nKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gICAgLy8gZmFzdCBjYXNlIG9mIG5vIGFyZ3NcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3RpQnVmZmVyLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgY29uc3QgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG5cbiAgICBpZiAoc3RhcnQgPj0gbGVuZ3RoKSB7XG4gICAgICByZXR1cm4gJyc7IC8vIHN0YXJ0IGlzIHBhc3QgZW5kIG9mIGJ1ZmZlciwgcmV0dXJuIGVtcHR5IHN0cmluZ1xuICAgIH1cblxuICAgIGlmIChzdGFydCA8IDAgfHwgdHlwZW9mIHN0YXJ0ICE9PSAnbnVtYmVyJykge1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cblxuICAgIGlmIChlbmQgPiBsZW5ndGggfHwgdHlwZW9mIGVuZCAhPT0gJ251bWJlcicpIHtcbiAgICAgIC8vIG5vIGVuZCBzcGVjaWZpZWQsIG9yIHBhc3QgZW5kIG9mIGJ1ZmZlciwgdXNlIGxlbmd0aCBvZiBidWZmZXJcbiAgICAgIGVuZCA9IGxlbmd0aDtcbiAgICB9IC8vIGVsc2Uga2VlcCBlbmQgYXMgcGFzc2VkIGluXG5cblxuICAgIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICAgIHJldHVybiAnJzsgLy8gaWYgZW5kIGlzIGJlZm9yZSBzdGFydCByZXR1cm4gZW1wdHkgc3RyaW5nXG4gICAgfSAvLyBJZiBzdGFydCAhPT0gMCBhbmQgZW5kICE9PSBsZW5ndGgsIG1heWJlIHdlIHNob3VsZCBkbyBhIEJ1ZmZlci5zdWJhcnJheS9zbGljZSBvdmVyIHRoZSByYW5nZSBhbmQgY2FsbCB0b1N0cmluZygpIG9uIHRoYXQ/XG5cblxuICAgIGlmIChzdGFydCAhPT0gMCB8fCBlbmQgIT09IGxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2xpY2Uoc3RhcnQsIGVuZCkudG9TdHJpbmcoZW5jb2RpbmcpO1xuICAgIH0gLy8gYmFzZSBjYXNlLCBzdGFydCBpcyAwLCBlbmQgaXMgbGVuZ3RoXG5cblxuICAgIGlmIChlbmNvZGluZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlbmNvZGluZyA9ICd1dGY4JztcbiAgICB9IGVsc2Uge1xuICAgICAgZW5jb2RpbmcgPSBlbmNvZGluZy50b0xvd2VyQ2FzZSgpOyAvLyBUaHJvdyBpZiBiYWQgZW5jb2RpbmchXG5cbiAgICAgIGlmICghQnVmZmVyJDEuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgVW5rbm93biBlbmNvZGluZzogJHtlbmNvZGluZ31gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZW5jb2RpbmcgPT09ICd1dGY4JyB8fCBlbmNvZGluZyA9PT0gJ3V0Zi04Jykge1xuICAgICAgLy8gaWYgdGhpcyBpcyB0aGUgb3JpZ2luYWwgdW5kZXJseWluZyBidWZmZXIganVzdCByZXR1cm4gaXQncyB0b1N0cmluZygpIHZhbHVlXG4gICAgICBpZiAodGhpcy5ieXRlT2Zmc2V0ID09PSAwICYmIHRoaXMubGVuZ3RoID09PSB0aGlzLl90aUJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RpQnVmZmVyLnRvU3RyaW5nKCk7IC8vIHdlIHJldHVybiB1dGYtOCBieSBkZWZhdWx0IG5hdGl2ZWx5XG4gICAgICB9IC8vIGlmIHdlJ3JlIG9mZnNldCBvciBjcm9wcGluZyBpbiBuYXkgd2F5LCBjbG9uZSB0aGUgcmFuZ2UgYW5kIHJldHVybiB0aGF0IGJ1ZmZlcidzIHRvU3RyaW5nKClcblxuXG4gICAgICByZXR1cm4gdGhpcy5fdGlCdWZmZXIuY2xvbmUodGhpcy5ieXRlT2Zmc2V0LCB0aGlzLmxlbmd0aCkudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBpZiAoZW5jb2RpbmcgPT09ICdiYXNlNjQnKSB7XG4gICAgICBsZXQgYmxvYjsgLy8gaWYgdGhpcyBpcyB0aGUgb3JpZ2luYWwgdW5kZXJseWluZyBidWZmZXIganVzdCByZXR1cm4gaXQncyB0b1N0cmluZygpIHZhbHVlXG5cbiAgICAgIGlmICh0aGlzLmJ5dGVPZmZzZXQgPT09IDAgJiYgdGhpcy5sZW5ndGggPT09IHRoaXMuX3RpQnVmZmVyLmxlbmd0aCkge1xuICAgICAgICBibG9iID0gVGkuVXRpbHMuYmFzZTY0ZW5jb2RlKHRoaXMuX3RpQnVmZmVyLnRvQmxvYigpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGlmIHdlJ3JlIG9mZnNldCBvciBjcm9wcGluZyBpbiBhbnkgd2F5LCBjbG9uZSB0aGUgcmFuZ2UgYW5kIHJldHVybiB0aGF0IGJ1ZmZlcidzIHRvU3RyaW5nKClcbiAgICAgICAgYmxvYiA9IFRpLlV0aWxzLmJhc2U2NGVuY29kZSh0aGlzLl90aUJ1ZmZlci5jbG9uZSh0aGlzLmJ5dGVPZmZzZXQsIHRoaXMubGVuZ3RoKS50b0Jsb2IoKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBibG9iLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgaWYgKGVuY29kaW5nID09PSAnaGV4Jykge1xuICAgICAgbGV0IGhleFN0ciA9ICcnO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIGVhY2ggb25lIGlzIGEgXCJieXRlXCJcbiAgICAgICAgbGV0IGhleCA9IChnZXRBZGp1c3RlZEluZGV4KHRoaXMsIGkpICYgMHhmZikudG9TdHJpbmcoMTYpO1xuICAgICAgICBoZXggPSBoZXgubGVuZ3RoID09PSAxID8gJzAnICsgaGV4IDogaGV4O1xuICAgICAgICBoZXhTdHIgKz0gaGV4O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaGV4U3RyO1xuICAgIH1cblxuICAgIGlmIChlbmNvZGluZyA9PT0gJ2xhdGluMScgfHwgZW5jb2RpbmcgPT09ICdiaW5hcnknKSB7XG4gICAgICBsZXQgbGF0aW4xU3RyaW5nID0gJyc7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gZWFjaCBvbmUgaXMgYSBcImJ5dGVcIlxuICAgICAgICBsYXRpbjFTdHJpbmcgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShnZXRBZGp1c3RlZEluZGV4KHRoaXMsIGkpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGxhdGluMVN0cmluZztcbiAgICB9XG5cbiAgICBpZiAoZW5jb2RpbmcgPT09ICdhc2NpaScpIHtcbiAgICAgIGxldCBhc2NpaSA9ICcnO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIHdlIHN0b3JlIGJ5dGVzICg4LWJpdCksIGJ1dCBhc2NpaSBpcyA3LWJpdC4gTm9kZSBcIm1hc2tzXCIgdGhlIGxhc3QgYml0IG9mZiwgc28gbGV0J3MgZG8gdGhlIHNhbWVcbiAgICAgICAgYXNjaWkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShnZXRBZGp1c3RlZEluZGV4KHRoaXMsIGkpICYgMHg3Rik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhc2NpaTtcbiAgICB9IC8vIFVDUzIvVVRGMTZcblxuXG4gICAgcmV0dXJuIGJ1ZmZlclRvVVRGMTZTdHJpbmcodGhpcy5fdGlCdWZmZXIsIHRoaXMuYnl0ZU9mZnNldCwgdGhpcy5sZW5ndGgpO1xuICB9XG4gIC8qKlxuICAgKiBQcm92aWRlcyBhIGNvbnZlcnNpb24gbWV0aG9kIGZvciBpbnRlcmFjdGluZyB3aXRoIFRpIEFQSXMgdGFodCByZXF1aXJlIGEgVGkuQnVmZmVyXG4gICAqIEByZXR1cm5zIHtUaS5CdWZmZXJ9IHRoZSB1bmRlcmx5aW5nIFRpLkJ1ZmZlciBiYWNraW5nIHRoaXMgQnVmZmVyIGluc3RhbmNlXG4gICAqL1xuXG5cbiAgdG9UaUJ1ZmZlcigpIHtcbiAgICByZXR1cm4gdGhpcy5fdGlCdWZmZXI7XG4gIH1cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW5kIHJldHVybnMgYW4gaXRlcmF0b3IgZm9yIGJ1ZiB2YWx1ZXMgKGJ5dGVzKVxuICAgKiBAcmV0dXJucyB7SXRlcmF0b3J9XG4gICAqL1xuXG5cbiAgdmFsdWVzKCkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXM7XG4gICAgbGV0IG5leHRJbmRleCA9IDA7XG4gICAgY29uc3QgZW5kID0gdGhpcy5sZW5ndGg7XG4gICAgY29uc3QgbXlJdGVyYXRvciA9IHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG5leHRJbmRleCA8IGVuZCkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHZhbHVlOiBnZXRBZGp1c3RlZEluZGV4KGJ1ZmZlciwgbmV4dEluZGV4KSxcbiAgICAgICAgICAgIGRvbmU6IGZhbHNlXG4gICAgICAgICAgfTtcbiAgICAgICAgICBuZXh0SW5kZXgrKztcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB2YWx1ZTogdW5kZWZpbmVkLFxuICAgICAgICAgIGRvbmU6IHRydWVcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBbU3ltYm9sLml0ZXJhdG9yXTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBteUl0ZXJhdG9yO1xuICB9XG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBidWZmZXIgaXMgdXNlZCBpbiBhIGZvci4ub2YgbG9vcC4gRGVsZWdhdGVzIHRvICN2YWx1ZXMoKVxuICAgKiBAcmV0dXJucyB7SXRlcmF0b3J9XG4gICAqL1xuXG5cbiAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWVzKCk7XG4gIH1cbiAgLyoqXG4gICAqIFdyaXRlcyBzdHJpbmcgdG8gYnVmIGF0IG9mZnNldCBhY2NvcmRpbmcgdG8gdGhlIGNoYXJhY3RlciBlbmNvZGluZyBpbiBlbmNvZGluZy5cbiAgICogVGhlIGxlbmd0aCBwYXJhbWV0ZXIgaXMgdGhlIG51bWJlciBvZiBieXRlcyB0byB3cml0ZS4gSWYgYnVmIGRpZCBub3QgY29udGFpbiBlbm91Z2ggc3BhY2UgdG9cbiAgICogZml0IHRoZSBlbnRpcmUgc3RyaW5nLCBvbmx5IHBhcnQgb2Ygc3RyaW5nIHdpbGwgYmUgd3JpdHRlbi4gSG93ZXZlciwgcGFydGlhbGx5IGVuY29kZWRcbiAgICogY2hhcmFjdGVycyB3aWxsIG5vdCBiZSB3cml0dGVuLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIFN0cmluZyB0byB3cml0ZSB0byBgYnVmYC5cbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbb2Zmc2V0PTBdIE51bWJlciBvZiBieXRlcyB0byBza2lwIGJlZm9yZSBzdGFydGluZyB0byB3cml0ZSBzdHJpbmdcbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbbGVuZ3RoPWJ1Zi5sZW5ndGggLSBvZmZzZXRdIE51bWJlciBvZiBieXRlcyB0byB3cml0ZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2VuY29kaW5nPSd1dGY4J10gVGhlIGNoYXJhY3RlciBlbmNvZGluZyBvZiBzdHJpbmdcbiAgICogQHJldHVybnMge2ludGVnZXJ9XG4gICAqL1xuXG5cbiAgd3JpdGUoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgICBpZiAodHlwZW9mIG9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gb2Zmc2V0O1xuICAgICAgb2Zmc2V0ID0gMDtcbiAgICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGxlbmd0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoO1xuICAgICAgbGVuZ3RoID0gdGhpcy5sZW5ndGggLSBvZmZzZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHdlIGNhcCBgbGVuZ3RoYCBhdCB0aGUgbGVuZ3RoIG9mIG91ciBidWZmZXJcbiAgICAgIGNvbnN0IHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0O1xuXG4gICAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICAgIGxlbmd0aCA9IHJlbWFpbmluZztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBlbmNvZGluZyA9IGVuY29kaW5nIHx8ICd1dGY4JzsgLy8gc28gd2UgbmVlZCB0byBjb252ZXJ0IGByZW1haW5pbmdgIGJ5dGVzIG9mIG91ciBzdHJpbmcgaW50byBhIGJ5dGUgYXJyYXkvYnVmZmVyXG5cbiAgICBjb25zdCBzcmMgPSBCdWZmZXIkMS5mcm9tKHN0cmluZywgZW5jb2RpbmcpOyAvLyBGSVhNRTogQ2FuIHdlIGxldCBpdCBrbm93IHRvIG9ubHkgY29udmVydCBgcmVtYWluaW5nYCBieXRlcz9cbiAgICAvLyB0aGVuIHN0aWNrIHRoYXQgaW50byBvdXIgYnVmZmVyIHN0YXJ0aW5nIGF0IGBvZmZzZXRgIVxuXG4gICAgcmV0dXJuIGNvcHlCdWZmZXIoc3JjLl90aUJ1ZmZlciwgdGhpcy5fdGlCdWZmZXIsIG9mZnNldCwgbGVuZ3RoKTtcbiAgfVxuXG4gIHdyaXRlRG91YmxlQkUodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgICBjaGVja09mZnNldCh0aGlzLCBvZmZzZXQsIDgpO1xuICAgIGRvdWJsZUFycmF5WzBdID0gdmFsdWU7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQrKywgdWludDhEb3VibGVBcnJheVs3XSk7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQrKywgdWludDhEb3VibGVBcnJheVs2XSk7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQrKywgdWludDhEb3VibGVBcnJheVs1XSk7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQrKywgdWludDhEb3VibGVBcnJheVs0XSk7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQrKywgdWludDhEb3VibGVBcnJheVszXSk7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQrKywgdWludDhEb3VibGVBcnJheVsyXSk7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQrKywgdWludDhEb3VibGVBcnJheVsxXSk7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQrKywgdWludDhEb3VibGVBcnJheVswXSk7XG4gICAgcmV0dXJuIG9mZnNldDsgLy8gYXQgdGhpcyBwb2ludCwgd2Ugc2hvdWxkIGhhdmUgYWxyZWFkeSBhZGRlZCA4IHRvIG9mZnNldFxuICB9XG5cbiAgd3JpdGVEb3VibGVMRSh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICAgIGNoZWNrT2Zmc2V0KHRoaXMsIG9mZnNldCwgOCk7XG4gICAgZG91YmxlQXJyYXlbMF0gPSB2YWx1ZTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCsrLCB1aW50OERvdWJsZUFycmF5WzBdKTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCsrLCB1aW50OERvdWJsZUFycmF5WzFdKTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCsrLCB1aW50OERvdWJsZUFycmF5WzJdKTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCsrLCB1aW50OERvdWJsZUFycmF5WzNdKTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCsrLCB1aW50OERvdWJsZUFycmF5WzRdKTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCsrLCB1aW50OERvdWJsZUFycmF5WzVdKTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCsrLCB1aW50OERvdWJsZUFycmF5WzZdKTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCsrLCB1aW50OERvdWJsZUFycmF5WzddKTtcbiAgICByZXR1cm4gb2Zmc2V0OyAvLyBhdCB0aGlzIHBvaW50LCB3ZSBzaG91bGQgaGF2ZSBhbHJlYWR5IGFkZGVkIDggdG8gb2Zmc2V0XG4gIH1cblxuICB3cml0ZUZsb2F0QkUodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgICBjaGVja09mZnNldCh0aGlzLCBvZmZzZXQsIDQpO1xuICAgIGZsb2F0QXJyYXlbMF0gPSB2YWx1ZTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCsrLCB1aW50OEZsb2F0QXJyYXlbM10pO1xuICAgIHNldEFkanVzdGVkSW5kZXgodGhpcywgb2Zmc2V0KyssIHVpbnQ4RmxvYXRBcnJheVsyXSk7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQrKywgdWludDhGbG9hdEFycmF5WzFdKTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCsrLCB1aW50OEZsb2F0QXJyYXlbMF0pO1xuICAgIHJldHVybiBvZmZzZXQ7IC8vIGF0IHRoaXMgcG9pbnQsIHdlIHNob3VsZCBoYXZlIGFscmVhZHkgYWRkZWQgNCB0byBvZmZzZXRcbiAgfVxuXG4gIHdyaXRlRmxvYXRMRSh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICAgIGNoZWNrT2Zmc2V0KHRoaXMsIG9mZnNldCwgNCk7XG4gICAgZmxvYXRBcnJheVswXSA9IHZhbHVlO1xuICAgIHNldEFkanVzdGVkSW5kZXgodGhpcywgb2Zmc2V0KyssIHVpbnQ4RmxvYXRBcnJheVswXSk7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQrKywgdWludDhGbG9hdEFycmF5WzFdKTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCsrLCB1aW50OEZsb2F0QXJyYXlbMl0pO1xuICAgIHNldEFkanVzdGVkSW5kZXgodGhpcywgb2Zmc2V0KyssIHVpbnQ4RmxvYXRBcnJheVszXSk7XG4gICAgcmV0dXJuIG9mZnNldDsgLy8gYXQgdGhpcyBwb2ludCwgd2Ugc2hvdWxkIGhhdmUgYWxyZWFkeSBhZGRlZCA0IHRvIG9mZnNldFxuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IHZhbHVlIE51bWJlciB0byBiZSB3cml0dGVuIHRvIGJ1Zi5cbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbb2Zmc2V0PTBdIE51bWJlciBvZiBieXRlcyB0byBza2lwIGJlZm9yZSBzdGFydGluZyB0byB3cml0ZS4gTXVzdCBzYXRpc2Z5IDAgPD0gb2Zmc2V0IDw9IGJ1Zi5sZW5ndGggLSAxLlxuICAgKiBAcmV0dXJucyB7aW50ZWdlcn1cbiAgICovXG5cblxuICB3cml0ZUludDgodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgICBjaGVja09mZnNldCh0aGlzLCBvZmZzZXQsIDEpO1xuICAgIGNoZWNrVmFsdWUodmFsdWUsIC0xMjgsIDEyNyk7XG5cbiAgICBpZiAodmFsdWUgPj0gMCkge1xuICAgICAgLy8ganVzdCB3cml0ZSBpdCBub3JtYWxseVxuICAgICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQsIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29udmVydCBmcm9tIHNpZ25lZCB0byAyJ3MgY29tcGxlbWVudCBiaXRzXG4gICAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCwgMHhGRiArIHZhbHVlICsgMSk7IC8vIG1heCB2YWx1ZSwgcGx1cyB0aGUgbmVnYXRpdmUgbnVtYmVyLCBhZGQgb25lXG4gICAgfVxuXG4gICAgcmV0dXJuIG9mZnNldCArIDE7XG4gIH1cbiAgLyoqXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gdmFsdWUgTnVtYmVyIHRvIGJlIHdyaXR0ZW4gdG8gYnVmLlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IFtvZmZzZXQ9MF0gTnVtYmVyIG9mIGJ5dGVzIHRvIHNraXAgYmVmb3JlIHN0YXJ0aW5nIHRvIHdyaXRlLiBNdXN0IHNhdGlzZnkgMCA8PSBvZmZzZXQgPD0gYnVmLmxlbmd0aCAtIDIuXG4gICAqIEByZXR1cm5zIHtpbnRlZ2VyfVxuICAgKi9cblxuXG4gIHdyaXRlSW50MTZCRSh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICAgIGNoZWNrT2Zmc2V0KHRoaXMsIG9mZnNldCwgMik7XG4gICAgY2hlY2tWYWx1ZSh2YWx1ZSwgLTMyNzY4LCAzMjc2Nyk7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQsIHZhbHVlID4+PiA4KTsgLy8ganVzdCBzaGlmdCBvdmVyIGEgYnl0ZVxuXG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQgKyAxLCB2YWx1ZSAmIDB4RkYpOyAvLyBtYXNrIHRvIGZpcnN0IGJ5dGVcblxuICAgIHJldHVybiBvZmZzZXQgKyAyO1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IHZhbHVlIE51bWJlciB0byBiZSB3cml0dGVuIHRvIGJ1Zi5cbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbb2Zmc2V0PTBdIE51bWJlciBvZiBieXRlcyB0byBza2lwIGJlZm9yZSBzdGFydGluZyB0byB3cml0ZS4gTXVzdCBzYXRpc2Z5IDAgPD0gb2Zmc2V0IDw9IGJ1Zi5sZW5ndGggLSAyLlxuICAgKiBAcmV0dXJucyB7aW50ZWdlcn1cbiAgICovXG5cblxuICB3cml0ZUludDE2TEUodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgICBjaGVja09mZnNldCh0aGlzLCBvZmZzZXQsIDIpO1xuICAgIGNoZWNrVmFsdWUodmFsdWUsIC0zMjc2OCwgMzI3NjcpO1xuICAgIHNldEFkanVzdGVkSW5kZXgodGhpcywgb2Zmc2V0LCB2YWx1ZSAmIDB4RkYpO1xuICAgIHNldEFkanVzdGVkSW5kZXgodGhpcywgb2Zmc2V0ICsgMSwgdmFsdWUgPj4+IDgpO1xuICAgIHJldHVybiBvZmZzZXQgKyAyO1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IHZhbHVlIE51bWJlciB0byBiZSB3cml0dGVuIHRvIGJ1Zi5cbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbb2Zmc2V0PTBdIE51bWJlciBvZiBieXRlcyB0byBza2lwIGJlZm9yZSBzdGFydGluZyB0byB3cml0ZS4gTXVzdCBzYXRpc2Z5IDAgPD0gb2Zmc2V0IDw9IGJ1Zi5sZW5ndGggLSA0LlxuICAgKiBAcmV0dXJucyB7aW50ZWdlcn1cbiAgICovXG5cblxuICB3cml0ZUludDMyQkUodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgICBjaGVja09mZnNldCh0aGlzLCBvZmZzZXQsIDQpO1xuICAgIGNoZWNrVmFsdWUodmFsdWUsIC0yMTQ3NDgzNjQ4LCAyMTQ3NDgzNjQ3KTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCwgdmFsdWUgPj4+IDI0KTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCArIDEsIHZhbHVlID4+PiAxNik7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQgKyAyLCB2YWx1ZSA+Pj4gOCk7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQgKyAzLCB2YWx1ZSAmIDB4RkYpO1xuICAgIHJldHVybiBvZmZzZXQgKyA0O1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IHZhbHVlIE51bWJlciB0byBiZSB3cml0dGVuIHRvIGJ1Zi5cbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbb2Zmc2V0PTBdIE51bWJlciBvZiBieXRlcyB0byBza2lwIGJlZm9yZSBzdGFydGluZyB0byB3cml0ZS4gTXVzdCBzYXRpc2Z5IDAgPD0gb2Zmc2V0IDw9IGJ1Zi5sZW5ndGggLSA0LlxuICAgKiBAcmV0dXJucyB7aW50ZWdlcn1cbiAgICovXG5cblxuICB3cml0ZUludDMyTEUodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgICBjaGVja09mZnNldCh0aGlzLCBvZmZzZXQsIDQpO1xuICAgIGNoZWNrVmFsdWUodmFsdWUsIC0yMTQ3NDgzNjQ4LCAyMTQ3NDgzNjQ3KTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCwgdmFsdWUgJiAweEZGKTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCArIDEsIHZhbHVlID4+PiA4KTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCArIDIsIHZhbHVlID4+PiAxNik7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQgKyAzLCB2YWx1ZSA+Pj4gMjQpO1xuICAgIHJldHVybiBvZmZzZXQgKyA0O1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IHZhbHVlIE51bWJlciB0byBiZSB3cml0dGVuIHRvIGJ1Zi5cbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBvZmZzZXQgTnVtYmVyIG9mIGJ5dGVzIHRvIHNraXAgYmVmb3JlIHN0YXJ0aW5nIHRvIHdyaXRlLiBNdXN0IHNhdGlzZnkgMCA8PSBvZmZzZXQgPD0gYnVmLmxlbmd0aCAtIGJ5dGVMZW5ndGguXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gYnl0ZUxlbmd0aCBOdW1iZXIgb2YgYnl0ZXMgdG8gd3JpdGUuIE11c3Qgc2F0aXNmeSAwIDwgYnl0ZUxlbmd0aCA8PSA2LlxuICAgKiBAcmV0dXJucyB7aW50ZWdlcn1cbiAgICovXG5cblxuICB3cml0ZUludEJFKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgpIHtcbiAgICBpZiAoYnl0ZUxlbmd0aCA8PSAwIHx8IGJ5dGVMZW5ndGggPiA2KSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJyk7XG4gICAgfVxuXG4gICAgY2hlY2tPZmZzZXQodGhpcywgb2Zmc2V0LCBieXRlTGVuZ3RoKTtcbiAgICBjb25zdCBtaW5NYXhCYXNlID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGggLSAxKTtcbiAgICBjaGVja1ZhbHVlKHZhbHVlLCAtbWluTWF4QmFzZSwgbWluTWF4QmFzZSAtIDEpO1xuXG4gICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgdmFsdWUgPSBtaW5NYXhCYXNlICogMiArIHZhbHVlO1xuICAgIH1cblxuICAgIGxldCBtdWx0aXBsaWVyID0gMTtcblxuICAgIGZvciAobGV0IGkgPSBieXRlTGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGxldCBieXRlVmFsdWUgPSB2YWx1ZSAvIG11bHRpcGxpZXIgJiAweEZGO1xuICAgICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQgKyBpLCBieXRlVmFsdWUpO1xuICAgICAgbXVsdGlwbGllciAqPSAweDEwMDtcbiAgICB9XG5cbiAgICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aDtcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHtpbnRlZ2VyfSB2YWx1ZSBOdW1iZXIgdG8gYmUgd3JpdHRlbiB0byBidWYuXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gb2Zmc2V0IE51bWJlciBvZiBieXRlcyB0byBza2lwIGJlZm9yZSBzdGFydGluZyB0byB3cml0ZS4gTXVzdCBzYXRpc2Z5IDAgPD0gb2Zmc2V0IDw9IGJ1Zi5sZW5ndGggLSBieXRlTGVuZ3RoLlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IGJ5dGVMZW5ndGggTnVtYmVyIG9mIGJ5dGVzIHRvIHdyaXRlLiBNdXN0IHNhdGlzZnkgMCA8IGJ5dGVMZW5ndGggPD0gNi5cbiAgICogQHJldHVybnMge2ludGVnZXJ9XG4gICAqL1xuXG5cbiAgd3JpdGVJbnRMRSh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoKSB7XG4gICAgaWYgKGJ5dGVMZW5ndGggPD0gMCB8fCBieXRlTGVuZ3RoID4gNikge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpO1xuICAgIH1cblxuICAgIGNoZWNrT2Zmc2V0KHRoaXMsIG9mZnNldCwgYnl0ZUxlbmd0aCk7XG4gICAgY29uc3QgbWluTWF4QmFzZSA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoIC0gMSk7XG4gICAgY2hlY2tWYWx1ZSh2YWx1ZSwgLW1pbk1heEJhc2UsIG1pbk1heEJhc2UgLSAxKTtcblxuICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgIHZhbHVlID0gbWluTWF4QmFzZSAqIDIgKyB2YWx1ZTtcbiAgICB9XG5cbiAgICBsZXQgbXVsdGlwbGllciA9IDE7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVMZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGJ5dGVWYWx1ZSA9IHZhbHVlIC8gbXVsdGlwbGllciAmIDB4RkY7XG4gICAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCArIGksIGJ5dGVWYWx1ZSk7XG4gICAgICBtdWx0aXBsaWVyICo9IDBYMTAwO1xuICAgIH1cblxuICAgIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoO1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IHZhbHVlIE51bWJlciB0byBiZSB3cml0dGVuIHRvIGJ1Zi5cbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbb2Zmc2V0PTBdIE51bWJlciBvZiBieXRlcyB0byBza2lwIGJlZm9yZSBzdGFydGluZyB0byB3cml0ZS4gTXVzdCBzYXRpc2Z5IDAgPD0gb2Zmc2V0IDw9IGJ1Zi5sZW5ndGggLSAxLlxuICAgKiBAcmV0dXJucyB7aW50ZWdlcn1cbiAgICovXG5cblxuICB3cml0ZVVJbnQ4KHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gICAgY2hlY2tPZmZzZXQodGhpcywgb2Zmc2V0LCAxKTtcbiAgICBjaGVja1ZhbHVlKHZhbHVlLCAwLCAyNTUpO1xuICAgIHNldEFkanVzdGVkSW5kZXgodGhpcywgb2Zmc2V0LCB2YWx1ZSk7XG4gICAgcmV0dXJuIG9mZnNldCArIDE7XG4gIH1cbiAgLyoqXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gdmFsdWUgTnVtYmVyIHRvIGJlIHdyaXR0ZW4gdG8gYnVmLlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IFtvZmZzZXQ9MF0gTnVtYmVyIG9mIGJ5dGVzIHRvIHNraXAgYmVmb3JlIHN0YXJ0aW5nIHRvIHdyaXRlLiBNdXN0IHNhdGlzZnkgMCA8PSBvZmZzZXQgPD0gYnVmLmxlbmd0aCAtIDIuXG4gICAqIEByZXR1cm5zIHtpbnRlZ2VyfVxuICAgKi9cblxuXG4gIHdyaXRlVUludDE2QkUodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgICBjaGVja09mZnNldCh0aGlzLCBvZmZzZXQsIDIpO1xuICAgIGNoZWNrVmFsdWUodmFsdWUsIDAsIDY1NTM1KTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCwgdmFsdWUgPj4+IDgpO1xuICAgIHNldEFkanVzdGVkSW5kZXgodGhpcywgb2Zmc2V0ICsgMSwgdmFsdWUgJiAweGZmKTtcbiAgICByZXR1cm4gb2Zmc2V0ICsgMjtcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHtpbnRlZ2VyfSB2YWx1ZSBOdW1iZXIgdG8gYmUgd3JpdHRlbiB0byBidWYuXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gW29mZnNldD0wXSBOdW1iZXIgb2YgYnl0ZXMgdG8gc2tpcCBiZWZvcmUgc3RhcnRpbmcgdG8gd3JpdGUuIE11c3Qgc2F0aXNmeSAwIDw9IG9mZnNldCA8PSBidWYubGVuZ3RoIC0gMi5cbiAgICogQHJldHVybnMge2ludGVnZXJ9XG4gICAqL1xuXG5cbiAgd3JpdGVVSW50MTZMRSh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICAgIGNoZWNrT2Zmc2V0KHRoaXMsIG9mZnNldCwgMik7XG4gICAgY2hlY2tWYWx1ZSh2YWx1ZSwgMCwgNjU1MzUpO1xuICAgIHNldEFkanVzdGVkSW5kZXgodGhpcywgb2Zmc2V0LCB2YWx1ZSAmIDB4ZmYpO1xuICAgIHNldEFkanVzdGVkSW5kZXgodGhpcywgb2Zmc2V0ICsgMSwgdmFsdWUgPj4+IDgpO1xuICAgIHJldHVybiBvZmZzZXQgKyAyO1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IHZhbHVlIE51bWJlciB0byBiZSB3cml0dGVuIHRvIGJ1Zi5cbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbb2Zmc2V0PTBdIE51bWJlciBvZiBieXRlcyB0byBza2lwIGJlZm9yZSBzdGFydGluZyB0byB3cml0ZS4gTXVzdCBzYXRpc2Z5IDAgPD0gb2Zmc2V0IDw9IGJ1Zi5sZW5ndGggLSA0LlxuICAgKiBAcmV0dXJucyB7aW50ZWdlcn1cbiAgICovXG5cblxuICB3cml0ZVVJbnQzMkJFKHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gICAgY2hlY2tPZmZzZXQodGhpcywgb2Zmc2V0LCA0KTtcbiAgICBjaGVja1ZhbHVlKHZhbHVlLCAwLCA0Mjk0OTY3Mjk1KTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCwgdmFsdWUgPj4+IDI0KTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCArIDEsIHZhbHVlID4+PiAxNik7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQgKyAyLCB2YWx1ZSA+Pj4gOCk7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQgKyAzLCB2YWx1ZSAmIDB4ZmYpO1xuICAgIHJldHVybiBvZmZzZXQgKyA0O1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IHZhbHVlIE51bWJlciB0byBiZSB3cml0dGVuIHRvIGJ1Zi5cbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBbb2Zmc2V0PTBdIE51bWJlciBvZiBieXRlcyB0byBza2lwIGJlZm9yZSBzdGFydGluZyB0byB3cml0ZS4gTXVzdCBzYXRpc2Z5IDAgPD0gb2Zmc2V0IDw9IGJ1Zi5sZW5ndGggLSA0LlxuICAgKiBAcmV0dXJucyB7aW50ZWdlcn1cbiAgICovXG5cblxuICB3cml0ZVVJbnQzMkxFKHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gICAgY2hlY2tPZmZzZXQodGhpcywgb2Zmc2V0LCA0KTtcbiAgICBjaGVja1ZhbHVlKHZhbHVlLCAwLCA0Mjk0OTY3Mjk1KTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCwgdmFsdWUgJiAweGZmKTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCArIDEsIHZhbHVlID4+PiA4KTtcbiAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCArIDIsIHZhbHVlID4+PiAxNik7XG4gICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQgKyAzLCB2YWx1ZSA+Pj4gMjQpO1xuICAgIHJldHVybiBvZmZzZXQgKyA0O1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IHZhbHVlIE51bWJlciB0byBiZSB3cml0dGVuIHRvIGJ1Zi5cbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBvZmZzZXQgTnVtYmVyIG9mIGJ5dGVzIHRvIHNraXAgYmVmb3JlIHN0YXJ0aW5nIHRvIHdyaXRlLiBNdXN0IHNhdGlzZnkgMCA8PSBvZmZzZXQgPD0gYnVmLmxlbmd0aCAtIGJ5dGVMZW5ndGguXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gYnl0ZUxlbmd0aCBOdW1iZXIgb2YgYnl0ZXMgdG8gd3JpdGUuIE11c3Qgc2F0aXNmeSAwIDwgYnl0ZUxlbmd0aCA8PSA2LlxuICAgKiBAcmV0dXJucyB7aW50ZWdlcn1cbiAgICovXG5cblxuICB3cml0ZVVJbnRCRSh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoKSB7XG4gICAgaWYgKGJ5dGVMZW5ndGggPD0gMCB8fCBieXRlTGVuZ3RoID4gNikge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpO1xuICAgIH1cblxuICAgIGNoZWNrT2Zmc2V0KHRoaXMsIG9mZnNldCwgYnl0ZUxlbmd0aCk7XG4gICAgY2hlY2tWYWx1ZSh2YWx1ZSwgMCwgTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMSk7XG4gICAgbGV0IG11bHRpcGxpZXIgPSAxO1xuXG4gICAgZm9yIChsZXQgaSA9IGJ5dGVMZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgbGV0IGJ5dGVWYWx1ZSA9IHZhbHVlIC8gbXVsdGlwbGllciAmIDB4RkY7XG4gICAgICBzZXRBZGp1c3RlZEluZGV4KHRoaXMsIG9mZnNldCArIGksIGJ5dGVWYWx1ZSk7XG4gICAgICBtdWx0aXBsaWVyICo9IDBYMTAwO1xuICAgIH1cblxuICAgIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoO1xuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IHZhbHVlIE51bWJlciB0byBiZSB3cml0dGVuIHRvIGJ1Zi5cbiAgICogQHBhcmFtIHtpbnRlZ2VyfSBvZmZzZXQgTnVtYmVyIG9mIGJ5dGVzIHRvIHNraXAgYmVmb3JlIHN0YXJ0aW5nIHRvIHdyaXRlLiBNdXN0IHNhdGlzZnkgMCA8PSBvZmZzZXQgPD0gYnVmLmxlbmd0aCAtIGJ5dGVMZW5ndGguXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gYnl0ZUxlbmd0aCBOdW1iZXIgb2YgYnl0ZXMgdG8gd3JpdGUuIE11c3Qgc2F0aXNmeSAwIDwgYnl0ZUxlbmd0aCA8PSA2LlxuICAgKiBAcmV0dXJucyB7aW50ZWdlcn1cbiAgICovXG5cblxuICB3cml0ZVVJbnRMRSh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoKSB7XG4gICAgaWYgKGJ5dGVMZW5ndGggPD0gMCB8fCBieXRlTGVuZ3RoID4gNikge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpO1xuICAgIH1cblxuICAgIGNoZWNrT2Zmc2V0KHRoaXMsIG9mZnNldCwgYnl0ZUxlbmd0aCk7XG4gICAgY2hlY2tWYWx1ZSh2YWx1ZSwgMCwgTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMSk7XG4gICAgbGV0IG11bHRpcGxpZXIgPSAxO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlTGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBieXRlVmFsdWUgPSB2YWx1ZSAvIG11bHRpcGxpZXIgJiAweEZGO1xuICAgICAgc2V0QWRqdXN0ZWRJbmRleCh0aGlzLCBvZmZzZXQgKyBpLCBieXRlVmFsdWUpO1xuICAgICAgbXVsdGlwbGllciAqPSAwWDEwMDtcbiAgICB9XG5cbiAgICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aDtcbiAgfSAvLyBUT0RPOiBJbXBsZW1lbnQgcmVtYWluaW5nIGluc3RhbmNlIG1ldGhvZHM6XG4gIC8vIGJ1Zi5sYXN0SW5kZXhPZih2YWx1ZVssIGJ5dGVPZmZzZXRdWywgZW5jb2RpbmddKVxuICAvLyBidWYucmVhZEJpZ0ludDY0QkUoW29mZnNldF0pXG4gIC8vIGJ1Zi5yZWFkQmlnSW50NjRMRShbb2Zmc2V0XSlcbiAgLy8gYnVmLnJlYWRCaWdVSW50NjRCRShbb2Zmc2V0XSlcbiAgLy8gYnVmLnJlYWRCaWdVSW50NjRMRShbb2Zmc2V0XSlcbiAgLy8gYnVmLndyaXRlQmlnSW50NjRCRSh2YWx1ZVssIG9mZnNldF0pXG4gIC8vIGJ1Zi53cml0ZUJpZ0ludDY0TEUodmFsdWVbLCBvZmZzZXRdKVxuICAvLyBidWYud3JpdGVCaWdVSW50NjRCRSh2YWx1ZVssIG9mZnNldF0pXG4gIC8vIGJ1Zi53cml0ZUJpZ1VJbnQ2NExFKHZhbHVlWywgb2Zmc2V0XSlcblxuXG4gIHN0YXRpYyBhbGxvY1Vuc2FmZShsZW5ndGgpIHtcbiAgICByZXR1cm4gbmV3QnVmZmVyKFRpLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICBsZW5ndGhcbiAgICB9KSk7XG4gIH1cblxuICBzdGF0aWMgYWxsb2NVbnNhZmVTbG93KGxlbmd0aCkge1xuICAgIHJldHVybiBCdWZmZXIkMS5hbGxvY1Vuc2FmZShsZW5ndGgpO1xuICB9XG5cbiAgc3RhdGljIGFsbG9jKGxlbmd0aCwgZmlsbCA9IDAsIGVuY29kaW5nID0gJ3V0ZjgnKSB7XG4gICAgY29uc3QgYnVmID0gQnVmZmVyJDEuYWxsb2NVbnNhZmUobGVuZ3RoKTtcbiAgICBidWYuZmlsbChmaWxsLCBlbmNvZGluZyk7XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd8QnVmZmVyfFR5cGVkQXJyYXl8RGF0YVZpZXd8QXJyYXlCdWZmZXJ8U2hhcmVkQXJyYXlCdWZmZXJ9IHN0cmluZyBvcmlnaW5hbCBzdHJpbmdcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtlbmNvZGluZz0ndXRmOCddIGVuY29kaW5nIHdob3NlIGJ5dGUgbGVuZ3RoIHdlIG5lZWQgdG8gZ3JhYlxuICAgKiBAcmV0dXJucyB7aW50ZWdlcn1cbiAgICovXG5cblxuICBzdGF0aWMgYnl0ZUxlbmd0aChzdHJpbmcsIGVuY29kaW5nID0gJ3V0ZjgnKSB7XG4gICAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoQnVmZmVyJDEuaXNCdWZmZXIoc3RyaW5nKSkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLmxlbmd0aDsgLy8gcmV0dXJuIEJ1ZmZlcidzIGxlbmd0aFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RyaW5nLmJ5dGVMZW5ndGg7IC8vIFR5cGVkQXJyYXksIEFycmF5QnVmZmVyLCBTaGFyZWRBcnJheUJ1ZmZlciwgRGF0YVZpZXdcbiAgICB9XG5cbiAgICBsZXQgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aDtcblxuICAgIHN3aXRjaCAoZW5jb2RpbmcudG9Mb3dlckNhc2UoKSkge1xuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4Qnl0ZUxlbmd0aChzdHJpbmcpO1xuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGxlbmd0aDtcblxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0ZjE2LWxlJzpcbiAgICAgICAgcmV0dXJuIDIgKiBsZW5ndGg7XG5cbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBsZW5ndGggLyAyO1xuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICAvLyBTdWJ0cmFjdCB1cCB0byB0d28gcGFkZGluZyBjaGFycyBmcm9tIGVuZCBvZiBzdHJpbmchXG4gICAgICAgIGlmIChsZW5ndGggPiAxICYmIHN0cmluZy5jaGFyQXQobGVuZ3RoIC0gMSkgPT09ICc9Jykge1xuICAgICAgICAgIGxlbmd0aC0tO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxlbmd0aCA+IDEgJiYgc3RyaW5nLmNoYXJBdChsZW5ndGggLSAxKSA9PT0gJz0nKSB7XG4gICAgICAgICAgbGVuZ3RoLS07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihsZW5ndGggKiAzIC8gNCk7XG4gICAgICAvLyBkcm9wIGZyYWN0aW9uYWwgdmFsdWVcbiAgICB9XG5cbiAgICByZXR1cm4gdXRmOEJ5dGVMZW5ndGgoc3RyaW5nKTtcbiAgfVxuXG4gIHN0YXRpYyBjb21wYXJlKGJ1ZjEsIGJ1ZjIpIHtcbiAgICBpZiAoIUJ1ZmZlciQxLmlzQnVmZmVyKGJ1ZjEpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBUaGUgXCJidWYxXCIgYXJndW1lbnQgbXVzdCBiZSBvbmUgb2YgdHlwZSBCdWZmZXIgb3IgVWludDhBcnJheS4gUmVjZWl2ZWQgdHlwZSAke3R5cGVvZiBidWYxfWApO1xuICAgIH0gLy8gVE9ETzogV3JhcCBVSW50OEFycmF5IGFyZ3MgaW4gYnVmZmVycz9cblxuXG4gICAgcmV0dXJuIGJ1ZjEuY29tcGFyZShidWYyKTtcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHtCdWZmZXJbXXxVSW50OEFycmF5W119IGxpc3QgbGlzdCBvZiBCdWZmZXJzIHRvIGNvbmNhdGVuYXRlXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gW3RvdGFsTGVuZ3RoXSBUb3RhbCBsZW5ndGggb2YgdGhlIEJ1ZmZlciBpbnN0YW5jZXMgaW4gbGlzdCB3aGVuIGNvbmNhdGVuYXRlZC5cbiAgICogQHJldHVybnMge0J1ZmZlcn1cbiAgICovXG5cblxuICBzdGF0aWMgY29uY2F0KGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3QpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdsaXN0IGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXknKTtcbiAgICB9XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBCdWZmZXIkMS5hbGxvYygwKTsgLy8gb25lIGVtcHR5IEJ1ZmZlciFcbiAgICB9IC8vIGFsbG9jYXRlIG9uZSBCdWZmZXIgb2YgYHRvdGFsTGVuZ3RoYD8gQ2FwIGF0IHRvdGFsTGVuZ3RoP1xuXG5cbiAgICBpZiAodG90YWxMZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgICAgdG90YWxMZW5ndGggPSAwOyAvLyBnZW5lcmF0ZSB0aGUgdG90YWwgbGVuZ3RoIGZyb20gZWFjaCBidWZmZXIncyBsZW5ndGg/XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQgPSBCdWZmZXIkMS5hbGxvY1Vuc2FmZSh0b3RhbExlbmd0aCk7XG4gICAgbGV0IHBvc2l0aW9uID0gMDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgYnVmID0gbGlzdFtpXTtcbiAgICAgIGJ1Zi5jb3B5KHJlc3VsdCwgcG9zaXRpb24pO1xuICAgICAgcG9zaXRpb24gKz0gYnVmLmxlbmd0aDtcblxuICAgICAgaWYgKHBvc2l0aW9uID49IHRvdGFsTGVuZ3RoKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgLyoqXG4gICAqIEBwYXJhbSB7aW50ZWdlcltdfEJ1ZmZlcnxzdHJpbmd9IHZhbHVlIHZhbHVlIHdlJ3JlIHdyYXBwaW5nXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbZW5jb2Rpbmc9J3V0ZjgnXSBUaGUgZW5jb2Rpbmcgb2Ygc3RyaW5nLlxuICAgKiBAcmV0dXJucyB7QnVmZmVyfVxuICAgKi9cblxuXG4gIHN0YXRpYyBmcm9tKHZhbHVlLCBlbmNvZGluZyA9ICd1dGY4Jykge1xuICAgIGNvbnN0IHZhbHVlVHlwZSA9IHR5cGVvZiB2YWx1ZTtcblxuICAgIGlmICh2YWx1ZVR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoIUJ1ZmZlciQxLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFVua25vd24gZW5jb2Rpbmc6ICR7ZW5jb2Rpbmd9YCk7XG4gICAgICB9XG5cbiAgICAgIGVuY29kaW5nID0gZW5jb2RpbmcudG9Mb3dlckNhc2UoKTtcblxuICAgICAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0Jykge1xuICAgICAgICBjb25zdCBibG9iID0gVGkuVXRpbHMuYmFzZTY0ZGVjb2RlKHZhbHVlKTtcbiAgICAgICAgY29uc3QgYmxvYlN0cmVhbSA9IFRpLlN0cmVhbS5jcmVhdGVTdHJlYW0oe1xuICAgICAgICAgIHNvdXJjZTogYmxvYixcbiAgICAgICAgICBtb2RlOiBUaS5TdHJlYW0uTU9ERV9SRUFEXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBidWZmZXIgPSBUaS5TdHJlYW0ucmVhZEFsbChibG9iU3RyZWFtKTtcbiAgICAgICAgYmxvYlN0cmVhbS5jbG9zZSgpO1xuICAgICAgICByZXR1cm4gbmV3QnVmZmVyKGJ1ZmZlcik7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbmNvZGluZyA9PT0gJ2hleCcpIHtcbiAgICAgICAgcmV0dXJuIEJ1ZmZlciQxLmZyb20oc3RyaW5nVG9IZXhCeXRlcyh2YWx1ZSkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3QnVmZmVyKFRpLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgdHlwZTogZ2V0VGlDb2RlY0NoYXJzZXQoZW5jb2RpbmcpXG4gICAgICB9KSk7XG4gICAgfSBlbHNlIGlmICh2YWx1ZVR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoQnVmZmVyJDEuaXNCdWZmZXIodmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gQnVmZmVyJDEuYWxsb2NVbnNhZmUobGVuZ3RoKTtcblxuICAgICAgICBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHVlLmNvcHkoYnVmZmVyLCAwLCAwLCBsZW5ndGgpO1xuICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgICAgfVxuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwgdmFsdWUgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcblxuICAgICAgICBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIEJ1ZmZlciQxLmFsbG9jVW5zYWZlKDApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGlCdWZmZXIgPSBUaS5jcmVhdGVCdWZmZXIoe1xuICAgICAgICAgIGxlbmd0aFxuICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdGlCdWZmZXJbaV0gPSB2YWx1ZVtpXSAmIDB4RkY7IC8vIG1hc2sgdG8gb25lIGJ5dGVcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXdCdWZmZXIodGlCdWZmZXIpO1xuICAgICAgfVxuXG4gICAgICBpZiAodmFsdWUuYXBpTmFtZSAmJiB2YWx1ZS5hcGlOYW1lID09PSAnVGkuQnVmZmVyJykge1xuICAgICAgICByZXR1cm4gbmV3QnVmZmVyKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgXFwndmFsdWVcXCcgYXJndW1lbnQgbXVzdCBiZSBvbmUgb2YgdHlwZTogXFwnc3RyaW5nXFwnLCBcXCdBcnJheVxcJywgXFwnQnVmZmVyXFwnLCBcXCdUaS5CdWZmZXJcXCcnKTtcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGVuY29kaW5nIHBvc3NpYmxlIGVuY29kaW5nIG5hbWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuXG5cbiAgc3RhdGljIGlzRW5jb2RpbmcoZW5jb2RpbmcpIHtcbiAgICBpZiAodHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBWQUxJRF9FTkNPRElOR1MuaW5jbHVkZXMoZW5jb2RpbmcudG9Mb3dlckNhc2UoKSk7XG4gIH1cbiAgLyoqXG4gICAqIEBwYXJhbSB7Kn0gb2JqIHBvc3NpYmxlIEJ1ZmZlciBpbnN0YW5jZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG5cblxuICBzdGF0aWMgaXNCdWZmZXIob2JqKSB7XG4gICAgcmV0dXJuIG9iaiAhPT0gbnVsbCAmJiBvYmogIT09IHVuZGVmaW5lZCAmJiBvYmpbaXNCdWZmZXJdID09PSB0cnVlO1xuICB9IC8vIE92ZXJyaWRlIGhvdyBidWZmZXJzIGFyZSBwcmVzZW50ZWQgYnkgdXRpbC5pbnNwZWN0KCkuXG5cblxuICBbY3VzdG9tSW5zcGVjdFN5bWJvbF0ocmVjdXJzZVRpbWVzLCBjdHgpIHtcbiAgICBjb25zdCBtYXggPSBJTlNQRUNUX01BWF9CWVRFUztcbiAgICBjb25zdCBhY3R1YWxNYXggPSBNYXRoLm1pbihtYXgsIHRoaXMubGVuZ3RoKTtcbiAgICBjb25zdCByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG1heDtcbiAgICBsZXQgc3RyID0gdGhpcy5zbGljZSgwLCBhY3R1YWxNYXgpLnRvU3RyaW5nKCdoZXgnKS5yZXBsYWNlKC8oLnsyfSkvZywgJyQxICcpLnRyaW0oKTtcblxuICAgIGlmIChyZW1haW5pbmcgPiAwKSB7XG4gICAgICBzdHIgKz0gYCAuLi4gJHtyZW1haW5pbmd9IG1vcmUgYnl0ZSR7cmVtYWluaW5nID4gMSA/ICdzJyA6ICcnfWA7XG4gICAgfSAvLyBJbnNwZWN0IHNwZWNpYWwgcHJvcGVydGllcyBhcyB3ZWxsLCBpZiBwb3NzaWJsZS5cblxuXG4gICAgaWYgKGN0eCkge1xuICAgICAgbGV0IGV4dHJhcyA9IGZhbHNlO1xuICAgICAgY29uc3QgZmlsdGVyID0gY3R4LnNob3dIaWRkZW4gPyBBTExfUFJPUEVSVElFUyQxIDogT05MWV9FTlVNRVJBQkxFJDE7XG4gICAgICBjb25zdCBvYmogPSBnZXRPd25Ob25JbmRleFByb3BlcnRpZXModGhpcywgZmlsdGVyKS5yZWR1Y2UoKG9iaiwga2V5KSA9PiB7XG4gICAgICAgIGV4dHJhcyA9IHRydWU7XG4gICAgICAgIG9ialtrZXldID0gdGhpc1trZXldO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfSwgT2JqZWN0LmNyZWF0ZShudWxsKSk7XG5cbiAgICAgIGlmIChleHRyYXMpIHtcbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgc3RyICs9ICcsICc7XG4gICAgICAgIH0gLy8gJ1tPYmplY3Q6IG51bGwgcHJvdG90eXBlXSB7Jy5sZW5ndGggPT09IDI2XG4gICAgICAgIC8vIFRoaXMgaXMgZ3VhcmRlZCB3aXRoIGEgdGVzdC5cblxuXG4gICAgICAgIHN0ciArPSBpbnNwZWN0KG9iaiwgeyAuLi5jdHgsXG4gICAgICAgICAgYnJlYWtMZW5ndGg6IEluZmluaXR5LFxuICAgICAgICAgIGNvbXBhY3Q6IHRydWVcbiAgICAgICAgfSkuc2xpY2UoMjcsIC0yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYDwke3RoaXMuY29uc3RydWN0b3IubmFtZX0gJHtzdHJ9PmA7XG4gIH1cblxufVxuXG5CdWZmZXIkMS5wcm90b3R5cGUuaW5zcGVjdCA9IEJ1ZmZlciQxLnByb3RvdHlwZVtjdXN0b21JbnNwZWN0U3ltYm9sXTtcbkJ1ZmZlciQxLnBvb2xTaXplID0gODE5MjtcbnZhciBCdWZmZXJNb2R1bGUgPSB7XG4gIEJ1ZmZlcjogQnVmZmVyJDEsXG4gIC8vIFRPRE86IEltcGxlbWVudCB0cmFuc2NvZGUoKSFcbiAgdHJhbnNjb2RlOiAoX3NvdXJjZSwgX2Zyb21FbmNvZGluZywgX3RvRW5jb2RpbmcpID0+IHt9LFxuICBJTlNQRUNUX01BWF9CWVRFUzogNTAsXG4gIGtNYXhMZW5ndGg6IDIxNDc0ODM2NDcsXG4gIGtTdHJpbmdNYXhMZW5ndGg6IDEwNzM3NDE3OTksXG4gIGNvbnN0YW50czoge1xuICAgIE1BWF9MRU5HVEg6IDIxNDc0ODM2NDcsXG4gICAgTUFYX1NUUklOR19MRU5HVEg6IDEwNzM3NDE3OTlcbiAgfVxufTtcbi8qKlxuICogU2VhcmNoZXMgYSBCdWZmZXIgZm9yIHRoZSBpbmRleCBvZiBhIHNpbmdsZSBieXRlLlxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlciBidWZmZXIgdG8gc2VhcmNoXG4gKiBAcGFyYW0ge2ludGVnZXJ9IHNpbmdsZUJ5dGUgYnl0ZSB3ZSdyZSBsb29raW5nIGZvclxuICogQHBhcmFtIHtpbnRlZ2VyfSBvZmZzZXQgc3RhcnQgb2Zmc2V0IHdlIHNlYXJjaCBhdFxuICogQHJldHVybnMge2ludGVnZXJ9XG4gKi9cblxuZnVuY3Rpb24gaW5kZXhPZihidWZmZXIsIHNpbmdsZUJ5dGUsIG9mZnNldCkge1xuICBjb25zdCBsZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuXG4gIGZvciAobGV0IGkgPSBvZmZzZXQ7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChnZXRBZGp1c3RlZEluZGV4KGJ1ZmZlciwgaSkgPT09IHNpbmdsZUJ5dGUpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMTtcbn1cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBleHBsaWNpdGx5IGF2b2lkcyBiaXR3aXNlIG9wZXJhdGlvbnMgYmVjYXVzZSBKUyBhc3N1bWVzIDMyLWJpdCBzZXF1ZW5jZXMgZm9yIHRob3NlLlxuICogSXQncyBwb3NzaWJsZSB3ZSBtYXkgYmUgYWJsZSB0byB1c2UgdGhlbSB3aGVuIGJ5dGVMZW5ndGggPCA0IGlmIHRoYXQncyBmYXN0ZXIuXG4gKlxuICogQHBhcmFtIHtpbnRlZ2VyfSB1bnNpZ25lZFZhbHVlIHZhbHVlIGJlZm9yZSBjb252ZXJ0aW5nIGJhY2sgdG8gc2lnbmVkXG4gKiBAcGFyYW0ge2ludGVnZXJ9IGJ5dGVMZW5ndGggbnVtYmVyIG9mIGJ5dGVzXG4gKiBAcmV0dXJucyB7aW50ZWdlcn0gdGhlIHNpZ25lZCB2YWx1ZSB0aGF0IGlzIHJlcHJlc2VudGVkIGJ5IHRoZSB1bnNpZ25lZCB2YWx1ZSdzIGJ5dGVzXG4gKi9cblxuXG5mdW5jdGlvbiB1bnNpZ25lZFRvU2lnbmVkKHVuc2lnbmVkVmFsdWUsIGJ5dGVMZW5ndGgpIHtcbiAgY29uc3QgYml0TGVuZ3RoID0gYnl0ZUxlbmd0aCAqIDg7XG4gIGNvbnN0IG1heFBvc2l0aXZlVmFsdWUgPSBNYXRoLnBvdygyLCBiaXRMZW5ndGggLSAxKTtcblxuICBpZiAodW5zaWduZWRWYWx1ZSA8IG1heFBvc2l0aXZlVmFsdWUpIHtcbiAgICByZXR1cm4gdW5zaWduZWRWYWx1ZTtcbiAgfVxuXG4gIGNvbnN0IG1heFVuc2lnbmVkVmFsdWUgPSBNYXRoLnBvdygyLCBiaXRMZW5ndGgpO1xuICB1bnNpZ25lZFZhbHVlIC09IG1heFVuc2lnbmVkVmFsdWU7XG4gIHJldHVybiB1bnNpZ25lZFZhbHVlO1xufVxuLyoqXG4gKiBAcGFyYW0ge1RpLkJ1ZmZlcn0gc3JjIHNvdXJjZSBCdWZmZXIgd2UncmUgY29weWluZyBmcm9tXG4gKiBAcGFyYW0ge1RpLkJ1ZmZlcn0gZGVzdCBkZXN0aW5hdGlvbiBCdWZmZXIgd2UncmUgY29weWluZyBpbnRvXG4gKiBAcGFyYW0ge2ludGVnZXJ9IG9mZnNldCBzdGFydCBvZmZzZXQgd2UncmUgY29weWluZyB0byBpbiBkZXN0aW5hdGlvblxuICogQHBhcmFtIHtpbnRlZ2VyfSBsZW5ndGggbnVtYmVyIG9mIGJ5dGVzIHRvIGNvcHlcbiAqIEByZXR1cm5zIHtpbnRlZ2VyfSBhY3R1YWwgbnVtYmVyIG9mIGJ5dGVzIGNvcGllZFxuICovXG5cblxuZnVuY3Rpb24gY29weUJ1ZmZlcihzcmMsIGRlc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGNvbnN0IHNyY0xlbmd0aCA9IHNyYy5sZW5ndGg7XG4gIGNvbnN0IGRlc3RMZW5ndGggPSBkZXN0Lmxlbmd0aDtcbiAgbGV0IGkgPSAwO1xuXG4gIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBkZXN0SW5kZXggPSBpICsgb2Zmc2V0OyAvLyBhcmUgd2UgdHJ5aW5nIHRvIHdyaXRlIHBhc3QgZW5kIG9mIGRlc3RpbmF0aW9uPyBPciByZWFkIHBhc3QgZW5kIG9mIHNvdXJjZT8gU3RvcCFcblxuICAgIGlmIChkZXN0SW5kZXggPj0gZGVzdExlbmd0aCB8fCBpID49IHNyY0xlbmd0aCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgZGVzdFtkZXN0SW5kZXhdID0gc3JjW2ldO1xuICB9XG5cbiAgcmV0dXJuIGk7XG59XG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgdXRmLTggc3RyaW5nXG4gKiBAcmV0dXJucyB7aW50ZWdlcn1cbiAqL1xuXG5cbmZ1bmN0aW9uIHV0ZjhCeXRlTGVuZ3RoKHN0cmluZykge1xuICAvLyBKdXN0IGNvbnZlcnQgdG8gYSBUaS5CdWZmZXIgYW5kIGxldCBpdCB0ZWxsIHVzIHRoZSBsZW5ndGhcbiAgY29uc3QgYnVmID0gVGkuY3JlYXRlQnVmZmVyKHtcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgIHR5cGU6IFRpLkNvZGVjLkNIQVJTRVRfVVRGOFxuICB9KTtcbiAgY29uc3QgbGVuZ3RoID0gYnVmLmxlbmd0aDtcbiAgYnVmLnJlbGVhc2UoKTsgLy8gcmVsZWFzZSB0aGUgYnVmZmVyIHNpbmNlIHdlIGp1c3QgbmVlZGVkIHRoZSBsZW5ndGhcblxuICByZXR1cm4gbGVuZ3RoO1xufVxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gZW5jb2RpbmcgZGVzaXJlZCBlbmNvZGluZyBuYW1lXG4gKiBAcmV0dXJucyB7aW50ZWdlcn0gVGkuQ29kZWMgY29uc3RhbnQgdGhhdCBtYXBzIHRvIHRoZSBlbmNvZGluZ1xuICovXG5cblxuZnVuY3Rpb24gZ2V0VGlDb2RlY0NoYXJzZXQoZW5jb2RpbmcpIHtcbiAgcmV0dXJuIFRJX0NPREVDX01BUC5nZXQoZW5jb2RpbmcpO1xufVxuXG5mdW5jdGlvbiBidWZmZXJUb1VURjE2U3RyaW5nKHRpQnVmZmVyLCBzdGFydCwgbGVuZ3RoKSB7XG4gIGxldCBvdXQgPSAnJztcbiAgbGV0IGkgPSBzdGFydDtcblxuICB3aGlsZSAoaSA8IGxlbmd0aCkge1xuICAgIC8vIHV0Zi0xNi91Y3MtMiBpcyAyLWJ5dGVzIHBlciBjaGFyYWN0ZXJcbiAgICBjb25zdCBieXRlMSA9IHRpQnVmZmVyW2krK107XG4gICAgY29uc3QgYnl0ZTIgPSB0aUJ1ZmZlcltpKytdO1xuICAgIGNvbnN0IGNvZGVfdW5pdCA9IChieXRlMiA8PCA4KSArIGJ5dGUxOyAvLyB3ZSBtYXNoIHRvZ2V0aGVyIHRoZSB0d28gYnl0ZXNcblxuICAgIG91dCArPSBTdHJpbmcuZnJvbUNvZGVQb2ludChjb2RlX3VuaXQpO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogbG9vcCBvdmVyIGlucHV0LCBldmVyeSAyIGNoYXJhY3RlcnMsIHBhcnNlIGFzIGFuIGludFxuICogYmFzaWNhbGx5IGVhY2ggdHdvIGNoYXJhY3RlcnMgYXJlIGEgXCJieXRlXCIgb3IgYW4gOC1iaXQgdWludFxuICogd2UgYXBwZW5kIHRoZW0gYWxsIHRvZ2V0aGVyIHRvIGZvcm0gYSBzaW5nbGUgYnVmZmVyIGhvbGRpbmcgYWxsIHRoZSB2YWx1ZXNcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBzdHJpbmcgd2UncmUgZW5jb2RpbmcgaW4gaGV4XG4gKiBAcmV0dXJucyB7aW50ZWdlcltdfSBhcnJheSBvZiBlbmNvZGVkIGJ5dGVzXG4gKi9cblxuXG5mdW5jdGlvbiBzdHJpbmdUb0hleEJ5dGVzKHZhbHVlKSB7XG4gIGNvbnN0IGxlbmd0aCA9IHZhbHVlLmxlbmd0aCAvIDI7XG4gIGNvbnN0IGJ5dGVBcnJheSA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBudW1lcmljVmFsdWUgPSBwYXJzZUludCh2YWx1ZS5zdWJzdHIoaSAqIDIsIDIpLCAxNik7XG5cbiAgICBpZiAoIU51bWJlci5pc05hTihudW1lcmljVmFsdWUpKSB7XG4gICAgICAvLyBkcm9wIGJhZCBoZXggY2hhcmFjdGVyc1xuICAgICAgYnl0ZUFycmF5LnB1c2gobnVtZXJpY1ZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5O1xufSAvLyBVc2UgYSBQcm94eSB0byBoYWNrIGFycmF5IHN0eWxlIGluZGV4IGFjY2Vzc29yc1xuXG5cbmNvbnN0IGFycmF5SW5kZXhIYW5kbGVyID0ge1xuICBnZXQodGFyZ2V0LCBwcm9wS2V5LCByZWNlaXZlcikge1xuICAgIGlmICh0eXBlb2YgcHJvcEtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IG51bSA9IE51bWJlcihwcm9wS2V5KTtcblxuICAgICAgaWYgKE51bWJlci5pc1NhZmVJbnRlZ2VyKG51bSkpIHtcbiAgICAgICAgcmV0dXJuIGdldEFkanVzdGVkSW5kZXgodGFyZ2V0LCBudW0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocHJvcEtleSA9PT0gaXNCdWZmZXIpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIHByb3BLZXksIHJlY2VpdmVyKTtcbiAgfSxcblxuICBzZXQodGFyZ2V0LCBwcm9wS2V5LCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICBpZiAodHlwZW9mIHByb3BLZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBudW0gPSBOdW1iZXIocHJvcEtleSk7XG5cbiAgICAgIGlmIChOdW1iZXIuaXNTYWZlSW50ZWdlcihudW0pKSB7XG4gICAgICAgIHJldHVybiBzZXRBZGp1c3RlZEluZGV4KHRhcmdldCwgbnVtLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFJlZmxlY3Quc2V0KHRhcmdldCwgcHJvcEtleSwgdmFsdWUsIHJlY2VpdmVyKTtcbiAgfSxcblxuICBoYXModGFyZ2V0LCBrZXkpIHtcbiAgICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IG51bSA9IE51bWJlcihrZXkpO1xuXG4gICAgICBpZiAoTnVtYmVyLmlzU2FmZUludGVnZXIobnVtKSkge1xuICAgICAgICAvLyBlbnN1cmUgaXQncyBhIHBvc2l0aXZlIFwic2FmZVwiIGludGVnZXIgd2l0aGluIHRoZSByYW5nZSBvZiB0aGUgYnVmZmVyXG4gICAgICAgIHJldHVybiBudW0gPj0gMCAmJiBudW0gPCB0YXJnZXQuX3RpQnVmZmVyLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ga2V5IGluIHRhcmdldDtcbiAgfVxuXG59O1xuXG5mdW5jdGlvbiBnZXRBZGp1c3RlZEluZGV4KGJ1ZiwgaW5kZXgpIHtcbiAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBidWYuX3RpQnVmZmVyLmxlbmd0aCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gYnVmLl90aUJ1ZmZlcltpbmRleCArIGJ1Zi5ieXRlT2Zmc2V0XTtcbn1cblxuZnVuY3Rpb24gc2V0QWRqdXN0ZWRJbmRleChidWYsIGluZGV4LCB2YWx1ZSkge1xuICBpZiAoaW5kZXggPj0gMCB8fCBpbmRleCA8IGJ1Zi5fdGlCdWZmZXIubGVuZ3RoKSB7XG4gICAgYnVmLl90aUJ1ZmZlcltpbmRleCArIGJ1Zi5ieXRlT2Zmc2V0XSA9IHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufVxuLyoqXG4gKiBXcmFwcyBjcmVhdGlvbiBvZiBhIEJ1ZmZlciBpbnN0YW5jZSBpbnNpZGUgYSBQcm94eSBzbyB3ZSBjYW4gaGFuZGxlIGFycmF5IGluZGV4IGFjY2Vzc1xuICogQHBhcmFtICB7Li4uYW55fSBhcmdzIGFyZ3VuZW50cyBvdCBCdWZmZXIgY29uc3RydWN0b3JcbiAqIEByZXR1cm5zIHtCdWZmZXJ9IHdyYXBwZWQgaW5zaWRlIGEgUHJveHlcbiAqL1xuXG5cbmZ1bmN0aW9uIG5ld0J1ZmZlciguLi5hcmdzKSB7XG4gIHJldHVybiBuZXcgUHJveHkobmV3IEJ1ZmZlciQxKC4uLmFyZ3MpLCBhcnJheUluZGV4SGFuZGxlcik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgc2VjdXJpdHkvZGV0ZWN0LW5ldy1idWZmZXJcbn1cbi8qKlxuICogVGhyb3dzIGEgUmFuZ2VFcnJvciBpZiBvZmZzZXQgaXMgb3V0IG9mIGJvdW5kc1xuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlciBidWZmZXIgd2UncmUgb3BlcmF0aW5nIG9uXG4gKiBAcGFyYW0ge2ludGVnZXJ9IG9mZnNldCB1c2VyIHN1cHBsaWVkIG9mZnNldFxuICogQHBhcmFtIHtpbnRlZ2VyfSBieXRlTGVuZ3RoIG51bWJlciBvZiBieXRlcyBuZWVkZWQgaW4gcmFuZ2VcbiAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9XG4gKi9cblxuXG5mdW5jdGlvbiBjaGVja09mZnNldChidWZmZXIsIG9mZnNldCwgYnl0ZUxlbmd0aCkge1xuICBjb25zdCBlbmRPZmZzZXQgPSBidWZmZXIubGVuZ3RoIC0gYnl0ZUxlbmd0aDtcblxuICBpZiAob2Zmc2V0IDwgMCB8fCBvZmZzZXQgPiBlbmRPZmZzZXQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgVGhlIHZhbHVlIG9mIFwib2Zmc2V0XCIgaXMgb3V0IG9mIHJhbmdlLiBJdCBtdXN0IGJlID49IDAgYW5kIDw9ICR7ZW5kT2Zmc2V0fS4gUmVjZWl2ZWQgJHtvZmZzZXR9YCk7XG4gIH1cbn1cbi8qKlxuICogQHBhcmFtIHtpbnRlZ2VyfSB2YWx1ZSB1c2VyLXN1cHBsaWVkIHZhbHVlXG4gKiBAcGFyYW0ge2ludGVnZXJ9IG1pbiBtaW5pbXVtIHZhbGlkIHZhbHVlXG4gKiBAcGFyYW0ge2ludGVnZXJ9IG1heCBtYXhpbXVtIHZhbGlkIHZhbHVlXG4gKiBAdGhyb3dzIHtSYW5nZUVycm9yfVxuICovXG5cblxuZnVuY3Rpb24gY2hlY2tWYWx1ZSh2YWx1ZSwgbWluLCBtYXgpIHtcbiAgaWYgKHZhbHVlIDwgbWluIHx8IHZhbHVlID4gbWF4KSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYFRoZSB2YWx1ZSBvZiBcInZhbHVlXCIgaXMgb3V0IG9mIHJhbmdlLiBJdCBtdXN0IGJlID49ICR7bWlufSBhbmQgPD0gJHttYXh9LiBSZWNlaXZlZCAke3ZhbHVlfWApO1xuICB9XG59XG5cbmxldCBidWZmZXJXYXJuaW5nQWxyZWFkeUVtaXR0ZWQgPSBmYWxzZTtcbmxldCBub2RlTW9kdWxlc0NoZWNrQ291bnRlciA9IDA7XG5jb25zdCBidWZmZXJXYXJuaW5nID0gJ0J1ZmZlcigpIGlzIGRlcHJlY2F0ZWQgZHVlIHRvIHNlY3VyaXR5IGFuZCB1c2FiaWxpdHkgJyArICdpc3N1ZXMuIFBsZWFzZSB1c2UgdGhlIEJ1ZmZlci5hbGxvYygpLCAnICsgJ0J1ZmZlci5hbGxvY1Vuc2FmZSgpLCBvciBCdWZmZXIuZnJvbSgpIG1ldGhvZHMgaW5zdGVhZC4nO1xuXG5mdW5jdGlvbiBzaG93RmxhZ2dlZERlcHJlY2F0aW9uKCkge1xuICBpZiAoYnVmZmVyV2FybmluZ0FscmVhZHlFbWl0dGVkIHx8ICsrbm9kZU1vZHVsZXNDaGVja0NvdW50ZXIgPiAxMDAwMCB8fCBpc0luc2lkZU5vZGVNb2R1bGVzKCkpIHtcbiAgICAvLyBXZSBkb24ndCBlbWl0IGEgd2FybmluZywgYmVjYXVzZSB3ZSBlaXRoZXI6XG4gICAgLy8gLSBBbHJlYWR5IGRpZCBzbywgb3JcbiAgICAvLyAtIEFscmVhZHkgY2hlY2tlZCB0b28gbWFueSB0aW1lcyB3aGV0aGVyIGEgY2FsbCBpcyBjb21pbmdcbiAgICAvLyAgIGZyb20gbm9kZV9tb2R1bGVzIGFuZCB3YW50IHRvIHN0b3Agc2xvd2luZyBkb3duIHRoaW5ncywgb3JcbiAgICAvLyAtIFRoZSBjb2RlIGlzIGluc2lkZSBgbm9kZV9tb2R1bGVzYC5cbiAgICByZXR1cm47XG4gIH1cblxuICBwcm9jZXNzLmVtaXRXYXJuaW5nKGJ1ZmZlcldhcm5pbmcsICdEZXByZWNhdGlvbldhcm5pbmcnLCAnREVQMDAwNScpO1xuICBidWZmZXJXYXJuaW5nQWxyZWFkeUVtaXR0ZWQgPSB0cnVlO1xufVxuXG4vLyBDb3B5cmlnaHQgTm9kZS5qcyBjb250cmlidXRvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5jb25zdCB7XG4gIEFMTF9QUk9QRVJUSUVTOiBBTExfUFJPUEVSVElFUyQyLFxuICBPTkxZX0VOVU1FUkFCTEU6IE9OTFlfRU5VTUVSQUJMRSQyXG59ID0gcHJvcGVydHlGaWx0ZXI7XG5jb25zdCBCb29sZWFuUHJvdG90eXBlID0gQm9vbGVhbi5wcm90b3R5cGU7XG5jb25zdCBEYXRlUHJvdG90eXBlID0gRGF0ZS5wcm90b3R5cGU7XG5jb25zdCBFcnJvclByb3RvdHlwZSA9IEVycm9yLnByb3RvdHlwZTtcbmNvbnN0IE51bWJlclByb3RvdHlwZSA9IE51bWJlci5wcm90b3R5cGU7XG5jb25zdCBNYXBQcm90b3R5cGUgPSBNYXAucHJvdG90eXBlO1xuY29uc3QgUmVnRXhwUHJvdG90eXBlID0gUmVnRXhwLnByb3RvdHlwZTtcbmNvbnN0IFN0cmluZ1Byb3RvdHlwZSA9IFN0cmluZy5wcm90b3R5cGU7XG5jb25zdCBTZXRQcm90b3R5cGUgPSBTZXQucHJvdG90eXBlO1xuY29uc3QgU3ltYm9sUHJvdG90eXBlID0gU3ltYm9sLnByb3RvdHlwZTtcbmNvbnN0IGlzSW9zID0gWydpcGFkJywgJ2lwaG9uZSddLmluY2x1ZGVzKFwiYW5kcm9pZFwiKTtcbmNvbnN0IHtcbiAgRVJSX0lOVkFMSURfQVJHX1RZUEVcbn0gPSBjb2RlcztcbmNvbnN0IGhhc093blByb3BlcnR5ID0gdW5jdXJyeVRoaXMoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSk7XG5jb25zdCBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IHVuY3VycnlUaGlzKE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUpO1xubGV0IGhleFNsaWNlID0gdW5jdXJyeVRoaXMoQnVmZmVyTW9kdWxlLkJ1ZmZlci5wcm90b3R5cGUuaGV4U2xpY2UpO1xuY29uc3QgYnVpbHRJbk9iamVjdHMgPSBuZXcgU2V0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGdsb2JhbCkuZmlsdGVyKGUgPT4gL14oW0EtWl1bYS16XSspKyQvLnRlc3QoZSkpKTtcbmNvbnN0IGluc3BlY3REZWZhdWx0T3B0aW9ucyA9IE9iamVjdC5zZWFsKHtcbiAgc2hvd0hpZGRlbjogZmFsc2UsXG4gIGRlcHRoOiAyLFxuICBjb2xvcnM6IGZhbHNlLFxuICBjdXN0b21JbnNwZWN0OiB0cnVlLFxuICBzaG93UHJveHk6IGZhbHNlLFxuICBtYXhBcnJheUxlbmd0aDogMTAwLFxuICBicmVha0xlbmd0aDogODAsXG4gIGNvbXBhY3Q6IDMsXG4gIHNvcnRlZDogZmFsc2UsXG4gIGdldHRlcnM6IGZhbHNlXG59KTtcbmNvbnN0IGtPYmplY3RUeXBlID0gMDtcbmNvbnN0IGtBcnJheVR5cGUgPSAxO1xuY29uc3Qga0FycmF5RXh0cmFzVHlwZSA9IDI7XG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb250cm9sLXJlZ2V4ICovXG5cbmNvbnN0IHN0ckVzY2FwZVNlcXVlbmNlc1JlZ0V4cCA9IC9bXFx4MDAtXFx4MWZcXHgyN1xceDVjXS87XG5jb25zdCBzdHJFc2NhcGVTZXF1ZW5jZXNSZXBsYWNlciA9IC9bXFx4MDAtXFx4MWZcXHgyN1xceDVjXS9nO1xuY29uc3Qgc3RyRXNjYXBlU2VxdWVuY2VzUmVnRXhwU2luZ2xlID0gL1tcXHgwMC1cXHgxZlxceDVjXS87XG5jb25zdCBzdHJFc2NhcGVTZXF1ZW5jZXNSZXBsYWNlclNpbmdsZSA9IC9bXFx4MDAtXFx4MWZcXHg1Y10vZztcbi8qIGVzbGludC1lbmFibGUgbm8tY29udHJvbC1yZWdleCAqL1xuXG5jb25zdCBrZXlTdHJSZWdFeHAgPSAvXlthLXpBLVpfXVthLXpBLVpfMC05XSokLztcbmNvbnN0IG51bWJlclJlZ0V4cCA9IC9eKDB8WzEtOV1bMC05XSopJC87XG5jb25zdCBub2RlTW9kdWxlc1JlZ0V4cCA9IC9bL1xcXFxdbm9kZV9tb2R1bGVzWy9cXFxcXSguKz8pKD89Wy9cXFxcXSkvZztcbmNvbnN0IGtNaW5MaW5lTGVuZ3RoID0gMTY7IC8vIENvbnN0YW50cyB0byBtYXAgdGhlIGl0ZXJhdG9yIHN0YXRlLlxuXG5jb25zdCBrV2VhayA9IDA7XG5jb25zdCBrSXRlcmF0b3IgPSAxO1xuY29uc3Qga01hcEVudHJpZXMgPSAyOyAvLyBFc2NhcGVkIHNwZWNpYWwgY2hhcmFjdGVycy4gVXNlIGVtcHR5IHN0cmluZ3MgdG8gZmlsbCB1cCB1bnVzZWQgZW50cmllcy5cblxuLyogZXNsaW50LWRpc2FibGUgcXVvdGVzICovXG5cbmNvbnN0IG1ldGEgPSBbJ1xcXFx1MDAwMCcsICdcXFxcdTAwMDEnLCAnXFxcXHUwMDAyJywgJ1xcXFx1MDAwMycsICdcXFxcdTAwMDQnLCAnXFxcXHUwMDA1JywgJ1xcXFx1MDAwNicsICdcXFxcdTAwMDcnLCAnXFxcXGInLCAnXFxcXHQnLCAnXFxcXG4nLCAnXFxcXHUwMDBiJywgJ1xcXFxmJywgJ1xcXFxyJywgJ1xcXFx1MDAwZScsICdcXFxcdTAwMGYnLCAnXFxcXHUwMDEwJywgJ1xcXFx1MDAxMScsICdcXFxcdTAwMTInLCAnXFxcXHUwMDEzJywgJ1xcXFx1MDAxNCcsICdcXFxcdTAwMTUnLCAnXFxcXHUwMDE2JywgJ1xcXFx1MDAxNycsICdcXFxcdTAwMTgnLCAnXFxcXHUwMDE5JywgJ1xcXFx1MDAxYScsICdcXFxcdTAwMWInLCAnXFxcXHUwMDFjJywgJ1xcXFx1MDAxZCcsICdcXFxcdTAwMWUnLCAnXFxcXHUwMDFmJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsIFwiXFxcXCdcIiwgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICdcXFxcXFxcXCddO1xuLyogZXNsaW50LWVuYWJsZSBxdW90ZXMgKi9cblxuZnVuY3Rpb24gZ2V0VXNlck9wdGlvbnMoY3R4KSB7XG4gIGNvbnN0IG9iaiA9IHtcbiAgICBzdHlsaXplOiBjdHguc3R5bGl6ZVxuICB9O1xuXG4gIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGluc3BlY3REZWZhdWx0T3B0aW9ucykpIHtcbiAgICBvYmpba2V5XSA9IGN0eFtrZXldO1xuICB9XG5cbiAgaWYgKGN0eC51c2VyT3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHJldHVybiB7IC4uLm9iaixcbiAgICAuLi5jdHgudXNlck9wdGlvbnNcbiAgfTtcbn1cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGFueSBpbnB1dC4gVHJpZXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHthbnl9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGB2YWx1ZWBcbiAqL1xuXG5cbmZ1bmN0aW9uIGluc3BlY3QodmFsdWUsIG9wdHMpIHtcbiAgLy8gRGVmYXVsdCBvcHRpb25zXG4gIGNvbnN0IGN0eCA9IHtcbiAgICBidWRnZXQ6IHt9LFxuICAgIGluZGVudGF0aW9uTHZsOiAwLFxuICAgIHNlZW46IFtdLFxuICAgIGN1cnJlbnREZXB0aDogMCxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvcixcbiAgICBzaG93SGlkZGVuOiBpbnNwZWN0RGVmYXVsdE9wdGlvbnMuc2hvd0hpZGRlbixcbiAgICBkZXB0aDogaW5zcGVjdERlZmF1bHRPcHRpb25zLmRlcHRoLFxuICAgIGNvbG9yczogaW5zcGVjdERlZmF1bHRPcHRpb25zLmNvbG9ycyxcbiAgICBjdXN0b21JbnNwZWN0OiBpbnNwZWN0RGVmYXVsdE9wdGlvbnMuY3VzdG9tSW5zcGVjdCxcbiAgICBzaG93UHJveHk6IGluc3BlY3REZWZhdWx0T3B0aW9ucy5zaG93UHJveHksXG4gICAgbWF4QXJyYXlMZW5ndGg6IGluc3BlY3REZWZhdWx0T3B0aW9ucy5tYXhBcnJheUxlbmd0aCxcbiAgICBicmVha0xlbmd0aDogaW5zcGVjdERlZmF1bHRPcHRpb25zLmJyZWFrTGVuZ3RoLFxuICAgIGNvbXBhY3Q6IGluc3BlY3REZWZhdWx0T3B0aW9ucy5jb21wYWN0LFxuICAgIHNvcnRlZDogaW5zcGVjdERlZmF1bHRPcHRpb25zLnNvcnRlZCxcbiAgICBnZXR0ZXJzOiBpbnNwZWN0RGVmYXVsdE9wdGlvbnMuZ2V0dGVyc1xuICB9O1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgIC8vIExlZ2FjeS4uLlxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgICAgaWYgKGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gICAgICB9XG4gICAgfSAvLyBTZXQgdXNlci1zcGVjaWZpZWQgb3B0aW9uc1xuXG5cbiAgICBpZiAodHlwZW9mIG9wdHMgPT09ICdib29sZWFuJykge1xuICAgICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICAgIH0gZWxzZSBpZiAob3B0cykge1xuICAgICAgY29uc3Qgb3B0S2V5cyA9IE9iamVjdC5rZXlzKG9wdHMpO1xuXG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBvcHRLZXlzKSB7XG4gICAgICAgIC8vIFRPRE8oQnJpZGdlQVIpOiBGaW5kIGEgc29sdXRpb24gd2hhdCB0byBkbyBhYm91dCBzdHlsaXplLiBFaXRoZXIgbWFrZVxuICAgICAgICAvLyB0aGlzIGZ1bmN0aW9uIHB1YmxpYyBvciBhZGQgYSBuZXcgQVBJIHdpdGggYSBzaW1pbGFyIG9yIGJldHRlclxuICAgICAgICAvLyBmdW5jdGlvbmFsaXR5LlxuICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkoaW5zcGVjdERlZmF1bHRPcHRpb25zLCBrZXkpIHx8IGtleSA9PT0gJ3N0eWxpemUnKSB7XG4gICAgICAgICAgY3R4W2tleV0gPSBvcHRzW2tleV07XG4gICAgICAgIH0gZWxzZSBpZiAoY3R4LnVzZXJPcHRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBUaGlzIGlzIHJlcXVpcmVkIHRvIHBhc3MgdGhyb3VnaCB0aGUgYWN0dWFsIHVzZXIgaW5wdXQuXG4gICAgICAgICAgY3R4LnVzZXJPcHRpb25zID0gb3B0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChjdHguY29sb3JzKSB7XG4gICAgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICB9XG5cbiAgaWYgKGN0eC5tYXhBcnJheUxlbmd0aCA9PT0gbnVsbCkge1xuICAgIGN0eC5tYXhBcnJheUxlbmd0aCA9IEluZmluaXR5O1xuICB9XG5cbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIDApO1xufVxuaW5zcGVjdC5jdXN0b20gPSBjdXN0b21JbnNwZWN0U3ltYm9sO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGluc3BlY3QsICdkZWZhdWx0T3B0aW9ucycsIHtcbiAgZ2V0KCkge1xuICAgIHJldHVybiBpbnNwZWN0RGVmYXVsdE9wdGlvbnM7XG4gIH0sXG5cbiAgc2V0KG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gbnVsbCB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IG5ldyBFUlJfSU5WQUxJRF9BUkdfVFlQRSgnb3B0aW9ucycsICdPYmplY3QnLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihpbnNwZWN0RGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuICB9XG5cbn0pOyAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3NcblxuaW5zcGVjdC5jb2xvcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUobnVsbCksIHtcbiAgYm9sZDogWzEsIDIyXSxcbiAgaXRhbGljOiBbMywgMjNdLFxuICB1bmRlcmxpbmU6IFs0LCAyNF0sXG4gIGludmVyc2U6IFs3LCAyN10sXG4gIHdoaXRlOiBbMzcsIDM5XSxcbiAgZ3JleTogWzkwLCAzOV0sXG4gIGJsYWNrOiBbMzAsIDM5XSxcbiAgYmx1ZTogWzM0LCAzOV0sXG4gIGN5YW46IFszNiwgMzldLFxuICBncmVlbjogWzMyLCAzOV0sXG4gIG1hZ2VudGE6IFszNSwgMzldLFxuICByZWQ6IFszMSwgMzldLFxuICB5ZWxsb3c6IFszMywgMzldXG59KTsgLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5cbmluc3BlY3Quc3R5bGVzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKG51bGwpLCB7XG4gIHNwZWNpYWw6ICdjeWFuJyxcbiAgbnVtYmVyOiAneWVsbG93JyxcbiAgYmlnaW50OiAneWVsbG93JyxcbiAgYm9vbGVhbjogJ3llbGxvdycsXG4gIHVuZGVmaW5lZDogJ2dyZXknLFxuICBudWxsOiAnYm9sZCcsXG4gIHN0cmluZzogJ2dyZWVuJyxcbiAgc3ltYm9sOiAnZ3JlZW4nLFxuICBkYXRlOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gIHJlZ2V4cDogJ3JlZCcsXG4gIG1vZHVsZTogJ3VuZGVybGluZSdcbn0pO1xuXG5mdW5jdGlvbiBhZGRRdW90ZXMoc3RyLCBxdW90ZXMpIHtcbiAgaWYgKHF1b3RlcyA9PT0gLTEpIHtcbiAgICByZXR1cm4gYFwiJHtzdHJ9XCJgO1xuICB9XG5cbiAgaWYgKHF1b3RlcyA9PT0gLTIpIHtcbiAgICByZXR1cm4gYFxcYCR7c3RyfVxcYGA7XG4gIH1cblxuICByZXR1cm4gYCcke3N0cn0nYDtcbn1cblxuY29uc3QgZXNjYXBlRm4gPSBzdHIgPT4gbWV0YVtzdHIuY2hhckNvZGVBdCgwKV07IC8vIEVzY2FwZSBjb250cm9sIGNoYXJhY3RlcnMsIHNpbmdsZSBxdW90ZXMgYW5kIHRoZSBiYWNrc2xhc2guXG4vLyBUaGlzIGlzIHNpbWlsYXIgdG8gSlNPTiBzdHJpbmdpZnkgZXNjYXBpbmcuXG5cblxuZnVuY3Rpb24gc3RyRXNjYXBlKHN0cikge1xuICBsZXQgZXNjYXBlVGVzdCA9IHN0ckVzY2FwZVNlcXVlbmNlc1JlZ0V4cDtcbiAgbGV0IGVzY2FwZVJlcGxhY2UgPSBzdHJFc2NhcGVTZXF1ZW5jZXNSZXBsYWNlcjtcbiAgbGV0IHNpbmdsZVF1b3RlID0gMzk7IC8vIENoZWNrIGZvciBkb3VibGUgcXVvdGVzLiBJZiBub3QgcHJlc2VudCwgZG8gbm90IGVzY2FwZSBzaW5nbGUgcXVvdGVzIGFuZFxuICAvLyBpbnN0ZWFkIHdyYXAgdGhlIHRleHQgaW4gZG91YmxlIHF1b3Rlcy4gSWYgZG91YmxlIHF1b3RlcyBleGlzdCwgY2hlY2sgZm9yXG4gIC8vIGJhY2t0aWNrcy4gSWYgdGhleSBkbyBub3QgZXhpc3QsIHVzZSB0aG9zZSBhcyBmYWxsYmFjayBpbnN0ZWFkIG9mIHRoZVxuICAvLyBkb3VibGUgcXVvdGVzLlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcXVvdGVzXG5cbiAgaWYgKHN0ci5pbmNsdWRlcyhcIidcIikpIHtcbiAgICAvLyBUaGlzIGludmFsaWRhdGVzIHRoZSBjaGFyQ29kZSBhbmQgdGhlcmVmb3JlIGNhbiBub3QgYmUgbWF0Y2hlZCBmb3JcbiAgICAvLyBhbnltb3JlLlxuICAgIGlmICghc3RyLmluY2x1ZGVzKCdcIicpKSB7XG4gICAgICBzaW5nbGVRdW90ZSA9IC0xO1xuICAgIH0gZWxzZSBpZiAoIXN0ci5pbmNsdWRlcygnYCcpICYmICFzdHIuaW5jbHVkZXMoJyR7JykpIHtcbiAgICAgIHNpbmdsZVF1b3RlID0gLTI7XG4gICAgfVxuXG4gICAgaWYgKHNpbmdsZVF1b3RlICE9PSAzOSkge1xuICAgICAgZXNjYXBlVGVzdCA9IHN0ckVzY2FwZVNlcXVlbmNlc1JlZ0V4cFNpbmdsZTtcbiAgICAgIGVzY2FwZVJlcGxhY2UgPSBzdHJFc2NhcGVTZXF1ZW5jZXNSZXBsYWNlclNpbmdsZTtcbiAgICB9XG4gIH0gLy8gU29tZSBtYWdpYyBudW1iZXJzIHRoYXQgd29ya2VkIG91dCBmaW5lIHdoaWxlIGJlbmNobWFya2luZyB3aXRoIHY4IDYuMFxuXG5cbiAgaWYgKHN0ci5sZW5ndGggPCA1MDAwICYmICFlc2NhcGVUZXN0LnRlc3Qoc3RyKSkge1xuICAgIHJldHVybiBhZGRRdW90ZXMoc3RyLCBzaW5nbGVRdW90ZSk7XG4gIH1cblxuICBpZiAoc3RyLmxlbmd0aCA+IDEwMCkge1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKGVzY2FwZVJlcGxhY2UsIGVzY2FwZUZuKTtcbiAgICByZXR1cm4gYWRkUXVvdGVzKHN0ciwgc2luZ2xlUXVvdGUpO1xuICB9XG5cbiAgbGV0IHJlc3VsdCA9ICcnO1xuICBsZXQgbGFzdCA9IDA7XG4gIGNvbnN0IGxhc3RJbmRleCA9IHN0ci5sZW5ndGg7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYXN0SW5kZXg7IGkrKykge1xuICAgIGNvbnN0IHBvaW50ID0gc3RyLmNoYXJDb2RlQXQoaSk7XG5cbiAgICBpZiAocG9pbnQgPT09IHNpbmdsZVF1b3RlIHx8IHBvaW50ID09PSA5MiB8fCBwb2ludCA8IDMyKSB7XG4gICAgICBpZiAobGFzdCA9PT0gaSkge1xuICAgICAgICByZXN1bHQgKz0gbWV0YVtwb2ludF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgKz0gYCR7c3RyLnNsaWNlKGxhc3QsIGkpfSR7bWV0YVtwb2ludF19YDtcbiAgICAgIH1cblxuICAgICAgbGFzdCA9IGkgKyAxO1xuICAgIH1cbiAgfVxuXG4gIGlmIChsYXN0ICE9PSBsYXN0SW5kZXgpIHtcbiAgICByZXN1bHQgKz0gc3RyLnNsaWNlKGxhc3QpO1xuICB9XG5cbiAgcmV0dXJuIGFkZFF1b3RlcyhyZXN1bHQsIHNpbmdsZVF1b3RlKTtcbn1cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICBjb25zdCBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBjb2xvciA9IGluc3BlY3QuY29sb3JzW3N0eWxlXTtcbiAgICByZXR1cm4gYFxcdTAwMWJbJHtjb2xvclswXX1tJHtzdHJ9XFx1MDAxYlske2NvbG9yWzFdfW1gO1xuICB9XG5cbiAgcmV0dXJuIHN0cjtcbn1cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyKSB7XG4gIHJldHVybiBzdHI7XG59IC8vIFJldHVybiBhIG5ldyBlbXB0eSBhcnJheSB0byBwdXNoIGluIHRoZSByZXN1bHRzIG9mIHRoZSBkZWZhdWx0IGZvcm1hdHRlci5cblxuXG5mdW5jdGlvbiBnZXRFbXB0eUZvcm1hdEFycmF5KCkge1xuICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIGdldENvbnN0cnVjdG9yTmFtZShvYmosIF9jdHgpIHtcbiAgbGV0IGZpcnN0UHJvdG87IC8vIGNvbnN0IHRtcCA9IG9iajtcblxuICB3aGlsZSAob2JqKSB7XG4gICAgY29uc3QgZGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCAnY29uc3RydWN0b3InKTtcblxuICAgIGlmIChkZXNjcmlwdG9yICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGRlc2NyaXB0b3IudmFsdWUgPT09ICdmdW5jdGlvbicgJiYgZGVzY3JpcHRvci52YWx1ZS5uYW1lICE9PSAnJykge1xuICAgICAgcmV0dXJuIGRlc2NyaXB0b3IudmFsdWUubmFtZTtcbiAgICB9XG5cbiAgICBvYmogPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcblxuICAgIGlmIChmaXJzdFByb3RvID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGZpcnN0UHJvdG8gPSBvYmo7XG4gICAgfVxuICB9XG5cbiAgaWYgKGZpcnN0UHJvdG8gPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICAvKlxuICAgQHRvZG8gdGhpcyBjYWxscyBpbnRvIG5hdGl2ZSwgY2FuIHdlIHJlcGxhY2UgdGhpcyBzb21laG93P1xuICByZXR1cm4gYCR7aW50ZXJuYWxHZXRDb25zdHJ1Y3Rvck5hbWUodG1wKX0gPCR7aW5zcGVjdChmaXJzdFByb3RvLCB7XG4gIFx0Li4uY3R4LFxuICBcdGN1c3RvbUluc3BlY3Q6IGZhbHNlXG4gIH0pfT5gO1xuICAqL1xuXG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGdldFByZWZpeChjb25zdHJ1Y3RvciwgdGFnLCBmYWxsYmFjaykge1xuICBpZiAoY29uc3RydWN0b3IgPT09IG51bGwpIHtcbiAgICBpZiAodGFnICE9PSAnJykge1xuICAgICAgcmV0dXJuIGBbJHtmYWxsYmFja306IG51bGwgcHJvdG90eXBlXSBbJHt0YWd9XSBgO1xuICAgIH1cblxuICAgIHJldHVybiBgWyR7ZmFsbGJhY2t9OiBudWxsIHByb3RvdHlwZV0gYDtcbiAgfVxuXG4gIGlmICh0YWcgIT09ICcnICYmIGNvbnN0cnVjdG9yICE9PSB0YWcpIHtcbiAgICByZXR1cm4gYCR7Y29uc3RydWN0b3J9IFske3RhZ31dIGA7XG4gIH1cblxuICByZXR1cm4gYCR7Y29uc3RydWN0b3J9IGA7XG59IC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cblxuXG5mdW5jdGlvbiBnZXRLZXlzKHZhbHVlLCBzaG93SGlkZGVuKSB7XG4gIGxldCBrZXlzO1xuICBjb25zdCBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyh2YWx1ZSk7XG5cbiAgaWYgKHNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuXG4gICAgaWYgKHN5bWJvbHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICBrZXlzLnB1c2goLi4uc3ltYm9scyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIFRoaXMgbWlnaHQgdGhyb3cgaWYgYHZhbHVlYCBpcyBhIE1vZHVsZSBOYW1lc3BhY2UgT2JqZWN0IGZyb20gYW5cbiAgICAvLyB1bmV2YWx1YXRlZCBtb2R1bGUsIGJ1dCB3ZSBkb24ndCB3YW50IHRvIHBlcmZvcm0gdGhlIGFjdHVhbCB0eXBlXG4gICAgLy8gY2hlY2sgYmVjYXVzZSBpdCdzIGV4cGVuc2l2ZS5cbiAgICAvLyBUT0RPKGRldnNuZWspOiB0cmFjayBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9lY21hMjYyL2lzc3Vlcy8xMjA5XG4gICAgLy8gYW5kIG1vZGlmeSB0aGlzIGxvZ2ljIGFzIG5lZWRlZC5cbiAgICB0cnkge1xuICAgICAga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIEBmaXhtZSBob3cgdG8gZHUgaXNNb2R1bGVOYW1lc3BhY2VPYmplY3Q/XG5cbiAgICAgIC8qXG4gICAgICBhc3NlcnQoaXNOYXRpdmVFcnJvcihlcnIpICYmIGVyci5uYW1lID09PSAnUmVmZXJlbmNlRXJyb3InICYmXG4gICAgICBcdFx0XHQgaXNNb2R1bGVOYW1lc3BhY2VPYmplY3QodmFsdWUpKTtcbiAgICAgICovXG4gICAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICAgIH1cblxuICAgIGlmIChzeW1ib2xzLmxlbmd0aCAhPT0gMCkge1xuICAgICAga2V5cy5wdXNoKC4uLnN5bWJvbHMuZmlsdGVyKGtleSA9PiBwcm9wZXJ0eUlzRW51bWVyYWJsZSh2YWx1ZSwga2V5KSkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBrZXlzO1xufVxuXG5mdW5jdGlvbiBnZXRDdHhTdHlsZSh2YWx1ZSwgY29uc3RydWN0b3IsIHRhZykge1xuICBsZXQgZmFsbGJhY2sgPSAnJztcblxuICBpZiAoY29uc3RydWN0b3IgPT09IG51bGwpIHtcbiAgICBmYWxsYmFjayA9ICdPYmplY3QnO1xuICB9XG5cbiAgcmV0dXJuIGdldFByZWZpeChjb25zdHJ1Y3RvciwgdGFnLCBmYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIGZpbmRUeXBlZENvbnN0cnVjdG9yKHZhbHVlKSB7XG4gIGZvciAoY29uc3QgW2NoZWNrLCBjbGF6el0gb2YgW1tpc1VpbnQ4QXJyYXksIFVpbnQ4QXJyYXldLCBbaXNVaW50OENsYW1wZWRBcnJheSwgVWludDhDbGFtcGVkQXJyYXldLCBbaXNVaW50MTZBcnJheSwgVWludDE2QXJyYXldLCBbaXNVaW50MzJBcnJheSwgVWludDMyQXJyYXldLCBbaXNJbnQ4QXJyYXksIEludDhBcnJheV0sIFtpc0ludDE2QXJyYXksIEludDE2QXJyYXldLCBbaXNJbnQzMkFycmF5LCBJbnQzMkFycmF5XSwgW2lzRmxvYXQzMkFycmF5LCBGbG9hdDMyQXJyYXldLCBbaXNGbG9hdDY0QXJyYXksIEZsb2F0NjRBcnJheV1dKSB7XG4gICAgaWYgKGNoZWNrKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGNsYXp6O1xuICAgIH1cbiAgfVxufVxuXG5sZXQgbGF6eU51bGxQcm90b3R5cGVDYWNoZTsgLy8gQ3JlYXRlcyBhIHN1YmNsYXNzIGFuZCBuYW1lXG4vLyB0aGUgY29uc3RydWN0b3IgYXMgYCR7Y2xhenp9IDogbnVsbCBwcm90b3R5cGVgXG5cbmZ1bmN0aW9uIGNsYXp6V2l0aE51bGxQcm90b3R5cGUoY2xhenosIG5hbWUpIHtcbiAgaWYgKGxhenlOdWxsUHJvdG90eXBlQ2FjaGUgPT09IHVuZGVmaW5lZCkge1xuICAgIGxhenlOdWxsUHJvdG90eXBlQ2FjaGUgPSBuZXcgTWFwKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgY2FjaGVkQ2xhc3MgPSBsYXp5TnVsbFByb3RvdHlwZUNhY2hlLmdldChjbGF6eik7XG5cbiAgICBpZiAoY2FjaGVkQ2xhc3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGNhY2hlZENsYXNzO1xuICAgIH1cbiAgfVxuXG4gIGNsYXNzIE51bGxQcm90b3R5cGUgZXh0ZW5kcyBjbGF6eiB7XG4gICAgZ2V0IFtTeW1ib2wudG9TdHJpbmdUYWddKCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE51bGxQcm90b3R5cGUucHJvdG90eXBlLmNvbnN0cnVjdG9yLCAnbmFtZScsIHtcbiAgICB2YWx1ZTogYFske25hbWV9OiBudWxsIHByb3RvdHlwZV1gXG4gIH0pO1xuICBsYXp5TnVsbFByb3RvdHlwZUNhY2hlLnNldChjbGF6eiwgTnVsbFByb3RvdHlwZSk7XG4gIHJldHVybiBOdWxsUHJvdG90eXBlO1xufVxuXG5mdW5jdGlvbiBub1Byb3RvdHlwZUl0ZXJhdG9yKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICBsZXQgbmV3VmFsO1xuXG4gIGlmIChpc1NldCh2YWx1ZSkpIHtcbiAgICBjb25zdCBjbGF6eiA9IGNsYXp6V2l0aE51bGxQcm90b3R5cGUoU2V0LCAnU2V0Jyk7XG4gICAgbmV3VmFsID0gbmV3IGNsYXp6KFNldFByb3RvdHlwZS52YWx1ZXModmFsdWUpKTtcbiAgfSBlbHNlIGlmIChpc01hcCh2YWx1ZSkpIHtcbiAgICBjb25zdCBjbGF6eiA9IGNsYXp6V2l0aE51bGxQcm90b3R5cGUoTWFwLCAnTWFwJyk7XG4gICAgbmV3VmFsID0gbmV3IGNsYXp6KE1hcFByb3RvdHlwZS5lbnRyaWVzKHZhbHVlKSk7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBjb25zdCBjbGF6eiA9IGNsYXp6V2l0aE51bGxQcm90b3R5cGUoQXJyYXksICdBcnJheScpO1xuICAgIG5ld1ZhbCA9IG5ldyBjbGF6eih2YWx1ZS5sZW5ndGgpO1xuICB9IGVsc2UgaWYgKGlzVHlwZWRBcnJheSh2YWx1ZSkpIHtcbiAgICBjb25zdCBjb25zdHJ1Y3RvciA9IGZpbmRUeXBlZENvbnN0cnVjdG9yKHZhbHVlKTtcbiAgICBjb25zdCBjbGF6eiA9IGNsYXp6V2l0aE51bGxQcm90b3R5cGUoY29uc3RydWN0b3IsIGNvbnN0cnVjdG9yLm5hbWUpO1xuICAgIG5ld1ZhbCA9IG5ldyBjbGF6eih2YWx1ZSk7XG4gIH1cblxuICBpZiAobmV3VmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhuZXdWYWwsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHZhbHVlKSk7XG4gICAgcmV0dXJuIGZvcm1hdFJhdyhjdHgsIG5ld1ZhbCwgcmVjdXJzZVRpbWVzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHR5cGVkQXJyYXkpIHtcbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXMuXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnICYmIHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmb3JtYXRQcmltaXRpdmUoY3R4LnN0eWxpemUsIHZhbHVlLCBjdHgpO1xuICB9XG5cbiAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbiAgfSAvLyBNZW1vcml6ZSB0aGUgY29udGV4dCBmb3IgY3VzdG9tIGluc3BlY3Rpb24gb24gcHJveGllcy5cblxuXG4gIGNvbnN0IGNvbnRleHQgPSB2YWx1ZTtcbiAgLypcbiAgQGZpeG1lIGNoZWNrIGZvciBwcm94aWVzXG4gIC8vIEFsd2F5cyBjaGVjayBmb3IgcHJveGllcyB0byBwcmV2ZW50IHNpZGUgZWZmZWN0cyBhbmQgdG8gcHJldmVudCB0cmlnZ2VyaW5nXG4gIC8vIGFueSBwcm94eSBoYW5kbGVycy5cbiAgY29uc3QgcHJveHkgPSBnZXRQcm94eURldGFpbHModmFsdWUpO1xuICBpZiAocHJveHkgIT09IHVuZGVmaW5lZCkge1xuICBcdGlmIChjdHguc2hvd1Byb3h5KSB7XG4gIFx0XHRyZXR1cm4gZm9ybWF0UHJveHkoY3R4LCBwcm94eSwgcmVjdXJzZVRpbWVzKTtcbiAgXHR9XG4gIFx0dmFsdWUgPSBwcm94eVswXTtcbiAgfVxuICAqL1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdC5cblxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QpIHtcbiAgICBjb25zdCBtYXliZUN1c3RvbSA9IHZhbHVlW2N1c3RvbUluc3BlY3RTeW1ib2xdO1xuXG4gICAgaWYgKHR5cGVvZiBtYXliZUN1c3RvbSA9PT0gJ2Z1bmN0aW9uJyAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXRzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbC5cbiAgICAmJiBtYXliZUN1c3RvbSAhPT0gaW5zcGVjdCAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAmJiAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgICAvLyBUaGlzIG1ha2VzIHN1cmUgdGhlIHJlY3Vyc2VUaW1lcyBhcmUgcmVwb3J0ZWQgYXMgYmVmb3JlIHdoaWxlIHVzaW5nXG4gICAgICAvLyBhIGNvdW50ZXIgaW50ZXJuYWxseS5cbiAgICAgIGNvbnN0IGRlcHRoID0gY3R4LmRlcHRoID09PSBudWxsID8gbnVsbCA6IGN0eC5kZXB0aCAtIHJlY3Vyc2VUaW1lcztcbiAgICAgIGNvbnN0IHJldCA9IG1heWJlQ3VzdG9tLmNhbGwoY29udGV4dCwgZGVwdGgsIGdldFVzZXJPcHRpb25zKGN0eCkpOyAvLyBJZiB0aGUgY3VzdG9tIGluc3BlY3Rpb24gbWV0aG9kIHJldHVybmVkIGB0aGlzYCwgZG9uJ3QgZ28gaW50b1xuICAgICAgLy8gaW5maW5pdGUgcmVjdXJzaW9uLlxuXG4gICAgICBpZiAocmV0ICE9PSBjb250ZXh0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmV0ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXQucmVwbGFjZSgvXFxuL2csIGBcXG4keycgJy5yZXBlYXQoY3R4LmluZGVudGF0aW9uTHZsKX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gLy8gVXNpbmcgYW4gYXJyYXkgaGVyZSBpcyBhY3R1YWxseSBiZXR0ZXIgZm9yIHRoZSBhdmVyYWdlIGNhc2UgdGhhbiB1c2luZ1xuICAvLyBhIFNldC4gYHNlZW5gIHdpbGwgb25seSBjaGVjayBmb3IgdGhlIGRlcHRoIGFuZCB3aWxsIG5ldmVyIGdyb3cgdG9vIGxhcmdlLlxuXG5cbiAgaWYgKGN0eC5zZWVuLmluY2x1ZGVzKHZhbHVlKSkge1xuICAgIGxldCBpbmRleCA9IDE7XG5cbiAgICBpZiAoY3R4LmNpcmN1bGFyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGN0eC5jaXJjdWxhciA9IG5ldyBNYXAoW1t2YWx1ZSwgaW5kZXhdXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluZGV4ID0gY3R4LmNpcmN1bGFyLmdldCh2YWx1ZSk7XG5cbiAgICAgIGlmIChpbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGluZGV4ID0gY3R4LmNpcmN1bGFyLnNpemUgKyAxO1xuICAgICAgICBjdHguY2lyY3VsYXIuc2V0KHZhbHVlLCBpbmRleCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKGBbQ2lyY3VsYXIgKiR7aW5kZXh9XWAsICdzcGVjaWFsJyk7XG4gIH1cblxuICByZXR1cm4gZm9ybWF0UmF3KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdHlwZWRBcnJheSk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFJhdyhjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHR5cGVkQXJyYXkpIHtcbiAgbGV0IGtleXM7XG4gIGNvbnN0IGNvbnN0cnVjdG9yID0gZ2V0Q29uc3RydWN0b3JOYW1lKHZhbHVlKTtcbiAgbGV0IHRhZyA9IHZhbHVlW1N5bWJvbC50b1N0cmluZ1RhZ107IC8vIE9ubHkgbGlzdCB0aGUgdGFnIGluIGNhc2UgaXQncyBub24tZW51bWVyYWJsZSAvIG5vdCBhbiBvd24gcHJvcGVydHkuXG4gIC8vIE90aGVyd2lzZSB3ZSdkIHByaW50IHRoaXMgdHdpY2UuXG5cbiAgaWYgKHR5cGVvZiB0YWcgIT09ICdzdHJpbmcnIHx8IHRhZyAhPT0gJycgJiYgKGN0eC5zaG93SGlkZGVuID8gaGFzT3duUHJvcGVydHkgOiBwcm9wZXJ0eUlzRW51bWVyYWJsZSkodmFsdWUsIFN5bWJvbC50b1N0cmluZ1RhZykpIHtcbiAgICB0YWcgPSAnJztcbiAgfVxuXG4gIGxldCBiYXNlID0gJyc7XG4gIGxldCBmb3JtYXR0ZXIgPSBnZXRFbXB0eUZvcm1hdEFycmF5O1xuICBsZXQgYnJhY2VzO1xuICBsZXQgbm9JdGVyYXRvciA9IHRydWU7XG4gIGxldCBpID0gMDtcbiAgY29uc3QgZmlsdGVyID0gY3R4LnNob3dIaWRkZW4gPyBBTExfUFJPUEVSVElFUyQyIDogT05MWV9FTlVNRVJBQkxFJDI7XG4gIGxldCBleHRyYXNUeXBlID0ga09iamVjdFR5cGU7IC8vIEl0ZXJhdG9ycyBhbmQgdGhlIHJlc3QgYXJlIHNwbGl0IHRvIHJlZHVjZSBjaGVja3MuXG5cbiAgaWYgKHZhbHVlW1N5bWJvbC5pdGVyYXRvcl0pIHtcbiAgICBub0l0ZXJhdG9yID0gZmFsc2U7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIGtleXMgPSBnZXRPd25Ob25JbmRleFByb3BlcnRpZXModmFsdWUsIGZpbHRlcik7IC8vIE9ubHkgc2V0IHRoZSBjb25zdHJ1Y3RvciBmb3Igbm9uIG9yZGluYXJ5IChcIkFycmF5IFsuLi5dXCIpIGFycmF5cy5cblxuICAgICAgY29uc3QgcHJlZml4ID0gZ2V0UHJlZml4KGNvbnN0cnVjdG9yLCB0YWcsICdBcnJheScpO1xuICAgICAgYnJhY2VzID0gW2Ake3ByZWZpeCA9PT0gJ0FycmF5ICcgPyAnJyA6IHByZWZpeH1bYCwgJ10nXTtcblxuICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMCAmJiBrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gYCR7YnJhY2VzWzBdfV1gO1xuICAgICAgfVxuXG4gICAgICBleHRyYXNUeXBlID0ga0FycmF5RXh0cmFzVHlwZTtcbiAgICAgIGZvcm1hdHRlciA9IGZvcm1hdEFycmF5O1xuICAgIH0gZWxzZSBpZiAoaXNTZXQodmFsdWUpKSB7XG4gICAgICBrZXlzID0gZ2V0S2V5cyh2YWx1ZSwgY3R4LnNob3dIaWRkZW4pO1xuICAgICAgY29uc3QgcHJlZml4ID0gZ2V0UHJlZml4KGNvbnN0cnVjdG9yLCB0YWcsICdTZXQnKTtcblxuICAgICAgaWYgKHZhbHVlLnNpemUgPT09IDAgJiYga2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGAke3ByZWZpeH17fWA7XG4gICAgICB9XG5cbiAgICAgIGJyYWNlcyA9IFtgJHtwcmVmaXh9e2AsICd9J107XG4gICAgICBmb3JtYXR0ZXIgPSBmb3JtYXRTZXQ7XG4gICAgfSBlbHNlIGlmIChpc01hcCh2YWx1ZSkpIHtcbiAgICAgIGtleXMgPSBnZXRLZXlzKHZhbHVlLCBjdHguc2hvd0hpZGRlbik7XG4gICAgICBjb25zdCBwcmVmaXggPSBnZXRQcmVmaXgoY29uc3RydWN0b3IsIHRhZywgJ01hcCcpO1xuXG4gICAgICBpZiAodmFsdWUuc2l6ZSA9PT0gMCAmJiBrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gYCR7cHJlZml4fXt9YDtcbiAgICAgIH1cblxuICAgICAgYnJhY2VzID0gW2Ake3ByZWZpeH17YCwgJ30nXTtcbiAgICAgIGZvcm1hdHRlciA9IGZvcm1hdE1hcDtcbiAgICB9IGVsc2UgaWYgKGlzVHlwZWRBcnJheSh2YWx1ZSkpIHtcbiAgICAgIGtleXMgPSBnZXRPd25Ob25JbmRleFByb3BlcnRpZXModmFsdWUsIGZpbHRlcik7XG4gICAgICBjb25zdCBwcmVmaXggPSBjb25zdHJ1Y3RvciAhPT0gbnVsbCA/IGdldFByZWZpeChjb25zdHJ1Y3RvciwgdGFnKSA6IGdldFByZWZpeChjb25zdHJ1Y3RvciwgdGFnLCBmaW5kVHlwZWRDb25zdHJ1Y3Rvcih2YWx1ZSkubmFtZSk7XG4gICAgICBicmFjZXMgPSBbYCR7cHJlZml4fVtgLCAnXSddO1xuXG4gICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAwICYmIGtleXMubGVuZ3RoID09PSAwICYmICFjdHguc2hvd0hpZGRlbikge1xuICAgICAgICByZXR1cm4gYCR7YnJhY2VzWzBdfV1gO1xuICAgICAgfVxuXG4gICAgICBmb3JtYXR0ZXIgPSBmb3JtYXRUeXBlZEFycmF5O1xuICAgICAgZXh0cmFzVHlwZSA9IGtBcnJheUV4dHJhc1R5cGU7XG4gICAgfSBlbHNlIGlmIChpc01hcEl0ZXJhdG9yKHZhbHVlKSkge1xuICAgICAga2V5cyA9IGdldEtleXModmFsdWUsIGN0eC5zaG93SGlkZGVuKTtcbiAgICAgIGJyYWNlcyA9IGdldEl0ZXJhdG9yQnJhY2VzKCdNYXAnLCB0YWcpO1xuICAgICAgZm9ybWF0dGVyID0gZm9ybWF0SXRlcmF0b3I7XG4gICAgfSBlbHNlIGlmIChpc1NldEl0ZXJhdG9yKHZhbHVlKSkge1xuICAgICAga2V5cyA9IGdldEtleXModmFsdWUsIGN0eC5zaG93SGlkZGVuKTtcbiAgICAgIGJyYWNlcyA9IGdldEl0ZXJhdG9yQnJhY2VzKCdTZXQnLCB0YWcpO1xuICAgICAgZm9ybWF0dGVyID0gZm9ybWF0SXRlcmF0b3I7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vSXRlcmF0b3IgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmIChub0l0ZXJhdG9yKSB7XG4gICAga2V5cyA9IGdldEtleXModmFsdWUsIGN0eC5zaG93SGlkZGVuKTtcbiAgICBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gICAgaWYgKGNvbnN0cnVjdG9yID09PSAnT2JqZWN0Jykge1xuICAgICAgaWYgKGlzQXJndW1lbnRzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICBicmFjZXNbMF0gPSAnW0FyZ3VtZW50c10geyc7XG4gICAgICB9IGVsc2UgaWYgKHRhZyAhPT0gJycpIHtcbiAgICAgICAgYnJhY2VzWzBdID0gYCR7Z2V0UHJlZml4KGNvbnN0cnVjdG9yLCB0YWcsICdPYmplY3QnKX17YDtcbiAgICAgIH1cblxuICAgICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBgJHticmFjZXNbMF19fWA7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGJhc2UgPSBnZXRGdW5jdGlvbkJhc2UodmFsdWUsIGNvbnN0cnVjdG9yLCB0YWcpO1xuXG4gICAgICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKGJhc2UsICdzcGVjaWFsJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgc2VjdXJpdHkvZGV0ZWN0LW5vbi1saXRlcmFsLXJlZ2V4cFxuICAgICAgY29uc3QgcmVnRXhwID0gY29uc3RydWN0b3IgIT09IG51bGwgPyB2YWx1ZSA6IG5ldyBSZWdFeHAodmFsdWUpO1xuICAgICAgYmFzZSA9IFJlZ0V4cFByb3RvdHlwZS50b1N0cmluZy5jYWxsKHJlZ0V4cCk7XG4gICAgICBjb25zdCBwcmVmaXggPSBnZXRQcmVmaXgoY29uc3RydWN0b3IsIHRhZywgJ1JlZ0V4cCcpO1xuXG4gICAgICBpZiAocHJlZml4ICE9PSAnUmVnRXhwICcpIHtcbiAgICAgICAgYmFzZSA9IGAke3ByZWZpeH0ke2Jhc2V9YDtcbiAgICAgIH1cblxuICAgICAgaWYgKGtleXMubGVuZ3RoID09PSAwIHx8IHJlY3Vyc2VUaW1lcyA+IGN0eC5kZXB0aCAmJiBjdHguZGVwdGggIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKGJhc2UsICdyZWdleHAnKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICAgICAgYmFzZSA9IE51bWJlci5pc05hTihEYXRlUHJvdG90eXBlLmdldFRpbWUuY2FsbCh2YWx1ZSkpID8gRGF0ZVByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA6IERhdGVQcm90b3R5cGUudG9JU09TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gICAgICBjb25zdCBwcmVmaXggPSBnZXRQcmVmaXgoY29uc3RydWN0b3IsIHRhZywgJ0RhdGUnKTtcblxuICAgICAgaWYgKHByZWZpeCAhPT0gJ0RhdGUgJykge1xuICAgICAgICBiYXNlID0gYCR7cHJlZml4fSR7YmFzZX1gO1xuICAgICAgfVxuXG4gICAgICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKGJhc2UsICdkYXRlJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgYmFzZSA9IGZvcm1hdEVycm9yKHZhbHVlLCBjb25zdHJ1Y3RvciwgdGFnLCBjdHgpO1xuXG4gICAgICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGJhc2U7XG4gICAgICB9IGVsc2UgaWYgKGlzSW9zKSB7XG4gICAgICAgIGNvbnN0IG5hdGl2ZUVycm9yUHJvcHMgPSBbJ2xpbmUnLCAnY29sdW1uJywgJ3NvdXJjZVVSTCddO1xuXG4gICAgICAgIGlmIChrZXlzLmV2ZXJ5KGtleSA9PiBuYXRpdmVFcnJvclByb3BzLmluY2x1ZGVzKGtleSkpKSB7XG4gICAgICAgICAgcmV0dXJuIGJhc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzQW55QXJyYXlCdWZmZXIodmFsdWUpKSB7XG4gICAgICAvLyBGYXN0IHBhdGggZm9yIEFycmF5QnVmZmVyIGFuZCBTaGFyZWRBcnJheUJ1ZmZlci5cbiAgICAgIC8vIENhbid0IGRvIHRoZSBzYW1lIGZvciBEYXRhVmlldyBiZWNhdXNlIGl0IGhhcyBhIG5vbi1wcmltaXRpdmVcbiAgICAgIC8vIC5idWZmZXIgcHJvcGVydHkgdGhhdCB3ZSBuZWVkIHRvIHJlY3Vyc2UgZm9yLlxuICAgICAgY29uc3QgYXJyYXlUeXBlID0gaXNBcnJheUJ1ZmZlcih2YWx1ZSkgPyAnQXJyYXlCdWZmZXInIDogJ1NoYXJlZEFycmF5QnVmZmVyJztcbiAgICAgIGNvbnN0IHByZWZpeCA9IGdldFByZWZpeChjb25zdHJ1Y3RvciwgdGFnLCBhcnJheVR5cGUpO1xuXG4gICAgICBpZiAodHlwZWRBcnJheSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZvcm1hdHRlciA9IGZvcm1hdEFycmF5QnVmZmVyO1xuICAgICAgfSBlbHNlIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gYCR7cHJlZml4fXsgYnl0ZUxlbmd0aDogJHtmb3JtYXROdW1iZXIoY3R4LnN0eWxpemUsIHZhbHVlLmJ5dGVMZW5ndGgpfSB9YDtcbiAgICAgIH1cblxuICAgICAgYnJhY2VzWzBdID0gYCR7cHJlZml4fXtgO1xuICAgICAga2V5cy51bnNoaWZ0KCdieXRlTGVuZ3RoJyk7XG4gICAgfSBlbHNlIGlmIChpc0RhdGFWaWV3KHZhbHVlKSkge1xuICAgICAgYnJhY2VzWzBdID0gYCR7Z2V0UHJlZml4KGNvbnN0cnVjdG9yLCB0YWcsICdEYXRhVmlldycpfXtgOyAvLyAuYnVmZmVyIGdvZXMgbGFzdCwgaXQncyBub3QgYSBwcmltaXRpdmUgbGlrZSB0aGUgb3RoZXJzLlxuXG4gICAgICBrZXlzLnVuc2hpZnQoJ2J5dGVMZW5ndGgnLCAnYnl0ZU9mZnNldCcsICdidWZmZXInKTtcbiAgICB9IGVsc2UgaWYgKGlzUHJvbWlzZSh2YWx1ZSkpIHtcbiAgICAgIGJyYWNlc1swXSA9IGAke2dldFByZWZpeChjb25zdHJ1Y3RvciwgdGFnLCAnUHJvbWlzZScpfXtgO1xuICAgICAgZm9ybWF0dGVyID0gZm9ybWF0UHJvbWlzZTtcbiAgICB9IGVsc2UgaWYgKGlzV2Vha1NldCh2YWx1ZSkpIHtcbiAgICAgIGJyYWNlc1swXSA9IGAke2dldFByZWZpeChjb25zdHJ1Y3RvciwgdGFnLCAnV2Vha1NldCcpfXtgO1xuICAgICAgZm9ybWF0dGVyID0gY3R4LnNob3dIaWRkZW4gPyBmb3JtYXRXZWFrU2V0IDogZm9ybWF0V2Vha0NvbGxlY3Rpb247XG4gICAgfSBlbHNlIGlmIChpc1dlYWtNYXAodmFsdWUpKSB7XG4gICAgICBicmFjZXNbMF0gPSBgJHtnZXRQcmVmaXgoY29uc3RydWN0b3IsIHRhZywgJ1dlYWtNYXAnKX17YDtcbiAgICAgIGZvcm1hdHRlciA9IGN0eC5zaG93SGlkZGVuID8gZm9ybWF0V2Vha01hcCA6IGZvcm1hdFdlYWtDb2xsZWN0aW9uO1xuICAgICAgLypcbiAgICAgICAqIEBmaXhtZSBob3cgdG8gZG8gaXNNb2R1bGVOYW1lc3BhY2VPYmplY3Q/XG4gICAgICB9IGVsc2UgaWYgKGlzTW9kdWxlTmFtZXNwYWNlT2JqZWN0KHZhbHVlKSkge1xuICAgICAgXHRicmFjZXNbMF0gPSBgWyR7dGFnfV0ge2A7XG4gICAgICBcdGZvcm1hdHRlciA9IGZvcm1hdE5hbWVzcGFjZU9iamVjdDtcbiAgICAgICovXG4gICAgfSBlbHNlIGlmIChpc0JveGVkUHJpbWl0aXZlKHZhbHVlKSkge1xuICAgICAgYmFzZSA9IGdldEJveGVkQmFzZSh2YWx1ZSwgY3R4LCBrZXlzLCBjb25zdHJ1Y3RvciwgdGFnKTtcblxuICAgICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBiYXNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgaW5wdXQgcHJvdG90eXBlIGdvdCBtYW5pcHVsYXRlZC4gU3BlY2lhbCBoYW5kbGUgdGhlc2UuIFdlIGhhdmUgdG9cbiAgICAgIC8vIHJlYnVpbGQgdGhlIGluZm9ybWF0aW9uIHNvIHdlIGFyZSBhYmxlIHRvIGRpc3BsYXkgZXZlcnl0aGluZy5cbiAgICAgIGlmIChjb25zdHJ1Y3RvciA9PT0gbnVsbCkge1xuICAgICAgICBjb25zdCBzcGVjaWFsSXRlcmF0b3IgPSBub1Byb3RvdHlwZUl0ZXJhdG9yKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcyk7XG5cbiAgICAgICAgaWYgKHNwZWNpYWxJdGVyYXRvcikge1xuICAgICAgICAgIHJldHVybiBzcGVjaWFsSXRlcmF0b3I7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGlzTWFwSXRlcmF0b3IodmFsdWUpKSB7XG4gICAgICAgIGJyYWNlcyA9IGdldEl0ZXJhdG9yQnJhY2VzKCdNYXAnLCB0YWcpO1xuICAgICAgICBmb3JtYXR0ZXIgPSBmb3JtYXRJdGVyYXRvcjtcbiAgICAgIH0gZWxzZSBpZiAoaXNTZXRJdGVyYXRvcih2YWx1ZSkpIHtcbiAgICAgICAgYnJhY2VzID0gZ2V0SXRlcmF0b3JCcmFjZXMoJ1NldCcsIHRhZyk7XG4gICAgICAgIGZvcm1hdHRlciA9IGZvcm1hdEl0ZXJhdG9yOyAvLyBIYW5kbGUgb3RoZXIgcmVndWxhciBvYmplY3RzIGFnYWluLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGAke2dldEN0eFN0eWxlKHZhbHVlLCBjb25zdHJ1Y3RvciwgdGFnKX17fWA7XG4gICAgICAgIH1cblxuICAgICAgICBicmFjZXNbMF0gPSBgJHtnZXRDdHhTdHlsZSh2YWx1ZSwgY29uc3RydWN0b3IsIHRhZyl9e2A7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA+IGN0eC5kZXB0aCAmJiBjdHguZGVwdGggIT09IG51bGwpIHtcbiAgICBsZXQgY29uc3RydWN0b3JOYW1lID0gZ2V0Q3R4U3R5bGUodmFsdWUsIGNvbnN0cnVjdG9yLCB0YWcpLnNsaWNlKDAsIC0xKTtcblxuICAgIGlmIChjb25zdHJ1Y3RvciAhPT0gbnVsbCkge1xuICAgICAgY29uc3RydWN0b3JOYW1lID0gYFske2NvbnN0cnVjdG9yTmFtZX1dYDtcbiAgICB9XG5cbiAgICByZXR1cm4gY3R4LnN0eWxpemUoY29uc3RydWN0b3JOYW1lLCAnc3BlY2lhbCcpO1xuICB9XG5cbiAgcmVjdXJzZVRpbWVzICs9IDE7XG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuICBjdHguY3VycmVudERlcHRoID0gcmVjdXJzZVRpbWVzO1xuICBsZXQgb3V0cHV0O1xuICBjb25zdCBpbmRlbnRhdGlvbkx2bCA9IGN0eC5pbmRlbnRhdGlvbkx2bDtcblxuICB0cnkge1xuICAgIG91dHB1dCA9IGZvcm1hdHRlcihjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIGtleXMsIGJyYWNlcyk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCBrZXlzW2ldLCBleHRyYXNUeXBlKSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zdCBjb25zdHJ1Y3Rvck5hbWUgPSBnZXRDdHhTdHlsZSh2YWx1ZSwgY29uc3RydWN0b3IsIHRhZykuc2xpY2UoMCwgLTEpO1xuICAgIHJldHVybiBoYW5kbGVNYXhDYWxsU3RhY2tTaXplKGN0eCwgZXJyLCBjb25zdHJ1Y3Rvck5hbWUsIGluZGVudGF0aW9uTHZsKTtcbiAgfVxuXG4gIGlmIChjdHguY2lyY3VsYXIgIT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IGluZGV4ID0gY3R4LmNpcmN1bGFyLmdldCh2YWx1ZSk7XG5cbiAgICBpZiAoaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgcmVmZXJlbmNlID0gY3R4LnN0eWxpemUoYDxyZWYgKiR7aW5kZXh9PmAsICdzcGVjaWFsJyk7IC8vIEFkZCByZWZlcmVuY2UgYWx3YXlzIHRvIHRoZSB2ZXJ5IGJlZ2lubmluZyBvZiB0aGUgb3V0cHV0LlxuXG4gICAgICBpZiAoY3R4LmNvbXBhY3QgIT09IHRydWUpIHtcbiAgICAgICAgYmFzZSA9IGJhc2UgPT09ICcnID8gcmVmZXJlbmNlIDogYCR7cmVmZXJlbmNlfSAke2Jhc2V9YDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyYWNlc1swXSA9IGAke3JlZmVyZW5jZX0gJHticmFjZXNbMF19YDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICBpZiAoY3R4LnNvcnRlZCkge1xuICAgIGNvbnN0IGNvbXBhcmF0b3IgPSBjdHguc29ydGVkID09PSB0cnVlID8gdW5kZWZpbmVkIDogY3R4LnNvcnRlZDtcblxuICAgIGlmIChleHRyYXNUeXBlID09PSBrT2JqZWN0VHlwZSkge1xuICAgICAgb3V0cHV0ID0gb3V0cHV0LnNvcnQoY29tcGFyYXRvcik7XG4gICAgfSBlbHNlIGlmIChrZXlzLmxlbmd0aCA+IDEpIHtcbiAgICAgIGNvbnN0IHNvcnRlZCA9IG91dHB1dC5zbGljZShvdXRwdXQubGVuZ3RoIC0ga2V5cy5sZW5ndGgpLnNvcnQoY29tcGFyYXRvcik7XG4gICAgICBvdXRwdXQuc3BsaWNlKG91dHB1dC5sZW5ndGggLSBrZXlzLmxlbmd0aCwga2V5cy5sZW5ndGgsIC4uLnNvcnRlZCk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcmVzID0gcmVkdWNlVG9TaW5nbGVTdHJpbmcoY3R4LCBvdXRwdXQsIGJhc2UsIGJyYWNlcywgZXh0cmFzVHlwZSwgcmVjdXJzZVRpbWVzLCB2YWx1ZSk7XG4gIGNvbnN0IGJ1ZGdldCA9IGN0eC5idWRnZXRbY3R4LmluZGVudGF0aW9uTHZsXSB8fCAwO1xuICBjb25zdCBuZXdMZW5ndGggPSBidWRnZXQgKyByZXMubGVuZ3RoO1xuICBjdHguYnVkZ2V0W2N0eC5pbmRlbnRhdGlvbkx2bF0gPSBuZXdMZW5ndGg7IC8vIElmIGFueSBpbmRlbnRhdGlvbkx2bCBleGNlZWRzIHRoaXMgbGltaXQsIGxpbWl0IGZ1cnRoZXIgaW5zcGVjdGluZyB0byB0aGVcbiAgLy8gbWluaW11bS4gT3RoZXJ3aXNlIHRoZSByZWN1cnNpdmUgYWxnb3JpdGhtIG1pZ2h0IGNvbnRpbnVlIGluc3BlY3RpbmcgdGhlXG4gIC8vIG9iamVjdCBldmVuIHRob3VnaCB0aGUgbWF4aW11bSBzdHJpbmcgc2l6ZSAofjIgKiogMjggb24gMzIgYml0IHN5c3RlbXMgYW5kXG4gIC8vIH4yICoqIDMwIG9uIDY0IGJpdCBzeXN0ZW1zKSBleGNlZWRlZC4gVGhlIGFjdHVhbCBvdXRwdXQgaXMgbm90IGxpbWl0ZWQgYXRcbiAgLy8gZXhhY3RseSAyICoqIDI3IGJ1dCBhIGJpdCBoaWdoZXIuIFRoaXMgZGVwZW5kcyBvbiB0aGUgb2JqZWN0IHNoYXBlLlxuICAvLyBUaGlzIGxpbWl0IGFsc28gbWFrZXMgc3VyZSB0aGF0IGh1Z2Ugb2JqZWN0cyBkb24ndCBibG9jayB0aGUgZXZlbnQgbG9vcFxuICAvLyBzaWduaWZpY2FudGx5LlxuXG4gIGlmIChuZXdMZW5ndGggPiAyICoqIDI3KSB7XG4gICAgY3R4LmRlcHRoID0gLTE7XG4gIH1cblxuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBnZXRJdGVyYXRvckJyYWNlcyh0eXBlLCB0YWcpIHtcbiAgaWYgKHRhZyAhPT0gYCR7dHlwZX0gSXRlcmF0b3JgKSB7XG4gICAgaWYgKHRhZyAhPT0gJycpIHtcbiAgICAgIHRhZyArPSAnXSBbJztcbiAgICB9XG5cbiAgICB0YWcgKz0gYCR7dHlwZX0gSXRlcmF0b3JgO1xuICB9XG5cbiAgcmV0dXJuIFtgWyR7dGFnfV0ge2AsICd9J107XG59XG5cbmZ1bmN0aW9uIGdldEJveGVkQmFzZSh2YWx1ZSwgY3R4LCBrZXlzLCBjb25zdHJ1Y3RvciwgdGFnKSB7XG4gIGxldCBmbjtcbiAgbGV0IHR5cGU7XG5cbiAgaWYgKGlzTnVtYmVyT2JqZWN0KHZhbHVlKSkge1xuICAgIGZuID0gTnVtYmVyUHJvdG90eXBlO1xuICAgIHR5cGUgPSAnTnVtYmVyJztcbiAgfSBlbHNlIGlmIChpc1N0cmluZ09iamVjdCh2YWx1ZSkpIHtcbiAgICBmbiA9IFN0cmluZ1Byb3RvdHlwZTtcbiAgICB0eXBlID0gJ1N0cmluZyc7IC8vIEZvciBib3hlZCBTdHJpbmdzLCB3ZSBoYXZlIHRvIHJlbW92ZSB0aGUgMC1uIGluZGV4ZWQgZW50cmllcyxcbiAgICAvLyBzaW5jZSB0aGV5IGp1c3Qgbm9pc3kgdXAgdGhlIG91dHB1dCBhbmQgYXJlIHJlZHVuZGFudFxuICAgIC8vIE1ha2UgYm94ZWQgcHJpbWl0aXZlIFN0cmluZ3MgbG9vayBsaWtlIHN1Y2hcblxuICAgIGtleXMuc3BsaWNlKDAsIHZhbHVlLmxlbmd0aCk7XG4gIH0gZWxzZSBpZiAoaXNCb29sZWFuT2JqZWN0KHZhbHVlKSkge1xuICAgIGZuID0gQm9vbGVhblByb3RvdHlwZTtcbiAgICB0eXBlID0gJ0Jvb2xlYW4nO1xuICB9IGVsc2Uge1xuICAgIGZuID0gU3ltYm9sUHJvdG90eXBlO1xuICAgIHR5cGUgPSAnU3ltYm9sJztcbiAgfVxuXG4gIGxldCBiYXNlID0gYFske3R5cGV9YDtcblxuICBpZiAodHlwZSAhPT0gY29uc3RydWN0b3IpIHtcbiAgICBpZiAoY29uc3RydWN0b3IgPT09IG51bGwpIHtcbiAgICAgIGJhc2UgKz0gJyAobnVsbCBwcm90b3R5cGUpJztcbiAgICB9IGVsc2Uge1xuICAgICAgYmFzZSArPSBgICgke2NvbnN0cnVjdG9yfSlgO1xuICAgIH1cbiAgfVxuXG4gIGJhc2UgKz0gYDogJHtmb3JtYXRQcmltaXRpdmUoc3R5bGl6ZU5vQ29sb3IsIGZuLnZhbHVlT2YodmFsdWUpLCBjdHgpfV1gO1xuXG4gIGlmICh0YWcgIT09ICcnICYmIHRhZyAhPT0gY29uc3RydWN0b3IpIHtcbiAgICBiYXNlICs9IGAgWyR7dGFnfV1gO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoICE9PSAwIHx8IGN0eC5zdHlsaXplID09PSBzdHlsaXplTm9Db2xvcikge1xuICAgIHJldHVybiBiYXNlO1xuICB9XG5cbiAgcmV0dXJuIGN0eC5zdHlsaXplKGJhc2UsIHR5cGUudG9Mb3dlckNhc2UoKSk7XG59XG5cbmZ1bmN0aW9uIGdldEZ1bmN0aW9uQmFzZSh2YWx1ZSwgY29uc3RydWN0b3IsIHRhZykge1xuICBsZXQgdHlwZSA9ICdGdW5jdGlvbic7XG5cbiAgaWYgKGlzR2VuZXJhdG9yRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdHlwZSA9IGBHZW5lcmF0b3Ike3R5cGV9YDtcbiAgfVxuXG4gIGlmIChpc0FzeW5jRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdHlwZSA9IGBBc3luYyR7dHlwZX1gO1xuICB9XG5cbiAgbGV0IGJhc2UgPSBgWyR7dHlwZX1gO1xuXG4gIGlmIChjb25zdHJ1Y3RvciA9PT0gbnVsbCkge1xuICAgIGJhc2UgKz0gJyAobnVsbCBwcm90b3R5cGUpJztcbiAgfVxuXG4gIGlmICh2YWx1ZS5uYW1lID09PSAnJykge1xuICAgIGJhc2UgKz0gJyAoYW5vbnltb3VzKSc7XG4gIH0gZWxzZSB7XG4gICAgYmFzZSArPSBgOiAke3ZhbHVlLm5hbWV9YDtcbiAgfVxuXG4gIGJhc2UgKz0gJ10nO1xuXG4gIGlmIChjb25zdHJ1Y3RvciAhPT0gdHlwZSAmJiBjb25zdHJ1Y3RvciAhPT0gbnVsbCkge1xuICAgIGJhc2UgKz0gYCAke2NvbnN0cnVjdG9yfWA7XG4gIH1cblxuICBpZiAodGFnICE9PSAnJyAmJiBjb25zdHJ1Y3RvciAhPT0gdGFnKSB7XG4gICAgYmFzZSArPSBgIFske3RhZ31dYDtcbiAgfVxuXG4gIHJldHVybiBiYXNlO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcihlcnIsIGNvbnN0cnVjdG9yLCB0YWcsIGN0eCkge1xuICBsZXQgc3RhY2sgPSBlcnIuc3RhY2sgfHwgRXJyb3JQcm90b3R5cGUudG9TdHJpbmcuY2FsbChlcnIpOyAvLyB0cnkgdG8gbm9ybWFsaXplIEphdmFTY3JpcHRDb3JlIHN0YWNrIHRvIG1hdGNoIHY4XG5cbiAgaWYgKGlzSW9zKSB7XG4gICAgY29uc3QgbGluZXMgPSBzdGFjay5zcGxpdCgnXFxuJyk7XG4gICAgc3RhY2sgPSBgJHtlcnIubmFtZX06ICR7ZXJyLm1lc3NhZ2V9YDtcblxuICAgIGlmIChsaW5lcy5sZW5ndGggPiAwKSB7XG4gICAgICBzdGFjayArPSBsaW5lcy5tYXAoc3RhY2tMaW5lID0+IHtcbiAgICAgICAgY29uc3QgYXRTeW1ib2xJbmRleCA9IHN0YWNrTGluZS5pbmRleE9mKCdAJyk7XG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IHN0YWNrTGluZS5zbGljZShhdFN5bWJvbEluZGV4ICsgMSk7XG4gICAgICAgIGNvbnN0IHNvdXJjZVBhdHRlcm4gPSAvKC4qKTooXFxkKyk6KFxcZCspLztcbiAgICAgICAgbGV0IHN5bWJvbE5hbWUgPSAndW5rbm93bic7XG5cbiAgICAgICAgaWYgKGF0U3ltYm9sSW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgc3ltYm9sTmFtZSA9IHN0YWNrTGluZS5zbGljZSgwLCBhdFN5bWJvbEluZGV4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNvdXJjZU1hdGNoID0gc291cmNlLm1hdGNoKHNvdXJjZVBhdHRlcm4pO1xuXG4gICAgICAgIGlmIChzb3VyY2VNYXRjaCkge1xuICAgICAgICAgIGxldCBmaWxlUGF0aCA9IHNvdXJjZU1hdGNoWzFdO1xuICAgICAgICAgIGNvbnN0IGxpbmVOdW1iZXIgPSBzb3VyY2VNYXRjaFsyXTtcbiAgICAgICAgICBjb25zdCBjb2x1bW4gPSBzb3VyY2VNYXRjaFszXTtcblxuICAgICAgICAgIGlmIChmaWxlUGF0aC5zdGFydHNXaXRoKCdmaWxlOicpKSB7XG4gICAgICAgICAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnJlcGxhY2UoYGZpbGU6Ly8ke1RpLkZpbGVzeXN0ZW0ucmVzb3VyY2VzRGlyZWN0b3J5fWAsICcnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gYFxcbiAgICBhdCAke3N5bWJvbE5hbWV9ICgke2ZpbGVQYXRofToke2xpbmVOdW1iZXJ9OiR7Y29sdW1ufSlgO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBgXFxuICAgIGF0ICR7c3ltYm9sTmFtZX0gKCR7c291cmNlfSlgO1xuICAgICAgICB9XG4gICAgICB9KS5qb2luKCcnKTtcbiAgICB9XG4gIH0gLy8gQSBzdGFjayB0cmFjZSBtYXkgY29udGFpbiBhcmJpdHJhcnkgZGF0YS4gT25seSBtYW5pcHVsYXRlIHRoZSBvdXRwdXRcbiAgLy8gZm9yIFwicmVndWxhciBlcnJvcnNcIiAoZXJyb3JzIHRoYXQgXCJsb29rIG5vcm1hbFwiKSBmb3Igbm93LlxuXG5cbiAgY29uc3QgbmFtZSA9IGVyci5uYW1lIHx8ICdFcnJvcic7XG4gIGxldCBsZW4gPSBuYW1lLmxlbmd0aDtcblxuICBpZiAoY29uc3RydWN0b3IgPT09IG51bGwgfHwgbmFtZS5lbmRzV2l0aCgnRXJyb3InKSAmJiBzdGFjay5zdGFydHNXaXRoKG5hbWUpICYmIChzdGFjay5sZW5ndGggPT09IGxlbiB8fCBzdGFja1tsZW5dID09PSAnOicgfHwgc3RhY2tbbGVuXSA9PT0gJ1xcbicpKSB7XG4gICAgbGV0IGZhbGxiYWNrID0gJ0Vycm9yJztcblxuICAgIGlmIChjb25zdHJ1Y3RvciA9PT0gbnVsbCkge1xuICAgICAgY29uc3Qgc3RhcnQgPSBzdGFjay5tYXRjaCgvXihbQS1aXVthLXpfIEEtWjAtOVtcXF0oKS1dKykoPzo6fFxcbiB7NH1hdCkvKSB8fCBzdGFjay5tYXRjaCgvXihbYS16X0EtWjAtOS1dKkVycm9yKSQvKTtcbiAgICAgIGZhbGxiYWNrID0gc3RhcnQgJiYgc3RhcnRbMV0gfHwgJyc7XG4gICAgICBsZW4gPSBmYWxsYmFjay5sZW5ndGg7XG4gICAgICBmYWxsYmFjayA9IGZhbGxiYWNrIHx8ICdFcnJvcic7XG4gICAgfVxuXG4gICAgY29uc3QgcHJlZml4ID0gZ2V0UHJlZml4KGNvbnN0cnVjdG9yLCB0YWcsIGZhbGxiYWNrKS5zbGljZSgwLCAtMSk7XG5cbiAgICBpZiAobmFtZSAhPT0gcHJlZml4KSB7XG4gICAgICBpZiAocHJlZml4LmluY2x1ZGVzKG5hbWUpKSB7XG4gICAgICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgICAgICBzdGFjayA9IGAke3ByZWZpeH06ICR7c3RhY2t9YDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGFjayA9IGAke3ByZWZpeH0ke3N0YWNrLnNsaWNlKGxlbil9YDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhY2sgPSBgJHtwcmVmaXh9IFske25hbWV9XSR7c3RhY2suc2xpY2UobGVuKX1gO1xuICAgICAgfVxuICAgIH1cbiAgfSAvLyBJZ25vcmUgdGhlIGVycm9yIG1lc3NhZ2UgaWYgaXQncyBjb250YWluZWQgaW4gdGhlIHN0YWNrLlxuXG5cbiAgbGV0IHBvcyA9IGVyci5tZXNzYWdlICYmIHN0YWNrLmluZGV4T2YoZXJyLm1lc3NhZ2UpIHx8IC0xO1xuXG4gIGlmIChwb3MgIT09IC0xKSB7XG4gICAgcG9zICs9IGVyci5tZXNzYWdlLmxlbmd0aDtcbiAgfSAvLyBXcmFwIHRoZSBlcnJvciBpbiBicmFja2V0cyBpbiBjYXNlIGl0IGhhcyBubyBzdGFjayB0cmFjZS5cblxuXG4gIGxldCBzdGFja1N0YXJ0ID0gc3RhY2suaW5kZXhPZignXFxuICAgIGF0JywgcG9zKTtcblxuICBpZiAoc3RhY2tTdGFydCA9PT0gLTEpIHtcbiAgICBzdGFjayA9IGBbJHtzdGFja31dYDtcbiAgfSBlbHNlIGlmIChjdHguY29sb3JzKSB7XG4gICAgLy8gSGlnaGxpZ2h0IHVzZXJsYW5kIGNvZGUgYW5kIG5vZGUgbW9kdWxlcy5cbiAgICBsZXQgbmV3U3RhY2sgPSBzdGFjay5zbGljZSgwLCBzdGFja1N0YXJ0KTtcbiAgICBjb25zdCBsaW5lcyA9IHN0YWNrLnNsaWNlKHN0YWNrU3RhcnQgKyAxKS5zcGxpdCgnXFxuJyk7XG5cbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgIC8vIFRoaXMgYWRkcyB1bmRlcnNjb3JlcyB0byBhbGwgbm9kZV9tb2R1bGVzIHRvIHF1aWNrbHkgaWRlbnRpZnkgdGhlbS5cbiAgICAgIGxldCBub2RlTW9kdWxlO1xuICAgICAgbmV3U3RhY2sgKz0gJ1xcbic7XG4gICAgICBsZXQgcG9zID0gMDtcblxuICAgICAgd2hpbGUgKG5vZGVNb2R1bGUgPSBub2RlTW9kdWxlc1JlZ0V4cC5leGVjKGxpbmUpKSB7XG4gICAgICAgIC8vICcvbm9kZV9tb2R1bGVzLycubGVuZ3RoID09PSAxNFxuICAgICAgICBuZXdTdGFjayArPSBsaW5lLnNsaWNlKHBvcywgbm9kZU1vZHVsZS5pbmRleCArIDE0KTtcbiAgICAgICAgbmV3U3RhY2sgKz0gY3R4LnN0eWxpemUobm9kZU1vZHVsZVsxXSwgJ21vZHVsZScpO1xuICAgICAgICBwb3MgPSBub2RlTW9kdWxlLmluZGV4ICsgbm9kZU1vZHVsZVswXS5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIG5ld1N0YWNrICs9IHBvcyA9PT0gMCA/IGxpbmUgOiBsaW5lLnNsaWNlKHBvcyk7XG4gICAgfVxuXG4gICAgc3RhY2sgPSBuZXdTdGFjaztcbiAgfSAvLyBUaGUgbWVzc2FnZSBhbmQgdGhlIHN0YWNrIGhhdmUgdG8gYmUgaW5kZW50ZWQgYXMgd2VsbCFcblxuXG4gIGlmIChjdHguaW5kZW50YXRpb25MdmwgIT09IDApIHtcbiAgICBjb25zdCBpbmRlbnRhdGlvbiA9ICcgJy5yZXBlYXQoY3R4LmluZGVudGF0aW9uTHZsKTtcbiAgICBzdGFjayA9IHN0YWNrLnJlcGxhY2UoL1xcbi9nLCBgXFxuJHtpbmRlbnRhdGlvbn1gKTtcbiAgfVxuXG4gIHJldHVybiBzdGFjaztcbn1cblxuZnVuY3Rpb24gZm9ybWF0UHJvbWlzZShjdHgsIF92YWx1ZSwgX3JlY3Vyc2VUaW1lcykge1xuICAvLyBOb2RlIGNhbGxzIGludG8gbmF0aXZlIHRvIGdldCBwcm9taXNlIGRldGFpbHMgd2hpY2ggd2UgY2FuJ3QgZG9cbiAgcmV0dXJuIFtjdHguc3R5bGl6ZSgnPHVua25vd24+JywgJ3NwZWNpYWwnKV07XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywga2V5LCB0eXBlKSB7XG4gIGxldCBuYW1lLCBzdHI7XG4gIGxldCBleHRyYSA9ICcgJztcbiAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwge1xuICAgIHZhbHVlOiB2YWx1ZVtrZXldLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfTtcblxuICBpZiAoZGVzYy52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgZGlmZiA9IHR5cGUgIT09IGtPYmplY3RUeXBlIHx8IGN0eC5jb21wYWN0ICE9PSB0cnVlID8gMiA6IDM7XG4gICAgY3R4LmluZGVudGF0aW9uTHZsICs9IGRpZmY7XG4gICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMpO1xuXG4gICAgaWYgKGRpZmYgPT09IDMpIHtcbiAgICAgIGNvbnN0IGxlbiA9IGN0eC5jb2xvcnMgPyByZW1vdmVDb2xvcnMoc3RyKS5sZW5ndGggOiBzdHIubGVuZ3RoO1xuXG4gICAgICBpZiAoY3R4LmJyZWFrTGVuZ3RoIDwgbGVuKSB7XG4gICAgICAgIGV4dHJhID0gYFxcbiR7JyAnLnJlcGVhdChjdHguaW5kZW50YXRpb25MdmwpfWA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY3R4LmluZGVudGF0aW9uTHZsIC09IGRpZmY7XG4gIH0gZWxzZSBpZiAoZGVzYy5nZXQgIT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IGxhYmVsID0gZGVzYy5zZXQgIT09IHVuZGVmaW5lZCA/ICdHZXR0ZXIvU2V0dGVyJyA6ICdHZXR0ZXInO1xuICAgIGNvbnN0IHMgPSBjdHguc3R5bGl6ZTtcbiAgICBjb25zdCBzcCA9ICdzcGVjaWFsJztcblxuICAgIGlmIChjdHguZ2V0dGVycyAmJiAoY3R4LmdldHRlcnMgPT09IHRydWUgfHwgY3R4LmdldHRlcnMgPT09ICdnZXQnICYmIGRlc2Muc2V0ID09PSB1bmRlZmluZWQgfHwgY3R4LmdldHRlcnMgPT09ICdzZXQnICYmIGRlc2Muc2V0ICE9PSB1bmRlZmluZWQpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB0bXAgPSB2YWx1ZVtrZXldO1xuICAgICAgICBjdHguaW5kZW50YXRpb25MdmwgKz0gMjtcblxuICAgICAgICBpZiAodG1wID09PSBudWxsKSB7XG4gICAgICAgICAgc3RyID0gYCR7cyhgWyR7bGFiZWx9OmAsIHNwKX0gJHtzKCdudWxsJywgJ251bGwnKX0ke3MoJ10nLCBzcCl9YDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdG1wID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHN0ciA9IGAke3MoYFske2xhYmVsfV1gLCBzcCl9ICR7Zm9ybWF0VmFsdWUoY3R4LCB0bXAsIHJlY3Vyc2VUaW1lcyl9YDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUocywgdG1wLCBjdHgpO1xuICAgICAgICAgIHN0ciA9IGAke3MoYFske2xhYmVsfTpgLCBzcCl9ICR7cHJpbWl0aXZlfSR7cygnXScsIHNwKX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgY3R4LmluZGVudGF0aW9uTHZsIC09IDI7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGA8SW5zcGVjdGlvbiB0aHJldyAoJHtlcnIubWVzc2FnZX0pPmA7XG4gICAgICAgIHN0ciA9IGAke3MoYFske2xhYmVsfTpgLCBzcCl9ICR7bWVzc2FnZX0ke3MoJ10nLCBzcCl9YDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoYFske2xhYmVsfV1gLCBzcCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRlc2Muc2V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICB9IGVsc2Uge1xuICAgIHN0ciA9IGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIH1cblxuICBpZiAodHlwZSA9PT0ga0FycmF5VHlwZSkge1xuICAgIHJldHVybiBzdHI7XG4gIH1cblxuICBpZiAodHlwZW9mIGtleSA9PT0gJ3N5bWJvbCcpIHtcbiAgICBjb25zdCB0bXAgPSBrZXkudG9TdHJpbmcoKS5yZXBsYWNlKHN0ckVzY2FwZVNlcXVlbmNlc1JlcGxhY2VyLCBlc2NhcGVGbik7XG4gICAgbmFtZSA9IGBbJHtjdHguc3R5bGl6ZSh0bXAsICdzeW1ib2wnKX1dYDtcbiAgfSBlbHNlIGlmIChkZXNjLmVudW1lcmFibGUgPT09IGZhbHNlKSB7XG4gICAgbmFtZSA9IGBbJHtrZXkucmVwbGFjZShzdHJFc2NhcGVTZXF1ZW5jZXNSZXBsYWNlciwgZXNjYXBlRm4pfV1gO1xuICB9IGVsc2UgaWYgKGtleVN0clJlZ0V4cC50ZXN0KGtleSkpIHtcbiAgICBuYW1lID0gY3R4LnN0eWxpemUoa2V5LCAnbmFtZScpO1xuICB9IGVsc2Uge1xuICAgIG5hbWUgPSBjdHguc3R5bGl6ZShzdHJFc2NhcGUoa2V5KSwgJ3N0cmluZycpO1xuICB9XG5cbiAgcmV0dXJuIGAke25hbWV9OiR7ZXh0cmF9JHtzdHJ9YDtcbn1cblxuZnVuY3Rpb24gZ3JvdXBBcnJheUVsZW1lbnRzKGN0eCwgb3V0cHV0LCB2YWx1ZSkge1xuICBsZXQgdG90YWxMZW5ndGggPSAwO1xuICBsZXQgbWF4TGVuZ3RoID0gMDtcbiAgbGV0IGkgPSAwO1xuICBsZXQgb3V0cHV0TGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcblxuICBpZiAoY3R4Lm1heEFycmF5TGVuZ3RoIDwgb3V0cHV0Lmxlbmd0aCkge1xuICAgIC8vIFRoaXMgbWFrZXMgc3VyZSB0aGUgXCIuLi4gbiBtb3JlIGl0ZW1zXCIgcGFydCBpcyBub3QgdGFrZW4gaW50byBhY2NvdW50LlxuICAgIG91dHB1dExlbmd0aC0tO1xuICB9XG5cbiAgY29uc3Qgc2VwYXJhdG9yU3BhY2UgPSAyOyAvLyBBZGQgMSBmb3IgdGhlIHNwYWNlIGFuZCAxIGZvciB0aGUgc2VwYXJhdG9yLlxuXG4gIGNvbnN0IGRhdGFMZW4gPSBuZXcgQXJyYXkob3V0cHV0TGVuZ3RoKTsgLy8gQ2FsY3VsYXRlIHRoZSB0b3RhbCBsZW5ndGggb2YgYWxsIG91dHB1dCBlbnRyaWVzIGFuZCB0aGUgaW5kaXZpZHVhbCBtYXhcbiAgLy8gZW50cmllcyBsZW5ndGggb2YgYWxsIG91dHB1dCBlbnRyaWVzLiBXZSBoYXZlIHRvIHJlbW92ZSBjb2xvcnMgZmlyc3QsXG4gIC8vIG90aGVyd2lzZSB0aGUgbGVuZ3RoIHdvdWxkIG5vdCBiZSBjYWxjdWxhdGVkIHByb3Blcmx5LlxuXG4gIGZvciAoOyBpIDwgb3V0cHV0TGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBsZW4gPSBjdHguY29sb3JzID8gcmVtb3ZlQ29sb3JzKG91dHB1dFtpXSkubGVuZ3RoIDogb3V0cHV0W2ldLmxlbmd0aDtcbiAgICBkYXRhTGVuW2ldID0gbGVuO1xuICAgIHRvdGFsTGVuZ3RoICs9IGxlbiArIHNlcGFyYXRvclNwYWNlO1xuXG4gICAgaWYgKG1heExlbmd0aCA8IGxlbikge1xuICAgICAgbWF4TGVuZ3RoID0gbGVuO1xuICAgIH1cbiAgfSAvLyBBZGQgdHdvIHRvIGBtYXhMZW5ndGhgIGFzIHdlIGFkZCBhIHNpbmdsZSB3aGl0ZXNwYWNlIGNoYXJhY3RlciBwbHVzIGEgY29tbWFcbiAgLy8gaW4tYmV0d2VlbiB0d28gZW50cmllcy5cblxuXG4gIGNvbnN0IGFjdHVhbE1heCA9IG1heExlbmd0aCArIHNlcGFyYXRvclNwYWNlOyAvLyBDaGVjayBpZiBhdCBsZWFzdCB0aHJlZSBlbnRyaWVzIGZpdCBuZXh0IHRvIGVhY2ggb3RoZXIgYW5kIHByZXZlbnQgZ3JvdXBpbmdcbiAgLy8gb2YgYXJyYXlzIHRoYXQgY29udGFpbnMgZW50cmllcyBvZiB2ZXJ5IGRpZmZlcmVudCBsZW5ndGggKGkuZS4sIGlmIGEgc2luZ2xlXG4gIC8vIGVudHJ5IGlzIGxvbmdlciB0aGFuIDEvNSBvZiBhbGwgb3RoZXIgZW50cmllcyBjb21iaW5lZCkuIE90aGVyd2lzZSB0aGVcbiAgLy8gc3BhY2UgaW4tYmV0d2VlbiBzbWFsbCBlbnRyaWVzIHdvdWxkIGJlIGVub3Jtb3VzLlxuXG4gIGlmIChhY3R1YWxNYXggKiAzICsgY3R4LmluZGVudGF0aW9uTHZsIDwgY3R4LmJyZWFrTGVuZ3RoICYmICh0b3RhbExlbmd0aCAvIGFjdHVhbE1heCA+IDUgfHwgbWF4TGVuZ3RoIDw9IDYpKSB7XG4gICAgY29uc3QgYXBwcm94Q2hhckhlaWdodHMgPSAyLjU7XG4gICAgY29uc3QgYXZlcmFnZUJpYXMgPSBNYXRoLnNxcnQoYWN0dWFsTWF4IC0gdG90YWxMZW5ndGggLyBvdXRwdXQubGVuZ3RoKTtcbiAgICBjb25zdCBiaWFzZWRNYXggPSBNYXRoLm1heChhY3R1YWxNYXggLSAzIC0gYXZlcmFnZUJpYXMsIDEpOyAvLyBEeW5hbWljYWxseSBjaGVjayBob3cgbWFueSBjb2x1bW5zIHNlZW0gcG9zc2libGUuXG5cbiAgICBjb25zdCBjb2x1bW5zID0gTWF0aC5taW4oIC8vIElkZWFsbHkgYSBzcXVhcmUgc2hvdWxkIGJlIGRyYXduLiBXZSBleHBlY3QgYSBjaGFyYWN0ZXIgdG8gYmUgYWJvdXQgMi41XG4gICAgLy8gdGltZXMgYXMgaGlnaCBhcyB3aWRlLiBUaGlzIGlzIHRoZSBhcmVhIGZvcm11bGEgdG8gY2FsY3VsYXRlIGEgc3F1YXJlXG4gICAgLy8gd2hpY2ggY29udGFpbnMgbiByZWN0YW5nbGVzIG9mIHNpemUgYGFjdHVhbE1heCAqIGFwcHJveENoYXJIZWlnaHRzYC5cbiAgICAvLyBEaXZpZGUgdGhhdCBieSBgYWN0dWFsTWF4YCB0byByZWNlaXZlIHRoZSBjb3JyZWN0IG51bWJlciBvZiBjb2x1bW5zLlxuICAgIC8vIFRoZSBhZGRlZCBiaWFzIGluY3JlYXNlcyB0aGUgY29sdW1ucyBmb3Igc2hvcnQgZW50cmllcy5cbiAgICBNYXRoLnJvdW5kKE1hdGguc3FydChhcHByb3hDaGFySGVpZ2h0cyAqIGJpYXNlZE1heCAqIG91dHB1dExlbmd0aCkgLyBiaWFzZWRNYXgpLCAvLyBEbyBub3QgZXhjZWVkIHRoZSBicmVha0xlbmd0aC5cbiAgICBNYXRoLmZsb29yKChjdHguYnJlYWtMZW5ndGggLSBjdHguaW5kZW50YXRpb25MdmwpIC8gYWN0dWFsTWF4KSwgLy8gTGltaXQgYXJyYXkgZ3JvdXBpbmcgZm9yIHNtYWxsIGBjb21wYWN0YCBtb2RlcyBhcyB0aGUgdXNlciByZXF1ZXN0ZWRcbiAgICAvLyBtaW5pbWFsIGdyb3VwaW5nLlxuICAgIGN0eC5jb21wYWN0ICogNCwgLy8gTGltaXQgdGhlIGNvbHVtbnMgdG8gYSBtYXhpbXVtIG9mIGZpZnRlZW4uXG4gICAgMTUpOyAvLyBSZXR1cm4gd2l0aCB0aGUgb3JpZ2luYWwgb3V0cHV0IGlmIG5vIGdyb3VwaW5nIHNob3VsZCBoYXBwZW4uXG5cbiAgICBpZiAoY29sdW1ucyA8PSAxKSB7XG4gICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cblxuICAgIGNvbnN0IHRtcCA9IFtdO1xuICAgIGNvbnN0IG1heExpbmVMZW5ndGggPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sdW1uczsgaSsrKSB7XG4gICAgICBsZXQgbGluZU1heExlbmd0aCA9IDA7XG5cbiAgICAgIGZvciAobGV0IGogPSBpOyBqIDwgb3V0cHV0Lmxlbmd0aDsgaiArPSBjb2x1bW5zKSB7XG4gICAgICAgIGlmIChkYXRhTGVuW2pdID4gbGluZU1heExlbmd0aCkge1xuICAgICAgICAgIGxpbmVNYXhMZW5ndGggPSBkYXRhTGVuW2pdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpbmVNYXhMZW5ndGggKz0gc2VwYXJhdG9yU3BhY2U7XG4gICAgICBtYXhMaW5lTGVuZ3RoW2ldID0gbGluZU1heExlbmd0aDtcbiAgICB9XG5cbiAgICBsZXQgb3JkZXIgPSAncGFkU3RhcnQnO1xuXG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWVbaV0gIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgb3JkZXIgPSAncGFkRW5kJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gLy8gRWFjaCBpdGVyYXRpb24gY3JlYXRlcyBhIHNpbmdsZSBsaW5lIG9mIGdyb3VwZWQgZW50cmllcy5cblxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRMZW5ndGg7IGkgKz0gY29sdW1ucykge1xuICAgICAgLy8gVGhlIGxhc3QgbGluZXMgbWF5IGNvbnRhaW4gbGVzcyBlbnRyaWVzIHRoYW4gY29sdW1ucy5cbiAgICAgIGNvbnN0IG1heCA9IE1hdGgubWluKGkgKyBjb2x1bW5zLCBvdXRwdXRMZW5ndGgpO1xuICAgICAgbGV0IHN0ciA9ICcnO1xuICAgICAgbGV0IGogPSBpO1xuXG4gICAgICBmb3IgKDsgaiA8IG1heCAtIDE7IGorKykge1xuICAgICAgICAvLyBDYWxjdWxhdGUgZXh0cmEgY29sb3IgcGFkZGluZyBpbiBjYXNlIGl0J3MgYWN0aXZlLiBUaGlzIGhhcyB0byBiZVxuICAgICAgICAvLyBkb25lIGxpbmUgYnkgbGluZSBhcyBzb21lIGxpbmVzIG1pZ2h0IGNvbnRhaW4gbW9yZSBjb2xvcnMgdGhhblxuICAgICAgICAvLyBvdGhlcnMuXG4gICAgICAgIGNvbnN0IHBhZGRpbmcgPSBtYXhMaW5lTGVuZ3RoW2ogLSBpXSArIG91dHB1dFtqXS5sZW5ndGggLSBkYXRhTGVuW2pdO1xuICAgICAgICBzdHIgKz0gYCR7b3V0cHV0W2pdfSwgYFtvcmRlcl0ocGFkZGluZywgJyAnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9yZGVyID09PSAncGFkU3RhcnQnKSB7XG4gICAgICAgIGNvbnN0IHBhZGRpbmcgPSBtYXhMaW5lTGVuZ3RoW2ogLSBpXSArIG91dHB1dFtqXS5sZW5ndGggLSBkYXRhTGVuW2pdIC0gc2VwYXJhdG9yU3BhY2U7XG4gICAgICAgIHN0ciArPSBvdXRwdXRbal0ucGFkU3RhcnQocGFkZGluZywgJyAnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciArPSBvdXRwdXRbal07XG4gICAgICB9XG5cbiAgICAgIHRtcC5wdXNoKHN0cik7XG4gICAgfVxuXG4gICAgaWYgKGN0eC5tYXhBcnJheUxlbmd0aCA8IG91dHB1dC5sZW5ndGgpIHtcbiAgICAgIHRtcC5wdXNoKG91dHB1dFtvdXRwdXRMZW5ndGhdKTtcbiAgICB9XG5cbiAgICBvdXRwdXQgPSB0bXA7XG4gIH1cblxuICByZXR1cm4gb3V0cHV0O1xufVxuXG5mdW5jdGlvbiBoYW5kbGVNYXhDYWxsU3RhY2tTaXplKGN0eCwgZXJyLCBjb25zdHJ1Y3Rvck5hbWUsIGluZGVudGF0aW9uTHZsKSB7XG4gIGlmIChpc1N0YWNrT3ZlcmZsb3dFcnJvcihlcnIpKSB7XG4gICAgY3R4LnNlZW4ucG9wKCk7XG4gICAgY3R4LmluZGVudGF0aW9uTHZsID0gaW5kZW50YXRpb25Mdmw7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKGBbJHtjb25zdHJ1Y3Rvck5hbWV9OiBJbnNwZWN0aW9uIGludGVycnVwdGVkICdwcmVtYXR1cmVseS4gTWF4aW11bSBjYWxsIHN0YWNrIHNpemUgZXhjZWVkZWQuXWAsICdzcGVjaWFsJyk7XG4gIH1cblxuICB0aHJvdyBlcnI7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdE51bWJlcihmbiwgdmFsdWUpIHtcbiAgLy8gRm9ybWF0IC0wIGFzICctMCcuIENoZWNraW5nIGB2YWx1ZSA9PT0gLTBgIHdvbid0IGRpc3Rpbmd1aXNoIDAgZnJvbSAtMC5cbiAgcmV0dXJuIGZuKE9iamVjdC5pcyh2YWx1ZSwgLTApID8gJy0wJyA6IGAke3ZhbHVlfWAsICdudW1iZXInKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0QmlnSW50KGZuLCB2YWx1ZSkge1xuICByZXR1cm4gZm4oYCR7dmFsdWV9bmAsICdiaWdpbnQnKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGZuLCB2YWx1ZSwgY3R4KSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKGN0eC5jb21wYWN0ICE9PSB0cnVlICYmIHZhbHVlLmxlbmd0aCA+IGtNaW5MaW5lTGVuZ3RoICYmIHZhbHVlLmxlbmd0aCA+IGN0eC5icmVha0xlbmd0aCAtIGN0eC5pbmRlbnRhdGlvbkx2bCAtIDQpIHtcbiAgICAgIHJldHVybiB2YWx1ZS5zcGxpdCgvXFxuLykubWFwKGxpbmUgPT4gZm4oc3RyRXNjYXBlKGxpbmUpLCAnc3RyaW5nJykpLmpvaW4oYCArXFxuJHsnICcucmVwZWF0KGN0eC5pbmRlbnRhdGlvbkx2bCArIDIpfWApO1xuICAgIH1cblxuICAgIHJldHVybiBmbihzdHJFc2NhcGUodmFsdWUpLCAnc3RyaW5nJyk7XG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBmb3JtYXROdW1iZXIoZm4sIHZhbHVlKTtcbiAgfVxuICAvKlxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnYmlnaW50Jykge1xuICBcdHJldHVybiBmb3JtYXRCaWdJbnQoZm4sIHZhbHVlKTtcbiAgfVxuICAqL1xuXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgcmV0dXJuIGZuKGAke3ZhbHVlfWAsICdib29sZWFuJyk7XG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBmbigndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICB9IC8vIGVzNiBzeW1ib2wgcHJpbWl0aXZlXG5cblxuICByZXR1cm4gZm4oU3ltYm9sUHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnc3ltYm9sJyk7XG59IC8vIFRoZSBhcnJheSBpcyBzcGFyc2UgYW5kL29yIGhhcyBleHRyYSBrZXlzXG5cblxuZnVuY3Rpb24gZm9ybWF0U3BlY2lhbEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgbWF4TGVuZ3RoLCBvdXRwdXQsIGkpIHtcbiAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgbGV0IGluZGV4ID0gaTtcblxuICBmb3IgKDsgaSA8IGtleXMubGVuZ3RoICYmIG91dHB1dC5sZW5ndGggPCBtYXhMZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGtleSA9IGtleXNbaV07XG4gICAgY29uc3QgdG1wID0gK2tleTsgLy8gQXJyYXlzIGNhbiBvbmx5IGhhdmUgdXAgdG8gMl4zMiAtIDEgZW50cmllc1xuXG4gICAgaWYgKHRtcCA+IDIgKiogMzIgLSAyKSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoYCR7aW5kZXh9YCAhPT0ga2V5KSB7XG4gICAgICBpZiAoIW51bWJlclJlZ0V4cC50ZXN0KGtleSkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGVtcHR5SXRlbXMgPSB0bXAgLSBpbmRleDtcbiAgICAgIGNvbnN0IGVuZGluZyA9IGVtcHR5SXRlbXMgPiAxID8gJ3MnIDogJyc7XG4gICAgICBjb25zdCBtZXNzYWdlID0gYDwke2VtcHR5SXRlbXN9IGVtcHR5IGl0ZW0ke2VuZGluZ30+YDtcbiAgICAgIG91dHB1dC5wdXNoKGN0eC5zdHlsaXplKG1lc3NhZ2UsICd1bmRlZmluZWQnKSk7XG4gICAgICBpbmRleCA9IHRtcDtcblxuICAgICAgaWYgKG91dHB1dC5sZW5ndGggPT09IG1heExlbmd0aCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIGtleSwga0FycmF5VHlwZSkpO1xuICAgIGluZGV4Kys7XG4gIH1cblxuICBjb25zdCByZW1haW5pbmcgPSB2YWx1ZS5sZW5ndGggLSBpbmRleDtcblxuICBpZiAob3V0cHV0Lmxlbmd0aCAhPT0gbWF4TGVuZ3RoKSB7XG4gICAgaWYgKHJlbWFpbmluZyA+IDApIHtcbiAgICAgIGNvbnN0IGVuZGluZyA9IHJlbWFpbmluZyA+IDEgPyAncycgOiAnJztcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgPCR7cmVtYWluaW5nfSBlbXB0eSBpdGVtJHtlbmRpbmd9PmA7XG4gICAgICBvdXRwdXQucHVzaChjdHguc3R5bGl6ZShtZXNzYWdlLCAndW5kZWZpbmVkJykpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChyZW1haW5pbmcgPiAwKSB7XG4gICAgb3V0cHV0LnB1c2goYC4uLiAke3JlbWFpbmluZ30gbW9yZSBpdGVtJHtyZW1haW5pbmcgPiAxID8gJ3MnIDogJyd9YCk7XG4gIH1cblxuICByZXR1cm4gb3V0cHV0O1xufVxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheUJ1ZmZlcihjdHgsIHZhbHVlKSB7XG4gIGNvbnN0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KHZhbHVlKTtcbiAgLypcbiAgLy8gQGZpeG1lIHJvbGx1cCBjYW5ub3QgaGFuZGxlIGxhenkgbG9hZGVkIG1vZHVsZXMsIG1heWJlIG1vdmUgdG8gd2VicGFjaz9cbiAgaWYgKGhleFNsaWNlID09PSB1bmRlZmluZWQpIHtcbiAgXHRoZXhTbGljZSA9IHVuY3VycnlUaGlzKHJlcXVpcmUoJy4uLy4uL2J1ZmZlcicpLmRlZmF1bHQuQnVmZmVyLnByb3RvdHlwZS5oZXhTbGljZSk7XG4gIH1cbiAgKi9cblxuICBsZXQgc3RyID0gaGV4U2xpY2UoYnVmZmVyLCAwLCBNYXRoLm1pbihjdHgubWF4QXJyYXlMZW5ndGgsIGJ1ZmZlci5sZW5ndGgpKS5yZXBsYWNlKC8oLnsyfSkvZywgJyQxICcpLnRyaW0oKTtcbiAgY29uc3QgcmVtYWluaW5nID0gYnVmZmVyLmxlbmd0aCAtIGN0eC5tYXhBcnJheUxlbmd0aDtcblxuICBpZiAocmVtYWluaW5nID4gMCkge1xuICAgIHN0ciArPSBgIC4uLiAke3JlbWFpbmluZ30gbW9yZSBieXRlJHtyZW1haW5pbmcgPiAxID8gJ3MnIDogJyd9YDtcbiAgfVxuXG4gIHJldHVybiBbYCR7Y3R4LnN0eWxpemUoJ1tVaW50OENvbnRlbnRzXScsICdzcGVjaWFsJyl9OiA8JHtzdHJ9PmBdO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgY29uc3QgdmFsTGVuID0gdmFsdWUubGVuZ3RoO1xuICBjb25zdCBsZW4gPSBNYXRoLm1pbihNYXRoLm1heCgwLCBjdHgubWF4QXJyYXlMZW5ndGgpLCB2YWxMZW4pO1xuICBjb25zdCByZW1haW5pbmcgPSB2YWxMZW4gLSBsZW47XG4gIGNvbnN0IG91dHB1dCA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAvLyBTcGVjaWFsIGhhbmRsZSBzcGFyc2UgYXJyYXlzLlxuICAgIGlmICghaGFzT3duUHJvcGVydHkodmFsdWUsIGkpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0U3BlY2lhbEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgbGVuLCBvdXRwdXQsIGkpO1xuICAgIH1cblxuICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgaSwga0FycmF5VHlwZSkpO1xuICB9XG5cbiAgaWYgKHJlbWFpbmluZyA+IDApIHtcbiAgICBvdXRwdXQucHVzaChgLi4uICR7cmVtYWluaW5nfSBtb3JlIGl0ZW0ke3JlbWFpbmluZyA+IDEgPyAncycgOiAnJ31gKTtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFR5cGVkQXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIGNvbnN0IG1heExlbmd0aCA9IE1hdGgubWluKE1hdGgubWF4KDAsIGN0eC5tYXhBcnJheUxlbmd0aCksIHZhbHVlLmxlbmd0aCk7XG4gIGNvbnN0IHJlbWFpbmluZyA9IHZhbHVlLmxlbmd0aCAtIG1heExlbmd0aDtcbiAgY29uc3Qgb3V0cHV0ID0gbmV3IEFycmF5KG1heExlbmd0aCk7XG4gIGNvbnN0IGVsZW1lbnRGb3JtYXR0ZXIgPSB2YWx1ZS5sZW5ndGggPiAwICYmIHR5cGVvZiB2YWx1ZVswXSA9PT0gJ251bWJlcicgPyBmb3JtYXROdW1iZXIgOiBmb3JtYXRCaWdJbnQ7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtYXhMZW5ndGg7ICsraSkge1xuICAgIG91dHB1dFtpXSA9IGVsZW1lbnRGb3JtYXR0ZXIoY3R4LnN0eWxpemUsIHZhbHVlW2ldKTtcbiAgfVxuXG4gIGlmIChyZW1haW5pbmcgPiAwKSB7XG4gICAgb3V0cHV0W21heExlbmd0aF0gPSBgLi4uICR7cmVtYWluaW5nfSBtb3JlIGl0ZW0ke3JlbWFpbmluZyA+IDEgPyAncycgOiAnJ31gO1xuICB9XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAgLy8gLmJ1ZmZlciBnb2VzIGxhc3QsIGl0J3Mgbm90IGEgcHJpbWl0aXZlIGxpa2UgdGhlIG90aGVycy5cbiAgICBjdHguaW5kZW50YXRpb25MdmwgKz0gMjtcblxuICAgIGZvciAoY29uc3Qga2V5IG9mIFsnQllURVNfUEVSX0VMRU1FTlQnLCAnbGVuZ3RoJywgJ2J5dGVMZW5ndGgnLCAnYnl0ZU9mZnNldCcsICdidWZmZXInXSkge1xuICAgICAgY29uc3Qgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZVtrZXldLCByZWN1cnNlVGltZXMsIHRydWUpO1xuICAgICAgb3V0cHV0LnB1c2goYFske2tleX1dOiAke3N0cn1gKTtcbiAgICB9XG5cbiAgICBjdHguaW5kZW50YXRpb25MdmwgLT0gMjtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFNldChjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgY29uc3Qgb3V0cHV0ID0gW107XG4gIGN0eC5pbmRlbnRhdGlvbkx2bCArPSAyO1xuXG4gIGZvciAoY29uc3QgdiBvZiB2YWx1ZSkge1xuICAgIG91dHB1dC5wdXNoKGZvcm1hdFZhbHVlKGN0eCwgdiwgcmVjdXJzZVRpbWVzKSk7XG4gIH1cblxuICBjdHguaW5kZW50YXRpb25MdmwgLT0gMjsgLy8gV2l0aCBgc2hvd0hpZGRlbmAsIGBsZW5ndGhgIHdpbGwgZGlzcGxheSBhcyBhIGhpZGRlbiBwcm9wZXJ0eSBmb3JcbiAgLy8gYXJyYXlzLiBGb3IgY29uc2lzdGVuY3kncyBzYWtlLCBkbyB0aGUgc2FtZSBmb3IgYHNpemVgLCBldmVuIHRob3VnaCB0aGlzXG4gIC8vIHByb3BlcnR5IGlzbid0IHNlbGVjdGVkIGJ5IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKCkuXG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAgb3V0cHV0LnB1c2goYFtzaXplXTogJHtjdHguc3R5bGl6ZShgJHt2YWx1ZS5zaXplfWAsICdudW1iZXInKX1gKTtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdE1hcChjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgY29uc3Qgb3V0cHV0ID0gW107XG4gIGN0eC5pbmRlbnRhdGlvbkx2bCArPSAyO1xuXG4gIGZvciAoY29uc3QgW2ssIHZdIG9mIHZhbHVlKSB7XG4gICAgb3V0cHV0LnB1c2goYCR7Zm9ybWF0VmFsdWUoY3R4LCBrLCByZWN1cnNlVGltZXMpfSA9PiAke2Zvcm1hdFZhbHVlKGN0eCwgdiwgcmVjdXJzZVRpbWVzKX1gKTtcbiAgfVxuXG4gIGN0eC5pbmRlbnRhdGlvbkx2bCAtPSAyOyAvLyBTZWUgY29tbWVudCBpbiBmb3JtYXRTZXRcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBvdXRwdXQucHVzaChgW3NpemVdOiAke2N0eC5zdHlsaXplKGAke3ZhbHVlLnNpemV9YCwgJ251bWJlcicpfWApO1xuICB9XG5cbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0U2V0SXRlcklubmVyKGN0eCwgcmVjdXJzZVRpbWVzLCBlbnRyaWVzLCBzdGF0ZSkge1xuICBjb25zdCBtYXhBcnJheUxlbmd0aCA9IE1hdGgubWF4KGN0eC5tYXhBcnJheUxlbmd0aCwgMCk7XG4gIGNvbnN0IG1heExlbmd0aCA9IE1hdGgubWluKG1heEFycmF5TGVuZ3RoLCBlbnRyaWVzLmxlbmd0aCk7XG4gIGxldCBvdXRwdXQgPSBuZXcgQXJyYXkobWF4TGVuZ3RoKTtcbiAgY3R4LmluZGVudGF0aW9uTHZsICs9IDI7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXhMZW5ndGg7IGkrKykge1xuICAgIG91dHB1dFtpXSA9IGZvcm1hdFZhbHVlKGN0eCwgZW50cmllc1tpXSwgcmVjdXJzZVRpbWVzKTtcbiAgfVxuXG4gIGN0eC5pbmRlbnRhdGlvbkx2bCAtPSAyO1xuXG4gIGlmIChzdGF0ZSA9PT0ga1dlYWsgJiYgIWN0eC5zb3J0ZWQpIHtcbiAgICAvLyBTb3J0IGFsbCBlbnRyaWVzIHRvIGhhdmUgYSBoYWxmd2F5IHJlbGlhYmxlIG91dHB1dCAoaWYgbW9yZSBlbnRyaWVzIHRoYW5cbiAgICAvLyByZXRyaWV2ZWQgb25lcyBleGlzdCwgd2UgY2FuIG5vdCByZWxpYWJseSByZXR1cm4gdGhlIHNhbWUgb3V0cHV0KSBpZiB0aGVcbiAgICAvLyBvdXRwdXQgaXMgbm90IHNvcnRlZCBhbnl3YXkuXG4gICAgb3V0cHV0ID0gb3V0cHV0LnNvcnQoKTtcbiAgfVxuXG4gIGNvbnN0IHJlbWFpbmluZyA9IGVudHJpZXMubGVuZ3RoIC0gbWF4TGVuZ3RoO1xuXG4gIGlmIChyZW1haW5pbmcgPiAwKSB7XG4gICAgb3V0cHV0LnB1c2goYC4uLiAke3JlbWFpbmluZ30gbW9yZSBpdGVtJHtyZW1haW5pbmcgPiAxID8gJ3MnIDogJyd9YCk7XG4gIH1cblxuICByZXR1cm4gb3V0cHV0O1xufVxuXG5mdW5jdGlvbiBmb3JtYXRNYXBJdGVySW5uZXIoY3R4LCByZWN1cnNlVGltZXMsIGVudHJpZXMsIHN0YXRlKSB7XG4gIGNvbnN0IG1heEFycmF5TGVuZ3RoID0gTWF0aC5tYXgoY3R4Lm1heEFycmF5TGVuZ3RoLCAwKTsgLy8gRW50cmllcyBleGlzdCBhcyBba2V5MSwgdmFsMSwga2V5MiwgdmFsMiwgLi4uXVxuXG4gIGNvbnN0IGxlbiA9IGVudHJpZXMubGVuZ3RoIC8gMjtcbiAgY29uc3QgcmVtYWluaW5nID0gbGVuIC0gbWF4QXJyYXlMZW5ndGg7XG4gIGNvbnN0IG1heExlbmd0aCA9IE1hdGgubWluKG1heEFycmF5TGVuZ3RoLCBsZW4pO1xuICBsZXQgb3V0cHV0ID0gbmV3IEFycmF5KG1heExlbmd0aCk7XG4gIGxldCBpID0gMDtcbiAgY3R4LmluZGVudGF0aW9uTHZsICs9IDI7XG5cbiAgaWYgKHN0YXRlID09PSBrV2Vhaykge1xuICAgIGZvciAoOyBpIDwgbWF4TGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHBvcyA9IGkgKiAyO1xuICAgICAgb3V0cHV0W2ldID0gYCR7Zm9ybWF0VmFsdWUoY3R4LCBlbnRyaWVzW3Bvc10sIHJlY3Vyc2VUaW1lcyl9YCArIGAgPT4gJHtmb3JtYXRWYWx1ZShjdHgsIGVudHJpZXNbcG9zICsgMV0sIHJlY3Vyc2VUaW1lcyl9YDtcbiAgICB9IC8vIFNvcnQgYWxsIGVudHJpZXMgdG8gaGF2ZSBhIGhhbGZ3YXkgcmVsaWFibGUgb3V0cHV0IChpZiBtb3JlIGVudHJpZXMgdGhhblxuICAgIC8vIHJldHJpZXZlZCBvbmVzIGV4aXN0LCB3ZSBjYW4gbm90IHJlbGlhYmx5IHJldHVybiB0aGUgc2FtZSBvdXRwdXQpIGlmIHRoZVxuICAgIC8vIG91dHB1dCBpcyBub3Qgc29ydGVkIGFueXdheS5cblxuXG4gICAgaWYgKCFjdHguc29ydGVkKSB7XG4gICAgICBvdXRwdXQgPSBvdXRwdXQuc29ydCgpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBmb3IgKDsgaSA8IG1heExlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBwb3MgPSBpICogMjtcbiAgICAgIGNvbnN0IHJlcyA9IFtmb3JtYXRWYWx1ZShjdHgsIGVudHJpZXNbcG9zXSwgcmVjdXJzZVRpbWVzKSwgZm9ybWF0VmFsdWUoY3R4LCBlbnRyaWVzW3BvcyArIDFdLCByZWN1cnNlVGltZXMpXTtcbiAgICAgIG91dHB1dFtpXSA9IHJlZHVjZVRvU2luZ2xlU3RyaW5nKGN0eCwgcmVzLCAnJywgWydbJywgJ10nXSwga0FycmF5RXh0cmFzVHlwZSwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gIH1cblxuICBjdHguaW5kZW50YXRpb25MdmwgLT0gMjtcblxuICBpZiAocmVtYWluaW5nID4gMCkge1xuICAgIG91dHB1dC5wdXNoKGAuLi4gJHtyZW1haW5pbmd9IG1vcmUgaXRlbSR7cmVtYWluaW5nID4gMSA/ICdzJyA6ICcnfWApO1xuICB9XG5cbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vha0NvbGxlY3Rpb24oY3R4KSB7XG4gIHJldHVybiBbY3R4LnN0eWxpemUoJzxpdGVtcyB1bmtub3duPicsICdzcGVjaWFsJyldO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRXZWFrU2V0KGN0eCwgX3ZhbHVlLCBfcmVjdXJzZVRpbWVzKSB7XG4gIC8vIE5vZGUgY2FsbHMgaW50byBuYXRpdmUgdG8gZ2V0IGEgcHJldmlldyBvZiBhY3R1YWwgdmFsdWVzIHdoaWNoIHdlIGNhbid0IGRvXG4gIHJldHVybiBmb3JtYXRXZWFrQ29sbGVjdGlvbihjdHgpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRXZWFrTWFwKGN0eCwgX3ZhbHVlLCBfcmVjdXJzZVRpbWVzKSB7XG4gIC8vIE5vZGUgY2FsbHMgaW50byBuYXRpdmUgdG8gZ2V0IGEgcHJldmlldyBvZiBhY3R1YWwgdmFsdWVzIHdoaWNoIHdlIGNhbid0IGRvXG4gIHJldHVybiBmb3JtYXRXZWFrQ29sbGVjdGlvbihjdHgpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRJdGVyYXRvcihjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIF9rZXlzLCBicmFjZXMpIHtcbiAgY29uc3QgZW50cmllcyA9IFtdO1xuICBsZXQgaXNLZXlWYWx1ZSA9IGZhbHNlO1xuICBsZXQgcmVzdWx0ID0gdmFsdWUubmV4dCgpO1xuXG4gIHdoaWxlICghcmVzdWx0LmRvbmUpIHtcbiAgICBjb25zdCBjdXJyZW50RW50cnkgPSByZXN1bHQudmFsdWU7XG4gICAgZW50cmllcy5wdXNoKGN1cnJlbnRFbnRyeSk7XG5cbiAgICBpZiAoY3VycmVudEVudHJ5WzBdICE9PSBjdXJyZW50RW50cnlbMV0pIHtcbiAgICAgIGlzS2V5VmFsdWUgPSB0cnVlO1xuICAgIH1cblxuICAgIHJlc3VsdCA9IHZhbHVlLm5leHQoKTtcbiAgfVxuXG4gIGlmIChpc0tleVZhbHVlKSB7XG4gICAgLy8gTWFyayBlbnRyeSBpdGVyYXRvcnMgYXMgc3VjaC5cbiAgICBicmFjZXNbMF0gPSBicmFjZXNbMF0ucmVwbGFjZSgvIEl0ZXJhdG9yXSB7JC8sICcgRW50cmllc10geycpO1xuICAgIHJldHVybiBmb3JtYXRNYXBJdGVySW5uZXIoY3R4LCByZWN1cnNlVGltZXMsIGVudHJpZXMsIGtNYXBFbnRyaWVzKTtcbiAgfVxuXG4gIHJldHVybiBmb3JtYXRTZXRJdGVySW5uZXIoY3R4LCByZWN1cnNlVGltZXMsIGVudHJpZXMsIGtJdGVyYXRvcik7XG59XG5cbmZ1bmN0aW9uIGlzQmVsb3dCcmVha0xlbmd0aChjdHgsIG91dHB1dCwgc3RhcnQsIGJhc2UpIHtcbiAgLy8gRWFjaCBlbnRyeSBpcyBzZXBhcmF0ZWQgYnkgYXQgbGVhc3QgYSBjb21tYS4gVGh1cywgd2Ugc3RhcnQgd2l0aCBhIHRvdGFsXG4gIC8vIGxlbmd0aCBvZiBhdCBsZWFzdCBgb3V0cHV0Lmxlbmd0aGAuIEluIGFkZGl0aW9uLCBzb21lIGNhc2VzIGhhdmUgYVxuICAvLyB3aGl0ZXNwYWNlIGluLWJldHdlZW4gZWFjaCBvdGhlciB0aGF0IGlzIGFkZGVkIHRvIHRoZSB0b3RhbCBhcyB3ZWxsLlxuICBsZXQgdG90YWxMZW5ndGggPSBvdXRwdXQubGVuZ3RoICsgc3RhcnQ7XG5cbiAgaWYgKHRvdGFsTGVuZ3RoICsgb3V0cHV0Lmxlbmd0aCA+IGN0eC5icmVha0xlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb3V0cHV0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGN0eC5jb2xvcnMpIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IHJlbW92ZUNvbG9ycyhvdXRwdXRbaV0pLmxlbmd0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgdG90YWxMZW5ndGggKz0gb3V0cHV0W2ldLmxlbmd0aDtcbiAgICB9XG5cbiAgICBpZiAodG90YWxMZW5ndGggPiBjdHguYnJlYWtMZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gLy8gRG8gbm90IGxpbmUgdXAgcHJvcGVydGllcyBvbiB0aGUgc2FtZSBsaW5lIGlmIGBiYXNlYCBjb250YWlucyBsaW5lIGJyZWFrcy5cblxuXG4gIHJldHVybiBiYXNlID09PSAnJyB8fCAhYmFzZS5pbmNsdWRlcygnXFxuJyk7XG59XG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKGN0eCwgb3V0cHV0LCBiYXNlLCBicmFjZXMsIGV4dHJhc1R5cGUsIHJlY3Vyc2VUaW1lcywgdmFsdWUpIHtcbiAgaWYgKGN0eC5jb21wYWN0ICE9PSB0cnVlKSB7XG4gICAgaWYgKHR5cGVvZiBjdHguY29tcGFjdCA9PT0gJ251bWJlcicgJiYgY3R4LmNvbXBhY3QgPj0gMSkge1xuICAgICAgLy8gTWVtb3JpemUgdGhlIG9yaWdpbmFsIG91dHB1dCBsZW5ndGguIEluIGNhc2UgdGhlIHRoZSBvdXRwdXQgaXMgZ3JvdXBlZCxcbiAgICAgIC8vIHByZXZlbnQgbGluaW5nIHVwIHRoZSBlbnRyaWVzIG9uIGEgc2luZ2xlIGxpbmUuXG4gICAgICBjb25zdCBlbnRyaWVzID0gb3V0cHV0Lmxlbmd0aDsgLy8gR3JvdXAgYXJyYXkgZWxlbWVudHMgdG9nZXRoZXIgaWYgdGhlIGFycmF5IGNvbnRhaW5zIGF0IGxlYXN0IHNpeFxuICAgICAgLy8gc2VwYXJhdGUgZW50cmllcy5cblxuICAgICAgaWYgKGV4dHJhc1R5cGUgPT09IGtBcnJheUV4dHJhc1R5cGUgJiYgZW50cmllcyA+IDYpIHtcbiAgICAgICAgb3V0cHV0ID0gZ3JvdXBBcnJheUVsZW1lbnRzKGN0eCwgb3V0cHV0LCB2YWx1ZSk7XG4gICAgICB9IC8vIGBjdHguY3VycmVudERlcHRoYCBpcyBzZXQgdG8gdGhlIG1vc3QgaW5uZXIgZGVwdGggb2YgdGhlIGN1cnJlbnRseVxuICAgICAgLy8gaW5zcGVjdGVkIG9iamVjdCBwYXJ0IHdoaWxlIGByZWN1cnNlVGltZXNgIGlzIHRoZSBhY3R1YWwgY3VycmVudCBkZXB0aFxuICAgICAgLy8gdGhhdCBpcyBpbnNwZWN0ZWQuXG4gICAgICAvL1xuICAgICAgLy8gRXhhbXBsZTpcbiAgICAgIC8vXG4gICAgICAvLyBjb25zdCBhID0geyBmaXJzdDogWyAxLCAyLCAzIF0sIHNlY29uZDogeyBpbm5lcjogWyAxLCAyLCAzIF0gfSB9XG4gICAgICAvL1xuICAgICAgLy8gVGhlIGRlZXBlc3QgZGVwdGggb2YgYGFgIGlzIDIgKGEuc2Vjb25kLmlubmVyKSBhbmQgYGEuZmlyc3RgIGhhcyBhIG1heFxuICAgICAgLy8gZGVwdGggb2YgMS5cbiAgICAgIC8vXG4gICAgICAvLyBDb25zb2xpZGF0ZSBhbGwgZW50cmllcyBvZiB0aGUgbG9jYWwgbW9zdCBpbm5lciBkZXB0aCB1cCB0b1xuICAgICAgLy8gYGN0eC5jb21wYWN0YCwgYXMgbG9uZyBhcyB0aGUgcHJvcGVydGllcyBhcmUgc21hbGxlciB0aGFuXG4gICAgICAvLyBgY3R4LmJyZWFrTGVuZ3RoYC5cblxuXG4gICAgICBpZiAoY3R4LmN1cnJlbnREZXB0aCAtIHJlY3Vyc2VUaW1lcyA8IGN0eC5jb21wYWN0ICYmIGVudHJpZXMgPT09IG91dHB1dC5sZW5ndGgpIHtcbiAgICAgICAgLy8gTGluZSB1cCBhbGwgZW50cmllcyBvbiBhIHNpbmdsZSBsaW5lIGluIGNhc2UgdGhlIGVudHJpZXMgZG8gbm90XG4gICAgICAgIC8vIGV4Y2VlZCBgYnJlYWtMZW5ndGhgLiBBZGQgMTAgYXMgY29uc3RhbnQgdG8gc3RhcnQgbmV4dCB0byBhbGwgb3RoZXJcbiAgICAgICAgLy8gZmFjdG9ycyB0aGF0IG1heSByZWR1Y2UgYGJyZWFrTGVuZ3RoYC5cbiAgICAgICAgY29uc3Qgc3RhcnQgPSBvdXRwdXQubGVuZ3RoICsgY3R4LmluZGVudGF0aW9uTHZsICsgYnJhY2VzWzBdLmxlbmd0aCArIGJhc2UubGVuZ3RoICsgMTA7XG5cbiAgICAgICAgaWYgKGlzQmVsb3dCcmVha0xlbmd0aChjdHgsIG91dHB1dCwgc3RhcnQsIGJhc2UpKSB7XG4gICAgICAgICAgcmV0dXJuIGAke2Jhc2UgPyBgJHtiYXNlfSBgIDogJyd9JHticmFjZXNbMF19ICR7am9pbihvdXRwdXQsICcsICcpfSAke2JyYWNlc1sxXX1gO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSAvLyBMaW5lIHVwIGVhY2ggZW50cnkgb24gYW4gaW5kaXZpZHVhbCBsaW5lLlxuXG5cbiAgICBjb25zdCBpbmRlbnRhdGlvbiA9IGBcXG4keycgJy5yZXBlYXQoY3R4LmluZGVudGF0aW9uTHZsKX1gO1xuICAgIHJldHVybiBgJHtiYXNlID8gYCR7YmFzZX0gYCA6ICcnfSR7YnJhY2VzWzBdfSR7aW5kZW50YXRpb259ICBgICsgYCR7am9pbihvdXRwdXQsIGAsJHtpbmRlbnRhdGlvbn0gIGApfSR7aW5kZW50YXRpb259JHticmFjZXNbMV19YDtcbiAgfSAvLyBMaW5lIHVwIGFsbCBlbnRyaWVzIG9uIGEgc2luZ2xlIGxpbmUgaW4gY2FzZSB0aGUgZW50cmllcyBkbyBub3QgZXhjZWVkXG4gIC8vIGBicmVha0xlbmd0aGAuXG5cblxuICBpZiAoaXNCZWxvd0JyZWFrTGVuZ3RoKGN0eCwgb3V0cHV0LCAwLCBiYXNlKSkge1xuICAgIHJldHVybiBgJHticmFjZXNbMF19JHtiYXNlID8gYCAke2Jhc2V9YCA6ICcnfSAke2pvaW4ob3V0cHV0LCAnLCAnKX0gYCArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGNvbnN0IGluZGVudGF0aW9uID0gJyAnLnJlcGVhdChjdHguaW5kZW50YXRpb25MdmwpOyAvLyBJZiB0aGUgb3BlbmluZyBcImJyYWNlXCIgaXMgdG9vIGxhcmdlLCBsaWtlIGluIHRoZSBjYXNlIG9mIFwiU2V0IHtcIixcbiAgLy8gd2UgbmVlZCB0byBmb3JjZSB0aGUgZmlyc3QgaXRlbSB0byBiZSBvbiB0aGUgbmV4dCBsaW5lIG9yIHRoZVxuICAvLyBpdGVtcyB3aWxsIG5vdCBsaW5lIHVwIGNvcnJlY3RseS5cblxuICBjb25zdCBsbiA9IGJhc2UgPT09ICcnICYmIGJyYWNlc1swXS5sZW5ndGggPT09IDEgPyAnICcgOiBgJHtiYXNlID8gYCAke2Jhc2V9YCA6ICcnfVxcbiR7aW5kZW50YXRpb259ICBgOyAvLyBMaW5lIHVwIGVhY2ggZW50cnkgb24gYW4gaW5kaXZpZHVhbCBsaW5lLlxuXG4gIHJldHVybiBgJHticmFjZXNbMF19JHtsbn0ke2pvaW4ob3V0cHV0LCBgLFxcbiR7aW5kZW50YXRpb259ICBgKX0gJHticmFjZXNbMV19YDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0KC4uLmFyZ3MpIHtcbiAgcmV0dXJuIGZvcm1hdFdpdGhPcHRpb25zKHVuZGVmaW5lZCwgLi4uYXJncyk7XG59XG5cbmNvbnN0IGZpcnN0RXJyb3JMaW5lID0gZXJyb3IgPT4gZXJyb3IubWVzc2FnZS5zcGxpdCgnXFxuJylbMF07XG5cbmxldCBDSVJDVUxBUl9FUlJPUl9NRVNTQUdFO1xuXG5mdW5jdGlvbiB0cnlTdHJpbmdpZnkoYXJnKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIC8vIFBvcHVsYXRlIHRoZSBjaXJjdWxhciBlcnJvciBtZXNzYWdlIGxhemlseVxuICAgIGlmICghQ0lSQ1VMQVJfRVJST1JfTUVTU0FHRSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYSA9IHt9O1xuICAgICAgICBhLmEgPSBhO1xuICAgICAgICBKU09OLnN0cmluZ2lmeShhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgQ0lSQ1VMQVJfRVJST1JfTUVTU0FHRSA9IGZpcnN0RXJyb3JMaW5lKGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlcnIubmFtZSA9PT0gJ1R5cGVFcnJvcicgJiYgZmlyc3RFcnJvckxpbmUoZXJyKSA9PT0gQ0lSQ1VMQVJfRVJST1JfTUVTU0FHRSkge1xuICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICB9XG5cbiAgICB0aHJvdyBlcnI7XG4gIH1cbn1cbi8qIGVzbGludC1kaXNhYmxlIG1heC1kZXB0aCAqL1xuXG5cbmZ1bmN0aW9uIGZvcm1hdFdpdGhPcHRpb25zKGluc3BlY3RPcHRpb25zLCAuLi5hcmdzKSB7XG4gIGNvbnN0IGZpcnN0ID0gYXJnc1swXTtcbiAgbGV0IGEgPSAwO1xuICBsZXQgc3RyID0gJyc7XG4gIGxldCBqb2luID0gJyc7XG5cbiAgaWYgKHR5cGVvZiBmaXJzdCA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiBmaXJzdDtcbiAgICB9XG5cbiAgICBsZXQgdGVtcFN0cjtcbiAgICBsZXQgbGFzdFBvcyA9IDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpcnN0Lmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgaWYgKGZpcnN0LmNoYXJDb2RlQXQoaSkgPT09IDM3KSB7XG4gICAgICAgIC8vICclJ1xuICAgICAgICBjb25zdCBuZXh0Q2hhciA9IGZpcnN0LmNoYXJDb2RlQXQoKytpKTtcblxuICAgICAgICBpZiAoYSArIDEgIT09IGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgc3dpdGNoIChuZXh0Q2hhcikge1xuICAgICAgICAgICAgY2FzZSAxMTU6XG4gICAgICAgICAgICAgIC8vICdzJ1xuICAgICAgICAgICAgICBjb25zdCB0ZW1wQXJnID0gYXJnc1srK2FdO1xuXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcEFyZyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICB0ZW1wU3RyID0gZm9ybWF0TnVtYmVyKHN0eWxpemVOb0NvbG9yLCB0ZW1wQXJnKTtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRlbXBBcmcgPT09ICdiaWdpbnQnKSB7XG4gICAgICAgICAgICAgICAgXHR0ZW1wU3RyID0gYCR7dGVtcEFyZ31uYDtcbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBjb25zdHI7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRlbXBBcmcgIT09ICdvYmplY3QnIHx8IHRlbXBBcmcgPT09IG51bGwgfHwgdHlwZW9mIHRlbXBBcmcudG9TdHJpbmcgPT09ICdmdW5jdGlvbicgJiYgKGhhc093blByb3BlcnR5KHRlbXBBcmcsICd0b1N0cmluZycpIC8vIEEgZGlyZWN0IG93biBwcm9wZXJ0eSBvbiB0aGUgY29uc3RydWN0b3IgcHJvdG90eXBlIGluXG4gICAgICAgICAgICAgICAgLy8gY2FzZSB0aGUgY29uc3RydWN0b3IgaXMgbm90IGFuIGJ1aWx0LWluIG9iamVjdC5cbiAgICAgICAgICAgICAgICB8fCAoY29uc3RyID0gdGVtcEFyZy5jb25zdHJ1Y3RvcikgJiYgIWJ1aWx0SW5PYmplY3RzLmhhcyhjb25zdHIubmFtZSkgJiYgY29uc3RyLnByb3RvdHlwZSAmJiBoYXNPd25Qcm9wZXJ0eShjb25zdHIucHJvdG90eXBlLCAndG9TdHJpbmcnKSkpIHtcbiAgICAgICAgICAgICAgICAgIHRlbXBTdHIgPSBTdHJpbmcodGVtcEFyZyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHRlbXBTdHIgPSBpbnNwZWN0KHRlbXBBcmcsIHsgLi4uaW5zcGVjdE9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBhY3Q6IDMsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGRlcHRoOiAwXG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAxMDY6XG4gICAgICAgICAgICAgIC8vICdqJ1xuICAgICAgICAgICAgICB0ZW1wU3RyID0gdHJ5U3RyaW5naWZ5KGFyZ3NbKythXSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDEwMDpcbiAgICAgICAgICAgICAgLy8gJ2QnXG4gICAgICAgICAgICAgIGNvbnN0IHRlbXBOdW0gPSBhcmdzWysrYV07XG4gICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcE51bSA9PT0gJ2JpZ2ludCcpIHtcbiAgICAgICAgICAgICAgXHR0ZW1wU3RyID0gYCR7dGVtcE51bX1uYDtcbiAgICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wTnVtID09PSAnc3ltYm9sJykge1xuICAgICAgICAgICAgICAgIHRlbXBTdHIgPSAnTmFOJztcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZW1wU3RyID0gZm9ybWF0TnVtYmVyKHN0eWxpemVOb0NvbG9yLCBOdW1iZXIodGVtcE51bSkpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgNzk6XG4gICAgICAgICAgICAgIC8vICdPJ1xuICAgICAgICAgICAgICB0ZW1wU3RyID0gaW5zcGVjdChhcmdzWysrYV0sIGluc3BlY3RPcHRpb25zKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMTExOlxuICAgICAgICAgICAgICAvLyAnbydcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRlbXBTdHIgPSBpbnNwZWN0KGFyZ3NbKythXSwgeyAuLi5pbnNwZWN0T3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgIHNob3dIaWRkZW46IHRydWUsXG4gICAgICAgICAgICAgICAgICBzaG93UHJveHk6IHRydWUsXG4gICAgICAgICAgICAgICAgICBkZXB0aDogNFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhc2UgMTA1OlxuICAgICAgICAgICAgICAvLyAnaSdcbiAgICAgICAgICAgICAgY29uc3QgdGVtcEludGVnZXIgPSBhcmdzWysrYV07XG4gICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcEludGVnZXIgPT09ICdiaWdpbnQnKSB7XG4gICAgICAgICAgICAgIFx0dGVtcFN0ciA9IGAke3RlbXBJbnRlZ2VyfW5gO1xuICAgICAgICAgICAgICB9IGVsc2UgKi9cblxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHRlbXBJbnRlZ2VyID09PSAnc3ltYm9sJykge1xuICAgICAgICAgICAgICAgIHRlbXBTdHIgPSAnTmFOJztcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZW1wU3RyID0gZm9ybWF0TnVtYmVyKHN0eWxpemVOb0NvbG9yLCBwYXJzZUludCh0ZW1wSW50ZWdlcikpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMTAyOlxuICAgICAgICAgICAgICAvLyAnZidcbiAgICAgICAgICAgICAgY29uc3QgdGVtcEZsb2F0ID0gYXJnc1srK2FdO1xuXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdGVtcEZsb2F0ID09PSAnc3ltYm9sJykge1xuICAgICAgICAgICAgICAgIHRlbXBTdHIgPSAnTmFOJztcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZW1wU3RyID0gZm9ybWF0TnVtYmVyKHN0eWxpemVOb0NvbG9yLCBwYXJzZUZsb2F0KHRlbXBGbG9hdCkpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgICAgIC8vICclJ1xuICAgICAgICAgICAgICBzdHIgKz0gZmlyc3Quc2xpY2UobGFzdFBvcywgaSk7XG4gICAgICAgICAgICAgIGxhc3RQb3MgPSBpICsgMTtcbiAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIC8vIEFueSBvdGhlciBjaGFyYWN0ZXIgaXMgbm90IGEgY29ycmVjdCBwbGFjZWhvbGRlclxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobGFzdFBvcyAhPT0gaSAtIDEpIHtcbiAgICAgICAgICAgIHN0ciArPSBmaXJzdC5zbGljZShsYXN0UG9zLCBpIC0gMSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc3RyICs9IHRlbXBTdHI7XG4gICAgICAgICAgbGFzdFBvcyA9IGkgKyAxO1xuICAgICAgICB9IGVsc2UgaWYgKG5leHRDaGFyID09PSAzNykge1xuICAgICAgICAgIHN0ciArPSBmaXJzdC5zbGljZShsYXN0UG9zLCBpKTtcbiAgICAgICAgICBsYXN0UG9zID0gaSArIDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobGFzdFBvcyAhPT0gMCkge1xuICAgICAgYSsrO1xuICAgICAgam9pbiA9ICcgJztcblxuICAgICAgaWYgKGxhc3RQb3MgPCBmaXJzdC5sZW5ndGgpIHtcbiAgICAgICAgc3RyICs9IGZpcnN0LnNsaWNlKGxhc3RQb3MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHdoaWxlIChhIDwgYXJncy5sZW5ndGgpIHtcbiAgICBjb25zdCB2YWx1ZSA9IGFyZ3NbYV07XG4gICAgc3RyICs9IGpvaW47XG4gICAgc3RyICs9IHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgPyBpbnNwZWN0KHZhbHVlLCBpbnNwZWN0T3B0aW9ucykgOiB2YWx1ZTtcbiAgICBqb2luID0gJyAnO1xuICAgIGErKztcbiAgfVxuXG4gIHJldHVybiBzdHI7XG59XG4vKiBlc2xpbnQtZW5hYmxlIG1heC1kZXB0aCAqL1xuXG5jb25zdCBuYXRpdmVEZWJ1ZyA9IGNvbnNvbGUuZGVidWc7XG5jb25zdCBuYXRpdmVFcnJvciA9IGNvbnNvbGUuZXJyb3I7XG5jb25zdCBuYXRpdmVJbmZvID0gY29uc29sZS5pbmZvO1xuY29uc3QgbmF0aXZlTG9nID0gY29uc29sZS5sb2c7XG5jb25zdCBuYXRpdmVXYXJuID0gY29uc29sZS53YXJuO1xuY29uc3Qga0NvbG9ySW5zcGVjdE9wdGlvbnMgPSB7XG4gIGNvbG9yczogdHJ1ZVxufTtcbmNvbnN0IGtOb0NvbG9ySW5zcGVjdE9wdGlvbnMgPSB7fTtcblxuY29uc29sZS5kZWJ1ZyA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gIG5hdGl2ZURlYnVnLmNhbGwoY29uc29sZSwgZm9ybWF0V2l0aE9wdGlvbnMoa0NvbG9ySW5zcGVjdE9wdGlvbnMsIC4uLmFyZ3MpKTtcbn07XG5cbmNvbnNvbGUuZXJyb3IgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICBuYXRpdmVFcnJvci5jYWxsKGNvbnNvbGUsIGZvcm1hdFdpdGhPcHRpb25zKGtOb0NvbG9ySW5zcGVjdE9wdGlvbnMsIC4uLmFyZ3MpKTtcbn07XG5cbmNvbnNvbGUuaW5mbyA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gIG5hdGl2ZUluZm8uY2FsbChjb25zb2xlLCBmb3JtYXRXaXRoT3B0aW9ucyhrQ29sb3JJbnNwZWN0T3B0aW9ucywgLi4uYXJncykpO1xufTtcblxuY29uc29sZS5sb2cgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICBuYXRpdmVMb2cuY2FsbChjb25zb2xlLCBmb3JtYXRXaXRoT3B0aW9ucyhrQ29sb3JJbnNwZWN0T3B0aW9ucywgLi4uYXJncykpO1xufTtcblxuY29uc29sZS53YXJuID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgbmF0aXZlV2Fybi5jYWxsKGNvbnNvbGUsIGZvcm1hdFdpdGhPcHRpb25zKGtOb0NvbG9ySW5zcGVjdE9wdGlvbnMsIC4uLmFyZ3MpKTtcbn07XG5cbi8qKlxuICogQXBwY2VsZXJhdG9yIFRpdGFuaXVtIE1vYmlsZVxuICogQ29weXJpZ2h0IChjKSAyMDE4IGJ5IEF4d2F5LCBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEFwYWNoZSBQdWJsaWMgTGljZW5zZVxuICogUGxlYXNlIHNlZSB0aGUgTElDRU5TRSBpbmNsdWRlZCB3aXRoIHRoaXMgZGlzdHJpYnV0aW9uIGZvciBkZXRhaWxzLlxuICovXG4vLyBBZGQgYSB0b0pTT04oKSBtZXRob2QgdG8gYWxsIEVycm9yIG9iamVjdHMgbmVlZGVkIHRvIG91dHB1dCBub24tZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxuLy8gVGhlIEpTT04uc3RyaW5naWZ5KCkgd2lsbCBhdXRvbWF0aWNhbGx5IGNhbGwgdGhpcyBtZXRob2QgaWYgaXQgZXhpc3RzIHRvIHByb3ZpZGUgY3VzdG9tIG91dHB1dC5cbi8vIE5vdGVzOlxuLy8gLSBJbiBWOCwgYWxsIEVycm9yIHByb3BlcnRpZXMgYXJlIG5vdCBlbnVtZXJhYmxlLiBXZSBuZWVkIHRoaXMgb3IgZWxzZSBzdHJpbmdpZnkoKSB3aWxsIHJldHVybiBcInt9XCIuXG4vLyAtIEluIEphdmFTY3JpcHRDb3JlLCBvbmx5IHRoZSBcInN0YWNrXCIgcHJvcGVydHkgaXMgbm90IGVudW1lcmFibGUuIFdlIHdhbnQgdG8gcmV2ZWFsIHRoaXMuXG5pZiAodHlwZW9mIEVycm9yLnByb3RvdHlwZS50b0pTT04gIT09ICdmdW5jdGlvbicpIHtcbiAgRXJyb3IucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcHJvcGVydGllcyA9IHt9O1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHByb3BlcnRpZXNbbmFtZV0gPSB0aGlzW25hbWVdO1xuICAgIH0sIHRoaXMpO1xuICAgIHJldHVybiBwcm9wZXJ0aWVzO1xuICB9O1xufVxuXG4vKipcbiAqIEFwcGNlbGVyYXRvciBUaXRhbml1bSBNb2JpbGVcbiAqIENvcHlyaWdodCAoYykgMjAxOSBieSBBeHdheSwgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBBcGFjaGUgUHVibGljIExpY2Vuc2VcbiAqIFBsZWFzZSBzZWUgdGhlIExJQ0VOU0UgaW5jbHVkZWQgd2l0aCB0aGlzIGRpc3RyaWJ1dGlvbiBmb3IgZGV0YWlscy5cbiAqL1xubGV0IGNvbG9yc2V0O1xubGV0IG9zVmVyc2lvbjsgLy8gQXMgQW5kcm9pZCBwYXNzZXMgYSBuZXcgaW5zdGFuY2Ugb2YgVGkuVUkgdG8gZXZlcnkgSlMgZmlsZSB3ZSBjYW4ndCBqdXN0XG4vLyBUaS5VSSB3aXRoaW4gdGhpcyBmaWxlLCB3ZSBtdXN0IGNhbGwga3JvbGwuYmluZGluZyB0byBnZXQgdGhlIFRpdGFuaXVtXG4vLyBuYW1lc3BhY2UgdGhhdCBpcyBwYXNzZWQgaW4gd2l0aCByZXF1aXJlIGFuZCB0aGF0IGRlYWwgd2l0aCB0aGUgLlVJXG4vLyBuYW1lc3BhY2UgdGhhdCBpcyBvbiB0aGF0IGRpcmVjdGx5LlxuXG5sZXQgdWlNb2R1bGUgPSBUaS5VSTtcblxuaWYgKFRpLkFuZHJvaWQpIHtcbiAgdWlNb2R1bGUgPSBrcm9sbC5iaW5kaW5nKCdUaXRhbml1bScpLlRpdGFuaXVtLlVJO1xufVxuXG51aU1vZHVsZS5TRU1BTlRJQ19DT0xPUl9UWVBFX0xJR0hUID0gJ2xpZ2h0JztcbnVpTW9kdWxlLlNFTUFOVElDX0NPTE9SX1RZUEVfREFSSyA9ICdkYXJrJzsgLy8gV2UgbmVlZCB0byB0cmFjayB0aGlzIG1hbnVhbGx5IHdpdGggYSBnZXR0ZXIvc2V0dGVyXG4vLyBkdWUgdG8gdGhlIHNhbWUgcmVhc29ucyB3ZSB1c2UgdWlNb2R1bGUgaW5zdGVhZCBvZiBUaS5VSVxuXG5sZXQgY3VycmVudENvbG9yVHlwZSA9IHVpTW9kdWxlLlNFTUFOVElDX0NPTE9SX1RZUEVfTElHSFQ7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkodWlNb2R1bGUsICdzZW1hbnRpY0NvbG9yVHlwZScsIHtcbiAgZ2V0OiAoKSA9PiB7XG4gICAgcmV0dXJuIGN1cnJlbnRDb2xvclR5cGU7XG4gIH0sXG4gIHNldDogY29sb3JUeXBlID0+IHtcbiAgICBjdXJyZW50Q29sb3JUeXBlID0gY29sb3JUeXBlO1xuICB9XG59KTtcblxudWlNb2R1bGUuZmV0Y2hTZW1hbnRpY0NvbG9yID0gZnVuY3Rpb24gZmV0Y2hTZW1hbnRpY0NvbG9yKGNvbG9yTmFtZSkge1xuICBpZiAoIW9zVmVyc2lvbikge1xuICAgIG9zVmVyc2lvbiA9IHBhcnNlSW50KFRpLlBsYXRmb3JtLnZlcnNpb24uc3BsaXQoJy4nKVswXSk7XG4gIH1cblxuICBpZiAoVGkuQXBwLmlPUyAmJiBvc1ZlcnNpb24gPj0gMTMpIHtcbiAgICByZXR1cm4gVGkuVUkuaU9TLmZldGNoU2VtYW50aWNDb2xvcihjb2xvck5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGlmICghY29sb3JzZXQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbG9yc2V0RmlsZSA9IFRpLkZpbGVzeXN0ZW0uZ2V0RmlsZShUaS5GaWxlc3lzdGVtLnJlc291cmNlc0RpcmVjdG9yeSwgJ3NlbWFudGljLmNvbG9ycy5qc29uJyk7XG5cbiAgICAgICAgaWYgKGNvbG9yc2V0RmlsZS5leGlzdHMoKSkge1xuICAgICAgICAgIGNvbG9yc2V0ID0gSlNPTi5wYXJzZShjb2xvcnNldEZpbGUucmVhZCgpLnRleHQpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBjb2xvcnMgZmlsZSBcXCdzZW1hbnRpYy5jb2xvcnMuanNvblxcJycpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBjb2xvcnNldFtjb2xvck5hbWVdW3VpTW9kdWxlLnNlbWFudGljQ29sb3JUeXBlXS5jb2xvciB8fCBjb2xvcnNldFtjb2xvck5hbWVdW3VpTW9kdWxlLnNlbWFudGljQ29sb3JUeXBlXTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIGxvb2t1cCBjb2xvciBmb3IgJHtjb2xvck5hbWV9YCk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7RXZlbnRFbWl0dGVyfSBlbWl0dGVyIHRoZSBFdmVudEVtaXR0ZXIgaW5zdGFuY2UgdG8gdXNlIHRvIHJlZ2lzdGVyIGZvciBpdCdzIGV2ZW50c1xuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSB0aGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gcmVnaXN0ZXIgZm9yXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaXN0ZW5lciB0aGUgbGlzdGVuZXIgY2FsbGJhY2svZnVuY3Rpb24gdG8gaW52b2tlIHdoZW4gdGhlIGV2ZW50IGlzIGVtaXR0ZWRcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJlcGVuZCB3aGV0aGVyIHRvIHByZXBlbmQgb3IgYXBwZW5kIHRoZSBsaXN0ZW5lclxuICogQHJldHVybnMge0V2ZW50RW1pdHRlcn1cbiAqL1xuZnVuY3Rpb24gX2FkZExpc3RlbmVyKGVtaXR0ZXIsIGV2ZW50TmFtZSwgbGlzdGVuZXIsIHByZXBlbmQpIHtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHNUb0xpc3RlbmVycykge1xuICAgIC8vIG5vIGV2ZW50cy9saXN0ZW5lcnMgcmVnaXN0ZXJlZFxuICAgIGVtaXR0ZXIuX2V2ZW50c1RvTGlzdGVuZXJzID0ge307IC8vIGluaXRpYWxpemUgaXRcbiAgfSAvLyBpZiB0aGVyZSdzIHNvbWVvbmUgbGlzdGVuaW5nIHRvICduZXdMaXN0ZW5lcicgZXZlbnRzLCBlbWl0IHRoYXQgKipiZWZvcmUqKiB3ZSBhZGQgdGhlIGxpc3RlbmVyICh0byBhdm9pZCBpbmZpbml0ZSByZWN1cnNpb24pXG5cblxuICBpZiAoZW1pdHRlci5fZXZlbnRzVG9MaXN0ZW5lcnMubmV3TGlzdGVuZXIpIHtcbiAgICBlbWl0dGVyLmVtaXQoJ25ld0xpc3RlbmVyJywgZXZlbnROYW1lLCBsaXN0ZW5lcik7XG4gIH1cblxuICBjb25zdCBldmVudExpc3RlbmVycyA9IGVtaXR0ZXIuX2V2ZW50c1RvTGlzdGVuZXJzW2V2ZW50TmFtZV0gfHwgW107XG5cbiAgaWYgKHByZXBlbmQpIHtcbiAgICBldmVudExpc3RlbmVycy51bnNoaWZ0KGxpc3RlbmVyKTtcbiAgfSBlbHNlIHtcbiAgICBldmVudExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgfVxuXG4gIGVtaXR0ZXIuX2V2ZW50c1RvTGlzdGVuZXJzW2V2ZW50TmFtZV0gPSBldmVudExpc3RlbmVyczsgLy8gQ2hlY2sgbWF4IGxpc3RlbmVycyBhbmQgc3BpdCBvdXQgd2FybmluZyBpZiA+XG5cbiAgY29uc3QgbWF4ID0gZW1pdHRlci5nZXRNYXhMaXN0ZW5lcnMoKTtcbiAgY29uc3QgbGVuZ3RoID0gZXZlbnRMaXN0ZW5lcnMubGVuZ3RoO1xuXG4gIGlmIChtYXggPiAwICYmIGxlbmd0aCA+IG1heCkge1xuICAgIGNvbnN0IHcgPSBuZXcgRXJyb3IoYFBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgbGVhayBkZXRlY3RlZC4gJHtsZW5ndGh9ICR7ZXZlbnROYW1lfSBsaXN0ZW5lcnMgYWRkZWQuIFVzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0YCk7XG4gICAgdy5uYW1lID0gJ01heExpc3RlbmVyc0V4Y2VlZGVkV2FybmluZyc7XG4gICAgdy5lbWl0dGVyID0gZW1pdHRlcjtcbiAgICB3LnR5cGUgPSBldmVudE5hbWU7XG4gICAgdy5jb3VudCA9IGxlbmd0aDtcbiAgICBwcm9jZXNzLmVtaXRXYXJuaW5nKHcpO1xuICB9XG5cbiAgcmV0dXJuIGVtaXR0ZXI7XG59XG5cbmZ1bmN0aW9uIG9uY2VXcmFwKGVtaXR0ZXIsIGV2ZW50TmFtZSwgbGlzdGVuZXIpIHtcbiAgZnVuY3Rpb24gd3JhcHBlciguLi5hcmdzKSB7XG4gICAgdGhpcy5lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKHRoaXMuZXZlbnROYW1lLCB0aGlzLndyYXBwZWRGdW5jKTsgLy8gcmVtb3ZlIG91cnNlbHZlc1xuXG4gICAgdGhpcy5saXN0ZW5lci5hcHBseSh0aGlzLmVtaXR0ZXIsIGFyZ3MpOyAvLyB0aGVuIGZvcndhcmQgdGhlIGV2ZW50IGNhbGxiYWNrXG4gIH0gLy8gd2UgaGF2ZSB0byB1c2UgYmluZCB3aXRoIGEgY3VzdG9tICd0aGlzJywgYmVjYXVzZSBldmVudHMgZmlyZSB3aXRoICd0aGlzJyBwb2ludGluZyBhdCB0aGUgZW1pdHRlclxuXG5cbiAgY29uc3Qgd3JhcHBlclRoaXMgPSB7XG4gICAgZW1pdHRlcixcbiAgICBldmVudE5hbWUsXG4gICAgbGlzdGVuZXJcbiAgfTtcbiAgY29uc3QgYm91bmQgPSB3cmFwcGVyLmJpbmQod3JhcHBlclRoaXMpOyAvLyBiaW5kIHRvIGZvcmNlIFwidGhpc1wiIHRvIHJlZmVyIHRvIG91ciBjdXN0b20gb2JqZWN0IHRyYWNraW5nIHRoZSB3cmFwcGVyL2VtaXR0ZXIvbGlzdGVuZXJcblxuICBib3VuZC5saXN0ZW5lciA9IGxpc3RlbmVyOyAvLyBoYXZlIHRvIGFkZCBsaXN0ZW5lciBwcm9wZXJ0eSBmb3IgXCJ1bndyYXBwaW5nXCJcblxuICB3cmFwcGVyVGhpcy53cmFwcGVkRnVuYyA9IGJvdW5kO1xuICByZXR1cm4gYm91bmQ7XG59IC8vIG1hbnkgY29uc3VtZXJzIG1ha2UgdXNlIG9mIHRoaXMgdmlhIHV0aWwuaW5oZXJpdHMsIHdoaWNoIGRvZXMgbm90IGNoYWluIGNvbnN0cnVjdG9yIGNhbGxzIVxuLy8gc28gd2UgbmVlZCB0byBiZSBhd2FyZSB0aGF0IF9ldmVudHNUb0xpc3RlbmVycyBtYXllIGJlIG51bGwvdW5kZWZpbmVkIG9uIGluc3RhbmNlcywgYW5kIGNoZWNrIGluIG1ldGhvZHMgYmVmb3JlIGFjY2Vzc2luZyBpdFxuXG5cbmNsYXNzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2V2ZW50c1RvTGlzdGVuZXJzID0ge307XG4gICAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgYWRkTGlzdGVuZXIoZXZlbnROYW1lLCBsaXN0ZW5lcikge1xuICAgIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgZXZlbnROYW1lLCBsaXN0ZW5lciwgZmFsc2UpO1xuICB9XG5cbiAgb24oZXZlbnROYW1lLCBsaXN0ZW5lcikge1xuICAgIHJldHVybiB0aGlzLmFkZExpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcHJlcGVuZExpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXIpIHtcbiAgICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIGV2ZW50TmFtZSwgbGlzdGVuZXIsIHRydWUpO1xuICB9XG5cbiAgb25jZShldmVudE5hbWUsIGxpc3RlbmVyKSB7XG4gICAgdGhpcy5vbihldmVudE5hbWUsIG9uY2VXcmFwKHRoaXMsIGV2ZW50TmFtZSwgbGlzdGVuZXIpKTtcbiAgfVxuXG4gIHByZXBlbmRPbmNlTGlzdGVuZXIoZXZlbnROYW1lLCBsaXN0ZW5lcikge1xuICAgIHRoaXMucHJlcGVuZExpc3RlbmVyKGV2ZW50TmFtZSwgb25jZVdyYXAodGhpcywgZXZlbnROYW1lLCBsaXN0ZW5lcikpO1xuICB9XG5cbiAgcmVtb3ZlTGlzdGVuZXIoZXZlbnROYW1lLCBsaXN0ZW5lcikge1xuICAgIGlmICghdGhpcy5fZXZlbnRzVG9MaXN0ZW5lcnMpIHtcbiAgICAgIC8vIG5vIGV2ZW50cy9saXN0ZW5lcnMgcmVnaXN0ZXJlZFxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29uc3QgZXZlbnRMaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNUb0xpc3RlbmVyc1tldmVudE5hbWVdIHx8IFtdO1xuICAgIGNvbnN0IGxlbmd0aCA9IGV2ZW50TGlzdGVuZXJzLmxlbmd0aDtcbiAgICBsZXQgZm91bmRJbmRleCA9IC0xO1xuICAgIGxldCB1bndyYXBwZWRMaXN0ZW5lcjsgLy8gTmVlZCB0byBzZWFyY2ggTElGTywgYW5kIG5lZWQgdG8gaGFuZGxlIHdyYXBwZWQgZnVuY3Rpb25zIChvbmNlIHdyYXBwZXJzKVxuXG4gICAgZm9yIChsZXQgaSA9IGxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBpZiAoZXZlbnRMaXN0ZW5lcnNbaV0gPT09IGxpc3RlbmVyIHx8IGV2ZW50TGlzdGVuZXJzW2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICBmb3VuZEluZGV4ID0gaTtcbiAgICAgICAgdW53cmFwcGVkTGlzdGVuZXIgPSBldmVudExpc3RlbmVyc1tpXS5saXN0ZW5lcjtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZvdW5kSW5kZXggIT09IC0xKSB7XG4gICAgICBpZiAobGVuZ3RoID09PSAxKSB7XG4gICAgICAgIC8vIGxlbmd0aCB3YXMgMSBhbmQgd2Ugd2FudCB0byByZW1vdmUgbGFzdCBlbnRyeSwgc28gZGVsZXRlIHRoZSBldmVudCB0eXBlIGZyb20gb3VyIGxpc3RlbmVyIG1hcHBpbmcgbm93IVxuICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRzVG9MaXN0ZW5lcnNbZXZlbnROYW1lXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHdlIGhhZCAyKyBsaXN0ZW5lcnMsIHNvIHN0b3JlIGFycmF5IHdpdGhvdXQgdGhpcyBnaXZlbiBsaXN0ZW5lclxuICAgICAgICBldmVudExpc3RlbmVycy5zcGxpY2UoZm91bmRJbmRleCwgMSk7IC8vIG1vZGlmaWVzIGluIHBsYWNlLCBubyBuZWVkIHRvIGFzc2lnbiB0byB0aGlzLmxpc3RlbmVyc1tldmVudE5hbWVdXG4gICAgICB9IC8vIERvbid0IGVtaXQgaWYgdGhlcmUncyBubyBsaXN0ZW5lcnMgZm9yICdyZW1vdmVMaXN0ZW5lcicgdHlwZSFcblxuXG4gICAgICBpZiAodGhpcy5fZXZlbnRzVG9MaXN0ZW5lcnMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIGV2ZW50TmFtZSwgdW53cmFwcGVkTGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgb2ZmKGV2ZW50TmFtZSwgbGlzdGVuZXIpIHtcbiAgICByZXR1cm4gdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudE5hbWUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIGVtaXQoZXZlbnROYW1lLCAuLi5hcmdzKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNUb0xpc3RlbmVycykge1xuICAgICAgLy8gbm8gZXZlbnRzL2xpc3RlbmVycyByZWdpc3RlcmVkXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgZXZlbnRMaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNUb0xpc3RlbmVyc1tldmVudE5hbWVdIHx8IFtdO1xuXG4gICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiBldmVudExpc3RlbmVycy5zbGljZSgpKSB7XG4gICAgICAvLyBtdXN0IG9wZXJhdGUgb24gY29weSBiZWNhdXNlIGxpc3RlbmVycyAsYXkgZ2V0IHJlbW92ZSBhcyBzaWRlLWVmZmVjdCBvZiBjYWxsaW5nXG4gICAgICBsaXN0ZW5lci5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIHJldHVybiBldmVudExpc3RlbmVycy5sZW5ndGggIT09IDA7XG4gIH1cblxuICBsaXN0ZW5lckNvdW50KGV2ZW50TmFtZSkge1xuICAgIGlmICghdGhpcy5fZXZlbnRzVG9MaXN0ZW5lcnMpIHtcbiAgICAgIC8vIG5vIGV2ZW50cy9saXN0ZW5lcnMgcmVnaXN0ZXJlZFxuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgY29uc3QgZXZlbnRMaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNUb0xpc3RlbmVyc1tldmVudE5hbWVdIHx8IFtdO1xuICAgIHJldHVybiBldmVudExpc3RlbmVycy5sZW5ndGg7XG4gIH1cblxuICBldmVudE5hbWVzKCkge1xuICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzLl9ldmVudHNUb0xpc3RlbmVycyB8fCB7fSk7XG4gIH1cblxuICBsaXN0ZW5lcnMoZXZlbnROYW1lKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNUb0xpc3RlbmVycykge1xuICAgICAgLy8gbm8gZXZlbnRzL2xpc3RlbmVycyByZWdpc3RlcmVkXG4gICAgICByZXR1cm4gW107XG4gICAgfSAvLyBOZWVkIHRvIFwidW53cmFwXCIgb25jZSB3cmFwcGVycyFcblxuXG4gICAgY29uc3QgcmF3ID0gdGhpcy5fZXZlbnRzVG9MaXN0ZW5lcnNbZXZlbnROYW1lXSB8fCBbXTtcbiAgICByZXR1cm4gcmF3Lm1hcChsID0+IGwubGlzdGVuZXIgfHwgbCk7IC8vIGhlcmUgd2UgdW53cmFwIHRoZSBvbmNlIHdyYXBwZXIgaWYgdGhlcmUgaXMgb25lIG9yIGZhbGwgYmFjayB0byBsaXN0ZW5lciBmdW5jdGlvblxuICB9XG5cbiAgcmF3TGlzdGVuZXJzKGV2ZW50TmFtZSkge1xuICAgIGlmICghdGhpcy5fZXZlbnRzVG9MaXN0ZW5lcnMpIHtcbiAgICAgIC8vIG5vIGV2ZW50cy9saXN0ZW5lcnMgcmVnaXN0ZXJlZFxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHJldHVybiAodGhpcy5fZXZlbnRzVG9MaXN0ZW5lcnNbZXZlbnROYW1lXSB8fCBbXSkuc2xpY2UoMCk7IC8vIHJldHVybiBhIGNvcHlcbiAgfVxuXG4gIGdldE1heExpc3RlbmVycygpIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICB9XG5cbiAgc2V0TWF4TGlzdGVuZXJzKG4pIHtcbiAgICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuOyAvLyBUT0RPOiBUeXBlIGNoZWNrIG4sIG1ha2Ugc3VyZSA+PSAwIChvIGVxdWFscyBubyBsaW1pdClcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50TmFtZSkge1xuICAgIGlmICghdGhpcy5fZXZlbnRzVG9MaXN0ZW5lcnMpIHtcbiAgICAgIC8vIG5vIGV2ZW50cy9saXN0ZW5lcnMgcmVnaXN0ZXJlZFxuICAgICAgdGhpcy5fZXZlbnRzVG9MaXN0ZW5lcnMgPSB7fTsgLy8gaW5pdGlhbGl6ZSBpdFxuICAgIH1cblxuICAgIGlmICghdGhpcy5fZXZlbnRzVG9MaXN0ZW5lcnMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgIC8vIG5vIG5lZWQgdG8gZW1pdCEgd2UgY2FuIGp1c3Qgd2lwZSFcbiAgICAgIGlmIChldmVudE5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyByZW1vdmUgZXZlcnkgdHlwZSFcbiAgICAgICAgdGhpcy5fZXZlbnRzVG9MaXN0ZW5lcnMgPSB7fTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHJlbW92ZSBzcGVjaWZpYyB0eXBlXG4gICAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNUb0xpc3RlbmVyc1tldmVudE5hbWVdO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IC8vIHl1Y2ssIHdlJ2xsIGhhdmUgdG8gZW1pdCAncmVtb3ZlTGlzdGVuZXInIGV2ZW50cyBhcyB3ZSBnb1xuXG5cbiAgICBpZiAoZXZlbnROYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFJlbW92ZSBhbGwgdHlwZXMgKGJ1dCBkbyAncmVtb3ZlTGlzdGVuZXInIGxhc3QhKVxuICAgICAgY29uc3QgbmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLl9ldmVudHNUb0xpc3RlbmVycykuZmlsdGVyKG5hbWUgPT4gbmFtZSAhPT0gJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgICBuYW1lcy5mb3JFYWNoKG5hbWUgPT4gdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMobmFtZSkpO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgICB0aGlzLl9ldmVudHNUb0xpc3RlbmVycyA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyByZW1vdmUgbGlzdGVuZXJzIGZvciBvbmUgdHlwZSwgYmFjayB0byBmcm9udCAoTGFzdC1pbiwgZmlyc3Qtb3V0LCBleGNlcHQgd2hlcmUgcHJlcGVuZCBmLWVkIGl0IHVwKVxuICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzVG9MaXN0ZW5lcnNbZXZlbnROYW1lXSB8fCBbXTtcblxuICAgICAgZm9yIChsZXQgaSA9IGxpc3RlbmVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXJzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG59XG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uIChlbWl0dGVyLCBldmVudE5hbWUpIHtcbiAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudChldmVudE5hbWUpO1xufTtcblxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuLyoqXG4gKiBAcGFyYW0gIHsqfSBhcmcgcGFzc2VkIGluIGFyZ3VtZW50IHZhbHVlXG4gKiBAcGFyYW0gIHtzdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgYXJndW1lbnRcbiAqIEBwYXJhbSAge3N0cmluZ30gdHlwZW5hbWUgaS5lLiAnc3RyaW5nJywgJ0Z1bmN0aW9uJyAodmFsdWUgaXMgY29tcGFyZWQgdG8gdHlwZW9mIGFmdGVyIGxvd2VyY2FzaW5nKVxuICogQHJldHVybiB7dm9pZH1cbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn1cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0QXJndW1lbnRUeXBlKGFyZywgbmFtZSwgdHlwZW5hbWUpIHtcbiAgY29uc3QgdHlwZSA9IHR5cGVvZiBhcmc7XG5cbiAgaWYgKHR5cGUgIT09IHR5cGVuYW1lLnRvTG93ZXJDYXNlKCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBUaGUgXCIke25hbWV9XCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlICR7dHlwZW5hbWV9LiBSZWNlaXZlZCB0eXBlICR7dHlwZX1gKTtcbiAgfVxufVxuXG5jb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uICdzdGFuZGFyZGl6ZXMnIHRoZSByZXBvcnRlZCBhcmNoaXRlY3R1cmVzIHRvIHRoZSBlcXVpdmFsZW50cyByZXBvcnRlZCBieSBOb2RlLmpzXG4gKiBub2RlIHZhbHVlczogJ2FybScsICdhcm02NCcsICdpYTMyJywgJ21pcHMnLCAnbWlwc2VsJywgJ3BwYycsICdwcGM2NCcsICdzMzkwJywgJ3MzOTB4JywgJ3gzMicsIGFuZCAneDY0Jy5cbiAqIGlPUyB2YWx1ZXM6IFwiYXJtNjRcIiwgXCJhcm12N1wiLCBcIng4Nl82NFwiLCBcImkzODZcIiwgXCJVbmtub3duXCJcbiAqIEFuZHJvaWQgdmFsdWVzOiBcImFybWVhYmlcIiwgXCJhcm1lYWJpLXY3YVwiLCBcImFybTY0LXY4YVwiLCBcIng4NlwiLCBcIng4Nl82NFwiLCBcIm1pcHNcIiwgXCJtaXBzNjRcIiwgXCJ1bmtub3duXCJcbiAqIFdpbmRvd3MgdmFsdWVzOiBcIng2NFwiLCBcImlhNjRcIiwgXCJBUk1cIiwgXCJ4ODZcIiwgXCJ1bmtub3duXCJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW5hbCBvcmlnaW5hbCBhcmNoaXRlY3R1cmUgcmVwb3J0ZWQgYnkgVGkuUGxhdGZvcm1cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gc3RhbmRhcmRpemVBcmNoKG9yaWdpbmFsKSB7XG4gIHN3aXRjaCAob3JpZ2luYWwpIHtcbiAgICAvLyBjb2VyY2UgJ2FybXY3JywgJ2FybWVhYmknLCAnYXJtZWFiaS12N2EnLCAnQVJNJyAtPiAnYXJtJ1xuICAgIC8vICdhcm1lYWJpJyBpcyBhIGRlYWQgQUJJIGZvciBBbmRyb2lkLCByZW1vdmVkIGluIE5ESyByMTdcbiAgICBjYXNlICdhcm12Nyc6XG4gICAgY2FzZSAnYXJtZWFiaSc6XG4gICAgY2FzZSAnYXJtZWFiaS12N2EnOlxuICAgIGNhc2UgJ0FSTSc6XG4gICAgICByZXR1cm4gJ2FybSc7XG4gICAgLy8gY29lcmNlICdhcm02NC12OGEnIC0+ICdhcm02NCdcblxuICAgIGNhc2UgJ2FybTY0LXY4YSc6XG4gICAgICByZXR1cm4gJ2FybTY0JztcbiAgICAvLyBjb2VyY2UgJ2kzODYnLCAneDg2JyAtPiAnaWEzMidcblxuICAgIGNhc2UgJ2kzODYnOlxuICAgIGNhc2UgJ3g4Nic6XG4gICAgICByZXR1cm4gJ2lhMzInO1xuICAgIC8vIGNvZXJjZSAneDg2XzY0JywgJ2lhNjQnLCAneDY0JyAtPiAneDY0J1xuXG4gICAgY2FzZSAneDg2XzY0JzpcbiAgICBjYXNlICdpYTY0JzpcbiAgICAgIHJldHVybiAneDY0JztcbiAgICAvLyBjb2VyY2UgJ21pcHM2NCcgLT4gJ21pcHMnIC8vICdtaXBzJyBhbmQgJ21pcHM2NCcgYXJlIGRlYWQgQUJJcyBmb3IgQW5kcm9pZCwgcmVtb3ZlZCBpbiBOREsgcjE3XG5cbiAgICBjYXNlICdtaXBzNjQnOlxuICAgICAgcmV0dXJuICdtaXBzJztcbiAgICAvLyBjb2VyY2UgJ1Vua25vd24nIC0+ICd1bmtub3duJ1xuXG4gICAgY2FzZSAnVW5rbm93bic6XG4gICAgICByZXR1cm4gJ3Vua25vd24nO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBvcmlnaW5hbDtcbiAgfVxufVxuXG5jb25zdCBwcm9jZXNzJDEgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbnByb2Nlc3MkMS5hYm9ydCA9ICgpID0+IHt9OyAvLyBUT0RPOiBEbyB3ZSBoYXZlIGVxdWl2YWxlbnQgb2YgZm9yY2libHkga2lsbGluZyB0aGUgcHJvY2Vzcz8gV2UgaGF2ZSByZXN0YXJ0LCBidXQgSSB0aGluayB3ZSBqdXN0IHdhbnQgYSBuby1vcCBzdHViIGhlcmVcblxuXG5wcm9jZXNzJDEuYXJjaCA9IHN0YW5kYXJkaXplQXJjaChUaS5QbGF0Zm9ybS5hcmNoaXRlY3R1cmUpO1xucHJvY2VzcyQxLmFyZ3YgPSBbXTsgLy8gVE9ETzogV2hhdCBtYWtlcyBzZW5zZSBoZXJlPyBwYXRoIHRvIHRpdGFuaXVtIGNsaSBmb3IgZmlyc3QgYXJnPyBwYXRoIHRvIHRpLm1haW4vYXBwLmpzIGZvciBzZWNvbmQ/XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm9jZXNzJDEsICdhcmd2MCcsIHtcbiAgdmFsdWU6ICcnLFxuICAvLyBUT0RPOiBQYXRoIHRvIC5hcHAgb24gaU9TP1xuICB3cml0YWJsZTogZmFsc2UsXG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGNvbmZpZ3VyYWJsZTogZmFsc2Vcbn0pO1xuXG5wcm9jZXNzJDEuYmluZGluZyA9ICgpID0+IHtcbiAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgdW5zdXBwb3J0ZWQgYW5kIG5vdCB1c2VyLWZhY2luZyBBUEknKTtcbn07XG5cbnByb2Nlc3MkMS5jaGFubmVsID0gdW5kZWZpbmVkO1xuXG5wcm9jZXNzJDEuY2hkaXIgPSAoKSA9PiB7XG4gIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyB1bnN1cHBvcnRlZCcpO1xufTtcblxucHJvY2VzcyQxLmNvbmZpZyA9IHt9O1xucHJvY2VzcyQxLmNvbm5lY3RlZCA9IGZhbHNlO1xuXG5wcm9jZXNzJDEuY3B1VXNhZ2UgPSAoKSA9PiB7XG4gIC8vIEZJWE1FOiBDYW4gd2UgbG9vayBhdCBPUy5jcHVzIHRvIGdldCB0aGlzIGRhdGE/XG4gIHJldHVybiB7XG4gICAgdXNlcjogMCxcbiAgICBzeXN0ZW06IDBcbiAgfTtcbn07XG5cbnByb2Nlc3MkMS5jd2QgPSAoKSA9PiBfX2Rpcm5hbWU7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm9jZXNzJDEsICdkZWJ1Z1BvcnQnLCB7XG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIGxldCB2YWx1ZSA9IDA7IC8vIGRlZmF1bHQgdG8gMFxuXG4gICAgdHJ5IHtcbiAgICAgIGlmIChcImFuZHJvaWRcIiA9PT0gJ2FuZHJvaWQnKSB7XG4gICAgICAgIGNvbnN0IGFzc2V0cyA9IGtyb2xsLmJpbmRpbmcoJ2Fzc2V0cycpO1xuICAgICAgICBjb25zdCBqc29uID0gYXNzZXRzLnJlYWRBc3NldCgnZGVwbG95Lmpzb24nKTtcblxuICAgICAgICBpZiAoanNvbikge1xuICAgICAgICAgIGNvbnN0IGRlcGxveURhdGEgPSBKU09OLnBhcnNlKGpzb24pO1xuXG4gICAgICAgICAgaWYgKGRlcGxveURhdGEuZGVidWdnZXJQb3J0ICE9PSAtMSkge1xuICAgICAgICAgICAgLy8gLTEgbWVhbnMgbm90IHNldCAobm90IGluIGRlYnVnIG1vZGUpXG4gICAgICAgICAgICB2YWx1ZSA9IGRlcGxveURhdGEuZGVidWdnZXJQb3J0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChmYWxzZSkge1xuICAgICAgICAvLyBpT1MgaXMgMjc3NTMgYXMgb2YgaW9zIDwgMTEuMyBmb3Igc2ltdWxhdG9yc1xuICAgICAgICAvLyBmb3IgMTEuMysgaXQgdXNlcyBhIHVuaXggc29ja2V0XG4gICAgICAgIC8vIGZvciBkZXZpY2VzLCBpdCB1c2VzIHVzYm11eGRcbiAgICAgICAgdmFsdWUgPSAyNzc1MzsgLy8gVE9ETzogQ2FuIHdlIG9ubHkgcmV0dXJuIHRoaXMgZm9yIHNpbXVsYXRvciA8IDExLjM/XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHt9IC8vIGlnbm9yZVxuICAgIC8vIG92ZXJ3cml0ZSB0aGlzIGdldHRlciB3aXRoIHN0YXRpYyB2YWx1ZVxuXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2RlYnVnUG9ydCcsIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfSxcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxucHJvY2VzcyQxLmRpc2Nvbm5lY3QgPSAoKSA9PiB7fTsgLy8gbm8tb3BcblxuXG5wcm9jZXNzJDEuZGxvcGVuID0gKCkgPT4ge1xuICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuZGxvcGVuIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MkMS5lbWl0V2FybmluZyA9IGZ1bmN0aW9uICh3YXJuaW5nLCBvcHRpb25zLCBjb2RlLCBjdG9yKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgbGV0IHR5cGU7XG4gIGxldCBkZXRhaWw7XG5cbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgIHR5cGUgPSBvcHRpb25zO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0Jykge1xuICAgIHR5cGUgPSBvcHRpb25zLnR5cGU7XG4gICAgY29kZSA9IG9wdGlvbnMuY29kZTtcbiAgICBkZXRhaWwgPSBvcHRpb25zLmRldGFpbDtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygd2FybmluZyA9PT0gJ3N0cmluZycpIHtcbiAgICAvLyBUT0RPOiBtYWtlIHVzZSBvZiBgY3RvcmAgYXJnIGZvciBsaW1pdGluZyBzdGFjayB0cmFjZXM/IENhbiBvbmx5IHJlYWxseSBiZSB1c2VkIG9uIFY4XG4gICAgLy8gc2V0IHN0YWNrIHRyYWNlIGxpbWl0IHRvIDAsIHRoZW4gY2FsbCBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh3YXJuaW5nLCBjdG9yKTtcbiAgICB3YXJuaW5nID0gbmV3IEVycm9yKHdhcm5pbmcpO1xuICAgIHdhcm5pbmcubmFtZSA9IHR5cGUgfHwgJ1dhcm5pbmcnO1xuXG4gICAgaWYgKGNvZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgd2FybmluZy5jb2RlID0gY29kZTtcbiAgICB9XG5cbiAgICBpZiAoZGV0YWlsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHdhcm5pbmcuZGV0YWlsID0gZGV0YWlsO1xuICAgIH1cbiAgfSAvLyBUT0RPOiBUaHJvdyBUeXBlRXJyb3IgaWYgbm90IGFuIGluc3RhbmNlb2YgRXJyb3IgYXQgdGhpcyBwb2ludCFcblxuXG4gIGNvbnN0IGlzRGVwcmVjYXRpb24gPSB3YXJuaW5nLm5hbWUgPT09ICdEZXByZWNhdGlvbldhcm5pbmcnO1xuXG4gIGlmIChpc0RlcHJlY2F0aW9uICYmIHByb2Nlc3MkMS5ub0RlcHJlY2F0aW9uKSB7XG4gICAgcmV0dXJuOyAvLyBpZ25vcmVcbiAgfVxuXG4gIGlmIChpc0RlcHJlY2F0aW9uICYmIHByb2Nlc3MkMS50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgdGhyb3cgd2FybmluZztcbiAgfVxuXG4gIHRoaXMuZW1pdCgnd2FybmluZycsIHdhcm5pbmcpO1xufTtcblxuZnVuY3Rpb24gbG9hZEVudkpzb24oKSB7XG4gIHRyeSB7XG4gICAgY29uc3QganNvbkZpbGUgPSBUaS5GaWxlc3lzdGVtLmdldEZpbGUoVGkuRmlsZXN5c3RlbS5yZXNvdXJjZXNEaXJlY3RvcnksICdfZW52Xy5qc29uJyk7XG5cbiAgICBpZiAoanNvbkZpbGUuZXhpc3RzKCkpIHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGpzb25GaWxlLnJlYWQoKS50ZXh0KTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgVGkuQVBJLmVycm9yKGBGYWlsZWQgdG8gcmVhZCBcIl9lbnZfLmpzb25cIi4gUmVhc29uOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gIH1cblxuICByZXR1cm4ge307XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm9jZXNzJDEsICdlbnYnLCB7XG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIGRlbGV0ZSB0aGlzLmVudjtcbiAgICByZXR1cm4gdGhpcy5lbnYgPSBsb2FkRW52SnNvbigpO1xuICB9LFxuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xucHJvY2VzcyQxLmV4ZWNBcmd2ID0gW107XG5wcm9jZXNzJDEuZXhlY1BhdGggPSAnJzsgLy8gRklYTUU6IFdoYXQgbWFrZXMgc2Vuc2UgaGVyZT8gUGF0aCB0byB0aXRhbml1bSBDTEkgaGVyZT9cblxucHJvY2VzcyQxLmV4aXQgPSAoKSA9PiB7XG4gIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5leGl0IGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MkMS5leGl0Q29kZSA9IHVuZGVmaW5lZDtcbnByb2Nlc3MkMS5ub0RlcHJlY2F0aW9uID0gZmFsc2U7XG5wcm9jZXNzJDEucGlkID0gMDsgLy8gRklYTUU6IFNob3VsZCB3ZSB0cnkgYW5kIGFkb3B0ICdpcGFkJy8naXBob25lJyB0byAnZGFyd2luJz8gb3IgJ2lvcyc/XG5cbnByb2Nlc3MkMS5wbGF0Zm9ybSA9IFwiYW5kcm9pZFwiO1xucHJvY2VzcyQxLnBwaWQgPSAwOyAvLyBUT0RPOiBBZGQgcmVsZWFzZSBwcm9wZXJ0eSAoT2JqZWN0KVxuLy8gVE9ETzogQ2FuIHdlIGV4cG9zZSBzdGRvdXQvc3RkZXJyL3N0ZGluIG5hdGl2ZWx5P1xuXG5wcm9jZXNzJDEuc3RkZXJyID0ge1xuICBpc1RUWTogZmFsc2UsXG4gIHdyaXRhYmxlOiB0cnVlLFxuICB3cml0ZTogKGNodW5rLCBlbmNvZGluZywgY2FsbGJhY2spID0+IHtcbiAgICBjb25zb2xlLmVycm9yKGNodW5rKTtcblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcbnByb2Nlc3MkMS5zdGRvdXQgPSB7XG4gIGlzVFRZOiBmYWxzZSxcbiAgd3JpdGFibGU6IHRydWUsXG4gIHdyaXRlOiAoY2h1bmssIGVuY29kaW5nLCBjYWxsYmFjaykgPT4ge1xuICAgIGNvbnNvbGUubG9nKGNodW5rKTtcblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcbnByb2Nlc3MkMS50aXRsZSA9IFRpLkFwcC5uYW1lO1xucHJvY2VzcyQxLnRocm93RGVwcmVjYXRpb24gPSBmYWxzZTtcbnByb2Nlc3MkMS50cmFjZURlcHJlY2F0aW9uID0gZmFsc2U7XG5cbnByb2Nlc3MkMS51bWFzayA9ICgpID0+IDA7IC8vIGp1c3QgYWx3YXlzIHJldHVybiAwXG5cblxucHJvY2VzcyQxLnVwdGltZSA9ICgpID0+IHtcbiAgY29uc3QgZGlmZk1zID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgcmV0dXJuIGRpZmZNcyAvIDEwMDAuMDsgLy8gY29udmVydCB0byBcInNlY29uZHNcIiB3aXRoIGZyYWN0aW9uc1xufTtcblxucHJvY2VzcyQxLnZlcnNpb24gPSBcIjkuMS4wXCI7XG5wcm9jZXNzJDEudmVyc2lvbnMgPSB7XG4gIG1vZHVsZXM6ICcnLFxuICAvLyBUT0RPOiBSZXBvcnQgbW9kdWxlIGFwaSB2ZXJzaW9uIChmb3IgY3VycmVudCBwbGF0Zm9ybSEpXG4gIHY4OiAnJyxcbiAgLy8gVE9ETzogcmVwb3J0IGFuZHJvaWQncyB2OCB2ZXJzaW9uIChpZiBvbiBBbmRyb2lkISlcbiAganNjOiAnJyAvLyBUT0RPOiByZXBvcnQgamF2YXNjcmlwdGNvcmUgdmVyc2lvbiBmb3IgaU9TL1dJbmRvd3M/XG4gIC8vIFRPRE86IFJlcG9ydCBpb3MvQW5kcm9pZC9XaW5kb3dzIHBsYXRmb3JtIHZlcnNpb25zP1xuXG59O1xuZ2xvYmFsLnByb2Nlc3MgPSBwcm9jZXNzJDE7IC8vIGhhbmRsZSBzcGl0dGluZyBvdXQgd2FybmluZ3NcblxuY29uc3QgV0FSTklOR19QUkVGSVggPSBgKHRpdGFuaXVtOiR7cHJvY2VzcyQxLnBpZH0pIGA7XG5wcm9jZXNzJDEub24oJ3dhcm5pbmcnLCB3YXJuaW5nID0+IHtcbiAgY29uc3QgaXNEZXByZWNhdGlvbiA9IHdhcm5pbmcubmFtZSA9PT0gJ0RlcHJlY2F0aW9uV2FybmluZyc7IC8vIGlmIHdlJ3JlIG5vdCBkb2luZyBkZXByZWNhdGlvbnMsIGlnbm9yZSFcblxuICBpZiAoaXNEZXByZWNhdGlvbiAmJiBwcm9jZXNzJDEubm9EZXByZWNhdGlvbikge1xuICAgIHJldHVybjtcbiAgfSAvLyBUT0RPOiBDaGVjayBwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24gYW5kIGlmIHNldCwgaW5jbHVkZSBzdGFjayB0cmFjZSBpbiBtZXNzYWdlIVxuXG5cbiAgbGV0IG1zZyA9IFdBUk5JTkdfUFJFRklYO1xuXG4gIGlmICh3YXJuaW5nLmNvZGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1zZyArPSBgWyR7d2FybmluZy5jb2RlfV0gYDtcbiAgfVxuXG4gIGlmICh3YXJuaW5nLnRvU3RyaW5nKSB7XG4gICAgbXNnICs9IHdhcm5pbmcudG9TdHJpbmcoKTtcbiAgfVxuXG4gIGlmICh3YXJuaW5nLmRldGFpbCkge1xuICAgIG1zZyArPSBgXFxuJHt3YXJuaW5nLmRldGFpbH1gO1xuICB9XG5cbiAgY29uc29sZS5lcnJvcihtc2cpO1xufSk7XG5sZXQgdW5jYXVnaHRFeGNlcHRpb25DYWxsYmFjayA9IG51bGw7XG5cbnByb2Nlc3MkMS5oYXNVbmNhdWdodEV4Y2VwdGlvbkNhcHR1cmVDYWxsYmFjayA9ICgpID0+IHVuY2F1Z2h0RXhjZXB0aW9uQ2FsbGJhY2sgIT09IG51bGw7XG5cbnByb2Nlc3MkMS5zZXRVbmNhdWdodEV4Y2VwdGlvbkNhcHR1cmVDYWxsYmFjayA9IGZuID0+IHtcbiAgaWYgKGZuID09PSBudWxsKSB7XG4gICAgdW5jYXVnaHRFeGNlcHRpb25DYWxsYmFjayA9IG51bGw7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgYXNzZXJ0QXJndW1lbnRUeXBlKGZuLCAnZm4nLCAnZnVuY3Rpb24nKTtcblxuICBpZiAodW5jYXVnaHRFeGNlcHRpb25DYWxsYmFjayAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignYHByb2Nlc3Muc2V0VW5jYXVnaHRFeGNlcHRpb25DYXB0dXJlQ2FsbGJhY2soKWAgd2FzIGNhbGxlZCB3aGlsZSBhIGNhcHR1cmUgY2FsbGJhY2sgd2FzIGFscmVhZHkgYWN0aXZlJyk7XG4gIH1cblxuICB1bmNhdWdodEV4Y2VwdGlvbkNhbGxiYWNrID0gZm47XG59O1xuXG5UaS5BcHAuYWRkRXZlbnRMaXN0ZW5lcigndW5jYXVnaHRFeGNlcHRpb24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgLy8gQ3JlYXRlIGFuIEVycm9yIGluc3RhbmNlIHRoYXQgd3JhcHMgdGhlIGRhdGEgZnJvbSB0aGUgZXZlbnRcbiAgLy8gaWRlYWxseSB3ZSdkIGp1c3QgZm9yd2FyZCBhbG9uZyB0aGUgb3JpZ2luYWwgRXJyb3IhXG4gIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKGV2ZW50Lm1lc3NhZ2UpO1xuICBlcnJvci5zdGFjayA9IGV2ZW50LmJhY2t0cmFjZTtcbiAgZXJyb3IuZmlsZU5hbWUgPSBldmVudC5zb3VyY2VOYW1lO1xuICBlcnJvci5saW5lTnVtYmVyID0gZXZlbnQubGluZTtcbiAgZXJyb3IuY29sdW1uTnVtYmVyID0gZXZlbnQubGluZU9mZnNldDtcblxuICBpZiAocHJvY2VzcyQxLmhhc1VuY2F1Z2h0RXhjZXB0aW9uQ2FwdHVyZUNhbGxiYWNrKCkpIHtcbiAgICByZXR1cm4gdW5jYXVnaHRFeGNlcHRpb25DYWxsYmFjayhlcnJvcik7XG4gIH0gLy8gb3RoZXJ3aXNlIGZvcndhcmQgdGhlIGV2ZW50IVxuXG5cbiAgcHJvY2VzcyQxLmVtaXQoJ3VuY2F1Z2h0RXhjZXB0aW9uJywgZXJyb3IpO1xufSk7XG4vLyBKUyBlbmdpbmUgc2hvdWxkIGJlIGFibGUgdG8gb3B0aW1pemUgZWFzaWVyXG5cbmNsYXNzIENhbGxiYWNrV2l0aEFyZ3Mge1xuICBjb25zdHJ1Y3RvcihmdW5jLCBhcmdzKSB7XG4gICAgdGhpcy5mdW5jID0gZnVuYztcbiAgICB0aGlzLmFyZ3MgPSBhcmdzO1xuICB9XG5cbiAgcnVuKCkge1xuICAgIGlmICh0aGlzLmFyZ3MpIHtcbiAgICAgIHRoaXMuZnVuYy5hcHBseShudWxsLCB0aGlzLmFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZ1bigpO1xuICAgIH1cbiAgfVxuXG59IC8vIG5leHRUaWNrIHZzIHNldEltbWVkaWF0ZSBzaG91bGQgYmUgaGFuZGxlZCBpbiBhIHNlbWktc21hcnQgd2F5XG4vLyBCYXNpY2FsbHkgbmV4dFRpY2sgbmVlZHMgdG8gZHJhaW4gdGhlIGZ1bGwgcXVldWUgKGFuZCBjYW4gY2F1c2UgaW5maW5pdGUgbG9vcHMgaWYgbmV4dFRpY2sgY2FsbGJhY2sgY2FsbHMgbmV4dFRpY2shKVxuLy8gVGhlbiB3ZSBzaG91bGQgZ28gdGhyb3VnaCB0aGUgXCJpbW1lZGlhdGVcIiBxdWV1ZVxuLy8gaHR0cDovL3BsYWZlci5naXRodWIuaW8vMjAxNS8wOS8wOC9uZXh0VGljay12cy1zZXRJbW1lZGlhdGUvXG5cblxuY29uc3QgdGlja1F1ZXVlID0gW107XG5jb25zdCBpbW1lZGlhdGVRdWV1ZSA9IFtdO1xubGV0IGRyYWluaW5nVGlja1F1ZXVlID0gZmFsc2U7XG5sZXQgZHJhaW5RdWV1ZXNUaW1lb3V0ID0gbnVsbDtcbi8qKlxuICogSXRlcmF0aXZlbHkgcnVucyBhbGwgXCJ0aWNrc1wiIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlLlxuICogVGhpcyBjYW4gY2F1c2UgaW5maW5pdGUgcmVjdXJzaW9uIGlmIGEgdGljayBzY2hlZHVsZXMgYW5vdGhlciBmb3JldmVyLlxuICovXG5cbmZ1bmN0aW9uIGRyYWluVGlja1F1ZXVlKCkge1xuICBpZiAoZHJhaW5pbmdUaWNrUXVldWUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBkcmFpbmluZ1RpY2tRdWV1ZSA9IHRydWU7XG5cbiAgd2hpbGUgKHRpY2tRdWV1ZS5sZW5ndGgpIHtcbiAgICBjb25zdCB0aWNrID0gdGlja1F1ZXVlLnNoaWZ0KCk7XG4gICAgdGljay5ydW4oKTtcbiAgfVxuXG4gIGRyYWluaW5nVGlja1F1ZXVlID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWVzKCkge1xuICAvLyBkcmFpbiB0aGUgZnVsbCB0aWNrIHF1ZXVlIGZpcnN0Li4uXG4gIGRyYWluVGlja1F1ZXVlKCk7IC8vIHRpY2sgcXVldWUgc2hvdWxkIGJlIGVtcHR5IVxuXG4gIGNvbnN0IGltbWVkaWF0ZXNSZW1haW5pbmcgPSBwcm9jZXNzSW1tZWRpYXRlUXVldWUoKTtcblxuICBpZiAoaW1tZWRpYXRlc1JlbWFpbmluZyAhPT0gMCkge1xuICAgIC8vIHJlLXNjaGVkdWxlIGRyYWluaW5nIG91ciBxdWV1ZXMsIGFzIHdlIGhhdmUgYXQgbGVhc3Qgb25lIG1vcmUgXCJpbW1lZGlhdGVcIiB0byBoYW5kbGVcbiAgICBkcmFpblF1ZXVlc1RpbWVvdXQgPSBzZXRUaW1lb3V0KGRyYWluUXVldWVzLCAwKTtcbiAgfSBlbHNlIHtcbiAgICBkcmFpblF1ZXVlc1RpbWVvdXQgPSBudWxsO1xuICB9XG59XG4vKipcbiAqIEF0dGVtcHRzIHRvIHByb2Nlc3MgXCJpbW1lZGlhdGVzXCIgKGluIGEgbXVjaCBtb3JlIGxlaXN1cmVseSB3YXkgdGhhbiB0aWNrcylcbiAqIFdlIGdpdmUgYSAxMDBtcyB3aW5kb3cgdG8gcnVuIHRoZW0gaW4gYmVmb3JlIHJlLXNjaGVkdWxpbmcgdGhlIHRpbWVvdXQgdG8gcHJvY2VzcyB0aGVtIGFnYWluLlxuICogSWYgYW55IHRpY2tzIGFyZSBhZGRlZCBkdXJpbmcgaW52b2NhdGlvbiBvZiBpbW1lZGlhdGUsIHdlIGRyYWluIHRoZSB0aWNrIHF1ZXVlIGZ1bGx5IGJlZm9yZVxuICogcHJvY2VlZGluZyB0byBuZXh0IGltbWVkaWF0ZSAoaWYgd2Ugc3RpbGwgaGF2ZSB0aW1lIGluIG91ciB3aW5kb3cpLlxuICogQHJldHVybnMge251bWJlcn0gbnVtYmVyIG9mIHJlbWFpbmluZyBpbW1lZGlhdGVzIHRvIGJlIHByb2Nlc3NlZFxuICovXG5cblxuZnVuY3Rpb24gcHJvY2Vzc0ltbWVkaWF0ZVF1ZXVlKCkge1xuICBjb25zdCBpbW1lZGlhdGVEZWFkbGluZSA9IERhdGUubm93KCkgKyAxMDA7IC8vIGdpdmUgdXMgdXAgdG8gMTAwbXMgdG8gcHJvY2VzcyBpbW1lZGlhdGVzXG5cbiAgd2hpbGUgKGltbWVkaWF0ZVF1ZXVlLmxlbmd0aCAmJiBEYXRlLm5vdygpIDwgaW1tZWRpYXRlRGVhZGxpbmUpIHtcbiAgICBjb25zdCBpbW1lZGlhdGUgPSBpbW1lZGlhdGVRdWV1ZS5zaGlmdCgpO1xuICAgIGltbWVkaWF0ZS5ydW4oKTtcblxuICAgIGlmICh0aWNrUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgLy8gdGhleSBhZGRlZCBhIHRpY2shIGRyYWluIHRoZSB0aWNrIHF1ZXVlIGJlZm9yZSB3ZSBkbyBhbnl0aGluZyBlbHNlICh0aGlzICptYXkqIGVhdCB1cCBvdXIgZGVhZGxpbmUvd2luZG93IHRvIHByb2Nlc3MgYW55IG1vcmUgaW1tZWRpYXRlcylcbiAgICAgIGRyYWluVGlja1F1ZXVlKCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGltbWVkaWF0ZVF1ZXVlLmxlbmd0aDtcbn1cblxucHJvY2VzcyQxLm5leHRUaWNrID0gZnVuY3Rpb24gKGNhbGxiYWNrLCAuLi5hcmdzKSB7XG4gIGFzc2VydEFyZ3VtZW50VHlwZShjYWxsYmFjaywgJ2NhbGxiYWNrJywgJ2Z1bmN0aW9uJyk7XG4gIHRpY2tRdWV1ZS5wdXNoKG5ldyBDYWxsYmFja1dpdGhBcmdzKGNhbGxiYWNrLCBhcmdzKSk7XG5cbiAgaWYgKCFkcmFpblF1ZXVlc1RpbWVvdXQpIHtcbiAgICBkcmFpblF1ZXVlc1RpbWVvdXQgPSBzZXRUaW1lb3V0KGRyYWluUXVldWVzLCAwKTtcbiAgfVxufTtcblxuZ2xvYmFsLnNldEltbWVkaWF0ZSA9IGZ1bmN0aW9uIChjYWxsYmFjaywgLi4uYXJncykge1xuICBhc3NlcnRBcmd1bWVudFR5cGUoY2FsbGJhY2ssICdjYWxsYmFjaycsICdmdW5jdGlvbicpO1xuICBjb25zdCBpbW1lZGlhdGUgPSBuZXcgQ2FsbGJhY2tXaXRoQXJncyhjYWxsYmFjaywgYXJncyk7XG4gIGltbWVkaWF0ZVF1ZXVlLnB1c2goaW1tZWRpYXRlKTtcblxuICBpZiAoIWRyYWluUXVldWVzVGltZW91dCkge1xuICAgIGRyYWluUXVldWVzVGltZW91dCA9IHNldFRpbWVvdXQoZHJhaW5RdWV1ZXMsIDApO1xuICB9XG5cbiAgcmV0dXJuIGltbWVkaWF0ZTtcbn07XG5cbmdsb2JhbC5jbGVhckltbWVkaWF0ZSA9IGZ1bmN0aW9uIChpbW1lZGlhdGUpIHtcbiAgY29uc3QgaW5kZXggPSBpbW1lZGlhdGVRdWV1ZS5pbmRleE9mKGltbWVkaWF0ZSk7XG5cbiAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgIGltbWVkaWF0ZVF1ZXVlLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbn07XG5cbmNvbnN0IEZPUldBUkRfU0xBU0ggPSA0NzsgLy8gJy8nXG5cbmNvbnN0IEJBQ0tXQVJEX1NMQVNIID0gOTI7IC8vICdcXFxcJ1xuXG4vKipcbiAqIElzIHRoaXMgW2EtekEtWl0/XG4gKiBAcGFyYW0gIHtudW1iZXJ9ICBjaGFyQ29kZSB2YWx1ZSBmcm9tIFN0cmluZy5jaGFyQ29kZUF0KClcbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgIFtkZXNjcmlwdGlvbl1cbiAqL1xuXG5mdW5jdGlvbiBpc1dpbmRvd3NEZXZpY2VOYW1lKGNoYXJDb2RlKSB7XG4gIHJldHVybiBjaGFyQ29kZSA+PSA2NSAmJiBjaGFyQ29kZSA8PSA5MCB8fCBjaGFyQ29kZSA+PSA5NyAmJiBjaGFyQ29kZSA8PSAxMjI7XG59XG4vKipcbiAqIFtpc0Fic29sdXRlIGRlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7Ym9vbGVhbn0gaXNQb3NpeCB3aGV0aGVyIHRoaXMgaW1wbCBpcyBmb3IgUE9TSVggb3Igbm90XG4gKiBAcGFyYW0gIHtzdHJpbmd9IGZpbGVwYXRoICAgaW5wdXQgZmlsZSBwYXRoXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgICBbZGVzY3JpcHRpb25dXG4gKi9cblxuXG5mdW5jdGlvbiBpc0Fic29sdXRlKGlzUG9zaXgsIGZpbGVwYXRoKSB7XG4gIGFzc2VydEFyZ3VtZW50VHlwZShmaWxlcGF0aCwgJ3BhdGgnLCAnc3RyaW5nJyk7XG4gIGNvbnN0IGxlbmd0aCA9IGZpbGVwYXRoLmxlbmd0aDsgLy8gZW1wdHkgc3RyaW5nIHNwZWNpYWwgY2FzZVxuXG4gIGlmIChsZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBmaXJzdENoYXIgPSBmaWxlcGF0aC5jaGFyQ29kZUF0KDApO1xuXG4gIGlmIChmaXJzdENoYXIgPT09IEZPUldBUkRfU0xBU0gpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSAvLyB3ZSBhbHJlYWR5IGRpZCBvdXIgY2hlY2tzIGZvciBwb3NpeFxuXG5cbiAgaWYgKGlzUG9zaXgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gLy8gd2luMzIgZnJvbSBoZXJlIG9uIG91dFxuXG5cbiAgaWYgKGZpcnN0Q2hhciA9PT0gQkFDS1dBUkRfU0xBU0gpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmIChsZW5ndGggPiAyICYmIGlzV2luZG93c0RldmljZU5hbWUoZmlyc3RDaGFyKSAmJiBmaWxlcGF0aC5jaGFyQXQoMSkgPT09ICc6Jykge1xuICAgIGNvbnN0IHRoaXJkQ2hhciA9IGZpbGVwYXRoLmNoYXJBdCgyKTtcbiAgICByZXR1cm4gdGhpcmRDaGFyID09PSAnLycgfHwgdGhpcmRDaGFyID09PSAnXFxcXCc7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG4vKipcbiAqIFtkaXJuYW1lIGRlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7c3RyaW5nfSBzZXBhcmF0b3IgIHBsYXRmb3JtLXNwZWNpZmljIGZpbGUgc2VwYXJhdG9yXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGZpbGVwYXRoICAgaW5wdXQgZmlsZSBwYXRoXG4gKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgICAgICAgW2Rlc2NyaXB0aW9uXVxuICovXG5cblxuZnVuY3Rpb24gZGlybmFtZShzZXBhcmF0b3IsIGZpbGVwYXRoKSB7XG4gIGFzc2VydEFyZ3VtZW50VHlwZShmaWxlcGF0aCwgJ3BhdGgnLCAnc3RyaW5nJyk7XG4gIGNvbnN0IGxlbmd0aCA9IGZpbGVwYXRoLmxlbmd0aDtcblxuICBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuICcuJztcbiAgfSAvLyBpZ25vcmUgdHJhaWxpbmcgc2VwYXJhdG9yXG5cblxuICBsZXQgZnJvbUluZGV4ID0gbGVuZ3RoIC0gMTtcbiAgY29uc3QgaGFkVHJhaWxpbmcgPSBmaWxlcGF0aC5lbmRzV2l0aChzZXBhcmF0b3IpO1xuXG4gIGlmIChoYWRUcmFpbGluZykge1xuICAgIGZyb21JbmRleC0tO1xuICB9XG5cbiAgY29uc3QgZm91bmRJbmRleCA9IGZpbGVwYXRoLmxhc3RJbmRleE9mKHNlcGFyYXRvciwgZnJvbUluZGV4KTsgLy8gbm8gc2VwYXJhdG9yc1xuXG4gIGlmIChmb3VuZEluZGV4ID09PSAtMSkge1xuICAgIC8vIGhhbmRsZSBzcGVjaWFsIGNhc2Ugb2Ygcm9vdCB3aW5kb3dzIHBhdGhzXG4gICAgaWYgKGxlbmd0aCA+PSAyICYmIHNlcGFyYXRvciA9PT0gJ1xcXFwnICYmIGZpbGVwYXRoLmNoYXJBdCgxKSA9PT0gJzonKSB7XG4gICAgICBjb25zdCBmaXJzdENoYXIgPSBmaWxlcGF0aC5jaGFyQ29kZUF0KDApO1xuXG4gICAgICBpZiAoaXNXaW5kb3dzRGV2aWNlTmFtZShmaXJzdENoYXIpKSB7XG4gICAgICAgIHJldHVybiBmaWxlcGF0aDsgLy8gaXQncyBhIHJvb3Qgd2luZG93cyBwYXRoXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuICcuJztcbiAgfSAvLyBvbmx5IGZvdW5kIHJvb3Qgc2VwYXJhdG9yXG5cblxuICBpZiAoZm91bmRJbmRleCA9PT0gMCkge1xuICAgIHJldHVybiBzZXBhcmF0b3I7IC8vIGlmIGl0IHdhcyAnLycsIHJldHVybiB0aGF0XG4gIH0gLy8gSGFuZGxlIHNwZWNpYWwgY2FzZSBvZiAnLy9zb21ldGhpbmcnXG5cblxuICBpZiAoZm91bmRJbmRleCA9PT0gMSAmJiBzZXBhcmF0b3IgPT09ICcvJyAmJiBmaWxlcGF0aC5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgIHJldHVybiAnLy8nO1xuICB9XG5cbiAgcmV0dXJuIGZpbGVwYXRoLnNsaWNlKDAsIGZvdW5kSW5kZXgpO1xufVxuLyoqXG4gKiBbZXh0bmFtZSBkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge3N0cmluZ30gc2VwYXJhdG9yICBwbGF0Zm9ybS1zcGVjaWZpYyBmaWxlIHNlcGFyYXRvclxuICogQHBhcmFtICB7c3RyaW5nfSBmaWxlcGF0aCAgIGlucHV0IGZpbGUgcGF0aFxuICogQHJldHVybiB7c3RyaW5nfSAgICAgICAgICAgIFtkZXNjcmlwdGlvbl1cbiAqL1xuXG5cbmZ1bmN0aW9uIGV4dG5hbWUoc2VwYXJhdG9yLCBmaWxlcGF0aCkge1xuICBhc3NlcnRBcmd1bWVudFR5cGUoZmlsZXBhdGgsICdwYXRoJywgJ3N0cmluZycpO1xuICBjb25zdCBpbmRleCA9IGZpbGVwYXRoLmxhc3RJbmRleE9mKCcuJyk7XG5cbiAgaWYgKGluZGV4ID09PSAtMSB8fCBpbmRleCA9PT0gMCkge1xuICAgIHJldHVybiAnJztcbiAgfSAvLyBpZ25vcmUgdHJhaWxpbmcgc2VwYXJhdG9yXG5cblxuICBsZXQgZW5kSW5kZXggPSBmaWxlcGF0aC5sZW5ndGg7XG5cbiAgaWYgKGZpbGVwYXRoLmVuZHNXaXRoKHNlcGFyYXRvcikpIHtcbiAgICBlbmRJbmRleC0tO1xuICB9XG5cbiAgcmV0dXJuIGZpbGVwYXRoLnNsaWNlKGluZGV4LCBlbmRJbmRleCk7XG59XG5cbmZ1bmN0aW9uIGxhc3RJbmRleFdpbjMyU2VwYXJhdG9yKGZpbGVwYXRoLCBpbmRleCkge1xuICBmb3IgKGxldCBpID0gaW5kZXg7IGkgPj0gMDsgaS0tKSB7XG4gICAgY29uc3QgY2hhciA9IGZpbGVwYXRoLmNoYXJDb2RlQXQoaSk7XG5cbiAgICBpZiAoY2hhciA9PT0gQkFDS1dBUkRfU0xBU0ggfHwgY2hhciA9PT0gRk9SV0FSRF9TTEFTSCkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xO1xufVxuLyoqXG4gKiBbYmFzZW5hbWUgZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHNlcGFyYXRvciAgcGxhdGZvcm0tc3BlY2lmaWMgZmlsZSBzZXBhcmF0b3JcbiAqIEBwYXJhbSAge3N0cmluZ30gZmlsZXBhdGggICBpbnB1dCBmaWxlIHBhdGhcbiAqIEBwYXJhbSAge3N0cmluZ30gW2V4dF0gICAgICBmaWxlIGV4dGVuc2lvbiB0byBkcm9wIGlmIGl0IGV4aXN0c1xuICogQHJldHVybiB7c3RyaW5nfSAgICAgICAgICAgIFtkZXNjcmlwdGlvbl1cbiAqL1xuXG5cbmZ1bmN0aW9uIGJhc2VuYW1lKHNlcGFyYXRvciwgZmlsZXBhdGgsIGV4dCkge1xuICBhc3NlcnRBcmd1bWVudFR5cGUoZmlsZXBhdGgsICdwYXRoJywgJ3N0cmluZycpO1xuXG4gIGlmIChleHQgIT09IHVuZGVmaW5lZCkge1xuICAgIGFzc2VydEFyZ3VtZW50VHlwZShleHQsICdleHQnLCAnc3RyaW5nJyk7XG4gIH1cblxuICBjb25zdCBsZW5ndGggPSBmaWxlcGF0aC5sZW5ndGg7XG5cbiAgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGNvbnN0IGlzUG9zaXggPSBzZXBhcmF0b3IgPT09ICcvJztcbiAgbGV0IGVuZEluZGV4ID0gbGVuZ3RoOyAvLyBkcm9wIHRyYWlsaW5nIHNlcGFyYXRvciAoaWYgdGhlcmUgaXMgb25lKVxuXG4gIGNvbnN0IGxhc3RDaGFyQ29kZSA9IGZpbGVwYXRoLmNoYXJDb2RlQXQobGVuZ3RoIC0gMSk7XG5cbiAgaWYgKGxhc3RDaGFyQ29kZSA9PT0gRk9SV0FSRF9TTEFTSCB8fCAhaXNQb3NpeCAmJiBsYXN0Q2hhckNvZGUgPT09IEJBQ0tXQVJEX1NMQVNIKSB7XG4gICAgZW5kSW5kZXgtLTtcbiAgfSAvLyBGaW5kIGxhc3Qgb2NjdXJlbmNlIG9mIHNlcGFyYXRvclxuXG5cbiAgbGV0IGxhc3RJbmRleCA9IC0xO1xuXG4gIGlmIChpc1Bvc2l4KSB7XG4gICAgbGFzdEluZGV4ID0gZmlsZXBhdGgubGFzdEluZGV4T2Yoc2VwYXJhdG9yLCBlbmRJbmRleCAtIDEpO1xuICB9IGVsc2Uge1xuICAgIC8vIE9uIHdpbjMyLCBoYW5kbGUgKmVpdGhlciogc2VwYXJhdG9yIVxuICAgIGxhc3RJbmRleCA9IGxhc3RJbmRleFdpbjMyU2VwYXJhdG9yKGZpbGVwYXRoLCBlbmRJbmRleCAtIDEpOyAvLyBoYW5kbGUgc3BlY2lhbCBjYXNlIG9mIHJvb3QgcGF0aCBsaWtlICdDOicgb3IgJ0M6XFxcXCdcblxuICAgIGlmICgobGFzdEluZGV4ID09PSAyIHx8IGxhc3RJbmRleCA9PT0gLTEpICYmIGZpbGVwYXRoLmNoYXJBdCgxKSA9PT0gJzonICYmIGlzV2luZG93c0RldmljZU5hbWUoZmlsZXBhdGguY2hhckNvZGVBdCgwKSkpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH0gLy8gVGFrZSBmcm9tIGxhc3Qgb2NjdXJyZW5jZSBvZiBzZXBhcmF0b3IgdG8gZW5kIG9mIHN0cmluZyAob3IgYmVnaW5uaW5nIHRvIGVuZCBpZiBub3QgZm91bmQpXG5cblxuICBjb25zdCBiYXNlID0gZmlsZXBhdGguc2xpY2UobGFzdEluZGV4ICsgMSwgZW5kSW5kZXgpOyAvLyBkcm9wIHRyYWlsaW5nIGV4dGVuc2lvbiAoaWYgc3BlY2lmaWVkKVxuXG4gIGlmIChleHQgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBiYXNlO1xuICB9XG5cbiAgcmV0dXJuIGJhc2UuZW5kc1dpdGgoZXh0KSA/IGJhc2Uuc2xpY2UoMCwgYmFzZS5sZW5ndGggLSBleHQubGVuZ3RoKSA6IGJhc2U7XG59XG4vKipcbiAqIFRoZSBgcGF0aC5ub3JtYWxpemUoKWAgbWV0aG9kIG5vcm1hbGl6ZXMgdGhlIGdpdmVuIHBhdGgsIHJlc29sdmluZyAnLi4nIGFuZCAnLicgc2VnbWVudHMuXG4gKlxuICogV2hlbiBtdWx0aXBsZSwgc2VxdWVudGlhbCBwYXRoIHNlZ21lbnQgc2VwYXJhdGlvbiBjaGFyYWN0ZXJzIGFyZSBmb3VuZCAoZS5nLlxuICogLyBvbiBQT1NJWCBhbmQgZWl0aGVyIFxcIG9yIC8gb24gV2luZG93cyksIHRoZXkgYXJlIHJlcGxhY2VkIGJ5IGEgc2luZ2xlXG4gKiBpbnN0YW5jZSBvZiB0aGUgcGxhdGZvcm0tc3BlY2lmaWMgcGF0aCBzZWdtZW50IHNlcGFyYXRvciAoLyBvbiBQT1NJWCBhbmQgXFxcbiAqIG9uIFdpbmRvd3MpLiBUcmFpbGluZyBzZXBhcmF0b3JzIGFyZSBwcmVzZXJ2ZWQuXG4gKlxuICogSWYgdGhlIHBhdGggaXMgYSB6ZXJvLWxlbmd0aCBzdHJpbmcsICcuJyBpcyByZXR1cm5lZCwgcmVwcmVzZW50aW5nIHRoZVxuICogY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS5cbiAqXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHNlcGFyYXRvciAgcGxhdGZvcm0tc3BlY2lmaWMgZmlsZSBzZXBhcmF0b3JcbiAqIEBwYXJhbSAge3N0cmluZ30gZmlsZXBhdGggIGlucHV0IGZpbGUgcGF0aFxuICogQHJldHVybiB7c3RyaW5nfSBbZGVzY3JpcHRpb25dXG4gKi9cblxuXG5mdW5jdGlvbiBub3JtYWxpemUoc2VwYXJhdG9yLCBmaWxlcGF0aCkge1xuICBhc3NlcnRBcmd1bWVudFR5cGUoZmlsZXBhdGgsICdwYXRoJywgJ3N0cmluZycpO1xuXG4gIGlmIChmaWxlcGF0aC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gJy4nO1xuICB9IC8vIFdpbmRvd3MgY2FuIGhhbmRsZSAnLycgb3IgJ1xcXFwnIGFuZCBib3RoIHNob3VsZCBiZSB0dXJuZWQgaW50byBzZXBhcmF0b3JcblxuXG4gIGNvbnN0IGlzV2luZG93cyA9IHNlcGFyYXRvciA9PT0gJ1xcXFwnO1xuXG4gIGlmIChpc1dpbmRvd3MpIHtcbiAgICBmaWxlcGF0aCA9IGZpbGVwYXRoLnJlcGxhY2UoL1xcLy9nLCBzZXBhcmF0b3IpO1xuICB9XG5cbiAgY29uc3QgaGFkTGVhZGluZyA9IGZpbGVwYXRoLnN0YXJ0c1dpdGgoc2VwYXJhdG9yKTsgLy8gT24gV2luZG93cywgbmVlZCB0byBoYW5kbGUgVU5DIHBhdGhzIChcXFxcaG9zdC1uYW1lXFxcXHJlc291cmNlXFxcXGRpcikgc3BlY2lhbCB0byByZXRhaW4gbGVhZGluZyBkb3VibGUgYmFja3NsYXNoXG5cbiAgY29uc3QgaXNVTkMgPSBoYWRMZWFkaW5nICYmIGlzV2luZG93cyAmJiBmaWxlcGF0aC5sZW5ndGggPiAyICYmIGZpbGVwYXRoLmNoYXJBdCgxKSA9PT0gJ1xcXFwnO1xuICBjb25zdCBoYWRUcmFpbGluZyA9IGZpbGVwYXRoLmVuZHNXaXRoKHNlcGFyYXRvcik7XG4gIGNvbnN0IHBhcnRzID0gZmlsZXBhdGguc3BsaXQoc2VwYXJhdG9yKTtcbiAgY29uc3QgcmVzdWx0ID0gW107XG5cbiAgZm9yIChjb25zdCBzZWdtZW50IG9mIHBhcnRzKSB7XG4gICAgaWYgKHNlZ21lbnQubGVuZ3RoICE9PSAwICYmIHNlZ21lbnQgIT09ICcuJykge1xuICAgICAgaWYgKHNlZ21lbnQgPT09ICcuLicpIHtcbiAgICAgICAgcmVzdWx0LnBvcCgpOyAvLyBGSVhNRTogV2hhdCBpZiB0aGlzIGdvZXMgYWJvdmUgcm9vdD8gU2hvdWxkIHdlIHRocm93IGFuIGVycm9yP1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0LnB1c2goc2VnbWVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbGV0IG5vcm1hbGl6ZWQgPSBoYWRMZWFkaW5nID8gc2VwYXJhdG9yIDogJyc7XG4gIG5vcm1hbGl6ZWQgKz0gcmVzdWx0LmpvaW4oc2VwYXJhdG9yKTtcblxuICBpZiAoaGFkVHJhaWxpbmcpIHtcbiAgICBub3JtYWxpemVkICs9IHNlcGFyYXRvcjtcbiAgfVxuXG4gIGlmIChpc1VOQykge1xuICAgIG5vcm1hbGl6ZWQgPSAnXFxcXCcgKyBub3JtYWxpemVkO1xuICB9XG5cbiAgcmV0dXJuIG5vcm1hbGl6ZWQ7XG59XG4vKipcbiAqIFthc3NlcnRTZWdtZW50IGRlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7Kn0gc2VnbWVudCBbZGVzY3JpcHRpb25dXG4gKiBAcmV0dXJuIHt2b2lkfSAgICAgICAgIFtkZXNjcmlwdGlvbl1cbiAqL1xuXG5cbmZ1bmN0aW9uIGFzc2VydFNlZ21lbnQoc2VnbWVudCkge1xuICBpZiAodHlwZW9mIHNlZ21lbnQgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgUGF0aCBtdXN0IGJlIGEgc3RyaW5nLiBSZWNlaXZlZCAke3NlZ21lbnR9YCk7XG4gIH1cbn1cbi8qKlxuICogVGhlIGBwYXRoLmpvaW4oKWAgbWV0aG9kIGpvaW5zIGFsbCBnaXZlbiBwYXRoIHNlZ21lbnRzIHRvZ2V0aGVyIHVzaW5nIHRoZVxuICogcGxhdGZvcm0tc3BlY2lmaWMgc2VwYXJhdG9yIGFzIGEgZGVsaW1pdGVyLCB0aGVuIG5vcm1hbGl6ZXMgdGhlIHJlc3VsdGluZyBwYXRoLlxuICogWmVyby1sZW5ndGggcGF0aCBzZWdtZW50cyBhcmUgaWdub3JlZC4gSWYgdGhlIGpvaW5lZCBwYXRoIHN0cmluZyBpcyBhIHplcm8tXG4gKiBsZW5ndGggc3RyaW5nIHRoZW4gJy4nIHdpbGwgYmUgcmV0dXJuZWQsIHJlcHJlc2VudGluZyB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS5cbiAqIEBwYXJhbSAge3N0cmluZ30gc2VwYXJhdG9yIHBsYXRmb3JtLXNwZWNpZmljIGZpbGUgc2VwYXJhdG9yXG4gKiBAcGFyYW0gIHtzdHJpbmdbXX0gcGF0aHMgW2Rlc2NyaXB0aW9uXVxuICogQHJldHVybiB7c3RyaW5nfSAgICAgICBUaGUgam9pbmVkIGZpbGVwYXRoXG4gKi9cblxuXG5mdW5jdGlvbiBqb2luJDEoc2VwYXJhdG9yLCBwYXRocykge1xuICBjb25zdCByZXN1bHQgPSBbXTsgLy8gbmFpdmUgaW1wbDoganVzdCBqb2luIGFsbCB0aGUgcGF0aHMgd2l0aCBzZXBhcmF0b3JcblxuICBmb3IgKGNvbnN0IHNlZ21lbnQgb2YgcGF0aHMpIHtcbiAgICBhc3NlcnRTZWdtZW50KHNlZ21lbnQpO1xuXG4gICAgaWYgKHNlZ21lbnQubGVuZ3RoICE9PSAwKSB7XG4gICAgICByZXN1bHQucHVzaChzZWdtZW50KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbm9ybWFsaXplKHNlcGFyYXRvciwgcmVzdWx0LmpvaW4oc2VwYXJhdG9yKSk7XG59XG4vKipcbiAqIFRoZSBgcGF0aC5yZXNvbHZlKClgIG1ldGhvZCByZXNvbHZlcyBhIHNlcXVlbmNlIG9mIHBhdGhzIG9yIHBhdGggc2VnbWVudHMgaW50byBhbiBhYnNvbHV0ZSBwYXRoLlxuICpcbiAqIEBwYXJhbSAge3N0cmluZ30gc2VwYXJhdG9yIHBsYXRmb3JtLXNwZWNpZmljIGZpbGUgc2VwYXJhdG9yXG4gKiBAcGFyYW0gIHtzdHJpbmdbXX0gcGF0aHMgW2Rlc2NyaXB0aW9uXVxuICogQHJldHVybiB7c3RyaW5nfSAgICAgICBbZGVzY3JpcHRpb25dXG4gKi9cblxuXG5mdW5jdGlvbiByZXNvbHZlKHNlcGFyYXRvciwgcGF0aHMpIHtcbiAgbGV0IHJlc29sdmVkID0gJyc7XG4gIGxldCBoaXRSb290ID0gZmFsc2U7XG4gIGNvbnN0IGlzUG9zaXggPSBzZXBhcmF0b3IgPT09ICcvJzsgLy8gZ28gZnJvbSByaWdodCB0byBsZWZ0IHVudGlsIHdlIGhpdCBhYnNvbHV0ZSBwYXRoL3Jvb3RcblxuICBmb3IgKGxldCBpID0gcGF0aHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBjb25zdCBzZWdtZW50ID0gcGF0aHNbaV07XG4gICAgYXNzZXJ0U2VnbWVudChzZWdtZW50KTtcblxuICAgIGlmIChzZWdtZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29udGludWU7IC8vIHNraXAgZW1wdHlcbiAgICB9XG5cbiAgICByZXNvbHZlZCA9IHNlZ21lbnQgKyBzZXBhcmF0b3IgKyByZXNvbHZlZDsgLy8gcHJlcGVuZCBuZXcgc2VnbWVudFxuXG4gICAgaWYgKGlzQWJzb2x1dGUoaXNQb3NpeCwgc2VnbWVudCkpIHtcbiAgICAgIC8vIGhhdmUgd2UgYmFja2VkIGludG8gYW4gYWJzb2x1dGUgcGF0aD9cbiAgICAgIGhpdFJvb3QgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9IC8vIGlmIHdlIGRpZG4ndCBoaXQgcm9vdCwgcHJlcGVuZCBjd2RcblxuXG4gIGlmICghaGl0Um9vdCkge1xuICAgIHJlc29sdmVkID0gcHJvY2Vzcy5jd2QoKSArIHNlcGFyYXRvciArIHJlc29sdmVkO1xuICB9XG5cbiAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZShzZXBhcmF0b3IsIHJlc29sdmVkKTtcblxuICBpZiAobm9ybWFsaXplZC5jaGFyQXQobm9ybWFsaXplZC5sZW5ndGggLSAxKSA9PT0gc2VwYXJhdG9yKSB7XG4gICAgLy8gRklYTUU6IEhhbmRsZSBVTkMgcGF0aHMgb24gV2luZG93cyBhcyB3ZWxsLCBzbyB3ZSBkb24ndCB0cmltIHRyYWlsaW5nIHNlcGFyYXRvciBvbiBzb21ldGhpbmcgbGlrZSAnXFxcXFxcXFxob3N0LW5hbWVcXFxccmVzb3VyY2VcXFxcJ1xuICAgIC8vIERvbid0IHJlbW92ZSB0cmFpbGluZyBzZXBhcmF0b3IgaWYgdGhpcyBpcyByb290IHBhdGggb24gd2luZG93cyFcbiAgICBpZiAoIWlzUG9zaXggJiYgbm9ybWFsaXplZC5sZW5ndGggPT09IDMgJiYgbm9ybWFsaXplZC5jaGFyQXQoMSkgPT09ICc6JyAmJiBpc1dpbmRvd3NEZXZpY2VOYW1lKG5vcm1hbGl6ZWQuY2hhckNvZGVBdCgwKSkpIHtcbiAgICAgIHJldHVybiBub3JtYWxpemVkO1xuICAgIH0gLy8gb3RoZXJ3aXNlIHRyaW0gdHJhaWxpbmcgc2VwYXJhdG9yXG5cblxuICAgIHJldHVybiBub3JtYWxpemVkLnNsaWNlKDAsIG5vcm1hbGl6ZWQubGVuZ3RoIC0gMSk7XG4gIH1cblxuICByZXR1cm4gbm9ybWFsaXplZDtcbn1cbi8qKlxuICogVGhlIGBwYXRoLnJlbGF0aXZlKClgIG1ldGhvZCByZXR1cm5zIHRoZSByZWxhdGl2ZSBwYXRoIGBmcm9tYCBmcm9tIHRvIGB0b2AgYmFzZWRcbiAqIG9uIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LiBJZiBmcm9tIGFuZCB0byBlYWNoIHJlc29sdmUgdG8gdGhlIHNhbWVcbiAqIHBhdGggKGFmdGVyIGNhbGxpbmcgYHBhdGgucmVzb2x2ZSgpYCBvbiBlYWNoKSwgYSB6ZXJvLWxlbmd0aCBzdHJpbmcgaXMgcmV0dXJuZWQuXG4gKlxuICogSWYgYSB6ZXJvLWxlbmd0aCBzdHJpbmcgaXMgcGFzc2VkIGFzIGBmcm9tYCBvciBgdG9gLCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICogd2lsbCBiZSB1c2VkIGluc3RlYWQgb2YgdGhlIHplcm8tbGVuZ3RoIHN0cmluZ3MuXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSBzZXBhcmF0b3IgcGxhdGZvcm0tc3BlY2lmaWMgZmlsZSBzZXBhcmF0b3JcbiAqIEBwYXJhbSAge3N0cmluZ30gZnJvbSBbZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHRvICAgW2Rlc2NyaXB0aW9uXVxuICogQHJldHVybiB7c3RyaW5nfSAgICAgIFtkZXNjcmlwdGlvbl1cbiAqL1xuXG5cbmZ1bmN0aW9uIHJlbGF0aXZlKHNlcGFyYXRvciwgZnJvbSwgdG8pIHtcbiAgYXNzZXJ0QXJndW1lbnRUeXBlKGZyb20sICdmcm9tJywgJ3N0cmluZycpO1xuICBhc3NlcnRBcmd1bWVudFR5cGUodG8sICd0bycsICdzdHJpbmcnKTtcblxuICBpZiAoZnJvbSA9PT0gdG8pIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBmcm9tID0gcmVzb2x2ZShzZXBhcmF0b3IsIFtmcm9tXSk7XG4gIHRvID0gcmVzb2x2ZShzZXBhcmF0b3IsIFt0b10pO1xuXG4gIGlmIChmcm9tID09PSB0bykge1xuICAgIHJldHVybiAnJztcbiAgfSAvLyB3ZSBub3cgaGF2ZSB0d28gYWJzb2x1dGUgcGF0aHMsXG4gIC8vIGxldHMgXCJnbyB1cFwiIGZyb20gYGZyb21gIHVudGlsIHdlIHJlYWNoIGNvbW1vbiBiYXNlIGRpciBvZiBgdG9gXG4gIC8vIGNvbnN0IG9yaWdpbmFsRnJvbSA9IGZyb207XG5cblxuICBsZXQgdXBDb3VudCA9IDA7XG4gIGxldCByZW1haW5pbmdQYXRoID0gJyc7XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBpZiAodG8uc3RhcnRzV2l0aChmcm9tKSkge1xuICAgICAgLy8gbWF0Y2ghIHJlY29yZCByZXN0Li4uP1xuICAgICAgcmVtYWluaW5nUGF0aCA9IHRvLnNsaWNlKGZyb20ubGVuZ3RoKTtcbiAgICAgIGJyZWFrO1xuICAgIH0gLy8gRklYTUU6IEJyZWFrL3Rocm93IGlmIHdlIGhpdCBiYWQgZWRnZSBjYXNlIG9mIG5vIGNvbW1vbiByb290IVxuXG5cbiAgICBmcm9tID0gZGlybmFtZShzZXBhcmF0b3IsIGZyb20pO1xuICAgIHVwQ291bnQrKztcbiAgfSAvLyByZW1vdmUgbGVhZGluZyBzZXBhcmF0b3IgZnJvbSByZW1haW5pbmdQYXRoIGlmIHRoZXJlIGlzIGFueVxuXG5cbiAgaWYgKHJlbWFpbmluZ1BhdGgubGVuZ3RoID4gMCkge1xuICAgIHJlbWFpbmluZ1BhdGggPSByZW1haW5pbmdQYXRoLnNsaWNlKDEpO1xuICB9XG5cbiAgcmV0dXJuICgnLi4nICsgc2VwYXJhdG9yKS5yZXBlYXQodXBDb3VudCkgKyByZW1haW5pbmdQYXRoO1xufVxuLyoqXG4gKiBUaGUgYHBhdGgucGFyc2UoKWAgbWV0aG9kIHJldHVybnMgYW4gb2JqZWN0IHdob3NlIHByb3BlcnRpZXMgcmVwcmVzZW50XG4gKiBzaWduaWZpY2FudCBlbGVtZW50cyBvZiB0aGUgcGF0aC4gVHJhaWxpbmcgZGlyZWN0b3J5IHNlcGFyYXRvcnMgYXJlIGlnbm9yZWQsXG4gKiBzZWUgYHBhdGguc2VwYC5cbiAqXG4gKiBUaGUgcmV0dXJuZWQgb2JqZWN0IHdpbGwgaGF2ZSB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogLSBkaXIgPHN0cmluZz5cbiAqIC0gcm9vdCA8c3RyaW5nPlxuICogLSBiYXNlIDxzdHJpbmc+XG4gKiAtIG5hbWUgPHN0cmluZz5cbiAqIC0gZXh0IDxzdHJpbmc+XG4gKiBAcGFyYW0gIHtzdHJpbmd9IHNlcGFyYXRvciBwbGF0Zm9ybS1zcGVjaWZpYyBmaWxlIHNlcGFyYXRvclxuICogQHBhcmFtICB7c3RyaW5nfSBmaWxlcGF0aCBbZGVzY3JpcHRpb25dXG4gKiBAcmV0dXJuIHtvYmplY3R9XG4gKi9cblxuXG5mdW5jdGlvbiBwYXJzZShzZXBhcmF0b3IsIGZpbGVwYXRoKSB7XG4gIGFzc2VydEFyZ3VtZW50VHlwZShmaWxlcGF0aCwgJ3BhdGgnLCAnc3RyaW5nJyk7XG4gIGNvbnN0IHJlc3VsdCA9IHtcbiAgICByb290OiAnJyxcbiAgICBkaXI6ICcnLFxuICAgIGJhc2U6ICcnLFxuICAgIGV4dDogJycsXG4gICAgbmFtZTogJydcbiAgfTtcbiAgY29uc3QgbGVuZ3RoID0gZmlsZXBhdGgubGVuZ3RoO1xuXG4gIGlmIChsZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IC8vIENoZWF0IGFuZCBqdXN0IGNhbGwgb3VyIG90aGVyIG1ldGhvZHMgZm9yIGRpcm5hbWUvYmFzZW5hbWUvZXh0bmFtZT9cblxuXG4gIHJlc3VsdC5iYXNlID0gYmFzZW5hbWUoc2VwYXJhdG9yLCBmaWxlcGF0aCk7XG4gIHJlc3VsdC5leHQgPSBleHRuYW1lKHNlcGFyYXRvciwgcmVzdWx0LmJhc2UpO1xuICBjb25zdCBiYXNlTGVuZ3RoID0gcmVzdWx0LmJhc2UubGVuZ3RoO1xuICByZXN1bHQubmFtZSA9IHJlc3VsdC5iYXNlLnNsaWNlKDAsIGJhc2VMZW5ndGggLSByZXN1bHQuZXh0Lmxlbmd0aCk7XG4gIGNvbnN0IHRvU3VidHJhY3QgPSBiYXNlTGVuZ3RoID09PSAwID8gMCA6IGJhc2VMZW5ndGggKyAxO1xuICByZXN1bHQuZGlyID0gZmlsZXBhdGguc2xpY2UoMCwgZmlsZXBhdGgubGVuZ3RoIC0gdG9TdWJ0cmFjdCk7IC8vIGRyb3AgdHJhaWxpbmcgc2VwYXJhdG9yIVxuXG4gIGNvbnN0IGZpcnN0Q2hhckNvZGUgPSBmaWxlcGF0aC5jaGFyQ29kZUF0KDApOyAvLyBib3RoIHdpbjMyIGFuZCBQT1NJWCByZXR1cm4gJy8nIHJvb3RcblxuICBpZiAoZmlyc3RDaGFyQ29kZSA9PT0gRk9SV0FSRF9TTEFTSCkge1xuICAgIHJlc3VsdC5yb290ID0gJy8nO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gLy8gd2UncmUgZG9uZSB3aXRoIFBPU0lYLi4uXG5cblxuICBpZiAoc2VwYXJhdG9yID09PSAnLycpIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IC8vIGZvciB3aW4zMi4uLlxuXG5cbiAgaWYgKGZpcnN0Q2hhckNvZGUgPT09IEJBQ0tXQVJEX1NMQVNIKSB7XG4gICAgLy8gRklYTUU6IEhhbmRsZSBVTkMgcGF0aHMgbGlrZSAnXFxcXFxcXFxob3N0LW5hbWVcXFxccmVzb3VyY2VcXFxcZmlsZV9wYXRoJ1xuICAgIC8vIG5lZWQgdG8gcmV0YWluICdcXFxcXFxcXGhvc3QtbmFtZVxcXFxyZXNvdXJjZVxcXFwnIGFzIHJvb3QgaW4gdGhhdCBjYXNlIVxuICAgIHJlc3VsdC5yb290ID0gJ1xcXFwnO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gLy8gY2hlY2sgZm9yIEM6IHN0eWxlIHJvb3RcblxuXG4gIGlmIChsZW5ndGggPiAxICYmIGlzV2luZG93c0RldmljZU5hbWUoZmlyc3RDaGFyQ29kZSkgJiYgZmlsZXBhdGguY2hhckF0KDEpID09PSAnOicpIHtcbiAgICBpZiAobGVuZ3RoID4gMikge1xuICAgICAgLy8gaXMgaXQgbGlrZSBDOlxcXFw/XG4gICAgICBjb25zdCB0aGlyZENoYXJDb2RlID0gZmlsZXBhdGguY2hhckNvZGVBdCgyKTtcblxuICAgICAgaWYgKHRoaXJkQ2hhckNvZGUgPT09IEZPUldBUkRfU0xBU0ggfHwgdGhpcmRDaGFyQ29kZSA9PT0gQkFDS1dBUkRfU0xBU0gpIHtcbiAgICAgICAgcmVzdWx0LnJvb3QgPSBmaWxlcGF0aC5zbGljZSgwLCAzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9IC8vIG5vcGUsIGp1c3QgQzosIG5vIHRyYWlsaW5nIHNlcGFyYXRvclxuXG5cbiAgICByZXN1bHQucm9vdCA9IGZpbGVwYXRoLnNsaWNlKDAsIDIpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxuICogVGhlIGBwYXRoLmZvcm1hdCgpYCBtZXRob2QgcmV0dXJucyBhIHBhdGggc3RyaW5nIGZyb20gYW4gb2JqZWN0LiBUaGlzIGlzIHRoZVxuICogb3Bwb3NpdGUgb2YgYHBhdGgucGFyc2UoKWAuXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSBzZXBhcmF0b3IgcGxhdGZvcm0tc3BlY2lmaWMgZmlsZSBzZXBhcmF0b3JcbiAqIEBwYXJhbSAge29iamVjdH0gcGF0aE9iamVjdCBvYmplY3Qgb2YgZm9ybWF0IHJldHVybmVkIGJ5IGBwYXRoLnBhcnNlKClgXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHBhdGhPYmplY3QuZGlyIGRpcmVjdG9yeSBuYW1lXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHBhdGhPYmplY3Qucm9vdCBmaWxlIHJvb3QgZGlyLCBpZ25vcmVkIGlmIGBwYXRoT2JqZWN0LmRpcmAgaXMgcHJvdmlkZWRcbiAqIEBwYXJhbSAge3N0cmluZ30gcGF0aE9iamVjdC5iYXNlIGZpbGUgYmFzZW5hbWVcbiAqIEBwYXJhbSAge3N0cmluZ30gcGF0aE9iamVjdC5uYW1lIGJhc2VuYW1lIG1pbnVzIGV4dGVuc2lvbiwgaWdub3JlZCBpZiBgcGF0aE9iamVjdC5iYXNlYCBleGlzdHNcbiAqIEBwYXJhbSAge3N0cmluZ30gcGF0aE9iamVjdC5leHQgZmlsZSBleHRlbnNpb24sIGlnbm9yZWQgaWYgYHBhdGhPYmplY3QuYmFzZWAgZXhpc3RzXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cblxuXG5mdW5jdGlvbiBmb3JtYXQkMShzZXBhcmF0b3IsIHBhdGhPYmplY3QpIHtcbiAgYXNzZXJ0QXJndW1lbnRUeXBlKHBhdGhPYmplY3QsICdwYXRoT2JqZWN0JywgJ29iamVjdCcpO1xuICBjb25zdCBiYXNlID0gcGF0aE9iamVjdC5iYXNlIHx8IGAke3BhdGhPYmplY3QubmFtZSB8fCAnJ30ke3BhdGhPYmplY3QuZXh0IHx8ICcnfWA7IC8vIGFwcGVuZCBiYXNlIHRvIHJvb3QgaWYgYGRpcmAgd2Fzbid0IHNwZWNpZmllZCwgb3IgaWZcbiAgLy8gZGlyIGlzIHRoZSByb290XG5cbiAgaWYgKCFwYXRoT2JqZWN0LmRpciB8fCBwYXRoT2JqZWN0LmRpciA9PT0gcGF0aE9iamVjdC5yb290KSB7XG4gICAgcmV0dXJuIGAke3BhdGhPYmplY3Qucm9vdCB8fCAnJ30ke2Jhc2V9YDtcbiAgfSAvLyBjb21iaW5lIGRpciArIC8gKyBiYXNlXG5cblxuICByZXR1cm4gYCR7cGF0aE9iamVjdC5kaXJ9JHtzZXBhcmF0b3J9JHtiYXNlfWA7XG59XG4vKipcbiAqIE9uIFdpbmRvd3Mgc3lzdGVtcyBvbmx5LCByZXR1cm5zIGFuIGVxdWl2YWxlbnQgbmFtZXNwYWNlLXByZWZpeGVkIHBhdGggZm9yXG4gKiB0aGUgZ2l2ZW4gcGF0aC4gSWYgcGF0aCBpcyBub3QgYSBzdHJpbmcsIHBhdGggd2lsbCBiZSByZXR1cm5lZCB3aXRob3V0IG1vZGlmaWNhdGlvbnMuXG4gKiBTZWUgaHR0cHM6Ly9kb2NzLm1pY3Jvc29mdC5jb20vZW4tdXMvd2luZG93cy9kZXNrdG9wL0ZpbGVJTy9uYW1pbmctYS1maWxlI25hbWVzcGFjZXNcbiAqIEBwYXJhbSAge3N0cmluZ30gZmlsZXBhdGggW2Rlc2NyaXB0aW9uXVxuICogQHJldHVybiB7c3RyaW5nfSAgICAgICAgICBbZGVzY3JpcHRpb25dXG4gKi9cblxuXG5mdW5jdGlvbiB0b05hbWVzcGFjZWRQYXRoKGZpbGVwYXRoKSB7XG4gIGlmICh0eXBlb2YgZmlsZXBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZpbGVwYXRoO1xuICB9XG5cbiAgaWYgKGZpbGVwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGNvbnN0IHJlc29sdmVkUGF0aCA9IHJlc29sdmUoJ1xcXFwnLCBbZmlsZXBhdGhdKTtcbiAgY29uc3QgbGVuZ3RoID0gcmVzb2x2ZWRQYXRoLmxlbmd0aDtcblxuICBpZiAobGVuZ3RoIDwgMikge1xuICAgIC8vIG5lZWQgJ1xcXFxcXFxcJyBvciAnQzonIG1pbmltdW1cbiAgICByZXR1cm4gZmlsZXBhdGg7XG4gIH1cblxuICBjb25zdCBmaXJzdENoYXJDb2RlID0gcmVzb2x2ZWRQYXRoLmNoYXJDb2RlQXQoMCk7IC8vIGlmIHN0YXJ0IHdpdGggJ1xcXFxcXFxcJywgcHJlZml4IHdpdGggVU5DIHJvb3QsIGRyb3AgdGhlIHNsYXNoZXNcblxuICBpZiAoZmlyc3RDaGFyQ29kZSA9PT0gQkFDS1dBUkRfU0xBU0ggJiYgcmVzb2x2ZWRQYXRoLmNoYXJBdCgxKSA9PT0gJ1xcXFwnKSB7XG4gICAgLy8gcmV0dXJuIGFzLWlzIGlmIGl0J3MgYW4gYXJlYWR5IGxvbmcgcGF0aCAoJ1xcXFxcXFxcP1xcXFwnIG9yICdcXFxcXFxcXC5cXFxcJyBwcmVmaXgpXG4gICAgaWYgKGxlbmd0aCA+PSAzKSB7XG4gICAgICBjb25zdCB0aGlyZENoYXIgPSByZXNvbHZlZFBhdGguY2hhckF0KDIpO1xuXG4gICAgICBpZiAodGhpcmRDaGFyID09PSAnPycgfHwgdGhpcmRDaGFyID09PSAnLicpIHtcbiAgICAgICAgcmV0dXJuIGZpbGVwYXRoO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAnXFxcXFxcXFw/XFxcXFVOQ1xcXFwnICsgcmVzb2x2ZWRQYXRoLnNsaWNlKDIpO1xuICB9IGVsc2UgaWYgKGlzV2luZG93c0RldmljZU5hbWUoZmlyc3RDaGFyQ29kZSkgJiYgcmVzb2x2ZWRQYXRoLmNoYXJBdCgxKSA9PT0gJzonKSB7XG4gICAgcmV0dXJuICdcXFxcXFxcXD9cXFxcJyArIHJlc29sdmVkUGF0aDtcbiAgfVxuXG4gIHJldHVybiBmaWxlcGF0aDtcbn1cblxuY29uc3QgV2luMzJQYXRoID0ge1xuICBzZXA6ICdcXFxcJyxcbiAgZGVsaW1pdGVyOiAnOycsXG4gIGJhc2VuYW1lOiBmdW5jdGlvbiAoZmlsZXBhdGgsIGV4dCkge1xuICAgIHJldHVybiBiYXNlbmFtZSh0aGlzLnNlcCwgZmlsZXBhdGgsIGV4dCk7XG4gIH0sXG4gIG5vcm1hbGl6ZTogZnVuY3Rpb24gKGZpbGVwYXRoKSB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZSh0aGlzLnNlcCwgZmlsZXBhdGgpO1xuICB9LFxuICBqb2luOiBmdW5jdGlvbiAoLi4ucGF0aHMpIHtcbiAgICByZXR1cm4gam9pbiQxKHRoaXMuc2VwLCBwYXRocyk7XG4gIH0sXG4gIGV4dG5hbWU6IGZ1bmN0aW9uIChmaWxlcGF0aCkge1xuICAgIHJldHVybiBleHRuYW1lKHRoaXMuc2VwLCBmaWxlcGF0aCk7XG4gIH0sXG4gIGRpcm5hbWU6IGZ1bmN0aW9uIChmaWxlcGF0aCkge1xuICAgIHJldHVybiBkaXJuYW1lKHRoaXMuc2VwLCBmaWxlcGF0aCk7XG4gIH0sXG4gIGlzQWJzb2x1dGU6IGZ1bmN0aW9uIChmaWxlcGF0aCkge1xuICAgIHJldHVybiBpc0Fic29sdXRlKGZhbHNlLCBmaWxlcGF0aCk7XG4gIH0sXG4gIHJlbGF0aXZlOiBmdW5jdGlvbiAoZnJvbSwgdG8pIHtcbiAgICByZXR1cm4gcmVsYXRpdmUodGhpcy5zZXAsIGZyb20sIHRvKTtcbiAgfSxcbiAgcmVzb2x2ZTogZnVuY3Rpb24gKC4uLnBhdGhzKSB7XG4gICAgcmV0dXJuIHJlc29sdmUodGhpcy5zZXAsIHBhdGhzKTtcbiAgfSxcbiAgcGFyc2U6IGZ1bmN0aW9uIChmaWxlcGF0aCkge1xuICAgIHJldHVybiBwYXJzZSh0aGlzLnNlcCwgZmlsZXBhdGgpO1xuICB9LFxuICBmb3JtYXQ6IGZ1bmN0aW9uIChwYXRoT2JqZWN0KSB7XG4gICAgcmV0dXJuIGZvcm1hdCQxKHRoaXMuc2VwLCBwYXRoT2JqZWN0KTtcbiAgfSxcbiAgdG9OYW1lc3BhY2VkUGF0aDogdG9OYW1lc3BhY2VkUGF0aFxufTtcbmNvbnN0IFBvc2l4UGF0aCA9IHtcbiAgc2VwOiAnLycsXG4gIGRlbGltaXRlcjogJzonLFxuICBiYXNlbmFtZTogZnVuY3Rpb24gKGZpbGVwYXRoLCBleHQpIHtcbiAgICByZXR1cm4gYmFzZW5hbWUodGhpcy5zZXAsIGZpbGVwYXRoLCBleHQpO1xuICB9LFxuICBub3JtYWxpemU6IGZ1bmN0aW9uIChmaWxlcGF0aCkge1xuICAgIHJldHVybiBub3JtYWxpemUodGhpcy5zZXAsIGZpbGVwYXRoKTtcbiAgfSxcbiAgam9pbjogZnVuY3Rpb24gKC4uLnBhdGhzKSB7XG4gICAgcmV0dXJuIGpvaW4kMSh0aGlzLnNlcCwgcGF0aHMpO1xuICB9LFxuICBleHRuYW1lOiBmdW5jdGlvbiAoZmlsZXBhdGgpIHtcbiAgICByZXR1cm4gZXh0bmFtZSh0aGlzLnNlcCwgZmlsZXBhdGgpO1xuICB9LFxuICBkaXJuYW1lOiBmdW5jdGlvbiAoZmlsZXBhdGgpIHtcbiAgICByZXR1cm4gZGlybmFtZSh0aGlzLnNlcCwgZmlsZXBhdGgpO1xuICB9LFxuICBpc0Fic29sdXRlOiBmdW5jdGlvbiAoZmlsZXBhdGgpIHtcbiAgICByZXR1cm4gaXNBYnNvbHV0ZSh0cnVlLCBmaWxlcGF0aCk7XG4gIH0sXG4gIHJlbGF0aXZlOiBmdW5jdGlvbiAoZnJvbSwgdG8pIHtcbiAgICByZXR1cm4gcmVsYXRpdmUodGhpcy5zZXAsIGZyb20sIHRvKTtcbiAgfSxcbiAgcmVzb2x2ZTogZnVuY3Rpb24gKC4uLnBhdGhzKSB7XG4gICAgcmV0dXJuIHJlc29sdmUodGhpcy5zZXAsIHBhdGhzKTtcbiAgfSxcbiAgcGFyc2U6IGZ1bmN0aW9uIChmaWxlcGF0aCkge1xuICAgIHJldHVybiBwYXJzZSh0aGlzLnNlcCwgZmlsZXBhdGgpO1xuICB9LFxuICBmb3JtYXQ6IGZ1bmN0aW9uIChwYXRoT2JqZWN0KSB7XG4gICAgcmV0dXJuIGZvcm1hdCQxKHRoaXMuc2VwLCBwYXRoT2JqZWN0KTtcbiAgfSxcbiAgdG9OYW1lc3BhY2VkUGF0aDogZnVuY3Rpb24gKGZpbGVwYXRoKSB7XG4gICAgcmV0dXJuIGZpbGVwYXRoOyAvLyBuby1vcFxuICB9XG59O1xuY29uc3QgcGF0aCA9IFBvc2l4UGF0aDtcbnBhdGgud2luMzIgPSBXaW4zMlBhdGg7XG5wYXRoLnBvc2l4ID0gUG9zaXhQYXRoO1xuXG5jb25zdCBQb3NpeENvbnN0YW50cyA9IHtcbiAgVVZfVURQX1JFVVNFQUREUjogNCxcbiAgZGxvcGVuOiB7fSxcbiAgZXJybm86IHtcbiAgICBFMkJJRzogNyxcbiAgICBFQUNDRVM6IDEzLFxuICAgIEVBRERSSU5VU0U6IDQ4LFxuICAgIEVBRERSTk9UQVZBSUw6IDQ5LFxuICAgIEVBRk5PU1VQUE9SVDogNDcsXG4gICAgRUFHQUlOOiAzNSxcbiAgICBFQUxSRUFEWTogMzcsXG4gICAgRUJBREY6IDksXG4gICAgRUJBRE1TRzogOTQsXG4gICAgRUJVU1k6IDE2LFxuICAgIEVDQU5DRUxFRDogODksXG4gICAgRUNISUxEOiAxMCxcbiAgICBFQ09OTkFCT1JURUQ6IDUzLFxuICAgIEVDT05OUkVGVVNFRDogNjEsXG4gICAgRUNPTk5SRVNFVDogNTQsXG4gICAgRURFQURMSzogMTEsXG4gICAgRURFU1RBRERSUkVROiAzOSxcbiAgICBFRE9NOiAzMyxcbiAgICBFRFFVT1Q6IDY5LFxuICAgIEVFWElTVDogMTcsXG4gICAgRUZBVUxUOiAxNCxcbiAgICBFRkJJRzogMjcsXG4gICAgRUhPU1RVTlJFQUNIOiA2NSxcbiAgICBFSURSTTogOTAsXG4gICAgRUlMU0VROiA5MixcbiAgICBFSU5QUk9HUkVTUzogMzYsXG4gICAgRUlOVFI6IDQsXG4gICAgRUlOVkFMOiAyMixcbiAgICBFSU86IDUsXG4gICAgRUlTQ09OTjogNTYsXG4gICAgRUlTRElSOiAyMSxcbiAgICBFTE9PUDogNjIsXG4gICAgRU1GSUxFOiAyNCxcbiAgICBFTUxJTks6IDMxLFxuICAgIEVNU0dTSVpFOiA0MCxcbiAgICBFTVVMVElIT1A6IDk1LFxuICAgIEVOQU1FVE9PTE9ORzogNjMsXG4gICAgRU5FVERPV046IDUwLFxuICAgIEVORVRSRVNFVDogNTIsXG4gICAgRU5FVFVOUkVBQ0g6IDUxLFxuICAgIEVORklMRTogMjMsXG4gICAgRU5PQlVGUzogNTUsXG4gICAgRU5PREFUQTogOTYsXG4gICAgRU5PREVWOiAxOSxcbiAgICBFTk9FTlQ6IDIsXG4gICAgRU5PRVhFQzogOCxcbiAgICBFTk9MQ0s6IDc3LFxuICAgIEVOT0xJTks6IDk3LFxuICAgIEVOT01FTTogMTIsXG4gICAgRU5PTVNHOiA5MSxcbiAgICBFTk9QUk9UT09QVDogNDIsXG4gICAgRU5PU1BDOiAyOCxcbiAgICBFTk9TUjogOTgsXG4gICAgRU5PU1RSOiA5OSxcbiAgICBFTk9TWVM6IDc4LFxuICAgIEVOT1RDT05OOiA1NyxcbiAgICBFTk9URElSOiAyMCxcbiAgICBFTk9URU1QVFk6IDY2LFxuICAgIEVOT1RTT0NLOiAzOCxcbiAgICBFTk9UU1VQOiA0NSxcbiAgICBFTk9UVFk6IDI1LFxuICAgIEVOWElPOiA2LFxuICAgIEVPUE5PVFNVUFA6IDEwMixcbiAgICBFT1ZFUkZMT1c6IDg0LFxuICAgIEVQRVJNOiAxLFxuICAgIEVQSVBFOiAzMixcbiAgICBFUFJPVE86IDEwMCxcbiAgICBFUFJPVE9OT1NVUFBPUlQ6IDQzLFxuICAgIEVQUk9UT1RZUEU6IDQxLFxuICAgIEVSQU5HRTogMzQsXG4gICAgRVJPRlM6IDMwLFxuICAgIEVTUElQRTogMjksXG4gICAgRVNSQ0g6IDMsXG4gICAgRVNUQUxFOiA3MCxcbiAgICBFVElNRTogMTAxLFxuICAgIEVUSU1FRE9VVDogNjAsXG4gICAgRVRYVEJTWTogMjYsXG4gICAgRVdPVUxEQkxPQ0s6IDM1LFxuICAgIEVYREVWOiAxOFxuICB9LFxuICBzaWduYWxzOiB7XG4gICAgU0lHSFVQOiAxLFxuICAgIFNJR0lOVDogMixcbiAgICBTSUdRVUlUOiAzLFxuICAgIFNJR0lMTDogNCxcbiAgICBTSUdUUkFQOiA1LFxuICAgIFNJR0FCUlQ6IDYsXG4gICAgU0lHSU9UOiA2LFxuICAgIFNJR0JVUzogMTAsXG4gICAgU0lHRlBFOiA4LFxuICAgIFNJR0tJTEw6IDksXG4gICAgU0lHVVNSMTogMzAsXG4gICAgU0lHU0VHVjogMTEsXG4gICAgU0lHVVNSMjogMzEsXG4gICAgU0lHUElQRTogMTMsXG4gICAgU0lHQUxSTTogMTQsXG4gICAgU0lHVEVSTTogMTUsXG4gICAgU0lHQ0hMRDogMjAsXG4gICAgU0lHQ09OVDogMTksXG4gICAgU0lHU1RPUDogMTcsXG4gICAgU0lHVFNUUDogMTgsXG4gICAgU0lHVFRJTjogMjEsXG4gICAgU0lHVFRPVTogMjIsXG4gICAgU0lHVVJHOiAxNixcbiAgICBTSUdYQ1BVOiAyNCxcbiAgICBTSUdYRlNaOiAyNSxcbiAgICBTSUdWVEFMUk06IDI2LFxuICAgIFNJR1BST0Y6IDI3LFxuICAgIFNJR1dJTkNIOiAyOCxcbiAgICBTSUdJTzogMjMsXG4gICAgU0lHSU5GTzogMjksXG4gICAgU0lHU1lTOiAxMlxuICB9LFxuICBwcmlvcml0eToge1xuICAgIFBSSU9SSVRZX0xPVzogMTksXG4gICAgUFJJT1JJVFlfQkVMT1dfTk9STUFMOiAxMCxcbiAgICBQUklPUklUWV9OT1JNQUw6IDAsXG4gICAgUFJJT1JJVFlfQUJPVkVfTk9STUFMOiAtNyxcbiAgICBQUklPUklUWV9ISUdIOiAtMTQsXG4gICAgUFJJT1JJVFlfSElHSEVTVDogLTIwXG4gIH1cbn07IC8vIGRlZmF1bHQgaW1wbGVtZW50YXRpb25zXG5cbmNvbnN0IE9TID0ge1xuICBFT0w6ICdcXG4nLFxuICBhcmNoOiAoKSA9PiBwcm9jZXNzLmFyY2gsXG4gIGNvbnN0YW50czogUG9zaXhDb25zdGFudHMsXG4gIGNwdXM6ICgpID0+IHtcbiAgICBjb25zdCBjb3VudCA9IFRpLlBsYXRmb3JtLnByb2Nlc3NvckNvdW50O1xuICAgIGNvbnN0IGFycmF5ID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgIGFycmF5LnB1c2goe1xuICAgICAgICBtb2RlbDogJ3Vua25vd24nLFxuICAgICAgICBzcGVlZDogMCxcbiAgICAgICAgdGltZXM6IHtcbiAgICAgICAgICB1c2VyOiAwLFxuICAgICAgICAgIG5pY2U6IDAsXG4gICAgICAgICAgc3lzOiAwLFxuICAgICAgICAgIGlkbGU6IDAsXG4gICAgICAgICAgaXJxOiAwXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBhcnJheTtcbiAgfSxcbiAgZW5kaWFubmVzczogKCkgPT4ge1xuICAgIC8vIFRPRE86IENhY2hlIHRoZSB2YWx1ZSFcbiAgICBjb25zdCByZXN1bHQgPSBUaS5Db2RlYy5nZXROYXRpdmVCeXRlT3JkZXIoKTtcblxuICAgIGlmIChyZXN1bHQgPT09IFRpLkNvZGVjLkxJVFRMRV9FTkRJQU4pIHtcbiAgICAgIHJldHVybiAnTEUnO1xuICAgIH1cblxuICAgIHJldHVybiAnQkUnO1xuICB9LFxuICBmcmVlbWVtOiAoKSA9PiBUaS5QbGF0Zm9ybS5hdmFpbGFibGVNZW1vcnksXG4gIGdldFByaW9yaXR5OiAoKSA9PiAwLFxuICAvLyBmYWtlIGl0XG4gIGhvbWVkaXI6ICgpID0+IFRpLkZpbGVzeXN0ZW0uYXBwbGljYXRpb25EYXRhRGlyZWN0b3J5LFxuICAvLyBmYWtlIGl0XG4gIGhvc3RuYW1lOiAoKSA9PiBUaS5QbGF0Zm9ybS5hZGRyZXNzLFxuICAvLyBmYWtlIGl0XG4gIGxvYWRhdmc6ICgpID0+IFswLCAwLCAwXSxcbiAgLy8gZmFrZSBpdFxuICBuZXR3b3JrSW50ZXJmYWNlczogKCkgPT4ge30sXG4gIC8vIEZJWE1FOiBXaGF0IGRvIHdlIGRvIGhlcmU/IFdlIG1pZ2h0IGJlIGFibGUgdG8gcGllY2Ugc29tZSBvZiB0aGlzIHRvZ2V0aGVyIHVzaW5nIFRpLlBsYXRmb3JtLm5ldG1hc2ssIFRpLlBsYXRmb3JtLmFkZHJlc3NcbiAgcGxhdGZvcm06ICgpID0+IHByb2Nlc3MucGxhdGZvcm0sXG4gIHJlbGVhc2U6ICgpID0+IFRpLlBsYXRmb3JtLnZlcnNpb24sXG4gIHNldFByaW9yaXR5OiAoKSA9PiB7fSxcbiAgLy8gbm8tb3AsIGZha2UgaXRcblxuICAvKipcbiAgICogVGhlIGBvcy50bXBkaXIoKWAgbWV0aG9kIHJldHVybnMgYSBzdHJpbmcgc3BlY2lmeWluZyB0aGUgb3BlcmF0aW5nIHN5c3RlbSdzIGRlZmF1bHQgZGlyZWN0b3J5IGZvciB0ZW1wb3JhcnkgZmlsZXMuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gW2Rlc2NyaXB0aW9uXVxuICAgKi9cbiAgdG1wZGlyOiAoKSA9PiBUaS5GaWxlc3lzdGVtLnRlbXBEaXJlY3RvcnksXG5cbiAgLyoqXG4gICAqIFRoZSBgb3MudG90YWxtZW0oKWAgbWV0aG9kIHJldHVybnMgdGhlIHRvdGFsIGFtb3VudCBvZiBzeXN0ZW0gbWVtb3J5IGluIGJ5dGVzIGFzIGFuIGludGVnZXIuXG4gICAqIEByZXR1cm4ge2ludGVnZXJ9IFtkZXNjcmlwdGlvbl1cbiAgICovXG4gIHRvdGFsbWVtOiAoKSA9PiBUaS5QbGF0Zm9ybS50b3RhbE1lbW9yeSxcbiAgdHlwZTogKCkgPT4gJ1Vua25vd24nLFxuICAvLyBvdmVycmlkZGVuIHBlci1wbGF0Zm9ybSBhdCBib3R0b21cblxuICAvKipcbiAgICogVGhlIGBvcy51cHRpbWUoKWAgbWV0aG9kIHJldHVybnMgdGhlIHN5c3RlbSB1cHRpbWUgaW4gbnVtYmVyIG9mIHNlY29uZHMuXG4gICAqIEByZXR1cm4ge2ludGVnZXJ9IFtkZXNjcmlwdGlvbl1cbiAgICovXG4gIHVwdGltZTogKCkgPT4gVGkuUGxhdGZvcm0udXB0aW1lLFxuICB1c2VySW5mbzogKCkgPT4ge1xuICAgIC8vIGZha2UgaXQhXG4gICAgcmV0dXJuIHtcbiAgICAgIHVpZDogLTEsXG4gICAgICBndWlkOiAtMSxcbiAgICAgIHVzZXJuYW1lOiBUaS5QbGF0Zm9ybS51c2VybmFtZSxcbiAgICAgIGhvbWVkaXI6IFRpLkZpbGVzeXN0ZW0uYXBwbGljYXRpb25EYXRhRGlyZWN0b3J5LFxuICAgICAgc2hlbGw6IG51bGxcbiAgICB9O1xuICB9XG59OyAvLyBPbiBzcGVjaWZpYyBwbGF0Zm9ybXMsIG92ZXJyaWRlIGltcGxlbWVudGF0aW9ucyBiZWNhdXNlIHdlIGRvbid0IGhhdmUgdGhlbVxuLy8geWV0IGFuZCBuZWVkIHRvIGZha2UgaXQsIG9yIHRvIGhhY2sgdGhlbVxuLy8gSSdtIGFsc28gZG9pbmcgdGhpcyBpbiBibG9ja3MgdG8gYXNzaWduIGltcGxlbWVudGF0aW9ucyB0aGF0IGRvbid0IG5lZWQgdG8gY29uc3VsdCBwbGF0Zm9ybVxuLy8gdHlwZSBhdCBydW50aW1lIChob3BlZnVsbHkgc3BlZWRpbmcgdXAgZXhlY3V0aW9uIGF0IHJ1bnRpbWUpXG5cbntcbiAgT1MuY3B1cyA9ICgpID0+IFRpLlBsYXRmb3JtLmNwdXMoKTtcblxuICBPUy50eXBlID0gKCkgPT4gJ0xpbnV4Jztcbn1cblxuY29uc3QgdHR5ID0ge1xuICBpc2F0dHk6ICgpID0+IGZhbHNlLFxuICBSZWFkU3RyZWFtOiAoKSA9PiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd0dHkuUmVhZFN0cmVhbSBpcyBub3QgaW1wbGVtZW50ZWQnKTtcbiAgfSxcbiAgV3JpdGVTdHJlYW06ICgpID0+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3R0eS5Xcml0ZVN0cmVhbSBpcyBub3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxufTtcblxuY29uc3QgTU9OVEhTID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddO1xuY29uc3QgdXRpbCA9IHtcbiAgZm9ybWF0LFxuICBmb3JtYXRXaXRoT3B0aW9ucyxcbiAgaW5zcGVjdCxcbiAgaXNBcnJheTogQXJyYXkuaXNBcnJheSxcbiAgaXNCb29sZWFuOiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJyxcbiAgaXNCdWZmZXI6IEJ1ZmZlck1vZHVsZS5CdWZmZXIuaXNCdWZmZXIsXG4gIGlzRnVuY3Rpb246IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyxcbiAgaXNOdWxsOiB2YWx1ZSA9PiB2YWx1ZSA9PT0gbnVsbCxcbiAgaXNOdWxsT3JVbmRlZmluZWQ6IHZhbHVlID0+IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwsXG4gIGlzTnVtYmVyOiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICBpc09iamVjdDogdmFsdWUgPT4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyxcbiAgaXNQcmltaXRpdmU6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbHVlICE9PSAnZnVuY3Rpb24nIHx8IHZhbHVlID09PSBudWxsLFxuICBpc1N0cmluZzogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyxcbiAgaXNTeW1ib2w6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3N5bWJvbCcsXG4gIGlzVW5kZWZpbmVkOiB2YWx1ZSA9PiB2YWx1ZSA9PT0gdW5kZWZpbmVkLFxuICBpc1JlZ0V4cDogaXNSZWdFeHAsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0Vycm9yOiBlID0+IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IsXG4gIGxvZzogc3RyaW5nID0+IHtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCB0aW1lID0gYCR7ZGF0ZS5nZXRIb3VycygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX06JHtkYXRlLmdldE1pbnV0ZXMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9OiR7ZGF0ZS5nZXRTZWNvbmRzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfWA7IC8vIFByb2R1Y2VzIG91dHB1dCBsaWtlOiBcIjIxIEZlYiAxMDowNDoyMyAtIG1lc3NhZ2VcIlxuXG4gICAgY29uc29sZS5sb2coYCR7ZGF0ZS5nZXREYXRlKCl9ICR7TU9OVEhTW2RhdGUuZ2V0TW9udGgoKV19ICR7dGltZX0gLSAke3N0cmluZ31gKTtcbiAgfSxcbiAgcHJpbnQ6ICguLi5hcmdzKSA9PiBjb25zb2xlLmxvZyhhcmdzLmpvaW4oJycpKSxcbiAgLy8gRklYTUU6IFNob3VsZG4ndCBhZGQgdHJhaWxpbmcgbmV3bGluZSBsaWtlIGNvbnNvbGUubG9nIGRvZXMhXG4gIHB1dHM6ICguLi5hcmdzKSA9PiBjb25zb2xlLmxvZyhhcmdzLmpvaW4oJ1xcbicpKSxcbiAgZXJyb3I6ICguLi5hcmdzKSA9PiBjb25zb2xlLmVycm9yKGFyZ3Muam9pbignXFxuJykpLFxuICBkZWJ1Zzogc3RyaW5nID0+IGNvbnNvbGUuZXJyb3IoYERFQlVHOiAke3N0cmluZ31gKSxcbiAgdHlwZXNcbn07XG4vKipcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNvbnN0cnVjdG9yIHN1YmNsYXNzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdXBlckNvbnN0cnVjdG9yIGJhc2UgY2xhc3NcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5cbnV0aWwuaW5oZXJpdHMgPSBmdW5jdGlvbiAoY29uc3RydWN0b3IsIHN1cGVyQ29uc3RydWN0b3IpIHtcbiAgYXNzZXJ0QXJndW1lbnRUeXBlKGNvbnN0cnVjdG9yLCAnY29uc3RydWN0b3InLCAnRnVuY3Rpb24nKTtcbiAgYXNzZXJ0QXJndW1lbnRUeXBlKHN1cGVyQ29uc3RydWN0b3IsICdzdXBlckNvbnN0cnVjdG9yJywgJ0Z1bmN0aW9uJyk7XG4gIGFzc2VydEFyZ3VtZW50VHlwZShzdXBlckNvbnN0cnVjdG9yLnByb3RvdHlwZSwgJ3N1cGVyQ29uc3RydWN0b3IucHJvdG90eXBlJywgJ09iamVjdCcpO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IsICdzdXBlcl8nLCB7XG4gICAgdmFsdWU6IHN1cGVyQ29uc3RydWN0b3JcbiAgfSk7XG4gIE9iamVjdC5zZXRQcm90b3R5cGVPZihjb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHN1cGVyQ29uc3RydWN0b3IucHJvdG90eXBlKTtcbn07XG4vKipcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9yaWdpbmFsIG9yaWdpbmFsIGZ1bmN0aW9uIHRvIHdyYXAgd2hpY2ggaXMgZXhwZWN0ZWQgdG8gaGF2ZSBhIGZpbmFsIGNhbGxiYWNrIGFyZ3VtZW50XG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFByb21pc2VcbiAqL1xuXG5cbnV0aWwucHJvbWlzaWZ5ID0gZnVuY3Rpb24gKG9yaWdpbmFsKSB7XG4gIGFzc2VydEFyZ3VtZW50VHlwZShvcmlnaW5hbCwgJ29yaWdpbmFsJywgJ0Z1bmN0aW9uJyk7XG5cbiAgZnVuY3Rpb24gd3JhcHBlZCguLi5hcmdzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIG9yaWdpbmFsLmNhbGwodGhpcywgLi4uYXJncywgKGVyciwgcmVzdWx0KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0gLy8gVE9ETzogQ29weSBwcm9wZXJ0aWVzIGZyb20gb3JpZ2luYWwgdG8gd3JhcHBlZFxuICAvLyBUT0RPOiBob29rIHByb3RvdHlwZSBjaGFpbiB1cCBmcm9tIHdyYXBwZWQgdG8gb3JpZ2luYWxcbiAgLy8gVE9ETzogU3VwcG9ydCBjdXN0b20gcHJvbWlzaWZ5IGhvb2tzXG5cblxuICByZXR1cm4gd3JhcHBlZDtcbn07XG4vKipcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9yaWdpbmFsIG9yaWdpbmFsIGZ1bmN0aW9uIHRvIGNvbnZlcnQgZnJvbSBhc3luYy9Qcm9taXNlIHJldHVybiB2YWx1ZSB0byBhIGNhbGxiYWNrIHN0eWxlXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IHdyYXBwZWQgZnVuY3Rpb25cbiAqL1xuXG5cbnV0aWwuY2FsbGJhY2tpZnkgPSBmdW5jdGlvbiAob3JpZ2luYWwpIHtcbiAgYXNzZXJ0QXJndW1lbnRUeXBlKG9yaWdpbmFsLCAnb3JpZ2luYWwnLCAnRnVuY3Rpb24nKTtcblxuICBmdW5jdGlvbiB3cmFwcGVkKC4uLmFyZ3MpIHtcbiAgICBjb25zdCBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgY29uc3QgcHJvbWlzZSA9IG9yaWdpbmFsLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIHByb21pc2UudGhlbihyZXN1bHQgPT4ge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwcm9taXNlL2Fsd2F5cy1yZXR1cm5cbiAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcHJvbWlzZS9uby1jYWxsYmFjay1pbi1wcm9taXNlXG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIGlmICghZXJyKSB7XG4gICAgICAgIGNvbnN0IHdyYXBwZWRFcnJvciA9IG5ldyBFcnJvcignUHJvbWlzZSB3YXMgcmVqZWN0ZWQgd2l0aCBmYWxzeSB2YWx1ZScpO1xuICAgICAgICB3cmFwcGVkRXJyb3IucmVhc29uID0gZXJyO1xuICAgICAgICBlcnIgPSB3cmFwcGVkRXJyb3I7XG4gICAgICB9XG5cbiAgICAgIGNhbGxiYWNrKGVycik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcHJvbWlzZS9uby1jYWxsYmFjay1pbi1wcm9taXNlXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gd3JhcHBlZDtcbn07XG4vKipcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgZnVuY3Rpb24gdG8gZGVwcmVjYXRlL3dyYXBcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgbWVzc2FnZSB0byBnaXZlIHdoZW4gZGVwcmVjYXRpb24gd2FybmluZyBpcyBlbWl0dGVkXG4gKiBAcGFyYW0ge3N0cmluZ30gY29kZSBkZXByZWNhdGlvbiBjb2RlIHRvIHVzZSB0byBncm91cCB3YXJuaW5nc1xuICogQHJldHVybnMge0Z1bmN0aW9ufSB3cmFwcGVkIGZ1bmN0aW9uXG4gKi9cblxuXG51dGlsLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uIChmdW5jLCBzdHJpbmcsIGNvZGUpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uKSB7XG4gICAgcmV0dXJuIGZ1bmM7IC8vIHNraXAgdGhlIHdyYXBwaW5nIVxuICB9IC8vIFRPRE86IFN1cHBvcnQgYGNvZGVgIGFyZ3VtZW50IGJ5IHRyYWNraW5nIGEgbWFwIG9mIGNvZGVzIHdlJ3ZlIHdhcm5lZCBhYm91dFxuXG5cbiAgZnVuY3Rpb24gd3JhcHBlZCguLi5hcmdzKSB7XG4gICAgbGV0IHdhcm5lZCA9IGZhbHNlO1xuXG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIHByb2Nlc3MuZW1pdFdhcm5pbmcoc3RyaW5nLCAnRGVwcmVjYXRpb25XYXJuaW5nJyk7XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHdyYXBwZWQ7XG59OyAvLyBUT0RPOiBTdXBwb3J0IGRlYnVnbG9nPyBXaGF0IGlzIG91ciBlcXVpdmFsZW50IG9mIHByb2Nlc3MuZW52KCdOT0RFX0RFQlVHJyk/XG5cblxuY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xuXG51dGlsLmRlYnVnbG9nID0gKCkgPT4ge1xuICByZXR1cm4gbm9vcDtcbn07XG5cbmNvbnN0IERFRkFVTFRfTUVTU0FHRVMgPSB7XG4gIGRlZXBTdHJpY3RFcXVhbDogJ0V4cGVjdGVkIHZhbHVlcyB0byBiZSBzdHJpY3RseSBkZWVwLWVxdWFsOicsXG4gIHN0cmljdEVxdWFsOiAnRXhwZWN0ZWQgdmFsdWVzIHRvIGJlIHN0cmljdGx5IGVxdWFsOicsXG4gIGRlZXBFcXVhbDogJ0V4cGVjdGVkIHZhbHVlcyB0byBiZSBsb29zZWx5IGRlZXAtZXF1YWw6JyxcbiAgZXF1YWw6ICdFeHBlY3RlZCB2YWx1ZXMgdG8gYmUgbG9vc2VseSBlcXVhbDonLFxuICBub3REZWVwU3RyaWN0RXF1YWw6ICdFeHBlY3RlZCBcImFjdHVhbFwiIG5vdCB0byBiZSBzdHJpY3RseSBkZWVwLWVxdWFsIHRvOicsXG4gIG5vdFN0cmljdEVxdWFsOiAnRXhwZWN0ZWQgXCJhY3R1YWxcIiB0byBiZSBzdHJpY3RseSB1bmVxdWFsIHRvOicsXG4gIG5vdERlZXBFcXVhbDogJ0V4cGVjdGVkIFwiYWN0dWFsXCIgbm90IHRvIGJlIGxvb3NlbHkgZGVlcC1lcXVhbCB0bzonLFxuICBub3RFcXVhbDogJ0V4cGVjdGVkIFwiYWN0dWFsXCIgdG8gYmUgbG9vc2VseSB1bmVxdWFsIHRvOidcbn07IC8vIEZha2UgZW51bXMgdG8gdXNlIGludGVybmFsbHlcblxuY29uc3QgQ09NUEFSRV9UWVBFID0ge1xuICBPYmplY3Q6IDAsXG4gIE1hcDogMSxcbiAgU2V0OiAyXG59O1xuY29uc3QgU1RSSUNUTkVTUyA9IHtcbiAgU3RyaWN0OiAwLFxuICBMb29zZTogMVxufTtcblxuY2xhc3MgQXNzZXJ0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBsZXQge1xuICAgICAgYWN0dWFsLFxuICAgICAgZXhwZWN0ZWQsXG4gICAgICBtZXNzYWdlLFxuICAgICAgb3BlcmF0b3JcbiAgICB9ID0gb3B0aW9ucztcblxuICAgIGlmICghbWVzc2FnZSkge1xuICAgICAgLy8gRklYTUU6IEdlbmVyYXRlIHRoZSByZXN0IG9mIHRoZSBtZXNzYWdlIHdpdGggZGlmZiBvZiBhY3R1YWwvZXhwZWN0ZWQhXG4gICAgICBtZXNzYWdlID0gYCR7REVGQVVMVF9NRVNTQUdFU1tvcGVyYXRvcl19XFxuXFxuYDtcbiAgICB9XG5cbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLmFjdHVhbCA9IGFjdHVhbDtcbiAgICB0aGlzLmV4cGVjdGVkID0gZXhwZWN0ZWQ7XG4gICAgdGhpcy5vcGVyYXRvciA9IG9wZXJhdG9yO1xuICAgIHRoaXMuZ2VuZXJhdGVkTWVzc2FnZSA9ICFtZXNzYWdlO1xuICAgIHRoaXMubmFtZSA9ICdBc3NlcnRpb25FcnJvciBbRVJSX0FTU0VSVElPTl0nO1xuICAgIHRoaXMuY29kZSA9ICdFUlJfQVNTRVJUSU9OJztcbiAgfVxuXG59IC8vIFRPRE86IENhbiB3ZSBkZWZpbmUgQXNzZXJ0U3RyaWN0IGFuZCBBc3NlcnRMb29zZSBhcyBzdWJjbGFzc2VzIG9mIGEgYmFzZSBBc3NlcnQgY2xhc3Ncbi8vIHRoYXQgY2xhc3MgaG9sZHMgaW1wbHMgZm9yIHNoYXJlZCBtZXRob2RzLCBzdWJjbGFzc2VzIG92ZXJyaWRlIHNwZWNpZmljXG4vLyBjb21wYXJpc29ucyB1c2VkIChPYmplY3QuaXMgdnMgPT09KT9cblxuXG5jb25zdCBhc3NlcnQkMSA9ICh2YWx1ZSwgbWVzc2FnZSkgPT4gYXNzZXJ0JDEub2sodmFsdWUsIG1lc3NhZ2UpO1xuXG5hc3NlcnQkMS5Bc3NlcnRpb25FcnJvciA9IEFzc2VydGlvbkVycm9yO1xuXG5hc3NlcnQkMS5vayA9ICguLi5hcmdzKSA9PiB7XG4gIGNvbnN0IHZhbHVlID0gYXJnc1swXTtcblxuICBpZiAodmFsdWUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgbWVzc2FnZSA9IGFyZ3NbMV07XG4gIGxldCBnZW5lcmF0ZWRNZXNzYWdlID0gZmFsc2U7IC8vIENoZWNrIGlmIHZhbHVlICgxc3QgYXJnKSB3YXMgbm90IHN1cHBsaWVkIVxuICAvLyBIYXZlIHRvIHVzZSB1Z2x5IGhhY2sgb24gYXJncyBkZWZpbml0aW9uIHRvIGRvIHNvXG5cbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgbWVzc2FnZSA9ICdObyB2YWx1ZSBhcmd1bWVudCBwYXNzZWQgdG8gYGFzc2VydC5vaygpYCc7XG4gICAgZ2VuZXJhdGVkTWVzc2FnZSA9IHRydWU7XG4gIH0gZWxzZSBpZiAobWVzc2FnZSA9PSBudWxsKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1lcS1udWxsLGVxZXFlcVxuICAgIC8vIFRPRE86IGdlbmVyYXRlIHJlc3Qgb2YgdGhlIG1lc3NhZ2UuIE5vZGUgYWN0dWFsbHkgcmVhZHMgdGhlIGlucHV0IGZpbGUhIFRoZSBoYWNrZWQgYnJvd3NlcmlmeSBkb2VzIG5vdCBkbyB0aGlzXG4gICAgLy8gSXQgdHJlYXRlcyBvayBmYWlsaW5nIGxpa2UgYHZhbHVlID09IHRydWVgIGZhaWxpbmdcbiAgICBtZXNzYWdlID0gJ1RoZSBleHByZXNzaW9uIGV2YWx1YXRlZCB0byBhIGZhbHN5IHZhbHVlOlxcblxcbic7XG4gICAgZ2VuZXJhdGVkTWVzc2FnZSA9IHRydWU7XG4gIH0gZWxzZSBpZiAobWVzc2FnZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgdGhyb3cgbWVzc2FnZTtcbiAgfVxuXG4gIGNvbnN0IGVyciA9IG5ldyBBc3NlcnRpb25FcnJvcih7XG4gICAgYWN0dWFsOiB2YWx1ZSxcbiAgICBleHBlY3RlZDogdHJ1ZSxcbiAgICBtZXNzYWdlLFxuICAgIG9wZXJhdG9yOiAnPT0nXG4gIH0pO1xuICBlcnIuZ2VuZXJhdGVkTWVzc2FnZSA9IGdlbmVyYXRlZE1lc3NhZ2U7XG4gIHRocm93IGVycjtcbn07XG5cbmZ1bmN0aW9uIHRocm93RXJyb3Iob2JqKSB7XG4gIC8vIElmIG1lc3NhZ2UgaXMgYW4gRXJyb3Igb2JqZWN0LCB0aHJvdyB0aGF0IGluc3RlYWQhXG4gIGlmIChvYmoubWVzc2FnZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgdGhyb3cgb2JqLm1lc3NhZ2U7XG4gIH1cblxuICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3Iob2JqKTtcbn1cblxuYXNzZXJ0JDEuZXF1YWwgPSAoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkgPT4ge1xuICBpZiAoYWN0dWFsID09IGV4cGVjdGVkKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBlcWVxZXFcbiAgICByZXR1cm47XG4gIH1cblxuICB0aHJvd0Vycm9yKHtcbiAgICBhY3R1YWwsXG4gICAgZXhwZWN0ZWQsXG4gICAgbWVzc2FnZSxcbiAgICBvcGVyYXRvcjogJ2VxdWFsJ1xuICB9KTtcbn07XG5cbmFzc2VydCQxLnN0cmljdEVxdWFsID0gKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpID0+IHtcbiAgaWYgKE9iamVjdC5pcyhhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIC8vIHByb3ZpZGVzIFNhbWVWYWx1ZSBjb21wYXJpc29uIGZvciB1c1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRocm93RXJyb3Ioe1xuICAgIGFjdHVhbCxcbiAgICBleHBlY3RlZCxcbiAgICBtZXNzYWdlLFxuICAgIG9wZXJhdG9yOiAnc3RyaWN0RXF1YWwnXG4gIH0pO1xufTtcblxuYXNzZXJ0JDEubm90RXF1YWwgPSAoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkgPT4ge1xuICBpZiAoYWN0dWFsICE9IGV4cGVjdGVkKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBlcWVxZXFcbiAgICByZXR1cm47XG4gIH1cblxuICB0aHJvd0Vycm9yKHtcbiAgICBhY3R1YWwsXG4gICAgZXhwZWN0ZWQsXG4gICAgbWVzc2FnZSxcbiAgICBvcGVyYXRvcjogJ25vdEVxdWFsJ1xuICB9KTtcbn07XG5cbmFzc2VydCQxLm5vdFN0cmljdEVxdWFsID0gKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpID0+IHtcbiAgaWYgKCFPYmplY3QuaXMoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICAvLyBwcm92aWRlcyBTYW1lVmFsdWUgY29tcGFyaXNvbiBmb3IgdXNcbiAgICByZXR1cm47XG4gIH1cblxuICB0aHJvd0Vycm9yKHtcbiAgICBhY3R1YWwsXG4gICAgZXhwZWN0ZWQsXG4gICAgbWVzc2FnZSxcbiAgICBvcGVyYXRvcjogJ25vdFN0cmljdEVxdWFsJ1xuICB9KTtcbn07XG5cbmNvbnN0IGlzUHJpbWl0aXZlID0gdmFsdWUgPT4ge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUgIT09ICdmdW5jdGlvbicgfHwgdmFsdWUgPT09IG51bGw7XG59O1xuLyoqXG4gKiBAcGFyYW0ge01hcH0gYWN0dWFsIG1hcCB3ZSBhcmUgY29tcGFyaW5nXG4gKiBAcGFyYW0ge01hcH0gZXhwZWN0ZWQgbWFwIHdlJ3JlIGNvbXBhcmluZyBhZ2FpbnN0XG4gKiBAcGFyYW0ge1NUUklDVE5FU1MuTG9vc2V8c3RyaWN0bmVzcy5TdHJpY3R9IHN0cmljdG5lc3MgaG93IHRvIGNvbXBhcmVcbiAqIEBwYXJhbSB7b2JqZWN0fSByZWZlcmVuY2VzIG1lbW9pemVkIHJlZmVyZW5jZXMgdG8gb2JqZWN0cyBpbiB0aGUgZGVlcEVxdWFsIGhpZXJhcmNoeVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cblxuXG5mdW5jdGlvbiBjb21wYXJlTWFwcyhhY3R1YWwsIGV4cGVjdGVkLCBzdHJpY3RuZXNzLCByZWZlcmVuY2VzKSB7XG4gIGNvbnN0IGxvb3NlQ2hlY2tzID0gbmV3IFNldCgpOyAvLyBrZWVwIHRyYWNrIG9mIG9iamVjdHMgd2UgbmVlZCB0byB0ZXN0IG1vcmUgZXh0ZW5zaXZlbHkgdGhhbiB1c2luZyAjZ2V0KCkvI2hhcygpXG5cbiAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgYWN0dWFsKSB7XG4gICAgaWYgKHR5cGVvZiBrZXkgPT09ICdvYmplY3QnICYmIGtleSAhPT0gbnVsbCkge1xuICAgICAgLy8gbm9uLW51bGwgb2JqZWN0LiBXZSBuZWVkIHRvIGRvIG91ciBvd24gY2hlY2tpbmcsIG5vdCB1c2UgZ2V0KCkvaGFzKClcbiAgICAgIGxvb3NlQ2hlY2tzLmFkZChrZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBoYW5kbGUgXCJwcmltaXRpdmVzXCJcbiAgICAgIGlmIChleHBlY3RlZC5oYXMoa2V5KSAmJiBkZWVwRXF1YWwodmFsdWUsIGV4cGVjdGVkLmdldChrZXkpLCBzdHJpY3RuZXNzLCByZWZlcmVuY2VzKSkge1xuICAgICAgICAvLyB5YXkhIGEgbmljZSBlYXN5IG1hdGNoIC0gYm90aCBrZXkgYW5kIHZhbHVlIG1hdGNoZWQgZXhhY3RseSAtIG1vdmUgb25cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdHJpY3RuZXNzID09PSBTVFJJQ1RORVNTLlN0cmljdCkge1xuICAgICAgICAvLyBpZiB3ZSBkaWRuJ3QgbWF0Y2gga2V5L3ZhbHVlIHBlcmZlY3RseSBpbiBzdHJpY3QgbW9kZSwgZmFpbCByaWdodCBhd2F5XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0gLy8gb2ssIHNvIGl0IGRpZG4ndCBtYXRjaCBrZXkvdmFsdWUgcGVyZmVjdGx5IC0gYnV0IHdlJ3JlIGluIGxvb3NlIG1vZGUsIHNvIGZhbGwgYmFjayB0byB0cnkgYWdhaW5cblxuXG4gICAgICBsb29zZUNoZWNrcy5hZGQoa2V5KTtcbiAgICB9XG4gIH1cblxuICBpZiAobG9vc2VDaGVja3Muc2l6ZSA9PT0gMCkge1xuICAgIC8vIG5vIGxvb3NlIGVuZHMgdG8gdGllIHVwLCBldmVyeXRoaW5nIG1hdGNoZWRcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSAvLyBvbmx5IGdvIHRocm91Z2ggdGhlIHNlY29uZCBNYXAgb25jZSFcblxuXG4gIGZvciAoY29uc3QgW2V4cGVjdGVkS2V5LCBleHBlY3RlZFZhbHVlXSBvZiBleHBlY3RlZCkge1xuICAgIC8vIGlmIGl0J3Mgbm90IGEgbm9uLW51bGwgb2JqZWN0IGluIHN0cmljdCBtb2RlLCBmYWlsIVxuICAgIC8vIChpLmUuIGlmIGl0J3MgYSBwcmltaXRpdmUgdGhhdCBmYWlsZWQgYSBtYXRjaCwgZG9uJ3QgZmFsbCBiYWNrIHRvIG1vcmUgbG9vc2VseSBtYXRjaCBpdClcbiAgICAvLyBOb3RlIHRoYXQgdGhpcyBzaG91bGRuJ3QgZXZlciBoYXBwZW4gc2luY2Ugd2Ugc2hvdWxkIGJlIHJldHVybmluZyBmYWxzZSBpbW1lZGlhdGVseSBhYm92ZVxuICAgIGlmIChzdHJpY3RuZXNzID09PSBTVFJJQ1RORVNTLlN0cmljdCAmJiAhKHR5cGVvZiBleHBlY3RlZEtleSA9PT0gJ29iamVjdCcgJiYgZXhwZWN0ZWRLZXkgIT09IG51bGwpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSAvLyBvdGhlcndpc2UsIHRlc3QgaXQgLy8gVE9ETzogV2lzaCB3ZSBjb3VsZCB1c2UgI2ZpbmQoKSBsaWtlIG9uIGFuIEFycmF5LCBidXQgU2V0IGRvZXNuJ3QgaGF2ZSBpdCFcblxuXG4gICAgbGV0IGZvdW5kID0gZmFsc2U7XG5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBsb29zZUNoZWNrcykge1xuICAgICAgLy8gaWYgYm90aCBrZXkgYW5kIHZhbHVlIG1hdGNoZXNcbiAgICAgIGlmIChkZWVwRXF1YWwoa2V5LCBleHBlY3RlZEtleSwgc3RyaWN0bmVzcywgcmVmZXJlbmNlcykgJiYgZGVlcEVxdWFsKGFjdHVhbC5nZXQoa2V5KSwgZXhwZWN0ZWRWYWx1ZSwgc3RyaWN0bmVzcywgcmVmZXJlbmNlcykpIHtcbiAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICBsb29zZUNoZWNrcy5kZWxldGUoa2V5KTsgLy8gcmVtb3ZlIGZyb20gb3VyIGxvb3NlQ2hlY2tzIFNldCBzaW5jZSB3ZSBhbHJlYWR5IG1hdGNoZWQgaXRcblxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IC8vIGlmIG5vdCBmb3VuZCwgd2UgZmFpbGVkIHRvIG1hdGNoXG5cblxuICAgIGlmICghZm91bmQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gLy8gZGlkIHdlIGxlYXZlIHVuLW1hdGNoZWQga2V5cz8gaWYgc28sIGZhaWxcblxuXG4gIHJldHVybiBsb29zZUNoZWNrcy5zaXplID09PSAwO1xufVxuLyoqXG4gKiBAcGFyYW0ge1NldH0gYWN0dWFsIG1hcCB3ZSBhcmUgY29tcGFyaW5nXG4gKiBAcGFyYW0ge1NldH0gZXhwZWN0ZWQgbWFwIHdlJ3JlIGNvbXBhcmluZyBhZ2FpbnN0XG4gKiBAcGFyYW0ge3N0cmljdG5lc3MuTG9vc2V8c3RyaWN0bmVzcy5TdHJpY3R9IHN0cmljdG5lc3MgaG93IHRvIGNvbXBhcmVcbiAqIEBwYXJhbSB7b2JqZWN0fSByZWZlcmVuY2VzIG1lbW9pemVkIHJlZmVyZW5jZXMgdG8gb2JqZWN0cyBpbiB0aGUgZGVlcEVxdWFsIGhpZXJhcmNoeVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cblxuXG5mdW5jdGlvbiBjb21wYXJlU2V0cyhhY3R1YWwsIGV4cGVjdGVkLCBzdHJpY3RuZXNzLCByZWZlcmVuY2VzKSB7XG4gIGNvbnN0IGxvb3NlQ2hlY2tzID0gbmV3IFNldCgpOyAvLyBrZWVwIHRyYWNrIG9mIHZhbHVlcyB3ZSBuZWVkIHRvIHRlc3QgbW9yZSBleHRlbnNpdmVseSB0aGFuIHVzaW5nICNoYXMoKVxuXG4gIGZvciAoY29uc3QgdmFsdWUgb2YgYWN0dWFsKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgIC8vIG5vbi1udWxsIG9iamVjdC4gV2UgbmVlZCB0byBkbyBvdXIgb3duIGNoZWNraW5nLCBub3QgdXNlIGhhcygpXG4gICAgICBsb29zZUNoZWNrcy5hZGQodmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoIWV4cGVjdGVkLmhhcyh2YWx1ZSkpIHtcbiAgICAgIC8vIEZJWE1FOiBoYXMgZG9lcyBcInNhbWUtdmFsdWUtemVyb1wiIGNoZWNrLCB3aGljaCBpcyBsaWtlIE9iamVjdC5pcyBleGNlcHQgZm9yIC0wLyswIGJlaW5nIGNvbnNpZGVyZWQgZXF1YWxcbiAgICAgIC8vIHNvIG1heSBuZWVkIHRvIHNwZWNpYWwgY2FzZSB0aGF0IGhlcmUsIHRoYXQnZCBoYXZlIHRvIGJlIGluIGFuIGVsc2UgYmVsb3cgKHNpbmNlIGhhcyB3aWxsIHJldHVybiB0cnVlIGhlcmUpXG4gICAgICBpZiAoc3RyaWN0bmVzcyA9PT0gU1RSSUNUTkVTUy5TdHJpY3QpIHtcbiAgICAgICAgLy8gZmFpbGVkIFwic2FtZS12YWx1ZVwiIG1hdGNoIGZvciBwcmltaXRpdmUgaW4gc3RyaWN0IG1vZGUsIHNvIGZhaWwgcmlnaHQgYXdheVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IC8vIFdoZW4gZG9pbmcgbG9vc2UgY2hlY2ssIHdlIG5lZWQgdG8gZmFsbCBiYWNrIHRvIGxvb3NlciBjaGVjayB0aGFuICNoYXMoKSwgc28gd2UgY2FuJ3QganVzdCByZXR1cm4gZmFsc2UgaW1tZWRpYXRlbHkgaGVyZVxuICAgICAgLy8gYWRkIHRvIHNldCBvZiB2YWx1ZXMgdG8gY2hlY2sgbW9yZSB0aG9yb3VnaGx5XG5cblxuICAgICAgbG9vc2VDaGVja3MuYWRkKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBpZiAobG9vc2VDaGVja3Muc2l6ZSA9PT0gMCkge1xuICAgIC8vIG5vIGxvb3NlIGVuZHMgdG8gdGllIHVwLCBldmVyeXRoaW5nIG1hdGNoZWRcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSAvLyBUcnkgdG8gd2hpdHRsZSBkb3duIHRoZSBsb29zZSBjaGVja3Mgc2V0IHRvIGJlIGVtcHR5Li4uXG4gIC8vIG9ubHkgZ28gdGhyb3VnaCB0aGUgc2Vjb25kIFNldCBvbmNlIVxuXG5cbiAgZm9yIChjb25zdCBleHBlY3RlZFZhbHVlIG9mIGV4cGVjdGVkKSB7XG4gICAgLy8gaWYgaXQncyBub3QgYSBub24tbnVsbCBvYmplY3QgaW4gc3RyaWN0IG1vZGUsIGZhaWwhXG4gICAgLy8gKGkuZS4gaWYgaXQncyBhIHByaW1pdGl2ZSB0aGF0IGZhaWxlZCBhIG1hdGNoLCBkb24ndCBmYWxsIGJhY2sgdG8gbW9yZSBsb29zZWx5IG1hdGNoIGl0KVxuICAgIC8vIE5vdGUgdGhhdCB0aGlzIHNob3VsZG4ndCBldmVyIGhhcHBlbiBzaW5jZSB3ZSBzaG91bGQgYmUgcmV0dXJuaW5nIGZhbHNlIGltbWVkaWF0ZWx5IGFib3ZlXG4gICAgaWYgKHN0cmljdG5lc3MgPT09IFNUUklDVE5FU1MuU3RyaWN0ICYmICEodHlwZW9mIGV4cGVjdGVkVmFsdWUgPT09ICdvYmplY3QnICYmIGV4cGVjdGVkVmFsdWUgIT09IG51bGwpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IGZvdW5kID0gZmFsc2U7XG5cbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBsb29zZUNoZWNrcykge1xuICAgICAgaWYgKGRlZXBFcXVhbChvYmplY3QsIGV4cGVjdGVkVmFsdWUsIHN0cmljdG5lc3MsIHJlZmVyZW5jZXMpKSB7XG4gICAgICAgIGZvdW5kID0gdHJ1ZTsgLy8gZm91bmQgYSBtYXRjaCFcblxuICAgICAgICBsb29zZUNoZWNrcy5kZWxldGUob2JqZWN0KTsgLy8gcmVtb3ZlIGZyb20gb3VyIGxvb3NlQ2hlY2tzIFNldCBzaW5jZSB3ZSBtYXRjaGVkIGl0XG5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSAvLyBpZiBub3QgZm91bmQsIHdlIGZhaWxlZCB0byBtYXRjaFxuXG5cbiAgICBpZiAoIWZvdW5kKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IC8vIGRpZCB3ZSBsZWF2ZSB1bi1tYXRjaGVkIHZhbHVlcz8gaWYgc28sIGZhaWxcblxuXG4gIHJldHVybiBsb29zZUNoZWNrcy5zaXplID09PSAwO1xufVxuLyoqXG4gKiBAcGFyYW0geyp9IGFjdHVhbCB2YWx1ZSB3ZSBhcmUgY29tcGFyaW5nXG4gKiBAcGFyYW0geyp9IGV4cGVjdGVkIHZhbHVlcyB3ZSdyZSBjb21wYXJpbmcgYWdhaW5zdFxuICogQHBhcmFtIHtTVFJJQ1RORVNTLlN0cmljdHxTVFJJQ1RORVNTLkxvb3NlfSBzdHJpY3RuZXNzIGhvdyBzdHJpY3QgYSBjb21wYXJpc29uIHRvIGRvXG4gKiBAcGFyYW0ge29iamVjdH0gW3JlZmVyZW5jZXNdIG9wdGlvbmFsIG9iamVjdCB0byBrZWVwIHRyYWNrIG9mIGNpcmN1bGFyIHJlZmVyZW5jZXMgaW4gdGhlIGhpZXJhcmNoeVxuICogQHBhcmFtIHtNYXA8b2JqZWN0LG51bWJlcj59IFtyZWZlcmVuY2VzLmFjdHVhbF0gbWFwcGluZyBmcm9tIG9iamVjdHMgdmlzaXRlZCAob24gYGFjdHVhbGApIHRvIHRoZWlyIGRlcHRoXG4gKiBAcGFyYW0ge01hcDxvYmplY3QsbnVtYmVyPn0gW3JlZmVyZW5jZXMuZXhwZWN0ZWRdIG1hcHBpbmcgZnJvbSBvYmplY3RzIHZpc2l0ZWQgKG9uIGBleHBlY3RlZGApIHRvIHRoZWlyIGRlcHRoXG4gKiBAcGFyYW0ge251bWJlcn0gW3JlZmVyZW5jZXMuZGVwdGhdIFRoZSBjdXJyZW50IGRlcHRoIG9mIHRoZSBoaWVyYXJjaHlcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5cblxuZnVuY3Rpb24gZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIHN0cmljdG5lc3MsIHJlZmVyZW5jZXMpIHtcbiAgLy8gaWYgcHJpbWl0aXZlcywgY29tcGFyZSB1c2luZyBPYmplY3QuaXNcbiAgLy8gVGhpcyBoYW5kbGVzOiBudWxsLCB1bmRlZmluZWQsIG51bWJlciwgc3RyaW5nLCBib29sZWFuXG4gIGlmIChpc1ByaW1pdGl2ZShhY3R1YWwpICYmIGlzUHJpbWl0aXZlKGV4cGVjdGVkKSkge1xuICAgIGlmIChzdHJpY3RuZXNzID09PSBTVFJJQ1RORVNTLlN0cmljdCkge1xuICAgICAgcmV0dXJuIE9iamVjdC5pcyhhY3R1YWwsIGV4cGVjdGVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFjdHVhbCA9PSBleHBlY3RlZDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBlcWVxZXFcbiAgICB9XG4gIH0gLy8gTm93IHdlIGhhdmUgdmFyaW91cyBvYmplY3RzL2Z1bmN0aW9uczpcbiAgLy8gRGF0ZSwgRXJyb3IsIFJlZ0V4cCwgQXJyYXksIE1hcCwgU2V0LCBPYmplY3QsIEZ1bmN0aW9uLCBBcnJvdyBmdW5jdGlvbnMsIFdlYWtNYXAsIERhdGFWaWV3LCBBcnJheUJ1ZmZlciwgV2Vha1NldCwgdHlwZWQgYXJyYXlzXG4gIC8vIG5vdGFibHksIHRoaXMgaW5jbHVkZXMgXCJib3hlZFwiIHByaW1pdGl2ZXMgY3JlYXRlZCBieSBuZXcgQm9vbGVhbihmYWxzZSksIG5ldyBTdHJpbmcoJ3ZhbHVlJyksIFN5bWJvbCgnd2hhdGV2ZXInKSwgZXRjXG4gIC8vIFR5cGUgdGFncyBvZiBvYmplY3RzIHNob3VsZCBiZSB0aGUgc2FtZVxuXG5cbiAgY29uc3QgYWN0dWFsVGFnID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFjdHVhbCk7XG4gIGNvbnN0IGV4cGVjdGVkVGFnID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGV4cGVjdGVkKTtcblxuICBpZiAoYWN0dWFsVGFnICE9PSBleHBlY3RlZFRhZykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSAvLyBbW1Byb3RvdHlwZV1dIG9mIG9iamVjdHMgYXJlIGNvbXBhcmVkIHVzaW5nIHRoZSBTdHJpY3QgRXF1YWxpdHkgQ29tcGFyaXNvbi5cblxuXG4gIGlmIChzdHJpY3RuZXNzID09PSBTVFJJQ1RORVNTLlN0cmljdCkge1xuICAgIC8vIGRvbid0IGNoZWNrIHByb3RvdHlwZSB3aGVuIGRvaW5nIFwibG9vc2VcIlxuICAgIGNvbnN0IGFjdHVhbFByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihhY3R1YWwpO1xuICAgIGNvbnN0IGV4cGVjdGVkUHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGV4cGVjdGVkKTtcblxuICAgIGlmIChhY3R1YWxQcm90b3R5cGUgIT09IGV4cGVjdGVkUHJvdG90eXBlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgbGV0IGNvbXBhcmlzb24gPSBDT01QQVJFX1RZUEUuT2JqZWN0O1xuXG4gIGlmICh1dGlsLnR5cGVzLmlzUmVnRXhwKGFjdHVhbCkpIHtcbiAgICAvLyBSZWdFeHAgc291cmNlIGFuZCBmbGFncyBzaG91bGQgbWF0Y2hcbiAgICBpZiAoIXV0aWwudHlwZXMuaXNSZWdFeHAoZXhwZWN0ZWQpIHx8IGFjdHVhbC5mbGFncyAhPT0gZXhwZWN0ZWQuZmxhZ3MgfHwgYWN0dWFsLnNvdXJjZSAhPT0gZXhwZWN0ZWQuc291cmNlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSAvLyBjb250aW51ZSBvbiB0byBjaGVjayBwcm9wZXJ0aWVzLi4uXG5cbiAgfSBlbHNlIGlmICh1dGlsLnR5cGVzLmlzRGF0ZShhY3R1YWwpKSB7XG4gICAgLy8gRGF0ZSdzIHVuZGVybHlpbmcgdGltZSBzaG91bGQgbWF0Y2hcbiAgICBpZiAoIXV0aWwudHlwZXMuaXNEYXRlKGV4cGVjdGVkKSB8fCBhY3R1YWwuZ2V0VGltZSgpICE9PSBleHBlY3RlZC5nZXRUaW1lKCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IC8vIGNvbnRpbnVlIG9uIHRvIGNoZWNrIHByb3BlcnRpZXMuLi5cblxuICB9IGVsc2UgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgLy8gRXJyb3IncyBuYW1lIGFuZCBtZXNzYWdlIG11c3QgbWF0Y2hcbiAgICBpZiAoIShleHBlY3RlZCBpbnN0YW5jZW9mIEVycm9yKSB8fCBhY3R1YWwubmFtZSAhPT0gZXhwZWN0ZWQubmFtZSB8fCBhY3R1YWwubWVzc2FnZSAhPT0gZXhwZWN0ZWQubWVzc2FnZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gLy8gY29udGludWUgb24gdG8gY2hlY2sgcHJvcGVydGllcy4uLlxuXG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhY3R1YWwpKSB7XG4gICAgLy8gaWYgYXJyYXkgbGVuZ3RocyBkaWZmZXIsIHF1aWNrIGZhaWxcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZXhwZWN0ZWQpIHx8IGFjdHVhbC5sZW5ndGggIT09IGV4cGVjdGVkLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gLy8gY29udGludWUgb24gdG8gY2hlY2sgcHJvcGVydGllcy4uLlxuXG4gIH0gZWxzZSBpZiAodXRpbC50eXBlcy5pc0JveGVkUHJpbWl0aXZlKGFjdHVhbCkpIHtcbiAgICBpZiAoIXV0aWwudHlwZXMuaXNCb3hlZFByaW1pdGl2ZShleHBlY3RlZCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IC8vIGNoZWNrIHRoYXQgdGhleSdyZSB0aGUgc2FtZSB0eXBlIG9mIHdyYXBwZWQgcHJpbWl0aXZlIGFuZCB0aGVuIGNhbGwgdGhlIHJlbGV2YW50IHZhbHVlT2YoKSBmb3IgdGhhdCB0eXBlIHRvIGNvbXBhcmUgdGhlbSFcblxuXG4gICAgaWYgKHV0aWwudHlwZXMuaXNOdW1iZXJPYmplY3QoYWN0dWFsKSAmJiAoIXV0aWwudHlwZXMuaXNOdW1iZXJPYmplY3QoZXhwZWN0ZWQpIHx8ICFPYmplY3QuaXMoTnVtYmVyLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoYWN0dWFsKSwgTnVtYmVyLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoZXhwZWN0ZWQpKSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKHV0aWwudHlwZXMuaXNTdHJpbmdPYmplY3QoYWN0dWFsKSAmJiAoIXV0aWwudHlwZXMuaXNTdHJpbmdPYmplY3QoZXhwZWN0ZWQpIHx8IFN0cmluZy5wcm90b3R5cGUudmFsdWVPZi5jYWxsKGFjdHVhbCkgIT09IFN0cmluZy5wcm90b3R5cGUudmFsdWVPZi5jYWxsKGV4cGVjdGVkKSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKHV0aWwudHlwZXMuaXNCb29sZWFuT2JqZWN0KGFjdHVhbCkgJiYgKCF1dGlsLnR5cGVzLmlzQm9vbGVhbk9iamVjdChleHBlY3RlZCkgfHwgQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKGFjdHVhbCkgIT09IEJvb2xlYW4ucHJvdG90eXBlLnZhbHVlT2YuY2FsbChleHBlY3RlZCkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7IC8vIEZJWE1FOiBVbmNvbW1lbnQgd2hlbiB3ZSBzdXBwb3J0IEJpZ0ludCBjcm9zcy1wbGF0Zm9ybSFcbiAgICAgIC8vIH0gZWxzZSBpZiAodXRpbC50eXBlcy5pc0JpZ0ludE9iamVjdChhY3R1YWwpXG4gICAgICAvLyBcdCYmICghdXRpbC50eXBlcy5pc0JpZ0ludE9iamVjdChleHBlY3RlZClcbiAgICAgIC8vIFx0XHR8fCBCaWdJbnQucHJvdG90eXBlLnZhbHVlT2YuY2FsbChhY3R1YWwpICE9PSBCaWdJbnQucHJvdG90eXBlLnZhbHVlT2YuY2FsbChleHBlY3RlZCkpKSB7XG4gICAgICAvLyBcdHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKHV0aWwudHlwZXMuaXNTeW1ib2xPYmplY3QoYWN0dWFsKSAmJiAoIXV0aWwudHlwZXMuaXNTeW1ib2xPYmplY3QoZXhwZWN0ZWQpIHx8IFN5bWJvbC5wcm90b3R5cGUudmFsdWVPZi5jYWxsKGFjdHVhbCkgIT09IFN5bWJvbC5wcm90b3R5cGUudmFsdWVPZi5jYWxsKGV4cGVjdGVkKSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IC8vIGNvbnRpbnVlIG9uIHRvIGNoZWNrIHByb3BlcnRpZXMuLi5cblxuICB9IGVsc2UgaWYgKHV0aWwudHlwZXMuaXNTZXQoYWN0dWFsKSkge1xuICAgIGlmICghdXRpbC50eXBlcy5pc1NldChleHBlY3RlZCkgfHwgYWN0dWFsLnNpemUgIT09IGV4cGVjdGVkLnNpemUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb21wYXJpc29uID0gQ09NUEFSRV9UWVBFLlNldDsgLy8gY29udGludWUgb24gdG8gY2hlY2sgcHJvcGVydGllcy4uLlxuICB9IGVsc2UgaWYgKHV0aWwudHlwZXMuaXNNYXAoYWN0dWFsKSkge1xuICAgIGlmICghdXRpbC50eXBlcy5pc01hcChleHBlY3RlZCkgfHwgYWN0dWFsLnNpemUgIT09IGV4cGVjdGVkLnNpemUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb21wYXJpc29uID0gQ09NUEFSRV9UWVBFLk1hcDsgLy8gY29udGludWUgb24gdG8gY2hlY2sgcHJvcGVydGllcy4uLlxuICB9IC8vIE5vdyBpdGVyYXRlIG92ZXIgcHJvcGVydGllcyBhbmQgY29tcGFyZSB0aGVtIVxuXG5cbiAgY29uc3QgYWN0dWFsS2V5cyA9IE9iamVjdC5rZXlzKGFjdHVhbCk7IC8vIGZvciBhbiBhcnJheSwgdGhpcyB3aWxsIHJldHVybiB0aGUgaW5kaWNlcyB0aGF0IGhhdmUgdmFsdWVzXG5cbiAgY29uc3QgZXhwZWN0ZWRLZXlzID0gT2JqZWN0LmtleXMoZXhwZWN0ZWQpOyAvLyBhbmQgaXQganVzdCBtYWdpY2FsbHkgd29ya3NcbiAgLy8gTXVzdCBoYXZlIHNhbWUgbnVtYmVyIG9mIHByb3BlcnRpZXNcblxuICBpZiAoYWN0dWFsS2V5cy5sZW5ndGggIT09IGV4cGVjdGVkS2V5cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gLy8gQXJlIHRoZXkgdGhlIHNhbWUga2V5cz8gSWYgb25lIGlzIG1pc3NpbmcsIHRoZW4gbm8sIGZhaWwgcmlnaHQgYXdheVxuXG5cbiAgaWYgKCFhY3R1YWxLZXlzLmV2ZXJ5KGtleSA9PiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZXhwZWN0ZWQsIGtleSkpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IC8vIERvbid0IGNoZWNrIG93biBzeW1ib2xzIHdoZW4gZG9pbmcgXCJsb29zZVwiXG5cblxuICBpZiAoc3RyaWN0bmVzcyA9PT0gU1RSSUNUTkVTUy5TdHJpY3QpIHtcbiAgICBjb25zdCBhY3R1YWxTeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhhY3R1YWwpO1xuICAgIGNvbnN0IGV4cGVjdGVkU3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZXhwZWN0ZWQpOyAvLyBNdXN0IGhhdmUgc2FtZSBudW1iZXIgb2Ygc3ltYm9sc1xuXG4gICAgaWYgKGFjdHVhbFN5bWJvbHMubGVuZ3RoICE9PSBleHBlY3RlZFN5bWJvbHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGFjdHVhbFN5bWJvbHMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gSGF2ZSB0byBmaWx0ZXIgdGhlbSBkb3duIHRvIGVudW1lcmFibGUgc3ltYm9scyFcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGFjdHVhbFN5bWJvbHMpIHtcbiAgICAgICAgY29uc3QgYWN0dWFsSXNFbnVtZXJhYmxlID0gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKGFjdHVhbCwga2V5KTtcbiAgICAgICAgY29uc3QgZXhwZWN0ZWRJc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoZXhwZWN0ZWQsIGtleSk7XG5cbiAgICAgICAgaWYgKGFjdHVhbElzRW51bWVyYWJsZSAhPT0gZXhwZWN0ZWRJc0VudW1lcmFibGUpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIHRoZXkgZGlmZmVyIG9uIHdoZXRlaHIgc3ltYm9sIGlzIGVudW1lcmFibGUsIGZhaWwhXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0dWFsSXNFbnVtZXJhYmxlKSB7XG4gICAgICAgICAgLy8gaXQncyBlbnVtZXJhYmxlLCBhZGQgdG8ga2V5cyB0byBjaGVja1xuICAgICAgICAgIGFjdHVhbEtleXMucHVzaChrZXkpO1xuICAgICAgICAgIGV4cGVjdGVkS2V5cy5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gLy8gQXZvaWQgY2lyY3VsYXIgcmVmZXJlbmNlcyFcbiAgLy8gUmVjb3JkIG1hcCBmcm9tIG9iamVjdHMgdG8gZGVwdGggaW4gdGhlIGhpZXJhcmNoeVxuXG5cbiAgaWYgKHJlZmVyZW5jZXMgPT09IHVuZGVmaW5lZCkge1xuICAgIHJlZmVyZW5jZXMgPSB7XG4gICAgICBhY3R1YWw6IG5ldyBNYXAoKSxcbiAgICAgIGV4cGVjdGVkOiBuZXcgTWFwKCksXG4gICAgICBkZXB0aDogMFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgLy8gc2VlIGlmIHdlJ3ZlIGFscmVhZHkgcmVjb3JkZWQgdGhlc2Ugb2JqZWN0cy5cbiAgICAvLyBpZiBzbywgbWFrZSBzdXJlIHRoZXkgcmVmZXIgdG8gc2FtZSBkZXB0aCBpbiBvYmplY3QgaGllcmFyY2h5XG4gICAgY29uc3QgbWVtb2l6ZWRBY3R1YWwgPSByZWZlcmVuY2VzLmFjdHVhbC5nZXQoYWN0dWFsKTtcblxuICAgIGlmIChtZW1vaXplZEFjdHVhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBtZW1vaXplZEV4cGVjdGVkID0gcmVmZXJlbmNlcy5leHBlY3RlZC5nZXQoZXhwZWN0ZWQpO1xuXG4gICAgICBpZiAobWVtb2l6ZWRFeHBlY3RlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBtZW1vaXplZEFjdHVhbCA9PT0gbWVtb2l6ZWRFeHBlY3RlZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZWZlcmVuY2VzLmRlcHRoKys7XG4gIH0gLy8gc3RvcmUgdGhlIG9iamVjdCAtPiBkZXB0aCBtYXBwaW5nXG5cblxuICByZWZlcmVuY2VzLmFjdHVhbC5zZXQoYWN0dWFsLCByZWZlcmVuY2VzLmRlcHRoKTtcbiAgcmVmZXJlbmNlcy5leHBlY3RlZC5zZXQoZXhwZWN0ZWQsIHJlZmVyZW5jZXMuZGVwdGgpOyAvLyBXaGVuIGNvbXBhcmluZyBNYXBzL1NldHMsIGNvbXBhcmUgZWxlbWVudHMgYmVmb3JlIGN1c3RvbSBwcm9wZXJ0aWVzXG5cbiAgbGV0IHJlc3VsdCA9IHRydWU7XG5cbiAgaWYgKGNvbXBhcmlzb24gPT09IENPTVBBUkVfVFlQRS5TZXQpIHtcbiAgICByZXN1bHQgPSBjb21wYXJlU2V0cyhhY3R1YWwsIGV4cGVjdGVkLCBzdHJpY3RuZXNzLCByZWZlcmVuY2VzKTtcbiAgfSBlbHNlIGlmIChjb21wYXJpc29uID09PSBDT01QQVJFX1RZUEUuTWFwKSB7XG4gICAgcmVzdWx0ID0gY29tcGFyZU1hcHMoYWN0dWFsLCBleHBlY3RlZCwgc3RyaWN0bmVzcywgcmVmZXJlbmNlcyk7XG4gIH1cblxuICBpZiAocmVzdWx0KSB7XG4gICAgLy8gTm93IGxvb3Agb3ZlciBrZXlzIGFuZCBjb21wYXJlIHRoZW0gdG8gZWFjaCBvdGhlciFcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBhY3R1YWxLZXlzKSB7XG4gICAgICBpZiAoIWRlZXBFcXVhbChhY3R1YWxba2V5XSwgZXhwZWN0ZWRba2V5XSwgc3RyaWN0bmVzcywgcmVmZXJlbmNlcykpIHtcbiAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfSAvLyB3aXBlIHRoZSBvYmplY3QgdG8gZGVwdGggbWFwcGluZyBmb3IgdGhlc2Ugb2JqZWN0cyBub3dcblxuXG4gIHJlZmVyZW5jZXMuYWN0dWFsLmRlbGV0ZShhY3R1YWwpO1xuICByZWZlcmVuY2VzLmV4cGVjdGVkLmRlbGV0ZShleHBlY3RlZCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmFzc2VydCQxLmRlZXBTdHJpY3RFcXVhbCA9IChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSA9PiB7XG4gIGlmICghZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIFNUUklDVE5FU1MuU3RyaWN0KSkge1xuICAgIHRocm93RXJyb3Ioe1xuICAgICAgYWN0dWFsLFxuICAgICAgZXhwZWN0ZWQsXG4gICAgICBtZXNzYWdlLFxuICAgICAgb3BlcmF0b3I6ICdkZWVwU3RyaWN0RXF1YWwnXG4gICAgfSk7XG4gIH1cbn07XG5cbmFzc2VydCQxLm5vdERlZXBTdHJpY3RFcXVhbCA9IChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSA9PiB7XG4gIGlmIChkZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgU1RSSUNUTkVTUy5TdHJpY3QpKSB7XG4gICAgdGhyb3dFcnJvcih7XG4gICAgICBhY3R1YWwsXG4gICAgICBleHBlY3RlZCxcbiAgICAgIG1lc3NhZ2UsXG4gICAgICBvcGVyYXRvcjogJ25vdERlZXBTdHJpY3RFcXVhbCdcbiAgICB9KTtcbiAgfVxufTtcblxuYXNzZXJ0JDEuZGVlcEVxdWFsID0gKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpID0+IHtcbiAgaWYgKCFkZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgU1RSSUNUTkVTUy5Mb29zZSkpIHtcbiAgICB0aHJvd0Vycm9yKHtcbiAgICAgIGFjdHVhbCxcbiAgICAgIGV4cGVjdGVkLFxuICAgICAgbWVzc2FnZSxcbiAgICAgIG9wZXJhdG9yOiAnZGVlcEVxdWFsJ1xuICAgIH0pO1xuICB9XG59O1xuXG5hc3NlcnQkMS5ub3REZWVwRXF1YWwgPSAoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkgPT4ge1xuICBpZiAoZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIFNUUklDVE5FU1MuTG9vc2UpKSB7XG4gICAgdGhyb3dFcnJvcih7XG4gICAgICBhY3R1YWwsXG4gICAgICBleHBlY3RlZCxcbiAgICAgIG1lc3NhZ2UsXG4gICAgICBvcGVyYXRvcjogJ25vdERlZXBFcXVhbCdcbiAgICB9KTtcbiAgfVxufTtcblxuYXNzZXJ0JDEuZmFpbCA9IChtZXNzYWdlID0gJ0ZhaWxlZCcpID0+IHRocm93RXJyb3Ioe1xuICBtZXNzYWdlXG59KTtcblxuY29uc3QgTk9fRVhDRVBUSU9OID0ge307XG5cbmZ1bmN0aW9uIGV4ZWN1dGUoZm4pIHtcbiAgYXNzZXJ0QXJndW1lbnRUeXBlKGZuLCAnZm4nLCAnRnVuY3Rpb24nKTtcblxuICB0cnkge1xuICAgIGZuKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZTtcbiAgfVxuXG4gIHJldHVybiBOT19FWENFUFRJT047XG59XG5cbmZ1bmN0aW9uIGlzUHJvbWlzZUxpa2UoZm4pIHtcbiAgcmV0dXJuIHV0aWwudHlwZXMuaXNQcm9taXNlKGZuKSB8fCBmbiAmJiB0eXBlb2YgZm4gPT09ICdvYmplY3QnICYmIHR5cGVvZiBmbi50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuXG5hc3luYyBmdW5jdGlvbiBleGVjdXRlUHJvbWlzZShmbikge1xuICBsZXQgcHJvbWlzZTtcbiAgY29uc3QgZm5UeXBlID0gdHlwZW9mIGZuO1xuXG4gIGlmIChmblR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICBwcm9taXNlID0gZm4oKTtcblxuICAgIGlmICghaXNQcm9taXNlTGlrZShwcm9taXNlKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgaW5zdGFuY2VvZiBQcm9taXNlIHRvIGJlIHJldHVybmVkIGZyb20gdGhlIFwiZm5cIiBmdW5jdGlvbiBidXQgZ290ICR7dHlwZW9mIHByb21pc2V9YCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmICghaXNQcm9taXNlTGlrZShmbikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFRoZSBcImZuXCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIEZ1bmN0aW9uIG9yIFByb21pc2UuIFJlY2VpdmVkIHR5cGUgJHtmblR5cGV9YCk7XG4gICAgfVxuXG4gICAgcHJvbWlzZSA9IGZuO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBwcm9taXNlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGU7XG4gIH1cblxuICByZXR1cm4gTk9fRVhDRVBUSU9OO1xufVxuXG5hc3NlcnQkMS50aHJvd3MgPSAoZm4sIGVycm9yLCBtZXNzYWdlKSA9PiB7XG4gIGNvbnN0IGFjdHVhbCA9IGV4ZWN1dGUoZm4pO1xuXG4gIGlmIChhY3R1YWwgPT09IE5PX0VYQ0VQVElPTikge1xuICAgIC8vIEZJWE1FOiBhcHBlbmQgbWVzc2FnZSBpZiBub3QgbnVsbFxuICAgIHRocm93RXJyb3Ioe1xuICAgICAgYWN0dWFsOiB1bmRlZmluZWQsXG4gICAgICBleHBlY3RlZDogZXJyb3IsXG4gICAgICBtZXNzYWdlOiAnTWlzc2luZyBleHBlY3RlZCBleGNlcHRpb24uJyxcbiAgICAgIG9wZXJhdG9yOiAndGhyb3dzJ1xuICAgIH0pO1xuICAgIHJldHVybjtcbiAgfSAvLyBUaGV5IGRpZG4ndCBzcGVjaWZ5IGhvdyB0byB2YWxpZGF0ZSwgc28ganVzdCByb2xsIHdpdGggaXRcblxuXG4gIGlmICghZXJyb3IpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIWNoZWNrRXJyb3IoYWN0dWFsLCBlcnJvciwgbWVzc2FnZSkpIHtcbiAgICB0aHJvdyBhY3R1YWw7IC8vIHRocm93IHRoZSBFcnJvciBpdCBkaWQgZ2VuZXJhdGVcbiAgfVxufTtcblxuYXNzZXJ0JDEucmVqZWN0cyA9IGFzeW5jIGZ1bmN0aW9uIChhc3luY0ZuLCBlcnJvciwgbWVzc2FnZSkge1xuICBjb25zdCBhY3R1YWwgPSBhd2FpdCBleGVjdXRlUHJvbWlzZShhc3luY0ZuKTtcblxuICBpZiAoYWN0dWFsID09PSBOT19FWENFUFRJT04pIHtcbiAgICAvLyBGSVhNRTogYXBwZW5kIG1lc3NhZ2UgaWYgbm90IG51bGxcbiAgICB0aHJvd0Vycm9yKHtcbiAgICAgIGFjdHVhbDogdW5kZWZpbmVkLFxuICAgICAgZXhwZWN0ZWQ6IGVycm9yLFxuICAgICAgbWVzc2FnZTogJ01pc3NpbmcgZXhwZWN0ZWQgZXhjZXB0aW9uLicsXG4gICAgICBvcGVyYXRvcjogJ3JlamVjdHMnXG4gICAgfSk7XG4gICAgcmV0dXJuO1xuICB9IC8vIFRoZXkgZGlkbid0IHNwZWNpZnkgaG93IHRvIHZhbGlkYXRlLCBzbyBqdXN0IHJvbGwgd2l0aCBpdFxuXG5cbiAgaWYgKCFlcnJvcikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghY2hlY2tFcnJvcihhY3R1YWwsIGVycm9yLCBtZXNzYWdlKSkge1xuICAgIHRocm93IGFjdHVhbDsgLy8gdGhyb3cgdGhlIEVycm9yIGl0IGRpZCBnZW5lcmF0ZVxuICB9XG59O1xuXG5hc3NlcnQkMS5kb2VzTm90VGhyb3cgPSAoZm4sIGVycm9yLCBtZXNzYWdlKSA9PiB7XG4gIGNvbnN0IGFjdHVhbCA9IGV4ZWN1dGUoZm4pOyAvLyBubyBFcnJvciwganVzdCByZXR1cm5cblxuICBpZiAoYWN0dWFsID09PSBOT19FWENFUFRJT04pIHtcbiAgICByZXR1cm47XG4gIH0gLy8gVGhleSBkaWRuJ3Qgc3BlY2lmeSBob3cgdG8gdmFsaWRhdGUsIHNvIGp1c3QgcmUtdGhyb3dcblxuXG4gIGlmICghZXJyb3IpIHtcbiAgICB0aHJvdyBhY3R1YWw7XG4gIH0gLy8gSWYgZXJyb3IgbWF0Y2hlcyBleHBlY3RlZCwgdGhyb3cgYW4gQXNzZXJ0aW9uRXJyb3JcblxuXG4gIGlmIChjaGVja0Vycm9yKGFjdHVhbCwgZXJyb3IpKSB7XG4gICAgdGhyb3dFcnJvcih7XG4gICAgICBhY3R1YWwsXG4gICAgICBleHBlY3RlZDogZXJyb3IsXG4gICAgICBvcGVyYXRvcjogJ2RvZXNOb3RUaHJvdycsXG4gICAgICBtZXNzYWdlOiBgR290IHVud2FudGVkIGV4Y2VwdGlvbiR7bWVzc2FnZSA/ICc6ICcgKyBtZXNzYWdlIDogJy4nfWBcbiAgICB9KTtcbiAgICByZXR1cm47XG4gIH0gLy8gZG9lc24ndCBtYXRjaCwgcmUtdGhyb3dcblxuXG4gIHRocm93IGFjdHVhbDtcbn07XG5cbmFzc2VydCQxLmRvZXNOb3RSZWplY3QgPSBhc3luYyBmdW5jdGlvbiAoZm4sIGVycm9yLCBtZXNzYWdlKSB7XG4gIGNvbnN0IGFjdHVhbCA9IGF3YWl0IGV4ZWN1dGVQcm9taXNlKGZuKTsgLy8gbm8gRXJyb3IsIGp1c3QgcmV0dXJuXG5cbiAgaWYgKGFjdHVhbCA9PT0gTk9fRVhDRVBUSU9OKSB7XG4gICAgcmV0dXJuO1xuICB9IC8vIFRoZXkgZGlkbid0IHNwZWNpZnkgaG93IHRvIHZhbGlkYXRlLCBzbyBqdXN0IHJlLXRocm93XG5cblxuICBpZiAoIWVycm9yKSB7XG4gICAgdGhyb3cgYWN0dWFsO1xuICB9IC8vIElmIGVycm9yIG1hdGNoZXMgZXhwZWN0ZWQsIHRocm93IGFuIEFzc2VydGlvbkVycm9yXG5cblxuICBpZiAoY2hlY2tFcnJvcihhY3R1YWwsIGVycm9yKSkge1xuICAgIHRocm93RXJyb3Ioe1xuICAgICAgYWN0dWFsLFxuICAgICAgZXhwZWN0ZWQ6IGVycm9yLFxuICAgICAgb3BlcmF0b3I6ICdkb2VzTm90VGhyb3cnLFxuICAgICAgbWVzc2FnZTogYEdvdCB1bndhbnRlZCBleGNlcHRpb24ke21lc3NhZ2UgPyAnOiAnICsgbWVzc2FnZSA6ICcuJ31gXG4gICAgfSk7XG4gICAgcmV0dXJuO1xuICB9IC8vIGRvZXNuJ3QgbWF0Y2gsIHJlLXRocm93XG5cblxuICB0aHJvdyBhY3R1YWw7XG59O1xuLyoqXG4gKiBAcGFyYW0ge0Vycm9yfSBhY3R1YWwgdGhlIGFjdHVhbCBFcnJvciBnZW5lcmF0ZWQgYnkgdGhlIHdyYXBwZWQgZnVuY3Rpb24vYmxvY2tcbiAqIEBwYXJhbSB7b2JqZWN0fFJlZ0V4cHxGdW5jdGlvbnxFcnJvcnxDbGFzc30gZXhwZWN0ZWQgVGhlIHZhbHVlIHRvIHRlc3QgYWdhaW5zdCB0aGUgRXJyb3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBbbWVzc2FnZV0gY3VzdG9tIG1lc3NhZ2UgdG8gYXBwZW5kXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgRXJyb3IgbWF0Y2hlcyB0aGUgZXhwZWN0ZWQgdmFsdWUvb2JqZWN0XG4gKi9cblxuXG5mdW5jdGlvbiBjaGVja0Vycm9yKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgLy8gV2hhdCB3ZSBkbyBoZXJlIGRlcGVuZHMgb24gd2hhdCBgZXhwZWN0ZWRgIGlzOlxuICAvLyBmdW5jdGlvbiAtIGNhbGwgaXQgdG8gdmFsaWRhdGVcbiAgLy8gb2JqZWN0IC0gdGVzdCBwcm9wZXJ0aWVzIGFnYWluc3QgYWN0dWFsXG4gIC8vIFJlZ2V4cCAtIHRlc3QgYWdhaW5zdCBhY3R1YWwudG9TdHJpbmcoKVxuICAvLyBFcnJvciB0eXBlIC0gY2hlY2sgdHlwZSBtYXRjaGVzXG4gIC8vIEVycm9yIGluc3RhbmNlIC0gY29tcGFyZSBwcm9wZXJ0aWVzXG4gIGlmICh0eXBlb2YgZXhwZWN0ZWQgPT09ICdvYmplY3QnKSB7XG4gICAgaWYgKHV0aWwudHlwZXMuaXNSZWdFeHAoZXhwZWN0ZWQpKSB7XG4gICAgICByZXR1cm4gZXhwZWN0ZWQudGVzdChhY3R1YWwpOyAvLyBkb2VzIHRoZSBlcnJvciBtYXRjaCB0aGUgUmVnRXhwIGV4cHJlc3Npb24/IGlmIHNvLCBwYXNzXG4gICAgfSAvLyBUZXN0IHByb3BlcnRpZXMgKGBleHBlY3RlZGAgaXMgZWl0aGVyIGEgZ2VuZXJpYyBPYmplY3Qgb3IgYW4gRXJyb3IgaW5zdGFuY2UpXG5cblxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhleHBlY3RlZCk7IC8vIElmIHdlJ3JlIHRlc3RpbmcgYWdhaW5zdCBhbiBpbnN0YW5jZSBvZiBhbiBFcnJvciwgd2UgbmVlZCB0byBoYWNrIGluIG5hbWUvbWVzc2FnZSBwcm9wZXJ0aWVzLlxuXG4gICAgaWYgKGV4cGVjdGVkIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIGtleXMudW5zaGlmdCgnbmFtZScsICdtZXNzYWdlJyk7IC8vIHdlIHdhbnQgdG8gY29tcGFyZSBuYW1lIGFuZCBtZXNzYWdlLCBidXQgdGhleSdyZSBub3Qgc2V0IGFzIGVudW1lcmFibGUgb24gRXJyb3JcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICBpZiAoIWRlZXBFcXVhbChhY3R1YWxba2V5XSwgZXhwZWN0ZWRba2V5XSwgU1RSSUNUTkVTUy5TdHJpY3QpKSB7XG4gICAgICAgIGlmICghbWVzc2FnZSkge1xuICAgICAgICAgIC8vIGdlbmVyYXRlIGEgbWVhbmluZ2Z1bCBtZXNzYWdlISBDaGVhdCBieSB0cmVhdGluZyBsaWtlIGVxdWFsaXR5IGNoZWNrIG9mIHZhbHVlc1xuICAgICAgICAgIC8vIHRoZW4gc3RlYWwgdGhlIG1lc3NhZ2UgaXQgZ2VuZXJhdGVkXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRocm93RXJyb3Ioe1xuICAgICAgICAgICAgICBhY3R1YWw6IGFjdHVhbFtrZXldLFxuICAgICAgICAgICAgICBleHBlY3RlZDogZXhwZWN0ZWRba2V5XSxcbiAgICAgICAgICAgICAgb3BlcmF0b3I6ICdkZWVwU3RyaWN0RXF1YWwnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBlcnIubWVzc2FnZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvd0Vycm9yKHtcbiAgICAgICAgICBhY3R1YWwsXG4gICAgICAgICAgZXhwZWN0ZWQsXG4gICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICBvcGVyYXRvcjogJ3Rocm93cydcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTsgLy8gVGhleSBhbGwgbWF0Y2hlZCwgcGFzcyFcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwZWN0ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBpZiBgZXhwZWN0ZWRgIGlzIGEgXCJ0eXBlXCIgYW5kIGFjdHVhbCBpcyBhbiBpbnN0YW5jZSBvZiB0aGF0IHR5cGUsIHRoZW4gcGFzc1xuICAgIGlmIChleHBlY3RlZC5wcm90b3R5cGUgIT0gbnVsbCAmJiBhY3R1YWwgaW5zdGFuY2VvZiBleHBlY3RlZCkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1lcS1udWxsLGVxZXFlcVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSAvLyBJZiBgZXhwZWN0ZWRgIGlzIGEgc3ViY2xhc3Mgb2YgRXJyb3IgYnV0IGBhY3R1YWxgIHdhc24ndCBhbiBpbnN0YW5jZSBvZiBpdCAoYWJvdmUpLCBmYWlsXG5cblxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YuY2FsbChFcnJvciwgZXhwZWN0ZWQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSAvLyBvaywgbGV0J3MgYXNzdW1lIHdoYXQncyBsZWZ0IGlzIHRoYXQgYGV4cGVjdGVkYCB3YXMgYSB2YWxpZGF0aW9uIGZ1bmN0aW9uLFxuICAgIC8vIHNvIGNhbGwgaXQgd2l0aCBlbXB0eSBgdGhpc2AgYW5kIHNpbmdsZSBhcmd1bWVudCBvZiB0aGUgYWN0dWFsIGVycm9yIHdlIHJlY2VpdmVkXG5cblxuICAgIHJldHVybiBleHBlY3RlZC5jYWxsKHt9LCBhY3R1YWwpO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5hc3NlcnQkMS5pZkVycm9yID0gdmFsdWUgPT4ge1xuICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRocm93RXJyb3Ioe1xuICAgIGFjdHVhbDogdmFsdWUsXG4gICAgZXhwZWN0ZWQ6IG51bGwsXG4gICAgbWVzc2FnZTogYGlmRXJyb3IgZ290IHVud2FudGVkIGV4Y2VwdGlvbjogJHt2YWx1ZX1gLFxuICAgIG9wZXJhdG9yOiAnaWZFcnJvcidcbiAgfSk7XG59OyAvLyBDcmVhdGUgXCJzdHJpY3RcIiBjb3B5IHdoaWNoIG92ZXJyaWRlcyBcImxvb3NlXCIgbWV0aG9kcyB0byBjYWxsIHN0cmljdCBlcXVpdmFsZW50c1xuXG5cbmFzc2VydCQxLnN0cmljdCA9ICh2YWx1ZSwgbWVzc2FnZSkgPT4gYXNzZXJ0JDEub2sodmFsdWUsIG1lc3NhZ2UpOyAvLyBcIkNvcHlcIiBtZXRob2RzIGZyb20gYXNzZXJ0IHRvIGFzc2VydC5zdHJpY3QhXG5cblxuT2JqZWN0LmFzc2lnbihhc3NlcnQkMS5zdHJpY3QsIGFzc2VydCQxKTsgLy8gT3ZlcnJpZGUgdGhlIFwibG9vc2VcIiBtZXRob2RzIHRvIHBvaW50IHRvIHRoZSBzdHJpY3Qgb25lc1xuXG5hc3NlcnQkMS5zdHJpY3QuZGVlcEVxdWFsID0gYXNzZXJ0JDEuZGVlcFN0cmljdEVxdWFsO1xuYXNzZXJ0JDEuc3RyaWN0Lm5vdERlZXBFcXVhbCA9IGFzc2VydCQxLm5vdERlZXBTdHJpY3RFcXVhbDtcbmFzc2VydCQxLnN0cmljdC5lcXVhbCA9IGFzc2VydCQxLnN0cmljdEVxdWFsO1xuYXNzZXJ0JDEuc3RyaWN0Lm5vdEVxdWFsID0gYXNzZXJ0JDEubm90U3RyaWN0RXF1YWw7IC8vIGhhbmcgc3RyaWN0IG9mZiBpdHNlbGZcblxuYXNzZXJ0JDEuc3RyaWN0LnN0cmljdCA9IGFzc2VydCQxLnN0cmljdDtcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gW2VuY29kaW5nPSd1dGY4J10gVGhlIGNoYXJhY3RlciBlbmNvZGluZyB0aGUgYFN0cmluZ0RlY29kZXJgIHdpbGwgdXNlLlxuICovXG5mdW5jdGlvbiBTdHJpbmdEZWNvZGVyKGVuY29kaW5nID0gJ3V0ZjgnKSB7XG4gIHRoaXMuZW5jb2RpbmcgPSBlbmNvZGluZy50b0xvd2VyQ2FzZSgpO1xuXG4gIHN3aXRjaCAodGhpcy5lbmNvZGluZykge1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHRoaXMuX2ltcGwgPSBuZXcgVXRmOFN0cmluZ0RlY29kZXIoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2LWxlJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIHRoaXMuX2ltcGwgPSBuZXcgVXRmMTZTdHJpbmdEZWNvZGVyKCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICB0aGlzLl9pbXBsID0gbmV3IEJhc2U2NFN0cmluZ0RlY29kZXIoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRoaXMuX2ltcGwgPSBuZXcgU3RyaW5nRGVjb2RlckltcGwodGhpcy5lbmNvZGluZyk7XG4gICAgICBicmVhaztcbiAgfVxufVxuLyoqXG4gKiBSZXR1cm5zIGFueSByZW1haW5pbmcgaW5wdXQgc3RvcmVkIGluIHRoZSBpbnRlcm5hbCBidWZmZXIgYXMgYSBzdHJpbmcuXG4gKiBCeXRlcyByZXByZXNlbnRpbmcgaW5jb21wbGV0ZSBVVEYtOCBhbmQgVVRGLTE2IGNoYXJhY3RlcnMgd2lsbCBiZSByZXBsYWNlZCB3aXRoIHN1YnN0aXR1dGlvblxuICogY2hhcmFjdGVycyBhcHByb3ByaWF0ZSBmb3IgdGhlIGNoYXJhY3RlciBlbmNvZGluZy5cbiAqXG4gKiBJZiB0aGUgYnVmZmVyIGFyZ3VtZW50IGlzIHByb3ZpZGVkLCBvbmUgZmluYWwgY2FsbCB0byBzdHJpbmdEZWNvZGVyLndyaXRlKCkgaXMgcGVyZm9ybWVkIGJlZm9yZSByZXR1cm5pbmcgdGhlIHJlbWFpbmluZyBpbnB1dC5cbiAqIEBwYXJhbSB7QnVmZmVyfSBbYnVmZmVyXSBjb250YWluaW5nIHRoZSBieXRlcyB0byBkZWNvZGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5cblxuU3RyaW5nRGVjb2Rlci5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24gZW5kKGJ1ZmZlcikge1xuICByZXR1cm4gdGhpcy5faW1wbC5lbmQoYnVmZmVyKTtcbn07XG4vKipcbiAqIFJldHVybnMgYSBkZWNvZGVkIHN0cmluZywgZW5zdXJpbmcgdGhhdCBhbnkgaW5jb21wbGV0ZSBtdWx0aWJ5dGUgY2hhcmFjdGVycyBhdCB0aGUgZW5kIG9mIHRoZSBCdWZmZXIsIG9yXG4gKiBUeXBlZEFycmF5LCBvciBEYXRhVmlldyBhcmUgb21pdHRlZCBmcm9tIHRoZSByZXR1cm5lZCBzdHJpbmcgYW5kIHN0b3JlZCBpbiBhbiBpbnRlcm5hbCBidWZmZXIgZm9yIHRoZVxuICogbmV4dCBjYWxsIHRvIHN0cmluZ0RlY29kZXIud3JpdGUoKSBvciBzdHJpbmdEZWNvZGVyLmVuZCgpLlxuICogQHBhcmFtIHtCdWZmZXJ8VHlwZWRBcnJheXxEYXRhVmlld30gYnVmZmVyIGNvbnRhaW5pbmcgdGhlIGJ5dGVzIHRvIGRlY29kZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cblxuXG5TdHJpbmdEZWNvZGVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlKGJ1ZmZlcikge1xuICBpZiAodHlwZW9mIGJ1ZmZlciA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gYnVmZmVyO1xuICB9IC8vIGVtcHR5IHN0cmluZyBmb3IgZW1wdHkgYnVmZmVyXG5cblxuICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIHJldHVybiB0aGlzLl9pbXBsLndyaXRlKGJ1ZmZlcik7XG59O1xuLyoqXG4gKiBUaGlzIGlzIHRoZSBiYXNlIGNsYXNzLiBXZSBvdmVycmlkZSBwYXJ0cyBvZiBpdCBmb3IgY2VydGFpbiBlbmNvZGluZ3MuIEZvciBhc2NpaS9oZXgvYmluYXJ5L2xhdGluMSB0aGUgaW1wbCBpcyBzdXBlci1lYXN5XG4gKi9cblxuXG5jbGFzcyBTdHJpbmdEZWNvZGVySW1wbCB7XG4gIGNvbnN0cnVjdG9yKGVuY29kaW5nID0gJ3V0ZjgnKSB7XG4gICAgdGhpcy5lbmNvZGluZyA9IGVuY29kaW5nO1xuICAgIHRoaXMuYnl0ZUNvdW50ID0gMDtcbiAgICB0aGlzLmNoYXJMZW5ndGggPSAxO1xuICB9IC8vIHRoZSBhY3R1YWwgdW5kZXJseWluZyBpbXBsZW1lbnRhdGlvbiFcblxuXG4gIGVuZChidWZmZXIpIHtcbiAgICBpZiAoYnVmZmVyICYmIGJ1ZmZlci5sZW5ndGggIT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLndyaXRlKGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgd3JpdGUoYnVmZmVyKSB7XG4gICAgaWYgKGJ1ZmZlciAmJiBidWZmZXIubGVuZ3RoICE9PSAwKSB7XG4gICAgICByZXR1cm4gYnVmZmVyLnRvU3RyaW5nKHRoaXMuZW5jb2RpbmcpOyAvLyBzaW5nbGUgYnl0ZSBjaGFyYWN0ZXIgZW5jb2RpbmdzIGFyZSBhIGNpbmNoXG4gICAgfVxuXG4gICAgcmV0dXJuICcnOyAvLyBubyBidWZmZXIsIG9yIGVtcHR5XG4gIH1cblxufSAvLyBGb3IgbXVsdGktYnl0ZSBlbmNvZGluZ3MsIGxldCdzIGltcGxlbWVudCBzb21lIGJhc2UgbG9naWMuLi5cblxuXG5jbGFzcyBNdWx0aUJ5dGVTdHJpbmdEZWNvZGVySW1wbCBleHRlbmRzIFN0cmluZ0RlY29kZXJJbXBsIHtcbiAgY29uc3RydWN0b3IoZW5jb2RpbmcsIGJ5dGVzUGVyQ2hhcikge1xuICAgIHN1cGVyKGVuY29kaW5nKTtcbiAgICB0aGlzLmluY29tcGxldGUgPSBCdWZmZXIuYWxsb2NVbnNhZmUoYnl0ZXNQZXJDaGFyKTsgLy8gdGVtcG9yYXJ5IGluY29tcGxldGUgY2hhcmFjdGVyIGJ1ZmZlclxuICB9XG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBJbmNvbXBsZXRlQ2hhck9iamVjdFxuICAgKiBAcHJvcGVydHkge2ludGVnZXJ9IGJ5dGVzTmVlZGVkIGJ5dGVzIG1pc3NpbmcgdG8gY29tcGxldGUgdGhlIGNoYXJhY3RlclxuICAgKiBAcHJvcGVydHkge2ludGVnZXJ9IGNoYXJMZW5ndGggYnl0ZXMgZXhwZWN0ZWQgdG8gY29tcGxldGUgdGhlIGNoYXJhY3RlclxuICAgKiBAcHJvcGVydHkge2ludGVnZXJ9IGluZGV4IGxvY2F0aW9uIGluIHRoZSBidWZmZXIgd2hlcmUgdGhlIGNoYXJhY3RlciBzdGFydHNcbiAgICovXG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgQnVmZmVyLCBzZWVzIGlmIHdlIGhhdmUgYW4gaW5jb21wbGV0ZSBcImNoYXJhY3RlclwiIGF0IHRoZSBlbmQgb2YgaXQuXG4gICAqIFJldHVybnMgaW5mbyBvbiB0aGF0OlxuICAgKiAtIGJ5dGVzTmVlZGVkOiAwLTMsIG51bWJlciBvZiBieXRlcyBzdGlsbCByZW1haW5pbmdcbiAgICogLSBjaGFyTGVuZ3RoOiBleHBlY3RlZCBudW1iZXIgb2YgYnl0ZXMgZm9yIHRoZSBpbmNvbXBsZXRlIGNoYXJhY3RlclxuICAgKiAtIGluZGV4OiBpbmRleCBpbiB0aGUgYnVmZmVyIHdoZXJlIHRoZSBpbmNvbXBsZXRlIGNoYXJhY3RlciBiZWdpbnNcbiAgICogQHBhcmFtIHtCdWZmZXJ9IF9idWZmZXIgQnVmZmVyIHdlIGFyZSBjaGVja2luZyB0byBzZWUgaWYgaXQgaGFzIGFuIGluY29tcGVsdGUgXCJjaGFyYWN0ZXJcIiBhdCB0aGUgZW5kXG4gICAqIEByZXR1cm5zIHtJbmNvbXBsZXRlQ2hhck9iamVjdH1cbiAgICovXG5cblxuICBfY2hlY2tJbmNvbXBsZXRlQnl0ZXMoX2J1ZmZlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignc3ViY2xhc3NlcyBtdXN0IG92ZXJyaWRlIScpO1xuICB9XG5cbiAgX2luY29tcGxldGVFbmQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzdWJjbGFzc2VzIG11c3Qgb3ZlcnJpZGUhJyk7XG4gIH1cblxuICBfaW5jb21wbGV0ZUJ1ZmZlckVtcHRpZWQoKSB7XG4gICAgLy8gdHlwaWNhbGx5IHdlIHJlc2V0IGJ5dGUgY291bnQgYmFjayB0byAwIGFuZCBjaGFyYWN0ZXIgbGVuZ3RoIHRvIDFcbiAgICB0aGlzLmJ5dGVDb3VudCA9IDA7XG4gICAgdGhpcy5jaGFyTGVuZ3RoID0gMTtcbiAgfVxuXG4gIGVuZChidWZmZXIpIHtcbiAgICBsZXQgcmVzdWx0ID0gc3VwZXIuZW5kKGJ1ZmZlcik7XG5cbiAgICBpZiAodGhpcy5ieXRlQ291bnQgIT09IDApIHtcbiAgICAgIC8vIHdlIGhhdmUgaW5jb21wbGV0ZSBjaGFyYWN0ZXJzIVxuICAgICAgcmVzdWx0ICs9IHRoaXMuX2luY29tcGxldGVFbmQoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9pbmNvbXBsZXRlQnVmZmVyRW1wdGllZCgpOyAvLyByZXNldCBvdXIgaW50ZXJuYWxzIHRvIFwid2lwZVwiIHRoZSBpbmNvbXBsZXRlIGJ1ZmZlclxuXG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgd3JpdGUoYnVmZmVyKSB7XG4gICAgLy8gZmlyc3QgbGV0J3Mgc2VlIGlmIHdlIGhhZCBzb21lIG11bHRpLWJ5dGUgY2hhcmFjdGVyIHdlIGRpZG4ndCBmaW5pc2guLi5cbiAgICBsZXQgY2hhciA9ICcnO1xuXG4gICAgaWYgKHRoaXMuYnl0ZUNvdW50ICE9PSAwKSB7XG4gICAgICAvLyB3ZSBzdGlsbCBuZWVkZWQgc29tZSBieXRlcyB0byBmaW5pc2ggdGhlIGNoYXJhY3RlclxuICAgICAgLy8gSG93IG1hbnkgYnl0ZXMgZG8gd2Ugc3RpbGwgbmVlZD8gY2hhckxlbmd0aCAtIGJ5dGVzIHdlIHJlY2VpdmVkXG4gICAgICBjb25zdCBsZWZ0ID0gdGhpcy5jaGFyTGVuZ3RoIC0gdGhpcy5ieXRlQ291bnQ7IC8vIG5lZWQgNCwgaGF2ZSAxPyB0aGVuIHdlIGhhdmUgMyBcImxlZnRcIlxuXG4gICAgICBjb25zdCBieXRlc0NvcGllZCA9IE1hdGgubWluKGxlZnQsIGJ1ZmZlci5sZW5ndGgpOyAvLyBjb3B5IHVwIHRvIHRoYXQgbWFueSBieXRlc1xuICAgICAgLy8gY29weSBieXRlcyBmcm9tIGBidWZmZXJgIHRvIG91ciBpbmNvbXBsZXRlIGJ1ZmZlclxuXG4gICAgICBidWZmZXIuY29weSh0aGlzLmluY29tcGxldGUsIHRoaXMuYnl0ZUNvdW50LCAwLCBieXRlc0NvcGllZCk7XG4gICAgICB0aGlzLmJ5dGVDb3VudCArPSBieXRlc0NvcGllZDsgLy8gcmVjb3JkIGhvdyBtYW55IG1vcmUgYnl0ZXMgd2UgY29waWVkLi4uXG5cbiAgICAgIGlmIChieXRlc0NvcGllZCA8IGxlZnQpIHtcbiAgICAgICAgLy8gc3RpbGwgbmVlZCBtb3JlIGJ5dGVzIHRvIGNvbXBsZXRlIVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9IC8vIHdlIHdlcmUgYWJsZSB0byBjb21wbGV0ZSwgeWF5IVxuICAgICAgLy8gZ3JhYiB0aGUgY2hhcmFjdGVyIHdlIGNvbXBsZXRlZFxuXG5cbiAgICAgIGNoYXIgPSB0aGlzLmluY29tcGxldGUuc2xpY2UoMCwgdGhpcy5jaGFyTGVuZ3RoKS50b1N0cmluZyh0aGlzLmVuY29kaW5nKTsgLy8gcmVzZXQgb3VyIGNvdW50ZXJzXG5cbiAgICAgIHRoaXMuX2luY29tcGxldGVCdWZmZXJFbXB0aWVkKCk7IC8vIGRvIHdlIGhhdmUgYW55IGJ5dGVzIGxlZnQgaW4gdGhpcyBidWZmZXI/XG5cblxuICAgICAgaWYgKGJ5dGVzQ29waWVkID09PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBjaGFyOyAvLyBpZiBub3QsIHJldHVybiB0aGUgY2hhcmFjdGVyIHdlIGZpbmlzaGVkIVxuICAgICAgfSAvLyB3ZSBzdGlsbCBoYXZlIG1vcmUgYnl0ZXMsIHNvIHNsaWNlIHRoZSBidWZmZXIgdXBcblxuXG4gICAgICBidWZmZXIgPSBidWZmZXIuc2xpY2UoYnl0ZXNDb3BpZWQsIGJ1ZmZlci5sZW5ndGgpO1xuICAgIH0gLy8gY2hlY2sgdGhpcyBidWZmZXIgdG8gc2VlIGlmIGl0IGluZGljYXRlcyB3ZSBuZWVkIG1vcmUgYnl0ZXM/XG5cblxuICAgIGNvbnN0IGluY29tcGxldGVDaGFyRGF0YSA9IHRoaXMuX2NoZWNrSW5jb21wbGV0ZUJ5dGVzKGJ1ZmZlcik7XG5cbiAgICBpZiAoaW5jb21wbGV0ZUNoYXJEYXRhLmJ5dGVzTmVlZGVkID09PSAwKSB7XG4gICAgICByZXR1cm4gY2hhciArIGJ1ZmZlci50b1N0cmluZyh0aGlzLmVuY29kaW5nKTsgLy8gbm8gaW5jb21wbGV0ZSBieXRlcywgcmV0dXJuIGFueSBjaGFyYWN0ZXIgd2UgY29tcGxldGVkIHBsdXMgdGhlIGJ1ZmZlclxuICAgIH0gLy8gb2sgc28gdGhlIGJ1ZmZlciBob2xkcyBhbiBpbmNvbXBsZXRlIGNoYXJhY3RlciBhdCBpdCdzIGVuZFxuXG5cbiAgICB0aGlzLmNoYXJMZW5ndGggPSBpbmNvbXBsZXRlQ2hhckRhdGEuY2hhckxlbmd0aDsgLy8gcmVjb3JkIGhvdyBtYW55IGJ5dGVzIHdlIG5lZWQgZm9yIHRoZSAnY2hhcmFjdGVyJ1xuXG4gICAgY29uc3QgaW5jb21wbGV0ZUNoYXJJbmRleCA9IGluY29tcGxldGVDaGFyRGF0YS5pbmRleDsgLy8gdGhpcyBpcyB0aGUgaW5kZXggb2YgdGhlIG11bHRpYnl0ZSBjaGFyYWN0ZXIgdGhhdCBpcyBpbmNvbXBsZXRlXG4gICAgLy8gY29weSBmcm9tIGluZGV4IG9mIGluY29tcGxldGUgY2hhcmFjdGVyIHRvIGVuZCBvZiBidWZmZXJcblxuICAgIGNvbnN0IGJ5dGVzVG9Db3B5ID0gYnVmZmVyLmxlbmd0aCAtIGluY29tcGxldGVDaGFySW5kZXg7XG4gICAgYnVmZmVyLmNvcHkodGhpcy5pbmNvbXBsZXRlLCAwLCBpbmNvbXBsZXRlQ2hhckluZGV4LCBidWZmZXIubGVuZ3RoKTtcbiAgICB0aGlzLmJ5dGVDb3VudCA9IGJ5dGVzVG9Db3B5OyAvLyByZWNvcmQgaG93IG1hbnkgYnl0ZXMgd2UgYWN0dWFsbHkgY29waWVkXG5cbiAgICBpZiAoYnl0ZXNUb0NvcHkgPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAvLyBidWZmZXIgaGFkIGJ5dGVzIGJlZm9yZSB0aGUgaW5jb21wbGV0ZSBjaGFyYWN0ZXJcbiAgICAgIC8vIHNvIHNtdXNoIGFueSBjaGFyYWN0ZXIgd2UgbWF5IGhhdmUgY29tcGxldGVkIHdpdGggYW55IGNvbXBsZXRlIGNoYXJhY3RlcnMgaW4gdGhlIGJ1ZmZlclxuICAgICAgcmV0dXJuIGNoYXIgKyBidWZmZXIudG9TdHJpbmcodGhpcy5lbmNvZGluZywgMCwgaW5jb21wbGV0ZUNoYXJJbmRleCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYXI7IC8vIGFueSBub3ctY29tcGxldGVkIGNoYXJhY3RlciB0aGF0IHdhcyBwcmV2aW91c2x5IGluY29tcGxldGUsIHBvc3NpYmx5IGVtcHR5XG4gIH1cblxufVxuXG5jbGFzcyBVdGY4U3RyaW5nRGVjb2RlciBleHRlbmRzIE11bHRpQnl0ZVN0cmluZ0RlY29kZXJJbXBsIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoJ3V0ZjgnLCA0KTtcbiAgfVxuXG4gIF9jaGVja0luY29tcGxldGVCeXRlcyhidWZmZXIpIHtcbiAgICBjb25zdCBsZW5ndGggPSBidWZmZXIubGVuZ3RoOyAvLyBGSVhNRTogSW4gTm9kZSwgdGhleSBjaGVjayB0aGUgbGFzdCBjaGFyYWN0ZXIgZmlyc3QhXG4gICAgLy8gQW5kIHRoZXkgcmVseSBvbiBCdWZmZXIjdG9TdHJpbmcoKSB0byBoYW5kbGUgaW5qZWN0aW5nIHRoZSAnXFx1ZmZmZCcgY2hhcmFjdGVyIGZvciBidXN0ZWQgbXVsdGktYnl0ZSBzZXF1ZW5jZXMhXG4gICAgLy8gaU9TIGFwcGFyZW50bHkganVzdCByZXR1cm5zIHVuZGVmaW5lZCBpbiB0aGF0IHNwZWNpYWwgY2FzZSBhbmRcbiAgICAvLyBBbmRyb2lkIGRpZmZlcnMgaGVyZSBiZWNhdXNlIHdlIGRvbid0IHdvcmsgYmFja3dhcmRzIGZyb20gdGhlIGxhc3QgY2hhclxuICAgIC8vIENhbiB3ZSBjaGVhdCBoZXJlIGFuZC4uLlxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL3N0cmluZ19kZWNvZGVyL2Jsb2IvbWFzdGVyL2xpYi9zdHJpbmdfZGVjb2Rlci5qcyNMMTczLUwxOThcbiAgICAvLyAtIGlmIHdlIHNlZSBhIG11bHRpLWJ5dGUgY2hhcmFjdGVyIHN0YXJ0LCB2YWxpZGF0ZSB0aGUgbmV4dCBjaGFyYWN0ZXJzIGFyZSBjb250aW51YXRpb24gY2hhcnNcbiAgICAvLyAtIGlmIHRoZXkncmUgbm90IHJlcGxhY2UgdGhlIHNlcXVlbmNlIHdpdGggJ1xcdWZmZmQnLCB0cmVhdCBsaWtlIHRoYXQgbXVsdGktYnl0ZSBjaGFyYWN0ZXIgd2FzIFwiY29tcGxldGVkXCJcbiAgICAvLyBOb3RlIHRoYXQgZXZlbiBpZiB3ZSBkbyBoYWNrIHRoaXMsIGlmIHRoZXJlJ3Mgc29tZSBpbnZhbGlkIG11bHRpLWJ5dGUgVVRGLTggaW4gdGhlIGJ1ZmZlciB0aGF0IGlzbid0IGF0IHRoZSBsYXN0IDMgYnl0ZXNcbiAgICAvLyB0aGVuIHdlJ3JlIGF0IHRoZSBtZXJjeSBvZiB0aGUgSlMgZW5naW5lL3BsYXRmb3JtIGNvZGUgZm9yIGhhbmRsaW5nIHRoYXRcbiAgICAvLyBIZXJlJ3Mgc29tZW9uZSdzIGhhY2sgdGhlcmU6IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL29sZWdhbnphLzk5NzE1NVxuICAgIC8vIGlmIGJ1ZmZlci5sZW5ndGggPj0gMywgY2hlY2sgM3JkIHRvIGxhc3QgYnl0ZVxuXG4gICAgaWYgKGxlbmd0aCA+PSAzKSB7XG4gICAgICBsZXQgY2hhckxlbmd0aCA9IGNoZWNrQ2hhckxlbmd0aEZvclVURjgoYnVmZmVyW2xlbmd0aCAtIDNdKTtcblxuICAgICAgaWYgKGNoYXJMZW5ndGggPT09IDQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBieXRlc05lZWRlZDogMSxcbiAgICAgICAgICAvLyB3ZSBoYXZlIDMgbGFzdCBieXRlcywgbmVlZCA0dGhcbiAgICAgICAgICBpbmRleDogbGVuZ3RoIC0gMyxcbiAgICAgICAgICBjaGFyTGVuZ3RoOiA0XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSAvLyBpZiBidWZmZXIubGVuZ3RoID49IDIsIGNoZWNrIDJuZCB0byBsYXN0IGJ5dGVcblxuXG4gICAgaWYgKGxlbmd0aCA+PSAyKSB7XG4gICAgICBsZXQgY2hhckxlbmd0aCA9IGNoZWNrQ2hhckxlbmd0aEZvclVURjgoYnVmZmVyW2xlbmd0aCAtIDJdKTtcblxuICAgICAgaWYgKGNoYXJMZW5ndGggPj0gMykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGJ5dGVzTmVlZGVkOiBjaGFyTGVuZ3RoIC0gMixcbiAgICAgICAgICAvLyB3ZSBoYXZlIDIgYnl0ZXMgb2Ygd2hhdGV2ZXIgd2UgbmVlZFxuICAgICAgICAgIGluZGV4OiBsZW5ndGggLSAyLFxuICAgICAgICAgIGNoYXJMZW5ndGhcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9IC8vIGlmIGJ1ZmZlci5sZW5ndGggPj0gMSwgY2hlY2sgbGFzdCBieXRlXG5cblxuICAgIGlmIChsZW5ndGggPj0gMSkge1xuICAgICAgbGV0IGNoYXJMZW5ndGggPSBjaGVja0NoYXJMZW5ndGhGb3JVVEY4KGJ1ZmZlcltsZW5ndGggLSAxXSk7XG5cbiAgICAgIGlmIChjaGFyTGVuZ3RoID49IDIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBieXRlc05lZWRlZDogY2hhckxlbmd0aCAtIDEsXG4gICAgICAgICAgLy8gd2UgaGF2ZSAxIGJ5dGUgb2Ygd2hhdGV2ZXIgd2UgbmVlZFxuICAgICAgICAgIGluZGV4OiBsZW5ndGggLSAxLFxuICAgICAgICAgIGNoYXJMZW5ndGhcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9IC8vIGJhc2UgY2FzZSwgbm8gYnl0ZXMgbmVlZGVkIC0gZW5kcyBvbiBjb21wbGV0ZSBjaGFyYWN0ZXJcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGJ5dGVzTmVlZGVkOiAwLFxuICAgICAgaW5kZXg6IGxlbmd0aCAtIDEsXG4gICAgICBjaGFyTGVuZ3RoOiAxXG4gICAgfTtcbiAgfVxuXG4gIF9pbmNvbXBsZXRlRW5kKCkge1xuICAgIHJldHVybiAnXFx1ZmZmZCc7IC8vIHdlIHJlcGxhY2UgdGhlIG1pc3NpbmcgY2hhcmFjdGVyIHdpdGggYSBzcGVjaWFsIHV0ZjggY2hhclxuICB9XG5cbn1cblxuY2xhc3MgVXRmMTZTdHJpbmdEZWNvZGVyIGV4dGVuZHMgTXVsdGlCeXRlU3RyaW5nRGVjb2RlckltcGwge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigndXRmMTZsZScsIDQpO1xuICB9XG5cbiAgX2NoZWNrSW5jb21wbGV0ZUJ5dGVzKGJ1ZmZlcikge1xuICAgIGNvbnN0IGxlbmd0aCA9IGJ1ZmZlci5sZW5ndGg7XG4gICAgY29uc3QgbW9kdWxvID0gbGVuZ3RoICUgMjsgLy8gb2ssIHdlIGhhdmUgYSBtdWx0aXBsZSBvZiAyIGJ5dGVzXG5cbiAgICBpZiAobW9kdWxvID09PSAwKSB7XG4gICAgICAvLyBpcyB0aGUgbGFzdCBieXRlIGEgbGVhZGluZy9oaWdoIHN1cnJvZ2F0ZT9cbiAgICAgIGNvbnN0IGJ5dGUgPSBidWZmZXJbYnVmZmVyLmxlbmd0aCAtIDFdO1xuXG4gICAgICBpZiAoYnl0ZSA+PSAweEQ4ICYmIGJ5dGUgPD0gMHhEQikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGJ5dGVzTmVlZGVkOiAyLFxuICAgICAgICAgIGNoYXJMZW5ndGg6IDQsXG4gICAgICAgICAgaW5kZXg6IGxlbmd0aCAtIDJcbiAgICAgICAgfTtcbiAgICAgIH0gLy8gd2UncmUgZ29vZCwgbm90IGEgc3Vycm9nYXRlLCBzbyB3ZSBoYXZlIG91ciBuZWVkZWQgMiBieXRlc1xuXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGJ5dGVzTmVlZGVkOiAwLFxuICAgICAgICBjaGFyTGVuZ3RoOiAyXG4gICAgICB9O1xuICAgIH0gLy8gb2sgd2UgaGF2ZSAxIGJ5dGUgbGVmdCBvdmVyLCBhc3N1bWUgd2UgbmVlZCAyIHRvIGZvcm0gdGhlIGNoYXJhY3RlclxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgYnl0ZXNOZWVkZWQ6IDEsXG4gICAgICBpbmRleDogbGVuZ3RoIC0gMSxcbiAgICAgIGNoYXJMZW5ndGg6IDJcbiAgICB9O1xuICB9XG5cbiAgX2luY29tcGxldGVFbmQoKSB7XG4gICAgLy8gSnVzdCB3cml0ZSBvdXQgdGhlIGxhc3QgTiBieXRlcywgaG9wZWZ1bGx5IHRoZSBlbmdpbmUgY2FuIGhhbmRsZSBpdCBmb3IgdXM/XG4gICAgcmV0dXJuIHRoaXMuaW5jb21wbGV0ZS50b1N0cmluZygndXRmMTZsZScsIDAsIHRoaXMuYnl0ZUNvdW50KTtcbiAgfVxuXG59XG5cbmNsYXNzIEJhc2U2NFN0cmluZ0RlY29kZXIgZXh0ZW5kcyBNdWx0aUJ5dGVTdHJpbmdEZWNvZGVySW1wbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCdiYXNlNjQnLCAzKTtcbiAgICB0aGlzLmNoYXJMZW5ndGggPSAzOyAvLyBhbHdheXMgMyFcbiAgfVxuXG4gIF9jaGVja0luY29tcGxldGVCeXRlcyhidWZmZXIpIHtcbiAgICBjb25zdCBsZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuICAgIGNvbnN0IG1vZHVsbyA9IGxlbmd0aCAlIDM7IC8vIGJhc2U2NCBuZWVkcyAzIGJ5dGVzIGFsd2F5cywgc28gaWYgd2UgaGF2ZSB0aGF0IG1hbnkgKG9yIGEgbXVsdGlwbGUpLCB3ZSBoYXZlIGEgY29tcGxldGUgYnVmZmVyXG5cbiAgICBpZiAobW9kdWxvID09PSAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBieXRlc05lZWRlZDogMCxcbiAgICAgICAgY2hhckxlbmd0aDogM1xuICAgICAgfTtcbiAgICB9IC8vIG9rIHdlIGhhdmUgMSBvciAyIGJ5dGVzIGxlZnQgb3ZlclxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgYnl0ZXNOZWVkZWQ6IDMgLSBtb2R1bG8sXG4gICAgICAvLyBhbHdheXMgbmVlZCAzLCBzbyBpZiB3ZSBoYXZlIDEgbGVmdCBvdmVyIC0+IG5lZWQgMlxuICAgICAgaW5kZXg6IGxlbmd0aCAtIG1vZHVsbyxcbiAgICAgIGNoYXJMZW5ndGg6IDMgLy8gYWx3YXlzIG5lZWQgM1xuXG4gICAgfTtcbiAgfVxuXG4gIF9pbmNvbXBsZXRlQnVmZmVyRW1wdGllZCgpIHtcbiAgICB0aGlzLmJ5dGVDb3VudCA9IDA7XG4gICAgdGhpcy5jaGFyTGVuZ3RoID0gMzsgLy8gYWx3YXlzIDMhXG4gIH1cblxuICBfaW5jb21wbGV0ZUVuZCgpIHtcbiAgICAvLyBKdXN0IHdyaXRlIG91dCB0aGUgbGFzdCBOIGJ5dGVzLCBpdCBzaG91bGQgaW5zZXJ0IHRoZSAnPScgcGxhY2Vob2xkZXJzXG4gICAgLy8gaXQncyBub3QgcmVhbGx5ICdtaXNzaW5nJy8naW5jb21wbGV0ZScsIGp1c3QgbmVlZHMgcGxhY2Vob2xkZXIgaW5zZXJ0aW9uXG4gICAgcmV0dXJuIHRoaXMuaW5jb21wbGV0ZS50b1N0cmluZygnYmFzZTY0JywgMCwgdGhpcy5ieXRlQ291bnQpO1xuICB9XG5cbn1cblxuZnVuY3Rpb24gY2hlY2tDaGFyTGVuZ3RoRm9yVVRGOChieXRlKSB7XG4gIC8vIDExMTEwWFhYID0+IDExMTAgPT4gMHgxRVxuICBpZiAoYnl0ZSA+PiAzID09PSAweDFFKSB7XG4gICAgcmV0dXJuIDQ7XG4gIH0gLy8gMTExMFhYWFggPT4gMTExMCA9PiAweDFFXG5cblxuICBpZiAoYnl0ZSA+PiA0ID09PSAweDBFKSB7XG4gICAgcmV0dXJuIDM7XG4gIH0gLy8gMTEwWFhYWFggPT4gMTEwID0+IDB4MDZcblxuXG4gIGlmIChieXRlID4+IDUgPT09IDB4MDYpIHtcbiAgICByZXR1cm4gMjtcbiAgfVxuXG4gIHJldHVybiAxO1xufVxuXG52YXIgU3RyaW5nRGVjb2RlciQxID0ge1xuICBTdHJpbmdEZWNvZGVyXG59O1xuXG5jb25zdCBwcmludGVkV2FybmluZ3MgPSB7fTtcblxuZnVuY3Rpb24gb25lVGltZVdhcm5pbmcoa2V5LCBtc2cpIHtcbiAgaWYgKCFwcmludGVkV2FybmluZ3Nba2V5XSkge1xuICAgIGNvbnNvbGUud2Fybihtc2cpO1xuICAgIHByaW50ZWRXYXJuaW5nc1trZXldID0gdHJ1ZTtcbiAgfVxufVxuLyoqXG4gKiBQcmludHMgYSBvbmUtdGltZSB3YXJuaW5nIG1lc3NhZ2UgdGhhdCB3ZSBkbyBub3Qgc3VwcG9ydCB0aGUgZ2l2ZW4gQVBJIGFuZCBwZXJmb3JtcyBhbiBlZmZlY3RpdmUgbm8tb3BcbiAqIEBwYXJhbSB7c3RyaW5nfSBtb2R1bGVOYW1lIG5hbWUgb2YgdGhlIG1vZHVsZS9vYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIGZ1bmN0aW9uLnByb3BlcnR5IHdlIGRvbid0IHN1cHBvcnRcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gbm8tb3AgZnVuY3Rpb25cbiAqL1xuXG5cbmZ1bmN0aW9uIHVuc3VwcG9ydGVkTm9vcChtb2R1bGVOYW1lLCBuYW1lKSB7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgY29uc3QgZnFuID0gYCR7bW9kdWxlTmFtZX0uJHtuYW1lfWA7XG4gICAgb25lVGltZVdhcm5pbmcoZnFuLCBgXCIke2Zxbn1cIiBpcyBub3Qgc3VwcG9ydGVkIHlldCBvbiBUaXRhbml1bSBhbmQgdXNlcyBhIG5vLW9wIGZhbGxiYWNrLmApO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH07XG59XG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBtb2R1bGVOYW1lIG5hbWUgb2YgdGhlIG1vZHVsZS9vYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIGZ1bmN0aW9uLnByb3BlcnR5IHdlIGRvbid0IHN1cHBvcnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIGFzeW5jIGNhbGxiYWNrIHdlIGNhbGwgaW4gYSBxdWljayBzZXRUaW1lb3V0XG4gKi9cblxuXG5mdW5jdGlvbiBhc3luY1Vuc3VwcG9ydGVkTm9vcChtb2R1bGVOYW1lLCBuYW1lLCBjYWxsYmFjaykge1xuICBjYWxsYmFjayA9IG1heWJlQ2FsbGJhY2soY2FsbGJhY2spOyAvLyBlbmZvcmNlIHdlIGhhdmUgYSB2YWxpZCBjYWxsYmFja1xuXG4gIHVuc3VwcG9ydGVkTm9vcChtb2R1bGVOYW1lLCBuYW1lKSgpO1xuICBzZXRUaW1lb3V0KGNhbGxiYWNrLCAxKTtcbn0gLy8gVXNlZCB0byBjaG9vc2UgdGhlIGJ1ZmZlci9jaHVuayBzaXplIHdoZW4gcHVtcGluZyBieXRlcyBkdXJpbmcgY29waWVzXG5cblxuY29uc3QgQ09QWV9GSUxFX0NIVU5LX1NJWkUgPSA4MDkyOyAvLyB3aGF0IHNob3VsZCB3ZSB1c2UgaGVyZT9cbi8vIEtlZXAgdHJhY2sgb2YgaW50ZWdlciAtPiBGaWxlU3RyZWFtIG1hcHBpbmdzXG5cbmNvbnN0IGZpbGVEZXNjcmlwdG9ycyA9IG5ldyBNYXAoKTtcbmxldCBmaWxlRGVzY3JpcHRvckNvdW50ID0gNDsgLy8gZ2xvYmFsIGNvdW50ZXIgdXNlZCB0byByZXBvcnQgZmlsZSBkZXNjcmlwdG9yIGludGVnZXJzXG4vLyBNYXAgZmlsZSBzeXN0ZW0gYWNjZXNzIGZsYWdzIHRvIFRpLkZpbGVzeXN0ZW0uTU9ERV8qIGNvbnN0YW50c1xuXG5jb25zdCBGTEFHU19UT19USV9NT0RFID0gbmV3IE1hcCgpO1xuRkxBR1NfVE9fVElfTU9ERS5zZXQoJ2EnLCBUaS5GaWxlc3lzdGVtLk1PREVfQVBQRU5EKTtcbkZMQUdTX1RPX1RJX01PREUuc2V0KCdheCcsIFRpLkZpbGVzeXN0ZW0uTU9ERV9BUFBFTkQpO1xuRkxBR1NfVE9fVElfTU9ERS5zZXQoJ2ErJywgVGkuRmlsZXN5c3RlbS5NT0RFX0FQUEVORCk7XG5GTEFHU19UT19USV9NT0RFLnNldCgnYXgrJywgVGkuRmlsZXN5c3RlbS5NT0RFX0FQUEVORCk7XG5GTEFHU19UT19USV9NT0RFLnNldCgnYXMrJywgVGkuRmlsZXN5c3RlbS5NT0RFX0FQUEVORCk7XG5GTEFHU19UT19USV9NT0RFLnNldCgncicsIFRpLkZpbGVzeXN0ZW0uTU9ERV9SRUFEKTtcbkZMQUdTX1RPX1RJX01PREUuc2V0KCdyKycsIFRpLkZpbGVzeXN0ZW0uTU9ERV9SRUFEKTtcbkZMQUdTX1RPX1RJX01PREUuc2V0KCdycysnLCBUaS5GaWxlc3lzdGVtLk1PREVfUkVBRCk7XG5GTEFHU19UT19USV9NT0RFLnNldCgndycsIFRpLkZpbGVzeXN0ZW0uTU9ERV9XUklURSk7XG5GTEFHU19UT19USV9NT0RFLnNldCgnd3gnLCBUaS5GaWxlc3lzdGVtLk1PREVfV1JJVEUpO1xuRkxBR1NfVE9fVElfTU9ERS5zZXQoJ3crJywgVGkuRmlsZXN5c3RlbS5NT0RFX1dSSVRFKTtcbkZMQUdTX1RPX1RJX01PREUuc2V0KCd3eCsnLCBUaS5GaWxlc3lzdGVtLk1PREVfV1JJVEUpOyAvLyBDb21tb24gZXJyb3JzXG5cbmNvbnN0IHBlcm1pc3Npb25EZW5pZWQgPSAoc3lzY2FsbCwgcGF0aCkgPT4gbWFrZUVycm9yKCdFQUNDRVMnLCAncGVybWlzc2lvbiBkZW5pZWQnLCAtMTMsIHN5c2NhbGwsIHBhdGgpO1xuXG5jb25zdCBub1N1Y2hGaWxlID0gKHN5c2NhbGwsIHBhdGgpID0+IG1ha2VFcnJvcignRU5PRU5UJywgJ25vIHN1Y2ggZmlsZSBvciBkaXJlY3RvcnknLCAtMiwgc3lzY2FsbCwgcGF0aCk7XG5cbmNvbnN0IGZpbGVBbHJlYWR5RXhpc3RzID0gKHN5c2NhbGwsIHBhdGgpID0+IG1ha2VFcnJvcignRUVYSVNUJywgJ2ZpbGUgYWxyZWFkeSBleGlzdHMnLCAtMTcsIHN5c2NhbGwsIHBhdGgpO1xuXG5jb25zdCBub3RBRGlyZWN0b3J5ID0gKHN5c2NhbGwsIHBhdGgpID0+IG1ha2VFcnJvcignRU5PVERJUicsICdub3QgYSBkaXJlY3RvcnknLCAtMjAsIHN5c2NhbGwsIHBhdGgpO1xuXG5jb25zdCBkaXJlY3RvcnlOb3RFbXB0eSA9IChzeXNjYWxsLCBwYXRoKSA9PiBtYWtlRXJyb3IoJ0VOT1RFTVBUWScsICdkaXJlY3Rvcnkgbm90IGVtcHR5JywgLTY2LCBzeXNjYWxsLCBwYXRoKTtcblxuY29uc3QgaWxsZWdhbE9wZXJhdGlvbk9uQURpcmVjdG9yeSA9IChzeXNjYWxsLCBwYXRoKSA9PiBtYWtlRXJyb3IoJ0VJU0RJUicsICdpbGxlZ2FsIG9wZXJhdGlvbiBvbiBhIGRpcmVjdG9yeScsIC0yMSwgc3lzY2FsbCwgcGF0aCk7XG5cbmNvbnN0IGZzID0ge1xuICBjb25zdGFudHM6IHtcbiAgICBPX1JET05MWTogMCxcbiAgICBPX1dST05MWTogMSxcbiAgICBPX1JEV1I6IDIsXG4gICAgU19JRk1UOiA2MTQ0MCxcbiAgICBTX0lGUkVHOiAzMjc2OCxcbiAgICBTX0lGRElSOiAxNjM4NCxcbiAgICBTX0lGQ0hSOiA4MTkyLFxuICAgIFNfSUZCTEs6IDI0NTc2LFxuICAgIFNfSUZJRk86IDQwOTYsXG4gICAgU19JRkxOSzogNDA5NjAsXG4gICAgU19JRlNPQ0s6IDQ5MTUyLFxuICAgIE9fQ1JFQVQ6IDUxMixcbiAgICBPX0VYQ0w6IDIwNDgsXG4gICAgT19OT0NUVFk6IDEzMTA3MixcbiAgICBPX1RSVU5DOiAxMDI0LFxuICAgIE9fQVBQRU5EOiA4LFxuICAgIE9fRElSRUNUT1JZOiAxMDQ4NTc2LFxuICAgIE9fTk9GT0xMT1c6IDI1NixcbiAgICBPX1NZTkM6IDEyOCxcbiAgICBPX0RTWU5DOiA0MTk0MzA0LFxuICAgIE9fU1lNTElOSzogMjA5NzE1MixcbiAgICBPX05PTkJMT0NLOiA0LFxuICAgIFNfSVJXWFU6IDQ0OCxcbiAgICBTX0lSVVNSOiAyNTYsXG4gICAgU19JV1VTUjogMTI4LFxuICAgIFNfSVhVU1I6IDY0LFxuICAgIFNfSVJXWEc6IDU2LFxuICAgIFNfSVJHUlA6IDMyLFxuICAgIFNfSVdHUlA6IDE2LFxuICAgIFNfSVhHUlA6IDgsXG4gICAgU19JUldYTzogNyxcbiAgICBTX0lST1RIOiA0LFxuICAgIFNfSVdPVEg6IDIsXG4gICAgU19JWE9USDogMSxcbiAgICBGX09LOiAwLFxuICAgIFJfT0s6IDQsXG4gICAgV19PSzogMixcbiAgICBYX09LOiAxLFxuICAgIFVWX0ZTX0NPUFlGSUxFX0VYQ0w6IDEsXG4gICAgQ09QWUZJTEVfRVhDTDogMVxuICB9XG59O1xuXG5jbGFzcyBTdGF0cyB7XG4gIGNvbnN0cnVjdG9yKHBhdGgpIHtcbiAgICB0aGlzLl9maWxlID0gbnVsbDtcbiAgICB0aGlzLmRldiA9IDA7XG4gICAgdGhpcy5pbm8gPSAwO1xuICAgIHRoaXMubW9kZSA9IDA7XG4gICAgdGhpcy5ubGluayA9IDA7XG4gICAgdGhpcy51aWQgPSAwO1xuICAgIHRoaXMuZ2lkID0gMDtcbiAgICB0aGlzLnJkZXYgPSAwO1xuICAgIHRoaXMuc2l6ZSA9IDA7XG4gICAgdGhpcy5ibGtzaXplID0gNDA5NjsgLy8gRklYTUU6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEzMTUzMTEvd2hhdC1pcy10aGUtYmxvY2stc2l6ZS1vZi10aGUtaXBob25lLWZpbGVzeXN0ZW1cblxuICAgIHRoaXMuYmxvY2tzID0gMDtcbiAgICB0aGlzLmF0aW1lTXMgPSB0aGlzLm10aW1lTXMgPSB0aGlzLmN0aW1lTXMgPSB0aGlzLmJpcnRodGltZU1zID0gMDtcbiAgICB0aGlzLmF0aW1lID0gdGhpcy5tdGltZSA9IHRoaXMuY3RpbWUgPSB0aGlzLmJpcnRodGltZSA9IG5ldyBEYXRlKDApO1xuXG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHRoaXMuX2ZpbGUgPSBnZXRUaUZpbGVGcm9tUGF0aExpa2VWYWx1ZShwYXRoKTsgLy8gVE9ETzogdXNlIGxhenkgZ2V0dGVycyBoZXJlP1xuXG4gICAgICB0aGlzLmN0aW1lID0gdGhpcy5iaXJ0aHRpbWUgPSB0aGlzLl9maWxlLmNyZWF0ZWRBdCgpO1xuICAgICAgdGhpcy5hdGltZSA9IHRoaXMubXRpbWUgPSB0aGlzLl9maWxlLm1vZGlmaWVkQXQoKTtcbiAgICAgIHRoaXMuYXRpbWVNcyA9IHRoaXMuYXRpbWUuZ2V0VGltZSgpO1xuICAgICAgdGhpcy5iaXJ0aHRpbWVNcyA9IHRoaXMuYmlydGh0aW1lLmdldFRpbWUoKTtcbiAgICAgIHRoaXMuY3RpbWVNcyA9IHRoaXMuY3RpbWUuZ2V0VGltZSgpO1xuICAgICAgdGhpcy5tdGltZU1zID0gdGhpcy5tdGltZS5nZXRUaW1lKCk7XG4gICAgICB0aGlzLnNpemUgPSB0aGlzLl9maWxlLnNpemU7XG4gICAgICB0aGlzLmJsb2NrcyA9IE1hdGguY2VpbCh0aGlzLnNpemUgLyB0aGlzLmJsa3NpemUpOyAvLyBUT0RPOiBDYW4gd2UgZmFrZSBvdXQgdGhlIG1vZGUgYmFzZWQgb24gdGhlIHJlYWRvbmx5L3dyaXRhYmxlL2V4ZWN1dGFibGUgcHJvcGVydGllcz9cbiAgICB9XG4gIH1cblxuICBpc0ZpbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbGUuaXNGaWxlKCk7XG4gIH1cblxuICBpc0RpcmVjdG9yeSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZmlsZS5pc0RpcmVjdG9yeSgpO1xuICB9XG5cbiAgaXNCbG9ja0RldmljZSgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpc0NoYXJhY3RlckRldmljZSgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpc1N5bWJvbGljTGluaygpIHtcbiAgICByZXR1cm4gdGhpcy5fZmlsZS5zeW1ib2xpY0xpbms7XG4gIH1cblxuICBpc0ZJRk8oKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaXNTb2NrZXQoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbn1cblxuZnMuU3RhdHMgPSBTdGF0cztcblxuY2xhc3MgUmVhZFN0cmVhbSB7fVxuXG5mcy5SZWFkU3RyZWFtID0gUmVhZFN0cmVhbTtcblxuY2xhc3MgV3JpdGVTdHJlYW0ge31cblxuZnMuV3JpdGVTdHJlYW0gPSBXcml0ZVN0cmVhbTtcbi8qKlxuICogQGNhbGxiYWNrIHN0YXRzQ2FsbGJhY2tcbiAqIEBwYXJhbSB7RXJyb3J9IGVyciAtIEVycm9yIGlmIG9uZSBvY2N1cnJlZFxuICogQHBhcmFtIHtmcy5TdGF0c30gc3RhdHMgLSBmaWxlIHN0YXRzXG4gKi9cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ3xVUkx8QnVmZmVyfSBwYXRoIGZpbGUgcGF0aFxuICogQHBhcmFtIHtpbnRlZ2VyfSBbbW9kZT1mcy5jb25zdGFudHMuRl9PS10gYWNjZXNzaWJpbGl0eSBtb2RlL2NoZWNrXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBhc3luYyBjYWxsYmFja1xuICovXG5cbmZzLmFjY2VzcyA9IGZ1bmN0aW9uIChwYXRoLCBtb2RlLCBjYWxsYmFjaykge1xuICBpZiAodHlwZW9mIG1vZGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYWxsYmFjayA9IG1vZGU7XG4gICAgbW9kZSA9IGZzLmNvbnN0YW50cy5GX09LO1xuICB9XG5cbiAgY2FsbGJhY2sgPSBtYXliZUNhbGxiYWNrKGNhbGxiYWNrKTtcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGZzLmFjY2Vzc1N5bmMocGF0aCwgbW9kZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY2FsbGJhY2soZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY2FsbGJhY2soKTtcbiAgfSwgMSk7XG59O1xuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ3xVUkx8QnVmZmVyfSBwYXRoIGZpbGUgcGF0aFxuICogQHBhcmFtIHtpbnRlZ2VyfSBbbW9kZT1mcy5jb25zdGFudHMuRl9PS10gYWNjZXNzaWJpbGl0eSBtb2RlL2NoZWNrXG4gKi9cblxuXG5mcy5hY2Nlc3NTeW5jID0gZnVuY3Rpb24gKHBhdGgsIG1vZGUgPSBmcy5jb25zdGFudHMuRl9PSykge1xuICAvLyBGX09LIGlzIGp1c3Qgd2hldGhlciBmaWxlIGV4aXN0cyBvciBub3QsIG5vIHBlcm1pc3Npb25zIGNoZWNrXG4gIC8vIFJfT0sgaXMgcmVhZCBjaGVja1xuICAvLyBXX09LIGlzIHdyaXRlIGNoZWNrXG4gIC8vIFhfT0sgaXMgZXhlY3V0ZSBjaGVjayAoYWN0cyBsaWtlIEZfT0sgb24gV2luZG93cylcbiAgY29uc3QgZmlsZUhhbmRsZSA9IGdldFRpRmlsZUZyb21QYXRoTGlrZVZhbHVlKHBhdGgpO1xuXG4gIGlmICghZmlsZUhhbmRsZS5leGlzdHMoKSkge1xuICAgIHRocm93IG5vU3VjaEZpbGUoJ2FjY2VzcycsIHBhdGgpO1xuICB9IC8vIFRPRE86IFdlIGhhdmUgbm8gbWVhbnMgb2YgdGVzdGluZyBpZiBhIGZpbGUgaXMgcmVhZGFibGUuIEl0J3MgYXNzdW1lZCBhbGwgZmlsZXMgdGhhdCBleGlzdCB1bmRlciB0aGUgYXBwIGFyZT9cblxuXG4gIGlmIChtb2RlICYgZnMuY29uc3RhbnRzLldfT0sgJiYgIWZpbGVIYW5kbGUud3JpdGFibGUpIHtcbiAgICB0aHJvdyBwZXJtaXNzaW9uRGVuaWVkKCdhY2Nlc3MnLCBwYXRoKTtcbiAgfVxuXG4gIGlmIChtb2RlICYgZnMuY29uc3RhbnRzLlhfT0sgJiYgIWZpbGVIYW5kbGUuZXhlY3V0YWJsZSAmJiBmaWxlSGFuZGxlLmlzRmlsZSgpKSB7XG4gICAgdGhyb3cgcGVybWlzc2lvbkRlbmllZCgnYWNjZXNzJywgcGF0aCk7XG4gIH1cbn07XG4vKipcbiAqIEFzeW5jaHJvbm91c2x5IGFwcGVuZCBkYXRhIHRvIGEgZmlsZSwgY3JlYXRpbmcgdGhlIGZpbGUgaWYgaXQgZG9lcyBub3QgeWV0IGV4aXN0LiBkYXRhIGNhbiBiZSBhIHN0cmluZyBvciBhIEJ1ZmZlci5cbiAqIEBwYXJhbSB7c3RyaW5nfEJ1ZmZlcnxVUkx8RmlsZVN0cmVhbX0gZmlsZSBmaWxlcGF0aCB0byBmaWxlXG4gKiBAcGFyYW0ge3N0cmluZ3xCdWZmZXJ9IGRhdGEgZGF0YSB0byBhcHBlbmQgdG8gZmlsZVxuICogQHBhcmFtIHtvYmplY3R8c3RyaW5nfSBbb3B0aW9uc10gb3B0aW9uc1xuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmVuY29kaW5nPSd1dGY4J10gZW5jb2RpbmcgdG8gdXNlXG4gKiBAcGFyYW0ge2ludGVnZXJ9IFtvcHRpb25zLm1vZGU9MG82NjZdIG1vZGUgdG8gY3JlYXRlIGZpbGUsIGlmIG5vdCBjcmVhdGVkXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZmxhZz0nYSddIGZpbGUgc3lzdGVtIGZsYWdcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGNhbGwgYmFjayB3aXRoIGVycm9yIGlmIGZhaWxlZFxuICovXG5cblxuZnMuYXBwZW5kRmlsZSA9IChmaWxlLCBkYXRhLCBvcHRpb25zLCBjYWxsYmFjaykgPT4ge1xuICBjYWxsYmFjayA9IG1heWJlQ2FsbGJhY2soY2FsbGJhY2sgfHwgb3B0aW9ucyk7XG4gIG9wdGlvbnMgPSBtZXJnZURlZmF1bHRPcHRpb25zKG9wdGlvbnMsIHtcbiAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgIG1vZGU6IDBvNjY2LFxuICAgIGZsYWc6ICdhJ1xuICB9KTtcbiAgZnMud3JpdGVGaWxlKGZpbGUsIGRhdGEsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbn07XG4vKipcbiAqIFN5bmNocm9ub3VzbHkgYXBwZW5kIGRhdGEgdG8gYSBmaWxlLCBjcmVhdGluZyB0aGUgZmlsZSBpZiBpdCBkb2VzIG5vdCB5ZXQgZXhpc3QuIGRhdGEgY2FuIGJlIGEgc3RyaW5nIG9yIGEgQnVmZmVyLlxuICogQHBhcmFtIHtzdHJpbmd8QnVmZmVyfFVSTHxGaWxlU3RyZWFtfSBmaWxlIGZpbGVwYXRoIHRvIGZpbGVcbiAqIEBwYXJhbSB7c3RyaW5nfEJ1ZmZlcn0gZGF0YSBkYXRhIHRvIGFwcGVuZCB0byBmaWxlXG4gKiBAcGFyYW0ge29iamVjdHxzdHJpbmd9IFtvcHRpb25zXSBvcHRpb25zXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZW5jb2Rpbmc9J3V0ZjgnXSBlbmNvZGluZyB0byB1c2VcbiAqIEBwYXJhbSB7aW50ZWdlcn0gW29wdGlvbnMubW9kZT0wbzY2Nl0gbW9kZSB0byBjcmVhdGUgZmlsZSwgaWYgbm90IGNyZWF0ZWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5mbGFnPSdhJ10gZmlsZSBzeXN0ZW0gZmxhZ1xuICovXG5cblxuZnMuYXBwZW5kRmlsZVN5bmMgPSAoZmlsZSwgZGF0YSwgb3B0aW9ucykgPT4ge1xuICBvcHRpb25zID0gbWVyZ2VEZWZhdWx0T3B0aW9ucyhvcHRpb25zLCB7XG4gICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICBtb2RlOiAwbzY2NixcbiAgICBmbGFnOiAnYSdcbiAgfSk7XG4gIGZzLndyaXRlRmlsZVN5bmMoZmlsZSwgZGF0YSwgb3B0aW9ucyk7IC8vIFRPRE86IFVzZSBUaS5GaWxlc3lzdGVtLkZpbGUuYXBwZW5kKCkgaW5zdGVhZD9cbn07XG5cbmZzLmNobW9kID0gKHBhdGgsIG1vZGUsIGNhbGxiYWNrKSA9PiBhc3luY1Vuc3VwcG9ydGVkTm9vcCgnZnMnLCAnY2htb2QnLCBjYWxsYmFjayk7XG5cbmZzLmNobW9kU3luYyA9IHVuc3VwcG9ydGVkTm9vcCgnZnMnLCAnY2htb2RTeW5jJyk7XG4vKipcbiAqIENhbGxiYWNrIGZvciBmdW5jdGlvbnMgdGhhdCBjYW4gb25seSB0aHJvdyBlcnJvcnNcbiAqXG4gKiBAY2FsbGJhY2sgZXJyb3JDYWxsYmFja1xuICogQHBhcmFtIHtFcnJvcn0gW2Vycl0gLSBFcnJvciB0aHJvd25cbiAqL1xuXG4vKipcbiAqIEBwYXJhbSB7aW50ZWdlcn0gZmQgZmlsZSBkZXNjcmlwdG9yXG4gKiBAcGFyYW0ge2Vycm9yQ2FsbGJhY2t9IGNhbGxiYWNrIGNhbGxiYWNrIGZ1bmN0aW9uXG4gKi9cblxuZnMuY2xvc2UgPSAoZmQsIGNhbGxiYWNrKSA9PiB7XG4gIGNhbGxiYWNrID0gbWF5YmVDYWxsYmFjayhjYWxsYmFjayk7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBmcy5jbG9zZVN5bmMoZmQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNhbGxiYWNrKCk7XG4gIH0sIDEpO1xufTtcbi8qKlxuICogQHBhcmFtIHtpbnRlZ2VyfSBmZCBmaWxlIGRlc2NyaXB0b3JcbiAqL1xuXG5cbmZzLmNsb3NlU3luYyA9IGZkID0+IHtcbiAgY29uc3Qgc3RyZWFtID0gc3RyZWFtRm9yRGVzY3JpcHRvcihmZCk7XG4gIHN0cmVhbS5jbG9zZSgpO1xufTsgLy8gUmF0aGVyIHRoYW4gdXNlIGEgaGFjayB0byB3cmFwIHN5bmMgdmVyc2lvbiBpbiBzZXRUaW1lb3V0LCB1c2UgYWN0dWFsIGFzeW5jIEFQSXMhXG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd8QnVmZmVyfFVSTH0gc3JjIHNvdXJjZSBmaWxlbmFtZSB0byBjb3B5XG4gKiBAcGFyYW0ge3N0cmluZ3xCdWZmZXJ8VVJMfSBkZXN0IGRlc3RpbmF0aW9uIGZpbGVuYW1lIG9mIHRoZSBjb3B5IG9wZXJhdGlvblxuICogQHBhcmFtIHtudW1iZXJ9IFtmbGFncz0wXSBtb2RpZmllcnMgZm9yIGNvcHkgb3BlcmF0aW9uXG4gKiBAcGFyYW0ge2Vycm9yQ2FsbGJhY2t9IGNhbGxiYWNrIGNhbGxiYWNrIGNhbGxlZCBhdCBlbmQgb2Ygb3BlcmF0aW9uXG4gKi9cblxuXG5mcy5jb3B5RmlsZSA9IGZ1bmN0aW9uIChzcmMsIGRlc3QsIGZsYWdzLCBjYWxsYmFjaykge1xuICBpZiAodHlwZW9mIGZsYWdzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2FsbGJhY2sgPSBmbGFncztcbiAgICBmbGFncyA9IDA7XG4gIH1cblxuICBjYWxsYmFjayA9IG1heWJlQ2FsbGJhY2soY2FsbGJhY2spOyAvLyBGSVhNRTogSSBkb24ndCBrbm93IHdoeSwgYnV0IGNoYW5naW5nIHRoaXMgdG8gdXNlIFRpLkZpbGVzeXN0ZW0ub3BlblN0cmVhbShtb2RlLCBwYXRoKSBmYWlscyAoYXQgbGVhc3Qgb24gaU9TKVxuXG4gIGNvbnN0IHNyY0ZpbGUgPSBUaS5GaWxlc3lzdGVtLmdldEZpbGUoc3JjKTtcbiAgY29uc3Qgc3JjU3RyZWFtID0gc3JjRmlsZS5vcGVuKFRpLkZpbGVzeXN0ZW0uTU9ERV9SRUFEKTtcbiAgY29uc3QgZGVzdEZpbGUgPSBUaS5GaWxlc3lzdGVtLmdldEZpbGUoZGVzdCk7XG4gIGNvbnN0IGRlc3RTdHJlYW0gPSBkZXN0RmlsZS5vcGVuKFRpLkZpbGVzeXN0ZW0uTU9ERV9XUklURSk7XG4gIHBpcGUoc3JjU3RyZWFtLCBkZXN0U3RyZWFtLCBjYWxsYmFjayk7XG59O1xuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ3xCdWZmZXJ8VVJMfSBzcmMgc291cmNlIGZpbGVuYW1lIHRvIGNvcHlcbiAqIEBwYXJhbSB7c3RyaW5nfEJ1ZmZlcnxVUkx9IGRlc3QgZGVzdGluYXRpb24gZmlsZW5hbWUgb2YgdGhlIGNvcHkgb3BlcmF0aW9uXG4gKiBAcGFyYW0ge251bWJlcn0gW2ZsYWdzPTBdIG1vZGlmaWVycyBmb3IgY29weSBvcGVyYXRpb25cbiAqL1xuXG5cbmZzLmNvcHlGaWxlU3luYyA9IGZ1bmN0aW9uIChzcmMsIGRlc3QsIGZsYWdzID0gMCkge1xuICBjb25zdCBzcmNGaWxlID0gVGkuRmlsZXN5c3RlbS5nZXRGaWxlKHNyYyk7XG5cbiAgaWYgKGZsYWdzID09PSBmcy5jb25zdGFudHMuQ09QWUZJTEVfRVhDTCAmJiBmcy5leGlzdHNTeW5jKGRlc3QpKSB7XG4gICAgdGhyb3cgZmlsZUFscmVhZHlFeGlzdHMoJ2NvcHlGaWxlJywgZGVzdCk7XG4gIH1cblxuICBpZiAoIXNyY0ZpbGUuY29weShkZXN0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGNvcHkgJHtzcmN9IHRvICR7ZGVzdH1gKTsgLy8gRklYTUU6IFdoYXQgZXJyb3Igc2hvdWxkIHdlIGdpdmU/XG4gIH1cbn07IC8vIFRPRE86IGZzLmNyZWF0ZVJlYWRTdHJlYW0ocGF0aCwgb3B0aW9ucylcbi8vIC8qKlxuLy8gICogQHBhcmFtIHtzdHJpbmd8QnVmZmVyfFVSTH0gcGF0aCBwYXRoIGxpa2Vcbi8vICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gW29wdGlvbnNdIG9wdGlvbnMsIGlmIGEgc3RyaW5nLCBpdCdzIHRoZSBlbmNvZGluZ1xuLy8gICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmZsYWdzPSdyJ10gU2VlIHN1cHBvcnQgb2YgZmlsZSBzeXN0ZW0gZmxhZ3MuXG4vLyAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZW5jb2Rpbmc9bnVsbF0gZW5jb2Rpbmdcbi8vICAqIEBwYXJhbSB7aW50ZWdlcn0gW29wdGlvbnMuZmQ9bnVsbF0gZmlsZSBkZXNjcmlwdG9yLCBpZiBzcGVjaWZpZWQsIGBwYXRoYCBpcyBpZ25vcmVkXG4vLyAgKiBAcGFyYW0ge2ludGVnZXJ9IFtvcHRpb25zLm1vZGU9MG82NjZdIHBlcm1pc3Npb25zIHRvIHNldCBpZiBmaWxlIGlzIGNyZWF0ZWRcbi8vICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuYXV0b0Nsb3NlPXRydWVdIGlmIGZhbHNlLCBmaWxlIGRlc2NyaXB0b3Igd2lsbCBub3QgYmUgY2xvc2VkOyBpZiB0cnVlIGV2ZW4gb24gZXJyb3IgaXQgd2lsbCBiZSBjbG9zZWRcbi8vICAqIEBwYXJhbSB7aW50ZWdlcn0gW29wdGlvbnMuc3RhcnRdIHN0YXJ0IGluZGV4IG9mIHJhbmdlIG9mIGJ5dGVzIHRvIHJlYWQgZnJvbSBmaWxlXG4vLyAgKiBAcGFyYW0ge2ludGVnZXJ9IFtvcHRpb25zLmVuZD1JbmZpbml0eV0gZW5kIGluZGV4IG9mIHJhbmdlIG9mIGJ5dGVzIHRvIHJlYWQgZnJvbSBmaWxlXG4vLyAgKiBAcGFyYW0ge2ludGVnZXJ9IFtvcHRpb25zLmhpZ2hXYXRlck1hcms9NjQgKiAxMDI0XVxuLy8gICogQHJldHVybnMge2ZzLlJlYWRTdHJlYW19XG4vLyAgKi9cbi8vIGZzLmNyZWF0ZVJlYWRTdHJlYW0gPSAocGF0aCwgb3B0aW9ucykgPT4ge1xuLy8gXHRvcHRpb25zID0gbWVyZ2VEZWZhdWx0T3B0aW9ucyhvcHRpb25zLCB7IGZsYWdzOiAncicsIGVuY29kaW5nOiBudWxsLCBmZDogbnVsbCwgbW9kZTogMG82NjYsIGF1dG9DbG9zZTogdHJ1ZSwgZW5kOiBJbmZpbml0eSwgaGlnaFdhdGVyTWFyazogNjQgKiAxMDI0IH0pO1xuLy8gXHQvLyBGSVhNRTogSWYgb3B0aW9ucy5mZCwgdXNlIHRoYXQgaW4gcGxhY2Ugb2YgcGF0aCFcbi8vIFx0Y29uc3QgdGlGaWxlID0gZ2V0VGlGaWxlRnJvbVBhdGhMaWtlVmFsdWUocGF0aCk7XG4vLyB9O1xuLy8gVE9ETzogZnMuY3JlYXRlV3JpdGVTdHJlYW0ocGF0aCwgb3B0aW9ucylcblxuLyoqXG4gKiBAY2FsbGJhY2sgZXhpc3RzQ2FsbGJhY2tcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZXhpc3RzIC0gd2hldGhlciBwYXRoIGV4aXN0c1xuICovXG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGggcGF0aCB0byBjaGVja1xuICogQHBhcmFtIHtleGlzdHNDYWxsYmFja30gY2FsbGJhY2sgY2FsbGJhY2sgZnVuY3Rpb25cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5cblxuZnMuZXhpc3RzID0gZnVuY3Rpb24gKHBhdGgsIGNhbGxiYWNrKSB7XG4gIGNhbGxiYWNrID0gbWF5YmVDYWxsYmFjayhjYWxsYmFjayk7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGNhbGxiYWNrKGZzLmV4aXN0c1N5bmMocGF0aCkpO1xuICB9LCAxKTtcbn07XG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIHBhdGggdG8gY2hlY2tcbiAqIEByZXR1cm5zIHtib29sZWFufSB3aGV0aGVyIGEgZmlsZSBvciBkaXJlY3RvcnkgZXhpc3RzIGF0IHRoYXQgcGF0aFxuICovXG5cblxuZnMuZXhpc3RzU3luYyA9IGZ1bmN0aW9uIChwYXRoKSB7XG4gIHRyeSB7XG4gICAgZnMuYWNjZXNzU3luYyhwYXRoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuZnMuZmNobW9kID0gKGZkLCBtb2RlLCBjYWxsYmFjaykgPT4gYXN5bmNVbnN1cHBvcnRlZE5vb3AoJ2ZzJywgJ2ZjaG1vZCcsIGNhbGxiYWNrKTtcblxuZnMuZmNobW9kU3luYyA9IHVuc3VwcG9ydGVkTm9vcCgnZnMnLCAnZmNobW9kU3luYycpO1xuXG5mcy5mY2hvd24gPSAoZmQsIHVpZCwgZ2lkLCBjYWxsYmFjaykgPT4gYXN5bmNVbnN1cHBvcnRlZE5vb3AoJ2ZzJywgJ2ZjaG93bicsIGNhbGxiYWNrKTtcblxuZnMuZmNob3duU3luYyA9IHVuc3VwcG9ydGVkTm9vcCgnZnMnLCAnZmNob3duU3luYycpO1xuXG5mcy5mZGF0YXN5bmMgPSAoZmQsIGNhbGxiYWNrKSA9PiBhc3luY1Vuc3VwcG9ydGVkTm9vcCgnZnMnLCAnZmRhdGFzeW5jJywgY2FsbGJhY2spO1xuXG5mcy5mZGF0YXN5bmNTeW5jID0gdW5zdXBwb3J0ZWROb29wKCdmcycsICdmZGF0YXN5bmNTeW5jJyk7XG4vKipcbiAqIEBwYXJhbSB7aW50ZWdlcn0gZmQgZmlsZSBkZXNjcmlwdG9yXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIG9wdGlvbnNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuYmlnaW50XSB3aGV0aGVyIHN0YXQgdmFsdWVzIHNob3VsZCBiZSBiaWdpbnRcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIGFzeW5jIGNhbGxiYWNrIGZ1bmN0aW9uXG4gKi9cblxuZnMuZnN0YXQgPSAoZmQsIG9wdGlvbnMsIGNhbGxiYWNrKSA9PiB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICBvcHRpb25zID0ge307XG4gIH1cblxuICBjYWxsYmFjayA9IG1heWJlQ2FsbGJhY2soY2FsbGJhY2spO1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBsZXQgc3RhdHM7XG5cbiAgICB0cnkge1xuICAgICAgc3RhdHMgPSBmcy5mc3RhdFN5bmMoZmQsIG9wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNhbGxiYWNrKG51bGwsIHN0YXRzKTtcbiAgfSwgMSk7XG59O1xuLyoqXG4gKiBAcGFyYW0ge2ludGVnZXJ9IGZkIGZpbGUgZGVzY3JpcHRvclxuICogQHBhcmFtIHtvYmplY3R9IFtfb3B0aW9uc10gb3B0aW9uc1xuICogQHBhcmFtIHtib29sZWFufSBbX29wdGlvbnMuYmlnaW50XSB3aGV0aGVyIHN0YXQgdmFsdWVzIHNob3VsZCBiZSBiaWdpbnRcbiAqIEByZXR1cm5zIHtmcy5TdGF0c30gc3RhdHMgZm9yIGZpbGUgZGVzY3JpcHRvclxuICovXG5cblxuZnMuZnN0YXRTeW5jID0gKGZkLCBfb3B0aW9ucykgPT4ge1xuICBjb25zdCBwYXRoID0gcGF0aEZvckZpbGVEZXNjcmlwdG9yKGZkKTtcbiAgcmV0dXJuIGZzLnN0YXRTeW5jKHBhdGgpO1xufTsgLy8gVE9ETzogQWRkIHZlcnNpb25zIG9mIHRoZXNlIEFQSXM6XG4vLyBmcy5mc3luYyhmZCwgY2FsbGJhY2spXG4vLyBmcy5mc3luY1N5bmMoZmQpXG4vLyBmcy5mdHJ1bmNhdGUoZmRbLCBsZW5dLCBjYWxsYmFjaylcbi8vIGZzLmZ0cnVuY2F0ZVN5bmMoZmRbLCBsZW5dKVxuLy8gZnMuZnV0aW1lcyhmZCwgYXRpbWUsIG10aW1lLCBjYWxsYmFjaylcbi8vIGZzLmZ1dGltZXNTeW5jKGZkLCBhdGltZSwgbXRpbWUpXG4vLyBmcy5sY2htb2QocGF0aCwgbW9kZSwgY2FsbGJhY2spXG4vLyBmcy5sY2htb2RTeW5jKHBhdGgsIG1vZGUpXG4vLyBmcy5sY2hvd24ocGF0aCwgdWlkLCBnaWQsIGNhbGxiYWNrKVxuLy8gZnMubGNob3duU3luYyhwYXRoLCB1aWQsIGdpZClcbi8vIGZzLmxpbmsoZXhpc3RpbmdQYXRoLCBuZXdQYXRoLCBjYWxsYmFjaylcbi8vIGZzLmxpbmtTeW5jKGV4aXN0aW5nUGF0aCwgbmV3UGF0aClcbi8vIEZJWE1FOiBJZiBzeW1ib2xpYyBsaW5rIHdlIG5lZWQgdG8gZm9sbG93IGxpbmsgdG8gdGFyZ2V0IHRvIGdldCBzdGF0cyEgT3VyIEFQSSBkb2Vzbid0IHN1cHBvcnQgdGhhdCFcblxuXG5mcy5sc3RhdCA9IChwYXRoLCBvcHRpb25zLCBjYWxsYmFjaykgPT4gZnMuc3RhdChwYXRoLCBvcHRpb25zLCBjYWxsYmFjayk7XG5cbmZzLmxzdGF0U3luYyA9IChwYXRoLCBvcHRpb25zKSA9PiBmcy5zdGF0U3luYyhwYXRoLCBvcHRpb25zKTtcbi8qKlxuICogQHBhcmFtIHtzdHJpbmd8QnVmZmVyfFVSTH0gcGF0aCBmaWxlIHBhdGhcbiAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gW29wdGlvbnNdIG9wdGlvbnNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVjdXJzaXZlPWZhbHNlXSByZWN1cnNpdmxleSBjcmVhdGUgZGlycz9cbiAqIEBwYXJhbSB7aW50ZWdlcn0gW29wdGlvbnMubW9kZT0wbzc3N10gcGVybWlzc2lvbnNcbiAqIEBwYXJhbSB7ZXJyb3JDYWxsYmFja30gY2FsbGJhY2sgYXN5bmMgY2FsbGJhY2tcbiAqL1xuXG5cbmZzLm1rZGlyID0gKHBhdGgsIG9wdGlvbnMsIGNhbGxiYWNrKSA9PiB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICBvcHRpb25zID0ge1xuICAgICAgcmVjdXJzaXZlOiBmYWxzZSxcbiAgICAgIG1vZGU6IDBvNzc3XG4gICAgfTtcbiAgfVxuXG4gIGNhbGxiYWNrID0gbWF5YmVDYWxsYmFjayhjYWxsYmFjayk7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBmcy5ta2RpclN5bmMocGF0aCwgb3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY2FsbGJhY2soZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY2FsbGJhY2sobnVsbCk7XG4gIH0sIDEpO1xufTtcbi8qKlxuICogQHBhcmFtIHtzdHJpbmd8QnVmZmVyfFVSTH0gcGF0aCBmaWxlIHBhdGhcbiAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gW29wdGlvbnNdIG9wdGlvbnNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVjdXJzaXZlPWZhbHNlXSByZWN1cnNpdmxleSBjcmVhdGUgZGlycz9cbiAqIEBwYXJhbSB7aW50ZWdlcn0gW29wdGlvbnMubW9kZT0wbzc3N10gcGVybWlzc2lvbnNcbiAqL1xuXG5cbmZzLm1rZGlyU3luYyA9IChwYXRoLCBvcHRpb25zKSA9PiB7XG4gIGNvbnN0IHRpRmlsZSA9IGdldFRpRmlsZUZyb21QYXRoTGlrZVZhbHVlKHBhdGgpO1xuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ251bWJlcicpIHtcbiAgICBvcHRpb25zID0ge1xuICAgICAgcmVjdXJzaXZlOiBmYWxzZSxcbiAgICAgIG1vZGU6IG9wdGlvbnNcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIG9wdGlvbnMgPSBtZXJnZURlZmF1bHRPcHRpb25zKG9wdGlvbnMsIHtcbiAgICAgIHJlY3Vyc2l2ZTogZmFsc2UsXG4gICAgICBtb2RlOiAwbzc3N1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKCF0aUZpbGUuY3JlYXRlRGlyZWN0b3J5KG9wdGlvbnMucmVjdXJzaXZlKSAmJiAhb3B0aW9ucy5yZWN1cnNpdmUpIHtcbiAgICBpZiAodGlGaWxlLmV4aXN0cygpKSB7XG4gICAgICAvLyBhbHJlYWR5IGV4aXN0ZWQhXG4gICAgICB0aHJvdyBmaWxlQWxyZWFkeUV4aXN0cygnbWtkaXInLCBwYXRoKTtcbiAgICB9IC8vIFdlIGZhaWxlZCwgcHJvYmFibHkgYmVjYXVzZSB3ZSBkaWRuJ3QgYXNrIGZvciByZWN1cnNpdmUgYW5kIHBhcmVudCBkb2Vzbid0IGV4aXN0LCBzbyByZXByb2R1Y2Ugbm9kZSdzIGVycm9yXG5cblxuICAgIHRocm93IG5vU3VjaEZpbGUoJ21rZGlyJywgcGF0aCk7XG4gIH1cbn07XG4vKipcbiAqIEBjYWxsYmFjayB0ZW1wRGlyQ2FsbGJhY2tcbiAqIEBwYXJhbSB7RXJyb3J9IGVyciAtIEVycm9yIGlmIG9uZSBvY2N1cnJlZFxuICogQHBhcmFtIHtzdHJpbmd9IGZvbGRlciAtIGdlbmVyYXRlZCBmb2xkZXIgbmFtZVxuICovXG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCBkaXJlY3RvcnkgbmFtZSBwcmVmaXhcbiAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gW29wdGlvbnNdIG9wdGlvbnNcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5lbmNvZGluZz0ndXRmLTgnXSBwcmVmaXggZW5jb2RpbmdcbiAqIEBwYXJhbSB7dGVtcERpckNhbGxiYWNrfSBjYWxsYmFjayBhc3luYyBjYWxsYmFja1xuICovXG5cblxuZnMubWtkdGVtcCA9IChwcmVmaXgsIG9wdGlvbnMsIGNhbGxiYWNrKSA9PiB7XG4gIGFzc2VydEFyZ3VtZW50VHlwZShwcmVmaXgsICdwcmVmaXgnLCAnc3RyaW5nJyk7XG5cbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2FsbGJhY2sgPSBvcHRpb25zO1xuICAgIG9wdGlvbnMgPSB7fTtcbiAgfVxuXG4gIGNhbGxiYWNrID0gbWF5YmVDYWxsYmFjayhjYWxsYmFjayk7XG4gIG9wdGlvbnMgPSBtZXJnZURlZmF1bHRPcHRpb25zKG9wdGlvbnMsIHtcbiAgICBlbmNvZGluZzogJ3V0Zi04J1xuICB9KTsgLy8gdHJ5IHRvIGJlIGFsbCBhc3luY1xuXG4gIGNvbnN0IHRyeU1rZHRlbXAgPSAoKSA9PiB7XG4gICAgY29uc3QgZ2VuZXJhdGVkID0gcmFuZG9tQ2hhcmFjdGVycyg2LCBvcHRpb25zLmVuY29kaW5nKTsgLy8gZ2VuZXJhdGUgc2l4IHJhbmRvbSBjaGFyYWN0ZXJzXG5cbiAgICBjb25zdCBwYXRoID0gYCR7cHJlZml4fSR7Z2VuZXJhdGVkfWA7XG4gICAgZnMubWtkaXIocGF0aCwgMG83MDAsIGVyciA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGlmIChlcnIuY29kZSA9PT0gJ0VFWElTVCcpIHtcbiAgICAgICAgICAvLyByZXRyeSFcbiAgICAgICAgICBzZXRUaW1lb3V0KHRyeU1rZHRlbXAsIDEpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSAvLyBidWJibGUgdXAgZXJyb3JcblxuXG4gICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gLy8gc3VjY2VlZGVkISBIdXJyYXkhXG5cblxuICAgICAgY2FsbGJhY2sobnVsbCwgcGF0aCk7XG4gICAgfSk7XG4gIH07XG5cbiAgc2V0VGltZW91dCh0cnlNa2R0ZW1wLCAxKTtcbn07XG4vKipcbiAqIENyZWF0ZXMgYSB1bmlxdWUgdGVtcG9yYXJ5IGRpcmVjdG9yeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggZGlyZWN0b3J5IG5hbWUgcHJlZml4XG4gKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IFtvcHRpb25zXSBvcHRpb25zXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZW5jb2Rpbmc9J3V0Zi04J10gcHJlZml4IGVuY29kaW5nXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBwYXRoIHRvIGNyZWF0ZWQgZGlyZWN0b3J5XG4gKi9cblxuXG5mcy5ta2R0ZW1wU3luYyA9IChwcmVmaXgsIG9wdGlvbnMpID0+IHtcbiAgYXNzZXJ0QXJndW1lbnRUeXBlKHByZWZpeCwgJ3ByZWZpeCcsICdzdHJpbmcnKTtcbiAgb3B0aW9ucyA9IG1lcmdlRGVmYXVsdE9wdGlvbnMob3B0aW9ucywge1xuICAgIGVuY29kaW5nOiAndXRmLTgnXG4gIH0pO1xuICBsZXQgcmV0cnlDb3VudCA9IDA7XG4gIGNvbnN0IE1BWF9SRVRSSUVTID0gMTAwO1xuXG4gIHdoaWxlIChyZXRyeUNvdW50IDwgTUFYX1JFVFJJRVMpIHtcbiAgICBjb25zdCBnZW5lcmF0ZWQgPSByYW5kb21DaGFyYWN0ZXJzKDYsIG9wdGlvbnMuZW5jb2RpbmcpOyAvLyBnZW5lcmF0ZSBzaXggcmFuZG9tIGNoYXJhY3RlcnNcblxuICAgIGNvbnN0IHBhdGggPSBgJHtwcmVmaXh9JHtnZW5lcmF0ZWR9YDtcblxuICAgIHRyeSB7XG4gICAgICBmcy5ta2RpclN5bmMocGF0aCwgMG83MDApOyAvLyBkb24ndCB0cnkgcmVjdXJzaXZlXG5cbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLmNvZGUgIT09ICdFRVhJU1QnKSB7XG4gICAgICAgIHRocm93IGU7IC8vIGJ1YmJsZSB1cCBlcnJvclxuICAgICAgfSAvLyBuYW1lIHdhcyBub3QgdW5pcXVlLCBzbyByZXRyeVxuXG5cbiAgICAgIHJldHJ5Q291bnQrKztcbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBjcmVhdGUgYSB1bmlxdWUgZGlyZWN0b3J5IG5hbWUgd2l0aCBwcmVmaXggJHtwcmVmaXh9YCk7XG59O1xuLyoqXG4gKiBAY2FsbGJhY2sgZmlsZURlc2NyaXB0b3JDYWxsYmFja1xuICogQHBhcmFtIHtFcnJvcn0gZXJyIC0gRXJyb3IgaWYgb25lIG9jY3VycmVkXG4gKiBAcGFyYW0ge2ludGVnZXJ9IGZpbGVEZXNjcmlwdG9yIC0gZ2VuZXJhdGVkIGZpbGUgZGVzY3JpcHRvclxuICovXG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd8QnVmZmVyfFVSTH0gcGF0aCBwYXRoIHRvIGZpbGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBbZmxhZ3M9J3InXSBmaWxlIHN5c3RlbSBhY2Nlc3MgZmxhZ3NcbiAqIEBwYXJhbSB7aW50ZWdlcn0gW21vZGU9MG82NjZdIGZpbGUgbW9kZSB0byB1c2Ugd2hlbiBjcmVhdGluZyBmaWxlXG4gKiBAcGFyYW0ge2ZpbGVEZXNjcmlwdG9yQ2FsbGJhY2t9IGNhbGxiYWNrIGFzeW5jIGNhbGxiYWNrXG4gKi9cblxuXG5mcy5vcGVuID0gKHBhdGgsIGZsYWdzLCBtb2RlLCBjYWxsYmFjaykgPT4ge1xuICAvLyBmbGFncyBhbmQgbW9kZSBhcmUgb3B0aW9uYWwsIHdlIG5lZWQgdG8gaGFuZGxlIGlmIG5vdCBzdXBwbGllZCFcbiAgaWYgKHR5cGVvZiBmbGFncyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNhbGxiYWNrID0gZmxhZ3M7XG4gICAgZmxhZ3MgPSAncic7XG4gICAgbW9kZSA9IDBvNjY2O1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2RlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2FsbGJhY2sgPSBtb2RlO1xuICAgIG1vZGUgPSAwbzY2NjtcbiAgfVxuXG4gIGNhbGxiYWNrID0gbWF5YmVDYWxsYmFjayhjYWxsYmFjayk7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGxldCBmaWxlRGVzY3JpcHRvcjtcblxuICAgIHRyeSB7XG4gICAgICBmaWxlRGVzY3JpcHRvciA9IGZzLm9wZW5TeW5jKHBhdGgsIGZsYWdzLCBtb2RlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjYWxsYmFjayhlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjYWxsYmFjayhudWxsLCBmaWxlRGVzY3JpcHRvcik7XG4gIH0sIDEpO1xufTtcbi8qKlxuICogQHBhcmFtIHtzdHJpbmd8QnVmZmVyfFVSTH0gcGF0aCBwYXRoIHRvIGZpbGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBbZmxhZ3M9J3InXSBmaWxlIHN5c3RlbSBhY2Nlc3MgZmxhZ3NcbiAqIEBwYXJhbSB7aW50ZWdlcn0gW19tb2RlPTBvNjY2XSBmaWxlIG1vZGUgdG8gdXNlIHdoZW4gY3JlYXRpbmcgZmlsZVxuICogQHJldHVybnMge2ludGVnZXJ9XG4gKi9cblxuXG5mcy5vcGVuU3luYyA9IChwYXRoLCBmbGFncyA9ICdyJywgX21vZGUgPSAwbzY2NikgPT4ge1xuICBjb25zdCB0aUZpbGUgPSBnZXRUaUZpbGVGcm9tUGF0aExpa2VWYWx1ZShwYXRoKTtcblxuICBpZiAoIXRpRmlsZS5leGlzdHMoKSkge1xuICAgIC8vIFRPRE86IFN1cHBvcnQgY3JlYXRpbmcgZmlsZSB3aXRoIHNwZWNpZmljIG1vZGVcbiAgICBvbmVUaW1lV2FybmluZygnZnMub3BlblN5bmMubW9kZScsICdmcy5vcGVuU3luY1xcJ3MgbW9kZSBwYXJhbWV0ZXIgaXMgdW5zdXBwb3J0ZWQgaW4gVGl0YW5pdW0gYW5kIHdpbGwgYmUgaWdub3JlZCcpO1xuXG4gICAgaWYgKCF0aUZpbGUuY3JlYXRlRmlsZSgpKSB7XG4gICAgICAvLyBPaCBjcmFwLCB3ZSBmYWlsZWQgdG8gY3JlYXRlIHRoZSBmaWxlLiB3aHk/XG4gICAgICBpZiAoIXRpRmlsZS5wYXJlbnQuZXhpc3RzKCkpIHtcbiAgICAgICAgLy8gcGFyZW50IGRvZXMgbm90IGV4aXN0IVxuICAgICAgICB0aHJvdyBub1N1Y2hGaWxlKCdvcGVuJywgcGF0aCk7XG4gICAgICB9XG5cbiAgICAgIHRocm93IG5ldyBFcnJvcihgZmFpbGVkIHRvIGNyZWF0ZSBmaWxlIGF0IHBhdGggJHtwYXRofWApO1xuICAgIH1cbiAgfSBlbHNlIGlmIChmbGFncykge1xuICAgIC8vIGZpbGUvZGlyIGV4aXN0cy4uLlxuICAgIGlmICgoZmxhZ3MuY2hhckF0KDApID09PSAndycgfHwgZmxhZ3MuY2hhckF0KDApID09PSAnYScpICYmIHRpRmlsZS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAvLyBJZiB1c2VyIGlzIHRyeWluZyB0byB3cml0ZSBvciBhcHBlbmQgYW5kIGl0J3MgYSBkaXJlY3RvcnksIGZhaWxcbiAgICAgIHRocm93IGlsbGVnYWxPcGVyYXRpb25PbkFEaXJlY3RvcnkoJ29wZW4nLCBwYXRoKTtcbiAgICB9XG5cbiAgICBpZiAoZmxhZ3MubGVuZ3RoID4gMSAmJiBmbGFncy5jaGFyQXQoMSkgPT09ICd4Jykge1xuICAgICAgLy8gSWYgdXNlciBoYXMgXCJleGNsdXNpdmVcIiBmbGFnIG9uLCBmYWlsIGlmIGZpbGUgYWxyZWFkeSBleGlzdHNcbiAgICAgIHRocm93IGZpbGVBbHJlYWR5RXhpc3RzKCdvcGVuJywgcGF0aCk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgdGlNb2RlID0gRkxBR1NfVE9fVElfTU9ERS5nZXQoZmxhZ3MpO1xuXG4gIGlmICh0aU1vZGUgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIFRPRE86IE1ha2UgdXNlIG9mIGNvbW1vbiBlcnJvciB0eXBlL2NvZGUgZm9yIHRoaXMgb25jZSB3ZSBoYXZlIGludGVybmFsL2Vycm9ycy5qc1xuICAgIGNvbnN0IGVyciA9IG5ldyBUeXBlRXJyb3IoYFRoZSB2YWx1ZSBcIiR7U3RyaW5nKGZsYWdzKX1cIiBpcyBpbnZhbGlkIGZvciBvcHRpb24gXCJmbGFnc1wiYCk7XG4gICAgZXJyLmNvZGUgPSAnRVJSX0lOVkFMSURfT1BUX1ZBTFVFJztcbiAgICB0aHJvdyBlcnI7XG4gIH1cblxuICByZXR1cm4gY3JlYXRlRmlsZURlc2NyaXB0b3IocGF0aCwgdGlGaWxlLm9wZW4odGlNb2RlKSk7XG59O1xuLyoqXG4gKiBAY2FsbGJhY2sgcmVhZENhbGxiYWNrXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnIgLSBFcnJvciBpZiBvbmUgb2NjdXJyZWRcbiAqIEBwYXJhbSB7aW50ZWdlcn0gYnl0ZXNSZWFkIC0gbnVtYmVyIG9mIGJ5dGVzIHJlYWRcbiAqIEBwYXJhbSB7QnVmZmVyfSBidWZmZXIgYnVmZmVyXG4gKi9cblxuLyoqXG4gKiBAcGFyYW0ge2ludGVnZXJ9IGZkIGZpbGUgZGVzY3JpcHRvclxuICogQHBhcmFtIHtCdWZmZXJ8VGkuQnVmZmVyfSBidWZmZXIgYnVmZmVyIHRvIHJlYWQgaW50b1xuICogQHBhcmFtIHtpbnRlZ2VyfSBvZmZzZXQgdGhlIG9mZnNldCBpbiB0aGUgYnVmZmVyIHRvIHN0YXJ0IHdyaXRpbmcgYXQuXG4gKiBAcGFyYW0ge2ludGVnZXJ9IGxlbmd0aCBpbnRlZ2VyIHNwZWNpZnlpbmcgdGhlIG51bWJlciBvZiBieXRlcyB0byByZWFkLlxuICogQHBhcmFtIHtpbnRlZ2VyfSBwb3NpdGlvbiB3aGVyZSB0byBiZWdpbiByZWFkaW5nIGZyb20gaW4gdGhlIGZpbGVcbiAqIEBwYXJhbSB7cmVhZENhbGxiYWNrfSBjYWxsYmFjayBhc3luYyBjYWxsYmFja1xuICovXG5cblxuZnMucmVhZCA9IChmZCwgYnVmZmVyLCBvZmZzZXQsIGxlbmd0aCwgcG9zaXRpb24sIGNhbGxiYWNrKSA9PiB7XG4gIGNhbGxiYWNrID0gbWF5YmVDYWxsYmFjayhjYWxsYmFjayk7XG4gIGNvbnN0IHRpRmlsZVN0cmVhbSA9IHN0cmVhbUZvckRlc2NyaXB0b3IoZmQpO1xuXG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZmZlcikpIHtcbiAgICBidWZmZXIgPSBCdWZmZXIuZnJvbShidWZmZXIpO1xuICB9IC8vIEZJWE1FOiBBbGxvdyB1c2luZyBwb3NpdGlvbiBhcmd1bWVudCFcblxuXG4gIGlmIChwb3NpdGlvbiAhPT0gbnVsbCkge1xuICAgIG9uZVRpbWVXYXJuaW5nKCdmcy5yZWFkU3luYy5wb3NpdGlvbicsICdmcy5yZWFkU3luY1xcJ3MgcG9zaXRpb24gYXJndW1lbnQgaXMgdW5zdXBwb3J0ZWQgYnkgVGl0YW5pdW0gYW5kIHdpbGwgYmUgdHJlYXRlZCBhcyBudWxsJyk7XG4gIH1cblxuICB0aUZpbGVTdHJlYW0ucmVhZChidWZmZXIudG9UaUJ1ZmZlcigpLCBvZmZzZXQsIGxlbmd0aCwgcmVhZE9iaiA9PiB7XG4gICAgaWYgKCFyZWFkT2JqLnN1Y2Nlc3MpIHtcbiAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcihyZWFkT2JqLmVycm9yKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY2FsbGJhY2sobnVsbCwgcmVhZE9iai5ieXRlc1Byb2Nlc3NlZCwgYnVmZmVyKTtcbiAgfSk7XG59O1xuLyoqXG4gKiBAcGFyYW0ge2ludGVnZXJ9IGZkIGZpbGUgZGVzY3JpcHRvclxuICogQHBhcmFtIHtCdWZmZXJ8VGkuQnVmZmVyfSBidWZmZXIgYnVmZmVyIHRvIHJlYWQgaW50b1xuICogQHBhcmFtIHtpbnRlZ2VyfSBvZmZzZXQgdGhlIG9mZnNldCBpbiB0aGUgYnVmZmVyIHRvIHN0YXJ0IHdyaXRpbmcgYXQuXG4gKiBAcGFyYW0ge2ludGVnZXJ9IGxlbmd0aCBpbnRlZ2VyIHNwZWNpZnlpbmcgdGhlIG51bWJlciBvZiBieXRlcyB0byByZWFkLlxuICogQHBhcmFtIHtpbnRlZ2VyfSBfcG9zaXRpb24gd2hlcmUgdG8gYmVnaW4gcmVhZGluZyBmcm9tIGluIHRoZSBmaWxlXG4gKiBAcmV0dXJucyB7aW50ZWdlcn0gYnl0ZXMgcmVhZFxuICovXG5cblxuZnMucmVhZFN5bmMgPSAoZmQsIGJ1ZmZlciwgb2Zmc2V0LCBsZW5ndGgsIF9wb3NpdGlvbikgPT4ge1xuICBjb25zdCBmaWxlU3RyZWFtID0gc3RyZWFtRm9yRGVzY3JpcHRvcihmZCk7XG5cbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmZmVyKSkge1xuICAgIGJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGJ1ZmZlcik7XG4gIH0gLy8gRklYTUU6IEFsbG93IHVzaW5nIHBvc2l0aW9uIGFyZ3VtZW50IVxuXG5cbiAgaWYgKF9wb3NpdGlvbiAhPT0gbnVsbCkge1xuICAgIG9uZVRpbWVXYXJuaW5nKCdmcy5yZWFkU3luYy5wb3NpdGlvbicsICdmcy5yZWFkU3luY1xcJ3MgcG9zaXRpb24gYXJndW1lbnQgaXMgdW5zdXBwb3J0ZWQgYnkgVGl0YW5pdW0gYW5kIHdpbGwgYmUgdHJlYXRlZCBhcyBudWxsJyk7XG4gIH1cblxuICByZXR1cm4gZmlsZVN0cmVhbS5yZWFkKGJ1ZmZlci50b1RpQnVmZmVyKCksIG9mZnNldCwgbGVuZ3RoKTtcbn07XG4vKipcbiAqIEBjYWxsYmFjayBmaWxlc0NhbGxiYWNrXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnIgLSBFcnJvciBpZiBvbmUgb2NjdXJyZWRcbiAqIEBwYXJhbSB7c3RyaW5nW118QnVmZmVyW118ZnMuRGlyZW50W119IGZpbGVzIC0gZmlsZSBsaXN0aW5nXG4gKi9cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBkaXJlY3RvcnkgdG8gbGlzdFxuICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0fSBbb3B0aW9uc10gb3B0aW9uYWwgb3B0aW9uc1xuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmVuY29kaW5nPSd1dGY4J10gZW5jb2RpbmcgdG8gdXNlIGZvciBmaWxlbmFtZXMsIGlmIGAnYnVmZmVyJ2AsIHJldHVybnMgYEJ1ZmZlcmAgb2JqZWN0c1xuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy53aXRoRmlsZVR5cGVzPWZhbHNlXSBpZiB0cnVlLCByZXR1cm5zIGBmcy5EaXJlbnRgIG9iamVjdHNcbiAqIEBwYXJhbSB7ZmlsZXNDYWxsYmFja30gY2FsbGJhY2sgYXN5bmMgY2FsbGJhY2tcbiAqL1xuXG5cbmZzLnJlYWRkaXIgPSAocGF0aCwgb3B0aW9ucywgY2FsbGJhY2spID0+IHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2FsbGJhY2sgPSBvcHRpb25zO1xuICAgIG9wdGlvbnMgPSB7fTtcbiAgfVxuXG4gIGNhbGxiYWNrID0gbWF5YmVDYWxsYmFjayhjYWxsYmFjayk7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGxldCByZXN1bHQ7XG5cbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gZnMucmVhZGRpclN5bmMocGF0aCwgb3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY2FsbGJhY2soZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcbiAgfSwgMSk7XG59O1xuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZXBhdGggZGlyZWN0b3J5IHRvIGxpc3RcbiAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gW29wdGlvbnNdIG9wdGlvbmFsIG9wdGlvbnNcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5lbmNvZGluZz0ndXRmOCddIGVuY29kaW5nIHRvIHVzZSBmb3IgZmlsZW5hbWVzLCBpZiBgJ2J1ZmZlcidgLCByZXR1cm5zIGBCdWZmZXJgIG9iamVjdHNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMud2l0aEZpbGVUeXBlcz1mYWxzZV0gaWYgdHJ1ZSwgcmV0dXJucyBgZnMuRGlyZW50YCBvYmplY3RzXG4gKiBAcmV0dXJucyB7c3RyaW5nW118QnVmZmVyW118ZnMuRGlyZW50W119XG4gKi9cblxuXG5mcy5yZWFkZGlyU3luYyA9IChmaWxlcGF0aCwgb3B0aW9ucykgPT4ge1xuICBjb25zdCBmaWxlID0gZ2V0VGlGaWxlRnJvbVBhdGhMaWtlVmFsdWUoZmlsZXBhdGgpO1xuXG4gIGlmICghZmlsZS5leGlzdHMoKSkge1xuICAgIHRocm93IG5vU3VjaEZpbGUoJ3NjYW5kaXInLCBmaWxlcGF0aCk7XG4gIH1cblxuICBpZiAoIWZpbGUuaXNEaXJlY3RvcnkoKSkge1xuICAgIHRocm93IG5vdEFEaXJlY3RvcnkoJ3NjYW5kaXInLCBmaWxlcGF0aCk7XG4gIH1cblxuICBvcHRpb25zID0gbWVyZ2VEZWZhdWx0T3B0aW9ucyhvcHRpb25zLCB7XG4gICAgZW5jb2Rpbmc6ICd1dGYtOCcsXG4gICAgd2l0aEZpbGVUeXBlczogZmFsc2VcbiAgfSk7XG4gIGNvbnN0IGxpc3RpbmcgPSBmaWxlLmdldERpcmVjdG9yeUxpc3RpbmcoKTtcblxuICBpZiAob3B0aW9ucy53aXRoRmlsZVR5cGVzID09PSB0cnVlKSB7XG4gICAgLy8gVE9ETzogaWYgb3B0aW9ucy53aXRoRmlsZVR5cGVzID09PSB0cnVlLCByZXR1cm4gZnMuRGlyZW50IG9iamVjdHNcbiAgICBvbmVUaW1lV2FybmluZygnZnMucmVhZGRpclxcJ3Mgb3B0aW9ucy53aXRoRmlsZVR5cGVzIGlzIHVuc3VwcG9ydGVkIGJ5IFRpdGFuaXVtIGFuZCBzdHJpbmdzIHdpbGwgYmUgcmV0dXJuZWQnKTtcbiAgfSBlbHNlIGlmIChvcHRpb25zLmVuY29kaW5nID09PSAnYnVmZmVyJykge1xuICAgIHJldHVybiBsaXN0aW5nLm1hcChuYW1lID0+IEJ1ZmZlci5mcm9tKG5hbWUpKTtcbiAgfVxuXG4gIHJldHVybiBsaXN0aW5nO1xufTtcbi8qKlxuICogQGNhbGxiYWNrIHJlYWRGaWxlUG9zdE9wZW5DYWxsYmFja1xuICogQHBhcmFtIHtFcnJvcn0gZXJyIC0gRXJyb3IgaWYgb25lIG9jY3VycmVkXG4gKiBAcGFyYW0ge1RpLkJ1ZmZlcn0gYnVmZmVyXG4gKi9cblxuLyoqXG4gKiBAcGFyYW0ge2ludGVnZXJ9IGZpbGVEZXNjcmlwdG9yIGZpbGUgZGVzY3JpcHRvclxuICogQHBhcmFtIHtyZWFkRmlsZVBvc3RPcGVuQ2FsbGJhY2t9IGNhbGxiYWNrIGFzeW5jIGNhbGxiYWNrXG4gKi9cblxuXG5mdW5jdGlvbiByZWFkRmlsZVBvc3RPcGVuKGZpbGVEZXNjcmlwdG9yLCBjYWxsYmFjaykge1xuICBjYWxsYmFjayA9IG1heWJlQ2FsbGJhY2soY2FsbGJhY2spO1xuICBmcy5mc3RhdChmaWxlRGVzY3JpcHRvciwgKGVyciwgc3RhdHMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGVTaXplID0gc3RhdHMuc2l6ZTsgLy8gQ3JlYXRlIGEgVGkuQnVmZmVyIHRvIHJlYWQgaW50b1xuXG4gICAgY29uc3QgYnVmZmVyID0gVGkuY3JlYXRlQnVmZmVyKHtcbiAgICAgIGxlbmd0aDogZmlsZVNpemVcbiAgICB9KTsgLy8gVXNlIFRpLlN0cmVhbS5yZWFkQWxsKHNvdXJjZVN0cmVhbSwgYnVmZmVyLCBjYWxsYmFjaykgd2hpY2ggc3BpbnMgb2ZmIGEgc2VwYXJhdGUgdGhyZWFkIHRvIHJlYWQgaW4gd2hpbGUgbG9vcCFcblxuICAgIGNvbnN0IHNvdXJjZVN0cmVhbSA9IHN0cmVhbUZvckRlc2NyaXB0b3IoZmlsZURlc2NyaXB0b3IpO1xuICAgIFRpLlN0cmVhbS5yZWFkQWxsKHNvdXJjZVN0cmVhbSwgYnVmZmVyLCByZWFkQWxsT2JqID0+IHtcbiAgICAgIGlmICghcmVhZEFsbE9iai5zdWNjZXNzKSB7XG4gICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcihyZWFkQWxsT2JqLmVycm9yKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2sobnVsbCwgYnVmZmVyKTtcbiAgICB9KTtcbiAgfSk7XG59XG4vKipcbiAqIEBjYWxsYmFjayByZWFkRmlsZUNhbGxiYWNrXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnIgLSBFcnJvciBpZiBvbmUgb2NjdXJyZWRcbiAqIEBwYXJhbSB7c3RyaW5nfEJ1ZmZlcn0gZGF0YVxuICovXG5cbi8qKlxuICogQXN5bmNocm9ub3VzbHkgcmVhZCBlbnRpcmUgY29udGVudHMgb2YgZmlsZVxuICogQHBhcmFtIHtzdHJpbmd8QnVmZmVyfFVSTHxpbnRlZ2VyfSBwYXRoIGZpbGVuYW1lIG9yIGZpbGUgZGVzY3JpcHRvclxuICogQHBhcmFtIHtvYmplY3R8c3RyaW5nfSBbb3B0aW9uc10gb3B0aW9uc1xuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmVuY29kaW5nPW51bGxdIGVuY29kaW5nIHRvIHVzZVxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmZsYWc9J3InXSBmaWxlIHN5c3RlbSBmbGFnXG4gKiBAcGFyYW0ge3JlYWRGaWxlQ2FsbGJhY2t9IGNhbGxiYWNrIGFzeW5jIGNhbGxiYWNrXG4gKi9cblxuXG5mcy5yZWFkRmlsZSA9IChwYXRoLCBvcHRpb25zLCBjYWxsYmFjaykgPT4ge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIGVuY29kaW5nOiBudWxsLFxuICAgICAgZmxhZzogJ3InXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBvcHRpb25zID0gbWVyZ2VEZWZhdWx0T3B0aW9ucyhvcHRpb25zLCB7XG4gICAgICBlbmNvZGluZzogbnVsbCxcbiAgICAgIGZsYWc6ICdyJ1xuICAgIH0pO1xuICB9XG5cbiAgY2FsbGJhY2sgPSBtYXliZUNhbGxiYWNrKGNhbGxiYWNrKTtcbiAgY29uc3Qgd2FzRmlsZURlc2NyaXB0b3IgPSB0eXBlb2YgcGF0aCA9PT0gJ251bWJlcic7XG4gIGxldCBmaWxlRGVzY3JpcHRvciA9IHBhdGg7IC8vIG1heSBiZSBvdmVycmlkZW4gbGF0ZXJcblxuICAvKipcbiAgICogQHBhcmFtIHtFcnJvcn0gZXJyIHBvc3NpYmxlIEVycm9yXG4gICAqIEBwYXJhbSB7VGkuQnVmZmVyfSBidWZmZXIgVGkuQnVmZmVyIGluc3RhbmNlXG4gICAqL1xuXG4gIGNvbnN0IGhhbmRsZUJ1ZmZlciA9IChlcnIsIGJ1ZmZlcikgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICByZXR1cm47XG4gICAgfSAvLyBmcy5jbG9zZVN5bmMgaWYgaXQgd2FzIG5vdCBvcmlnaW5hbGx5IGEgZmlsZSBkZXNjcmlwdG9yXG5cblxuICAgIGlmICghd2FzRmlsZURlc2NyaXB0b3IpIHtcbiAgICAgIGZzLmNsb3NlU3luYyhmaWxlRGVzY3JpcHRvcik7XG4gICAgfSAvLyBUT0RPOiB0cmltIGJ1ZmZlciBpZiB3ZSBkaWRuJ3QgcmVhZCBmdWxsIHNpemU/XG5cblxuICAgIGNhbGxiYWNrKG51bGwsIGVuY29kZUJ1ZmZlcihvcHRpb25zLmVuY29kaW5nLCBidWZmZXIpKTtcbiAgfTtcblxuICBpZiAoIXdhc0ZpbGVEZXNjcmlwdG9yKSB7XG4gICAgZnMub3BlbihwYXRoLCBvcHRpb25zLmZsYWcsIChlcnIsIGZkKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZmlsZURlc2NyaXB0b3IgPSBmZDtcbiAgICAgIHJlYWRGaWxlUG9zdE9wZW4oZmQsIGhhbmRsZUJ1ZmZlcik7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmVhZEZpbGVQb3N0T3BlbihwYXRoLCBoYW5kbGVCdWZmZXIpO1xuICB9XG59O1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBjb250ZW50cyBvZiB0aGUgcGF0aC5cbiAqIEBwYXJhbSB7c3RyaW5nfEJ1ZmZlcnxVUkx8aW50ZWdlcn0gcGF0aCBwYXRoIHRvIGZpbGVcbiAqIEBwYXJhbSB7b2JqZWN0fHN0cmluZ30gW29wdGlvbnNdIG9wdGlvbnNcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5lbmNvZGluZz1udWxsXSBlbmNvZGluZyB0byB1c2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5mbGFnPSdyJ10gZmlsZSBzeXN0ZW0gZmxhZ1xuICogQHJldHVybnMge3N0cmluZ3xCdWZmZXJ9IHN0cmluZyBpZiBlbmNvZGluZyBpcyBzcGVjaWZpZWQsIG90aGVyd2lzZSBCdWZmZXJcbiAqL1xuXG5cbmZzLnJlYWRGaWxlU3luYyA9IChwYXRoLCBvcHRpb25zKSA9PiB7XG4gIG9wdGlvbnMgPSBtZXJnZURlZmF1bHRPcHRpb25zKG9wdGlvbnMsIHtcbiAgICBlbmNvZGluZzogbnVsbCxcbiAgICBmbGFnOiAncidcbiAgfSk7XG4gIGNvbnN0IHdhc0ZpbGVEZXNjcmlwdG9yID0gdHlwZW9mIHBhdGggPT09ICdudW1iZXInO1xuICBjb25zdCBmaWxlRGVzY3JpcHRvciA9IHdhc0ZpbGVEZXNjcmlwdG9yID8gcGF0aCA6IGZzLm9wZW5TeW5jKHBhdGgsIG9wdGlvbnMuZmxhZyk7IC8vIHVzZSBkZWZhdWx0IG1vZGVcblxuICBjb25zdCB0aUZpbGVTdHJlYW0gPSBzdHJlYW1Gb3JEZXNjcmlwdG9yKGZpbGVEZXNjcmlwdG9yKTsgLy8gSnVzdCB1c2Ugb3VyIG93biBBUEkgdGhhdCByZWFkcyBmdWxsIHN0cmVhbSBpblxuXG4gIGNvbnN0IGJ1ZmZlciA9IFRpLlN0cmVhbS5yZWFkQWxsKHRpRmlsZVN0cmVhbSk7IC8vIGZzLmNsb3NlU3luYyBpZiBpdCB3YXMgbm90IG9yaWdpbmFsbHkgYSBmaWxlIGRlc2NyaXB0b3JcblxuICBpZiAoIXdhc0ZpbGVEZXNjcmlwdG9yKSB7XG4gICAgZnMuY2xvc2VTeW5jKGZpbGVEZXNjcmlwdG9yKTtcbiAgfSAvLyBUT0RPOiB0cmltIGJ1ZmZlciBpZiB3ZSBkaWRuJ3QgcmVhZCBmdWxsIHNpemU/XG5cblxuICByZXR1cm4gZW5jb2RlQnVmZmVyKG9wdGlvbnMuZW5jb2RpbmcsIGJ1ZmZlcik7XG59OyAvLyBUT0RPOiBmcy5yZWFkbGluayhwYXRoWywgb3B0aW9uc10sIGNhbGxiYWNrKVxuLy8gVE9ETzogZnMucmVhZGxpbmtTeW5jKHBhdGhbLCBvcHRpb25zXSlcblxuLyoqXG4gKiBAY2FsbGJhY2sgcmVhbHBhdGhDYWxsYmFja1xuICogQHBhcmFtIHtFcnJvcn0gZXJyIC0gRXJyb3IgaWYgb25lIG9jY3VycmVkXG4gKiBAcGFyYW0ge3N0cmluZ3xCdWZmZXJ9IHJlc29sdmVkUGF0aCB0aGUgcmVzb2x2ZWQgcGF0aFxuICovXG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd8QnVmZmVyfFVSTH0gZmlsZXBhdGggb3JpZ2luYWwgZmlsZXBhdGhcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gb3B0aW9zbiBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5lbmNvZGluZz0ndXRmOCddIGVuY29kaW5nIHVzZWQgZm9yIHJldHVybmVkIG9iamVjdC4gSWYgJ2J1ZmZlclwiLCB3ZSdsbCByZXR1cm4gYSBCdWZmZXIgaW4gcGFsY2Ugb2YgYSBzdHJpbmdcbiAqIEBwYXJhbSB7cmVhbHBhdGhDYWxsYmFja30gY2FsbGJhY2sgYXN5bmMgY2FsbGJhY2tcbiAqL1xuXG5cbmZzLnJlYWxwYXRoID0gKGZpbGVwYXRoLCBvcHRpb25zLCBjYWxsYmFjaykgPT4ge1xuICBjYWxsYmFjayA9IG1heWJlQ2FsbGJhY2soY2FsbGJhY2sgfHwgb3B0aW9ucyk7XG4gIG9wdGlvbnMgPSBtZXJnZURlZmF1bHRPcHRpb25zKG9wdGlvbnMsIHtcbiAgICBlbmNvZGluZzogJ3V0ZjgnXG4gIH0pO1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAvLyBGSVhNRTogVGhpcyBhc3N1bWVzIG5vIHN5bWxpbmtzLCB3aGljaCB3ZSByZWFsbHkgZG9uJ3QgaGF2ZSBmdWxsIHN1cHBvcnQgZm9yIGluIG91ciBTREsgYW55d2F5cy5cbiAgICBjb25zdCByZXN1bHQgPSBwYXRoLm5vcm1hbGl6ZShmaWxlcGF0aCk7XG4gICAgZnMuZXhpc3RzKHJlc3VsdCwgcmVzdWx0RXhpc3RzID0+IHtcbiAgICAgIGlmIChyZXN1bHRFeGlzdHMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuZW5jb2RpbmcgPT09ICdidWZmZXInKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIEJ1ZmZlci5mcm9tKHJlc3VsdCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHJlc3VsdCk7XG4gICAgICB9IC8vIHRoaXMgcGF0aCBkb2Vzbid0IGV4aXN0LCB0cnkgZWFjaCBzZWdtZW50IHVudGlsIHdlIGZpbmQgZmlyc3QgdGhhdCBkb2Vzbid0XG5cblxuICAgICAgY29uc3Qgc2VnbWVudHMgPSByZXN1bHQuc3BsaXQocGF0aC5zZXApOyAvLyBGSVhNRTogRHJvcCBsYXN0IHNlZ21lbnQgYXMgd2UgYWxyZWFkeSBrbm93IHRoZSBmdWxsIHBhdGggZG9lc24ndCBleGlzdD9cblxuICAgICAgbGV0IHBhcnRpYWxGaWxlUGF0aCA9ICcnO1xuICAgICAgbGV0IGluZGV4ID0gMDsgLy8gaGFuZGxlIHR5cGljYWwgY2FzZSBvZiBlbXB0eSBmaXJzdCBzZWdtZW50IHNvIHdlIGRvbid0IG5lZWQgdG8gZG8gYW4gYXN5bmMgc2V0VGltZW91dCB0byBnZXQgdG8gZmlyc3QgcmVhbCBjYXNlXG5cbiAgICAgIGlmIChzZWdtZW50c1tpbmRleF0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGluZGV4Kys7XG4gICAgICB9XG5cbiAgICAgIHNldFRpbWVvdXQodHJ5UGF0aCwgMSk7XG5cbiAgICAgIGZ1bmN0aW9uIHRyeVBhdGgoKSB7XG4gICAgICAgIGlmIChpbmRleCA+PSBzZWdtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAvLyBkb24ndCBydW4gcGFzdCBlbmQgb2Ygc2VnbWVudHMsIHRocm93IGVycm9yIGZvciByZXNvbHZlZCBwYXRoXG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG5vU3VjaEZpbGUocmVzdWx0KSk7XG4gICAgICAgIH0gLy8gZ3JhYiBuZXh0IHNlZ21lbnRcblxuXG4gICAgICAgIGNvbnN0IHNlZ21lbnQgPSBzZWdtZW50c1tpbmRleCsrXTtcblxuICAgICAgICBpZiAoc2VnbWVudC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAvLyBpZiBpdCdzIGFuIGVtcHR5IHNlZ21lbnQuLi5cbiAgICAgICAgICAvLyB0cnkgYWdhaW4gYXQgbmV4dCBpbmRleFxuICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0KHRyeVBhdGgsIDEpO1xuICAgICAgICB9IC8vIG5vcm1hbCBjYXNlXG5cblxuICAgICAgICBwYXJ0aWFsRmlsZVBhdGggKz0gcGF0aC5zZXAgKyBzZWdtZW50OyAvLyBjaGVjayBpZiBwYXRoIHVwIHRvIHRoaXMgcG9pbnQgZXhpc3RzLi4uXG5cbiAgICAgICAgZnMuZXhpc3RzKHBhcnRpYWxGaWxlUGF0aCwgcGFydGlhbEV4aXN0cyA9PiB7XG4gICAgICAgICAgaWYgKCFwYXJ0aWFsRXhpc3RzKSB7XG4gICAgICAgICAgICAvLyBub3BlLCB0aHJvdyB0aGUgRXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhub1N1Y2hGaWxlKCdsc3RhdCcsIHBhcnRpYWxGaWxlUGF0aCkpO1xuICAgICAgICAgIH0gLy8gdHJ5IGFnYWluIGF0IG5leHQgZGVwdGggb2YgZGlyIHRyZWVcblxuXG4gICAgICAgICAgc2V0VGltZW91dCh0cnlQYXRoLCAxKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sIDEpO1xufTtcblxuZnMucmVhbHBhdGgubmF0aXZlID0gKHBhdGgsIG9wdGlvbnMsIGNhbGxiYWNrKSA9PiB7XG4gIGZzLnJlYWxwYXRoKHBhdGgsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbn07XG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfEJ1ZmZlcnxVUkx9IGZpbGVwYXRoIG9yaWdpbmFsIGZpbGVwYXRoXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIG9wdGlvbnMgb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZW5jb2Rpbmc9J3V0ZjgnXSBlbmNvZGluZyB1c2VkIGZvciByZXR1cm5lZCBvYmplY3QuIElmICdidWZmZXJcIiwgd2UnbGwgcmV0dXJuIGEgQnVmZmVyIGluIHBhbGNlIG9mIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7c3RyaW5nfEJ1ZmZlcn1cbiAqL1xuXG5cbmZzLnJlYWxwYXRoU3luYyA9IChmaWxlcGF0aCwgb3B0aW9ucykgPT4ge1xuICBvcHRpb25zID0gbWVyZ2VEZWZhdWx0T3B0aW9ucyhvcHRpb25zLCB7XG4gICAgZW5jb2Rpbmc6ICd1dGY4J1xuICB9KTsgLy8gRklYTUU6IFRoaXMgYXNzdW1lcyBubyBzeW1saW5rcywgd2hpY2ggd2UgcmVhbGx5IGRvbid0IGhhdmUgZnVsbCBzdXBwb3J0IGZvciBpbiBvdXIgU0RLIGFueXdheXMuXG5cbiAgY29uc3QgcmVzdWx0ID0gcGF0aC5ub3JtYWxpemUoZmlsZXBhdGgpO1xuXG4gIGlmICghZnMuZXhpc3RzU3luYyhyZXN1bHQpKSB7XG4gICAgLy8gdGhpcyBwYXRoIGRvZXNuJ3QgZXhpc3QsIHRyeSBlYWNoIHNlZ21lbnQgdW50aWwgd2UgZmluZCBmaXJzdCB0aGF0IGRvZXNuJ3RcbiAgICBjb25zdCBzZWdtZW50cyA9IHJlc3VsdC5zcGxpdChwYXRoLnNlcCk7XG4gICAgbGV0IHBhcnRpYWxGaWxlUGF0aCA9ICcnO1xuXG4gICAgZm9yIChjb25zdCBzZWdtZW50IG9mIHNlZ21lbnRzKSB7XG4gICAgICBpZiAoc2VnbWVudC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHBhcnRpYWxGaWxlUGF0aCArPSBwYXRoLnNlcCArIHNlZ21lbnQ7XG5cbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwYXJ0aWFsRmlsZVBhdGgpKSB7XG4gICAgICAgIHRocm93IG5vU3VjaEZpbGUoJ2xzdGF0JywgcGFydGlhbEZpbGVQYXRoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAob3B0aW9ucy5lbmNvZGluZyA9PT0gJ2J1ZmZlcicpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20ocmVzdWx0KTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5mcy5yZWFscGF0aFN5bmMubmF0aXZlID0gKHBhdGgsIG9wdGlvbnMpID0+IHtcbiAgZnMucmVhbHBhdGhTeW5jKHBhdGgsIG9wdGlvbnMpO1xufTtcbi8qKlxuICogQHBhcmFtIHtzdHJpbmd8QnVmZmVyfFVSTH0gb2xkUGF0aCBzb3VyY2UgZmlsZXBhdGhcbiAqIEBwYXJhbSB7c3RyaW5nfEJ1ZmZlcnxVUkx9IG5ld1BhdGggZGVzdGluYXRpb24gZmlsZXBhdGhcbiAqIEBwYXJhbSB7ZXJyb3JDYWxsYmFja30gY2FsbGJhY2sgYXN5bmMgY2FsbGJhY2tcbiAqL1xuXG5cbmZzLnJlbmFtZSA9IChvbGRQYXRoLCBuZXdQYXRoLCBjYWxsYmFjaykgPT4ge1xuICBjYWxsYmFjayA9IG1heWJlQ2FsbGJhY2soY2FsbGJhY2spO1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgZnMucmVuYW1lU3luYyhvbGRQYXRoLCBuZXdQYXRoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjYWxsYmFjayhlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjYWxsYmFjaygpO1xuICB9LCAxKTtcbn07XG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfEJ1ZmZlcnxVUkx9IG9sZFBhdGggc291cmNlIGZpbGVwYXRoXG4gKiBAcGFyYW0ge3N0cmluZ3xCdWZmZXJ8VVJMfSBuZXdQYXRoIGRlc3RpbmF0aW9uIGZpbGVwYXRoXG4gKi9cblxuXG5mcy5yZW5hbWVTeW5jID0gKG9sZFBhdGgsIG5ld1BhdGgpID0+IHtcbiAgY29uc3QgdGlGaWxlID0gZ2V0VGlGaWxlRnJvbVBhdGhMaWtlVmFsdWUob2xkUGF0aCk7IC8vIHNyYyBkb2Vzbid0IGFjdHVhbGx5IGV4aXN0P1xuXG4gIGlmICghdGlGaWxlLmV4aXN0cygpKSB7XG4gICAgY29uc3QgZXJyID0gbm9TdWNoRmlsZSgncmVuYW1lJywgb2xkUGF0aCk7XG4gICAgZXJyLm1lc3NhZ2UgPSBgJHtlcnIubWVzc2FnZX0gLT4gJyR7bmV3UGF0aH0nYDtcbiAgICBlcnIuZGVzdCA9IG5ld1BhdGg7XG4gICAgdGhyb3cgZXJyO1xuICB9XG5cbiAgY29uc3QgZGVzdEZpbGUgPSBnZXRUaUZpbGVGcm9tUGF0aExpa2VWYWx1ZShuZXdQYXRoKTtcblxuICBpZiAoZGVzdEZpbGUuaXNEaXJlY3RvcnkoKSkge1xuICAgIC8vIGRlc3QgaXMgYSBkaXJlY3RvcnkgdGhhdCBhbHJlYWR5IGV4aXN0c1xuICAgIGNvbnN0IGVyciA9IGlsbGVnYWxPcGVyYXRpb25PbkFEaXJlY3RvcnkoJ3JlbmFtZScsIG9sZFBhdGgpO1xuICAgIGVyci5tZXNzYWdlID0gYCR7ZXJyLm1lc3NhZ2V9IC0+ICcke25ld1BhdGh9J2A7XG4gICAgZXJyLmRlc3QgPSBuZXdQYXRoO1xuICAgIHRocm93IGVycjtcbiAgfVxuXG4gIGxldCB0ZW1wUGF0aDtcblxuICBpZiAoZGVzdEZpbGUuaXNGaWxlKCkpIHtcbiAgICAvLyBkZXN0aW5hdGlvbiBmaWxlIGV4aXN0cywgd2Ugc2hvdWxkIG92ZXJ3cml0ZVxuICAgIC8vIE91ciBBUElzIHdpbGwgZmFpbCBpZiB3ZSB0cnksIHNvIGZpcnN0IGxldCdzIG1ha2UgYSBiYWNrdXAgY29weSBhbmQgZGVsZXRlIHRoZSB0aGUgb3JpZ2luYWxcbiAgICB0ZW1wUGF0aCA9IHBhdGguam9pbihmcy5ta2R0ZW1wU3luYyhwYXRoLmpvaW4oVGkuRmlsZXN5c3RlbS50ZW1wRGlyZWN0b3J5LCAncmVuYW1lLScpKSwgcGF0aC5iYXNlbmFtZShuZXdQYXRoKSk7XG4gICAgZGVzdEZpbGUubW92ZSh0ZW1wUGF0aCk7XG4gIH1cblxuICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuXG4gIHRyeSB7XG4gICAgc3VjY2VzcyA9IHRpRmlsZS5tb3ZlKG5ld1BhdGgpO1xuICB9IGZpbmFsbHkge1xuICAgIGlmICh0ZW1wUGF0aCkge1xuICAgICAgLy8gd2UgdGVtcG9yYXJpbHkgY29waWVkIHRoZSBleGlzdGluZyBkZXN0aW5hdGlvbiB0byBiYWNrIGl0IHVwLi4uXG4gICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAvLyBtb3ZlIHdvcmtlZCwgc28gd2UgY2FuIHdpcGUgaXQgYXdheSB3aGVuZXZlci4uLlxuICAgICAgICBmcy51bmxpbmsodGVtcFBhdGgsIF9lcnIgPT4ge30pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbW92ZSBpdCBiYWNrLCBiZWNhdXNlIHdlIGZhaWxlZCFcbiAgICAgICAgY29uc3QgdG1wRmlsZSA9IGdldFRpRmlsZUZyb21QYXRoTGlrZVZhbHVlKHRlbXBQYXRoKTtcbiAgICAgICAgdG1wRmlsZS5tb3ZlKG5ld1BhdGgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcbi8qKlxuICogQHBhcmFtIHtzdHJpbmd8QnVmZmVyfFVSTH0gcGF0aCBmaWxlIHBhdGhcbiAqIEBwYXJhbSB7ZXJyb3JDYWxsYmFja30gY2FsbGJhY2sgYXN5bmMgY2FsbGJhY2tcbiAqL1xuXG5cbmZzLnJtZGlyID0gKHBhdGgsIGNhbGxiYWNrKSA9PiB7XG4gIGNhbGxiYWNrID0gbWF5YmVDYWxsYmFjayhjYWxsYmFjayk7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBmcy5ybWRpclN5bmMocGF0aCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY2FsbGJhY2soZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY2FsbGJhY2soKTtcbiAgfSwgMSk7XG59O1xuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ3xCdWZmZXJ8VVJMfSBwYXRoIGZpbGUgcGF0aFxuICovXG5cblxuZnMucm1kaXJTeW5jID0gcGF0aCA9PiB7XG4gIGNvbnN0IHRpRmlsZSA9IGdldFRpRmlsZUZyb21QYXRoTGlrZVZhbHVlKHBhdGgpO1xuXG4gIGlmICghdGlGaWxlLmRlbGV0ZURpcmVjdG9yeShmYWxzZSkpIHtcbiAgICAvLyBkbyBub3QgZGVsZXRlIGNvbnRlbnRzIVxuICAgIC8vIHdlIGZhaWxlZCB0byBkZWxldGUsIGJ1dCB3aHk/XG4gICAgLy8gZG9lcyBpdCBleGlzdD9cbiAgICBpZiAoIXRpRmlsZS5leGlzdHMoKSkge1xuICAgICAgdGhyb3cgbm9TdWNoRmlsZSgncm1kaXInLCBwYXRoKTtcbiAgICB9IC8vIGlzIGl0IGEgZmlsZT9cblxuXG4gICAgaWYgKHRpRmlsZS5pc0ZpbGUoKSkge1xuICAgICAgdGhyb3cgbm90QURpcmVjdG9yeSgncm1kaXInLCBwYXRoKTtcbiAgICB9IC8vIGlzIGl0IG5vdCBlbXB0eT9cblxuXG4gICAgY29uc3Qgc3ViRmlsZXMgPSB0aUZpbGUuZ2V0RGlyZWN0b3J5TGlzdGluZygpO1xuXG4gICAgaWYgKHN1YkZpbGVzICYmIHN1YkZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRocm93IGRpcmVjdG9yeU5vdEVtcHR5KCdybWRpcicsIHBhdGgpO1xuICAgIH1cbiAgfVxufTtcbi8qKlxuICogQHBhcmFtIHtzdHJpbmd8QnVmZmVyfFVSTH0gcGF0aCBmaWxlIHBhdGhcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gb3B0aW9uc1xuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5iaWdpbnRdIHdoZXRoZXIgc3RhdCB2YWx1ZXMgc2hvdWxkIGJlIGJpZ2ludFxuICogQHBhcmFtIHtzdGF0c0NhbGxiYWNrfSBjYWxsYmFjayBhc3luYyBjYWxsYmFja1xuICovXG5cblxuZnMuc3RhdCA9IChwYXRoLCBvcHRpb25zLCBjYWxsYmFjaykgPT4ge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgb3B0aW9ucyA9IHt9O1xuICB9XG5cbiAgY2FsbGJhY2sgPSBtYXliZUNhbGxiYWNrKGNhbGxiYWNrKTtcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgY2FsbGJhY2sobnVsbCwgbmV3IGZzLlN0YXRzKHBhdGgpKTtcbiAgfSwgMSk7XG59O1xuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ3xCdWZmZXJ8VVJMfGludGVnZXJ9IHBhdGggZmlsZXBhdGggb3IgZmlsZSBkZXNjcmlwdG9yXG4gKiBAcGFyYW0ge29iamVjdH0gW19vcHRpb25zXSBvcHRpb25zXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtfb3B0aW9ucy5iaWdpbnRdIHdoZXRoZXIgc3RhdCB2YWx1ZXMgc2hvdWxkIGJlIGJpZ2ludFxuICogQHJldHVybnMge2ZzLlN0YXRzfVxuICovXG5cblxuZnMuc3RhdFN5bmMgPSAocGF0aCwgX29wdGlvbnMpID0+IG5ldyBmcy5TdGF0cyhwYXRoKTtcblxuZnMuc3ltbGluayA9ICh0YXJnZXQsIHBhdGgsIHR5cGUsIGNhbGxiYWNrKSA9PiBhc3luY1Vuc3VwcG9ydGVkTm9vcCgnZnMnLCAnc3ltbGluaycsIGNhbGxiYWNrKTtcblxuZnMuc3ltbGlua1N5bmMgPSB1bnN1cHBvcnRlZE5vb3AoJ2ZzJywgJ3N5bWxpbmtTeW5jJyk7XG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIGZpbGUgcGF0aFxuICogQHBhcmFtIHtpbnRlZ2VyfSBbbGVuPTBdIGJ5dGVzIHRvIHRyaW0gdG9cbiAqIEBwYXJhbSB7ZXJyb3JDYWxsYmFja30gY2FsbGJhY2sgYXN5bmMgY2FsbGJhY2tcbiAqL1xuXG5mcy50cnVuY2F0ZSA9IChwYXRoLCBsZW4sIGNhbGxiYWNrKSA9PiB7XG4gIGNhbGxiYWNrID0gbWF5YmVDYWxsYmFjayhjYWxsYmFjayB8fCBsZW4pO1xuXG4gIGlmICh0eXBlb2YgbGVuICE9PSAnbnVtYmVyJykge1xuICAgIGxlbiA9IDA7XG4gIH1cblxuICBpZiAobGVuIDw9IDApIHtcbiAgICBmcy53cml0ZUZpbGUocGF0aCwgJycsIGNhbGxiYWNrKTsgLy8gZW1wdHkgdGhlIGZpbGVcblxuICAgIHJldHVybjtcbiAgfSAvLyB3ZSBoYXZlIHRvIHJldGFpbiBzb21lIG9mIHRoZSBmaWxlIVxuICAvLyB5dWNrLCBzbyBsZXQncyByZWFkIHdoYXQgd2UgbmVlZCB0byByZXRhaW4sIHRoZW4gb3ZlcndyaXRlIGZpbGUgd2l0aCBpdFxuXG5cbiAgZnMub3BlbihwYXRoLCAoZXJyLCBmZCkgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhsZW4pO1xuICAgIGZzLnJlYWQoZmQsIGJ1ZmZlciwgMCwgbGVuLCBudWxsLCAoZXJyLCBieXRlc1JlYWQsIGJ1ZmZlcikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBmcy5jbG9zZVN5bmMoZmQpO1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgIH1cblxuICAgICAgZnMuY2xvc2UoZmQsIGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZzLndyaXRlRmlsZShwYXRoLCBidWZmZXIsIGNhbGxiYWNrKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn07XG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIGZpbGUgcGF0aFxuICogQHBhcmFtIHtpbnRlZ2VyfSBbbGVuPTBdIGJ5dGVzIHRvIHRyaW0gdG9cbiAqL1xuXG5cbmZzLnRydW5jYXRlU3luYyA9IChwYXRoLCBsZW4gPSAwKSA9PiB7XG4gIGlmIChsZW4gPD0gMCkge1xuICAgIC8vIGVtcHR5IHRoZSBmaWxlXG4gICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLCAnJyk7XG4gICAgcmV0dXJuO1xuICB9IC8vIHdlIGhhdmUgdG8gcmV0YWluIHNvbWUgb2YgdGhlIGZpbGUhXG4gIC8vIHl1Y2ssIHNvIGxldCdzIHJlYWQgd2hhdCB3ZSBuZWVkIHRvIHJldGFpbiwgdGhlbiBvdmVyd3JpdGUgZmlsZSB3aXRoIGl0XG5cblxuICBjb25zdCBmZCA9IGZzLm9wZW5TeW5jKHBhdGgpO1xuICBjb25zdCBidWZmZXIgPSBCdWZmZXIuYWxsb2MobGVuKTtcbiAgZnMucmVhZFN5bmMoZmQsIGJ1ZmZlciwgMCwgbGVuLCBudWxsKTtcbiAgZnMuY2xvc2VTeW5jKGZkKTtcbiAgZnMud3JpdGVGaWxlU3luYyhwYXRoLCBidWZmZXIpO1xufTtcbi8qKlxuICogQHBhcmFtIHtzdHJpbmd8QnVmZmVyfFVSTH0gcGF0aCBmaWxlIHBhdGhcbiAqIEBwYXJhbSB7ZXJyb3JDYWxsYmFja30gY2FsbGJhY2sgYXN5bmMgY2FsbGJhY2tcbiAqL1xuXG5cbmZzLnVubGluayA9IChwYXRoLCBjYWxsYmFjaykgPT4ge1xuICBjYWxsYmFjayA9IG1heWJlQ2FsbGJhY2soY2FsbGJhY2spO1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgZnMudW5saW5rU3luYyhwYXRoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY2FsbGJhY2soKTtcbiAgfSwgMSk7XG59O1xuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ3xCdWZmZXJ8VVJMfSBwYXRoIGZpbGUgcGF0aFxuICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAqL1xuXG5cbmZzLnVubGlua1N5bmMgPSBwYXRoID0+IHtcbiAgY29uc3QgdGlGaWxlID0gZ2V0VGlGaWxlRnJvbVBhdGhMaWtlVmFsdWUocGF0aCk7XG5cbiAgaWYgKCF0aUZpbGUuZGVsZXRlRmlsZSgpKSB7XG4gICAgLy8gd2UgZmFpbGVkLCBidXQgd2h5P1xuICAgIGlmICghdGlGaWxlLmV4aXN0cygpKSB7XG4gICAgICB0aHJvdyBub1N1Y2hGaWxlKCd1bmxpbmsnLCBwYXRoKTtcbiAgICB9XG5cbiAgICBpZiAodGlGaWxlLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIHRocm93IGlsbGVnYWxPcGVyYXRpb25PbkFEaXJlY3RvcnkoJ3VubGluaycsIHBhdGgpO1xuICAgIH1cbiAgfVxufTtcblxuZnMudW53YXRjaEZpbGUgPSB1bnN1cHBvcnRlZE5vb3AoJ2ZzJywgJ3Vud2F0Y2hGaWxlJyk7XG5cbmZzLnV0aW1lcyA9IChwYXRoLCBhdGltZSwgbXRpbWUsIGNhbGxiYWNrKSA9PiBhc3luY1Vuc3VwcG9ydGVkTm9vcCgnZnMnLCAndXRpbWVzJywgY2FsbGJhY2spO1xuXG5mcy51dGltZXNTeW5jID0gdW5zdXBwb3J0ZWROb29wKCdmcycsICd1dGltZXNTeW5jJyk7XG5mcy53YXRjaCA9IHVuc3VwcG9ydGVkTm9vcCgnZnMnLCAnd2F0Y2gnKTtcbmZzLndhdGNoRmlsZSA9IHVuc3VwcG9ydGVkTm9vcCgnZnMnLCAnd2F0Y2hGaWxlJyk7XG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfEJ1ZmZlcnxVUkx8aW50ZWdlcn0gZmlsZSBmaWxlIHBhdGggb3IgZGVzY3JpcHRvclxuICogQHBhcmFtIHtzdHJpbmd8QnVmZmVyfFR5cGVkQXJyYXl8RGF0YVZpZXd9IGRhdGEgZGF0YSB0byB3cml0ZVxuICogQHBhcmFtIHtvYmplY3R8c3RyaW5nfSBbb3B0aW9uc10gb3B0aW9ucywgZW5jb2RpbmcgaWYgc3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ3xudWxsfSBbb3B0aW9ucy5lbmNvZGluZz0ndXRmLTgnXSBvcHRpb25zXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMubW9kZT0wbzY2Nl0gb3B0aW9uc1xuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLmZsYWc9J3cnXSBvcHRpb25zXG4gKiBAcGFyYW0ge2Vycm9yQ2FsbGJhY2t9IGNhbGxiYWNrIGFzeW5jIGNhbGxiYWNrXG4gKi9cblxuZnMud3JpdGVGaWxlID0gKGZpbGUsIGRhdGEsIG9wdGlvbnMsIGNhbGxiYWNrKSA9PiB7XG4gIGNhbGxiYWNrID0gbWF5YmVDYWxsYmFjayhjYWxsYmFjayB8fCBvcHRpb25zKTtcbiAgb3B0aW9ucyA9IG1lcmdlRGVmYXVsdE9wdGlvbnMob3B0aW9ucywge1xuICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgbW9kZTogMG82NjYsXG4gICAgZmxhZzogJ3cnXG4gIH0pOyAvLyBUdXJuIGludG8gZmlsZSBkZXNjcmlwdG9yXG5cbiAgY29uc3Qgd2FzRmlsZURlc2NyaXB0b3IgPSB0eXBlb2YgZmlsZSA9PT0gJ251bWJlcic7XG4gIGxldCBmaWxlRGVzY3JpcHRvciA9IGZpbGU7IC8vIG1heSBiZSBvdmVycmlkZW4gbGF0ZXJcblxuICBjb25zdCBmaW5pc2ggPSBlcnIgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHdhc0ZpbGVEZXNjcmlwdG9yKSB7XG4gICAgICBjYWxsYmFjaygpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gLy8gZnMuY2xvc2UgaWYgaXQgd2FzIG5vdCBvcmlnaW5hbGx5IGEgZmlsZSBkZXNjcmlwdG9yXG5cblxuICAgIGZzLmNsb3NlKGZpbGVEZXNjcmlwdG9yLCBjYWxsYmFjayk7XG4gIH07XG5cbiAgaWYgKCF3YXNGaWxlRGVzY3JpcHRvcikge1xuICAgIGZzLm9wZW4oZmlsZSwgb3B0aW9ucy5mbGFnLCBvcHRpb25zLm1vZGUsIChlcnIsIGZkKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZmlsZURlc2NyaXB0b3IgPSBmZDtcbiAgICAgIGZzLndyaXRlKGZpbGVEZXNjcmlwdG9yLCBkYXRhLCBmaW5pc2gpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGZzLndyaXRlKGZpbGVEZXNjcmlwdG9yLCBkYXRhLCBmaW5pc2gpO1xuICB9XG59O1xuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ3xCdWZmZXJ8VVJMfGludGVnZXJ9IGZpbGUgZmlsZSBwYXRoIG9yIGRlc2NyaXB0b3JcbiAqIEBwYXJhbSB7c3RyaW5nfEJ1ZmZlcnxUeXBlZEFycmF5fERhdGFWaWV3fSBkYXRhIGRhdGEgdG8gd3JpdGVcbiAqIEBwYXJhbSB7b2JqZWN0fHN0cmluZ30gW29wdGlvbnNdIG9wdGlvbnMsIGVuY29kaW5nIGlmIHN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmVuY29kaW5nPSd1dGYtOCddIG9wdGlvbnNcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5tb2RlPTBvNjY2XSBvcHRpb25zXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuZmxhZz0ndyddIG9wdGlvbnNcbiAqL1xuXG5cbmZzLndyaXRlRmlsZVN5bmMgPSAoZmlsZSwgZGF0YSwgb3B0aW9ucykgPT4ge1xuICBvcHRpb25zID0gbWVyZ2VEZWZhdWx0T3B0aW9ucyhvcHRpb25zLCB7XG4gICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICBtb2RlOiAwbzY2NixcbiAgICBmbGFnOiAndydcbiAgfSk7IC8vIFR1cm4gaW50byBmaWxlIGRlc2NyaXB0b3JcblxuICBjb25zdCB3YXNGaWxlRGVzY3JpcHRvciA9IHR5cGVvZiBmaWxlID09PSAnbnVtYmVyJztcbiAgY29uc3QgZmlsZURlc2NyaXB0b3IgPSB3YXNGaWxlRGVzY3JpcHRvciA/IGZpbGUgOiBmcy5vcGVuU3luYyhmaWxlLCBvcHRpb25zLmZsYWcsIG9wdGlvbnMubW9kZSk7IC8vIGlmIGRhdGEgaXMgYSBzdHJpbmcsIG1ha2UgaXQgYSBidWZmZXIgZmlyc3RcblxuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihkYXRhKSkge1xuICAgIGRhdGEgPSBCdWZmZXIuZnJvbSgnJyArIGRhdGEsIG9wdGlvbnMuZW5jb2RpbmcpOyAvLyBmb3JjZSBkYXRhIHRvIGJlIGEgc3RyaW5nLCBoYW5kbGVzIGNhc2Ugd2hlcmUgaXQncyB1bmRlZmluZWQgYW5kIHdyaXRlcyAndW5kZWZpbmVkJyB0byBmaWxlIVxuICB9XG5cbiAgZnMud3JpdGVTeW5jKGZpbGVEZXNjcmlwdG9yLCBkYXRhKTsgLy8gY2xvc2UgaWYgdXNlciBkaWRuJ3QgZ2l2ZSB1cyBmaWxlIGRlc2NyaXB0b3JcblxuICBpZiAoIXdhc0ZpbGVEZXNjcmlwdG9yKSB7XG4gICAgZnMuY2xvc2VTeW5jKGZpbGVEZXNjcmlwdG9yKTtcbiAgfVxufTtcbi8qKlxuICogQGNhbGxiYWNrIHdyaXRlVGlGaWxlU3RyZWFtQ2FsbGJhY2tcbiAqIEBwYXJhbSB7RXJyb3J9IGVyciAtIEVycm9yIGlmIG9uZSBvY2N1cnJlZFxuICogQHBhcmFtIHtpbnRlZ2VyfSB3cml0dGVuIC0gYnl0ZXMgd3JpdHRlblxuICovXG5cbi8qKlxuICogQHBhcmFtIHtUaS5GaWxlc3lzdGVtLkZpbGVTdHJlYW19IHRpRmlsZVN0cmVhbSBmaWxlIHN0cmVhbVxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlciBidWZmZXIgd2UncmUgd3JpdGluZ1xuICogQHBhcmFtIHt3cml0ZVRpRmlsZVN0cmVhbUNhbGxiYWNrfSBjYWxsYmFjayBhc3luYyBjYWxsYmFja1xuICovXG5cblxuZnVuY3Rpb24gd3JpdGVUaUZpbGVTdHJlYW0odGlGaWxlU3RyZWFtLCBidWZmZXIsIGNhbGxiYWNrKSB7XG4gIGNhbGxiYWNrID0gbWF5YmVDYWxsYmFjayhjYWxsYmFjayk7XG4gIFRpLlN0cmVhbS53cml0ZSh0aUZpbGVTdHJlYW0sIGJ1ZmZlci50b1RpQnVmZmVyKCksIHdyaXRlT2JqID0+IHtcbiAgICBpZiAoIXdyaXRlT2JqLnN1Y2Nlc3MpIHtcbiAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcih3cml0ZU9iai5lcnJvcikpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNhbGxiYWNrKG51bGwsIHdyaXRlT2JqLmJ5dGVzUHJvY2Vzc2VkKTtcbiAgfSk7XG59XG4vKipcbiAqIEBwYXJhbSB7aW50ZWdlcn0gZmQgZmlsZSBkZXNjcmlwdG9yXG4gKiBAcGFyYW0ge3N0cmluZ3xCdWZmZXJ9IGJ1ZmZlciBjb250ZW50cyB0byB3cml0ZTogQnVmZmVyIG9yIHN0cmluZ1xuICogQHBhcmFtIHtpbnRlZ2VyfSBbb2Zmc2V0XSBvZmZzZXQgd2l0aGluIEJ1ZmZlciB0byB3cml0ZTsgT1Igb2Zmc2V0IGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlsZSB3aGVyZSB0aGlzIGRhdGEgc2hvdWxkIGJlIHdyaXR0ZW4gKGlmIHN0cmluZylcbiAqIEBwYXJhbSB7c3RyaW5nfGludGVnZXJ9IFtsZW5ndGhdIGxlbmd0aCBvZiBieXRlcyB0byB3cml0ZSBpZiBCdWZmZXI7IE9SIGV4cGVjdGVkIHN0cmluZyBlbmNvZGluZ1xuICogQHBhcmFtIHt3cml0ZUNhbGxiYWNrfGludGVnZXJ9IFtwb3NpdGlvbl0gb2Zmc2V0IGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlsZSB3aGVyZSB0aGlzIGRhdGEgc2hvdWxkIGJlIHdyaXR0ZW4gKGlmIEJ1ZmZlcik7IE9SIGFzeW5jIGNhbGxiYWNrIGlmIHN0cmluZ1xuICogQHBhcmFtIHt3cml0ZUNhbGxiYWNrfSBbY2FsbGJhY2tdIGFzeW5jIGNhbGxiYWNrIChpZiBCdWZmZXIpXG4gKi9cblxuXG5mcy53cml0ZSA9IChmZCwgYnVmZmVyLCBvZmZzZXQsIGxlbmd0aCwgcG9zaXRpb24sIGNhbGxiYWNrKSA9PiB7XG4gIGNvbnN0IGlzQnVmZmVyID0gQnVmZmVyLmlzQnVmZmVyKGJ1ZmZlcik7XG5cbiAgaWYgKGlzQnVmZmVyKSB7XG4gICAgd3JpdGVCdWZmZXIoZmQsIGJ1ZmZlciwgb2Zmc2V0LCBsZW5ndGgsIHBvc2l0aW9uLCBjYWxsYmFjayk7XG4gIH0gZWxzZSB7XG4gICAgd3JpdGVTdHJpbmcoZmQsIGJ1ZmZlciwgb2Zmc2V0LCBsZW5ndGgsIHBvc2l0aW9uKTtcbiAgfVxufTtcbi8qKlxuICogQHBhcmFtIHtpbnRlZ2VyfSBmZCBmaWxlIGRlc2NyaXB0b3JcbiAqIEBwYXJhbSB7c3RyaW5nfEJ1ZmZlcn0gYnVmZmVyIGNvbnRlbnRzIHRvIHdyaXRlXG4gKiBAcGFyYW0ge2ludGVnZXJ9IFtvZmZzZXRdIG9mZnNldCBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpbGUgd2hlcmUgdGhpcyBkYXRhIHNob3VsZCBiZSB3cml0dGVuXG4gKiBAcGFyYW0ge3N0cmluZ3xpbnRlZ2VyfSBbbGVuZ3RoXSAgZXhwZWN0ZWQgc3RyaW5nIGVuY29kaW5nXG4gKiBAcGFyYW0ge2ludGVnZXJ9IFtwb3NpdGlvbl0gcG9zaXRpb25cbiAqIEByZXR1cm5zIHtpbnRlZ2VyfSBudW1iZXIgb2YgYnl0ZXMgd3JpdHRlblxuICovXG5cblxuZnMud3JpdGVTeW5jID0gKGZkLCBidWZmZXIsIG9mZnNldCwgbGVuZ3RoLCBwb3NpdGlvbikgPT4ge1xuICBjb25zdCBpc0J1ZmZlciA9IEJ1ZmZlci5pc0J1ZmZlcihidWZmZXIpO1xuXG4gIGlmIChpc0J1ZmZlcikge1xuICAgIHJldHVybiB3cml0ZUJ1ZmZlclN5bmMoZmQsIGJ1ZmZlciwgb2Zmc2V0LCBsZW5ndGgpO1xuICB9XG5cbiAgcmV0dXJuIHdyaXRlU3RyaW5nU3luYyhmZCwgYnVmZmVyLCBvZmZzZXQsIGxlbmd0aCk7XG59OyAvLyBUT0RPOiBBZGQgRmlsZUhhbmRsZSBjbGFzcyB0byBtYXRjaCBOb2RlJ3Mgd3JhcHBlciBmb3IgZmlsZSBkZXNjcmlwdG9ycy4gUmUtcHVycG9zZSBvdXIgb3duIHdyYXBwZXI/XG4vLyBUT0RPOiBBZGQgdGhlIGZzLnByb21pc2VzIEFQSSFcbi8vIFRPRE86IERlZmluZSBmcy5EaXJlbnQgY2xhc3MsIHdoaWNoIGNhbiBzaW1wbHkgd3JhcCBhIFRpLkZpbGVzeXN0ZW0uRmlsZSAoYW5kIGlzIHZlcnkgc2ltaWxhciB0byBmcy5TdGF0cyEpXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFRyYWNrcyB0aGUgcGFpcmluZyBvZiB0aGUgbnVtYmVyIHdlIHVzZSB0byByZXByZXNlbnQgdGhlIGZpbGUgZXh0ZXJuYWxseSwgdGhlIGZpbGVwYXRoIGl0J3MgcG9pbnRpbmcgYXQsIGFuZCB0aGUgc3RyZWFtIHBvaW50aW5nIGF0IGl0LlxuICovXG5cblxuY2xhc3MgRmlsZURlc2NyaXB0b3Ige1xuICBjb25zdHJ1Y3RvcihudW1iZXIsIHBhdGgsIHN0cmVhbSkge1xuICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgdGhpcy5udW1iZXIgPSBudW1iZXI7XG4gICAgdGhpcy5zdHJlYW0gPSBzdHJlYW07XG4gIH1cblxufVxuLyoqXG4gKiBAcGFyYW0ge1RpLklPU3RyZWFtfSBzcmNTdHJlYW0gaW5wdXQgc3RyZWFtIHdlJ3JlIHJlYWRpbmcgZnJvbVxuICogQHBhcmFtIHtUaS5JT1N0cmVhbX0gZGVzdFN0cmVhbSBvdXRwdXQgc3RyZWFtIHdlJ3JlIHdyaXRpbmcgdG9cbiAqIEBwYXJhbSB7ZXJyb3JDYWxsYmFja30gY2FsbGJhY2sgYXN5bmMgY2FsbGJhY2tcbiAqL1xuXG5cbmZ1bmN0aW9uIHBpcGUoc3JjU3RyZWFtLCBkZXN0U3RyZWFtLCBjYWxsYmFjaykge1xuICB7XG4gICAgLy8gQW5kcm9pZCBpcyBwcm9iYWJseSBiZXR0ZXIgb2ZmIHdpdGggVGkuU3RyZWFtLndyaXRlU3RyZWFtLCBsZXNzIG92ZXJoZWFkIGJhY2sgYW5kIGZvcnRoIHRoZSBicmlkZ2VcbiAgICAvLyBUaG91Z2ggQW5kcm9pZCBkb2VzIHN1cHBvcnQgdGhlIFRpLlN0cmVhbS5wdW1wL1RpLlN0cmVhbS53cml0ZSBwYXR0ZXJuIHVzaW5nIGJvdGggQVBJcyBhc3luY1xuICAgIHBpcGVWaWFXcml0ZVN0cmVhbShzcmNTdHJlYW0sIGRlc3RTdHJlYW0sIGNhbGxiYWNrKTtcbiAgICByZXR1cm47XG4gIH0gLy8gaU9TIGhhcyBzb21lLi4uIGlzc3VlcyB3aXRoIHdyaXRlU3RyZWFtIGNhbGxpbmcgdGhlIGNhbGxiYWNrIGV2ZXJ5IGl0ZXJhdGlvbiBvZiB0aGUgbG9vcCAqYW5kKiBhdCB0aGUgZW5kXG59XG4vKipcbiAqIEBwYXJhbSB7VGkuSU9TdHJlYW19IHNyY1N0cmVhbSBpbnB1dCBzdHJlYW0gd2UncmUgcmVhZGluZyBmcm9tXG4gKiBAcGFyYW0ge1RpLklPU3RyZWFtfSBkZXN0U3RyZWFtIG91dHB1dCBzdHJlYW0gd2UncmUgd3JpdGluZyB0b1xuICogQHBhcmFtIHtlcnJvckNhbGxiYWNrfSBjYWxsYmFjayBhc3luYyBjYWxsYmFja1xuICovXG5cblxuZnVuY3Rpb24gcGlwZVZpYVdyaXRlU3RyZWFtKHNyY1N0cmVhbSwgZGVzdFN0cmVhbSwgY2FsbGJhY2spIHtcbiAgVGkuU3RyZWFtLndyaXRlU3RyZWFtKHNyY1N0cmVhbSwgZGVzdFN0cmVhbSwgQ09QWV9GSUxFX0NIVU5LX1NJWkUsIHJlc3VsdCA9PiB7XG4gICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcihyZXN1bHQuZXJyb3IpKTtcbiAgICB9IC8vIEFuZHJvaWQgd2lsbCBvbmx5IGNhbGwgdGhpcyBhdCB0aGUgZW5kIG9yIGVycm9yLCBzbyB3ZSBjYW4gc2FmZWx5IGFzc3VtZSB3ZSdyZSBkb25lIGhlcmUuXG4gICAgLy8gaU9TIHdpbGwgY2FsbCBwZXIgbG9vcCBpdGVyYXRpb24sIHNlZSBodHRwczovL2ppcmEuYXBwY2VsZXJhdG9yLm9yZy9icm93c2UvVElNT0ItMjczMjBcblxuXG4gICAgY2FsbGJhY2soKTtcbiAgfSk7XG59XG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfEJ1ZmZlcnxVUkx9IHBhdGggZmlsZSBwYXRoXG4gKiBAcGFyYW0ge1RpLkZpbGVzeXN0ZW0uRmlsZVN0cmVhbX0gZmlsZVN0cmVhbSBmaWxlIHN0cmVhbVxuICogQHJldHVybnMge2ludGVnZXJ9IGZpbGUgZGVzY3JpcHRvclxuICovXG5cblxuZnVuY3Rpb24gY3JlYXRlRmlsZURlc2NyaXB0b3IocGF0aCwgZmlsZVN0cmVhbSkge1xuICBjb25zdCBwb2ludGVyID0gZmlsZURlc2NyaXB0b3JDb3VudCsrOyAvLyBpbmNyZW1lbnQgZ2xvYmFsIGNvdW50ZXJcblxuICBjb25zdCBmZCA9IG5ldyBGaWxlRGVzY3JpcHRvcihwb2ludGVyLCBwYXRoLCBmaWxlU3RyZWFtKTtcbiAgZmlsZURlc2NyaXB0b3JzLnNldChwb2ludGVyLCBmZCk7IC8vIHVzZSBpdCB0byByZWZlciB0byB0aGlzIGZpbGUgc3RyZWFtIGFzIHRoZSBcImRlc2NyaXB0b3JcIlxuXG4gIHJldHVybiBwb2ludGVyO1xufVxuLyoqXG4gKiBAcGFyYW0ge2ludGVnZXJ9IGZkIGZpbGUgZGVzY3JpcHRvclxuICogQHJldHVybnMge1RpLkZpbGVzeXN0ZW0uRmlsZVN0cmVhbX0gbWF0Y2hpbmcgc3RyZWFtXG4gKi9cblxuXG5mdW5jdGlvbiBzdHJlYW1Gb3JEZXNjcmlwdG9yKGZkKSB7XG4gIGNvbnN0IHdyYXBwZXIgPSBmaWxlRGVzY3JpcHRvcnMuZ2V0KGZkKTtcbiAgcmV0dXJuIHdyYXBwZXIuc3RyZWFtO1xufVxuLyoqXG4gKiBAcGFyYW0ge2ludGVnZXJ9IGZkIGZpbGUgZGVzY3JpcHRvclxuICogQHJldHVybnMge3N0cmluZ30gbWF0Y2hpbmcgc3RyZWFtXG4gKi9cblxuXG5mdW5jdGlvbiBwYXRoRm9yRmlsZURlc2NyaXB0b3IoZmQpIHtcbiAgY29uc3Qgd3JhcHBlciA9IGZpbGVEZXNjcmlwdG9ycy5nZXQoZmQpO1xuICByZXR1cm4gd3JhcHBlci5wYXRoO1xufVxuLyoqXG4gKiBVc2VkIHRvIG1lcmdlIHRoZSB1c2VyLXN1cHBsaWVkIG9wdGlvbnMgd2l0aCB0aGUgZGVmYXVsdHMgZm9yIGEgZnVuY3Rpb24uIFNwZWNpYWwgY2FzZXMgYSBzdHJpbmcgdG8gYmUgZW5jb2RpbmcuXG4gKiBAcGFyYW0geyp9IG9wdGlvbnMgdXNlci1zdXBwbGllZCBvcHRpb25zXG4gKiBAcGFyYW0ge29iamVjdH0gZGVmYXVsdHMgZGVmYXVsdHMgdG8gdXNlXG4gKiBAcmV0dXJuIHtvYmplY3R9XG4gKi9cblxuXG5mdW5jdGlvbiBtZXJnZURlZmF1bHRPcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRzKSB7XG4gIGlmIChvcHRpb25zID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRzO1xuICB9XG5cbiAgY29uc3Qgb3B0aW9uc1R5cGUgPSB0eXBlb2Ygb3B0aW9ucztcblxuICBzd2l0Y2ggKG9wdGlvbnNUeXBlKSB7XG4gICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICByZXR1cm4gZGVmYXVsdHM7XG5cbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgLy8gVXNlIGNvcHkgb2YgZGVmYXVsdHMgYnV0IHdpdGggZW5jb2Rpbmcgc2V0IHRvIHRoZSAnb3B0aW9ucycgdmFsdWUhXG4gICAgICBjb25zdCBtZXJnZWQgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cyk7XG4gICAgICBtZXJnZWQuZW5jb2RpbmcgPSBvcHRpb25zO1xuICAgICAgcmV0dXJuIG1lcmdlZDtcblxuICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICByZXR1cm4gb3B0aW9ucztcblxuICAgIGRlZmF1bHQ6XG4gICAgICBhc3NlcnRBcmd1bWVudFR5cGUob3B0aW9ucywgJ29wdGlvbnMnLCAnb2JqZWN0Jyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICAvLyBzaG91bGQgbmV2ZXIgZ2V0IHJlYWNoZWRcbiAgfVxufVxuLyoqXG4gKiBFbmZvcmNlcyB0aGF0IHdlIGhhdmUgYSB2YWxpZCBjYWxsYmFjayBmdW5jdGlvbi4gVGhyb3dzIFR5cGVFcnJvciBpZiBub3QuXG4gKiBAcGFyYW0geyp9IGNiIHBvc3NpYmxlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9XG4gKi9cblxuXG5mdW5jdGlvbiBtYXliZUNhbGxiYWNrKGNiKSB7XG4gIGlmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gY2I7XG4gIH1cblxuICBjb25zdCBlcnIgPSBuZXcgVHlwZUVycm9yKGBDYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb24uIFJlY2VpdmVkICR7Y2J9YCk7XG4gIGVyci5jb2RlID0gJ0VSUl9JTlZBTElEX0NBTExCQUNLJztcbiAgdGhyb3cgZXJyO1xufVxuLyoqXG4gKiByZXR1cm5zIHJhbmRvbWx5IGdlbmVyYXRlZCBjaGFyYWN0ZXJzIG9mIGdpdmVuIGxlbmd0aCAxLTE2XG4gKiBAcGFyYW0ge2ludGVnZXJ9IGxlbmd0aCAxIC0gMTZcbiAqIEBwYXJhbSB7c3RyaW5nfSBbX2VuY29kaW5nPSd1dGY4J10gZW5jb2Rpbmcgb2YgdGhlIHN0cmluZyBnZW5lcmF0ZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cblxuXG5mdW5jdGlvbiByYW5kb21DaGFyYWN0ZXJzKGxlbmd0aCwgX2VuY29kaW5nID0gJ3V0ZjgnKSB7XG4gIC8vIEZJWE1FOiB1c2UgdGhlIGVuY29kaW5nIHNwZWNpZmllZCFcbiAgcmV0dXJuIChNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KSArICcwMDAwMDAwMDAwMDAwMDAwMCcpLnNsaWNlKDIsIGxlbmd0aCArIDIpO1xufVxuXG5mdW5jdGlvbiBtYWtlRXJyb3IoY29kZSwgbWVzc2FnZSwgZXJybm8sIHN5c2NhbGwsIHBhdGgpIHtcbiAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoYCR7Y29kZX06ICR7bWVzc2FnZX0sICR7c3lzY2FsbH0gJyR7cGF0aH0nYCk7XG4gIGVycm9yLmVycm5vID0gZXJybm87XG4gIGVycm9yLnN5c2NhbGwgPSBzeXNjYWxsO1xuICBlcnJvci5jb2RlID0gY29kZTtcbiAgZXJyb3IucGF0aCA9IHBhdGg7XG4gIHJldHVybiBlcnJvcjtcbn1cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGVuY29kaW5nIHdoYXQgd2UncmUgZW5jb2RpbmcgdG9cbiAqIEBwYXJhbSB7VGkuQnVmZmVyfSB0aUJ1ZmZlciBUaS5CdWZmZXIgaW5zdGFuY2VcbiAqIEByZXR1cm5zIHtCdWZmZXJ9IG5vZGUtY29tcGF0aWJsZSBCdWZmZXIgaW5zdGFuY2VcbiAqL1xuXG5cbmZ1bmN0aW9uIGVuY29kZUJ1ZmZlcihlbmNvZGluZywgdGlCdWZmZXIpIHtcbiAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmZyb20odGlCdWZmZXIpO1xuXG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdidWZmZXInOlxuICAgIGNhc2UgbnVsbDpcbiAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgIHJldHVybiBidWZmZXI7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGJ1ZmZlci50b1N0cmluZyhlbmNvZGluZyk7XG4gIH1cbn1cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd8QnVmZmVyfFVSTH0gcGF0aCBmaWxlIHBhdGhcbiAqIEByZXR1cm4ge1RpLkZpbGVzeXN0ZW0uRmlsZX1cbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFRpRmlsZUZyb21QYXRoTGlrZVZhbHVlKHBhdGgpIHtcbiAgLy8gVGhpcyBpcyBhIGhhY2sgdGhhdCBpcyBsaWtlbHkgdG8gd29yayBpbiBtb3N0IGNhc2VzP1xuICAvLyBCYXNpY2FsbHkgYXNzdW1lcyBCdWZmZXIgaXMgaG9sZGluZyBhIHV0Zi04IHN0cmluZyBmaWxlbmFtZS9wYXRoXG4gIC8vIE5vZGUganVzdCBjb3BpZXMgdGhlIGJ5dGVzIGZyb20gdGhlIGJ1ZmZlciBhcy1pcyBvbiB0aGUgbmF0aXZlIHNpZGUgYW5kIGFkZHMgYSBudWxsIHRlcm1pbmF0b3JcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihwYXRoKSkge1xuICAgIHBhdGggPSBwYXRoLnRvU3RyaW5nKCk7IC8vIGFzc3VtZXMgdXRmLTggc3RyaW5nXG4gIH0gLy8gRklYTUU6IEhhbmRsZSBVUkxzISBXZSBkb24ndCBoYXZlIGFuIFVSTCBzaGltIHlldCwgc28gbm8gd2F5IHRvIGhhbmRsZSB0aG9zZSB5ZXRcblxuXG4gIGFzc2VydEFyZ3VtZW50VHlwZShwYXRoLCAncGF0aCcsICdzdHJpbmcnKTtcbiAgcmV0dXJuIFRpLkZpbGVzeXN0ZW0uZ2V0RmlsZShwYXRoKTtcbn1cbi8qKlxuICogQGNhbGxiYWNrIHdyaXRlQnVmZmVyQ2FsbGJhY2tcbiAqIEBwYXJhbSB7RXJyb3J9IGVyciAtIEVycm9yIGlmIG9uZSBvY2N1cnJlZFxuICogQHBhcmFtIHtpbnRlZ2VyfSB3cml0dGVuIC0gYnl0ZXMgd3JpdHRlblxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlciAtIG9yaWdpbmFsIEJ1ZmZlciBiZWluZyB3cml0dGVuXG4gKi9cblxuLyoqXG4gKiBAcGFyYW0ge2ludGVnZXJ9IGZkIGZpbGUgZGVzY3JpcHRvclxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlciBjb250ZW50cyB0byB3cml0ZVxuICogQHBhcmFtIHtpbnRlZ2VyfSBbb2Zmc2V0XSBvZmZzZXQgd2l0aGluIEJ1ZmZlciB0byB3cml0ZVxuICogQHBhcmFtIHtpbnRlZ2VyfSBbbGVuZ3RoXSBsZW5ndGggb2YgYnl0ZXMgdG8gd3JpdGUgaWYgQnVmZmVyXG4gKiBAcGFyYW0ge2ludGVnZXJ9IFtwb3NpdGlvbl0gb2Zmc2V0IGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlsZSB3aGVyZSB0aGlzIGRhdGEgc2hvdWxkIGJlIHdyaXR0ZW5cbiAqIEBwYXJhbSB7d3JpdGVCdWZmZXJDYWxsYmFja30gY2FsbGJhY2sgYXN5bmMgY2FsbGJhY2tcbiAqL1xuXG5cbmZ1bmN0aW9uIHdyaXRlQnVmZmVyKGZkLCBidWZmZXIsIG9mZnNldCwgbGVuZ3RoLCBwb3NpdGlvbiwgY2FsbGJhY2spIHtcbiAgY2FsbGJhY2sgPSBtYXliZUNhbGxiYWNrKGNhbGxiYWNrIHx8IHBvc2l0aW9uIHx8IGxlbmd0aCB8fCBvZmZzZXQpO1xuXG4gIGlmICh0eXBlb2Ygb2Zmc2V0ICE9PSAnbnVtYmVyJykge1xuICAgIG9mZnNldCA9IDA7XG4gIH1cblxuICBpZiAodHlwZW9mIGxlbmd0aCAhPT0gJ251bWJlcicpIHtcbiAgICBsZW5ndGggPSBidWZmZXIubGVuZ3RoIC0gb2Zmc2V0O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBwb3NpdGlvbiAhPT0gJ251bWJlcicpIHtcbiAgICBwb3NpdGlvbiA9IG51bGw7XG4gIH0gLy8gb2sgbm93IHdoYXQ/XG5cblxuICBjb25zdCB0aUZpbGVTdHJlYW0gPSBzdHJlYW1Gb3JEZXNjcmlwdG9yKGZkKTsgLy8gTWFrZSB1c2Ugb2YgdGhlIGJ1ZmZlciBzbGljZSB0aGF0J3Mgc3BlY2lmaWVkIGJ5IG9mZnNldC9sZW5ndGhcblxuICBpZiAob2Zmc2V0ICE9PSAwIHx8IGxlbmd0aCAhPT0gYnVmZmVyLmxlbmd0aCkge1xuICAgIGJ1ZmZlciA9IGJ1ZmZlci5zbGljZShvZmZzZXQsIGxlbmd0aCk7XG4gIH0gLy8gVE9ETzogU3VwcG9ydCB1c2Ugb2YgcG9zaXRpb24gYXJndW1lbnQuIEkgYXNzdW1lIHdlJ2QgbmVlZCBhIHdheSB0byBhZGQgYSBtZXRob2QgdG8gbW92ZSB0byBzdHJlYW0gcG9zaXRpb24gc29tZWhvd1xuXG5cbiAgd3JpdGVUaUZpbGVTdHJlYW0odGlGaWxlU3RyZWFtLCBidWZmZXIsIChlcnIsIGJ5dGVzUHJvY2Vzc2VkKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjYWxsYmFjayhudWxsLCBieXRlc1Byb2Nlc3NlZCwgYnVmZmVyKTtcbiAgfSk7XG59XG4vKipcbiAqIEBwYXJhbSB7aW50ZWdlcn0gZmQgZmlsZSBkZXNjcmlwdG9yXG4gKiBAcGFyYW0ge0J1ZmZlcn0gYnVmZmVyIGNvbnRlbnRzIHRvIHdyaXRlXG4gKiBAcGFyYW0ge2ludGVnZXJ9IFtvZmZzZXRdIG9mZnNldCB3aXRoaW4gQnVmZmVyIHRvIHdyaXRlXG4gKiBAcGFyYW0ge2ludGVnZXJ9IFtsZW5ndGhdIGxlbmd0aCBvZiBieXRlcyB0byB3cml0ZSBpZiBCdWZmZXJcbiAqIEBwYXJhbSB7aW50ZWdlcn0gW3Bvc2l0aW9uXSBvZmZzZXQgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaWxlIHdoZXJlIHRoaXMgZGF0YSBzaG91bGQgYmUgd3JpdHRlblxuICogQHJldHVybnMge2ludGVnZXJ9IG51bWJlciBvZiBieXRlcyB3cml0dGVuXG4gKi9cblxuXG5mdW5jdGlvbiB3cml0ZUJ1ZmZlclN5bmMoZmQsIGJ1ZmZlciwgb2Zmc2V0LCBsZW5ndGgsIHBvc2l0aW9uKSB7XG4gIGlmICh0eXBlb2Ygb2Zmc2V0ICE9PSAnbnVtYmVyJykge1xuICAgIG9mZnNldCA9IDA7XG4gIH1cblxuICBpZiAodHlwZW9mIGxlbmd0aCAhPT0gJ251bWJlcicpIHtcbiAgICBsZW5ndGggPSBidWZmZXIubGVuZ3RoIC0gb2Zmc2V0O1xuICB9XG5cblxuICBjb25zdCB0aUZpbGVTdHJlYW0gPSBzdHJlYW1Gb3JEZXNjcmlwdG9yKGZkKTsgLy8gTWFrZSB1c2Ugb2YgdGhlIGJ1ZmZlciBzbGljZSB0aGF0J3Mgc3BlY2lmaWVkIGJ5IG9mZnNldC9sZW5ndGhcblxuICBpZiAob2Zmc2V0ICE9PSAwIHx8IGxlbmd0aCAhPT0gYnVmZmVyLmxlbmd0aCkge1xuICAgIGJ1ZmZlciA9IGJ1ZmZlci5zbGljZShvZmZzZXQsIGxlbmd0aCk7XG4gIH0gLy8gVE9ETzogU3VwcG9ydCB1c2Ugb2YgcG9zaXRpb24gYXJndW1lbnQuIEkgYXNzdW1lIHdlJ2QgbmVlZCBhIHdheSB0byBhZGQgYSBtZXRob2QgdG8gbW92ZSB0byBzdHJlYW0gcG9zaXRpb24gc29tZWhvd1xuXG5cbiAgcmV0dXJuIHRpRmlsZVN0cmVhbS53cml0ZShidWZmZXIudG9UaUJ1ZmZlcigpKTtcbn1cbi8qKlxuICogQGNhbGxiYWNrIHdyaXRlU3RyaW5nQ2FsbGJhY2tcbiAqIEBwYXJhbSB7RXJyb3J9IGVyciAtIEVycm9yIGlmIG9uZSBvY2N1cnJlZFxuICogQHBhcmFtIHtpbnRlZ2VyfSB3cml0dGVuIC0gYnl0ZXMgd3JpdHRlblxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyAtIG9yaWdpbmFsIHN0cmluZyBiZWluZyB3cml0dGVuXG4gKi9cblxuLyoqXG4gKiBAcGFyYW0ge2ludGVnZXJ9IGZkIGZpbGUgZGVzY3JpcHRvclxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBjb250ZW50cyB0byB3cml0ZVxuICogQHBhcmFtIHtpbnRlZ2VyfSBbcG9zaXRpb25dIG9mZnNldCBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpbGUgd2hlcmUgdGhpcyBkYXRhIHNob3VsZCBiZSB3cml0dGVuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2VuY29kaW5nPSd1dGY4J10gZXhwZWN0ZWQgc3RyaW5nIGVuY29kaW5nXG4gKiBAcGFyYW0ge3dyaXRlU3RyaW5nQ2FsbGJhY2t9IFtjYWxsYmFja10gYXN5bmMgY2FsbGJhY2tcbiAqL1xuXG5cbmZ1bmN0aW9uIHdyaXRlU3RyaW5nKGZkLCBzdHJpbmcsIHBvc2l0aW9uLCBlbmNvZGluZywgY2FsbGJhY2spIHtcbiAgY2FsbGJhY2sgPSBtYXliZUNhbGxiYWNrKGNhbGxiYWNrIHx8IGVuY29kaW5nIHx8IHBvc2l0aW9uKTsgLy8gcG9zaXRpb24gY291bGQgYmU6IG51bWJlciwgZnVuY3Rpb24gKGNhbGxiYWNrKVxuXG4gIGlmICh0eXBlb2YgcG9zaXRpb24gIT09ICdudW1iZXInKSB7XG4gICAgcG9zaXRpb24gPSBudWxsO1xuICB9IC8vIGVuY29kaW5nIGNvdWxkIGJlOiBmdW5jdGlvbiAoY2FsbGJhY2spIG9yIHN0cmluZ1xuXG5cbiAgaWYgKHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4JztcbiAgfVxuXG4gIGNvbnN0IHRpRmlsZVN0cmVhbSA9IHN0cmVhbUZvckRlc2NyaXB0b3IoZmQpO1xuICBzdHJpbmcgKz0gJyc7IC8vIGNvZXJjZSB0byBzdHJpbmdcblxuICBjb25zdCBidWZmZXIgPSBCdWZmZXIuZnJvbShzdHJpbmcsIGVuY29kaW5nKTsgLy8gVE9ETzogU3VwcG9ydCB1c2Ugb2YgcG9zaXRpb24gYXJndW1lbnQuIEkgYXNzdW1lIHdlJ2QgbmVlZCBhIHdheSB0byBhZGQgYSBtZXRob2QgdG8gbW92ZSB0byBzdHJlYW0gcG9zaXRpb24gc29tZWhvd1xuXG4gIHdyaXRlVGlGaWxlU3RyZWFtKHRpRmlsZVN0cmVhbSwgYnVmZmVyLCAoZXJyLCBieXRlc1Byb2Nlc3NlZCkgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY2FsbGJhY2sobnVsbCwgYnl0ZXNQcm9jZXNzZWQsIHN0cmluZyk7XG4gIH0pO1xufVxuLyoqXG4gKiBAcGFyYW0ge2ludGVnZXJ9IGZkIGZpbGUgZGVzY3JpcHRvclxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBjb250ZW50cyB0byB3cml0ZVxuICogQHBhcmFtIHtpbnRlZ2VyfSBbcG9zaXRpb25dIG9mZnNldCBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpbGUgd2hlcmUgdGhpcyBkYXRhIHNob3VsZCBiZSB3cml0dGVuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2VuY29kaW5nPSd1dGY4J10gZXhwZWN0ZWQgc3RyaW5nIGVuY29kaW5nXG4gKiBAcmV0dXJucyB7aW50ZWdlcn0gbnVtYmVyIG9mIGJ5dGVzIHdyaXR0ZW5cbiAqL1xuXG5cbmZ1bmN0aW9uIHdyaXRlU3RyaW5nU3luYyhmZCwgc3RyaW5nLCBwb3NpdGlvbiwgZW5jb2RpbmcpIHtcblxuICBpZiAodHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnO1xuICB9XG5cbiAgY29uc3QgdGlGaWxlU3RyZWFtID0gc3RyZWFtRm9yRGVzY3JpcHRvcihmZCk7XG4gIHN0cmluZyArPSAnJzsgLy8gY29lcmNlIHRvIHN0cmluZ1xuXG4gIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5mcm9tKHN0cmluZywgZW5jb2RpbmcpOyAvLyBUT0RPOiBTdXBwb3J0IHVzZSBvZiBwb3NpdGlvbiBhcmd1bWVudC4gSSBhc3N1bWUgd2UnZCBuZWVkIGEgd2F5IHRvIGFkZCBhIG1ldGhvZCB0byBtb3ZlIHRvIHN0cmVhbSBwb3NpdGlvbiBzb21laG93XG5cbiAgcmV0dXJuIHRpRmlsZVN0cmVhbS53cml0ZShidWZmZXIudG9UaUJ1ZmZlcigpKTtcbn1cblxuLyoqXG4gKiBUaGlzIGZpbGUgaXMgdXNlZCB0byBoaWphY2sgdGhlIHN0YW5kYXJkIHJlcXVpcmUgdG8gYWxsb3cgZm9yIEpTXG4gKiBpbXBsZW1lbnRhdGlvbnMgb2YgXCJjb3JlXCIgbW9kdWxlcy5cbiAqXG4gKiBZb3UgYWRkIGEgYmluZGluZyBmcm9tIHRoZSBcImNvcmVcIiBtb2R1bGUgaWQgdG8gdGhlIHVuZGVyIHRoZSBob29kIEpTXG4gKiBpbXBsZW1lbnRhdGlvbi4gV2UgdGhlbiBpbnRlcmNlcHQgcmVxdWlyZSBjYWxscyB0byBoYW5kbGUgcmVxdWVzdHMgZm9yIHRoZXNlIG1vZHVsZXNcbiAqIGFuZCBsYXppbHkgbG9hZCB0aGUgZmlsZS5cbiAqL1xuXG4vKipcbiAqIFVzZWQgYnkgQGZ1bmN0aW9uIGJpbmRPYmplY3RUb0NvcmVNb2R1bGVJZFxuICogQHR5cGUge21hcDxzdHJpbmcsIG9iamVjdD59XG4gKi9cbmNvbnN0IGJpbmRpbmdzID0gbmV3IE1hcCgpO1xuLyoqXG4gKiBVc2VkIGJ5IEBmdW5jdGlvbiByZWRpcmVjdENvcmVNb2R1bGVJZFRvUGF0aFxuICogQHR5cGUge21hcDxzdHJpbmcsIHN0cmluZz59XG4gKi9cblxuY29uc3QgcmVkaXJlY3RzID0gbmV3IE1hcCgpO1xuLyoqXG4gKiBEb2VzIHRoZSByZXF1ZXN0IGxvb2sgbGlrZSBhIHR5cGljYWwgY29yZSBtb2R1bGU/IChubyAnLicgb3IgJy8nIGNoYXJhY3RlcnMpXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBvcmlnaW5hbCByZXF1aXJlIHBhdGgvaWRcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGlzSGlqYWNrYWJsZU1vZHVsZUlkKHBhdGgpIHtcbiAgaWYgKCFwYXRoIHx8IHBhdGgubGVuZ3RoIDwgMSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IGZpcnN0Q2hhciA9IHBhdGguY2hhckF0KDApO1xuICByZXR1cm4gZmlyc3RDaGFyICE9PSAnLicgJiYgZmlyc3RDaGFyICE9PSAnLyc7XG59IC8vIEhhY2sgcmVxdWlyZSB0byBwb2ludCB0byB0aGlzIGFzIGEgY29yZSBtb2R1bGUgXCJiaW5kaW5nXCJcblxuXG5jb25zdCBvcmlnaW5hbFJlcXVpcmUgPSBnbG9iYWwucmVxdWlyZTsgLy8gVGhpcyB3b3JrcyBmb3IgaU9TIGFzLWlzLCBhbmQgYWxzbyBpbnRlcmNlcHRzIHRoZSBjYWxsIG9uIEFuZHJvaWQgZm9yIHRpLm1haW4uanMgKHRoZSBmaXJzdCBmaWxlIGV4ZWN1dGVkKVxuXG5nbG9iYWwucmVxdWlyZSA9IGZ1bmN0aW9uIChtb2R1bGVJZCkge1xuICBpZiAoYmluZGluZ3MuaGFzKG1vZHVsZUlkKSkge1xuICAgIHJldHVybiBiaW5kaW5ncy5nZXQobW9kdWxlSWQpO1xuICB9XG5cbiAgaWYgKHJlZGlyZWN0cy5oYXMobW9kdWxlSWQpKSB7XG4gICAgbW9kdWxlSWQgPSByZWRpcmVjdHMuZ2V0KG1vZHVsZUlkKTtcbiAgfVxuXG4gIHJldHVybiBvcmlnaW5hbFJlcXVpcmUobW9kdWxlSWQpO1xufTtcblxue1xuICAvLyAuLi4gYnV0IHdlIHN0aWxsIG5lZWQgdG8gaGFjayBpdCB3aGVuIHJlcXVpcmluZyBmcm9tIG90aGVyIGZpbGVzIGZvciBBbmRyb2lkXG4gIGNvbnN0IG9yaWdpbmFsTW9kdWxlUmVxdWlyZSA9IGdsb2JhbC5Nb2R1bGUucHJvdG90eXBlLnJlcXVpcmU7XG5cbiAgZ2xvYmFsLk1vZHVsZS5wcm90b3R5cGUucmVxdWlyZSA9IGZ1bmN0aW9uIChwYXRoLCBjb250ZXh0KSB7XG4gICAgaWYgKGJpbmRpbmdzLmhhcyhwYXRoKSkge1xuICAgICAgcmV0dXJuIGJpbmRpbmdzLmdldChwYXRoKTtcbiAgICB9XG5cbiAgICBpZiAocmVkaXJlY3RzLmhhcyhwYXRoKSkge1xuICAgICAgcGF0aCA9IHJlZGlyZWN0cy5nZXQocGF0aCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9yaWdpbmFsTW9kdWxlUmVxdWlyZS5jYWxsKHRoaXMsIHBhdGgsIGNvbnRleHQpO1xuICB9O1xufVxuLyoqXG4gKiBSZWdpc3RlcnMgYSBiaW5kaW5nIGZyb20gYSBzaG9ydCBtb2R1bGUgaWQgdG8gYW4gYWxyZWFkeSBsb2FkZWQvY29uc3RydWN0ZWQgb2JqZWN0L3ZhbHVlIHRvIGV4cG9ydCBmb3IgdGhhdCBjb3JlIG1vZHVsZSBpZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtb2R1bGVJZCB0aGUgbW9kdWxlIGlkIHRvIFwiaGlqYWNrXCJcbiAqIEBwYXJhbSB7Kn0gYmluZGluZyBhbiBhbHJlYWR5IGNvbnN0cnVjdHVyZWQgdmFsdWUvb2JqZWN0IHRvIHJldHVyblxuICovXG5cblxuZnVuY3Rpb24gcmVnaXN0ZXIobW9kdWxlSWQsIGJpbmRpbmcpIHtcbiAgaWYgKCFpc0hpamFja2FibGVNb2R1bGVJZChtb2R1bGVJZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCByZWdpc3RlciBmb3IgcmVsYXRpdmUvYWJzb2x1dGUgZmlsZSBwYXRoczsgbm8gbGVhZGluZyAnLicgb3IgJy8nIGFsbG93ZWQgKHdhcyBnaXZlbiAke21vZHVsZUlkfSlgKTtcbiAgfVxuXG4gIGlmIChyZWRpcmVjdHMuaGFzKG1vZHVsZUlkKSkge1xuICAgIFRpLkFQSS53YXJuKGBBbm90aGVyIGJpbmRpbmcgaGFzIGFscmVhZHkgcmVnaXN0ZXJlZCBmb3IgbW9kdWxlIGlkOiAnJHttb2R1bGVJZH0nLCBpdCB3aWxsIGJlIG92ZXJ3cml0dGVuLi4uYCk7XG4gICAgcmVkaXJlY3RzLmRlbGV0ZShtb2R1bGVJZCk7XG4gIH0gZWxzZSBpZiAoYmluZGluZ3MuaGFzKG1vZHVsZUlkKSkge1xuICAgIFRpLkFQSS53YXJuKGBBbm90aGVyIGJpbmRpbmcgaGFzIGFscmVhZHkgcmVnaXN0ZXJlZCBmb3IgbW9kdWxlIGlkOiAnJHttb2R1bGVJZH0nLCBpdCB3aWxsIGJlIG92ZXJ3cml0dGVuLi4uYCk7XG4gIH1cblxuICBiaW5kaW5ncy5zZXQobW9kdWxlSWQsIGJpbmRpbmcpO1xufVxuLyoqXG4gKiBSZWdpc3RlcnMgYSBiaW5kaW5nIGZyb20gYSBzaG9ydCBtb2R1bGUgaWQgdG8gdGhlIGZ1bGwgdW5kZXIgdGhlIGhvb2QgZmlsZXBhdGggaWYgZ2l2ZW4gYSBzdHJpbmcuXG4gKiBUaGlzIGFsbG93cyBmb3IgbGF6eSBpbnN0YW50aWF0aW9uIG9mIHRoZSBtb2R1bGUgb24tZGVtYW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1vZHVsZUlkIHRoZSBtb2R1bGUgaWQgdG8gXCJoaWphY2tcIlxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVwYXRoIHRoZSBmdWxsIGZpbGVwYXRoIHRvIHJlcXVpcmUgdW5kZXIgdGhlIGhvb2QuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRoaXMgc2hvdWxkIGJlIGFuIGFscmVhZHkgcmVzb2x2ZWQgYWJzb2x1dGUgcGF0aCxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgb3RoZXJ3aXNlIHRoZSBjb250ZXh0IG9mIHRoZSBjYWxsIGNvdWxkIGNoYW5nZSB3aGF0IGdldHMgbG9hZGVkIVxuICovXG5cbmZ1bmN0aW9uIHJlZGlyZWN0KG1vZHVsZUlkLCBmaWxlcGF0aCkge1xuICBpZiAoIWlzSGlqYWNrYWJsZU1vZHVsZUlkKG1vZHVsZUlkKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHJlZ2lzdGVyIGZvciByZWxhdGl2ZS9hYnNvbHV0ZSBmaWxlIHBhdGhzOyBubyBsZWFkaW5nICcuJyBvciAnLycgYWxsb3dlZCAod2FzIGdpdmVuICR7bW9kdWxlSWR9KWApO1xuICB9XG5cbiAgaWYgKGJpbmRpbmdzLmhhcyhtb2R1bGVJZCkpIHtcbiAgICBUaS5BUEkud2FybihgQW5vdGhlciBiaW5kaW5nIGhhcyBhbHJlYWR5IHJlZ2lzdGVyZWQgZm9yIG1vZHVsZSBpZDogJyR7bW9kdWxlSWR9JywgaXQgd2lsbCBiZSBvdmVyd3JpdHRlbi4uLmApO1xuICAgIGJpbmRpbmdzLmRlbGV0ZShtb2R1bGVJZCk7XG4gIH0gZWxzZSBpZiAocmVkaXJlY3RzLmhhcyhtb2R1bGVJZCkpIHtcbiAgICBUaS5BUEkud2FybihgQW5vdGhlciBiaW5kaW5nIGhhcyBhbHJlYWR5IHJlZ2lzdGVyZWQgZm9yIG1vZHVsZSBpZDogJyR7bW9kdWxlSWR9JywgaXQgd2lsbCBiZSBvdmVyd3JpdHRlbi4uLmApO1xuICB9XG5cbiAgcmVkaXJlY3RzLnNldChtb2R1bGVJZCwgZmlsZXBhdGgpO1xufVxuY29uc3QgYmluZGluZyA9IHtcbiAgcmVnaXN0ZXIsXG4gIHJlZGlyZWN0XG59O1xuZ2xvYmFsLmJpbmRpbmcgPSBiaW5kaW5nO1xuXG4vLyBMb2FkIGFsbCB0aGUgbm9kZSBjb21wYXRpYmxlIGNvcmUgbW9kdWxlc1xucmVnaXN0ZXIoJ3BhdGgnLCBwYXRoKTtcbnJlZ2lzdGVyKCdvcycsIE9TKTtcbnJlZ2lzdGVyKCd0dHknLCB0dHkpO1xucmVnaXN0ZXIoJ3V0aWwnLCB1dGlsKTtcbnJlZ2lzdGVyKCdhc3NlcnQnLCBhc3NlcnQkMSk7XG5yZWdpc3RlcignZXZlbnRzJywgRXZlbnRFbWl0dGVyKTtcbnJlZ2lzdGVyKCdidWZmZXInLCBCdWZmZXJNb2R1bGUpO1xucmVnaXN0ZXIoJ3N0cmluZ19kZWNvZGVyJywgU3RyaW5nRGVjb2RlciQxKTtcbnJlZ2lzdGVyKCdmcycsIGZzKTsgLy8gUmVnaXN0ZXIgcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyIGFzIGdsb2JhbFxuXG5nbG9iYWwuQnVmZmVyID0gQnVmZmVyTW9kdWxlLkJ1ZmZlcjtcblxuLyoqXG4gKiBBcHBjZWxlcmF0b3IgVGl0YW5pdW0gTW9iaWxlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTggYnkgQXh3YXksIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgQXBhY2hlIFB1YmxpYyBMaWNlbnNlXG4gKiBQbGVhc2Ugc2VlIHRoZSBMSUNFTlNFIGluY2x1ZGVkIHdpdGggdGhpcyBkaXN0cmlidXRpb24gZm9yIGRldGFpbHMuXG4gKlxuICogRGVzY3JpcHRpb246XG4gKiBUaGlzIHNjcmlwdCBsb2FkcyBhbGwgSmF2YVNjcmlwdCBmaWxlcyBlbmRpbmcgd2l0aCB0aGUgbmFtZSBcIiouYm9vdHN0cmFwLmpzXCIgYW5kIHRoZW4gZXhlY3V0ZXMgdGhlbS5cbiAqIFRoZSBtYWluIGludGVudGlvbiBvZiB0aGlzIGZlYXR1cmUgaXMgdG8gYWxsb3cgSmF2YVNjcmlwdCBmaWxlcyB0byBraWNrLW9mZiBmdW5jdGlvbmFsaXR5IG9yXG4gKiBkaXNwbGF5IFVJIHRvIHRoZSBlbmQtdXNlciBiZWZvcmUgdGhlIFwiYXBwLmpzXCIgZ2V0cyBsb2FkZWQuIFRoaXMgZmVhdHVyZSBpcyB0aGUgQ29tbW9uSlNcbiAqIGVxdWl2YWxlbnQgdG8gVGl0YW5pdW0ncyBBbmRyb2lkIG1vZHVsZSBvbkFwcENyZWF0ZSgpIG9yIGlPUyBtb2R1bGUgbG9hZCgpIGZlYXR1cmVzLlxuICpcbiAqIFVzZS1DYXNlczpcbiAqIC0gQXV0b21hdGljYWxseSBraWNrLW9mZiBhbmFseXRpY3MgZnVuY3Rpb25hbGl0eSBvbiBhcHAgc3RhcnR1cC5cbiAqIC0gRW5zdXJlIFwiR29vZ2xlIFBsYXkgU2VydmljZXNcIiBpcyBpbnN0YWxsZWQvdXBkYXRlZCBvbiBhcHAgc3RhcnR1cCBvbiBBbmRyb2lkLlxuICovXG5cbi8qKlxuICogQXR0ZW1wdHMgdG8gbG9hZCBhbGwgYm9vdHN0cmFwcyBmcm9tIGEgXCJib290c3RyYXAuanNvblwiIGZpbGUgY3JlYXRlZCBieSB0aGUgYXBwIGJ1aWxkIHN5c3RlbS5cbiAqIFRoaXMgaXMgYW4gb3B0aW9uYWwgZmVhdHVyZSBhbmQgaXMgdGhlIGZhc3Rlc3QgbWV0aG9kIG9mIGFjcXVpcmluZyBib29zdHJhcHMgY29uZmlndXJlZCBmb3IgdGhlIGFwcC5cbiAqIFRoaXMgSlNPTiBmaWxlLCBpZiBwcm92aWRlZCwgbXVzdCBiZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkgYXMgdGhpcyBzY3JpcHQuXG4gKiBAcmV0dXJucyB7c3RyaW5nW119XG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIHJlcXVpcmUoKSBjb21wYXRpYmxlIHN0cmluZ3MgaWYgYm9vdHN0cmFwcyB3ZXJlIHN1Y2Nlc3NmdWxseSBsb2FkZWQgZnJvbSBKU09OLlxuICogUmV0dXJucyBhbiBlbXB0eSBhcnJheSBpZiBKU09OIGZpbGUgd2FzIGZvdW5kLCBidXQgbm8gYm9vdHN0cmFwcyB3ZXJlIGNvbmZpZ3VyZWQgZm9yIHRoZSBhcHAuXG4gKiBSZXR1cm5zIG51bGwgaWYgSlNPTiBmaWxlIHdhcyBub3QgZm91bmQuXG4gKi9cbmZ1bmN0aW9uIGZldGNoU2NyaXB0c0Zyb21Kc29uKCkge1xuICBjb25zdCBKU09OX0ZJTEVfTkFNRSA9ICdib290c3RyYXAuanNvbic7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBqc29uRmlsZSA9IFRpLkZpbGVzeXN0ZW0uZ2V0RmlsZShUaS5GaWxlc3lzdGVtLnJlc291cmNlc0RpcmVjdG9yeSwgYHRpLmludGVybmFsLyR7SlNPTl9GSUxFX05BTUV9YCk7XG5cbiAgICBpZiAoanNvbkZpbGUuZXhpc3RzKCkpIHtcbiAgICAgIGNvbnN0IHNldHRpbmdzID0gSlNPTi5wYXJzZShqc29uRmlsZS5yZWFkKCkudGV4dCk7XG5cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHNldHRpbmdzLnNjcmlwdHMpKSB7XG4gICAgICAgIHJldHVybiBzZXR0aW5ncy5zY3JpcHRzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIFRpLkFQSS5lcnJvcihgRmFpbGVkIHRvIHJlYWQgXCIke0pTT05fRklMRV9OQU1FfVwiLiBSZWFzb246ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuLyoqXG4gKiBSZWN1cnNpdmVseSBzZWFyY2hlcyB0aGUgXCJSZXNvdXJjZXNcIiBkaXJlY3RvcnkgZm9yIGFsbCBcIiouYm9vdHN0cmFwLmpzXCIgZmlsZXMuXG4gKiBAcmV0dXJucyB7QXJyYXkuPHN0cmluZz59XG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIHJlcXVpcmUoKSBjb21wYXRpYmxlIHN0cmluZ3MgZm9yIGVhY2ggYm9vdHN0cmFwIGZvdW5kIGluIHRoZSBzZWFyY2guXG4gKiBSZXR1cm5zIGFuIGVtcHR5IGFycmF5IGlmIG5vIGJvb3RzdHJhcCBmaWxlcyB3ZXJlIGZvdW5kLlxuICovXG5cblxuZnVuY3Rpb24gZmV0Y2hTY3JpcHRzRnJvbVJlc291cmNlc0RpcmVjdG9yeSgpIHtcbiAgY29uc3QgcmVzb3VyY2VEaXJlY3RvcnkgPSBUaS5GaWxlc3lzdGVtLmdldEZpbGUoVGkuRmlsZXN5c3RlbS5yZXNvdXJjZXNEaXJlY3RvcnkpO1xuICBjb25zdCByZXNvdXJjZURpcmVjdG9yeVBhdGhMZW5ndGggPSByZXNvdXJjZURpcmVjdG9yeS5uYXRpdmVQYXRoLmxlbmd0aDtcbiAgY29uc3QgYm9vdHN0cmFwU2NyaXB0cyA9IFtdO1xuXG4gIGZ1bmN0aW9uIGxvYWRGcm9tKGZpbGUpIHtcbiAgICBpZiAoZmlsZSkge1xuICAgICAgaWYgKGZpbGUuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAvLyBUaGlzIGlzIGEgZGlyZWN0b3J5LiBSZWN1cnNpdmVseSBsb29rIGZvciBib290c3RyYXAgZmlsZXMgdW5kZXIgaXQuXG4gICAgICAgIGNvbnN0IGZpbGVOYW1lQXJyYXkgPSBmaWxlLmdldERpcmVjdG9yeUxpc3RpbmcoKTtcblxuICAgICAgICBpZiAoZmlsZU5hbWVBcnJheSkge1xuICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBmaWxlTmFtZUFycmF5Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgbG9hZEZyb20oVGkuRmlsZXN5c3RlbS5nZXRGaWxlKGZpbGUubmF0aXZlUGF0aCwgZmlsZU5hbWVBcnJheVtpbmRleF0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZmlsZS5uYW1lLnNlYXJjaCgvLmJvb3RzdHJhcC5qcyQvKSA+PSAwKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgYSBib290c3RyYXAgZmlsZS5cbiAgICAgICAgLy8gQ29udmVydCBpdHMgcGF0aCB0byBzb21ldGhpbmcgbG9hZGFibGUgdmlhIHJlcXVpcmUoKSBhbmQgYWRkIGl0IHRvIHRoZSBhcnJheS5cbiAgICAgICAgbGV0IGJvb3RzdHJhcFBhdGggPSBmaWxlLm5hdGl2ZVBhdGg7XG4gICAgICAgIGJvb3RzdHJhcFBhdGggPSBib290c3RyYXBQYXRoLnN1YnN0cihyZXNvdXJjZURpcmVjdG9yeVBhdGhMZW5ndGgsIGJvb3RzdHJhcFBhdGgubGVuZ3RoIC0gcmVzb3VyY2VEaXJlY3RvcnlQYXRoTGVuZ3RoIC0gJy5qcycubGVuZ3RoKTtcbiAgICAgICAgYm9vdHN0cmFwU2NyaXB0cy5wdXNoKGJvb3RzdHJhcFBhdGgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGxvYWRGcm9tKHJlc291cmNlRGlyZWN0b3J5KTtcbiAgcmV0dXJuIGJvb3RzdHJhcFNjcmlwdHM7XG59XG4vKipcbiAqIE5vbi1ibG9ja2luZyBmdW5jdGlvbiB3aGljaCBsb2FkcyBhbmQgZXhlY3V0ZXMgYWxsIGJvb3RzdHJhcCBzY3JpcHRzIGNvbmZpZ3VyZWQgZm9yIHRoZSBhcHAuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmaW5pc2hlZCBDYWxsYmFjayB0byBiZSBpbnZva2VkIG9uY2UgYWxsIGJvb3RzdHJhcHMgaGF2ZSBmaW5pc2hlZCBleGVjdXRpbmcuIENhbm5vdCBiZSBudWxsLlxuICovXG5cblxuZnVuY3Rpb24gbG9hZEFzeW5jKGZpbmlzaGVkKSB7XG4gIC8vIEFjcXVpcmUgYW4gYXJyYXkgb2YgYWxsIGJvb3RzdHJhcCBzY3JpcHRzIGluY2x1ZGVkIHdpdGggdGhlIGFwcC5cbiAgLy8gLSBGb3IgYmVzdCBwZXJmb3JtYW5jZSwgYXR0ZW1wdCB0byBmZXRjaCBzY3JpcHRzIHZpYSBhbiBvcHRpb25hbCBKU09OIGZpbGUgY3JlYXRlZCBieSB0aGUgYnVpbGQgc3lzdGVtLlxuICAvLyAtIElmIEpTT04gZmlsZSBub3QgZm91bmQgKHdpbGwgcmV0dXJuIG51bGwpLCB0aGVuIHNlYXJjaCBcIlJlc291cmNlc1wiIGRpcmVjdG9yeSBmb3IgYm9vdHN0cmFwIGZpbGVzLlxuICBsZXQgYm9vdHN0cmFwU2NyaXB0cyA9IGZldGNoU2NyaXB0c0Zyb21Kc29uKCk7XG5cbiAgaWYgKCFib290c3RyYXBTY3JpcHRzKSB7XG4gICAgYm9vdHN0cmFwU2NyaXB0cyA9IGZldGNoU2NyaXB0c0Zyb21SZXNvdXJjZXNEaXJlY3RvcnkoKTtcbiAgfSAvLyBEbyBub3QgY29udGludWUgaWYgbm8gYm9vdHN0cmFwcyB3ZXJlIGZvdW5kLlxuXG5cbiAgaWYgKCFib290c3RyYXBTY3JpcHRzIHx8IGJvb3RzdHJhcFNjcmlwdHMubGVuZ3RoIDw9IDApIHtcbiAgICBmaW5pc2hlZCgpO1xuICAgIHJldHVybjtcbiAgfSAvLyBTb3J0IHRoZSBib290c3RyYXBzIHNvIHRoYXQgdGhleSdsbCBiZSBsb2FkZWQgaW4gYSBjb25zaXN0ZW50IG9yZGVyIGJldHdlZW4gcGxhdGZvcm1zLlxuXG5cbiAgYm9vdHN0cmFwU2NyaXB0cy5zb3J0KCk7IC8vIExvYWRzIGFsbCBib290c3RyYXAgc2NyaXB0cyBmb3VuZC5cblxuICBmdW5jdGlvbiBsb2FkQm9vdHN0cmFwU2NyaXB0cyhmaW5pc2hlZCkge1xuICAgIGxldCBib290c3RyYXBJbmRleCA9IDA7XG5cbiAgICBmdW5jdGlvbiBkb0xvYWQoKSB7XG4gICAgICAvLyBBdHRlbXB0IHRvIGxvYWQgYWxsIGJvb3RzdHJhcCBzY3JpcHRzLlxuICAgICAgd2hpbGUgKGJvb3RzdHJhcEluZGV4IDwgYm9vdHN0cmFwU2NyaXB0cy5sZW5ndGgpIHtcbiAgICAgICAgLy8gTG9hZCB0aGUgbmV4dCBib290c3RyYXAuXG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gYm9vdHN0cmFwU2NyaXB0c1tib290c3RyYXBJbmRleF07XG5cbiAgICAgICAgY29uc3QgYm9vdHN0cmFwID0gcmVxdWlyZShmaWxlTmFtZSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgc2VjdXJpdHkvZGV0ZWN0LW5vbi1saXRlcmFsLXJlcXVpcmVcbiAgICAgICAgLy8gSW52b2tlIHRoZSBib290c3RyYXAncyBleGVjdXRlKCkgbWV0aG9kIGlmIGl0IGhhcyBvbmUuIChUaGlzIGlzIG9wdGlvbmFsLilcbiAgICAgICAgLy8gV2UgbXVzdCB3YWl0IGZvciB0aGUgZ2l2ZW4gY2FsbGJhY2sgdG8gYmUgaW52b2tlZCBiZWZvcmUgbG9hZGluZyB0aGUgbmV4dCBzY3JpcHQuXG4gICAgICAgIC8vIE5vdGU6IFRoaXMgaXMgZXhwZWN0ZWQgdG8gYmUgdXNlZCB0byBkaXNwbGF5IFVJIHRvIHRoZSBlbmQtdXNlci5cblxuXG4gICAgICAgIGlmIChib290c3RyYXAuZXhlY3V0ZSkge1xuICAgICAgICAgIGJvb3RzdHJhcC5leGVjdXRlKG9uQm9vdHN0cmFwRXhlY3V0aW9uRmluaXNoZWQpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSAvLyBXZSdyZSBkb25lIHdpdGggdGhlIGN1cnJlbnQgYm9vdHN0cmFwLiBUaW1lIHRvIGxvYWQgdGhlIG5leHQgb25lLlxuXG5cbiAgICAgICAgYm9vdHN0cmFwSW5kZXgrKztcbiAgICAgIH0gLy8gSW52b2tlIGdpdmVuIGNhbGxiYWNrIHRvIGluZm9ybSBjYWxsZXIgdGhhdCBhbGwgbG9hZGluZyBpcyBkb25lLlxuXG5cbiAgICAgIGZpbmlzaGVkKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25Cb290c3RyYXBFeGVjdXRpb25GaW5pc2hlZCgpIHtcbiAgICAgIC8vIExhc3QgYm9vdHN0cmFwIGhhcyBmaW5pc2hlZCBleGVjdXRpb24uIFRpbWUgdG8gbG9hZCB0aGUgbmV4dCBvbmUuXG4gICAgICAvLyBOb3RlOiBBZGQgYSB0aW55IGRlbGF5IHNvIHdoYXRldmVyIFVJIHRoZSBsYXN0IGJvb3RzdHJhcCBsb2FkZWQgaGFzIHRpbWUgdG8gY2xvc2UuXG4gICAgICBib290c3RyYXBJbmRleCsrO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiBkb0xvYWQoKSwgMSk7XG4gICAgfVxuXG4gICAgZG9Mb2FkKCk7XG4gIH0gLy8gV2UndmUgZmluaXNoZWQgbG9hZGluZy9leGVjdXRpbmcgYWxsIGJvb3RzdHJhcCBzY3JpcHRzLlxuICAvLyBJbmZvcm0gY2FsbGVyIGJ5IGludm9raW5nIHRoZSBjYWxsYmFjayBnaXZlbiB0byBsb2FkQXN5bmMoKS5cblxuXG4gIGxvYWRCb290c3RyYXBTY3JpcHRzKGZpbmlzaGVkKTtcbn1cblxuLyoqXG4gKiBBcHBjZWxlcmF0b3IgVGl0YW5pdW0gTW9iaWxlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTggYnkgQXh3YXksIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgQXBhY2hlIFB1YmxpYyBMaWNlbnNlXG4gKiBQbGVhc2Ugc2VlIHRoZSBMSUNFTlNFIGluY2x1ZGVkIHdpdGggdGhpcyBkaXN0cmlidXRpb24gZm9yIGRldGFpbHMuXG4gKlxuICogVGhpcyBzY3JpcHQgaXMgbG9hZGVkIG9uIGFwcCBzdGFydHVwIG9uIGFsbCBwbGF0Zm9ybXMuIEl0IGlzIHVzZWQgdG8gZG8gdGhlIGZvbGxvd2luZzpcbiAqIC0gUHJvdmlkZSBjb25zaXN0ZW50IHN0YXJ0dXAgYmVoYXZpb3IgYmV0d2VlbiBwbGF0Zm9ybXMsIHN1Y2ggYXMgbG9nZ2luZyBUaXRhbml1bSB2ZXJzaW9uLlxuICogLSBMb2FkIFRpdGFuaXVtJ3MgY29yZSBKYXZhU2NyaXB0IGV4dGVuc2lvbnMgc2hhcmVkIGJ5IGFsbCBwbGF0Zm9ybXMuXG4gKiAtIFByb3ZpZGUgXCIqLmJvb3RzdHJhcC5qc1wiIHNjcmlwdCBzdXBwb3J0LiAoU2ltaWxhciB0byBuYXRpdmUgbW9kdWxlIG9uQXBwQ3JlYXRlKCkvbG9hZCgpIHN1cHBvcnQuKVxuICogLSBMb2FkIHRoZSBhcHAgZGV2ZWxvcGVyJ3MgbWFpbiBcImFwcC5qc1wiIHNjcmlwdCBhZnRlciBkb2luZyBhbGwgb2YgdGhlIGFib3ZlLlxuICovXG4vLyBMb2cgdGhlIGFwcCBuYW1lLCBhcHAgdmVyc2lvbiwgYW5kIFRpdGFuaXVtIHZlcnNpb24gb24gc3RhcnR1cC5cblRpLkFQSS5pbmZvKGAke1RpLkFwcC5uYW1lfSAke1RpLkFwcC52ZXJzaW9ufSAoUG93ZXJlZCBieSBUaXRhbml1bSAke1wiOS4xLjBcIn0uJHtcImI4ZTk2NmQwYzlcIn0pYCk7IC8vIEF0dGVtcHQgdG8gbG9hZCBjcmFzaCBhbmFseXRpY3MgbW9kdWxlLlxuLy8gTk9URTogVGhpcyBzaG91bGQgYmUgdGhlIGZpcnN0IG1vZHVsZSB0aGF0IGxvYWRzIG9uIHN0YXJ0dXAuXG5cbnRyeSB7XG4gIHJlcXVpcmUoJ2NvbS5hcHBjZWxlcmF0b3IuYWNhJyk7XG59IGNhdGNoIChlKSB7fSAvLyBDb3VsZCBub3QgbG9hZCBtb2R1bGUsIHNpbGVudGx5IGlnbm9yZSBleGNlcHRpb24uXG5sb2FkQXN5bmMoZnVuY3Rpb24gKCkge1xuICAvLyBXZSd2ZSBmaW5pc2hlZCBsb2FkaW5nL2V4ZWN1dGluZyBhbGwgYm9vdHN0cmFwIHNjcmlwdHMuXG4gIC8vIFdlIGNhbiBub3cgcHJvY2VlZCB0byBydW4gdGhlIG1haW4gXCJhcHAuanNcIiBzY3JpcHQuXG4gIHJlcXVpcmUoJy4vYXBwJyk7IC8vIFRoaXMgZXZlbnQgaXMgdG8gYmUgZmlyZWQgYWZ0ZXIgXCJhcHAuanNcIiBleGVjdXRpb24uIFJlYXNvbnM6XG4gIC8vIC0gQWxsb3cgc3lzdGVtIHRvIHF1ZXVlIHN0YXJ0dXAgcmVsYXRlZCBldmVudHMgdW50aWwgXCJhcHAuanNcIiBoYXMgaGFkIGEgY2hhbmNlIHRvIGFkZCBsaXN0ZW5lcnMuXG4gIC8vIC0gRm9yIEFsbG95IGFwcHMsIHdlIG5vdyBrbm93IHRoYXQgQWxsb3kgaGFzIGJlZW4gaW5pdGlhbGl6ZWQgYW5kIGl0cyBnbG9iYWxzIHdlcmUgYWRkZWQuXG5cblxuICBUaS5BcHAuZmlyZUV2ZW50KCdzdGFydGVkJyk7XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL1VzZXJzL3Znb3lhbC9MaWJyYXJ5L0FwcGxpY2F0aW9uIFN1cHBvcnQvVGl0YW5pdW0vbW9iaWxlc2RrL29zeC85LjEuMC52MjAyMDAyMTkwNjI2NDcvY29tbW9uL1Jlc291cmNlcy9hbmRyb2lkIn0=
