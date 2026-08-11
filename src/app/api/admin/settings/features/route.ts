import { GET as featuresGET, PATCH as featuresPATCH } from '../../features/route';

export const dynamic = 'force-dynamic';

export async function GET(req: any) {
  return featuresGET(req);
}

export async function PATCH(req: any) {
  return featuresPATCH(req);
}
