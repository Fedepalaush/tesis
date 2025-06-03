import React from "react";
import Sidebar from "../components/SidebarComp";


const BaseLayout = ({ children }) => {

  return (
    <div>
      {/* Skip Links para navegación rápida */}
      <div className="skip-links">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:no-underline focus:shadow-lg"
          role="button"
          aria-label="Saltar al contenido principal"
        >
          Saltar al contenido principal
        </a>
        <a 
          href="#sidebar-nav" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-48 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:no-underline focus:shadow-lg"
          role="button"
          aria-label="Saltar a la navegación"
        >
          Saltar a la navegación
        </a>
      </div>
      
      <body className="dark:bg-black">
        <div className="flex w-full">
          <aside className="h-screen sticky top-0">
            <Sidebar 
              className="sticky left-0 top-0"
              id="sidebar-nav"
            >

            </Sidebar>
          </aside>
          <div className="w-screen pl-10 mt-6">
            <main 
              id="main-content"
              role="main"
              aria-label="Contenido principal"
              tabIndex="-1"
            >
              {children}
            </main>
          </div>
        </div>
      </body>
    </div>
  );
};

export default BaseLayout;