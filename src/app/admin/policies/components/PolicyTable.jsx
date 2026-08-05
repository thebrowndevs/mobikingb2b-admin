import React from 'react'
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { IoMdRefresh } from 'react-icons/io';
import { FaPencilAlt } from 'react-icons/fa';

function PolicyTable({ policies, setSelected, openForm }) {
    // policyName, slug, heading, content, lastUpdated

    // console.log(policies)
    return (
        <section className="w-full">
            <Table>
                <TableHeader>
                    <TableRow className="text-primary">
                        <TableHead className="text-center">#</TableHead>
                        <TableHead className="text-center">Name</TableHead>
                        <TableHead className="text-center">Heading</TableHead>
                        <TableHead className="text-center">Last Updated</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {policies?.map((item, idx) => (
                        <TableRow
                            key={item._id}
                            className="hover:bg-gray-50 transition border"
                        >
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell className="text-center">{item.policyName}</TableCell>
                            <TableCell className="text-center max-w-[160px] text-wrap"><p className="text-wrap">{item.heading}</p></TableCell>
                            <TableCell className="text-center">{format(item.lastUpdated, 'dd MMM yyyy')}</TableCell>

                            <TableCell >
                                <div className="flex gap-2 items-center justify-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSelected(item)
                                            openForm(true)
                                        }}
                                    >
                                        <FaPencilAlt size={16} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </section>
    )
}

export default PolicyTable
