using System.Linq;
using System.Text.Json.Serialization;
using Domain;
using Application.Interfaces;

namespace Application.User
{
    public class User
    {
        public string DisplayName { get; set; }
        public string Token { get; set; }
        public string Username { get; set; }
        public string Image { get; set; }
        public string Bio { get; set; }

        [JsonIgnore]
        public string RefreshToken { get; set; }
        public User(AppUser user, IJWTGenerator jwtGenerator, string refreshToken)
        {
            DisplayName = user.DisplayName;
            Token = jwtGenerator.CreateToken(user);
            Username = user.UserName;
            Image = user.Photos.FirstOrDefault(x => x.IsMain)?.Url;
            Bio = user.Bio;
            RefreshToken = refreshToken;

        }
    }
}