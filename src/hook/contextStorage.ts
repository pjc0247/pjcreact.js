import uuidv4 from '../guid';

export default class ContextStorage {
  private guid: string;

  private idx = 0;
  private storage = {};
  
  constructor() {
    this.guid = uuidv4();
  }

  reset() {
    this.idx = 0;
  }

  getOrCreateContext<T>(activator: new() => T): T {
    if (!this.storage[this.idx]) {
      this.storage[this.idx] = new activator();
    }
    return this.storage[this.idx++];
  };
}
