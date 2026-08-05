import axios from 'axios'
import useShiprocketAuth from '@/store/useShiprocketAuth' // adjust path as needed

const loginDetails = {
    email: "mobiking150725@gmail.com",
    password: "tBA8C8VPA$gRKo5%",
}

// const loginDetails = {
//     email: `${process.env.NEXT_PUBLIC_SHIPROCKET_EMAIL}`,
//     password: `${process.env.NEXT_PUBLIC_SHIPROCKET_PASSWORD}`,
// }

export const shiprocketLogin = async () => {
    try {
        // console.log(loginDetails)
        const response = await axios.post(
            'https://apiv2.shiprocket.in/v1/external/auth/login',
            loginDetails
        )

        const data = response?.data || {}

        const { setToken, setLoginResponse } = useShiprocketAuth.getState()
        setToken(data.token)
        setLoginResponse(data)

        return data
    } catch (error) {
        console.error('Shiprocket login failed:', error)
        return null
    }
}
