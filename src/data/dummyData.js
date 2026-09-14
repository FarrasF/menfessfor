/**
 * Dummy data for development and UI testing.
 *
 * Data structure is designed to match the future Supabase schema.
 * When integrating with Supabase, replace these arrays with
 * real-time queries from the database.
 */

export const CATEGORIES = ['Confess', 'Curhat', 'Akademik', 'Random'];

export const dummyMenfess = [
  {
    id: 1,
    content:
      'Deadline tugas minggu ini banyak banget, gua mulai bingung mau ngerjain yang mana dulu. Rasanya pengen clone diri sendiri biar bisa multitasking beneran.',
    category: 'Akademik',
    likes: 24,
    comments_count: 5,
    status: 'approved',
    created_at: '2026-09-14T10:30:00Z',
  },
  {
    id: 2,
    content:
      'Sebenernya gua diam-diam kagum sama temen sekelompok gua. Dia selalu ngerjain bagian paling susah tanpa ngeluh. Salut sih.',
    category: 'Confess',
    likes: 42,
    comments_count: 8,
    status: 'approved',
    created_at: '2026-09-14T09:15:00Z',
  },
  {
    id: 3,
    content:
      'Ada yang ngerasa juga gak sih, belajar coding tuh kadang bikin frustasi tapi begitu berhasil rasanya kayak menang lottery? Dopamine-nya beda.',
    category: 'Curhat',
    likes: 67,
    comments_count: 12,
    status: 'approved',
    created_at: '2026-09-13T22:00:00Z',
  },
  {
    id: 4,
    content:
      'Kantin lantai 2 underrated banget. Nasi gorengnya juara tapi sepi terus. Kalau rame ntar gua yang susah dapet tempat sih.',
    category: 'Random',
    likes: 31,
    comments_count: 4,
    status: 'approved',
    created_at: '2026-09-13T18:45:00Z',
  },
  {
    id: 5,
    content:
      'Gua mau jujur, gua masih belum paham konsep pointer di C. Udah semester 3 dan masih bingung. Ada yang bisa jelasin secara sederhana?',
    category: 'Akademik',
    likes: 55,
    comments_count: 15,
    status: 'approved',
    created_at: '2026-09-13T14:20:00Z',
  },
  {
    id: 6,
    content:
      'Makasih buat orang yang selalu share catatan di grup angkatan. Lo gak tau betapa berharganya itu buat kita yang suka ketinggalan materi.',
    category: 'Confess',
    likes: 89,
    comments_count: 7,
    status: 'approved',
    created_at: '2026-09-12T20:30:00Z',
  },
  {
    id: 7,
    content:
      'Kadang gua ngerasa imposter syndrome parah. Semua orang kayaknya jago coding, sedangkan gua masih struggle sama hal-hal basic.',
    category: 'Curhat',
    likes: 73,
    comments_count: 20,
    status: 'approved',
    created_at: '2026-09-12T16:00:00Z',
  },
  {
    id: 8,
    content:
      'WiFi kampus harusnya dikasih award "paling PHP" — pemberi harapan palsu. Sinyal full tapi loading mulu.',
    category: 'Random',
    likes: 102,
    comments_count: 11,
    status: 'approved',
    created_at: '2026-09-12T12:00:00Z',
  },
  {
    id: 9,
    content:
      'Gua baru sadar ternyata dosen pemrograman web kita itu punya channel YouTube yang isinya bagus banget. Kenapa baru tau sekarang ya.',
    category: 'Akademik',
    likes: 38,
    comments_count: 6,
    status: 'approved',
    created_at: '2026-09-11T21:15:00Z',
  },
  {
    id: 10,
    content:
      'Buat yang lagi baca ini pas jam 2 pagi sambil ngoding tugas: lo gak sendirian. Semangat, kita bisa!',
    category: 'Curhat',
    likes: 156,
    comments_count: 25,
    status: 'approved',
    created_at: '2026-09-11T02:00:00Z',
  },
];

export const dummyComments = [
  {
    id: 1,
    menfess_id: 1,
    content: 'Sama banget! Gua juga overwhelmed minggu ini. Semangat bro!',
    created_at: '2026-09-14T11:00:00Z',
  },
  {
    id: 2,
    menfess_id: 1,
    content: 'Coba bikin priority list, kerjain yang deadline paling deket dulu.',
    created_at: '2026-09-14T11:30:00Z',
  },
  {
    id: 3,
    menfess_id: 1,
    content: 'Gua udah pasrah sih, yang penting submit walau gak perfect.',
    created_at: '2026-09-14T12:00:00Z',
  },
  {
    id: 4,
    menfess_id: 3,
    content: 'Relatable banget! Bug yang udah 3 jam akhirnya fix, rasanya lega bukan main.',
    created_at: '2026-09-14T00:30:00Z',
  },
  {
    id: 5,
    menfess_id: 3,
    content: 'Dopamine dari coding berhasil >>> dopamine dari sosmed.',
    created_at: '2026-09-14T01:15:00Z',
  },
  {
    id: 6,
    menfess_id: 5,
    content: 'Coba bayangin pointer itu kayak alamat rumah. Variabel itu rumahnya, pointer itu kertas yang isinya alamat rumah.',
    created_at: '2026-09-13T15:00:00Z',
  },
  {
    id: 7,
    menfess_id: 5,
    content: 'Belajar dari visualisasi di YouTube banyak banget yang bagus. Coba channel CS50.',
    created_at: '2026-09-13T15:30:00Z',
  },
  {
    id: 8,
    menfess_id: 7,
    content: 'Lo gak sendirian. Imposter syndrome itu normal, apalagi di jurusan ini.',
    created_at: '2026-09-12T17:00:00Z',
  },
  {
    id: 9,
    menfess_id: 8,
    content: 'HAHAHA WiFi kampus emang legendaris.',
    created_at: '2026-09-12T13:00:00Z',
  },
  {
    id: 10,
    menfess_id: 10,
    content: 'Baca ini jam 3 pagi. Makasih, langsung semangat lagi 🔥',
    created_at: '2026-09-11T03:00:00Z',
  },
];

/**
 * Pending menfess for admin page preview.
 */
export const dummyPendingMenfess = [
  {
    id: 101,
    content: 'Ini menfess yang masih menunggu persetujuan admin.',
    category: 'Random',
    likes: 0,
    comments_count: 0,
    status: 'pending',
    created_at: '2026-09-14T20:00:00Z',
  },
  {
    id: 102,
    content: 'Menfess pending kedua untuk testing admin dashboard.',
    category: 'Curhat',
    likes: 0,
    comments_count: 0,
    status: 'pending',
    created_at: '2026-09-14T19:30:00Z',
  },
];
