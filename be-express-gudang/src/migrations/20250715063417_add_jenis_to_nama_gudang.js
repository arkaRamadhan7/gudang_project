export async function up(knex) {
    return knex.schema.alterTable('nama_gudang', (table) => {
        table.string('jenis').notNullable().defaultTo('');
    });
}

export async function down(knex) {
    return knex.schema.alterTable('nama_gudang', (table) => {
        table.dropColumn('jenis'); // ✅ Correct spelling: dropColumn (not dropColoumn)
    });
}