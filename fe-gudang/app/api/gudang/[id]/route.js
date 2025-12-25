import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '@/app/api/api';
import { NextResponse } from 'next/server';


export const PUT = async (request) => {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const response = await Axios.put(API_ENDPOINTS.EDITGUDANG(id), body);

    return NextResponse.json(response.data);
  } catch (err) {
    console.error('PUT error:', err.message);
    return NextResponse.json(
      { status: '99', message: 'Terjadi kesalahan saat mengupdate gudang' },
      { status: 400 }
    );
  }
};

export const DELETE = async (request, { params }) => {
  try {
    const id = params.id;

    const response = await Axios.delete(API_ENDPOINTS.DELETEGUDANG(id)); 

    return NextResponse.json(response.data);
  } catch (err) {
    console.error('DELETE error:', err.message);
    return NextResponse.json(
      { status: '99', message: 'Terjadi kesalahan saat menghapus gudang' },
      { status: 400 }
    );
  }
};

