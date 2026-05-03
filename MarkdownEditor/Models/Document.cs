namespace MarkdownEditor.Models
{
    public class Document
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime LastUpdated { get; set; } = DateTime.Now;

        public int OwnerId { get; set; }
        public User Owner { get; set; }

        public ICollection<DocumentAccess>? DocumentAccesses { get; set; }
        public ICollection<DocumentVersion>? DocumentVersions { get; set; }
    }
}
