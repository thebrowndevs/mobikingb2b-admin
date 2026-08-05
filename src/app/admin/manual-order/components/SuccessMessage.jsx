import LoaderButton from '@/components/custom/LoaderButton';
import { Button } from '@/components/ui/button'
import { useOrders } from '@/hooks/useOrders'
import React, { useState } from 'react'

function SuccessMessage({ order, resetOrder, reset, linkSent, setLinkSent }) {
    const [linkData, setLinkData] = useState(null)
    const [selectedGateway, setSelectedGateway] = useState('razorpay')
    const { sendPaymentLink } = useOrders();

    // console.log(order)

    const handleSendLink = async () => {
        setLinkSent(false)
        const data = {
            orderId: order?.order?._id,
            name: order?.order?.name,
            email: order?.user?.email,
            phoneNo: order?.order?.phoneNo,
            amount: order?.order?.orderAmount,
            gateway: selectedGateway
        }
        try {
            const res = await sendPaymentLink.mutateAsync({ data })
            // console.log(res)
            setLinkData(res?.data?.data)
            setLinkSent(true)
        } catch (error) {
            setLinkSent(false)
        }
    }
    return (
        <div className='bg-green-50 p-5 rounded-xl border border-green-600 w-full flex flex-col gap-3 sm:flex-row justify-between items-center'>
            <div>
                <h2 className='flex-1 text-green-600 font-bold'>Order Placed Successfully</h2>
                {linkSent &&
                    <p className='text-gray-700 text-sm bg-blue-50 border border-blue-600 px-2 py-1 rounded-sm mt-3'>Payment Link sent successfully: <span className='text-blue-700'><a href={linkData?.payment_link} target='_blank'>{linkData?.payment_link}</a></span></p>
                }
            </div>
            <div className='w-fit sm:w-1/2 flex flex-col items-end justify-end h-full gap-3'>
                {order?.order?.method === 'Online' && !linkSent &&
                    <div className="flex gap-2 items-center">
                        <select
                            value={selectedGateway}
                            onChange={(e) => setSelectedGateway(e.target.value)}
                            className="border border-gray-300 rounded px-2.5 py-1.5 text-sm bg-white"
                        >
                            <option value="razorpay">Razorpay</option>
                            <option value="phonepe">PhonePe</option>
                        </select>
                        <LoaderButton
                            onClick={handleSendLink}
                            loading={sendPaymentLink.isPending}
                        >
                            Send Payment Link
                        </LoaderButton>
                    </div>
                }
            </div>
        </div>
    )
}

export default SuccessMessage