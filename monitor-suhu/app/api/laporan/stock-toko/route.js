import Axios from "axios";
import { API_ENDPOINTS } from "../../api";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await Axios.get(API_ENDPOINTS.GET_LAPORAN_STOCK_TOKO);
        
        // Debug: Cek data yang diterima
        console.log("Response dari API:", response.data);
        
        return NextResponse.json({
            status: '00',  // Perbaiki typo: stasus -> status
            message: 'Berhasil Mengambil Data Stock Toko',  // Perbaiki typo: MEngambil
            data: response.data
        });
    } catch (error) {
        console.error("Error dalam pengambilan data stock toko", error.message);
        return NextResponse.json({
            status: '99',
            message: 'Gagal mengambil data stock toko',
            error: error.message
        }, { status: 500 });
    }
}