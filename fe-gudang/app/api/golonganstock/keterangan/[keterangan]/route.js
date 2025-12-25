import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '@/app/api/api';
import { NextResponse } from 'next/server';

export async function GET(_, { params }) {
  // ✅ AWAIT params dulu sebelum destructuring
  const { keterangan } = await params;

  try {
    const response = await Axios.get(API_ENDPOINTS.GET_ALL_KETERANGAN_STOCK(keterangan));
    
    return NextResponse.json({
      status: '00',
      message: 'Berhasil mengambil data golongan stock berdasarkan keterangan',
      data: Array.isArray(response.data) ? response.data : response.data?.data || [],
    });
   
  } catch (error) {
    return NextResponse.json(
      {
        status: '99',
        message: 'Gagal mengambil data golongan stock berdasarkan keterangan',
        error: error.message,
      },
      { status: 500 }
    );
  }
}