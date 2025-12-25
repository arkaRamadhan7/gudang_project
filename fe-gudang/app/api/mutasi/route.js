import { API_ENDPOINTS } from "../api";
import axios from 'axios';

export async function GET() {
    try {
        const response = await axios.get(API_ENDPOINTS.GET_ALL_MUTASI);
        return Response.json(response.data);
    } catch (error) {
        console.error('Error Gagal Mengambil Data');
        return Response.json({status: "99", messsage: 'Error Gagal Mengambil data'},{ status: 500})
    }
    
}