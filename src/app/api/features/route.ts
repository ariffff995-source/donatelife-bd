import { GET as settingsFeaturesGET } from '../settings/features/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  return settingsFeaturesGET();
}
