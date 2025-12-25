import { Axios } from '@/utils/axios';
import { API_ENDPOINTS  } from '../api';
import { NextResponse } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET() {
  try {
    const response = await Axios.get(API_ENDPOINTS.GET_ALL_SATUAN);

    if (!response.data) {
      throw new Error('Data tidak ditemukan');
    }

    return NextResponse.json(
      {
        status: '00', 
        message: 'Berhasil Mengambil data Satuan Stock',
        data: response.data.data,
      },
      { 
        status: 201,
        headers: CORS_HEADERS
      }
    );
  } catch (error) {
    console.error('Error GET Satuan Stock:', error.message);
    return NextResponse.json(
      {
        status: '01',
        message: 'Gagal Mengambil data Satuan Stock',
        error: error.message || 'Unknown error',
      },
      { 
        status: error.response?.status || 500,
        headers: CORS_HEADERS
      }
    );
  }
}

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { status: '01', message: 'Content-Type harus application/json' },
        { status: 415, headers: CORS_HEADERS }
      );
    }

    const body = await req.json();
    
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { status: '01', message: 'Request body tidak boleh kosong' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const response = await Axios.post(API_ENDPOINTS.ADD_SATUAN, body);

    return NextResponse.json(
      {
        status: '00',
        message: 'Berhasil Menambahkan data Satuan Stock',
        data: response.data,
      },
      { 
        status: 201,
        headers: CORS_HEADERS
      }
    );
  } catch (error) {
    console.error('Error POST Satuan Stock:', error.message);
    
    let statusCode = 500;
    let errorMessage = error.message || 'Unknown error';
    
    if (error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
    }

    return NextResponse.json(
      {
        status: '01',
        message: 'Gagal Menambahkan data Satuan Stock',
        error: errorMessage,
      },
      { 
        status: statusCode,
        headers: CORS_HEADERS
      }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    { 
      status: 201,
      headers: CORS_HEADERS
    }
  );
}