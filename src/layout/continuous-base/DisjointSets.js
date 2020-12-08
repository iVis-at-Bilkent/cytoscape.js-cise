// disjoint set implementation with union-find
export class DisjointSets {

  /** elements are identified as numbers in range [0, n - 1]
   * @param  {} n
   */
  constructor(n) {
    // each element has a parent
    // an element is a representative of a set if `parents[i] === i`
    this.parents = [];
    this.cardinalities = [];
    for (let i = 0; i < n; i++) {
      this.parents.push(i);
      this.cardinalities.push(1);
    }
  }

  /** checl if the element is valid
   * @param  {} x number
   */
  isValidIndex(x) {
    if (x < 0 || x >= this.parents.length) {
      throw 'index should be in range [0, ' + this.parents.length + ') !';
    }
  }

  /** find the id of the set (representative element) that contains the element x
   * @param  {} x number
   */
  findSet(x) {
    this.isValidIndex(x);
    while (x != this.parents[x]) {
      // set everybody to one upper layer for flatter trees (path compression)
      this.parents[x] = this.parents[this.parents[x]];
      x = this.parents[x];
    }
    return x;
  }

  /** unite the sets containing elements x and y
   * @param  {} x number
   * @param  {} y number
   */
  unite(x, y) {
    this.isValidIndex(x);
    this.isValidIndex(y);
    const s1 = this.findSet(x);
    const s2 = this.findSet(y);

    // they are already in the same set
    if (s1 === s2) {
      return;
    }
    // keep the bigger parent for flat trees
    if (this.cardinalities[s1] > this.cardinalities[s2]) {
      this.parents[s2] = s1;
      this.cardinalities[s1] += this.cardinalities[s2];
    } else {
      this.parents[s1] = s2;
      this.cardinalities[s2] += this.cardinalities[s1];
    }
  }
}