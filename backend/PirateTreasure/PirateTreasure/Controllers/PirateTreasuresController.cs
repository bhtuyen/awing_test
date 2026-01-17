using Microsoft.AspNetCore.Mvc;
using PirateTreasuresApi.Abstractions;
using PirateTreasuresApi.Dtos;

namespace PirateTreasuresApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PirateTreasuresController : ControllerBase
    {
        private readonly IPirateTreasureService _pirateTreasureService;

        public PirateTreasuresController(IPirateTreasureService pirateTreasureService)
        {
            _pirateTreasureService = pirateTreasureService;
        }

        /// <summary>
        /// Lấy danh sách tất cả bản đồ kho báu
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _pirateTreasureService.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Lấy chi tiết bản đồ kho báu theo ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _pirateTreasureService.GetByIdAsync(id);

            if (result == null)
            {
                return NotFound(new { message = $"Không tìm thấy bản đồ với ID: {id}" });
            }

            return Ok(result);
        }

        /// <summary>
        /// Lưu bản đồ kho báu mới
        /// </summary>
        /// <param name="pirateTreasureSave"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> SavePirateTreasure([FromBody] PirateTreasureSaveDto pirateTreasureSave)
        {
            var result = await _pirateTreasureService.SavePirateTreasureAsync(pirateTreasureSave);
            return Ok(result);
        }

        /// <summary>
        /// Cập nhật bản đồ kho báu
        /// </summary>
        /// <param name="id"></param>
        /// <param name="pirateTreasureUpdate"></param>
        /// <returns></returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePirateTreasure(Guid id, [FromBody] PirateTreasureUpdateDto pirateTreasureUpdate)
        {
            var result = await _pirateTreasureService.UpdatePirateTreasureAsync(id, pirateTreasureUpdate);

            if (result == null)
            {
                return NotFound(new { message = $"Không tìm thấy bản đồ với ID: {id}" });
            }

            return Ok(result);
        }

        /// <summary>
        /// Xóa bản đồ kho báu theo ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePirateTreasure(Guid id)
        {
            var result = await _pirateTreasureService.DeleteByIdAsync(id);

            if (!result)
            {
                return NotFound(new { message = $"Không tìm thấy bản đồ với ID: {id}" });
            }

            return Ok(new { message = "Xóa bản đồ thành công" });
        }

        /// <summary>
        /// Kiểm tra trạng thái kết nối của API
        /// </summary>
        /// <returns></returns>
        [HttpGet("health")]
        [HttpHead("health")]
        public IActionResult HealthCheck()
        {
            var healthResponse = new
            {
                status = "healthy",
                message = "API đang hoạt động bình thường",
                timestamp = DateTime.UtcNow
            };

            return Ok(healthResponse);
        }
    }
}
