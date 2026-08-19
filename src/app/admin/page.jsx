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
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Mobiking Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Complete Platform for B2B Sales Management</p>
        </div>
        <div className="w-full md:w-auto min-w-[280px]">
          <SMSCredit />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <TotalOrders />
        <TotalQuotations />
        <TotalCustomers />
        <TotalSales />
        <SalesOfOneDay />
        <SalesOfOneMonth />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomersChart />
        <SalesChartByDate />
      </div>

      <div className="mt-6 space-y-6">
        <FilteredQuotationsChart />
        <FilteredOrdersChart />
      </div>
    </InnerDashboardLayout>
  );
}
