import api from "@/lib/api"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { usePermissions } from "./usePermissions"
import { Resources } from "@/lib/permissions"

export const useReports = () => {
    const { checkView, checkAdd, checkEdit, checkDelete } = usePermissions()

    // Permissions
    const canView = checkView(Resources.REPORTS)
    const canAdd = checkAdd(Resources.REPORTS)
    const canEdit = checkEdit(Resources.REPORTS)
    const canDelete = checkDelete(Resources.REPORTS)

    const reportMutation = useMutation({
        mutationFn: (data) => api.post("/reports/modules", data),
        onSuccess: () => {
            toast.success("Report generated successfully.")
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to generate report")
        },
    })

    const productSalesReportMutation = useMutation({
        mutationFn: (data) => api.post("/reports/product-sales", data),
        onSuccess: () => {
            toast.success("Sales report generated successfully.")
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to generate sales report")
        },
    })

    return {
        reportMutation,
        productSalesReportMutation,
        permissions: {
            canView,
            canAdd,
            canEdit,
            canDelete,
        }
    }
}
