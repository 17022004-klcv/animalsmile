import InvertedNavbar from "@/src/components/navigation/InvertedNavbar";
import Footer from "@/src/components/navigation/Footer";
import { SiteConfigSync } from "@/src/components/site/SiteConfigSync";

export default function ClientesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteConfigSync />
      <InvertedNavbar />

      {/* Sin max-w-7xl ni paddings laterales para que cada sección ocupe el 100% */}
      <main className="anim-fade-in flex-1 w-full">{children}</main>

      <Footer />
    </div>
  );
}
