import apiClient from "./client";

export async function getZones() {
    const { data } = await apiClient.get("/zones");
    return data;
}

export async function getZone(zoneId) {
    const { data } = await apiClient.get(`/zones/${zoneId}`);
    return data;
}

export async function getZoneIncidents(
    zoneId,
    limit = 20
) {
    const { data } = await apiClient.get(
        `/zones/${zoneId}/incidents`,
        {
            params: {
                limit,
            },
        }
    );

    return data;
}

export async function getHeatmap() {
    const { data } = await apiClient.get(
        "/heatmap"
    );

    return data;
}

export async function refreshZones() {
    const { data } = await apiClient.post(
        "/zones/refresh"
    );

    return data;
}

export async function rebuildZones() {
    const { data } = await apiClient.post(
        "/zones/rebuild"
    );

    return data;
}

export async function getLandmarks(params = {}) {
    const { data } = await apiClient.get(
        "/landmarks",
        {
            params,
        }
    );

    return data;
}

export async function getSafetyTips(params = {}) {
    const { data } = await apiClient.get(
        "/safety-tips",
        {
            params,
        }
    );

    return data;
}

export async function getTransparency() {
    const { data } = await apiClient.get(
        "/transparency"
    );

    return data;
}

export async function submitReport(report) {
    const { data } = await apiClient.post(
        "/report-incident",
        report
    );

    return data;
}

export async function askAssistant(question) {
    const { data } = await apiClient.post(
        "/assistant/ask",
        { question }
    );

    return data;
}