import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '../../api';
import { NextResponse } from 'next/server';

export const PUT = async (request, { params }) => {
  try {
    const body = await request.json();
    const response = await Axios.put(API_ENDPOINTS.EDIT_JENIS_ROLE(params.id), body);

    return NextResponse.json({ ...response.data });
  } catch (err) {
    console.error('PUT Error:', err.message);
    return NextResponse.json(
      { message: 'Gagal mengupdate data jenis role' },
      { status: 500 }
    );
  }
};

export const DELETE = async (_request, { params }) => {
  try {
    const response = await Axios.delete(API_ENDPOINTS.DELETE_JENIS_ROLE(params.id));
    return NextResponse.json(response.data);
  } catch (err) {
    console.error('DELETE Error:', err.message);
    return NextResponse.json(
      { message: 'Gagal menghapus data jenis role' },
      { status: 500 }
    );
  }
};
