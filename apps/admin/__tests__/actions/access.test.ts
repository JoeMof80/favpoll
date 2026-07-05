// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const mockClerk = vi.hoisted(() => ({
  auth: vi.fn(),
  getUserList: vi.fn(),
  updateUserMetadata: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mockClerk.auth,
  clerkClient: async () => ({
    users: {
      getUserList: mockClerk.getUserList,
      updateUserMetadata: mockClerk.updateUserMetadata,
    },
  }),
}));

import { getUsers, setAdminRole } from "@/lib/actions/access";

beforeEach(() => {
  vi.clearAllMocks();
  mockClerk.auth.mockResolvedValue({ userId: "user_me" });
});

const clerkUser = (overrides: Record<string, unknown> = {}) => ({
  id: "user_1",
  firstName: "Joseph",
  lastName: "Moffatt",
  username: null,
  imageUrl: "https://img.example/1",
  primaryEmailAddress: { emailAddress: "joe@example.com" },
  emailAddresses: [{ emailAddress: "joe@example.com" }],
  publicMetadata: { role: "admin" },
  createdAt: 1750000000000,
  ...overrides,
});

describe("getUsers", () => {
  it("maps Clerk users to access rows", async () => {
    mockClerk.getUserList.mockResolvedValue({
      data: [
        clerkUser(),
        clerkUser({
          id: "user_2",
          firstName: null,
          lastName: null,
          username: "guest99",
          publicMetadata: {},
          primaryEmailAddress: null,
          emailAddresses: [{ emailAddress: "g@example.com" }],
        }),
      ],
    });

    const { data, error } = await getUsers();

    expect(error).toBeNull();
    expect(data![0]).toMatchObject({
      id: "user_1",
      name: "Joseph Moffatt",
      email: "joe@example.com",
      isAdmin: true,
    });
    expect(data![1]).toMatchObject({
      name: "guest99",
      email: "g@example.com",
      isAdmin: false,
    });
  });

  it("returns error when Clerk fails", async () => {
    mockClerk.getUserList.mockRejectedValue(new Error("clerk down"));
    const { data, error } = await getUsers();
    expect(data).toBeNull();
    expect(error).toBe("clerk down");
  });
});

describe("setAdminRole", () => {
  it("grants the admin role", async () => {
    mockClerk.updateUserMetadata.mockResolvedValue({});

    const { error } = await setAdminRole("user_2", true);

    expect(error).toBeNull();
    expect(mockClerk.updateUserMetadata).toHaveBeenCalledWith("user_2", {
      publicMetadata: { role: "admin" },
    });
  });

  it("revokes with role null", async () => {
    mockClerk.updateUserMetadata.mockResolvedValue({});

    const { error } = await setAdminRole("user_2", false);

    expect(error).toBeNull();
    expect(mockClerk.updateUserMetadata).toHaveBeenCalledWith("user_2", {
      publicMetadata: { role: null },
    });
  });

  it("refuses to revoke your own admin access", async () => {
    const { error } = await setAdminRole("user_me", false);

    expect(error).toBe("You can't remove your own admin access.");
    expect(mockClerk.updateUserMetadata).not.toHaveBeenCalled();
  });

  it("allows re-granting yourself (no-op guard only blocks revoke)", async () => {
    mockClerk.updateUserMetadata.mockResolvedValue({});
    const { error } = await setAdminRole("user_me", true);
    expect(error).toBeNull();
  });

  it("errors when unauthenticated", async () => {
    mockClerk.auth.mockResolvedValue({ userId: null });
    const { error } = await setAdminRole("user_2", true);
    expect(error).toBe("Not authenticated");
  });
});
