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
                return new User
                {
                    DisplayName = user.DisplayName,
                    Username = user.UserName,
                    Token = _jWTGenerator.CreateToken(user),
                    Image = null
                };
            }
        }
    }
}