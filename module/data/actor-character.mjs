const { SchemaField, NumberField, StringField, HTMLField } = foundry.data.fields;

export class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      stats: new SchemaField({
        action: new SchemaField({
          value: new NumberField({ initial: 1, min: 0, max: 5, integer: true, nullable: false })
        }),
        insight: new SchemaField({
          value: new NumberField({ initial: 2, min: 0, max: 5, integer: true, nullable: false })
        }),
        influence: new SchemaField({
          value: new NumberField({ initial: 2, min: 0, max: 5, integer: true, nullable: false })
        }),
        nerves: new SchemaField({
          value: new NumberField({ initial: 3, min: 0, max: 5, integer: true, nullable: false })
        })
      }),
      willpower: new SchemaField({
        value: new NumberField({ initial: 2, min: 0, integer: true, nullable: false }),
        max: new NumberField({ initial: 2, min: 0, integer: true, nullable: false })
      }),
      stress: new SchemaField({
        temporary: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
        permanent: new NumberField({ initial: 0, min: 0, integer: true, nullable: false })
      }),
      details: new SchemaField({
        concept: new StringField({ initial: "", nullable: false }),
        biography: new HTMLField({ initial: "", nullable: false })
      })
    };
  }

  prepareDerivedData() {
    this.stress.total = (this.stress.temporary ?? 0) + (this.stress.permanent ?? 0);
  }
}
