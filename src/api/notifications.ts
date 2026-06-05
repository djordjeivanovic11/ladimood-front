import axiosInstance from '@/api/axiosInstance';
import type { CreatorChallengeSubmissionPayload } from '@/schemas/creator-challenge.schema';

export async function submitCreatorChallenge(
  data: CreatorChallengeSubmissionPayload
): Promise<{ message: string }> {
  const response = await axiosInstance.post<{ message: string }>(
    '/notifications/creator-challenge',
    data
  );
  return response.data;
}
