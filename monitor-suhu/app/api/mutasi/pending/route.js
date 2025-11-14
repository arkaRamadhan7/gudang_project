import axios from "axios";
import { NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/app/api/api";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const gudang = searchParams.get('gudang'); // Ambil query parameter

    // Build URL dengan query parameter jika ada
    let url = API_ENDPOINTS.GET_PENDING_MUTASI;
    if (gudang) {
      url += `?gudang=${encodeURIComponent(gudang)}`;
    }

    // Request ke backend Express
    const response = await axios.get(url);

    return NextResponse.json(
      {
        status: "00",
        message: response.data.message || "Data berhasil diambil",
        data: response.data.data || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error GET_PENDING_MUTASI:", error.response?.data || error.message);

    return NextResponse.json(
      {
        status: "99",
        message: error.response?.data?.message || "Gagal mengambil data pending",
        data: []
      },
      { status: 500 }
    );
  }
}