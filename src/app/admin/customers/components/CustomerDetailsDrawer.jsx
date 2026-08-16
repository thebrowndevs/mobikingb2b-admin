"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/useUsers";
import { useOrders } from "@/hooks/useOrders";
import { useQuotations } from "@/hooks/useQuotations";
import {
  Loader2,
  LayoutDashboard,
  Building2,
  MapPin,
  ShoppingBag,
  Pencil,
  CheckCircle2,
  Phone,
  Calendar,
  Sparkles,
  AlertTriangle,
  Eye,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { OrderViewDialog } from "../[id]/components/OrderViewDialog";
import { QuotationViewDialog } from "../../quotations/components/QuotationViewDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

/* ─────────────────────── SIDEBAR NAV CONFIG ─────────────────────── */
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "business", label: "Business Details", icon: Building2 },
  { id: "addresses", label: "Shipping Addresses", icon: MapPin },
  { id: "orders", label: "Order History", icon: ShoppingBag },
  { id: "quotations", label: "Order Requests", icon: FileText },
];

/* ─────────────────────── HELPER COMPONENTS ─────────────────────── */
function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-bdr2 last:border-b-0">
      <span className="text-[11px] font-semibold text-slate-455 shrink-0">{label}</span>
      <span className={`text-[11px] font-bold text-slate-800 text-right break-all ${mono ? "font-mono" : ""}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-back2 border border-bdr2 rounded-xl overflow-hidden shadow-none">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-bdr2 bg-slate-50/60">
        {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
        <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function BusinessStatusBadge({ business }) {
  if (!business?.active) {
    return <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-500 font-semibold border border-slate-200">Not Started</span>;
  }
  if (business?.isApproved && business?.gstVerified) {
    return <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">GST Verified</span>;
  }
  if (business?.isApproved) {
    return <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">Verified</span>;
  }
  if (business?.rejectionReason) {
    return <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-50 text-red-700 font-semibold border border-red-200">Rejected</span>;
  }
  return <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">Pending</span>;
}

/* ─────────────────────── TAB PANELS ─────────────────────── */
function OverviewPanel({ user }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Contact Profile" icon={Sparkles}>
        <InfoRow label="Full Name" value={user.name} />
        <InfoRow label="Mobile Number" value={user.phoneNo ? `+${user.callingCode || 91} ${user.phoneNo}` : "—"} />
        <InfoRow label="Email Address" value={user.email} />
        <InfoRow label="Role" value={user.role?.toUpperCase()} />
        <InfoRow label="Gender" value={user.gender} />
        <InfoRow label="Date of Birth" value={user.dob} />
      </SectionCard>

      <SectionCard title="Activity Summary" icon={Calendar}>
        <InfoRow label="Joined Date" value={user.createdAt ? format(new Date(user.createdAt), "dd MMM yyyy, hh:mm a") : "—"} />
        <InfoRow label="Order Count" value={user.orders?.length ?? 0} />
      </SectionCard>
    </div>
  );
}

function BusinessPanel({ user, onEdit }) {
  const business = user.business || {};
  const addr = business.regsiteredAddress || {};

  if (!business.active) {
    return (
      <div className="p-8 border border-amber-200 bg-amber-50 rounded-xl flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <div>
          <h3 className="text-sm font-bold text-slate-800">Business Details Not Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">This customer has not started the B2B verification onboarding. Please add business details now to verify.</p>
        </div>
        <Button onClick={() => onEdit(user)} className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs">
          Add Details Now
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Business Identity" icon={Building2}>
        <InfoRow label="Business Name" value={business.businessName} />
        <InfoRow label="GST Number" value={business.gstNumber} mono />
        <InfoRow label="Business Email" value={business.businessEmail} />
        <InfoRow label="Business Phone" value={business.businessPhone} />
      </SectionCard>

      <SectionCard title="GST Verification Status Logs" icon={CheckCircle2}>
        <InfoRow label="GST Verified Status" value={business.gstVerified ? "Verified (Govt Records)" : "Not Verified"} />
        <InfoRow label="Approval Status" value={business.isApproved ? "Approved" : business.rejectionReason ? "Rejected" : "Pending Approval"} />
        {business.rejectionReason && <InfoRow label="Rejection Reason" value={business.rejectionReason} />}
        {business.rejectedAt && <InfoRow label="Rejected At" value={format(new Date(business.rejectedAt), "dd MMM yyyy, hh:mm a")} />}
        {business.approvedAt && <InfoRow label="Approved At" value={format(new Date(business.approvedAt), "dd MMM yyyy, hh:mm a")} />}
      </SectionCard>

      <SectionCard title="Registered Billing Address" icon={MapPin}>
        <InfoRow label="Street Address" value={addr.street} />
        <InfoRow label="Area/Street 2" value={addr.street2} />
        <InfoRow label="City" value={addr.city} />
        <InfoRow label="State" value={addr.state} />
        <InfoRow label="Pin Code" value={addr.pinCode} mono />
        <InfoRow label="Country" value={addr.country} />
      </SectionCard>
    </div>
  );
}

function AddressesPanel({ user }) {
  const addresses = user.address || [];
  return (
    <div className="space-y-4">
      <SectionCard title={`Shipping Addresses (${addresses.length})`} icon={MapPin}>
        {addresses.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">No shipping addresses saved.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {addresses.map((addr, idx) => (
              <div key={addr._id || idx} className="p-3 bg-back1 border border-bdr2 rounded-xl text-xs space-y-1.5 relative">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-[9px] uppercase font-bold text-indigo-650 bg-indigo-50 border-indigo-200">
                    {addr.label || "Address"}
                  </Badge>
                  {addr.isDefault && (
                    <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                      <CheckCircle2 size={10} /> Default
                    </span>
                  )}
                </div>
                <p className="font-semibold text-slate-800">{addr.street}</p>
                {addr.street2 && <p className="text-slate-500">{addr.street2}</p>}
                <p className="text-slate-600">
                  {addr.city}, {addr.state} - {addr.pinCode}
                </p>
                <p className="text-slate-455 text-[10px]">{addr.country}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function OrdersPanel({ user }) {
  const { getOrdersByDate } = useOrders();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = getOrdersByDate({
    params: {
      searchQuery: user.phoneNo,
      queryParameter: "customer",
      page,
      limit: 10,
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="animate-spin h-6 w-6 text-indigo-655" />
      </div>
    );
  }

  if (error) {
    return <div className="text-xs text-red-500">Failed to load order history.</div>;
  }

  const ordersList = data?.orders || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-4">
      <SectionCard title="Order History" icon={ShoppingBag}>
        {ordersList.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">No order history found.</p>
        ) : (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-bdr2">
              <table className="w-full border-collapse text-[11px] text-left">
                <thead className="bg-slate-50 border-b border-bdr2 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">Order ID</th>
                    <th className="p-2.5">Amount</th>
                    <th className="p-2.5">Payment</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5 text-center">View</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersList.map((o) => (
                    <tr key={o._id} className="border-b border-bdr2 last:border-b-0 hover:bg-slate-50/40">
                      <td className="p-2.5 font-bold font-mono text-slate-800">{o.orderId}</td>
                      <td className="p-2.5 font-semibold text-slate-855">₹{o.orderAmount?.toFixed(2)}</td>
                      <td className="p-2.5">
                        <Badge className={o.paymentStatus === "Paid" ? "bg-emerald-600 hover:bg-emerald-600 text-white shadow-none border-none text-[9px] font-bold" : "bg-red-50 text-red-700 border-red-200 text-[9px] font-bold"}>
                          {o.paymentStatus}
                        </Badge>
                      </td>
                      <td className="p-2.5">
                        <Badge className={
                          o.status === "Delivered" || o.status === "Accepted" ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-[9px] font-bold shadow-none" :
                            o.status === "Cancelled" || o.status === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50 text-[9px] font-bold shadow-none" :
                              o.status === "Hold" ? "bg-slate-100 text-slate-650 border-slate-200 hover:bg-slate-100 text-[9px] font-bold shadow-none" :
                                "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 text-[9px] font-bold shadow-none"
                        } variant="outline">
                          {o.status}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-slate-550">{format(new Date(o.createdAt), "dd MMM yyyy")}</td>
                      <td className="p-2.5 text-center">
                        <OrderViewDialog order={o}>
                          <Button size="icon" variant="ghost" className="h-6 w-6">
                            <Eye size={12} className="text-slate-500" />
                          </Button>
                        </OrderViewDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-slate-455 font-medium">Page {page} of {pagination.totalPages}</span>
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="h-6 text-[10px] px-2"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="h-6 text-[10px] px-2"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function QuotationsPanel({ user }) {
  const { getQuotationsPaginated } = useQuotations();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = getQuotationsPaginated({
    params: {
      searchQuery: user.phoneNo,
      queryParameter: "customer",
      page,
      limit: 10,
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="animate-spin h-6 w-6 text-indigo-655" />
      </div>
    );
  }

  if (error) {
    return <div className="text-xs text-red-500">Failed to load order requests.</div>;
  }

  const quotesList = data?.quotations || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-4">
      <SectionCard title="Order Requests (Quotations)" icon={FileText}>
        {quotesList.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">No order requests found.</p>
        ) : (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-bdr2">
              <table className="w-full border-collapse text-[11px] text-left">
                <thead className="bg-slate-50 border-b border-bdr2 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">Request ID</th>
                    <th className="p-2.5">Amount</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5 text-center">View</th>
                  </tr>
                </thead>
                <tbody>
                  {quotesList.map((q) => (
                    <tr key={q._id} className="border-b border-bdr2 last:border-b-0 hover:bg-slate-50/40">
                      <td className="p-2.5 font-bold font-mono text-slate-800">{q.quotationId}</td>
                      <td className="p-2.5 font-semibold text-slate-850">₹{q.orderAmount?.toFixed(2)}</td>
                      <td className="p-2.5">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border capitalize ${q.status === "New" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          q.status === "Accepted" || q.status === "Booked" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            "bg-red-50 text-red-750 border-red-200"
                          }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-500">{format(new Date(q.createdAt), "dd MMM yyyy")}</td>
                      <td className="p-2.5 text-center">
                        <QuotationViewDialog quotation={q}>
                          <Button size="icon" variant="ghost" className="h-6 w-6">
                            <Eye size={12} className="text-slate-500" />
                          </Button>
                        </QuotationViewDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-slate-455 font-medium">Page {page} of {pagination.totalPages}</span>
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="h-6 text-[10px] px-2"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="h-6 text-[10px] px-2"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

/* ─────────────────────── MAIN DRAWER ─────────────────────── */
const hasCompleteBusinessDetails = (business) => {
  if (!business || !business.active) return false;
  const addr = business.regsiteredAddress || {};
  return !!(
    business.businessName?.trim() &&
    business.businessPhone?.trim() &&
    business.businessEmail?.trim() &&
    addr.street?.trim() &&
    addr.city?.trim() &&
    addr.state?.trim() &&
    addr.pinCode?.trim()
  );
};

export default function CustomerDetailsDrawer({ open, onOpenChange, userId, onEdit }) {
  const { getSingleUserQuery, approveCustomerBusiness } = useUsers();
  const [activeTab, setActiveTab] = useState("overview");

  // Rejection dialog input
  const [rejectionOpen, setRejectionOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: userResp, isLoading, error } = getSingleUserQuery(userId);
  const user = userResp?.data;

  // Reset tab when user changes
  React.useEffect(() => {
    setActiveTab("overview");
  }, [userId]);

  const handleApprove = async () => {
    if (!user?._id) return;
    await approveCustomerBusiness.mutateAsync({ id: user._id, action: "approve" });
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim() || !user?._id) return;
    await approveCustomerBusiness.mutateAsync({
      id: user._id,
      action: "reject",
      rejectionReason: rejectionReason.trim(),
    });
    setRejectionOpen(false);
    setRejectionReason("");
  };

  const renderPanel = () => {
    if (!user) return null;
    switch (activeTab) {
      case "overview":
        return <OverviewPanel user={user} />;
      case "business":
        return <BusinessPanel user={user} onEdit={onEdit} />;
      case "addresses":
        return <AddressesPanel user={user} />;
      case "orders":
        return <OrdersPanel user={user} />;
      case "quotations":
        return <QuotationsPanel user={user} />;
      default:
        return <OverviewPanel user={user} />;
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-[900px] gap-0 bg-back1 border-l border-bdr2 shadow-none p-0 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <SheetHeader className="py-3 px-5 border-b border-bdr2 bg-back2 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="min-w-0">
                  <SheetTitle className="text-sm font-bold text-slate-800 tracking-tight leading-tight line-clamp-2">
                    {user?.name || "Customer Details"}
                  </SheetTitle>
                  {user && (
                    <div className="flex flex-wrap gap-1.5 mt-1 items-center">
                      <Badge className={`text-[9px] uppercase font-bold shadow-none rounded-md px-1.5 py-0 h-4 ${user.active ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-slate-100 text-slate-500 hover:bg-slate-100"}`}>
                        {user.active ? "Active" : "Inactive"}
                      </Badge>
                      <BusinessStatusBadge business={user.business} />
                      {user.phoneNo && (
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 ml-1">
                          <Phone size={10} /> +{user.callingCode || 91} {user.phoneNo}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons inside header */}
              {user && (
                <div className="flex items-center gap-2 shrink-0 mr-6">
                  {user.business?.active && !user.business?.isApproved && hasCompleteBusinessDetails(user.business) && (
                    <>
                      {/* <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRejectionOpen(true)}
                        disabled={approveCustomerBusiness.isPending}
                        className="h-8 text-xs font-semibold text-red-650 hover:bg-red-50 border-red-200"
                      >
                        Reject Business
                      </Button> */}
                      <Button
                        size="sm"
                        onClick={handleApprove}
                        disabled={approveCustomerBusiness.isPending}
                        className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Approve Business
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      onEdit(user);
                    }}
                    className="h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                  >
                    <Pencil size={12} /> Edit Details
                  </Button>
                </div>
              )}
            </div>
          </SheetHeader>

          {/* Body: Sidebar + Content */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Sidebar */}
            <nav className="w-44 shrink-0 bg-back2 border-r border-bdr2 py-3 flex flex-col gap-0.5 overflow-y-auto">
              {TABS.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-left text-[11px] font-semibold transition-all w-full
                      ${isActive
                        ? "bg-white text-indigo-650 border-r-2 border-indigo-500 shadow-sm"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/60"
                      }`}
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-indigo-500" : "text-slate-400"}`} />
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* Panel */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-12 bg-back1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-3">
                  <Loader2 className="animate-spin h-6 w-6 text-indigo-650" />
                  <span className="text-xs text-slate-500 font-semibold animate-pulse">Fetching customer profile…</span>
                </div>
              ) : error ? (
                <div className="p-6 text-center border border-red-200 bg-red-50 text-red-700 rounded-xl font-semibold text-sm">
                  Failed to load profile. Please try again.
                </div>
              ) : user ? (
                renderPanel()
              ) : (
                <div className="p-8 text-center text-slate-400 italic text-sm">
                  Select a user to view profile.
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Rejection dialog */}
      <Dialog open={rejectionOpen} onOpenChange={setRejectionOpen}>
        <DialogContent className="sm:max-w-[425px] bg-back1 border-bdr2 text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Reject Business Verification</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Provide a clear reason for rejecting B2B registration.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              placeholder="e.g. GSTIN mismatch or invalid address documentation"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="bg-back2 border-bdr2 text-xs"
            />
          </div>
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setRejectionOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRejectSubmit}
              disabled={!rejectionReason.trim() || approveCustomerBusiness.isPending}
              className="bg-red-650 hover:bg-red-700 text-white font-bold text-xs"
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
