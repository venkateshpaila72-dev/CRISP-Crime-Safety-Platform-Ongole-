import { useZoneIncidents } from "../../hooks/useZoneIncidents";
import LoadingSkeleton from "../common/LoadingSkeleton";
import ErrorMessage from "../common/ErrorMessage";
import EmptyState from "../common/EmptyState";

function IncidentsList({ zoneId }) {

  const {

    incidents,

    loading,

    error,

    refetch,

  } = useZoneIncidents(zoneId);

  if (loading) {

    return <LoadingSkeleton lines={4} />;

  }

  if (error) {

    return <ErrorMessage message={error} onRetry={refetch} />;

  }

  if (!incidents.length) {

    return (
      <EmptyState
        icon="🗂️"
        title="No incidents found"
        message="Nothing has been recorded for this zone yet."
      />
    );

  }

  return (

    <div className="space-y-4">

      <h3 className="font-semibold">

        Recent Incidents

      </h3>

      {

        incidents.map(incident => (

          <div

            key={
              incident.id ||
              incident._id ||
              incident.source_url ||
              `${incident.title}-${incident.published_date}`
            }

            className="rounded-lg border p-3"

          >

            {

              incident.image_url && (

                <img

                  src={incident.image_url}

                  alt={incident.title}

                  className="mb-3 h-40 w-full rounded object-cover"

                />

              )

            }

            <h4 className="font-semibold">

              {incident.title}

            </h4>

            <p className="text-sm mt-2">

              {incident.description}

            </p>

            {

              incident.source_url && (

                <a

                  href={incident.source_url}

                  target="_blank"

                  rel="noopener noreferrer"

                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"

                >

                  Read full article{incident.source_name ? ` on ${incident.source_name}` : ""} ↗

                </a>

              )

            }

            <div className="mt-3 flex gap-2 flex-wrap">

              {

                incident.crime_category && (

                  <span className="rounded bg-red-100 px-2 py-1 text-xs">

                    {incident.crime_category}

                  </span>

                )

              }

              {

                incident.severity && (

                  <span className="rounded bg-orange-100 px-2 py-1 text-xs">

                    {incident.severity}

                  </span>

                )

              }

            </div>

          </div>

        ))

      }

    </div>

  );

}

export default IncidentsList;