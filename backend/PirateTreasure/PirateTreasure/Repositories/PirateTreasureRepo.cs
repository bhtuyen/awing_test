using Dapper;
using MySqlConnector;
using PirateTreasuresApi.Abstractions;
using PirateTreasuresApi.Entities;
using PirateTreasuresApi.Utils;

namespace PirateTreasuresApi.Repositories
{
    public class PirateTreasureRepo : IPirateTreasureRepo
    {
        private readonly string _connectionString;

        public PirateTreasureRepo(string connectionString)
        {
            this._connectionString = connectionString;
        }

        /// <summary>
        /// Lưu bản đồ kho báu
        /// </summary>
        /// <param name="pirateTreasure"></param>
        /// <returns></returns>
        public async Task<bool> SavePirateTreasureAsync(PirateTreasureEntity pirateTreasure)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();
            var parameters = CommonFunction.GetDynamicParameters(pirateTreasure);

            var tableName = CommonFunction.GetTableName(typeof(PirateTreasureEntity));

            var sql = CommonFunction.BuildInsertSql(typeof(PirateTreasureEntity), tableName);

            var result = await connection.ExecuteAsync(sql, parameters);
            return result > 0;
        }

        /// <summary>
        /// Lấy danh sách tất cả bản đồ kho báu (sắp xếp theo ngày tạo mới nhất)
        /// </summary>
        /// <returns></returns>
        public async Task<List<PirateTreasureEntity>> GetAllAsync()
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var tableName = CommonFunction.GetTableName(typeof(PirateTreasureEntity));

            var sql = $@"SELECT 
                pirate_treasure_id,
                pirate_treasure_name,
                map_rows,
                map_columns,
                treasure_chest_number,
                total_fuel,
                created_date
            FROM {tableName} 
            ORDER BY created_date DESC";

            var result = await connection.QueryAsync<PirateTreasureEntity>(sql);
            return result.ToList();
        }

        /// <summary>
        /// Lấy chi tiết bản đồ kho báu theo ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<PirateTreasureEntity?> GetByIdAsync(Guid id)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var tableName = CommonFunction.GetTableName(typeof(PirateTreasureEntity));

            var sql = $@"SELECT 
                pirate_treasure_id,
                pirate_treasure_name,
                map_rows,
                map_columns,
                treasure_chest_number,
                map_data,
                optimal_path,
                total_fuel,
                created_date
            FROM {tableName} 
            WHERE pirate_treasure_id = @Id";

            var result = await connection.QueryFirstOrDefaultAsync<PirateTreasureEntity>(sql, new { Id = id });
            return result;
        }

        /// <summary>
        /// Cập nhật bản đồ kho báu
        /// </summary>
        /// <param name="pirateTreasure"></param>
        /// <returns></returns>
        public async Task<bool> UpdatePirateTreasureAsync(PirateTreasureEntity pirateTreasure)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var tableName = CommonFunction.GetTableName(typeof(PirateTreasureEntity));

            var sql = $@"UPDATE {tableName} SET
                pirate_treasure_name = @pirate_treasure_name,
                map_rows = @map_rows,
                map_columns = @map_columns,
                treasure_chest_number = @treasure_chest_number,
                map_data = @map_data,
                optimal_path = @optimal_path,
                total_fuel = @total_fuel
            WHERE pirate_treasure_id = @pirate_treasure_id";

            var parameters = CommonFunction.GetDynamicParameters(pirateTreasure);
            var result = await connection.ExecuteAsync(sql, parameters);
            return result > 0;
        }

        /// <summary>
        /// Xóa bản đồ kho báu theo ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> DeleteByIdAsync(Guid id)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var tableName = CommonFunction.GetTableName(typeof(PirateTreasureEntity));

            var sql = $@"DELETE FROM {tableName} WHERE pirate_treasure_id = @Id";

            var result = await connection.ExecuteAsync(sql, new { Id = id });
            return result > 0;
        }
    }
}
