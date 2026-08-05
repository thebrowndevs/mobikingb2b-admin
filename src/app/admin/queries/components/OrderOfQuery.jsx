import React from 'react'
import UpperDetailss from './QueryOrder/UpperDetailss'
import PaymentDetails from './QueryOrder/PaymentDetails'
import PersonalDetails from './QueryOrder/PersonalDetails'
import ItemsTable from './QueryOrder/ItemsTable'
import ShippingDetails from './QueryOrder/ShippingDetails'
import OrderTimeline from '@/components/OrderTimeline'

function OrderOfQuery({ order }) {
    if (!order) return null
    return (
        <div className='space-y-3'>
            {/* Upper Details */}
            <UpperDetailss order={order} />
            <OrderTimeline order={order} />
            <PaymentDetails order={order} />
            <PersonalDetails order={order} />
            <ItemsTable order={order} />
            {order?.shipmentId &&
                <ShippingDetails order={order} />
            }
        </div>
    )
}

export default OrderOfQuery
