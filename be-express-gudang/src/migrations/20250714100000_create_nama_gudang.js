/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable("nama_gudang", (table) => {
    table.increments("id").primary();
    table.string("jenis", 50).notNullable(); // mengganti dari kode → jenis
    table.string("nama", 100).notNullable();
    table.string("alamat", 255);
    table.string("keterangan", 255);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTableIfExists("nama_gudang");
}
