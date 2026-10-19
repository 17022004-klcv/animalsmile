import InvertedNavbar from "@/src/components/navigation/InvertedNavbar";
export default function ClientesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#7CA6C2] flex flex-col">
      {/* Navbar pegado al top  #ED019F, #727EFF, #FA5780, #666DF3 y #7CA6C2*/}
      <InvertedNavbar />

      {/* Contenido dinámico de las páginas de clientes */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
