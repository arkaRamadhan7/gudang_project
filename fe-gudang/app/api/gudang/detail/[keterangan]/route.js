import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '@/app/api/api';
import { NextResponse } from 'next/server';

export const GET = async (req, { params }) => {
    // ✅ AWAIT params dulu sebelum destructuring
    const { keterangan } = await params;

    try {
        const response = await Axios.get(API_ENDPOINTS.GET_DETAIL_GUDANG_BY_JENIS(keterangan));
        
        return NextResponse.json({
            status: '00',
            message: 'Berhasil mengambil data detail gudang',
            data: response.data
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: '99',
                message: 'Gagal mengambil data detail gudang',
                error: error.message,
            },
            { status: 500 }
        );
    }
};