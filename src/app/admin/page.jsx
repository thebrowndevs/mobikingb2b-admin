"use client"

import InnerDashboardLayout from "@/components/dashboard/InnerDashboardLayout";
import TotalOrders from "./(dashboard)/TotalOrders";
import TotalCustomers from "./(dashboard)/TotalCustomers";
import TotalSales from "./(dashboard)/TotalSales";
import TotalQuotations from "./(dashboard)/TotalQuotations";
import SalesOfOneDay from "./(dashboard)/SalesOfOneDay";
import SalesOfOneMonth from "./(dashboard)/SalesOfOneMonth";
import FilteredOrdersChart from "./(dashboard)/FilteredOrdersChart";
import FilteredQuotationsChart from "./(dashboard)/FilteredQuotationsChart";
import { usePermissions } from "@/hooks/usePermissions";
import NotAuthorizedPage from "@/components/notAuthorized";
import { Resources } from "@/lib/permissions";
import SMSCredit from "./(dashboard)/SMSCredit";
import { CustomersChart } from "./(dashboard)/CustomersChart";
import { SalesChartByDate } from "./(dashboard)/SalesChartByDates";

export default function Home() {
  const { checkView } = usePermissions()

  // Permissions
  const canView = checkView(Resources.DASHBOARD)

  if (!canView) return <NotAuthorizedPage />

  return (
    <InnerDashboardLayout>
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Mobiking Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Complete Platform for B2B Sales Management</p>
        </div>
        <div className="w-full sm:w-auto min-w-[280px]">
          <SMSCredit />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <TotalOrders />
        <TotalQuotations />
        <TotalCustomers />
        <TotalSales />
        <SalesOfOneDay />
        <SalesOfOneMonth />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <CustomersChart />
        {/* <OrdersChart /> */}
        <SalesChartByDate />
      </div>

      <div className="mt-8 space-y-8">
        <FilteredQuotationsChart />
        <FilteredOrdersChart />
      </div>
    </InnerDashboardLayout>
  );
}
