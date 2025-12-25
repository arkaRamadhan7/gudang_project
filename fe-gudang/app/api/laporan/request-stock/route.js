import axios from "axios";
import { API_ENDPOINTS } from "../../api.js";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await axios.get(API_ENDPOINTS.GET_LAPORAN_REQUESTSTOCK);
        
        // Ambil data dari response
        const data = response.data.data || response.data || [];
        
        // 🔍 CEK APAKAH DATA KOSONG
        if (!data || (Array.isArray(data) && data.length === 0)) {
            console.log('ℹ️  Tidak ada request stock saat ini');
            
            return NextResponse.json({
                status: '00',
                message: 'Tidak ada request stock saat ini',
                data: []
            });
        }
        
        // ✅ DATA ADA
        const dataCount = Array.isArray(data) ? data.length : 1;
        console.log(`✅ Berhasil ambil ${dataCount} data request stock`);
        
        return NextResponse.json({
            status: '00',
            message: 'Berhasil ambil data request stock',
            data: data
        });
        
    } catch (error) {
        console.error("❌ ERROR ambil data request stock:", error.message);
        
        // Handle berbagai jenis error
        if (error.response) {
            // Error dari server (4xx, 5xx)
            console.error("Response error:", error.response.status, error.response.data);
            
            return NextResponse.json({
                status: '99',
                message: 'Gagal ambil data request stock dari server',
                error: error.response.data?.message || error.message
            }, { status: error.response.status });
            
        } else if (error.request) {
            // Request dibuat tapi tidak ada response
            console.error("No response received from server");
            
            return NextResponse.json({
                status: '99',
                message: 'Server tidak merespon',
                error: 'Tidak dapat terhubung ke server'
            }, { status: 503 });
            
        } else {
            // Error lainnya
            console.error("Error:", error.message);
            
            return NextResponse.json({
                status: '99',
                message: 'Gagal ambil data request stock',
                error: error.message
            }, { status: 500 });
        }
    }
}