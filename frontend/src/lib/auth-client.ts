import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    (typeof window !== "undefined" ? window.location.origin : ""),
  fetchOptions: {
    credentials: "include",
  },
});
