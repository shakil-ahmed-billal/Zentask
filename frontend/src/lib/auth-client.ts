import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  user: {
    additionalFields: {
      role: { type: "string" },
      leaderId: { type: "string" },
    },
  },
  plugins: [
    inferAdditionalFields({
      user: {
        additionalFields: {
          role: { type: "string" },
          leaderId: { type: "string" },
        },
      },
    } as any),
  ],
  fetchOptions: {
    credentials: "include",
  },
});
