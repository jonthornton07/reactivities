using System;
using System.Linq;
using MediatR;
using Domain;
using System.Threading.Tasks;
using System.Threading;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Application.Errors;
using System.Net;
using Application.Interfaces;

namespace Application.User
{
    public class RefreshToken
    {
        public class Command : IRequest<User>
        {
            public string RefreshToken { get; set; }
        }

        public class Handler : IRequestHandler<Command, User>
        {
            private readonly IUserAccessor _userAccessor;
            private readonly IJWTGenerator _jWTGenerator;
            private readonly UserManager<AppUser> _userManager;

            public Handler(UserManager<AppUser> userManager, IJWTGenerator jWTGenerator, IUserAccessor userAccessor)
            {
                _userManager = userManager;
                _jWTGenerator = jWTGenerator;
                _userAccessor = userAccessor;
            }

            public async Task<User> Handle(Command request, CancellationToken cancellationToken)
            {
                //hanlder logic
                var user = await _userManager.FindByNameAsync(_userAccessor.GetCurrentUsername());
                var oldToken = user.RefreshTokens.SingleOrDefault(x => x.Token == request.RefreshToken);

                if (oldToken != null && !oldToken.IsActive)
                    throw new RestException(HttpStatusCode.Unauthorized);

                if (oldToken != null)
                {
                    oldToken.Revoked = DateTime.UtcNow;
                }

                var newRefreshToken = _jWTGenerator.GenerateRefreshToken();
                user.RefreshTokens.Add(newRefreshToken);
                await _userManager.UpdateAsync(user);
                return new User(user, _jWTGenerator, newRefreshToken.Token);
            }
        }
    }
}