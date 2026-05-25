import axios from 'axios';

export function getHttpStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
}

export function isUnauthorizedError(error: unknown): boolean {
  return getHttpStatus(error) === 401;
}

export function isNotFoundError(error: unknown): boolean {
  return getHttpStatus(error) === 404;
}
