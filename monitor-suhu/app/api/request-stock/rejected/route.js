import axios from "axios";
import {API_ENDPOINTS} from "../../api";
import {NextResponse} from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const response = await axios.post(API_ENDPOINTS.REJECTED, body)

        return NextResponse.json(response.data)
    } catch (error){
        console.error("ERROR terjadi Kesalahan saat menolak request", error.message)
        return NextResponse.json({
            status: "99",
            message: "Terjadi Kesalahan pada saat mengirimkan data",
            error: error.message
        })
    }

}