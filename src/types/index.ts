export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'ORGANIZER' | 'PARTICIPANT';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EventStatus = 
  | 'DRAFT' 
  | 'PUBLISHED' 
  | 'REGISTRATION_OPEN' 
  | 'REGISTRATION_CLOSED' 
  | 'ONGOING' 
  | 'COMPLETED' 
  | 'ARCHIVED';

export interface EventScheduleItem {
  time: string;
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface AddOnItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
}

export interface EventItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  banner: string;
  thumbnail: string;
  location: string;
  address: string;
  startDate: string; // ISO date string
  endDate: string;
  registrationStart: string;
  registrationEnd: string;
  status: EventStatus;
  organizerId: string;
  organizerName?: string;
  featured: boolean;
  facilities: string[];
  schedule: EventScheduleItem[];
  routeImageUrl?: string;
  elevationGpxUrl?: string;
  rules: string;
  faqs: FAQItem[];
  addons?: AddOnItem[];
  category?: string;
  categories?: string[];
  searchKeywords?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export type GenderRestriction = 'NONE' | 'MALE' | 'FEMALE';

export interface EventCategory {
  id: string;
  eventId: string;
  name: string; // e.g. "Trail Run 50K", "Fun Run 5K"
  slug: string;
  description: string;
  distance: string; // e.g. "50 KM"
  elevation: string; // e.g. "2,400 m+"
  price: number; // e.g. 500000
  earlyBirdPrice?: number;
  earlyBirdEndDate?: string;
  quota: number;
  registeredCount: number;
  startTime: string; // e.g. "05:00 WIB"
  cutoffTime: string; // e.g. "12 Hours"
  genderRestriction: GenderRestriction;
  minimumAge: number;
  maximumAge?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export type RegistrationStatus = 
  | 'PENDING' 
  | 'WAITING_PAYMENT' 
  | 'PAYMENT_REVIEW' 
  | 'VERIFIED' 
  | 'RACE_PACK_READY' 
  | 'FINISHED' 
  | 'CANCELLED';

export interface Registration {
  id: string;
  registrationNumber: string; // REG-2026-000001
  userId: string;
  eventId: string;
  categoryId: string;
  ticketCount: number;
  selectedAddons?: { addonId: string; quantity: number; price: number }[];
  status: RegistrationStatus;
  amount: number;
  invoiceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  userId: string;
  registrationId: string;
  eventId: string;
  categoryId: string;
  fullName: string;
  nik: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  address: string;
  city: string;
  province: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'UNSPECIFIED';
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  jerseySize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  bibNumber?: string;
  qrToken: string;
  checkInStatus: boolean;
  checkInTime?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED';

export interface Payment {
  id: string;
  registrationId: string;
  userId: string;
  invoiceId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId?: string;
  proofUrl?: string;
  paidAt?: string;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
}

export type MedicalAssessmentStatus = 'NOT_STARTED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface MedicalAssessment {
  id: string;
  participantId: string;
  userId: string;
  eventId: string;
  medicalConditions: string[]; // e.g. ["Asthma", "Heart Condition"]
  allergies: string;
  emergencyContactVerified: boolean;
  declarationAccepted: boolean;
  status: MedicalAssessmentStatus;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RacePack {
  id: string;
  participantId: string;
  eventId: string;
  bibNumber: string;
  qrToken: string;
  pickupStatus: 'PENDING' | 'READY' | 'COLLECTED';
  pickupLocation?: string;
  pickupSchedule?: string;
  collectedAt?: string;
  collectedBy?: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
}

export type FinisherStatus = 'FINISH' | 'DNF' | 'DNS' | 'DSQ';

export interface RaceResult {
  id: string;
  participantId: string;
  bibNumber: string;
  eventId: string;
  categoryId: string;
  participantName: string;
  gender: 'MALE' | 'FEMALE';
  gunTime: string; // e.g. "04:32:15"
  chipTime: string; // e.g. "04:31:50"
  pace: string; // e.g. "05:26 /km"
  rank: number;
  genderRank: number;
  categoryRank: number;
  status: FinisherStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string; // CERT-2026-XXXXX
  participantId: string;
  resultId: string;
  eventName: string;
  categoryName: string;
  participantName: string;
  bibNumber: string;
  finishTime: string;
  rank: number;
  categoryRank: number;
  issuedAt: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
  tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
  order: number;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  eventId?: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string;
  isPinned: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  resource: string;
  resourceId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface SystemSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  maintenanceMode: boolean;
  paymentGatewayConfigured: boolean;
  paymentGatewayName: string;
  midtransServerKey?: string;
  oauthConfigured: boolean;
  updatedAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export type PayoutStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';

export interface PayoutRequest {
  id: string;
  eventId: string;
  organizerId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  status: PayoutStatus;
  requestedAt: string;
  processedAt?: string;
  proofUrl?: string;
  notes?: string;
}
