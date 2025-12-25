import axios from 'axios';
import { API_ENDPOINTS } from '@/app/api/api';
import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.GET_NAMA_GUDANG);
    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(
      { status: '99', message: 'Gagal ambil nama gudang', data: [] },
      { status: 200 }
    );
  }
};
