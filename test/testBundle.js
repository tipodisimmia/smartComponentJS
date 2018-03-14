(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var jsx = function () {
  var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7;
  return function createRawReactElement(type, props, key, children) {
    var defaultProps = type && type.defaultProps;
    var childrenLength = arguments.length - 3;

    if (!props && childrenLength !== 0) {
      props = {};
    }

    if (props && defaultProps) {
      for (var propName in defaultProps) {
        if (props[propName] === void 0) {
          props[propName] = defaultProps[propName];
        }
      }
    } else if (!props) {
      props = defaultProps || {};
    }

    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      var childArray = Array(childrenLength);

      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 3];
      }

      props.children = childArray;
    }

    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type: type,
      key: key === undefined ? null : '' + key,
      ref: null,
      props: props,
      _owner: null
    };
  };
}();

var asyncIterator = function (iterable) {
  if (typeof Symbol === "function") {
    if (Symbol.asyncIterator) {
      var method = iterable[Symbol.asyncIterator];
      if (method != null) return method.call(iterable);
    }

    if (Symbol.iterator) {
      return iterable[Symbol.iterator]();
    }
  }

  throw new TypeError("Object is not async iterable");
};

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

var asyncGeneratorDelegate = function (inner, awaitWrap) {
  var iter = {},
      waiting = false;

  function pump(key, value) {
    waiting = true;
    value = new Promise(function (resolve) {
      resolve(inner[key](value));
    });
    return {
      done: false,
      value: awaitWrap(value)
    };
  }

  

  if (typeof Symbol === "function" && Symbol.iterator) {
    iter[Symbol.iterator] = function () {
      return this;
    };
  }

  iter.next = function (value) {
    if (waiting) {
      waiting = false;
      return value;
    }

    return pump("next", value);
  };

  if (typeof inner.throw === "function") {
    iter.throw = function (value) {
      if (waiting) {
        waiting = false;
        throw value;
      }

      return pump("throw", value);
    };
  }

  if (typeof inner.return === "function") {
    iter.return = function (value) {
      return pump("return", value);
    };
  }

  return iter;
};

var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
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
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var defineEnumerableProperties = function (obj, descs) {
  for (var key in descs) {
    var desc = descs[key];
    desc.configurable = desc.enumerable = true;
    if ("value" in desc) desc.writable = true;
    Object.defineProperty(obj, key, desc);
  }

  return obj;
};

var defaults = function (obj, defaults) {
  var keys = Object.getOwnPropertyNames(defaults);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = Object.getOwnPropertyDescriptor(defaults, key);

    if (value && value.configurable && obj[key] === undefined) {
      Object.defineProperty(obj, key, value);
    }
  }

  return obj;
};

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var _instanceof = function (left, right) {
  if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
    return right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
};

var interopRequireDefault = function (obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
};

var interopRequireWildcard = function (obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};

    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }

    newObj.default = obj;
    return newObj;
  }
};

var newArrowCheck = function (innerThis, boundThis) {
  if (innerThis !== boundThis) {
    throw new TypeError("Cannot instantiate an arrow function");
  }
};

var objectDestructuringEmpty = function (obj) {
  if (obj == null) throw new TypeError("Cannot destructure undefined");
};

var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var selfGlobal = typeof global === "undefined" ? self : global;

var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var slicedToArrayLoose = function (arr, i) {
  if (Array.isArray(arr)) {
    return arr;
  } else if (Symbol.iterator in Object(arr)) {
    var _arr = [];

    for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
      _arr.push(_step.value);

      if (i && _arr.length === i) break;
    }

    return _arr;
  } else {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }
};

var taggedTemplateLiteral = function (strings, raw) {
  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
};

var taggedTemplateLiteralLoose = function (strings, raw) {
  strings.raw = raw;
  return strings;
};

var temporalRef = function (val, name, undef) {
  if (val === undef) {
    throw new ReferenceError(name + " is not defined - temporal dead zone");
  } else {
    return val;
  }
};

var temporalUndefined = {};

var toArray = function (arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var _typeof$1 = typeof Symbol === "function" && _typeof(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};

var jsx$1 = function () {
  var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7;
  return function createRawReactElement(type, props, key, children) {
    var defaultProps = type && type.defaultProps;
    var childrenLength = arguments.length - 3;

    if (!props && childrenLength !== 0) {
      props = {};
    }

    if (props && defaultProps) {
      for (var propName in defaultProps) {
        if (props[propName] === void 0) {
          props[propName] = defaultProps[propName];
        }
      }
    } else if (!props) {
      props = defaultProps || {};
    }

    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      var childArray = Array(childrenLength);

      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 3];
      }

      props.children = childArray;
    }

    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type: type,
      key: key === undefined ? null : '' + key,
      ref: null,
      props: props,
      _owner: null
    };
  };
}();

var asyncIterator$1 = function asyncIterator$$1(iterable) {
  if (typeof Symbol === "function") {
    if (Symbol.asyncIterator) {
      var method = iterable[Symbol.asyncIterator];
      if (method != null) return method.call(iterable);
    }

    if (Symbol.iterator) {
      return iterable[Symbol.iterator]();
    }
  }

  throw new TypeError("Object is not async iterable");
};

var asyncGenerator$1 = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function wrap(fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function _await(value) {
      return new AwaitValue(value);
    }
  };
}();

var asyncGeneratorDelegate$1 = function asyncGeneratorDelegate$$1(inner, awaitWrap) {
  var iter = {},
      waiting = false;

  function pump(key, value) {
    waiting = true;
    value = new Promise(function (resolve) {
      resolve(inner[key](value));
    });
    return {
      done: false,
      value: awaitWrap(value)
    };
  }

  if (typeof Symbol === "function" && Symbol.iterator) {
    iter[Symbol.iterator] = function () {
      return this;
    };
  }

  iter.next = function (value) {
    if (waiting) {
      waiting = false;
      return value;
    }

    return pump("next", value);
  };

  if (typeof inner.throw === "function") {
    iter.throw = function (value) {
      if (waiting) {
        waiting = false;
        throw value;
      }

      return pump("throw", value);
    };
  }

  if (typeof inner.return === "function") {
    iter.return = function (value) {
      return pump("return", value);
    };
  }

  return iter;
};

var asyncToGenerator$1 = function asyncToGenerator$$1(fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
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
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

var classCallCheck$1 = function classCallCheck$$1(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass$1 = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var defineEnumerableProperties$1 = function defineEnumerableProperties$$1(obj, descs) {
  for (var key in descs) {
    var desc = descs[key];
    desc.configurable = desc.enumerable = true;
    if ("value" in desc) desc.writable = true;
    Object.defineProperty(obj, key, desc);
  }

  return obj;
};

var defaults$1 = function defaults$$1(obj, _defaults) {
  var keys = Object.getOwnPropertyNames(_defaults);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = Object.getOwnPropertyDescriptor(_defaults, key);

    if (value && value.configurable && obj[key] === undefined) {
      Object.defineProperty(obj, key, value);
    }
  }

  return obj;
};

var defineProperty$1 = function defineProperty$$1(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends$1 = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var get$1 = function get$$1(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get$$1(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits$1 = function inherits$$1(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var _instanceof$1 = function _instanceof$$1(left, right) {
  if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
    return right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
};

var interopRequireDefault$1 = function interopRequireDefault$$1(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
};

var interopRequireWildcard$1 = function interopRequireWildcard$$1(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};

    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }

    newObj.default = obj;
    return newObj;
  }
};

var newArrowCheck$1 = function newArrowCheck$$1(innerThis, boundThis) {
  if (innerThis !== boundThis) {
    throw new TypeError("Cannot instantiate an arrow function");
  }
};

var objectDestructuringEmpty$1 = function objectDestructuringEmpty$$1(obj) {
  if (obj == null) throw new TypeError("Cannot destructure undefined");
};

var objectWithoutProperties$1 = function objectWithoutProperties$$1(obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var possibleConstructorReturn$1 = function possibleConstructorReturn$$1(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
};

var selfGlobal$1 = typeof global === "undefined" ? self : global;

var set$1 = function set$$1(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set$$1(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var slicedToArray$1 = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var slicedToArrayLoose$1 = function slicedToArrayLoose$$1(arr, i) {
  if (Array.isArray(arr)) {
    return arr;
  } else if (Symbol.iterator in Object(arr)) {
    var _arr = [];

    for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
      _arr.push(_step.value);

      if (i && _arr.length === i) break;
    }

    return _arr;
  } else {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }
};

var taggedTemplateLiteral$1 = function taggedTemplateLiteral$$1(strings, raw) {
  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
};

var taggedTemplateLiteralLoose$1 = function taggedTemplateLiteralLoose$$1(strings, raw) {
  strings.raw = raw;
  return strings;
};

var temporalRef$1 = function temporalRef$$1(val, name, undef) {
  if (val === undef) {
    throw new ReferenceError(name + " is not defined - temporal dead zone");
  } else {
    return val;
  }
};

var temporalUndefined$1 = {};

var toArray$1 = function toArray$$1(arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
};

var toConsumableArray$1 = function toConsumableArray$$1(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }return arr2;
  } else {
    return Array.from(arr);
  }
};

var SmartComponentManager = function () {
  function SmartComponentManager() {
    classCallCheck$1(this, SmartComponentManager);

    this.components = [];
    this.componentsInstance = {};
  }

  createClass$1(SmartComponentManager, [{
    key: "configure",
    value: function configure(params) {
      this.params = params || { garbageCollector: false, garbageCollectorRootElement: null };

      if (this.params.garbageCollector) {
        this.garbageCollectorRootElement = this.params.garbageCollectorRootElement || document.getElementsByTagName("BODY")[0];
        if (this.params.garbageCollector) {
          this.mutationObserver = new MutationObserver(this.mutationHandler.bind(this));
          this.mutationObserver.observe(this.garbageCollectorRootElement.parentNode, { attributes: false, childList: true, characterData: false, subtree: true });
        }
      }
    }
  }, {
    key: "mutationHandler",
    value: function mutationHandler(mutationsList) {
      var _this = this;

      if (mutationsList && mutationsList.length > 0) {
        var removedElements = mutationsList.filter(function (m) {
          return m.removedNodes.length > 0;
        }).reduce(function (prev, current) {
          return prev.concat(current.removedNodes);
        }, []);

        if (removedElements.length > 0) {
          this.getComponentSubNodes(removedElements, []).forEach(function (node) {
            if (node.getAttribute && node.getAttribute("component-id")) {
              var componentInstance = _this.getComponentInstanceById(node.getAttribute("component-id"));
              if (componentInstance) {
                componentInstance.smart_destroy();
              }
            }
          });
        }
      }
    }
  }, {
    key: "getComponentSubNodes",
    value: function getComponentSubNodes(removedElements, prevNodes) {
      var _this2 = this;

      prevNodes = prevNodes || [];
      var rmElements = removedElements.length > 0 ? removedElements : [removedElements];
      rmElements.forEach(function (removedNode) {
        var currentNode = removedNode;
        if (currentNode.length) {
          prevNodes.push(_this2.getComponentSubNodes([].slice.call(currentNode), prevNodes));
        } else {
          if (currentNode.getAttribute && currentNode.getAttribute("component")) {
            prevNodes.push(currentNode);
          }
          if (currentNode.children && currentNode.children.length > 0) {
            prevNodes.push(_this2.getComponentSubNodes([].slice.call(currentNode.children), prevNodes));
          }
        }
      });
      return prevNodes;
    }
  }, {
    key: "registerComponents",
    value: function registerComponents(componentsClasses) {
      var _this3 = this;

      Object.keys(componentsClasses).forEach(function (componentClassName) {
        if (!_this3.getComponent(componentClassName)) {
          _this3.registerComponent(componentClassName, componentsClasses[componentClassName]);
        }
      });
    }
  }, {
    key: "registerComponent",
    value: function registerComponent(name, clazz) {
      this.components.push({
        name: name,
        clazz: clazz
      });
    }
  }, {
    key: "registerComponentInstance",
    value: function registerComponentInstance(id, instance) {
      this.componentsInstance[id] = instance;
    }
  }, {
    key: "removeComponentInstance",
    value: function removeComponentInstance(id) {
      delete this.componentsInstance[id];
    }
  }, {
    key: "getComponentInstanceById",
    value: function getComponentInstanceById(id) {
      return this.componentsInstance[id];
    }
  }, {
    key: "initComponentByName",
    value: function initComponentByName(element, componentName) {
      var instance = null;
      try {
        var clazz = this.getComponent(componentName);
        instance = new clazz(element); //Start Up Component
      } catch (e) {
        console.error("Error when trying to instance Component " + componentName + ": " + e);
      }
      return instance;
    }
  }, {
    key: "getComponent",
    value: function getComponent(name) {
      var comp = this.components.filter(function (c) {
        return c.name == name;
      }).map(function (c) {
        return c.clazz;
      })[0];
      return comp;
    }
  }]);
  return SmartComponentManager;
}();

var SmartComponentManager$1 = new SmartComponentManager();

var SmartComponent = function () {
  function SmartComponent(element, parentComponent, params) {
    classCallCheck$1(this, SmartComponent);

    this.smart_init(element, parentComponent, params);
  }

  createClass$1(SmartComponent, [{
    key: "smart_init",
    value: function smart_init(element, parentComponent, params) {
      this.element = element;
      this.bindedElements = { "click": [] };
      this._componentId = this._generateUid();
      this.parentComponent = parentComponent;
      this.componentReferenceName = null;
      this.params = params || {};

      //Serve per recuperare il componente  tramite un nome di fantasia contenuto nell'attributo component-reference-name
      var componentReferenceName = this.params.componentReferenceName ? this.params.componentReferenceName : this.element.getAttribute("component-reference-name");
      componentReferenceName = componentReferenceName || this._componentId;

      this.componentReferenceName = componentReferenceName;
      if (!element.getAttribute("component-reference-name")) {
        element.setAttribute("component-reference-name", componentReferenceName);
      }

      if (!this.verifyComponentReferenceNameUnicity()) {
        throw this.componentReferenceName + " componentReferenceName is already used in " + this.parentComponent.componentReferenceName + " hyerarchy";
        return false;
      }

      SmartComponentManager$1.registerComponentInstance(this._componentId, this);

      this.element.setAttribute("component-id", this._componentId);

      if (!this.element.getAttribute("component")) {
        this.element.setAttribute("component", this.constructor.name);
      }

      if (this.parentComponent && !this.parentComponent.components) {
        this.parentComponent.components = {};
      }

      if (this.parentComponent) {
        this.parentComponent.components[componentReferenceName] = this;
      }

      if (this.element.getAttribute("component-click")) {
        this.bindComponentClick(this.element);
      }

      var nodesToBind = this._getComponentClickNodeToBind([this.element]);
      if (nodesToBind.length) {
        for (var i = 0; i < nodesToBind.length; i++) {
          this.checkComponentsHierarchyAndBindClick(nodesToBind[i]);
        }
      }

      //The mutationObserver is used in order to retrieve and handling component-"event"
      this.mutationObserver = new MutationObserver(this._mutationHandler.bind(this));
      this.mutationObserver.observe(this.element.parentNode, { attributes: false, childList: true, characterData: false, subtree: true });
    }
  }, {
    key: "_mutationHandler",
    value: function _mutationHandler(mutationsList) {
      this._eventMutationHandler(mutationsList);
    }
  }, {
    key: "verifyComponentReferenceNameUnicity",
    value: function verifyComponentReferenceNameUnicity() {
      return !this.parentComponent || !this.parentComponent.components || !this.parentComponent.components[this.componentReferenceName];
    }
  }, {
    key: "_generateUid",
    value: function _generateUid() {
      return this.constructor.name + "_" + 'xxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });
    }
  }, {
    key: "smart_clickHandler",
    value: function smart_clickHandler(ev) {
      var functionCode = ev.currentTarget.getAttribute('component-click');
      var functionName = functionCode.split("(")[0];

      function extractParams() {
        for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
          params[_key] = arguments[_key];
        }

        var parameters = [].slice.call(arguments);
        return parameters.map(function (param) {
          if (param == "this") {
            return ev;
          } else {
            return param;
          }
        });
      }

      if (this[functionName]) {
        this[functionName].apply(this, eval("extractParams(" + functionCode.split("(")[1]));
      }
    }
  }, {
    key: "loadChildComponents",
    value: function loadChildComponents(parentComponent) {
      var componentsLoaded = [];
      var componentsEls = this.element.querySelectorAll('[component]');
      for (var i = 0; i < componentsEls.length; i++) {
        var componentId = componentsEls[i].getAttribute('component-id');

        if (!componentId) {
          var component = componentsEls[i].getAttribute('component');
          var Clazz = SmartComponentManager$1.getComponent(component);
          componentsLoaded.push(new Clazz(componentsEls[i], parentComponent || this));
        }
      }
      return componentsLoaded;
    }
  }, {
    key: "_bindComponentClick",
    value: function _bindComponentClick(node) {
      var _this = this;

      var isAlreadyBinded = this.bindedElements["click"].reduce(function (accumulator, currentNode) {
        return accumulator || currentNode.isEqualNode(node);
      }, false);

      if (!isAlreadyBinded) {
        this.bindedElements["click"].push(node);
        node.addEventListener('click', function (e) {
          _this.smart_clickHandler(e);
        });
      }
    }
  }, {
    key: "checkComponentsHierarchyAndBindClick",
    value: function checkComponentsHierarchyAndBindClick(node) {
      var parentsComponent = this._getDomElementParents(node, '[component-reference-name]');
      if (parentsComponent.length > 0 && parentsComponent[0].getAttribute("component-reference-name") == this.componentReferenceName) {
        this._bindComponentClick(node);
      } else {
        return;
      }
    }
  }, {
    key: "_getDomElementParents",
    value: function _getDomElementParents(elem, selector) {
      // Element.matches() polyfill
      if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function (s) {
          var matches = (this.document || this.ownerDocument).querySelectorAll(s),
              i = matches.length;
          while (--i >= 0 && matches.item(i) !== this) {}
          return i > -1;
        };
      }
      // Setup parents array
      var parents = [];
      // Get matching parent elements
      for (; elem && elem !== document; elem = elem.parentNode) {
        // Add matching parents to array
        if (selector) {
          if (elem.matches(selector)) {
            parents.push(elem);
          }
        } else {
          parents.push(elem);
        }
      }
      return parents;
    }
  }, {
    key: "_eventMutationHandler",
    value: function _eventMutationHandler(mutationsList) {
      var _this2 = this;

      if (mutationsList && mutationsList.length > 0) {
        var mutationElements = mutationsList.filter(function (m) {
          return m.addedNodes.length > 0;
        }).reduce(function (prev, current) {
          return prev.concat(_this2._getComponentClickNodeToBind(current.addedNodes));
        }, []);

        if (mutationElements.length) {
          for (var i = 0; i < mutationElements.length; i++) {
            this.checkComponentsHierarchyAndBindClick(mutationElements[i]);
          }
        }
      }
    }
  }, {
    key: "_getComponentClickNodeToBind",
    value: function _getComponentClickNodeToBind(modesToCheck) {
      var nodesToBind = [];
      if (modesToCheck.length) {
        for (var i = 0; i < modesToCheck.length; i++) {
          var node = modesToCheck[i];
          if (node.querySelectorAll) {
            var componentClickElements = node.querySelectorAll('[component-click]');
            if (node.getAttribute('component-click')) {
              nodesToBind.push(node);
            }
            if (componentClickElements.length > 0) {
              for (var _i = 0; _i < componentClickElements.length; _i++) {
                nodesToBind.push(componentClickElements[_i]);
              }
            }
          }
        }
      }
      return nodesToBind;
    }

    /**
     * Called by ComponentManager  when dom component is removed, otherwise you can also call it directly if you need or override it
     */

  }, {
    key: "smart_destroy",
    value: function smart_destroy() {
      console.log(this.componentReferenceName + " destroyed");
      this.mutationObserver.disconnect();
      SmartComponentManager$1.removeComponentInstance(this._componentId);
      if (this.element.isConnected) {
        this.element.remove();
      }

      // for all properties
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.getOwnPropertyNames(this)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var prop = _step.value;

          delete this[prop];
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }]);
  return SmartComponent;
}();

var TestManager = function () {
    function TestManager() {
        classCallCheck(this, TestManager);

        this.clickEventsCounter = {};
    }

    createClass(TestManager, [{
        key: "getClickEvents",
        value: function getClickEvents(componentReferenceName) {
            if (typeof this.clickEventsCounter[componentReferenceName] === "undefined") {
                this.clickEventsCounter[componentReferenceName] = 0;
            }
            return this.clickEventsCounter[componentReferenceName];
        }
    }, {
        key: "addClickEvent",
        value: function addClickEvent(componentReferenceName) {
            if (typeof this.clickEventsCounter[componentReferenceName] === "undefined") {
                this.clickEventsCounter[componentReferenceName] = 0;
            }
            this.clickEventsCounter[componentReferenceName]++;
            return this.clickEventsCounter[componentReferenceName];
        }
    }]);
    return TestManager;
}();

var TestManager$1 = new TestManager();

var TestComponent = function (_SmartComponent) {
    inherits(TestComponent, _SmartComponent);

    function TestComponent(element, parentComponent, params) {
        classCallCheck(this, TestComponent);
        return possibleConstructorReturn(this, (TestComponent.__proto__ || Object.getPrototypeOf(TestComponent)).call(this, element, parentComponent, params));
    }

    createClass(TestComponent, [{
        key: "clickHandler",
        value: function clickHandler() {
            console.log(this.componentReferenceName);
            TestManager$1.addClickEvent(this.componentReferenceName);
        }
    }]);
    return TestComponent;
}(SmartComponent);

var StopClickPropagationComponent = function (_SmartComponent) {
    inherits(StopClickPropagationComponent, _SmartComponent);

    function StopClickPropagationComponent(element, parentComponent, params) {
        classCallCheck(this, StopClickPropagationComponent);
        return possibleConstructorReturn(this, (StopClickPropagationComponent.__proto__ || Object.getPrototypeOf(StopClickPropagationComponent)).call(this, element, parentComponent, params));
    }

    createClass(StopClickPropagationComponent, [{
        key: "clickHandler",
        value: function clickHandler(ev) {
            if (ev) {
                ev.stopPropagation();
            }
            TestManager$1.addClickEvent(this.componentReferenceName);
        }
    }]);
    return StopClickPropagationComponent;
}(SmartComponent);

SmartComponentManager$1.registerComponents({ TestComponent: TestComponent, StopClickPropagationComponent: StopClickPropagationComponent });
SmartComponentManager$1.configure({ garbageCollector: true });

var testComponent = null;
var testComponent2 = null;
var testComponent3 = null;
var testComponent4 = null;
var testComponent5 = null;
var testComponent6 = null;
var stopClickPropagationComponent = null;

describe('TestComponent1 - Instance by name', function () {
    testComponent = SmartComponentManager$1.initComponentByName(document.querySelector("[component-reference-name=\"TestComponent1\"]"), "TestComponent");
    it('TestComponent1 - should be instanced', function () {
        assert.equal(testComponent.constructor.name, "TestComponent");
    });
});

describe('TestComponent1 - load child components passing like parent TestComponent1', function () {
    it('TestComponent2 - TestComponent1 should be present like TestComponent2 parent', function () {
        var loadedComponents = testComponent.loadChildComponents(testComponent);
        testComponent2 = loadedComponents.filter(function (component) {
            return component.componentReferenceName == "TestComponent2";
        })[0];
        assert.equal(testComponent2.parentComponent.componentReferenceName, "TestComponent1");
    });
});

describe('TestComponent2 component-click - click on TestComponent2 child on component-click attribute', function () {
    it('TestComponent2 - clickEventsNumber must be increase of one', async function () {
        var clickEventsNumberBefore = TestManager$1.getClickEvents("TestComponent2");
        document.querySelector("[component-reference-name=\"TestComponent2\"] [component-click=\"clickHandler()\"]").click();
        await setTimeout(function () {}, 500);
        assert.equal(TestManager$1.getClickEvents("TestComponent2"), clickEventsNumberBefore + 1);
    });
});

describe('TestComponent3/4 added dinamically - add dinamically TestComponent3 like child of TestComponent2', function () {
    it('TestComponent3/4 - should be present like child of TestComponent2', async function () {
        var testComponent2DomEl = document.querySelector("[component-reference-name=\"TestComponent2\"]");
        var node = document.createElement('div');
        node.innerHTML = "\n        <div>\n            <div component=\"TestComponent\"  component-reference-name=\"TestComponent3\">\n                <button component-click=\"clickHandler()\">TestComponent3 Click Handler</button>\n            </div>\n    \n            <div component=\"TestComponent\"  component-reference-name=\"TestComponent4\">\n                <button component-click=\"clickHandler()\">TestComponent4 Click Handler</button>\n            </div>\n        </div>";
        testComponent2DomEl.appendChild(node.childNodes[1]);
        testComponent2.loadChildComponents();
        await setTimeout(function () {}, 500);
        testComponent3 = testComponent2.components["TestComponent3"];
        testComponent4 = testComponent2.components["TestComponent4"];
        assert.equal(testComponent2.components["TestComponent3"].componentReferenceName, "TestComponent3");
        assert.equal(testComponent2.components["TestComponent4"].componentReferenceName, "TestComponent4");
    });
});

describe('TestComponent3 component-click - click on TestComponent3 child on component-click attribute', function () {
    it('TestComponent3 - clickEventsNumber must be increase of one', async function () {
        var clickEventsNumberBefore = TestManager$1.getClickEvents("TestComponent3");
        document.querySelector("[component-reference-name=\"TestComponent3\"] [component-click=\"clickHandler()\"]").click();
        await setTimeout(function () {}, 500);
        assert.equal(TestManager$1.getClickEvents("TestComponent3"), clickEventsNumberBefore + 1);
    });
});

describe('TestComponent5 instanced by javascript - instanced by javascript TestComponent5 under TestComponent2', function () {
    it('TestComponent5 - should be present like child of TestComponent2', async function () {
        var testComponent2DomEl = document.querySelector("[component-reference-name=\"TestComponent2\"]");
        var node = document.createElement('div');
        node.innerHTML = "<div></div>";
        var nodeToAppend = node.childNodes[0];
        testComponent2DomEl.appendChild(nodeToAppend);
        testComponent5 = new TestComponent(nodeToAppend, testComponent2, { componentReferenceName: "TestComponent5" });
        await setTimeout(function () {}, 500);
        assert.equal(testComponent2.components["TestComponent5"].componentReferenceName, "TestComponent5");
    });
});

describe('TestComponent6 instanced by javascript - instanced by javascript TestComponent6 under TestComponent5', function () {
    it('TestComponent6 - should be present like child of TestComponent5', async function () {
        var testComponent5DomEl = document.querySelector("[component-reference-name=\"TestComponent5\"]");
        var node = document.createElement('div');
        node.innerHTML = "<div>\n                             <button component-click=\"clickHandler()\">TestComponent6 Click Handler</button>\n                        </div>";
        var nodeToAppend = node.childNodes[0];
        testComponent5DomEl.appendChild(nodeToAppend);
        testComponent6 = new TestComponent(nodeToAppend, testComponent5, { componentReferenceName: "TestComponent6" });
        await setTimeout(function () {}, 500);
        assert.equal(testComponent5.components["TestComponent6"].componentReferenceName, "TestComponent6");
    });
});

describe('Detect conflict in component-reference-name - using two times TestComponent6 under TestComponent5 component', function () {
    it('Not unique component reference name exception is throwed ', function () {
        var testComponent5DomEl = document.querySelector("[component-reference-name=\"TestComponent5\"]");
        var node = document.createElement('div');
        node.innerHTML = "<div component=\"TestComponent\" component-reference-name=\"TestComponent6\">\n                        </div>";
        var nodeToAppend = node.childNodes[0];
        testComponent5DomEl.appendChild(nodeToAppend);
        var crnException = null;
        try {
            testComponent5.loadChildComponents();
        } catch (e) {
            crnException = e;
            console.log(e);
        }

        assert.equal(crnException != null, true);
    });
});

describe('Handle event - stopping propagation across innested component-click function', function () {
    it('Stop event propagation Only the first function component-click in the hierarchy is invoked', async function () {

        var clickEventsNumberBefore = TestManager$1.getClickEvents("StopClickPropagationComponent");

        var testComponent1DomEl = document.querySelector("[component-reference-name=\"TestComponent1\"]");
        var node = document.createElement('div');
        node.innerHTML = "<div component=\"StopClickPropagationComponent\" component-reference-name=\"StopClickPropagationComponent\">\n                                <a href=\"javascript:void(0)\" component-click=\"clickHandler('this')\">\n                                    StopClickPropagationComponent\n                                    <button component-click=\"clickHandler('this')\">StopClickPropagationComponent 2</button>\n                                </a>\n                        </div>";
        testComponent1DomEl.appendChild(node);
        var loadedComponents = testComponent.loadChildComponents();
        stopClickPropagationComponent = loadedComponents[1];
        document.querySelector("[component-reference-name=\"StopClickPropagationComponent\"] button").click();
        await setTimeout(function () {}, 1000);
        console.log(TestManager$1.getClickEvents("StopClickPropagationComponent"));
        assert.equal(TestManager$1.getClickEvents("StopClickPropagationComponent"), clickEventsNumberBefore + 1);
    });
});

describe('Remove TestComponent2 from dom - remove the dom element that contains the component', function () {
    it('Component and theirs chilldren must be deallocated', async function () {

        var testComponent2DomEl = document.querySelector("[component-reference-name=\"TestComponent2\"]");

        testComponent2DomEl.remove();
        await setTimeout(function () {}, 1000);

        var allComponentsRemoved = [testComponent2, testComponent3, testComponent4, testComponent5, testComponent6].reduce(function (accumulator, current) {
            return accumulator && (Object.keys(current).length === 0 || !current);
        }, true);

        assert.equal(allComponentsRemoved, true);
    });
});

describe('Remove TestComponent programmatically - remove the dom element and theirs children', function () {
    it('Component and theirs chilldren must be deallocated', async function () {
        testComponent.smart_destroy();
        await setTimeout(function () {}, 2000);
        var allComponentsRemoved = [testComponent, stopClickPropagationComponent].reduce(function (accumulator, current) {
            return accumulator && (Object.keys(current).length === 0 || !current);
        }, true);

        assert.equal(allComponentsRemoved, true);
    });
});

//replace eval method in order to retrieve function parameters

//Init
//BeforComponetClick
//Lanciare eccezione se vengono trovate componentReferenceName registrate o se il componentReferenceName coincide con quella del padre

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdEJ1bmRsZS5qcyIsInNvdXJjZXMiOlsiLi4vYnVpbGQvU21hcnRDb21wb25lbnRKUy5qcyIsIlRlc3RNYW5hZ2VyLmpzIiwidGVzdENvbXBvbmVudHMvVGVzdENvbXBvbmVudC5qcyIsInRlc3RDb21wb25lbnRzL1N0b3BDbGlja1Byb3BhZ2F0aW9uQ29tcG9uZW50LmpzIiwidGVzdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iajtcbn0gOiBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqO1xufTtcblxudmFyIGpzeCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIFJFQUNUX0VMRU1FTlRfVFlQRSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuZm9yICYmIFN5bWJvbC5mb3IoXCJyZWFjdC5lbGVtZW50XCIpIHx8IDB4ZWFjNztcbiAgcmV0dXJuIGZ1bmN0aW9uIGNyZWF0ZVJhd1JlYWN0RWxlbWVudCh0eXBlLCBwcm9wcywga2V5LCBjaGlsZHJlbikge1xuICAgIHZhciBkZWZhdWx0UHJvcHMgPSB0eXBlICYmIHR5cGUuZGVmYXVsdFByb3BzO1xuICAgIHZhciBjaGlsZHJlbkxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGggLSAzO1xuXG4gICAgaWYgKCFwcm9wcyAmJiBjaGlsZHJlbkxlbmd0aCAhPT0gMCkge1xuICAgICAgcHJvcHMgPSB7fTtcbiAgICB9XG5cbiAgICBpZiAocHJvcHMgJiYgZGVmYXVsdFByb3BzKSB7XG4gICAgICBmb3IgKHZhciBwcm9wTmFtZSBpbiBkZWZhdWx0UHJvcHMpIHtcbiAgICAgICAgaWYgKHByb3BzW3Byb3BOYW1lXSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgcHJvcHNbcHJvcE5hbWVdID0gZGVmYXVsdFByb3BzW3Byb3BOYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXByb3BzKSB7XG4gICAgICBwcm9wcyA9IGRlZmF1bHRQcm9wcyB8fCB7fTtcbiAgICB9XG5cbiAgICBpZiAoY2hpbGRyZW5MZW5ndGggPT09IDEpIHtcbiAgICAgIHByb3BzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgfSBlbHNlIGlmIChjaGlsZHJlbkxlbmd0aCA+IDEpIHtcbiAgICAgIHZhciBjaGlsZEFycmF5ID0gQXJyYXkoY2hpbGRyZW5MZW5ndGgpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2hpbGRBcnJheVtpXSA9IGFyZ3VtZW50c1tpICsgM107XG4gICAgICB9XG5cbiAgICAgIHByb3BzLmNoaWxkcmVuID0gY2hpbGRBcnJheTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgJCR0eXBlb2Y6IFJFQUNUX0VMRU1FTlRfVFlQRSxcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBrZXk6IGtleSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6ICcnICsga2V5LFxuICAgICAgcmVmOiBudWxsLFxuICAgICAgcHJvcHM6IHByb3BzLFxuICAgICAgX293bmVyOiBudWxsXG4gICAgfTtcbiAgfTtcbn0oKTtcblxudmFyIGFzeW5jSXRlcmF0b3IgPSBmdW5jdGlvbiAoaXRlcmFibGUpIHtcbiAgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGlmIChTeW1ib2wuYXN5bmNJdGVyYXRvcikge1xuICAgICAgdmFyIG1ldGhvZCA9IGl0ZXJhYmxlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTtcbiAgICAgIGlmIChtZXRob2QgIT0gbnVsbCkgcmV0dXJuIG1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICB9XG5cbiAgICBpZiAoU3ltYm9sLml0ZXJhdG9yKSB7XG4gICAgICByZXR1cm4gaXRlcmFibGVbU3ltYm9sLml0ZXJhdG9yXSgpO1xuICAgIH1cbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXCJPYmplY3QgaXMgbm90IGFzeW5jIGl0ZXJhYmxlXCIpO1xufTtcblxudmFyIGFzeW5jR2VuZXJhdG9yID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBBd2FpdFZhbHVlKHZhbHVlKSB7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgZnVuY3Rpb24gQXN5bmNHZW5lcmF0b3IoZ2VuKSB7XG4gICAgdmFyIGZyb250LCBiYWNrO1xuXG4gICAgZnVuY3Rpb24gc2VuZChrZXksIGFyZykge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgYXJnOiBhcmcsXG4gICAgICAgICAgcmVzb2x2ZTogcmVzb2x2ZSxcbiAgICAgICAgICByZWplY3Q6IHJlamVjdCxcbiAgICAgICAgICBuZXh0OiBudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGJhY2spIHtcbiAgICAgICAgICBiYWNrID0gYmFjay5uZXh0ID0gcmVxdWVzdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmcm9udCA9IGJhY2sgPSByZXF1ZXN0O1xuICAgICAgICAgIHJlc3VtZShrZXksIGFyZyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc3VtZShrZXksIGFyZykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGdlbltrZXldKGFyZyk7XG4gICAgICAgIHZhciB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcblxuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBd2FpdFZhbHVlKSB7XG4gICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKHZhbHVlLnZhbHVlKS50aGVuKGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgICAgIHJlc3VtZShcIm5leHRcIiwgYXJnKTtcbiAgICAgICAgICB9LCBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgICAgICByZXN1bWUoXCJ0aHJvd1wiLCBhcmcpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldHRsZShyZXN1bHQuZG9uZSA/IFwicmV0dXJuXCIgOiBcIm5vcm1hbFwiLCByZXN1bHQudmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc2V0dGxlKFwidGhyb3dcIiwgZXJyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXR0bGUodHlwZSwgdmFsdWUpIHtcbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIFwicmV0dXJuXCI6XG4gICAgICAgICAgZnJvbnQucmVzb2x2ZSh7XG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBkb25lOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcInRocm93XCI6XG4gICAgICAgICAgZnJvbnQucmVqZWN0KHZhbHVlKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGZyb250LnJlc29sdmUoe1xuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgZG9uZTogZmFsc2VcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgZnJvbnQgPSBmcm9udC5uZXh0O1xuXG4gICAgICBpZiAoZnJvbnQpIHtcbiAgICAgICAgcmVzdW1lKGZyb250LmtleSwgZnJvbnQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJhY2sgPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2ludm9rZSA9IHNlbmQ7XG5cbiAgICBpZiAodHlwZW9mIGdlbi5yZXR1cm4gIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhpcy5yZXR1cm4gPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuYXN5bmNJdGVyYXRvcikge1xuICAgIEFzeW5jR2VuZXJhdG9yLnByb3RvdHlwZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICB9XG5cbiAgQXN5bmNHZW5lcmF0b3IucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ludm9rZShcIm5leHRcIiwgYXJnKTtcbiAgfTtcblxuICBBc3luY0dlbmVyYXRvci5wcm90b3R5cGUudGhyb3cgPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ludm9rZShcInRocm93XCIsIGFyZyk7XG4gIH07XG5cbiAgQXN5bmNHZW5lcmF0b3IucHJvdG90eXBlLnJldHVybiA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICByZXR1cm4gdGhpcy5faW52b2tlKFwicmV0dXJuXCIsIGFyZyk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICB3cmFwOiBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQXN5bmNHZW5lcmF0b3IoZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgICB9O1xuICAgIH0sXG4gICAgYXdhaXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIG5ldyBBd2FpdFZhbHVlKHZhbHVlKTtcbiAgICB9XG4gIH07XG59KCk7XG5cbnZhciBhc3luY0dlbmVyYXRvckRlbGVnYXRlID0gZnVuY3Rpb24gKGlubmVyLCBhd2FpdFdyYXApIHtcbiAgdmFyIGl0ZXIgPSB7fSxcbiAgICAgIHdhaXRpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBwdW1wKGtleSwgdmFsdWUpIHtcbiAgICB3YWl0aW5nID0gdHJ1ZTtcbiAgICB2YWx1ZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICByZXNvbHZlKGlubmVyW2tleV0odmFsdWUpKTtcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgZG9uZTogZmFsc2UsXG4gICAgICB2YWx1ZTogYXdhaXRXcmFwKHZhbHVlKVxuICAgIH07XG4gIH1cblxuICBcblxuICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvcikge1xuICAgIGl0ZXJbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gIH1cblxuICBpdGVyLm5leHQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAod2FpdGluZykge1xuICAgICAgd2FpdGluZyA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBwdW1wKFwibmV4dFwiLCB2YWx1ZSk7XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBpbm5lci50aHJvdyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgaXRlci50aHJvdyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHdhaXRpbmcpIHtcbiAgICAgICAgd2FpdGluZyA9IGZhbHNlO1xuICAgICAgICB0aHJvdyB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHB1bXAoXCJ0aHJvd1wiLCB2YWx1ZSk7XG4gICAgfTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgaW5uZXIucmV0dXJuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBpdGVyLnJldHVybiA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHB1bXAoXCJyZXR1cm5cIiwgdmFsdWUpO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gaXRlcjtcbn07XG5cbnZhciBhc3luY1RvR2VuZXJhdG9yID0gZnVuY3Rpb24gKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlbiA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGZ1bmN0aW9uIHN0ZXAoa2V5LCBhcmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgaW5mbyA9IGdlbltrZXldKGFyZyk7XG4gICAgICAgICAgdmFyIHZhbHVlID0gaW5mby52YWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgc3RlcChcIm5leHRcIiwgdmFsdWUpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIHN0ZXAoXCJ0aHJvd1wiLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdGVwKFwibmV4dFwiKTtcbiAgICB9KTtcbiAgfTtcbn07XG5cbnZhciBjbGFzc0NhbGxDaGVjayA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59O1xuXG52YXIgY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgICBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgICByZXR1cm4gQ29uc3RydWN0b3I7XG4gIH07XG59KCk7XG5cbnZhciBkZWZpbmVFbnVtZXJhYmxlUHJvcGVydGllcyA9IGZ1bmN0aW9uIChvYmosIGRlc2NzKSB7XG4gIGZvciAodmFyIGtleSBpbiBkZXNjcykge1xuICAgIHZhciBkZXNjID0gZGVzY3Nba2V5XTtcbiAgICBkZXNjLmNvbmZpZ3VyYWJsZSA9IGRlc2MuZW51bWVyYWJsZSA9IHRydWU7XG4gICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjKSBkZXNjLndyaXRhYmxlID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIGRlc2MpO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBkZWZhdWx0cyA9IGZ1bmN0aW9uIChvYmosIGRlZmF1bHRzKSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZGVmYXVsdHMpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgIHZhciB2YWx1ZSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZGVmYXVsdHMsIGtleSk7XG5cbiAgICBpZiAodmFsdWUgJiYgdmFsdWUuY29uZmlndXJhYmxlICYmIG9ialtrZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG52YXIgZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiAob2JqLCBrZXksIHZhbHVlKSB7XG4gIGlmIChrZXkgaW4gb2JqKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBvYmpba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkge1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkge1xuICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59O1xuXG52YXIgZ2V0ID0gZnVuY3Rpb24gZ2V0KG9iamVjdCwgcHJvcGVydHksIHJlY2VpdmVyKSB7XG4gIGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcbiAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpO1xuXG4gIGlmIChkZXNjID09PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XG5cbiAgICBpZiAocGFyZW50ID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZ2V0KHBhcmVudCwgcHJvcGVydHksIHJlY2VpdmVyKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MpIHtcbiAgICByZXR1cm4gZGVzYy52YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7XG5cbiAgICBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTtcbiAgfVxufTtcblxudmFyIGluaGVyaXRzID0gZnVuY3Rpb24gKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTtcbiAgfVxuXG4gIHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzO1xufTtcblxudmFyIF9pbnN0YW5jZW9mID0gZnVuY3Rpb24gKGxlZnQsIHJpZ2h0KSB7XG4gIGlmIChyaWdodCAhPSBudWxsICYmIHR5cGVvZiBTeW1ib2wgIT09IFwidW5kZWZpbmVkXCIgJiYgcmlnaHRbU3ltYm9sLmhhc0luc3RhbmNlXSkge1xuICAgIHJldHVybiByaWdodFtTeW1ib2wuaGFzSW5zdGFuY2VdKGxlZnQpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBsZWZ0IGluc3RhbmNlb2YgcmlnaHQ7XG4gIH1cbn07XG5cbnZhciBpbnRlcm9wUmVxdWlyZURlZmF1bHQgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgZGVmYXVsdDogb2JqXG4gIH07XG59O1xuXG52YXIgaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG5ld09iaiA9IHt9O1xuXG4gICAgaWYgKG9iaiAhPSBudWxsKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIG5ld09iai5kZWZhdWx0ID0gb2JqO1xuICAgIHJldHVybiBuZXdPYmo7XG4gIH1cbn07XG5cbnZhciBuZXdBcnJvd0NoZWNrID0gZnVuY3Rpb24gKGlubmVyVGhpcywgYm91bmRUaGlzKSB7XG4gIGlmIChpbm5lclRoaXMgIT09IGJvdW5kVGhpcykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgaW5zdGFudGlhdGUgYW4gYXJyb3cgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbnZhciBvYmplY3REZXN0cnVjdHVyaW5nRW1wdHkgPSBmdW5jdGlvbiAob2JqKSB7XG4gIGlmIChvYmogPT0gbnVsbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBkZXN0cnVjdHVyZSB1bmRlZmluZWRcIik7XG59O1xuXG52YXIgb2JqZWN0V2l0aG91dFByb3BlcnRpZXMgPSBmdW5jdGlvbiAob2JqLCBrZXlzKSB7XG4gIHZhciB0YXJnZXQgPSB7fTtcblxuICBmb3IgKHZhciBpIGluIG9iaikge1xuICAgIGlmIChrZXlzLmluZGV4T2YoaSkgPj0gMCkgY29udGludWU7XG4gICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBpKSkgY29udGludWU7XG4gICAgdGFyZ2V0W2ldID0gb2JqW2ldO1xuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn07XG5cbnZhciBwb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuID0gZnVuY3Rpb24gKHNlbGYsIGNhbGwpIHtcbiAgaWYgKCFzZWxmKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7XG59O1xuXG52YXIgc2VsZkdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogZ2xvYmFsO1xuXG52YXIgc2V0ID0gZnVuY3Rpb24gc2V0KG9iamVjdCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlcikge1xuICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgIGlmIChwYXJlbnQgIT09IG51bGwpIHtcbiAgICAgIHNldChwYXJlbnQsIHByb3BlcnR5LCB2YWx1ZSwgcmVjZWl2ZXIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYyAmJiBkZXNjLndyaXRhYmxlKSB7XG4gICAgZGVzYy52YWx1ZSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHZhciBzZXR0ZXIgPSBkZXNjLnNldDtcblxuICAgIGlmIChzZXR0ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc2V0dGVyLmNhbGwocmVjZWl2ZXIsIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59O1xuXG52YXIgc2xpY2VkVG9BcnJheSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gc2xpY2VJdGVyYXRvcihhcnIsIGkpIHtcbiAgICB2YXIgX2FyciA9IFtdO1xuICAgIHZhciBfbiA9IHRydWU7XG4gICAgdmFyIF9kID0gZmFsc2U7XG4gICAgdmFyIF9lID0gdW5kZWZpbmVkO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHtcbiAgICAgICAgX2Fyci5wdXNoKF9zLnZhbHVlKTtcblxuICAgICAgICBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZCA9IHRydWU7XG4gICAgICBfZSA9IGVycjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChfZCkgdGhyb3cgX2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF9hcnI7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgIHJldHVybiBhcnI7XG4gICAgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHtcbiAgICAgIHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpO1xuICAgIH1cbiAgfTtcbn0oKTtcblxudmFyIHNsaWNlZFRvQXJyYXlMb29zZSA9IGZ1bmN0aW9uIChhcnIsIGkpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgIHJldHVybiBhcnI7XG4gIH0gZWxzZSBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSB7XG4gICAgdmFyIF9hcnIgPSBbXTtcblxuICAgIGZvciAodmFyIF9pdGVyYXRvciA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZTspIHtcbiAgICAgIF9hcnIucHVzaChfc3RlcC52YWx1ZSk7XG5cbiAgICAgIGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gX2FycjtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTtcbiAgfVxufTtcblxudmFyIHRhZ2dlZFRlbXBsYXRlTGl0ZXJhbCA9IGZ1bmN0aW9uIChzdHJpbmdzLCByYXcpIHtcbiAgcmV0dXJuIE9iamVjdC5mcmVlemUoT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoc3RyaW5ncywge1xuICAgIHJhdzoge1xuICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUocmF3KVxuICAgIH1cbiAgfSkpO1xufTtcblxudmFyIHRhZ2dlZFRlbXBsYXRlTGl0ZXJhbExvb3NlID0gZnVuY3Rpb24gKHN0cmluZ3MsIHJhdykge1xuICBzdHJpbmdzLnJhdyA9IHJhdztcbiAgcmV0dXJuIHN0cmluZ3M7XG59O1xuXG52YXIgdGVtcG9yYWxSZWYgPSBmdW5jdGlvbiAodmFsLCBuYW1lLCB1bmRlZikge1xuICBpZiAodmFsID09PSB1bmRlZikge1xuICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihuYW1lICsgXCIgaXMgbm90IGRlZmluZWQgLSB0ZW1wb3JhbCBkZWFkIHpvbmVcIik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxufTtcblxudmFyIHRlbXBvcmFsVW5kZWZpbmVkID0ge307XG5cbnZhciB0b0FycmF5ID0gZnVuY3Rpb24gKGFycikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpID8gYXJyIDogQXJyYXkuZnJvbShhcnIpO1xufTtcblxudmFyIHRvQ29uc3VtYWJsZUFycmF5ID0gZnVuY3Rpb24gKGFycikge1xuICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgYXJyMltpXSA9IGFycltpXTtcblxuICAgIHJldHVybiBhcnIyO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBBcnJheS5mcm9tKGFycik7XG4gIH1cbn07XG5cbnZhciBTbWFydENvbXBvbmVudE1hbmFnZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU21hcnRDb21wb25lbnRNYW5hZ2VyKCkge1xuICAgICAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBTbWFydENvbXBvbmVudE1hbmFnZXIpO1xuXG4gICAgICAgIHRoaXMuY29tcG9uZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHNJbnN0YW5jZSA9IHt9O1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFNtYXJ0Q29tcG9uZW50TWFuYWdlciwgW3tcbiAgICAgICAga2V5OiBcImNvbmZpZ3VyZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29uZmlndXJlKHBhcmFtcykge1xuICAgICAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXMgfHwgeyBnYXJiYWdlQ29sbGVjdG9yOiBmYWxzZSwgZ2FyYmFnZUNvbGxlY3RvclJvb3RFbGVtZW50OiBudWxsIH07XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmFtcy5nYXJiYWdlQ29sbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQgPSB0aGlzLnBhcmFtcy5nYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJCT0RZXCIpWzBdO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmFtcy5nYXJiYWdlQ29sbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubXV0YXRpb25PYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKHRoaXMubXV0YXRpb25IYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLmdhcmJhZ2VDb2xsZWN0b3JSb290RWxlbWVudC5wYXJlbnROb2RlLCB7IGF0dHJpYnV0ZXM6IGZhbHNlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IGZhbHNlLCBzdWJ0cmVlOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcIm11dGF0aW9uSGFuZGxlclwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbXV0YXRpb25IYW5kbGVyKG11dGF0aW9uc0xpc3QpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmIChtdXRhdGlvbnNMaXN0ICYmIG11dGF0aW9uc0xpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciByZW1vdmVkRWxlbWVudHMgPSBtdXRhdGlvbnNMaXN0LmZpbHRlcihmdW5jdGlvbiAobSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5yZW1vdmVkTm9kZXMubGVuZ3RoID4gMDtcbiAgICAgICAgICAgICAgICB9KS5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIGN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZXYuY29uY2F0KGN1cnJlbnQucmVtb3ZlZE5vZGVzKTtcbiAgICAgICAgICAgICAgICB9LCBbXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVtb3ZlZEVsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRDb21wb25lbnRTdWJOb2RlcyhyZW1vdmVkRWxlbWVudHMsIFtdKS5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5nZXRBdHRyaWJ1dGUgJiYgbm9kZS5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtaWRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50SW5zdGFuY2UgPSBfdGhpcy5nZXRDb21wb25lbnRJbnN0YW5jZUJ5SWQobm9kZS5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtaWRcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnRJbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJbnN0YW5jZS5zbWFydF9kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJnZXRDb21wb25lbnRTdWJOb2Rlc1wiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Q29tcG9uZW50U3ViTm9kZXMocmVtb3ZlZEVsZW1lbnRzLCBwcmV2Tm9kZXMpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICBwcmV2Tm9kZXMgPSBwcmV2Tm9kZXMgfHwgW107XG4gICAgICAgICAgICB2YXIgcm1FbGVtZW50cyA9IHJlbW92ZWRFbGVtZW50cy5sZW5ndGggPiAwID8gcmVtb3ZlZEVsZW1lbnRzIDogW3JlbW92ZWRFbGVtZW50c107XG4gICAgICAgICAgICBybUVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKHJlbW92ZWROb2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnROb2RlID0gcmVtb3ZlZE5vZGU7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnROb2RlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBwcmV2Tm9kZXMucHVzaChfdGhpczIuZ2V0Q29tcG9uZW50U3ViTm9kZXMoW10uc2xpY2UuY2FsbChjdXJyZW50Tm9kZSksIHByZXZOb2RlcykpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Tm9kZS5nZXRBdHRyaWJ1dGUgJiYgY3VycmVudE5vZGUuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2Tm9kZXMucHVzaChjdXJyZW50Tm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnROb2RlLmNoaWxkcmVuICYmIGN1cnJlbnROb2RlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZOb2Rlcy5wdXNoKF90aGlzMi5nZXRDb21wb25lbnRTdWJOb2RlcyhbXS5zbGljZS5jYWxsKGN1cnJlbnROb2RlLmNoaWxkcmVuKSwgcHJldk5vZGVzKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwcmV2Tm9kZXM7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJyZWdpc3RlckNvbXBvbmVudHNcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlZ2lzdGVyQ29tcG9uZW50cyhjb21wb25lbnRzQ2xhc3Nlcykge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNvbXBvbmVudHNDbGFzc2VzKS5mb3JFYWNoKGZ1bmN0aW9uIChjb21wb25lbnRDbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIV90aGlzMy5nZXRDb21wb25lbnQoY29tcG9uZW50Q2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMucmVnaXN0ZXJDb21wb25lbnQoY29tcG9uZW50Q2xhc3NOYW1lLCBjb21wb25lbnRzQ2xhc3Nlc1tjb21wb25lbnRDbGFzc05hbWVdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInJlZ2lzdGVyQ29tcG9uZW50XCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZWdpc3RlckNvbXBvbmVudChuYW1lLCBjbGF6eikge1xuICAgICAgICAgICAgdGhpcy5jb21wb25lbnRzLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgY2xheno6IGNsYXp6XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInJlZ2lzdGVyQ29tcG9uZW50SW5zdGFuY2VcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlZ2lzdGVyQ29tcG9uZW50SW5zdGFuY2UoaWQsIGluc3RhbmNlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbXBvbmVudHNJbnN0YW5jZVtpZF0gPSBpbnN0YW5jZTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInJlbW92ZUNvbXBvbmVudEluc3RhbmNlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVDb21wb25lbnRJbnN0YW5jZShpZCkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuY29tcG9uZW50c0luc3RhbmNlW2lkXTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImdldENvbXBvbmVudEluc3RhbmNlQnlJZFwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Q29tcG9uZW50SW5zdGFuY2VCeUlkKGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzSW5zdGFuY2VbaWRdO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiaW5pdENvbXBvbmVudEJ5TmFtZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdENvbXBvbmVudEJ5TmFtZShlbGVtZW50LCBjb21wb25lbnROYW1lKSB7XG4gICAgICAgICAgICB2YXIgaW5zdGFuY2UgPSBudWxsO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgY2xhenogPSB0aGlzLmdldENvbXBvbmVudChjb21wb25lbnROYW1lKTtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5ldyBjbGF6eihlbGVtZW50KTsgLy9TdGFydCBVcCBDb21wb25lbnRcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3Igd2hlbiB0cnlpbmcgdG8gaW5zdGFuY2UgQ29tcG9uZW50IFwiICsgY29tcG9uZW50TmFtZSArIFwiOiBcIiArIGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiZ2V0Q29tcG9uZW50XCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRDb21wb25lbnQobmFtZSkge1xuICAgICAgICAgICAgdmFyIGNvbXAgPSB0aGlzLmNvbXBvbmVudHMuZmlsdGVyKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGMubmFtZSA9PSBuYW1lO1xuICAgICAgICAgICAgfSkubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGMuY2xheno7XG4gICAgICAgICAgICB9KVswXTtcbiAgICAgICAgICAgIHJldHVybiBjb21wO1xuICAgICAgICB9XG4gICAgfV0pO1xuICAgIHJldHVybiBTbWFydENvbXBvbmVudE1hbmFnZXI7XG59KCk7XG5cbnZhciBTbWFydENvbXBvbmVudE1hbmFnZXIkMSA9IG5ldyBTbWFydENvbXBvbmVudE1hbmFnZXIoKTtcblxudmFyIFNtYXJ0Q29tcG9uZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNtYXJ0Q29tcG9uZW50KGVsZW1lbnQsIHBhcmVudENvbXBvbmVudCwgcGFyYW1zKSB7XG4gICAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFNtYXJ0Q29tcG9uZW50KTtcblxuICAgICAgICB0aGlzLnNtYXJ0X2luaXQoZWxlbWVudCwgcGFyZW50Q29tcG9uZW50LCBwYXJhbXMpO1xuICAgIH1cblxuICAgIGNyZWF0ZUNsYXNzKFNtYXJ0Q29tcG9uZW50LCBbe1xuICAgICAgICBrZXk6IFwic21hcnRfaW5pdFwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc21hcnRfaW5pdChlbGVtZW50LCBwYXJlbnRDb21wb25lbnQsIHBhcmFtcykge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgICAgIHRoaXMuYmluZGVkRWxlbWVudHMgPSB7IFwiY2xpY2tcIjogW10gfTtcbiAgICAgICAgICAgIHRoaXMuX2NvbXBvbmVudElkID0gdGhpcy5fZ2VuZXJhdGVVaWQoKTtcbiAgICAgICAgICAgIHRoaXMucGFyZW50Q29tcG9uZW50ID0gcGFyZW50Q29tcG9uZW50O1xuICAgICAgICAgICAgdGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuXG4gICAgICAgICAgICAvL1NlcnZlIHBlciByZWN1cGVyYXJlIGlsIGNvbXBvbmVudGUgIHRyYW1pdGUgdW4gbm9tZSBkaSBmYW50YXNpYSBjb250ZW51dG8gbmVsbCdhdHRyaWJ1dG8gY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXG4gICAgICAgICAgICB2YXIgY29tcG9uZW50UmVmZXJlbmNlTmFtZSA9IHRoaXMucGFyYW1zLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUgPyB0aGlzLnBhcmFtcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lIDogdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShcImNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZVwiKTtcbiAgICAgICAgICAgIGNvbXBvbmVudFJlZmVyZW5jZU5hbWUgPSBjb21wb25lbnRSZWZlcmVuY2VOYW1lIHx8IHRoaXMuX2NvbXBvbmVudElkO1xuXG4gICAgICAgICAgICB0aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUgPSBjb21wb25lbnRSZWZlcmVuY2VOYW1lO1xuICAgICAgICAgICAgaWYgKCFlbGVtZW50LmdldEF0dHJpYnV0ZShcImNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZVwiKSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXCIsIGNvbXBvbmVudFJlZmVyZW5jZU5hbWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoaXMudmVyaWZ5Q29tcG9uZW50UmVmZXJlbmNlTmFtZVVuaWNpdHkoKSkge1xuICAgICAgICAgICAgICAgIHRocm93IHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSArIFwiIGNvbXBvbmVudFJlZmVyZW5jZU5hbWUgaXMgYWxyZWFkeSB1c2VkIGluIFwiICsgdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50UmVmZXJlbmNlTmFtZSArIFwiIGh5ZXJhcmNoeVwiO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgU21hcnRDb21wb25lbnRNYW5hZ2VyJDEucmVnaXN0ZXJDb21wb25lbnRJbnN0YW5jZSh0aGlzLl9jb21wb25lbnRJZCwgdGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtaWRcIiwgdGhpcy5fY29tcG9uZW50SWQpO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnRcIikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiY29tcG9uZW50XCIsIHRoaXMuY29uc3RydWN0b3IubmFtZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudENvbXBvbmVudCAmJiAhdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50cykge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Q29tcG9uZW50LmNvbXBvbmVudHMgPSB7fTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50Q29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50c1tjb21wb25lbnRSZWZlcmVuY2VOYW1lXSA9IHRoaXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LWNsaWNrXCIpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5iaW5kQ29tcG9uZW50Q2xpY2sodGhpcy5lbGVtZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG5vZGVzVG9CaW5kID0gdGhpcy5fZ2V0Q29tcG9uZW50Q2xpY2tOb2RlVG9CaW5kKFt0aGlzLmVsZW1lbnRdKTtcbiAgICAgICAgICAgIGlmIChub2Rlc1RvQmluZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzVG9CaW5kLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tDb21wb25lbnRzSGllcmFyY2h5QW5kQmluZENsaWNrKG5vZGVzVG9CaW5kW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vVGhlIG11dGF0aW9uT2JzZXJ2ZXIgaXMgdXNlZCBpbiBvcmRlciB0byByZXRyaWV2ZSBhbmQgaGFuZGxpbmcgY29tcG9uZW50LVwiZXZlbnRcIlxuICAgICAgICAgICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIodGhpcy5fbXV0YXRpb25IYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyLm9ic2VydmUodGhpcy5lbGVtZW50LnBhcmVudE5vZGUsIHsgYXR0cmlidXRlczogZmFsc2UsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJfbXV0YXRpb25IYW5kbGVyXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfbXV0YXRpb25IYW5kbGVyKG11dGF0aW9uc0xpc3QpIHtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50TXV0YXRpb25IYW5kbGVyKG11dGF0aW9uc0xpc3QpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwidmVyaWZ5Q29tcG9uZW50UmVmZXJlbmNlTmFtZVVuaWNpdHlcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHZlcmlmeUNvbXBvbmVudFJlZmVyZW5jZU5hbWVVbmljaXR5KCkge1xuICAgICAgICAgICAgcmV0dXJuICF0aGlzLnBhcmVudENvbXBvbmVudCB8fCAhdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50cyB8fCAhdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50c1t0aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWVdO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiX2dlbmVyYXRlVWlkXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZ2VuZXJhdGVVaWQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lICsgXCJfXCIgKyAneHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkgKiAxNiB8IDAsXG4gICAgICAgICAgICAgICAgICAgIHYgPSBjID09ICd4JyA/IHIgOiByICYgMHgzIHwgMHg4O1xuICAgICAgICAgICAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwic21hcnRfY2xpY2tIYW5kbGVyXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzbWFydF9jbGlja0hhbmRsZXIoZXYpIHtcbiAgICAgICAgICAgIHZhciBmdW5jdGlvbkNvZGUgPSBldi5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnY29tcG9uZW50LWNsaWNrJyk7XG4gICAgICAgICAgICB2YXIgZnVuY3Rpb25OYW1lID0gZnVuY3Rpb25Db2RlLnNwbGl0KFwiKFwiKVswXTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gZXh0cmFjdFBhcmFtcygpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgcGFyYW1zID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgcGFyYW1ldGVycyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyYW1ldGVycy5tYXAoZnVuY3Rpb24gKHBhcmFtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbSA9PSBcInRoaXNcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcmFtO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzW2Z1bmN0aW9uTmFtZV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzW2Z1bmN0aW9uTmFtZV0uYXBwbHkodGhpcywgZXZhbChcImV4dHJhY3RQYXJhbXMoXCIgKyBmdW5jdGlvbkNvZGUuc3BsaXQoXCIoXCIpWzFdKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJsb2FkQ2hpbGRDb21wb25lbnRzXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkQ2hpbGRDb21wb25lbnRzKHBhcmVudENvbXBvbmVudCkge1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudHNMb2FkZWQgPSBbXTtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnRzRWxzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tjb21wb25lbnRdJyk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBvbmVudHNFbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50SWQgPSBjb21wb25lbnRzRWxzW2ldLmdldEF0dHJpYnV0ZSgnY29tcG9uZW50LWlkJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudElkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSBjb21wb25lbnRzRWxzW2ldLmdldEF0dHJpYnV0ZSgnY29tcG9uZW50Jyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBDbGF6eiA9IFNtYXJ0Q29tcG9uZW50TWFuYWdlciQxLmdldENvbXBvbmVudChjb21wb25lbnQpO1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzTG9hZGVkLnB1c2gobmV3IENsYXp6KGNvbXBvbmVudHNFbHNbaV0sIHBhcmVudENvbXBvbmVudCB8fCB0aGlzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudHNMb2FkZWQ7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJfYmluZENvbXBvbmVudENsaWNrXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYmluZENvbXBvbmVudENsaWNrKG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBpc0FscmVhZHlCaW5kZWQgPSB0aGlzLmJpbmRlZEVsZW1lbnRzW1wiY2xpY2tcIl0ucmVkdWNlKGZ1bmN0aW9uIChhY2N1bXVsYXRvciwgY3VycmVudE5vZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjdW11bGF0b3IgfHwgY3VycmVudE5vZGUuaXNFcXVhbE5vZGUobm9kZSk7XG4gICAgICAgICAgICB9LCBmYWxzZSk7XG5cbiAgICAgICAgICAgIGlmICghaXNBbHJlYWR5QmluZGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5iaW5kZWRFbGVtZW50c1tcImNsaWNrXCJdLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNtYXJ0X2NsaWNrSGFuZGxlcihlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImNoZWNrQ29tcG9uZW50c0hpZXJhcmNoeUFuZEJpbmRDbGlja1wiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2hlY2tDb21wb25lbnRzSGllcmFyY2h5QW5kQmluZENsaWNrKG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnRzQ29tcG9uZW50ID0gdGhpcy5fZ2V0RG9tRWxlbWVudFBhcmVudHMobm9kZSwgJ1tjb21wb25lbnQtcmVmZXJlbmNlLW5hbWVdJyk7XG4gICAgICAgICAgICBpZiAocGFyZW50c0NvbXBvbmVudC5sZW5ndGggPiAwICYmIHBhcmVudHNDb21wb25lbnRbMF0uZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXCIpID09IHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRDb21wb25lbnRDbGljayhub2RlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiX2dldERvbUVsZW1lbnRQYXJlbnRzXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZ2V0RG9tRWxlbWVudFBhcmVudHMoZWxlbSwgc2VsZWN0b3IpIHtcbiAgICAgICAgICAgIC8vIEVsZW1lbnQubWF0Y2hlcygpIHBvbHlmaWxsXG4gICAgICAgICAgICBpZiAoIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzID0gRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlc1NlbGVjdG9yIHx8IEVsZW1lbnQucHJvdG90eXBlLm1vek1hdGNoZXNTZWxlY3RvciB8fCBFbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvciB8fCBFbGVtZW50LnByb3RvdHlwZS5vTWF0Y2hlc1NlbGVjdG9yIHx8IEVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fCBmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlcyA9ICh0aGlzLmRvY3VtZW50IHx8IHRoaXMub3duZXJEb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPSBtYXRjaGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKC0taSA+PSAwICYmIG1hdGNoZXMuaXRlbShpKSAhPT0gdGhpcykge31cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGkgPiAtMTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gU2V0dXAgcGFyZW50cyBhcnJheVxuICAgICAgICAgICAgdmFyIHBhcmVudHMgPSBbXTtcbiAgICAgICAgICAgIC8vIEdldCBtYXRjaGluZyBwYXJlbnQgZWxlbWVudHNcbiAgICAgICAgICAgIGZvciAoOyBlbGVtICYmIGVsZW0gIT09IGRvY3VtZW50OyBlbGVtID0gZWxlbS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAgICAgLy8gQWRkIG1hdGNoaW5nIHBhcmVudHMgdG8gYXJyYXlcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW0ubWF0Y2hlcyhzZWxlY3RvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudHMucHVzaChlbGVtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudHMucHVzaChlbGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcGFyZW50cztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcIl9ldmVudE11dGF0aW9uSGFuZGxlclwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX2V2ZW50TXV0YXRpb25IYW5kbGVyKG11dGF0aW9uc0xpc3QpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAobXV0YXRpb25zTGlzdCAmJiBtdXRhdGlvbnNMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgbXV0YXRpb25FbGVtZW50cyA9IG11dGF0aW9uc0xpc3QuZmlsdGVyKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmFkZGVkTm9kZXMubGVuZ3RoID4gMDtcbiAgICAgICAgICAgICAgICB9KS5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIGN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZXYuY29uY2F0KF90aGlzMi5fZ2V0Q29tcG9uZW50Q2xpY2tOb2RlVG9CaW5kKGN1cnJlbnQuYWRkZWROb2RlcykpO1xuICAgICAgICAgICAgICAgIH0sIFtdKTtcblxuICAgICAgICAgICAgICAgIGlmIChtdXRhdGlvbkVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG11dGF0aW9uRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tDb21wb25lbnRzSGllcmFyY2h5QW5kQmluZENsaWNrKG11dGF0aW9uRWxlbWVudHNbaV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiX2dldENvbXBvbmVudENsaWNrTm9kZVRvQmluZFwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX2dldENvbXBvbmVudENsaWNrTm9kZVRvQmluZChtb2Rlc1RvQ2hlY2spIHtcbiAgICAgICAgICAgIHZhciBub2Rlc1RvQmluZCA9IFtdO1xuICAgICAgICAgICAgaWYgKG1vZGVzVG9DaGVjay5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vZGVzVG9DaGVjay5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IG1vZGVzVG9DaGVja1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUucXVlcnlTZWxlY3RvckFsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudENsaWNrRWxlbWVudHMgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tjb21wb25lbnQtY2xpY2tdJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5nZXRBdHRyaWJ1dGUoJ2NvbXBvbmVudC1jbGljaycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNUb0JpbmQucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnRDbGlja0VsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgY29tcG9uZW50Q2xpY2tFbGVtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNUb0JpbmQucHVzaChjb21wb25lbnRDbGlja0VsZW1lbnRzW19pXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5vZGVzVG9CaW5kO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbGxlZCBieSBDb21wb25lbnRNYW5hZ2VyICB3aGVuIGRvbSBjb21wb25lbnQgaXMgcmVtb3ZlZCwgb3RoZXJ3aXNlIHlvdSBjYW4gYWxzbyBjYWxsIGl0IGRpcmVjdGx5IGlmIHlvdSBuZWVkIG9yIG92ZXJyaWRlIGl0XG4gICAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAgICBrZXk6IFwic21hcnRfZGVzdHJveVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc21hcnRfZGVzdHJveSgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSArIFwiIGRlc3Ryb3llZFwiKTtcbiAgICAgICAgICAgIHRoaXMubXV0YXRpb25PYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICBTbWFydENvbXBvbmVudE1hbmFnZXIkMS5yZW1vdmVDb21wb25lbnRJbnN0YW5jZSh0aGlzLl9jb21wb25lbnRJZCk7XG4gICAgICAgICAgICBpZiAodGhpcy5lbGVtZW50LmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBmb3IgYWxsIHByb3BlcnRpZXNcbiAgICAgICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzW3Byb3BdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIFNtYXJ0Q29tcG9uZW50O1xufSgpO1xuXG5leHBvcnQgeyBTbWFydENvbXBvbmVudE1hbmFnZXIkMSBhcyBTbWFydENvbXBvbmVudE1hbmFnZXIsIFNtYXJ0Q29tcG9uZW50IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVUyMWhjblJEYjIxd2IyNWxiblJLVXk1cWN5SXNJbk52ZFhKalpYTWlPbHNpTGk0dmMzSmpMMU50WVhKMFEyOXRjRzl1Wlc1MFRXRnVZV2RsY2k1cWN5SXNJaTR1TDNOeVl5OVRiV0Z5ZEVOdmJYQnZibVZ1ZEM1cWN5SmRMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXeUpjYm1Oc1lYTnpJRk50WVhKMFEyOXRjRzl1Wlc1MFRXRnVZV2RsY2lCN1hHNGdJQ0FnWTI5dWMzUnlkV04wYjNJb0tTQjdYRzRnSUNBZ0lDQWdJSFJvYVhNdVkyOXRjRzl1Wlc1MGN5QTlJRnRkTzF4dUlDQWdJQ0FnSUNCMGFHbHpMbU52YlhCdmJtVnVkSE5KYm5OMFlXNWpaVDE3ZlR0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0JqYjI1bWFXZDFjbVVvY0dGeVlXMXpLWHRjYmlBZ0lDQWdJQ0FnZEdocGN5NXdZWEpoYlhNZ1BTQndZWEpoYlhNZ2ZId2dlMmRoY21KaFoyVkRiMnhzWldOMGIzSTZabUZzYzJVc1oyRnlZbUZuWlVOdmJHeGxZM1J2Y2xKdmIzUkZiR1Z0Wlc1ME9tNTFiR3g5TzF4dVhHNGdJQ0FnSUNBZ0lHbG1LSFJvYVhNdWNHRnlZVzF6TG1kaGNtSmhaMlZEYjJ4c1pXTjBiM0lwZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1bllYSmlZV2RsUTI5c2JHVmpkRzl5VW05dmRFVnNaVzFsYm5ROWRHaHBjeTV3WVhKaGJYTXVaMkZ5WW1GblpVTnZiR3hsWTNSdmNsSnZiM1JGYkdWdFpXNTBJSHg4SUdSdlkzVnRaVzUwTG1kbGRFVnNaVzFsYm5SelFubFVZV2RPWVcxbEtGd2lRazlFV1Z3aUtWc3dYVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1LSFJvYVhNdWNHRnlZVzF6TG1kaGNtSmhaMlZEYjJ4c1pXTjBiM0lwZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSb2FYTXViWFYwWVhScGIyNVBZbk5sY25abGNqMGdibVYzSUUxMWRHRjBhVzl1VDJKelpYSjJaWElvZEdocGN5NXRkWFJoZEdsdmJraGhibVJzWlhJdVltbHVaQ2gwYUdsektTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1dGRYUmhkR2x2Yms5aWMyVnlkbVZ5TG05aWMyVnlkbVVvZEdocGN5NW5ZWEppWVdkbFEyOXNiR1ZqZEc5eVVtOXZkRVZzWlcxbGJuUXVjR0Z5Wlc1MFRtOWtaU3g3WVhSMGNtbGlkWFJsY3pvZ1ptRnNjMlVzSUdOb2FXeGtUR2x6ZERvZ2RISjFaU3dnWTJoaGNtRmpkR1Z5UkdGMFlUb2dabUZzYzJVc0lITjFZblJ5WldVNklIUnlkV1Y5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmx4dUlDQWdJRzExZEdGMGFXOXVTR0Z1Wkd4bGNpaHRkWFJoZEdsdmJuTk1hWE4wS1h0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtS0cxMWRHRjBhVzl1YzB4cGMzUWdKaVlnYlhWMFlYUnBiMjV6VEdsemRDNXNaVzVuZEdnK01DbDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiR1YwSUhKbGJXOTJaV1JGYkdWdFpXNTBjejBnYlhWMFlYUnBiMjV6VEdsemRDNW1hV3gwWlhJb0tHMHBJRDArSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHMHVjbVZ0YjNabFpFNXZaR1Z6TG14bGJtZDBhQ0ErSURBN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTa3VjbVZrZFdObEtDaHdjbVYyTENCamRYSnlaVzUwS1NBOVBpQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJ3Y21WMkxtTnZibU5oZENoamRYSnlaVzUwTG5KbGJXOTJaV1JPYjJSbGN5azdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU3dnVzEwcE8xeHVYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lvY21WdGIzWmxaRVZzWlcxbGJuUnpMbXhsYm1kMGFENHdLWHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbWRsZEVOdmJYQnZibVZ1ZEZOMVlrNXZaR1Z6S0hKbGJXOTJaV1JGYkdWdFpXNTBjeXhiWFNrdVptOXlSV0ZqYUNnb2JtOWtaU2s5UG50Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZb2JtOWtaUzVuWlhSQmRIUnlhV0oxZEdVZ0ppWWdibTlrWlM1blpYUkJkSFJ5YVdKMWRHVW9YQ0pqYjIxd2IyNWxiblF0YVdSY0lpa3BlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYkdWMElHTnZiWEJ2Ym1WdWRFbHVjM1JoYm1ObFBYUm9hWE11WjJWMFEyOXRjRzl1Wlc1MFNXNXpkR0Z1WTJWQ2VVbGtLRzV2WkdVdVoyVjBRWFIwY21saWRYUmxLRndpWTI5dGNHOXVaVzUwTFdsa1hDSXBLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUtHTnZiWEJ2Ym1WdWRFbHVjM1JoYm1ObEtYdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCamIyMXdiMjVsYm5SSmJuTjBZVzVqWlM1emJXRnlkRjlrWlhOMGNtOTVLQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlLVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmVnh1WEc0Z0lDQWdaMlYwUTI5dGNHOXVaVzUwVTNWaVRtOWtaWE1vY21WdGIzWmxaRVZzWlcxbGJuUnpMSEJ5WlhaT2IyUmxjeWw3WEc0Z0lDQWdJQ0FnSUhCeVpYWk9iMlJsY3lBOWNISmxkazV2WkdWeklIeDhJRnRkTzF4dUlDQWdJQ0FnSUNCc1pYUWdjbTFGYkdWdFpXNTBjejF5WlcxdmRtVmtSV3hsYldWdWRITXViR1Z1WjNSb1BqQWdQeUJ5WlcxdmRtVmtSV3hsYldWdWRITTZXM0psYlc5MlpXUkZiR1Z0Wlc1MGMxMDdYRzRnSUNBZ0lDQWdJSEp0Uld4bGJXVnVkSE11Wm05eVJXRmphQ2dvY21WdGIzWmxaRTV2WkdVcFBUNTdYRzRnSUNBZ0lDQWdJQ0FnSUNCc1pYUWdZM1Z5Y21WdWRFNXZaR1U5Y21WdGIzWmxaRTV2WkdVN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmloamRYSnlaVzUwVG05a1pTNXNaVzVuZEdncGUxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIQnlaWFpPYjJSbGN5NXdkWE5vS0hSb2FYTXVaMlYwUTI5dGNHOXVaVzUwVTNWaVRtOWtaWE1vVzEwdWMyeHBZMlV1WTJGc2JDaGpkWEp5Wlc1MFRtOWtaU2tzY0hKbGRrNXZaR1Z6S1NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5Wld4elpYdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaWhqZFhKeVpXNTBUbTlrWlM1blpYUkJkSFJ5YVdKMWRHVWdKaVlnWTNWeWNtVnVkRTV2WkdVdVoyVjBRWFIwY21saWRYUmxLRndpWTI5dGNHOXVaVzUwWENJcEtYdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY0hKbGRrNXZaR1Z6TG5CMWMyZ29ZM1Z5Y21WdWRFNXZaR1VwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppaGpkWEp5Wlc1MFRtOWtaUzVqYUdsc1pISmxiaUFtSmlCamRYSnlaVzUwVG05a1pTNWphR2xzWkhKbGJpNXNaVzVuZEdnK01DbDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhCeVpYWk9iMlJsY3k1d2RYTm9LSFJvYVhNdVoyVjBRMjl0Y0c5dVpXNTBVM1ZpVG05a1pYTW9XMTB1YzJ4cFkyVXVZMkZzYkNoamRYSnlaVzUwVG05a1pTNWphR2xzWkhKbGJpa3NjSEpsZGs1dlpHVnpLU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0FnSUgwcFhHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCd2NtVjJUbTlrWlhNN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnY21WbmFYTjBaWEpEYjIxd2IyNWxiblJ6S0dOdmJYQnZibVZ1ZEhORGJHRnpjMlZ6S1h0Y2JpQWdJQ0FnSUNBZ1QySnFaV04wTG10bGVYTW9ZMjl0Y0c5dVpXNTBjME5zWVhOelpYTXBMbVp2Y2tWaFkyZ29LR052YlhCdmJtVnVkRU5zWVhOelRtRnRaU2s5UG50Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtS0NGMGFHbHpMbWRsZEVOdmJYQnZibVZ1ZENoamIyMXdiMjVsYm5SRGJHRnpjMDVoYldVcEtYdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG5KbFoybHpkR1Z5UTI5dGNHOXVaVzUwS0dOdmJYQnZibVZ1ZEVOc1lYTnpUbUZ0WlN4amIyMXdiMjVsYm5SelEyeGhjM05sYzF0amIyMXdiMjVsYm5SRGJHRnpjMDVoYldWZEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2ZTbGNiaUFnSUNCOVhHNWNibHh1SUNBZ0lISmxaMmx6ZEdWeVEyOXRjRzl1Wlc1MEtHNWhiV1VzWTJ4aGVub3BJSHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWpiMjF3YjI1bGJuUnpMbkIxYzJnb2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYm1GdFpUb2dibUZ0WlN4Y2JpQWdJQ0FnSUNBZ0lDQWdJR05zWVhwNk9pQmpiR0Y2ZWx4dUlDQWdJQ0FnSUNCOUtUdGNiaUFnSUNCOVhHNWNibHh1SUNBZ0lISmxaMmx6ZEdWeVEyOXRjRzl1Wlc1MFNXNXpkR0Z1WTJVb2FXUXNhVzV6ZEdGdVkyVXBJSHRjYmlBZ0lDQWdJQ0FnZEdocGN5NWpiMjF3YjI1bGJuUnpTVzV6ZEdGdVkyVmJhV1JkUFdsdWMzUmhibU5sTzF4dUlDQWdJSDFjYmx4dUlDQWdJSEpsYlc5MlpVTnZiWEJ2Ym1WdWRFbHVjM1JoYm1ObEtHbGtLU0I3WEc0Z0lDQWdJQ0FnSUdSbGJHVjBaU0IwYUdsekxtTnZiWEJ2Ym1WdWRITkpibk4wWVc1alpWdHBaRjA3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdaMlYwUTI5dGNHOXVaVzUwU1c1emRHRnVZMlZDZVVsa0tHbGtLWHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJSFJvYVhNdVkyOXRjRzl1Wlc1MGMwbHVjM1JoYm1ObFcybGtYVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQnBibWwwUTI5dGNHOXVaVzUwUW5sT1lXMWxLR1ZzWlcxbGJuUXNZMjl0Y0c5dVpXNTBUbUZ0WlNsN1hHNGdJQ0FnSUNBZ0lHeGxkQ0JwYm5OMFlXNWpaVDF1ZFd4c08xeHVJQ0FnSUNBZ0lDQjBjbmw3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnWTJ4aGVub2dQU0IwYUdsekxtZGxkRU52YlhCdmJtVnVkQ2hqYjIxd2IyNWxiblJPWVcxbEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsdWMzUmhibU5sUFc1bGR5QmpiR0Y2ZWlobGJHVnRaVzUwS1RzZ0x5OVRkR0Z5ZENCVmNDQkRiMjF3YjI1bGJuUmNiaUFnSUNBZ0lDQWdmV05oZEdOb0tHVXBlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1kyOXVjMjlzWlM1bGNuSnZjaWhjSWtWeWNtOXlJSGRvWlc0Z2RISjVhVzVuSUhSdklHbHVjM1JoYm1ObElFTnZiWEJ2Ym1WdWRDQmNJaUFySUdOdmJYQnZibVZ1ZEU1aGJXVWdLMXdpT2lCY0lpc2daU2s3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdsdWMzUmhibU5sTzF4dUlDQWdJSDFjYmx4dUlDQWdJR2RsZEVOdmJYQnZibVZ1ZENodVlXMWxLU0I3WEc0Z0lDQWdJQ0FnSUhaaGNpQmpiMjF3SUQwZ2RHaHBjeTVqYjIxd2IyNWxiblJ6TG1acGJIUmxjaWhqSUQwK0lHTXVibUZ0WlNBOVBTQnVZVzFsS1M1dFlYQW9ZeUE5UGlCakxtTnNZWHA2S1Zzd1hUdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHTnZiWEE3WEc0Z0lDQWdmVnh1ZlZ4dVhHNWxlSEJ2Y25RZ1pHVm1ZWFZzZENCdVpYY2dVMjFoY25SRGIyMXdiMjVsYm5STllXNWhaMlZ5S0NrN1hHNGlMQ0pwYlhCdmNuUWdVMjFoY25SRGIyMXdiMjVsYm5STllXNWhaMlZ5SUdaeWIyMGdKeTR2VTIxaGNuUkRiMjF3YjI1bGJuUk5ZVzVoWjJWeUp6dGNibHh1WTJ4aGMzTWdVMjFoY25SRGIyMXdiMjVsYm5RZ2UxeHVJQ0FnSUdOdmJuTjBjblZqZEc5eUtHVnNaVzFsYm5Rc0lIQmhjbVZ1ZEVOdmJYQnZibVZ1ZEN3Z2NHRnlZVzF6S1NCN1hHNGdJQ0FnSUNBZ0lIUm9hWE11YzIxaGNuUmZhVzVwZENobGJHVnRaVzUwTENCd1lYSmxiblJEYjIxd2IyNWxiblFzSUhCaGNtRnRjeWs3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdjMjFoY25SZmFXNXBkQ2hsYkdWdFpXNTBMQ0J3WVhKbGJuUkRiMjF3YjI1bGJuUXNJSEJoY21GdGN5bDdYRzRnSUNBZ0lDQWdJSFJvYVhNdVpXeGxiV1Z1ZENBOUlHVnNaVzFsYm5RN1hHNGdJQ0FnSUNBZ0lIUm9hWE11WW1sdVpHVmtSV3hsYldWdWRITWdQU0I3WENKamJHbGphMXdpT2x0ZGZUdGNiaUFnSUNBZ0lDQWdkR2hwY3k1ZlkyOXRjRzl1Wlc1MFNXUWdQU0FnZEdocGN5NWZaMlZ1WlhKaGRHVlZhV1FvS1R0Y2JpQWdJQ0FnSUNBZ2RHaHBjeTV3WVhKbGJuUkRiMjF3YjI1bGJuUWdQU0J3WVhKbGJuUkRiMjF3YjI1bGJuUTdYRzRnSUNBZ0lDQWdJSFJvYVhNdVkyOXRjRzl1Wlc1MFVtVm1aWEpsYm1ObFRtRnRaU0E5SUc1MWJHdzdYRzRnSUNBZ0lDQWdJSFJvYVhNdWNHRnlZVzF6SUQwZ2NHRnlZVzF6SUh4OElIdDlPMXh1WEc1Y2JseHVJQ0FnSUNBZ0lDQXZMMU5sY25abElIQmxjaUJ5WldOMWNHVnlZWEpsSUdsc0lHTnZiWEJ2Ym1WdWRHVWdJSFJ5WVcxcGRHVWdkVzRnYm05dFpTQmthU0JtWVc1MFlYTnBZU0JqYjI1MFpXNTFkRzhnYm1Wc2JDZGhkSFJ5YVdKMWRHOGdZMjl0Y0c5dVpXNTBMWEpsWm1WeVpXNWpaUzF1WVcxbFhHNGdJQ0FnSUNBZ0lHeGxkQ0JqYjIxd2IyNWxiblJTWldabGNtVnVZMlZPWVcxbElEMGdkR2hwY3k1d1lYSmhiWE11WTI5dGNHOXVaVzUwVW1WbVpYSmxibU5sVG1GdFpTQS9JSFJvYVhNdWNHRnlZVzF6TG1OdmJYQnZibVZ1ZEZKbFptVnlaVzVqWlU1aGJXVWdPaUIwYUdsekxtVnNaVzFsYm5RdVoyVjBRWFIwY21saWRYUmxLRndpWTI5dGNHOXVaVzUwTFhKbFptVnlaVzVqWlMxdVlXMWxYQ0lwTzF4dUlDQWdJQ0FnSUNCamIyMXdiMjVsYm5SU1pXWmxjbVZ1WTJWT1lXMWxQV052YlhCdmJtVnVkRkpsWm1WeVpXNWpaVTVoYldVZ2ZId2dkR2hwY3k1ZlkyOXRjRzl1Wlc1MFNXUTdYRzVjYmlBZ0lDQWdJQ0FnZEdocGN5NWpiMjF3YjI1bGJuUlNaV1psY21WdVkyVk9ZVzFsSUQwZ1kyOXRjRzl1Wlc1MFVtVm1aWEpsYm1ObFRtRnRaVHRjYmlBZ0lDQWdJQ0FnYVdZZ0tDRmxiR1Z0Wlc1MExtZGxkRUYwZEhKcFluVjBaU2hjSW1OdmJYQnZibVZ1ZEMxeVpXWmxjbVZ1WTJVdGJtRnRaVndpS1NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWld4bGJXVnVkQzV6WlhSQmRIUnlhV0oxZEdVb1hDSmpiMjF3YjI1bGJuUXRjbVZtWlhKbGJtTmxMVzVoYldWY0lpd2dZMjl0Y0c5dVpXNTBVbVZtWlhKbGJtTmxUbUZ0WlNrN1hHNGdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0JwWmlnaGRHaHBjeTUyWlhKcFpubERiMjF3YjI1bGJuUlNaV1psY21WdVkyVk9ZVzFsVlc1cFkybDBlU2dwS1h0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvY205M0lIUm9hWE11WTI5dGNHOXVaVzUwVW1WbVpYSmxibU5sVG1GdFpTQXJYQ0lnWTI5dGNHOXVaVzUwVW1WbVpYSmxibU5sVG1GdFpTQnBjeUJoYkhKbFlXUjVJSFZ6WldRZ2FXNGdYQ0lyZEdocGN5NXdZWEpsYm5SRGIyMXdiMjVsYm5RdVkyOXRjRzl1Wlc1MFVtVm1aWEpsYm1ObFRtRnRaU0FyWENJZ2FIbGxjbUZ5WTJoNVhDSTdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWm1Gc2MyVTdYRzRnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNCVGJXRnlkRU52YlhCdmJtVnVkRTFoYm1GblpYSXVjbVZuYVhOMFpYSkRiMjF3YjI1bGJuUkpibk4wWVc1alpTaDBhR2x6TGw5amIyMXdiMjVsYm5SSlpDeDBhR2x6S1R0Y2JseHVYRzRnSUNBZ0lDQWdJSFJvYVhNdVpXeGxiV1Z1ZEM1elpYUkJkSFJ5YVdKMWRHVW9YQ0pqYjIxd2IyNWxiblF0YVdSY0lpeDBhR2x6TGw5amIyMXdiMjVsYm5SSlpDazdYRzVjYmlBZ0lDQWdJQ0FnYVdZb0lYUm9hWE11Wld4bGJXVnVkQzVuWlhSQmRIUnlhV0oxZEdVb1hDSmpiMjF3YjI1bGJuUmNJaWtwZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1bGJHVnRaVzUwTG5ObGRFRjBkSEpwWW5WMFpTaGNJbU52YlhCdmJtVnVkRndpTEhSb2FYTXVZMjl1YzNSeWRXTjBiM0l1Ym1GdFpTazdYRzRnSUNBZ0lDQWdJSDFjYmx4dVhHNGdJQ0FnSUNBZ0lHbG1LSFJvYVhNdWNHRnlaVzUwUTI5dGNHOXVaVzUwSUNZbUlDRjBhR2x6TG5CaGNtVnVkRU52YlhCdmJtVnVkQzVqYjIxd2IyNWxiblJ6S1h0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdWNHRnlaVzUwUTI5dGNHOXVaVzUwTG1OdmJYQnZibVZ1ZEhNOWUzMDdYRzRnSUNBZ0lDQWdJSDFjYmx4dVhHNWNiaUFnSUNBZ0lDQWdhV1lvZEdocGN5NXdZWEpsYm5SRGIyMXdiMjVsYm5RcGUxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NXdZWEpsYm5SRGIyMXdiMjVsYm5RdVkyOXRjRzl1Wlc1MGMxdGpiMjF3YjI1bGJuUlNaV1psY21WdVkyVk9ZVzFsWFNBOUlIUm9hWE03WEc0Z0lDQWdJQ0FnSUgxY2JseHVYRzRnSUNBZ0lDQWdJR2xtS0hSb2FYTXVaV3hsYldWdWRDNW5aWFJCZEhSeWFXSjFkR1VvWENKamIyMXdiMjVsYm5RdFkyeHBZMnRjSWlrcGUxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWlhVzVrUTI5dGNHOXVaVzUwUTJ4cFkyc29kR2hwY3k1bGJHVnRaVzUwS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJR3hsZENCdWIyUmxjMVJ2UW1sdVpDQTlkR2hwY3k1ZloyVjBRMjl0Y0c5dVpXNTBRMnhwWTJ0T2IyUmxWRzlDYVc1a0tGdDBhR2x6TG1Wc1pXMWxiblJkS1R0Y2JpQWdJQ0FnSUNBZ2FXWW9ibTlrWlhOVWIwSnBibVF1YkdWdVozUm9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJRzV2WkdWelZHOUNhVzVrTG14bGJtZDBhRHNnYVNzcktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1amFHVmphME52YlhCdmJtVnVkSE5JYVdWeVlYSmphSGxCYm1SQ2FXNWtRMnhwWTJzb2JtOWtaWE5VYjBKcGJtUmJhVjBwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0I5WEc1Y2JpQWdJQ0FnSUNBZ0x5OVVhR1VnYlhWMFlYUnBiMjVQWW5ObGNuWmxjaUJwY3lCMWMyVmtJR2x1SUc5eVpHVnlJSFJ2SUhKbGRISnBaWFpsSUdGdVpDQm9ZVzVrYkdsdVp5QmpiMjF3YjI1bGJuUXRYQ0psZG1WdWRGd2lYRzRnSUNBZ0lDQWdJSFJvYVhNdWJYVjBZWFJwYjI1UFluTmxjblpsY2owZ2JtVjNJRTExZEdGMGFXOXVUMkp6WlhKMlpYSW9kR2hwY3k1ZmJYVjBZWFJwYjI1SVlXNWtiR1Z5TG1KcGJtUW9kR2hwY3lrcE8xeHVJQ0FnSUNBZ0lDQjBhR2x6TG0xMWRHRjBhVzl1VDJKelpYSjJaWEl1YjJKelpYSjJaU2gwYUdsekxtVnNaVzFsYm5RdWNHRnlaVzUwVG05a1pTeDdZWFIwY21saWRYUmxjem9nWm1Gc2MyVXNJR05vYVd4a1RHbHpkRG9nZEhKMVpTd2dZMmhoY21GamRHVnlSR0YwWVRvZ1ptRnNjMlVzSUhOMVluUnlaV1U2SUhSeWRXVjlLVHRjYmx4dUlDQWdJSDFjYmx4dUlDQWdJRjl0ZFhSaGRHbHZia2hoYm1Sc1pYSW9iWFYwWVhScGIyNXpUR2x6ZENsN1hHNGdJQ0FnSUNBZ0lIUm9hWE11WDJWMlpXNTBUWFYwWVhScGIyNUlZVzVrYkdWeUtHMTFkR0YwYVc5dWMweHBjM1FwTzF4dUlDQWdJSDFjYmx4dVhHNGdJQ0FnZG1WeWFXWjVRMjl0Y0c5dVpXNTBVbVZtWlhKbGJtTmxUbUZ0WlZWdWFXTnBkSGtvS1h0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUNBaGRHaHBjeTV3WVhKbGJuUkRiMjF3YjI1bGJuUWdmSHdnSVhSb2FYTXVjR0Z5Wlc1MFEyOXRjRzl1Wlc1MExtTnZiWEJ2Ym1WdWRITWdJSHg4SUNBaGRHaHBjeTV3WVhKbGJuUkRiMjF3YjI1bGJuUXVZMjl0Y0c5dVpXNTBjMXQwYUdsekxtTnZiWEJ2Ym1WdWRGSmxabVZ5Wlc1alpVNWhiV1ZkTzF4dUlDQWdJSDFjYmx4dUlDQWdJRjluWlc1bGNtRjBaVlZwWkNncElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlDQjBhR2x6TG1OdmJuTjBjblZqZEc5eUxtNWhiV1VyWENKZlhDSXJKM2g0ZUhoNGVIaDRKeTV5WlhCc1lXTmxLQzliZUhsZEwyY3NJR1oxYm1OMGFXOXVJQ2hqS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2NpQTlJRTFoZEdndWNtRnVaRzl0S0NrZ0tpQXhOaUI4SURBc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RpQTlJR01nUFQwZ0ozZ25JRDhnY2lBNklDaHlJQ1lnTUhneklId2dNSGc0S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQjJMblJ2VTNSeWFXNW5LREUyS1R0Y2JpQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ2MyMWhjblJmWTJ4cFkydElZVzVrYkdWeUtHVjJLU0I3WEc0Z0lDQWdJQ0FnSUd4bGRDQm1kVzVqZEdsdmJrTnZaR1VnUFNCbGRpNWpkWEp5Wlc1MFZHRnlaMlYwTG1kbGRFRjBkSEpwWW5WMFpTZ25ZMjl0Y0c5dVpXNTBMV05zYVdOckp5azdYRzRnSUNBZ0lDQWdJR3hsZENCbWRXNWpkR2x2Yms1aGJXVWdQU0JtZFc1amRHbHZia052WkdVdWMzQnNhWFFvWENJb1hDSXBXekJkTzF4dVhHNGdJQ0FnSUNBZ0lHWjFibU4wYVc5dUlHVjRkSEpoWTNSUVlYSmhiWE1vTGk0dWNHRnlZVzF6S1NCN1hHNWNiaUFnSUNBZ0lDQWdJQ0FnSUd4bGRDQndZWEpoYldWMFpYSnpQVnRkTG5Oc2FXTmxMbU5oYkd3b1lYSm5kVzFsYm5SektUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJ3WVhKaGJXVjBaWEp6TG0xaGNDZ29jR0Z5WVcwcFBUNTdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lvY0dGeVlXMDlQVndpZEdocGMxd2lLWHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdWMk8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWxiSE5sZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2NHRnlZVzA3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdmU2xjYmlBZ0lDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNBZ0lHbG1LSFJvYVhOYlpuVnVZM1JwYjI1T1lXMWxYU2w3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6VzJaMWJtTjBhVzl1VG1GdFpWMHVZWEJ3Ykhrb2RHaHBjeXdnWlhaaGJDaGNJbVY0ZEhKaFkzUlFZWEpoYlhNb1hDSXJablZ1WTNScGIyNURiMlJsTG5Od2JHbDBLRndpS0Z3aUtWc3hYU2twWEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0I5WEc1Y2JpQWdJQ0JzYjJGa1EyaHBiR1JEYjIxd2IyNWxiblJ6S0hCaGNtVnVkRU52YlhCdmJtVnVkQ2tnZTF4dUlDQWdJQ0FnSUNCc1pYUWdZMjl0Y0c5dVpXNTBjMHh2WVdSbFpEMWJYVHRjYmlBZ0lDQWdJQ0FnZG1GeUlHTnZiWEJ2Ym1WdWRITkZiSE1nUFNCMGFHbHpMbVZzWlcxbGJuUXVjWFZsY25sVFpXeGxZM1J2Y2tGc2JDZ25XMk52YlhCdmJtVnVkRjBuS1R0Y2JpQWdJQ0FnSUNBZ1ptOXlJQ2gyWVhJZ2FTQTlJREE3SUdrZ1BDQmpiMjF3YjI1bGJuUnpSV3h6TG14bGJtZDBhRHNnYVNzcktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMllYSWdZMjl0Y0c5dVpXNTBTV1FnUFNCamIyMXdiMjVsYm5SelJXeHpXMmxkTG1kbGRFRjBkSEpwWW5WMFpTZ25ZMjl0Y0c5dVpXNTBMV2xrSnlrN1hHNWNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDZ2hZMjl0Y0c5dVpXNTBTV1FwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMllYSWdZMjl0Y0c5dVpXNTBJRDBnWTI5dGNHOXVaVzUwYzBWc2MxdHBYUzVuWlhSQmRIUnlhV0oxZEdVb0oyTnZiWEJ2Ym1WdWRDY3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCRGJHRjZlaUE5SUZOdFlYSjBRMjl0Y0c5dVpXNTBUV0Z1WVdkbGNpNW5aWFJEYjIxd2IyNWxiblFvWTI5dGNHOXVaVzUwS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCamIyMXdiMjVsYm5SelRHOWhaR1ZrTG5CMWMyZ29JRzVsZHlCRGJHRjZlaWhqYjIxd2IyNWxiblJ6Uld4elcybGRMSEJoY21WdWRFTnZiWEJ2Ym1WdWRDQjhmQ0IwYUdsektTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHTnZiWEJ2Ym1WdWRITk1iMkZrWldRN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnWDJKcGJtUkRiMjF3YjI1bGJuUkRiR2xqYXlodWIyUmxLU0I3WEc1Y2JpQWdJQ0FnSUNBZ2JHVjBJR2x6UVd4eVpXRmtlVUpwYm1SbFpEMTBhR2x6TG1KcGJtUmxaRVZzWlcxbGJuUnpXMXdpWTJ4cFkydGNJbDB1Y21Wa2RXTmxLQ2hoWTJOMWJYVnNZWFJ2Y2l4amRYSnlaVzUwVG05a1pTazlQbnRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCaFkyTjFiWFZzWVhSdmNpQjhmQ0JqZFhKeVpXNTBUbTlrWlM1cGMwVnhkV0ZzVG05a1pTaHViMlJsS1R0Y2JpQWdJQ0FnSUNBZ2ZTeG1ZV3h6WlNrN1hHNWNiaUFnSUNBZ0lDQWdhV1lvSVdselFXeHlaV0ZrZVVKcGJtUmxaQ2w3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG1KcGJtUmxaRVZzWlcxbGJuUnpXMXdpWTJ4cFkydGNJbDB1Y0hWemFDaHViMlJsS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJRzV2WkdVdVlXUmtSWFpsYm5STWFYTjBaVzVsY2lnblkyeHBZMnNuTENBb1pTazlQaUI3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NXpiV0Z5ZEY5amJHbGphMGhoYm1Sc1pYSW9aU2xjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdmVnh1WEc0Z0lDQWdZMmhsWTJ0RGIyMXdiMjVsYm5SelNHbGxjbUZ5WTJoNVFXNWtRbWx1WkVOc2FXTnJLRzV2WkdVcGUxeHVJQ0FnSUNBZ0lDQnNaWFFnY0dGeVpXNTBjME52YlhCdmJtVnVkRDBnZEdocGN5NWZaMlYwUkc5dFJXeGxiV1Z1ZEZCaGNtVnVkSE1vSUc1dlpHVXNJQ2RiWTI5dGNHOXVaVzUwTFhKbFptVnlaVzVqWlMxdVlXMWxYU2NwTzF4dUlDQWdJQ0FnSUNCcFppaHdZWEpsYm5SelEyOXRjRzl1Wlc1MExteGxibWQwYUQ0d0lDWW1JSEJoY21WdWRITkRiMjF3YjI1bGJuUmJNRjB1WjJWMFFYUjBjbWxpZFhSbEtGd2lZMjl0Y0c5dVpXNTBMWEpsWm1WeVpXNWpaUzF1WVcxbFhDSXBQVDEwYUdsekxtTnZiWEJ2Ym1WdWRGSmxabVZ5Wlc1alpVNWhiV1VwZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZlltbHVaRU52YlhCdmJtVnVkRU5zYVdOcktHNXZaR1VwTzF4dUlDQWdJQ0FnSUNCOVpXeHpaWHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5Ymp0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JseHVJQ0FnSUY5blpYUkViMjFGYkdWdFpXNTBVR0Z5Wlc1MGN5aGxiR1Z0TENCelpXeGxZM1J2Y2lsN1hHNGdJQ0FnSUNBZ0lDOHZJRVZzWlcxbGJuUXViV0YwWTJobGN5Z3BJSEJ2YkhsbWFXeHNYRzRnSUNBZ0lDQWdJR2xtSUNnaFJXeGxiV1Z1ZEM1d2NtOTBiM1I1Y0dVdWJXRjBZMmhsY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnUld4bGJXVnVkQzV3Y205MGIzUjVjR1V1YldGMFkyaGxjeUE5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnUld4bGJXVnVkQzV3Y205MGIzUjVjR1V1YldGMFkyaGxjMU5sYkdWamRHOXlJSHg4WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnUld4bGJXVnVkQzV3Y205MGIzUjVjR1V1Ylc5NlRXRjBZMmhsYzFObGJHVmpkRzl5SUh4OFhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1JXeGxiV1Z1ZEM1d2NtOTBiM1I1Y0dVdWJYTk5ZWFJqYUdWelUyVnNaV04wYjNJZ2ZIeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQkZiR1Z0Wlc1MExuQnliM1J2ZEhsd1pTNXZUV0YwWTJobGMxTmxiR1ZqZEc5eUlIeDhYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdSV3hsYldWdWRDNXdjbTkwYjNSNWNHVXVkMlZpYTJsMFRXRjBZMmhsYzFObGJHVmpkRzl5SUh4OFhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1puVnVZM1JwYjI0Z0tITXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJRzFoZEdOb1pYTWdQU0FvZEdocGN5NWtiMk4xYldWdWRDQjhmQ0IwYUdsekxtOTNibVZ5Ukc5amRXMWxiblFwTG5GMVpYSjVVMlZzWldOMGIzSkJiR3dvY3lrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcElEMGdiV0YwWTJobGN5NXNaVzVuZEdnN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSGRvYVd4bElDZ3RMV2tnUGowZ01DQW1KaUJ0WVhSamFHVnpMbWwwWlcwb2FTa2dJVDA5SUhSb2FYTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdhU0ErSUMweE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMDdYRzVjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBdkx5QlRaWFIxY0NCd1lYSmxiblJ6SUdGeWNtRjVYRzRnSUNBZ0lDQWdJSFpoY2lCd1lYSmxiblJ6SUQwZ1cxMDdYRzRnSUNBZ0lDQWdJQzh2SUVkbGRDQnRZWFJqYUdsdVp5QndZWEpsYm5RZ1pXeGxiV1Z1ZEhOY2JpQWdJQ0FnSUNBZ1ptOXlJQ2dnT3lCbGJHVnRJQ1ltSUdWc1pXMGdJVDA5SUdSdlkzVnRaVzUwT3lCbGJHVnRJRDBnWld4bGJTNXdZWEpsYm5ST2IyUmxJQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdMeThnUVdSa0lHMWhkR05vYVc1bklIQmhjbVZ1ZEhNZ2RHOGdZWEp5WVhsY2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoelpXeGxZM1J2Y2lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hsYkdWdExtMWhkR05vWlhNb2MyVnNaV04wYjNJcEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhCaGNtVnVkSE11Y0hWemFDaGxiR1Z0S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEJoY21WdWRITXVjSFZ6YUNobGJHVnRLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdjR0Z5Wlc1MGN6dGNiaUFnSUNCOVhHNWNibHh1SUNBZ0lGOWxkbVZ1ZEUxMWRHRjBhVzl1U0dGdVpHeGxjaWh0ZFhSaGRHbHZibk5NYVhOMEtYdGNiaUFnSUNBZ0lDQWdhV1lvYlhWMFlYUnBiMjV6VEdsemRDQW1KaUJ0ZFhSaGRHbHZibk5NYVhOMExteGxibWQwYUQ0d0tYdGNiaUFnSUNBZ0lDQWdJQ0FnSUd4bGRDQnRkWFJoZEdsdmJrVnNaVzFsYm5SelBTQnRkWFJoZEdsdmJuTk1hWE4wTG1acGJIUmxjaWdvYlNrZ1BUNGdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQnRMbUZrWkdWa1RtOWtaWE11YkdWdVozUm9JRDRnTUR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTG5KbFpIVmpaU2dvY0hKbGRpd2dZM1Z5Y21WdWRDa2dQVDRnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJ3Y21WMkxtTnZibU5oZENoMGFHbHpMbDluWlhSRGIyMXdiMjVsYm5SRGJHbGphMDV2WkdWVWIwSnBibVFvWTNWeWNtVnVkQzVoWkdSbFpFNXZaR1Z6S1NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5TENCYlhTazdYRzVjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1LRzExZEdGMGFXOXVSV3hsYldWdWRITXViR1Z1WjNSb0tYdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJRzExZEdGMGFXOXVSV3hsYldWdWRITXViR1Z1WjNSb095QnBLeXNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1amFHVmphME52YlhCdmJtVnVkSE5JYVdWeVlYSmphSGxCYm1SQ2FXNWtRMnhwWTJzb2JYVjBZWFJwYjI1RmJHVnRaVzUwYzF0cFhTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVYRzVjYmx4dUlDQWdJRjluWlhSRGIyMXdiMjVsYm5SRGJHbGphMDV2WkdWVWIwSnBibVFvYlc5a1pYTlViME5vWldOcktYdGNiaUFnSUNBZ0lDQWdiR1YwSUc1dlpHVnpWRzlDYVc1a1BWdGRPMXh1SUNBZ0lDQWdJQ0JwWmlodGIyUmxjMVJ2UTJobFkyc3ViR1Z1WjNSb0tYdGNiaUFnSUNBZ0lDQWdJQ0FnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2JXOWtaWE5VYjBOb1pXTnJMbXhsYm1kMGFEc2dhU3NyS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2JHVjBJRzV2WkdVOWJXOWtaWE5VYjBOb1pXTnJXMmxkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUtHNXZaR1V1Y1hWbGNubFRaV3hsWTNSdmNrRnNiQ2w3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHeGxkQ0JqYjIxd2IyNWxiblJEYkdsamEwVnNaVzFsYm5SeklEMXViMlJsTG5GMVpYSjVVMlZzWldOMGIzSkJiR3dvSjF0amIyMXdiMjVsYm5RdFkyeHBZMnRkSnlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtS0c1dlpHVXVaMlYwUVhSMGNtbGlkWFJsS0NkamIyMXdiMjVsYm5RdFkyeHBZMnNuS1NsN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdWIyUmxjMVJ2UW1sdVpDNXdkWE5vS0c1dlpHVXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoamIyMXdiMjVsYm5SRGJHbGphMFZzWlcxbGJuUnpMbXhsYm1kMGFDQStJREFwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdadmNpQW9iR1YwSUdrZ1BTQXdPeUJwSUR3Z1kyOXRjRzl1Wlc1MFEyeHBZMnRGYkdWdFpXNTBjeTVzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzV2WkdWelZHOUNhVzVrTG5CMWMyZ29ZMjl0Y0c5dVpXNTBRMnhwWTJ0RmJHVnRaVzUwYzF0cFhTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUc1dlpHVnpWRzlDYVc1a08xeHVJQ0FnSUgxY2JseHVYRzRnSUNBZ0x5b3FYRzRnSUNBZ0lDb2dRMkZzYkdWa0lHSjVJRU52YlhCdmJtVnVkRTFoYm1GblpYSWdJSGRvWlc0Z1pHOXRJR052YlhCdmJtVnVkQ0JwY3lCeVpXMXZkbVZrTENCdmRHaGxjbmRwYzJVZ2VXOTFJR05oYmlCaGJITnZJR05oYkd3Z2FYUWdaR2x5WldOMGJIa2dhV1lnZVc5MUlHNWxaV1FnYjNJZ2IzWmxjbkpwWkdVZ2FYUmNiaUFnSUNBZ0tpOWNibHh1SUNBZ0lITnRZWEowWDJSbGMzUnliM2tvS1h0Y2JpQWdJQ0FnSUNBZ1kyOXVjMjlzWlM1c2IyY29kR2hwY3k1amIyMXdiMjVsYm5SU1pXWmxjbVZ1WTJWT1lXMWxJQ3NnWENJZ1pHVnpkSEp2ZVdWa1hDSXBPMXh1SUNBZ0lDQWdJQ0IwYUdsekxtMTFkR0YwYVc5dVQySnpaWEoyWlhJdVpHbHpZMjl1Ym1WamRDZ3BPMXh1SUNBZ0lDQWdJQ0JUYldGeWRFTnZiWEJ2Ym1WdWRFMWhibUZuWlhJdWNtVnRiM1psUTI5dGNHOXVaVzUwU1c1emRHRnVZMlVvZEdocGN5NWZZMjl0Y0c5dVpXNTBTV1FwTzF4dUlDQWdJQ0FnSUNCcFppaDBhR2x6TG1Wc1pXMWxiblF1YVhORGIyNXVaV04wWldRcGUxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWxiR1Z0Wlc1MExuSmxiVzkyWlNncE8xeHVJQ0FnSUNBZ0lDQjlYRzVjYmlBZ0lDQWdJQ0FnTHk4Z1ptOXlJR0ZzYkNCd2NtOXdaWEowYVdWelhHNGdJQ0FnSUNBZ0lHWnZjaUFvWTI5dWMzUWdjSEp2Y0NCdlppQlBZbXBsWTNRdVoyVjBUM2R1VUhKdmNHVnlkSGxPWVcxbGN5aDBhR2x6S1NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWkdWc1pYUmxJSFJvYVhOYmNISnZjRjA3WEc0Z0lDQWdJQ0FnSUgxY2JseHVYRzRnSUNBZ2ZWeHVYRzU5WEc1Y2JtVjRjRzl5ZENCa1pXWmhkV3gwSUNCVGJXRnlkRU52YlhCdmJtVnVkRHNpWFN3aWJtRnRaWE1pT2xzaVUyMWhjblJEYjIxd2IyNWxiblJOWVc1aFoyVnlJaXdpWTI5dGNHOXVaVzUwY3lJc0ltTnZiWEJ2Ym1WdWRITkpibk4wWVc1alpTSXNJbkJoY21GdGN5SXNJbWRoY21KaFoyVkRiMnhzWldOMGIzSWlMQ0puWVhKaVlXZGxRMjlzYkdWamRHOXlVbTl2ZEVWc1pXMWxiblFpTENKa2IyTjFiV1Z1ZENJc0ltZGxkRVZzWlcxbGJuUnpRbmxVWVdkT1lXMWxJaXdpYlhWMFlYUnBiMjVQWW5ObGNuWmxjaUlzSWsxMWRHRjBhVzl1VDJKelpYSjJaWElpTENKdGRYUmhkR2x2YmtoaGJtUnNaWElpTENKaWFXNWtJaXdpYjJKelpYSjJaU0lzSW5CaGNtVnVkRTV2WkdVaUxDSmhkSFJ5YVdKMWRHVnpJaXdpWTJocGJHUk1hWE4wSWl3aVkyaGhjbUZqZEdWeVJHRjBZU0lzSW5OMVluUnlaV1VpTENKdGRYUmhkR2x2Ym5OTWFYTjBJaXdpYkdWdVozUm9JaXdpY21WdGIzWmxaRVZzWlcxbGJuUnpJaXdpWm1sc2RHVnlJaXdpYlNJc0luSmxiVzkyWldST2IyUmxjeUlzSW5KbFpIVmpaU0lzSW5CeVpYWWlMQ0pqZFhKeVpXNTBJaXdpWTI5dVkyRjBJaXdpWjJWMFEyOXRjRzl1Wlc1MFUzVmlUbTlrWlhNaUxDSm1iM0pGWVdOb0lpd2libTlrWlNJc0ltZGxkRUYwZEhKcFluVjBaU0lzSW1OdmJYQnZibVZ1ZEVsdWMzUmhibU5sSWl3aVoyVjBRMjl0Y0c5dVpXNTBTVzV6ZEdGdVkyVkNlVWxrSWl3aWMyMWhjblJmWkdWemRISnZlU0lzSW5CeVpYWk9iMlJsY3lJc0luSnRSV3hsYldWdWRITWlMQ0p5WlcxdmRtVmtUbTlrWlNJc0ltTjFjbkpsYm5ST2IyUmxJaXdpY0hWemFDSXNJbk5zYVdObElpd2lZMkZzYkNJc0ltTm9hV3hrY21WdUlpd2lZMjl0Y0c5dVpXNTBjME5zWVhOelpYTWlMQ0pyWlhseklpd2lZMjl0Y0c5dVpXNTBRMnhoYzNOT1lXMWxJaXdpWjJWMFEyOXRjRzl1Wlc1MElpd2ljbVZuYVhOMFpYSkRiMjF3YjI1bGJuUWlMQ0p1WVcxbElpd2lZMnhoZW5vaUxDSnBaQ0lzSW1sdWMzUmhibU5sSWl3aVpXeGxiV1Z1ZENJc0ltTnZiWEJ2Ym1WdWRFNWhiV1VpTENKbElpd2laWEp5YjNJaUxDSmpiMjF3SWl3aVl5SXNJbTFoY0NJc0lsTnRZWEowUTI5dGNHOXVaVzUwSWl3aWNHRnlaVzUwUTI5dGNHOXVaVzUwSWl3aWMyMWhjblJmYVc1cGRDSXNJbUpwYm1SbFpFVnNaVzFsYm5Seklpd2lYMk52YlhCdmJtVnVkRWxrSWl3aVgyZGxibVZ5WVhSbFZXbGtJaXdpWTI5dGNHOXVaVzUwVW1WbVpYSmxibU5sVG1GdFpTSXNJbk5sZEVGMGRISnBZblYwWlNJc0luWmxjbWxtZVVOdmJYQnZibVZ1ZEZKbFptVnlaVzVqWlU1aGJXVlZibWxqYVhSNUlpd2ljbVZuYVhOMFpYSkRiMjF3YjI1bGJuUkpibk4wWVc1alpTSXNJbU52Ym5OMGNuVmpkRzl5SWl3aVltbHVaRU52YlhCdmJtVnVkRU5zYVdOcklpd2libTlrWlhOVWIwSnBibVFpTENKZloyVjBRMjl0Y0c5dVpXNTBRMnhwWTJ0T2IyUmxWRzlDYVc1a0lpd2lhU0lzSW1Ob1pXTnJRMjl0Y0c5dVpXNTBjMGhwWlhKaGNtTm9lVUZ1WkVKcGJtUkRiR2xqYXlJc0lsOXRkWFJoZEdsdmJraGhibVJzWlhJaUxDSmZaWFpsYm5STmRYUmhkR2x2YmtoaGJtUnNaWElpTENKeVpYQnNZV05sSWl3aWNpSXNJazFoZEdnaUxDSnlZVzVrYjIwaUxDSjJJaXdpZEc5VGRISnBibWNpTENKbGRpSXNJbVoxYm1OMGFXOXVRMjlrWlNJc0ltTjFjbkpsYm5SVVlYSm5aWFFpTENKbWRXNWpkR2x2Yms1aGJXVWlMQ0p6Y0d4cGRDSXNJbVY0ZEhKaFkzUlFZWEpoYlhNaUxDSndZWEpoYldWMFpYSnpJaXdpWVhKbmRXMWxiblJ6SWl3aWNHRnlZVzBpTENKaGNIQnNlU0lzSW1WMllXd2lMQ0pqYjIxd2IyNWxiblJ6VEc5aFpHVmtJaXdpWTI5dGNHOXVaVzUwYzBWc2N5SXNJbkYxWlhKNVUyVnNaV04wYjNKQmJHd2lMQ0pqYjIxd2IyNWxiblJKWkNJc0ltTnZiWEJ2Ym1WdWRDSXNJa05zWVhwNklpd2lhWE5CYkhKbFlXUjVRbWx1WkdWa0lpd2lZV05qZFcxMWJHRjBiM0lpTENKcGMwVnhkV0ZzVG05a1pTSXNJbUZrWkVWMlpXNTBUR2x6ZEdWdVpYSWlMQ0p6YldGeWRGOWpiR2xqYTBoaGJtUnNaWElpTENKd1lYSmxiblJ6UTI5dGNHOXVaVzUwSWl3aVgyZGxkRVJ2YlVWc1pXMWxiblJRWVhKbGJuUnpJaXdpWDJKcGJtUkRiMjF3YjI1bGJuUkRiR2xqYXlJc0ltVnNaVzBpTENKelpXeGxZM1J2Y2lJc0lrVnNaVzFsYm5RaUxDSndjbTkwYjNSNWNHVWlMQ0p0WVhSamFHVnpJaXdpYldGMFkyaGxjMU5sYkdWamRHOXlJaXdpYlc5NlRXRjBZMmhsYzFObGJHVmpkRzl5SWl3aWJYTk5ZWFJqYUdWelUyVnNaV04wYjNJaUxDSnZUV0YwWTJobGMxTmxiR1ZqZEc5eUlpd2lkMlZpYTJsMFRXRjBZMmhsYzFObGJHVmpkRzl5SWl3aWN5SXNJbTkzYm1WeVJHOWpkVzFsYm5RaUxDSnBkR1Z0SWl3aWNHRnlaVzUwY3lJc0ltMTFkR0YwYVc5dVJXeGxiV1Z1ZEhNaUxDSmhaR1JsWkU1dlpHVnpJaXdpYlc5a1pYTlViME5vWldOcklpd2lZMjl0Y0c5dVpXNTBRMnhwWTJ0RmJHVnRaVzUwY3lJc0lteHZaeUlzSW1ScGMyTnZibTVsWTNRaUxDSnlaVzF2ZG1WRGIyMXdiMjVsYm5SSmJuTjBZVzVqWlNJc0ltbHpRMjl1Ym1WamRHVmtJaXdpY21WdGIzWmxJaXdpVDJKcVpXTjBJaXdpWjJWMFQzZHVVSEp2Y0dWeWRIbE9ZVzFsY3lJc0luQnliM0FpWFN3aWJXRndjR2x1WjNNaU9pSTdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN1NVRkRUVUU3Y1VOQlExazdPenRoUVVOTVF5eFZRVUZNTEVkQlFXdENMRVZCUVd4Q08yRkJRMHRETEd0Q1FVRk1MRWRCUVhkQ0xFVkJRWGhDT3pzN096dHJRMEZIVFVNc1VVRkJUenRwUWtGRFVrRXNUVUZCVEN4SFFVRmpRU3hWUVVGVkxFVkJRVU5ETEd0Q1FVRnBRaXhMUVVGc1FpeEZRVUYzUWtNc05rSkJRVFJDTEVsQlFYQkVMRVZCUVhoQ096dG5Ra0ZGUnl4TFFVRkxSaXhOUVVGTUxFTkJRVmxETEdkQ1FVRm1MRVZCUVdkRE8zRkNRVU4yUWtNc01rSkJRVXdzUjBGQmFVTXNTMEZCUzBZc1RVRkJUQ3hEUVVGWlJTd3lRa0ZCV2l4SlFVRXlRME1zVTBGQlUwTXNiMEpCUVZRc1EwRkJPRUlzVFVGQk9VSXNSVUZCYzBNc1EwRkJkRU1zUTBGQk5VVTdiMEpCUTBjc1MwRkJTMG9zVFVGQlRDeERRVUZaUXl4blFrRkJaaXhGUVVGblF6dDVRa0ZEZGtKSkxHZENRVUZNTEVkQlFYVkNMRWxCUVVsRExHZENRVUZLTEVOQlFYRkNMRXRCUVV0RExHVkJRVXdzUTBGQmNVSkRMRWxCUVhKQ0xFTkJRVEJDTEVsQlFURkNMRU5CUVhKQ0xFTkJRWFpDTzNsQ1FVTkxTQ3huUWtGQlRDeERRVUZ6UWtrc1QwRkJkRUlzUTBGQk9FSXNTMEZCUzFBc01rSkJRVXdzUTBGQmFVTlJMRlZCUVM5RUxFVkJRVEJGTEVWQlFVTkRMRmxCUVZrc1MwRkJZaXhGUVVGdlFrTXNWMEZCVnl4SlFVRXZRaXhGUVVGeFEwTXNaVUZCWlN4TFFVRndSQ3hGUVVFeVJFTXNVMEZCVXl4SlFVRndSU3hGUVVFeFJUczdPenM3TzNkRFFVdEpReXhsUVVGak96czdaMEpCUTI1Q1FTeHBRa0ZCYVVKQkxHTkJRV05ETEUxQlFXUXNSMEZCY1VJc1EwRkJla01zUlVGQk1rTTdiMEpCUTI1RFF5eHJRa0ZCYVVKR0xHTkJRV05ITEUxQlFXUXNRMEZCY1VJc1ZVRkJRME1zUTBGQlJDeEZRVUZQT3pKQ1FVTjBRMEVzUlVGQlJVTXNXVUZCUml4RFFVRmxTaXhOUVVGbUxFZEJRWGRDTEVOQlFTOUNPMmxDUVVScFFpeEZRVVZzUWtzc1RVRkdhMElzUTBGRldDeFZRVUZEUXl4SlFVRkVMRVZCUVU5RExFOUJRVkFzUlVGQmJVSTdNa0pCUTJ4Q1JDeExRVUZMUlN4TlFVRk1MRU5CUVZsRUxGRkJRVkZJTEZsQlFYQkNMRU5CUVZBN2FVSkJTR2xDTEVWQlNXeENMRVZCU210Q0xFTkJRWEpDT3p0dlFrRk5SMGdzWjBKQlFXZENSQ3hOUVVGb1FpeEhRVUYxUWl4RFFVRXhRaXhGUVVFMFFqdDVRa0ZEY0VKVExHOUNRVUZNTEVOQlFUQkNVaXhsUVVFeFFpeEZRVUV3UXl4RlFVRXhReXhGUVVFNFExTXNUMEZCT1VNc1EwRkJjMFFzVlVGQlEwTXNTVUZCUkN4RlFVRlJPelJDUVVOMlJFRXNTMEZCUzBNc1dVRkJUQ3hKUVVGeFFrUXNTMEZCUzBNc1dVRkJUQ3hEUVVGclFpeGpRVUZzUWl4RFFVRjRRaXhGUVVFd1JEdG5RMEZEYkVSRExHOUNRVUZyUWl4TlFVRkxReXgzUWtGQlRDeERRVUU0UWtnc1MwRkJTME1zV1VGQlRDeERRVUZyUWl4alFVRnNRaXhEUVVFNVFpeERRVUYwUWp0blEwRkRSME1zYVVKQlFVZ3NSVUZCY1VJN2EwUkJRME5GTEdGQlFXeENPenM3Y1VKQlNsbzdPenM3T3pzMlEwRlpUV1FzYVVKQlFXZENaU3hYUVVGVk96czdkMEpCUTJoRFFTeGhRVUZoTEVWQlFYaENPMmRDUVVOSlF5eGhRVUZYYUVJc1owSkJRV2RDUkN4TlFVRm9RaXhIUVVGMVFpeERRVUYyUWl4SFFVRXlRa01zWlVGQk0wSXNSMEZCTWtNc1EwRkJRMEVzWlVGQlJDeERRVUV4UkR0MVFrRkRWMU1zVDBGQldDeERRVUZ0UWl4VlFVRkRVU3hYUVVGRUxFVkJRV1U3YjBKQlF6RkNReXhqUVVGWlJDeFhRVUZvUWp0dlFrRkRSME1zV1VGQldXNUNMRTFCUVdZc1JVRkJjMEk3T0VKQlExSnZRaXhKUVVGV0xFTkJRV1VzVDBGQlMxZ3NiMEpCUVV3c1EwRkJNRUlzUjBGQlIxa3NTMEZCU0N4RFFVRlRReXhKUVVGVUxFTkJRV05JTEZkQlFXUXNRMEZCTVVJc1JVRkJjVVJJTEZOQlFYSkVMRU5CUVdZN2FVSkJSRW9zVFVGRlN6dDNRa0ZEUlVjc1dVRkJXVkFzV1VGQldpeEpRVUUwUWs4c1dVRkJXVkFzV1VGQldpeERRVUY1UWl4WFFVRjZRaXhEUVVFdlFpeEZRVUZ4UlR0clEwRkRka1JSTEVsQlFWWXNRMEZCWlVRc1YwRkJaanM3ZDBKQlJVUkJMRmxCUVZsSkxGRkJRVm9zU1VGQmQwSktMRmxCUVZsSkxGRkJRVm9zUTBGQmNVSjJRaXhOUVVGeVFpeEhRVUUwUWl4RFFVRjJSQ3hGUVVGNVJEdHJRMEZETTBOdlFpeEpRVUZXTEVOQlFXVXNUMEZCUzFnc2IwSkJRVXdzUTBGQk1FSXNSMEZCUjFrc1MwRkJTQ3hEUVVGVFF5eEpRVUZVTEVOQlFXTklMRmxCUVZsSkxGRkJRVEZDTEVOQlFURkNMRVZCUVRoRVVDeFRRVUU1UkN4RFFVRm1PenM3WVVGVVdqdHRRa0ZqVDBFc1UwRkJVRHM3T3pzeVEwRkhaVkVzYlVKQlFXdENPenM3YlVKQlF6RkNReXhKUVVGUUxFTkJRVmxFTEdsQ1FVRmFMRVZCUVN0Q1pDeFBRVUV2UWl4RFFVRjFReXhWUVVGRFowSXNhMEpCUVVRc1JVRkJjMEk3YjBKQlEzUkVMRU5CUVVNc1QwRkJTME1zV1VGQlRDeERRVUZyUWtRc2EwSkJRV3hDTEVOQlFVb3NSVUZCTUVNN01rSkJRMnBEUlN4cFFrRkJUQ3hEUVVGMVFrWXNhMEpCUVhaQ0xFVkJRVEJEUml4clFrRkJhMEpGTEd0Q1FVRnNRaXhEUVVFeFF6czdZVUZHVWpzN096c3dRMEZSWTBjc1RVRkJTME1zVDBGQlR6dHBRa0ZEY2tKb1JDeFZRVUZNTEVOQlFXZENjME1zU1VGQmFFSXNRMEZCY1VJN2MwSkJRMWhUTEVsQlJGYzdkVUpCUlZaRE8yRkJSbGc3T3pzN2EwUkJUM05DUXl4SlFVRkhReXhWUVVGVk8ybENRVU01UW1wRUxHdENRVUZNTEVOQlFYZENaMFFzUlVGQmVFSXNTVUZCTkVKRExGRkJRVFZDT3pzN08yZEVRVWR2UWtRc1NVRkJTVHR0UWtGRGFrSXNTMEZCUzJoRUxHdENRVUZNTEVOQlFYZENaMFFzUlVGQmVFSXNRMEZCVURzN096dHBSRUZIY1VKQkxFbEJRVWM3YlVKQlEycENMRXRCUVV0b1JDeHJRa0ZCVEN4RFFVRjNRbWRFTEVWQlFYaENMRU5CUVZBN096czdORU5CUjJkQ1JTeFRRVUZSUXl4bFFVRmpPMmRDUVVOc1EwWXNWMEZCVXl4SlFVRmlPMmRDUVVOSE8yOUNRVU5MUml4UlFVRlJMRXRCUVV0SUxGbEJRVXdzUTBGQmEwSlBMR0ZCUVd4Q0xFTkJRVm83TWtKQlExTXNTVUZCU1Vvc1MwRkJTaXhEUVVGVlJ5eFBRVUZXTEVOQlFWUXNRMEZHUkR0aFFVRklMRU5CUjBNc1QwRkJUVVVzUTBGQlRpeEZRVUZSTzNkQ1FVTkhReXhMUVVGU0xFTkJRV01zTmtOQlFUWkRSaXhoUVVFM1F5eEhRVUUwUkN4SlFVRTFSQ3hIUVVGclJVTXNRMEZCYUVZN08yMUNRVVZIU0N4UlFVRlFPenM3TzNGRFFVZFRTQ3hOUVVGTk8yZENRVU5ZVVN4UFFVRlBMRXRCUVV0MlJDeFZRVUZNTEVOQlFXZENiMElzVFVGQmFFSXNRMEZCZFVJN2RVSkJRVXR2UXl4RlFVRkZWQ3hKUVVGR0xFbEJRVlZCTEVsQlFXWTdZVUZCZGtJc1JVRkJORU5WTEVkQlFUVkRMRU5CUVdkRU8zVkNRVUZMUkN4RlFVRkZVaXhMUVVGUU8yRkJRV2hFTEVWQlFUaEVMRU5CUVRsRUxFTkJRVmc3YlVKQlEwOVBMRWxCUVZBN096czdPenRCUVVsU0xEaENRVUZsTEVsQlFVbDRSQ3h4UWtGQlNpeEZRVUZtT3p0SlEzaEhUVEpFT3pSQ1FVTlZVQ3hQUVVGYUxFVkJRWEZDVVN4bFFVRnlRaXhGUVVGelEzcEVMRTFCUVhSRExFVkJRVGhET3pzN1lVRkRja013UkN4VlFVRk1MRU5CUVdkQ1ZDeFBRVUZvUWl4RlFVRjVRbEVzWlVGQmVrSXNSVUZCTUVONlJDeE5RVUV4UXpzN096czdiVU5CUjA5cFJDeFRRVUZUVVN4cFFrRkJhVUo2UkN4UlFVRlBPMmxDUVVOdVEybEVMRTlCUVV3c1IwRkJaVUVzVDBGQlpqdHBRa0ZEUzFVc1kwRkJUQ3hIUVVGelFpeEZRVUZETEZOQlFWRXNSVUZCVkN4RlFVRjBRanRwUWtGRFMwTXNXVUZCVEN4SFFVRnhRaXhMUVVGTFF5eFpRVUZNTEVWQlFYSkNPMmxDUVVOTFNpeGxRVUZNTEVkQlFYVkNRU3hsUVVGMlFqdHBRa0ZEUzBzc2MwSkJRVXdzUjBGQk9FSXNTVUZCT1VJN2FVSkJRMHM1UkN4TlFVRk1MRWRCUVdOQkxGVkJRVlVzUlVGQmVFSTdPenRuUWtGTFNUaEVMSGxDUVVGNVFpeExRVUZMT1VRc1RVRkJUQ3hEUVVGWk9FUXNjMEpCUVZvc1IwRkJjVU1zUzBGQlN6bEVMRTFCUVV3c1EwRkJXVGhFTEhOQ1FVRnFSQ3hIUVVFd1JTeExRVUZMWWl4UFFVRk1MRU5CUVdGeVFpeFpRVUZpTEVOQlFUQkNMREJDUVVFeFFpeERRVUYyUnp0eFEwRkRkVUpyUXl3d1FrRkJNRUlzUzBGQlMwWXNXVUZCZEVRN08ybENRVVZMUlN4elFrRkJUQ3hIUVVFNFFrRXNjMEpCUVRsQ08yZENRVU5KTEVOQlFVTmlMRkZCUVZGeVFpeFpRVUZTTEVOQlFYRkNMREJDUVVGeVFpeERRVUZNTEVWQlFYVkVPM2RDUVVNelEyMURMRmxCUVZJc1EwRkJjVUlzTUVKQlFYSkNMRVZCUVdsRVJDeHpRa0ZCYWtRN096dG5Ra0ZIUkN4RFFVRkRMRXRCUVV0RkxHMURRVUZNTEVWQlFVb3NSVUZCSzBNN2MwSkJRM0pETEV0QlFVdEdMSE5DUVVGTUxFZEJRVFpDTERaRFFVRTNRaXhIUVVFeVJTeExRVUZMVEN4bFFVRk1MRU5CUVhGQ1N5eHpRa0ZCYUVjc1IwRkJkMGdzV1VGQk9VZzdkVUpCUTA4c1MwRkJVRHM3TzI5RFFVZHJRa2NzZVVKQlFYUkNMRU5CUVdkRUxFdEJRVXRNTEZsQlFYSkVMRVZCUVd0RkxFbEJRV3hGT3p0cFFrRkhTMWdzVDBGQlRDeERRVUZoWXl4WlFVRmlMRU5CUVRCQ0xHTkJRVEZDTEVWQlFYbERMRXRCUVV0SUxGbEJRVGxET3p0blFrRkZSeXhEUVVGRExFdEJRVXRZTEU5QlFVd3NRMEZCWVhKQ0xGbEJRV0lzUTBGQk1FSXNWMEZCTVVJc1EwRkJTaXhGUVVFeVF6dHhRa0ZEYkVOeFFpeFBRVUZNTEVOQlFXRmpMRmxCUVdJc1EwRkJNRUlzVjBGQk1VSXNSVUZCYzBNc1MwRkJTMGNzVjBGQlRDeERRVUZwUW5KQ0xFbEJRWFpFT3pzN1owSkJTVVFzUzBGQlMxa3NaVUZCVEN4SlFVRjNRaXhEUVVGRExFdEJRVXRCTEdWQlFVd3NRMEZCY1VJelJDeFZRVUZxUkN4RlFVRTBSRHR4UWtGRGJrUXlSQ3hsUVVGTUxFTkJRWEZDTTBRc1ZVRkJja0lzUjBGQlowTXNSVUZCYUVNN096dG5Ra0ZMUkN4TFFVRkxNa1FzWlVGQlVpeEZRVUYzUWp0eFFrRkRaa0VzWlVGQlRDeERRVUZ4UWpORUxGVkJRWEpDTEVOQlFXZERaMFVzYzBKQlFXaERMRWxCUVRCRUxFbEJRVEZFT3pzN1owSkJTVVFzUzBGQlMySXNUMEZCVEN4RFFVRmhja0lzV1VGQllpeERRVUV3UWl4cFFrRkJNVUlzUTBGQlNDeEZRVUZuUkR0eFFrRkRka04xUXl4clFrRkJUQ3hEUVVGM1FpeExRVUZMYkVJc1QwRkJOMEk3T3p0blFrRkhRVzFDTEdOQlFXRXNTMEZCUzBNc05FSkJRVXdzUTBGQmEwTXNRMEZCUXl4TFFVRkxjRUlzVDBGQlRpeERRVUZzUXl4RFFVRnFRanRuUWtGRFIyMUNMRmxCUVZsd1JDeE5RVUZtTEVWQlFYVkNPM0ZDUVVOa0xFbEJRVWx6UkN4SlFVRkpMRU5CUVdJc1JVRkJaMEpCTEVsQlFVbEdMRmxCUVZsd1JDeE5RVUZvUXl4RlFVRjNRM05FTEVkQlFYaERMRVZCUVRaRE8zbENRVU53UTBNc2IwTkJRVXdzUTBGQk1FTklMRmxCUVZsRkxFTkJRVm9zUTBGQk1VTTdPenM3TzJsQ1FVdElha1VzWjBKQlFVd3NSMEZCZFVJc1NVRkJTVU1zWjBKQlFVb3NRMEZCY1VJc1MwRkJTMnRGTEdkQ1FVRk1MRU5CUVhOQ2FFVXNTVUZCZEVJc1EwRkJNa0lzU1VGQk0wSXNRMEZCY2tJc1EwRkJka0k3YVVKQlEwdElMR2RDUVVGTUxFTkJRWE5DU1N4UFFVRjBRaXhEUVVFNFFpeExRVUZMZDBNc1QwRkJUQ3hEUVVGaGRrTXNWVUZCTTBNc1JVRkJjMFFzUlVGQlEwTXNXVUZCV1N4TFFVRmlMRVZCUVc5Q1F5eFhRVUZYTEVsQlFTOUNMRVZCUVhGRFF5eGxRVUZsTEV0QlFYQkVMRVZCUVRKRVF5eFRRVUZUTEVsQlFYQkZMRVZCUVhSRU96czdPM2xEUVVsaFF5eGxRVUZqTzJsQ1FVTjBRakJFTEhGQ1FVRk1MRU5CUVRKQ01VUXNZVUZCTTBJN096czdPRVJCU1dsRE8yMUNRVU42UWl4RFFVRkRMRXRCUVVzd1F5eGxRVUZPTEVsQlFYbENMRU5CUVVNc1MwRkJTMEVzWlVGQlRDeERRVUZ4UWpORUxGVkJRUzlETEVsQlFTdEVMRU5CUVVNc1MwRkJTekpFTEdWQlFVd3NRMEZCY1VJelJDeFZRVUZ5UWl4RFFVRm5ReXhMUVVGTFowVXNjMEpCUVhKRExFTkJRWGhGT3pzN08zVkRRVWRYTzIxQ1FVTklMRXRCUVV0SkxGZEJRVXdzUTBGQmFVSnlRaXhKUVVGcVFpeEhRVUZ6UWl4SFFVRjBRaXhIUVVFd1FpeFhRVUZYTmtJc1QwRkJXQ3hEUVVGdFFpeFBRVUZ1UWl4RlFVRTBRaXhWUVVGVmNFSXNRMEZCVml4RlFVRmhPMjlDUVVOdVJYRkNMRWxCUVVsRExFdEJRVXRETEUxQlFVd3NTMEZCWjBJc1JVRkJhRUlzUjBGQmNVSXNRMEZCTjBJN2IwSkJRMGxETEVsQlFVbDRRaXhMUVVGTExFZEJRVXdzUjBGQlYzRkNMRU5CUVZnc1IwRkJaMEpCTEVsQlFVa3NSMEZCU2l4SFFVRlZMRWRCUkd4RE8zVkNRVVZQUnl4RlFVRkZReXhSUVVGR0xFTkJRVmNzUlVGQldDeERRVUZRTzJGQlNEaENMRU5CUVd4RE96czdPekpEUVU5bFF5eEpRVUZKTzJkQ1FVTm1ReXhsUVVGbFJDeEhRVUZIUlN4aFFVRklMRU5CUVdsQ2RFUXNXVUZCYWtJc1EwRkJPRUlzYVVKQlFUbENMRU5CUVc1Q08yZENRVU5KZFVRc1pVRkJaVVlzWVVGQllVY3NTMEZCWWl4RFFVRnRRaXhIUVVGdVFpeEZRVUYzUWl4RFFVRjRRaXhEUVVGdVFqczdjVUpCUlZORExHRkJRVlFzUjBGQmEwTTdhMFJCUVZKeVJpeE5RVUZST3pCQ1FVRkJPenM3YjBKQlJURkNjMFlzWVVGQlZ5eEhRVUZIYWtRc1MwRkJTQ3hEUVVGVFF5eEpRVUZVTEVOQlFXTnBSQ3hUUVVGa0xFTkJRV1k3ZFVKQlEwOUVMRmRCUVZjdlFpeEhRVUZZTEVOQlFXVXNWVUZCUTJsRExFdEJRVVFzUlVGQlV6dDNRa0ZEZUVKQkxGTkJRVThzVFVGQlZpeEZRVUZwUWpzclFrRkRUbElzUlVGQlVEdHhRa0ZFU2l4TlFVVkxPeXRDUVVOTlVTeExRVUZRT3p0cFFrRktSQ3hEUVVGUU96czdaMEpCVTBRc1MwRkJTMHdzV1VGQlRDeERRVUZJTEVWQlFYTkNPM0ZDUVVOaVFTeFpRVUZNTEVWQlFXMUNUU3hMUVVGdVFpeERRVUY1UWl4SlFVRjZRaXhGUVVFclFrTXNTMEZCU3l4dFFrRkJhVUpVTEdGQlFXRkhMRXRCUVdJc1EwRkJiVUlzUjBGQmJrSXNSVUZCZDBJc1EwRkJlRUlzUTBGQmRFSXNRMEZCTDBJN096czdPelJEUVVsWk0wSXNhVUpCUVdsQ08yZENRVU0zUW10RExHMUNRVUZwUWl4RlFVRnlRanRuUWtGRFNVTXNaMEpCUVdkQ0xFdEJRVXN6UXl4UFFVRk1MRU5CUVdFMFF5eG5Ra0ZCWWl4RFFVRTRRaXhoUVVFNVFpeERRVUZ3UWp0cFFrRkRTeXhKUVVGSmRrSXNTVUZCU1N4RFFVRmlMRVZCUVdkQ1FTeEpRVUZKYzBJc1kwRkJZelZGTEUxQlFXeERMRVZCUVRCRGMwUXNSMEZCTVVNc1JVRkJLME03YjBKQlEzWkRkMElzWTBGQlkwWXNZMEZCWTNSQ0xFTkJRV1FzUlVGQmFVSXhReXhaUVVGcVFpeERRVUU0UWl4alFVRTVRaXhEUVVGc1FqczdiMEpCUlVrc1EwRkJRMnRGTEZkQlFVd3NSVUZCYTBJN2QwSkJRMVpETEZsQlFWbElMR05CUVdOMFFpeERRVUZrTEVWQlFXbENNVU1zV1VGQmFrSXNRMEZCT0VJc1YwRkJPVUlzUTBGQmFFSTdkMEpCUTBsdlJTeFJRVUZSYmtjc2QwSkJRWE5DT0VNc1dVRkJkRUlzUTBGQmJVTnZSQ3hUUVVGdVF5eERRVUZhTzNGRFFVTnBRak5FTEVsQlFXcENMRU5CUVhWQ0xFbEJRVWswUkN4TFFVRktMRU5CUVZWS0xHTkJRV04wUWl4RFFVRmtMRU5CUVZZc1JVRkJNa0ppTEcxQ1FVRnRRaXhKUVVFNVF5eERRVUYyUWpzN08yMUNRVWRFYTBNc1owSkJRVkE3T3pzN05FTkJSMmRDYUVVc1RVRkJUVHM3TzJkQ1FVVnNRbk5GTEd0Q1FVRm5RaXhMUVVGTGRFTXNZMEZCVEN4RFFVRnZRaXhQUVVGd1FpeEZRVUUyUW5SRExFMUJRVGRDTEVOQlFXOURMRlZCUVVNMlJTeFhRVUZFTEVWQlFXRXZSQ3hYUVVGaUxFVkJRVEpDTzNWQ1FVTjRSU3RFTEdWQlFXVXZSQ3haUVVGWlowVXNWMEZCV2l4RFFVRjNRbmhGTEVsQlFYaENMRU5CUVhSQ08yRkJSR2RDTEVWQlJXeENMRXRCUm10Q0xFTkJRWEJDT3p0blFrRkpSeXhEUVVGRGMwVXNaVUZCU2l4RlFVRnZRanR4UWtGRFdIUkRMR05CUVV3c1EwRkJiMElzVDBGQmNFSXNSVUZCTmtKMlFpeEpRVUUzUWl4RFFVRnJRMVFzU1VGQmJFTTdjVUpCUTB0NVJTeG5Ra0ZCVEN4RFFVRnpRaXhQUVVGMFFpeEZRVUVyUWl4VlFVRkRha1FzUTBGQlJDeEZRVUZOT3pCQ1FVTTFRbXRFTEd0Q1FVRk1MRU5CUVhkQ2JFUXNRMEZCZUVJN2FVSkJSRW83T3pzN096WkVRVTAyUW5oQ0xFMUJRVXM3WjBKQlEyeERNa1VzYlVKQlFXdENMRXRCUVV0RExIRkNRVUZNTEVOQlFUUkNOVVVzU1VGQk5VSXNSVUZCYTBNc05FSkJRV3hETEVOQlFYUkNPMmRDUVVOSE1rVXNhVUpCUVdsQ2RFWXNUVUZCYWtJc1IwRkJkMElzUTBGQmVFSXNTVUZCTmtKelJpeHBRa0ZCYVVJc1EwRkJha0lzUlVGQmIwSXhSU3haUVVGd1FpeERRVUZwUXl3d1FrRkJha01zUzBGQk9FUXNTMEZCUzJ0RExITkNRVUZ1Unl4RlFVRXdTRHR4UWtGRGFrZ3dReXh0UWtGQlRDeERRVUY1UWpkRkxFbEJRWHBDTzJGQlJFb3NUVUZGU3pzN096czdPemhEUVV0aE9FVXNUVUZCVFVNc1ZVRkJVenM3WjBKQlJUZENMRU5CUVVORExGRkJRVkZETEZOQlFWSXNRMEZCYTBKRExFOUJRWFpDTEVWQlFXZERPM2RDUVVOd1FrUXNVMEZCVWl4RFFVRnJRa01zVDBGQmJFSXNSMEZEU1VZc1VVRkJVVU1zVTBGQlVpeERRVUZyUWtVc1pVRkJiRUlzU1VGRFFVZ3NVVUZCVVVNc1UwRkJVaXhEUVVGclFrY3NhMEpCUkd4Q0xFbEJSVUZLTEZGQlFWRkRMRk5CUVZJc1EwRkJhMEpKTEdsQ1FVWnNRaXhKUVVkQlRDeFJRVUZSUXl4VFFVRlNMRU5CUVd0Q1N5eG5Ra0ZJYkVJc1NVRkpRVTRzVVVGQlVVTXNVMEZCVWl4RFFVRnJRazBzY1VKQlNteENMRWxCUzBFc1ZVRkJWVU1zUTBGQlZpeEZRVUZoTzNkQ1FVTk1UaXhWUVVGVkxFTkJRVU1zUzBGQlN6RkhMRkZCUVV3c1NVRkJhVUlzUzBGQlMybElMR0ZCUVhaQ0xFVkJRWE5EZGtJc1owSkJRWFJETEVOQlFYVkVjMElzUTBGQmRrUXNRMEZCWkR0M1FrRkRTVGRETEVsQlFVbDFReXhSUVVGUk4wWXNUVUZFYUVJN01rSkJSVThzUlVGQlJYTkVMRU5CUVVZc1NVRkJUeXhEUVVGUUxFbEJRVmwxUXl4UlFVRlJVU3hKUVVGU0xFTkJRV0V2UXl4RFFVRmlMRTFCUVc5Q0xFbEJRWFpETEVWQlFUWkRPekpDUVVWMFEwRXNTVUZCU1N4RFFVRkRMRU5CUVZvN2FVSkJXRkk3T3p0blFrRm5Ra0ZuUkN4VlFVRlZMRVZCUVdRN08yMUNRVVZSWWl4UlFVRlJRU3hUUVVGVGRFY3NVVUZCZWtJc1JVRkJiVU56Unl4UFFVRlBRU3hMUVVGTEwwWXNWVUZCTDBNc1JVRkJORVE3TzI5Q1FVVndSR2RITEZGQlFVb3NSVUZCWXp0M1FrRkRUa1FzUzBGQlMwa3NUMEZCVEN4RFFVRmhTQ3hSUVVGaUxFTkJRVW9zUlVGQk5FSTdaME5CUTJoQ2RFVXNTVUZCVWl4RFFVRmhjVVVzU1VGQllqczdhVUpCUmxJc1RVRkpUenMwUWtGRFMzSkZMRWxCUVZJc1EwRkJZWEZGTEVsQlFXSTdPenR0UWtGSFJHRXNUMEZCVURzN096czRRMEZKYTBKMlJ5eGxRVUZqT3pzN1owSkJRemRDUVN4cFFrRkJhVUpCTEdOQlFXTkRMRTFCUVdRc1IwRkJjVUlzUTBGQmVrTXNSVUZCTWtNN2IwSkJRMjVEZFVjc2JVSkJRV3RDZUVjc1kwRkJZMGNzVFVGQlpDeERRVUZ4UWl4VlFVRkRReXhEUVVGRUxFVkJRVTg3TWtKQlEzWkRRU3hGUVVGRmNVY3NWVUZCUml4RFFVRmhlRWNzVFVGQllpeEhRVUZ6UWl4RFFVRTNRanRwUWtGRWEwSXNSVUZGYmtKTExFMUJSbTFDTEVOQlJWb3NWVUZCUTBNc1NVRkJSQ3hGUVVGUFF5eFBRVUZRTEVWQlFXMUNPekpDUVVOc1FrUXNTMEZCUzBVc1RVRkJUQ3hEUVVGWkxFOUJRVXMyUXl3MFFrRkJUQ3hEUVVGclF6bERMRkZCUVZGcFJ5eFZRVUV4UXl4RFFVRmFMRU5CUVZBN2FVSkJTR3RDTEVWQlNXNUNMRVZCU20xQ0xFTkJRWFJDT3p0dlFrRk5SMFFzYVVKQlFXbENka2NzVFVGQmNFSXNSVUZCTWtJN2VVSkJRMnhDTEVsQlFVbHpSQ3hKUVVGSkxFTkJRV0lzUlVGQlowSkJMRWxCUVVscFJDeHBRa0ZCYVVKMlJ5eE5RVUZ5UXl4RlFVRTJRM05FTEVkQlFUZERMRVZCUVd0RU96WkNRVU42UTBNc2IwTkJRVXdzUTBGQk1FTm5SQ3hwUWtGQmFVSnFSQ3hEUVVGcVFpeERRVUV4UXpzN096czdPenR4UkVGUllXMUVMR05CUVdFN1owSkJRMnhEY2tRc1kwRkJXU3hGUVVGb1FqdG5Ra0ZEUjNGRUxHRkJRV0Y2Unl4TlFVRm9RaXhGUVVGMVFqdHhRa0ZEWkN4SlFVRkpjMFFzU1VGQlNTeERRVUZpTEVWQlFXZENRU3hKUVVGSmJVUXNZVUZCWVhwSExFMUJRV3BETEVWQlFYbERjMFFzUjBGQmVrTXNSVUZCT0VNN2QwSkJRM1JETTBNc1QwRkJTemhHTEdGQlFXRnVSQ3hEUVVGaUxFTkJRVlE3ZDBKQlEwY3pReXhMUVVGTGEwVXNaMEpCUVZJc1JVRkJlVUk3TkVKQlEycENOa0lzZVVKQlFYZENMMFlzUzBGQlMydEZMR2RDUVVGTUxFTkJRWE5DTEcxQ1FVRjBRaXhEUVVFMVFqczBRa0ZEUjJ4RkxFdEJRVXRETEZsQlFVd3NRMEZCYTBJc2FVSkJRV3hDTEVOQlFVZ3NSVUZCZDBNN2QwTkJRM2hDVVN4SlFVRmFMRU5CUVdsQ1ZDeEpRVUZxUWpzN05FSkJSVUVyUml4MVFrRkJkVUl4Unl4TlFVRjJRaXhIUVVGblF5eERRVUZ3UXl4RlFVRjFRenRwUTBGRE9VSXNTVUZCU1hORUxFdEJRVWtzUTBGQllpeEZRVUZuUWtFc1MwRkJTVzlFTEhWQ1FVRjFRakZITEUxQlFUTkRMRVZCUVcxRWMwUXNTVUZCYmtRc1JVRkJkMFE3TkVOQlEzaERiRU1zU1VGQldpeERRVUZwUW5OR0xIVkNRVUYxUW5CRUxFVkJRWFpDTEVOQlFXcENPenM3T3pzN2JVSkJUV0pHTEZkQlFWQTdPenM3T3pzN096dDNRMEZSVnp0dlFrRkRTSFZFTEVkQlFWSXNRMEZCV1N4TFFVRkxOMFFzYzBKQlFVd3NSMEZCT0VJc1dVRkJNVU03YVVKQlEwdDZSQ3huUWtGQlRDeERRVUZ6UW5WSUxGVkJRWFJDTzI5RFFVTnpRa01zZFVKQlFYUkNMRU5CUVRoRExFdEJRVXRxUlN4WlFVRnVSRHRuUWtGRFJ5eExRVUZMV0N4UFFVRk1MRU5CUVdFMlJTeFhRVUZvUWl4RlFVRTBRanR4UWtGRGJrSTNSU3hQUVVGTUxFTkJRV0U0UlN4TlFVRmlPenM3T3pzN096czdjVU5CU1dWRExFOUJRVTlETEcxQ1FVRlFMRU5CUVRKQ0xFbEJRVE5DTEVOQlFXNUNMRGhJUVVGeFJEdDNRa0ZCTVVORExFbEJRVEJET3pzeVFrRkRNVU1zUzBGQlMwRXNTVUZCVEN4RFFVRlFPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzaWZRPT1cbiIsIlxuY2xhc3MgVGVzdE1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNsaWNrRXZlbnRzQ291bnRlcj17fVxuICAgIH1cblxuICAgIGdldENsaWNrRXZlbnRzKGNvbXBvbmVudFJlZmVyZW5jZU5hbWUpe1xuICAgICAgICBpZiAodHlwZW9mICB0aGlzLmNsaWNrRXZlbnRzQ291bnRlcltjb21wb25lbnRSZWZlcmVuY2VOYW1lXT09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHRoaXMuY2xpY2tFdmVudHNDb3VudGVyW2NvbXBvbmVudFJlZmVyZW5jZU5hbWVdPTA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY2xpY2tFdmVudHNDb3VudGVyW2NvbXBvbmVudFJlZmVyZW5jZU5hbWVdO1xuICAgIH1cblxuICAgIGFkZENsaWNrRXZlbnQoY29tcG9uZW50UmVmZXJlbmNlTmFtZSl7XG4gICAgICAgIGlmICh0eXBlb2YgIHRoaXMuY2xpY2tFdmVudHNDb3VudGVyW2NvbXBvbmVudFJlZmVyZW5jZU5hbWVdID09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHRoaXMuY2xpY2tFdmVudHNDb3VudGVyW2NvbXBvbmVudFJlZmVyZW5jZU5hbWVdPTA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbGlja0V2ZW50c0NvdW50ZXJbY29tcG9uZW50UmVmZXJlbmNlTmFtZV0rKztcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xpY2tFdmVudHNDb3VudGVyW2NvbXBvbmVudFJlZmVyZW5jZU5hbWVdO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IFRlc3RNYW5hZ2VyKCk7IiwiaW1wb3J0IHtTbWFydENvbXBvbmVudH0gZnJvbSBcIi4uLy4uL2J1aWxkL1NtYXJ0Q29tcG9uZW50SlNcIjtcbmltcG9ydCBUZXN0TWFuYWdlciBmcm9tIFwiLi4vVGVzdE1hbmFnZXJcIjtcblxuY2xhc3MgVGVzdENvbXBvbmVudCBleHRlbmRzIFNtYXJ0Q29tcG9uZW50e1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCxwYXJlbnRDb21wb25lbnQscGFyYW1zKSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQscGFyZW50Q29tcG9uZW50LHBhcmFtcyk7XG4gICAgfVxuXG4gICAgY2xpY2tIYW5kbGVyKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSk7XG4gICAgICAgIFRlc3RNYW5hZ2VyLmFkZENsaWNrRXZlbnQodGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lKTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGVzdENvbXBvbmVudDsiLCJpbXBvcnQge1NtYXJ0Q29tcG9uZW50fSBmcm9tIFwiLi4vLi4vYnVpbGQvU21hcnRDb21wb25lbnRKU1wiO1xuaW1wb3J0IFRlc3RNYW5hZ2VyIGZyb20gXCIuLi9UZXN0TWFuYWdlclwiO1xuXG5jbGFzcyBTdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudCBleHRlbmRzIFNtYXJ0Q29tcG9uZW50e1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCxwYXJlbnRDb21wb25lbnQscGFyYW1zKSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQscGFyZW50Q29tcG9uZW50LHBhcmFtcyk7XG4gICAgfVxuXG4gICAgY2xpY2tIYW5kbGVyKGV2KXtcbiAgICAgICAgaWYoZXYpe1xuICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgVGVzdE1hbmFnZXIuYWRkQ2xpY2tFdmVudCh0aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnQ7IiwiaW1wb3J0IHtTbWFydENvbXBvbmVudE1hbmFnZXJ9ICBmcm9tIFwiLi4vYnVpbGQvU21hcnRDb21wb25lbnRKU1wiO1xuaW1wb3J0IFRlc3RNYW5hZ2VyIGZyb20gXCIuL1Rlc3RNYW5hZ2VyXCI7XG5pbXBvcnQgVGVzdENvbXBvbmVudCBmcm9tIFwiLi90ZXN0Q29tcG9uZW50cy9UZXN0Q29tcG9uZW50XCI7XG5pbXBvcnQgU3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnQgZnJvbSBcIi4vdGVzdENvbXBvbmVudHMvU3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnRcIjtcblxuU21hcnRDb21wb25lbnRNYW5hZ2VyLnJlZ2lzdGVyQ29tcG9uZW50cyh7VGVzdENvbXBvbmVudCxTdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudH0pO1xuU21hcnRDb21wb25lbnRNYW5hZ2VyLmNvbmZpZ3VyZSh7Z2FyYmFnZUNvbGxlY3Rvcjp0cnVlfSk7XG5cbmxldCB0ZXN0Q29tcG9uZW50PW51bGw7XG5sZXQgdGVzdENvbXBvbmVudDI9bnVsbDtcbmxldCB0ZXN0Q29tcG9uZW50Mz1udWxsO1xubGV0IHRlc3RDb21wb25lbnQ0PW51bGw7XG5sZXQgdGVzdENvbXBvbmVudDU9bnVsbDtcbmxldCB0ZXN0Q29tcG9uZW50Nj1udWxsO1xubGV0IHN0b3BDbGlja1Byb3BhZ2F0aW9uQ29tcG9uZW50PW51bGw7XG5cbmRlc2NyaWJlKCdUZXN0Q29tcG9uZW50MSAtIEluc3RhbmNlIGJ5IG5hbWUnLCBmdW5jdGlvbigpIHtcbiAgICB0ZXN0Q29tcG9uZW50ID0gU21hcnRDb21wb25lbnRNYW5hZ2VyLmluaXRDb21wb25lbnRCeU5hbWUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2NvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlRlc3RDb21wb25lbnQxXCJdYCksXCJUZXN0Q29tcG9uZW50XCIpO1xuICAgIGl0KCdUZXN0Q29tcG9uZW50MSAtIHNob3VsZCBiZSBpbnN0YW5jZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHRlc3RDb21wb25lbnQuY29uc3RydWN0b3IubmFtZSwgXCJUZXN0Q29tcG9uZW50XCIpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdUZXN0Q29tcG9uZW50MSAtIGxvYWQgY2hpbGQgY29tcG9uZW50cyBwYXNzaW5nIGxpa2UgcGFyZW50IFRlc3RDb21wb25lbnQxJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ1Rlc3RDb21wb25lbnQyIC0gVGVzdENvbXBvbmVudDEgc2hvdWxkIGJlIHByZXNlbnQgbGlrZSBUZXN0Q29tcG9uZW50MiBwYXJlbnQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IGxvYWRlZENvbXBvbmVudHMgPSB0ZXN0Q29tcG9uZW50LmxvYWRDaGlsZENvbXBvbmVudHModGVzdENvbXBvbmVudCk7XG4gICAgICAgIHRlc3RDb21wb25lbnQyPWxvYWRlZENvbXBvbmVudHMuZmlsdGVyKChjb21wb25lbnQpPT57XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50LmNvbXBvbmVudFJlZmVyZW5jZU5hbWU9PVwiVGVzdENvbXBvbmVudDJcIjtcbiAgICAgICAgfSlbMF07XG4gICAgICAgIGFzc2VydC5lcXVhbCh0ZXN0Q29tcG9uZW50Mi5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50UmVmZXJlbmNlTmFtZSwgXCJUZXN0Q29tcG9uZW50MVwiKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnVGVzdENvbXBvbmVudDIgY29tcG9uZW50LWNsaWNrIC0gY2xpY2sgb24gVGVzdENvbXBvbmVudDIgY2hpbGQgb24gY29tcG9uZW50LWNsaWNrIGF0dHJpYnV0ZScsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdUZXN0Q29tcG9uZW50MiAtIGNsaWNrRXZlbnRzTnVtYmVyIG11c3QgYmUgaW5jcmVhc2Ugb2Ygb25lJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCBjbGlja0V2ZW50c051bWJlckJlZm9yZT1UZXN0TWFuYWdlci5nZXRDbGlja0V2ZW50cyhcIlRlc3RDb21wb25lbnQyXCIpO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lPVwiVGVzdENvbXBvbmVudDJcIl0gW2NvbXBvbmVudC1jbGljaz1cImNsaWNrSGFuZGxlcigpXCJdYCkuY2xpY2soKTtcbiAgICAgICAgYXdhaXQgc2V0VGltZW91dCgoKT0+e30sNTAwKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKFRlc3RNYW5hZ2VyLmdldENsaWNrRXZlbnRzKFwiVGVzdENvbXBvbmVudDJcIiksIChjbGlja0V2ZW50c051bWJlckJlZm9yZSArIDEpKTtcbiAgICB9KTtcbn0pO1xuXG5cbmRlc2NyaWJlKCdUZXN0Q29tcG9uZW50My80IGFkZGVkIGRpbmFtaWNhbGx5IC0gYWRkIGRpbmFtaWNhbGx5IFRlc3RDb21wb25lbnQzIGxpa2UgY2hpbGQgb2YgVGVzdENvbXBvbmVudDInLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnVGVzdENvbXBvbmVudDMvNCAtIHNob3VsZCBiZSBwcmVzZW50IGxpa2UgY2hpbGQgb2YgVGVzdENvbXBvbmVudDInLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IHRlc3RDb21wb25lbnQyRG9tRWw9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJUZXN0Q29tcG9uZW50MlwiXWApO1xuICAgICAgICB2YXIgbm9kZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbm9kZS5pbm5lckhUTUw9YFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGRpdiBjb21wb25lbnQ9XCJUZXN0Q29tcG9uZW50XCIgIGNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlRlc3RDb21wb25lbnQzXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjb21wb25lbnQtY2xpY2s9XCJjbGlja0hhbmRsZXIoKVwiPlRlc3RDb21wb25lbnQzIENsaWNrIEhhbmRsZXI8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgIFxuICAgICAgICAgICAgPGRpdiBjb21wb25lbnQ9XCJUZXN0Q29tcG9uZW50XCIgIGNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlRlc3RDb21wb25lbnQ0XCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjb21wb25lbnQtY2xpY2s9XCJjbGlja0hhbmRsZXIoKVwiPlRlc3RDb21wb25lbnQ0IENsaWNrIEhhbmRsZXI8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5gO1xuICAgICAgICB0ZXN0Q29tcG9uZW50MkRvbUVsLmFwcGVuZENoaWxkKG5vZGUuY2hpbGROb2Rlc1sxXSk7XG4gICAgICAgIHRlc3RDb21wb25lbnQyLmxvYWRDaGlsZENvbXBvbmVudHMoKTtcbiAgICAgICAgYXdhaXQgc2V0VGltZW91dCgoKT0+e30sNTAwKTtcbiAgICAgICAgdGVzdENvbXBvbmVudDM9dGVzdENvbXBvbmVudDIuY29tcG9uZW50c1tcIlRlc3RDb21wb25lbnQzXCJdO1xuICAgICAgICB0ZXN0Q29tcG9uZW50ND10ZXN0Q29tcG9uZW50Mi5jb21wb25lbnRzW1wiVGVzdENvbXBvbmVudDRcIl07XG4gICAgICAgIGFzc2VydC5lcXVhbCh0ZXN0Q29tcG9uZW50Mi5jb21wb25lbnRzW1wiVGVzdENvbXBvbmVudDNcIl0uY29tcG9uZW50UmVmZXJlbmNlTmFtZSwgXCJUZXN0Q29tcG9uZW50M1wiKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHRlc3RDb21wb25lbnQyLmNvbXBvbmVudHNbXCJUZXN0Q29tcG9uZW50NFwiXS5jb21wb25lbnRSZWZlcmVuY2VOYW1lLCBcIlRlc3RDb21wb25lbnQ0XCIpO1xuICAgIH0pO1xufSk7XG5cblxuZGVzY3JpYmUoJ1Rlc3RDb21wb25lbnQzIGNvbXBvbmVudC1jbGljayAtIGNsaWNrIG9uIFRlc3RDb21wb25lbnQzIGNoaWxkIG9uIGNvbXBvbmVudC1jbGljayBhdHRyaWJ1dGUnLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnVGVzdENvbXBvbmVudDMgLSBjbGlja0V2ZW50c051bWJlciBtdXN0IGJlIGluY3JlYXNlIG9mIG9uZScsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgY2xpY2tFdmVudHNOdW1iZXJCZWZvcmU9VGVzdE1hbmFnZXIuZ2V0Q2xpY2tFdmVudHMoXCJUZXN0Q29tcG9uZW50M1wiKTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2NvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlRlc3RDb21wb25lbnQzXCJdIFtjb21wb25lbnQtY2xpY2s9XCJjbGlja0hhbmRsZXIoKVwiXWApLmNsaWNrKCk7XG4gICAgICAgIGF3YWl0IHNldFRpbWVvdXQoKCk9Pnt9LDUwMCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChUZXN0TWFuYWdlci5nZXRDbGlja0V2ZW50cyhcIlRlc3RDb21wb25lbnQzXCIpLCAoY2xpY2tFdmVudHNOdW1iZXJCZWZvcmUgKyAxKSk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ1Rlc3RDb21wb25lbnQ1IGluc3RhbmNlZCBieSBqYXZhc2NyaXB0IC0gaW5zdGFuY2VkIGJ5IGphdmFzY3JpcHQgVGVzdENvbXBvbmVudDUgdW5kZXIgVGVzdENvbXBvbmVudDInLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnVGVzdENvbXBvbmVudDUgLSBzaG91bGQgYmUgcHJlc2VudCBsaWtlIGNoaWxkIG9mIFRlc3RDb21wb25lbnQyJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCB0ZXN0Q29tcG9uZW50MkRvbUVsPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lPVwiVGVzdENvbXBvbmVudDJcIl1gKTtcbiAgICAgICAgdmFyIG5vZGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG5vZGUuaW5uZXJIVE1MPWA8ZGl2PjwvZGl2PmA7XG4gICAgICAgIGxldCBub2RlVG9BcHBlbmQ9bm9kZS5jaGlsZE5vZGVzWzBdO1xuICAgICAgICB0ZXN0Q29tcG9uZW50MkRvbUVsLmFwcGVuZENoaWxkKG5vZGVUb0FwcGVuZCk7XG4gICAgICAgIHRlc3RDb21wb25lbnQ1ID0gbmV3IFRlc3RDb21wb25lbnQobm9kZVRvQXBwZW5kLHRlc3RDb21wb25lbnQyLHtjb21wb25lbnRSZWZlcmVuY2VOYW1lOlwiVGVzdENvbXBvbmVudDVcIn0pO1xuICAgICAgICBhd2FpdCBzZXRUaW1lb3V0KCgpPT57fSw1MDApO1xuICAgICAgICBhc3NlcnQuZXF1YWwodGVzdENvbXBvbmVudDIuY29tcG9uZW50c1tcIlRlc3RDb21wb25lbnQ1XCJdLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUsIFwiVGVzdENvbXBvbmVudDVcIik7XG4gICAgfSk7XG59KTtcblxuXG5kZXNjcmliZSgnVGVzdENvbXBvbmVudDYgaW5zdGFuY2VkIGJ5IGphdmFzY3JpcHQgLSBpbnN0YW5jZWQgYnkgamF2YXNjcmlwdCBUZXN0Q29tcG9uZW50NiB1bmRlciBUZXN0Q29tcG9uZW50NScsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdUZXN0Q29tcG9uZW50NiAtIHNob3VsZCBiZSBwcmVzZW50IGxpa2UgY2hpbGQgb2YgVGVzdENvbXBvbmVudDUnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IHRlc3RDb21wb25lbnQ1RG9tRWw9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJUZXN0Q29tcG9uZW50NVwiXWApO1xuICAgICAgICB2YXIgbm9kZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbm9kZS5pbm5lckhUTUw9YDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY29tcG9uZW50LWNsaWNrPVwiY2xpY2tIYW5kbGVyKClcIj5UZXN0Q29tcG9uZW50NiBDbGljayBIYW5kbGVyPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuICAgICAgICBsZXQgbm9kZVRvQXBwZW5kPW5vZGUuY2hpbGROb2Rlc1swXTtcbiAgICAgICAgdGVzdENvbXBvbmVudDVEb21FbC5hcHBlbmRDaGlsZChub2RlVG9BcHBlbmQpO1xuICAgICAgICB0ZXN0Q29tcG9uZW50NiA9IG5ldyBUZXN0Q29tcG9uZW50KG5vZGVUb0FwcGVuZCx0ZXN0Q29tcG9uZW50NSx7Y29tcG9uZW50UmVmZXJlbmNlTmFtZTpcIlRlc3RDb21wb25lbnQ2XCJ9KTtcbiAgICAgICAgYXdhaXQgc2V0VGltZW91dCgoKT0+e30sNTAwKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHRlc3RDb21wb25lbnQ1LmNvbXBvbmVudHNbXCJUZXN0Q29tcG9uZW50NlwiXS5jb21wb25lbnRSZWZlcmVuY2VOYW1lLCBcIlRlc3RDb21wb25lbnQ2XCIpO1xuICAgIH0pO1xufSk7XG5cblxuZGVzY3JpYmUoJ0RldGVjdCBjb25mbGljdCBpbiBjb21wb25lbnQtcmVmZXJlbmNlLW5hbWUgLSB1c2luZyB0d28gdGltZXMgVGVzdENvbXBvbmVudDYgdW5kZXIgVGVzdENvbXBvbmVudDUgY29tcG9uZW50JywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ05vdCB1bmlxdWUgY29tcG9uZW50IHJlZmVyZW5jZSBuYW1lIGV4Y2VwdGlvbiBpcyB0aHJvd2VkICcsICBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IHRlc3RDb21wb25lbnQ1RG9tRWw9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJUZXN0Q29tcG9uZW50NVwiXWApO1xuICAgICAgICB2YXIgbm9kZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbm9kZS5pbm5lckhUTUw9YDxkaXYgY29tcG9uZW50PVwiVGVzdENvbXBvbmVudFwiIGNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlRlc3RDb21wb25lbnQ2XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuICAgICAgICBsZXQgbm9kZVRvQXBwZW5kPW5vZGUuY2hpbGROb2Rlc1swXTtcbiAgICAgICAgdGVzdENvbXBvbmVudDVEb21FbC5hcHBlbmRDaGlsZChub2RlVG9BcHBlbmQpO1xuICAgICAgICBsZXQgY3JuRXhjZXB0aW9uPW51bGxcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgdGVzdENvbXBvbmVudDUubG9hZENoaWxkQ29tcG9uZW50cygpO1xuICAgICAgICB9Y2F0Y2ggKGUpe1xuICAgICAgICAgICAgY3JuRXhjZXB0aW9uPWU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydC5lcXVhbChjcm5FeGNlcHRpb24hPW51bGwsIHRydWUpO1xuICAgIH0pO1xufSk7XG5cblxuXG5kZXNjcmliZSgnSGFuZGxlIGV2ZW50IC0gc3RvcHBpbmcgcHJvcGFnYXRpb24gYWNyb3NzIGlubmVzdGVkIGNvbXBvbmVudC1jbGljayBmdW5jdGlvbicsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdTdG9wIGV2ZW50IHByb3BhZ2F0aW9uIE9ubHkgdGhlIGZpcnN0IGZ1bmN0aW9uIGNvbXBvbmVudC1jbGljayBpbiB0aGUgaGllcmFyY2h5IGlzIGludm9rZWQnLCBhc3luYyBmdW5jdGlvbigpIHtcblxuICAgICAgICBsZXQgY2xpY2tFdmVudHNOdW1iZXJCZWZvcmU9VGVzdE1hbmFnZXIuZ2V0Q2xpY2tFdmVudHMoXCJTdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudFwiKTtcblxuICAgICAgICBsZXQgdGVzdENvbXBvbmVudDFEb21FbD0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2NvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlRlc3RDb21wb25lbnQxXCJdYCk7XG4gICAgICAgIHZhciBub2RlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBub2RlLmlubmVySFRNTD1gPGRpdiBjb21wb25lbnQ9XCJTdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudFwiIGNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlN0b3BDbGlja1Byb3BhZ2F0aW9uQ29tcG9uZW50XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjb21wb25lbnQtY2xpY2s9XCJjbGlja0hhbmRsZXIoJ3RoaXMnKVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY29tcG9uZW50LWNsaWNrPVwiY2xpY2tIYW5kbGVyKCd0aGlzJylcIj5TdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudCAyPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG4gICAgICAgIHRlc3RDb21wb25lbnQxRG9tRWwuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgIGxldCBsb2FkZWRDb21wb25lbnRzID0gdGVzdENvbXBvbmVudC5sb2FkQ2hpbGRDb21wb25lbnRzKCk7XG4gICAgICAgIHN0b3BDbGlja1Byb3BhZ2F0aW9uQ29tcG9uZW50PWxvYWRlZENvbXBvbmVudHNbMV07XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJTdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudFwiXSBidXR0b25gKS5jbGljaygpO1xuICAgICAgICBhd2FpdCBzZXRUaW1lb3V0KCgpPT57fSwxMDAwKTtcbiAgICAgICAgY29uc29sZS5sb2coVGVzdE1hbmFnZXIuZ2V0Q2xpY2tFdmVudHMoXCJTdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudFwiKSk7XG4gICAgICAgIGFzc2VydC5lcXVhbChUZXN0TWFuYWdlci5nZXRDbGlja0V2ZW50cyhcIlN0b3BDbGlja1Byb3BhZ2F0aW9uQ29tcG9uZW50XCIpLCAoY2xpY2tFdmVudHNOdW1iZXJCZWZvcmUrMSkpO1xuICAgIH0pXG59KVxuXG5kZXNjcmliZSgnUmVtb3ZlIFRlc3RDb21wb25lbnQyIGZyb20gZG9tIC0gcmVtb3ZlIHRoZSBkb20gZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSBjb21wb25lbnQnLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnQ29tcG9uZW50IGFuZCB0aGVpcnMgY2hpbGxkcmVuIG11c3QgYmUgZGVhbGxvY2F0ZWQnLCBhc3luYyBmdW5jdGlvbigpIHtcblxuICAgICAgICBsZXQgdGVzdENvbXBvbmVudDJEb21FbD0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2NvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlRlc3RDb21wb25lbnQyXCJdYCk7XG5cbiAgICAgICAgdGVzdENvbXBvbmVudDJEb21FbC5yZW1vdmUoKTtcbiAgICAgICAgYXdhaXQgc2V0VGltZW91dCgoKT0+e30sMTAwMCk7XG5cbiAgICAgICAgbGV0IGFsbENvbXBvbmVudHNSZW1vdmVkPSBbdGVzdENvbXBvbmVudDIsdGVzdENvbXBvbmVudDMsdGVzdENvbXBvbmVudDQsdGVzdENvbXBvbmVudDUsdGVzdENvbXBvbmVudDZdLnJlZHVjZSgoYWNjdW11bGF0b3IsY3VycmVudCk9PntcbiAgICAgICAgICAgIHJldHVybiBhY2N1bXVsYXRvciAmJiAgKE9iamVjdC5rZXlzKGN1cnJlbnQpLmxlbmd0aCA9PT0gMCAgfHwgIWN1cnJlbnQpO1xuICAgICAgICB9LHRydWUpO1xuXG4gICAgICAgIGFzc2VydC5lcXVhbChhbGxDb21wb25lbnRzUmVtb3ZlZCwgdHJ1ZSk7XG4gICAgfSlcbn0pXG5cbmRlc2NyaWJlKCdSZW1vdmUgVGVzdENvbXBvbmVudCBwcm9ncmFtbWF0aWNhbGx5IC0gcmVtb3ZlIHRoZSBkb20gZWxlbWVudCBhbmQgdGhlaXJzIGNoaWxkcmVuJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ0NvbXBvbmVudCBhbmQgdGhlaXJzIGNoaWxsZHJlbiBtdXN0IGJlIGRlYWxsb2NhdGVkJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgIHRlc3RDb21wb25lbnQuc21hcnRfZGVzdHJveSgpO1xuICAgICAgICBhd2FpdCBzZXRUaW1lb3V0KCgpPT57fSwyMDAwKTtcbiAgICAgICAgbGV0IGFsbENvbXBvbmVudHNSZW1vdmVkPSBbdGVzdENvbXBvbmVudCxzdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudF0ucmVkdWNlKChhY2N1bXVsYXRvcixjdXJyZW50KT0+e1xuICAgICAgICAgICAgcmV0dXJuIGFjY3VtdWxhdG9yICYmICAoT2JqZWN0LmtleXMoY3VycmVudCkubGVuZ3RoID09PSAwICB8fCAhY3VycmVudCk7XG4gICAgICAgIH0sdHJ1ZSk7XG5cbiAgICAgICAgYXNzZXJ0LmVxdWFsKGFsbENvbXBvbmVudHNSZW1vdmVkLCB0cnVlKTtcbiAgICB9KVxufSlcblxuXG5cbi8vcmVwbGFjZSBldmFsIG1ldGhvZCBpbiBvcmRlciB0byByZXRyaWV2ZSBmdW5jdGlvbiBwYXJhbWV0ZXJzXG5cbi8vSW5pdFxuLy9CZWZvckNvbXBvbmV0Q2xpY2tcbi8vTGFuY2lhcmUgZWNjZXppb25lIHNlIHZlbmdvbm8gdHJvdmF0ZSBjb21wb25lbnRSZWZlcmVuY2VOYW1lIHJlZ2lzdHJhdGUgbyBzZSBpbCBjb21wb25lbnRSZWZlcmVuY2VOYW1lIGNvaW5jaWRlIGNvbiBxdWVsbGEgZGVsIHBhZHJlXG5cblxuXG5cbiJdLCJuYW1lcyI6WyJUZXN0TWFuYWdlciIsImNsaWNrRXZlbnRzQ291bnRlciIsImNvbXBvbmVudFJlZmVyZW5jZU5hbWUiLCJUZXN0Q29tcG9uZW50IiwiZWxlbWVudCIsInBhcmVudENvbXBvbmVudCIsInBhcmFtcyIsImxvZyIsImFkZENsaWNrRXZlbnQiLCJTbWFydENvbXBvbmVudCIsIlN0b3BDbGlja1Byb3BhZ2F0aW9uQ29tcG9uZW50IiwiZXYiLCJzdG9wUHJvcGFnYXRpb24iLCJTbWFydENvbXBvbmVudE1hbmFnZXIiLCJyZWdpc3RlckNvbXBvbmVudHMiLCJjb25maWd1cmUiLCJnYXJiYWdlQ29sbGVjdG9yIiwidGVzdENvbXBvbmVudCIsInRlc3RDb21wb25lbnQyIiwidGVzdENvbXBvbmVudDMiLCJ0ZXN0Q29tcG9uZW50NCIsInRlc3RDb21wb25lbnQ1IiwidGVzdENvbXBvbmVudDYiLCJzdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudCIsImRlc2NyaWJlIiwiaW5pdENvbXBvbmVudEJ5TmFtZSIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImVxdWFsIiwiY29uc3RydWN0b3IiLCJuYW1lIiwibG9hZGVkQ29tcG9uZW50cyIsImxvYWRDaGlsZENvbXBvbmVudHMiLCJmaWx0ZXIiLCJjb21wb25lbnQiLCJjbGlja0V2ZW50c051bWJlckJlZm9yZSIsImdldENsaWNrRXZlbnRzIiwiY2xpY2siLCJzZXRUaW1lb3V0IiwidGVzdENvbXBvbmVudDJEb21FbCIsIm5vZGUiLCJjcmVhdGVFbGVtZW50IiwiaW5uZXJIVE1MIiwiYXBwZW5kQ2hpbGQiLCJjaGlsZE5vZGVzIiwiY29tcG9uZW50cyIsIm5vZGVUb0FwcGVuZCIsInRlc3RDb21wb25lbnQ1RG9tRWwiLCJjcm5FeGNlcHRpb24iLCJlIiwidGVzdENvbXBvbmVudDFEb21FbCIsInJlbW92ZSIsImFsbENvbXBvbmVudHNSZW1vdmVkIiwicmVkdWNlIiwiYWNjdW11bGF0b3IiLCJjdXJyZW50IiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsInNtYXJ0X2Rlc3Ryb3kiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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
