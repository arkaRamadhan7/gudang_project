/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  const exists = await knex.schema.hasTable("produk");
  if (!exists) {
    return await knex.schema.createTable("produk", (table) => {
      table.bigIncrements("id").primary();
      table.string("kode_produk", 100).notNullable().unique();
      table.string("nomor", 100).notNullable();
      table.string("nama_produk", 150).notNullable();
      table.integer("stok").notNullable().defaultTo(0);
      table.integer("harga").notNullable().defaultTo(0);
      table.string("kategori", 100).notNullable();
      table.enum("satuan", ["pcs", "dus"]).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  return await knex.schema.dropTableIfExists("produk");
};
