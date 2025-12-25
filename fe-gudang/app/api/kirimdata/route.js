import { API_ENDPOINTS } from "../api";
import { NextResponse } from "next/server";
import axios from 'axios';
import { ReactJsxRuntime } from "next/dist/server/route-modules/app-page/vendored/rsc/entrypoints";
import { status } from "../../../../be-express-monitor-suhu/src/utils/general";

export async function GET() {
    try {
        const response = await axios.get(API_ENDPOINTS.GET);
        return Response.json(response.data);
    } catch (error) {
        console.error('Error Gagal Mengambil Data');
        return Response.json({status: "99", messsage: 'Error Gagal Mengambil data'},{ status: 500})
    }
    
}