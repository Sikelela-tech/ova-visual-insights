import { Router, Request, Response } from 'express';
import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const router = Router();

// Serve chart files
router.get('/charts/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const chartPath = join(process.cwd(), 'output', filename);
    
    if (!existsSync(chartPath)) {
      return res.status(404).json({ error: 'Chart not found' });
    }

    const stats = statSync(chartPath);
    const ext = filename.split('.').pop()?.toLowerCase();
    
    // Set appropriate content type
    let contentType = 'application/octet-stream';
    switch (ext) {
      case 'png':
        contentType = 'image/png';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
      case 'html':
        contentType = 'text/html';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    const fileBuffer = readFileSync(chartPath);
    res.send(fileBuffer);
  } catch (error) {
    console.error('Chart serving error:', error);
    res.status(500).json({ error: 'Internal server error while serving chart' });
  }
});

// Download chart with custom filename
router.get('/download/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const { originalName } = req.query;
    const chartPath = join(process.cwd(), 'output', filename);
    
    if (!existsSync(chartPath)) {
      return res.status(404).json({ error: 'Chart not found' });
    }

    const stats = statSync(chartPath);
    const ext = filename.split('.').pop()?.toLowerCase();
    
    // Set download headers
    const downloadName = originalName ? `${originalName}.${ext}` : filename;
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);
    
    const fileBuffer = readFileSync(chartPath);
    res.send(fileBuffer);
  } catch (error) {
    console.error('Chart download error:', error);
    res.status(500).json({ error: 'Internal server error while downloading chart' });
  }
});

// Get chart metadata
router.get('/charts/:filename/metadata', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const chartPath = join(process.cwd(), 'output', filename);
    
    if (!existsSync(chartPath)) {
      return res.status(404).json({ error: 'Chart not found' });
    }

    const stats = statSync(chartPath);
    const ext = filename.split('.').pop()?.toLowerCase();
    
    const metadata = {
      filename,
      originalName: filename,
      size: stats.size,
      sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
      format: ext,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      contentType: this.getContentType(ext || ''),
      downloadUrl: `/api/results/download/${filename}`,
      viewUrl: `/api/results/charts/${filename}`
    };

    res.json({
      success: true,
      metadata
    });
  } catch (error) {
    console.error('Chart metadata error:', error);
    res.status(500).json({ error: 'Internal server error while getting chart metadata' });
  }
});

// List all available charts
router.get('/charts', (req: Request, res: Response) => {
  try {
    const fs = require('fs');
    const outputDir = join(process.cwd(), 'output');
    
    if (!existsSync(outputDir)) {
      return res.json({
        success: true,
        charts: []
      });
    }

    const files = fs.readdirSync(outputDir);
    const charts = files
      .filter(file => {
        const ext = file.split('.').pop()?.toLowerCase();
        return ['png', 'jpg', 'jpeg', 'svg', 'html'].includes(ext || '');
      })
      .map(file => {
        const filePath = join(outputDir, file);
        const stats = statSync(filePath);
        const ext = file.split('.').pop()?.toLowerCase();
        
        return {
          filename: file,
          size: stats.size,
          sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
          format: ext,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          downloadUrl: `/api/results/download/${file}`,
          viewUrl: `/api/results/charts/${file}`
        };
      })
      .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

    res.json({
      success: true,
      charts,
      total: charts.length
    });
  } catch (error) {
    console.error('Chart listing error:', error);
    res.status(500).json({ error: 'Internal server error while listing charts' });
  }
});

// Export chart in different format
router.post('/export/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const { targetFormat } = req.body;
    
    if (!targetFormat) {
      return res.status(400).json({ error: 'Target format is required' });
    }

    const supportedFormats = ['png', 'jpg', 'svg', 'html'];
    if (!supportedFormats.includes(targetFormat)) {
      return res.status(400).json({ 
        error: `Unsupported format. Supported formats: ${supportedFormats.join(', ')}` 
      });
    }

    // In a real implementation, you would convert the chart to the target format
    // For now, we'll return a success message
    res.json({
      success: true,
      message: `Chart export to ${targetFormat} format initiated`,
      originalFile: filename,
      targetFormat,
      exportUrl: `/api/results/download/${filename.replace(/\.[^/.]+$/, '')}.${targetFormat}`
    });
  } catch (error) {
    console.error('Chart export error:', error);
    res.status(500).json({ error: 'Internal server error while exporting chart' });
  }
});

// Delete chart
router.delete('/charts/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const chartPath = join(process.cwd(), 'output', filename);
    
    if (!existsSync(chartPath)) {
      return res.status(404).json({ error: 'Chart not found' });
    }

    const fs = require('fs');
    fs.unlinkSync(chartPath);
    
    res.json({
      success: true,
      message: 'Chart deleted successfully'
    });
  } catch (error) {
    console.error('Chart deletion error:', error);
    res.status(500).json({ error: 'Internal server error while deleting chart' });
  }
});

// Helper method to get content type
private getContentType(ext: string): string {
  switch (ext.toLowerCase()) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'svg':
      return 'image/svg+xml';
    case 'html':
      return 'text/html';
    default:
      return 'application/octet-stream';
  }
}

export { router as resultsRoutes };
