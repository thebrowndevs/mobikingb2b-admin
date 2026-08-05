import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useShiprocketAuth = create(
    persist(
        (set) => ({
            token: null,
            loginResponse: null,
            setToken: (token) => set({ token }),
            setLoginResponse: (data) => set({ loginResponse: data }),
            logout: () => set({ token: null, loginResponse: null }),
        }),
        {
            name: 'shiprocket-auth-storage', // localStorage key
        }
    )
)

export default useShiprocketAuth
