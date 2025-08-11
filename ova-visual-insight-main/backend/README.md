# O.V.A AI Data Analyst Backend

A powerful backend service for AI-powered data analysis and visualization, built with Node.js, TypeScript, and Express.

## 🚀 Features

- **Multi-AI Model Support**: OpenAI GPT-4, Google Gemini, Anthropic Claude
- **File Processing**: Excel and CSV file upload and processing
- **AI Analysis**: Natural language queries converted to data insights
- **Python Code Generation**: AI-generated Python code for visualizations
- **Safe Execution**: Sandboxed Python environment for code execution
- **Chart Generation**: Multiple output formats (PNG, JPG, SVG, HTML)
- **Export Functionality**: Download charts in various formats

## 🏗️ Architecture

```
backend/
├── src/
│   ├── controllers/          # API endpoints
│   │   ├── fileUploadController.ts
│   │   ├── analysisController.ts
│   │   └── resultsController.ts
│   ├── services/             # Business logic
│   │   ├── aiService.ts      # AI model integration
│   │   ├── pythonSandboxService.ts  # Python execution
│   │   └── fileProcessingService.ts # File handling
│   ├── middleware/           # Express middleware
│   │   └── errorHandler.ts
│   └── app.ts               # Main server file
├── package.json
├── tsconfig.json
└── requirements.txt          # Python dependencies
```

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **AI Models**: OpenAI, Google Gemini, Anthropic Claude
- **File Processing**: Multer, XLSX
- **Python Integration**: python-shell
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## 📋 Prerequisites

- Node.js 18+ 
- Python 3.8+
- npm or yarn
- AI API keys (OpenAI, Gemini, Claude)

## 🚀 Installation

1. **Install Node.js dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Start the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Configuration

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# AI API Keys
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Security
JWT_SECRET=your_jwt_secret_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📡 API Endpoints

### File Upload
- `POST /api/upload` - Upload dataset
- `GET /api/upload/:datasetId` - Get dataset info
- `DELETE /api/upload/:datasetId` - Delete dataset
- `POST /api/upload/validate` - Validate file before upload

### Analysis
- `POST /api/analyze/visualize` - Full AI analysis and visualization
- `POST /api/analyze/preview` - AI analysis preview only
- `POST /api/analyze/execute` - Execute Python code
- `GET /api/analyze/models` - Get available AI models
- `GET /api/analyze/formats` - Get supported output formats

### Results
- `GET /api/results/charts/:filename` - View chart
- `GET /api/results/download/:filename` - Download chart
- `GET /api/results/charts/:filename/metadata` - Get chart metadata
- `GET /api/results/charts` - List all charts
- `POST /api/results/export/:filename` - Export chart in different format
- `DELETE /api/results/charts/:filename` - Delete chart

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **File Validation**: Type and size restrictions
- **Input Sanitization**: All user inputs are validated
- **CORS Protection**: Configurable cross-origin requests
- **Helmet Security**: Security headers and protection

## 🐍 Python Sandbox

The backend includes a safe Python execution environment:

- **Isolated Execution**: Each request runs in its own context
- **Dependency Management**: Automatic installation of required packages
- **Output Capture**: Safe capture of generated charts
- **Error Handling**: Graceful handling of Python execution errors

## 📊 Supported File Formats

- **CSV**: Comma-separated values
- **Excel**: XLSX and XLS files
- **Size Limit**: 50MB maximum
- **Encoding**: UTF-8 support

## 🎨 Chart Output Formats

- **PNG**: High-quality raster images
- **JPG**: Compressed images for web use
- **SVG**: Scalable vector graphics
- **HTML**: Interactive Plotly charts

## 🚀 Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests (when implemented)
npm test
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:8080 |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `GEMINI_API_KEY` | Google Gemini API key | Optional |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | Optional |

## 🔍 Troubleshooting

### Common Issues

1. **Python not found**: Ensure Python 3.8+ is installed and in PATH
2. **AI API errors**: Verify API keys are correct and have sufficient credits
3. **File upload failures**: Check file size and format restrictions
4. **Chart generation errors**: Ensure Python packages are installed

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and logging.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🔮 Future Enhancements

- Database integration for persistent storage
- User authentication and authorization
- Advanced chart customization options
- Real-time collaboration features
- Additional AI model integrations
- Performance monitoring and analytics
