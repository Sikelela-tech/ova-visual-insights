# O.V.A AI Data Analyst - Complete Setup Guide

This guide will walk you through setting up the complete AI data analyst system, including both frontend and backend components.

## 🎯 System Overview

O.V.A (AI Data Analyst) is a comprehensive system that allows users to:
- Upload datasets (CSV/Excel)
- Ask questions in natural language
- Get AI-generated Python code for analysis
- Execute code in a safe sandbox environment
- Generate and export visualizations
- Support multiple AI models (OpenAI, Gemini, Claude)

## 🏗️ Architecture

```
Frontend (React + TypeScript) ←→ Backend (Node.js + Express) ←→ AI Models
                                      ↓
                              Python Sandbox Environment
                                      ↓
                              Chart Generation & Export
```

## 📋 Prerequisites

### System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **Node.js**: Version 18.0.0 or higher
- **Python**: Version 3.8 or higher
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 2GB free space

### Required Accounts & API Keys
- **OpenAI Account**: For GPT-4 access (https://platform.openai.com/)
- **Google AI Studio**: For Gemini access (https://makersuite.google.com/app/apikey)
- **Anthropic Account**: For Claude access (https://console.anthropic.com/)

## 🚀 Step-by-Step Setup

### Step 1: Clone and Navigate to Project
```bash
# Navigate to your project directory
cd ova-visual-insight-main

# Verify the structure
ls -la
```

### Step 2: Frontend Setup
```bash
# Navigate to frontend directory
cd ova-visual-insight-main

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

The frontend will be available at: `http://localhost:8080`

### Step 3: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### Step 4: Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit the .env file with your API keys
nano .env  # or use your preferred editor
```

**Required .env configuration:**
```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# AI API Keys (at least one required)
OPENAI_API_KEY=sk-your-openai-key-here
GEMINI_API_KEY=your-gemini-key-here
ANTHROPIC_API_KEY=sk-ant-your-claude-key-here

# Security
JWT_SECRET=your-secret-key-here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 5: Start Backend Server
```bash
# Development mode with hot reload
npm run dev

# Or build and start production mode
npm run build
npm start
```

The backend will be available at: `http://localhost:3001`

### Step 6: Verify Installation
```bash
# Test backend health
curl http://localhost:3001/health

# Expected response:
# {"status":"OK","timestamp":"2024-01-01T00:00:00.000Z"}
```

## 🔧 Configuration Details

### Frontend Configuration
The frontend automatically connects to the backend at `http://localhost:3001`. If you need to change this:

1. Edit `src/components/home/FileUpload.tsx`
2. Edit `src/components/home/DataAnalysis.tsx`
3. Update the fetch URLs to match your backend URL

### Backend Configuration
- **Port**: Default 3001, change via `PORT` environment variable
- **CORS**: Configured for `http://localhost:8080` by default
- **File Limits**: 50MB maximum file size
- **Rate Limiting**: 100 requests per 15 minutes per IP

### Python Environment
The backend requires these Python packages:
- pandas, numpy, matplotlib, seaborn, plotly
- openpyxl, xlrd for Excel processing
- scikit-learn, scipy for advanced analysis

## 🧪 Testing the System

### 1. Test File Upload
1. Open frontend at `http://localhost:8080`
2. Upload a CSV or Excel file
3. Verify file processing and dataset info display

### 2. Test AI Analysis
1. After file upload, enter a question like:
   - "Show me a bar chart of sales by region"
   - "Find trends in customer satisfaction over time"
   - "Create a scatter plot of price vs. rating"
2. Select AI model and output format
3. Click "Analyze & Visualize"

### 3. Test Chart Generation
1. Wait for AI analysis completion
2. View generated Python code
3. Check chart generation
4. Test download functionality

## 🔍 Troubleshooting

### Common Issues

#### Frontend Issues
```bash
# Port already in use
Error: listen EADDRINUSE: address already in use :::8080
Solution: Kill process using port 8080 or change port in vite.config.ts
```

#### Backend Issues
```bash
# Python not found
Error: spawn python3 ENOENT
Solution: Ensure Python is installed and in PATH, or update PYTHON_PATH in .env

# AI API errors
Error: AI analysis failed
Solution: Verify API keys and check API quotas
```

#### File Upload Issues
```bash
# File too large
Error: File size exceeds 50MB limit
Solution: Compress or split large files

# Unsupported format
Error: File type not supported
Solution: Convert to CSV, XLSX, or XLS format
```

### Debug Mode
```bash
# Enable detailed logging
NODE_ENV=development

# Check backend logs
npm run dev  # Shows detailed error messages

# Check Python execution
# Look for Python output in backend console
```

## 📊 Sample Datasets

For testing, you can use these sample datasets:

### Sales Data (CSV)
```csv
Region,Product,Sales,Date
North,Laptop,1200,2024-01-01
South,Phone,800,2024-01-01
East,Tablet,600,2024-01-01
West,Laptop,1100,2024-01-01
```

### Customer Data (Excel)
Create an Excel file with columns:
- Customer ID
- Name
- Age
- Satisfaction Score
- Purchase Amount

## 🚀 Production Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy dist/ folder to your web server
# Configure reverse proxy for API calls
```

### Backend Deployment
```bash
# Build TypeScript
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start dist/app.js --name "ova-backend"

# Configure environment variables
pm2 ecosystem
```

### Environment Considerations
- Use HTTPS in production
- Set up proper CORS origins
- Configure rate limiting for production load
- Set up monitoring and logging
- Use environment-specific API keys

## 🔒 Security Best Practices

1. **API Keys**: Never commit API keys to version control
2. **Environment Variables**: Use .env files for local development
3. **Rate Limiting**: Adjust limits based on your use case
4. **File Validation**: Maintain strict file type and size restrictions
5. **CORS**: Restrict origins to trusted domains only

## 📈 Performance Optimization

1. **File Processing**: Implement streaming for large files
2. **AI Caching**: Cache common analysis results
3. **Chart Caching**: Store generated charts temporarily
4. **Database**: Add database for persistent storage
5. **CDN**: Use CDN for chart delivery

## 🤝 Support and Maintenance

### Regular Maintenance
- Update Python packages: `pip install -r requirements.txt --upgrade`
- Update Node.js packages: `npm update`
- Monitor API usage and costs
- Clean up temporary files regularly

### Monitoring
- Check backend logs for errors
- Monitor API response times
- Track file upload success rates
- Monitor AI model performance

## 🔮 Next Steps

After successful setup, consider:

1. **Database Integration**: Add persistent storage for datasets and results
2. **User Authentication**: Implement user accounts and access control
3. **Advanced Features**: Add more chart types and analysis options
4. **Collaboration**: Enable sharing and collaboration features
5. **API Documentation**: Generate comprehensive API docs
6. **Testing**: Add unit and integration tests

## 📞 Getting Help

If you encounter issues:

1. Check this setup guide thoroughly
2. Review the backend README.md
3. Check console logs for error messages
4. Verify all prerequisites are met
5. Ensure environment variables are correct
6. Test with sample datasets first

## 🎉 Success!

Once everything is working, you'll have a fully functional AI data analyst system that can:
- Process various data formats
- Generate insights using multiple AI models
- Create professional visualizations
- Export results in multiple formats
- Handle multiple users securely

Happy analyzing! 🚀📊
