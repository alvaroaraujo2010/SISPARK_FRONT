/** Contratos alineados con la API ASP.NET Core (JSON camelCase). */

export type LoginResponse = {
  token: string;
  expiresAt: string;
  fullName: string;
  username: string;
  role: string;
};

export type DashboardSummary = {
  activeVehicles: number;
  availableSpots: number;
  dailyRevenue: number;
  monthlyDueSoon: number;
};

export type VehicleType = {
  id: number;
  name: string;
};

export type VehicleRegistrationPayload = {
  identificationType: string;
  identificationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  plate: string;
  brand: string;
  vehicleModel: string;
  color: string;
  vehicleTypeId: number;
  paymentType: string;
  comments?: string;
};

export type VehicleRegistrationResult = {
  success: boolean;
  message: string;
  clientId: number;
  vehicleId: number;
  userId: number;
};

export type ActiveVehicle = {
  idRegistro: number;
  placa: string;
  fechaIngreso: string;
  fechaSalida: string | null;
  valorPagar: number;
  tipoServicio: string;
};

export type ParkingMovementResult = {
  success: boolean;
  action: 'entry' | 'exit';
  message: string;
  totalToPay?: number;
};

export type ParkingRegistrationPreviewPayload = {
  identificationType: string;
  identificationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  plate: string;
  vehicleModel: string;
  paymentType: string;
  comments?: string;
};

export type ParkingRegistrationPreviewResult = {
  success: boolean;
  message: string;
  fullName: string;
  plate: string;
  paymentType: string;
};
