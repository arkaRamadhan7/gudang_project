import { optional, z } from "zod";

export const addProdukSchema = z.object ({
  kode : z
      .string()
      .min(3,"kode produk minimal 3 karakter")
      .max(6,"kode produk maksimal 6 karakter"),
  nomor : z 
      .string()
      .min(1,  "Nomor produk wajib di sisi")
      .max(100, "Nomor produk maksimal 100 karakter"),
  nama : z 
      .string()
      .min(3, "Nama produk minimal 3 karakter")
      .max(50,"Nama produk maksimal 50 karakter"),
  stock: z.number({invalid_type_error : "Stock harus berupa angka"}),
  harga: z.number({invalid_type_error : "harga harus berupa angka"}),
  kategori : z
    .string()
    .min(1, "Kategori wajib diisi")
    .max(50, "Kategori maksimal 50 karakter"),
  satuan: z
    .string()
    .min(1, "Satuan wajib diisi")
    .max(20, "Satuan maksimal 20 karakter"),

  gudang: z 
  .string()
  .min(1, "Gudang Wajib diisi")
  .max(100, "Gudang Wajib diisi"),
});

export const updateProdukSchema = z.object({
  kode: z
    .string()
    .min(3, "Kode produk minimal 3 karakter")
    .max(100, "Kode produk maksimal 100 karakter")
    .optional(),
  nomor: z
    .string()
    .min(1, "Nomor produk wajib diisi")
    .max(50, "Nomor produk maksimal 50 karakter")
    .optional(),
  nama: z
    .string()
    .min(3, "Nama produk minimal 3 karakter")
    .max(100, "Nama produk maksimal 100 karakter")
    .optional(),
  stock: z.number({ invalid_type_error: "Stock harus berupa angka" }).optional(),
  harga: z.number({ invalid_type_error: "Harga harus berupa angka" }).optional(),
  kategori: z
    .string()
    .min(1, "Kategori wajib diisi")
    .max(50, "Kategori maksimal 50 karakter")
    .optional(),
  satuan: z
    .string()
    .min(1, "Satuan wajib diisi")
    .max(20, "Satuan maksimal 20 karakter")
    .optional(),
  gudang: z 
    .string()
    .min(1, "Gudang Wajib diisi")
    .max(20, "Gudang Wajib diisi")
    .optional(),
  });