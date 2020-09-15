using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using MediatR;
using System.Threading.Tasks;
using Application.Comments;

namespace API.SignalR
{
    public class ChatHub : Hub
    {
        private IMediator _mediator;
        public ChatHub(IMediator mediator)
        {
            _mediator = mediator;
        }

        public async Task SendComment(Create.Command command)
        {
            command.Username = GetUsername();
            var comment = await _mediator.Send(command);
            await Clients.Group(command.ActivityId.ToString()).SendAsync("ReceiveComment", comment);
        }

        private string GetUsername()
        {
            return Context.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
        }

        public async Task AddToGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("Send", $"{GetUsername()} has joined the group");
        }

        public async Task RemoveFromGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("Send", $"{GetUsername()} has left the group");
        }
    }
}