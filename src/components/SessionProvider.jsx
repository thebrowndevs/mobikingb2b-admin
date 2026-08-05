import React from 'react'
import { cookies } from 'next/headers';

async function SessionProvider({ children }) {
    const accessToken = await cookies().get("accessToken")?.value;

    if (!accessToken) {
        redirect("/");
    }

    return (
        <div>{children}</div>
    )
}

export default SessionProvider