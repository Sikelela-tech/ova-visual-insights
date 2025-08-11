import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Sparkles, Plus } from "lucide-react";

interface Props {
  onSubmit: (q: string) => void;
}

const SearchBar = ({ onSubmit }: Props) => {
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--spot-x", `${x}%`);
      el.style.setProperty("--spot-y", `${y}%`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  const submit = () => {
    if (!q.trim()) return;
    onSubmit(q.trim());
  };

  return (
    <div ref={ref} className="ova-spotlight rounded-2xl p-2 border bg-card/80 backdrop-blur">
      <div className="flex items-center gap-2 rounded-2xl border bg-background px-4 py-3 shadow-sm">
        <Plus className="opacity-60" />
        <input
          aria-label="Ask O.V.A anything about your data"
          className="flex-1 bg-transparent outline-none text-base"
          placeholder="Ask anything about your data..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <Button variant="ghost" size="icon" aria-label="Voice input">
          <Mic />
        </Button>
        <Button variant="hero" size="xl" onClick={submit} aria-label="Analyze">
          <Sparkles /> Analyze
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
