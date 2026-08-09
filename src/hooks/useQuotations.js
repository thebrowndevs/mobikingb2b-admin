import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { usePermissions } from "./usePermissions";
import { Resources } from "@/lib/permissions";

export const useQuotations = () => {
  const queryClient = useQueryClient();
  const { checkView, checkAdd, checkEdit, checkDelete } = usePermissions();

  const canView = checkView(Resources.ORDERS);
  const canAdd = checkAdd(Resources.ORDERS);
  const canEdit = checkEdit(Resources.ORDERS);
  const canDelete = checkDelete(Resources.ORDERS);

  // Get B2B quotations paginated
  const getQuotationsPaginated = ({ params }) => {
    const filtered = Object.fromEntries(
      Object.entries(params).filter(
        ([_, v]) => v !== undefined && v !== null && v !== "" && v !== "all"
      )
    );

    return useQuery({
      queryKey: ["quotations", filtered],
      queryFn: () =>
        api
          .get("/quotations/paginated", { params: filtered })
          .then((res) => res.data.data),
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5,
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to fetch order requests.");
      },
    });
  };

  // Get single quotation detail
  const getSingleQuotation = (quotationId) => {
    return useQuery({
      queryKey: ["quotation", quotationId],
      queryFn: () =>
        api.get("/quotations/all").then((res) => {
          const list = res.data.data || [];
          return list.find((q) => q._id === quotationId);
        }),
      enabled: !!quotationId,
      staleTime: 1000 * 60 * 2,
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to fetch request details.");
      },
    });
  };

  // Mutation to update quotation status
  const updateQuotationStatusMutation = useMutation({
    mutationFn: ({ quotationId, status, reason }) =>
      api.post("/quotations/status", { quotationId, status, reason }).then((res) => res.data),
    onSuccess: (data, variables) => {
      toast.success(`Order request updated to ${variables.status} status.`);
      queryClient.invalidateQueries(["quotations"]);
      queryClient.invalidateQueries(["quotation", variables.quotationId]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update status.");
    },
  });

  // Mutation to book quotation (convert to physical order)
  const bookQuotationMutation = useMutation({
    mutationFn: ({ quotationId, stages }) =>
      api.post("/quotations/book", { quotationId, stages }).then((res) => res.data),
    onSuccess: (data, variables) => {
      toast.success("Order booked successfully. Physical order created.");
      queryClient.invalidateQueries(["quotations"]);
      queryClient.invalidateQueries(["quotation", variables.quotationId]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to book order request.");
    },
  });

  // Mutation to edit quotation items and details
  const updateQuotationMutation = useMutation({
    mutationFn: (data) =>
      api.put("/quotations/update", data).then((res) => res.data),
    onSuccess: (data, variables) => {
      toast.success("Order request items and pricing updated successfully.");
      queryClient.invalidateQueries(["quotations"]);
      queryClient.invalidateQueries(["quotation", variables.quotationId]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update order request.");
    },
  });

  // Mutation to add item quantity
  const addItemMutation = useMutation({
    mutationFn: ({ quotationId, productId, variantName, quantity }) =>
      api.post("/quotations/items/add", { quotationId, productId, variantName, quantity }).then((res) => res.data),
    onSuccess: (data, variables) => {
      toast.success("Item added successfully.");
      queryClient.invalidateQueries(["quotations"]);
      queryClient.invalidateQueries(["quotation", variables.quotationId]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to add item.");
    },
  });

  // Mutation to remove item quantity
  const removeItemMutation = useMutation({
    mutationFn: ({ quotationId, productId, variantName, quantity }) =>
      api.post("/quotations/items/remove", { quotationId, productId, variantName, quantity }).then((res) => res.data),
    onSuccess: (data, variables) => {
      toast.success("Item removed successfully.");
      queryClient.invalidateQueries(["quotations"]);
      queryClient.invalidateQueries(["quotation", variables.quotationId]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to remove item.");
    },
  });

  return {
    getQuotationsPaginated,
    getSingleQuotation,
    updateQuotationStatus: updateQuotationStatusMutation,
    bookQuotation: bookQuotationMutation,
    updateQuotation: updateQuotationMutation,
    addItemQuantity: addItemMutation,
    removeItemQuantity: removeItemMutation,
    permissions: {
      canView,
      canAdd,
      canEdit,
      canDelete,
    },
  };
};
