using MarkdownEditor.Models;
using MarkdownEditor.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace MarkdownEditor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentController : ControllerBase
    {
        private readonly ApplicationContext _context;
        private readonly IJwtService _jwtService;

        public DocumentController(ApplicationContext context, IJwtService jwtService) {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateDocument([FromBody] Document newDocument)
        {
            if (Request.Cookies.TryGetValue("session", out var session)) {

                int? userId = _jwtService.GetUserIdFromToken(session);
                if (userId == null)
                {
                    return BadRequest(new ApiError("Неправильный формат токена", 400));
                }

                var user = await GetUser(u => u.Id == userId);

                if (user == null)
                {
                    return NotFound(new ApiError("Пользователя не существует", 404));
                }

                if (user.Documents?.Any(d => d.Title.Trim() ==  newDocument.Title.Trim()) ?? false)
                {
                    return BadRequest(new ApiError("Документ с таким названием уже существует", 401));
                }

                _context.Documents?.Add(newDocument);

                await _context.SaveChangesAsync();

                Document? createdDocument = await GetDocument(d => d.Id == newDocument.Id);

                return Created(Request.Path.Value, new ApiResponse<Document>(createdDocument!, 201));
            }

            return Unauthorized(new ApiError("Пользователь не авторизован", 401));
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

        private async Task<Document?> GetDocument(Expression<Func<Document, bool>> func)
        {
            Document? doc = await _context.Documents
                .AsNoTracking()
                .Include(d => d.Owner)!
                .Include(d => d.DocumentAccesses)!
                .Include(d => d.DocumentVersions)!
                .FirstOrDefaultAsync(func);

            return doc;
        }
    }
}
