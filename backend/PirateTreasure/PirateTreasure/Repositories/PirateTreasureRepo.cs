using Dapper;
using MySqlConnector;
using PirateTreasuresApi.Abstractions;
using PirateTreasuresApi.Entities;
using PirateTreasuresApi.Utils;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using static Dapper.SqlMapper;

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
        /// 
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
    }
}
