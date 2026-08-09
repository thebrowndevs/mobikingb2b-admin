import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useOrders } from '@/hooks/useOrders'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import AcceptDialog from './AcceptDialog'

function StatusUpdate({ order, orderId, status, canEdit }) {
    const { updateOrder } = useOrders()
    const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
    const [currentStatus, setCurrentStatus] = useState(status)

    useEffect(() => {
        setCurrentStatus(status)
    }, [status])

    const STATUSES = [
        "New",
        "Accepted",
        "Cancelled",
        "Returned",
        "Rejected",
        "Hold",
        "Shipped",
        "Delivered",
    ]

    const STATUS_VARIANTS = {
        New: 'yellow',           // yellow
        Accepted: 'green',      // green
        Rejected: 'red',      // red
        Shipped: 'yellow',       // yellow/orange
        Delivered: 'green',     // green
        Cancelled: 'red', // red
        Returned: 'red',  // red
        Replaced: 'purple',      // purple/outline
        Hold: 'gray',        // gray or custom secondary
    }
    const variant = STATUS_VARIANTS[order.status] || 'default'

    function isDisabled(status) {
        if (order.status != "New")
            return true;
        else if (status != "Accepted")
            return true;

        return false;
    }

    async function handleUpdateStatus(value) {
        const toastId = toast.loading('Updating Status...')
        const data = {
            status: value,
            reason: ""
        }
        try {
            await updateOrder.mutateAsync({
                id: orderId,
                data: data
            })
            toast.dismiss(toastId);
        } catch (error) {
            toast.error('Error in updating status', { id: toastId })
            setCurrentStatus(order.status)
        }
    }

    const onValueChange = (value) => {
        if (value === "Accepted") {
            setAcceptDialogOpen(true)
        } else {
            setCurrentStatus(value)
            handleUpdateStatus(value)
        }
    }

    return (
        <div>
            <Select value={currentStatus} onValueChange={onValueChange}>
                <SelectTrigger className={`max-h-6 text-xs p-1 bg-${variant}-100`}>
                    <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                    {STATUSES.map((item, idx) => (
                        <SelectItem
                            key={idx}
                            value={item}
                            disabled={isDisabled(item) || !canEdit}
                        >
                            {item}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <AcceptDialog 
                open={acceptDialogOpen}
                onOpenChange={(open) => {
                    setAcceptDialogOpen(open)
                    if (!open) setCurrentStatus(order.status)
                }}
                order={order}
            />
        </div>
    )
}

export default StatusUpdate
