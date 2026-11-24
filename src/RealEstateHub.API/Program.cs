using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json.Serialization;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using AutoMapper;
using RealEstateHub.API.Middleware;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Application.Mappings;
using RealEstateHub.Application.Services;
using RealEstateHub.Application.Validators;
using RealEstateHub.Infrastructure.Data;
using RealEstateHub.Infrastructure.Repositories;
using RealEstateHub.Infrastructure.Services;
using RealEstateHub.Application.Patterns.Factory;
using RealEstateHub.Application.Patterns.Strategy;
using RealEstateHub.Application.Patterns.Composite;

// Database RealEstateHubDb dùng cột "timestamp without time zone" (xem AppDbContext).
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "Frontend";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
    options.AddPolicy(FrontendCorsPolicy, policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()));

// Enum trả về dạng chữ ("VipGold", "ForSale") đúng như docs/api-contract.md.
builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IListingRepository, ListingRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ILocationRepository, LocationRepository>();
builder.Services.AddScoped<IListingService, ListingService>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IPropertyFactory, PropertyFactory>();
builder.Services.AddScoped<PropertySearchEngine>();
builder.Services.AddScoped<ISearchStrategy, KeywordSearchStrategy>();
builder.Services.AddScoped<ISearchStrategy, PriceRangeStrategy>();
builder.Services.AddScoped<ISearchStrategy, AreaRangeStrategy>();
builder.Services.AddScoped<ISearchStrategy, LocationStrategy>();
builder.Services.AddScoped<ISearchStrategy, PropertyTypeStrategy>();
builder.Services.AddScoped<ISearchStrategy, TransactionTypeStrategy>();
builder.Services.AddScoped(sp =>
{
    var strategies = sp.GetServices<ISearchStrategy>().ToArray();
    return new FilterCompositeStrategy(strategies);
});
builder.Services.AddSingleton<IMapper>(sp =>
{
    var configuration = new MapperConfiguration(cfg =>
        cfg.AddProfile<RealEstateHubProfile>(),
        sp.GetRequiredService<ILoggerFactory>());
    return configuration.CreateMapper();
});
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is missing.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(FrontendCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Không tự chạy migration hay seed: RealEstateHubDb là database có sẵn, cấu trúc do bạn quản lý.

app.Run();
