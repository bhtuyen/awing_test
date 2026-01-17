using System.ComponentModel.DataAnnotations;

namespace PirateTreasuresApi.Dtos
{
    public class PirateTreasureSaveDto
    {
        [Key]
        public Guid pirate_treasure_id { get; set; }

        public string pirate_treasure_name { get; set; } = string.Empty;

        [Required]
        public int map_rows { get; set; }

        [Required]
        public int map_columns { get; set; }

        [Required]
        public int treasure_chest_number { get; set; }

        [Required]
        public int[][] Matrix { get; set; } = [];
    }

    /// <summary>
    /// DTO cho cập nhật bản đồ kho báu
    /// </summary>
    public class PirateTreasureUpdateDto
    {
        public string pirate_treasure_name { get; set; } = string.Empty;

        [Required]
        public int map_rows { get; set; }

        [Required]
        public int map_columns { get; set; }

        [Required]
        public int treasure_chest_number { get; set; }

        [Required]
        public int[][] Matrix { get; set; } = [];
    }
}
