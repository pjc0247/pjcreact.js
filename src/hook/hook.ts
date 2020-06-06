import ContextStorage from "./contextStorage";
import { gcs, grctx } from "../render/render";
import Deps from "./deps";

class ContextWithDeps {
  deps: Deps = new Deps();
}

class UseStateContext {
  v: any;
}
export const useState = (initialValue) => {
  const ctx = gcs().getOrCreateContext(UseStateContext);
  if (!ctx.v)
    ctx.v = initialValue;

  const rctx = grctx();
  return [ctx.v, (newValue) => {
    if (ctx.v === newValue) return;
    ctx.v = newValue;
    rctx.renderSelf();
  }];
}

class RefContainer {
  current: any;
}
class UseRefContext {
  v: RefContainer;
  hasValue: boolean = false;
}
export const useRef = (initialValue) => {
  const ctx = gcs().getOrCreateContext(UseRefContext);
  if (!ctx.hasValue) {
    ctx.v = { current: initialValue };
    ctx.hasValue = true;
  }
  return ctx.v;
};

class UseMemoContext extends ContextWithDeps {
  v: any;
}
export const useMemo = (factory, deps) => {
  const ctx = gcs().getOrCreateContext(UseMemoContext);
  if (ctx.deps.update(deps)) {
    ctx.v = factory();
  }
  return ctx.v;
};

class UseEffectContext extends ContextWithDeps {
  disposer: () => {};
}
export const useEffect = (fn, deps) => {
  const ctx = gcs().getOrCreateContext(UseEffectContext);
  if (ctx.deps.update(deps)) {
    if (ctx.disposer)
      ctx.disposer();
    ctx.disposer = fn();
  }
};
