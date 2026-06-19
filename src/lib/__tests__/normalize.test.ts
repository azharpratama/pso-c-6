import { normalizeMitraPayload, normalizeAdminPayload } from "../normalize";
import type { MitraPayload, AdminPayload } from "../types";

describe("normalizeMitraPayload", () => {
  it("trims strings and defaults is_aktif to true", () => {
    const payload: MitraPayload = {
      nama_instansi: "  Instansi A  ",
      alamat: "  Jalan B  ",
      kota: "  Kota C  ",
      keterangan: "  Ket D  ",
    };

    expect(normalizeMitraPayload(payload)).toEqual({
      nama_instansi: "Instansi A",
      alamat: "Jalan B",
      kota: "Kota C",
      keterangan: "Ket D",
      is_aktif: true,
    });
  });

  it("handles missing or undefined fields by returning null", () => {
    const payload: MitraPayload = {};

    expect(normalizeMitraPayload(payload)).toEqual({
      nama_instansi: null,
      alamat: null,
      kota: null,
      keterangan: null,
      is_aktif: true,
    });
  });

  it("preserves is_aktif if provided as false", () => {
    const payload: MitraPayload = {
      nama_instansi: "Instansi",
      is_aktif: false,
    };

    expect(normalizeMitraPayload(payload).is_aktif).toBe(false);
  });
});

describe("normalizeAdminPayload", () => {
  it("trims strings", () => {
    const payload: AdminPayload = {
      username: "  user123  ",
      email: "  test@test.com  ",
      password: "  pass123  ",
    };

    expect(normalizeAdminPayload(payload)).toEqual({
      username: "user123",
      email: "test@test.com",
      password: "pass123",
    });
  });

  it("handles missing fields by returning null", () => {
    const payload: AdminPayload = {};

    expect(normalizeAdminPayload(payload)).toEqual({
      username: null,
      email: null,
      password: null,
    });
  });
});
