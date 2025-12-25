import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '@/app/api/api';
import { NextResponse } from 'next/server';

// Update data kartu stock berdasarkan ID
export async function PUT(request, { params }) {
  const { id } = params;

  try {
    const body = await request.json();
    const response = await Axios.put(API_ENDPOINTS.EDIT_KARTUSTOCK(id), body);

    return NextResponse.json({
      status: '00',
      message: 'Berhasil meng-update data kartu stock',
      data: response.data,
    });
  } catch (error) {
    console.error('PUT kartu stock error:', error.message);
    return NextResponse.json({
      status: '99',
      message: 'Gagal meng-update data kartu stock',
      error: error.message,
    }, { status: 500 });
  }
}

// Hapus data kartu stock berdasarkan ID
export async function DELETE(_request, { params }) {
  const { id } = params;

  try {
    const response = await Axios.delete(API_ENDPOINTS.DELETE_KARTUSTOCK(id));

    return NextResponse.json({
      status: '00',
      message: response.data.message || 'Berhasil menghapus data kartu stock',
    });
  } catch (error) {
    console.error('DELETE kartu stock error:', error.message);
    return NextResponse.json({
      status: '99',
      message: 'Gagal menghapus data kartu stock',
      error: error.message,
    }, { status: 500 });
  }
}
