import multer from 'multer';
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

export interface DatasetInfo {
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

export interface FileUploadResult {
  success: boolean;
  datasetInfo?: DatasetInfo;
  error?: string;
}

export class FileProcessingService {
  private uploadDir: string;
  private allowedExtensions = ['.csv', '.xlsx', '.xls'];

  constructor() {
    this.uploadDir = join(process.cwd(), 'uploads');
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // Configure multer for file uploads
  getUploadMiddleware() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      const ext = extname(file.originalname).toLowerCase();
      if (this.allowedExtensions.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${ext} is not allowed. Please upload CSV or Excel files.`));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 1
      }
    });
  }

  async processUploadedFile(file: Express.Multer.File): Promise<FileUploadResult> {
    try {
      const filePath = join(this.uploadDir, file.filename);
      const fileStats = require('fs').statSync(filePath);
      
      let datasetInfo: DatasetInfo;

      if (file.mimetype === 'text/csv' || extname(file.originalname).toLowerCase() === '.csv') {
        datasetInfo = await this.processCSVFile(filePath, file);
      } else {
        datasetInfo = await this.processExcelFile(filePath, file);
      }

      return {
        success: true,
        datasetInfo
      };
    } catch (error) {
      // Clean up uploaded file on error
      const filePath = join(this.uploadDir, file.filename);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'File processing failed'
      };
    }
  }

  private async processCSVFile(filePath: string, file: Express.Multer.File): Promise<DatasetInfo> {
    const csvContent = readFileSync(filePath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row');
    }

    const headers = this.parseCSVLine(lines[0]);
    const dataRows = lines.slice(1).map(line => this.parseCSVLine(line));
    
    // Filter out empty rows
    const validDataRows = dataRows.filter(row => row.some(cell => cell.trim() !== ''));
    
    const dataTypes = this.inferDataTypes(headers, validDataRows);
    const sampleData = validDataRows.slice(0, 5);

    return {
      id: uuidv4(),
      filename: file.filename,
      originalName: file.originalname,
      columns: headers,
      dataTypes,
      rowCount: validDataRows.length,
      sampleData,
      filePath,
      uploadTime: new Date(),
      fileSize: file.size
    };
  }

  private async processExcelFile(filePath: string, file: Express.Multer.File): Promise<DatasetInfo> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      if (!worksheet) {
        throw new Error('No worksheet found in Excel file');
      }

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        throw new Error('Excel file must contain at least a header row and one data row');
      }

      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1) as any[][];
      
      // Filter out empty rows
      const validDataRows = dataRows.filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''));
      
      const dataTypes = this.inferDataTypes(headers, validDataRows);
      const sampleData = validDataRows.slice(0, 5);

      return {
        id: uuidv4(),
        filename: file.filename,
        originalName: file.originalname,
        columns: headers,
        dataTypes,
        rowCount: validDataRows.length,
        sampleData,
        filePath,
        uploadTime: new Date(),
        fileSize: file.size
      };
    } catch (error) {
      throw new Error(`Excel processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private inferDataTypes(headers: string[], dataRows: any[][]): Record<string, string> {
    const dataTypes: Record<string, string> = {};
    
    headers.forEach((header, colIndex) => {
      const columnValues = dataRows.map(row => row[colIndex]).filter(val => val !== null && val !== undefined && val !== '');
      
      if (columnValues.length === 0) {
        dataTypes[header] = 'string';
        return;
      }

      const sampleValue = columnValues[0];
      
      if (typeof sampleValue === 'number' || !isNaN(Number(sampleValue))) {
        dataTypes[header] = 'number';
      } else if (sampleValue instanceof Date || !isNaN(Date.parse(sampleValue))) {
        dataTypes[header] = 'date';
      } else {
        dataTypes[header] = 'string';
      }
    });
    
    return dataTypes;
  }

  async getDatasetInfo(datasetId: string): Promise<DatasetInfo | null> {
    try {
      // In a real application, you'd store this in a database
      // For now, we'll scan the uploads directory
      const fs = require('fs');
      const files = fs.readdirSync(this.uploadDir);
      
      for (const file of files) {
        if (file.includes(datasetId)) {
          const filePath = join(this.uploadDir, file);
          const stats = fs.statSync(filePath);
          
          // Re-process the file to get info
          const mockFile = {
            filename: file,
            originalname: file,
            size: stats.size,
            mimetype: this.getMimeType(file)
          } as Express.Multer.File;
          
          const result = await this.processUploadedFile(mockFile);
          return result.datasetInfo || null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting dataset info:', error);
      return null;
    }
  }

  private getMimeType(filename: string): string {
    const ext = extname(filename).toLowerCase();
    switch (ext) {
      case '.csv':
        return 'text/csv';
      case '.xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case '.xls':
        return 'application/vnd.ms-excel';
      default:
        return 'application/octet-stream';
    }
  }

  async deleteDataset(datasetId: string): Promise<boolean> {
    try {
      const fs = require('fs');
      const files = fs.readdirSync(this.uploadDir);
      
      for (const file of files) {
        if (file.includes(datasetId)) {
          const filePath = join(this.uploadDir, file);
          unlinkSync(filePath);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting dataset:', error);
      return false;
    }
  }

  async cleanupOldFiles(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const fs = require('fs');
      const currentTime = Date.now();
      const files = fs.readdirSync(this.uploadDir);
      
      files.forEach((file: string) => {
        const filePath = join(this.uploadDir, file);
        const stats = fs.statSync(filePath);
        
        if (currentTime - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error('Upload cleanup failed:', error);
    }
  }
}
