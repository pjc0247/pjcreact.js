var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("guid", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var uuidv4 = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    exports.default = uuidv4;
});
define("hook/contextStorage", ["require", "exports", "guid"], function (require, exports, guid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ContextStorage = /** @class */ (function () {
        function ContextStorage() {
            this.idx = 0;
            this.storage = {};
            this.guid = guid_1.default();
        }
        ContextStorage.prototype.reset = function () {
            this.idx = 0;
        };
        ContextStorage.prototype.getOrCreateContext = function (activator) {
            if (!this.storage[this.idx]) {
                this.storage[this.idx] = new activator();
            }
            return this.storage[this.idx++];
        };
        ;
        return ContextStorage;
    }());
    exports.default = ContextStorage;
});
define("render/postworks", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Postworks = /** @class */ (function () {
        function Postworks() {
            this.works = [];
        }
        Postworks.prototype.enqueue = function (fn) {
            this.works.push(fn);
        };
        Postworks.prototype.flush = function () {
            for (var _i = 0, _a = this.works; _i < _a.length; _i++) {
                var work = _a[_i];
                work();
            }
            this.works = [];
        };
        return Postworks;
    }());
    exports.default = Postworks;
});
define("render/vdom", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var VDom = /** @class */ (function () {
        function VDom(tagName, props, children) {
            this.tagName = 'div';
            this.tagName = tagName;
            this.props = props;
            this.children = children;
        }
        VDom.prototype.render = function (renderFunc) {
            var _this = this;
            this.contents = [];
            this.children.forEach(function (child) {
                if (typeof child === 'string') {
                    _this.contents.push(child);
                }
                else if (typeof child === 'function') {
                    var computed = renderFunc(child);
                    _this.contents.push(computed);
                }
                else if (child instanceof VDom) {
                    var computed = renderFunc(function () { return child; });
                    _this.contents.push(child);
                }
                else
                    throw new Error('child must be a string or function!');
            });
        };
        VDom.prototype.build = function (parent, shouldAppend) {
            if (shouldAppend === void 0) { shouldAppend = true; }
            this.parent = parent;
            var el = document.createElement(this.tagName);
            if (shouldAppend)
                parent.appendChild(el);
            this.contents.forEach(function (content) {
                if (typeof content === 'string')
                    el.append(content);
                else if (content instanceof VDom)
                    el.append(content.build(el));
            });
            this.applyProps(el);
            this.element = el;
            return el;
        };
        // fixme
        VDom.prototype.detatch = function () {
            this.parent.removeChild(this.element);
        };
        VDom.prototype.applyProps = function (el) {
            var _this = this;
            if (!this.props)
                return;
            Object.keys(this.props).forEach(function (key) {
                // @ts-ignore
                el[key] = _this.props[key];
            });
            this.applyEvents(el);
            this.applyStyles(el);
        };
        VDom.prototype.applyEvents = function (el) {
            el.onchange = this.props.onChange;
        };
        VDom.prototype.applyStyles = function (el) {
            if (!this.props.styles)
                return;
            for (var key in this.props.styles) {
                el.style[key] = this.props.styles[key];
            }
        };
        return VDom;
    }());
    exports.default = VDom;
});
// 전체적으로 쓰레기장임
define("render/render", ["require", "exports", "hook/contextStorage", "render/postworks", "render/vdom"], function (require, exports, contextStorage_1, postworks_1, vdom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var rctx = null;
    var cs = null;
    exports.grctx = function () { return rctx; }; // 이름이 이상함
    exports.gcs = function () {
        if (!cs)
            throw new Error('hooks must be executed inside of the react component.');
        return cs;
    };
    var RenderContext = /** @class */ (function () {
        function RenderContext() {
            this.cs = new contextStorage_1.default();
        }
        return RenderContext;
    }());
    exports.RenderContext = RenderContext;
    var render = function (fn) {
        var rootContextStorage = new contextStorage_1.default();
        var root = runRenderTask(function (postworks) { return exports.renderComponent(rootContextStorage, fn, postworks); });
        var domRoot = document.createElement('div');
        root.build(domRoot);
        // @ts-ignore
        window.root = rootContextStorage;
        return domRoot;
    };
    var runRenderTask = function (fn) {
        var postworks = new postworks_1.default();
        var computed = fn(postworks);
        postworks.flush();
        return computed;
    };
    var renderComponentReal = function (_rctx, fn, postworks) {
        cs = _rctx.cs;
        var _cs = cs;
        cs.reset();
        _rctx.renderSelf = function () {
            console.log('renderSELF');
            if (cs) // 렌더링 중에 발생한 경우
                postworks.enqueue(function () { return renderComponentReal(_rctx, fn, postworks); });
            else { // 렌더링 아닐 때 발생한 경우 (setTimeout 등)
                var prevVdom = _rctx.vdom;
                rctx = _rctx;
                var vdom = runRenderTask(function (postworks) { return renderComponentReal(_rctx, fn, postworks); });
                var el = vdom.build(prevVdom.parent, true);
                prevVdom.detatch();
                //prevVdom.parent.replaceChild(el, prevVdom.element);
            }
        };
        var ret = fn(function (c) { return exports.renderComponent(_cs, c, postworks); });
        if (ret instanceof vdom_1.default) {
            var vdom = ret;
            vdom.render(function (c) { return exports.renderComponent(_cs, c, postworks); });
            _rctx.vdom = vdom;
        }
        cs = null;
        return ret;
    };
    exports.renderComponent = function (_cs, fn, postworks) {
        rctx = _cs.getOrCreateContext(RenderContext);
        return renderComponentReal(rctx, fn, postworks);
    };
    exports.default = render;
});
define("index", ["require", "exports", "render/render"], function (require, exports, render_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(render_1);
});
/*
const input = `
return (
  <div></div>
);
`;

enum ParsingContext {
  Js,
  Jsx,
  NonScript,
}
enum TokenType {
  LeftParen,
  RightParen,
  LeftAngleBracket,
  RightAngleBracket,
}
interface Token {
  raw: string;
  type: TokenType;
}

enum JsxAttributeValueType {
  NoValue,
  Literal,
  Script,
}
interface JsxAttributeValue {
  raw: string;
}
interface JsxAttribute {
  key: string;
  value: JsxAttributeValue;
}
interface JsxDOM {
  tag: string;
}

class Parser {
  private tokens = [];
  private offset = 0;
  private ctx = ParsingContext.Js;

  advance() {
    this.offset ++;
  }
  tokenize(src: string) {
    while (this.offset < src.length) {
      const ch = src[this.offset];

      if (this.ctx === ParsingContext.NonScript)
        this.advance();
      else if (this.ctx === ParsingContext.Js) {
        if (ch === '<')
      }
      else if (this.ctx === ParsingContext.Jsx) {
        
      }

      advance();
    }
    return tokens;
  }
}
*/ 
define("compiler/simple", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Attribute = /** @class */ (function () {
        function Attribute() {
            this.key = '';
            this.value = '';
        }
        return Attribute;
    }());
    var Node = /** @class */ (function () {
        function Node(parent) {
            this.tagName = '';
            this.parent = parent;
            this.attributes = [];
        }
        return Node;
    }());
    var ParsingState;
    (function (ParsingState) {
        ParsingState[ParsingState["None"] = 0] = "None";
        ParsingState[ParsingState["TagName"] = 1] = "TagName";
        ParsingState[ParsingState["AttributesKey"] = 2] = "AttributesKey";
        ParsingState[ParsingState["AttributesValue"] = 3] = "AttributesValue";
    })(ParsingState || (ParsingState = {}));
    var AttributeKind;
    (function (AttributeKind) {
        AttributeKind[AttributeKind["Empty"] = 0] = "Empty";
        AttributeKind[AttributeKind["Literal"] = 1] = "Literal";
        AttributeKind[AttributeKind["JsExpression"] = 2] = "JsExpression";
    })(AttributeKind || (AttributeKind = {}));
    var isIdentAcceptible = function (ch) {
        if ((ch >= 'a' && ch <= 'z') ||
            (ch >= 'A' && ch <= 'Z') ||
            (ch >= '0' && ch <= '9')) {
            return true;
        }
        return false;
    };
    var nodeTypes = {};
    exports.registerType = function (type) {
        nodeTypes[type.name] = type;
    };
    var attributeToValues = function (node) {
        var values = {};
        for (var _i = 0, _a = node.attributes; _i < _a.length; _i++) {
            var attr = _a[_i];
            if (attr.kind === AttributeKind.Literal)
                values[attr.key] = attr.value;
        }
        return values;
    };
    var transform = function (node) {
        //return function() { return eval(node.tagName); }.call(nodeTypes);
        return function () { return nodeTypes[node.tagName](attributeToValues(node)); };
    };
    var rsx = function (src) {
        var offset = 0;
        var currentNode = new Node();
        var state = ParsingState.None;
        var advancedInCurrentLoop = false;
        var advance = function (force) {
            if (force === void 0) { force = false; }
            //if (force || !advancedInCurrentLoop) {
            offset++;
            advancedInCurrentLoop = true;
            //}
        };
        var waste = function () {
            while (offset < src.length) {
                if (src[offset] === ' ' || src[offset] === '\n')
                    advance(true);
                else
                    break;
            }
        };
        var setState = function (newState) {
            if (newState === ParsingState.AttributesKey) {
                currentNode.attributes.push(new Attribute());
            }
            state = newState;
            waste();
        };
        while (offset < src.length) {
            var ch = src[offset];
            advancedInCurrentLoop = false;
            if (state === ParsingState.None) {
                if (ch === '<') {
                    currentNode = new Node(currentNode);
                    setState(ParsingState.TagName);
                }
                else if (ch === '>') {
                    currentNode = currentNode.parent;
                }
            }
            else if (state === ParsingState.TagName) {
                if (isIdentAcceptible(ch))
                    currentNode.tagName += ch;
                else if (ch === ' ' || ch === '\n') {
                    setState(ParsingState.AttributesKey);
                    continue;
                }
                else
                    throw new Error('unexpected character ' + ch);
            }
            else if (state === ParsingState.AttributesKey) {
                var attribute = currentNode.attributes[currentNode.attributes.length - 1];
                if (ch === '/') {
                    break;
                }
                if (ch === ' ') {
                    attribute.kind = AttributeKind.Empty;
                    attribute.value = true;
                    setState(ParsingState.AttributesKey);
                    continue;
                }
                else if (ch === '=') {
                    advance();
                    setState(ParsingState.AttributesValue);
                    if (src[offset] === '"')
                        attribute.kind = AttributeKind.Literal;
                    else if (src[offset] === '{')
                        attribute.kind = AttributeKind.JsExpression;
                    else
                        throw new Error('unexpected character ' + src[offset]);
                }
                else
                    attribute.key += ch;
            }
            else if (state === ParsingState.AttributesValue) {
                var attribute = currentNode.attributes[currentNode.attributes.length - 1];
                if (attribute.kind === AttributeKind.Literal) {
                    if (ch === '"') {
                        setState(ParsingState.AttributesKey);
                        attribute.value = eval(attribute.value);
                    }
                    else {
                        attribute.value += ch;
                    }
                }
                else if (ch === '}' && attribute.kind === AttributeKind.JsExpression)
                    setState(ParsingState.AttributesKey);
            }
            advance();
        }
        return transform(currentNode);
    };
    exports.default = rsx;
});
define("hook/deps", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Deps = /** @class */ (function () {
        function Deps() {
        }
        Deps.prototype.update = function (deps) {
            if (this.compare(this.prevDeps, deps)) {
                this.prevDeps = deps;
                return true;
            }
            return false;
        };
        Deps.prototype.compare = function (a, b) {
            if (!a)
                return true;
            if (a.length !== b.length)
                throw new Error('prevDeps.length != deps.length');
            if (a.length === 0)
                return false;
            for (var i = 0; i < a.length; i++) {
                if (a[i] !== b[i])
                    return true;
            }
            return false;
        };
        ;
        return Deps;
    }());
    exports.default = Deps;
});
define("hook/hook", ["require", "exports", "render/render", "hook/deps"], function (require, exports, render_2, deps_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ContextWithDeps = /** @class */ (function () {
        function ContextWithDeps() {
            this.deps = new deps_1.default();
        }
        return ContextWithDeps;
    }());
    var UseStateContext = /** @class */ (function () {
        function UseStateContext() {
        }
        return UseStateContext;
    }());
    exports.useState = function (initialValue) {
        var ctx = render_2.gcs().getOrCreateContext(UseStateContext);
        if (!ctx.v)
            ctx.v = initialValue;
        var rctx = render_2.grctx();
        return [ctx.v, function (newValue) {
                if (ctx.v === newValue)
                    return;
                ctx.v = newValue;
                rctx.renderSelf();
            }];
    };
    var RefContainer = /** @class */ (function () {
        function RefContainer() {
        }
        return RefContainer;
    }());
    var UseRefContext = /** @class */ (function () {
        function UseRefContext() {
            this.hasValue = false;
        }
        return UseRefContext;
    }());
    exports.useRef = function (initialValue) {
        var ctx = render_2.gcs().getOrCreateContext(UseRefContext);
        if (!ctx.hasValue) {
            ctx.v = { current: initialValue };
            ctx.hasValue = true;
        }
        return ctx.v;
    };
    var UseMemoContext = /** @class */ (function (_super) {
        __extends(UseMemoContext, _super);
        function UseMemoContext() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return UseMemoContext;
    }(ContextWithDeps));
    exports.useMemo = function (factory, deps) {
        var ctx = render_2.gcs().getOrCreateContext(UseMemoContext);
        if (ctx.deps.update(deps)) {
            ctx.v = factory();
        }
        return ctx.v;
    };
    var UseEffectContext = /** @class */ (function (_super) {
        __extends(UseEffectContext, _super);
        function UseEffectContext() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return UseEffectContext;
    }(ContextWithDeps));
    exports.useEffect = function (fn, deps) {
        var ctx = render_2.gcs().getOrCreateContext(UseEffectContext);
        if (ctx.deps.update(deps)) {
            if (ctx.disposer)
                ctx.disposer();
            ctx.disposer = fn();
        }
    };
});
var MockElement = /** @class */ (function () {
    function MockElement(tagName) {
        this.tagName = tagName;
        this.children = [];
        this.innerText = '';
    }
    MockElement.prototype.appendChild = function (el) {
        this.children.push(el);
    };
    MockElement.prototype.removeChild = function (el) {
        this.children = this.children.filter(function (x) { return x !== el; });
    };
    MockElement.prototype.replaceChild = function (newChild, oldChild) {
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i] === oldChild) {
                this.children[i] = newChild;
                return;
            }
        }
    };
    return MockElement;
}());
var MockDocument = /** @class */ (function () {
    function MockDocument() {
    }
    MockDocument.prototype.createElement = function (tagName) {
        return new MockElement(tagName);
    };
    return MockDocument;
}());
// @ts-ignore
document = new MockDocument();
define("render/factory", ["require", "exports", "render/vdom"], function (require, exports, vdom_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.element = function (tagName, props) {
        var children = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            children[_i - 2] = arguments[_i];
        }
        var v = new vdom_2.default(tagName, props, children);
        return v;
    };
});
