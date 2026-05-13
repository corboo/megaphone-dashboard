import Dashboard from '@/components/Dashboard';
import rawData from '../../data/dashboard-data.json';

export default function Home() {
  return <Dashboard data={rawData as any} />;
}
