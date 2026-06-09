/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndonesianEvent, Registration, Coupon, Withdrawal, SystemAnnouncement, AppNotification } from '../types';

export const INITIAL_EVENTS: IndonesianEvent[] = [
  {
    id: 'evt-boro-marathon-2026',
    title: 'Borobudur Marathon 2026',
    slug: 'borobudur-marathon-2026',
    description: 'Experience the magic of Magelang and run alongside local villages with their rich culture. Borobudur Marathon is a world-class road running event offering challenging routes, scenic views of the ancient Borobudur temple, and unparalleled local hospitality that motivates runners from all around the world. Fully supported by Bank Jateng and certified by World Athletics.',
    category: 'Running',
    banner: 'https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&q=80&w=600'
    ],
    location: 'Taman Lumbini, Candi Borobudur, Magelang, Jawa Tengah',
    googleMapsUrl: 'https://maps.google.com/?q=Candi+Borobudur+Magelang',
    province: 'Jawa Tengah',
    city: 'Magelang',
    date: '2026-11-22',
    registrationOpen: '2026-05-01',
    registrationClose: '2026-10-15',
    quota: 15000,
    registeredParticipantsCount: 11280,
    isFeatured: true,
    organizerId: 'org-yayasan-marathon',
    organizerName: 'Yayasan Borobudur Marathon',
    viewsCount: 18450,
    latitude: -7.6079,
    longitude: 110.2038,
    sponsors: ['Bank Jateng', 'Pocari Sweat', 'Trisula Group', 'Indofood', 'Siloam Hospitals'],
    rules: [
      'Participants must be minimum 18 years old for Full Marathon, 17 for Half Marathon, and 15 for 10K.',
      'Bib number must be worn on the front chest and clearly visible during the whole duration of the race.',
      'Pacers are not allowed to accompany unregistered runners.',
      'The time limit (Cut Off Time) is 7 hours for Full Marathon, 3.5 hours for Half Marathon, and 2 hours for 10K.'
    ],
    categories: [
      {
        id: '42k',
        name: 'Full Marathon (42.195K)',
        price: 950000,
        quota: 3000,
        registeredCount: 2450,
        jerseyIncluded: true,
        medalIncluded: true,
        racePackIncluded: true
      },
      {
        id: '21k',
        name: 'Half Marathon (21.097K)',
        price: 650000,
        quota: 5000,
        registeredCount: 4210,
        jerseyIncluded: true,
        medalIncluded: true,
        racePackIncluded: true
      },
      {
        id: '10k',
        name: '10K Challenge',
        price: 450000,
        quota: 7000,
        registeredCount: 4620,
        jerseyIncluded: true,
        medalIncluded: true,
        racePackIncluded: true
      }
    ],
    faq: [
      {
        question: 'When and where can I collect my Race Pack?',
        answer: 'Race Pack Collection (RPC) will take place at Armada Town Square Mall Magelang on November 19-21, 2026 from 10:00 to 20:00 WIB.'
      },
      {
        question: 'Is my registration transferrable or refundable?',
        answer: 'No, registrations are strictly personal and cannot be transferred to another person nor are they refundable.'
      },
      {
        question: 'Will there be luggage drop service on the race day?',
        answer: 'Yes, a secure baggage drop area is provided near the start line from 04:00 to 12:00 WIB.'
      }
    ]
  },
  {
    id: 'evt-rinjani-ultra-2026',
    title: 'Rinjani 100 Ultra-Trail 2026',
    slug: 'rinjani-100-ultra-trail-2026',
    description: 'One of the most brutal and legendary mountain ultra trail runs in Southeast Asia. This extreme adventure takes you straight to the active volcano rim and summit of Mount Rinjani, reaching 3,726m of elevation through vertical sand slopes, dense jungles, and mesmerizing scenery. Designed only for serious and experienced mountain runner pros seeking genuine thrill.',
    category: 'Trail Run',
    banner: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=600'
    ],
    location: 'Sembalun East Lombok, Nusa Tenggara Barat',
    googleMapsUrl: 'https://maps.google.com/?q=Sembalun+Lombok',
    province: 'Nusa Tenggara Barat',
    city: 'Lombok Timur',
    date: '2026-07-24',
    registrationOpen: '2026-01-10',
    registrationClose: '2026-06-30',
    quota: 1500,
    registeredParticipantsCount: 1180,
    isFeatured: true,
    organizerId: 'org-rinjani-adventure',
    organizerName: 'Rinjani Adventure Organizers',
    viewsCount: 12100,
    latitude: -8.3375,
    longitude: 116.5292,
    sponsors: ['Eiger Adventure', 'Kemenparekraf', 'Garmin Indonesia', 'Fitbar', 'Rudy Project'],
    rules: [
      'All 100K and 60K participants must present ITRA points or proof of having finished equivalent trail runs in the last 2 years.',
      'Mandatory gear list must be carried at ALL times: windbreaker, space blanket, hydration bag (min 1.5L), whistle, mobile phone, and 2 headlamps.',
      'Littering of any kind on the volcanic national park grounds will result in instant disqualification.'
    ],
    categories: [
      {
        id: 'trail-100k',
        name: '100K Extreme Trail (8,000m d+)',
        price: 2400000,
        quota: 300,
        registeredCount: 210,
        jerseyIncluded: true,
        medalIncluded: true,
        racePackIncluded: true
      },
      {
        id: 'trail-60k',
        name: '60K Ultra-Mountain (5,100m d+)',
        price: 1750000,
        quota: 500,
        registeredCount: 410,
        jerseyIncluded: true,
        medalIncluded: true,
        racePackIncluded: true
      },
      {
        id: 'trail-36k',
        name: '36K Sembalun Loop',
        price: 1100000,
        quota: 700,
        registeredCount: 560,
        jerseyIncluded: true,
        medalIncluded: true,
        racePackIncluded: true
      }
    ],
    faq: [
      {
        question: 'Are hiking poles allowed during the run?',
        answer: 'Yes, trekking poles are permitted and highly recommended due to the steep sand sections near the summit.'
      },
      {
        question: 'What is the cutoff timing for the 100K class?',
        answer: 'The ultimate cutoff timing for the 100K category is 36 hours limit.'
      }
    ]
  },
  {
    id: 'evt-bali-triathlon-2026',
    title: 'Bali International Triathlon 2026',
    slug: 'bali-international-triathlon-2026',
    description: 'Swim in the warm crystal waters of Sanur Beach, bike through the quiet coastal bypass, and run along the spectacular traditional Balinese culture. Named as \"The Best Triathlon in Asia\" by AsiaTri, EventHub is delighted to host its triumphant return, combining sports tourism with local traditional ceremonies.',
    category: 'Triathlon',
    banner: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&q=80&w=600'
    ],
    location: 'Mertasari Beach, Sanur, Bali',
    googleMapsUrl: 'https://maps.google.com/?q=Sanur+Beach+Bali',
    province: 'Bali',
    city: 'Denpasar',
    date: '2026-10-18',
    registrationOpen: '2026-03-01',
    registrationClose: '2026-09-10',
    quota: 2000,
    registeredParticipantsCount: 1350,
    isFeatured: true,
    organizerId: 'org-bali-sports',
    organizerName: 'Bali Sports Foundation',
    viewsCount: 16220,
    latitude: -8.6948,
    longitude: 115.2632,
    sponsors: ['Herbalife Nutrition', 'Bioré', 'Polygon Bikes', 'Sanur Hotels Association', 'Aqua'],
    rules: [
      'Wet suits are allowed if water temperature drops below 22 degrees (unlikely in Bali).',
      'Drafting is strictly prohibited during the cycling course and will carry a 4-minute time penalty.',
      'Helmets must be buckled on before mount-line and remain buckled until bike-dismount.'
    ],
    categories: [
      {
        id: 'tri-olympic',
        name: 'Olympic Distance (1.5K Swim, 40K Bike, 10K Run)',
        price: 2800000,
        quota: 800,
        registeredCount: 580,
        jerseyIncluded: true,
        medalIncluded: true,
        racePackIncluded: true
      },
      {
        id: 'tri-sprint',
        name: 'Sprint Distance (750m Swim, 20K Bike, 5K Run)',
        price: 1950000,
        quota: 1200,
        registeredCount: 770,
        jerseyIncluded: true,
        medalIncluded: true,
        racePackIncluded: true
      }
    ],
    faq: [
      {
        question: 'Is it open to international triathletes?',
        answer: 'Yes, international participants are welcome and can complete the registration using their Passport Number.'
      }
    ]
  },
  {
    id: 'evt-tour-borobudur-2026',
    title: 'Tour de Borobudur Cycling 2026',
    slug: 'tour-de-borobudur-cycling-2026',
    description: 'One of the most anticipated grand cyclo tourism tours in Southeast Asia, connecting the vibrant city of Semarang to the magnificent landscape of Borobudur. Climb high through steep curves, historical tunnels, and scenic mountain views of Merbabu and Sumbing, followed by a local feast.',
    category: 'Cycling',
    banner: 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600'
    ],
    location: 'Gubernuran Jawa Tengah, Semarang s/d Magelang',
    googleMapsUrl: 'https://maps.google.com/?q=Gubernuran+Semarang',
    province: 'Jawa Tengah',
    city: 'Semarang',
    date: '2026-09-05',
    registrationOpen: '2026-04-01',
    registrationClose: '2026-08-15',
    quota: 2500,
    registeredParticipantsCount: 1610,
    isFeatured: false,
    organizerId: 'org-semarang-cycling',
    organizerName: 'Samba Cycling Club Semarang',
    viewsCount: 9400,
    latitude: -6.9932,
    longitude: 110.4203,
    sponsors: ['Polygon Bikes', 'Sido Muncul', 'KAI', 'Bank Jateng'],
    rules: [
      'Only road-bikes (Dropbar) are allowed in the elite categories. MTBs and folding bikes are allowed in the Fun Ride series.',
      'Marshall directions must be followed strictly on public highways.',
      'Helmets and blinking rear warning lamps are compulsory.'
    ],
    categories: [
      {
        id: 'bike-150k',
        name: 'Gran Fondo Elite (150K Challenge)',
        price: 1100000,
        quota: 1000,
        registeredCount: 720,
        jerseyIncluded: true,
        medalIncluded: true,
        racePackIncluded: true
      },
      {
        id: 'bike-80k',
        name: 'Classic Tour (80K Scenic Ride)',
        price: 750000,
        quota: 1500,
        registeredCount: 890,
        jerseyIncluded: true,
        medalIncluded: true,
        racePackIncluded: true
      }
    ],
    faq: [
      {
        question: 'Will roads be completely closed for cycling speed riders?',
        answer: 'Major climbs will be heavily secured under Police escort, but roads are open with designated fast corridors.'
      }
    ]
  },
  {
    id: 'evt-jakarta-marathon-2026',
    title: 'Jakarta Int’l Elite Marathon 2026',
    slug: 'jakarta-intl-elite-marathon-2026',
    description: 'Weave through the iconic skyscrapers, historic Kota Tua, and beautiful central parks of Indonesian capital. Run a fast, flat World Athletics Elite Label road track designed for high speed and personal bests, featuring continuous hydration aid and cheering stations over Jakarta city.',
    category: 'Running',
    banner: 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1547483238-f400e65ccd56?auto=format&fit=crop&q=80&w=600'
    ],
    location: 'Monumen Nasional (Monas), Jakarta Pusat',
    googleMapsUrl: 'https://maps.google.com/?q=Monas+Jakarta',
    province: 'DKI Jakarta',
    city: 'Jakarta Pusat',
    date: '2026-10-25',
    registrationOpen: '2026-05-15',
    registrationClose: '2026-09-25',
    quota: 8000,
    registeredParticipantsCount: 5120,
    isFeatured: false,
    organizerId: 'org-jakarta-runners',
    organizerName: 'Jakarta Runners League Association',
    viewsCount: 14800,
    latitude: -6.1754,
    longitude: 106.8272,
    sponsors: ['Mandiri', 'Pertamina', 'Adidas Indonesia', 'Gudang Garam', 'Nestle Active'],
    rules: [
      'Official cut off times are strictly enforced at designated checkpoints along Monas/Sudirman bypass.',
      'Authorized carbon plates shoes are permitted under standard World Athletics policy guidelines.'
    ],
    categories: [
      {
        id: 'jkt-42k',
        name: 'Full Marathon Elite Group',
        price: 850000,
        quota: 2000,
        registeredCount: 1100,
        jerseyIncluded: true,
        medalIncluded: true,
        racePackIncluded: true
      },
      {
        id: 'jkt-21k',
        name: 'Half Marathon Performance',
        price: 600000,
        quota: 3000,
        registeredCount: 2200,
        jerseyIncluded: true,
        medalIncluded: true,
        racePackIncluded: true
      },
      {
        id: 'jkt-10k',
        name: '10K Fun Sprint',
        price: 400000,
        quota: 3000,
        registeredCount: 1820,
        jerseyIncluded: true,
        medalIncluded: true,
        racePackIncluded: true
      }
    ],
    faq: [
      {
        question: 'Where can I park on the marathon morning?',
        answer: 'Free parking is designated under Monas parking lot and Gambir square with valid ticket presentation.'
      }
    ]
  },
  {
    id: 'evt-joyland-jakarta-2026',
    title: 'Joyland Music Festival Jakarta',
    slug: 'joyland-music-festival-jakarta',
    description: 'Indonesias premiere multi-genre music, comedy, and creative community arts festival. Enjoy live performance setups from international legends and emerging local dynamic stars, set inside lush green archery gardens featuring visual art workshops, custom dynamic food hubs, and highly immersive sensory stages.',
    category: 'Festival',
    banner: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=600'
    ],
    location: 'GBK Archery Field, Senayan, Jakarta Pusat',
    googleMapsUrl: 'https://maps.google.com/?q=GBK+Archery+Senayan',
    province: 'DKI Jakarta',
    city: 'Jakarta Pusat',
    date: '2026-11-13',
    registrationOpen: '2026-06-01',
    registrationClose: '2026-11-10',
    quota: 12000,
    registeredParticipantsCount: 8430,
    isFeatured: true,
    organizerId: 'org-plainsong-live',
    organizerName: 'Plainsong Live Entertainment',
    viewsCount: 22100,
    latitude: -6.2183,
    longitude: 106.8021,
    sponsors: ['Grab Indonesia', 'Iceperience', 'Indomie', 'Heineken', 'Gojek'],
    rules: [
      'Performers timings and schedule maps are subject to change. Regular updates in EventHub app alerts.',
      'No professional heavy camera lenses (above 50mm) are allowed without media accreditation cards.',
      'A strict green policy: Single-use plastics are forbidden. Bring your reusable tumblers for free water bars.'
    ],
    categories: [
      {
        id: 'joy-3day',
        name: '3-Day Premium Ticket Pass',
        price: 1550000,
        quota: 6000,
        registeredCount: 4890,
        jerseyIncluded: false,
        medalIncluded: false,
        racePackIncluded: true
      },
      {
        id: 'joy-1day',
        name: '1-Day Ticket Pass (Weekend Splendor)',
        price: 650000,
        quota: 6000,
        registeredCount: 3540,
        jerseyIncluded: false,
        medalIncluded: false,
        racePackIncluded: false
      }
    ],
    faq: [
      {
        question: 'Is re-entry allowed during the day?',
        answer: 'Yes, secure Wristband tags allow unlimited access during festival schedule hours.'
      }
    ]
  }
];

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'TX-EHB23401',
    eventId: 'evt-boro-marathon-2026',
    eventTitle: 'Borobudur Marathon 2026',
    eventBanner: 'https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&q=80&w=300',
    eventCity: 'Magelang',
    eventDate: '2026-11-22',
    categoryId: '42k',
    categoryName: 'Full Marathon (42.195K)',
    ticketNumber: 'TKT-BM26-42-0198',
    bibNumber: '42198',
    createdAt: '2026-05-12T14:32:00Z',
    checkInStatus: 'registered',
    personalInfo: {
      firstName: 'Budi',
      lastName: 'Santoso',
      email: 'budi.santoso@gmail.com',
      whatsApp: '081234567890'
    },
    raceInfo: {
      categoryId: '42k',
      dateOfBirth: '1992-04-15',
      gender: 'Male'
    },
    identityInfo: {
      identityType: 'KTP',
      identityNumber: '3174091504920003'
    },
    jerseyInfo: {
      size: 'L',
      cutType: 'Male'
    },
    addressInfo: {
      country: 'Indonesia',
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Cilandak',
      addressDetails: 'Jl. Kemang Selatan No. 45'
    },
    emergencyInfo: {
      name: 'Dewi Lestari',
      relationship: 'Spouse',
      phoneNumber: '081298765432'
    },
    medicalInfo: {
      bloodType: 'O',
      allergies: 'None',
      specialConditions: 'None'
    },
    paymentInfo: {
      method: 'qris',
      discountAmount: 0,
      finalAmount: 950000,
      status: 'paid'
    }
  },
  {
    id: 'TX-EHB23402',
    eventId: 'evt-boro-marathon-2026',
    eventTitle: 'Borobudur Marathon 2026',
    eventBanner: 'https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&q=80&w=300',
    eventCity: 'Magelang',
    eventDate: '2026-11-22',
    categoryId: '21k',
    categoryName: 'Half Marathon (21.097K)',
    ticketNumber: 'TKT-BM26-21-0845',
    bibNumber: '21845',
    createdAt: '2026-05-13T09:12:00Z',
    checkInStatus: 'checked_in',
    checkedInAt: '2026-06-06T05:20:00Z',
    personalInfo: {
      firstName: 'Siti',
      lastName: 'Aminah',
      email: 'siti.aminah@yahoo.com',
      whatsApp: '081399887766'
    },
    raceInfo: {
      categoryId: '21k',
      dateOfBirth: '1995-11-08',
      gender: 'Female'
    },
    identityInfo: {
      identityType: 'KTP',
      identityNumber: '3273081108950002'
    },
    jerseyInfo: {
      size: 'M',
      cutType: 'Female'
    },
    addressInfo: {
      country: 'Indonesia',
      province: 'Jawa Barat',
      city: 'Bandung',
      district: 'Coblong',
      addressDetails: 'Jl. Dago Elok Raya No. 12'
    },
    emergencyInfo: {
      name: 'Ahmad Faisal',
      relationship: 'Father',
      phoneNumber: '081311223344'
    },
    medicalInfo: {
      bloodType: 'A',
      allergies: 'Shellfish',
      specialConditions: 'Mild asthma'
    },
    paymentInfo: {
      method: 'bca_va',
      discountAmount: 50000,
      finalAmount: 600000,
      couponCode: 'EVENTHUBCRAWL',
      status: 'paid'
    }
  },
  {
    id: 'TX-EHB23403',
    eventId: 'evt-rinjani-ultra-2026',
    eventTitle: 'Rinjani 100 Ultra-Trail 2026',
    eventBanner: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=300',
    eventCity: 'Lombok Timur',
    eventDate: '2026-07-24',
    categoryId: 'trail-100k',
    categoryName: '100K Extreme Trail (8,000m d+)',
    ticketNumber: 'TKT-R100-UT-0042',
    bibNumber: '10042',
    createdAt: '2026-05-14T11:45:00Z',
    checkInStatus: 'race_pack_collected',
    racePackCollectedAt: '2026-06-05T16:40:00Z',
    personalInfo: {
      firstName: 'Aditya',
      lastName: 'Pratama',
      email: 'aditya.pratama@outlook.com',
      whatsApp: '085611223344'
    },
    raceInfo: {
      categoryId: 'trail-100k',
      dateOfBirth: '1988-09-24',
      gender: 'Male'
    },
    identityInfo: {
      identityType: 'KTP',
      identityNumber: '31742409880005'
    },
    jerseyInfo: {
      size: 'S',
      cutType: 'Male'
    },
    addressInfo: {
      country: 'Indonesia',
      province: 'Banten',
      city: 'Tangerang Selatan',
      district: 'Serpong',
      addressDetails: 'BSD City Cluster Foresta No. B8'
    },
    emergencyInfo: {
      name: 'Rian Hidayat',
      relationship: 'Friend',
      phoneNumber: '081255667788'
    },
    medicalInfo: {
      bloodType: 'AB',
      allergies: 'None',
      specialConditions: 'None'
    },
    paymentInfo: {
      method: 'cc',
      discountAmount: 0,
      finalAmount: 2400000,
      status: 'paid'
    }
  },
  {
    id: 'TX-EHB23404',
    eventId: 'evt-bali-triathlon-2026',
    eventTitle: 'Bali International Triathlon 2026',
    eventBanner: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&q=80&w=300',
    eventCity: 'Denpasar',
    eventDate: '2026-10-18',
    categoryId: 'tri-olympic',
    categoryName: 'Olympic Distance (1.5K Swim, 40K Bike, 10K Run)',
    ticketNumber: 'TKT-BALI-TR-0112',
    bibNumber: '15112',
    createdAt: '2026-05-15T15:20:00Z',
    checkInStatus: 'registered',
    personalInfo: {
      firstName: 'Sarah',
      lastName: 'Wulandari',
      email: 'sarah.wulan@gmail.com',
      whatsApp: '081122334455'
    },
    raceInfo: {
      categoryId: 'tri-olympic',
      dateOfBirth: '1991-07-12',
      gender: 'Female'
    },
    identityInfo: {
      identityType: 'KTP',
      identityNumber: '5171011207910001'
    },
    jerseyInfo: {
      size: 'S',
      cutType: 'Female'
    },
    addressInfo: {
      country: 'Indonesia',
      province: 'Bali',
      city: 'Denpasar',
      district: 'Sanur',
      addressDetails: 'Jl. Danau Tamblingan No. 104'
    },
    emergencyInfo: {
      name: 'Made Astawa',
      relationship: 'Brother',
      phoneNumber: '081199887766'
    },
    medicalInfo: {
      bloodType: 'B',
      allergies: 'Peanuts',
      specialConditions: 'None'
    },
    paymentInfo: {
      method: 'mandiri_va',
      discountAmount: 0,
      finalAmount: 2800000,
      status: 'pending'
    }
  },
  {
    id: 'TX-EHB23405',
    eventId: 'evt-boro-marathon-2026',
    eventTitle: 'Borobudur Marathon 2026',
    eventBanner: 'https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&q=80&w=300',
    eventCity: 'Magelang',
    eventDate: '2026-11-22',
    categoryId: '10k',
    categoryName: '10K Challenge',
    ticketNumber: 'TKT-BM26-10-3882',
    bibNumber: '103882',
    createdAt: '2026-06-03T10:00:00Z',
    checkInStatus: 'finished',
    checkedInAt: '2026-06-06T04:45:00Z',
    personalInfo: {
      firstName: 'Andi',
      lastName: 'Wibowo',
      email: 'andi.wibowo@gmail.com',
      whatsApp: '087812123434'
    },
    raceInfo: {
      categoryId: '10k',
      dateOfBirth: '1985-02-28',
      gender: 'Male'
    },
    identityInfo: {
      identityType: 'KTP',
      identityNumber: '3308122802850001'
    },
    jerseyInfo: {
      size: 'XL',
      cutType: 'Male'
    },
    addressInfo: {
      country: 'Indonesia',
      province: 'Jawa Tengah',
      city: 'Semarang',
      district: 'Tembalang',
      addressDetails: 'Perum Undip Asri Block C-14'
    },
    emergencyInfo: {
      name: 'Santi Wibowo',
      relationship: 'Sister',
      phoneNumber: '087899001122'
    },
    medicalInfo: {
      bloodType: 'O',
      allergies: 'None',
      specialConditions: 'None'
    },
    paymentInfo: {
      method: 'qris',
      discountAmount: 450000,
      finalAmount: 0,
      couponCode: 'RUNFREE',
      status: 'paid'
    }
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cp-01',
    code: 'PROMORUN15',
    type: 'percentage',
    value: 15,
    quota: 200,
    usedCount: 74,
    expiryDate: '2026-12-31'
  },
  {
    id: 'cp-02',
    code: 'EVENTHUBCRAWL',
    type: 'fixed',
    value: 50000,
    quota: 500,
    usedCount: 189,
    expiryDate: '2026-08-31'
  },
  {
    id: 'cp-03',
    code: 'INDONESIA81',
    type: 'fixed',
    value: 81000,
    quota: 100,
    usedCount: 12,
    expiryDate: '2026-09-17'
  },
  {
    id: 'cp-04',
    code: 'RUNFREE',
    type: 'percentage',
    value: 100,
    quota: 10,
    usedCount: 3,
    expiryDate: '2026-12-31'
  }
];

export const INITIAL_WITHDRAWALS: Withdrawal[] = [
  {
    id: 'WD-001',
    organizerId: 'org-yayasan-marathon',
    organizerName: 'Yayasan Borobudur Marathon',
    amount: 125000000,
    date: '2026-05-20',
    status: 'approved',
    bankName: 'BCA',
    accountNumber: '8001234567',
    accountHolderName: 'Yayasan Borobudur Marathon'
  },
  {
    id: 'WD-002',
    organizerId: 'org-rinjani-adventure',
    organizerName: 'Rinjani Adventure Organizers',
    amount: 45000000,
    date: '2026-06-02',
    status: 'pending',
    bankName: 'Mandiri',
    accountNumber: '1230009876543',
    accountHolderName: 'Lombok Adventurer Ltd'
  }
];

export const INITIAL_ANNOUNCEMENTS: SystemAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Welcome to EventHub Indonesia!',
    message: 'We are thrilled to launch the brand new enterprise booking and ticket engine, complete with Midtrans simulated payment channels and QR ticket generation.',
    date: '2026-06-01',
    targetRole: 'all'
  },
  {
    id: 'ann-2',
    title: 'Withdrawal Operations Notice',
    message: 'Starting from next week, bank settlement times for withdrawals will be updated to T+1 standard business days.',
    date: '2026-06-03',
    targetRole: 'organizer'
  }
];
