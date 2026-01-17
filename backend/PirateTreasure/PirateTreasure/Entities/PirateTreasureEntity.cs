using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PirateTreasuresApi.Entities
{
    [Table("pirate_treasures")]
    public class PirateTreasureEntity
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
        public string map_data { get; set; } = string.Empty;

        [Required]
        public string optimal_path { get; set; } = string.Empty;

        /// <summary>
        /// Tổng nhiên liệu đã tối ưu
        /// </summary>
        public double total_fuel { get; set; }

        public DateTime created_date { get; set; } = DateTime.Now;
    }
}
