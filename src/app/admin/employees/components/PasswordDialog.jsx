import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/useUsers";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordDialog({ open, onOpenChange, userId }) {
    const { updateUser } = useUsers();

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm({
        defaultValues: { newPassword: '', confirmNewPassword: '' }
    });

    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const onSubmit = async data => {
        if (data.newPassword !== data.confirmNewPassword) return; // extra safety check

        try {
            await updateUser.mutateAsync({
                id: userId,
                data: {
                    password: data.newPassword,
                }
            });
            onOpenChange(false);
            reset();
        } catch (_) {
            // optionally handle error
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="relative">
                        <Label htmlFor="newPassword" className="mb-2">New Password</Label>
                        <Input
                            id="newPassword"
                            type={showNew ? "text" : "password"}
                            {...register('newPassword', {
                                required: 'Required',
                                minLength: { value: 6, message: 'At least 6 characters' },
                            })}
                            className="pr-10" // give space for the button
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(v => !v)}
                            aria-label={showNew ? "Hide new password" : "Show new password"}
                            className="absolute right-2 top-9 transform -translate-y-1/2 text-gray-600"
                        >
                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {errors.newPassword && <p className="text-red-500 mt-1">{errors.newPassword.message}</p>}
                    </div>

                    <div className="relative">
                        <Label htmlFor="confirmNewPassword" className="mb-2">Confirm New Password</Label>
                        <Input
                            id="confirmNewPassword"
                            type={showConfirm ? "text" : "password"}
                            {...register('confirmNewPassword', {
                                required: 'Required',
                                validate: val =>
                                    val === watch('newPassword') || 'Passwords must match',
                            })}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(v => !v)}
                            aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                            className="absolute right-2 top-9 transform -translate-y-1/2 text-gray-600"
                        >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {errors.confirmNewPassword && <p className="text-red-500 mt-1">{errors.confirmNewPassword.message}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Update Password'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
