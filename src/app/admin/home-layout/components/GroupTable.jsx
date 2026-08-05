// app/design-studio/components/GroupTable.jsx
'use client'
import React from 'react'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table'
import GroupSequenceDialog from './GroupSequenceDialog'
import Image from 'next/image'

export default function GroupTable({ initialData = [], allGroups = [], onSave, canEdit }) {
    // console.log(initialData)
    return (
        <div>
            <div className="flex justify-between items-center w-full mb-5">
                <h2 className="font-bold text-xl text-purple-800">Product Groups</h2>
                {canEdit &&
                    <GroupSequenceDialog
                        allGroups={allGroups}
                        initialGroups={initialData.map((g) => g._id)}
                        onSave={onSave}
                    />
                }
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Banner</TableHead>
                        <TableHead>Banner Visible</TableHead>
                        <TableHead>BG Color</TableHead>
                        <TableHead>BG Color Visible</TableHead>
                        <TableHead>Sub Categories</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialData.map((group, idx) => (
                        <TableRow key={group._id}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>{group.name}</TableCell>
                            <TableCell>{group.products?.length ?? 0}</TableCell>
                            <TableCell>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium 
    ${group.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                                    {group.active ? 'Visible' : 'Not Visible'}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className='h-10 w-20 rounded-sm'>
                                    <Image
                                        src={group.banner}
                                        height={100}
                                        width={100}
                                        alt='banner'
                                        className='h-10 w-auto object-cover rounded-sm'
                                    />
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium 
    ${group.isBannerVisble ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                                    {group.isBannerVisble ? 'Visible' : 'Not Visible'}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className={`h-10 w-20 p-0 rounded-sm bg-[${group.backgroundColor}]`}>
                                    <input type="color" value={group?.backgroundColor} disabled className='w-full h-full' />
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium 
    ${group.isBackgroundColorVisible ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                                    {group.isBackgroundColorVisible ? 'Visible' : 'Not Visible'}
                                </span>
                            </TableCell>
                            <TableCell>
                                {group.categories.map((c, idx) => {
                                    return (
                                        <p key={idx}>{c.name}</p>
                                    )
                                })}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
