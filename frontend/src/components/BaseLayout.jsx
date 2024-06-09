import React from "react";
import NavbarComp from "../components/NavbarComp";
import Sidebar from "../components/SidebarComp";
import { SidebarItem } from "../components/SidebarComp";
import { LayoutDashboard, BarChart3, UserCircle, Boxes, Package, Receipt, Settings, LifeBuoy } from "lucide-react";

const BaseLayout = ({ children }) => {
    const activeItem = "Analisis";
  return (
    <div>
      <div className="w-full">
        <NavbarComp />
      </div>

      <body className="dark:bg-black">
        <div className="flex w-full">
          <aside class="h-screen sticky top-0">
            <Sidebar className="sticky left-0 top-0">
              <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" href="/" active={activeItem === "Dashboard"} />
              <SidebarItem icon={<BarChart3 size={20} />} text="Análisis" href="/analisisActivo" active={activeItem === "Analisis"} />
              <SidebarItem icon={<UserCircle size={20} />} text="Usuarios" active={activeItem === "Usuarios"} />
              <SidebarItem icon={<Boxes size={20} />} text="Inventario" active={activeItem === "Inventario"} />
              <SidebarItem icon={<Package size={20} />} text="Ordenes" active={activeItem === "Ordenes"} />
              <SidebarItem icon={<Receipt size={20} />} text="Facturacion" active={activeItem === "Facturacion"} />
              <SidebarItem icon={<Settings size={20} />} text="Ajustes" active={activeItem === "Ajustes"} />
              <SidebarItem icon={<LifeBuoy size={20} />} text="Ayuda" active={activeItem === "Ayuda"} />
            </Sidebar>
          </aside>
          <div className="w-screen pl-10">{children}</div>
        </div>
      </body>
    </div>
  );
};

export default BaseLayout;
