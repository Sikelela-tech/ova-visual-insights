import { useEffect } from "react";
import SearchBar from "./SearchBar";
import { Button } from "@/components/ui/button";
import { BarChart3, BrainCog, FileBarChart, Lightbulb } from "lucide-react";

const chips = [
  { icon: BarChart3, label: "Create chart" },
  { icon: FileBarChart, label: "Summarize dataset" },
  { icon: Lightbulb, label: "Find trends" },
  { icon: BrainCog, label: "Forecast sales" },
];

const OvaHero = () => {
  useEffect(() => {
    document.title = "O.V.A — AI Data Analyst";
  }, []);

  const onSearch = (q: string) => {
    // Placeholder action (toast or route could be added)
    console.log("Query submitted:", q);
  };

  return (
    <section className="relative mx-auto max-w-3xl px-4">
      <header className="text-center space-y-3 mb-6">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Good to see you, Analyst.
        </h1>
        <p className="text-muted-foreground">
          Ask anything about your data. O.V.A will analyze and visualize it instantly.
        </p>
      </header>

      <SearchBar onSubmit={onSearch} />

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {chips.map(({ icon: Icon, label }) => (
          <Button key={label} variant="chip" size="xl" aria-label={label}>
            <Icon /> {label}
          </Button>
        ))}
      </div>
    </section>
  );
};

export default OvaHero;
