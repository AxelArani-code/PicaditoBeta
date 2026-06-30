export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled";

export type Booking = {
  id: string;
  pitchName: string;
  userName: string;
  status: BookingStatus;
  date: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  paymentStatus: string;
};

export type VenueOption = {
  value: string;
  label: string;
};

export type BookingAnalytics = {
  totalIncome: number;
  totalReservations: number;
  activeReservations: number;
  occupancyRate: number;
};

export type DashboardAnalytics = {
  totalReservations: number;
  totalIncome: number;
  activeReservations: number;
  occupancyRate: number;
  bookingsByState: Record<string, number>;
  bookingsByPayment: Record<string, number>;
  revenueByVenue: Record<string, number>;
  trendByDate: Record<string, number>;
  busiestHours: Record<string, number>;
  mostUsedPitch: string;
  topVenue: string;
};

export type RecentActivityItem = {
  id: string;
  actionText: string;
  actionType: BookingStatus;
  userName: string;
  timestamp: Date;
  booking: Record<string, unknown>;
};

export type Field = {
  name: string;
  type: string;
  status: "DISPONIBLE" | "RESERVADA";
  next: string;
  action: string;
  reserveNow: boolean;
};

export type BookingsHookReturn = {
  bookings: Booking[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  loading: boolean;
  error: string | null;
  statusFilter: string;
  actionLoading: string | null;
  sortBy: string;
  autoRefreshEnabled: boolean;
  selectedVenue: string;
  venueOptions: VenueOption[];
  analytics: DashboardAnalytics;
  getVenueLabel: (value: string) => string;
  kpis: BookingAnalytics;
  recentActivity: RecentActivityItem[];
  handleStatusFilterChange: (newStatus: string) => void;
  handleVenueChange: (newVenue: string) => void;
  handlePrevPage: () => void;
  handleNextPage: () => void;
  handleConfirmBooking: (bookingId: string) => Promise<boolean>;
  handleRejectBooking: (bookingId: string) => Promise<boolean>;
  handleCancelBooking: (bookingId: string) => Promise<void>;
  handleSortChange: (newSortBy: string) => void;
  toggleAutoRefresh: (enabled: boolean) => void;
};
