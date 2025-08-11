import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';

export interface AIAnalysisRequest {
  query: string;
  datasetInfo: {
    columns: string[];
    sampleData: any[];
    dataTypes: Record<string, string>;
    rowCount: number;
  };
  model: 'openai' | 'gemini' | 'claude' | 'deepseek';
}

export interface AIAnalysisResponse {
  id: string;
  analysis: string;
  pythonCode: string;
  visualizationType: string;
  explanation: string;
  timestamp: Date;
}

export class AIService {
  private openai: OpenAI;
  private gemini: GoogleGenerativeAI;
  private anthropic: Anthropic;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async analyzeData(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const { query, datasetInfo, model } = request;
    
    try {
      let response: AIAnalysisResponse;

      switch (model) {
        case 'openai':
          response = await this.analyzeWithOpenAI(query, datasetInfo);
          break;
        case 'gemini':
          response = await this.analyzeWithGemini(query, datasetInfo);
          break;
        case 'claude':
          response = await this.analyzeWithClaude(query, datasetInfo);
          break;
        default:
          throw new Error(`Unsupported AI model: ${model}`);
      }

      return {
        ...response,
        id: uuidv4(),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async analyzeWithOpenAI(query: string, datasetInfo: any): Promise<Omit<AIAnalysisResponse, 'id' | 'timestamp'>> {
    const prompt = this.buildAnalysisPrompt(query, datasetInfo);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert data analyst and Python developer. Generate Python code to analyze and visualize data based on user queries. Always return valid, runnable Python code."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const response = completion.choices[0]?.message?.content || '';
    return this.parseAIResponse(response);
  }

  private async analyzeWithGemini(query: string, datasetInfo: any): Promise<Omit<AIAnalysisResponse, 'id' | 'timestamp'>> {
    const prompt = this.buildAnalysisPrompt(query, datasetInfo);
    
    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    return this.parseAIResponse(response);
  }

  private async analyzeWithClaude(query: string, datasetInfo: any): Promise<Omit<AIAnalysisResponse, 'id' | 'timestamp'>> {
    const prompt = this.buildAnalysisPrompt(query, datasetInfo);
    
    const message = await this.anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const response = message.content[0]?.text || '';
    return this.parseAIResponse(response);
  }

  private buildAnalysisPrompt(query: string, datasetInfo: any): string {
    return `
You are an expert data analyst. Analyze the following dataset and answer the user's question.

DATASET INFORMATION:
- Columns: ${datasetInfo.columns.join(', ')}
- Data Types: ${JSON.stringify(datasetInfo.dataTypes)}
- Sample Data: ${JSON.stringify(datasetInfo.sampleData.slice(0, 5))}
- Total Rows: ${datasetInfo.rowCount}

USER QUERY: ${query}

Please provide:
1. A clear analysis of the data
2. Python code to create an appropriate visualization
3. Explanation of what the visualization shows

IMPORTANT: The Python code must:
- Use pandas for data manipulation
- Use matplotlib, seaborn, or plotly for visualization
- Handle potential errors gracefully
- Be complete and runnable
- Include proper labels and titles

Format your response as:
ANALYSIS: [your analysis]
CODE: [python code block]
VISUALIZATION_TYPE: [type of chart]
EXPLANATION: [explanation of the visualization]
`;
  }

  private parseAIResponse(response: string): Omit<AIAnalysisResponse, 'id' | 'timestamp'> {
    // Extract different sections from AI response
    const analysisMatch = response.match(/ANALYSIS:\s*(.*?)(?=CODE:|VISUALIZATION_TYPE:|EXPLANATION:|$)/s);
    const codeMatch = response.match(/CODE:\s*(.*?)(?=ANALYSIS:|VISUALIZATION_TYPE:|EXPLANATION:|$)/s);
    const visualizationTypeMatch = response.match(/VISUALIZATION_TYPE:\s*(.*?)(?=ANALYSIS:|CODE:|EXPLANATION:|$)/s);
    const explanationMatch = response.match(/EXPLANATION:\s*(.*?)(?=ANALYSIS:|CODE:|VISUALIZATION_TYPE:|$)/s);

    return {
      analysis: analysisMatch?.[1]?.trim() || 'Analysis not provided',
      pythonCode: codeMatch?.[1]?.trim() || 'print("No code generated")',
      visualizationType: visualizationTypeMatch?.[1]?.trim() || 'Unknown',
      explanation: explanationMatch?.[1]?.trim() || 'Explanation not provided'
    };
  }
}
