import apiClient from "./client";

/**
 * GET /admin/incidents
 * excludedOnly=false -> active incidents (exclusion_reason is null)
 * excludedOnly=true  -> only excluded/noise incidents
 * jurisdiction/crimeCategory are exact-match filters, both optional.
 */
export async function listIncidents({
  excludedOnly = false,
  jurisdiction,
  crimeCategory,
} = {}) {
  const { data } = await apiClient.get("/admin/incidents", {
    params: {
      excluded_only: excludedOnly,
      jurisdiction: jurisdiction || undefined,
      crime_category: crimeCategory || undefined,
    },
  });
  return data;
}

export async function getIncident(id) {
  const { data } = await apiClient.get(`/admin/incidents/${id}`);
  return data;
}

/**
 * PATCH /admin/incidents/{id}
 * `changes` should only contain keys the caller actually wants to update —
 * omit a key entirely to leave it untouched, or send it as null to clear it
 * (e.g. { exclusion_reason: null } to restore an excluded incident). This
 * relies on the backend using model_dump(exclude_unset=True); see the
 * admin_incidents.py fix.
 */
export async function updateIncident(id, changes) {
  const { data } = await apiClient.patch(`/admin/incidents/${id}`, changes);
  return data;
}

export async function deleteIncident(id) {
  await apiClient.delete(`/admin/incidents/${id}`);
}

/**
 * DELETE /admin/incidents (bulk)
 * Backend refuses to run with no filter at all — always pass at least
 * one of source / excludedOnly.
 */
export async function bulkDeleteIncidents({ source, excludedOnly } = {}) {
  const { data } = await apiClient.delete("/admin/incidents", {
    params: {
      source: source || undefined,
      excluded_only: excludedOnly || undefined,
    },
  });
  return data;
}