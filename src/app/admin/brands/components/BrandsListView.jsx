"use client";

import { Button } from '@/components/ui/button';
import { Pencil } from "lucide-react";
import Image from 'next/image';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import TableSkeleton from '@/components/custom/TableSkeleton';
import { AnimatePresence, motion } from "framer-motion";

export default function BrandsListView({ isLoading, error, brands, onEdit, onDelete, isDeleting, deleteError, canEdit = true }) {

    if (isLoading) return <TableSkeleton showHeader={false} />;
    if (error) return <div className="text-red-600 p-4">Error: {error.message}</div>;
    if (!brands?.length) return <div className="text-center text-gray-500 p-4">No brands Found!</div>;

    return (
        <section className="w-full">
            <div className="rounded-md border">
                <Table className={'overflow-hidden'}>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center text-primary text-base">#</TableHead>
                            <TableHead className="text-center text-primary text-base">Image</TableHead>
                            <TableHead className="text-center text-primary text-base">Name</TableHead>
                            <TableHead className="text-center text-primary text-base">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        <AnimatePresence mode="wait">
                            {brands.map((item, index) => (
                                <motion.tr
                                    key={item._id || index}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.5 }}
                                    className="border-b"
                                >
                                    <TableCell className="text-center align-middle">{index + 1}</TableCell>
                                    <TableCell className="text-center align-middle">
                                        <div className="flex justify-center">
                                            <Image
                                                height={80}
                                                width={80}
                                                quality={100}
                                                src={item?.image || '/not-found-img.webp'}
                                                alt={item?.name}
                                                className="object-contain rounded-sm"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center align-middle">{item.name}</TableCell>
                                    <TableCell className="text-center align-middle">
                                        <div className="flex justify-center gap-2">
                                            {canEdit &&
                                                <Button size="icon" variant="outline" onClick={() => onEdit(item)}>
                                                    <Pencil size={16} />
                                                </Button>
                                            }
                                        </div>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}
