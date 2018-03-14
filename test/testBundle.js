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

var SmartComponentManager = function () {
    function SmartComponentManager() {
        classCallCheck(this, SmartComponentManager);

        this.components = [];
        this.componentsInstance = {};
    }

    createClass(SmartComponentManager, [{
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
        classCallCheck(this, SmartComponent);

        this.smart_init(element, parentComponent, params);
    }

    createClass(SmartComponent, [{
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdEJ1bmRsZS5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL1NtYXJ0Q29tcG9uZW50TWFuYWdlci5qcyIsIi4uL3NyYy9TbWFydENvbXBvbmVudC5qcyIsIlRlc3RNYW5hZ2VyLmpzIiwidGVzdENvbXBvbmVudHMvVGVzdENvbXBvbmVudC5qcyIsInRlc3RDb21wb25lbnRzL1N0b3BDbGlja1Byb3BhZ2F0aW9uQ29tcG9uZW50LmpzIiwidGVzdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbmNsYXNzIFNtYXJ0Q29tcG9uZW50TWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHNJbnN0YW5jZT17fTtcbiAgICB9XG5cbiAgICBjb25maWd1cmUocGFyYW1zKXtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXMgfHwge2dhcmJhZ2VDb2xsZWN0b3I6ZmFsc2UsZ2FyYmFnZUNvbGxlY3RvclJvb3RFbGVtZW50Om51bGx9O1xuXG4gICAgICAgIGlmKHRoaXMucGFyYW1zLmdhcmJhZ2VDb2xsZWN0b3Ipe1xuICAgICAgICAgICAgdGhpcy5nYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQ9dGhpcy5wYXJhbXMuZ2FyYmFnZUNvbGxlY3RvclJvb3RFbGVtZW50IHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiQk9EWVwiKVswXTtcbiAgICAgICAgICAgIGlmKHRoaXMucGFyYW1zLmdhcmJhZ2VDb2xsZWN0b3Ipe1xuICAgICAgICAgICAgICAgIHRoaXMubXV0YXRpb25PYnNlcnZlcj0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIodGhpcy5tdXRhdGlvbkhhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyLm9ic2VydmUodGhpcy5nYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQucGFyZW50Tm9kZSx7YXR0cmlidXRlczogZmFsc2UsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWV9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG11dGF0aW9uSGFuZGxlcihtdXRhdGlvbnNMaXN0KXtcbiAgICAgICAgICAgIGlmKG11dGF0aW9uc0xpc3QgJiYgbXV0YXRpb25zTGlzdC5sZW5ndGg+MCl7XG4gICAgICAgICAgICAgICAgbGV0IHJlbW92ZWRFbGVtZW50cz0gbXV0YXRpb25zTGlzdC5maWx0ZXIoKG0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0ucmVtb3ZlZE5vZGVzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICAgICAgfSkucmVkdWNlKChwcmV2LCBjdXJyZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2LmNvbmNhdChjdXJyZW50LnJlbW92ZWROb2Rlcyk7XG4gICAgICAgICAgICAgICAgfSwgW10pO1xuXG4gICAgICAgICAgICAgICAgaWYocmVtb3ZlZEVsZW1lbnRzLmxlbmd0aD4wKXtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmdldENvbXBvbmVudFN1Yk5vZGVzKHJlbW92ZWRFbGVtZW50cyxbXSkuZm9yRWFjaCgobm9kZSk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgaWYobm9kZS5nZXRBdHRyaWJ1dGUgJiYgbm9kZS5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtaWRcIikpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbXBvbmVudEluc3RhbmNlPXRoaXMuZ2V0Q29tcG9uZW50SW5zdGFuY2VCeUlkKG5vZGUuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LWlkXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNvbXBvbmVudEluc3RhbmNlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJbnN0YW5jZS5zbWFydF9kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgZ2V0Q29tcG9uZW50U3ViTm9kZXMocmVtb3ZlZEVsZW1lbnRzLHByZXZOb2Rlcyl7XG4gICAgICAgIHByZXZOb2RlcyA9cHJldk5vZGVzIHx8IFtdO1xuICAgICAgICBsZXQgcm1FbGVtZW50cz1yZW1vdmVkRWxlbWVudHMubGVuZ3RoPjAgPyByZW1vdmVkRWxlbWVudHM6W3JlbW92ZWRFbGVtZW50c107XG4gICAgICAgIHJtRWxlbWVudHMuZm9yRWFjaCgocmVtb3ZlZE5vZGUpPT57XG4gICAgICAgICAgICBsZXQgY3VycmVudE5vZGU9cmVtb3ZlZE5vZGU7XG4gICAgICAgICAgICBpZihjdXJyZW50Tm9kZS5sZW5ndGgpe1xuICAgICAgICAgICAgICAgIHByZXZOb2Rlcy5wdXNoKHRoaXMuZ2V0Q29tcG9uZW50U3ViTm9kZXMoW10uc2xpY2UuY2FsbChjdXJyZW50Tm9kZSkscHJldk5vZGVzKSk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBpZihjdXJyZW50Tm9kZS5nZXRBdHRyaWJ1dGUgJiYgY3VycmVudE5vZGUuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50XCIpKXtcbiAgICAgICAgICAgICAgICAgICAgcHJldk5vZGVzLnB1c2goY3VycmVudE5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihjdXJyZW50Tm9kZS5jaGlsZHJlbiAmJiBjdXJyZW50Tm9kZS5jaGlsZHJlbi5sZW5ndGg+MCl7XG4gICAgICAgICAgICAgICAgICAgIHByZXZOb2Rlcy5wdXNoKHRoaXMuZ2V0Q29tcG9uZW50U3ViTm9kZXMoW10uc2xpY2UuY2FsbChjdXJyZW50Tm9kZS5jaGlsZHJlbikscHJldk5vZGVzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBwcmV2Tm9kZXM7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJDb21wb25lbnRzKGNvbXBvbmVudHNDbGFzc2VzKXtcbiAgICAgICAgT2JqZWN0LmtleXMoY29tcG9uZW50c0NsYXNzZXMpLmZvckVhY2goKGNvbXBvbmVudENsYXNzTmFtZSk9PntcbiAgICAgICAgICAgIGlmKCF0aGlzLmdldENvbXBvbmVudChjb21wb25lbnRDbGFzc05hbWUpKXtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVyQ29tcG9uZW50KGNvbXBvbmVudENsYXNzTmFtZSxjb21wb25lbnRzQ2xhc3Nlc1tjb21wb25lbnRDbGFzc05hbWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cblxuICAgIHJlZ2lzdGVyQ29tcG9uZW50KG5hbWUsY2xhenopIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIGNsYXp6OiBjbGF6elxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHJlZ2lzdGVyQ29tcG9uZW50SW5zdGFuY2UoaWQsaW5zdGFuY2UpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzSW5zdGFuY2VbaWRdPWluc3RhbmNlO1xuICAgIH1cblxuICAgIHJlbW92ZUNvbXBvbmVudEluc3RhbmNlKGlkKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmNvbXBvbmVudHNJbnN0YW5jZVtpZF07XG4gICAgfVxuXG4gICAgZ2V0Q29tcG9uZW50SW5zdGFuY2VCeUlkKGlkKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50c0luc3RhbmNlW2lkXTtcbiAgICB9XG5cbiAgICBpbml0Q29tcG9uZW50QnlOYW1lKGVsZW1lbnQsY29tcG9uZW50TmFtZSl7XG4gICAgICAgIGxldCBpbnN0YW5jZT1udWxsO1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICB2YXIgY2xhenogPSB0aGlzLmdldENvbXBvbmVudChjb21wb25lbnROYW1lKTtcbiAgICAgICAgICAgIGluc3RhbmNlPW5ldyBjbGF6eihlbGVtZW50KTsgLy9TdGFydCBVcCBDb21wb25lbnRcbiAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHdoZW4gdHJ5aW5nIHRvIGluc3RhbmNlIENvbXBvbmVudCBcIiArIGNvbXBvbmVudE5hbWUgK1wiOiBcIisgZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH1cblxuICAgIGdldENvbXBvbmVudChuYW1lKSB7XG4gICAgICAgIHZhciBjb21wID0gdGhpcy5jb21wb25lbnRzLmZpbHRlcihjID0+IGMubmFtZSA9PSBuYW1lKS5tYXAoYyA9PiBjLmNsYXp6KVswXTtcbiAgICAgICAgcmV0dXJuIGNvbXA7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgU21hcnRDb21wb25lbnRNYW5hZ2VyKCk7XG4iLCJpbXBvcnQgU21hcnRDb21wb25lbnRNYW5hZ2VyIGZyb20gJy4vU21hcnRDb21wb25lbnRNYW5hZ2VyJztcblxuY2xhc3MgU21hcnRDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHBhcmVudENvbXBvbmVudCwgcGFyYW1zKSB7XG4gICAgICAgIHRoaXMuc21hcnRfaW5pdChlbGVtZW50LCBwYXJlbnRDb21wb25lbnQsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgc21hcnRfaW5pdChlbGVtZW50LCBwYXJlbnRDb21wb25lbnQsIHBhcmFtcyl7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuYmluZGVkRWxlbWVudHMgPSB7XCJjbGlja1wiOltdfTtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50SWQgPSAgdGhpcy5fZ2VuZXJhdGVVaWQoKTtcbiAgICAgICAgdGhpcy5wYXJlbnRDb21wb25lbnQgPSBwYXJlbnRDb21wb25lbnQ7XG4gICAgICAgIHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSA9IG51bGw7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuXG5cblxuICAgICAgICAvL1NlcnZlIHBlciByZWN1cGVyYXJlIGlsIGNvbXBvbmVudGUgIHRyYW1pdGUgdW4gbm9tZSBkaSBmYW50YXNpYSBjb250ZW51dG8gbmVsbCdhdHRyaWJ1dG8gY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXG4gICAgICAgIGxldCBjb21wb25lbnRSZWZlcmVuY2VOYW1lID0gdGhpcy5wYXJhbXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSA/IHRoaXMucGFyYW1zLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUgOiB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXCIpO1xuICAgICAgICBjb21wb25lbnRSZWZlcmVuY2VOYW1lPWNvbXBvbmVudFJlZmVyZW5jZU5hbWUgfHwgdGhpcy5fY29tcG9uZW50SWQ7XG5cbiAgICAgICAgdGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lID0gY29tcG9uZW50UmVmZXJlbmNlTmFtZTtcbiAgICAgICAgaWYgKCFlbGVtZW50LmdldEF0dHJpYnV0ZShcImNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZVwiKSkge1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtcmVmZXJlbmNlLW5hbWVcIiwgY29tcG9uZW50UmVmZXJlbmNlTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZighdGhpcy52ZXJpZnlDb21wb25lbnRSZWZlcmVuY2VOYW1lVW5pY2l0eSgpKXtcbiAgICAgICAgICAgIHRocm93IHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSArXCIgY29tcG9uZW50UmVmZXJlbmNlTmFtZSBpcyBhbHJlYWR5IHVzZWQgaW4gXCIrdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50UmVmZXJlbmNlTmFtZSArXCIgaHllcmFyY2h5XCI7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBTbWFydENvbXBvbmVudE1hbmFnZXIucmVnaXN0ZXJDb21wb25lbnRJbnN0YW5jZSh0aGlzLl9jb21wb25lbnRJZCx0aGlzKTtcblxuXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtaWRcIix0aGlzLl9jb21wb25lbnRJZCk7XG5cbiAgICAgICAgaWYoIXRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnRcIikpe1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImNvbXBvbmVudFwiLHRoaXMuY29uc3RydWN0b3IubmFtZSk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmKHRoaXMucGFyZW50Q29tcG9uZW50ICYmICF0aGlzLnBhcmVudENvbXBvbmVudC5jb21wb25lbnRzKXtcbiAgICAgICAgICAgIHRoaXMucGFyZW50Q29tcG9uZW50LmNvbXBvbmVudHM9e307XG4gICAgICAgIH1cblxuXG5cbiAgICAgICAgaWYodGhpcy5wYXJlbnRDb21wb25lbnQpe1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50c1tjb21wb25lbnRSZWZlcmVuY2VOYW1lXSA9IHRoaXM7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtY2xpY2tcIikpe1xuICAgICAgICAgICAgdGhpcy5iaW5kQ29tcG9uZW50Q2xpY2sodGhpcy5lbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBub2Rlc1RvQmluZCA9dGhpcy5fZ2V0Q29tcG9uZW50Q2xpY2tOb2RlVG9CaW5kKFt0aGlzLmVsZW1lbnRdKTtcbiAgICAgICAgaWYobm9kZXNUb0JpbmQubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzVG9CaW5kLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0NvbXBvbmVudHNIaWVyYXJjaHlBbmRCaW5kQ2xpY2sobm9kZXNUb0JpbmRbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9UaGUgbXV0YXRpb25PYnNlcnZlciBpcyB1c2VkIGluIG9yZGVyIHRvIHJldHJpZXZlIGFuZCBoYW5kbGluZyBjb21wb25lbnQtXCJldmVudFwiXG4gICAgICAgIHRoaXMubXV0YXRpb25PYnNlcnZlcj0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIodGhpcy5fbXV0YXRpb25IYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLmVsZW1lbnQucGFyZW50Tm9kZSx7YXR0cmlidXRlczogZmFsc2UsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWV9KTtcblxuICAgIH1cblxuICAgIF9tdXRhdGlvbkhhbmRsZXIobXV0YXRpb25zTGlzdCl7XG4gICAgICAgIHRoaXMuX2V2ZW50TXV0YXRpb25IYW5kbGVyKG11dGF0aW9uc0xpc3QpO1xuICAgIH1cblxuXG4gICAgdmVyaWZ5Q29tcG9uZW50UmVmZXJlbmNlTmFtZVVuaWNpdHkoKXtcbiAgICAgICAgcmV0dXJuICAhdGhpcy5wYXJlbnRDb21wb25lbnQgfHwgIXRoaXMucGFyZW50Q29tcG9uZW50LmNvbXBvbmVudHMgIHx8ICAhdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50c1t0aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWVdO1xuICAgIH1cblxuICAgIF9nZW5lcmF0ZVVpZCgpIHtcbiAgICAgICAgcmV0dXJuICB0aGlzLmNvbnN0cnVjdG9yLm5hbWUrXCJfXCIrJ3h4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkgKiAxNiB8IDAsXG4gICAgICAgICAgICAgICAgdiA9IGMgPT0gJ3gnID8gciA6IChyICYgMHgzIHwgMHg4KTtcbiAgICAgICAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc21hcnRfY2xpY2tIYW5kbGVyKGV2KSB7XG4gICAgICAgIGxldCBmdW5jdGlvbkNvZGUgPSBldi5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnY29tcG9uZW50LWNsaWNrJyk7XG4gICAgICAgIGxldCBmdW5jdGlvbk5hbWUgPSBmdW5jdGlvbkNvZGUuc3BsaXQoXCIoXCIpWzBdO1xuXG4gICAgICAgIGZ1bmN0aW9uIGV4dHJhY3RQYXJhbXMoLi4ucGFyYW1zKSB7XG5cbiAgICAgICAgICAgIGxldCBwYXJhbWV0ZXJzPVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHJldHVybiBwYXJhbWV0ZXJzLm1hcCgocGFyYW0pPT57XG4gICAgICAgICAgICAgICAgaWYocGFyYW09PVwidGhpc1wiKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2O1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyYW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXNbZnVuY3Rpb25OYW1lXSl7XG4gICAgICAgICAgICB0aGlzW2Z1bmN0aW9uTmFtZV0uYXBwbHkodGhpcywgZXZhbChcImV4dHJhY3RQYXJhbXMoXCIrZnVuY3Rpb25Db2RlLnNwbGl0KFwiKFwiKVsxXSkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb2FkQ2hpbGRDb21wb25lbnRzKHBhcmVudENvbXBvbmVudCkge1xuICAgICAgICBsZXQgY29tcG9uZW50c0xvYWRlZD1bXTtcbiAgICAgICAgdmFyIGNvbXBvbmVudHNFbHMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2NvbXBvbmVudF0nKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21wb25lbnRzRWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50SWQgPSBjb21wb25lbnRzRWxzW2ldLmdldEF0dHJpYnV0ZSgnY29tcG9uZW50LWlkJyk7XG5cbiAgICAgICAgICAgIGlmICghY29tcG9uZW50SWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gY29tcG9uZW50c0Vsc1tpXS5nZXRBdHRyaWJ1dGUoJ2NvbXBvbmVudCcpO1xuICAgICAgICAgICAgICAgIHZhciBDbGF6eiA9IFNtYXJ0Q29tcG9uZW50TWFuYWdlci5nZXRDb21wb25lbnQoY29tcG9uZW50KTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzTG9hZGVkLnB1c2goIG5ldyBDbGF6eihjb21wb25lbnRzRWxzW2ldLHBhcmVudENvbXBvbmVudCB8fCB0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudHNMb2FkZWQ7XG4gICAgfVxuXG4gICAgX2JpbmRDb21wb25lbnRDbGljayhub2RlKSB7XG5cbiAgICAgICAgbGV0IGlzQWxyZWFkeUJpbmRlZD10aGlzLmJpbmRlZEVsZW1lbnRzW1wiY2xpY2tcIl0ucmVkdWNlKChhY2N1bXVsYXRvcixjdXJyZW50Tm9kZSk9PntcbiAgICAgICAgICAgIHJldHVybiBhY2N1bXVsYXRvciB8fCBjdXJyZW50Tm9kZS5pc0VxdWFsTm9kZShub2RlKTtcbiAgICAgICAgfSxmYWxzZSk7XG5cbiAgICAgICAgaWYoIWlzQWxyZWFkeUJpbmRlZCl7XG4gICAgICAgICAgICB0aGlzLmJpbmRlZEVsZW1lbnRzW1wiY2xpY2tcIl0ucHVzaChub2RlKTtcbiAgICAgICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSk9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zbWFydF9jbGlja0hhbmRsZXIoZSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2hlY2tDb21wb25lbnRzSGllcmFyY2h5QW5kQmluZENsaWNrKG5vZGUpe1xuICAgICAgICBsZXQgcGFyZW50c0NvbXBvbmVudD0gdGhpcy5fZ2V0RG9tRWxlbWVudFBhcmVudHMoIG5vZGUsICdbY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXScpO1xuICAgICAgICBpZihwYXJlbnRzQ29tcG9uZW50Lmxlbmd0aD4wICYmIHBhcmVudHNDb21wb25lbnRbMF0uZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXCIpPT10aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUpe1xuICAgICAgICAgICAgdGhpcy5fYmluZENvbXBvbmVudENsaWNrKG5vZGUpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9nZXREb21FbGVtZW50UGFyZW50cyhlbGVtLCBzZWxlY3Rvcil7XG4gICAgICAgIC8vIEVsZW1lbnQubWF0Y2hlcygpIHBvbHlmaWxsXG4gICAgICAgIGlmICghRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xuICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9XG4gICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5vTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hdGNoZXMgPSAodGhpcy5kb2N1bWVudCB8fCB0aGlzLm93bmVyRG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwocyksXG4gICAgICAgICAgICAgICAgICAgICAgICBpID0gbWF0Y2hlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICgtLWkgPj0gMCAmJiBtYXRjaGVzLml0ZW0oaSkgIT09IHRoaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaSA+IC0xO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgfVxuICAgICAgICAvLyBTZXR1cCBwYXJlbnRzIGFycmF5XG4gICAgICAgIHZhciBwYXJlbnRzID0gW107XG4gICAgICAgIC8vIEdldCBtYXRjaGluZyBwYXJlbnQgZWxlbWVudHNcbiAgICAgICAgZm9yICggOyBlbGVtICYmIGVsZW0gIT09IGRvY3VtZW50OyBlbGVtID0gZWxlbS5wYXJlbnROb2RlICkge1xuICAgICAgICAgICAgLy8gQWRkIG1hdGNoaW5nIHBhcmVudHMgdG8gYXJyYXlcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtLm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudHMucHVzaChlbGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcmVudHMucHVzaChlbGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyZW50cztcbiAgICB9XG5cblxuICAgIF9ldmVudE11dGF0aW9uSGFuZGxlcihtdXRhdGlvbnNMaXN0KXtcbiAgICAgICAgaWYobXV0YXRpb25zTGlzdCAmJiBtdXRhdGlvbnNMaXN0Lmxlbmd0aD4wKXtcbiAgICAgICAgICAgIGxldCBtdXRhdGlvbkVsZW1lbnRzPSBtdXRhdGlvbnNMaXN0LmZpbHRlcigobSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtLmFkZGVkTm9kZXMubGVuZ3RoID4gMDtcbiAgICAgICAgICAgIH0pLnJlZHVjZSgocHJldiwgY3VycmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2LmNvbmNhdCh0aGlzLl9nZXRDb21wb25lbnRDbGlja05vZGVUb0JpbmQoY3VycmVudC5hZGRlZE5vZGVzKSk7XG4gICAgICAgICAgICB9LCBbXSk7XG5cbiAgICAgICAgICAgIGlmKG11dGF0aW9uRWxlbWVudHMubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG11dGF0aW9uRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja0NvbXBvbmVudHNIaWVyYXJjaHlBbmRCaW5kQ2xpY2sobXV0YXRpb25FbGVtZW50c1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cblxuICAgIF9nZXRDb21wb25lbnRDbGlja05vZGVUb0JpbmQobW9kZXNUb0NoZWNrKXtcbiAgICAgICAgbGV0IG5vZGVzVG9CaW5kPVtdO1xuICAgICAgICBpZihtb2Rlc1RvQ2hlY2subGVuZ3RoKXtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kZXNUb0NoZWNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5vZGU9bW9kZXNUb0NoZWNrW2ldO1xuICAgICAgICAgICAgICAgIGlmKG5vZGUucXVlcnlTZWxlY3RvckFsbCl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb21wb25lbnRDbGlja0VsZW1lbnRzID1ub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tjb21wb25lbnQtY2xpY2tdJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmKG5vZGUuZ2V0QXR0cmlidXRlKCdjb21wb25lbnQtY2xpY2snKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1RvQmluZC5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnRDbGlja0VsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tcG9uZW50Q2xpY2tFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9CaW5kLnB1c2goY29tcG9uZW50Q2xpY2tFbGVtZW50c1tpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGVzVG9CaW5kO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIGJ5IENvbXBvbmVudE1hbmFnZXIgIHdoZW4gZG9tIGNvbXBvbmVudCBpcyByZW1vdmVkLCBvdGhlcndpc2UgeW91IGNhbiBhbHNvIGNhbGwgaXQgZGlyZWN0bHkgaWYgeW91IG5lZWQgb3Igb3ZlcnJpZGUgaXRcbiAgICAgKi9cblxuICAgIHNtYXJ0X2Rlc3Ryb3koKXtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lICsgXCIgZGVzdHJveWVkXCIpO1xuICAgICAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICBTbWFydENvbXBvbmVudE1hbmFnZXIucmVtb3ZlQ29tcG9uZW50SW5zdGFuY2UodGhpcy5fY29tcG9uZW50SWQpO1xuICAgICAgICBpZih0aGlzLmVsZW1lbnQuaXNDb25uZWN0ZWQpe1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZm9yIGFsbCBwcm9wZXJ0aWVzXG4gICAgICAgIGZvciAoY29uc3QgcHJvcCBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzKSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXNbcHJvcF07XG4gICAgICAgIH1cblxuXG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0ICBTbWFydENvbXBvbmVudDsiLCJcbmNsYXNzIFRlc3RNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jbGlja0V2ZW50c0NvdW50ZXI9e31cbiAgICB9XG5cbiAgICBnZXRDbGlja0V2ZW50cyhjb21wb25lbnRSZWZlcmVuY2VOYW1lKXtcbiAgICAgICAgaWYgKHR5cGVvZiAgdGhpcy5jbGlja0V2ZW50c0NvdW50ZXJbY29tcG9uZW50UmVmZXJlbmNlTmFtZV09PT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICB0aGlzLmNsaWNrRXZlbnRzQ291bnRlcltjb21wb25lbnRSZWZlcmVuY2VOYW1lXT0wO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmNsaWNrRXZlbnRzQ291bnRlcltjb21wb25lbnRSZWZlcmVuY2VOYW1lXTtcbiAgICB9XG5cbiAgICBhZGRDbGlja0V2ZW50KGNvbXBvbmVudFJlZmVyZW5jZU5hbWUpe1xuICAgICAgICBpZiAodHlwZW9mICB0aGlzLmNsaWNrRXZlbnRzQ291bnRlcltjb21wb25lbnRSZWZlcmVuY2VOYW1lXSA9PT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICB0aGlzLmNsaWNrRXZlbnRzQ291bnRlcltjb21wb25lbnRSZWZlcmVuY2VOYW1lXT0wO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2xpY2tFdmVudHNDb3VudGVyW2NvbXBvbmVudFJlZmVyZW5jZU5hbWVdKys7XG4gICAgICAgIHJldHVybiB0aGlzLmNsaWNrRXZlbnRzQ291bnRlcltjb21wb25lbnRSZWZlcmVuY2VOYW1lXTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBUZXN0TWFuYWdlcigpOyIsImltcG9ydCB7U21hcnRDb21wb25lbnR9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcbmltcG9ydCBUZXN0TWFuYWdlciBmcm9tIFwiLi4vVGVzdE1hbmFnZXJcIjtcblxuY2xhc3MgVGVzdENvbXBvbmVudCBleHRlbmRzIFNtYXJ0Q29tcG9uZW50e1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCxwYXJlbnRDb21wb25lbnQscGFyYW1zKSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQscGFyZW50Q29tcG9uZW50LHBhcmFtcyk7XG4gICAgfVxuXG4gICAgY2xpY2tIYW5kbGVyKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSk7XG4gICAgICAgIFRlc3RNYW5hZ2VyLmFkZENsaWNrRXZlbnQodGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lKTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGVzdENvbXBvbmVudDsiLCJpbXBvcnQge1NtYXJ0Q29tcG9uZW50fSBmcm9tIFwiLi4vLi4vc3JjL2luZGV4XCI7XG5pbXBvcnQgVGVzdE1hbmFnZXIgZnJvbSBcIi4uL1Rlc3RNYW5hZ2VyXCI7XG5cbmNsYXNzIFN0b3BDbGlja1Byb3BhZ2F0aW9uQ29tcG9uZW50IGV4dGVuZHMgU21hcnRDb21wb25lbnR7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LHBhcmVudENvbXBvbmVudCxwYXJhbXMpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCxwYXJlbnRDb21wb25lbnQscGFyYW1zKTtcbiAgICB9XG5cbiAgICBjbGlja0hhbmRsZXIoZXYpe1xuICAgICAgICBpZihldil7XG4gICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBUZXN0TWFuYWdlci5hZGRDbGlja0V2ZW50KHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudDsiLCJpbXBvcnQge1NtYXJ0Q29tcG9uZW50TWFuYWdlcn0gIGZyb20gXCIuLi9zcmMvaW5kZXhcIjtcbmltcG9ydCBUZXN0TWFuYWdlciBmcm9tIFwiLi9UZXN0TWFuYWdlclwiO1xuaW1wb3J0IFRlc3RDb21wb25lbnQgZnJvbSBcIi4vdGVzdENvbXBvbmVudHMvVGVzdENvbXBvbmVudFwiO1xuaW1wb3J0IFN0b3BDbGlja1Byb3BhZ2F0aW9uQ29tcG9uZW50IGZyb20gXCIuL3Rlc3RDb21wb25lbnRzL1N0b3BDbGlja1Byb3BhZ2F0aW9uQ29tcG9uZW50XCI7XG5cblNtYXJ0Q29tcG9uZW50TWFuYWdlci5yZWdpc3RlckNvbXBvbmVudHMoe1Rlc3RDb21wb25lbnQsU3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnR9KTtcblNtYXJ0Q29tcG9uZW50TWFuYWdlci5jb25maWd1cmUoe2dhcmJhZ2VDb2xsZWN0b3I6dHJ1ZX0pO1xuXG5sZXQgdGVzdENvbXBvbmVudD1udWxsO1xubGV0IHRlc3RDb21wb25lbnQyPW51bGw7XG5sZXQgdGVzdENvbXBvbmVudDM9bnVsbDtcbmxldCB0ZXN0Q29tcG9uZW50ND1udWxsO1xubGV0IHRlc3RDb21wb25lbnQ1PW51bGw7XG5sZXQgdGVzdENvbXBvbmVudDY9bnVsbDtcbmxldCBzdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudD1udWxsO1xuXG5kZXNjcmliZSgnVGVzdENvbXBvbmVudDEgLSBJbnN0YW5jZSBieSBuYW1lJywgZnVuY3Rpb24oKSB7XG4gICAgdGVzdENvbXBvbmVudCA9IFNtYXJ0Q29tcG9uZW50TWFuYWdlci5pbml0Q29tcG9uZW50QnlOYW1lKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJUZXN0Q29tcG9uZW50MVwiXWApLFwiVGVzdENvbXBvbmVudFwiKTtcbiAgICBpdCgnVGVzdENvbXBvbmVudDEgLSBzaG91bGQgYmUgaW5zdGFuY2VkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGFzc2VydC5lcXVhbCh0ZXN0Q29tcG9uZW50LmNvbnN0cnVjdG9yLm5hbWUsIFwiVGVzdENvbXBvbmVudFwiKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnVGVzdENvbXBvbmVudDEgLSBsb2FkIGNoaWxkIGNvbXBvbmVudHMgcGFzc2luZyBsaWtlIHBhcmVudCBUZXN0Q29tcG9uZW50MScsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdUZXN0Q29tcG9uZW50MiAtIFRlc3RDb21wb25lbnQxIHNob3VsZCBiZSBwcmVzZW50IGxpa2UgVGVzdENvbXBvbmVudDIgcGFyZW50JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCBsb2FkZWRDb21wb25lbnRzID0gdGVzdENvbXBvbmVudC5sb2FkQ2hpbGRDb21wb25lbnRzKHRlc3RDb21wb25lbnQpO1xuICAgICAgICB0ZXN0Q29tcG9uZW50Mj1sb2FkZWRDb21wb25lbnRzLmZpbHRlcigoY29tcG9uZW50KT0+e1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5jb21wb25lbnRSZWZlcmVuY2VOYW1lPT1cIlRlc3RDb21wb25lbnQyXCI7XG4gICAgICAgIH0pWzBdO1xuICAgICAgICBhc3NlcnQuZXF1YWwodGVzdENvbXBvbmVudDIucGFyZW50Q29tcG9uZW50LmNvbXBvbmVudFJlZmVyZW5jZU5hbWUsIFwiVGVzdENvbXBvbmVudDFcIik7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ1Rlc3RDb21wb25lbnQyIGNvbXBvbmVudC1jbGljayAtIGNsaWNrIG9uIFRlc3RDb21wb25lbnQyIGNoaWxkIG9uIGNvbXBvbmVudC1jbGljayBhdHRyaWJ1dGUnLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnVGVzdENvbXBvbmVudDIgLSBjbGlja0V2ZW50c051bWJlciBtdXN0IGJlIGluY3JlYXNlIG9mIG9uZScsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgY2xpY2tFdmVudHNOdW1iZXJCZWZvcmU9VGVzdE1hbmFnZXIuZ2V0Q2xpY2tFdmVudHMoXCJUZXN0Q29tcG9uZW50MlwiKTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2NvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlRlc3RDb21wb25lbnQyXCJdIFtjb21wb25lbnQtY2xpY2s9XCJjbGlja0hhbmRsZXIoKVwiXWApLmNsaWNrKCk7XG4gICAgICAgIGF3YWl0IHNldFRpbWVvdXQoKCk9Pnt9LDUwMCk7XG4gICAgICAgIGFzc2VydC5lcXVhbChUZXN0TWFuYWdlci5nZXRDbGlja0V2ZW50cyhcIlRlc3RDb21wb25lbnQyXCIpLCAoY2xpY2tFdmVudHNOdW1iZXJCZWZvcmUgKyAxKSk7XG4gICAgfSk7XG59KTtcblxuXG5kZXNjcmliZSgnVGVzdENvbXBvbmVudDMvNCBhZGRlZCBkaW5hbWljYWxseSAtIGFkZCBkaW5hbWljYWxseSBUZXN0Q29tcG9uZW50MyBsaWtlIGNoaWxkIG9mIFRlc3RDb21wb25lbnQyJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ1Rlc3RDb21wb25lbnQzLzQgLSBzaG91bGQgYmUgcHJlc2VudCBsaWtlIGNoaWxkIG9mIFRlc3RDb21wb25lbnQyJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCB0ZXN0Q29tcG9uZW50MkRvbUVsPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lPVwiVGVzdENvbXBvbmVudDJcIl1gKTtcbiAgICAgICAgdmFyIG5vZGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG5vZGUuaW5uZXJIVE1MPWBcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxkaXYgY29tcG9uZW50PVwiVGVzdENvbXBvbmVudFwiICBjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJUZXN0Q29tcG9uZW50M1wiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY29tcG9uZW50LWNsaWNrPVwiY2xpY2tIYW5kbGVyKClcIj5UZXN0Q29tcG9uZW50MyBDbGljayBIYW5kbGVyPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICBcbiAgICAgICAgICAgIDxkaXYgY29tcG9uZW50PVwiVGVzdENvbXBvbmVudFwiICBjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJUZXN0Q29tcG9uZW50NFwiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY29tcG9uZW50LWNsaWNrPVwiY2xpY2tIYW5kbGVyKClcIj5UZXN0Q29tcG9uZW50NCBDbGljayBIYW5kbGVyPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+YDtcbiAgICAgICAgdGVzdENvbXBvbmVudDJEb21FbC5hcHBlbmRDaGlsZChub2RlLmNoaWxkTm9kZXNbMV0pO1xuICAgICAgICB0ZXN0Q29tcG9uZW50Mi5sb2FkQ2hpbGRDb21wb25lbnRzKCk7XG4gICAgICAgIGF3YWl0IHNldFRpbWVvdXQoKCk9Pnt9LDUwMCk7XG4gICAgICAgIHRlc3RDb21wb25lbnQzPXRlc3RDb21wb25lbnQyLmNvbXBvbmVudHNbXCJUZXN0Q29tcG9uZW50M1wiXTtcbiAgICAgICAgdGVzdENvbXBvbmVudDQ9dGVzdENvbXBvbmVudDIuY29tcG9uZW50c1tcIlRlc3RDb21wb25lbnQ0XCJdO1xuICAgICAgICBhc3NlcnQuZXF1YWwodGVzdENvbXBvbmVudDIuY29tcG9uZW50c1tcIlRlc3RDb21wb25lbnQzXCJdLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUsIFwiVGVzdENvbXBvbmVudDNcIik7XG4gICAgICAgIGFzc2VydC5lcXVhbCh0ZXN0Q29tcG9uZW50Mi5jb21wb25lbnRzW1wiVGVzdENvbXBvbmVudDRcIl0uY29tcG9uZW50UmVmZXJlbmNlTmFtZSwgXCJUZXN0Q29tcG9uZW50NFwiKTtcbiAgICB9KTtcbn0pO1xuXG5cbmRlc2NyaWJlKCdUZXN0Q29tcG9uZW50MyBjb21wb25lbnQtY2xpY2sgLSBjbGljayBvbiBUZXN0Q29tcG9uZW50MyBjaGlsZCBvbiBjb21wb25lbnQtY2xpY2sgYXR0cmlidXRlJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ1Rlc3RDb21wb25lbnQzIC0gY2xpY2tFdmVudHNOdW1iZXIgbXVzdCBiZSBpbmNyZWFzZSBvZiBvbmUnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IGNsaWNrRXZlbnRzTnVtYmVyQmVmb3JlPVRlc3RNYW5hZ2VyLmdldENsaWNrRXZlbnRzKFwiVGVzdENvbXBvbmVudDNcIik7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJUZXN0Q29tcG9uZW50M1wiXSBbY29tcG9uZW50LWNsaWNrPVwiY2xpY2tIYW5kbGVyKClcIl1gKS5jbGljaygpO1xuICAgICAgICBhd2FpdCBzZXRUaW1lb3V0KCgpPT57fSw1MDApO1xuICAgICAgICBhc3NlcnQuZXF1YWwoVGVzdE1hbmFnZXIuZ2V0Q2xpY2tFdmVudHMoXCJUZXN0Q29tcG9uZW50M1wiKSwgKGNsaWNrRXZlbnRzTnVtYmVyQmVmb3JlICsgMSkpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdUZXN0Q29tcG9uZW50NSBpbnN0YW5jZWQgYnkgamF2YXNjcmlwdCAtIGluc3RhbmNlZCBieSBqYXZhc2NyaXB0IFRlc3RDb21wb25lbnQ1IHVuZGVyIFRlc3RDb21wb25lbnQyJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ1Rlc3RDb21wb25lbnQ1IC0gc2hvdWxkIGJlIHByZXNlbnQgbGlrZSBjaGlsZCBvZiBUZXN0Q29tcG9uZW50MicsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgdGVzdENvbXBvbmVudDJEb21FbD0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2NvbXBvbmVudC1yZWZlcmVuY2UtbmFtZT1cIlRlc3RDb21wb25lbnQyXCJdYCk7XG4gICAgICAgIHZhciBub2RlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBub2RlLmlubmVySFRNTD1gPGRpdj48L2Rpdj5gO1xuICAgICAgICBsZXQgbm9kZVRvQXBwZW5kPW5vZGUuY2hpbGROb2Rlc1swXTtcbiAgICAgICAgdGVzdENvbXBvbmVudDJEb21FbC5hcHBlbmRDaGlsZChub2RlVG9BcHBlbmQpO1xuICAgICAgICB0ZXN0Q29tcG9uZW50NSA9IG5ldyBUZXN0Q29tcG9uZW50KG5vZGVUb0FwcGVuZCx0ZXN0Q29tcG9uZW50Mix7Y29tcG9uZW50UmVmZXJlbmNlTmFtZTpcIlRlc3RDb21wb25lbnQ1XCJ9KTtcbiAgICAgICAgYXdhaXQgc2V0VGltZW91dCgoKT0+e30sNTAwKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHRlc3RDb21wb25lbnQyLmNvbXBvbmVudHNbXCJUZXN0Q29tcG9uZW50NVwiXS5jb21wb25lbnRSZWZlcmVuY2VOYW1lLCBcIlRlc3RDb21wb25lbnQ1XCIpO1xuICAgIH0pO1xufSk7XG5cblxuZGVzY3JpYmUoJ1Rlc3RDb21wb25lbnQ2IGluc3RhbmNlZCBieSBqYXZhc2NyaXB0IC0gaW5zdGFuY2VkIGJ5IGphdmFzY3JpcHQgVGVzdENvbXBvbmVudDYgdW5kZXIgVGVzdENvbXBvbmVudDUnLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnVGVzdENvbXBvbmVudDYgLSBzaG91bGQgYmUgcHJlc2VudCBsaWtlIGNoaWxkIG9mIFRlc3RDb21wb25lbnQ1JywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCB0ZXN0Q29tcG9uZW50NURvbUVsPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lPVwiVGVzdENvbXBvbmVudDVcIl1gKTtcbiAgICAgICAgdmFyIG5vZGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG5vZGUuaW5uZXJIVE1MPWA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNvbXBvbmVudC1jbGljaz1cImNsaWNrSGFuZGxlcigpXCI+VGVzdENvbXBvbmVudDYgQ2xpY2sgSGFuZGxlcjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcbiAgICAgICAgbGV0IG5vZGVUb0FwcGVuZD1ub2RlLmNoaWxkTm9kZXNbMF07XG4gICAgICAgIHRlc3RDb21wb25lbnQ1RG9tRWwuYXBwZW5kQ2hpbGQobm9kZVRvQXBwZW5kKTtcbiAgICAgICAgdGVzdENvbXBvbmVudDYgPSBuZXcgVGVzdENvbXBvbmVudChub2RlVG9BcHBlbmQsdGVzdENvbXBvbmVudDUse2NvbXBvbmVudFJlZmVyZW5jZU5hbWU6XCJUZXN0Q29tcG9uZW50NlwifSk7XG4gICAgICAgIGF3YWl0IHNldFRpbWVvdXQoKCk9Pnt9LDUwMCk7XG4gICAgICAgIGFzc2VydC5lcXVhbCh0ZXN0Q29tcG9uZW50NS5jb21wb25lbnRzW1wiVGVzdENvbXBvbmVudDZcIl0uY29tcG9uZW50UmVmZXJlbmNlTmFtZSwgXCJUZXN0Q29tcG9uZW50NlwiKTtcbiAgICB9KTtcbn0pO1xuXG5cbmRlc2NyaWJlKCdEZXRlY3QgY29uZmxpY3QgaW4gY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lIC0gdXNpbmcgdHdvIHRpbWVzIFRlc3RDb21wb25lbnQ2IHVuZGVyIFRlc3RDb21wb25lbnQ1IGNvbXBvbmVudCcsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdOb3QgdW5pcXVlIGNvbXBvbmVudCByZWZlcmVuY2UgbmFtZSBleGNlcHRpb24gaXMgdGhyb3dlZCAnLCAgZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCB0ZXN0Q29tcG9uZW50NURvbUVsPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lPVwiVGVzdENvbXBvbmVudDVcIl1gKTtcbiAgICAgICAgdmFyIG5vZGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIG5vZGUuaW5uZXJIVE1MPWA8ZGl2IGNvbXBvbmVudD1cIlRlc3RDb21wb25lbnRcIiBjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJUZXN0Q29tcG9uZW50NlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcbiAgICAgICAgbGV0IG5vZGVUb0FwcGVuZD1ub2RlLmNoaWxkTm9kZXNbMF07XG4gICAgICAgIHRlc3RDb21wb25lbnQ1RG9tRWwuYXBwZW5kQ2hpbGQobm9kZVRvQXBwZW5kKTtcbiAgICAgICAgbGV0IGNybkV4Y2VwdGlvbj1udWxsXG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIHRlc3RDb21wb25lbnQ1LmxvYWRDaGlsZENvbXBvbmVudHMoKTtcbiAgICAgICAgfWNhdGNoIChlKXtcbiAgICAgICAgICAgIGNybkV4Y2VwdGlvbj1lO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgIH1cblxuICAgICAgICBhc3NlcnQuZXF1YWwoY3JuRXhjZXB0aW9uIT1udWxsLCB0cnVlKTtcbiAgICB9KTtcbn0pO1xuXG5cblxuZGVzY3JpYmUoJ0hhbmRsZSBldmVudCAtIHN0b3BwaW5nIHByb3BhZ2F0aW9uIGFjcm9zcyBpbm5lc3RlZCBjb21wb25lbnQtY2xpY2sgZnVuY3Rpb24nLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnU3RvcCBldmVudCBwcm9wYWdhdGlvbiBPbmx5IHRoZSBmaXJzdCBmdW5jdGlvbiBjb21wb25lbnQtY2xpY2sgaW4gdGhlIGhpZXJhcmNoeSBpcyBpbnZva2VkJywgYXN5bmMgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgbGV0IGNsaWNrRXZlbnRzTnVtYmVyQmVmb3JlPVRlc3RNYW5hZ2VyLmdldENsaWNrRXZlbnRzKFwiU3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnRcIik7XG5cbiAgICAgICAgbGV0IHRlc3RDb21wb25lbnQxRG9tRWw9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJUZXN0Q29tcG9uZW50MVwiXWApO1xuICAgICAgICB2YXIgbm9kZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbm9kZS5pbm5lckhUTUw9YDxkaXYgY29tcG9uZW50PVwiU3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnRcIiBjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJTdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY29tcG9uZW50LWNsaWNrPVwiY2xpY2tIYW5kbGVyKCd0aGlzJylcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0b3BDbGlja1Byb3BhZ2F0aW9uQ29tcG9uZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNvbXBvbmVudC1jbGljaz1cImNsaWNrSGFuZGxlcigndGhpcycpXCI+U3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnQgMjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuICAgICAgICB0ZXN0Q29tcG9uZW50MURvbUVsLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgICBsZXQgbG9hZGVkQ29tcG9uZW50cyA9IHRlc3RDb21wb25lbnQubG9hZENoaWxkQ29tcG9uZW50cygpO1xuICAgICAgICBzdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudD1sb2FkZWRDb21wb25lbnRzWzFdO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lPVwiU3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnRcIl0gYnV0dG9uYCkuY2xpY2soKTtcbiAgICAgICAgYXdhaXQgc2V0VGltZW91dCgoKT0+e30sMTAwMCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFRlc3RNYW5hZ2VyLmdldENsaWNrRXZlbnRzKFwiU3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnRcIikpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoVGVzdE1hbmFnZXIuZ2V0Q2xpY2tFdmVudHMoXCJTdG9wQ2xpY2tQcm9wYWdhdGlvbkNvbXBvbmVudFwiKSwgKGNsaWNrRXZlbnRzTnVtYmVyQmVmb3JlKzEpKTtcbiAgICB9KVxufSlcblxuZGVzY3JpYmUoJ1JlbW92ZSBUZXN0Q29tcG9uZW50MiBmcm9tIGRvbSAtIHJlbW92ZSB0aGUgZG9tIGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgY29tcG9uZW50JywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ0NvbXBvbmVudCBhbmQgdGhlaXJzIGNoaWxsZHJlbiBtdXN0IGJlIGRlYWxsb2NhdGVkJywgYXN5bmMgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgbGV0IHRlc3RDb21wb25lbnQyRG9tRWw9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtjb21wb25lbnQtcmVmZXJlbmNlLW5hbWU9XCJUZXN0Q29tcG9uZW50MlwiXWApO1xuXG4gICAgICAgIHRlc3RDb21wb25lbnQyRG9tRWwucmVtb3ZlKCk7XG4gICAgICAgIGF3YWl0IHNldFRpbWVvdXQoKCk9Pnt9LDEwMDApO1xuXG4gICAgICAgIGxldCBhbGxDb21wb25lbnRzUmVtb3ZlZD0gW3Rlc3RDb21wb25lbnQyLHRlc3RDb21wb25lbnQzLHRlc3RDb21wb25lbnQ0LHRlc3RDb21wb25lbnQ1LHRlc3RDb21wb25lbnQ2XS5yZWR1Y2UoKGFjY3VtdWxhdG9yLGN1cnJlbnQpPT57XG4gICAgICAgICAgICByZXR1cm4gYWNjdW11bGF0b3IgJiYgIChPYmplY3Qua2V5cyhjdXJyZW50KS5sZW5ndGggPT09IDAgIHx8ICFjdXJyZW50KTtcbiAgICAgICAgfSx0cnVlKTtcblxuICAgICAgICBhc3NlcnQuZXF1YWwoYWxsQ29tcG9uZW50c1JlbW92ZWQsIHRydWUpO1xuICAgIH0pXG59KVxuXG5kZXNjcmliZSgnUmVtb3ZlIFRlc3RDb21wb25lbnQgcHJvZ3JhbW1hdGljYWxseSAtIHJlbW92ZSB0aGUgZG9tIGVsZW1lbnQgYW5kIHRoZWlycyBjaGlsZHJlbicsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdDb21wb25lbnQgYW5kIHRoZWlycyBjaGlsbGRyZW4gbXVzdCBiZSBkZWFsbG9jYXRlZCcsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgICB0ZXN0Q29tcG9uZW50LnNtYXJ0X2Rlc3Ryb3koKTtcbiAgICAgICAgYXdhaXQgc2V0VGltZW91dCgoKT0+e30sMjAwMCk7XG4gICAgICAgIGxldCBhbGxDb21wb25lbnRzUmVtb3ZlZD0gW3Rlc3RDb21wb25lbnQsc3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnRdLnJlZHVjZSgoYWNjdW11bGF0b3IsY3VycmVudCk9PntcbiAgICAgICAgICAgIHJldHVybiBhY2N1bXVsYXRvciAmJiAgKE9iamVjdC5rZXlzKGN1cnJlbnQpLmxlbmd0aCA9PT0gMCAgfHwgIWN1cnJlbnQpO1xuICAgICAgICB9LHRydWUpO1xuXG4gICAgICAgIGFzc2VydC5lcXVhbChhbGxDb21wb25lbnRzUmVtb3ZlZCwgdHJ1ZSk7XG4gICAgfSlcbn0pXG5cblxuXG4vL3JlcGxhY2UgZXZhbCBtZXRob2QgaW4gb3JkZXIgdG8gcmV0cmlldmUgZnVuY3Rpb24gcGFyYW1ldGVyc1xuXG4vL0luaXRcbi8vQmVmb3JDb21wb25ldENsaWNrXG4vL0xhbmNpYXJlIGVjY2V6aW9uZSBzZSB2ZW5nb25vIHRyb3ZhdGUgY29tcG9uZW50UmVmZXJlbmNlTmFtZSByZWdpc3RyYXRlIG8gc2UgaWwgY29tcG9uZW50UmVmZXJlbmNlTmFtZSBjb2luY2lkZSBjb24gcXVlbGxhIGRlbCBwYWRyZVxuXG5cblxuXG4iXSwibmFtZXMiOlsiU21hcnRDb21wb25lbnRNYW5hZ2VyIiwiY29tcG9uZW50cyIsImNvbXBvbmVudHNJbnN0YW5jZSIsInBhcmFtcyIsImdhcmJhZ2VDb2xsZWN0b3IiLCJnYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQiLCJkb2N1bWVudCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwibXV0YXRpb25PYnNlcnZlciIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJtdXRhdGlvbkhhbmRsZXIiLCJiaW5kIiwib2JzZXJ2ZSIsInBhcmVudE5vZGUiLCJhdHRyaWJ1dGVzIiwiY2hpbGRMaXN0IiwiY2hhcmFjdGVyRGF0YSIsInN1YnRyZWUiLCJtdXRhdGlvbnNMaXN0IiwibGVuZ3RoIiwicmVtb3ZlZEVsZW1lbnRzIiwiZmlsdGVyIiwibSIsInJlbW92ZWROb2RlcyIsInJlZHVjZSIsInByZXYiLCJjdXJyZW50IiwiY29uY2F0IiwiZ2V0Q29tcG9uZW50U3ViTm9kZXMiLCJmb3JFYWNoIiwibm9kZSIsImdldEF0dHJpYnV0ZSIsImNvbXBvbmVudEluc3RhbmNlIiwiZ2V0Q29tcG9uZW50SW5zdGFuY2VCeUlkIiwic21hcnRfZGVzdHJveSIsInByZXZOb2RlcyIsInJtRWxlbWVudHMiLCJyZW1vdmVkTm9kZSIsImN1cnJlbnROb2RlIiwicHVzaCIsInNsaWNlIiwiY2FsbCIsImNoaWxkcmVuIiwiY29tcG9uZW50c0NsYXNzZXMiLCJrZXlzIiwiY29tcG9uZW50Q2xhc3NOYW1lIiwiZ2V0Q29tcG9uZW50IiwicmVnaXN0ZXJDb21wb25lbnQiLCJuYW1lIiwiY2xhenoiLCJpZCIsImluc3RhbmNlIiwiZWxlbWVudCIsImNvbXBvbmVudE5hbWUiLCJlIiwiZXJyb3IiLCJjb21wIiwiYyIsIm1hcCIsIlNtYXJ0Q29tcG9uZW50IiwicGFyZW50Q29tcG9uZW50Iiwic21hcnRfaW5pdCIsImJpbmRlZEVsZW1lbnRzIiwiX2NvbXBvbmVudElkIiwiX2dlbmVyYXRlVWlkIiwiY29tcG9uZW50UmVmZXJlbmNlTmFtZSIsInNldEF0dHJpYnV0ZSIsInZlcmlmeUNvbXBvbmVudFJlZmVyZW5jZU5hbWVVbmljaXR5IiwicmVnaXN0ZXJDb21wb25lbnRJbnN0YW5jZSIsImNvbnN0cnVjdG9yIiwiYmluZENvbXBvbmVudENsaWNrIiwibm9kZXNUb0JpbmQiLCJfZ2V0Q29tcG9uZW50Q2xpY2tOb2RlVG9CaW5kIiwiaSIsImNoZWNrQ29tcG9uZW50c0hpZXJhcmNoeUFuZEJpbmRDbGljayIsIl9tdXRhdGlvbkhhbmRsZXIiLCJfZXZlbnRNdXRhdGlvbkhhbmRsZXIiLCJyZXBsYWNlIiwiciIsIk1hdGgiLCJyYW5kb20iLCJ2IiwidG9TdHJpbmciLCJldiIsImZ1bmN0aW9uQ29kZSIsImN1cnJlbnRUYXJnZXQiLCJmdW5jdGlvbk5hbWUiLCJzcGxpdCIsImV4dHJhY3RQYXJhbXMiLCJwYXJhbWV0ZXJzIiwiYXJndW1lbnRzIiwicGFyYW0iLCJhcHBseSIsImV2YWwiLCJjb21wb25lbnRzTG9hZGVkIiwiY29tcG9uZW50c0VscyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJjb21wb25lbnRJZCIsImNvbXBvbmVudCIsIkNsYXp6IiwiaXNBbHJlYWR5QmluZGVkIiwiYWNjdW11bGF0b3IiLCJpc0VxdWFsTm9kZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJzbWFydF9jbGlja0hhbmRsZXIiLCJwYXJlbnRzQ29tcG9uZW50IiwiX2dldERvbUVsZW1lbnRQYXJlbnRzIiwiX2JpbmRDb21wb25lbnRDbGljayIsImVsZW0iLCJzZWxlY3RvciIsIkVsZW1lbnQiLCJwcm90b3R5cGUiLCJtYXRjaGVzIiwibWF0Y2hlc1NlbGVjdG9yIiwibW96TWF0Y2hlc1NlbGVjdG9yIiwibXNNYXRjaGVzU2VsZWN0b3IiLCJvTWF0Y2hlc1NlbGVjdG9yIiwid2Via2l0TWF0Y2hlc1NlbGVjdG9yIiwicyIsIm93bmVyRG9jdW1lbnQiLCJpdGVtIiwicGFyZW50cyIsIm11dGF0aW9uRWxlbWVudHMiLCJhZGRlZE5vZGVzIiwibW9kZXNUb0NoZWNrIiwiY29tcG9uZW50Q2xpY2tFbGVtZW50cyIsImxvZyIsImRpc2Nvbm5lY3QiLCJyZW1vdmVDb21wb25lbnRJbnN0YW5jZSIsImlzQ29ubmVjdGVkIiwicmVtb3ZlIiwiT2JqZWN0IiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsInByb3AiLCJUZXN0TWFuYWdlciIsImNsaWNrRXZlbnRzQ291bnRlciIsIlRlc3RDb21wb25lbnQiLCJhZGRDbGlja0V2ZW50IiwiU3RvcENsaWNrUHJvcGFnYXRpb25Db21wb25lbnQiLCJzdG9wUHJvcGFnYXRpb24iLCJyZWdpc3RlckNvbXBvbmVudHMiLCJjb25maWd1cmUiLCJ0ZXN0Q29tcG9uZW50IiwidGVzdENvbXBvbmVudDIiLCJ0ZXN0Q29tcG9uZW50MyIsInRlc3RDb21wb25lbnQ0IiwidGVzdENvbXBvbmVudDUiLCJ0ZXN0Q29tcG9uZW50NiIsInN0b3BDbGlja1Byb3BhZ2F0aW9uQ29tcG9uZW50IiwiZGVzY3JpYmUiLCJpbml0Q29tcG9uZW50QnlOYW1lIiwicXVlcnlTZWxlY3RvciIsImVxdWFsIiwibG9hZGVkQ29tcG9uZW50cyIsImxvYWRDaGlsZENvbXBvbmVudHMiLCJjbGlja0V2ZW50c051bWJlckJlZm9yZSIsImdldENsaWNrRXZlbnRzIiwiY2xpY2siLCJzZXRUaW1lb3V0IiwidGVzdENvbXBvbmVudDJEb21FbCIsImNyZWF0ZUVsZW1lbnQiLCJpbm5lckhUTUwiLCJhcHBlbmRDaGlsZCIsImNoaWxkTm9kZXMiLCJub2RlVG9BcHBlbmQiLCJ0ZXN0Q29tcG9uZW50NURvbUVsIiwiY3JuRXhjZXB0aW9uIiwidGVzdENvbXBvbmVudDFEb21FbCIsImFsbENvbXBvbmVudHNSZW1vdmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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
