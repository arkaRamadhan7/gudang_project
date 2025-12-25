import { z } from 'zod';

export const addJenisGudangSchema = z.object({
  KODE: z.string().min(1, 'kode tidak boleh kosong'),
  KETERANGAN: z.string().min(1, 'keterangan wajib diisi'),
});


export const updateJenisGudangSchema = z.object({
  KODE: z.string().min(1, 'kode tidak boleh kosong'),
  KETERANGAN: z.string().min(1, 'keterangan wajib diisi'),
});

