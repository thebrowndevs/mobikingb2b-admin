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
                    setCompanyDetails({
                        phoneNo: data.data.phoneNo || "",
                        whatsappNo: data.data.whatsappNo || "",
                        email: data.data.email || "",
                        address: data.data.address || "",
                        instaLink: data.data.instaLink || "",
                        facebookLink: data.data.facebookLink || "",
                        twitterLink: data.data.twitterLink || "",
                        websiteLink: data.data.websiteLink || "",
                        androidAppLink: data.data.androidAppLink || "",
                        iosAppLink: data.data.iosAppLink || "",
                        logoImage: data.data.logoImage || "",
                    });
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
                    if (data.data) {
                        setCompanyDetails(prev => ({
                            ...prev,
                            ...data.data
                        }));
                    }
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
            <div className="flex h-full items-center justify-center p-6 bg-back1">
                <span className="text-slate-500 font-medium animate-pulse">Loading settings details...</span>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Settings</h1>
                    <p className="text-sm text-slate-500">Configure company info and application platform links</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Company Contact Details Section */}
                <div className="bg-back2 p-6 rounded-xl  border border-bdr2 space-y-5">
                    <div className="border-b border-bdr2 pb-3">
                        <h2 className="text-lg font-bold text-slate-800">
                            Contact Details
                        </h2>
                        <p className="text-xs text-slate-400">Specify general contact parameters for support channels</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Phone Number</label>
                            <input
                                type="text"
                                className="w-full bg-back1 border border-bdr2 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                                value={companyDetails.phoneNo || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, phoneNo: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">WhatsApp Number</label>
                            <input
                                type="text"
                                className="w-full bg-back1 border border-bdr2 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                                value={companyDetails.whatsappNo || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, whatsappNo: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Email Address</label>
                            <input
                                type="email"
                                className="w-full bg-back1 border border-bdr2 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                                value={companyDetails.email || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Website URL</label>
                            <input
                                type="text"
                                className="w-full bg-back1 border border-bdr2 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                                value={companyDetails.websiteLink || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, websiteLink: e.target.value }))}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Office Address</label>
                            <textarea
                                rows={3}
                                className="w-full bg-back1 border border-bdr2 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 resize-none"
                                value={companyDetails.address || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, address: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Social & App Links */}
                <div className="bg-back2 p-6 rounded-xl  border border-bdr2 space-y-5">
                    <div className="border-b border-bdr2 pb-3">
                        <h2 className="text-lg font-bold text-slate-800">
                            Social Networks & App Links
                        </h2>
                        <p className="text-xs text-slate-400">Configure public listings and official storefront app downloads</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Instagram Link</label>
                            <input
                                type="text"
                                className="w-full bg-back1 border border-bdr2 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                                value={companyDetails.instaLink || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, instaLink: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Facebook Link</label>
                            <input
                                type="text"
                                className="w-full bg-back1 border border-bdr2 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                                value={companyDetails.facebookLink || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, facebookLink: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Android App Link</label>
                            <input
                                type="text"
                                className="w-full bg-back1 border border-bdr2 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                                value={companyDetails.androidAppLink || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, androidAppLink: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">iOS App Link</label>
                            <input
                                type="text"
                                className="w-full bg-back1 border border-bdr2 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                                value={companyDetails.iosAppLink || ""}
                                onChange={(e) => setCompanyDetails(prev => ({ ...prev, iosAppLink: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                    <LoaderButton
                        type="submit"
                        className="bg-primary-btn text-primary-btn-text font-semibold hover:bg-primary-btn-hover px-6 py-2.5 rounded-lg shadow-none transition-all duration-200"
                        isLoading={saving}
                    >
                        Save Configuration
                    </LoaderButton>
                </div>
            </form>
        </div>
    );
}
