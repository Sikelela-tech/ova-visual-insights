import { Router, Request, Response } from 'express';
import { FileProcessingService } from '../services/fileProcessingService.js';

const router = Router();
const fileProcessingService = new FileProcessingService();

// Upload dataset endpoint
router.post('/', fileProcessingService.getUploadMiddleware().single('dataset'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await fileProcessingService.processUploadedFile(req.file);
    
    if (result.success && result.datasetInfo) {
      res.status(201).json({
        message: 'Dataset uploaded successfully',
        dataset: result.datasetInfo
      });
    } else {
      res.status(400).json({
        error: result.error || 'File processing failed'
      });
    }
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      error: 'Internal server error during file upload'
    });
  }
});

// Get dataset info endpoint
router.get('/:datasetId', async (req: Request, res: Response) => {
  try {
    const { datasetId } = req.params;
    const datasetInfo = await fileProcessingService.getDatasetInfo(datasetId);
    
    if (datasetInfo) {
      res.json({
        success: true,
        dataset: datasetInfo
      });
    } else {
      res.status(404).json({
        error: 'Dataset not found'
      });
    }
  } catch (error) {
    console.error('Get dataset info error:', error);
    res.status(500).json({
      error: 'Internal server error while retrieving dataset info'
    });
  }
});

// Delete dataset endpoint
router.delete('/:datasetId', async (req: Request, res: Response) => {
  try {
    const { datasetId } = req.params;
    const deleted = await fileProcessingService.deleteDataset(datasetId);
    
    if (deleted) {
      res.json({
        message: 'Dataset deleted successfully'
      });
    } else {
      res.status(404).json({
        error: 'Dataset not found'
      });
    }
  } catch (error) {
    console.error('Delete dataset error:', error);
    res.status(500).json({
      error: 'Internal server error while deleting dataset'
    });
  }
});

// Validate file endpoint (without processing)
router.post('/validate', fileProcessingService.getUploadMiddleware().single('dataset'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Basic validation
    const fileSize = req.file.size;
    const fileType = req.file.mimetype;
    const fileName = req.file.originalname;

    const validation = {
      isValid: true,
      fileName,
      fileSize,
      fileType,
      sizeInMB: (fileSize / (1024 * 1024)).toFixed(2),
      allowedTypes: ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
    };

    // Check file size (50MB limit)
    if (fileSize > 50 * 1024 * 1024) {
      validation.isValid = false;
      validation.fileType = 'File size exceeds 50MB limit';
    }

    // Check file type
    if (!validation.allowedTypes.includes(fileType)) {
      validation.isValid = false;
      validation.fileType = 'File type not supported';
    }

    res.json({
      message: 'File validation completed',
      validation
    });

    // Clean up the uploaded file since this is just validation
    const fs = require('fs');
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  } catch (error) {
    console.error('File validation error:', error);
    res.status(500).json({
      error: 'Internal server error during file validation'
    });
  }
});

export { router as fileUploadRoutes };
