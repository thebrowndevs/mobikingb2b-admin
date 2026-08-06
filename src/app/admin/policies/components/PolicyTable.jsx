import React from 'react';
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
import { FaPencilAlt } from 'react-icons/fa';

function PolicyTable({ policies, setSelected, openForm }) {
    return (
        <section className="w-full bg-back2 border border-bdr2 rounded-xl overflow-hidden">
            <Table containerClassName="border-0 bg-transparent">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-16">#</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Name</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Heading</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Last Updated</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-28">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {policies?.map((item, idx) => (
                        <TableRow
                            key={item._id}
                            className="hover:bg-slate-50/40 transition-colors"
                        >
                            <TableCell className="text-center font-medium text-slate-400 py-3.5">{idx + 1}</TableCell>
                            <TableCell className="text-left py-3.5">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    {item.policyName}
                                </span>
                            </TableCell>
                            <TableCell className="text-left py-3.5 max-w-[280px]">
                                <p className="text-sm font-medium text-slate-800 truncate" title={item.heading}>
                                    {item.heading}
                                </p>
                            </TableCell>
                            <TableCell className="text-center text-sm text-slate-500 py-3.5">
                                {format(new Date(item.lastUpdated), 'dd MMM yyyy')}
                            </TableCell>
                            <TableCell className="py-3.5">
                                <div className="flex items-center justify-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all"
                                        onClick={() => {
                                            setSelected(item);
                                            openForm(true);
                                        }}
                                        title="Edit Policy"
                                    >
                                        <FaPencilAlt size={13} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {(!policies || policies.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-slate-400 font-medium">
                                No policies found. Create a new policy to get started.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </section>
    );
}

export default PolicyTable;
