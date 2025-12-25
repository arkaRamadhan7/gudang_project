import axios from "axios";
import { API_ENDPOINTS } from "../../api";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    
    const response = await axios.put(API_ENDPOINTS.EDIT_TOKO(id), body);
    
    return NextResponse.json({
      status: "00",
      message: "Berhasil Update Toko",
      data: response.data
    });
  } catch (error) {
    console.error("ERROR UPDATE TOKO", error.message);
    
    if (error.response) {
      console.error("Response error:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    
    return NextResponse.json({
      status: '99',
      message: 'Gagal Mengupdate Toko',
      error: error.message
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    const id  = params.id;
    
    console.log("Deleting toko with ID:", id);
    
    const response = await axios.delete(API_ENDPOINTS.DELETE_TOKO(id));
    
    return NextResponse.json({
      status: "00",
      message: "Berhasil Menghapus Toko",
      data: response.data
    });
  } catch (error) {
    console.error("ERROR DELETE TOKO", error.message);
    
    if (error.response) {
      console.error("Response error:", error.response.data);
      console.error("Response status:", error.response.status);
      
      if (error.response.status === 404) {
        return NextResponse.json({
          status: '99',
          message: 'Toko tidak ditemukan',
          error: 'Data not found'
        });
      }
      
      if (error.response.status === 400) {
        return NextResponse.json({
          status: '99',
          message: 'Data toko tidak bisa dihapus, mungkin masih digunakan',
          error: error.response.data.message || 'Bad request'
        });
      }
    }
    
    return NextResponse.json({
      status: '99',
      message: 'Gagal Menghapus Toko',
      error: error.message
    });
  }
}