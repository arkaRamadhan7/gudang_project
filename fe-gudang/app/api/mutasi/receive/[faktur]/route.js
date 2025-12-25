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
    const response = await axios.get(API_ENDPOINTS.GET_MUTASI_BY_FAKTUR(faktur));

    return NextResponse.json(
      {
        status: "00",
        message: "Data mutasi berhasil diambil",
        data: response.data.data || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error GET_MUTASI_BY_FAKTUR:", error.response?.data || error.message);

    return NextResponse.json(
      {
        status: "99",
        message: error.response?.data?.message || "Data mutasi tidak ditemukan",
      },
      { status: error.response?.status || 500 }
    );
  }
}

// POST - Terima barang (sudah ada, saya tambahkan di sini)
export async function POST(req, { params }) {
  const { faktur } = await params;

  if (!faktur) {
    return NextResponse.json(
      { status: "99", message: "Faktur tidak ditemukan di URL" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();

    // Validasi body
    if (!body.dos || body.dos <= 0) {
      return NextResponse.json(
        { status: "99", message: "DOS harus lebih dari 0" },
        { status: 400 }
      );
    }

    if (!body.isi || body.isi <= 0) {
      return NextResponse.json(
        { status: "99", message: "ISI harus lebih dari 0" },
        { status: 400 }
      );
    }

    // Verifikasi QTY = DOS × ISI
    const calculatedQty = body.dos * body.isi;
    if (body.qty !== calculatedQty) {
      return NextResponse.json(
        { 
          status: "99", 
          message: `QTY tidak sesuai. Seharusnya ${calculatedQty} (DOS: ${body.dos} × ISI: ${body.isi})` 
        },
        { status: 400 }
      );
    }

    // Kirim ke backend Express
    const response = await axios.post(
      API_ENDPOINTS.RECEIVE_MUTASI(faktur),
      body,
      { headers: { "Content-Type": "application/json" } }
    );

    return NextResponse.json(
      {
        status: "00",
        message: "Mutasi berhasil diterima",
        data: response.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error RECEIVE_MUTASI:", error.response?.data || error.message);

    return NextResponse.json(
      {
        status: "99",
        message: error.response?.data?.message || "Gagal menerima mutasi",
      },
      { status: 500 }
    );
  }
}