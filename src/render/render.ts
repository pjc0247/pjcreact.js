// 전체적으로 쓰레기장임

import ContextStorage from "../hook/contextStorage";
import Postworks from "./postworks";
import VDom from "./vdom";

class ReactContext {
  rootContextStorage: ContextStorage;
  contextStorage: ContextStorage;
}

let rctx: RenderContext = null;
let cs: ContextStorage = null;
export const grctx = () => rctx; // 이름이 이상함
export const gcs = () => { // 이름이 이상함
  if (!cs)
    throw new Error('hooks must be executed inside of the react component.');
  return cs;
}

export class RenderContext {
  cs: ContextStorage;
  renderSelf: () => any;

  vdom: VDom;

  parent: HTMLElement;
  element: HTMLElement;

  constructor() {
    this.cs = new ContextStorage();
  }
}

const render = (fn) => {
  const rootContextStorage = new ContextStorage();
  const root = runRenderTask((postworks) => renderComponent(rootContextStorage, fn, postworks));

  const domRoot = document.createElement('div');
  root.build(domRoot);

  // @ts-ignore
  window.root = rootContextStorage;

  return domRoot;
};
const runRenderTask = (fn): VDom => {
  const postworks = new Postworks();
  const computed = fn(postworks);
  postworks.flush();

  return computed;
};
const renderComponentReal = (_rctx: RenderContext, fn: (...any) => VDom | string, postworks: Postworks) => {
  console.log('RenderReal', _rctx);
  cs = _rctx.cs;
  const _cs = cs;
  cs.reset();

  _rctx.renderSelf = () => {
    console.log('renderSELF');
    if (cs) // 렌더링 중에 발생한 경우
      postworks.enqueue(() => renderComponentReal(_rctx, fn, postworks));
    else { // 렌더링 아닐 때 발생한 경우 (setTimeout 등)
      const prevVdom = _rctx.vdom;
      rctx = _rctx;
      const vdom = runRenderTask((postworks) => renderComponentReal(_rctx, fn, postworks));
      const el = vdom.build(prevVdom.parent, true);
      prevVdom.detatch();
      //prevVdom.parent.replaceChild(el, prevVdom.element);
    }
  };

  const ret = fn((c) => renderComponent(_cs, c, postworks));

  if (ret instanceof VDom) {
    const vdom = ret as VDom;
    vdom.render((c) => renderComponent(_cs, c, postworks));
    _rctx.vdom = vdom;
  }

  cs = null;
  return ret;
} 
export const renderComponent = (_cs: ContextStorage, fn, postworks: Postworks) => {
  rctx = _cs.getOrCreateContext(RenderContext);
  return renderComponentReal(rctx, fn, postworks);
};

export default render;
