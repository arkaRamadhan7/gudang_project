import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '@/app/api/api';
import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    const response = await Axios.get(API_ENDPOINTS.GET_ALL_USERS);
    const { status, message, users } = response.data;

    return NextResponse.json({ status, message, users });
  } catch (err) {
    console.error('Error API route:', err.message);
    return NextResponse.json({ status: 500, message: 'Gagal mengambil data user' });
  }
};


export const POST = async (req) => {
  try {
    const body = await req.json();
    const { username, password, email, no_hp, role, gudang} = body;

    if (!username || !password || !email || !no_hp || !role) {
      return NextResponse.json(
        {
          status: '99',
          message: 'Semua field harus diisi',
          data: {},
        },
        { status: 400 }
      );
    }

    const response = await Axios.post(API_ENDPOINTS.ADD_USER, body);
    return NextResponse.json(response.data, { status: 200 });
  } catch (err) {
    console.error('POST /api/users error:', err?.response?.data || err.message);
    return NextResponse.json(
      {
        status: '99',
        message: 'Gagal menambahkan user',
        data: {},
      },
      { status: 500 }
    );
  }
};
