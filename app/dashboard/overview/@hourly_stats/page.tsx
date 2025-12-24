import { delay } from '@/constants/mock-api';
import { HourlyGraph } from '@/features/overview/components/hourly-stats';

export default async function HourlyStats() {
  await await delay(2000);
  return <HourlyGraph />;
}
