import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function UserDialog({ open, onOpenChange, selectedUser, onCreate, onUpdate, isSubmitting, error, changePassword, canEdit, onlyAdmin }) {
    const { register, handleSubmit, reset, formState: { errors }, watch, setValue, setError, clearErrors } = useForm();
    const [gstVerifying, setGstVerifying] = useState(false);

    const { createCustomer } = useUsers();

    const gst = watch("business.gstNumber");
    const isGstVerified = watch("business.gstVerified");

    // Auto-verify GST on 15 digits
    useEffect(() => {
        const verifyGstInput = async () => {
            if (gst?.length === 15) {
                setGstVerifying(true);
                try {
                    const res = await api.post("/onboarding/gst/verify", { gstin: gst });
                    const data = res?.data?.data;
                    if (data) {
                        setValue('business.gstVerified', true);
                        setValue('business.businessName', data.tradeName || data.legalName || "");

                        const addr = data.principalAddress || {};
                        setValue('business.regsiteredAddress.street', addr.street || "");
                        setValue('business.regsiteredAddress.street2', addr.street2 || "");
                        setValue('business.regsiteredAddress.city', addr.city || "");
                        setValue('business.regsiteredAddress.state', addr.state || "");
                        setValue('business.regsiteredAddress.pinCode', addr.pinCode || "");
                        setValue('business.regsiteredAddress.country', addr.country || "India");
                        setValue('business.gstData', data.rawSnapshot || data);
                        setValue('business.isApproved', true); // auto-approve verified GST B2B registrations

                        clearErrors('business.gstNumber');
                        toast.success("GSTIN verified successfully!");
                    }
                } catch (err) {
                    const errMsg = err?.response?.data?.message || "GSTIN verification failed.";
                    setValue('business.gstVerified', false);
                    setError('business.gstNumber', { type: 'manual', message: errMsg });
                    toast.error(errMsg);
                } finally {
                    setGstVerifying(false);
                }
            } else if (gst && gst.length > 0 && gst.length !== 15) {
                setValue('business.gstVerified', false);
            }
        }
        verifyGstInput();
    }, [gst, setValue, setError, clearErrors]);

    useEffect(() => {
        if (open) {
            if (selectedUser) {
                reset({
                    name: selectedUser.name || "",
                    email: selectedUser.email || "",
                    phoneNo: selectedUser.phoneNo || "",
                    role: selectedUser.role || "user",
                    business: {
                        businessName: selectedUser.business?.businessName || "",
                        businessPhone: selectedUser.business?.businessPhone || "",
                        businessEmail: selectedUser.business?.businessEmail || "",
                        gstNumber: selectedUser.business?.gstNumber || "",
                        gstVerified: selectedUser.business?.gstVerified ?? false,
                        isApproved: selectedUser.business?.isApproved ?? false,
                        gstData: selectedUser.business?.gstData || null,
                        regsiteredAddress: {
                            street: selectedUser.business?.regsiteredAddress?.street || "",
                            street2: selectedUser.business?.regsiteredAddress?.street2 || "",
                            city: selectedUser.business?.regsiteredAddress?.city || "",
                            state: selectedUser.business?.regsiteredAddress?.state || "",
                            pinCode: selectedUser.business?.regsiteredAddress?.pinCode || "",
                            country: selectedUser.business?.regsiteredAddress?.country || "India",
                        }
                    }
                });
            } else {
                reset({
                    name: "",
                    email: "",
                    phoneNo: "",
                    role: "user",
                    business: {
                        businessName: "",
                        businessPhone: "",
                        businessEmail: "",
                        gstNumber: "",
                        gstVerified: false,
                        isApproved: false,
                        gstData: null,
                        regsiteredAddress: {
                            street: "",
                            street2: "",
                            city: "",
                            state: "",
                            pinCode: "",
                            country: "India",
                        }
                    }
                });
            }
        }
    }, [open, selectedUser, reset]);

    const onSubmit = async (data) => {
        const gstNum = data.business?.gstNumber?.trim();
        const gstOk = data.business?.gstVerified;
        if (gstNum && gstNum.length > 0 && !gstOk) {
            toast.error("Please enter a verified GSTIN or clear the field.");
            return;
        }

        try {
            const fd = { ...data };
            if (selectedUser?._id) {
                await onUpdate({ id: selectedUser._id, data: fd });
            } else {
                await createCustomer.mutateAsync(fd);
            }
            onOpenChange(false);
        } catch (error) { }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto bg-back1 border-bdr2 text-slate-800">
                <DialogHeader>
                    <DialogTitle className="text-slate-800 font-bold">{selectedUser ? "Update User Details" : "Add New User"}</DialogTitle>
                    <DialogDescription className="text-slate-455">
                        Create or update users and business registrations.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4 text-xs">
                        {/* Name */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right font-bold text-slate-700">
                                Name<span className="text-red-500"> *</span>
                            </Label>
                            <div className="col-span-3">
                                <Input
                                    id="name"
                                    {...register("name", { required: "Name is required" })}
                                    className={clsx("bg-back2 border-bdr2", { "border-red-500": errors.name })}
                                    placeholder="John Doe"
                                />
                                {errors.name && (
                                    <p className="text-[10px] text-red-500 mt-0.5">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right font-bold text-slate-700">
                                Phone Number<span className="text-red-500"> *</span>
                            </Label>
                            <div className="col-span-3">
                                <Input
                                    id="phoneNo"
                                    type="tel"
                                    {...register("phoneNo", {
                                        required: "Phone number is required",
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: "Phone number must be exactly 10 digits"
                                        }
                                    })}
                                    className={clsx("bg-back2 border-bdr2", { "border-red-500": errors.phoneNo })}
                                    placeholder="9876543210"
                                />
                                {errors.phoneNo && (
                                    <p className="text-[10px] text-red-500 mt-0.5">
                                        {errors.phoneNo.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right font-bold text-slate-700">
                                Email
                            </Label>
                            <div className="col-span-3">
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email", {
                                        pattern: {
                                            value: /^\S+@\S+\.\S+$/,
                                            message: "Invalid email format"
                                        }
                                    })}
                                    className={clsx("bg-back2 border-bdr2", { "border-red-500": errors.email })}
                                    placeholder="john@example.com"
                                />
                                {errors.email && (
                                    <p className="text-[10px] text-red-500 mt-0.5">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Business Details Heading */}
                        <div className="border-t border-bdr2 pt-4 mt-2">
                            <h4 className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider mb-3">Business Registration (Optional)</h4>
                        </div>

                        {/* Business Name */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="businessName" className="text-right font-bold text-slate-700">
                                Business Name
                            </Label>
                            <div className="col-span-3">
                                <Input
                                    id="businessName"
                                    {...register("business.businessName")}
                                    className="bg-back2 border-bdr2"
                                    placeholder="Acme Wholesalers"
                                />
                            </div>
                        </div>

                        {/* Business Contact */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="businessPhone" className="text-right font-bold text-slate-700">
                                Business Phone
                            </Label>
                            <div className="col-span-3 grid grid-cols-2 gap-2">
                                <Input
                                    id="businessPhone"
                                    {...register("business.businessPhone")}
                                    className="bg-back2 border-bdr2"
                                    placeholder="Phone"
                                />
                                <Input
                                    id="businessEmail"
                                    type="email"
                                    {...register("business.businessEmail")}
                                    className="bg-back2 border-bdr2"
                                    placeholder="Email"
                                />
                            </div>
                        </div>

                        {/* GST Details */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="gstNumber" className="text-right font-bold text-slate-700">
                                GSTIN & Verified
                            </Label>
                            <div className="col-span-3 flex gap-4 items-center">
                                <div className="relative flex-1">
                                    <Input
                                        id="gstNumber"
                                        {...register("business.gstNumber")}
                                        className={clsx("bg-back2 border-bdr2 font-mono uppercase pr-8", { "border-red-500": errors?.business?.gstNumber })}
                                        placeholder="22AAAAA0000A1Z5"
                                    />
                                    {gstVerifying && (
                                        <div className="absolute right-2.5 top-2.5">
                                            <Loader2 className="h-4 w-4 animate-spin text-indigo-650" />
                                        </div>
                                    )}
                                </div>
                                <span className={clsx("text-xs font-bold px-2 py-1 rounded border",
                                    isGstVerified
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-slate-100 text-slate-400 border-slate-200"
                                )}>
                                    {isGstVerified ? "✓ Verified" : "Not Verified"}
                                </span>
                                <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        {...register("business.isApproved")}
                                        className="rounded border-bdr2 text-indigo-600 focus:ring-indigo-500/20"
                                    />
                                    Approved
                                </label>
                            </div>
                            {errors?.business?.gstNumber && (
                                <div className="col-span-3 col-start-2">
                                    <p className="text-[10px] text-red-500">
                                        {errors.business.gstNumber.message}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Registered GST Address */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right mt-2 font-bold text-slate-700">
                                GST Address
                            </Label>
                            <div className="col-span-3 grid grid-cols-2 gap-2">
                                <Input
                                    {...register("business.regsiteredAddress.street")}
                                    className="bg-back2 border-bdr2 col-span-2"
                                    placeholder="Street Line 1"
                                />
                                <Input
                                    {...register("business.regsiteredAddress.street2")}
                                    className="bg-back2 border-bdr2 col-span-2"
                                    placeholder="Street Line 2 (Optional)"
                                />
                                <Input
                                    {...register("business.regsiteredAddress.city")}
                                    className="bg-back2 border-bdr2"
                                    placeholder="City"
                                />
                                <Input
                                    {...register("business.regsiteredAddress.state")}
                                    className="bg-back2 border-bdr2"
                                    placeholder="State"
                                />
                                <Input
                                    {...register("business.regsiteredAddress.pinCode")}
                                    className="bg-back2 border-bdr2"
                                    placeholder="Pin Code"
                                />
                                <Input
                                    {...register("business.regsiteredAddress.country")}
                                    className="bg-back2 border-bdr2"
                                    placeholder="Country"
                                />
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-650 mb-5 text-[11px] font-semibold">Error: {error}</p>}

                    <DialogFooter className="border-t border-bdr2 pt-4 mt-2">
                        {selectedUser ?
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold" disabled={isSubmitting || createCustomer.isPending}>
                                {(isSubmitting || createCustomer.isPending) && <Loader2 className="animate-spin mr-1 h-3.5 w-3.5" />}
                                Update Customer
                            </Button>
                            : <Button type="submit" className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold" disabled={isSubmitting || createCustomer.isPending}>
                                {(isSubmitting || createCustomer.isPending) && <Loader2 className="animate-spin mr-1 h-3.5 w-3.5" />}
                                Create Customer
                            </Button>
                        }
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 