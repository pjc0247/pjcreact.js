class MockElement {
  tagName: string;

  children: MockElement[];
  innerText: string;

  constructor(tagName: string) {
    this.tagName = tagName;
    this.children = [];
    this.innerText = '';
  }

  appendChild(el: MockElement) {
    this.children.push(el);
  }
  removeChild(el: MockElement) {
    this.children = this.children.filter(x => x !== el);
  }
  replaceChild(newChild: MockElement, oldChild: MockElement) {
    for (let i=0; i<this.children.length; i++) {
      if (this.children[i] === oldChild) {
        this.children[i] = newChild;
        return;
      }
    }
  }
}
class MockDocument {

  createElement(tagName: string) {
    return new MockElement(tagName);
  }
}

// @ts-ignore
document = new MockDocument();