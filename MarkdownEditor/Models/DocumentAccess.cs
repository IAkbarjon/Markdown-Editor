namespace MarkdownEditor.Models
{
    public class DocumentAccess
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int DocumentId { get; set; }

        public User? User { get; set; }
        public Document? Document { get; set; }
    }
}
