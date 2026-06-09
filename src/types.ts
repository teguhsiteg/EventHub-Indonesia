/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'organizer' | 'participant';
  avatar: string;
  whatsapp?: string;
}

export interface Category {
  id: string; // e.g. "5k", "10k", "trail-15k"
  name: string; // e.g. "5K Fun Run", "10K Challenge"
  price: number; // in IDR
  quota: number;
  registeredCount: number;
  jerseyIncluded: boolean;
  medalIncluded: boolean;
  racePackIncluded: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface IndonesianEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: 'Running' | 'Trail Run' | 'Cycling' | 'Triathlon' | 'Festival' | 'Seminar' | 'Community';
  categories: Category[];
  banner: string;
  gallery: string[];
  location: string;
  googleMapsUrl: string;
  province: string;
  city: string;
  date: string;
  registrationOpen: string;
  registrationClose: string;
  quota: number;
  registeredParticipantsCount: number;
  sponsors: string[];
  rules: string[];
  faq: FAQItem[];
  isFeatured: boolean;
  organizerId: string;
  organizerName: string;
  viewsCount: number;
  latitude?: number;
  longitude?: number;
}

// 8-step registration wizard structures
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  whatsApp: string;
}

export interface RaceInfo {
  categoryId: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | '';
}

export interface IdentityInfo {
  identityType: 'KTP' | 'Passport' | '';
  identityNumber: string;
}

export interface JerseyInfo {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | '';
  cutType: 'Male' | 'Female' | 'Unisex' | '';
}

export interface AddressInfo {
  country: string;
  province: string;
  city: string;
  district: string;
  addressDetails: string;
}

export interface EmergencyInfo {
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface MedicalInfo {
  bloodType: 'A' | 'B' | 'AB' | 'O' | 'Unknown' | '';
  allergies: string;
  specialConditions: string;
}

export interface PaymentInfo {
  method: 'qris' | 'bca_va' | 'bni_va' | 'mandiri_va' | 'cc';
  couponCode?: string;
  discountAmount: number;
  finalAmount: number;
  status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'refunded';
}

export interface Registration {
  id: string; // Registration / invoice ID
  eventId: string;
  eventTitle: string;
  eventBanner: string;
  eventCity: string;
  eventDate: string;
  categoryId: string;
  categoryName: string;
  ticketNumber: string;
  bibNumber: string;
  
  // Forms
  personalInfo: PersonalInfo;
  raceInfo: RaceInfo;
  identityInfo: IdentityInfo;
  jerseyInfo: JerseyInfo;
  addressInfo: AddressInfo;
  emergencyInfo: EmergencyInfo;
  medicalInfo: MedicalInfo;
  paymentInfo: PaymentInfo;

  checkInStatus: 'registered' | 'checked_in' | 'race_pack_collected' | 'finished' | 'dnf';
  createdAt: string;
  checkedInAt?: string;
  racePackCollectedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // percent e.g. 15 or fixed amount e.g. 50000
  quota: number;
  usedCount: number;
  expiryDate: string;
}

export interface Withdrawal {
  id: string;
  organizerId: string;
  organizerName: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  date: string;
  targetRole: 'all' | 'organizer' | 'participant';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'registration_success' | 'payment_success' | 'reminder' | 'system';
}

export interface GlobalSettings {
  platformName: string;
  platformFeePct: number; // e.g. 3% per registration
  minWithdrawalAmount: number;
  smsNotificationEnabled: boolean;
  emailNotificationEnabled: boolean;
  whatsAppNotificationsEnabled: boolean;
}

export interface OrganizerEmailSettings {
  registrationConfirmation: boolean;
  paymentReceipt: boolean;
  paymentReminder: boolean;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  createdAt: string;
  type: 'verification' | 'registration' | 'invoice' | 'receipt' | 'announcement';
  read: boolean;
  metadata?: {
    eventName?: string;
    invoiceId?: string;
    amount?: number;
    ticketNumber?: string;
    bibNumber?: string;
  };
}
