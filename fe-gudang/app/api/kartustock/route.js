import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '@/app/api/api';
import { NextResponse } from 'next/server';

// Ambil semua data kartu stock
export async function GET() {
  try {
    const response = await Axios.get(API_ENDPOINTS.GET_ALL_KARTUSTOCK);
    return NextResponse.json({
      status: '00',
      message: 'Berhasil mengambil data kartu stock',
      data: response.data.data,
    });
  } catch (error) {
    console.error('Error GET kartustock:', error.message);
    return NextResponse.json({
      status: '01',
      message: 'Gagal mengambil data kartu stock',
      error: error.message,
    }, { status: 500 });
  }
}

// Tambah data kartu stock
export async function POST(req) {
  try {
    const body = await req.json();
    const response = await Axios.post(API_ENDPOINTS.ADD_KARTUSTOCK, body);
    return NextResponse.json({
      status: '00',
      message: 'Berhasil menambahkan data kartu stock',
      data: response.data,
    });
  } catch (error) {
    console.error('Error POST kartustock:', error.message);
    return NextResponse.json({
      status: '01',
      message: 'Gagal menambahkan data kartu stock',
      error: error.message,
    }, { status: 500 });
  }
}
