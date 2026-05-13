using MarkdownEditor.Models;
using MarkdownEditor.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using static System.Collections.Specialized.BitVector32;

namespace MarkdownEditor.Controllers
{
    [Route("api/authorization")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationContext _context;
        private readonly IJwtService _jwtService;
        private readonly CookieOptions _cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTimeOffset.UtcNow.AddDays(2),
            Path = "/"
        };

        public UserController(ApplicationContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpGet("check")]
        public async Task<IActionResult> CheckAuth()
        {
            if (Request.Cookies.TryGetValue("session", out var session))
            {
                int? userId = _jwtService.GetUserIdFromToken(session);
                if (userId == null || !_context.Users.Any(u => u.Id == userId))
                {
                    return BadRequest(new ApiError("Неправильный формат токена", 400));
                }

                User? existUser = await GetUser(u => u.Id == userId);

                if (existUser == null)
                {
                    return BadRequest(new ApiError("Токен неправильного формата", 400));
                }

                existUser.Password = null;

                return Ok(new ApiResponse<User>(existUser));
            }

            return Unauthorized(new ApiError("Пользователь не авторизован", 401));
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User newUser)
        {
            bool userExists = await _context.Users.AnyAsync(u => u.Email == newUser.Email);

            if (userExists)
            {
                return BadRequest(new ApiError("Пользователь с такой почтой уже существует", 400));
            }

            newUser.Username = GenerateUsername(newUser.Email);

            await _context.Users.AddAsync(newUser);
            newUser.Password = PasswordService.HashPassword(newUser.Password!);
            await _context.SaveChangesAsync();

            User? savedUser = await GetUser(u => u.Email == newUser.Email);

            if (savedUser == null)
            {
                return NotFound(new ApiError("Пользователя не существует", 404));
            }

            SetSession(savedUser.Id);

            return Created(Request.Path.Value, new ApiResponse<User>(savedUser, 201));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User user)
        {
            bool userExists = await _context.Users.AnyAsync(u => u.Email == user.Email);
            
            // Проверка существования пользователя
            if (!userExists || user.Email == null)
            {
                return BadRequest(new ApiError("Пользователя с такой почтой не существует", 400));
            }

            User? existUser = await GetUser(u => u.Email == user.Email);

            if (existUser == null)
            {
                return NotFound(new ApiError("Пользователя не существует", 404));
            }

            // Проверка совпадения пароля
            if (!PasswordService.VerifyPassword(user.Password!, existUser.Password!))
            {
                return BadRequest(new ApiError("Неправильная почта или пароль", 400));
            }

            SetSession(existUser.Id);

            return Ok(new ApiResponse<User>(existUser));
        }

        [HttpDelete("logout")]
        public async Task<IActionResult> LogOut()
        {
            if (Request.Cookies.TryGetValue("session", out var session))
            {
                Response.Cookies.Delete("session", _cookieOptions);
            }

            return NoContent();
        }

        [HttpPatch("change-data")]
        public async Task<IActionResult> ChangeData([FromBody] User updatedUser)
        {
            if (Request.Cookies.TryGetValue("session", out var session))
            {
                int? userId = _jwtService.GetUserIdFromToken(session);
                if (userId == null || !_context.Users.Any(u => u.Id == userId))
                {
                    return BadRequest(new ApiError("Неправильный формат токена", 400));
                }

                var existingUser = await _context.Users.FindAsync(userId.Value);

                if (existingUser == null)
                {
                    return NotFound(new ApiError("Пользвоатель не найден", 404));
                }

                if (updatedUser.FirstName != null)
                    existingUser.FirstName = updatedUser.FirstName;

                if (updatedUser.LastName != null)
                    existingUser.LastName = updatedUser.LastName;

                if (updatedUser.Username != null)
                    existingUser.Username = updatedUser.Username;

                if (updatedUser.Email != null)
                    existingUser.Email = updatedUser.Email;

                await _context.SaveChangesAsync();
                return Ok(new ApiResponse<User>(existingUser));
            }

            return Unauthorized(new ApiError("Пользователь не авторизован", 401));
        }

        private void SetSession(int userId)
        {
            Response.Cookies.Append("session", _jwtService.GenerateToken(userId), _cookieOptions);
        }

        private string GenerateUsername(string email)
        {
            var username = email.Split("@")[0];

            username = "@" + Regex.Replace(username, @"[^a-zA-Z0-9_-]", "");

            return username.ToLower();
        }

        private async Task<User?> GetUser(Expression<Func<User, bool>> func)
        {
            User? user = await _context.Users
                .AsNoTracking()
                .Include(u => u.Documents)!
                    .ThenInclude(d => d.DocumentAccesses)
                .Include(u => u.Documents)!
                    .ThenInclude(d => d.DocumentVersions)
                .Include(u => u.AccessToDocuments)!
                    .ThenInclude(a => a.Document)
                .FirstOrDefaultAsync(func);

            return user;
        }
    }
}
