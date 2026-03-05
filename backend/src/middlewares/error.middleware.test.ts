import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from './error.middleware';
import { AppError } from '../shared/errors/AppError';

const mockRequest = {} as Request;
const mockNext = vi.fn() as unknown as NextFunction;

function mockResponse() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('errorMiddleware', () => {
  it('should handle AppError with correct status code and message', () => {
    const res = mockResponse();
    const error = new AppError('Not found', 404);

    errorMiddleware(error, mockRequest, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Not found',
    });
  });

  it('should handle unknown errors with 500 status', () => {
    const res = mockResponse();
    const error = new Error('Unexpected error');

    errorMiddleware(error, mockRequest, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal server error',
    });
  });
});
