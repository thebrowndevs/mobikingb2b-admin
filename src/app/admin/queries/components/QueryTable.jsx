'use client'

import React, { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Inbox, Star } from "lucide-react"
import QuerySheet from "./QuerySheet"
import { AnimatePresence, motion } from "framer-motion"

function QueryTable({ data = [], canEdit }) {
    const [selectedQuery, setSelectedQuery] = useState(null)
    const [sheetOpen, setSheetOpen] = useState(false)

    // Empty state
    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/50">
                <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
                    <Inbox className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Queries Found</h3>
                <p className="mt-1 text-xs text-slate-400 max-w-xs text-center leading-relaxed">
                    There are no customer queries or tickets matching this criteria.
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/50 bg-white">
                <Table>
                    <TableHeader className="bg-slate-50/75 border-b border-slate-100">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px] w-[60px] text-center">#</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Title</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Raised By</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Raised At</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px] w-[110px] text-center">Status</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px] w-[90px] text-center">Ratings</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px] w-[80px] text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence mode="wait">
                            {data.map((query, index) => (
                                <motion.tr
                                    key={query._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150 last:border-0"
                                >
                                    <TableCell className="text-center font-semibold text-slate-400 text-xs">{index + 1}</TableCell>
                                    <TableCell className="font-bold text-slate-800 text-sm max-w-[200px] truncate">{query.title}</TableCell>
                                    <TableCell className="text-slate-600 font-medium text-xs">
                                        <span className="block font-bold text-slate-700">{query.raisedBy?.name || "User"}</span>
                                        <span className="block text-[10px] text-slate-400 mt-0.5">{query.raisedBy?.email || query.raisedBy?.phoneNo || ""}</span>
                                    </TableCell>
                                    <TableCell className="text-slate-500 font-medium text-xs">
                                        {query.raisedAt ? format(new Date(query.raisedAt), "dd MMM yyyy, hh:mm a") : "-"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {query.isResolved ? (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100/60 font-bold rounded-lg text-[10px] px-2 py-0.5">
                                                Resolved
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-rose-50 text-rose-750 border-rose-100/60 font-bold rounded-lg text-[10px] px-2 py-0.5">
                                                Pending
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {query.rating ? (
                                            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100/60 text-amber-700 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                                {query.rating}
                                            </span>
                                        ) : (
                                            <span className="text-slate-350 text-xs">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedQuery(query)
                                                setSheetOpen(true)
                                            }}
                                            className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all duration-200"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>

            {selectedQuery && (
                <QuerySheet
                    open={sheetOpen}
                    onOpenChange={setSheetOpen}
                    query={selectedQuery}
                    canEdit={canEdit}
                />
            )}
        </>
    )
}

export default QueryTable
