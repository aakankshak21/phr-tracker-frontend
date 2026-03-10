function generateInsights({ kpis, failData }) {
  const insights = [];
  const successRate   = parseFloat(kpis.successRate);
  const prevSuccess   = parseFloat(kpis.prevSuccessRate);
  const failedNow     = kpis.failedMessages;
  const failedPrev    = kpis.prevFailedMessages;
  const successDelta  = +(successRate - prevSuccess).toFixed(1);
  const failedDelta   = failedNow - failedPrev;

  // ── Performance ───────────────────────────────────────────────────────────
  if (successRate >= 85) {
    insights.push({ type: 'performance', text: 'Delivery performance is stable — messages are consistently reaching recipients.' });
  } else if (successRate >= 70) {
    insights.push({ type: 'performance', text: 'Delivery performance is moderate — a notable share of messages are not getting through.' });
  } else {
    insights.push({ type: 'performance', text: 'Delivery performance is poor — most outreach is failing to reach users.' });
  }

  // ── Anomaly ───────────────────────────────────────────────────────────────
  if (successDelta <= -3) {
    insights.push({ type: 'anomaly', text: `Success rate dropped ${Math.abs(successDelta)}pp vs the previous period — this decline may signal a growing delivery issue.` });
  } else if (failedDelta >= 10) {
    insights.push({ type: 'anomaly', text: `Failed messages spiked by ${failedDelta} compared to the previous period — investigate before the trend continues.` });
  } else if (failedDelta > 0) {
    insights.push({ type: 'anomaly', text: `Failed messages increased by ${failedDelta} vs the previous period — monitor closely for further deterioration.` });
  } else if (successDelta >= 3) {
    insights.push({ type: 'anomaly', text: `Success rate improved ${successDelta}pp vs the previous period — delivery conditions are trending positively.` });
  } else {
    insights.push({ type: 'anomaly', text: 'No significant anomalies detected — delivery metrics are consistent with the previous period.' });
  }

  // ── Top failure reason ────────────────────────────────────────────────────
  if (failData?.length > 0) {
    const total    = failData.reduce((s, r) => s + r.count, 0);
    const top      = failData[0];
    const topPct   = Math.round((top.count / total) * 100);
    const label    = top.reason.replace(/_/g, ' ');
    if (topPct >= 50) {
      insights.push({ type: 'anomaly', text: `"${label}" accounts for ${topPct}% of failures — this concentrated pattern points to a specific, fixable problem.` });
    } else {
      insights.push({ type: 'anomaly', text: `Failures are spread across ${failData.length} reasons — the leading cause is "${label}" at ${topPct}%.` });
    }
  }

  // ── Recommendation ────────────────────────────────────────────────────────
  if (failData?.length > 0 && failData[0].reason === 'invalid_email') {
    insights.push({ type: 'recommendation', text: 'Prioritise cleaning up invalid email records — this is a data quality fix that requires no system changes and will immediately reduce failures.' });
  } else if (failedDelta >= 10) {
    insights.push({ type: 'recommendation', text: 'Investigate the spike in failed messages and consider retrying eligible deliveries to recover lost outreach.' });
  } else if (successDelta <= -3) {
    insights.push({ type: 'recommendation', text: 'Review delivery conditions for the current period — a consistent drop in success rate may require a change in send strategy.' });
  } else {
    insights.push({ type: 'recommendation', text: 'Maintain current delivery practices and set threshold alerts to catch early signs of performance degradation.' });
  }

  return insights;
}

const META = {
  performance:    { icon: '🟢', label: 'Performance',    color: 'text-gray-700' },
  anomaly:        { icon: '⚠',  label: 'Anomaly',        color: 'text-amber-600' },
  recommendation: { icon: '💡', label: 'Recommendation', color: 'text-gray-700' },
};

export default function InsightsPanel({ kpis, statusData, failData }) {
  if (!kpis) return null;

  const hasActivity = statusData?.length > 0;

  if (!hasActivity) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
        <p className="text-sm font-semibold text-gray-900 mb-0.5">Insights & Recommendations</p>
        <p className="text-xs text-gray-400 mb-4">Auto-generated from current period data</p>
        <p className="text-xs text-gray-400 italic">No delivery activity in the selected period. Insights will appear once messages are sent.</p>
      </div>
    );
  }

  const insights = generateInsights({ kpis, failData });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Insights & Recommendations</p>
          <p className="text-xs text-gray-400 mt-0.5">Auto-generated from current period data</p>
        </div>
      </div>
      <ul className="space-y-3">
        {insights.map((item, i) => {
          const meta = META[item.type];
          return (
            <li key={i} className="flex gap-3 text-sm">
              <span className="shrink-0 mt-px">{meta.icon}</span>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mr-2">{meta.label}</span>
                <span className={`text-xs leading-relaxed ${meta.color}`}>{item.text}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
