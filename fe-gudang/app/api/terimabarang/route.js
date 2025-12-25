import {Axios} from '@/utils/axios';
import { API_ENDPOINTS } from '../api';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await Axios.get(API_ENDPOINTS.GET_ALL_TERIMA);
        return NextResponse.json({
            status: '00',
            message: 'berhasil mengambil data Mutasi',
            data: response.data.data,
        });
    } catch (error) {
        console.error('Error GET Mutasi:', error.message)
        return NextResponse.json({
            status: '01',
            messgae: 'Gagal mengambil data Mutasi',
            error: error.message,
        },{ status: 500 })
    }
}

export async function POST(req, res) {
    try {
        const body = await req.json();
        const response = await Axios.post(API_ENDPOINTS.ADD_TERIMA);
        return NextResponse.json({
            status: '00',
            message: 'berhasil menambahkan data mutasi',
            data: response.data,
        });
    } catch (error) {
        console.error('Error POST Mutasi:', error.message);
        return NextResponse.json({
            status: '01',
            message: 'gagal menambahkan data mutasi',
            error: error.message,
        }, { status: 500 })
    }
    
}