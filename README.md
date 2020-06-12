pjcreact.js
====

personal study how reactjs actually works

Demo
----
[live-demo](https://pjc0247.github.io/pjcreact.js/www/index.html)
```js
const HelloWorldElement = (props) => {
  return "Hello World " + props.value;
};
const Root = (props) => {
  const [v, setV] = useState(0);
  const [name, setName] = useState('');
  useEffect(() => {
    for (let i=0;i<5;i++)
      setTimeout(() => { setV(i); }, 1000 * i);
  }, []);
  //return () => Comp({ v });
  return element(
    'div',
    {},
    element(
      'input',
      {
        onChange: (e) => setName(e.target.value),
        placeholder: 'Type something and press enter',
      }
    ),
    () => HelloWorldElement({ value: name }),
    '  /  useStateTest',
    () => `${v}`,
  );
};
registerType(Root);

const appRoot = document.getElementById('root');
const domRoot = render(rsx(`<Root v="4" Q="5" />`));
appRoot.appendChild(domRoot);
```
