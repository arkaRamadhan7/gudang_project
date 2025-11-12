import axios from "axios";
import { NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/app/api/api"; 


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
