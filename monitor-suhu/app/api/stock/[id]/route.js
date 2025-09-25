import axios from 'axios';
import { API_ENDPOINTS } from '@/app/api/api';
import { NextResponse } from 'next/server';


export const PUT = async (request, { params }) => {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const response = await axios.put(API_ENDPOINTS.EDIT_STOCK(id), body);
    
    return Response.json({
      status: '00',
      message: 'Stock berhasil diupdate',
      data: response.data
    });
    
  } catch (error) {
    console.error('Error updating stock:', error);
    return Response.json({
      status: '99',
      message: error.response?.data?.message || 'Gagal mengupdate stock'
    }, { status: 500 });
  }
};


export const DELETE = async (request, { params }) => {
  const  id  =  params.id;
  
  try {
    const response =  axios.delete(API_ENDPOINTS.DELETE_STOCK(id));
    
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
