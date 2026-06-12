import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Neo4jError } from 'neo4j-driver';

@Catch()
export class Neo4jExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: any = 'Lỗi hệ thống CSDL Đồ thị';

        // Bắt lỗi trùng lặp dữ liệu (Constraint Violated) của Neo4j
        if (exception instanceof Neo4jError && exception.code?.includes('ConstraintValidationFailed')) {
            status = HttpStatus.CONFLICT;
            message = 'Dữ liệu đã tồn tại trên Đồ thị (Trùng mã định danh)';
        } else if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse: any = exception.getResponse();
            message = exceptionResponse.message || exception.message;
        }

        // In log ra console để dễ debug
        console.error(`[Exception Filter] Status: ${status} - Error:`, exception);

        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
        });
    }
}