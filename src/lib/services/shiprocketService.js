import axios from "axios";

export const getServiceability = async (params, token) => {
    console.log("Params for serviceability: ", params);
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/shiprocket/serviceability`,
            {
                params,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                // withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching serviceability:", error);
        throw error;
    }
};
