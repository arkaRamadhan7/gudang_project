import axios from "axios";
import { API_ENDPOINTS } from "../../api.js";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await axios.get(API_ENDPOINTS.GET_LAPORAN_DISKON);
        
        // Ambil data dari response
        const data = response.data.data || response.data || [];
        
        // 🔍 CEK APAKAH DATA KOSONG
        if (!data || (Array.isArray(data) && data.length === 0)) {
            console.log('ℹ️  Tidak ada diskon saat ini');
            
            return NextResponse.json({
                status: '00',
                message: 'Tidak ada diskon saat ini',
                data: []
            });
        }
        
        // ✅ DATA ADA
        console.log(`✅ Berhasil ambil ${Array.isArray(data) ? data.length : 1} data diskon`);
        
        return NextResponse.json({
            status: '00',
            message: 'Berhasil ambil data diskon',
            data: data
        });
        
    } catch (error) {
        console.error("❌ ERROR ambil data diskon:", error.message);
        
        // 🎯 HANDLE KHUSUS: Backend return error untuk data kosong
        if (error.response) {
            const errorMessage = error.response.data?.error || 
                               error.response.data?.message || 
                               '';
            
            // 🔍 Check apakah error ini sebenarnya "data kosong"
            const emptyDataKeywords = [
                'sedang tidak ada',
                'tidak ada data',
                'no data',
                'not found',
                'no records'
            ];
            
            const isEmptyDataError = emptyDataKeywords.some(keyword => 
                errorMessage.toLowerCase().includes(keyword)
            );
            
            // ✅ Jika error karena data kosong, return SUCCESS dengan data kosong
            if (isEmptyDataError) {
                console.log('ℹ️  Tidak ada diskon saat ini (backend return error untuk data kosong)');
                
                return NextResponse.json({
                    status: '00',
                    message: 'Tidak ada diskon saat ini',
                    data: []
                });
            }
            
            // ❌ Error sungguhan dari server
            console.error("Response error:", error.response.status, error.response.data);
            
            return NextResponse.json({
                status: '99',
                message: 'Gagal ambil data diskon dari server',
                error: errorMessage || error.message
            }, { status: error.response.status });
            
        } else if (error.request) {
            // Request dibuat tapi tidak ada response
            console.error("No response received:", error.request);
            
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
                message: 'Gagal ambil data diskon',
                error: error.message
            }, { status: 500 });
        }
    }
}