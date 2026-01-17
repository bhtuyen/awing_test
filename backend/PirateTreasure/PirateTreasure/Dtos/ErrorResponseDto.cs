using System.Text.Json.Serialization;

namespace PirateTreasuresApi.Dtos
{
    /// <summary>
    /// DTO chuẩn cho response lỗi của hệ thống
    /// </summary>
    public class ErrorResponseDto
    {
        /// <summary>
        /// Mã lỗi định danh (enum code hoặc error code string)
        /// </summary>
        public string Code { get; set; } = string.Empty;

        /// <summary>
        /// Thông điệp lỗi chi tiết
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Thời gian xảy ra lỗi
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Đường dẫn request gây ra lỗi
        /// </summary>
        public string? Path { get; set; }

        /// <summary>
        /// Chi tiết lỗi bổ sung (chỉ hiển thị trong Development)
        /// </summary>
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Details { get; set; }

        /// <summary>
        /// Trace ID để tracking lỗi
        /// </summary>
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? TraceId { get; set; }
    }
}
