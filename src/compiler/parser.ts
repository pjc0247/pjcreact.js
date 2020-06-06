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