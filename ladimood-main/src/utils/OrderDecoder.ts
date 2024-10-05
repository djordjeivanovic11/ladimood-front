import Hashids from 'hashids';

const hashids = new Hashids("ladimoodjenajjacibrendnabalkanu", 20);

export const decodeOrderId = (hashedId: string): number | null => {
  const decoded = hashids.decode(hashedId);
  return decoded.length ? decoded[0] as number : null;
};


export const encodeOrderId = (orderId: number): string => {
  const encoded = hashids.encode(orderId);
  return encoded;
}