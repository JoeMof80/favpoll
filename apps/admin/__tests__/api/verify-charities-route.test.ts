// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin";

const mockVerify = vi.hoisted(() => vi.fn());
vi.mock("@/lib/charity-commission", () => ({
  verifyCharityNumber: mockVerify,
}));

let mock = makeSupabaseMock();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}));

import { GET } from "@/app/api/cron/verify-charities/route";

function makeRequest(authHeader?: string): Request {
  const headers = new Headers();
  if (authHeader !== undefined) headers.set("authorization", authHeader);
  return new Request("http://localhost/api/cron/verify-charities", {
    headers,
  });
}

beforeEach(() => {
  mock = makeSupabaseMock();
  mockVerify.mockReset();
  mockVerify.mockResolvedValue({
    status: "verified",
    registeredName: "AGE UK",
  });
  process.env.CRON_SECRET = "test-secret";
});

describe("GET /api/cron/verify-charities — auth", () => {
  it("returns 401 without the cron secret", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 401 with the wrong secret", async () => {
    const res = await GET(makeRequest("Bearer wrong"));
    expect(res.status).toBe(401);
  });
});

describe("GET /api/cron/verify-charities", () => {
  it("re-verifies stale charities and stores the result", async () => {
    mock.queue([
      { id: "charity-1", name: "Age UK", registered_number: "1128267" },
    ]); // stale select
    mock.queue(null); // update

    const res = await GET(makeRequest("Bearer test-secret"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ checked: 1 });
    expect(mockVerify).toHaveBeenCalledWith("1128267", "Age UK");
    const updateCall = mock
      .callsFor("charities")
      .find((c) => c.method === "update")!;
    expect(updateCall.args[0]).toMatchObject({
      verification_status: "verified",
      verified_name: "AGE UK",
      verified_at: expect.any(String),
    });
  });

  it("returns checked 0 when nothing is stale", async () => {
    mock.queue([]); // stale select

    const res = await GET(makeRequest("Bearer test-secret"));
    const body = await res.json();

    expect(body).toEqual({ checked: 0 });
    expect(mockVerify).not.toHaveBeenCalled();
  });

  it("returns 500 when the stale select fails", async () => {
    mock.queue(null, { message: "DB down" });

    const res = await GET(makeRequest("Bearer test-secret"));

    expect(res.status).toBe(500);
  });

  it("collects per-charity update errors without failing the batch", async () => {
    mock.queue([
      { id: "charity-1", name: "Age UK", registered_number: "1128267" },
      { id: "charity-2", name: "RNLI", registered_number: "209603" },
    ]);
    mock.queue(null, { message: "update failed" }); // charity-1 update
    mock.queue(null); // charity-2 update

    const res = await GET(makeRequest("Bearer test-secret"));
    const body = await res.json();

    expect(body.checked).toBe(1);
    expect(body.errors).toEqual(["charity-1: update failed"]);
  });
});
