using System.Linq;
using MediatR;
using Domain;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.AspNetCore.Identity;
using Application.Interfaces;
using Application.Errors;
using System.Net;

namespace Application.User
{
    public class ExternalLogin
    {
        public class Query : IRequest<User>
        {
            public string AccessToken { get; set; }
        }

        public class Handler : IRequestHandler<Query, User>
        {
            private readonly UserManager<AppUser> _userManager;
            private readonly IFacebookAccessor _facebookAccessor;
            private readonly IJWTGenerator _jWTGenerator;
            public Handler(UserManager<AppUser> userManager, IFacebookAccessor facebookAccessor, IJWTGenerator jWTGenerator)
            {
                _userManager = userManager;
                _facebookAccessor = facebookAccessor;
                _jWTGenerator = jWTGenerator;
            }

            public async Task<User> Handle(Query request, CancellationToken cancellationToken)
            {
                var userInfo = await _facebookAccessor.FacebookLogin(request.AccessToken);

                if (userInfo == null)
                    throw new RestException(HttpStatusCode.BadGateway, new { User = "Problem validating token" });

                var user = await _userManager.FindByEmailAsync(userInfo.Email);

                var refreshToken = _jWTGenerator.GenerateRefreshToken();
                if (user != null)
                {
                    user.RefreshTokens.Add(refreshToken);
                    await _userManager.UpdateAsync(user);
                    return new User(user, _jWTGenerator, refreshToken.Token);
                }

                user = new AppUser
                {
                    DisplayName = userInfo.Name,
                    Email = userInfo.Email,
                    Id = userInfo.Id,
                    UserName = "fb_" + userInfo.Id
                };

                var photo = new Photo
                {
                    Id = "fb_" + userInfo.Id,
                    Url = userInfo.picture.Data.Url,
                    IsMain = true
                };

                user.Photos.Add(photo);
                user.RefreshTokens.Add(refreshToken);

                var result = await _userManager.CreateAsync(user);

                if (!result.Succeeded)
                    throw new RestException(HttpStatusCode.BadRequest, new { User = "Problem Creating User" });


                return new User(user, _jWTGenerator, refreshToken.Token);
            }
        }
    }
}