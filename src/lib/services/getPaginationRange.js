export function getPaginationRange(currentPage, totalPages) {
    const range = []
    const delta = 1

    const left = Math.max(2, currentPage - delta)
    const right = Math.min(totalPages - 1, currentPage + delta)

    range.push(1)

    if (left > 2) {
        range.push('ellipsis-left')
    }

    for (let i = left; i <= right; i++) {
        range.push(i)
    }

    if (right < totalPages - 1) {
        range.push('ellipsis-right')
    }

    if (totalPages > 1) {
        range.push(totalPages)
    }

    return range
}
