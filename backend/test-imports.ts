import app from "./src/app";
import config from "./src/app/config";
import { auth } from "./src/app/lib/auth";
import { prisma } from "./src/app/lib/prisma";

console.log("Auth:", !!auth);
console.log("Prisma:", !!prisma);
console.log("Config:", !!config);
console.log("App:", !!app);
console.log("All foundational imports successful!");
