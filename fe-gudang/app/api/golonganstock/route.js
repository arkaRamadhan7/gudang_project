
import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '@/app/api/api';
import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
   const response = await Axios.get(API_ENDPOINTS.GET_ALL_JENIS_GUDANG);

    return NextResponse.json({
      status: response.data.status,
      message: response.data.message,
      data: response.data.data,
    });

  } catch (err) {
    console.error('GET golonganstock error:', err.message);
    return NextResponse.json(
      { status: '99', message: 'Gagal menggambil data master golongan' },
      { status: 500 }
    );
  }
};
export async function POST(req) {
  try {
    const body = await req.json();
    const response = await Axios.post(API_ENDPOINTS.ADD_GOLONGAN_STOCK, {
      KODE: body.KODE,
      KETERANGAN: body.KETERANGAN,
    });

    return NextResponse.json({
      status: '00',
      message: 'Berhasil menambahkan jenis gudang',
      data: response.data,
    });
  } catch (error) {
    return NextResponse.json({
      status: '99',
      message: 'Gagal menambahkan golongan stock',
    }, { status: 400 });
  }
}
