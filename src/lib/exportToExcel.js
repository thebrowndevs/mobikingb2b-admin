// lib/exportToExcel.js
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export function exportToExcel(columns, data, filename = 'report.xlsx') {
  // Ensure _id is always included
  const headers = Array.from(new Set([...columns, '_id']))
  // Map objects to only those keys, in order
  const rows = data.map((row) =>
    headers.reduce((acc, key) => {
      acc[key] = row[key]
      return acc
    }, {})
  )

  // Create worksheet & workbook
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Report')

  // Write and trigger download
  const wbout = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array'
  })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), filename)
}
