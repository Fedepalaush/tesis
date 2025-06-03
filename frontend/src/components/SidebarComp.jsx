import { useLocation } from "react-router-dom";
import { MoreVertical, ChevronLast, ChevronFirst, ChevronDown, LogOut } from "lucide-react";
import { useContext, createContext, useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  BarChart3,
  PieChart,
  TestTubeDiagonal,
  BrainCircuit,
  CandlestickChart,
  Eye
} from "lucide-react";

const SidebarContext = createContext();

export default function Sidebar({ children, id, ...props }) {
  const [expanded, setExpanded] = useState(true);

  const handleToggleSidebar = () => {
    setExpanded((curr) => !curr);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleSidebar();
    }
  };

  return (
    <aside 
      className="h-screen max-w-64"
      role="navigation"
      aria-label="Navegación principal"
    >
      <nav 
        id={id}
        className="h-full flex flex-col justify-between dark:bg-black border-r shadow-sm"
        role="navigation"
        aria-label="Menú de navegación lateral"
      >
        {/* Parte superior */}
        <div>
          <div className="p-4 pb-2 flex justify-between items-center">
            <img 
              src="" 
              className={`overflow-hidden transition-all ${expanded ? "w-32" : "w-0"}`} 
              alt={expanded ? "Logo de la aplicación" : ""}
              aria-hidden={!expanded}
            />
            <button
              onClick={handleToggleSidebar}
              onKeyDown={handleKeyDown}
              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label={expanded ? "Contraer sidebar" : "Expandir sidebar"}
              aria-expanded={expanded}
              type="button"
            >
              {expanded ? <ChevronFirst aria-hidden="true" /> : <ChevronLast aria-hidden="true" />}
            </button>
          </div>

          <SidebarContext.Provider value={{ expanded }}>
            <ul 
              className="flex-1 px-3"
              role="list"
              aria-label="Enlaces de navegación"
            >
              <li role="listitem">
                <SidebarItem icon={<LayoutDashboard size={20} />} text="Portfolio" href="/" />
              </li>
              <li role="listitem">
                <SidebarItem icon={<CandlestickChart />} text="Análisis Activo" href="/analisisActivo" />
              </li>
              <li role="listitem">
                <SidebarDropdown
                  icon={<BrainCircuit />}
                  text="ML"
                  items={[
                    { text: "KMeans", href: "/agrupamiento" },
                    { text: "Entrenamiento", href: "/entrenamientoPage" },
                  ]}
                />
              </li>
              <li role="listitem">
                <SidebarDropdown
                  icon={<BarChart3 />}
                  text="Visualizacion"
                  items={[
                    { text: "Correlación Retornos", href: "/correlacion" },
                    { text: "Sharpe Ratio", href: "/sharpeRatio" },
                    { text: "Soportes/Resistencias", href: "/soportesResistencias" },
                    { text: "Heatmap Retornos", href: "/RetornosMensuales" },
                    { text: "Medias Moviles", href: "/mediasMoviles" },
                    { text: "Calendario Dividendos", href: "/calendarioDividendos" },
                  ]}
                />
              </li>
              <li role="listitem">
                <SidebarItem icon={<TestTubeDiagonal />} text="Backtesting" href="/backtesting" />
              </li>
              <li role="listitem">
                <SidebarItem icon={<PieChart />} text="Fundamental" href="/fundamental" />
              </li>
              <li role="listitem">
                <SidebarItem icon={<Eye />} text="Demo Accesibilidad" href="/accessibility-demo" />
              </li>
            </ul>
          </SidebarContext.Provider>
        </div>

        {/* Parte inferior: Logout */}
        <div className="px-3 py-4" role="contentinfo" aria-label="Acciones de usuario">
          <a
            href="/logout"
            className="flex items-center gap-3 p-2 rounded-md text-gray-600 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Cerrar sesión y salir de la aplicación"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            {expanded && <span>Logout</span>}
          </a>
        </div>
      </nav>
    </aside>
  );
}

export function SidebarDropdown({ icon, text, items }) {
  const { expanded } = useContext(SidebarContext);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    } else if (e.key === 'Escape' && open) {
      setOpen(false);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open]);

  const dropdownId = `dropdown-${text.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div ref={dropdownRef} role="group" aria-labelledby={`${dropdownId}-button`}>
      <button
        id={`${dropdownId}-button`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          relative flex items-center py-2 px-3 my-1 w-full
          font-medium rounded-md cursor-pointer
          transition-colors group
          hover:bg-indigo-50 text-gray-600
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        `}
        aria-expanded={open}
        aria-controls={dropdownId}
        aria-haspopup="true"
        type="button"
      >
        <span aria-hidden="true">{icon}</span>
        <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
          {text}
        </span>
        <ChevronDown 
          className={`transition-transform ml-auto ${open ? "rotate-180" : ""} ${!expanded ? "opacity-0" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul 
          id={dropdownId}
          className="pl-8"
          role="list"
          aria-label={`Opciones de ${text}`}
        >
          {items.map((item, index) => (
            <li key={index} role="listitem">
              <SidebarItem 
                icon={<MoreVertical />} 
                text={item.text} 
                href={item.href}
                isSubItem={true}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SidebarItem({ icon, text, alert, href, isSubItem = false }) {
  const { expanded } = useContext(SidebarContext);
  const location = useLocation();
  const isActive = location.pathname === href;

  const baseClasses = `
    relative flex items-center py-2 px-3 my-1
    font-medium rounded-md cursor-pointer
    transition-colors group
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
    ${isActive 
      ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800" 
      : "hover:bg-indigo-50 text-gray-600"
    }
    ${isSubItem ? "text-sm" : ""}
  `;

  const tooltipId = `tooltip-${text.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <a
      href={href}
      className={baseClasses}
      aria-current={isActive ? 'page' : undefined}
      aria-label={`Ir a ${text}${isActive ? ' (página actual)' : ''}`}
      aria-describedby={!expanded ? tooltipId : undefined}
    >
      <span aria-hidden="true">{icon}</span>
      <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
        {text}
      </span>
      {alert && (
        <div 
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? "" : "top-2"}`}
          aria-label="Hay notificaciones"
          role="status"
        />
      )}

      {!expanded && (
        <div
          id={tooltipId}
          className={`
            absolute left-full rounded-md px-2 py-1 ml-6
            bg-indigo-100 text-indigo-800 text-sm
            invisible opacity-20 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
            group-focus:visible group-focus:opacity-100 group-focus:translate-x-0
            z-50
          `}
          role="tooltip"
          aria-hidden="true"
        >
          {text}
        </div>
      )}
    </a>
  );
}
