import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '../api';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await Axios.get(API_ENDPOINTS.GET_ALL_JENIS_ROLE);
        const { status, message, data } = response.data;

        return NextResponse.json({ status, message, data });
    } catch (err) {
        console.error('GET jenis role error:', err.message);
        return NextResponse.json(
            { status: '99', message: 'Gagal mengambil data jenis role' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Body diterima di API route Next.js:', body);

    if (!body.kode || !body.role) {
      return NextResponse.json({ status: '01', message: 'Kode dan role wajib diisi' }, { status: 400 });
    }

    console.log('Kirim POST ke backend utama:', API_ENDPOINTS.ADD_JENIS_ROLE);
    const response = await Axios.post(API_ENDPOINTS.ADD_JENIS_ROLE, body);
    console.log('Response dari backend utama:', response.data);

    return NextResponse.json(response.data, { status: 201 });
  } catch (err) {
    console.error('POST jenis role error:', err.message);
    return NextResponse.json({ status: '99', message: 'Gagal menambahkan jenis role' }, { status: 500 });
  }
}


