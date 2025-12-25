import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '../api';
import { NextResponse } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
export async function GET() {
  try {
    const response = await Axios.get(API_ENDPOINTS.GET_ALL_JENIS);

    return NextResponse.json(
      {
        status: '00',
        message: 'Berhasil Mengambil data Jenis Gudang',
        data: response.data?.data || [],
      },
      {
        status: 200,
        headers: CORS_HEADERS,
      }
    );
  } catch (error) {
    console.error('Error GET Jenis Gudang:', error.message);
    return NextResponse.json(
      {
        status: '01',
        message: 'Gagal Mengambil data Jenis Gudang',
        error: error.message || 'Unknown error',
      },
      {
        status: error.response?.status || 500,
        headers: CORS_HEADERS,
      }
    );
  }
}

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { status: '01', message: 'Content-Type harus application/json' },
        { status: 415, headers: CORS_HEADERS }
      );
    }

    const body = await req.json();

    if (!body || !body.KODE || !body.KETERANGAN) {
      return NextResponse.json(
        { status: '01', message: 'KODE dan KETERANGAN wajib diisi' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const response = await Axios.post(API_ENDPOINTS.ADD_JENIS, body);

    return NextResponse.json(
      {
        status: '00',
        message: 'Berhasil Menambahkan data Jenis Gudang',
        data: response.data,
      },
      {
        status: 201,
        headers: CORS_HEADERS,
      }
    );
  } catch (error) {
    console.error('Error POST Jenis Gudang:', error.message);

    let statusCode = error.response?.status || 500;
    let errorMessage = error.response?.data?.message || error.message || 'Unknown error';

    return NextResponse.json(
      {
        status: '01',
        message: 'Gagal Menambahkan data Jenis Gudang',
        error: errorMessage,
      },
      {
        status: statusCode,
        headers: CORS_HEADERS,
      }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: CORS_HEADERS });
}
