import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '@/app/api/api';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  try {
    const payload = await req.json();
    const { kode } = params;

    const response = await Axios.put(API_ENDPOINTS.EDIT_JENIS_GUDANG(kode), {
      KETERANGAN: payload.KETERANGAN,
    });

    return NextResponse.json({
      status: response.data.status,
      message: response.data.message,
    });
  } catch (err) {
    console.error('PUT golonganstock error:', err.message);
    return NextResponse.json(
      { status: '99', message: 'Gagal mengedit jenis gudang' },
      { status: 500 }
    );
  }
}


export async function DELETE(req, { params }) {
  try {
    const { kode } = params;

    const response = await Axios.delete(API_ENDPOINTS.DELETE_JENIS_GUDANG(kode));

    return NextResponse.json({
      status: response.data.status,
      message: response.data.message,
    });
  } catch (err) {
    console.error('DELETE golonganstock error:', err.message);
    return NextResponse.json(
      { status: '99', message: 'Gagal menghapus jenis gudang' },
      { status: 500 }
    );
  }
}