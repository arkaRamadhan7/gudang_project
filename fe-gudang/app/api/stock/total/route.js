import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '@/app/api/api';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await Axios.get(API_ENDPOINTS.GET_TOTAL_COLUMNS_STOCK);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('API total columns error: ', error.message);
        return NextResponse.json(
            { status: '99', message: 'gagal menggambil data kolom stock '},
            {status: 500}
        )
    }
}