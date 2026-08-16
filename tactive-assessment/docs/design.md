# Design Document - EVChargeFlow

## 1. Domain Model
- **Charger**: `id`, `name`, `type` (CCS, Type2, CHAdeMO), `status` (AVAILABLE, RESERVED, CHARGING, FAULT, OFFLINE), `currentVehicleId`.
- **Vehicle**: `id`, `plate`, `type` (CCS, Type2).
- **Request**: `id`, `vehicleId`, `status` (QUEUED, ALLOCATED, COMPLETED), `requestedAt`.

## 2. Charger Allocation Engine Logic
The core algorithm `allocateCharger` follows these steps:
1. **Validation**: Reject if the vehicle already has an active session.
2. **Find Compatible**: Filter chargers where `charger.type == vehicle.type`.
3. **Check Availability**: Filter compatible chargers for `status == AVAILABLE`.
4. **Allocate**: If one exists, set status to `RESERVED` or `CHARGING`, bind to vehicle.
5. **Queue**: If none exists, place vehicle at the back of the queue.

## 3. Queue Fairness Policy
The queue is ordered by `requestedAt` (FIFO). However, because of compatibility rules, the strict FIFO order might block a vehicle if its compatible charger is busy while another type of charger becomes available.
**Policy**: When a charger becomes available, the system scans the queue from front to back and allocates the charger to the *first* eligible vehicle in the queue that matches the charger's compatibility.

## 4. UI/UX Design
- **Dashboard**: A unified view showing all chargers as cards with clear color-coded statuses (Green for Available, Blue for Charging, Red for Fault).
- **Queue Panel**: A vertical list of queued vehicles, clearly showing their wait time and required charger type.
- **Interactions**: Real-time updates prevent users from seeing stale data, providing a seamless operational experience. Modern typography and layout utilizing TailwindCSS.

## 5. Fault Recovery Mechanism (Stage 3 Feature)
When a charger fails (transitions to `FAULT`):
1. Any active session is interrupted.
2. The engine attempts to find a new available compatible charger.
3. If found, the vehicle is moved to the new charger.
4. If not found, the vehicle is placed at the *front* of the queue (priority) for its charger type.
