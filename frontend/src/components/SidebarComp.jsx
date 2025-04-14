import { useLocation } from "react-router-dom";
import { MoreVertical, ChevronLast, ChevronFirst, ChevronDown } from "lucide-react";
import { useContext, createContext, useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  PieChart,
  TestTubeDiagonal,
  BrainCircuit,
  CandlestickChart
} from "lucide-react";

const SidebarContext = createContext();

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <aside className="h-screen max-w-64">
      <nav className="h-full inline-flex flex-col dark:bg-black border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <img src="" className={`overflow-hidden transition-all ${expanded ? "w-32" : "w-0"}`} alt="" />
          <button onClick={() => setExpanded((curr) => !curr)} className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100">
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Portfolio" href="/" />
            <SidebarItem icon={<CandlestickChart />} text="Análisis Activo" href="/analisisActivo" />
            <SidebarDropdown 
            icon={<BrainCircuit />} 
            text="ML" href="/ml" 
            items={[
              { text: "KMeans", href: "/agrupamiento" },
              { text: "Entrenamiento", href: "/entrenamientoPage" },

            ]}
            />
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
            <SidebarItem icon={<TestTubeDiagonal />} text="Backtesting" href="/backtesting" />
            <SidebarItem icon={<PieChart />} text="Fundamental" href="/fundamental" />
          </ul>
        </SidebarContext.Provider>
      </nav>
    </aside>
  );
}

export function SidebarDropdown({ icon, text, items }) {
  const { expanded } = useContext(SidebarContext);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div
        onClick={() => setOpen(!open)}
        className={`
          relative flex items-center py-2 px-3 my-1
          font-medium rounded-md cursor-pointer
          transition-colors group
          hover:bg-indigo-50 text-gray-600
        `}
      >
        {icon}
        <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>{text}</span>
        <ChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="pl-8">
          {items.map((item, index) => (
            <SidebarItem key={index} icon={<MoreVertical />} text={item.text} href={item.href} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SidebarItem({ icon, text, alert, href }) {
  const { expanded } = useContext(SidebarContext);
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <a
      href={href}
      className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${isActive ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800" : "hover:bg-indigo-50 text-gray-600"}
    `}
    >
      {icon}
      <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>{text}</span>
      {alert && <div className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? "" : "top-2"}`} />}

      {!expanded && (
        <div
          className={`
          absolute left-full rounded-md px-2 py-1 ml-6
          bg-indigo-100 text-indigo-800 text-sm
          invisible opacity-20 -translate-x-3 transition-all
          group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
      `}
        >
          {text}
        </div>
      )}
    </a>
  );
}
