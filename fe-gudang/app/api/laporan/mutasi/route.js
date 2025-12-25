import axios from "axios";
import { API_ENDPOINTS } from "../../api";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await axios.get(API_ENDPOINTS.GET_LAPORAN_MUTASI)
        return NextResponse.json({
            status: '00',
            message: 'Berhasil Ambil data',
            data: response.data.data
        })
    } catch (error) {
        console.error("ERROR Ambil data", error.message)
        return NextResponse.json({
            status: '99',
            messgae: 'Gagal Ambil Data',
            error: error.message
        },{status: 500})
    }
}