import { redirect } from "next/navigation";
import { auth } from "@/auth";
import VendorLayoutClient from "@/components/nav/VendorLayoutClient"; // 👈 new file

export default async function VendorLayout({ children }) {
  const session = await auth();

  if (!session || session.user?.role !== "seller") {
    return redirect("/login");
  }

  // render client part separately
  return <VendorLayoutClient session={session}>{children}</VendorLayoutClient>;
;
}
