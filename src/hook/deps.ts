export default class Deps {
  private prevDeps: any[];

  update(deps: any[]) {
    if (this.compare(this.prevDeps, deps)) {
      this.prevDeps = deps;
      return true;
    }
    return false;
  }

  private compare(a: any[], b: any[]) {
    if (!a) return true;
  
    if (a.length !== b.length)
      throw new Error('prevDeps.length != deps.length');
  
    if (a.length === 0) return false;
    
    for (let i=0; i<a.length; i++) {
      if (a[i] !== b[i])
        return true;
    }
    return false;
  };
}
