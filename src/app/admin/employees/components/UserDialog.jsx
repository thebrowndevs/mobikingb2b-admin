// app/admin/users/components/UserDialog.jsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{selectedUser ? "Update User Details" : "Add New User"}</DialogTitle>
                    <DialogDescription>
                        Create or update user and assign roles and permissions.
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
                                Unique ID <span className="text-red-500"> *</span>
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
                                    className={clsx({ "border-red-500": errors.phone })}
                                    placeholder="10 Digit Unique ID"
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="email" className="text-right mt-2">
                                Email<span className="text-red-500"> *</span>
                            </Label>
                            <div className="col-span-3">
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

                        {/* Password */}
                        {!selectedUser &&
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="password" className="text-right mt-2">
                                    Password<span className="text-red-500"> *</span>
                                </Label>
                                <div className="col-span-3 relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        {...register("password")}
                                        placeholder="Password"
                                        className={clsx({ "border-red-500": errors.password })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    {errors.password && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        }

                        {/* Role */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="role" className="text-right mt-2">
                                Role<span className="text-red-500"> *</span>
                            </Label>
                            <div className="col-span-3">
                                <select
                                    id="role"
                                    {...register("role", { required: "Role is required" })}
                                    className={clsx("w-full border px-3 py-2 rounded", {
                                        "border-red-500": errors.role,
                                    })}
                                >
                                    {/* <option value="user">User</option> */}
                                    <option value="employee">Employee</option>
                                </select>
                                {errors.role && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.role.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Permissions (only for sub-admin) */}
                        {watchRole === "employee" && (
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right mt-2">Permissions</Label>
                                <div className="col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                        {permissionSections.map((section) => (
                                            <div
                                                key={section.id}
                                                className="border rounded-lg p-4 bg-white transition-all hover:border-gray-400"
                                            >
                                                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                                                    <div className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></div>
                                                    {section.name}
                                                </h4>
                                                <div className="grid grid-cols-4 gap-2">
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
                                                                bg: 'bg-blue-50',
                                                                border: 'border-blue-200',
                                                                text: 'text-blue-700',
                                                                checkbox: 'data-[state=checked]:bg-blue-600 border-blue-300'
                                                            },
                                                            add: {
                                                                bg: 'bg-green-50',
                                                                border: 'border-green-200',
                                                                text: 'text-green-700',
                                                                checkbox: 'data-[state=checked]:bg-green-600 border-green-300'
                                                            },
                                                            edit: {
                                                                bg: 'bg-yellow-50',
                                                                border: 'border-yellow-200',
                                                                text: 'text-yellow-700',
                                                                checkbox: 'data-[state=checked]:bg-yellow-600 border-yellow-300'
                                                            },
                                                            delete: {
                                                                bg: 'bg-red-50',
                                                                border: 'border-red-200',
                                                                text: 'text-red-700',
                                                                checkbox: 'data-[state=checked]:bg-red-600 border-red-300'
                                                            }
                                                        };

                                                        const colors = colorMap[type.id] || {};
                                                        const isChecked = !!watchPermissions[section.id]?.[type.id];

                                                        return (
                                                            <div
                                                                key={type.id}
                                                                className={clsx(
                                                                    "flex items-center gap-2 p-2 rounded transition-all",
                                                                    isChecked
                                                                        ? `${colors.bg} ${colors.border} border`
                                                                        : "hover:bg-gray-50"
                                                                )}
                                                            >
                                                                <Checkbox
                                                                    id={`${section.id}-${type.id}`}
                                                                    checked={isChecked}
                                                                    onCheckedChange={(checked) =>
                                                                        handlePermissionChange(section.id, type.id, checked)
                                                                    }
                                                                    className={clsx(
                                                                        "h-5 w-5 rounded",
                                                                        colors.checkbox
                                                                    )}
                                                                />

                                                                <Label
                                                                    htmlFor={`${section.id}-${type.id}`}
                                                                    className={clsx(
                                                                        "text-sm cursor-pointer select-none",
                                                                        isChecked ? `${colors.text} font-medium` : "text-gray-600"
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
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-600 mb-5 text-sm">Error: {error}</p>}

                    <DialogFooter>
                        {onlyAdmin && selectedUser &&
                            <Button variant={"outline"} type="button" disabled={isSubmitting} onClick={() => setPwdDialogOpen(true)}>
                                Update Password
                            </Button>

                        }

                        {selectedUser ?
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="animate-spin mr-1" />}
                                Update
                            </Button>
                            : <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="animate-spin mr-1" />}
                                Create
                            </Button>
                        }

                    </DialogFooter>
                </form>

                <PasswordDialog
                    open={pwdDialogOpen}
                    onOpenChange={setPwdDialogOpen}
                    userId={selectedUser?._id}
                />

            </DialogContent>
        </Dialog>
    );
} 