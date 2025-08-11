import { PythonShell } from 'python-shell';
import { writeFileSync, readFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface PythonExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  chartPath?: string;
  chartData?: any;
}

export interface ChartGenerationRequest {
  pythonCode: string;
  datasetPath: string;
  outputFormat: 'png' | 'jpg' | 'svg' | 'html';
}

export class PythonSandboxService {
  private tempDir: string;
  private outputDir: string;

  constructor() {
    this.tempDir = join(process.cwd(), 'temp');
    this.outputDir = join(process.cwd(), 'output');
    this.ensureDirectories();
  }

  private ensureDirectories() {
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async executePythonCode(request: ChartGenerationRequest): Promise<PythonExecutionResult> {
    const executionId = uuidv4();
    const pythonFile = join(this.tempDir, `${executionId}.py`);
    const outputFile = join(this.outputDir, `${executionId}.${request.outputFormat}`);

    try {
      // Create enhanced Python code with proper setup
      const enhancedCode = this.enhancePythonCode(request.pythonCode, request.datasetPath, outputFile, request.outputFormat);
      
      // Write Python file
      writeFileSync(pythonFile, enhancedCode);

      // Execute Python code
      const result = await this.runPythonFile(pythonFile);

      // Check if chart was generated
      const chartExists = existsSync(outputFile);
      
      if (result.success && chartExists) {
        return {
          success: true,
          output: result.output,
          chartPath: outputFile,
          chartData: this.readChartData(outputFile, request.outputFormat)
        };
      } else {
        return {
          success: false,
          output: result.output,
          error: result.error || 'Chart generation failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      // Cleanup temporary Python file
      if (existsSync(pythonFile)) {
        unlinkSync(pythonFile);
      }
    }
  }

  private enhancePythonCode(originalCode: string, datasetPath: string, outputPath: string, format: string): string {
    const setupCode = `
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
import warnings
warnings.filterwarnings('ignore')

# Set style for better-looking plots
plt.style.use('default')
sns.set_palette("husl")

# Load the dataset
try:
    df = pd.read_csv('${datasetPath}')
    print(f"Dataset loaded successfully with {len(df)} rows and {len(df.columns)} columns")
    print(f"Columns: {list(df.columns)}")
    print(f"Data types: {df.dtypes.to_dict()}")
    print("\\nFirst few rows:")
    print(df.head())
except Exception as e:
    print(f"Error loading dataset: {e}")
    exit(1)

# Set figure size for better quality
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['figure.dpi'] = 300

`;

    const cleanupCode = `
# Save the plot
try:
    if format == 'html':
        # For plotly charts, save as HTML
        if 'fig' in locals() and hasattr(fig, 'write_html'):
            fig.write_html('${outputPath}')
        else:
            # Convert matplotlib to plotly if needed
            import plotly.tools as tls
            plotly_fig = tls.mpl_to_plotly(plt.gcf())
            plotly_fig.write_html('${outputPath}')
    else:
        # For static images
        plt.tight_layout()
        plt.savefig('${outputPath}', format='${format}', dpi=300, bbox_inches='tight')
    
    print(f"Chart saved successfully to: ${outputPath}")
except Exception as e:
    print(f"Error saving chart: {e}")
    exit(1)

print("\\n=== EXECUTION COMPLETED ===")
`;

    return setupCode + originalCode + cleanupCode;
  }

  private async runPythonFile(pythonFile: string): Promise<{ success: boolean; output: string; error?: string }> {
    return new Promise((resolve) => {
      const options = {
        mode: 'text',
        pythonPath: 'python3', // or 'python' depending on your system
        pythonOptions: ['-u'], // unbuffered output
        scriptPath: dirname(pythonFile),
        args: []
      };

      const pyshell = new PythonShell(pythonFile, options);
      let output = '';
      let error = '';

      pyshell.on('message', (message) => {
        output += message + '\n';
      });

      pyshell.on('error', (err) => {
        error += err.message + '\n';
      });

      pyshell.end((err) => {
        if (err) {
          error += err.message + '\n';
        }
        
        resolve({
          success: !error,
          output: output.trim(),
          error: error.trim() || undefined
        });
      });
    });
  }

  private readChartData(chartPath: string, format: string): any {
    try {
      if (format === 'html') {
        return readFileSync(chartPath, 'utf-8');
      } else {
        // For binary formats, return metadata
        const stats = require('fs').statSync(chartPath);
        return {
          size: stats.size,
          format: format,
          path: chartPath
        };
      }
    } catch (error) {
      console.error('Error reading chart data:', error);
      return null;
    }
  }

  async cleanupOldFiles(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    // Clean up files older than maxAge (default: 24 hours)
    try {
      const fs = require('fs');
      const currentTime = Date.now();

      const cleanupDirectory = (dir: string) => {
        if (existsSync(dir)) {
          const files = fs.readdirSync(dir);
          files.forEach((file: string) => {
            const filePath = join(dir, file);
            const stats = fs.statSync(filePath);
            if (currentTime - stats.mtime.getTime() > maxAge) {
              fs.unlinkSync(filePath);
            }
          });
        }
      };

      cleanupDirectory(this.tempDir);
      cleanupDirectory(this.outputDir);
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}
