// app/design-studio/components/GroupSequenceDialog.jsx
'use client'
import React, { useEffect, useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command'
import { Reorder, AnimatePresence, motion } from 'framer-motion'

export default function GroupSequenceDialog({ allGroups = [], initialGroups = [], onSave }) {
  const [open, setOpen] = useState(false)
  const [ordered, setOrdered] = useState([])
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState('')


  useEffect(() => {
    if (open) {
      setOrdered(initialGroups)
      setAdding(false)
      setFilter('')
    }
  }, [open, initialGroups])

  const toggleAdd = (id) => {
    setOrdered((list) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    )
  }

  const handleReorder = (newOrder) => {
    setOrdered(newOrder)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Edit</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reorder & Add Groups</DialogTitle>
        </DialogHeader>

        {/* Reorderable list via Framer Motion */}
        <Reorder.Group
          axis="y"
          values={ordered}
          onReorder={handleReorder}
          className="space-y-2 mb-4"
        >
          <AnimatePresence>
            {ordered.length > 0 ? (
              ordered.map((id) => {
                const grp = allGroups.find((g) => g._id === id) || {}
                return (
                  <Reorder.Item
                    key={id}
                    value={id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    whileDrag={{ scale: 1.02, boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' }}
                  >
                    <div className="flex justify-between items-center p-3 border rounded bg-white">
                      <motion.span dragListener={false}>{grp.name || 'Unknown'}</motion.span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleAdd(id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </Reorder.Item>
                )
              })
            ) : (
              <p className="text-sm text-gray-500">No groups in sequence</p>
            )}
          </AnimatePresence>
        </Reorder.Group>

        {/* add/search panel */}
        <div className="mt-2 mb-6">
          <Button size="sm" variant="outline" onClick={() => setAdding((v) => !v)}>
            {adding ? 'Close add panel' : 'Add Group'}
          </Button>
          {adding && (
            <Command className="mt-2">
              <CommandInput
                placeholder="Search groups..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <CommandList>
                <CommandEmpty>No groups found</CommandEmpty>
                {allGroups
                  .filter((g) => g.name.toLowerCase().includes(filter.toLowerCase()))
                  .map((g) => (
                    <CommandItem
                      key={g._id}
                      onSelect={() => toggleAdd(g._id)}
                      className="flex items-center"
                    >
                      <input
                        type="checkbox"
                        readOnly
                        checked={ordered.includes(g._id)}
                        className="mr-2 w-4 h-4"
                      />
                      {g.name}
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
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
