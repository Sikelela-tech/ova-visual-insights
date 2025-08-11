import { Router, Request, Response } from 'express';
import { AIService } from '../services/aiService.js';
import { PythonSandboxService } from '../services/pythonSandboxService.js';
import { FileProcessingService } from '../services/fileProcessingService.js';

const router = Router();
const aiService = new AIService();
const pythonSandboxService = new PythonSandboxService();
const fileProcessingService = new FileProcessingService();

// Analyze data with AI and generate visualization
router.post('/visualize', async (req: Request, res: Response) => {
  try {
    const { query, datasetId, aiModel, outputFormat } = req.body;

    // Validate required fields
    if (!query || !datasetId || !aiModel || !outputFormat) {
      return res.status(400).json({
        error: 'Missing required fields: query, datasetId, aiModel, outputFormat'
      });
    }

    // Get dataset info
    const datasetInfo = await fileProcessingService.getDatasetInfo(datasetId);
    if (!datasetInfo) {
      return res.status(404).json({
        error: 'Dataset not found'
      });
    }

    // Prepare dataset info for AI
    const datasetInfoForAI = {
      columns: datasetInfo.columns,
      sampleData: datasetInfo.sampleData,
      dataTypes: datasetInfo.dataTypes,
      rowCount: datasetInfo.rowCount
    };

    // Get AI analysis
    const aiResponse = await aiService.analyzeData({
      query,
      datasetInfo: datasetInfoForAI,
      model: aiModel
    });

    // Execute Python code in sandbox
    const executionResult = await pythonSandboxService.executePythonCode({
      pythonCode: aiResponse.pythonCode,
      datasetPath: datasetInfo.filePath,
      outputFormat
    });

    if (executionResult.success && executionResult.chartPath) {
      res.json({
        success: true,
        analysis: {
          id: aiResponse.id,
          query,
          analysis: aiResponse.analysis,
          visualizationType: aiResponse.visualizationType,
          explanation: aiResponse.explanation,
          timestamp: aiResponse.timestamp
        },
        chart: {
          path: executionResult.chartPath,
          format: outputFormat,
          data: executionResult.chartData
        },
        execution: {
          output: executionResult.output,
          success: true
        }
      });
    } else {
      res.status(400).json({
        success: false,
        analysis: {
          id: aiResponse.id,
          query,
          analysis: aiResponse.analysis,
          visualizationType: aiResponse.visualizationType,
          explanation: aiResponse.explanation,
          timestamp: aiResponse.timestamp
        },
        error: executionResult.error || 'Chart generation failed',
        execution: {
          output: executionResult.output,
          success: false
        }
      });
    }
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Internal server error during analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get AI analysis without execution (for preview)
router.post('/preview', async (req: Request, res: Response) => {
  try {
    const { query, datasetId, aiModel } = req.body;

    if (!query || !datasetId || !aiModel) {
      return res.status(400).json({
        error: 'Missing required fields: query, datasetId, aiModel'
      });
    }

    const datasetInfo = await fileProcessingService.getDatasetInfo(datasetId);
    if (!datasetInfo) {
      return res.status(404).json({
        error: 'Dataset not found'
      });
    }

    const datasetInfoForAI = {
      columns: datasetInfo.columns,
      sampleData: datasetInfo.sampleData,
      dataTypes: datasetInfo.dataTypes,
      rowCount: datasetInfo.rowCount
    };

    const aiResponse = await aiService.analyzeData({
      query,
      datasetInfo: datasetInfoForAI,
      model: aiModel
    });

    res.json({
      success: true,
      analysis: {
        id: aiResponse.id,
        query,
        analysis: aiResponse.analysis,
        pythonCode: aiResponse.pythonCode,
        visualizationType: aiResponse.visualizationType,
        explanation: aiResponse.explanation,
        timestamp: aiResponse.timestamp
      }
    });
  } catch (error) {
    console.error('Analysis preview error:', error);
    res.status(500).json({
      error: 'Internal server error during analysis preview',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Execute existing Python code
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { pythonCode, datasetId, outputFormat } = req.body;

    if (!pythonCode || !datasetId || !outputFormat) {
      return res.status(400).json({
        error: 'Missing required fields: pythonCode, datasetId, outputFormat'
      });
    }

    const datasetInfo = await fileProcessingService.getDatasetInfo(datasetId);
    if (!datasetInfo) {
      return res.status(404).json({
        error: 'Dataset not found'
      });
    }

    const executionResult = await pythonSandboxService.executePythonCode({
      pythonCode,
      datasetPath: datasetInfo.filePath,
      outputFormat
    });

    if (executionResult.success && executionResult.chartPath) {
      res.json({
        success: true,
        chart: {
          path: executionResult.chartPath,
          format: outputFormat,
          data: executionResult.chartData
        },
        execution: {
          output: executionResult.output,
          success: true
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: executionResult.error || 'Code execution failed',
        execution: {
          output: executionResult.output,
          success: false
        }
      });
    }
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      error: 'Internal server error during code execution',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get available AI models
router.get('/models', (req: Request, res: Response) => {
  res.json({
    models: [
      {
        id: 'openai',
        name: 'OpenAI GPT-4',
        description: 'Advanced language model for complex analysis',
        capabilities: ['Data analysis', 'Code generation', 'Natural language understanding']
      },
      {
        id: 'gemini',
        name: 'Google Gemini Pro',
        description: 'Google\'s multimodal AI model',
        capabilities: ['Data analysis', 'Code generation', 'Multimodal understanding']
      }
    ]
  });
});

// Get supported output formats
router.get('/formats', (req: Request, res: Response) => {
  res.json({
    formats: [
      {
        id: 'png',
        name: 'PNG Image',
        description: 'High-quality raster image format',
        suitableFor: ['Static charts', 'Presentations', 'Print']
      },
      {
        id: 'jpg',
        name: 'JPEG Image',
        description: 'Compressed image format',
        suitableFor: ['Web use', 'Email', 'Storage efficiency']
      },
      {
        id: 'svg',
        name: 'SVG Vector',
        description: 'Scalable vector format',
        suitableFor: ['Web use', 'Scaling', 'Editing']
      },
      {
        id: 'html',
        name: 'Interactive HTML',
        description: 'Interactive Plotly charts',
        suitableFor: ['Web dashboards', 'Interactive exploration', 'Sharing']
      }
    ]
  });
});

export { router as analysisRoutes };
