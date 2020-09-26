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
    public class Login
    {
        public class Query : IRequest<User>
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

        public class QueryValidator : AbstractValidator<Query>
        {
            public QueryValidator()
            {
                RuleFor(x => x.Email).NotEmpty();
                RuleFor(x => x.Password).NotEmpty();
            }
        }

        public class Handler : IRequestHandler<Query, User>
        {
            private readonly UserManager<AppUser> _userManager;
            private readonly SignInManager<AppUser> _signInManager;
            private readonly IJWTGenerator _jWTGenerator;
            public Handler(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, IJWTGenerator jWTGenerator)
            {
                _userManager = userManager;
                _signInManager = signInManager;
                _jWTGenerator = jWTGenerator;
            }

            public async Task<User> Handle(Query request, CancellationToken cancellationToken)
            {
                var user = await _userManager.FindByEmailAsync(request.Email);

                if (null == user)
                    throw new RestException(HttpStatusCode.Unauthorized);

                if (!user.EmailConfirmed)
                    throw new RestException(HttpStatusCode.BadRequest, new { Email = "Email not verified" });

                var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);

                if (result.Succeeded)
                {
                    var refreshToken = _jWTGenerator.GenerateRefreshToken();
                    user.RefreshTokens.Add(refreshToken);
                    await _userManager.UpdateAsync(user);

                    return new User(user, _jWTGenerator, refreshToken.Token);
                }

                throw new RestException(HttpStatusCode.Unauthorized);
            }
        }
    }
}