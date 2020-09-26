using MediatR;
using Persistence;
using System;
using Domain;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Application.Interfaces;
using Application.Errors;
using System.Net;
using Application.Validators;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;


namespace Application.User
{
    public class ConfirmEmail
    {
        public class Command : IRequest<IdentityResult>
        {
            public string Token { get; set; }
            public string Email { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.Email).NotEmpty();
                RuleFor(x => x.Token).NotEmpty();
            }
        }

        public class Handler : IRequestHandler<Command, IdentityResult>
        {
            private UserManager<AppUser> _userManager { get; }
            public Handler(UserManager<AppUser> userManager)
            {
                _userManager = userManager;
            }

            public async Task<IdentityResult> Handle(Command request, CancellationToken CancellationToken)
            {
                var user = await _userManager.FindByEmailAsync(request.Email);
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(request.Token);
                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);
                return await _userManager.ConfirmEmailAsync(user, decodedToken);
            }
        }
    }
}