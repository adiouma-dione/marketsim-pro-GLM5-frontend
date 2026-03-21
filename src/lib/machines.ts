import { MACHINE_DELIVERY_DELAY } from '@/lib/constants';
import type { MachineType } from '@/lib/types';

export function getMachineDeliveryRound(
  machineType: MachineType,
  purchaseRound: number
): number {
  return purchaseRound + MACHINE_DELIVERY_DELAY[machineType];
}
