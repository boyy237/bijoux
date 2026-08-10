"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ className = "btn btn-outline", label = "Se déconnecter" }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/client/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button className={className} onClick={handleLogout}>
      {label}
    </button>
  );
}
