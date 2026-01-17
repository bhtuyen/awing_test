using PirateTreasuresApi.Entities;

namespace PirateTreasuresApi.Abstractions
{
    public interface IPirateTreasureRepo
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="pirateTreasure"></param>
        /// <returns></returns>
        public Task<bool> SavePirateTreasureAsync(PirateTreasureEntity pirateTreasure);
    }
}
