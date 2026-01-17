using PirateTreasuresApi.Abstractions;
using PirateTreasuresApi.Dtos;
using PirateTreasuresApi.Entities;
using PirateTreasuresApi.Enums;
using PirateTreasuresApi.Exceptions;
using System.Text.Json;

namespace PirateTreasuresApi.Services
{
    /// <summary>
    /// Vị trí trong ma trận (1-indexed)
    /// </summary>
    public class Position
    {
        public int Row { get; set; }
        public int Col { get; set; }

        public Position(int row, int col)
        {
            Row = row;
            Col = col;
        }
    }

    /// <summary>
    /// Một bước di chuyển
    /// </summary>
    public class Step
    {
        public Position From { get; set; } = null!;
        public Position To { get; set; } = null!;
        public int ChestNumber { get; set; }
        public double Distance { get; set; }
    }

    /// <summary>
    /// Entry cho DP
    /// </summary>
    internal class DpEntry
    {
        public double Dist { get; set; }
        public int PrevChest { get; set; }
        public int PrevPosIndex { get; set; }
    }

    public class PirateTreasureService : IPirateTreasureService
    {
        private readonly IPirateTreasureRepo _pirateTreasureRepo;

        public PirateTreasureService(IPirateTreasureRepo pirateTreasureRepo)
        {
            _pirateTreasureRepo = pirateTreasureRepo;
        }

        /// <summary>
        /// Lưu bản đồ kho báu
        /// </summary>
        /// <param name="pirateTreasureSave"></param>
        /// <returns></returns>
        public async Task<PirateTreasureEntity> SavePirateTreasureAsync(PirateTreasureSaveDto pirateTreasureSave)
        {
            // Kiểm tra dữ liệu trước khi lưu
            ValidateDataBeforeSave(pirateTreasureSave);

            var optimalPath = FindOptimalPath(pirateTreasureSave.Matrix, pirateTreasureSave.treasure_chest_number);
            var totalFuel = optimalPath.Sum(s => s.Distance);

            var dataSave = new PirateTreasureEntity
            {
                pirate_treasure_id = Guid.NewGuid(),
                pirate_treasure_name = pirateTreasureSave.pirate_treasure_name,
                map_rows = pirateTreasureSave.map_rows,
                map_columns = pirateTreasureSave.map_columns,
                treasure_chest_number = pirateTreasureSave.treasure_chest_number,
                map_data = JsonSerializer.Serialize(pirateTreasureSave.Matrix),
                optimal_path = JsonSerializer.Serialize(optimalPath),
                total_fuel = totalFuel,
                created_date = DateTime.Now
            };

            await _pirateTreasureRepo.SavePirateTreasureAsync(dataSave);
            return dataSave;
        }

        /// <summary>
        /// Lấy danh sách tất cả bản đồ kho báu
        /// </summary>
        /// <returns></returns>
        public async Task<List<PirateTreasureListDto>> GetAllAsync()
        {
            var entities = await _pirateTreasureRepo.GetAllAsync();

            return entities.Select(e => new PirateTreasureListDto
            {
                PirateTreasureId = e.pirate_treasure_id,
                PirateTreasureName = e.pirate_treasure_name,
                MapRows = e.map_rows,
                MapColumns = e.map_columns,
                TreasureChestNumber = e.treasure_chest_number,
                TotalFuel = e.total_fuel,
                CreatedDate = e.created_date
            }).ToList();
        }

        /// <summary>
        /// Lấy chi tiết bản đồ kho báu theo ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<PirateTreasureDetailDto?> GetByIdAsync(Guid id)
        {
            var entity = await _pirateTreasureRepo.GetByIdAsync(id);

            if (entity == null)
            {
                return null;
            }

            var mapData = JsonSerializer.Deserialize<int[][]>(entity.map_data) ?? [];
            var optimalPathRaw = JsonSerializer.Deserialize<List<Step>>(entity.optimal_path) ?? [];

            // Convert Step to StepDto
            var optimalPath = optimalPathRaw.Select(s => new StepDto
            {
                From = new PositionDto { Row = s.From.Row, Col = s.From.Col },
                To = new PositionDto { Row = s.To.Row, Col = s.To.Col },
                ChestNumber = s.ChestNumber,
                Distance = s.Distance
            }).ToList();

            return new PirateTreasureDetailDto
            {
                PirateTreasureId = entity.pirate_treasure_id,
                PirateTreasureName = entity.pirate_treasure_name,
                MapRows = entity.map_rows,
                MapColumns = entity.map_columns,
                TreasureChestNumber = entity.treasure_chest_number,
                MapData = mapData,
                OptimalPath = optimalPath,
                TotalFuel = entity.total_fuel,
                CreatedDate = entity.created_date
            };
        }

        #region DP Algorithm - Tìm đường đi tối ưu

        /// <summary>
        /// Tính khoảng cách Euclidean giữa 2 điểm
        /// </summary>
        private static double EuclideanDistance(Position p1, Position p2)
        {
            return Math.Sqrt(Math.Pow(p1.Row - p2.Row, 2) + Math.Pow(p1.Col - p2.Col, 2));
        }

        /// <summary>
        /// Tìm vị trí của tất cả các loại rương trong ma trận
        /// </summary>
        /// <param name="matrix">Ma trận đầu vào</param>
        /// <param name="p">Số loại rương</param>
        /// <returns>Dictionary với key là loại rương, value là danh sách vị trí</returns>
        private static Dictionary<int, List<Position>> FindChestPositions(int[][] matrix, int p)
        {
            var positions = new Dictionary<int, List<Position>>();

            // Khởi tạo danh sách cho mỗi loại rương
            for (int chest = 1; chest <= p; chest++)
            {
                positions[chest] = new List<Position>();
            }

            for (int row = 0; row < matrix.Length; row++)
            {
                for (int col = 0; col < matrix[row].Length; col++)
                {
                    int chestNumber = matrix[row][col];
                    if (chestNumber >= 1 && chestNumber <= p)
                    {
                        // Lưu vị trí (1-indexed theo đề bài)
                        positions[chestNumber].Add(new Position(row + 1, col + 1));
                    }
                }
            }

            return positions;
        }

        /// <summary>
        /// Tính toán đường đi tối ưu sử dụng Dynamic Programming
        /// Bài toán: Tìm đường đi ngắn nhất từ (1,1) qua các loại rương 1, 2, ..., p
        /// Mỗi loại chỉ cần đi đến 1 ô (vì 1 rương đã cho chìa khóa để mở loại tiếp theo)
        /// 
        /// Thuật toán: DP qua các lớp
        /// dp[k][i] = khoảng cách ngắn nhất để đến ô thứ i của loại k
        /// </summary>
        /// <param name="matrix">Ma trận đầu vào</param>
        /// <param name="p">Số loại rương (kho báu)</param>
        /// <returns>Danh sách các bước đi</returns>
        private static List<Step> FindOptimalPath(int[][] matrix, int p)
        {
            var chestPositions = FindChestPositions(matrix, p);

            // Kiểm tra tất cả các loại rương đều tồn tại
            for (int chest = 1; chest <= p; chest++)
            {
                if (!chestPositions.ContainsKey(chest) || chestPositions[chest].Count == 0)
                {
                    throw new BusinessException($"Không tìm thấy rương số {chest} trong ma trận", BusinessExceptionCode.ChestNotFound);
                }
            }

            // Vị trí bắt đầu
            var startPos = new Position(1, 1);

            // Giá trị ô (1,1) - hải tặc bắt đầu ở đây
            int startValue = matrix[0][0];

            // Hải tặc bắt đầu với chìa khóa để mở rương loại 1
            // Phải mở theo thứ tự: 1 -> 2 -> ... -> p
            // Nếu ô (1,1) có giá trị 1, hải tặc đã ở rương 1, có thể mở ngay
            // => bắt đầu từ loại 2
            int startChest = 1;

            if (startValue == 1)
            {
                // Hải tặc đang ở rương loại 1, đã mở xong
                // => bắt đầu từ loại 2
                startChest = 2;
            }

            if (startChest > p)
            {
                // Không cần đi đâu, đã có kho báu
                return new List<Step>();
            }

            // DP: dp[chest] = List<DpEntry>
            var dp = new Dictionary<int, List<DpEntry>>();

            // Khởi tạo cho loại rương đầu tiên cần đến
            var firstPositions = chestPositions[startChest];
            var firstDp = new List<DpEntry>();

            for (int i = 0; i < firstPositions.Count; i++)
            {
                var pos = firstPositions[i];
                var dist = EuclideanDistance(startPos, pos);
                firstDp.Add(new DpEntry { Dist = dist, PrevChest = -1, PrevPosIndex = -1 });
            }
            dp[startChest] = firstDp;

            // DP cho các loại tiếp theo
            int prevChestLevel = startChest;
            for (int chest = startChest + 1; chest <= p; chest++)
            {
                var currentPositions = chestPositions[chest];
                var prevPositions = chestPositions[prevChestLevel];
                var prevDp = dp[prevChestLevel];

                var currentDp = new List<DpEntry>();

                for (int i = 0; i < currentPositions.Count; i++)
                {
                    var currentPos = currentPositions[i];
                    double minDist = double.MaxValue;
                    int bestPrevIndex = 0;

                    for (int j = 0; j < prevPositions.Count; j++)
                    {
                        var prevPos = prevPositions[j];
                        var dist = prevDp[j].Dist + EuclideanDistance(prevPos, currentPos);
                        if (dist < minDist)
                        {
                            minDist = dist;
                            bestPrevIndex = j;
                        }
                    }

                    currentDp.Add(new DpEntry { Dist = minDist, PrevChest = prevChestLevel, PrevPosIndex = bestPrevIndex });
                }

                dp[chest] = currentDp;
                prevChestLevel = chest;
            }

            // Tìm ô tốt nhất của loại p (kho báu)
            var finalDp = dp[p];
            int bestFinalIndex = 0;
            double bestFinalDist = finalDp[0].Dist;

            for (int i = 1; i < finalDp.Count; i++)
            {
                if (finalDp[i].Dist < bestFinalDist)
                {
                    bestFinalDist = finalDp[i].Dist;
                    bestFinalIndex = i;
                }
            }

            // Truy vết để tìm đường đi
            var path = new List<(int chest, int posIndex)>();
            int currentChest = p;
            int currentPosIndex = bestFinalIndex;

            while (currentChest >= startChest)
            {
                path.Add((currentChest, currentPosIndex));
                var dpEntry = dp[currentChest][currentPosIndex];
                if (dpEntry.PrevChest == -1) break;
                currentChest = dpEntry.PrevChest;
                currentPosIndex = dpEntry.PrevPosIndex;
            }

            path.Reverse();

            // Tạo các bước đi
            var steps = new List<Step>();
            var fromPos = startPos;

            foreach (var (chest, posIndex) in path)
            {
                var toPos = chestPositions[chest][posIndex];

                // Bỏ qua nếu vị trí trùng với vị trí hiện tại
                if (fromPos.Row == toPos.Row && fromPos.Col == toPos.Col)
                {
                    continue;
                }

                var distance = EuclideanDistance(fromPos, toPos);
                steps.Add(new Step
                {
                    From = new Position(fromPos.Row, fromPos.Col),
                    To = new Position(toPos.Row, toPos.Col),
                    ChestNumber = chest,
                    Distance = distance
                });

                fromPos = toPos;
            }

            return steps;
        }

        #endregion

        /// <summary>
        /// Cập nhật bản đồ kho báu
        /// </summary>
        /// <param name="id"></param>
        /// <param name="pirateTreasureUpdate"></param>
        /// <returns></returns>
        public async Task<PirateTreasureDetailDto?> UpdatePirateTreasureAsync(Guid id, PirateTreasureUpdateDto pirateTreasureUpdate)
        {
            // Kiểm tra bản đồ có tồn tại không
            var existingEntity = await _pirateTreasureRepo.GetByIdAsync(id);
            if (existingEntity == null)
            {
                return null;
            }

            // Kiểm tra dữ liệu trước khi cập nhật
            ValidateDataBeforeUpdate(pirateTreasureUpdate);

            // Tính toán lại đường đi tối ưu
            var optimalPath = FindOptimalPath(pirateTreasureUpdate.Matrix, pirateTreasureUpdate.treasure_chest_number);
            var totalFuel = optimalPath.Sum(s => s.Distance);

            // Cập nhật entity
            existingEntity.pirate_treasure_name = pirateTreasureUpdate.pirate_treasure_name;
            existingEntity.map_rows = pirateTreasureUpdate.map_rows;
            existingEntity.map_columns = pirateTreasureUpdate.map_columns;
            existingEntity.treasure_chest_number = pirateTreasureUpdate.treasure_chest_number;
            existingEntity.map_data = JsonSerializer.Serialize(pirateTreasureUpdate.Matrix);
            existingEntity.optimal_path = JsonSerializer.Serialize(optimalPath);
            existingEntity.total_fuel = totalFuel;

            await _pirateTreasureRepo.UpdatePirateTreasureAsync(existingEntity);

            // Trả về DTO chi tiết
            return await GetByIdAsync(id);
        }

        /// <summary>
        /// Xóa bản đồ kho báu theo ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> DeleteByIdAsync(Guid id)
        {
            // Kiểm tra bản đồ có tồn tại không
            var existingEntity = await _pirateTreasureRepo.GetByIdAsync(id);
            if (existingEntity == null)
            {
                return false;
            }

            return await _pirateTreasureRepo.DeleteByIdAsync(id);
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

        /// <summary>
        /// Hàm kiểm tra dữ liệu trước khi cập nhật
        /// </summary>
        /// <param name="pirateTreasureUpdate"></param>
        /// <returns></returns>
        /// <exception cref="BusinessException"></exception>
        private static void ValidateDataBeforeUpdate(PirateTreasureUpdateDto pirateTreasureUpdate)
        {
            if (pirateTreasureUpdate.Matrix == null || pirateTreasureUpdate.Matrix.Length == 0 || pirateTreasureUpdate.Matrix[0].Length == 0)
            {
                throw new BusinessException("Ma trận không có dữ liệu!", BusinessExceptionCode.MatrixEmpty);
            }

            if (pirateTreasureUpdate.map_rows < 1 || pirateTreasureUpdate.map_rows > 500 || pirateTreasureUpdate.map_columns < 1 || pirateTreasureUpdate.map_columns > 500)
            {
                throw new BusinessException("Kích thước bản đồ không hợp lệ!", BusinessExceptionCode.OutOfRange);
            }

            if (pirateTreasureUpdate.Matrix.Length != pirateTreasureUpdate.map_rows)
            {
                throw new BusinessException("Số hàng của ma trận không khớp với số được nhập!", BusinessExceptionCode.DimensionNotMatched);
            }

            if (pirateTreasureUpdate.Matrix[0].Length != pirateTreasureUpdate.map_columns)
            {
                throw new BusinessException("Số cột của ma trận không khớp với số được nhập!", BusinessExceptionCode.DimensionNotMatched);
            }

            if (pirateTreasureUpdate.treasure_chest_number < 1 || pirateTreasureUpdate.treasure_chest_number > (pirateTreasureUpdate.map_rows * pirateTreasureUpdate.map_columns))
            {
                throw new BusinessException("Số của rương kho báu không hợp lệ!", BusinessExceptionCode.OutOfRange);
            }
        }
    }
}
