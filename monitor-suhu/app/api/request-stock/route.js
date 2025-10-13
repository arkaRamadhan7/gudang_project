import axios from "axios";
import {API_ENDPOINTS} from "../api";
import {NextResponse} from "next/server";

export async function GET() {
    try {
        const response = await axios.get(API_ENDPOINTS.REQUEST_STOCK_SIDE_GUDANG)

        return NextResponse.json({
            status: "00",
            message: "Berhasil ambil Data",
            data: response.data.data
        })
    } catch (error) {
        console.log("ERROR Terjadi Kesalahan Pada Pengambilan Data",error.message)
        return NextResponse.json({
            status: "99",
            message: "Gagal Ambil Data",
            error: error.message
        })
    }
} 