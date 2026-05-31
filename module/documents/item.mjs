export class FourStatItem extends Item {
  get isTrait() {
    return this.type === "trait";
  }

  get isBond() {
    return this.type === "bond";
  }
}
