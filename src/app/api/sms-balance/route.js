// app/api/sms-balance/route.js

import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET() {
    try {
        const apiKey = process.env.MYSMS_API_KEY
        const clientId = process.env.MYSMS_CLIENT_ID

        const response = await axios.get('https://api.mylogin.co.in/api/v2/Balance', {
            params: {
                ApiKey: apiKey,
                ClientId: clientId,
            },
        })

        return NextResponse.json(response.data)
    } catch (error) {
        console.error('Error fetching SMS balance:', error)
        return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
    }
}
