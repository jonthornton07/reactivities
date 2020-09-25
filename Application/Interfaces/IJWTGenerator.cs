using Domain;

namespace Application.Interfaces
{
    public interface IJWTGenerator
    {
        string CreateToken(AppUser appUser);
        RefreshToken GenerateRefreshToken();
    }
}