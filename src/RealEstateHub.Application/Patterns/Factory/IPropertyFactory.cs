using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Entities.Users;

namespace RealEstateHub.Application.Patterns.Factory;

public interface IPropertyFactory
{
    Property Create(CreateListingRequest request, User owner);
}
