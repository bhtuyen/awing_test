using System.Net;
using System.Text.Json;
using PirateTreasuresApi.Dtos;
using PirateTreasuresApi.Exceptions;

namespace PirateTreasuresApi.Middlewares
{
    /// <summary>
    /// Middleware xử lý exception toàn cục cho hệ thống
    /// </summary>
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;
        private readonly IHostEnvironment _environment;

        public GlobalExceptionMiddleware(
            RequestDelegate next,
            ILogger<GlobalExceptionMiddleware> logger,
            IHostEnvironment environment)
        {
            _next = next;
            _logger = logger;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var traceId = context.TraceIdentifier;
            var path = context.Request.Path;

            ErrorResponseDto errorResponse;
            int statusCode;

            switch (exception)
            {
                case BusinessException businessEx:
                    // Lỗi nghiệp vụ - log warning
                    _logger.LogWarning(
                        exception,
                        "Business exception occurred. Code: {Code}, Message: {Message}, Path: {Path}, TraceId: {TraceId}",
                        businessEx.ExceptionCode,
                        businessEx.Message,
                        path,
                        traceId);

                    statusCode = businessEx.StatusCode;
                    errorResponse = new ErrorResponseDto
                    {
                        Code = businessEx.ExceptionCode.ToString(),
                        Message = businessEx.Message,
                        Path = path,
                        TraceId = traceId
                    };
                    break;

                case ArgumentNullException argNullEx:
                    // Lỗi tham số null
                    _logger.LogWarning(
                        exception,
                        "Argument null exception. Parameter: {ParamName}, Path: {Path}, TraceId: {TraceId}",
                        argNullEx.ParamName,
                        path,
                        traceId);

                    statusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse = new ErrorResponseDto
                    {
                        Code = "ArgumentNull",
                        Message = $"Tham số '{argNullEx.ParamName}' không được để trống.",
                        Path = path,
                        TraceId = traceId
                    };
                    break;

                case ArgumentException argEx:
                    // Lỗi tham số không hợp lệ
                    _logger.LogWarning(
                        exception,
                        "Argument exception. Message: {Message}, Path: {Path}, TraceId: {TraceId}",
                        argEx.Message,
                        path,
                        traceId);

                    statusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse = new ErrorResponseDto
                    {
                        Code = "InvalidArgument",
                        Message = argEx.Message,
                        Path = path,
                        TraceId = traceId
                    };
                    break;

                case UnauthorizedAccessException:
                    // Lỗi không có quyền truy cập
                    _logger.LogWarning(
                        exception,
                        "Unauthorized access. Path: {Path}, TraceId: {TraceId}",
                        path,
                        traceId);

                    statusCode = (int)HttpStatusCode.Unauthorized;
                    errorResponse = new ErrorResponseDto
                    {
                        Code = "Unauthorized",
                        Message = "Bạn không có quyền truy cập tài nguyên này.",
                        Path = path,
                        TraceId = traceId
                    };
                    break;

                case KeyNotFoundException:
                    // Lỗi không tìm thấy
                    _logger.LogWarning(
                        exception,
                        "Resource not found. Path: {Path}, TraceId: {TraceId}",
                        path,
                        traceId);

                    statusCode = (int)HttpStatusCode.NotFound;
                    errorResponse = new ErrorResponseDto
                    {
                        Code = "NotFound",
                        Message = "Không tìm thấy tài nguyên yêu cầu.",
                        Path = path,
                        TraceId = traceId
                    };
                    break;

                case OperationCanceledException:
                    // Request bị hủy
                    _logger.LogInformation(
                        "Request cancelled. Path: {Path}, TraceId: {TraceId}",
                        path,
                        traceId);

                    statusCode = 499; // Client Closed Request
                    errorResponse = new ErrorResponseDto
                    {
                        Code = "RequestCancelled",
                        Message = "Yêu cầu đã bị hủy.",
                        Path = path,
                        TraceId = traceId
                    };
                    break;

                default:
                    // Lỗi không xác định - log error với full stack trace
                    _logger.LogError(
                        exception,
                        "Unhandled exception occurred. Path: {Path}, TraceId: {TraceId}",
                        path,
                        traceId);

                    statusCode = (int)HttpStatusCode.InternalServerError;
                    errorResponse = new ErrorResponseDto
                    {
                        Code = "InternalServerError",
                        Message = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
                        Path = path,
                        TraceId = traceId
                    };

                    // Chỉ hiển thị chi tiết lỗi trong môi trường Development
                    if (_environment.IsDevelopment())
                    {
                        errorResponse.Details = exception.ToString();
                    }
                    break;
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            };

            var json = JsonSerializer.Serialize(errorResponse, jsonOptions);
            await context.Response.WriteAsync(json);
        }
    }

    /// <summary>
    /// Extension method để đăng ký middleware
    /// </summary>
    public static class GlobalExceptionMiddlewareExtensions
    {
        public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app)
        {
            return app.UseMiddleware<GlobalExceptionMiddleware>();
        }
    }
}
