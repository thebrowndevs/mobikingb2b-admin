// app/admin/users/components/UserDialog.jsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import PasswordDialog from "./PasswordDialog";

const permissionSections = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'pos', name: 'POS' },
    { id: 'posOrders', name: 'POS Orders' },
    { id: 'manual-order', name: 'Manual Order' },
    { id: 'orders', name: 'Orders' },
    { id: 'return-requests', name: 'Return Requests' },
    { id: 'partial-return-requests', name: 'Partial Return Requests' },
    { id: 'cancel-requests', name: 'Cancel Requests' },
    { id: 'refund', name: 'Refund' },
    { id: 'payment-links', name: 'Payment Links' },
    { id: 'queries', name: 'Queries' },
    { id: 'categories', name: 'Categories' },
    { id: 'subCategories', name: 'Sub Categories' },
    { id: 'products', name: 'Products' },
    { id: 'brands', name: 'Brands' },
    { id: 'design-studio', name: 'Design Studio' },
    { id: 'home-layout', name: 'Home Layout' },
    { id: 'couponCodes', name: 'Coupon Codes' },
    { id: 'customers', name: 'Customers' },
    { id: 'employees', name: 'Employees' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'reports', name: 'Reports' },
    { id: 'policies', name: 'Policies' },
    { id: 'blogs', name: 'Blogs' },
];

const permissionTypes = [
    { id: 'view', label: 'View' },
    { id: 'add', label: 'Add' },
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Delete' }
];

export default function UserDialog({ open, onOpenChange, selectedUser, onCreate, onUpdate, isSubmitting, error, canEdit, onlyAdmin }) {
    const { register, handleSubmit, reset, formState: { errors }, watch, setValue, } = useForm();
    const watchRole = watch("role", "employee");
    const watchPermissions = watch("permissions", {});

    const [showPassword, setShowPassword] = useState(false);
    const [pwdDialogOpen, setPwdDialogOpen] = useState(false);

    useEffect(() => {
        if (open) {
            if (selectedUser) {
                reset({
                    name: selectedUser.name || "",
                    email: selectedUser.email || "",
                    phoneNo: selectedUser.phoneNo || "",
                    password: selectedUser.password || "",
                    role: selectedUser.role || "employee",
                    permissions: selectedUser.permissions
                });
            } else {
                reset({
                    name: "",
                    email: "",
                    password: "",
                    role: "employee",
                    permissions: {}
                });
            }
        }
    }, [open, selectedUser, reset]);

    const handlePermissionChange = (section, type, checked) => {
        const newPermissions = { ...watchPermissions };
        if (!newPermissions[section]) newPermissions[section] = {};
        newPermissions[section][type] = checked;
        setValue("permissions", newPermissions);
    };

    const onSubmit = async (data) => {
        try {
            const fd = { ...data, departments: ["Human Resource"], }

            const { password, ...rest } = fd;

            const userData = selectedUser
                ? rest
                : { ...rest, password };

            if (selectedUser?._id) {
                await onUpdate({ id: selectedUser._id, data: userData });
            } else {
                await onCreate(userData);
            }
            onOpenChange(false);
        } catch (error) { }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[700px] bg-back1 border-l border-bdr2 shadow-none p-0 flex flex-col h-full gap-0">
                <SheetHeader className="py-3.5 px-6 border-b border-bdr2 bg-back2 shrink-0">
                    <SheetTitle className="text-lg font-bold text-slate-800 tracking-tighter">
                        {selectedUser ? "Update User Details" : "Add New User"}
                    </SheetTitle>
                    <SheetDescription className="text-xs text-slate-455 font-medium">
                        Configure administrators, personnel accounts, and security access levels.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-back1">
                        {/* Profile Info Details Card */}
                        <div className="bg-back2 border border-bdr2 rounded-xl p-5 space-y-4 shadow-none">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-bdr2 pb-2">Profile Information</h3>

                            {/* Name */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="name" className="text-xs font-bold text-slate-700">
                                    Name<span className="text-red-500"> *</span>
                                </Label>
                                <Input
                                    id="name"
                                    {...register("name", { required: "Name is required" })}
                                    className={clsx("w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none", { "border-red-500": errors.name })}
                                    placeholder="John Doe"
                                />
                                {errors.name && (
                                    <p className="text-[11px] text-red-500 font-medium">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Phone Number */}
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="phoneNo" className="text-xs font-bold text-slate-700">
                                        Unique ID <span className="text-red-500"> *</span>
                                    </Label>
                                    <Input
                                        id="phoneNo"
                                        type="tel"
                                        autoComplete="new-password"
                                        {...register("phoneNo", {
                                            required: "Phone number is required",
                                            pattern: {
                                                value: /^[0-9]{10}$/,
                                                message: "Phone number must be exactly 10 digits"
                                            }
                                        })}
                                        className={clsx("w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none", { "border-red-500": errors.phone })}
                                        placeholder="10 Digit Unique ID"
                                    />
                                    {errors.phone && (
                                        <p className="text-[11px] text-red-500 font-medium">
                                            {errors.phone.message}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                                        Email<span className="text-red-500"> *</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^\S+@\S+\.\S+$/,
                                                message: "Invalid email format"
                                            }
                                        })}
                                        className={clsx("w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none", { "border-red-500": errors.email })}
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-[11px] text-red-500 font-medium">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Password */}
                            {!selectedUser && (
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                                        Password<span className="text-red-500"> *</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            {...register("password")}
                                            placeholder="Password"
                                            className={clsx("w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none", { "border-red-500": errors.password })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-[11px] text-red-500 font-medium">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Role */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="role" className="text-xs font-bold text-slate-700">
                                    Role<span className="text-red-500"> *</span>
                                </Label>
                                <select
                                    id="role"
                                    {...register("role", { required: "Role is required" })}
                                    className={clsx("w-full bg-back1 border border-bdr2 text-slate-700 rounded-lg px-3 py-2 text-sm shadow-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all focus:outline-none", {
                                        "border-red-500": errors.role,
                                    })}
                                >
                                    <option value="employee">Employee</option>
                                </select>
                                {errors.role && (
                                    <p className="text-[11px] text-red-500 font-medium">
                                        {errors.role.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Permissions (only for sub-admin) */}
                        {watchRole === "employee" && (
                            <div className="bg-back2 border border-bdr2 rounded-xl p-5 space-y-4 shadow-none">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-bdr2 pb-2">Assign Permissions</h3>

                                <div className="space-y-4">
                                    {permissionSections.map((section) => (
                                        <div
                                            key={section.id}
                                            className="border border-bdr2 rounded-xl p-4 bg-back2 transition-all hover:border-slate-350 shadow-none"
                                        >
                                            <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center">
                                                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-2"></div>
                                                {section.name}
                                            </h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                                {permissionTypes.map((type) => {
                                                    if (section.id === 'refund' && type.id !== 'add') {
                                                        return null;
                                                    }
                                                    const labelText = (section.id === 'refund' && type.id === 'add')
                                                        ? "Process Refund"
                                                        : type.label;

                                                    // Color mapping for each permission type
                                                    const colorMap = {
                                                        view: {
                                                            bg: 'bg-blue-50/50',
                                                            border: 'border-blue-150',
                                                            text: 'text-blue-700',
                                                            checkbox: 'data-[state=checked]:bg-blue-600 border-blue-300'
                                                        },
                                                        add: {
                                                            bg: 'bg-emerald-50/50',
                                                            border: 'border-emerald-150',
                                                            text: 'text-emerald-700',
                                                            checkbox: 'data-[state=checked]:bg-emerald-600 border-emerald-300'
                                                        },
                                                        edit: {
                                                            bg: 'bg-amber-50/50',
                                                            border: 'border-amber-150',
                                                            text: 'text-amber-700',
                                                            checkbox: 'data-[state=checked]:bg-amber-600 border-amber-300'
                                                        },
                                                        delete: {
                                                            bg: 'bg-rose-50/50',
                                                            border: 'border-rose-150',
                                                            text: 'text-rose-700',
                                                            checkbox: 'data-[state=checked]:bg-rose-600 border-rose-300'
                                                        }
                                                    };

                                                    const colors = colorMap[type.id] || {};
                                                    const isChecked = !!watchPermissions[section.id]?.[type.id];

                                                    return (
                                                        <div
                                                            key={type.id}
                                                            className={clsx(
                                                                "flex items-center gap-2 p-2 rounded-lg transition-all border border-transparent",
                                                                isChecked
                                                                    ? `${colors.bg} ${colors.border}`
                                                                    : "hover:bg-slate-50"
                                                            )}
                                                        >
                                                            <Checkbox
                                                                id={`${section.id}-${type.id}`}
                                                                checked={isChecked}
                                                                onCheckedChange={(checked) =>
                                                                    handlePermissionChange(section.id, type.id, checked)
                                                                }
                                                                className={clsx(
                                                                    "h-4 w-4 rounded border-slate-350 shadow-none",
                                                                    colors.checkbox
                                                                )}
                                                            />

                                                            <Label
                                                                htmlFor={`${section.id}-${type.id}`}
                                                                className={clsx(
                                                                    "text-xs cursor-pointer select-none font-semibold",
                                                                    isChecked ? colors.text : "text-slate-500"
                                                                )}
                                                            >
                                                                    {labelText}
                                                            </Label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-655 px-6 pb-2 text-xs font-semibold">Error: {error}</p>}

                    <div className="sticky bottom-0 bg-back2 border-t border-bdr2 p-4 flex items-center justify-end gap-2.5 shrink-0 z-20 shadow-none">
                        {onlyAdmin && selectedUser && (
                            <Button 
                                variant="outline" 
                                type="button" 
                                disabled={isSubmitting} 
                                onClick={() => setPwdDialogOpen(true)}
                                className="bg-back2 border-bdr2 text-slate-700 hover:bg-slate-50 font-semibold shadow-none text-xs h-9"
                            >
                                Update Password
                            </Button>
                        )}

                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text font-semibold shadow-none text-xs h-9 px-5"
                        >
                            {isSubmitting && <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" />}
                            {selectedUser ? "Update Details" : "Create Account"}
                        </Button>
                    </div>
                </form>

                <PasswordDialog
                    open={pwdDialogOpen}
                    onOpenChange={setPwdDialogOpen}
                    userId={selectedUser?._id}
                />
            </SheetContent>
        </Sheet>
    );
}