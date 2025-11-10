import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '../../api';
import { NextResponse } from 'next/server';

export const PUT = async (req, { params }) => {
  const { id } = await params

  const body = await req.json();

  try {
    const response = await Axios.put(API_ENDPOINTS.EDIT_USER(id), body);
    return NextResponse.json({
      status: response.data.status,
      message: response.data.message,
      data: response.data
    });
  } catch (err) {
    console.error('Error PUT user:', err?.response?.data || err.message);
    return NextResponse.json(
      { status: '99', message: 'Gagal update user', data: {} },
      { status: 500 }
    );
  }
};

export const DELETE = async (req, { params }) => {
  const id = params.id;

  try {
    const response = await Axios.delete(API_ENDPOINTS.DELETE_USER(id));
    return NextResponse.json({
      status: response?.data?.status || '00',
      message: response?.data?.message || 'User berhasil dihapus',
    });
  } catch (err) {
    console.error('Gagal hapus user:', err?.response?.data || err);
    return NextResponse.json(
      {
        status: '99',
        message: err?.response?.data?.message || 'Gagal menghapus user',
      },
      { status: 500 }
    );
  }
};
