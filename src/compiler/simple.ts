
class Attribute {
  kind: AttributeKind;
  key: string = '';
  value: any = '';
}
class Node {
  parent?: Node;
  tagName: string = '';
  attributes: Attribute[];

  innerHTML: string;

  constructor(parent?: Node) {
    this.parent = parent;
    this.attributes = [];
  }
}

enum ParsingState {
  None,
  TagName,
  AttributesKey,
  AttributesValue,
}
enum AttributeKind {
  Empty,
  Literal,
  JsExpression,
}

const isIdentAcceptible = (ch) => {
  if ((ch >= 'a' && ch <= 'z') ||
    (ch >= 'A' && ch <= 'Z') ||
    (ch >= '0' && ch <= '9')) {
      return true;
  }
  return false;
};

let nodeTypes = {};

export const registerType = (type) => {
  nodeTypes[type.name] = type;
};

const attributeToValues = (node: Node) => {
  const values = {};
  for (const attr of node.attributes) {
    if (attr.kind === AttributeKind.Literal)
      values[attr.key] = attr.value;
  }
  return values;
};
const transform = (node: Node) => {
  //return function() { return eval(node.tagName); }.call(nodeTypes);
  return () => nodeTypes[node.tagName](attributeToValues(node));
};
const rsx = (src) => {
  let offset = 0;
  let currentNode = new Node();
  let state = ParsingState.None;
  let advancedInCurrentLoop = false;

  const advance = (force: boolean = false) => {
    //if (force || !advancedInCurrentLoop) {
      offset ++;
      advancedInCurrentLoop = true;
    //}
  };
  const waste = () => {
    while (offset < src.length) {
      if (src[offset] === ' ' || src[offset] === '\n')
        advance(true);
      else
        break;
    }
  };
  const setState = (newState) => {
    if (newState === ParsingState.AttributesKey) {
      currentNode.attributes.push(new Attribute());
    }
    state = newState;
    waste();
  };

  while (offset < src.length) {
    const ch = src[offset];
    advancedInCurrentLoop = false;

    if (state === ParsingState.None) {
      if (ch === '<') {
        currentNode = new Node(currentNode);
        setState(ParsingState.TagName);
      } else if (ch === '>') {
        currentNode = currentNode.parent;
      }
    } else if (state === ParsingState.TagName) {
      if (isIdentAcceptible(ch))
        currentNode.tagName += ch;
      else if (ch === ' ' || ch === '\n') {
        setState(ParsingState.AttributesKey);
        continue;
      }
      else 
        throw new Error('unexpected character ' + ch);
    } else if (state === ParsingState.AttributesKey) {
      const attribute = currentNode.attributes[currentNode.attributes.length - 1];

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
    } else if (state === ParsingState.AttributesValue) {
      const attribute = currentNode.attributes[currentNode.attributes.length - 1];
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

export default rsx;
