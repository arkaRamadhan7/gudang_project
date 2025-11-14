import axios from "axios";
import { API_ENDPOINTS } from "../../api.js"
import { NextResponse } from "next/server";
import { error } from "console";

export async function GET() {
 try {
    const response = await axios.get(API_ENDPOINTS.GET_LAPORAN_SISASTOCK);
    return NextResponse.json({
        status: '00',
        message: 'Berhasil Ambil Data Mutasi',
        data: response.data.data
    })
 }   catch (error) {
    console.error("ERROR ambil Data mutasi", error.message);
    return NextResponse.json({
        status: '99',
        message: 'Gagal Ambil Data Mutasi',
        error: error.message
    },{status: 500})
 }
}