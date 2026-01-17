using PirateTreasuresApi.Enums;

namespace PirateTreasuresApi.Exceptions
{
    public class BusinessException : Exception
    {
        private readonly BusinessExceptionCode ExceptionCode;

        public BusinessException(string message, BusinessExceptionCode exceptionCode) : base(message)
        {
            ExceptionCode = exceptionCode;
        }
    }
}
