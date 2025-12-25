import axios from 'axios';
import { API_ENDPOINTS } from '@/app/api/api';

export async function GET(request, { params }) {
  const { gudang } = params;

  if (!gudang) {
    return Response.json({ status: '99', message: 'Gudang kosong' }, { status: 400 });
  }

  try {
    const res = await axios.get(API_ENDPOINTS.GET_BY_GUDANG(gudang));
    return Response.json(res.data);
  } catch (err) {
    return Response.json({ status: '99', message: 'Gagal mengambil data' }, { status: 500 });
  }
}


