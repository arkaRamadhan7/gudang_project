import axios from "axios";
import { NextResponse } from "next/server";
import { API_ENDPOINTS } from "../api";


export async function POST(req) {
    try {
        const body = await req.json();
        const response = await axios.post(API_ENDPOINTS.ADD_TRANSACTION, body)

        return NextResponse.json(response.data);
     } catch (error) {
        console.error("Error Gagal menambahkan transaksi", error);
        return NextResponse.json({
            status: "99",
            message: error.response?.data.message
        }, {status: 500});
     }
    
}

export const GET = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.GET_ALL_PENJUALAN);
    const { status, message, data } = response.data;

    return NextResponse.json({ status, message, data });
  } catch (err) {
    console.error('Error API route:', err.message);
    return NextResponse.json({ status: 500, message: 'Gagal mengambil data penjualan' });
  }
};
