const { StringField, HTMLField } = foundry.data.fields;

export class TraitData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      polarity: new StringField({
        initial: "positive",
        choices: ["positive", "negative"],
        nullable: false
      }),
      description: new HTMLField({ initial: "", nullable: false })
    };
  }

  get isPositive() {
    return this.polarity === "positive";
  }

  get isNegative() {
    return this.polarity === "negative";
  }
}
