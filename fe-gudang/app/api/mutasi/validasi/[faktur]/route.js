import { NextResponse } from "next/server";
import axios from "axios";
import { API_ENDPOINTS } from "../../../api"; // sesuaikan path

export async function GET(req, { params }) {
  const { faktur } = await params;

  try {
    const response = await axios.get(API_ENDPOINTS.VALIDASI(faktur));

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error(
      "Error fetch validasi mutasi:",
      error.response?.data || error.message
    );

    return NextResponse.json(
      { status: "99", message: "Error fetch validasi mutasi" },
      { status: error.response?.status || 500 }
    );
  }
}
