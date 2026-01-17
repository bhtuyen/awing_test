namespace PirateTreasuresApi.Dtos
{
    /// <summary>
    /// Vị trí trong ma trận (1-indexed)
    /// </summary>
    public class PositionDto
    {
        public int Row { get; set; }
        public int Col { get; set; }
    }

    /// <summary>
    /// Một bước di chuyển
    /// </summary>
    public class StepDto
    {
        public PositionDto From { get; set; } = null!;
        public PositionDto To { get; set; } = null!;
        public int ChestNumber { get; set; }
        public double Distance { get; set; }
    }

    /// <summary>
    /// DTO cho danh sách bản đồ kho báu (không cần map_data, optimal_path)
    /// </summary>
    public class PirateTreasureListDto
    {
        public Guid PirateTreasureId { get; set; }
        public string PirateTreasureName { get; set; } = string.Empty;
        public int MapRows { get; set; }
        public int MapColumns { get; set; }
        public int TreasureChestNumber { get; set; }
        public double TotalFuel { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    /// <summary>
    /// DTO cho chi tiết bản đồ kho báu (đầy đủ thông tin)
    /// </summary>
    public class PirateTreasureDetailDto
    {
        public Guid PirateTreasureId { get; set; }
        public string PirateTreasureName { get; set; } = string.Empty;
        public int MapRows { get; set; }
        public int MapColumns { get; set; }
        public int TreasureChestNumber { get; set; }
        public int[][] MapData { get; set; } = [];
        public List<StepDto> OptimalPath { get; set; } = [];
        public double TotalFuel { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
