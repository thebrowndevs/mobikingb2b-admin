import React from "react";
import { format, addSeconds, addDays } from "date-fns";
import {
    Truck, Package, Calendar, DollarSign, CheckCircle, Phone, Clock, RefreshCw,
    Star, Weight, CreditCard, Info
} from "lucide-react";

const CourierCard = ({ courier, selectedCourier, setSelectedCourier }) => {
    const {
        courier_name,
        min_weight,
        rate,
        freight_charge,
        cod,
        cod_charges,
        rto_charges,
        call_before_delivery,
        delivery_boy_contact,
        realtime_tracking,
        seconds_left_for_pickup,
        estimated_delivery_days,
        pickup_performance,
        delivery_performance,
        rating,
        courier_company_id,
    } = courier;


    // Compute expected pickup & delivery
    const pickupETA = addSeconds(new Date(), seconds_left_for_pickup);
    const deliveryETA = addDays(pickupETA, parseInt(estimated_delivery_days, 10) || 0);

    // Calculate star rating
    const renderStars = (rating) => {
        return (
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-3 w-3 ${i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="mb-4">
            <div className={`bg-white rounded-lg border-2 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row ${selectedCourier === courier_company_id ? "border-blue-700 ": "border-gray-200 "}`}>

                {/* Left: Courier Info & Metrics */}
                <div className="flex-1 p-4 space-y-4">
                    {/* Top row: Name & Tags */}
                    <div className="flex items-center justify-between">
                        <div>
                        <h3 className="font-semibold text-gray-800">{courier_name}</h3>
<p className="text-gray-500 text-xs">Company Id: {courier_company_id}</p>
                        </div>

                        <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center">
                            <Weight className="h-3 w-3 mr-1" />
                            Min Weight: {min_weight} kg
                        </div>
                    </div>

                    {/* Rating & Performance */}
                    <div className="flex items-center gap-2 text-xs">
                        {renderStars(rating)}
                        <span className="font-medium text-gray-700">{rating.toFixed(1)}</span>
                        <span className="text-gray-400">|</span>
                        <div className="flex items-center text-green-700">
                            <Package className="h-3 w-3 mr-1" />
                            {delivery_performance.toFixed(1)}
                        </div>
                        <span className="text-gray-400">|</span>
                        <div className="flex items-center text-blue-700">
                            <Truck className="h-3 w-3 mr-1" />
                            {pickup_performance.toFixed(1)}
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mt-1">
                        {cod === 1 && (
                            <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded flex items-center">
                                <CreditCard className="h-3 w-3 mr-1" /> COD
                            </span>
                        )}
                        {realtime_tracking && (
                            <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded flex items-center">
                                <RefreshCw className="h-3 w-3 mr-1" /> Tracking
                            </span>
                        )}
                        {call_before_delivery && (
                            <span className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded flex items-center">
                                <Phone className="h-3 w-3 mr-1" /> Call
                            </span>
                        )}
                    </div>

                    {/* Pickup/Delivery Dates */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 text-blue-500 mr-2" />
                            <div>
                                <div className="text-gray-600">Pickup by</div>
                                <div className="font-medium">{format(pickupETA, "MMM d, h:mm a")}</div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-green-500 mr-2" />
                            <div>
                                <div className="text-gray-600">Delivery by</div>
                                <div className="font-medium">
                                    {format(deliveryETA, "MMM d")}
                                    <span className="text-gray-500 ml-1">({estimated_delivery_days} days)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Pricing */}
                <div className="bg-gray-50 border-l p-4 w-full md:w-64 flex flex-col justify-between">
                    <div className="space-y-2">
                        {/* Highlighted Charge */}
                        <div className="bg-blue-100 text-blue-900 p-3 rounded-lg text-center">
                            <p className="text-xs font-medium">Parcel Charge</p>
                            <p className="text-xl font-bold">₹{freight_charge.toFixed(2)}</p>
                            <p className="text-[10px] text-gray-500">(Excl. COD & RTO)</p>
                        </div>

                        {/* Breakdown */}
                        <div className="text-sm space-y-1 mt-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Freight</span>
                                <span>₹{freight_charge.toFixed(2)}</span>
                            </div>
                            {cod === 1 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">COD Charges</span>
                                    <span>+ ₹{cod_charges.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">RTO Charges</span>
                                <span>+ ₹{rto_charges.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Delivery Boy Contact + Button */}
                    <div className="mt-4 text-xs text-gray-500 flex justify-between items-center">
                        <span>Contact: {delivery_boy_contact || 'Not provided'}</span>
                        <button
                        onClick={()=> setSelectedCourier(courier_company_id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded">
                            Select
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default CourierCard;