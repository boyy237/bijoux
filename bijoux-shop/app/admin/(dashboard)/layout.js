import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/session";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminDashboardLayout({ children }) {
  const session = requireAdminSession();
  if (!session) redirect("/admin/connexion");

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="container">{children}</div>
      </div>

      <style>{`
        .admin-layout { display: flex; align-items: stretch; }
        .admin-content { flex: 1; padding: 32px 0; min-width: 0; }
        @media (max-width: 900px) {
          .admin-layout { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
