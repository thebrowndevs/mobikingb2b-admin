"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import LoaderButton from "@/components/custom/LoaderButton";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [companyDetails, setCompanyDetails] = useState({
        phoneNo: "",
        whatsappNo: "",
        email: "",
        address: "",
        instaLink: "",
        facebookLink: "",
        twitterLink: "",
        websiteLink: "",
        androidAppLink: "",
        iosAppLink: "",
        logoImage: "",
        paymentGatewaySettings: {
            enableRazorpay: true,
            enablePhonepe: true
        }
    });

    useEffect(() => {
        fetchDetails();
    }, []);

    async function fetchDetails() {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(
                (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1") + "/policy/company-details",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (res.ok) {
                const data = await res.json();
                if (data?.success && data?.data) {
                    setCompanyDetails(prev => ({
                        ...prev,
                        ...data.data,
                        paymentGatewaySettings: {
                            enableRazorpay: data.data.paymentGatewaySettings?.enableRazorpay !== false,
                            enablePhonepe: data.data.paymentGatewaySettings?.enablePhonepe !== false
                        }
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch company details:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(
                (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1") + "/policy/company-details",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(companyDetails)
                }
            );

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    toast.success("Settings saved successfully!");
                    setCompanyDetails(prev => ({
                        ...prev,
                        ...data.data
                    }));
                } else {
                    toast.error(data.message || "Failed to save settings");
                }
            } else {
                toast.error("HTTP error saving details");
            }
        } catch (error) {
            console.error("Error saving details:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <span className="text-gray-500 font-medium">Loading details...</span>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Company & Gateway Configuration</h1>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Gateway Settings Section */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                        Payment Gateway Toggles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex items-center space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                checked={companyDetails.paymentGatewaySettings.enableRazorpay}
                                onChange={(e) => setCompanyDetails(prev => ({
                                    ...prev,
                                    paymentGatewaySettings: {
                                        ...prev.paymentGatewaySettings,
                                        enableRazorpay: e.target.checked
                                    }
                                }))}
                            />
                            <div>
                                <span className="font-medium text-gray-800 block">Enable Razorpay</span>
                                <span className="text-sm text-gray-500">Allow customers to check out via Razorpay API overlays</span>
                            </div>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                checked={companyDetails.paymentGatewaySettings.enablePhonepe}
                                onChange={(e) => setCompanyDetails(prev => ({
                                    ...prev,
                                    paymentGatewaySettings: {
                                        ...prev.paymentGatewaySettings,
                                        enablePhonepe: e.target.checked
                                    }
                                }))}
                            />
                            <div>
                                <span className="font-medium text-gray-800 block">Enable PhonePe</span>
                                <span className="text-sm text-gray-500">Enable direct browser-based payment redirection using PhonePe PG</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Company Contact Details Section */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-2">
                        Contact Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={companyDetails.phoneNo || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, phoneNo: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={companyDetails.whatsappNo || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, whatsappNo: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={companyDetails.email || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={companyDetails.websiteLink || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, websiteLink: e.target.value }))}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
                            <textarea
                                rows={2}
                                className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={companyDetails.address || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, address: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Social & App Links */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-2">
                        Social Networks & App Links
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Link</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={companyDetails.instaLink || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, instaLink: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Link</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={companyDetails.facebookLink || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, facebookLink: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Android App Link</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={companyDetails.androidAppLink || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, androidAppLink: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">iOS App Link</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={companyDetails.iosAppLink || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, iosAppLink: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <LoaderButton
                        type="submit"
                        className="bg-blue-600 text-white font-medium hover:bg-blue-700 px-6 py-2.5 rounded-lg shadow-sm"
                        isLoading={saving}
                    >
                        Save Configuration
                    </LoaderButton>
                </div>
            </form>
        </div>
    );
}
