using PirateTreasuresApi.Dtos;
using PirateTreasuresApi.Entities;

namespace PirateTreasuresApi.Abstractions
{
    public interface IPirateTreasureService
    {
        /// <summary>
        /// Lưu bản đồ kho báu
        /// </summary>
        /// <param name="pirateTreasureSave"></param>
        /// <returns></returns>
        Task<PirateTreasureEntity> SavePirateTreasureAsync(PirateTreasureSaveDto pirateTreasureSave);

        /// <summary>
        /// Lấy danh sách tất cả bản đồ kho báu
        /// </summary>
        /// <returns></returns>
        Task<List<PirateTreasureListDto>> GetAllAsync();

        /// <summary>
        /// Lấy chi tiết bản đồ kho báu theo ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<PirateTreasureDetailDto?> GetByIdAsync(Guid id);

        /// <summary>
        /// Cập nhật bản đồ kho báu
        /// </summary>
        /// <param name="id"></param>
        /// <param name="pirateTreasureUpdate"></param>
        /// <returns></returns>
        Task<PirateTreasureDetailDto?> UpdatePirateTreasureAsync(Guid id, PirateTreasureUpdateDto pirateTreasureUpdate);

        /// <summary>
        /// Xóa bản đồ kho báu theo ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> DeleteByIdAsync(Guid id);
    }
}
