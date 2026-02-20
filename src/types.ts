export type TripCard = {
  tripId: string;
  pickupTimeLocal: string; // ISO or "HH:MM"
  passengerShort: string; // e.g. "J. Smith"
  mobilityIcon?: string; // e.g. "👩‍🦽"

  // Saved-place short codes (optional)
  pickupCode?: string; // e.g. "MCNR"
  dropoffCode?: string; // e.g. "HMDT"

  pickupLabel?: string; // e.g. "Marine Creek Clinic"
  dropoffLabel?: string; // e.g. "Harris Downtown"

  pickupCity?: string;
  dropoffCity?: string;
  pickupStreet?: string;
  dropoffStreet?: string;

  payeeAccount?: string;
  isRoundTrip?: boolean;
};

export type DayPayload = {
  org: { orgId: string; timezone: string };
  day: {
    dateLocal: string;
    startTimeLocal: string;
    slotMinutes: number;
    slotsPerDayView: number;
  };
  vehicles: Array<{
    vehicleId: string;
    unitNumber: string;
    isOutOfService: boolean;
    displayOrder: number;
    drivers: string[];
    capabilities: string[];
  }>;

  incomingRequests?: TripCard[];
  unassignedTrips?: TripCard[];
  willCallTrips?: TripCard[];
};

export type AssignedBlock = {
  trip: TripCard;
  vehicleId: string;
  slotIndex: number;
  topPx: number;
  heightPx: number;
};
