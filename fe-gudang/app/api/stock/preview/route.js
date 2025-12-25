import axios from 'axios';
import { API_ENDPOINTS } from '../../api';

export async function GET() {
    try { 
        const res = await axios.get(API_ENDPOINTS.PREVIEW_STOCK);

        return Response.json(res.data);
    } catch (err) {
        console.error('error API preview: ', err.message);
        return Response.json(
            {status: '99', message: 'gagal preview stock'},
            {status: 500 } 
        );
    }
}