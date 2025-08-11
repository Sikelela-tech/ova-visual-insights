import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode = 500, message } = error;

  // Log error for debugging
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    if (error.message === 'LIMIT_FILE_SIZE') {
      message = 'File size too large. Maximum size is 50MB.';
    } else if (error.message === 'LIMIT_FILE_COUNT') {
      message = 'Too many files. Only one file allowed.';
    } else {
      message = 'File upload error';
    }
  } else if (error.name === 'SyntaxError') {
    statusCode = 400;
    message = 'Invalid JSON format';
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    success: false,
    error: {
      message: isDevelopment ? message : 'Internal server error',
      ...(isDevelopment && { stack: error.stack }),
      ...(isDevelopment && { details: error.message })
    },
    timestamp: new Date().toISOString(),
    path: req.url
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      path: req.url
    },
    timestamp: new Date().toISOString()
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
