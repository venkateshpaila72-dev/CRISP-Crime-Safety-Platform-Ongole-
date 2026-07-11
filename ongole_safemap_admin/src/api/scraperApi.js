import apiClient from "./client";

export async function triggerScraper() {
  const { data } = await apiClient.post("/admin/scraper/trigger");
  return data;
}

export async function getScraperLogs() {
  const { data } = await apiClient.get("/admin/scraper/logs");
  return data;
}