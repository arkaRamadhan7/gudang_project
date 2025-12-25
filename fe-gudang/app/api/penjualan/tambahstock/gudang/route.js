import axios from "axios";
import {API_ENDPOINTS} from "../../../api";
import {NextResponse} from "next/server";

export async function GET() {
    try {
        const response = await axios.get(API_ENDPOINTS.GET_GUDANG)

        return NextResponse.json({
            status:"00", 
            message:"Berhadil Ambil Data",
            data: response.data.data
        })
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            status: "99",
            message: error
        })
    }
    
}