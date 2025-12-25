import axios from "axios";
import { API_ENDPOINTS } from "../api";
import { NextResponse } from "next/server";


export const GET = async () => {
  try {
    console.log('Fetching from:', API_ENDPOINTS.GET_ALL_DATA_PENJUALAN);
    
    const response = await axios.get(API_ENDPOINTS.GET_ALL_DATA_PENJUALAN);
    
    // Log response untuk debugging
    console.log('Raw response:', response.data);
    
    // Validasi response structure
    if (!response.data) {
      console.warn('Response data is empty or undefined');
      return NextResponse.json({ 
        status: '00', 
        message: 'Belum ada data penjualan',
        data: [] 
      });
    }

    const { status, message, data } = response.data;
    
    // Pastikan data adalah array
    let validatedData = [];
    
    if (Array.isArray(data)) {
      validatedData = data;
    } else if (data && typeof data === 'object') {
      // Jika data adalah object, coba ambil property pertama yang berisi array
      const values = Object.values(data);
      if (values.length > 0 && Array.isArray(values[0])) {
        validatedData = values[0];
      }
    }
    
    console.log(`Returning ${validatedData.length} records`);

    return NextResponse.json({ 
      status: status || '00', 
      message: message || 'Data berhasil diambil',
      data: validatedData 
    });

  } catch (err) {
    console.error('Error API route:', err.message);
    console.error('Error details:', err.response?.data || err);
    
    // Return format yang konsisten meskipun error
    return NextResponse.json({ 
      status: '99', 
      message: err.message || 'Gagal mengambil data penjualan',
      data: [] 
    }, { 
      status: 500 
    });
  }
};