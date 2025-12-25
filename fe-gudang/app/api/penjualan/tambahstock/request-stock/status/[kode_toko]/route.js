import axios from "axios";
import { API_ENDPOINTS } from '../../../../../api';
import { NextResponse } from "next/server";
export async function GET(req, {params}) {
    try {
        const {kode_toko} = await params;

        const response = await axios.get(API_ENDPOINTS.STATUS(kode_toko))
        return NextResponse.json({
            status: "00",
            message: "Berhasil ambil Stock",
            data: response.data.data
        })
    } catch (error)  {
        console.error("ERROR get stock", error.message)
        return NextResponse.json({
            status: "99",
            message: "Gagal Ambil Stock dari gudang",
            error: error.message
        })
    }
    
}