import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
const users = [
    {id: 1, email: "bagus@gmail.com", password:"admin123", role: 'admin'},
    {id: 2, email: "bagong@gmail.com", password:"admin123", role: 'superadmin'}
]

export async function POST(req) {
    try {
        const {email, password} = await req.json();
        const user = users.find(u => u.email === email);
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Email Tidak Ditemukan",

            }, {status: 401})

        }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return NextResponse.json({
                    success: false,
                    message: "Password Salah",

                }, {status: 401})         
             }
             return NextResponse.json({
                success: true,
                message: "Login Berhasil",
                user: {id: user.id, email: user.email, role: user.role}
             })
     } catch (err) {
        return NextResponse.json({
            success: false,
            message: err.message
        }, {status: 500})
     }

}