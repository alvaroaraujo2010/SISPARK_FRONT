/** Contratos alineados con la API ASP.NET Core (JSON camelCase). */

export type LoginResponse = {
  token: string;
  expiresAt: string;
  fullName: string;
  username: string;
  role: string;
  permissions: string[];
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

export type ElectronicInvoiceRequest = {
  documentType: 'CC' | 'NIT' | 'CE' | 'PAS';
  documentNumber: string;
  customerName: string;
  email: string;
};

export type ParkingMovementResult = {
  success: boolean;
  action: 'entry' | 'exit';
  message: string;
  totalToPay?: number;
  entryTicket?: EntryTicket;
  exitTicket?: ExitTicket;
  guestRegistrationCreated?: boolean;
  electronicInvoiceRequested?: boolean;
  electronicInvoiceMessage?: string;
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

export type Permission = {
  id: number;
  code: string;
  module: string;
  action: string;
  description: string;
};

export type RolePermission = {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  permissions: string[];
};

export type CreateRolePayload = {
  name: string;
  description: string;
  isActive: boolean;
  permissions: string[];
};

export type UpdateRolePayload = {
  name: string;
  description: string;
  isActive: boolean;
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

export type ClientSummary = {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  direccion: string;
  idEstado: number;
  isActive: boolean;
  fechaCreacion: string;
  placaPrincipal: string;
};

export type UpdateClientPayload = {
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
};

export type Rate = {
  id: number;
  nombre: string;
  idTipoServicio: number;
  servicio: string;
  idTipoVehiculo: number;
  tipoVehiculo: string;
  valor: number;
  fraccionMinutos: number | null;
  toleranciaMinutos: number | null;
  valorDiaCompleto: number | null;
  horaInicioNocturna: string | null;
  horaFinNocturna: string | null;
  valorNocturno: number | null;
  recargoTicketPerdido: number | null;
  fechaInicioVigencia: string;
  fechaFinVigencia: string | null;
  isActive: boolean;
};

export type CreateRatePayload = {
  name: string;
  serviceTypeId: number;
  vehicleTypeId: number;
  value: number;
  fractionMinutes?: number;
  freeToleranceMinutes?: number;
  fullDayValue?: number;
  nightStartTime?: string;
  nightEndTime?: string;
  nightValue?: number;
  lostTicketSurcharge?: number;
  startDate?: string;
  makeActive: boolean;
};

export type UpdateRatePayload = {
  name: string;
  serviceTypeId: number;
  vehicleTypeId: number;
  value: number;
  fractionMinutes?: number;
  freeToleranceMinutes?: number;
  fullDayValue?: number;
  nightStartTime?: string;
  nightEndTime?: string;
  nightValue?: number;
  lostTicketSurcharge?: number;
  endDate?: string;
  isActive: boolean;
};

export type MonthlyStatus = 'Vigente' | 'Vencida' | 'Todas';

export type Monthly = {
  id: number;
  idCliente: number;
  cliente: string;
  idVehiculo: number;
  placa: string;
  tipoVehiculo: string;
  idTarifa: number;
  tarifa: string;
  fechaInicio: string;
  fechaFin: string;
  valor: number;
  idEstado: number;
  estadoNombre: string;
  observaciones: string;
};

export type MonthlyHistoryEntry = {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  valor: number;
  idEstado: number;
  observaciones: string;
};

export type CreateMonthlyPayload = {
  clientId: number;
  vehicleId: number;
  rateId: number;
  cellId?: number;
  startDate: string;
  endDate: string;
  value: number;
  notes?: string;
};

export type RenewMonthlyPayload = {
  newEndDate: string;
  newValue: number;
  notes?: string;
};

export type PaymentMethod = {
  id: number;
  nombre: string;
  descripcion: string;
};

export type Payment = {
  id: number;
  fechaPago: string;
  idRegistro: number | null;
  idMensualidad: number | null;
  idTurno: number | null;
  idMetodoPago: number;
  metodoPago: string;
  idUsuario: number;
  operador: string;
  valorPagado: number;
  referencia: string;
  observacion: string;
};

export type CreatePaymentPayload = {
  registrationId?: number;
  monthlyId?: number;
  methodId: number;
  value: number;
  reference?: string;
  note?: string;
};

export type CashByMethod = {
  idMetodoPago: number;
  metodo: string;
  total: number;
  cantidad: number;
};

export type CashByOperator = {
  idUsuario: number;
  operador: string;
  total: number;
  cantidad: number;
};

export type CashCloseout = {
  fecha: string;
  cantidadPagos: number;
  totalRecaudado: number;
  ingresosRegistros: number;
  porMetodo: CashByMethod[];
  porOperador: CashByOperator[];
};

export type CashShift = {
  id: number;
  idUsuario: number;
  operador: string;
  fechaApertura: string;
  fechaCierre: string | null;
  baseInicial: number;
  totalSistema: number;
  efectivoReal: number | null;
  diferencia: number | null;
  observacionApertura: string;
  observacionCierre: string;
  isOpen: boolean;
};

export type OpenCashShiftPayload = {
  baseInicial: number;
  observacion?: string;
};

export type CloseCashShiftPayload = {
  efectivoReal: number;
  observacion?: string;
};

export type IncomeReport = {
  from: string;
  to: string;
  ingresosCobros: number;
  ingresosPagos: number;
  ingresosMensualidades: number;
  serie: { fecha: string; total: number; cantidad: number }[];
};

export type OccupancyReport = {
  from: string;
  to: string;
  capacidadTotal: number;
  ocupacionPromedio: number;
  totalEntradas: number;
  totalSalidas: number;
  serie: {
    fecha: string;
    entradas: number;
    salidas: number;
    capacidadTotal: number;
  }[];
};

export type OperatorPerformanceRow = {
  idUsuario: number;
  nombre: string;
  entradas: number;
  salidas: number;
  ingresos: number;
  pagosRegistrados: number;
};

export type OperatorPerformanceReport = {
  from: string;
  to: string;
  operadores: OperatorPerformanceRow[];
};

export type DueSoonItem = {
  idMensualidad: number;
  cliente: string;
  placa: string;
  fechaFin: string;
  valor: number;
};

export type DueSoonReport = {
  from: string;
  to: string;
  items: DueSoonItem[];
};

export type AuditEntry = {
  id: number;
  fecha: string;
  idUsuario: number | null;
  nombreUsuario: string;
  modulo: string;
  accion: string;
  entidad: string;
  entidadId: string;
  detalle: string;
  direccionIp: string;
};

export type UserProfile = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  lastAccess: string | null;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type UpdateUserPayload = {
  firstName: string;
  lastName: string;
  email?: string;
  roleId: number;
};

export type ResetPasswordPayload = {
  newPassword: string;
};
