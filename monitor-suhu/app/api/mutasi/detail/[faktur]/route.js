import axios from "axios";
import { NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/app/api/api";

export async function GET(req, { params }) {
  const { faktur } = await params;

  if (!faktur) {
    return NextResponse.json(
      { status: "99", message: "Faktur tidak ditemukan di URL" },
      { status: 400 }
    );
  }

  try {
    // Request ke backend Express
    const response = await axios.get(API_ENDPOINTS.GET_DETAIL_BARANG_BY_FAKTUR(faktur));

    return NextResponse.json(
      {
        status: "00",
        message: "Detail barang berhasil diambil",
        faktur: response.data.faktur,
        gudang_kirim: response.data.gudang_kirim,
        gudang_terima: response.data.gudang_terima,
        tanggal: response.data.tanggal,
        summary: response.data.summary,
        data: response.data.data || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error GET_DETAIL_BARANG:", error.response?.data || error.message);

    return NextResponse.json(
      {
        status: "99",
        message: error.response?.data?.message || "Detail barang tidak ditemukan",
      },
      { status: error.response?.status || 500 }
    );
  }
}
