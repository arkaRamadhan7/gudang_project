import { z } from 'zod';

export const addMutasiKirimSchema = z.object({
    NAMA: z
    .string({required_error: 'nama wajib diisi'})
    .min(2, 'nama tidak boleh kosong'), 
    FAKTUR: z
    .string({required_error: 'faktur wajib diisi'})
    .min(8, 'faktur tidak boleh kosong'),

    TGL: z
    .string({required_error: 'TGL wajib diisi'})
    .min(1, 'TGL tidak boleh kosong'),

    GUDANG_KIRIM: z
    .string({required_error: 'GUDANG wajib diisi'})
    .min(1, 'GUDANG tidak boleh kosong'),

    GUDANG_TERIMA: z
    .string({required_error: 'GUDANG wajib diisi'})
    .min(1, 'GUDANG tidak boleh kosong'),

    KODE: z
    .string({required_error: 'KODE wajib diisi'})
    .min(4, 'KODE tidak boleh kosong'),

    QTY: z
    .string({required_error: 'QTY wajib diisi'})
    .min(1, 'QTY tidak boleh kosong'),

    SATUAN: z
    .string({required_error: 'SATUAN wajib diisi'})
    .min(1, 'SATUAN tidak boleh kosong'),

    USERNAME: z
    .string({required_error: 'USERNAME wajib diisi'})
    .min(1, 'USERNAME tidak boleh kosong'),
    
    DATETIME: z
    .string({required_error: 'DATETIME wajib diisi'})
    .min(1, 'DATETIME tidak boleh kosong'),
    
    STATUS: z
    .string({required_error: 'STATUS wajib diisi'})
    .min(1, 'STATUS tidak boleh kosong'),
});

