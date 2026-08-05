// ============================================================
// DATA WILAYAH ADMINISTRATIF INDONESIA
// Sumber: Permendagri, diolah untuk form registrasi
// Provinsi → Kabupaten/Kota → Kecamatan
// ============================================================

export interface District {
  name: string;
}

export interface City {
  name: string;
  type: 'Kota' | 'Kabupaten';
  districts: string[];
}

export interface Province {
  name: string;
  cities: City[];
}

export const INDONESIA_LOCATIONS: Province[] = [
  {
    name: 'Aceh',
    cities: [
      { name: 'Kab. Aceh Barat', type: 'Kabupaten', districts: ['Arongan Lambalek', 'Bubon', 'Johan Pahlawan', 'Kaway XVI', 'Meureubo', 'Pante Ceureumen', 'Panton Reu', 'Samatiga', 'Sungai Mas', 'Woyla', 'Woyla Barat', 'Woyla Timur'] },
      { name: 'Kab. Aceh Besar', type: 'Kabupaten', districts: ['Baitussalam', 'Blang Bintang', 'Darul Imarah', 'Darul Kamal', 'Darussalam', 'Indrapuri', 'Ingin Jaya', 'Krueng Barona Jaya', 'Kuta Baro', 'Kuta Cot Glie', 'Kuta Malaka', 'Lembah Seulawah', 'Leupung', 'Lhoknga', 'Lhong', 'Mesjid Raya', 'Montasik', 'Peukan Bada', 'Pulo Aceh', 'Seulimeum', 'Simpang Tiga', 'Suka Makmur'] },
      { name: 'Kab. Aceh Selatan', type: 'Kabupaten', districts: ['Bakongan', 'Bakongan Timur', 'Kluet Selatan', 'Kluet Tengah', 'Kluet Timur', 'Kluet Utara', 'Labuhan Haji', 'Labuhan Haji Barat', 'Labuhan Haji Timur', 'Meukek', 'Pasie Raja', 'Sama Dua', 'Sawang', 'Tapak Tuan', 'Trumon', 'Trumon Tengah', 'Trumon Timur'] },
      { name: 'Kab. Aceh Tengah', type: 'Kabupaten', districts: ['Atu Lintang', 'Bebesen', 'Bies', 'Bintang', 'Celala', 'Jagong Jeget', 'Kebayakan', 'Ketol', 'Kute Panang', 'Laut Tawar', 'Linge', 'Pegasing', 'Rusip Antara', 'Silih Nara'] },
      { name: 'Kab. Aceh Tenggara', type: 'Kabupaten', districts: ['Babul Makmur', 'Babul Rahmah', 'Babussalam', 'Badar', 'Bambel', 'Bukit Tusam', 'Darul Hasanah', 'Deleng Pokhkisen', 'Ketambe', 'Lawe Alas', 'Lawe Bulan', 'Lawe Sigala-Gala', 'Lawe Sumur', 'Leuser', 'Semadam', 'Tanah Alas'] },
      { name: 'Kab. Aceh Timur', type: 'Kabupaten', districts: ['Banda Alam', 'Birem Bayeun', 'Darul Aman', 'Darul Falah', 'Darul Ihsan', 'Idi Rayeuk', 'Idi Timur', 'Idi Tunong', 'Indra Makmur', 'Julok', 'Madat', 'Nurussalam', 'Pante Bidari', 'Peudawa', 'Peunaron', 'Peureulak', 'Peureulak Barat', 'Peureulak Timur', 'Rantau Selamat', 'Ranto Peureulak', 'Serbajadi', 'Simpang Jernih', 'Simpang Ulim', 'Sungai Raya'] },
      { name: 'Kab. Aceh Utara', type: 'Kabupaten', districts: ['Baktiya', 'Baktiya Barat', 'Banda Baro', 'Cot Girek', 'Dewantara', 'Geureudong Pase', 'Kuta Makmur', 'Langkahan', 'Lapang', 'Lhoksukon', 'Matangkuli', 'Meurah Mulia', 'Muara Batu', 'Nibong', 'Nisam', 'Nisam Antara', 'Paya Bakong', 'Pirak Timur', 'Samudera', 'Sawang', 'Seunuddon', 'Simpang Keramat', 'Syamtalira Aron', 'Syamtalira Bayu', 'Tanah Jambo Aye', 'Tanah Luas', 'Tanah Pasir'] },
      { name: 'Kota Banda Aceh', type: 'Kota', districts: ['Baiturrahman', 'Banda Raya', 'Jaya Baru', 'Kuta Alam', 'Kuta Raja', 'Lueng Bata', 'Meuraxa', 'Syiah Kuala', 'Ulee Kareng'] },
      { name: 'Kota Langsa', type: 'Kota', districts: ['Langsa Barat', 'Langsa Kota', 'Langsa Lama', 'Langsa Timur', 'Langsa Baro'] },
      { name: 'Kota Lhokseumawe', type: 'Kota', districts: ['Banda Sakti', 'Blang Mangat', 'Muara Dua', 'Muara Satu'] },
      { name: 'Kota Sabang', type: 'Kota', districts: ['Sukajaya', 'Sukakarya'] },
      { name: 'Kota Subulussalam', type: 'Kota', districts: ['Longkib', 'Penanggalan', 'Rundeng', 'Simpang Kiri', 'Sultan Daulat'] },
    ]
  },
  {
    name: 'Sumatera Utara',
    cities: [
      { name: 'Kab. Asahan', type: 'Kabupaten', districts: ['Aek Kuasan', 'Aek Ledong', 'Aek Songsongan', 'Air Batu', 'Air Joman', 'Bandar Pasir Mandoge', 'Bandar Pulau', 'Buntu Pane', 'Kisaran Barat', 'Kisaran Timur', 'Meranti', 'Pulau Rakyat', 'Pulo Bandring', 'Rahuning', 'Rawang Panca Arga', 'Sei Dadap', 'Sei Kepayang', 'Sei Kepayang Barat', 'Sei Kepayang Timur', 'Setia Janji', 'Silau Laut', 'Simpang Empat', 'Tanjung Balai', 'Teluk Dalam', 'Tinggi Raja'] },
      { name: 'Kab. Deli Serdang', type: 'Kabupaten', districts: ['Bangun Purba', 'Batang Kuis', 'Beringin', 'Biru-Biru', 'Deli Tua', 'Galang', 'Gunung Meriah', 'Hamparan Perak', 'Kutalimbaru', 'Labuhan Deli', 'Lubuk Pakam', 'Namo Rambe', 'Pagar Merbau', 'Pancur Batu', 'Pantai Labu', 'Patumbak', 'Percut Sei Tuan', 'Sibolangit', 'Sinembah Tanjung Muda Hilir', 'Sinembah Tanjung Muda Hulu', 'Sunggal', 'Tanjung Morawa'] },
      { name: 'Kab. Karo', type: 'Kabupaten', districts: ['Barusjahe', 'Berastagi', 'Dolat Rayat', 'Juhar', 'Kabanjahe', 'Kuta Buluh', 'Laubaleng', 'Mardingding', 'Merdeka', 'Merek', 'Munte', 'Naman Teran', 'Payung', 'Simpang Empat', 'Tigabinanga', 'Tiganderket', 'Tigapanah'] },
      { name: 'Kab. Labuhanbatu', type: 'Kabupaten', districts: ['Bilah Barat', 'Bilah Hilir', 'Bilah Hulu', 'Panai Hilir', 'Panai Hulu', 'Panai Tengah', 'Pangkatan', 'Rantau Selatan', 'Rantau Utara'] },
      { name: 'Kab. Langkat', type: 'Kabupaten', districts: ['Babalan', 'Bahorok', 'Batang Serangan', 'Besitang', 'Binjai', 'Brandan Barat', 'Gebang', 'Hinai', 'Kuala', 'Kutambaru', 'Padang Tualang', 'Pangkalan Susu', 'Pematang Jaya', 'Salapian', 'Sawit Seberang', 'Secanggang', 'Sei Bingai', 'Sei Lepan', 'Selesai', 'Sirapit', 'Stabat', 'Tanjung Pura', 'Wampu'] },
      { name: 'Kab. Mandailing Natal', type: 'Kabupaten', districts: ['Batahan', 'Batang Natal', 'Bukit Malintang', 'Huta Bargot', 'Kotanopan', 'Lembah Sorik Marapi', 'Lingga Bayu', 'Muara Batang Gadis', 'Muara Sipongi', 'Naga Juang', 'Natal', 'Pakantan', 'Panyabungan', 'Panyabungan Barat', 'Panyabungan Selatan', 'Panyabungan Timur', 'Panyabungan Utara', 'Puncak Sorik Marapi', 'Ranto Baek', 'Siabu', 'Sinunukan', 'Tambangan', 'Ulu Pungkut'] },
      { name: 'Kab. Nias', type: 'Kabupaten', districts: ['Bawolato', 'Botomuzoi', 'Gido', 'Hili Serangkai', 'Hiliduho', 'Idanogawo', 'Ma\'u', 'Sogae\'adu', 'Somolo-molo', 'Ulugawo'] },
      { name: 'Kab. Simalungun', type: 'Kabupaten', districts: ['Bandar', 'Bandar Huluan', 'Bandar Masilam', 'Bosar Maligas', 'Dolok Batu Nanggar', 'Dolok Panribuan', 'Dolok Pardamean', 'Dolok Silau', 'Girsang Sipangan Bolon', 'Gunung Malela', 'Gunung Maligas', 'Haranggaol Horison', 'Hatonduhan', 'Huta Bayu Raja', 'Jawa Maraja Bah Jambi', 'Jorlang Hataran', 'Panei', 'Panombeian Panei', 'Pematang Bandar', 'Pematang Sidamanik', 'Purba', 'Raya', 'Raya Kahean', 'Siantar', 'Sidamanik', 'Silimakuta', 'Silou Kahean', 'Tanah Jawa', 'Tapian Dolok', 'Ujung Padang'] },
      { name: 'Kab. Tapanuli Selatan', type: 'Kabupaten', districts: ['Aek Bilah', 'Angkola Barat', 'Angkola Muara Tais', 'Angkola Sangkunur', 'Angkola Selatan', 'Angkola Timur', 'Arse', 'Batang Angkola', 'Batang Toru', 'Marancar', 'Muara Batang Toru', 'Saipar Dolok Hole', 'Sayur Matinggi', 'Sipirok', 'Tano Tombangan Angkola'] },
      { name: 'Kab. Tapanuli Tengah', type: 'Kabupaten', districts: ['Andam Dewi', 'Badiri', 'Barus', 'Barus Utara', 'Kolang', 'Lumut', 'Manduamas', 'Pandan', 'Pasaribu Tobing', 'Pinangsori', 'Sarudik', 'Sibabangun', 'Sirandorung', 'Sitahuis', 'Sorkam', 'Sorkam Barat', 'Sosorgadong', 'Suka Bangun', 'Tapian Nauli', 'Tukka'] },
      { name: 'Kab. Toba', type: 'Kabupaten', districts: ['Ajibata', 'Balige', 'Bonatua Lunasi', 'Borbor', 'Habinsaran', 'Laguboti', 'Lumban Julu', 'Nassau', 'Parmaksian', 'Pintu Pohan Meranti', 'Porsea', 'Siantar Narumonda', 'Sigumpar', 'Silaen', 'Tampahan', 'Uluan'] },
      { name: 'Kota Binjai', type: 'Kota', districts: ['Binjai Barat', 'Binjai Kota', 'Binjai Selatan', 'Binjai Timur', 'Binjai Utara'] },
      { name: 'Kota Gunungsitoli', type: 'Kota', districts: ['Gunungsitoli', 'Gunungsitoli Alo\'oa', 'Gunungsitoli Barat', 'Gunungsitoli Idanoi', 'Gunungsitoli Selatan', 'Gunungsitoli Utara'] },
      { name: 'Kota Medan', type: 'Kota', districts: ['Medan Amplas', 'Medan Area', 'Medan Barat', 'Medan Baru', 'Medan Belawan', 'Medan Deli', 'Medan Denai', 'Medan Helvetia', 'Medan Johor', 'Medan Kota', 'Medan Labuhan', 'Medan Maimun', 'Medan Marelan', 'Medan Perjuangan', 'Medan Petisah', 'Medan Polonia', 'Medan Selayang', 'Medan Sunggal', 'Medan Tembung', 'Medan Timur', 'Medan Tuntungan'] },
      { name: 'Kota Padangsidempuan', type: 'Kota', districts: ['Padangsidempuan Angkola Julu', 'Padangsidempuan Batunadua', 'Padangsidempuan Hutaimbaru', 'Padangsidempuan Selatan', 'Padangsidempuan Tenggara', 'Padangsidempuan Utara'] },
      { name: 'Kota Pematangsiantar', type: 'Kota', districts: ['Siantar Barat', 'Siantar Marihat', 'Siantar Martoba', 'Siantar Marimbun', 'Siantar Selatan', 'Siantar Sitalasari', 'Siantar Timur', 'Siantar Utara'] },
      { name: 'Kota Sibolga', type: 'Kota', districts: ['Sibolga Kota', 'Sibolga Sambas', 'Sibolga Selatan', 'Sibolga Utara'] },
      { name: 'Kota Tanjungbalai', type: 'Kota', districts: ['Datuk Bandar', 'Datuk Bandar Timur', 'Sei Tualang Raso', 'Tanjungbalai Selatan', 'Tanjungbalai Utara', 'Teluk Nibung'] },
      { name: 'Kota Tebing Tinggi', type: 'Kota', districts: ['Bajenis', 'Padang Hilir', 'Padang Hulu', 'Rambutan', 'Tebing Tinggi Kota'] },
    ]
  },
  {
    name: 'Sumatera Barat',
    cities: [
      { name: 'Kab. Agam', type: 'Kabupaten', districts: ['Ampek Angkek', 'Ampek Koto', 'Baso', 'Canduang', 'IV Angkat Canduang', 'IV Koto', 'Kamang Magek', 'Lubuk Basung', 'Malalak', 'Matur', 'Palembayan', 'Palupuh', 'Sungai Puar', 'Tanjung Mutiara', 'Tanjung Raya', 'Tilatang Kamang'] },
      { name: 'Kab. Lima Puluh Kota', type: 'Kabupaten', districts: ['Akabiluru', 'Bukik Barisan', 'Guguak', 'Gunuang Omeh', 'Harau', 'Kapur IX', 'Lareh Sago Halaban', 'Luak', 'Mungka', 'Pangkalan Koto Baru', 'Payakumbuh', 'Situjuah Limo Nagari', 'Suliki'] },
      { name: 'Kab. Padang Pariaman', type: 'Kabupaten', districts: ['2x11 Enam Lingkung', '2x11 Kayu Tanam', 'Batang Anai', 'Batang Gasan', 'Enam Lingkung', 'IV Koto Aur Malintang', 'Lubuk Alung', 'Nan Sabaris', 'Padang Sago', 'Patamuan', 'Sintuk Toboh Gadang', 'Sungai Geringging', 'Sungai Limau', 'Ulakan Tapakis', 'V Koto Kampung Dalam', 'V Koto Timur', 'VII Koto Sungai Sarik'] },
      { name: 'Kab. Pesisir Selatan', type: 'Kabupaten', districts: ['IV Jurai', 'IV Nagari Bayang Utara', 'Airpura', 'Basa Ampek Balai Tapan', 'Batang Kapas', 'Bayang', 'Koto XI Tarusan', 'Lengayang', 'Linggo Sari Baganti', 'Lunang', 'Pancung Soal', 'Ranah Ampek Hulu Tapan', 'Ranah Pesisir', 'Silaut', 'Sutera'] },
      { name: 'Kab. Sijunjung', type: 'Kabupaten', districts: ['IV Nagari', 'Kamang Baru', 'Koto VII', 'Kupitan', 'Lubuak Tarok', 'Sijunjung', 'Sumpur Kudus', 'Tanjung Gadang'] },
      { name: 'Kab. Solok', type: 'Kabupaten', districts: ['Bukit Sundi', 'Danau Kembar', 'Gunung Talang', 'Hiliran Gumanti', 'IX Koto Sungai Lasi', 'Junjung Sirih', 'Kubung', 'Lembah Gumanti', 'Lembang Jaya', 'Pantai Cermin', 'Payung Sekaki', 'Tigo Lurah', 'X Koto Diatas', 'X Koto Singkarak'] },
      { name: 'Kab. Tanah Datar', type: 'Kabupaten', districts: ['Batipuh', 'Batipuh Selatan', 'Lima Kaum', 'Lintau Buo', 'Lintau Buo Utara', 'Padang Ganting', 'Pariangan', 'Rambatan', 'Salimpaung', 'Sepuluh Koto', 'Sungai Tarab', 'Sungayang', 'Tanjung Baru', 'Tanjung Emas'] },
      { name: 'Kota Bukittinggi', type: 'Kota', districts: ['Aur Birugo Tigo Baleh', 'Guguk Panjang', 'Mandiangin Koto Selayan'] },
      { name: 'Kota Padang', type: 'Kota', districts: ['Bungus Teluk Kabung', 'Koto Tangah', 'Kuranji', 'Lubuk Begalung', 'Lubuk Kilangan', 'Nanggalo', 'Padang Barat', 'Padang Selatan', 'Padang Timur', 'Padang Utara', 'Pauh'] },
      { name: 'Kota Padangpanjang', type: 'Kota', districts: ['Padang Panjang Barat', 'Padang Panjang Timur'] },
      { name: 'Kota Pariaman', type: 'Kota', districts: ['Pariaman Selatan', 'Pariaman Tengah', 'Pariaman Timur', 'Pariaman Utara'] },
      { name: 'Kota Payakumbuh', type: 'Kota', districts: ['Lamposi Tigo Nagori', 'Payakumbuh Barat', 'Payakumbuh Selatan', 'Payakumbuh Timur', 'Payakumbuh Utara'] },
      { name: 'Kota Sawahlunto', type: 'Kota', districts: ['Barangin', 'Lembah Segar', 'Silungkang', 'Talawi'] },
      { name: 'Kota Solok', type: 'Kota', districts: ['Lubuk Sikarah', 'Tanjung Harapan'] },
    ]
  },
  {
    name: 'Riau',
    cities: [
      { name: 'Kab. Bengkalis', type: 'Kabupaten', districts: ['Bantan', 'Bengkalis', 'Bukit Batu', 'Mandau', 'Pinggir', 'Rupat', 'Rupat Utara', 'Siak Kecil', 'Talang Muandau'] },
      { name: 'Kab. Indragiri Hilir', type: 'Kabupaten', districts: ['Batang Tuaka', 'Concong', 'Enok', 'Gaung', 'Gaung Anak Serka', 'Kateman', 'Kempas', 'Kemuning', 'Keritang', 'Kuala Indragiri', 'Mandah', 'Pelangiran', 'Pulau Burung', 'Reteh', 'Sungai Batang', 'Tanah Merah', 'Teluk Belengkong', 'Tembilahan', 'Tembilahan Hulu', 'Tempuling'] },
      { name: 'Kab. Indragiri Hulu', type: 'Kabupaten', districts: ['Batang Cenaku', 'Batang Gansal', 'Batang Peranap', 'Kelayang', 'Kuala Cenaku', 'Lirik', 'Lubuk Batu Jaya', 'Pasir Penyu', 'Peranap', 'Rakit Kulim', 'Rengat', 'Rengat Barat', 'Siberida', 'Sungai Lala'] },
      { name: 'Kab. Kampar', type: 'Kabupaten', districts: ['Bangkinang', 'Bangkinang Kota', 'Gunung Sahilan', 'Kampar', 'Kampar Kiri', 'Kampar Kiri Hilir', 'Kampar Kiri Hulu', 'Kampar Kiri Tengah', 'Kampar Utara', 'Koto Kampar Hulu', 'Kuok', 'Perhentian Raja', 'Rumbio Jaya', 'Salo', 'Siak Hulu', 'Tambang', 'Tapung', 'Tapung Hilir', 'Tapung Hulu', 'XIII Koto Kampar'] },
      { name: 'Kab. Pelalawan', type: 'Kabupaten', districts: ['Bandar Petalangan', 'Bandar Sei Kijang', 'Bunut', 'Kerumutan', 'Kuala Kampar', 'Langgam', 'Pangkalan Kerinci', 'Pangkalan Kuras', 'Pangkalan Lesung', 'Pelalawan', 'Teluk Meranti', 'Ukui'] },
      { name: 'Kab. Rokan Hilir', type: 'Kabupaten', districts: ['Bagan Sinembah', 'Bangko', 'Bangko Pusako', 'Batu Hampar', 'Kubu', 'Pasir Limau Kapas', 'Pekaitan', 'Pujud', 'Rantau Kopar', 'Rimba Melintang', 'Simpang Kanan', 'Sinaboi', 'Tanah Putih', 'Tanah Putih Tanjung Melawan'] },
      { name: 'Kab. Rokan Hulu', type: 'Kabupaten', districts: ['Bangun Purba', 'Bonai Darussalam', 'Kabun', 'Kepenuhan', 'Kepenuhan Hulu', 'Kunto Darussalam', 'Pagaran Tapah Darussalam', 'Pendalian IV Koto', 'Rambah', 'Rambah Hilir', 'Rambah Samo', 'Rokan IV Koto', 'Tambusai', 'Tambusai Utara', 'Tandun', 'Ujung Batu'] },
      { name: 'Kab. Siak', type: 'Kabupaten', districts: ['Bunga Raya', 'Dayun', 'Kandis', 'Kerinci Kanan', 'Koto Gasib', 'Lubuk Dalam', 'Mempura', 'Minas', 'Pusako', 'Sabak Auh', 'Siak', 'Sungai Apit', 'Sungai Mandau', 'Tualang'] },
      { name: 'Kota Dumai', type: 'Kota', districts: ['Bukit Kapur', 'Dumai Barat', 'Dumai Kota', 'Dumai Selatan', 'Dumai Timur', 'Medang Kampai', 'Sungai Sembilan'] },
      { name: 'Kota Pekanbaru', type: 'Kota', districts: ['Bukit Raya', 'Lima Puluh', 'Marpoyan Damai', 'Payung Sekaki', 'Pekanbaru Kota', 'Rumbai', 'Rumbai Barat', 'Rumbai Timur', 'Sail', 'Senapelan', 'Sukajadi', 'Tampan', 'Tenayan Raya', 'Tuah Madani'] },
    ]
  },
  {
    name: 'Jambi',
    cities: [
      { name: 'Kab. Batanghari', type: 'Kabupaten', districts: ['Bajubang', 'Batin XXIV', 'Maro Sebo Ilir', 'Maro Sebo Ulu', 'Mersam', 'Muara Bulian', 'Muara Tembesi', 'Pemayung'] },
      { name: 'Kab. Bungo', type: 'Kabupaten', districts: ['Bathin II Babeko', 'Bathin II Pelayang', 'Bathin III', 'Bathin III Ulu', 'Bungo Dani', 'Jujuhan', 'Jujuhan Ilir', 'Limbur Lubuk Mengkuang', 'Muko-Muko Bathin VII', 'Pelepat', 'Pelepat Ilir', 'Rantau Pandan', 'Rimbo Tengah', 'Tanah Sepenggal', 'Tanah Sepenggal Lintas', 'Tanah Tumbuh'] },
      { name: 'Kab. Kerinci', type: 'Kabupaten', districts: ['Air Hangat', 'Air Hangat Barat', 'Air Hangat Timur', 'Batang Merangin', 'Bukitkerman', 'Danau Kerinci', 'Depati Tujuh', 'Gunung Kerinci', 'Gunung Raya', 'Gunung Tujuh', 'Kayu Aro', 'Kayu Aro Barat', 'Keliling Danau', 'Sitinjau Laut', 'Siulak', 'Siulak Mukai'] },
      { name: 'Kab. Merangin', type: 'Kabupaten', districts: ['Bangko', 'Bangko Barat', 'Batang Masumai', 'Jangkat', 'Lembah Masurai', 'Margo Tabir', 'Muara Siau', 'Nalo Tantan', 'Pamenang', 'Pamenang Barat', 'Pamenang Selatan', 'Pangkalan Jambu', 'Renah Pembarap', 'Renah Pamenang', 'Sungai Manau', 'Sungai Tenang', 'Tabir', 'Tabir Barat', 'Tabir Ilir', 'Tabir Lintas', 'Tabir Selatan', 'Tabir Timur', 'Tabir Ulu', 'Tiang Pumpung'] },
      { name: 'Kab. Muaro Jambi', type: 'Kabupaten', districts: ['Bahar Selatan', 'Bahar Utara', 'Jambi Luar Kota', 'Kumpeh', 'Kumpeh Ulu', 'Maro Sebo', 'Mestong', 'Sekernan', 'Sungai Bahar', 'Sungai Gelam', 'Taman Rajo'] },
      { name: 'Kab. Sarolangun', type: 'Kabupaten', districts: ['Air Hitam', 'Batang Asai', 'Bathin VIII', 'Cermin Nan Gedang', 'Limun', 'Mandiangin', 'Pauh', 'Pelawan', 'Sarolangun', 'Singkut'] },
      { name: 'Kab. Tanjung Jabung Barat', type: 'Kabupaten', districts: ['Batang Asam', 'Betara', 'Bram Itam', 'Kuala Betara', 'Merlung', 'Muara Papalik', 'Pengabuan', 'Renah Mendaluh', 'Seberang Kota', 'Senyerang', 'Tebing Tinggi', 'Tungkal Ilir', 'Tungkal Ulu'] },
      { name: 'Kab. Tanjung Jabung Timur', type: 'Kabupaten', districts: ['Berbak', 'Dendang', 'Geragai', 'Kuala Jambi', 'Mendahara', 'Mendahara Ulu', 'Muara Sabak Barat', 'Muara Sabak Timur', 'Nipah Panjang', 'Rantau Rasau', 'Sadu'] },
      { name: 'Kab. Tebo', type: 'Kabupaten', districts: ['MUARA TABIR', 'Rimbo Bujang', 'Rimbo Ilir', 'Rimbo Ulu', 'Serai Serumpun', 'Sumay', 'Tebo Ilir', 'Tebo Tengah', 'Tebo Ulu', 'Tengah Ilir', 'VII Koto', 'VII Koto Ilir'] },
      { name: 'Kota Jambi', type: 'Kota', districts: ['Alam Barajo', 'Danau Sipin', 'Jambi Selatan', 'Jambi Timur', 'Jelutung', 'Kota Baru', 'Pasar Jambi', 'Pelayangan', 'Telanaipura'] },
      { name: 'Kota Sungai Penuh', type: 'Kota', districts: ['Hamparan Rawang', 'Koto Baru', 'Kumun Debai', 'Pesisir Bukit', 'Pondok Tinggi', 'Sungai Bungkal', 'Sungai Penuh', 'Tanah Kampung'] },
    ]
  },
  {
    name: 'Sumatera Selatan',
    cities: [
      { name: 'Kab. Banyuasin', type: 'Kabupaten', districts: ['Air Kumbang', 'Air Salek', 'Banyuasin I', 'Banyuasin II', 'Banyuasin III', 'Betung', 'Karang Agung Ilir', 'Makarti Jaya', 'Muara Padang', 'Muara Sugihan', 'Muara Telang', 'Pulau Rimau', 'Rambutan', 'Rantau Bayur', 'Sembawa', 'Suak Tapeh', 'Sumber Marga Telang', 'Talang Kelapa', 'Tanjung Lago', 'Tungkal Ilir'] },
      { name: 'Kab. Empat Lawang', type: 'Kabupaten', districts: ['Lintang Kanan', 'Muara Pinang', 'Pasemah Air Keruh', 'Pendopo', 'Pendopo Barat', 'Saling', 'Sikap Dalam', 'Talang Padang', 'Tebing Tinggi', 'Ulu Musi'] },
      { name: 'Kab. Lahat', type: 'Kabupaten', districts: ['Gumay Talang', 'Gumay Ulu', 'Jarai', 'Kikim Barat', 'Kikim Selatan', 'Kikim Tengah', 'Kikim Timur', 'Kota Agung', 'Lahat', 'Lahat Selatan', 'Merapi Barat', 'Merapi Selatan', 'Merapi Timur', 'Muarapayang', 'Mulak Sebingkai', 'Mulak Ulu', 'Pagar Gunung', 'Pajar Bulan', 'Pseksu', 'Pulau Pinang', 'Sukamerindu', 'Tanjung Sakti Pumi', 'Tanjung Sakti Pumu', 'Tanjung Tebat'] },
      { name: 'Kab. Muara Enim', type: 'Kabupaten', districts: ['Belida Darat', 'Belimbing', 'Benakat', 'Gelumbang', 'Gunung Megang', 'Kelekar', 'Lawang Kidul', 'Lembak', 'Lubai', 'Lubai Ulu', 'Muara Belida', 'Muara Enim', 'Penukal', 'Penukal Utara', 'Rambang', 'Rambang Kuang', 'Semende Darat Laut', 'Semende Darat Tengah', 'Semende Darat Ulu', 'Sungai Rotan', 'Talang Ubi', 'Tanah Abang', 'Tanjung Agung', 'Ujan Mas'] },
      { name: 'Kab. Musi Rawas', type: 'Kabupaten', districts: ['Bulang Tengah Suku Ulu', 'Jaya Loka', 'Karang Dapo', 'Karang Jaya', 'Megang Sakti', 'Muara Beliti', 'Muara Kelingi', 'Muara Lakitan', 'Nibung', 'Purwodadi', 'Rawas Ilir', 'Rawas Ulu', 'Rupit', 'Selangit', 'Suku Tengah Lakitan Ulu', 'Sumber Harta', 'Tiang Pumpung Kepungut', 'Tuah Negeri', 'Tugumulyo', 'Ulu Rawas'] },
      { name: 'Kab. Ogan Ilir', type: 'Kabupaten', districts: ['Indralaya', 'Indralaya Selatan', 'Indralaya Utara', 'Kandis', 'Lubuk Keliat', 'Muara Kuang', 'Payaraman', 'Pemulutan', 'Pemulutan Barat', 'Pemulutan Selatan', 'Rambang Kuang', 'Rantau Alai', 'Rantau Panjang', 'Sungai Pinang', 'Tanjung Batu', 'Tanjung Raja'] },
      { name: 'Kab. Ogan Komering Ilir', type: 'Kabupaten', districts: ['Air Sugihan', 'Cengal', 'Jejawi', 'Kayu Agung', 'Lempuing', 'Lempuing Jaya', 'Mesuji', 'Mesuji Makmur', 'Mesuji Raya', 'Pampangan', 'Pangkalan Lampam', 'Pedamaran', 'Pedamaran Timur', 'Sirah Pulau Padang', 'Sungai Menang', 'Tanjung Lubuk', 'Teluk Gelam', 'Tulung Selapan'] },
      { name: 'Kab. Ogan Komering Ulu', type: 'Kabupaten', districts: ['Baturaja Barat', 'Baturaja Timur', 'Lengkiti', 'Lubuk Batang', 'Lubuk Raja', 'Muara Jaya', 'Pengandonan', 'Peninjauan', 'Semidang Aji', 'Sinar Peninjauan', 'Sosoh Buay Rayap', 'Ulu Ogan'] },
      { name: 'Kab. Penukal Abab Lematang Ilir', type: 'Kabupaten', districts: ['Abab', 'Penukal', 'Penukal Utara', 'Talang Ubi', 'Tanah Abang'] },
      { name: 'Kota Lubuklinggau', type: 'Kota', districts: ['Lubuklinggau Barat I', 'Lubuklinggau Barat II', 'Lubuklinggau Selatan I', 'Lubuklinggau Selatan II', 'Lubuklinggau Timur I', 'Lubuklinggau Timur II', 'Lubuklinggau Utara I', 'Lubuklinggau Utara II'] },
      { name: 'Kota Pagar Alam', type: 'Kota', districts: ['Dempo Selatan', 'Dempo Tengah', 'Dempo Utara', 'Pagar Alam Selatan', 'Pagar Alam Utara'] },
      { name: 'Kota Palembang', type: 'Kota', districts: ['Alang-Alang Lebar', 'Bukit Kecil', 'Gandus', 'Ilir Barat I', 'Ilir Barat II', 'Ilir Timur I', 'Ilir Timur II', 'Ilir Timur III', 'Jakabaring', 'Kalidoni', 'Kemuning', 'Kertapati', 'Plaju', 'Sako', 'Seberang Ulu I', 'Seberang Ulu II', 'Sematang Borang', 'Sukarami'] },
      { name: 'Kota Prabumulih', type: 'Kota', districts: ['Cambai', 'Prabumulih Barat', 'Prabumulih Selatan', 'Prabumulih Timur', 'Prabumulih Utara', 'Rambang Kapak Tengah'] },
    ]
  },
  {
    name: 'Bengkulu',
    cities: [
      { name: 'Kab. Bengkulu Selatan', type: 'Kabupaten', districts: ['Air Nipis', 'Bunga Mas', 'Kedurang', 'Kedurang Ilir', 'Kota Manna', 'Manna', 'Pasar Manna', 'Pino', 'Pino Raya', 'Seginim', 'Ulu Manna'] },
      { name: 'Kab. Bengkulu Tengah', type: 'Kabupaten', districts: ['Bang Haji', 'Karang Tinggi', 'Merigi Kelindang', 'Merigi Sakti', 'Pagar Jati', 'Pematang Tiga', 'Pondok Kelapa', 'Pondok Kubang', 'Taba Penanjung', 'Talang Empat'] },
      { name: 'Kab. Bengkulu Utara', type: 'Kabupaten', districts: ['Air Besi', 'Air Napal', 'Air Padang', 'Arga Makmur', 'Batik Nau', 'Enggano', 'Giri Mulya', 'Hulu Palik', 'Kerkap', 'Ketahun', 'Lais', 'Marga Sakti Sebelat', 'Napal Putih', 'Padang Jaya', 'Putri Hijau', 'Tanjung Agung Palik', 'Ulok Kupai'] },
      { name: 'Kab. Kaur', type: 'Kabupaten', districts: ['Kaur Selatan', 'Kaur Tengah', 'Kaur Utara', 'Kelam Tengah', 'Kinal', 'Luas', 'Lungkang Kule', 'Maje', 'Muara Sahung', 'Nasal', 'Padang Guci Hilir', 'Padang Guci Hulu', 'Semidang Gumay', 'Tanjung Kemuning', 'Tetap'] },
      { name: 'Kab. Kepahiang', type: 'Kabupaten', districts: ['Bermani Ilir', 'Kebawetan', 'Kepahiang', 'Merigi', 'Muara Kemumu', 'Seberang Musi', 'Tebat Karai', 'Ujan Mas'] },
      { name: 'Kab. Lebong', type: 'Kabupaten', districts: ['Amen', 'Bingin Kuning', 'Lebong Atas', 'Lebong Sakti', 'Lebong Selatan', 'Lebong Tengah', 'Lebong Utara', 'Pelabai', 'Pinang Belapis', 'Rimbo Pengadang', 'Topos', 'Uram Jaya'] },
      { name: 'Kab. Mukomuko', type: 'Kabupaten', districts: ['Air Dikit', 'Air Majunto', 'Air Rami', 'Ipuh', 'Kota Mukomuko', 'Lubuk Pinang', 'Malin Deman', 'Penarik', 'Pondok Suguh', 'Selagan Raya', 'Sungai Rumbai', 'Teramang Jaya', 'Teras Terunjam', 'V Koto', 'XIV Koto'] },
      { name: 'Kab. Rejang Lebong', type: 'Kabupaten', districts: ['Bermani Ulu', 'Bermani Ulu Raya', 'Binduriang', 'Curup', 'Curup Selatan', 'Curup Tengah', 'Curup Timur', 'Curup Utara', 'Kota Padang', 'Padang Ulak Tanding', 'Selupu Rejang', 'Sindang Beliti Ilir', 'Sindang Beliti Ulu', 'Sindang Dataran', 'Sindang Kelingi'] },
      { name: 'Kab. Seluma', type: 'Kabupaten', districts: ['Air Periukan', 'Ilir Talo', 'Lubuk Sandi', 'Seluma', 'Seluma Barat', 'Seluma Selatan', 'Seluma Timur', 'Seluma Utara', 'Semidang Alas', 'Semidang Alas Maras', 'Sukaraja', 'Talo', 'Talo Kecil', 'Ulu Talo'] },
      { name: 'Kota Bengkulu', type: 'Kota', districts: ['Gading Cempaka', 'Kampung Melayu', 'Muara Bangkahulu', 'Ratu Agung', 'Ratu Samban', 'Selebar', 'Singaran Pati', 'Sungai Serut', 'Teluk Segara'] },
    ]
  },
  {
    name: 'Lampung',
    cities: [
      { name: 'Kab. Lampung Barat', type: 'Kabupaten', districts: ['Air Hitam', 'Balik Bukit', 'Bandar Negeri Suoh', 'Batu Brak', 'Batu Ketulis', 'Belalau', 'Gedung Surian', 'Kebun Tebu', 'Lumbok Seminung', 'Pagar Dewa', 'Sekincau', 'Sukau', 'Suoh', 'Way Tenong'] },
      { name: 'Kab. Lampung Selatan', type: 'Kabupaten', districts: ['Bakauheni', 'Candipuro', 'Jati Agung', 'Kalianda', 'Katibung', 'Ketapang', 'Merbau Mataram', 'Natar', 'Palas', 'Penengahan', 'Rajabasa', 'Sidomulyo', 'Sragi', 'Tanjung Bintang', 'Tanjung Sari', 'Way Panji', 'Way Sulan'] },
      { name: 'Kab. Lampung Tengah', type: 'Kabupaten', districts: ['Anak Ratu Aji', 'Anak Tuha', 'Bandar Mataram', 'Bandar Surabaya', 'Bangunrejo', 'Bekri', 'Bumi Nabung', 'Bumi Ratu Nuban', 'Gunung Sugih', 'Kalirejo', 'Kota Gajah', 'Padang Ratu', 'Pubian', 'Punggur', 'Putra Rumbia', 'Rumbia', 'Selagai Lingga', 'Sendang Agung', 'Seputih Agung', 'Seputih Banyak', 'Seputih Mataram', 'Seputih Raman', 'Seputih Surabaya', 'Terbanggi Besar', 'Terusan Nunyai', 'Trimurjo', 'Way Pangubuan', 'Way Seputih'] },
      { name: 'Kab. Lampung Timur', type: 'Kabupaten', districts: ['Bandar Sribhawono', 'Batanghari', 'Batanghari Nuban', 'Braja Selebah', 'Bumi Agung', 'Gunung Pelindung', 'Jabung', 'Labuhan Maringgai', 'Labuhan Ratu', 'Marga Sekampung', 'Margatiga', 'Mataram Baru', 'Melinting', 'Metro Kibang', 'Pasir Sakti', 'Pekalongan', 'Purbolinggo', 'Raman Utara', 'Sekampung', 'Sekampung Udik', 'Sukadana', 'Waway Karya', 'Way Bungur', 'Way Jepara'] },
      { name: 'Kab. Lampung Utara', type: 'Kabupaten', districts: ['Abung Barat', 'Abung Kunang', 'Abung Pekurun', 'Abung Selatan', 'Abung Semuli', 'Abung Surakarta', 'Abung Tengah', 'Abung Timur', 'Abung Tinggi', 'Blambangan Pagar', 'Bukit Kemuning', 'Bunga Mayang', 'Hulu Sungkai', 'Kotabumi', 'Kotabumi Selatan', 'Kotabumi Utara', 'Muara Sungkai', 'Sungkai Barat', 'Sungkai Jaya', 'Sungkai Selatan', 'Sungkai Tengah', 'Sungkai Utara', 'Tanjung Raja'] },
      { name: 'Kab. Mesuji', type: 'Kabupaten', districts: ['Mesuji', 'Mesuji Timur', 'Panca Jaya', 'Rawa Jitu Utara', 'Simpang Pematang', 'Tanjung Raya', 'Way Serdang'] },
      { name: 'Kab. Pesawaran', type: 'Kabupaten', districts: ['Gedong Tataan', 'Kedondong', 'Marga Punduh', 'Negeri Katon', 'Padang Cermin', 'Punduh Pidada', 'Tegineneng', 'Way Khilau', 'Way Lima'] },
      { name: 'Kab. Pringsewu', type: 'Kabupaten', districts: ['Adiluwih', 'Ambarawa', 'Banyumas', 'Gading Rejo', 'Pagelaran', 'Pagelaran Utara', 'Pardasuka', 'Pringsewu', 'Sukoharjo'] },
      { name: 'Kab. Tanggamus', type: 'Kabupaten', districts: ['Air Naningan', 'Bandar Negeri Semuong', 'Bulok', 'Cukuh Balak', 'Gisting', 'Gunung Alip', 'Kelumbayan', 'Kelumbayan Barat', 'Kota Agung', 'Kota Agung Barat', 'Kota Agung Timur', 'Limau', 'Pematang Sawa', 'Pugung', 'Pulau Panggung', 'Semaka', 'Sumberejo', 'Talang Padang', 'Ulubelu', 'Wonosobo'] },
      { name: 'Kab. Tulang Bawang', type: 'Kabupaten', districts: ['Banjar Agung', 'Banjar Baru', 'Banjar Margo', 'Dente Teladas', 'Gedung Aji', 'Gedung Aji Baru', 'Gedung Meneng', 'Menggala', 'Menggala Timur', 'Meraksa Aji', 'Penawar Aji', 'Penawar Tama', 'Rawa Pitu', 'Rawajitu Selatan', 'Rawajitu Timur'] },
      { name: 'Kab. Way Kanan', type: 'Kabupaten', districts: ['Bahuga', 'Banjit', 'Baradatu', 'Blambangan Umpu', 'Buay Bahuga', 'Bumi Agung', 'Gunung Labuhan', 'Kasui', 'Negara Batin', 'Negeri Agung', 'Negeri Besar', 'Pakuan Ratu', 'Rebang Tangkas', 'Way Tuba'] },
      { name: 'Kota Bandar Lampung', type: 'Kota', districts: ['Bumi Waras', 'Enggal', 'Kedamaian', 'Kedaton', 'Kemiling', 'Labuhan Ratu', 'Langkapura', 'Panjang', 'Rajabasa', 'Sukabumi', 'Sukarame', 'Tanjung Karang Barat', 'Tanjung Karang Pusat', 'Tanjung Karang Timur', 'Tanjung Senang', 'Telukbetung Barat', 'Telukbetung Selatan', 'Telukbetung Timur', 'Telukbetung Utara', 'Way Halim'] },
      { name: 'Kota Metro', type: 'Kota', districts: ['Metro Barat', 'Metro Pusat', 'Metro Selatan', 'Metro Timur', 'Metro Utara'] },
    ]
  },
  {
    name: 'Kepulauan Bangka Belitung',
    cities: [
      { name: 'Kab. Bangka', type: 'Kabupaten', districts: ['Bakam', 'Belinyu', 'Mendo Barat', 'Merawang', 'Pemali', 'Puding Besar', 'Riau Silip', 'Sungai Liat'] },
      { name: 'Kab. Bangka Barat', type: 'Kabupaten', districts: ['Jebus', 'Kelapa', 'Mentok', 'Parittiga', 'Simpang Teritip', 'Tempilang'] },
      { name: 'Kab. Bangka Selatan', type: 'Kabupaten', districts: ['Air Gegas', 'Kepulauan Pongok', 'Lepar Pongok', 'Payung', 'Pulau Besar', 'Simpang Rimba', 'Toboali', 'Tukak Sadai'] },
      { name: 'Kab. Bangka Tengah', type: 'Kabupaten', districts: ['Koba', 'Lubuk Besar', 'Namang', 'Pangkalan Baru', 'Simpang Katis', 'Sungai Selan'] },
      { name: 'Kab. Belitung', type: 'Kabupaten', districts: ['Badau', 'Membalong', 'Selat Nasik', 'Sijuk', 'Tanjung Pandan'] },
      { name: 'Kab. Belitung Timur', type: 'Kabupaten', districts: ['Damar', 'Dendang', 'Gantung', 'Kelapa Kampit', 'Manggar', 'Simpang Pesak', 'Simpang Renggiang'] },
      { name: 'Kota Pangkalpinang', type: 'Kota', districts: ['Bukit Intan', 'Gabek', 'Gerunggang', 'Girimaya', 'Pangkal Balam', 'Rangkui', 'Taman Sari'] },
    ]
  },
  {
    name: 'Kepulauan Riau',
    cities: [
      { name: 'Kab. Bintan', type: 'Kabupaten', districts: ['Bintan Pesisir', 'Bintan Timur', 'Bintan Utara', 'Gunung Kijang', 'Mantang', 'Seri Kuala Lobam', 'Tambelan', 'Teluk Bintan', 'Teluk Sebong', 'Toapaya'] },
      { name: 'Kab. Karimun', type: 'Kabupaten', districts: ['Belat', 'Buru', 'Durai', 'Karimun', 'Kundur', 'Kundur Barat', 'Kundur Utara', 'Meral', 'Meral Barat', 'Moro', 'Tebing', 'Ungar'] },
      { name: 'Kab. Kepulauan Anambas', type: 'Kabupaten', districts: ['Jemaja', 'Jemaja Timur', 'Palmatak', 'Siantan', 'Siantan Selatan', 'Siantan Tengah', 'Siantan Timur'] },
      { name: 'Kab. Lingga', type: 'Kabupaten', districts: ['Bakung Serumpun', 'Katang Bidare', 'Kepulauan Posek', 'Kepulauan Senayang', 'Lingga', 'Lingga Timur', 'Lingga Utara', 'Selayar', 'Senayang', 'Singkep', 'Singkep Barat', 'Singkep Pesisir', 'Singkep Selatan'] },
      { name: 'Kab. Natuna', type: 'Kabupaten', districts: ['Bunguran Barat', 'Bunguran Batubi', 'Bunguran Selatan', 'Bunguran Tengah', 'Bunguran Timur', 'Bunguran Timur Laut', 'Bunguran Utara', 'Midai', 'Pulau Laut', 'Pulau Tiga', 'Serasan', 'Serasan Timur', 'Suak Midai', 'Subi'] },
      { name: 'Kota Batam', type: 'Kota', districts: ['Batam Kota', 'Batu Aji', 'Batu Ampar', 'Belakang Padang', 'Bengkong', 'Bulang', 'Galang', 'Lubuk Baja', 'Nongsa', 'Sagulung', 'Sei Beduk', 'Sekupang'] },
      { name: 'Kota Tanjungpinang', type: 'Kota', districts: ['Bukit Bestari', 'Tanjungpinang Barat', 'Tanjungpinang Kota', 'Tanjungpinang Timur'] },
    ]
  },
  {
    name: 'DKI Jakarta',
    cities: [
      { name: 'Kab. Kepulauan Seribu', type: 'Kabupaten', districts: ['Kepulauan Seribu Selatan', 'Kepulauan Seribu Utara'] },
      { name: 'Kota Jakarta Barat', type: 'Kota', districts: ['Cengkareng', 'Grogol Petamburan', 'Kalideres', 'Kebon Jeruk', 'Kembangan', 'Palmerah', 'Taman Sari', 'Tambora'] },
      { name: 'Kota Jakarta Pusat', type: 'Kota', districts: ['Cempaka Putih', 'Gambir', 'Johar Baru', 'Kemayoran', 'Menteng', 'Sawah Besar', 'Senen', 'Tanah Abang'] },
      { name: 'Kota Jakarta Selatan', type: 'Kota', districts: ['Cilandak', 'Jagakarsa', 'Kebayoran Baru', 'Kebayoran Lama', 'Mampang Prapatan', 'Pancoran', 'Pasar Minggu', 'Pesanggrahan', 'Setiabudi', 'Tebet'] },
      { name: 'Kota Jakarta Timur', type: 'Kota', districts: ['Cakung', 'Cipayung', 'Ciracas', 'Duren Sawit', 'Jatinegara', 'Kramat Jati', 'Makasar', 'Matraman', 'Pasar Rebo', 'Pulo Gadung'] },
      { name: 'Kota Jakarta Utara', type: 'Kota', districts: ['Cilincing', 'Kelapa Gading', 'Koja', 'Pademangan', 'Penjaringan', 'Tanjung Priok'] },
    ]
  },
  {
    name: 'Jawa Barat',
    cities: [
      { name: 'Kab. Bandung', type: 'Kabupaten', districts: ['Arjasari', 'Baleendah', 'Banjaran', 'Bojongsoang', 'Cangkuang', 'Cicalengka', 'Cikancung', 'Cilengkrang', 'Cileunyi', 'Cimaung', 'Cimenyan', 'Ciparay', 'Ciwidey', 'Dayeuhkolot', 'Ibun', 'Katapang', 'Kertasari', 'Kutawaringin', 'Majalaya', 'Margaasih', 'Margahayu', 'Nagreg', 'Pacet', 'Pameungpeuk', 'Pangalengan', 'Paseh', 'Pasirjambu', 'Rancabali', 'Rancaekek', 'Solokan Jeruk', 'Soreang'] },
      { name: 'Kab. Bandung Barat', type: 'Kabupaten', districts: ['Batujajar', 'Cihampelas', 'Cikalongwetan', 'Cililin', 'Cipatat', 'Cipeundeuy', 'Cipongkor', 'Cisarua', 'Gununghalu', 'Lembang', 'Ngamprah', 'Padalarang', 'Parongpong', 'Rongga', 'Saguling', 'Sindangkerta'] },
      { name: 'Kab. Bekasi', type: 'Kabupaten', districts: ['Babelan', 'Bojongmangu', 'Cabangbungin', 'Cibarusah', 'Cibitung', 'Cikarang Barat', 'Cikarang Pusat', 'Cikarang Selatan', 'Cikarang Timur', 'Cikarang Utara', 'Karangbahagia', 'Kedungwaringin', 'Muara Gembong', 'Pebayuran', 'Serang Baru', 'Setu', 'Sukakarya', 'Sukatani', 'Sukawangi', 'Tambelang', 'Tambun Selatan', 'Tambun Utara', 'Tarumajaya'] },
      { name: 'Kab. Bogor', type: 'Kabupaten', districts: ['Babakan Madang', 'Bojonggede', 'Caringin', 'Cariu', 'Ciampea', 'Ciawi', 'Cibinong', 'Cibungbulang', 'Cigombong', 'Cigudeg', 'Cijeruk', 'Cileungsi', 'Ciomas', 'Cisarua', 'Ciseeng', 'Citeureup', 'Dramaga', 'Gunung Putri', 'Gunung Sindur', 'Jasinga', 'Jonggol', 'Kemang', 'Klapanunggal', 'Leuwiliang', 'Leuwisadeng', 'Megamendung', 'Nanggung', 'Pamijahan', 'Parung', 'Parung Panjang', 'Ranca Bungur', 'Rumpin', 'Sukajaya', 'Sukamakmur', 'Sukaraja', 'Tajurhalang', 'Tamansari', 'Tanjungsari', 'Tenjo', 'Tenjolaya'] },
      { name: 'Kab. Cianjur', type: 'Kabupaten', districts: ['Agrabinta', 'Bojongpicung', 'Campaka', 'Campaka Mulya', 'Cianjur', 'Cibeber', 'Cibinong', 'Cidaun', 'Cijati', 'Cikadu', 'Cikalongkulon', 'Cilaku', 'Cipanas', 'Ciranjang', 'Cugenang', 'Gekbrong', 'Haurwangi', 'Kadupandak', 'Karangtengah', 'Leles', 'Mande', 'Naringgul', 'Pacet', 'Pagelaran', 'Pasirkuda', 'Sindangbarang', 'Sukaluyu', 'Sukanagara', 'Sukaresmi', 'Takokak', 'Tanggeung', 'Warungkondang'] },
      { name: 'Kab. Cirebon', type: 'Kabupaten', districts: ['Arjawinangun', 'Astanajapura', 'Babakan', 'Beber', 'Ciledug', 'Ciwaringin', 'Depok', 'Dukupuntang', 'Gebang', 'Gegesik', 'Gempol', 'Greged', 'Gunungjati', 'Jamblang', 'Kaliwedi', 'Kapetakan', 'Karangsembung', 'Karangwareng', 'Kedawung', 'Klangenan', 'Lemahabang', 'Losari', 'Mundu', 'Pabedilan', 'Pabuaran', 'Palimanan', 'Pangenan', 'Panguragan', 'Pasaleman', 'Plered', 'Plumbon', 'Sedong', 'Sumber', 'Suranenggala', 'Susukan', 'Susukan Lebak', 'Talun', 'Tengahtani', 'Waled', 'Weru'] },
      { name: 'Kab. Garut', type: 'Kabupaten', districts: ['Balubur Limbangan', 'Banjarwangi', 'Banyuresmi', 'Bayongbong', 'Blubur Limbangan', 'Bungbulang', 'Caringin', 'Cibalong', 'Cibatu', 'Cibiuk', 'Cigedug', 'Cihurip', 'Cikajang', 'Cikelet', 'Cilawu', 'Cisewu', 'Cisompet', 'Cisurupan', 'Garut Kota', 'Kadungora', 'Karangpawitan', 'Karangtengah', 'Kersamanah', 'Leles', 'Leuwigoong', 'Malangbong', 'Mekarmukti', 'Pakenjeng', 'Pameungpeuk', 'Pamulihan', 'Pangatikan', 'Pasirwangi', 'Peundeuy', 'Samarang', 'Selaawi', 'Singajaya', 'Sucinaraja', 'Sukaresmi', 'Sukawening', 'Talegong', 'Tarogong Kaler', 'Tarogong Kidul', 'Wanaraja'] },
      { name: 'Kab. Indramayu', type: 'Kabupaten', districts: ['Anjatan', 'Arahan', 'Balongan', 'Bangodua', 'Bongas', 'Cantigi', 'Cikedung', 'Gabuswetan', 'Gantar', 'Haurgeulis', 'Indramayu', 'Jatibarang', 'Juntinyuat', 'Kandanghaur', 'Karangampel', 'Kedokan Bunder', 'Kertasemaya', 'Krangkeng', 'Kroya', 'Lelea', 'Lohbener', 'Losarang', 'Pasekan', 'Patrol', 'Sindang', 'Sliyeg', 'Sukagumiwang', 'Sukra', 'Trisi', 'Tukdana', 'Widasari'] },
      { name: 'Kab. Karawang', type: 'Kabupaten', districts: ['Banyusari', 'Batujaya', 'Ciampel', 'Cibuaya', 'Cikampek', 'Cilamaya Kulon', 'Cilamaya Wetan', 'Cilebar', 'Jatisari', 'Jayakerta', 'Karawang Barat', 'Karawang Timur', 'Klari', 'Kotabaru', 'Kutawaluya', 'Lemahabang', 'Majalaya', 'Pakisjaya', 'Pangkalan', 'Pedes', 'Purwasari', 'Rawamerta', 'Rengasdengklok', 'Talagasari', 'Tegalwaru', 'Telagasari', 'Telukjambe Barat', 'Telukjambe Timur', 'Tempuran', 'Tirtajaya', 'Tirtamulya'] },
      { name: 'Kab. Kuningan', type: 'Kabupaten', districts: ['Ciawigebang', 'Cibeureum', 'Cibingbin', 'Cidahu', 'Cigandamekar', 'Cigugur', 'Cilebak', 'Cilimus', 'Cimahi', 'Ciniru', 'Cipicung', 'Ciwaru', 'Darma', 'Garawangi', 'Hantara', 'Jalaksana', 'Japara', 'Kadugede', 'Kalimanggis', 'Karangkancana', 'Kramatmulya', 'Kuningan', 'Lebakwangi', 'Luragung', 'Maleber', 'Mandirancan', 'Nusaherang', 'Pancalang', 'Pasawahan', 'Selajambe', 'Sindangagung', 'Subang'] },
      { name: 'Kab. Majalengka', type: 'Kabupaten', districts: ['Argapura', 'Banjaran', 'Bantarujeg', 'Cigasong', 'Cikijing', 'Cingambul', 'Dawuan', 'Jatitujuh', 'Jatiwangi', 'Kadipaten', 'Kasokandel', 'Kertajati', 'Lemahsugih', 'Leuwimunding', 'Ligung', 'Maja', 'Majalengka', 'Malausma', 'Palasah', 'Panyingkiran', 'Rajagaluh', 'Sindang', 'Sindangwangi', 'Sukahaji', 'Sumberjaya', 'Talaga'] },
      { name: 'Kab. Pangandaran', type: 'Kabupaten', districts: ['Cigugur', 'Cijulang', 'Cimerak', 'Kalipucang', 'Langkaplancar', 'Mangunjaya', 'Padaherang', 'Pangandaran', 'Parigi', 'Sidamulih'] },
      { name: 'Kab. Purwakarta', type: 'Kabupaten', districts: ['Babakancikao', 'Bojong', 'Bungursari', 'Campaka', 'Cibatu', 'Darangdan', 'Jatiluhur', 'Kiarapedes', 'Maniis', 'Pasawahan', 'Plered', 'Pondoksalam', 'Purwakarta', 'Sukasari', 'Sukatani', 'Tegalwaru', 'Wanayasa'] },
      { name: 'Kab. Subang', type: 'Kabupaten', districts: ['Binong', 'Blanakan', 'Ciasem', 'Ciater', 'Cibogo', 'Cijambe', 'Cikaum', 'Cipeundeuy', 'Cipunagara', 'Cisalak', 'Compreng', 'Dawuan', 'Jalancagak', 'Kalijati', 'Kasomalang', 'Legonkulon', 'Pabuaran', 'Pagaden', 'Pagaden Barat', 'Pamanukan', 'Patokbeusi', 'Purwadadi', 'Pusakajaya', 'Pusakanagara', 'Sagalaherang', 'Serangpanjang', 'Subang', 'Sukasari', 'Tambakdahan', 'Tanjungsiang'] },
      { name: 'Kab. Sukabumi', type: 'Kabupaten', districts: ['Bantargadung', 'Bojonggenteng', 'Caringin', 'Ciambar', 'Cibadak', 'Cibitung', 'Cicantayan', 'Cicurug', 'Cidadap', 'Cidahu', 'Cidolog', 'Ciemas', 'Cikakak', 'Cikembar', 'Cikidang', 'Ciracap', 'Cireunghas', 'Cisaat', 'Cisolok', 'Curugkembar', 'Gegerbitung', 'Gunungguruh', 'Jampang Kulon', 'Jampang Tengah', 'Kabandungan', 'Kadudampit', 'Kalapanunggal', 'Kalibunder', 'Kebonpedes', 'Lengkong', 'Nagrak', 'Nyalindung', 'Pabuaran', 'Parakansalak', 'Parungkuda', 'Purabaya', 'Sagaranten', 'Simpenan', 'Sukabumi', 'Sukalarang', 'Sukaraja', 'Surade', 'Tegal Buleud', 'Waluran', 'Warungkiara'] },
      { name: 'Kab. Sumedang', type: 'Kabupaten', districts: ['Buahdua', 'Cibugel', 'Cimalaka', 'Cimanggung', 'Cisarua', 'Cisitu', 'Conggeang', 'Darmaraja', 'Ganeas', 'Jatigede', 'Jatinangor', 'Jatinunggal', 'Pamulihan', 'Paseh', 'Rancakalong', 'Situraja', 'Sukasari', 'Sumedang Selatan', 'Sumedang Utara', 'Surian', 'Tanjungkerta', 'Tanjungmedar', 'Tanjungsari', 'Tomo', 'Ujungjaya', 'Wado'] },
      { name: 'Kab. Tasikmalaya', type: 'Kabupaten', districts: ['Bantarkalong', 'Bojongasih', 'Bojonggambir', 'Ciawi', 'Cibalong', 'Cigalontang', 'Cikalong', 'Cikatomas', 'Cineam', 'Cipatujah', 'Cisayong', 'Culamega', 'Gunungtanjung', 'Jamanis', 'Jatiwaras', 'Kadipaten', 'Karangjaya', 'Karangnunggal', 'Leuwisari', 'Mangunreja', 'Manonjaya', 'Padakembang', 'Pagerageung', 'Pancatengah', 'Parungponteng', 'Puspahiang', 'Rajapolah', 'Salawu', 'Salopa', 'Sariwangi', 'Singaparna', 'Sodonghilir', 'Sukahening', 'Sukaraja', 'Sukarame', 'Sukaratu', 'Sukaresik', 'Tanjungjaya', 'Taraju'] },
      { name: 'Kota Bandung', type: 'Kota', districts: ['Andir', 'Antapani', 'Arcamanik', 'Astanaanyar', 'Babakan Ciparay', 'Bandung Kidul', 'Bandung Kulon', 'Bandung Wetan', 'Batununggal', 'Bojongloa Kaler', 'Bojongloa Kidul', 'Buahbatu', 'Cibeunying Kaler', 'Cibeunying Kidul', 'Cibiru', 'Cicendo', 'Cidadap', 'Cinambo', 'Coblong', 'Gedebage', 'Kiaracondong', 'Lengkong', 'Mandalajati', 'Panyileukan', 'Rancasari', 'Regol', 'Sukajadi', 'Sukasari', 'Sumur Bandung', 'Ujungberung'] },
      { name: 'Kota Banjar', type: 'Kota', districts: ['Banjar', 'Langensari', 'Pataruman', 'Purwaharja'] },
      { name: 'Kota Bekasi', type: 'Kota', districts: ['Bantargebang', 'Bekasi Barat', 'Bekasi Selatan', 'Bekasi Timur', 'Bekasi Utara', 'Jatiasih', 'Jatisampurna', 'Medansatria', 'Mustikajaya', 'Pondokgede', 'Pondokmelati', 'Rawalumbu'] },
      { name: 'Kota Bogor', type: 'Kota', districts: ['Bogor Barat', 'Bogor Selatan', 'Bogor Tengah', 'Bogor Timur', 'Bogor Utara', 'Tanah Sareal'] },
      { name: 'Kota Cimahi', type: 'Kota', districts: ['Cimahi Selatan', 'Cimahi Tengah', 'Cimahi Utara'] },
      { name: 'Kota Cirebon', type: 'Kota', districts: ['Harjamukti', 'Kejaksan', 'Kesambi', 'Lemahwungkuk', 'Pekalipan'] },
      { name: 'Kota Depok', type: 'Kota', districts: ['Beji', 'Bojongsari', 'Cilodong', 'Cimanggis', 'Cinere', 'Cipayung', 'Limo', 'Pancoran Mas', 'Sawangan', 'Sukmajaya', 'Tapos'] },
      { name: 'Kota Sukabumi', type: 'Kota', districts: ['Baros', 'Cibeureum', 'Cikole', 'Citamiang', 'Gunungpuyuh', 'Lembursitu', 'Warudoyong'] },
      { name: 'Kota Tasikmalaya', type: 'Kota', districts: ['Bungursari', 'Cibeureum', 'Cihideung', 'Cipedes', 'Indihiang', 'Kawalu', 'Mangkubumi', 'Purbaratu', 'Tamansari', 'Tawang'] },
    ]
  },
  {
    name: 'Jawa Tengah',
    cities: [
      { name: 'Kab. Banjarnegara', type: 'Kabupaten', districts: ['Banjarmangu', 'Banjarnegara', 'Batur', 'Bawang', 'Kalibening', 'Karangkobar', 'Madukara', 'Mandiraja', 'Pagedongan', 'Pagentan', 'Pandanarum', 'Pejawaran', 'Punggelan', 'Purwanegara', 'Purworejo Klampok', 'Rakit', 'Sigaluh', 'Susukan', 'Wanadadi', 'Wanayasa'] },
      { name: 'Kab. Banyumas', type: 'Kabupaten', districts: ['Ajibarang', 'Banyumas', 'Baturaden', 'Cilongok', 'Gumelar', 'Jatilawang', 'Kalibagor', 'Karanglewas', 'Kebasen', 'Kedungbanteng', 'Kembaran', 'Kemranjen', 'Lumbir', 'Patikraja', 'Pekuncen', 'Purwojati', 'Purwokerto Barat', 'Purwokerto Selatan', 'Purwokerto Timur', 'Purwokerto Utara', 'Rawalo', 'Sokaraja', 'Somagede', 'Sumbang', 'Sumpiuh', 'Tambak', 'Wangon'] },
      { name: 'Kab. Batang', type: 'Kabupaten', districts: ['Bandar', 'Banyuputih', 'Batang', 'Bawang', 'Blado', 'Gringsing', 'Kandeman', 'Limpung', 'Pecalungan', 'Reban', 'Subah', 'Tersono', 'Tulis', 'Warungasem', 'Wonotunggal'] },
      { name: 'Kab. Blora', type: 'Kabupaten', districts: ['Banjarejo', 'Blora', 'Bogorejo', 'Cepu', 'Japah', 'Jati', 'Jepon', 'Jiken', 'Kedungtuban', 'Kradenan', 'Kunduran', 'Ngawen', 'Randublatung', 'Sambong', 'Todanan', 'Tunjungan'] },
      { name: 'Kab. Boyolali', type: 'Kabupaten', districts: ['Ampel', 'Andong', 'Banyudono', 'Boyolali', 'Cepogo', 'Juwangi', 'Karanggede', 'Kemusu', 'Klego', 'Mojosongo', 'Musuk', 'Ngemplak', 'Nogosari', 'Sambi', 'Sawit', 'Selo', 'Simo', 'Teras', 'Wonosegoro'] },
      { name: 'Kab. Brebes', type: 'Kabupaten', districts: ['Banjarharjo', 'Bantarkawung', 'Brebes', 'Bulakamba', 'Bumiayu', 'Jatibarang', 'Kersana', 'Ketanggungan', 'Larangan', 'Losari', 'Paguyangan', 'Salem', 'Sirampog', 'Songgom', 'Tanjung', 'Tonjong', 'Wanasari'] },
      { name: 'Kab. Cilacap', type: 'Kabupaten', districts: ['Adipala', 'Bantarsari', 'Binangun', 'Cilacap Selatan', 'Cilacap Tengah', 'Cilacap Utara', 'Cimanggu', 'Cipari', 'Dayeuhluhur', 'Gandrungmangu', 'Jeruklegi', 'Kampung Laut', 'Karangpucung', 'Kawunganten', 'Kedungreja', 'Kesugihan', 'Kroya', 'Majenang', 'Maos', 'Nusawungu', 'Patimuan', 'Sampang', 'Sidareja', 'Wanareja'] },
      { name: 'Kab. Demak', type: 'Kabupaten', districts: ['Bonang', 'Demak', 'Dempet', 'Gajah', 'Guntur', 'Karanganyar', 'Karangawen', 'Karangtengah', 'Kebonagung', 'Mijen', 'Mranggen', 'Sayung', 'Wedung', 'Wonosalam'] },
      { name: 'Kab. Grobogan', type: 'Kabupaten', districts: ['Brati', 'Gabus', 'Geyer', 'Godong', 'Grobogan', 'Gubug', 'Karangrayung', 'Kedungjati', 'Klambu', 'Kradenan', 'Ngaringan', 'Penawangan', 'Pulokulon', 'Purwodadi', 'Tanggungharjo', 'Tawangharjo', 'Tegowanu', 'Toroh', 'Wirosari'] },
      { name: 'Kab. Jepara', type: 'Kabupaten', districts: ['Bangsri', 'Batealit', 'Donorojo', 'Jepara', 'Kalinyamatan', 'Karimunjawa', 'Kedung', 'Keling', 'Kembang', 'Mayong', 'Mlonggo', 'Nalumsari', 'Pakis Aji', 'Pecangaan', 'Tahunan', 'Welahan'] },
      { name: 'Kab. Karanganyar', type: 'Kabupaten', districts: ['Colomadu', 'Gondangrejo', 'Jaten', 'Jatipuro', 'Jatiyoso', 'Jenawi', 'Jumantono', 'Jumapolo', 'Karanganyar', 'Karangpandan', 'Kebakkramat', 'Kerjo', 'Matesih', 'Mojogedang', 'Ngargoyoso', 'Tasikmadu', 'Tawangmangu'] },
      { name: 'Kab. Kebumen', type: 'Kabupaten', districts: ['Adimulyo', 'Alian', 'Ambal', 'Ayah', 'Bonorowo', 'Buayan', 'Buluspesantren', 'Gombong', 'Karanganyar', 'Karanggayam', 'Karangsambung', 'Kebumen', 'Klirong', 'Kutowinangun', 'Kuwarasan', 'Mirit', 'Padureso', 'Pejagoan', 'Petanahan', 'Poncowarno', 'Prembun', 'Puring', 'Rowokele', 'Sadang', 'Sempor', 'Sruweng'] },
      { name: 'Kab. Kendal', type: 'Kabupaten', districts: ['Boja', 'Brangsong', 'Cepiring', 'Gemuh', 'Kaliwungu', 'Kaliwungu Selatan', 'Kangkung', 'Kendal', 'Limbangan', 'Ngampel', 'Pageruyung', 'Patean', 'Patebon', 'Pegandon', 'Plantungan', 'Ringinarum', 'Rowosari', 'Singorojo', 'Sukorejo', 'Weleri'] },
      { name: 'Kab. Klaten', type: 'Kabupaten', districts: ['Bayat', 'Cawas', 'Ceper', 'Delanggu', 'Gantiwarno', 'Jatinom', 'Jogonalan', 'Juwiring', 'Kalikotes', 'Karanganom', 'Karangdowo', 'Karangnongko', 'Kebonarum', 'Kemalang', 'Klaten Selatan', 'Klaten Tengah', 'Klaten Utara', 'Manisrenggo', 'Ngawen', 'Pedan', 'Polanharjo', 'Prambanan', 'Trucuk', 'Tulung', 'Wedi', 'Wonosari'] },
      { name: 'Kab. Kudus', type: 'Kabupaten', districts: ['Bae', 'Dawe', 'Gebog', 'Jati', 'Jekulo', 'Kaliwungu', 'Kudus', 'Mejobo', 'Undaan'] },
      { name: 'Kab. Magelang', type: 'Kabupaten', districts: ['Bandongan', 'Borobudur', 'Candimulyo', 'Dukun', 'Grabag', 'Kajoran', 'Kaliangkrik', 'Mertoyudan', 'Mungkid', 'Muntilan', 'Ngablak', 'Ngluwar', 'Pakis', 'Salam', 'Salaman', 'Sawangan', 'Secang', 'Srumbung', 'Tegalrejo', 'Tempuran', 'Windusari'] },
      { name: 'Kab. Pati', type: 'Kabupaten', districts: ['Batangan', 'Cluwak', 'Dukuhseti', 'Gabus', 'Gembong', 'Gunungwungkal', 'Jaken', 'Jakenan', 'Juwana', 'Kayen', 'Margorejo', 'Margoyoso', 'Pati', 'Pucakwangi', 'Sukolilo', 'Tambakromo', 'Tayu', 'Tlogowungu', 'Trangkil', 'Wedarijaksa', 'Winong'] },
      { name: 'Kab. Pekalongan', type: 'Kabupaten', districts: ['Bojong', 'Buaran', 'Doro', 'Kajen', 'Kandangserang', 'Karanganyar', 'Karangdadap', 'Kedungwuni', 'Kesesi', 'Lebakbarang', 'Paninggaran', 'Petungkriono', 'Siwalan', 'Sragi', 'Talun', 'Tirto', 'Wiradesa', 'Wonokerto', 'Wonopringgo'] },
      { name: 'Kab. Pemalang', type: 'Kabupaten', districts: ['Ampelgading', 'Bantarbolang', 'Belik', 'Bodeh', 'Comal', 'Moga', 'Pemalang', 'Petarukan', 'Pulosari', 'Randudongkal', 'Taman', 'Ulujami', 'Warungpring', 'Watukumpul'] },
      { name: 'Kab. Purbalingga', type: 'Kabupaten', districts: ['Bobotsari', 'Bojongsari', 'Bukateja', 'Kaligondang', 'Kalimanah', 'Karanganyar', 'Karangjambu', 'Karangmoncol', 'Karangreja', 'Kejobong', 'Kemangkon', 'Kertanegara', 'Kutasari', 'Mrebet', 'Padamara', 'Pengadegan', 'Purbalingga', 'Rembang'] },
      { name: 'Kab. Purworejo', type: 'Kabupaten', districts: ['Bagelen', 'Banyuurip', 'Bayan', 'Bener', 'Bruno', 'Butuh', 'Gebang', 'Grabag', 'Kaligesing', 'Kemiri', 'Kutoarjo', 'Loano', 'Ngombol', 'Pituruh', 'Purwodadi', 'Purworejo'] },
      { name: 'Kab. Rembang', type: 'Kabupaten', districts: ['Bulu', 'Gunem', 'Kaliori', 'Kragan', 'Lasem', 'Pamotan', 'Pancur', 'Rembang', 'Sale', 'Sarang', 'Sedan', 'Sluke', 'Sulang', 'Sumber'] },
      { name: 'Kab. Semarang', type: 'Kabupaten', districts: ['Ambarawa', 'Bancak', 'Bandungan', 'Banyubiru', 'Bawen', 'Bergas', 'Bringin', 'Getasan', 'Jambu', 'Kaliwungu', 'Pabelan', 'Pringapus', 'Sumowono', 'Suruh', 'Susukan', 'Tengaran', 'Tuntang', 'Ungaran Barat', 'Ungaran Timur'] },
      { name: 'Kab. Sragen', type: 'Kabupaten', districts: ['Gemolong', 'Gesi', 'Gondang', 'Jenar', 'Kalijambe', 'Karangmalang', 'Kedawung', 'Masaran', 'Miri', 'Mondokan', 'Ngrampal', 'Plupuh', 'Sambirejo', 'Sambungmacan', 'Sidoharjo', 'Sragen', 'Sukodono', 'Sumberlawang', 'Tangen', 'Tanon'] },
      { name: 'Kab. Sukoharjo', type: 'Kabupaten', districts: ['Baki', 'Bendosari', 'Bulu', 'Gatak', 'Grogol', 'Kartasura', 'Mojolaban', 'Nguter', 'Polokarto', 'Sukoharjo', 'Tawangsari', 'Weru'] },
      { name: 'Kab. Tegal', type: 'Kabupaten', districts: ['Adiwerna', 'Balapulang', 'Bojong', 'Bumijawa', 'Dukuhturi', 'Dukuhwaru', 'Jatinegara', 'Kedungbanteng', 'Kramat', 'Lebaksiu', 'Margasari', 'Pagerbarang', 'Pangkah', 'Slawi', 'Suradadi', 'Talang', 'Tarub', 'Warureja'] },
      { name: 'Kab. Temanggung', type: 'Kabupaten', districts: ['Bansari', 'Bejen', 'Bulu', 'Candiroto', 'Gemawang', 'Jumo', 'Kaloran', 'Kandangan', 'Kedu', 'Kledung', 'Kranggan', 'Ngadirejo', 'Parakan', 'Pringsurat', 'Selopampang', 'Temanggung', 'Tembarak', 'Tlogomulyo', 'Tretep', 'Wonoboyo'] },
      { name: 'Kab. Wonogiri', type: 'Kabupaten', districts: ['Baturetno', 'Batuwarno', 'Bulukerto', 'Eromoko', 'Girimarto', 'Giritontro', 'Giriwoyo', 'Jatipurno', 'Jatiroto', 'Jatisrono', 'Karangtengah', 'Kismantoro', 'Manyaran', 'Ngadirojo', 'Nguntoronadi', 'Paranggupito', 'Pracimantoro', 'Puhpelem', 'Purwantoro', 'Selogiri', 'Sidoharjo', 'Slogohimo', 'Tirtomoyo', 'Wonogiri', 'Wuryantoro'] },
      { name: 'Kab. Wonosobo', type: 'Kabupaten', districts: ['Garung', 'Kalibawang', 'Kalikajar', 'Kaliwiro', 'Kejajar', 'Kepil', 'Kertek', 'Leksono', 'Mojotengah', 'Sapuran', 'Selomerto', 'Sukoharjo', 'Wadaslintang', 'Watumalang', 'Wonosobo'] },
      { name: 'Kota Magelang', type: 'Kota', districts: ['Magelang Selatan', 'Magelang Tengah', 'Magelang Utara'] },
      { name: 'Kota Pekalongan', type: 'Kota', districts: ['Pekalongan Barat', 'Pekalongan Selatan', 'Pekalongan Timur', 'Pekalongan Utara'] },
      { name: 'Kota Salatiga', type: 'Kota', districts: ['Argomulyo', 'Sidomukti', 'Sidorejo', 'Tingkir'] },
      { name: 'Kota Semarang', type: 'Kota', districts: ['Banyumanik', 'Candisari', 'Gajahmungkur', 'Gayamsari', 'Genuk', 'Gunungpati', 'Mijen', 'Ngaliyan', 'Pedurungan', 'Semarang Barat', 'Semarang Selatan', 'Semarang Tengah', 'Semarang Timur', 'Semarang Utara', 'Tembalang', 'Tugu'] },
      { name: 'Kota Surakarta', type: 'Kota', districts: ['Banjarsari', 'Jebres', 'Laweyan', 'Pasar Kliwon', 'Serengan'] },
      { name: 'Kota Tegal', type: 'Kota', districts: ['Margadana', 'Tegal Barat', 'Tegal Selatan', 'Tegal Timur'] },
    ]
  },
  {
    name: 'DI Yogyakarta',
    cities: [
      { name: 'Kab. Bantul', type: 'Kabupaten', districts: ['Bambanglipuro', 'Banguntapan', 'Bantul', 'Dlingo', 'Imogiri', 'Jetis', 'Kasihan', 'Kretek', 'Pajangan', 'Pandak', 'Piyungan', 'Pleret', 'Pundong', 'Sanden', 'Sedayu', 'Sewon', 'Srandakan'] },
      { name: 'Kab. Gunungkidul', type: 'Kabupaten', districts: ['Gedangsari', 'Girisubo', 'Karangmojo', 'Ngawen', 'Nglipar', 'Paliyan', 'Panggang', 'Patuk', 'Playen', 'Ponjong', 'Purwosari', 'Rongkop', 'Saptosari', 'Semanu', 'Semin', 'Tanjungsari', 'Tepus', 'Wonosari'] },
      { name: 'Kab. Kulon Progo', type: 'Kabupaten', districts: ['Galur', 'Girimulyo', 'Kalibawang', 'Kokap', 'Lendah', 'Nanggulan', 'Panjatan', 'Pengasih', 'Samigaluh', 'Sentolo', 'Temon', 'Wates'] },
      { name: 'Kab. Sleman', type: 'Kabupaten', districts: ['Berbah', 'Cangkringan', 'Depok', 'Gamping', 'Godean', 'Kalasan', 'Minggir', ' Mlati', 'Moyudan', 'Ngaglik', 'Ngemplak', 'Pakem', 'Prambanan', 'Seyegan', 'Sleman', 'Tempel', 'Turi'] },
      { name: 'Kota Yogyakarta', type: 'Kota', districts: ['Danurejan', 'Gedongtengen', 'Gondokusuman', 'Gondomanan', 'Jetis', 'Kotagede', 'Kraton', 'Mantrijeron', 'Mergangsan', 'Ngampilan', 'Pakualaman', 'Tegalrejo', 'Umbulharjo', 'Wirobrajan'] },
    ]
  },
  {
    name: 'Jawa Timur',
    cities: [
      { name: 'Kab. Bangkalan', type: 'Kabupaten', districts: ['Arosbaya', 'Bangkalan', 'Blega', 'Burneh', 'Galis', 'Geger', 'Kamal', 'Klampis', 'Kokop', 'Konang', 'Kwanyar', 'Labang', 'Modung', 'Sepulu', 'Socah', 'Tanah Merah', 'Tanjungbumi', 'Tragah'] },
      { name: 'Kab. Banyuwangi', type: 'Kabupaten', districts: ['Bangorejo', 'Banyuwangi', 'Cluring', 'Gambiran', 'Genteng', 'Giri', 'Glagah', 'Glenmore', 'Kabat', 'Kalibaru', 'Kalipuro', 'Licin', 'Muncar', 'Pesanggaran', 'Purwoharjo', 'Rogojampi', 'Sempu', 'Siliragung', 'Singojuruh', 'Songgon', 'Srono', 'Tegaldlimo', 'Tegalsari', 'Wongsorejo'] },
      { name: 'Kab. Blitar', type: 'Kabupaten', districts: ['Bakung', 'Binangun', 'Doko', 'Gandusari', 'Garung', 'Kademangan', 'Kanigoro', 'Kesamben', 'Nglegok', 'Panggungrejo', 'Ponggok', 'Sanankulon', 'Selopuro', 'Selorejo', 'Srengat', 'Sutojayan', 'Talun', 'Udanawu', 'Wates', 'Wlingi', 'Wonodadi', 'Wonotirto'] },
      { name: 'Kab. Bojonegoro', type: 'Kabupaten', districts: ['Balen', 'Baureno', 'Bojonegoro', 'Bubulan', 'Dander', 'Gayam', 'Gondang', 'Kalitidu', 'Kanor', 'Kapas', 'Kasiman', 'Kedewan', 'Kedungadem', 'Kepohbaru', 'Malo', 'Margomulyo', 'Ngambon', 'Ngasem', 'Ngraho', 'Padangan', 'Purwosari', 'Sekar', 'Sugihwaras', 'Sukosewu', 'Sumberrejo', 'Tambakrejo', 'Temayang', 'Trucuk'] },
      { name: 'Kab. Bondowoso', type: 'Kabupaten', districts: ['Binakal', 'Bondowoso', 'Botolinggo', 'Cermee', 'Curahdami', 'Grujugan', 'Jambesari', 'Klabang', 'Maesan', 'Pakem', 'Prajekan', 'Pujer', 'Sempol', 'Sukosari', 'Sumberwringin', 'Taman Krocok', 'Tamanan', 'Tapen', 'Tegalampel', 'Tenggarang', 'Tlogosari', 'Wonosari', 'Wringin'] },
      { name: 'Kab. Gresik', type: 'Kabupaten', districts: ['Balongpanggang', 'Benjeng', 'Bungah', 'Cerme', 'Driyorejo', 'Duduk Sampeyan', 'Dukun', 'Gresik', 'Kebomas', 'Kedamean', 'Manyar', 'Menganti', 'Panceng', 'Sangkapura', 'Sidayu', 'Tambak', 'Ujung Pangkah', 'Wringinanom'] },
      { name: 'Kab. Jember', type: 'Kabupaten', districts: ['Ajung', 'Ambulu', 'Arjasa', 'Balung', 'Bangsalsari', 'Gumukmas', 'Jelbuk', 'Jenggawah', 'Jombang', 'Kalisat', 'Kaliwates', 'Kencong', 'Ledokombo', 'Mayang', 'Mumbulsari', 'Pakusari', 'Panti', 'Patrang', 'Puger', 'Rambipuji', 'Semboro', 'Silo', 'Sukorambi', 'Sukowono', 'Sumberbaru', 'Sumberjambe', 'Sumbersari', 'Tanggul', 'Tempurejo', 'Umbulsari', 'Wuluhan'] },
      { name: 'Kab. Jombang', type: 'Kabupaten', districts: ['Bandarkedungmulyo', 'Bareng', 'Diwek', 'Gudo', 'Jogoroto', 'Jombang', 'Kabuh', 'Kesamben', 'Kudu', 'Megaluh', 'Mojoagung', 'Mojowarno', 'Ngoro', 'Ngusikan', 'Perak', 'Peterongan', 'Plandaan', 'Ploso', 'Sumobito', 'Tembelang', 'Wonosalam'] },
      { name: 'Kab. Kediri', type: 'Kabupaten', districts: ['Badas', 'Banyakan', 'Gampengrejo', 'Grogol', 'Gurah', 'Kandangan', 'Kandat', 'Kayen Kidul', 'Kepung', 'Kras', 'Kunjang', 'Mojo', 'Ngadiluwih', 'Ngancar', 'Pagu', 'Papar', 'Pare', 'Plemahan', 'Plosoklaten', 'Puncu', 'Purwoasri', 'Ringinrejo', 'Semen', 'Tarokan', 'Wates'] },
      { name: 'Kab. Lamongan', type: 'Kabupaten', districts: ['Babat', 'Bluluk', 'Brondong', 'Deket', 'Glagah', 'Kalitengah', 'Karangbinangun', 'Karanggeneng', 'Kedungpring', 'Kembangbahu', 'Lamongan', 'Laren', 'Maduran', 'Mantup', 'Modo', 'Ngimbang', 'Paciran', 'Pucuk', 'Sambeng', 'Sarirejo', 'Sekaran', 'Solokuro', 'Sugio', 'Sukodadi', 'Sukorame', 'Tikung', 'Turi'] },
      { name: 'Kab. Lumajang', type: 'Kabupaten', districts: ['Candipuro', 'Gucialit', 'Jatiroto', 'Kedungjajang', 'Klakah', 'Kunir', 'Lumajang', 'Padang', 'Pasirian', 'Pasrujambe', 'Pronojiwo', 'Randuagung', 'Ranuyoso', 'Rowokangkung', 'Senduro', 'Sukodono', 'Sumbersuko', 'Tekung', 'Tempeh', 'Tempursari', 'Yosowilangun'] },
      { name: 'Kab. Madiun', type: 'Kabupaten', districts: ['Balerejo', 'Dagangan', 'Dolopo', 'Geger', 'Gemarang', 'Jiwan', 'Kare', 'Kebonsari', 'Madiun', 'Mejayan', 'Pilangkenceng', 'Saradan', 'Sawahan', 'Wonoasri', 'Wungu'] },
      { name: 'Kab. Magetan', type: 'Kabupaten', districts: ['Barat', 'Bendo', 'Karangrejo', 'Karas', 'Kartoharjo', 'Kawedanan', 'Lembeyan', 'Magetan', 'Maospati', 'Ngariboyo', 'Nguntoronadi', 'Panekan', 'Parang', 'Plaosan', 'Poncol', 'Sidorejo', 'Sukomoro', 'Takeran'] },
      { name: 'Kab. Malang', type: 'Kabupaten', districts: ['Ampelgading', 'Bantur', 'Bululawang', 'Dampit', 'Dau', 'Donomulyo', 'Gedangan', 'Gondanglegi', 'Jabung', 'Kalipare', 'Karangploso', 'Kasembon', 'Kepanjen', 'Kromengan', 'Lawang', 'Ngajum', 'Ngantang', 'Pagak', 'Pagelaran', 'Pakis', 'Pakisaji', 'Poncokusumo', 'Pujon', 'Singosari', 'Sumbermanjing Wetan', 'Sumberpucung', 'Tajinan', 'Tirtoyudo', 'Tumpang', 'Turen', 'Wagir', 'Wajak', 'Wonosari'] },
      { name: 'Kab. Mojokerto', type: 'Kabupaten', districts: ['Bangsal', 'Dawarblandong', 'Dlanggu', 'Gedeg', 'Gondang', 'Jatirejo', 'Jetis', 'Kemlagi', 'Kutorejo', 'Mojoanyar', 'Mojosari', 'Ngoro', 'Pacet', 'Pungging', 'Puri', 'Sooko', 'Trawas', 'Trowulan'] },
      { name: 'Kab. Nganjuk', type: 'Kabupaten', districts: ['Bagor', 'Baron', 'Berbek', 'Gondang', 'Jatikalen', 'Kertosono', 'Lengkong', 'Loceret', 'Nganjuk', 'Ngetos', 'Ngluyu', 'Ngronggot', 'Pace', 'Patianrowo', 'Prambon', 'Rejoso', 'Sawahan', 'Sukomoro', 'Tanjunganom', 'Wilangan'] },
      { name: 'Kab. Ngawi', type: 'Kabupaten', districts: ['Bringin', 'Geneng', 'Gerih', 'Jogorogo', 'Karanganyar', 'Karangjati', 'Kasreman', 'Kedunggalar', 'Kendal', 'Kwadungan', 'Mantingan', 'Ngawi', 'Ngrambe', 'Padas', 'Pangkur', 'Paron', 'Pitu', 'Sine', 'Widodaren'] },
      { name: 'Kab. Pacitan', type: 'Kabupaten', districts: ['Arjosari', 'Bandar', 'Donorojo', 'Kebonagung', 'Nawangan', 'Ngadirojo', 'Pacitan', 'Pringkuku', 'Punung', 'Sudimoro', 'Tegalombo', 'Tulakan'] },
      { name: 'Kab. Pamekasan', type: 'Kabupaten', districts: ['Batumarmar', 'Galis', 'Kadur', 'Larangan', 'Pademawu', 'Pakong', 'Palengaan', 'Pamekasan', 'Pasean', 'Pegantenan', 'Proppo', 'Tlanakan', 'Waru'] },
      { name: 'Kab. Pasuruan', type: 'Kabupaten', districts: ['Bangil', 'Beji', 'Gempol', 'Gondangwetan', 'Grati', 'Kejayan', 'Kraton', 'Lekok', 'Lumbang', 'Nguling', 'Pandaan', 'Pasrepan', 'Pohjentrek', 'Prigen', 'Purwodadi', 'Purwosari', 'Puspo', 'Rejoso', 'Rembang', 'Sukorejo', 'Tosari', 'Tutur', 'Winongan', 'Wonorejo'] },
      { name: 'Kab. Ponorogo', type: 'Kabupaten', districts: ['Babadan', 'Badegan', 'Balong', 'Bungkal', 'Jambon', 'Jenangan', 'Jetis', 'Kauman', 'Mlarak', 'Ngebel', 'Ngrayun', 'Ponorogo', 'Pudak', 'Pulung', 'Sambit', 'Sampung', 'Sawoo', 'Siman', 'Slahung', 'Sooko', 'Sukorejo'] },
      { name: 'Kab. Probolinggo', type: 'Kabupaten', districts: ['Bantaran', 'Banyuanyar', 'Besuk', 'Dringu', 'Gading', 'Gending', 'Kotaanyar', 'Kraksaan', 'Krejengan', 'Krucil', 'Kuripan', 'Leces', 'Lumbang', 'Maron', 'Paiton', 'Pajarakan', 'Pakuniran', 'Sukapura', 'Sumber', 'Sumberasih', 'Tegalsiwalan', 'Tiris', 'Tongas', 'Wonomerto'] },
      { name: 'Kab. Sampang', type: 'Kabupaten', districts: ['Banyuates', 'Camplong', 'Jrengik', 'Karangpenang', 'Kedungdung', 'Ketapang', 'Omben', 'Robatal', 'Sampang', 'Sokobanah', 'Sreseh', 'Tambelangan', 'Torjun'] },
      { name: 'Kab. Sidoarjo', type: 'Kabupaten', districts: ['Balongbendo', 'Buduran', 'Candi', 'Gedangan', 'Jabon', 'Krembung', 'Krian', 'Porong', 'Prambon', 'Sedati', 'Sidoarjo', 'Sukodono', 'Taman', 'Tanggulangin', 'Tarik', 'Tulangan', 'Waru', 'Wonoayu'] },
      { name: 'Kab. Situbondo', type: 'Kabupaten', districts: ['Arjasa', 'Asembagus', 'Banyuglugur', 'Banyuputih', 'Besuki', 'Bungatan', 'Jangkar', 'Jatibanteng', 'Kapongan', 'Kendit', 'Mangaran', 'Mlandingan', 'Panarukan', 'Panji', 'Situbondo', 'Suboh', 'Sumbermalang'] },
      { name: 'Kab. Sumenep', type: 'Kabupaten', districts: ['Ambunten', 'Arjasa', 'Batang Batang', 'Batuan', 'Batuputih', 'Bluto', 'Dasuk', 'Dungkek', 'Ganding', 'Gapura', 'Gayam', 'Gili Ginting', 'Guluk-Guluk', 'Kalianget', 'Kangayan', 'Kota Sumenep', 'Lenteng', 'Manding', 'Masalembu', 'Nonggunong', 'Pasongsongan', 'Pragaan', 'Raas', 'Rubaru', 'Sapeken', 'Saronggi', 'Talango'] },
      { name: 'Kab. Trenggalek', type: 'Kabupaten', districts: ['Bendungan', 'Dongko', 'Durenan', 'Gandusari', 'Kampak', 'Karangan', 'Munjungan', 'Panggul', 'Pogalan', 'Pule', 'Suruh', 'Trenggalek', 'Tugu', 'Watulimo'] },
      { name: 'Kab. Tuban', type: 'Kabupaten', districts: ['Bancar', 'Bangilan', 'Grabagan', 'Jatirogo', 'Jenu', 'Kenduruan', 'Kerek', 'Merakurak', 'Montong', 'Palang', 'Parengan', 'Plumpang', 'Rengel', 'Semanding', 'Senori', 'Singgahan', 'Soko', 'Tambakboyo', 'Tuban', 'Widang'] },
      { name: 'Kab. Tulungagung', type: 'Kabupaten', districts: ['Bandung', 'Besuki', 'Boyolangu', 'Campurdarat', 'Gondang', 'Kalidawir', 'Karangrejo', 'Kauman', 'Kedungwaru', 'Ngantru', 'Ngunut', 'Pagerwojo', 'Pakel', 'Pucanglaban', 'Rejotangan', 'Sendang', 'Sumbergempol', 'Tanggunggunung', 'Tulungagung'] },
      { name: 'Kota Batu', type: 'Kota', districts: ['Batu', 'Bumiaji', 'Junrejo'] },
      { name: 'Kota Blitar', type: 'Kota', districts: ['Kepanjenkidul', 'Sananwetan', 'Sukorejo'] },
      { name: 'Kota Kediri', type: 'Kota', districts: ['Kediri', 'Mojoroto', 'Pesantren'] },
      { name: 'Kota Madiun', type: 'Kota', districts: ['Kartoharjo', 'Manguharjo', 'Taman'] },
      { name: 'Kota Malang', type: 'Kota', districts: ['Blimbing', 'Kedungkandang', 'Klojen', 'Lowokwaru', 'Sukun'] },
      { name: 'Kota Mojokerto', type: 'Kota', districts: ['Kranggan', 'Magersari', 'Prajuritkulon'] },
      { name: 'Kota Pasuruan', type: 'Kota', districts: ['Bugul Kidul', 'Gadingrejo', 'Panggungrejo', 'Purworejo'] },
      { name: 'Kota Probolinggo', type: 'Kota', districts: ['Kademangan', 'Kanigaran', 'Kedopok', 'Mayangan', 'Wonoasih'] },
      { name: 'Kota Surabaya', type: 'Kota', districts: ['Asemrowo', 'Benowo', 'Bubutan', 'Bulak', 'Dukuh Pakis', 'Gayungan', 'Genteng', 'Gubeng', 'Gunung Anyar', 'Jambangan', 'Karangpilang', 'Kenjeran', 'Krembangan', 'Lakarsantri', 'Mulyorejo', 'Pabean Cantian', 'Pakal', 'Rungkut', 'Sambikerep', 'Sawahan', 'Semampir', 'Simokerto', 'Sukolilo', 'Sukomanunggal', 'Tambaksari', 'Tandes', 'Tegalsari', 'Tenggilis Mejoyo', 'Wiyung', 'Wonocolo', 'Wonokromo'] },
    ]
  },
  {
    name: 'Banten',
    cities: [
      { name: 'Kab. Lebak', type: 'Kabupaten', districts: ['Banjarsari', 'Bayah', 'Bojongmanik', 'Cibadak', 'Cibeber', 'Cigemblong', 'Cihara', 'Cijaku', 'Cikulur', 'Cileles', 'Cilograng', 'Cimarga', 'Cipanas', 'Cirinten', 'Curugbitung', 'Gunungkencana', 'Kalanganyar', 'Lebakgedong', 'Leuwidamar', 'Maja', 'Malingping', 'Muncang', 'Panggarangan', 'Rangkasbitung', 'Sajira', 'Sobang', 'Wanasalam', 'Warunggunung'] },
      { name: 'Kab. Pandeglang', type: 'Kabupaten', districts: ['Angsana', 'Banjar', 'Bojong', 'Cadasari', 'Carita', 'Cibaliung', 'Cibitung', 'Cigeulis', 'Cikedal', 'Cikeusik', 'Cimanggu', 'Cimanuk', 'Cipeucang', 'Cisata', 'Jiput', 'Kaduhejo', 'Karangtanjung', 'Koroncong', 'Labuan', 'Majasari', 'Mandalawangi', 'Mekarjaya', 'Menes', 'Munjul', 'Pagelaran', 'Pandeglang', 'Panimbang', 'Patia', 'Picung', 'Pulosari', 'Saketi', 'Sindangresmi', 'Sobang', 'Sukaresmi', 'Sumur'] },
      { name: 'Kab. Serang', type: 'Kabupaten', districts: ['Anyar', 'Bandung', 'Baros', 'Binuang', 'Bojonegara', 'Carenang', 'Cikande', 'Cikeusal', 'Cinangka', 'Ciomas', 'Ciruas', 'Gunungsari', 'Jawilan', 'Kibin', 'Kopo', 'Kragilan', 'Kramatwatu', 'Lebak Wangi', 'Mancak', 'Pabuaran', 'Padarincang', 'Pamarayan', 'Petir', 'Pontang', 'Pulo Ampel', 'Tanara', 'Tirtayasa', 'Tunjung Teja', 'Waringinkurung'] },
      { name: 'Kab. Tangerang', type: 'Kabupaten', districts: ['Balaraja', 'Cikupa', 'Cisauk', 'Cisoka', 'Curug', 'Gunung Kaler', 'Jambe', 'Jayanti', 'Kelapa Dua', 'Kemiri', 'Kosambi', 'Kresek', 'Kronjo', 'Legok', 'Mauk', 'Mekar Baru', 'Pagedangan', 'Pakuhaji', 'Panongan', 'Pasarkemis', 'Rajeg', 'Sepatan', 'Sepatan Timur', 'Sindang Jaya', 'Solear', 'Sukadiri', 'Sukamulya', 'Teluknaga', 'Tigaraksa'] },
      { name: 'Kota Cilegon', type: 'Kota', districts: ['Cibeber', 'Cilegon', 'Citangkil', 'Ciwandan', 'Gerogol', 'Jombang', 'Pulomerak', 'Purwakarta'] },
      { name: 'Kota Serang', type: 'Kota', districts: ['Cipocok Jaya', 'Curug', 'Kasemen', 'Serang', 'Taktakan', 'Walantaka'] },
      { name: 'Kota Tangerang', type: 'Kota', districts: ['Batuceper', 'Benda', 'Cibodas', 'Ciledug', 'Cipondoh', 'Jatiuwung', 'Karang Tengah', 'Karawaci', 'Larangan', 'Neglasari', 'Periuk', 'Pinang', 'Tangerang'] },
      { name: 'Kota Tangerang Selatan', type: 'Kota', districts: ['Ciputat', 'Ciputat Timur', 'Pamulang', 'Pondok Aren', 'Serpong', 'Serpong Utara', 'Setu'] },
    ]
  },
  {
    name: 'Bali',
    cities: [
      { name: 'Kab. Badung', type: 'Kabupaten', districts: ['Abiansemal', 'Kuta', 'Kuta Selatan', 'Kuta Utara', 'Mengwi', 'Petang'] },
      { name: 'Kab. Bangli', type: 'Kabupaten', districts: ['Bangli', 'Kintamani', 'Susut', 'Tembuku'] },
      { name: 'Kab. Buleleng', type: 'Kabupaten', districts: ['Banjar', 'Buleleng', 'Busungbiu', 'Gerokgak', 'Kubutambahan', 'Sawan', 'Seririt', 'Sukasada', 'Tejakula'] },
      { name: 'Kab. Gianyar', type: 'Kabupaten', districts: ['Blahbatuh', 'Gianyar', 'Payangan', 'Sukawati', 'Tampaksiring', 'Tegallalang', 'Ubud'] },
      { name: 'Kab. Jembrana', type: 'Kabupaten', districts: ['Jembrana', 'Melaya', 'Mendoyo', 'Negara', 'Pekutatan'] },
      { name: 'Kab. Karangasem', type: 'Kabupaten', districts: ['Abang', 'Bebandem', 'Karangasem', 'Kubu', 'Manggis', 'Rendang', 'Selat', 'Sidemen'] },
      { name: 'Kab. Klungkung', type: 'Kabupaten', districts: ['Banjarangkan', 'Dawan', 'Klungkung', 'Nusa Penida'] },
      { name: 'Kab. Tabanan', type: 'Kabupaten', districts: ['Baturiti', 'Kediri', 'Kerambitan', 'Marga', 'Penebel', 'Pupuan', 'Selemadeg', 'Selemadeg Barat', 'Selemadeg Timur', 'Tabanan'] },
      { name: 'Kota Denpasar', type: 'Kota', districts: ['Denpasar Barat', 'Denpasar Selatan', 'Denpasar Timur', 'Denpasar Utara'] },
    ]
  },
];

// Helper: get provinces list
export function getProvinces(): string[] {
  return INDONESIA_LOCATIONS.map(p => p.name);
}

// Helper: get cities for a province
export function getCities(provinceName: string): City[] {
  const province = INDONESIA_LOCATIONS.find(p => p.name === provinceName);
  return province ? province.cities : [];
}

// Helper: get districts for a city in a province
export function getDistricts(provinceName: string, cityName: string): string[] {
  const province = INDONESIA_LOCATIONS.find(p => p.name === provinceName);
  if (!province) return [];
  const city = province.cities.find(c => c.name === cityName);
  return city ? city.districts : [];
}
