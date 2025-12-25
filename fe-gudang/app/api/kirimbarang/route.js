import {Axios} from '@/utils/axios';
import {API_ENDPOINTS} from '../api';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response =  await Axios.get(API_ENDPOINTS.GET_ALL_KIRIM);

        return NextResponse.json({
            status: '00',
            message: 'Berhasil menggambil data mutasi',
            data: response.data.data,
        });
    } catch (error) {
        console.error('Err or GET mutasi:', error.message);
        return NextResponse.json(
            {
                status: '01', 
                message: 'Gagal menggambil data mutasi',
                error: error.message,
            },
            {status: 500}
        );
    }
}
export async function POST(req) {
    try {
        const body = await req.json();

        const response = await Axios.post(API_ENDPOINTS.ADD_KIRIM, body);

        return NextResponse.json({
            status: '00',
            message: 'Berhasil menambahkan data mutasi',
            data: response.data,
        });
    } catch (error) {
        console.error('error POST mutasi:', error.message);
        return NextResponse.json(
            {
                status: '01',
                message: 'Gagal menambahkan data mutasi',
                error: error.message,
            },
            { status: 500 }
        );
    }

}