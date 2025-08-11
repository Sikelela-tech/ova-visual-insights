# Troubleshooting Guide

This guide helps resolve common issues when setting up the O.V.A AI Data Analyst Backend.

## 🚨 Common Installation Issues

### 1. npm install fails with version errors

**Problem**: `npm error code ETARGET` or version conflicts

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

**Windows**:
```cmd
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rmdir /s node_modules
del package-lock.json

# Reinstall dependencies
npm install
```

### 2. Python not found errors

**Problem**: `Error: spawn python ENOENT` or `Error: spawn python3 ENOENT`

**Solutions**:

**Windows**:
1. Ensure Python is installed from [python.org](https://python.org)
2. Add Python to PATH during installation
3. Verify installation:
   ```cmd
   python --version
   ```
4. If using `python3`, create an alias:
   ```cmd
   doskey python3=python
   ```

**macOS/Linux**:
1. Install Python 3.8+:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install python3 python3-pip
   
   # macOS
   brew install python3
   ```
2. Verify installation:
   ```bash
   python3 --version
   ```

### 3. AI API Key errors

**Problem**: `AI analysis failed` or authentication errors

**Solutions**:
1. Check your `.env` file exists and has correct API keys
2. Verify API keys are valid and have sufficient credits
3. Test API keys separately:
   ```bash
   # Test OpenAI
   curl -H "Authorization: Bearer YOUR_OPENAI_KEY" \
        https://api.openai.com/v1/models
   
   # Test Gemini (requires different approach)
   # Check Google AI Studio dashboard
   ```

### 4. Port already in use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solutions**:
```bash
# Find process using port 3001
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in .env file
PORT=3002
```

### 5. Python package installation fails

**Problem**: `pip install -r requirements.txt` fails

**Solutions**:
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install packages one by one
pip install pandas
pip install numpy
pip install matplotlib
pip install seaborn
pip install plotly
pip install openpyxl
pip install xlrd

# Or use conda if you have Anaconda
conda install pandas numpy matplotlib seaborn plotly openpyxl xlrd
```

## 🔧 Environment-Specific Issues

### Windows Issues

**PowerShell Execution Policy**:
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Path Issues**:
1. Add Python and Node.js to system PATH
2. Restart command prompt after PATH changes
3. Use `start.bat` or `start.ps1` scripts

**Python Path**:
- The system automatically uses `python` on Windows
- If you have both `python` and `python3`, ensure `python` points to Python 3.8+

### macOS Issues

**Permission Errors**:
```bash
# Fix npm permissions
sudo chown -R $USER /usr/local/lib/node_modules
sudo chown -R $USER ~/.npm

# Fix Python permissions
sudo chown -R $USER /usr/local/lib/python3.x
```

**Python Version Conflicts**:
```bash
# Use pyenv to manage Python versions
brew install pyenv
pyenv install 3.8.0
pyenv global 3.8.0
```

### Linux Issues

**Missing Dependencies**:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install build-essential python3-dev

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
sudo yum install python3-devel
```

**Python Package Issues**:
```bash
# Install system dependencies for matplotlib
sudo apt install libfreetype6-dev libpng-dev
```

## 🐛 Runtime Issues

### 1. File Upload Fails

**Problem**: File upload returns 400 or 500 errors

**Solutions**:
1. Check file size (max 50MB)
2. Verify file format (CSV, XLSX, XLS only)
3. Check file encoding (use UTF-8)
4. Ensure file has header row and data rows

### 2. AI Analysis Fails

**Problem**: Analysis returns errors or timeouts

**Solutions**:
1. Check API key validity and quotas
2. Verify dataset format and size
3. Check Python environment and packages
4. Review backend logs for specific errors

### 3. Chart Generation Fails

**Problem**: Python execution fails or charts not generated

**Solutions**:
1. Verify Python packages are installed
2. Check Python path in system
3. Ensure dataset file is accessible
4. Check output directory permissions

### 4. CORS Errors

**Problem**: Frontend can't connect to backend

**Solutions**:
1. Check `.env` file has correct `FRONTEND_URL`
2. Verify backend is running on correct port
3. Check CORS configuration in `app.ts`
4. Ensure frontend URL matches exactly

## 📊 Debug Mode

Enable detailed logging:

```bash
# Set environment variable
export NODE_ENV=development  # macOS/Linux
set NODE_ENV=development     # Windows

# Or add to .env file
NODE_ENV=development
```

## 🔍 Log Analysis

**Backend Logs**:
- Check console output for error messages
- Look for Python execution errors
- Verify API call responses
- Check file system operations

**Frontend Logs**:
- Open browser Developer Tools
- Check Console tab for errors
- Check Network tab for failed requests
- Verify API endpoint URLs

## 🆘 Getting Help

If you're still experiencing issues:

1. **Check this troubleshooting guide thoroughly**
2. **Review the main README.md**
3. **Check console logs for specific error messages**
4. **Verify all prerequisites are met**
5. **Test with minimal configuration**
6. **Create an issue with detailed error information**

### Issue Report Template

```
**Environment**: Windows 10 / macOS 12 / Ubuntu 20.04
**Node.js Version**: v18.0.0
**Python Version**: 3.8.0
**Error Message**: [Paste exact error]
**Steps to Reproduce**: [List steps]
**Expected Behavior**: [What should happen]
**Actual Behavior**: [What actually happens]
**Console Logs**: [Paste relevant logs]
```

## ✅ Quick Health Check

Run these commands to verify your setup:

```bash
# Check Node.js
node --version
npm --version

# Check Python
python --version  # or python3 --version
pip --version     # or pip3 --version

# Check if backend starts
cd backend
npm run dev

# Test backend health
curl http://localhost:3001/health
```

If all checks pass, your backend should be working correctly!
