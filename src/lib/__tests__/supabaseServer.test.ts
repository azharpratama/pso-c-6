import { createSupabaseServerClient } from "../supabaseServer";
import { createClient } from "@supabase/supabase-js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

describe("createSupabaseServerClient", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    (createClient as jest.Mock).mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("throws error if missing both url and key", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => createSupabaseServerClient()).toThrow(
      "Supabase server configuration is missing. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  });

  it("throws error if missing url", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";

    expect(() => createSupabaseServerClient()).toThrow(
      "Supabase server configuration is missing"
    );
  });

  it("creates client successfully with service role key", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

    createSupabaseServerClient();

    expect(createClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "service-role-key",
      { auth: { persistSession: false } }
    );
  });

  it("creates client successfully with anon key when service role key is absent", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    createSupabaseServerClient();

    expect(createClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "anon-key",
      { auth: { persistSession: false } }
    );
  });
});
