using System.ComponentModel.DataAnnotations.Schema;

namespace MarkdownEditor.Models
{
    public class User
    {
        public int Id { get; set; }
        public string? Username { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string Email { get; set; }
        public string? Password { get; set; }
        public DateTime JoinDate { get; set; } = DateTime.UtcNow;

        public ICollection<Document>? Documents { get; set; }
        public ICollection<DocumentAccess>? AccessToDocuments { get; set; }
    }
}
