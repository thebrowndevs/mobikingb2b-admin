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
    if (error) return <div className="text-red-605 p-4 bg-back2 border border-bdr2 rounded-xl">Error: {error.message}</div>;
    if (!brands?.length) return <div className="text-center text-slate-400 p-8 bg-back2 border border-bdr2 rounded-xl font-medium">No brands found.</div>;

    return (
        <section className="w-full bg-back2 border border-bdr2 rounded-xl overflow-hidden shadow-none">
            <Table containerClassName="border-0 bg-transparent" className="overflow-visible">
                <TableHeader className="bg-slate-50/75">
                    <TableRow className="border-b border-bdr2">
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-16">#</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-28">Image</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Name</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-32">Action</TableHead>
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
                                transition={{ duration: 0.2 }}
                                className="border-b border-bdr2 last:border-b-0 hover:bg-slate-50/40 transition-colors"
                            >
                                <TableCell className="text-center align-middle font-medium text-slate-400 py-3">{index + 1}</TableCell>
                                <TableCell className="text-center align-middle py-3">
                                    <div className="flex justify-center">
                                        <Image
                                            height={48}
                                            width={48}
                                            quality={100}
                                            src={item?.image || '/not-found-img.webp'}
                                            alt={item?.name}
                                            className="object-cover rounded-lg border border-bdr2"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="text-left align-middle font-bold text-slate-800 py-3">{item.name}</TableCell>
                                <TableCell className="text-center align-middle py-3">
                                    <div className="flex justify-center gap-1.5">
                                        {canEdit && (
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-650 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all shadow-none"
                                                onClick={() => onEdit(item)}
                                            >
                                                <Pencil size={14} />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </TableBody>
            </Table>
        </section>
    );
}
