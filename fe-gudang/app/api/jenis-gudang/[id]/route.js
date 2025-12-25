import { Axios } from '@/utils/axios';
import { NextResponse } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

// =================== PUT =================== //
export async function PUT(request) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();
    const body = await request.json();

    if (!body || !body.KETERANGAN) {
      return NextResponse.json(
        { status: '01', message: 'KETERANGAN wajib diisi' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const response = await Axios.put(`/jenis-gudang/edit/${id}`, body);

    return NextResponse.json(
      {
        status: '00',
        message: 'Jenis Gudang berhasil diupdate',
        data: response.data,
      },
      {
        status: 200,
        headers: CORS_HEADERS,
      }
    );

  } catch (error) {
    console.error('Error PUT Jenis Gudang:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        status: '01',
        message: error.response?.data?.message || 'Gagal mengupdate Jenis Gudang',
        error: error.message,
      },
      {
        status: error.response?.status || 500,
        headers: CORS_HEADERS,
      }
    );
  }
}

// =================== DELETE =================== //
export async function DELETE(request) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { status: '01', message: 'ID Jenis Gudang wajib diisi' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const response = await Axios.delete(`/jenis-gudang/delete/${id}`);

    return NextResponse.json(
      {
        status: '00',
        message: 'Jenis Gudang berhasil dihapus',
        id: id,
      },
      {
        status: 200,
        headers: CORS_HEADERS,
      }
    );
  } catch (error) {
    console.error('Error DELETE Jenis Gudang:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        status: '01',
        message: error.response?.data?.message || 'Gagal menghapus Jenis Gudang',
        error: error.message,
      },
      {
        status: error.response?.status || 500,
        headers: CORS_HEADERS,
      }
    );
  }
}

// =================== OPTIONS =================== //
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: CORS_HEADERS,
    }
  );
}
