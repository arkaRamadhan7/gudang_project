import { NextResponse } from 'next/server';
import axios from 'axios';
import { API_ENDPOINTS } from '@/app/api/api';

export async function POST(request, { params }) {
    try {
        const { id } = await params; 
        const body = await request.json();

        const response = await axios.post(API_ENDPOINTS.ADD_DISKON(id), body);
        return NextResponse.json(response.data, { status: 201 });
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || "Gagal menambah diskon";
        return NextResponse.json({ message }, { status });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const response = await axios.put(API_ENDPOINTS.EDIT_DISKON(id), body);
        return NextResponse.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || "Gagal mengedit diskon";
        return NextResponse.json({ message }, { status });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const response = await axios.delete(API_ENDPOINTS.DELETE_DISKON(id));
        return NextResponse.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || "Gagal menghapus diskon";
        return NextResponse.json({ message }, { status });
    }
}