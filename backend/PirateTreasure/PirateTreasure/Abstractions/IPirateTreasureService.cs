using PirateTreasuresApi.Dtos;
using PirateTreasuresApi.Entities;

namespace PirateTreasuresApi.Abstractions
{
    public interface IPirateTreasureService
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="pirateTreasureSave"></param>
        /// <returns></returns>
        public Task<bool> SavePirateTreasureAsync(PirateTreasureSaveDto pirateTreasureSave);
    }
}
