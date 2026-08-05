'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useHome } from '@/hooks/useHome'
import toast from 'react-hot-toast'
import LoaderButton from '@/components/custom/LoaderButton'
import { Reorder } from 'framer-motion'
import { uploadImage3 } from '@/lib/services/uploadImage2'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { GripVertical, Trash2, Upload, ImageIcon, Link as LinkIcon } from 'lucide-react'

function WebsiteBanners({ canEdit }) {
    const { homeQuery, updateHome } = useHome()
    const homeData = homeQuery?.data?.data || {}

    const [bannerLoading, setBannerLoading] = useState(false)
    const [banners, setBanners] = useState([])

    useEffect(() => {
        if (homeData?.banners) {
            setBanners(homeData.banners.map((b, idx) => ({
                id: `banner-${idx}-${Date.now()}`,
                desktopUrl: b.desktopUrl || '',
                mobileUrl: b.mobileUrl || '',
                redirectUrl: b.redirectUrl || ''
            })))
        }
    }, [homeData])

    const handleImageUpload = async (e, index, field) => {
        const file = e.target.files?.[0]
        if (!file) return

        const toastId = toast.loading('Uploading image...')
        try {
            const url = await uploadImage3(file)
            setBanners(prev => {
                const updated = [...prev]
                updated[index] = {
                    ...updated[index],
                    [field]: url
                }
                return updated
            })
            toast.success('Image uploaded successfully!', { id: toastId })
        } catch (err) {
            console.error(err)
            toast.error('Failed to upload image', { id: toastId })
        }
    }

    const handleAddBanner = () => {
        setBanners(prev => [
            ...prev,
            { id: `banner-${Date.now()}-${prev.length}`, desktopUrl: '', mobileUrl: '', redirectUrl: '' }
        ])
    }

    const handleRemoveBanner = (index) => {
        setBanners(prev => prev.filter((_, i) => i !== index))
    }

    const handleRedirectUrlChange = (index, val) => {
        setBanners(prev => {
            const updated = [...prev]
            updated[index] = {
                ...updated[index],
                redirectUrl: val
            }
            return updated
        })
    }

    const handleSave = async () => {
        try {
            setBannerLoading(true)
            const cleanedBanners = banners.map(({ id, ...rest }) => rest)
            await updateHome.mutateAsync({ banners: cleanedBanners })
            toast.success('Banners saved successfully!')
        } catch (err) {
            toast.error('Failed to save banners')
        } finally {
            setBannerLoading(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <ImageIcon className="w-6 h-6" />
                        Website Banners
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure separate desktop and mobile banners. Drag to reorder.
                    </p>
                </div>

                {canEdit && (
                    <LoaderButton
                        loading={bannerLoading}
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Save Changes
                    </LoaderButton>
                )}
            </div>

            {/* Empty State */}
            {banners?.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                        <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">
                            No banners added yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Add banners for your website to display slideshows
                        </p>
                        <Button
                            onClick={handleAddBanner}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Add First Banner
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Reorder List */}
                    <Reorder.Group
                        axis="y"
                        values={banners}
                        onReorder={setBanners}
                        className="space-y-6 mb-6"
                    >
                        {banners.map((item, idx) => (
                            <Reorder.Item
                                key={item.id}
                                value={item}
                                className="relative group cursor-grab active:cursor-grabbing bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Drag handle */}
                                    <div className="flex items-center justify-center bg-gray-50 dark:bg-zinc-800/50 px-4 border-b md:border-b-0 md:border-r border-gray-100 dark:border-zinc-800 py-3 md:py-0">
                                        <GripVertical className="w-5 h-5 text-gray-400" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Banner {idx + 1}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/20"
                                                onClick={() => handleRemoveBanner(idx)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        {/* Image Upload Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                            {/* Desktop Banner Column */}
                                            <div className="lg:col-span-2 space-y-2">
                                                <span className="text-xs font-semibold text-gray-500 block">Desktop Banner (1920x460 Ratio)</span>
                                                <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition aspect-[1920/460] w-full overflow-hidden">
                                                    {item.desktopUrl ? (
                                                        <div className="relative w-full h-full">
                                                            <img src={item.desktopUrl} className="w-full h-full object-cover" alt="Desktop Preview" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                <span className="text-white text-xs font-semibold bg-zinc-900/80 px-3 py-1.5 rounded-md">Change Desktop Image</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center p-4 text-center">
                                                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                                            <span className="text-xs text-gray-500">Upload Desktop (1920x460)</span>
                                                        </div>
                                                    )}
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        className="hidden" 
                                                        onChange={(e) => handleImageUpload(e, idx, 'desktopUrl')}
                                                    />
                                                </label>
                                            </div>

                                            {/* Mobile Banner Column */}
                                            <div className="space-y-2">
                                                <span className="text-xs font-semibold text-gray-500 block">Mobile Banner (1:1 Ratio)</span>
                                                <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition aspect-square w-full max-w-[240px] overflow-hidden">
                                                    {item.mobileUrl ? (
                                                        <div className="relative w-full h-full">
                                                            <img src={item.mobileUrl} className="w-full h-full object-cover" alt="Mobile Preview" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                <span className="text-white text-xs font-semibold bg-zinc-900/80 px-2 py-1 rounded-md">Change Mobile</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center p-4 text-center">
                                                            <Upload className="w-5 h-5 text-gray-400 mb-1" />
                                                            <span className="text-xs text-gray-500">Upload Mobile (1:1)</span>
                                                        </div>
                                                    )}
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        className="hidden" 
                                                        onChange={(e) => handleImageUpload(e, idx, 'mobileUrl')}
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Redirect Link Input */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                                                <LinkIcon className="w-3.5 h-3.5" />
                                                Redirect URL (Optional)
                                            </label>
                                            <Input
                                                type="url"
                                                placeholder="https://example.com/product/..."
                                                value={item.redirectUrl}
                                                onChange={(e) => handleRedirectUrlChange(idx, e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>

                    {/* Add More Banners */}
                    <Button
                        onClick={handleAddBanner}
                        variant="outline"
                        className="w-full py-6 border-dashed text-gray-600 hover:text-gray-900"
                    >
                        + Add Another Banner
                    </Button>
                </>
            )}
        </div>
    )
}

export default WebsiteBanners
