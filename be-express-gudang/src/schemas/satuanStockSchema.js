import { z } from 'zod';

export const addSatuanSchema = z.object({
  KODE: z
    .string({ required_error: 'Kode wajib diisi' })
    .min(1, 'Kode tidak boleh kosong'),

  KETERANGAN: z
    .string({ required_error: 'Keterangan wajib diisi' })
    .min(1, 'Keterangan tidak boleh kosong'),
});


export const editSatuanSchema = z.object({
  KETERANGAN: z
    .string({ required_error: 'Keterangan wajib diisi' })
    .min(1, 'Keterangan tidak boleh kosong'),
});
