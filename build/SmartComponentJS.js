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

export { SmartComponentManager$1 as SmartComponentManager, SmartComponent };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU21hcnRDb21wb25lbnRKUy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL1NtYXJ0Q29tcG9uZW50TWFuYWdlci5qcyIsIi4uL3NyYy9TbWFydENvbXBvbmVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbmNsYXNzIFNtYXJ0Q29tcG9uZW50TWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHNJbnN0YW5jZT17fTtcbiAgICB9XG5cbiAgICBjb25maWd1cmUocGFyYW1zKXtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXMgfHwge2dhcmJhZ2VDb2xsZWN0b3I6ZmFsc2UsZ2FyYmFnZUNvbGxlY3RvclJvb3RFbGVtZW50Om51bGx9O1xuXG4gICAgICAgIGlmKHRoaXMucGFyYW1zLmdhcmJhZ2VDb2xsZWN0b3Ipe1xuICAgICAgICAgICAgdGhpcy5nYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQ9dGhpcy5wYXJhbXMuZ2FyYmFnZUNvbGxlY3RvclJvb3RFbGVtZW50IHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiQk9EWVwiKVswXTtcbiAgICAgICAgICAgIGlmKHRoaXMucGFyYW1zLmdhcmJhZ2VDb2xsZWN0b3Ipe1xuICAgICAgICAgICAgICAgIHRoaXMubXV0YXRpb25PYnNlcnZlcj0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIodGhpcy5tdXRhdGlvbkhhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyLm9ic2VydmUodGhpcy5nYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQucGFyZW50Tm9kZSx7YXR0cmlidXRlczogZmFsc2UsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWV9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG11dGF0aW9uSGFuZGxlcihtdXRhdGlvbnNMaXN0KXtcbiAgICAgICAgICAgIGlmKG11dGF0aW9uc0xpc3QgJiYgbXV0YXRpb25zTGlzdC5sZW5ndGg+MCl7XG4gICAgICAgICAgICAgICAgbGV0IHJlbW92ZWRFbGVtZW50cz0gbXV0YXRpb25zTGlzdC5maWx0ZXIoKG0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0ucmVtb3ZlZE5vZGVzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICAgICAgfSkucmVkdWNlKChwcmV2LCBjdXJyZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2LmNvbmNhdChjdXJyZW50LnJlbW92ZWROb2Rlcyk7XG4gICAgICAgICAgICAgICAgfSwgW10pO1xuXG4gICAgICAgICAgICAgICAgaWYocmVtb3ZlZEVsZW1lbnRzLmxlbmd0aD4wKXtcbiAgICAgICAgICAgICAgICAgICB0aGlzLmdldENvbXBvbmVudFN1Yk5vZGVzKHJlbW92ZWRFbGVtZW50cyxbXSkuZm9yRWFjaCgobm9kZSk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgaWYobm9kZS5nZXRBdHRyaWJ1dGUgJiYgbm9kZS5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtaWRcIikpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbXBvbmVudEluc3RhbmNlPXRoaXMuZ2V0Q29tcG9uZW50SW5zdGFuY2VCeUlkKG5vZGUuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LWlkXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNvbXBvbmVudEluc3RhbmNlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJbnN0YW5jZS5zbWFydF9kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgZ2V0Q29tcG9uZW50U3ViTm9kZXMocmVtb3ZlZEVsZW1lbnRzLHByZXZOb2Rlcyl7XG4gICAgICAgIHByZXZOb2RlcyA9cHJldk5vZGVzIHx8IFtdO1xuICAgICAgICBsZXQgcm1FbGVtZW50cz1yZW1vdmVkRWxlbWVudHMubGVuZ3RoPjAgPyByZW1vdmVkRWxlbWVudHM6W3JlbW92ZWRFbGVtZW50c107XG4gICAgICAgIHJtRWxlbWVudHMuZm9yRWFjaCgocmVtb3ZlZE5vZGUpPT57XG4gICAgICAgICAgICBsZXQgY3VycmVudE5vZGU9cmVtb3ZlZE5vZGU7XG4gICAgICAgICAgICBpZihjdXJyZW50Tm9kZS5sZW5ndGgpe1xuICAgICAgICAgICAgICAgIHByZXZOb2Rlcy5wdXNoKHRoaXMuZ2V0Q29tcG9uZW50U3ViTm9kZXMoW10uc2xpY2UuY2FsbChjdXJyZW50Tm9kZSkscHJldk5vZGVzKSk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBpZihjdXJyZW50Tm9kZS5nZXRBdHRyaWJ1dGUgJiYgY3VycmVudE5vZGUuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50XCIpKXtcbiAgICAgICAgICAgICAgICAgICAgcHJldk5vZGVzLnB1c2goY3VycmVudE5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihjdXJyZW50Tm9kZS5jaGlsZHJlbiAmJiBjdXJyZW50Tm9kZS5jaGlsZHJlbi5sZW5ndGg+MCl7XG4gICAgICAgICAgICAgICAgICAgIHByZXZOb2Rlcy5wdXNoKHRoaXMuZ2V0Q29tcG9uZW50U3ViTm9kZXMoW10uc2xpY2UuY2FsbChjdXJyZW50Tm9kZS5jaGlsZHJlbikscHJldk5vZGVzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBwcmV2Tm9kZXM7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJDb21wb25lbnRzKGNvbXBvbmVudHNDbGFzc2VzKXtcbiAgICAgICAgT2JqZWN0LmtleXMoY29tcG9uZW50c0NsYXNzZXMpLmZvckVhY2goKGNvbXBvbmVudENsYXNzTmFtZSk9PntcbiAgICAgICAgICAgIGlmKCF0aGlzLmdldENvbXBvbmVudChjb21wb25lbnRDbGFzc05hbWUpKXtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVyQ29tcG9uZW50KGNvbXBvbmVudENsYXNzTmFtZSxjb21wb25lbnRzQ2xhc3Nlc1tjb21wb25lbnRDbGFzc05hbWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cblxuICAgIHJlZ2lzdGVyQ29tcG9uZW50KG5hbWUsY2xhenopIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIGNsYXp6OiBjbGF6elxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHJlZ2lzdGVyQ29tcG9uZW50SW5zdGFuY2UoaWQsaW5zdGFuY2UpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzSW5zdGFuY2VbaWRdPWluc3RhbmNlO1xuICAgIH1cblxuICAgIHJlbW92ZUNvbXBvbmVudEluc3RhbmNlKGlkKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmNvbXBvbmVudHNJbnN0YW5jZVtpZF07XG4gICAgfVxuXG4gICAgZ2V0Q29tcG9uZW50SW5zdGFuY2VCeUlkKGlkKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50c0luc3RhbmNlW2lkXTtcbiAgICB9XG5cbiAgICBpbml0Q29tcG9uZW50QnlOYW1lKGVsZW1lbnQsY29tcG9uZW50TmFtZSl7XG4gICAgICAgIGxldCBpbnN0YW5jZT1udWxsO1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICB2YXIgY2xhenogPSB0aGlzLmdldENvbXBvbmVudChjb21wb25lbnROYW1lKTtcbiAgICAgICAgICAgIGluc3RhbmNlPW5ldyBjbGF6eihlbGVtZW50KTsgLy9TdGFydCBVcCBDb21wb25lbnRcbiAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHdoZW4gdHJ5aW5nIHRvIGluc3RhbmNlIENvbXBvbmVudCBcIiArIGNvbXBvbmVudE5hbWUgK1wiOiBcIisgZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH1cblxuICAgIGdldENvbXBvbmVudChuYW1lKSB7XG4gICAgICAgIHZhciBjb21wID0gdGhpcy5jb21wb25lbnRzLmZpbHRlcihjID0+IGMubmFtZSA9PSBuYW1lKS5tYXAoYyA9PiBjLmNsYXp6KVswXTtcbiAgICAgICAgcmV0dXJuIGNvbXA7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgU21hcnRDb21wb25lbnRNYW5hZ2VyKCk7XG4iLCJpbXBvcnQgU21hcnRDb21wb25lbnRNYW5hZ2VyIGZyb20gJy4vU21hcnRDb21wb25lbnRNYW5hZ2VyJztcblxuY2xhc3MgU21hcnRDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHBhcmVudENvbXBvbmVudCwgcGFyYW1zKSB7XG4gICAgICAgIHRoaXMuc21hcnRfaW5pdChlbGVtZW50LCBwYXJlbnRDb21wb25lbnQsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgc21hcnRfaW5pdChlbGVtZW50LCBwYXJlbnRDb21wb25lbnQsIHBhcmFtcyl7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuYmluZGVkRWxlbWVudHMgPSB7XCJjbGlja1wiOltdfTtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50SWQgPSAgdGhpcy5fZ2VuZXJhdGVVaWQoKTtcbiAgICAgICAgdGhpcy5wYXJlbnRDb21wb25lbnQgPSBwYXJlbnRDb21wb25lbnQ7XG4gICAgICAgIHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSA9IG51bGw7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuXG5cblxuICAgICAgICAvL1NlcnZlIHBlciByZWN1cGVyYXJlIGlsIGNvbXBvbmVudGUgIHRyYW1pdGUgdW4gbm9tZSBkaSBmYW50YXNpYSBjb250ZW51dG8gbmVsbCdhdHRyaWJ1dG8gY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXG4gICAgICAgIGxldCBjb21wb25lbnRSZWZlcmVuY2VOYW1lID0gdGhpcy5wYXJhbXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSA/IHRoaXMucGFyYW1zLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUgOiB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXCIpO1xuICAgICAgICBjb21wb25lbnRSZWZlcmVuY2VOYW1lPWNvbXBvbmVudFJlZmVyZW5jZU5hbWUgfHwgdGhpcy5fY29tcG9uZW50SWQ7XG5cbiAgICAgICAgdGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lID0gY29tcG9uZW50UmVmZXJlbmNlTmFtZTtcbiAgICAgICAgaWYgKCFlbGVtZW50LmdldEF0dHJpYnV0ZShcImNvbXBvbmVudC1yZWZlcmVuY2UtbmFtZVwiKSkge1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtcmVmZXJlbmNlLW5hbWVcIiwgY29tcG9uZW50UmVmZXJlbmNlTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZighdGhpcy52ZXJpZnlDb21wb25lbnRSZWZlcmVuY2VOYW1lVW5pY2l0eSgpKXtcbiAgICAgICAgICAgIHRocm93IHRoaXMuY29tcG9uZW50UmVmZXJlbmNlTmFtZSArXCIgY29tcG9uZW50UmVmZXJlbmNlTmFtZSBpcyBhbHJlYWR5IHVzZWQgaW4gXCIrdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50UmVmZXJlbmNlTmFtZSArXCIgaHllcmFyY2h5XCI7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBTbWFydENvbXBvbmVudE1hbmFnZXIucmVnaXN0ZXJDb21wb25lbnRJbnN0YW5jZSh0aGlzLl9jb21wb25lbnRJZCx0aGlzKTtcblxuXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtaWRcIix0aGlzLl9jb21wb25lbnRJZCk7XG5cbiAgICAgICAgaWYoIXRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnRcIikpe1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImNvbXBvbmVudFwiLHRoaXMuY29uc3RydWN0b3IubmFtZSk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmKHRoaXMucGFyZW50Q29tcG9uZW50ICYmICF0aGlzLnBhcmVudENvbXBvbmVudC5jb21wb25lbnRzKXtcbiAgICAgICAgICAgIHRoaXMucGFyZW50Q29tcG9uZW50LmNvbXBvbmVudHM9e307XG4gICAgICAgIH1cblxuXG5cbiAgICAgICAgaWYodGhpcy5wYXJlbnRDb21wb25lbnQpe1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50c1tjb21wb25lbnRSZWZlcmVuY2VOYW1lXSA9IHRoaXM7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjb21wb25lbnQtY2xpY2tcIikpe1xuICAgICAgICAgICAgdGhpcy5iaW5kQ29tcG9uZW50Q2xpY2sodGhpcy5lbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBub2Rlc1RvQmluZCA9dGhpcy5fZ2V0Q29tcG9uZW50Q2xpY2tOb2RlVG9CaW5kKFt0aGlzLmVsZW1lbnRdKTtcbiAgICAgICAgaWYobm9kZXNUb0JpbmQubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzVG9CaW5kLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0NvbXBvbmVudHNIaWVyYXJjaHlBbmRCaW5kQ2xpY2sobm9kZXNUb0JpbmRbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9UaGUgbXV0YXRpb25PYnNlcnZlciBpcyB1c2VkIGluIG9yZGVyIHRvIHJldHJpZXZlIGFuZCBoYW5kbGluZyBjb21wb25lbnQtXCJldmVudFwiXG4gICAgICAgIHRoaXMubXV0YXRpb25PYnNlcnZlcj0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIodGhpcy5fbXV0YXRpb25IYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLmVsZW1lbnQucGFyZW50Tm9kZSx7YXR0cmlidXRlczogZmFsc2UsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWV9KTtcblxuICAgIH1cblxuICAgIF9tdXRhdGlvbkhhbmRsZXIobXV0YXRpb25zTGlzdCl7XG4gICAgICAgIHRoaXMuX2V2ZW50TXV0YXRpb25IYW5kbGVyKG11dGF0aW9uc0xpc3QpO1xuICAgIH1cblxuXG4gICAgdmVyaWZ5Q29tcG9uZW50UmVmZXJlbmNlTmFtZVVuaWNpdHkoKXtcbiAgICAgICAgcmV0dXJuICAhdGhpcy5wYXJlbnRDb21wb25lbnQgfHwgIXRoaXMucGFyZW50Q29tcG9uZW50LmNvbXBvbmVudHMgIHx8ICAhdGhpcy5wYXJlbnRDb21wb25lbnQuY29tcG9uZW50c1t0aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWVdO1xuICAgIH1cblxuICAgIF9nZW5lcmF0ZVVpZCgpIHtcbiAgICAgICAgcmV0dXJuICB0aGlzLmNvbnN0cnVjdG9yLm5hbWUrXCJfXCIrJ3h4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkgKiAxNiB8IDAsXG4gICAgICAgICAgICAgICAgdiA9IGMgPT0gJ3gnID8gciA6IChyICYgMHgzIHwgMHg4KTtcbiAgICAgICAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc21hcnRfY2xpY2tIYW5kbGVyKGV2KSB7XG4gICAgICAgIGxldCBmdW5jdGlvbkNvZGUgPSBldi5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnY29tcG9uZW50LWNsaWNrJyk7XG4gICAgICAgIGxldCBmdW5jdGlvbk5hbWUgPSBmdW5jdGlvbkNvZGUuc3BsaXQoXCIoXCIpWzBdO1xuXG4gICAgICAgIGZ1bmN0aW9uIGV4dHJhY3RQYXJhbXMoLi4ucGFyYW1zKSB7XG5cbiAgICAgICAgICAgIGxldCBwYXJhbWV0ZXJzPVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHJldHVybiBwYXJhbWV0ZXJzLm1hcCgocGFyYW0pPT57XG4gICAgICAgICAgICAgICAgaWYocGFyYW09PVwidGhpc1wiKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2O1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyYW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXNbZnVuY3Rpb25OYW1lXSl7XG4gICAgICAgICAgICB0aGlzW2Z1bmN0aW9uTmFtZV0uYXBwbHkodGhpcywgZXZhbChcImV4dHJhY3RQYXJhbXMoXCIrZnVuY3Rpb25Db2RlLnNwbGl0KFwiKFwiKVsxXSkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb2FkQ2hpbGRDb21wb25lbnRzKHBhcmVudENvbXBvbmVudCkge1xuICAgICAgICBsZXQgY29tcG9uZW50c0xvYWRlZD1bXTtcbiAgICAgICAgdmFyIGNvbXBvbmVudHNFbHMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2NvbXBvbmVudF0nKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21wb25lbnRzRWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50SWQgPSBjb21wb25lbnRzRWxzW2ldLmdldEF0dHJpYnV0ZSgnY29tcG9uZW50LWlkJyk7XG5cbiAgICAgICAgICAgIGlmICghY29tcG9uZW50SWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gY29tcG9uZW50c0Vsc1tpXS5nZXRBdHRyaWJ1dGUoJ2NvbXBvbmVudCcpO1xuICAgICAgICAgICAgICAgIHZhciBDbGF6eiA9IFNtYXJ0Q29tcG9uZW50TWFuYWdlci5nZXRDb21wb25lbnQoY29tcG9uZW50KTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzTG9hZGVkLnB1c2goIG5ldyBDbGF6eihjb21wb25lbnRzRWxzW2ldLHBhcmVudENvbXBvbmVudCB8fCB0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudHNMb2FkZWQ7XG4gICAgfVxuXG4gICAgX2JpbmRDb21wb25lbnRDbGljayhub2RlKSB7XG5cbiAgICAgICAgbGV0IGlzQWxyZWFkeUJpbmRlZD10aGlzLmJpbmRlZEVsZW1lbnRzW1wiY2xpY2tcIl0ucmVkdWNlKChhY2N1bXVsYXRvcixjdXJyZW50Tm9kZSk9PntcbiAgICAgICAgICAgIHJldHVybiBhY2N1bXVsYXRvciB8fCBjdXJyZW50Tm9kZS5pc0VxdWFsTm9kZShub2RlKTtcbiAgICAgICAgfSxmYWxzZSk7XG5cbiAgICAgICAgaWYoIWlzQWxyZWFkeUJpbmRlZCl7XG4gICAgICAgICAgICB0aGlzLmJpbmRlZEVsZW1lbnRzW1wiY2xpY2tcIl0ucHVzaChub2RlKTtcbiAgICAgICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSk9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zbWFydF9jbGlja0hhbmRsZXIoZSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2hlY2tDb21wb25lbnRzSGllcmFyY2h5QW5kQmluZENsaWNrKG5vZGUpe1xuICAgICAgICBsZXQgcGFyZW50c0NvbXBvbmVudD0gdGhpcy5fZ2V0RG9tRWxlbWVudFBhcmVudHMoIG5vZGUsICdbY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXScpO1xuICAgICAgICBpZihwYXJlbnRzQ29tcG9uZW50Lmxlbmd0aD4wICYmIHBhcmVudHNDb21wb25lbnRbMF0uZ2V0QXR0cmlidXRlKFwiY29tcG9uZW50LXJlZmVyZW5jZS1uYW1lXCIpPT10aGlzLmNvbXBvbmVudFJlZmVyZW5jZU5hbWUpe1xuICAgICAgICAgICAgdGhpcy5fYmluZENvbXBvbmVudENsaWNrKG5vZGUpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9nZXREb21FbGVtZW50UGFyZW50cyhlbGVtLCBzZWxlY3Rvcil7XG4gICAgICAgIC8vIEVsZW1lbnQubWF0Y2hlcygpIHBvbHlmaWxsXG4gICAgICAgIGlmICghRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xuICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9XG4gICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5vTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hdGNoZXMgPSAodGhpcy5kb2N1bWVudCB8fCB0aGlzLm93bmVyRG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwocyksXG4gICAgICAgICAgICAgICAgICAgICAgICBpID0gbWF0Y2hlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICgtLWkgPj0gMCAmJiBtYXRjaGVzLml0ZW0oaSkgIT09IHRoaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaSA+IC0xO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgfVxuICAgICAgICAvLyBTZXR1cCBwYXJlbnRzIGFycmF5XG4gICAgICAgIHZhciBwYXJlbnRzID0gW107XG4gICAgICAgIC8vIEdldCBtYXRjaGluZyBwYXJlbnQgZWxlbWVudHNcbiAgICAgICAgZm9yICggOyBlbGVtICYmIGVsZW0gIT09IGRvY3VtZW50OyBlbGVtID0gZWxlbS5wYXJlbnROb2RlICkge1xuICAgICAgICAgICAgLy8gQWRkIG1hdGNoaW5nIHBhcmVudHMgdG8gYXJyYXlcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtLm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudHMucHVzaChlbGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcmVudHMucHVzaChlbGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyZW50cztcbiAgICB9XG5cblxuICAgIF9ldmVudE11dGF0aW9uSGFuZGxlcihtdXRhdGlvbnNMaXN0KXtcbiAgICAgICAgaWYobXV0YXRpb25zTGlzdCAmJiBtdXRhdGlvbnNMaXN0Lmxlbmd0aD4wKXtcbiAgICAgICAgICAgIGxldCBtdXRhdGlvbkVsZW1lbnRzPSBtdXRhdGlvbnNMaXN0LmZpbHRlcigobSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtLmFkZGVkTm9kZXMubGVuZ3RoID4gMDtcbiAgICAgICAgICAgIH0pLnJlZHVjZSgocHJldiwgY3VycmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2LmNvbmNhdCh0aGlzLl9nZXRDb21wb25lbnRDbGlja05vZGVUb0JpbmQoY3VycmVudC5hZGRlZE5vZGVzKSk7XG4gICAgICAgICAgICB9LCBbXSk7XG5cbiAgICAgICAgICAgIGlmKG11dGF0aW9uRWxlbWVudHMubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG11dGF0aW9uRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja0NvbXBvbmVudHNIaWVyYXJjaHlBbmRCaW5kQ2xpY2sobXV0YXRpb25FbGVtZW50c1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cblxuICAgIF9nZXRDb21wb25lbnRDbGlja05vZGVUb0JpbmQobW9kZXNUb0NoZWNrKXtcbiAgICAgICAgbGV0IG5vZGVzVG9CaW5kPVtdO1xuICAgICAgICBpZihtb2Rlc1RvQ2hlY2subGVuZ3RoKXtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kZXNUb0NoZWNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5vZGU9bW9kZXNUb0NoZWNrW2ldO1xuICAgICAgICAgICAgICAgIGlmKG5vZGUucXVlcnlTZWxlY3RvckFsbCl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb21wb25lbnRDbGlja0VsZW1lbnRzID1ub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tjb21wb25lbnQtY2xpY2tdJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmKG5vZGUuZ2V0QXR0cmlidXRlKCdjb21wb25lbnQtY2xpY2snKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1RvQmluZC5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnRDbGlja0VsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tcG9uZW50Q2xpY2tFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9CaW5kLnB1c2goY29tcG9uZW50Q2xpY2tFbGVtZW50c1tpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGVzVG9CaW5kO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIGJ5IENvbXBvbmVudE1hbmFnZXIgIHdoZW4gZG9tIGNvbXBvbmVudCBpcyByZW1vdmVkLCBvdGhlcndpc2UgeW91IGNhbiBhbHNvIGNhbGwgaXQgZGlyZWN0bHkgaWYgeW91IG5lZWQgb3Igb3ZlcnJpZGUgaXRcbiAgICAgKi9cblxuICAgIHNtYXJ0X2Rlc3Ryb3koKXtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5jb21wb25lbnRSZWZlcmVuY2VOYW1lICsgXCIgZGVzdHJveWVkXCIpO1xuICAgICAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICBTbWFydENvbXBvbmVudE1hbmFnZXIucmVtb3ZlQ29tcG9uZW50SW5zdGFuY2UodGhpcy5fY29tcG9uZW50SWQpO1xuICAgICAgICBpZih0aGlzLmVsZW1lbnQuaXNDb25uZWN0ZWQpe1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZm9yIGFsbCBwcm9wZXJ0aWVzXG4gICAgICAgIGZvciAoY29uc3QgcHJvcCBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzKSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXNbcHJvcF07XG4gICAgICAgIH1cblxuXG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0ICBTbWFydENvbXBvbmVudDsiXSwibmFtZXMiOlsiU21hcnRDb21wb25lbnRNYW5hZ2VyIiwiY29tcG9uZW50cyIsImNvbXBvbmVudHNJbnN0YW5jZSIsInBhcmFtcyIsImdhcmJhZ2VDb2xsZWN0b3IiLCJnYXJiYWdlQ29sbGVjdG9yUm9vdEVsZW1lbnQiLCJkb2N1bWVudCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwibXV0YXRpb25PYnNlcnZlciIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJtdXRhdGlvbkhhbmRsZXIiLCJiaW5kIiwib2JzZXJ2ZSIsInBhcmVudE5vZGUiLCJhdHRyaWJ1dGVzIiwiY2hpbGRMaXN0IiwiY2hhcmFjdGVyRGF0YSIsInN1YnRyZWUiLCJtdXRhdGlvbnNMaXN0IiwibGVuZ3RoIiwicmVtb3ZlZEVsZW1lbnRzIiwiZmlsdGVyIiwibSIsInJlbW92ZWROb2RlcyIsInJlZHVjZSIsInByZXYiLCJjdXJyZW50IiwiY29uY2F0IiwiZ2V0Q29tcG9uZW50U3ViTm9kZXMiLCJmb3JFYWNoIiwibm9kZSIsImdldEF0dHJpYnV0ZSIsImNvbXBvbmVudEluc3RhbmNlIiwiZ2V0Q29tcG9uZW50SW5zdGFuY2VCeUlkIiwic21hcnRfZGVzdHJveSIsInByZXZOb2RlcyIsInJtRWxlbWVudHMiLCJyZW1vdmVkTm9kZSIsImN1cnJlbnROb2RlIiwicHVzaCIsInNsaWNlIiwiY2FsbCIsImNoaWxkcmVuIiwiY29tcG9uZW50c0NsYXNzZXMiLCJrZXlzIiwiY29tcG9uZW50Q2xhc3NOYW1lIiwiZ2V0Q29tcG9uZW50IiwicmVnaXN0ZXJDb21wb25lbnQiLCJuYW1lIiwiY2xhenoiLCJpZCIsImluc3RhbmNlIiwiZWxlbWVudCIsImNvbXBvbmVudE5hbWUiLCJlIiwiZXJyb3IiLCJjb21wIiwiYyIsIm1hcCIsIlNtYXJ0Q29tcG9uZW50IiwicGFyZW50Q29tcG9uZW50Iiwic21hcnRfaW5pdCIsImJpbmRlZEVsZW1lbnRzIiwiX2NvbXBvbmVudElkIiwiX2dlbmVyYXRlVWlkIiwiY29tcG9uZW50UmVmZXJlbmNlTmFtZSIsInNldEF0dHJpYnV0ZSIsInZlcmlmeUNvbXBvbmVudFJlZmVyZW5jZU5hbWVVbmljaXR5IiwicmVnaXN0ZXJDb21wb25lbnRJbnN0YW5jZSIsImNvbnN0cnVjdG9yIiwiYmluZENvbXBvbmVudENsaWNrIiwibm9kZXNUb0JpbmQiLCJfZ2V0Q29tcG9uZW50Q2xpY2tOb2RlVG9CaW5kIiwiaSIsImNoZWNrQ29tcG9uZW50c0hpZXJhcmNoeUFuZEJpbmRDbGljayIsIl9tdXRhdGlvbkhhbmRsZXIiLCJfZXZlbnRNdXRhdGlvbkhhbmRsZXIiLCJyZXBsYWNlIiwiciIsIk1hdGgiLCJyYW5kb20iLCJ2IiwidG9TdHJpbmciLCJldiIsImZ1bmN0aW9uQ29kZSIsImN1cnJlbnRUYXJnZXQiLCJmdW5jdGlvbk5hbWUiLCJzcGxpdCIsImV4dHJhY3RQYXJhbXMiLCJwYXJhbWV0ZXJzIiwiYXJndW1lbnRzIiwicGFyYW0iLCJhcHBseSIsImV2YWwiLCJjb21wb25lbnRzTG9hZGVkIiwiY29tcG9uZW50c0VscyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJjb21wb25lbnRJZCIsImNvbXBvbmVudCIsIkNsYXp6IiwiaXNBbHJlYWR5QmluZGVkIiwiYWNjdW11bGF0b3IiLCJpc0VxdWFsTm9kZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJzbWFydF9jbGlja0hhbmRsZXIiLCJwYXJlbnRzQ29tcG9uZW50IiwiX2dldERvbUVsZW1lbnRQYXJlbnRzIiwiX2JpbmRDb21wb25lbnRDbGljayIsImVsZW0iLCJzZWxlY3RvciIsIkVsZW1lbnQiLCJwcm90b3R5cGUiLCJtYXRjaGVzIiwibWF0Y2hlc1NlbGVjdG9yIiwibW96TWF0Y2hlc1NlbGVjdG9yIiwibXNNYXRjaGVzU2VsZWN0b3IiLCJvTWF0Y2hlc1NlbGVjdG9yIiwid2Via2l0TWF0Y2hlc1NlbGVjdG9yIiwicyIsIm93bmVyRG9jdW1lbnQiLCJpdGVtIiwicGFyZW50cyIsIm11dGF0aW9uRWxlbWVudHMiLCJhZGRlZE5vZGVzIiwibW9kZXNUb0NoZWNrIiwiY29tcG9uZW50Q2xpY2tFbGVtZW50cyIsImxvZyIsImRpc2Nvbm5lY3QiLCJyZW1vdmVDb21wb25lbnRJbnN0YW5jZSIsImlzQ29ubmVjdGVkIiwicmVtb3ZlIiwiT2JqZWN0IiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsInByb3AiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFDTUE7cUNBQ1k7OzthQUNMQyxVQUFMLEdBQWtCLEVBQWxCO2FBQ0tDLGtCQUFMLEdBQXdCLEVBQXhCOzs7OztrQ0FHTUMsUUFBTztpQkFDUkEsTUFBTCxHQUFjQSxV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
