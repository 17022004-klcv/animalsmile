"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import {
  PawPrint,
  Heart,
  Home,
  DollarSign,
  Users,
  Shield,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Search,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  // Íconos para los submódulos
  FilePlus,
  FolderOpen,
  ClipboardList,
  Tags,
  UserPlus,
  FileCheck,
  FileText,
  Activity,
  Building2,
  Truck,
  Coins,
  Package,
  UserCheck,
  KeyRound,
  Database,
  Sliders,
  Globe,
  Stethoscope,
} from "lucide-react";

interface SubOption {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface MenuSection {
  title: string;
  icon: React.ElementType;
  items: SubOption[];
}

function conAlpha(hex: string, alpha: number): string {
  const limpio = hex.replace("#", "");
  const valor =
    limpio.length === 3
      ? limpio
          .split("")
          .map((c) => c + c)
          .join("")
      : limpio;
  const numero = parseInt(valor, 16);
  const r = (numero >> 16) & 255;
  const g = (numero >> 8) & 255;
  const b = numero & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const menuSections: MenuSection[] = [
  {
    title: "Gestión de Animales",
    icon: PawPrint,
    items: [
      { title: "Ingresos", href: "/admin/modules/Animals/Income", icon: FilePlus },
      {
        title: "Expedientes",
        href: "/admin/modules/Animals/Records",
        icon: FolderOpen,
      },
      {
        title: "Consultas",
        href: "/admin/modules/Animals/Inquiries",
        icon: Stethoscope,
      },
      {
        title: "Bitácora de rescates",
        href: "/admin/modules/Animals/Binnacle",
        icon: ClipboardList,
      },
      {
        title: "Clasificaciones",
        href: "/admin/modules/Animals/Classification",
        icon: Tags,
      },
    ],
  },
  {
    title: "Adopciones y Seguimiento",
    icon: Heart,
    items: [
      {
        title: "Registro de solicitantes",
        href: "/admin/modules/Adoption/Applicants",
        icon: UserPlus,
      },
      {
        title: "Solicitudes",
        href: "/admin/modules/Adoption/Applications",
        icon: FileCheck,
      },
      {
        title: "Contratos de Adopción",
        href: "/admin/modules/Adoption/Contracts",
        icon: FileText,
      },
      {
        title: "Control de seguimiento",
        href: "/admin/modules/Adoption/FollowUpControl",
        icon: Activity,
      },
    ],
  },
  {
    title: "Santuarios y Traslados",
    icon: Home,
    items: [
      {
        title: "Santuarios",
        href: "/admin/modules/Sanctuaries/Sanctuaries",
        icon: Building2,
      },
      {
        title: "Control de traslados",
        href: "/admin/modules/Sanctuaries/Transfers",
        icon: Truck,
      },
    ],
  },
  {
    title: "Gestión de Donaciones",
    icon: DollarSign,
    items: [
      {
        title: "Donaciones Financieras",
        href: "/admin/modules/Donations/FinancialDonations",
        icon: Coins,
      },
      {
        title: "Donaciones en Especie",
        href: "/admin/modules/Donations/InKindDonations",
        icon: Package,
      },
    ],
  },
  {
    title: "Gestión de Usuarios",
    icon: Users,
    items: [
      { title: "Usuarios", href: "/admin/modules/Users/Users", icon: UserCheck },
    ],
  },
  {
    title: "Seguridad",
    icon: Shield,
    items: [
      {
        title: "Accesos al sistema",
        href: "/admin/modules/Security/SystemAccess",
        icon: KeyRound,
      },
      {
        title: "Recuperación de datos (backups)",
        href: "/admin/modules/Security/BackUps",
        icon: Database,
      },
    ],
  },
  {
    title: "Configuración",
    icon: Settings,
    items: [
      {
        title: "Configuración del sistema",
        href: "/admin/modules/Config/SystemConfiguration",
        icon: Sliders,
      },
      {
        title: "Configuración del sitio web",
        href: "/admin/modules/Config/WebsiteConfiguration",
        icon: Globe,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { palette } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Gestión de Animales": true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [perfil, setPerfil] = useState<{
    nombre: string;
    apellido: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    let cancelado = false;

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelado || !data?.usuario) return;
        setPerfil({
          nombre: data.usuario.nombre,
          apellido: data.usuario.apellido,
          email: data.usuario.email,
        });
      })
      .catch(() => {
        if (!cancelado) setPerfil(null);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const nombreCompleto = perfil
    ? `${perfil.nombre} ${perfil.apellido}`.trim()
    : "Mi perfil";
  const iniciales = perfil
    ? `${perfil.nombre.charAt(0)}${perfil.apellido.charAt(0)}`.toUpperCase()
    : "U";

  const toggleSection = (title: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const filteredSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter(
      (section) =>
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.items.length > 0,
    );

  return (
    <>
      {/* Botón flotante para dispositivos móviles */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl text-white shadow-lg focus:outline-none"
        style={{ backgroundColor: palette.dark }}
        aria-label="Abrir menú"
      >
        {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Backdrop para móviles */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 transition-opacity"
        />
      )}

      {/* Sidebar Principal */}
      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-screen bg-white border-r border-slate-100 shadow-xl lg:shadow-none flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-72"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header / Branding + Botón Colapsar en línea */}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="/img/logo_animalsmile.png"
                alt="AnimalSmile Logo"
                className="w-9 h-9 object-contain shrink-0"
              />
              {!isCollapsed && (
                <div className="truncate">
                  <h1 className="font-bold text-sm text-slate-800 leading-tight truncate">
                    Animal
                    <span style={{ color: palette.primary }}>Smile</span>
                  </h1>
                  <p className="text-[11px] font-medium text-slate-400 truncate">
                    Refugio de Animales
                  </p>
                </div>
              )}
            </div>

            {/* Ícono de colapsar al lado del texto */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition shrink-0 hidden lg:flex items-center justify-center"
              title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            >
              {isCollapsed ? (
                <PanelLeftOpen size={19} style={{ color: palette.secondary }} />
              ) : (
                <PanelLeftClose
                  size={19}
                  className="text-slate-400 hover:text-[#ED019F]"
                />
              )}
            </button>
          </div>

          {/* Buscador de opciones (solo visible si no está colapsado) */}
          {!isCollapsed && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar sección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-200"
              />
            </div>
          )}
        </div>

        {/* Lista de Navegación */}
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          {filteredSections.map((section) => {
            const SectionIcon = section.icon;
            const isOpen = openSections[section.title] || searchTerm.length > 0;

            return (
              <div key={section.title} className="mb-1">
                {/* Botón Acordeón de Sección */}
                <button
                  onClick={() => toggleSection(section.title)}
                  title={isCollapsed ? section.title : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition group ${
                    isCollapsed ? "justify-center px-0" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <SectionIcon
                      size={18}
                      style={{ color: palette.secondary }}
                      className="shrink-0 transition-colors group-hover:scale-110"
                    />
                    {!isCollapsed && (
                      <span className="truncate">{section.title}</span>
                    )}
                  </div>
                  {!isCollapsed &&
                    (isOpen ? (
                      <ChevronDown
                        size={14}
                        className="text-slate-400 shrink-0"
                      />
                    ) : (
                      <ChevronRight
                        size={14}
                        className="text-slate-400 shrink-0"
                      />
                    ))}
                </button>

                {/* Subopciones desplegables */}
                {!isCollapsed && isOpen && (
                  <div className="ml-5 my-1 pl-2 border-l-2 border-slate-100 space-y-1">
                    {section.items.map((item) => {
                      const SubIcon = item.icon;
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={`group/item flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold transition-all ${
                            isActive
                              ? "font-semibold border-l-2"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                          }`}
                          style={
                            isActive
                              ? {
                                  backgroundColor: conAlpha(
                                    palette.primary,
                                    0.08,
                                  ),
                                  color: palette.primary,
                                  borderColor: palette.primary,
                                }
                              : undefined
                          }
                        >
                          {/* Ícono de submódulo con hover en el color principal */}
                          <SubIcon
                            size={15}
                            className={`shrink-0 transition-colors ${
                              isActive
                                ? "text-[var(--color-primary)]"
                                : "text-slate-400 group-hover/item:text-[var(--color-primary)]"
                            }`}
                          />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer / Perfil de Usuario */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div
            className={`flex items-center rounded-lg bg-white border border-slate-100 shadow-sm p-2 ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <Link
              href="/admin/profile"
              className="flex items-center gap-2.5 overflow-hidden min-w-0 text-left rounded-md transition hover:opacity-80"
              title="Ver mi perfil"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: palette.muted }}
              >
                {iniciales}
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-700 truncate">
                    {nombreCompleto}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {perfil?.email ?? "Ver datos de la cuenta"}
                  </p>
                </div>
              )}
            </Link>
            {!isCollapsed && (
              <button
                className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-md transition shrink-0"
                style={{ color: palette.accent }}
                title="Cerrar sesión"
                onClick={async () => {
                  try {
                    await fetch("/api/auth/logout", { method: "POST" });
                  } finally {
                    if (typeof window !== "undefined") {
                      window.location.assign("/login");
                    }
                  }
                }}
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
