import { API_ENDPOINTS } from '@/app/api/api';
import { Axios } from '@/utils/axios';
import { NextResponse } from 'next/server';

export const POST = async (request) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const externalFormData = new FormData();
        externalFormData.append('file', new Blob([buffer], { type: file.type }), file.name);

        const response = await Axios.post(API_ENDPOINTS.IMPORTEXCEL, externalFormData, {
            headers: { 'Content-Type': 'multipart/form-data' } // ✅ fixed typo
        });

        return NextResponse.json({ data: response.data });
    } catch (err) {
        return NextResponse.json({ message: 'Failed to post data' }, { status: 500 });
    }
};
