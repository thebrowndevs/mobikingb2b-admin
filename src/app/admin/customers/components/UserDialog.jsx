import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";

export default function UserDialog({ open, onOpenChange, selectedUser, onCreate, onUpdate, isSubmitting, error, changePassword, canEdit, onlyAdmin }) {
    const { register, handleSubmit, reset, formState: { errors }, watch, setValue, } = useForm();

    const { createCustomer } = useUsers();

    useEffect(() => {
        if (open) {
            if (selectedUser) {
                reset({
                    name: selectedUser.name || "",
                    email: selectedUser.email || "",
                    phoneNo: selectedUser.phoneNo || "",
                    role: "user",
                });
            } else {
                reset({
                    name: "",
                    email: "",
                    phoneNo: "",
                    role: "user",
                });
            }
        }
    }, [open, selectedUser, reset]);

    const onSubmit = async (data) => {
        try {
            // const fd = { ...data, departments: ["Human Resource"], }
            const fd = { ...data }

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
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{selectedUser ? "Update User Details" : "Add New User"}</DialogTitle>
                    <DialogDescription>
                        Create or update users.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        {/* Name */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="name" className="text-right mt-2">
                                Name<span className="text-red-500"> *</span>
                            </Label>
                            <div className="col-span-3">
                                <Input
                                    id="name"
                                    {...register("name", { required: "Name is required" })}
                                    className={clsx({ "border-red-500": errors.name })}
                                    placeholder="John Doe"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="phone" className="text-right mt-2">
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
                                    className={clsx({ "border-red-500": errors.phoneNo })}
                                    placeholder="9876543210"
                                />
                                {errors.phoneNo && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.phoneNo.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        {selectedUser &&
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="email" className="text-right mt-2">
                                    Email<span className="text-red-500"> *</span>
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
                                        className={clsx({ "border-red-500": errors.email })}
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        }
                    </div>

                    {error && <p className="text-red-600 mb-5 text-sm">Error: {error}</p>}

                    <DialogFooter>
                        {selectedUser ?
                            <Button type="submit" disabled={isSubmitting || createCustomer.isPending}>
                                {isSubmitting || createCustomer.isPending && <Loader2 className="animate-spin mr-1" />}
                                Update
                            </Button>
                            : <Button type="submit" disabled={isSubmitting || createCustomer.isPending}>
                                {isSubmitting || createCustomer.isPending && <Loader2 className="animate-spin mr-1" />}
                                Create
                            </Button>
                        }

                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 