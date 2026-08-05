import React, { useEffect, useRef } from 'react'

export const DateInput = ({ value, onChange }) => {
    const [date, setDate] = React.useState(() => {
        const d = value ? new Date(value) : new Date()
        return {
            day: d.getDate(),
            month: d.getMonth() + 1,
            year: d.getFullYear()
        }
    })

    const monthRef = useRef(null)
    const dayRef = useRef(null)
    const yearRef = useRef(null)

    useEffect(() => {
        const d = value ? new Date(value) : new Date()
        setDate({
            day: d.getDate(),
            month: d.getMonth() + 1,
            year: d.getFullYear()
        })
    }, [value])

    const validateDate = (field, value) => {
        if (
            (field === 'day' && (value < 1 || value > 31)) ||
            (field === 'month' && (value < 1 || value > 12)) ||
            (field === 'year' && (value < 1000 || value > 9999))
        ) {
            return false
        }

        const newDate = { ...date, [field]: value }
        const d = new Date(newDate.year, newDate.month - 1, newDate.day)
        return (
            d.getFullYear() === newDate.year &&
            d.getMonth() + 1 === newDate.month &&
            d.getDate() === newDate.day
        )
    }

    const handleInputChange = (field) => (e) => {
        const newValue = e.target.value ? Number(e.target.value) : ''
        const isValid = typeof newValue === 'number' && validateDate(field, newValue)
        const newDate = { ...date, [field]: newValue }
        setDate(newDate)

        if (isValid) {
            onChange(new Date(newDate.year, newDate.month - 1, newDate.day))
        }
    }

    const initialDate = useRef(date)

    const handleBlur = (field) => (e) => {
        if (!e.target.value) {
            setDate(initialDate.current)
            return
        }

        const newValue = Number(e.target.value)
        const isValid = validateDate(field, newValue)

        if (!isValid) {
            setDate(initialDate.current)
        } else {
            initialDate.current = { ...date, [field]: newValue }
        }
    }

    const handleKeyDown = (field) => (e) => {
        if (e.metaKey || e.ctrlKey) return

        if (
            !/^[0-9]$/.test(e.key) &&
            ![
                'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab', 'Backspace', 'Enter'
            ].includes(e.key)
        ) {
            e.preventDefault()
            return
        }

        let newDate
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault()
            newDate = { ...date }
            const increment = e.key === 'ArrowUp' ? 1 : -1

            if (field === 'day') {
                const daysInMonth = new Date(date.year, date.month, 0).getDate()
                newDate.day = date.day === (increment === 1 ? daysInMonth : 1)
                    ? increment === 1
                        ? 1
                        : new Date(date.year, date.month - 1, 0).getDate()
                    : date.day + increment
                if (newDate.day === 1 && increment === 1 && date.day === daysInMonth) {
                    newDate.month = (date.month % 12) + 1
                    if (newDate.month === 1) newDate.year += 1
                }
                if (newDate.day !== date.day && increment === -1 && date.day === 1) {
                    newDate.month = date.month === 1 ? 12 : date.month - 1
                    if (newDate.month === 12) newDate.year -= 1
                }
            }

            if (field === 'month') {
                if (date.month === (increment === 1 ? 12 : 1)) {
                    newDate.month = increment === 1 ? 1 : 12
                    newDate.year = date.month === 12 ? date.year + 1 : date.year - 1
                } else {
                    newDate.month += increment
                }
            }

            if (field === 'year') {
                newDate.year += increment
            }

            setDate(newDate)
            onChange(new Date(newDate.year, newDate.month - 1, newDate.day))
        }

        if (e.key === 'ArrowRight' && e.currentTarget.selectionStart === e.currentTarget.value.length) {
            e.preventDefault()
            if (field === 'month') dayRef.current?.focus()
            if (field === 'day') yearRef.current?.focus()
        }

        if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) {
            e.preventDefault()
            if (field === 'day') monthRef.current?.focus()
            if (field === 'year') dayRef.current?.focus()
        }
    }

    return (
        <div className="flex border rounded-lg items-center text-sm px-1">
            <input
                type="text"
                ref={monthRef}
                maxLength={2}
                value={date.month}
                onChange={handleInputChange('month')}
                onKeyDown={handleKeyDown('month')}
                onFocus={(e) => window.innerWidth > 1024 && e.target.select()}
                onBlur={handleBlur('month')}
                className="p-0 outline-none w-6 text-center"
                placeholder="M"
            />
            <span className="opacity-20 -mx-px">/</span>
            <input
                type="text"
                ref={dayRef}
                maxLength={2}
                value={date.day}
                onChange={handleInputChange('day')}
                onKeyDown={handleKeyDown('day')}
                onFocus={(e) => window.innerWidth > 1024 && e.target.select()}
                onBlur={handleBlur('day')}
                className="p-0 outline-none w-7 text-center"
                placeholder="D"
            />
            <span className="opacity-20 -mx-px">/</span>
            <input
                type="text"
                ref={yearRef}
                maxLength={4}
                value={date.year}
                onChange={handleInputChange('year')}
                onKeyDown={handleKeyDown('year')}
                onFocus={(e) => window.innerWidth > 1024 && e.target.select()}
                onBlur={handleBlur('year')}
                className="p-0 outline-none w-12 text-center"
                placeholder="YYYY"
            />
        </div>
    )
}

DateInput.displayName = 'DateInput'
