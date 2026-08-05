"use client"
import InnerDashboardLayout from "@/components/dashboard/InnerDashboardLayout";
import POS from "@/components/POS";
import { Button } from "@/components/ui/button";
import TotalOrders from "./(dashboard)/TotalOrders";
import TotalCustomers from "./(dashboard)/TotalCustomers";
import TotalSales from "./(dashboard)/TotalSales";
// import { ChartLineDefault } from "@/components/home/Chart1";
// import { ChartAreaInteractive } from "@/components/home/Chart2";
import SalesOfOneDay from "./(dashboard)/SalesOfOneDay";
import SalesOfOneMonth from "./(dashboard)/SalesOfOneMonth";
import Time from "./(dashboard)/Time";
import { CustomersChart } from "./(dashboard)/CustomersChart";
import FilteredOrdersChart from "./(dashboard)/FilteredOrdersChart";
import { SalesChartByDate } from "./(dashboard)/SalesChartByDates";
import PosButton from "@/components/custom/PosButton";
import { usePermissions } from "@/hooks/usePermissions";
import NotAuthorizedPage from "@/components/notAuthorized";
import { Resources } from "@/lib/permissions";
import SMSCredit from "./(dashboard)/SMSCredit";

export default function Home() {
  const { checkView } = usePermissions()

  // Permissions
  const canView = checkView(Resources.DASHBOARD)

  if (!canView) return <NotAuthorizedPage />

  return (
    <InnerDashboardLayout>
      <div className="w-full flex justify-between items-center gap-4 mb-4">
        <h1 className="text-primary font-bold sm:text-lg lg:text-3xl">
          Mobiking Admin
        </h1>
        <div className="flex gap-2 items-center justify-center">
          {/* <POS>
            <Button>POS</Button>
          </POS> */}
          {/* <PosButton /> */}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <TotalOrders />
        <TotalCustomers />
        <TotalSales />
        <SalesOfOneDay />
        <SalesOfOneMonth />
        {/* <Time /> */}
        <SMSCredit />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <CustomersChart />
        {/* <OrdersChart /> */}
        <SalesChartByDate />
      </div>
      <div>

        <div className="mt-3">
          <FilteredOrdersChart />
        </div>
      </div>
    </InnerDashboardLayout>
  );
}



{/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <ChartLineDefault />
        <ChartLineDefault />
        <ChartLineDefault />
      </div> */}
