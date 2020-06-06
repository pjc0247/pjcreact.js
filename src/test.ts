import { useMemo, useEffect, useState } from "./hook/hook";
import render from "./render/render";
import rsx, { registerType } from "./compiler/simple";
import { element } from "./render/factory";

// This enables HTML mockup in NodeJS environment.
import './mock/document';

const Comp = ({ v }) => {
  const [a, setA] = useState(null);

  console.log('comp + ' + v);

  useEffect(() => {
    console.log("a is " + a);
  }, [a]);
  useEffect(() => {
    console.log("run " + v + " / " + a);

    if (v == 2)
      setA(1);

    return () => {
      console.log("bye " + v);
    };
  }, [v]);
};

const HelloWorldElement = (props) => {
  return "Hello World " + props.value;
};
const Root = (props) => {
  const [v, setV] = useState(0);

  useEffect(() => {
    setTimeout(() => { setV(2); }, 100);
    setTimeout(() => { setV(3); }, 200);
    setTimeout(() => { setV(4); }, 300);
  }, []);

  //return () => Comp({ v });
  return element(
    'div',
    {},
    () => HelloWorldElement({ value: v }),
    'Hello',
    () => `${v}`,
    'World',
  );
};
registerType(Root);
registerType(Comp);

const domRoot = render(rsx(`<Root v="4" Q="5" />`));

console.log(domRoot);
