import { db } from '@/src/db/index';
import { users as dbUsers } from '@/src/db/schema';
import { isNull, eq } from 'drizzle-orm';

/**
 * Extracts integer from Donor ID string e.g. "DBD-000005" -> 5
 */
export function parseDonorIdNum(donorIdStr?: string | null): number {
  if (!donorIdStr || !donorIdStr.startsWith('DBD-')) return 0;
  const numPart = donorIdStr.replace('DBD-', '');
  const num = parseInt(numPart, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Formats a number to DBD-XXXXXX string
 */
export function formatDonorId(num: number): string {
  return `DBD-${String(num).padStart(6, '0')}`;
}

/**
 * Returns the highest numeric donor ID suffix found in the DB.
 */
export async function getHighestDonorIdNum(): Promise<number> {
  try {
    const allUsers = await db.select({ donorId: dbUsers.donorId }).from(dbUsers);
    let maxNum = 0;
    for (const u of allUsers) {
      const num = parseDonorIdNum(u.donorId);
      if (num > maxNum) {
        maxNum = num;
      }
    }
    return maxNum;
  } catch (err) {
    console.error('[DonorID] Failed to calculate max donor ID:', err);
    return 0;
  }
}

/**
 * Generates the next sequential unique Donor ID (e.g. DBD-000006)
 */
export async function generateNextDonorId(): Promise<string> {
  const highest = await getHighestDonorIdNum();
  return formatDonorId(highest + 1);
}

/**
 * Automatically backfills all existing users who do not have a donor_id yet.
 */
export async function backfillDonorIds(): Promise<void> {
  try {
    const usersToUpdate = await db
      .select({ id: dbUsers.id, donorId: dbUsers.donorId })
      .from(dbUsers)
      .where(isNull(dbUsers.donorId));

    if (usersToUpdate.length === 0) return;

    let currentNum = await getHighestDonorIdNum();

    for (const u of usersToUpdate) {
      if (!u.donorId) {
        currentNum++;
        const nextDonorId = formatDonorId(currentNum);
        await db
          .update(dbUsers)
          .set({ donorId: nextDonorId })
          .where(eq(dbUsers.id, u.id));
        console.log(`[DonorID] Successfully backfilled donor ID ${nextDonorId} for user ${u.id}`);
      }
    }
  } catch (err) {
    console.error('[DonorID] Failed to backfill donor IDs:', err);
  }
}
