using Dapper;
using System.ComponentModel.DataAnnotations.Schema;

namespace PirateTreasuresApi.Utils
{
    public static class CommonFunction
    {
        /// <summary>
        /// Hàm xây dựng câu lệnh SQL để chèn dữ liệu
        /// </summary>
        /// <param name="entityType"></param>
        /// <param name="tableName"></param>
        /// <returns></returns>
        public static string BuildInsertSql(Type entityType, string tableName)
        {
            var properties = entityType.GetProperties();
            var columnNames = new List<string>();
            var parameterNames = new List<string>();

            foreach (var property in properties)
            {
                columnNames.Add(property.Name);
                parameterNames.Add($"@{property.Name}");
            }

            var columnsStr = string.Join(", ", columnNames);
            var parametersStr = string.Join(", ", parameterNames);

            return $"INSERT INTO {tableName} ({columnsStr}) VALUES ({parametersStr})";
        }

        /// <summary>
        /// Hàm lấy các tham số động từ entity
        /// </summary>
        /// <param name="entity"></param>
        /// <returns></returns>
        public static DynamicParameters GetDynamicParameters<T>(T entity)
        {
            var type = typeof(T);

            var properties = type.GetProperties();

            var parameters = new DynamicParameters();

            foreach (var property in properties)
            {
                parameters.Add(property.Name, property.GetValue(entity));
            }

            return parameters;
        }

        /// <summary>
        /// Hàm lấy tên bảng từ attribute Table
        /// </summary>
        /// <param name="T"></param>
        /// <returns></returns>
        public static string GetTableName(Type T)
        {
            var customAtributes = T.GetCustomAttributes(false);

            foreach (var atribute in customAtributes)
            {
                if (atribute is TableAttribute tableAtribute)
                {
                    return tableAtribute.Name;
                }
            }
            return string.Empty;
        }
    }
}
