import { db } from '../config/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { DEFAULT_SYSTEM_SETTINGS } from './settingsService';

export async function ensureInitialSeed(): Promise<void> {
  try {
    // 1. Ensure system_settings
    const settingsRef = doc(db, 'system_settings', 'general');
    await setDoc(settingsRef, DEFAULT_SYSTEM_SETTINGS, { merge: true });

    // 2. Check if events collection is empty
    const eventsSnap = await getDocs(collection(db, 'events'));
    if (!eventsSnap.empty) {
      return; // Already initialized with data
    }

    console.log('Seeding initial RacePro showcase events to Firestore...');

    const now = new Date().toISOString();

    // Event 1: Merapi Trail Ultra 2026
    const event1Id = 'event-merapi-trail-2026';
    await setDoc(doc(db, 'events', event1Id), {
      id: event1Id,
      name: 'Merapi Ultra Trail Run 2026',
      slug: 'merapi-ultra-trail-2026',
      description: 'Lomba lari trail gunung paling bergengsi menembus lereng eksotis Gunung Merapi. Menawarkan trek teknis, pemandangan lava tour menakjubkan, dan elevasi menantang untuk pelari trail sejati.',
      banner: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=600&q=80',
      location: 'Sleman, D.I. Yogyakarta',
      address: 'Kaliurang Adventure Park, Sleman, Yogyakarta',
      startDate: '2026-09-20T05:00:00Z',
      endDate: '2026-09-20T18:00:00Z',
      registrationStart: '2026-01-01T00:00:00Z',
      registrationEnd: '2026-09-10T23:59:59Z',
      status: 'REGISTRATION_OPEN',
      organizerId: 'org-001',
      organizerName: 'Merapi Outdoor Challenge',
      featured: true,
      facilities: ['Race Jersey Finisher', 'Nomor BIB dengan Timing Chip', 'Medali Finisher', 'Refreshment & Water Station Tiap 5KM', 'Asuransi Peserta', 'Medical Assessment & Evakuasi'],
      schedule: [
        { time: '04:00 WIB', title: 'Ulang Pendaftaran & QR Check-in', description: 'Pengambilan race pack bagi yang belum dan verifikasi peserta' },
        { time: '04:45 WIB', title: 'Briefing & Doa Bersama', description: 'Panduan keselamatan trek & elevasi' },
        { time: '05:00 WIB', title: 'Flag-off Trail 50K', description: 'Pelepasan peserta 50K' },
        { time: '06:00 WIB', title: 'Flag-off Trail 25K & 10K', description: 'Pelepasan peserta 25K dan 10K' },
        { time: '16:00 WIB', title: 'Podium & Winner Ceremony', description: 'Penyerahan hadiah podium & sertifikat finisher' }
      ],
      rules: '1. Peserta wajib membawa HP terisi penuh.\n2. Peserta wajib membawa peluit & water bladder minimal 1.5 Liter.\n3. Dilarang membuang sampah di sepanjang lintasan lomba.',
      faqs: [
        { question: 'Apakah ada batas waktu (COT) untuk kategori 50K?', answer: 'Ya, Cut Off Time untuk 50K adalah 12 jam.' },
        { question: 'Dimana lokasi pengambilan Race Pack?', answer: 'Pengambilan Race Pack di Kaliurang Park pada H-1 jam 10:00 - 20:00 WIB.' }
      ],
      category: 'Trail Run',
      categories: ['Trail Run', 'Trail Ultra 50K', 'Trail Challenge 25K', 'Trail Fun 10K'],
      searchKeywords: ['merapi', 'ultra', 'trail', 'run', '2026', 'sleman', 'yogyakarta', 'jogja', 'kaliurang', '50k', '25k', '10k', 'merapi outdoor challenge'],
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system'
    });

    // Categories for Event 1
    const cat1Id = 'cat-merapi-50k';
    await setDoc(doc(db, 'event_categories', cat1Id), {
      id: cat1Id,
      eventId: event1Id,
      name: 'Trail Ultra 50K',
      slug: 'trail-ultra-50k',
      description: 'Kategori ultra distance dengan elevasi gain +2.800m.',
      distance: '50 KM',
      elevation: '2,800 m+',
      price: 650000,
      quota: 300,
      registeredCount: 0,
      startTime: '05:00 WIB',
      cutoffTime: '12 Jam',
      genderRestriction: 'NONE',
      minimumAge: 18,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    });

    const cat2Id = 'cat-merapi-25k';
    await setDoc(doc(db, 'event_categories', cat2Id), {
      id: cat2Id,
      eventId: event1Id,
      name: 'Trail Challenge 25K',
      slug: 'trail-challenge-25k',
      description: 'Kategori menengah melintasi hutan pinus dan aliran sungai.',
      distance: '25 KM',
      elevation: '1,300 m+',
      price: 450000,
      quota: 500,
      registeredCount: 0,
      startTime: '06:00 WIB',
      cutoffTime: '7 Jam',
      genderRestriction: 'NONE',
      minimumAge: 17,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    });

    const cat3Id = 'cat-merapi-10k';
    await setDoc(doc(db, 'event_categories', cat3Id), {
      id: cat3Id,
      eventId: event1Id,
      name: 'Trail Fun 10K',
      slug: 'trail-fun-10k',
      description: 'Kategori terbuka untuk pemula dan keluarga.',
      distance: '10 KM',
      elevation: '450 m+',
      price: 250000,
      quota: 800,
      registeredCount: 0,
      startTime: '06:30 WIB',
      cutoffTime: '3.5 Jam',
      genderRestriction: 'NONE',
      minimumAge: 12,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    });

    // Event 2: Bali Sunset Beach Half Marathon
    const event2Id = 'event-bali-sunset-2026';
    await setDoc(doc(db, 'events', event2Id), {
      id: event2Id,
      name: 'Bali Sunset Coastal Run 2026',
      slug: 'bali-sunset-coastal-run-2026',
      description: 'Sensasi berlari di pesisir pantai Sanur Bali saat matahari terbenam. Jalur datar, cepat, dan pemandangan laut yang spektakuler.',
      banner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      location: 'Sanur Beach, Bali',
      address: 'Pantai Matahari Terbit, Sanur, Denpasar, Bali',
      startDate: '2026-10-15T15:00:00Z',
      endDate: '2026-10-15T21:00:00Z',
      registrationStart: '2026-02-01T00:00:00Z',
      registrationEnd: '2026-10-01T23:59:59Z',
      status: 'REGISTRATION_OPEN',
      organizerId: 'org-002',
      organizerName: 'Island Marathon Society',
      featured: true,
      facilities: ['Exclusive Running Tee', 'Finishers Medal', 'Hydration Pack', 'Post-Race Sunset Beach Party Party Vouchers'],
      schedule: [
        { time: '15:00 WIB', title: 'Open Gate & Participant Assembly', description: 'Persiapan peserta di garis start Sanur' },
        { time: '16:00 WIB', title: 'Flag-off Half Marathon 21K', description: 'Pelepasan HM 21K' },
        { time: '16:30 WIB', title: 'Flag-off 10K & 5K Sunset Run', description: 'Pelepasan 10K dan 5K' }
      ],
      rules: 'Wajib mengenakan jersey resmi event dan BIB bernomor di bagian dada depan.',
      faqs: [
        { question: 'Apakah tersedia penitipan barang?', answer: 'Ya, tempat penitipan barang gratis tersedia di Race Central.' }
      ],
      category: 'Marathon',
      categories: ['Marathon', 'Half Marathon', 'Fun Run', '21K', '10K', '5K'],
      searchKeywords: ['bali', 'sunset', 'coastal', 'run', '2026', 'sanur', 'denpasar', 'marathon', 'half marathon', '21k', '10k', '5k', 'island marathon society'],
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      updatedBy: 'system'
    });

    // Sponsors seed
    const sp1 = doc(collection(db, 'sponsors'));
    await setDoc(sp1, {
      id: sp1.id,
      name: 'HydraTech Isotonic',
      logoUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=300&q=80',
      website: 'https://example.com',
      tier: 'PLATINUM',
      order: 1,
      createdAt: now
    });

    const sp2 = doc(collection(db, 'sponsors'));
    await setDoc(sp2, {
      id: sp2.id,
      name: 'Apex Trail Gear',
      logoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80',
      website: 'https://example.com',
      tier: 'GOLD',
      order: 2,
      createdAt: now
    });

    console.log('Seed completed successfully.');
  } catch (err) {
    console.error('Initial seed error:', err);
  }
}
