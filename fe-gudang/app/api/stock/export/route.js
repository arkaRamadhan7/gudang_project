import { NextResponse } from "next/server";
import axios from "axios";
import {API_ENDPOINTS} from '../../api'

export async function GET() {
  try {
    const response = await axios.get(API_ENDPOINTS.EXPORT_STOCK, {
      responseType: "arraybuffer", 
    });

    return new NextResponse(response.data, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=laporan_stock.xlsx",
      },
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Gagal mengambil file dari backend" }, { status: 500 });
  }
}