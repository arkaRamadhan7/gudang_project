import axios from "axios";
import { API_ENDPOINTS } from '../../../api.js';
import { NextResponse } from "next/server";


export async function GET(request, { params }) {
  try {
    const {kode_toko} = await params;
    
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!kode_toko) {
      return NextResponse.json({
        status: "99",
        message: "Parameter kode_toko wajib diisi",
        data: []
      });
    }

    const response = await axios.get(API_ENDPOINTS.GET_STOCK_FOR_PERUBAHAN(kode_toko));
    let stockData = response.data.data || response.data;

    if (!Array.isArray(stockData)) {
      stockData = [];
    }

    if (keyword && keyword.trim()) {
      stockData = stockData.filter(item => 
        (item.KODE && item.KODE.toLowerCase().includes(keyword.toLowerCase())) ||
        (item.NAMA && item.NAMA.toLowerCase().includes(keyword.toLowerCase()))
      );
    }

    return NextResponse.json({
      status: "00",
      message: "Berhasil Mendapatkan Data",
      data: stockData
    });
    
  } catch (error) {
    console.error("ERROR Get Stock", error.message);
    return NextResponse.json({
      status: "99",
      message: "Gagal Mendapatkan Data",
      error: error.message
    });
  }
}