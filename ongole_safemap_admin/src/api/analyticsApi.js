import apiClient from "./client";

/**
 * GET /admin/analytics/dashboard
 * Returns DashboardStats: total_incidents, total_zones, zones_with_data,
 * pending_reports, approved_reports, rejected_reports, total_landmarks,
 * total_safety_tips, category_breakdown, recent_admin_actions.
 */
export async function getDashboardStats() {
  const { data } = await apiClient.get("/admin/analytics/dashboard");
  return data;
}

/**
 * POST /admin/analytics/recompute-zones
 * Triggers a full zone/crime-score recompute. Returns whatever summary
 * object the backend produces (e.g. zones updated count).
 */
export async function recomputeZones() {
  const { data } = await apiClient.post("/admin/analytics/recompute-zones");
  return data;
}