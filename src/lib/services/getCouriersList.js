import axios from "axios"

export const getCouriersList = ({ token, data }) => {
    // console.log("token: ",token);
    return axios.get(
        'https://apiv2.shiprocket.in/v1/external/courier/serviceability/',
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            params: data,
            cache: 'no-store'
        }
    )
}
