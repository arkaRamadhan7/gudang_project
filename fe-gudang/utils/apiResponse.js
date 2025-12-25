// utils/apiResponse.js
import { NextResponse } from 'next/server';

export const successResponse = (message, data = {}, status = 200) => {
  return NextResponse.json({
    status: '00',
    message: message || 'Success',
    data
  }, { status });
};

export const errorResponse = (message, statusCode = 500, customStatus = '99') => {
  return NextResponse.json({
    status: customStatus,
    message: message || 'Internal Server Error',
    data: {}
  }, { status: statusCode });
};

export const unauthorizedResponse = (message = 'Unauthorized') => {
  return NextResponse.json({
    status: '401',
    message,
    data: {}
  }, { status: 401 });
};

export const validationErrorResponse = (message) => {
  return NextResponse.json({
    status: '99',
    message: message || 'Validation Error',
    data: {}
  }, { status: 400 });
};

export const notFoundResponse = (message = 'Data not found') => {
  return NextResponse.json({
    status: '404',
    message,
    data: {}
  }, { status: 404 });
};

// Handler untuk error dari backend API
export const handleBackendError = (error) => {
  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message;
  const defaultMessage = 'Terjadi kesalahan pada server';

  switch (status) {
    case 400:
      return validationErrorResponse(backendMessage || 'Data tidak valid');
    case 401:
      return unauthorizedResponse(backendMessage || 'Akses tidak diizinkan');
    case 403:
      return NextResponse.json({
        status: '403',
        message: backendMessage || 'Akses ditolak',
        data: {}
      }, { status: 403 });
    case 404:
      return notFoundResponse(backendMessage || 'Data tidak ditemukan');
    case 422:
      return validationErrorResponse(backendMessage || 'Data tidak valid');
    case 500:
      return errorResponse(backendMessage || defaultMessage, 500);
    default:
      return errorResponse(backendMessage || defaultMessage, status || 500);
  }
};

// Wrapper untuk API calls dengan error handling
export const apiCall = async (apiFunction, successMessage = 'Berhasil') => {
  try {
    const response = await apiFunction();
    const data = response.data;
    
    // Jika backend mengirim status dalam response
    if (data.status && data.status !== '00') {
      return errorResponse(data.message || 'Operasi gagal');
    }
    
    return successResponse(data.message || successMessage, data.data || data);
  } catch (error) {
    console.error('API Call Error:', error?.response?.data || error.message);
    return handleBackendError(error);
  }
};

// Middleware untuk validasi authentication
export const withAuthValidation = (handler) => {
  return async (req, ...args) => {
    try {
      const { getUserFromToken } = await import('./auth');
      const { userId, error } = getUserFromToken();
      
      if (error || !userId) {
        return unauthorizedResponse(error || 'Token tidak valid');
      }
      
      // Tambahkan userId ke request
      req.userId = userId;
      
      return handler(req, ...args);
    } catch (error) {
      console.error('Auth validation error:', error);
      return unauthorizedResponse('Authentication failed');
    }
  };
};