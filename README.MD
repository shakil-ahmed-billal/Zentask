# Zentask: Modern Project Management System

Zentask is a high-performance, full-stack project management application designed for teams to manage projects, tasks, and members with ease. It features a robust role-based access control (RBAC) system for Leaders and Members, real-time analytics, and advanced project filtering.

---

## 🚀 Features

### **Authentication & Profile**

- **Google OAuth 2.0 Integration**: Secure login and registration using Google.
- **Email & Password**: Standard authentication powered by `better-auth`.
- **Password Reset**: Automated password recovery flow using Gmail SMTP.
- **Profile Management**: Update user information and change passwords securely.
- **Role-Based Access**: Specialized dashboards and permissions for **Leaders** and **Members**.

### **Project Management**

- **Dynamic Project Creation**: Create projects with titles, descriptions, and banner images.
- **Cloudinary Integration**: High-performance image storage for project banners.
- **Advanced Filtering**: Filter projects by Title (Search), Status (Pending, In Progress, Delivered, Cancelled), Date Range, Month, and Year.
- **Live Status Updates**: Update project statuses directly from the list view or details page.
- **Financial Tracking**: Track project progress and delivery values.

### **Task Management**

- **Task Allocation**: Leaders can assign tasks to members within specific projects.
- **Task Tracking**: Monitor task statuses (Pending, In Progress, Completed) and priorities.

### **Analytics & Dashboard**

- **Leader Dashboard**: Overview of total projects, total delivery value, and member performance.
- **Member Dashboard**: Personalized view of assigned projects, pending tasks, and personal stats.

---

## 🛠 Tech Stack

### **Frontend**

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS
- **Auth Client**: `better-auth/react`
- **Component Library**: Radix UI / Shadcn UI inspired components
- **State & API**: Axios with global interceptors for auth stability

### **Backend**

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [better-auth](https://www.better-auth.com/)
- **File Upload**: Multer + Cloudinary SDK
- **Email**: Nodemailer (Gmail SMTP)

---

## ⚙️ Environment Variables

### **Backend (.env)**

```env
DATABASE_URL="your_postgresql_url"
PORT=8000
JWT_SECRET="your_secret"

# Better Auth
BETTER_AUTH_SECRET="your_better_auth_secret"
BETTER_AUTH_URL="http://localhost:8000/api/auth"
APP_URL="http://localhost:3000"
FRONTEND_ORIGIN="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASSWORD="your_app_password"
```

### **Frontend (.env.local)**

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:8000/api"
NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
```

---

## 💻 Local Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/zentask.git
   cd zentask
   ```

2. **Backend Setup**

   ```bash
   cd backend
   pnpm install
   # Configure .env
   pnpm prisma generate
   pnpm prisma migrate dev
   pnpm dev
   ```

3. **Frontend Setup**

   ```bash
   cd ../frontend
   pnpm install
   # Configure .env.local
   pnpm dev
   ```

4. **Access the app**
   Open `http://localhost:3000` in your browser.

---

## 🧪 Production Deployment (Vercel)

When deploying to Vercel, ensure you update the following:

- **Authorized Redirect URIs** in Google Cloud Console: `https://your-api-url.vercel.app/api/auth/callback/google`
- **Authorized JavaScript Origins**: `https://your-frontend-url.vercel.app`
- **Frontend Variable**: `NEXT_PUBLIC_BACKEND_URL` must point to your live API.
- **Backend Variable**: `BETTER_AUTH_URL` must point to your live API `/api/auth` endpoint.

---

## 📄 License

This project is licensed under the ISC License.
