// app/api/stock/satuan/route.js (Next.js 13+)

import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '@/app/api/api';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { satuan } = params;

  try {
    const response = await Axios.get(API_ENDPOINTS.GET_STOCK_BY_SATUAN(satuan));
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API Error:', error.message);
    return NextResponse.json(
      { status: '99', message: 'Gagal mengambil stock berdasarkan satuan' },
      { status: 400 }
    );
  }
}
