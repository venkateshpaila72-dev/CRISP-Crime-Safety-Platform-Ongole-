import apiClient from "./client";

export async function getLandmarks(params = {}) {
  const { data } = await apiClient.get("/landmarks", { params });
  return data;
}
export async function createLandmark(payload) {
  const { data } = await apiClient.post("/admin/content/landmarks", payload);
  return data;
}
export async function updateLandmark(id, payload) {
  const { data } = await apiClient.patch(`/admin/content/landmarks/${id}`, payload);
  return data;
}
export async function deleteLandmark(id) {
  await apiClient.delete(`/admin/content/landmarks/${id}`);
}

export async function getSafetyTips(params = {}) {
  const { data } = await apiClient.get("/safety-tips", { params });
  return data;
}
export async function createSafetyTip(payload) {
  const { data } = await apiClient.post("/admin/content/safety-tips", payload);
  return data;
}
export async function updateSafetyTip(id, payload) {
  const { data } = await apiClient.patch(`/admin/content/safety-tips/${id}`, payload);
  return data;
}
export async function deleteSafetyTip(id) {
  await apiClient.delete(`/admin/content/safety-tips/${id}`);
}

export async function getJurisdictions() {
  const { data } = await apiClient.get("/admin/content/jurisdictions");
  return data;
}