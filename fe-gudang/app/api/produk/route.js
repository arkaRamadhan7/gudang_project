import {Axios} from '@/utils/axios';
import {API_ENDPOINTS} from '../api';
import { NextResponse } from 'next/server';
import { request } from 'http';

export const GET = async () => {
    try {
        const response = await Axios.get(API_ENDPOINTS.GETALLPRODUK);
        return NextResponse.json({ data: response.data });
    } catch (err) {
        return NextResponse.json(
            { message: 'Gagal mendapatkan data master produk'},
            { status: 500 }
        );
    }
};

export const POST = async (request) => {
    try {
        const body = await request.json();
        const response = await Axios.post(API_ENDPOINTS.ADDPRODUK,body);
        return NextResponse.json({ data: response.data });
    } catch (err) {
        return NextResponse.json(
            { message: 'Gagal menambahkan data master produk'},
            {status: 500}
        );
    }
};
