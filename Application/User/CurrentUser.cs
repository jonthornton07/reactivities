using MediatR;
using Domain;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.AspNetCore.Identity;
using Application.Interfaces;
using System.Linq;


namespace Application.User
{
    public class CurrentUser
    {
        public class Query : IRequest<User> { }

        public class Handler : IRequestHandler<Query, User>
        {
            private readonly UserManager<AppUser> _userManager;
            private readonly IJWTGenerator _jWTGenerator;
            private readonly IUserAccessor _userAccessor;
            public Handler(UserManager<AppUser> userManager, IJWTGenerator jWTGenerator, IUserAccessor userAccessor)
            {
                _userManager = userManager;
                _jWTGenerator = jWTGenerator;
                _userAccessor = userAccessor;
            }

            public async Task<User> Handle(Query request, CancellationToken cancellationToken)
            {
                var user = await _userManager.FindByNameAsync(_userAccessor.GetCurrentUsername());
                var refreshToken = _jWTGenerator.GenerateRefreshToken();
                user.RefreshTokens.Add(refreshToken);
                await _userManager.UpdateAsync(user);

                return new User(user, _jWTGenerator, refreshToken.Token);
            }
        }
    }
}