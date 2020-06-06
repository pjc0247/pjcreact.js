import VDom from './vdom';

export const element = (tagName: string, props: any, ...children: any[]) => {
  const v = new VDom(tagName, props, children);
  return v;
};