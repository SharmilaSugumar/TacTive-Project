import { describe, it, expect, vi, beforeEach } from 'vitest';
import { allocateCharger, processQueueForCharger } from '../src/services/allocationEngine';
import prisma from '../src/services/prisma';

vi.mock('../src/services/prisma', () => ({
  default: {
    chargingRequest: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    charger: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    vehicle: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Allocation Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('allocateCharger', () => {
    it('should reject if vehicle has active session (Active Session Protection)', async () => {
      vi.mocked(prisma.chargingRequest.findFirst).mockResolvedValueOnce({ id: '1', vehicleId: 'v1', status: 'PENDING', chargerId: null, createdAt: new Date(), updatedAt: new Date() });
      await expect(allocateCharger('v1', 'CCS')).rejects.toThrow('Vehicle already has an active session');
    });

    it('should allocate if compatible charger is available (Happy Path)', async () => {
      vi.mocked(prisma.chargingRequest.findFirst).mockResolvedValueOnce(null);
      vi.mocked(prisma.charger.findFirst).mockResolvedValueOnce({ id: 'c1', type: 'CCS', status: 'AVAILABLE', vehicleId: null, createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.charger.update).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.vehicle.update).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.chargingRequest.create).mockResolvedValueOnce({ id: 'req1', vehicleId: 'v1', chargerId: 'c1', status: 'ALLOCATED', createdAt: new Date(), updatedAt: new Date() });

      const result = await allocateCharger('v1', 'CCS');
      expect(result.allocated).toBe(true);
      expect(result.request?.chargerId).toBe('c1');
    });

    it('should queue if no compatible charger is available (Queue Allocation)', async () => {
      vi.mocked(prisma.chargingRequest.findFirst).mockResolvedValueOnce(null);
      vi.mocked(prisma.charger.findFirst).mockResolvedValueOnce(null);
      vi.mocked(prisma.vehicle.update).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.chargingRequest.create).mockResolvedValueOnce({ id: 'req1', vehicleId: 'v1', chargerId: null, status: 'PENDING', createdAt: new Date(), updatedAt: new Date() });

      const result = await allocateCharger('v1', 'CCS');
      expect(result.allocated).toBe(false);
      expect(result.request?.status).toBe('PENDING');
    });
  });
});
