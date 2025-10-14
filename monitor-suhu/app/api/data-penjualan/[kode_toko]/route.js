import axios from "axios";
import { API_ENDPOINTS } from "../../api";
import { NextResponse } from "next/server";

export async function GET(req, {params}) {
 try {
    const {kode_toko} = await params;
    const response = await axios.get(API_ENDPOINTS.DATA_PENJUALAN(kode_toko))

    return NextResponse.json({
        message: "Berhasil ambil data",
        data: response.data.data
    })
 }   catch (error) {
    console.error("Error Saat Ambil Data", error)
    return NextResponse.json({
        status:"99",
        message: error.message
    })
 }
}