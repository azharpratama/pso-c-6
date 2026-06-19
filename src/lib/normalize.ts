import type { MitraPayload, AdminPayload } from "./types";

export function normalizeMitraPayload(payload: MitraPayload) {
  return {
    nama_instansi: payload.nama_instansi?.trim() || null,
    alamat: payload.alamat?.trim() || null,
    kota: payload.kota?.trim() || null,
    keterangan: payload.keterangan?.trim() || null,
    is_aktif: payload.is_aktif ?? true,
  };
}

export function normalizeAdminPayload(payload: AdminPayload) {
  return {
    username: payload.username?.trim() || null,
    email: payload.email?.trim() || null,
    password: payload.password?.trim() || null,
  };
}
