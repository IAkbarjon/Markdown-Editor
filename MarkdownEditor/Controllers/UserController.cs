using MarkdownEditor.Models;
using MarkdownEditor.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace MarkdownEditor.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UserController : ControllerBase {
        private readonly ApplicationContext _context;
        private readonly IJwtService _jwtService;

        public UserController(ApplicationContext context, IJwtService jwtService) {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentUsers() {
            //var recentUsers = _context.Users
            //    .AsNoTracking()
            //    .Include(u => u.AccessToDocuments)
            //    .Where(u => u.AccessToDocuments.Any(a => a.Document.OwnerId == id));

            if (Request.Cookies.TryGetValue("session", out var session)) {
                int? userId = _jwtService.GetUserIdFromToken(session);
                if (userId == null || !_context.Users.Any(u => u.Id == userId))
                {
                    return Unauthorized(new ApiError("Пользователь не авторизован", 401));
                }

                User? existUser = await GetUser(u => u.Id == userId);

                if (existUser == null)
                {
                    return BadRequest(new ApiError("Токен неправильного формата", 400));
                }

                var currentUserId = existUser.Id;

                // Пользователи, которым текущий дал доступ
                var usersICollaboratedWith = await _context.DocumentAccesses
                    .Where(da => da.Document.OwnerId == currentUserId)
                    .Select(da => da.User)
                    .Where(u => u != null && u.Id != currentUserId)
                    .Distinct()
                    .ToListAsync();

                // Пользователи, которые дали доступ к текущему
                var usersWhoCollaboratedWithMe = await _context.DocumentAccesses
                    .Where(da => da.UserId == currentUserId)
                    .Select(da => da.Document.Owner)
                    .Where(u => u != null && u.Id != currentUserId)
                    .Distinct()
                    .ToListAsync();

                // Объединение двух списков с удаением дубликатов
                var allRecentUsers = usersICollaboratedWith
                    .Union(usersWhoCollaboratedWithMe)
                    .GroupBy(u => u.Id)
                    .Select(g => g.First())
                    .OrderByDescending(u => u.JoinDate)
                    .Take(10)
                    .Select(u => new {
                        u.Id,
                        u.Username,
                        u.FirstName,
                        u.LastName,
                        u.Email,
                        u.JoinDate
                    } as object)
                    .ToList();

                return Ok(new ApiResponse<List<object>>(allRecentUsers));

            }

            return Unauthorized(new ApiError("Пользователь не авторизован", 401));

        }

        [HttpGet("search/{query}")]
        public async Task<IActionResult> SearchUser(string query) {
            int limit = 10;

            if (string.IsNullOrEmpty(query)) {
                return BadRequest(new ApiError("Запрос пустой", 400));
            }

            if (Request.Cookies.TryGetValue("session", out var session)) {
                int? userId = _jwtService.GetUserIdFromToken(session);
                if (userId == null || !_context.Users.Any(u => u.Id == userId))
                {
                    return Unauthorized(new ApiError("Пользователь не авторизован", 401));
                }

                User? existUser = await GetUser(u => u.Id == userId);

                if (existUser == null)
                {
                    return BadRequest(new ApiError("Токен неправильного формата", 400));
                }

                var currentUserId = existUser.Id;

                var users = await _context.Users
                .Where(u => u.Id != currentUserId) // Исключаем текущего пользователя
                .Where(u =>
                    // Поиск по username
                    u.Username != null && u.Username.Contains(query) ||
                    // Поиск по email
                    u.Email.Contains(query) ||
                    // Поиск по имени
                    (u.FirstName != null && u.FirstName.Contains(query)) ||
                    // Поиск по фамилии
                    (u.LastName != null && u.LastName.Contains(query)) ||
                    // Поиск по полному имени (Имя + Фамилия)
                    (u.FirstName != null && u.LastName != null &&
                     (u.FirstName + " " + u.LastName).Contains(query))
                )
                .OrderBy(u => u.Username) // Сортируем по username
                .Take(limit)
                .Select(u => new {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    JoinDate = u.JoinDate
                } as object)
                .ToListAsync();

                return Ok(new ApiResponse<object>(users));
            }

            return Unauthorized(new ApiError("Пользователь не авторизован", 401));
        }

        [HttpGet("{username}")]
        public async Task<IActionResult> GetUserData(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                return BadRequest(new { error = "Ник пользователя объязателен" });
            }

            var userData = await GetUser(user => user.Username == username);

            if (userData == null)
            {
                return NotFound(new { error = $"Пользователя '{username}' не существует" });
            }

            userData.Password = null;

            return Ok(new ApiResponse<User>(userData));
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
