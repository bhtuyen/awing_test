using PirateTreasuresApi.Entities;

namespace PirateTreasuresApi.Abstractions
{
    public interface IPirateTreasureRepo
    {
        /// <summary>
        /// Lưu bản đồ kho báu
        /// </summary>
        /// <param name="pirateTreasure"></param>
        /// <returns></returns>
        Task<bool> SavePirateTreasureAsync(PirateTreasureEntity pirateTreasure);

        /// <summary>
        /// Lấy danh sách tất cả bản đồ kho báu
        /// </summary>
        /// <returns></returns>
        Task<List<PirateTreasureEntity>> GetAllAsync();

        /// <summary>
        /// Lấy chi tiết bản đồ kho báu theo ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<PirateTreasureEntity?> GetByIdAsync(Guid id);

        /// <summary>
        /// Cập nhật bản đồ kho báu
        /// </summary>
        /// <param name="pirateTreasure"></param>
        /// <returns></returns>
        Task<bool> UpdatePirateTreasureAsync(PirateTreasureEntity pirateTreasure);

        /// <summary>
        /// Xóa bản đồ kho báu theo ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> DeleteByIdAsync(Guid id);
    }
}
