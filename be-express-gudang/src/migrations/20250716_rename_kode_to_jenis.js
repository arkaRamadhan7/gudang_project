export async function  up(knex) {
    return knex.schema.alterTable('nama_gudang', (table) => {
        table.renameColoumn('kode', 'jenis');
    });
}

export async function down (knex) {
    return knex.schema.alterTable('nama_gudang', (table) => {
        table.renameColoumn('jenis', 'kode');
    })
}