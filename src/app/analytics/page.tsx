import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import analyticsData from '../../../data/megaphone-analytics.json';

export default function AnalyticsPage() {
  return <AnalyticsDashboard data={analyticsData as any} />;
}
