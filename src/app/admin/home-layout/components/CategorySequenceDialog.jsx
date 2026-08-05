// app/design-studio/components/CategorySequenceDialog.jsx
'use client'
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command'
import { Reorder, AnimatePresence } from 'framer-motion'

export default function CategorySequenceDialog({ allCategories = [], initialCategories = [], onSave }) {
  const [open, setOpen] = useState(false)
  const [ordered, setOrdered] = useState([])
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (open) {
      setOrdered(initialCategories)
      setAdding(false)
      setFilter('')
    }
  }, [open, initialCategories])

  const toggleAdd = (id) => {
    setOrdered((list) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Edit Sequence</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reorder & Add Categories</DialogTitle>
        </DialogHeader>

        {/* Reorderable list */}
        <Reorder.Group
          as="div"
          axis="y"
          values={ordered}
          onReorder={setOrdered}
          className="space-y-2 mb-4"
        >
          <AnimatePresence>
            {ordered.length ? (
              ordered.map((id) => {
                const cat = allCategories.find((c) => c._id === id) || {}
                return (
                  <Reorder.Item
                    key={id}
                    value={id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    whileDrag={{ scale: 1.02 }}
                    className="p-3 border rounded bg-white flex justify-between items-center cursor-grab"
                  >
                    <span>{cat.name || 'Unknown'}</span>
                    <Button size="icon" variant="ghost" onClick={() => toggleAdd(id)}>
                      Remove
                    </Button>
                  </Reorder.Item>
                )
              })
            ) : (
              <p className="text-sm text-gray-500">No categories in sequence</p>
            )}
          </AnimatePresence>
        </Reorder.Group>

        {/* Add/Search panel */}
        <div className="mb-6">
          <Button size="sm" variant="outline" onClick={() => setAdding((v) => !v)}>
            {adding ? 'Close add panel' : 'Add Category'}
          </Button>
          {adding && (
            <Command className="mt-2">
              <CommandInput
                placeholder="Search categories..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <CommandList>
                <CommandEmpty>No categories found</CommandEmpty>
                {allCategories
                  .filter((c) => c.name.toLowerCase().includes(filter.toLowerCase()))
                  .map((c) => (
                    <CommandItem key={c._id} onSelect={() => toggleAdd(c._id)} className="flex items-center">
                      <input
                        type="checkbox"
                        readOnly
                        checked={ordered.includes(c._id)}
                        className="mr-2 w-4 h-4"
                      />
                      {c.name}
                    </CommandItem>
                  ))}
              </CommandList>
            </Command>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onSave(ordered)
              setOpen(false)
            }}
          >
            Save Categories
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
