"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { useState } from "react"
import LoaderButton from "@/components/custom/LoaderButton"
import axios from "axios"
import { useNotifications } from "@/hooks/useNotifications"
import toast from "react-hot-toast"
import { uploadImage3 } from "@/lib/services/uploadImage2" // <-- changed to uploadImage3

export default function SendNotification({ open, onOpenChange }) {
    const { createNotification } = useNotifications()
    const [sending, setSending] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const form = useForm({
        defaultValues: {
            title: "",
            message: "",
            image: null,
            redirect: "",
        },
    })

    const { watch, setValue, reset } = form
    const image = watch("image")

    const onSubmit = async (values) => {
        console.log("Sending Notification:", values)
        setSending(true)
        try {
            const res = await axios.post("/api/send-notification", values)
            await createNotification.mutateAsync(values)
            console.log(res)
            onOpenChange(false)
            reset({ title: "", message: "", image: null, redirect: "" })
        } catch (error) {
            console.log(error)
            toast.error("Failed to send notification")
        } finally {
            setSending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Compose new notification</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title or subject</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter title" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message or body</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write your notification message..."
                                            rows={5}
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="space-y-1">
                            <Label className={"mb-2"}>Upload image (optional)</Label>
                            {!image ? (
                                <div className="h-36 border-2 border-dashed border-gray-400 rounded-md flex flex-col items-center justify-center cursor-pointer relative">
                                    <p className="text-center text-sm text-muted-foreground">
                                        Click below to upload image
                                        <br />
                                        Recommended size: 1280x536, max 1MB
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            if (!file) return
                                            const toastId = toast.loading("Uploading image...")
                                            try {
                                                setIsUploading(true)
                                                setUploadProgress(0)
                                                const url = await uploadImage3(file, (progressFraction) => {
                                                    const pct = Math.round((progressFraction ?? 0) * 100)
                                                    setUploadProgress(pct)
                                                })
                                                setValue("image", url, { shouldValidate: true })
                                                toast.success("Image uploaded", { id: toastId })
                                            } catch (err) {
                                                console.error(err)
                                                toast.error("Upload failed")
                                            } finally {
                                                setIsUploading(false)
                                                setTimeout(() => setUploadProgress(0), 600)
                                                if (e.target) e.target.value = ""
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={image}
                                        alt="Preview"
                                        className="mt-2 rounded border w-full max-h-48 object-contain"
                                    />
                                    {/* overlay progress if uploading */}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <div className="text-white text-sm">Uploading... {uploadProgress}%</div>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setValue("image", null)}
                                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                        title="Remove image"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="redirect"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Redirect To (optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="URL or Page ID" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <LoaderButton
                            loading={createNotification.isPending || sending || isUploading}
                            type="submit"
                            className="w-full"
                            disabled={isUploading}
                        >
                            Send Notification
                        </LoaderButton>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
