import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useOrders } from '@/hooks/useOrders'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import AcceptDialog from '../../components/AcceptDialog'
import HoldDialog from '../../components/HoldOrder'

function UpdateStatus({ order, orderId, status }) {
    const { updateOrder } = useOrders()
    const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
    const [holdDialogOpen, setHoldDialogOpen] = useState(false)
    const [currentStatus, setCurrentStatus] = useState(status)

    useEffect(() => {
        setCurrentStatus(status)
    }, [status])

    const STATUSES = [
        "New",
        "Accepted",
        "Hold"
    ]

    function isDisabled(status) {
        if (order.status != "New")
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
            toast.success('Status updated', { id: toastId })
        } catch (error) {
            toast.error('Error in updating status', { id: toastId })
            setCurrentStatus(order.status)
        }
    }

    const onValueChange = (value) => {
        if (value === "Accepted") {
            setAcceptDialogOpen(true)
        } else if (value === "Hold") {
            setHoldDialogOpen(true)
        } else {
            setCurrentStatus(value)
            handleUpdateStatus(value)
        }
    }

    return (
        <div>
            <Select value={currentStatus} onValueChange={onValueChange}>
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

            <AcceptDialog 
                open={acceptDialogOpen}
                onOpenChange={(open) => {
                    setAcceptDialogOpen(open)
                    if (!open) setCurrentStatus(order.status)
                }}
                order={order}
            />

            <HoldDialog 
                open={holdDialogOpen}
                onOpenChange={(open) => {
                    setHoldDialogOpen(open)
                    if (!open) setCurrentStatus(order.status)
                }}
                order={order}
            />
        </div>
    )
}

export default UpdateStatus
