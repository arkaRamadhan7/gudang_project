import axios from "axios";
import {API_ENDPOINTS} from "../api"
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await axios.get(API_ENDPOINTS.GET_ALL_TOKO);
        return NextResponse.json({
            status:'00',
            message: "Berhasil Ambil Data Toko",
            data: response.data.data
        })
    } catch (error) {
        console.error("ERROR GET TOKO", error.message);
        return NextResponse.json({
            status: "99",
            message: "Gagal Ambil data",
            error: error.message
        })
    }
    
}
export async function POST(req) {
  try {
    const body = await req.json();
    
    const response = await axios.post(API_ENDPOINTS.ADD_TOKO, body);
    
    return NextResponse.json({
      status: "00",
      message: "Berhasil Tambah Toko",
      data: response.data,
    });
  } catch (error) {
    console.error("ERROR ADD Toko", error.message);
    
    if (error.response) {
      console.error("Response error:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    
    return NextResponse.json({
      status: '99',
      message: 'Gagal Menambahkan Toko',
      error: error.message
    });
  }
}