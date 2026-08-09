'use client';

import React, { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';
import { Loader2, Plus, X } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { getPaginationRange } from '@/lib/services/getPaginationRange';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from "@/components/ui/pagination";

function GroupCategoriesSheet({ open, onOpenChange, group, onSave, isSaving }) {
    const { categoriesPaginationQuery } = useCategories();

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    const [selectedIds, setSelectedIds] = useState([]); // ids
    const [visibleItems, setVisibleItems] = useState([]); // objects (orderable)

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Fetch categories with search and page parameters
    const catQuery = categoriesPaginationQuery({
        page,
        limit,
        searchQuery: debouncedSearch
    });

    const categoriesList = catQuery.data?.categories || [];
    const totalPages = catQuery.data?.pagination?.totalPages || 1;
    const paginationRange = getPaginationRange(page, totalPages);

    // Load initial selection when sheet opens
    useEffect(() => {
        if (!open || !group) return;
        const ids = (group.parentCategories ?? []).map(c => (typeof c === 'string' ? c : (c._id || c)));
        setSelectedIds(ids);

        const objs = ids.map(id => {
            const foundInGroup = (group.parentCategories ?? []).find(c => typeof c === 'object' && c?._id === id);
            const foundInList = categoriesList.find(c => (c._id || c) === id);
            return foundInGroup || foundInList || { _id: id, name: `Category ID: ${id}` };
        });
        setVisibleItems(objs.filter(Boolean));
    }, [open]);

    const isSelected = (id) => selectedIds.includes(id);

    const addItem = (item) => {
        const id = item._id;
        if (isSelected(id)) return;
        setSelectedIds(prev => [...prev, id]);
        setVisibleItems(prev => [...prev, item]);
    };

    const removeItemById = (id) => {
        setSelectedIds(prev => prev.filter(x => x !== id));
        setVisibleItems(prev => prev.filter(x => (x._id || x) !== id));
    };

    const handleSaveClick = async () => {
        if (!group?._id) return;
        try {
            const finalIds = visibleItems.map(item => item._id || item);
            await onSave({
                id: group._id,
                data: {
                    parentCategories: finalIds
                }
            });
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to save layout category assignments:", err);
        }
    };

    const isLoading = catQuery.isLoading || catQuery.isFetching;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[95vw] md:min-w-[85vw] overflow-hidden pb-1 flex flex-col items-start justify-start gap-0">
                <SheetHeader className="pb-0">
                    <SheetTitle>{group?.heading || 'Group Categories'}</SheetTitle>
                    <SheetDescription>Select and drag to reorder categories displayed under this layout group.</SheetDescription>
                </SheetHeader>

                <div className="px-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full pb-10 relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/75 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                            <p className="text-slate-600 text-sm font-medium">Fetching categories, please wait...</p>
                        </div>
                    )}

                    {/* LEFT: Available categories */}
                    <div className="border border-bdr2 rounded-xl p-3 flex flex-col h-[78vh] bg-back2">
                        <div className="flex items-center gap-2 mb-3">
                            <Label className="min-w-0 flex-1 font-semibold text-xs text-slate-600">Available Categories</Label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name..."
                                className="border border-bdr2 rounded-lg px-3 py-1 w-full md:w-2/3 text-xs bg-back1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex-1 overflow-auto pr-1">
                            {categoriesList.length === 0 && (
                                <p className="text-xs text-slate-400 italic p-3 text-center">No categories found.</p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {categoriesList.map(item => {
                                    const id = item._id;
                                    const selected = isSelected(id);
                                    return (
                                        <div
                                            key={id}
                                            className={cn(
                                                "flex gap-3 p-2 border rounded-xl items-center bg-back1 transition-all",
                                                selected ? "border-indigo-400 bg-indigo-50/10" : "border-bdr2 hover:border-slate-300"
                                            )}
                                        >
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-10 h-10 object-cover rounded-lg border border-bdr2 bg-white"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg border border-bdr2 bg-white flex items-center justify-center text-xs text-slate-350 font-bold">
                                                    -
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                                                <p className="text-[10px] text-slate-400 font-mono truncate">{item.slug}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => addItem(item)}
                                                disabled={selected}
                                                className="h-8 w-8 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg disabled:opacity-50 shrink-0"
                                            >
                                                <Plus size={16} />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Pagination footer */}
                        {totalPages > 1 && (
                            <div className="border-t border-bdr2 pt-2 mt-2 flex justify-end">
                                <Pagination className="inline justify-end mx-1 w-fit">
                                    <PaginationContent>
                                        {page > 1 && (
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); setPage(p => p - 1); }}
                                                    className="h-7 text-[10px]"
                                                />
                                            </PaginationItem>
                                        )}
                                        {paginationRange.map((p, i) => (
                                            <PaginationItem key={i}>
                                                {p === 'ellipsis-left' || p === 'ellipsis-right' ? (
                                                    <PaginationEllipsis />
                                                ) : (
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={p === page}
                                                        onClick={(e) => { e.preventDefault(); setPage(p); }}
                                                        className="h-7 w-7 text-[10px]"
                                                    >
                                                        {p}
                                                    </PaginationLink>
                                                )}
                                            </PaginationItem>
                                        ))}
                                        {page < totalPages && (
                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); setPage(p => p + 1); }}
                                                    className="h-7 text-[10px]"
                                                />
                                            </PaginationItem>
                                        )}
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Selected categories (Reorderable) */}
                    <div className="border border-bdr2 rounded-xl p-3 flex flex-col h-[78vh] bg-back2">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-slate-700">Assigned Categories ({visibleItems.length})</span>
                            {visibleItems.length > 0 && (
                                <button
                                    onClick={() => { setSelectedIds([]); setVisibleItems([]); }}
                                    className="text-[10px] font-bold text-red-650 hover:underline"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-auto pr-1">
                            {visibleItems.length === 0 ? (
                                <p className="text-xs text-slate-400 italic p-3 text-center">No categories assigned to this group yet.</p>
                            ) : (
                                <Reorder.Group values={visibleItems} onReorder={setVisibleItems} className="space-y-2">
                                    {visibleItems.map(item => {
                                        const id = item._id || item;
                                        return (
                                            <Reorder.Item
                                                key={id}
                                                value={item}
                                                className="flex gap-3 p-2.5 border border-bdr2 rounded-xl items-center bg-back1 cursor-grab active:cursor-grabbing hover:border-slate-350 transition-colors"
                                            >
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-8 h-8 object-cover rounded-lg border border-bdr2 bg-white"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg border border-bdr2 bg-white flex items-center justify-center text-[10px] text-slate-350 font-bold">
                                                        -
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeItemById(id)}
                                                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg shrink-0"
                                                >
                                                    <X size={14} />
                                                </Button>
                                            </Reorder.Item>
                                        );
                                    })}
                                </Reorder.Group>
                            )}
                        </div>

                        <div className="border-t border-bdr2 pt-3 mt-2 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="text-xs h-9 border-bdr2 bg-white shadow-none font-semibold text-slate-650 hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveClick}
                                disabled={isSaving}
                                className="text-xs h-9 bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold"
                            >
                                {isSaving && <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" />}
                                Save Assignments
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default GroupCategoriesSheet;
