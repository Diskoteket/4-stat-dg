const { SchemaField, NumberField, StringField, HTMLField } = foundry.data.fields;

export class NpcData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      stats: new SchemaField({
        action: new SchemaField({
          value: new NumberField({ initial: 2, min: 0, max: 5, integer: true, nullable: false })
        }),
        insight: new SchemaField({
          value: new NumberField({ initial: 2, min: 0, max: 5, integer: true, nullable: false })
        }),
        influence: new SchemaField({
          value: new NumberField({ initial: 2, min: 0, max: 5, integer: true, nullable: false })
        }),
        nerves: new SchemaField({
          value: new NumberField({ initial: 2, min: 0, max: 5, integer: true, nullable: false })
        })
      }),
      threat: new StringField({ initial: "minor", nullable: false }),
      notes: new HTMLField({ initial: "", nullable: false }),
      details: new SchemaField({
        biography: new HTMLField({ initial: "", nullable: false })
      })
    };
  }
}
