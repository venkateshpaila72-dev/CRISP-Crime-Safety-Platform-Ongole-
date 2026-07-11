import apiClient from "./client";

export async function getReports(statusFilter = "pending") {
  const { data } = await apiClient.get("/admin/reports", {
    params: { status_filter: statusFilter },
  });
  return data;
}

export async function reviewReport(reportId, action) {
  // action: "approve" | "reject"
  const { data } = await apiClient.patch(`/admin/reports/${reportId}`, { action });
  return data;
}