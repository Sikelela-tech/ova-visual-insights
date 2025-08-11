import { useState } from 'react';
import OvaSidebar from "@/components/layout/OvaSidebar";
import OvaHero from "@/components/home/OvaHero";
import FileUpload from "@/components/home/FileUpload";
import DataAnalysis from "@/components/home/DataAnalysis";

interface DatasetInfo {
  id: string;
  filename: string;
  originalName: string;
  columns: string[];
  dataTypes: Record<string, string>;
  rowCount: number;
  sampleData: any[];
  filePath: string;
  uploadTime: Date;
  fileSize: number;
}

const Index = () => {
  const [currentDataset, setCurrentDataset] = useState<DatasetInfo | null>(null);

  const handleDatasetUploaded = (datasetInfo: DatasetInfo) => {
    setCurrentDataset(datasetInfo);
  };

  const handleNewAnalysis = () => {
    setCurrentDataset(null);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_1fr]">
      <OvaSidebar onNewAnalysis={handleNewAnalysis} />
      <main className="flex flex-col">
        <header className="h-16 border-b flex items-center justify-between px-4">
          <div className="font-semibold tracking-tight">O.V.A — AI Data Analyst</div>
          <a href="#upgrade" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Upgrade your plan</a>
        </header>
        
        <div className="flex-1 p-6">
          {!currentDataset ? (
            <div className="space-y-8">
              <OvaHero />
              <FileUpload onDatasetUploaded={handleDatasetUploaded} />
            </div>
          ) : (
            <DataAnalysis datasetInfo={currentDataset} />
          )}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "O.V.A — AI Data Analyst",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: "AI-powered data analysis and visualization platform.",
            }),
          }}
        />
      </main>
    </div>
  );
};

export default Index;
