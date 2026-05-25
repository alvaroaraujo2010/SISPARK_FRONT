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
  fechaIngreso: string | null;
  fechaSalida: string | null;
  valorPagar: number;
  tipoServicio: string;
};

export type ParkingBoardVehicle = {
  idRegistro: number;
  placa: string;
  tipoVehiculo: string;
  tipoServicio: string;
  fechaIngreso: string | null;
  fechaSalida: string | null;
  valorPagar: number;
  estado: 'Activo' | 'Salió' | 'Inactivo' | 'Registrado';
};

export type TicketRateInfo = {
  rateValue: number;
  fractionMinutes: number;
  rateName: string;
};

export type EntryTicket = TicketRateInfo & {
  registrationId: number;
  plate: string;
  entryAt: string;
  parkingLotName: string;
  address: string;
  phone: string;
  mobilePhone: string;
  vehicleType: string;
  serviceType: string;
  operatorName: string;
};

export type ExitTicket = TicketRateInfo & {
  registrationId: number;
  plate: string;
  entryAt: string;
  exitAt: string;
  minutesConsumed: number;
  totalToPay: number;
  parkingLotName: string;
  address: string;
  phone: string;
  mobilePhone: string;
  vehicleType: string;
  serviceType: string;
  operatorName: string;
};

export type VisitorVehicleTypeOption = {
  id: number;
  name: string;
};

export type ParkingMovementPreview = {
  plate: string;
  isRegistered: boolean;
  hasOpenEntry: boolean;
  requiresVehicleType: boolean;
  visitorVehicleTypes: VisitorVehicleTypeOption[];
  estimatedAmountToPay?: number;
};

export type ReprintTicketResult = {
  ticketType: 'entry' | 'exit';
  entryTicket?: EntryTicket;
  exitTicket?: ExitTicket;
};

export type ParkingMovementResult = {
  success: boolean;
  action: 'entry' | 'exit';
  message: string;
  totalToPay?: number;
  entryTicket?: EntryTicket;
  exitTicket?: ExitTicket;
  guestRegistrationCreated?: boolean;
};

export type ParkingLot = {
  id: number;
  name: string;
  address: string;
  phone: string;
  mobilePhone: string;
  hourlyRate: number;
  fractionMinutes: number;
  totalCapacity: number;
  activeVehicles: number;
  availableSpots: number;
  updatedAt: string;
};

export type RoleOption = {
  id: number;
  name: string;
  description: string;
};

export type UserAccount = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string | null;
  roleId: number;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  lastAccess: string | null;
};

export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  password: string;
  roleId: number;
};

export type UpdateParkingLotPayload = {
  name: string;
  address: string;
  phone: string;
  mobilePhone: string;
  hourlyRate: number;
  fractionMinutes: number;
  totalCapacity: number;
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

export type ChannelReplyButton = {
  id: string;
  title: string;
};

export type ChannelUiBlock = {
  type: 'summary_cards' | 'active_vehicles_list' | string;
  props: Record<string, unknown>;
};

export type ChannelWebMessageResponse = {
  text: string;
  buttons: ChannelReplyButton[];
  uiBlocks: ChannelUiBlock[];
};

export type WhatsAppOperatorLink = {
  id: number;
  waId: string;
  userId: number;
  userFullName: string;
  roleName: string;
  active: boolean;
};

export type CreateWhatsAppLinkPayload = {
  waId: string;
  userId: number;
};
