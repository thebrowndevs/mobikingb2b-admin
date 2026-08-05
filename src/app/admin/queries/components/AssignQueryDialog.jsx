import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { useQueries } from '@/hooks/useQueries'
import { useUsers } from '@/hooks/useUsers'
import LoaderButton from '@/components/custom/LoaderButton'

function AssignQueryDialog({ open, onOpenChange, selectedIds, setSelectedIds }) {
    const { assignQueries } = useQueries()
    const { usersQuery } = useUsers()
    const employees = usersQuery('employee')
    const allEmployees = employees.data?.data || []

    const [selectedEmployee, setSelectedEmployee] = useState('')

    async function handleAssign() {
        const data = {
            userId: selectedEmployee,
            queryIds: selectedIds
        }

        try {
            await assignQueries.mutateAsync(data)
            setSelectedEmployee('')
            setSelectedIds([])
            onOpenChange(false)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Queries</DialogTitle>
                </DialogHeader>

                <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>
                        <SelectContent>
                            {allEmployees.length > 0 ? (
                                allEmployees.map((item) => (
                                    <SelectItem key={item._id} value={item._id}>
                                        {item.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-sm text-muted-foreground">
                                    No employees found
                                </div>
                            )}
                        </SelectContent>
                    </Select>

                    <LoaderButton
                        loading={assignQueries.isPending}
                        onClick={handleAssign}
                        disabled={!selectedEmployee || assignQueries.isPending}
                    >
                        Assign
                    </LoaderButton>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AssignQueryDialog
