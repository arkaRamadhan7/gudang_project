import { db } from "../core/config/knex.js";

export const countGudangByJenis = () => {
  return db('nama_gudang')
    .select('jenis')
    .count('* as jumlah')
    .groupBy('jenis');
};


