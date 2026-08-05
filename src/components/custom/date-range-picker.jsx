/* eslint-disable max-lines */
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar } from '../ui/calendar'
// import { ChevronUpIcon, ChevronDownIcon, CheckIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { DateInput } from './date-input'
import { ChevronUpIcon, ChevronDownIcon, CheckIcon } from 'lucide-react'

const formatDate = (date, locale = 'en-US') =>
    date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })

const getDateAdjustedForTimezone = (dateInput) => {
    if (typeof dateInput === 'string') {
        const parts = dateInput.split('-').map((p) => parseInt(p, 10))
        return new Date(parts[0], parts[1] - 1, parts[2])
    }
    return dateInput
}

const PRESETS = [
    { name: 'today', label: 'Today' },
    { name: 'yesterday', label: 'Yesterday' },
    { name: 'last7', label: 'Last 7 days' },
    { name: 'last14', label: 'Last 14 days' },
    { name: 'last30', label: 'Last 30 days' },
    { name: 'thisWeek', label: 'This Week' },
    { name: 'lastWeek', label: 'Last Week' },
    { name: 'thisMonth', label: 'This Month' },
    { name: 'lastMonth', label: 'Last Month' }
]

export const DateRangePicker = ({
    onUpdate,
    initialDateFrom = new Date(new Date().setHours(0, 0, 0, 0)),
    initialDateTo,
    align = 'end',
    locale = 'en-US'
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [range, setRange] = useState({
        from: getDateAdjustedForTimezone(initialDateFrom),
        to: initialDateTo
            ? getDateAdjustedForTimezone(initialDateTo)
            : getDateAdjustedForTimezone(initialDateFrom)
    })
    const [selectedPreset, setSelectedPreset] = useState()
    const openedRangeRef = useRef()

    const [isSmallScreen, setIsSmallScreen] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 960 : false
    )

    useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth < 960)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const getPresetRange = (name) => {
        const from = new Date()
        const to = new Date()
        const firstDay = from.getDate() - from.getDay()

        switch (name) {
            case 'today':
                from.setHours(0, 0, 0, 0)
                to.setHours(23, 59, 59, 999)
                break
            case 'yesterday':
                from.setDate(from.getDate() - 1)
                from.setHours(0, 0, 0, 0)
                to.setDate(to.getDate() - 1)
                to.setHours(23, 59, 59, 999)
                break
            case 'last7':
                from.setDate(from.getDate() - 6)
                from.setHours(0, 0, 0, 0)
                to.setHours(23, 59, 59, 999)
                break
            case 'last14':
                from.setDate(from.getDate() - 13)
                from.setHours(0, 0, 0, 0)
                to.setHours(23, 59, 59, 999)
                break
            case 'last30':
                from.setDate(from.getDate() - 29)
                from.setHours(0, 0, 0, 0)
                to.setHours(23, 59, 59, 999)
                break
            case 'thisWeek':
                from.setDate(firstDay)
                from.setHours(0, 0, 0, 0)
                to.setHours(23, 59, 59, 999)
                break
            case 'lastWeek':
                from.setDate(from.getDate() - 7 - from.getDay())
                to.setDate(to.getDate() - to.getDay() - 1)
                from.setHours(0, 0, 0, 0)
                to.setHours(23, 59, 59, 999)
                break
            case 'thisMonth':
                from.setDate(1)
                from.setHours(0, 0, 0, 0)
                to.setHours(23, 59, 59, 999)
                break
            case 'lastMonth':
                from.setMonth(from.getMonth() - 1)
                from.setDate(1)
                from.setHours(0, 0, 0, 0)
                to.setDate(0)
                to.setHours(23, 59, 59, 999)
                break
            default:
                break
        }
        return { from, to }
    }

    const setPreset = (name) => {
        const p = getPresetRange(name)
        setRange(p)
    }

    const checkPreset = () => {
        const match = PRESETS.find((p) => {
            const pr = getPresetRange(p.name)
            return (
                range.from.setHours(0, 0, 0, 0) === pr.from.setHours(0, 0, 0, 0) &&
                range.to.setHours(0, 0, 0, 0) === pr.to.setHours(0, 0, 0, 0)
            )
        })
        setSelectedPreset(match ? match.name : undefined)
    }

    useEffect(() => checkPreset(), [range])
    useEffect(() => {
        if (isOpen) openedRangeRef.current = range
    }, [isOpen])

    const PresetButton = ({ name, label, isSelected }) => (
        <Button
            className={cn(isSelected && 'pointer-events-none')}
            variant="ghost"
            onClick={() => setPreset(name)}
        >
            <>
                <span className={cn('pr-2 opacity-0', isSelected && 'opacity-70')}>
                    <CheckIcon width={18} height={18} />
                </span>
                {label}
            </>
        </Button>
    )

    return (
        <Popover
            modal
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) setRange(openedRangeRef.current)
                setIsOpen(open)
            }}
        >
            <PopoverTrigger asChild>
                <Button size="lg" variant="outline">
                    <div className="text-right">
                        <div className="py-1">
                            <div>{`${formatDate(range.from, locale)} - ${formatDate(
                                range.to,
                                locale
                            )}`}</div>
                        </div>
                    </div>
                    <div className="pl-1 opacity-60 -mr-2 scale-125">
                        {isOpen ? <ChevronUpIcon width={24} /> : <ChevronDownIcon width={24} />}
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent align={align} className="w-auto">
                <div className="flex py-2">
                    <div className="flex flex-col">
                        <div className="flex gap-2 px-3 pb-4 justify-end items-center">
                            <DateInput
                                value={range.from}
                                onChange={(date) => {
                                    const toDate = date > range.to ? date : range.to
                                    setRange({ from: date, to: toDate })
                                }}
                            />
                            <div className="py-1">-</div>
                            <DateInput
                                value={range.to}
                                onChange={(date) => {
                                    const fromDate = date < range.from ? date : range.from
                                    setRange({ from: fromDate, to: date })
                                }}
                            />
                        </div>
                        {isSmallScreen && (
                            <select
                                value={selectedPreset}
                                onChange={(e) => setPreset(e.target.value)}
                                className="w-[180px] mx-auto mb-2"
                            >
                                <option value="">Select...</option>
                                {PRESETS.map((p) => (
                                    <option key={p.name} value={p.name}>
                                        {p.label}
                                    </option>
                                ))}
                            </select>
                        )}
                        <Calendar
                            mode="range"
                            onSelect={(value) =>
                                value?.from && setRange({ from: value.from, to: value.to })
                            }
                            selected={range}
                            numberOfMonths={isSmallScreen ? 1 : 2}
                            defaultMonth={new Date(
                                new Date().setMonth(new Date().getMonth() - (isSmallScreen ? 0 : 1))
                            )}
                        />
                    </div>
                    {!isSmallScreen && (
                        <div className="flex flex-col items-end gap-1 pr-2 pl-6 pb-6">
                            {PRESETS.map((p) => (
                                <PresetButton
                                    key={p.name}
                                    name={p.name}
                                    label={p.label}
                                    isSelected={selectedPreset === p.name}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 py-2 pr-4">
                    <Button
                        variant="ghost"
                        onClick={() => setsIsOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            setIsOpen(false)
                            if (range !== openedRangeRef.current) {
                                onUpdate && onUpdate({ range })
                            }
                        }}
                    >
                        Update
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

DateRangePicker.displayName = 'DateRangePicker'
