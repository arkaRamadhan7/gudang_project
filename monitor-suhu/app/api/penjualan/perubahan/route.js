import axios from "axios";
import { API_ENDPOINTS } from "../../api";
import { NextResponse } from "next/server"


export async function PUT(req) {
    try {
        const body = await req.json();
        const response = await axios.put(API_ENDPOINTS.PERUBAHAN_HARGA_DAN_DISKON, body);

        return NextResponse.json(response.data);
    } catch (error) {
        console.error("Gagal Menambahkan Diskon atau Harga", error)
        return NextResponse.json({
            status:"99",
            message:"Gagal menambahkan diskon atau harga",
            error: error
        })
    }
}