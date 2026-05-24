using Microsoft.AspNetCore.SignalR;
using System.Diagnostics;
using System.Net.NetworkInformation;

namespace MarkdownEditor.Hubs
{
    public interface IMarkdownClient
    {
        Task SayHello();
        Task ReceiveContent(string content);
        Task UserJoined(string connectionId);
    }
    
    public class MarkdownHub : Hub<IMarkdownClient>
    {
        private static readonly Dictionary<string, string> _documents = new();
        private static string _doc = "";

        public async Task JoinDocument()
        {
            await Clients.Caller.ReceiveContent(_doc);
        }

        public async Task UpdateContent(string newContent)
        {
            _doc = newContent;

            await Clients.Others.ReceiveContent(_doc);
        }
    }
}
