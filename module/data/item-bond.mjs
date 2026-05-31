const { NumberField, HTMLField } = foundry.data.fields;

export class BondData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      value: new NumberField({ initial: 3, min: 0, max: 3, integer: true, nullable: false }),
      description: new HTMLField({ initial: "", nullable: false })
    };
  }

  get repairThreshold() {
    return Math.max(4, 7 - (this.value ?? 0));
  }

  get isBroken() {
    return (this.value ?? 0) <= 0;
  }
}
