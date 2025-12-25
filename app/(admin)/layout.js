import { redirect } from "next/navigation";
import { auth } from "@/auth"; // Depending on your setup, this might be "@/app/api/auth/[...nextauth]/route"
import AdminLayoutClient from "@/components/nav/AdminLayoutClient";

export default async function AdminLayout({ children }) {
  // 1. Get Session on Server
  const session = await auth();

  // 2. Strict Security Check
  if (!session) {
    return redirect("/login");
  }

  if (session.user?.role !== "admin") {
    // If they are logged in but not an admin, send them to homepage
    return redirect("/");
  }

  // 3. Render Client Shell
  return (
    <AdminLayoutClient user={session.user}>
      {children}
    </AdminLayoutClient>
  );
}