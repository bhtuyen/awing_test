using PirateTreasuresApi.Enums;

namespace PirateTreasuresApi.Exceptions
{
    /// <summary>
    /// Exception cho các lỗi nghiệp vụ của hệ thống
    /// </summary>
    public class BusinessException : Exception
    {
        /// <summary>
        /// Mã lỗi nghiệp vụ
        /// </summary>
        public BusinessExceptionCode ExceptionCode { get; }

        /// <summary>
        /// HTTP Status Code tương ứng (mặc định là 400 Bad Request)
        /// </summary>
        public int StatusCode { get; }

        public BusinessException(string message, BusinessExceptionCode exceptionCode, int statusCode = 400) 
            : base(message)
        {
            ExceptionCode = exceptionCode;
            StatusCode = statusCode;
        }
    }
}
