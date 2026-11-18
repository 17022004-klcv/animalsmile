"use client";
import Sidebar from "@/src/components/navigation/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="anim-fade-in flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
