using MarkdownEditor.Hubs;
using MarkdownEditor.Models;
using MarkdownEditor.Services;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
});

// Services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSignalR();
builder.Services.AddDbContext<ApplicationContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddAuthorization();

// Cookie authentication
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.None;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    });

// CSRF
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-XSRF-TOKEN";
    options.Cookie.Name = "XSRF-TOKEN";
    options.Cookie.HttpOnly = false;
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});

var app = builder.Build();

// Security Headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    await next();
});

// DB init
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationContext>();

    dbContext.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// CSRF Token endpoint
app.MapGet("/api/csrf-token", async (IAntiforgery antiforgery, HttpContext context) =>
{
    if (context.Request.Cookies.ContainsKey("XSRF-TOKEN"))
    {
        context.Response.Cookies.Delete("XSRF-TOKEN", new CookieOptions
        {
            SameSite = SameSiteMode.None,
            Secure = true,
            Path  = "/"
        });
    }
    
    var tokens = antiforgery.GetAndStoreTokens(context);

    if (tokens == null)
    {
        Console.WriteLine("ERROR: tokens is null");
        return Results.Problem("Failed to generate CSRF tokens");
    }

    if (string.IsNullOrEmpty(tokens.CookieToken))
    {
        Console.WriteLine("ERROR: CookieTokens is null or empty");
        return Results.Problem("Failed to generate CookieToken");
    }

    if (string.IsNullOrEmpty(tokens.RequestToken))
    {
        Console.WriteLine("ERROR: RequestToken is null or empty");
        return Results.Problem("Failed to generate RequestToken");
    }

    context.Response.Cookies.Append("XSRF-TOKEN", tokens.CookieToken!, new CookieOptions
    {
        HttpOnly = false,
        SameSite = SameSiteMode.None,
        Secure = true,
        Expires = DateTimeOffset.UtcNow.AddDays(2),
        Path = "/"
    });

    return Results.Ok(new { token = tokens.RequestToken });
}).AllowAnonymous();

app.UseHttpsRedirection();
app.MapControllers();
app.MapHub<MarkdownHub>("/api/markdownHub");

app.Run();
