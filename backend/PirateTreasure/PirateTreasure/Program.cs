using Microsoft.OpenApi;
using PirateTreasuresApi.Abstractions;
using PirateTreasuresApi.Repositories;
using PirateTreasuresApi.Services;

namespace PirateTreasuresApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();

            // Configure Swagger
            builder.Services.AddSwaggerGen(options =>
            {
                // Define the Swagger document
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Pirate Treasure API",
                    Version = "v1",
                    Description = "An API to manage pirate treasures.",
                    Contact = new OpenApiContact
                    {
                        Name = "Pirate Support",
                        Email = "me.bhtuyen@gmail.com"
                    }
                });

                // Set the comments path for the Swagger JSON and UI.
                var xmlFilename = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlFilePath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
                if (File.Exists(xmlFilePath))
                {
                    options.IncludeXmlComments(xmlFilePath);
                }
            });

            // Configure CORS to allow all origins, methods, and headers
            builder.Services.AddCors(options =>
            {
                // Define a CORS policy
                options.AddPolicy("AllowAll", builder =>
                {
                    builder.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });
            });

            // Dependency Injection
            builder.Services.AddScoped<IPirateTreasureRepo>(options =>
            {
                return new PirateTreasureRepo(builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new Exception("Connection string not found"));
            });

            builder.Services.AddScoped<IPirateTreasureService, PirateTreasureService>();

            // Build the app
            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                // Enable middleware to serve generated Swagger as a JSON endpoint.
                app.UseSwagger();
                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Pirate Treasure API V1");
                    options.RoutePrefix = string.Empty;
                });
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            // Enable CORS
            app.UseCors("AllowAll");

            app.Run();
        }
    }
}
