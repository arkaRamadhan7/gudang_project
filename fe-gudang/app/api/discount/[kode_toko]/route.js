import { NextResponse } from 'next/server';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api';

export async function GET(request, {params} ) {
    try {
        const { searchParams } = new URL(request.url);
        const {kode_toko} = await params;
        const response = await axios.get(API_ENDPOINTS.GET_STOCK_FOR_DISKON(kode_toko));
        
        return NextResponse.json(response.data);
    } catch (error) {
        return NextResponse.json(
            { message: "Gagal mengambil data produk dari backend", error: error.message },
            { status: 500 }
        );
    }
}