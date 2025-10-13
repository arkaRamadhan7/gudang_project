// File: route.js Anda
import axios from "axios";
import { API_ENDPOINTS } from "../../../api";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const response = await axios.post(API_ENDPOINTS.REQUEST_STOCK, body);
        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        console.error("Error di API Route:", error.response?.data || error.message);
        
        const errorStatus = error.response?.status || 500;
        const errorData = error.response?.data || { message: "Terjadi kesalahan internal pada server." };

        return NextResponse.json(errorData, { status: errorStatus });
    }
}