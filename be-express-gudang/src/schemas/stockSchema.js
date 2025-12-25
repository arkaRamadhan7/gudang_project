import { z } from 'zod';

export const addStockSchema = z.object({
  gudang: z
    .string({ required_error: 'Gudang wajib diisi' })
    .min(1, 'Gudang tidak boleh kosong'),

  KODE: z
    .string({ required_error: 'Kode wajib diisi' })
    .min(1, 'Kode tidak boleh kosong'),

  KODE_TOKO: z
    .string({ required_error: 'Kode toko wajib diisi' })
    .min(1, 'Kode toko tidak boleh kosong'),

  NAMA: z
    .string({ required_error: 'Nama wajib diisi' })
    .min(1, 'Nama tidak boleh kosong'),

  JENIS: z
    .string({ required_error: 'Jenis wajib diisi' })
    .min(1, 'Jenis tidak boleh kosong'),

  GOLONGAN: z
    .string({ required_error: 'Golongan wajib diisi' })
    .min(1, 'Golongan tidak boleh kosong'),

  RAK: z
    .string({ required_error: 'RAK wajib diisi' })
    .min(1, 'RAK tidak boleh kosong'),

  DOS: z
    .string({ required_error: 'DOS wajib diisi' })
    .min(1, 'DOS tidak boleh kosong'),

  SATUAN: z
    .string({ required_error: 'Satuan wajib diisi' })
    .min(1, 'Satuan tidak boleh kosong'),

  ISI: z
    .string({ required_error: 'ISI wajib diisi' })
    .min(1, 'ISI tidak boleh kosong'),

  DISCOUNT: z
    .string({ required_error: 'Discount wajib diisi' })
    .min(1, 'Discount tidak boleh kosong'),

  HB: z
    .string({ required_error: 'Harga Beli wajib diisi' })
    .min(1, 'Harga Beli tidak boleh kosong'),

  HJ: z
    .string({ required_error: 'Harga Jual wajib diisi' })
    .min(1, 'Harga Jual tidak boleh kosong'),

  EXPIRED: z
    .string({ required_error: 'Tanggal Expired wajib diisi' })
    .min(1, 'Tanggal Expired tidak boleh kosong'),

  TGL_MASUK: z
    .string({ required_error: 'Tanggal Masuk wajib diisi' })
    .min(1, 'Tanggal Masuk tidak boleh kosong'),

  BERAT: z
    .string({ required_error: 'Berat wajib diisi' })
    .min(1, 'Berat tidak boleh kosong'),
});

export const editStockSchema = z.object({
  id: z
    .number({ required_error: 'ID wajib diisi' })
    .int('ID harus berupa angka')
    .positive('ID harus lebih dari 0'),

  gudang: z
    .string()
    .min(1, 'Gudang tidak boleh kosong')
    .optional(),

  KODE: z
    .string()
    .min(1, 'Kode tidak boleh kosong')
    .optional(),

  KODE_TOKO: z
    .string()
    .min(1, 'Kode toko tidak boleh kosong')
    .optional(),

  NAMA: z
    .string()
    .min(1, 'Nama tidak boleh kosong')
    .optional(),

  JENIS: z
    .string()
    .min(1, 'Jenis tidak boleh kosong')
    .optional(),

  GOLONGAN: z
    .string()
    .min(1, 'Golongan tidak boleh kosong')
    .optional(),

  RAK: z
    .string()
    .min(1, 'RAK tidak boleh kosong')
    .optional(),

  DOS: z
    .string()
    .min(1, 'DOS tidak boleh kosong')
    .optional(),

  SATUAN: z
    .string()
    .min(1, 'Satuan tidak boleh kosong')
    .optional(),

  ISI: z
    .string()
    .min(1, 'ISI tidak boleh kosong')
    .optional(),

  DISCOUNT: z
    .string()
    .min(1, 'Discount tidak boleh kosong')
    .optional(),

  HB: z
    .string()
    .min(1, 'Harga Beli tidak boleh kosong')
    .optional(),

  HJ: z
    .string()
    .min(1, 'Harga Jual tidak boleh kosong')
    .optional(),

  EXPIRED: z
    .string()
    .min(1, 'Tanggal Expired tidak boleh kosong')
    .optional(),

  TGL_MASUK: z
    .string()
    .min(1, 'Tanggal Masuk tidak boleh kosong')
    .optional(),

  BERAT: z
    .string()
    .min(1, 'Berat tidak boleh kosong')
    .optional(),
});

