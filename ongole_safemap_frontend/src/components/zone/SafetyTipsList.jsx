import { useSafetyTips } from "../../hooks/useSafetyTips";
import LoadingSkeleton from "../common/LoadingSkeleton";
import ErrorMessage from "../common/ErrorMessage";
import EmptyState from "../common/EmptyState";

function SafetyTipsList({ categories = [] }) {

  const {

    tips,

    loading,

    error,

    refetch,

  } = useSafetyTips(categories);

  if (loading) {

    return <LoadingSkeleton lines={3} />;

  }

  if (error) {

    return <ErrorMessage message={error} onRetry={refetch} />;

  }

  if (!tips.length) {

    return (
      <EmptyState
        icon="🛡️"
        title="No safety tips available"
        message="Check back later for guidance on this area."
      />
    );

  }

  return (

    <div className="space-y-3">

      <h3 className="font-semibold">

        Safety Tips

      </h3>

      {

        tips.map(tip => (

          <div

            key={tip.id || tip._id}

            className="rounded-lg border p-3"

          >

            <div className="font-semibold text-green-700">

              {tip.category}

            </div>

            <div>

              {tip.tip}

            </div>

          </div>

        ))

      }

    </div>

  );

}

export default SafetyTipsList;