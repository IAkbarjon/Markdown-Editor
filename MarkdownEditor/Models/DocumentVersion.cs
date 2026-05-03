namespace MarkdownEditor.Models
{
    public class DocumentVersion
    {
        public int Id { get; set; }
        public int DocumentId { get; set; }
        public string Content { get; set; }
        public DateTime SavedAt {  get; set; }
        public User SavedBy { get; set; }

        public Document? Document { get; set; }
    }
}
