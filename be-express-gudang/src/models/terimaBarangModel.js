import { db } from "../core/config/knex";
 


export const getAllMutasi = () => {
    return db('mutasigudang_dari').select([
            'ID',
            'FAKTUR',
            'FAKTUR_KIRIM',
            'TGL',
            'GUDANG_TERIMA',
            'GUDANG_KIRIM',
            'KODE',
            'QTY',
            'SATUAN',
            'USERNAME',
            'DATETIME',
            
        ]);
};

export const insertMutasi = (data) => {
    return db('mutasigudang_dari').insert(data);
}