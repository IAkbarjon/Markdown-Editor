using MarkdownEditor.Models;
using MarkdownEditor.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Xml.Linq;

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

                User existUser = await _context.Users
                    .AsNoTracking()
                    .FirstAsync(u => u.Id == userId);
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

            await _context.Users.AddAsync(newUser);
            newUser.Password = PasswordService.HashPassword(newUser.Password!);
            await _context.SaveChangesAsync();

            User savedUser = await _context.Users
                .AsNoTracking()
                .FirstAsync(u => u.Email == newUser.Email);

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

            User existUser = await _context.Users.FirstAsync(u => u.Email == user.Email);

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
                Response.Cookies.Delete("session");
            }

            return Ok();
        }

        private void SetSession(int userId)
        {
            Response.Cookies.Append("session", _jwtService.GenerateToken(userId), _cookieOptions);
        }
    }
}
