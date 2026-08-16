# User Guide - EVChargeFlow

## Welcome to EVChargeFlow
EVChargeFlow is designed to help operators manage EV charging stations, allocate chargers efficiently, and manage vehicle queues in real-time.

## Getting Started

### 1. The Dashboard
The main view provides a complete overview of your charging facility.
- **Chargers Panel**: Displays all chargers and their current statuses (Available, Charging, Fault, Offline).
- **Queue Panel**: Displays vehicles waiting for a compatible charger.

### 2. Creating a Charging Request
To assign a charger to a new vehicle:
1. Click the "New Request" button.
2. Enter the Vehicle's License Plate.
3. Select the Connector Type (e.g., CCS, Type 2).
4. Click Submit.
The system will automatically allocate a compatible charger. If none are available, the vehicle is safely placed in the queue.

### 3. Monitoring Allocations
Once allocated, a charger will turn Blue (Charging). You can see which vehicle is occupying it.

### 4. Simulating Faults (For Testing)
You can manually click the "Simulate Fault" button on a charger to see the system's fault handling mechanisms in action. The charger will turn Red (Fault), and the active session will be interrupted, triggering an automatic reallocation or priority queuing.

## Troubleshooting
- **Real-time updates not showing?** Ensure the backend server is running and WebSocket connections are established (check your browser console).
- **Queue not moving?** Ensure that there is a compatible charger available for the next vehicle in line. The system will hold vehicles in queue if their required charger type is busy.
