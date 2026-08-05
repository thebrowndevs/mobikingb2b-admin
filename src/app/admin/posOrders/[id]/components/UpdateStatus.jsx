import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useOrders } from '@/hooks/useOrders'
import React from 'react'
import toast from 'react-hot-toast'

function UpdateStatus({ order, orderId, status }) {
    const { updateOrder } = useOrders()

    const STATUSES = [
        "New",
        "Accepted",
        "Hold"
        // "Shipped",
        // "Delivered",
    ]

    function isDisabled(status) {
        if (order.status != "New")
            return true;
        // else if (status != "Accepted")
        //     return true;

        return false;
    }

    async function handleUpdateStatus(value) {
        const toastId = toast.loading('Updating Status...')
        const data = {
            status: value
        }
        try {
            const res = await updateOrder.mutateAsync({
                id: orderId,
                data: data
            })
            console.log(res)
            toast.success('Status updated', { id: toastId })
        } catch (error) {
            toast.error('Error in updating status', { id: toastId })

        }
    }

    return (
        <div>
            <Select defaultValue={status} onValueChange={(e) => handleUpdateStatus(e)}>
                <SelectTrigger>
                    <SelectValue placeholder="Update Status Manually" />
                </SelectTrigger>
                <SelectContent>
                    {STATUSES.map((item, idx) => (
                        <SelectItem
                            key={idx}
                            value={item}
                            disabled={isDisabled(item)}
                        >
                            {item}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

export default UpdateStatus
