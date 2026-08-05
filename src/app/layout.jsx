// app/layout.jsx
import { Inter, Roboto_Mono } from "next/font/google"
import "./globals.css"
import PushNotificationClient from "@/components/PushNotificationClient"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
})

export const metadata = {
  title: "Admin Dashboard",
  description: "Mobking Admin Panel",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`
          ${inter.variable} ${robotoMono.variable}
          font-sans antialiased bg-gray-50 text-gray-800
        `}
      >
        {children}
        <PushNotificationClient />
      </body>
    </html>
  )
}
