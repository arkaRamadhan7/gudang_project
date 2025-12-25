import { z } from "zod";

export const addGudangSchema = z.object({
  KODE: z
    .string({ required_error: 'kode gudang wajib diisi' })
    .min(1, 'kode gudang tidak boleh kosong'),

  nama: z
    .string({ required_error: 'Nama gudang wajib diisi' })
    .min(1, 'Nama gudang tidak boleh kosong'),

  alamat: z
    .string({ required_error: 'Alamat wajib diisi' })
    .min(1, 'Alamat tidak boleh kosong'),

  KETERANGAN: z
   .string({ required_error: 'kode gudang wajib diisi' })
    .min(1, 'kode gudang tidak boleh kosong'),

});


export const updateGudangSchema = z.object({
  KODE: z
    .string({ required_error: 'Jenis gudang wajib diisi' })
    .min(1, 'Jenis gudang tidak boleh kosong'),

  nama: z
    .string({ required_error: 'Nama gudang wajib diisi' })
    .min(1, 'Nama gudang tidak boleh kosong'),

  alamat: z
    .string({ required_error: 'Alamat wajib diisi' })
    .min(1, 'Alamat tidak boleh kosong'),

  KETERANGAN: z.string().optional()
});

