import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '@/app/api/api';
import { NextResponse } from 'next/server';
import { request } from 'axios';


export const PUT = async (request, { params }) => {
  try {
    const body = await request.json();
    const response = await Axios.put(API_ENDPOINTS.EDIT_STOCK(params.id), body);

    return NextResponse.json({...response.data}) ;
  } catch (err) {
    console.error('PUT Error:' , err.message);
    return NextResponse.json(
      { message : 'Gagal mengupdate data stock'},
    );
  }
};

export const DELETE = async (request, { params }) => {
  const  id  =  params.id;
  
  try {
    const response = await Axios.delete(API_ENDPOINTS.DELETE_STOCK(id));
    
    return Response.json({
      status: '00',
      message: 'Stock berhasil dihapus',
      data: response.data
    });
    
  } catch (error) {
    console.error('Error deleting stock:', error);
    return Response.json({
      status: '99',
      message: error.response?.data?.message || 'Gagal menghapus stock'
    }, { status: 500 });
  }
};
