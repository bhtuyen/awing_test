using Microsoft.AspNetCore.Mvc;
using PirateTreasuresApi.Abstractions;
using PirateTreasuresApi.Dtos;
using System.Threading.Tasks;

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
        /// 
        /// </summary>
        /// <param name="pirateTreasureSave"></param>
        /// <returns></returns>
        [HttpPost()]
        public async Task<IActionResult> SavePirateTreasure([FromBody] PirateTreasureSaveDto pirateTreasureSave)
        {
            var result = await _pirateTreasureService.SavePirateTreasureAsync(pirateTreasureSave);
            return Ok(result);
        }
    }
}
