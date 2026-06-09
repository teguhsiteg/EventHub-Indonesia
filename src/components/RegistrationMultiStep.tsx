/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, Check, AlertCircle, ArrowLeft, ArrowRight, CreditCard, 
  Wallet, ShieldCheck, Ticket, Users, FileText, MapPin, 
  Sparkles, Smartphone, Clock 
} from 'lucide-react';

interface RegistrationMultiStepProps {
  eventId: string;
  categoryId: string;
  onNavigate: (view: 'landing' | 'marketplace' | 'detail' | 'checkout' | 'dashboard', extraEventId?: string) => void;
}

export const RegistrationMultiStep: React.FC<RegistrationMultiStepProps> = ({ eventId, categoryId, onNavigate }) => {
  const { events, addRegistration, useCoupon } = useApp();

  const event = events.find(e => e.id === eventId);
  const category = event?.categories.find(c => c.id === categoryId);

  // Active step (1 to 8)
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Personal Information State
  const [personal, setPersonal] = useState({
    firstName: 'Budi',
    lastName: 'Santoso',
    email: 'budi.santoso@gmail.com',
    whatsApp: '081234567890'
  });

  // 2. Race Information State
  const [race, setRace] = useState({
    categoryId: categoryId,
    dateOfBirth: '1992-04-15',
    gender: 'Male' as 'Male' | 'Female'
  });

  // 3. Identity State
  const [identity, setIdentity] = useState({
    identityType: 'KTP' as 'KTP' | 'Passport',
    identityNumber: '3174091504920003'
  });

  // 4. Jersey State
  const [jersey, setJersey] = useState({
    size: 'L' as 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL',
    cutType: 'Male' as 'Male' | 'Female' | 'Unisex'
  });

  // 5. Address State
  const [address, setAddress] = useState({
    country: 'Indonesia',
    province: 'DKI Jakarta',
    city: 'Jakarta Selatan',
    district: 'Cilandak',
    addressDetails: 'Jl. Kemang Selatan No. 45'
  });

  // 6. Emergency State
  const [emergency, setEmergency] = useState({
    name: 'Dewi Lestari',
    relationship: 'Spouse',
    phoneNumber: '081298765432'
  });

  // 7. Medical Info State
  const [medical, setMedical] = useState({
    bloodType: 'O' as 'A' | 'B' | 'AB' | 'O' | 'Unknown',
    allergies: 'None',
    specialConditions: 'None'
  });

  // 8. Payment State
  const gatewaySettings = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('eh_gateway_settings');
      return saved ? JSON.parse(saved) : {
        activeMethods: { qris: true, bca_va: true, bni_va: true, mandiri_va: true, cc: false }
      };
    } catch (e) {
      return { activeMethods: { qris: true, bca_va: true, bni_va: true, mandiri_va: true, cc: false } };
    }
  }, []);

  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bca_va' | 'bni_va' | 'mandiri_va' | 'cc'>(() => {
    try {
      const saved = localStorage.getItem('eh_gateway_settings');
      const settings = saved ? JSON.parse(saved) : null;
      if (settings && settings.activeMethods) {
        if (settings.activeMethods.qris) return 'qris';
        if (settings.activeMethods.bca_va) return 'bca_va';
        if (settings.activeMethods.bni_va) return 'bni_va';
        if (settings.activeMethods.mandiri_va) return 'mandiri_va';
        if (settings.activeMethods.cc) return 'cc';
      }
    } catch (e) {}
    return 'qris';
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: 'percentage' | 'fixed'; value: number } | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaidSimulated, setIsPaidSimulated] = useState(false);
  const [registeredStatus, setRegisteredStatus] = useState<'paid' | 'pending'>('paid');

  // Validate fields for current step
  const validateStep = (step: number): boolean => {
    setErrorMsg('');
    if (step === 1) {
      if (!personal.firstName.trim() || !personal.lastName.trim()) {
        setErrorMsg('Please specify first and last name values.');
        return false;
      }
      if (!personal.email.trim() || !personal.email.includes('@')) {
        setErrorMsg('Please supply a valid email ID address.');
        return false;
      }
      if (!personal.whatsApp.trim() || personal.whatsApp.length < 9) {
        setErrorMsg('Please provide a valid WhatsApp contact number.');
        return false;
      }
    } else if (step === 2) {
      if (!race.dateOfBirth) {
        setErrorMsg('Please select your Date of Birth.');
        return false;
      }
    } else if (step === 3) {
      if (!identity.identityNumber.trim()) {
        setErrorMsg('Form requires original KTP or Passport ID number entry.');
        return false;
      }
    } else if (step === 4) {
      if (!jersey.size || !jersey.cutType) {
        setErrorMsg('Please select both Jersey Size and Cut Type.');
        return false;
      }
    } else if (step === 5) {
      if (!address.province.trim() || !address.city.trim() || !address.addressDetails.trim()) {
        setErrorMsg('Complete Indonesian Address is mandatory.');
        return false;
      }
    } else if (step === 6) {
      if (!emergency.name.trim() || !emergency.phoneNumber.trim()) {
        setErrorMsg('Emergency contact name and phone number variables required.');
        return false;
      }
    } else if (step === 7) {
      if (!medical.bloodType) {
        setErrorMsg('Select your Blood Type (select Unknown if unsure).');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setErrorMsg('');
    setCurrentStep(prev => prev - 1);
  };

  // Coupons trigger
  const handleApplyCoupon = () => {
    setErrorMsg('');
    const coupon = useCoupon(couponCode);
    if (!coupon) {
      setErrorMsg('Invalid or expired Coupon Code entered.');
      return;
    }
    setAppliedCoupon({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value
    });
  };

  const basePrice = category?.price || 0;
  
  // Calculate final totals
  const discountAmount = appliedCoupon 
    ? (appliedCoupon.type === 'percentage' ? (basePrice * (appliedCoupon.value / 100)) : appliedCoupon.value)
    : 0;

  const finalAmount = Math.max(0, basePrice - discountAmount);

  // Trigger simulated payment flow (Midtrans style)
  const handleSimulatePayment = (paymentStatus: 'paid' | 'pending' = 'paid') => {
    setIsProcessingPayment(true);
    setRegisteredStatus(paymentStatus);
    
    // Simulate transaction delay
    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsPaidSimulated(true);

      // Create actual registration record
      if (event && category) {
        addRegistration({
          eventId: event.id,
          eventTitle: event.title,
          eventBanner: event.banner,
          eventCity: evtCity,
          eventDate: event.date,
          categoryId: category.id,
          categoryName: category.name,
          personalInfo: personal,
          raceInfo: race,
          identityInfo: identity,
          jerseyInfo: jersey,
          addressInfo: address,
          emergencyInfo: emergency,
          medicalInfo: medical,
          paymentInfo: {
            method: paymentMethod,
            couponCode: appliedCoupon?.code,
            discountAmount,
            finalAmount,
            status: paymentStatus
          }
        });
      }
    }, 2000);
  };

  if (!event || !category) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h3 className="mt-4 font-sans text-base font-extrabold text-slate-00">Error Setup</h3>
        <p className="mt-1 text-xs text-slate-400">Selected category configuration is invalid.</p>
        <button
          onClick={() => onNavigate('marketplace')}
          className="mt-6 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
        >
          Return
        </button>
      </div>
    );
  }

  const evtCity = event.city;

  const stepsList = [
    'Profile', 
    'Race Info', 
    'Identity', 
    'Jersey Size', 
    'Address', 
    'Emergency', 
    'Medical', 
    'Midtrans VA'
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4">
        
        {/* Wizard Progress Indicator header */}
        <div className="mb-8 rounded-3xl bg-white p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">RACE REGISTRATION WIZARD</p>
              <h1 className="mt-1 font-sans text-base font-extrabold text-slate-900 truncate max-w-sm sm:max-w-md">
                {event.title}
              </h1>
            </div>
            <span className="rounded-full bg-cyan-50 border border-cyan-100 px-3.5 py-1 text-xs font-bold text-cyan-700 font-mono shrink-0">
              Step {currentStep} of {stepsList.length}
            </span>
          </div>

          {/* Graphical timeline strip */}
          <div className="relative flex items-center justify-between pt-2">
            <div className="absolute left-0 right-0 top-6 h-1 w-full bg-slate-100 -z-0 rounded-full" />
            <div 
              className="absolute left-0 top-6 h-1 bg-cyan-400 -z-0 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep - 1) / (stepsList.length - 1)) * 100}%` }}
            />

            {stepsList.map((stepName, idx) => {
              const stepIndex = idx + 1;
              const isActive = currentStep === stepIndex;
              const isCompleted = currentStep > stepIndex;

              return (
                <div key={idx} className="relative z-10 flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                    isCompleted 
                      ? 'border-cyan-500 bg-cyan-500 text-white shadow-xs' 
                      : isActive
                        ? 'border-cyan-400 bg-white text-cyan-600 ring-4 ring-cyan-50'
                        : 'border-slate-200 bg-white text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="h-4 w-4" /> : stepIndex}
                  </div>
                  <span className="hidden sm:block mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">{stepName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validation Errors container */}
        {errorMsg && (
          <div className="mb-6 flex items-center space-x-2.5 rounded-2xl border border-red-100 bg-red-50 p-4 font-sans text-xs font-bold text-red-600 animate-shake">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Wizard Steps Form Boxes */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
          
          {/* STEP 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <dt className="text-sm font-extrabold text-slate-900">Personal Information</dt>
                <dd className="mt-1 text-xs text-slate-400">Provide official contact pathways for tickets and bib notices.</dd>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">First Name</label>
                  <input
                    type="text"
                    value={personal.firstName}
                    onChange={(e) => setPersonal(prev => ({ ...prev, firstName: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Last Name</label>
                  <input
                    type="text"
                    value={personal.lastName}
                    onChange={(e) => setPersonal(prev => ({ ...prev, lastName: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <input
                  type="email"
                  value={personal.email}
                  disabled
                  className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-100 p-3 text-xs font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">WhatsApp Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 081234567890"
                  value={personal.whatsApp}
                  onChange={(e) => setPersonal(prev => ({ ...prev, whatsApp: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Race Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <dt className="text-sm font-extrabold text-slate-900">Race Selection Profile</dt>
                <dd className="mt-1 text-xs text-slate-400">Confirm slot class and birth certificate declarations.</dd>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Selected Race Class</label>
                <input
                  type="text"
                  value={category.name}
                  disabled
                  className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-150 p-3 text-xs font-bold text-slate-600"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Date of Birth</label>
                  <input
                    type="date"
                    value={race.dateOfBirth}
                    onChange={(e) => setRace(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Gender</label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {['Male', 'Female'].map(g => (
                      <button
                        key={g}
                        onClick={() => setRace(prev => ({ ...prev, gender: g as any }))}
                        className={`rounded-xl border p-3 text-xs font-bold transition-colors ${
                          race.gender === g
                            ? 'border-cyan-500 bg-cyan-50/10 text-cyan-600'
                            : 'border-slate-100 bg-slate-50 text-slate-600'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Identity Card Verification */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <dt className="text-sm font-extrabold text-slate-900">Government Identity Verification</dt>
                <dd className="mt-1 text-xs text-slate-400">Enter original credentials representing you. Required for insurance and check-in confirmation lists.</dd>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Identity Document Type</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {['KTP', 'Passport'].map(idType => (
                    <button
                      key={idType}
                      onClick={() => setIdentity(prev => ({ ...prev, identityType: idType as any }))}
                      className={`rounded-xl border p-3 text-xs font-bold transition-colors ${
                        identity.identityType === idType
                          ? 'border-cyan-500 bg-cyan-50/10 text-cyan-600'
                          : 'border-slate-100 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {idType === 'KTP' ? 'National ID KTP' : 'International Passport'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {identity.identityType === 'KTP' ? 'NIK KTP Number (16 Digits)' : 'Passport Document Number'}
                </label>
                <input
                  type="text"
                  placeholder={identity.identityType === 'KTP' ? 'e.g. 3201502409890001' : 'e.g. B1234567'}
                  value={identity.identityNumber}
                  onChange={(e) => setIdentity(prev => ({ ...prev, identityNumber: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Jersey Sizing and Cuts */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <dt className="text-sm font-extrabold text-slate-900">Official Athletic Jersey Size</dt>
                <dd className="mt-1 text-xs text-slate-400">Perfect cut fit configuration for event runners.</dd>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Cut Preference</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {['Male', 'Female', 'Unisex'].map(cut => (
                    <button
                      key={cut}
                      onClick={() => setJersey(prev => ({ ...prev, cutType: cut as any }))}
                      className={`rounded-xl border p-3 text-[11px] font-bold transition-colors ${
                        jersey.cutType === cut
                          ? 'border-cyan-500 bg-cyan-50/10 text-cyan-600'
                          : 'border-slate-100 bg-slate-50 text-slate-500'
                      }`}
                    >
                      {cut}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Jersey Size Chart</label>
                <div className="mt-2.5 grid grid-cols-4 gap-2 text-center">
                  {(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const).map(sz => (
                    <button
                      key={sz}
                      onClick={() => setJersey(prev => ({ ...prev, size: sz }))}
                      className={`rounded-xl border p-3 text-xs font-bold transition-colors ${
                        jersey.size === sz
                          ? 'border-cyan-500 bg-cyan-50/10 text-cyan-600'
                          : 'border-slate-100 bg-slate-50 text-slate-650'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                
                {/* Visual guideline box */}
                <div className="mt-5 rounded-2xl bg-slate-50 p-4 border border-slate-100/50 text-[10px] text-slate-400 leading-normal">
                  <p className="font-bold text-slate-500 uppercase tracking-wider">STANDARD SIZING CHART REFERENCE (CM)</p>
                  <p className="mt-1">Size M: Width 48 cm, Length 68 cm | Size L: Width 51 cm, Length 71 cm | Size XL: Width 54 cm, Length 74 cm.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Shipping Mailing Address */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <dt className="text-sm font-extrabold text-slate-900">Standard Mailing Address</dt>
                <dd className="mt-1 text-xs text-slate-400">Used for shipping medals, jerseys or race tags if home delivery option is activated.</dd>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Province</label>
                  <input
                    type="text"
                    value={address.province}
                    onChange={(e) => setAddress(prev => ({ ...prev, province: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">City / Kabupaten</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">District / Kecamatan</label>
                  <input
                    type="text"
                    value={address.district}
                    onChange={(e) => setAddress(prev => ({ ...prev, district: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Country</label>
                  <input
                    type="text"
                    value={address.country}
                    disabled
                    className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-100 p-3 text-xs font-semibold text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Street & Building Address particulars</label>
                <textarea
                  rows={3}
                  value={address.addressDetails}
                  onChange={(e) => setAddress(prev => ({ ...prev, addressDetails: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:outline-hidden resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Emergency Contact Person */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <dt className="text-sm font-extrabold text-slate-900">Emergency Contact Person</dt>
                <dd className="mt-1 text-xs text-slate-400">Required contact pathways during unexpected medical instances.</dd>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact Person Name</label>
                <input
                  type="text"
                  value={emergency.name}
                  onChange={(e) => setEmergency(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Relationship</label>
                  <input
                    type="text"
                    placeholder="e.g. Spouse, Father, Mother, Sibling"
                    value={emergency.relationship}
                    onChange={(e) => setEmergency(prev => ({ ...prev, relationship: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
                  <input
                    type="text"
                    value={emergency.phoneNumber}
                    onChange={(e) => setEmergency(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Medical Health Log info */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <dt className="text-sm font-extrabold text-slate-900">Official Medical Disclosures</dt>
                <dd className="mt-1 text-xs text-slate-400">Assisting medical first-responders with key info.</dd>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Blood Type</label>
                <div className="mt-2 grid grid-cols-5 gap-2 text-center font-mono">
                  {['A', 'B', 'AB', 'O', 'Unknown'].map(bt => (
                    <button
                      key={bt}
                      onClick={() => setMedical(prev => ({ ...prev, bloodType: bt as any }))}
                      className={`rounded-xl border p-3 text-xs font-bold transition-colors ${
                        medical.bloodType === bt
                          ? 'border-cyan-500 bg-cyan-50/10 text-cyan-600'
                          : 'border-slate-100 bg-slate-50 text-slate-550'
                      }`}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Food or Medication Allergies</label>
                <input
                  type="text"
                  placeholder="e.g. Peanuts, Ibuprofen, None"
                  value={medical.allergies}
                  onChange={(e) => setMedical(prev => ({ ...prev, allergies: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Special Medical Conditions / Asthma</label>
                <input
                  type="text"
                  placeholder="e.g. Mild Heart condition, Asthma, None"
                  value={medical.specialConditions}
                  onChange={(e) => setMedical(prev => ({ ...prev, specialConditions: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* STEP 8: Midtrans Payment Terminal simulation */}
          {currentStep === 8 && (
            <div className="space-y-6">
              
              {!isPaidSimulated ? (
                <>
                  <div>
                    <dt className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                      <Wallet className="h-5 w-5 text-slate-900" />
                      <span>Midtrans Checkout Gateway</span>
                    </dt>
                    <dd className="mt-1 text-xs text-slate-400">Secure automated billing channel with immediate certificate registration clearances.</dd>
                  </div>

                  {/* Pricing recap */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 mt-4">
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">INVOICE ITEM DETAILS</p>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-650">
                        <span>{category.name} Slot entry</span>
                        <span className="font-mono text-slate-800 font-bold">Rp {basePrice.toLocaleString('id-ID')}</span>
                      </div>
                      
                      {appliedCoupon && (
                        <div className="flex items-center justify-between text-emerald-600 font-semibold text-[11px]">
                          <span>Discount (Code: {appliedCoupon.code})</span>
                          <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
                        </div>
                      )}

                      <div className="border-t border-slate-200/60 pt-3 mt-2 flex items-center justify-between font-bold text-sm">
                        <span className="text-slate-900">Total invoice amount</span>
                        <span className="font-mono text-cyan-600" id="checkout-total-price">
                          Rp {finalAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Promo Coupons trigger */}
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="text"
                      placeholder="ENTER PROMO CODE (e.g. PROMORUN15)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold uppercase focus:outline-hidden"
                      id="coupon-input"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold px-4 py-3"
                      id="apply-coupon-btn"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Midtrans active channels */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Select Settlement Channel</label>
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
                      
                      {(!gatewaySettings || !gatewaySettings.activeMethods || 
                        (!gatewaySettings.activeMethods.qris && 
                         !gatewaySettings.activeMethods.bca_va && 
                         !gatewaySettings.activeMethods.bni_va && 
                         !gatewaySettings.activeMethods.mandiri_va && 
                         !gatewaySettings.activeMethods.cc)) && (
                        <div className="col-span-full p-4 rounded-xl bg-red-50 text-red-700 font-sans text-xs font-bold text-center border border-red-200">
                          Gateway offline. Please contact administrator to enable settlement channels.
                        </div>
                      )}

                      {gatewaySettings?.activeMethods?.qris && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('qris')}
                          className={`rounded-2xl border p-4 text-left flex flex-col justify-between h-24 transition-colors cursor-pointer ${
                            paymentMethod === 'qris'
                              ? 'border-cyan-500 bg-cyan-50/10 text-cyan-600'
                              : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <Smartphone className="h-5 w-5 shrink-0" />
                          <div>
                            <p className="font-sans text-xs font-bold">QRIS Barcode</p>
                            <p className="text-[9px] text-slate-400">Any E-Wallet instant</p>
                          </div>
                        </button>
                      )}

                      {gatewaySettings?.activeMethods?.bca_va && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('bca_va')}
                          className={`rounded-2xl border p-4 text-left flex flex-col justify-between h-24 transition-colors cursor-pointer ${
                            paymentMethod === 'bca_va'
                              ? 'border-cyan-500 bg-cyan-50/10 text-cyan-600'
                              : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <CreditCard className="h-5 w-5 shrink-0" />
                          <div>
                            <p className="font-sans text-xs font-bold">BCA Virtual Acc</p>
                            <p className="text-[9px] text-slate-400">Official Auto Match</p>
                          </div>
                        </button>
                      )}

                      {gatewaySettings?.activeMethods?.bni_va && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('bni_va')}
                          className={`rounded-2xl border p-4 text-left flex flex-col justify-between h-24 transition-colors cursor-pointer ${
                            paymentMethod === 'bni_va'
                              ? 'border-cyan-500 bg-cyan-50/10 text-cyan-600'
                              : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <CreditCard className="h-5 w-5 shrink-0" />
                          <div>
                            <p className="font-sans text-xs font-bold">BNI Virtual Acc</p>
                            <p className="text-[9px] text-slate-400">State Bank Match</p>
                          </div>
                        </button>
                      )}

                      {gatewaySettings?.activeMethods?.mandiri_va && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('mandiri_va')}
                          className={`rounded-2xl border p-4 text-left flex flex-col justify-between h-24 transition-colors cursor-pointer ${
                            paymentMethod === 'mandiri_va'
                              ? 'border-cyan-500 bg-cyan-50/10 text-cyan-600'
                              : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <CreditCard className="h-5 w-5 shrink-0" />
                          <div>
                            <p className="font-sans text-xs font-bold">Mandiri VA</p>
                            <p className="text-[9px] text-slate-400">Direct integration</p>
                          </div>
                        </button>
                      )}

                      {gatewaySettings?.activeMethods?.cc && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cc')}
                          className={`rounded-2xl border p-4 text-left flex flex-col justify-between h-24 transition-colors cursor-pointer ${
                            paymentMethod === 'cc'
                              ? 'border-cyan-500 bg-cyan-50/10 text-cyan-600'
                              : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <CreditCard className="h-5 w-5 shrink-0" />
                          <div>
                            <p className="font-sans text-xs font-bold">Credit/Debit Card</p>
                            <p className="text-[9px] text-slate-400">Visa & MasterCard secure</p>
                          </div>
                        </button>
                      )}

                    </div>
                  </div>

                  {/* Midtrans pay simulator actions */}
                  <div className="pt-4 border-t border-slate-50 flex flex-col items-center">
                    {isProcessingPayment ? (
                      <div className="flex flex-col items-center py-6 text-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500 mb-4" />
                        <p className="font-sans text-xs font-bold text-slate-800">Processing with Midtrans Secure Link...</p>
                        <p className="text-[10px] text-slate-400 mt-1">Verifying virtual accounts escrow availability.</p>
                      </div>
                    ) : (
                      <>
                        {paymentMethod === 'qris' && (
                          <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 flex flex-col items-center">
                            <p className="text-[9px] font-bold text-slate-400 mb-2">SCAN DETECTED CODE WITH GOJEK / OVO / SHOPEEPAY</p>
                            {/* Real looking barcode box using CSS */}
                            <div className="w-40 h-40 bg-white p-2 border border-slate-200 rounded-xl flex items-center justify-center relative">
                              <div className="grid grid-cols-4 gap-0.5 w-[120px] h-[120px]">
                                {Array.from({ length: 16 }).map((_, i) => (
                                  <div 
                                    key={i} 
                                    className={`w-7 h-7 flex items-center justify-center ${
                                      (i*3)%5===0 || i%6===0 ? 'bg-slate-900' : 'bg-transparent'
                                    }`}
                                  >
                                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-xs" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col space-y-3 w-full sm:w-80">
                          <button
                            type="button"
                            onClick={() => handleSimulatePayment('paid')}
                            className="w-full rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans text-xs font-extrabold p-4 shadow-lg shadow-cyan-500/10 transition-all hover:scale-[1.01] active:scale-95 duration-200 cursor-pointer text-center"
                            id="submit-payment-btn"
                          >
                            ⚡ Bayar Sekarang (Simulasi Lunas)
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleSimulatePayment('pending')}
                            className="w-full rounded-2xl bg-amber-500 hover:bg-amber-450 text-slate-950 font-sans text-xs font-extrabold p-4 shadow-lg shadow-amber-500/10 transition-all hover:scale-[1.01] active:scale-95 duration-200 cursor-pointer text-center"
                            id="submit-pending-btn"
                          >
                            ⏳ Bayar Nanti (Pending - Timer 10 Menit)
                          </button>
                        </div>
                        <p className="text-[9.5px] text-slate-400 text-center mt-2 flex items-center justify-center space-x-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-slate-450 text-emerald-500 shrink-0" />
                          <span>PCI-DSS Compliance Secured by Midtrans Gateway Corp.</span>
                        </p>
                      </>
                    )}
                  </div>
                </>
              ) : (
                /* Payment Success / Pending summary layout */
                <div className="py-8 flex flex-col items-center text-center animate-in scale-in-95 duration-300">
                  {registeredStatus === 'paid' ? (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md mb-6">
                      <Check className="h-8 w-8 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-650 shadow-md mb-6 animate-pulse">
                      <Clock className="h-8 w-8 stroke-[2]" />
                    </div>
                  )}
                  
                  <span className={`inline-flex items-center space-x-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-4 ${
                    registeredStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    <span>{registeredStatus === 'paid' ? 'LUNAS INSTAN' : 'MENUNGGU PEMBAYARAN'}</span>
                  </span>

                  <h2 className="font-sans text-lg font-extrabold text-slate-900">
                    {registeredStatus === 'paid' ? 'Pendaftaran Berhasil!' : 'Invoice Berhasil Diterbitkan!'}
                  </h2>
                  
                  <p className="mt-2 max-w-sm font-sans text-xs text-slate-400 leading-normal">
                    {registeredStatus === 'paid' 
                      ? 'Kami telah berhasil memverifikasi pembayaran Anda secara otomatis. E-Tiket PDF dan alokasi nomor BIB unik Anda telah dicetak secara digital!'
                      : 'Slot pendaftaran Anda telah berhasil dipesan sementara. Silakan selesaikan pembayaran Anda dalam waktu 10 menit melalui Dashboard Peserta sebelum pesanan dibatalkan otomatis oleh sistem!'}
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2 w-full">
                    <button
                      onClick={() => onNavigate('dashboard')}
                      className="rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 font-sans text-xs font-bold text-slate-700 py-3 transition-colors cursor-pointer"
                      id="success-view-tickets-btn"
                    >
                      {registeredStatus === 'paid' ? 'Buka E-Tiket' : 'Ke Dasbor Pembayaran'}
                    </button>
                    <button
                      onClick={() => onNavigate('marketplace')}
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 font-sans text-xs font-bold text-white py-3 transition-opacity cursor-pointer"
                    >
                      Kembali ke Event
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Stepper Navigation buttons footer */}
          {!isPaidSimulated && (
            <div className={`mt-8 flex justify-between border-t border-slate-50 pt-6 ${currentStep === 8 ? 'hidden' : ''}`}>
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 px-4 py-2.5 text-xs font-bold text-slate-650 transition-colors"
                id="wizard-prev-btn"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white transition-opacity"
                id="wizard-next-btn"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
