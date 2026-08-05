import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function PasswordDialog({ open, onOpenChange, userId, changePassword }) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm({
        defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' }
    });

    const onSubmit = async data => {
        try {
            await changePassword.mutateAsync({ id: userId, ...data });
            onOpenChange(false);
            reset();
        } catch (_) { }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            type="text"
                            {...register('newPassword', { required: 'Required', minLength: { value: 6, message: 'At least 6 chars' } })}
                        />
                        {errors.newPassword && <p className="text-red-500">{errors.newPassword.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                        <Input
                            id="confirmNewPassword"
                            type="text"
                            {...register('confirmNewPassword', {
                                required: 'Required',
                                validate: val => val === watch('newPassword') || 'Passwords must match'
                            })}
                        />
                        {errors.confirmNewPassword && <p className="text-red-500">{errors.confirmNewPassword.message}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>Update Password</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
