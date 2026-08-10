import { Button } from '@/components/ui/button'
import React from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, FileText } from 'lucide-react'

function SuccessMessage({ order, resetOrder, reset }) {
    const quotation = order;

    return (
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div className="flex items-start gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h2 className="text-emerald-800 font-extrabold text-base">POS Quotation Created Successfully</h2>
                    <p className="text-emerald-700 text-xs mt-1 font-medium">
                        Quotation ID: <span className="font-mono font-bold">{quotation?.quotationId}</span>
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                        Items: {quotation?.items?.length} | Total Amount: ₹{quotation?.orderAmount?.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-200 text-emerald-800 bg-white hover:bg-emerald-50/50 gap-1.5 text-xs font-bold rounded-lg h-9"
                    asChild
                >
                    <Link href={`/admin/quotations`}>
                        <FileText className="w-3.5 h-3.5" /> View Quotations
                    </Link>
                </Button>
                <Button
                    size="sm"
                    onClick={() => {
                        reset();
                        resetOrder(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-bold rounded-lg h-9"
                >
                    Create Another <ArrowRight className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    )
}

export default SuccessMessage