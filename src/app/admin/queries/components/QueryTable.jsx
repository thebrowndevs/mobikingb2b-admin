'use client'

import React, { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Inbox } from "lucide-react"
import QuerySheet from "./QuerySheet"
import { AnimatePresence, motion } from "framer-motion"

function QueryTable({ data = [], canEdit }) {
    const [selectedQuery, setSelectedQuery] = useState(null)
    const [sheetOpen, setSheetOpen] = useState(false)

    // Empty state
    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-white border">
                <Inbox className="w-12 h-12 text-gray-400" />
                <h3 className="mt-4 text-xl font-semibold text-gray-700">No Queries Found</h3>
                <p className="mt-2 text-sm text-gray-500">There are no queries to display right now.</p>
            </div>
        )
    }

    return (
        <>
            <div className="overflow-hidden scrollbar-hide">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Raised By</TableHead>
                            <TableHead>Raised At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ratings</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="scrollbar-hide">
                        <AnimatePresence mode="wait">
                            {data.map((query, index) => (
                                <motion.tr
                                    key={query._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="border-b"
                                >
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{query.title}</TableCell>
                                    <TableCell>
                                        {query.raisedBy?.name || query.raisedBy?.email || query.raisedBy?.phoneNo || "User"}
                                    </TableCell>
                                    <TableCell>
                                        {query.raisedAt ? format(new Date(query.raisedAt), "dd MMM yyyy, hh:mm a") : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {query.isResolved ? (
                                            <Badge variant="green">Resolved</Badge>
                                        ) : (
                                            <Badge variant="destructive">Pending</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {query.rating ? `${query.rating}/10` : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                setSelectedQuery(query)
                                                setSheetOpen(true)
                                            }}
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
