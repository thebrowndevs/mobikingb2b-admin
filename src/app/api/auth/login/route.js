// File:  app/api/auth/login/route.js

import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { email, password, role } = await request.json();
        if (!email || !password || !role) {
            return NextResponse.json(
                { success: false, message: "Missing fields" },
                { status: 400 }
            );
        }

        // 1) Forward login to your Express backend (no cookie logic here):
        const backendRes = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/login`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role }),
            }
        );

        // 2) Read the full JSON from backend (statusCode, data: {user, accessToken, refreshToken}, message, success)
        const parsed = await backendRes.json();

        // 3) If backend returned an error (non-200), forward that status + JSON as-is:
        if (!backendRes.ok) {
            return NextResponse.json(parsed, { status: backendRes.status });
        }

        // 4) Otherwise, backendRes.ok is true → return the entire parsed object exactly:
        return NextResponse.json(parsed, { status: 200 });
    } catch (err) {
        console.error("API /api/auth/login error:", err);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
