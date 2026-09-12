import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminChrome } from "./AdminChrome";

// Server-side gate for the whole admin area: no valid session, no admin. This
// is the real enforcement (proxy.ts only does a cheap cookie-presence check to
// avoid rendering). Reading the session cookie makes every admin route dynamic.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AdminChrome user={{ name: user.name, role: user.role }}>
      {children}
    </AdminChrome>
  );
}
