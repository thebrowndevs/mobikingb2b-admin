import React, { useState } from "react"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
// import AssignQueryDialog from "./AssignQueryDialog"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import QuerySheet from "./QuerySheet"

function QueryTable({ data = [] }) {
    // const [selectedIds, setSelectedIds] = useState([])
    // const [assignDialog, setAssignDialog] = useState(false)
    const [selectedQuery, setSelectedQuery] = useState(null)
    const [sheetOpen, setSheetOpen] = useState(false)

    // const toggleSelect = (id) => {
    //     setSelectedIds((prev) =>
    //         prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    //     )
    // }

    return (
        <>
            {/* <div className="w-full flex items-end mb-3 justify-end">
                {selectedIds.length > 0 &&
                    <Button onClick={() => setAssignDialog(true)}>Assign Queries ({selectedIds.length})</Button>
                }
            </div> */}
            <div className="border rounded-xl overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {/* <TableHead className="w-[10px]"></TableHead> */}
                            <TableHead>#</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Raised By</TableHead>
                            <TableHead>Raised At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ratings</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((query, index) => (
                            <TableRow key={query._id}>
                                {/* <TableCell>
                                    {!query.assignedTo && (
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(query._id)}
                                            onChange={() => toggleSelect(query._id)}
                                        />
                                    )}
                                </TableCell> */}
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{query.title}</TableCell>
                                <TableCell>{query.raisedBy?.name || query.raisedBy?.email || query.raisedBy?.phoneNo || "User"}</TableCell>
                                <TableCell>
                                    {query.raisedAt ? format(new Date(query.raisedAt), "dd MMM yyyy, hh:mm a") : "-"}
                                </TableCell>
                                <TableCell>
                                    {query.isResolved ? (
                                        <Badge variant={'green'}>Resolved</Badge>
                                    ) : (
                                        <Badge variant={'destructive'}>Pending</Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {query.rating ? query.rating + "/10" : '-'}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            setSelectedQuery(query)
                                            setSheetOpen(true)
                                            console.log(query)
                                        }}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {/* <pre className="mt-4 text-sm text-muted-foreground">
                    Selected IDs: {JSON.stringify(selectedIds, null, 2)}
                </pre> */}
            </div>

            {/* <AssignQueryDialog
                open={assignDialog}
                onOpenChange={setAssignDialog}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
            /> */}

            {selectedQuery &&
                <QuerySheet
                    open={sheetOpen}
                    onOpenChange={setSheetOpen}
                    query={selectedQuery}
                />
            }
        </>
    )
}

export default QueryTable
