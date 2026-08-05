"use client"
import LoaderButton from '@/components/custom/LoaderButton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQueries } from '@/hooks/useQueries';
import React from 'react'

function CloseQueryDialog({ open, onOpenChange, queryId }) {
    const { closeQuery } = useQueries();

    const handleCloseQuery = async () => {
        try {
            await closeQuery.mutateAsync({ queryId: queryId })
            setMessage("")
            onOpenChange(false)
        } catch (error) {
            console.log(error)
        }
    }


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Close Query</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p>Are you sure you want to close this query?</p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>
                        Cancel
                    </Button>
                    <LoaderButton
                        loading={closeQuery.isPending}
                        disabled={closeQuery.isPending}
                        variant="destructive"
                        onClick={handleCloseQuery}
                    >
                        Close Query
                    </LoaderButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CloseQueryDialog