import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
  basePath: "/api/auth",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.FRONTEND_ORIGIN as string],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async (data, request) => {
      // In a real application, you would use an email service like Resend or Nodemailer
      console.log();
      console.log("==========================================");
      console.log(`🔐 PASSWORD RESET REQUEST`);
      console.log(`To: ${data.user.email}`);
      console.log(`Click this link to reset your password:`);
      console.log(`🔗 ${data.url}`);
      console.log("==========================================");
      console.log();
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "MEMBER",
      },
      leaderId: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
    disableCSRFCheck: true, // Allow requests without Origin header (Postman, mobile apps, etc.)
  },
});
