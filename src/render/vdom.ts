export default class VDom {
  tagName: string = 'div';
  props: any;
  children: any[];

  parent: HTMLElement;
  element: HTMLElement;

  private contents: any[];

  constructor(tagName: string, props: any, children: any[]) {
    this.tagName = tagName;
    this.props = props;
    this.children = children;
  }

  render(renderFunc: (...any) => VDom | string) {
    this.contents = [];
    this.children.forEach((child) => {
      if (typeof child === 'string') {
        this.contents.push(child);
      }
      else if (typeof child === 'function') {
        const computed = renderFunc(child);
        this.contents.push(computed);
      }
      else if (child instanceof VDom) {
        const computed = renderFunc(() => child);
        this.contents.push(child);
      }
      else 
        throw new Error('child must be a string or function!');
    });
  }
  build(parent: HTMLElement, shouldAppend: boolean = true): HTMLElement {
    this.parent = parent;

    const el = document.createElement(this.tagName);
    if (shouldAppend)
      parent.appendChild(el);

    this.contents.forEach((content) => {
      if (typeof content === 'string')
        el.append(content);
      else if (content instanceof VDom)
        el.append(content.build(el));
    });

    this.applyProps(el);
    this.element = el;
    
    return el;
  }

  // fixme
  detatch() {
    this.parent.removeChild(this.element);
  }

  private applyProps(el: HTMLElement) {
    
    if (!this.props) return;
    Object.keys(this.props).forEach((key) => {
      // @ts-ignore
      el[key] = this.props[key];
    });

    // special keys
    el.onchange = this.props.onChange;
  }
}