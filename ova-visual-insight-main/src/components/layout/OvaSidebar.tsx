import { Home, Search, Library, Settings, BarChart3, LineChart, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ModeToggle from "@/components/theme/ModeToggle";

interface OvaSidebarProps {
  onNewAnalysis?: () => void;
}

const navItems = [
  { label: "New analysis", icon: PlusSquare, action: "new" },
  { label: "Search", icon: Search, action: "search" },
  { label: "Library", icon: Library, action: "library" },
  { label: "Dashboards", icon: BarChart3, action: "dashboards" },
  { label: "Reports", icon: LineChart, action: "reports" },
  { label: "Settings", icon: Settings, action: "settings" },
];

const OvaSidebar = ({ onNewAnalysis }: OvaSidebarProps) => {
  const handleNavClick = (action: string) => {
    if (action === "new" && onNewAnalysis) {
      onNewAnalysis();
    }
    // Handle other actions as needed
  };

  return (
    <aside className="hidden md:flex h-screen w-[260px] flex-col border-r bg-sidebar text-sidebar-foreground">
      <header className="flex items-center justify-between px-4 h-16 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary/15 grid place-items-center text-primary font-bold">O</div>
          <span className="font-semibold tracking-tight">O.V.A</span>
        </div>
        <ModeToggle />
      </header>
      <nav className="flex-1 px-2 py-3 space-y-1">
        {navItems.map(({ label, icon: Icon, action }) => (
          <Button
            key={label}
            variant={action === "new" ? "secondary" : "ghost"}
            size="default"
            className={cn(
              "w-full justify-start gap-3",
              action === "new" ? "bg-primary/10 text-foreground" : ""
            )}
            aria-label={label}
            onClick={() => handleNavClick(action)}
          >
            <Icon className="opacity-80" />
            {label}
          </Button>
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
          O.V.A helps you analyze and visualize your data with AI.
        </div>
      </div>
    </aside>
  );
};

export default OvaSidebar;
