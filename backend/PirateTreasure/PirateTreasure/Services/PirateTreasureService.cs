using PirateTreasuresApi.Abstractions;
using PirateTreasuresApi.Dtos;
using PirateTreasuresApi.Entities;
using PirateTreasuresApi.Enums;
using PirateTreasuresApi.Exceptions;
using System.Text.Json;

namespace PirateTreasuresApi.Services
{
    public class PirateTreasureService : IPirateTreasureService
    {
        private readonly IPirateTreasureRepo _pirateTreasureRepo;

        public PirateTreasureService(IPirateTreasureRepo pirateTreasureRepo)
        {
            _pirateTreasureRepo = pirateTreasureRepo;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="pirateTreasureSave"></param>
        /// <returns></returns>
        public async Task<bool> SavePirateTreasureAsync(PirateTreasureSaveDto pirateTreasureSave)
        {
            // Kiểm tra dữ liệu trước khi lưu
            ValidateDataBeforeSave(pirateTreasureSave);

            var OptimalPath = FindOptimalPath(pirateTreasureSave);

            var dataSave = new PirateTreasureEntity
            {
                pirate_treasure_id = Guid.NewGuid(),
                pirate_treasure_name = pirateTreasureSave.pirate_treasure_name,
                map_rows = pirateTreasureSave.map_rows,
                map_columns = pirateTreasureSave.map_columns,
                treasure_chest_number = pirateTreasureSave.treasure_chest_number,
                map_data = JsonSerializer.Serialize(pirateTreasureSave.Matrix),
                optimal_path = JsonSerializer.Serialize(OptimalPath),
                created_date = DateTime.Now
            };

            return await _pirateTreasureRepo.SavePirateTreasureAsync(dataSave);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="pirateTreasureSave"></param>
        private static int[][] FindOptimalPath(PirateTreasureSaveDto pirateTreasureSave)
        {
            return [];
        }

        /// <summary>
        /// Hàm kiểm tra dữ liệu trước khi lưu
        /// </summary>
        /// <param name="pirateTreasureSave"></param>
        /// <returns></returns>
        /// <exception cref="BusinessException"></exception>
        private static void ValidateDataBeforeSave(PirateTreasureSaveDto pirateTreasureSave)
        {
            if (pirateTreasureSave.Matrix == null || pirateTreasureSave.Matrix.Length == 0 || pirateTreasureSave.Matrix[0].Length == 0)
            {
                throw new BusinessException("Ma trận không có dữ liệu!", BusinessExceptionCode.MatrixEmpty);
            }

            if (pirateTreasureSave.map_rows < 1 || pirateTreasureSave.map_rows > 500 || pirateTreasureSave.map_columns < 1 || pirateTreasureSave.map_columns > 500)
            {
                throw new BusinessException("Kích thước bản đồ không hợp lệ!", BusinessExceptionCode.OutOfRange);
            }

            if (pirateTreasureSave.Matrix.Length != pirateTreasureSave.map_rows)
            {
                throw new BusinessException("Số hàng của ma trận không khớp với số được nhập!", BusinessExceptionCode.DimensionNotMatched);
            }

            if (pirateTreasureSave.Matrix[0].Length != pirateTreasureSave.map_columns)
            {
                throw new BusinessException("Số cột của ma trận không khớp với số được nhập!", BusinessExceptionCode.DimensionNotMatched);
            }

            if (pirateTreasureSave.treasure_chest_number < 1 || pirateTreasureSave.treasure_chest_number > (pirateTreasureSave.map_rows * pirateTreasureSave.map_columns))
            {
                throw new BusinessException("Số của rương kho báu không hợp lệ!", BusinessExceptionCode.OutOfRange);
            }
        }
    }
}
