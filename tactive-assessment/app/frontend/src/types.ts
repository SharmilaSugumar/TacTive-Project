export interface Charger {
  id: string;
  name: string;
  type: string;
  status: 'AVAILABLE' | 'RESERVED' | 'CHARGING' | 'FAULT' | 'OFFLINE';
  currentVehicle?: string;
}

export interface QueueItem {
  id: string;
  vehicleId: string;
  requestedType: string;
  timestamp: string;
}
