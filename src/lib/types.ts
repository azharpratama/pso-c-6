// ===== Mitra (Partners) =====

export type Mitra = {
  id: string;
  nama_instansi: string | null;
  alamat: string | null;
  kota: string | null;
  keterangan: string | null;
  is_aktif: boolean | null;
  created_at: string | null;
};

export type MitraPayload = {
  nama_instansi?: string;
  alamat?: string;
  kota?: string;
  keterangan?: string;
  is_aktif?: boolean;
};

export type MitraFormData = {
  nama_instansi: string;
  alamat: string;
  kota: string;
  keterangan: string;
  is_aktif: boolean;
};

// ===== Admins =====

export type Admin = {
  id: string;
  username: string;
  email: string;
  created_at: string;
};

export type AdminPayload = {
  username?: string;
  email?: string;
  password?: string;
};

// ===== Dashboard =====

export type DashboardStats = {
  totalActive: number;
  totalPartners: number;
  newThisMonth: number;
  activeGrowth: number;
  newGrowth: number;
};

export type Activity = {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  icon: "add" | "edit" | "delete" | "download";
};

export type CityDistribution = {
  city: string;
  count: number;
};

export type MonthlyGrowth = {
  month: string;
  count: number;
};
