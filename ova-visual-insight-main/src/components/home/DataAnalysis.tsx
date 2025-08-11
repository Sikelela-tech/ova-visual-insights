import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Code, BarChart3, Download, Play, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataAnalysisProps {
  datasetInfo: any;
}

interface AIAnalysisResult {
  id: string;
  query: string;
  analysis: string;
  pythonCode: string;
  visualizationType: string;
  explanation: string;
  timestamp: Date;
}

interface ChartResult {
  path: string;
  format: string;
  data: any;
}

const DataAnalysis = ({ datasetInfo }: DataAnalysisProps) => {
  const [query, setQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('openai');
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [chartResult, setChartResult] = useState<ChartResult | null>(null);
  const [showCode, setShowCode] = useState(false);
  const { toast } = useToast();

  const aiModels = [
    { id: 'openai', name: 'OpenAI GPT-4', description: 'Advanced analysis' },
    { id: 'gemini', name: 'Google Gemini', description: 'Multimodal AI' },
    { id: 'claude', name: 'Anthropic Claude', description: 'Safety-focused' }
  ];

  const outputFormats = [
    { id: 'png', name: 'PNG Image', description: 'High quality' },
    { id: 'jpg', name: 'JPEG Image', description: 'Compressed' },
    { id: 'svg', name: 'SVG Vector', description: 'Scalable' },
    { id: 'html', name: 'Interactive HTML', description: 'Interactive' }
  ];

  const handleAnalysis = async () => {
    if (!query.trim()) {
      toast({
        title: "Query required",
        description: "Please enter a question about your data",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);

    try {
      const response = await fetch('http://localhost:3001/api/analyze/visualize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          datasetId: datasetInfo.id,
          aiModel: selectedModel,
          outputFormat: selectedFormat
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();

      if (result.success) {
        setAnalysisResult(result.analysis);
        setChartResult(result.chart);
        
        toast({
          title: "Analysis complete!",
          description: `Generated ${result.analysis.visualizationType} visualization`,
        });
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadChart = async () => {
    if (!chartResult) return;

    try {
      const response = await fetch(`http://localhost:3001/api/results/download/${chartResult.path.split('/').pop()}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chart-${Date.now()}.${chartResult.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: "Chart download initiated",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download chart",
        variant: "destructive"
      });
    }
  };

  const viewChart = () => {
    if (!chartResult) return;
    
    const chartUrl = `http://localhost:3001/api/results/charts/${chartResult.path.split('/').pop()}`;
    window.open(chartUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Dataset Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Dataset: {datasetInfo.originalName}
          </CardTitle>
          <CardDescription>
            {datasetInfo.rowCount} rows • {datasetInfo.columns.length} columns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {datasetInfo.columns.map((column: string) => (
              <Badge key={column} variant="secondary">
                {column} ({datasetInfo.dataTypes[column]})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Data Analysis
          </CardTitle>
          <CardDescription>
            Ask questions about your data and get AI-generated visualizations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aiModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-muted-foreground">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Output Format</label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {outputFormats.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      <div>
                        <div className="font-medium">{format.name}</div>
                        <div className="text-xs text-muted-foreground">{format.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Question</label>
            <Textarea
              placeholder="e.g., Show me a bar chart of sales by region, or Find trends in customer satisfaction over time..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleAnalysis}
            disabled={analyzing || !query.trim()}
            className="w-full"
            size="lg"
          >
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze & Visualize
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              {analysisResult.visualizationType} • {new Date(analysisResult.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="chart">Chart</TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Your Question</h4>
                    <p className="text-muted-foreground">{analysisResult.query}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">AI Analysis</h4>
                    <p className="text-muted-foreground">{analysisResult.analysis}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Visualization Explanation</h4>
                    <p className="text-muted-foreground">{analysisResult.explanation}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="code" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Generated Python Code</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCode(!showCode)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showCode ? 'Hide' : 'Show'} Code
                    </Button>
                  </div>
                  {showCode && (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{analysisResult.pythonCode}</code>
                    </pre>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="chart" className="space-y-4">
                {chartResult ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button onClick={viewChart} variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Chart
                      </Button>
                      <Button onClick={downloadChart}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    
                    {chartResult.format === 'html' ? (
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <p className="text-center text-muted-foreground">
                          Interactive HTML chart generated. Click "View Chart" to see it.
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <p className="text-center text-muted-foreground">
                          {chartResult.format.toUpperCase()} chart generated. Click "View Chart" to see it.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Chart generation failed. Check the analysis for details.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataAnalysis;
