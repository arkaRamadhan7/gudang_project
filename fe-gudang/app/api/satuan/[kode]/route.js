// app/api/rak/[kode]/route.js
import { Axios } from '@/utils/axios';
import { NextResponse } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

export async function PUT(request) {
  try {
    // Dapatkan kode dari URL
    const kode = request.nextUrl.pathname.split('/').pop();
    const body = await request.json();

    // Basic check for required fields
    if (!body || !body.KETERANGAN) {
      return NextResponse.json(
        { status: '01', message: 'KETERANGAN harus disediakan' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const response = await Axios.put(`/satuan/${kode}`, body);

    return NextResponse.json(
      {
        status: '00',
        message: 'Satuan Stock berhasil diupdate',
        data: response.data
      },
      { 
        status: 200,
        headers: CORS_HEADERS 
      }
    );

  } catch (error) {
    console.error('Error PUT SatuanStock:', {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });

    return NextResponse.json(
      {
        status: '01',
        message: error.response?.data?.message || 'Gagal mengupdate Satuan Stock',
        error: error.message,
      },
      { 
        status: error.response?.status || 500,
        headers: CORS_HEADERS 
      }
    );
  }
}

export async function DELETE(request) {
  try {
    
    const kode = request.nextUrl.pathname.split('/').pop();

    // Validate KODE exists
    if (!kode) {
      return NextResponse.json(
        { status: '01', message: 'KODE Satuan Stock Wajib di Isi' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const response = await Axios.delete(`/satuan/${kode}`);

    return NextResponse.json(
      {
        status: '00',
        message: 'Satuan Stock berhasil dihapus',
        kode: kode,
      },
      { 
        status: 200,
        headers: CORS_HEADERS 
      }
    );
  } catch (error) {
    console.error('Error DELETE Satuan Stock:', {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });

    return NextResponse.json(
      {
        status: '01',
        message: error.response?.data?.message || 'Gagal menghapus Satuan Stock',
        error: error.message,
      },
      { 
        status: error.response?.status || 500,
        headers: CORS_HEADERS 
      }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    { 
      status: 200,
      headers: CORS_HEADERS 
    }
  );
}