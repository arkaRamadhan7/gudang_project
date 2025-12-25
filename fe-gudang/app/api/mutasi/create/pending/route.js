import { NextResponse } from "next/server";
import axios from "axios";
import { API_ENDPOINTS } from "../../../api";

export async function GET() {
  try {
    const response = await axios.get(API_ENDPOINTS.GET_PENDING_MUTASI);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetch pending mutasi:", error.response?.data || error.message);
    return NextResponse.json(
      { status: "99", message: "Error fetch pending mutasi" },
      { status: 500 }
    );
  }
}
