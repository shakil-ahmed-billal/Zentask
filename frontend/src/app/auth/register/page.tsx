"use client";

import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    role: z.enum(["LEADER", "MEMBER"]),
    leaderId: z.string().optional(),
  })
  .strict();

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues & { leaderId?: string }>({
    name: "",
    email: "",
    password: "",
    role: "MEMBER",
    leaderId: "",
  });
  const [leaders, setLeaders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLeaders() {
      try {
        const res = await api.get("/users/leaders");
        setLeaders(res.data.data ?? []);
      } catch (err) {
        console.error("Failed to fetch leaders", err);
      }
    }
    fetchLeaders();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const first = parsed.error.errors[0]?.message ?? "Invalid input";
      setError(first);
      return;
    }

    if (values.role === "MEMBER" && !values.leaderId) {
      setError("Please select a leader");
      return;
    }

    try {
      setLoading(true);
      // better-auth default sign-up endpoint
      await api.post("/auth/sign-up/email", {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        isVerified: false,
        leaderId: values.role === "MEMBER" ? values.leaderId : undefined,
      });
      toast.success("Account created. You can now sign in.");
      router.push("/auth/login");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to register";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose your role and start managing projects.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Name
          </label>
          <input
            id="name"
            name="name"
            value={values.name}
            onChange={handleChange}
            className={cn(
              "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            className={cn(
              "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            className={cn(
              "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          />
          <p className="text-xs text-muted-foreground">
            At least 8 characters, including upper, lower, and a number.
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium text-foreground">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={values.role}
            onChange={handleChange}
            className={cn(
              "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            <option value="LEADER">Leader</option>
            <option value="MEMBER">Member</option>
          </select>
        </div>
        {values.role === "MEMBER" && (
          <div className="space-y-2">
            <label
              htmlFor="leaderId"
              className="text-sm font-medium text-foreground"
            >
              Select Leader
            </label>
            <select
              id="leaderId"
              name="leaderId"
              value={values.leaderId}
              onChange={handleChange}
              className={cn(
                "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              <option value="">Select a leader</option>
              {leaders.map((leader) => (
                <option key={leader.id} value={leader.id}>
                  {leader.name} ({leader.email})
                </option>
              ))}
            </select>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
            "hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            loading && "opacity-70",
          )}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <a
          href="/auth/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </a>
      </p>
    </div>
  );
}
