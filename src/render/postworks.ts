export default class Postworks {
  works: any[];

  constructor() {
    this.works = [];
  }
  enqueue(fn) {
    this.works.push(fn);
  }
  flush() {
    for (const work of this.works)
      work();
    this.works = [];
  }
}
