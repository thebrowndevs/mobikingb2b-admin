'use client'

import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  Loader2,
  Sparkles,
  ChevronRight,
  Copy,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { toast } from 'sonner'

export default function ProductBulkUploadDialog({ open, onOpenChange, onSuccess }) {
  const [step, setStep] = useState(1) // 1: Upload, 2: Review, 3: Success Logs
  const [activeTab, setActiveTab] = useState('mismatches') // 'mismatches' | 'duplicates' | 'correct'
  const [file, setFile] = useState(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [validationResult, setValidationResult] = useState(null)

  // Mapping state: key is rowNum, value is { brand: string, category: string }
  const [mappings, setMappings] = useState({})
  // Duplicate action: 'skip' or 'create'
  const [duplicateAction, setDuplicateAction] = useState('skip')

  const fileInputRef = useRef(null)

  const resetState = () => {
    setStep(1)
    setActiveTab('mismatches')
    setFile(null)
    setValidationResult(null)
    setMappings({})
    setDuplicateAction('skip')
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      handleValidate(selectedFile)
    }
  }

  const handleValidate = async (selectedFile) => {
    setIsValidating(true)
    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const res = await api.post("/products/bulk-upload/validate", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      const result = res.data?.data
      setValidationResult(result)

      // Initialize default mappings for mismatched rows
      const initialMappings = {}
      result.mismatched?.forEach(item => {
        initialMappings[item.rowNum] = {
          brand: item.brandMissing ? "create" : (item.row.brand || "create"),
          category: item.categoryMissing ? "create" : (item.row.category || "create")
        }
      })
      setMappings(initialMappings)

      // Set active tab based on what issues exist
      if (result.mismatched?.length > 0) {
        setActiveTab('mismatches')
      } else if (result.duplicates?.length > 0) {
        setActiveTab('duplicates')
      } else {
        setActiveTab('correct')
      }
      setStep(2)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to validate spreadsheet file")
      setFile(null)
    } finally {
      setIsValidating(false)
    }
  }

  const handleMappingChange = (rowNum, field, value) => {
    setMappings(prev => ({
      ...prev,
      [rowNum]: {
        ...prev[rowNum],
        [field]: value
      }
    }))
  }

  const handleConfirmUpload = async () => {
    setIsUploading(true)
    const finalRows = []

    // 1. Correct rows
    validationResult.correct?.forEach(item => {
      finalRows.push(item)
    })

    // 2. Mismatched rows with mappings applied
    validationResult.mismatched?.forEach(item => {
      const mapped = mappings[item.rowNum] || {}
      const correctedRow = { ...item.row }

      if (mapped.brand && mapped.brand !== "create") {
        correctedRow.brand = mapped.brand
      }
      if (mapped.category && mapped.category !== "create") {
        correctedRow.category = mapped.category
      }

      finalRows.push({
        rowNum: item.rowNum,
        row: correctedRow
      })
    })

    // 3. Duplicate rows based on selection
    if (duplicateAction === 'create') {
      validationResult.duplicates?.forEach(item => {
        finalRows.push(item)
      })
    }

    try {
      const res = await api.post("/products/bulk-upload/confirm", { rows: finalRows })
      toast.success(res.data?.message || "Products imported successfully")
      setValidationResult(prev => ({
        ...prev,
        confirmLogs: res.data?.data
      }))
      setStep(3)
      if (onSuccess) onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || "Confirming bulk upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {
      onOpenChange(v)
      if (!v) resetState()
    }}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto bg-white border-slate-200 text-slate-800 p-0 rounded-xl shadow-xl flex flex-col">
        {/* Header Block */}
        <div className="p-6 border-b border-slate-150 bg-slate-50/50 rounded-t-xl shrink-0 flex items-center justify-between">
          <div className="space-y-1">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                <FileSpreadsheet className="h-5 w-5" />
              </span>
              Product Bulk Import
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Upload spreadsheets to quickly import products, specifications, and variants.
            </DialogDescription>
          </div>

          {/* Progress Steps Indicators */}
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider border transition-all ${step >= 1 ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-100 text-slate-400 border-slate-200/50"}`}>1. Upload File</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider border transition-all ${step >= 2 ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-100 text-slate-400 border-slate-200/50"}`}>2. Review & Match</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider border transition-all ${step >= 3 ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-100 text-slate-400 border-slate-200/50"}`}>3. Complete Import</span>
          </div>
        </div>

        {/* STEP 1: DROPZONE / UPLOADING */}
        {step === 1 && (
          <div className="p-8 flex-1 flex flex-col items-center justify-center">
            {isValidating ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-4 border-t-indigo-600 border-slate-200 animate-spin" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-slate-700">Validating Spreadsheet Rows...</p>
                  <p className="text-[10px] text-slate-500 max-w-sm">Checking database for matching brands, subcategories, and duplicates.</p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-2xl border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-16 flex flex-col items-center gap-5 cursor-pointer bg-slate-50/30 hover:bg-slate-55/60 transition-all text-center group"
              >
                <div className="p-5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 group-hover:scale-105 transition-transform">
                  <Upload size={32} />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-800">Upload Spreadsheet Sheet</h4>
                  <p className="text-[10px] text-slate-500">Drag and drop your spreadsheet here or click to browse files</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-[9px] font-mono tracking-wider bg-slate-100 text-slate-600 border-slate-200">.XLSX</Badge>
                  <Badge variant="secondary" className="text-[9px] font-mono tracking-wider bg-slate-100 text-slate-600 border-slate-200">.CSV</Badge>
                  <Badge variant="secondary" className="text-[9px] font-mono tracking-wider bg-slate-100 text-slate-600 border-slate-200">.ODS</Badge>
                </div>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .ods, .csv"
                  className="hidden"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 2: MULTI-TAB MAPPING & REVIEW PANEL */}
        {step === 2 && validationResult && (
          <div className="p-6 flex-1 flex flex-col gap-6 overflow-hidden min-h-0">
            {/* Quick Status Count Widgets */}
            <div className="grid grid-cols-3 gap-4 shrink-0">
              <button
                onClick={() => setActiveTab('mismatches')}
                className={`p-4 rounded-xl text-left border transition-all flex items-center justify-between ${activeTab === 'mismatches'
                  ? "bg-amber-50 border-amber-250 text-amber-800 shadow-sm"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider block">Mismatched Mappings</span>
                  <span className="text-2xl font-black block leading-none">{validationResult.summary.mismatchedCount}</span>
                </div>
                <AlertTriangle className={`h-7 w-7 ${activeTab === 'mismatches' ? 'text-amber-500' : 'text-slate-400'}`} />
              </button>

              <button
                onClick={() => setActiveTab('duplicates')}
                className={`p-4 rounded-xl text-left border transition-all flex items-center justify-between ${activeTab === 'duplicates'
                  ? "bg-red-50 border-red-200 text-red-800 shadow-sm"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider block">Duplicate Names</span>
                  <span className="text-2xl font-black block leading-none">{validationResult.summary.duplicatesCount}</span>
                </div>
                <Copy className={`h-7 w-7 ${activeTab === 'duplicates' ? 'text-red-500' : 'text-slate-400'}`} />
              </button>

              <button
                onClick={() => setActiveTab('correct')}
                className={`p-4 rounded-xl text-left border transition-all flex items-center justify-between ${activeTab === 'correct'
                  ? "bg-green-50 border-green-200 text-green-800 shadow-sm"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider block">Correct Rows</span>
                  <span className="text-2xl font-black block leading-none">{validationResult.summary.correctCount}</span>
                </div>
                <CheckCircle2 className={`h-7 w-7 ${activeTab === 'correct' ? 'text-green-500' : 'text-slate-400'}`} />
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 flex flex-col min-h-0">

              {/* TAB 1: MISMATCHED EDITOR */}
              {activeTab === 'mismatches' && (
                <div className="flex-1 flex flex-col min-h-0 gap-3">
                  <div className="flex items-center justify-between shrink-0">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800">Resolve Mismatches</h4>
                      <p className="text-[10px] text-slate-500">The spreadsheet contains brand or subcategory values not present in the system. Select from existing entries or let the system auto-create them.</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/50">
                    {validationResult.mismatched.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 italic text-xs font-medium">No mismatched brand or category rows detected.</div>
                    ) : (
                      <table className="w-full border-collapse text-[11px] text-left">
                        <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 sticky top-0 z-10">
                          <tr>
                            <th className="p-3 w-16 text-center">Row</th>
                            <th className="p-3">Spreadsheet Entry</th>
                            <th className="p-3 w-64">Map / Create Brand</th>
                            <th className="p-3 w-64">Map / Create SubCategory</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validationResult.mismatched.map((item) => {
                            const curMapping = mappings[item.rowNum] || {}
                            return (
                              <tr key={item.rowNum} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-100/30">
                                <td className="p-3 text-center font-mono font-bold text-slate-500">{item.rowNum}</td>
                                <td className="p-3 max-w-[240px] truncate space-y-1">
                                  <p className="font-bold text-slate-800 truncate" title={item.row.fullName}>{item.row.fullName}</p>
                                  <div className="flex gap-1.5 flex-wrap items-center">
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">Brand: {item.row.brand || "—"}</span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">SubCat: {item.row.category || "—"}</span>
                                  </div>
                                  <span className="text-[9px] text-amber-600 font-medium block">
                                    Error: {item.reason}
                                  </span>
                                </td>

                                {/* Brand Selection Dropdown */}
                                <td className="p-3 align-middle">
                                  <Select
                                    value={curMapping.brand}
                                    onValueChange={(val) => handleMappingChange(item.rowNum, 'brand', val)}
                                  >
                                    <SelectTrigger className="h-8 text-[10px] bg-white border-slate-200 text-slate-700">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="text-[10px] bg-white border-slate-200 text-slate-700">
                                      <SelectItem value="create">Auto-Create "{item.row.brand || "New Brand"}"</SelectItem>
                                      {validationResult.options.brands.map(b => (
                                        <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>

                                {/* Category Selection Dropdown */}
                                <td className="p-3 align-middle">
                                  <Select
                                    value={curMapping.category}
                                    onValueChange={(val) => handleMappingChange(item.rowNum, 'category', val)}
                                  >
                                    <SelectTrigger className="h-8 text-[10px] bg-white border-slate-200 text-slate-700">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="text-[10px] bg-white border-slate-200 text-slate-700">
                                      <SelectItem value="create">Auto-Create "{item.row.category || "New SubCategory"}"</SelectItem>
                                      {validationResult.options.subCategories.map(s => (
                                        <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: DUPLICATES LIST */}
              {activeTab === 'duplicates' && (
                <div className="flex-1 flex flex-col min-h-0 gap-3">
                  <div className="flex items-center justify-between shrink-0">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800">Duplicate Products</h4>
                      <p className="text-[10px] text-slate-500 font-medium">These product names already exist in the store catalog.</p>
                    </div>
                    {/* Duplicate Action Config */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-semibold">Duplicate Action:</span>
                      <Select
                        value={duplicateAction}
                        onValueChange={setDuplicateAction}
                      >
                        <SelectTrigger className="h-8 w-48 text-[10px] bg-white border-slate-200 text-slate-700 font-semibold shadow-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-[10px] bg-white border-slate-200 text-slate-750">
                          <SelectItem value="skip">Skip duplicate products</SelectItem>
                          <SelectItem value="create">Import as new products</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/50">
                    {validationResult.duplicates.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 italic text-xs font-medium">No duplicate rows detected.</div>
                    ) : (
                      <table className="w-full border-collapse text-[11px] text-left">
                        <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 sticky top-0 z-10">
                          <tr>
                            <th className="p-3 w-16 text-center">Row</th>
                            <th className="p-3">Spreadsheet Product Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3 w-36 text-center">Import Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validationResult.duplicates.map((item) => (
                            <tr key={item.rowNum} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-100/30">
                              <td className="p-3 text-center font-mono font-bold text-slate-500">{item.rowNum}</td>
                              <td className="p-3 font-semibold text-slate-800">{item.row.fullName}</td>
                              <td className="p-3 text-slate-600">{item.row.category || "—"}</td>
                              <td className="p-3 text-center">
                                <Badge variant="outline" className={`text-[9px] uppercase font-bold shadow-none rounded ${duplicateAction === 'skip' ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-indigo-50 text-indigo-700 border-indigo-150"
                                  }`}>
                                  {duplicateAction === 'skip' ? "Skip Row" : "Create New"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CORRECT ROWS */}
              {activeTab === 'correct' && (
                <div className="flex-1 flex flex-col min-h-0 gap-3">
                  <div className="space-y-0.5 shrink-0">
                    <h4 className="text-xs font-bold text-slate-800">Correct Rows</h4>
                    <p className="text-[10px] text-slate-500 font-medium font-medium">These rows are formatted correctly and ready for import.</p>
                  </div>

                  <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/50">
                    {validationResult.correct.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 italic text-xs font-medium">No correct rows found. Resolve mismatches to make them valid.</div>
                    ) : (
                      <table className="w-full border-collapse text-[11px] text-left">
                        <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 sticky top-0 z-10">
                          <tr>
                            <th className="p-3 w-16 text-center">Row</th>
                            <th className="p-3">Product Name</th>
                            <th className="p-3">Brand</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Variants</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validationResult.correct.map((item) => (
                            <tr key={item.rowNum} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-100/30">
                              <td className="p-3 text-center font-mono font-bold text-slate-500">{item.rowNum}</td>
                              <td className="p-3 font-semibold text-slate-800">{item.row.fullName}</td>
                              <td className="p-3 text-slate-600">{item.row.brand || "—"}</td>
                              <td className="p-3 text-slate-600">{item.row.category || "—"}</td>
                              <td className="p-3">
                                <span className="text-[10px] text-indigo-600 font-semibold">{item.row.variantNames || "—"}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* STEP 3: SYNC COMPLETION & RESULTS LOGS */}
        {step === 3 && validationResult?.confirmLogs && (
          <div className="p-6 flex-1 flex flex-col gap-5 overflow-hidden min-h-0">
            {/* Completion Widget */}
            <div className="p-5 border border-green-200 bg-green-50/30 rounded-xl flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-700 rounded-xl border border-green-200">
                  <CheckCircle2 size={24} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">Products Imported</h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Processed {validationResult.confirmLogs.summary.totalProcessed} products:
                    <span className="text-green-700 font-bold ml-1">{validationResult.confirmLogs.summary.success} successful</span>,
                    <span className="text-red-500 font-bold ml-1">{validationResult.confirmLogs.summary.failed} failed</span>.
                  </p>
                </div>
              </div>

              <div>
                <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 font-bold text-[9px]">Linked Inventory Created</Badge>
              </div>
            </div>

            {/* Detailed Sync logs */}
            <div className="flex-1 flex flex-col min-h-0 gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Import Logs</span>
              <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/50">
                <table className="w-full border-collapse text-[10px] text-left">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 sticky top-0 z-10">
                    <tr>
                      <th className="p-3 w-20">Status</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3 w-48">Result details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationResult.confirmLogs.logs.map((log, idx) => (
                      <tr key={idx} className="border-b border-slate-200 last:border-b-0">
                        <td className="p-3">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border ${log.status === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                            }`}>
                            {log.status === "success" ? "Success" : "Failed"}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{log.fullName || `Row ${log.rowNum}`}</td>
                        <td className="p-3 text-slate-500 font-medium">{log.action || log.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/30 shrink-0 flex items-center justify-between rounded-b-xl">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs"
          >
            {step === 3 ? "Close" : "Cancel"}
          </Button>

          {step === 2 && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs"
              >
                Change File
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmUpload}
                disabled={isUploading}
                className="bg-indigo-650 bg-indigo-700 text-white font-bold text-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Start Import
                    <ArrowRight size={12} className="ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
