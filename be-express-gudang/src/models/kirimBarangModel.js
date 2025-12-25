import { db } from "../core/config/knex";
 


export const getAllMutasi = () => {
    return db('mutasigudang_ke').select([
            'ID',
            'NAMA',
            'FAKTUR',
            'TGL',
            'GUDANG_KIRIM',
            'GUDANG_TERIMA',
            'KODE',
            'QTY',
            'SATUAN',
            'USERNAME',
            'DATETIME',
            'STATUS'
        ]);
};

export const insertMutasi = (data) => {
    return db('mutasigudang_ke').insert(data);
}