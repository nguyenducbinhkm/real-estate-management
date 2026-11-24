using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Interfaces;

namespace RealEstateHub.API.Controllers;

/// <summary>API dự án (chỉ đọc).</summary>
[ApiController]
[Route("api/projects")]
[AllowAnonymous]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projects;

    public ProjectsController(IProjectService projects) => _projects = projects;

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] ProjectQuery query, CancellationToken ct)
        => Ok(await _projects.SearchAsync(query, ct));

    [HttpGet("provinces")]
    public async Task<IActionResult> Provinces(CancellationToken ct)
        => Ok(await _projects.GetProvincesAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
        => Ok(await _projects.GetByIdAsync(id, ct));

    [HttpGet("{id:guid}/listings")]
    public async Task<IActionResult> Listings(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 12, CancellationToken ct = default)
        => Ok(await _projects.GetListingsAsync(id, page, pageSize, ct));

    [HttpGet("{id:guid}/related")]
    public async Task<IActionResult> Related(Guid id, [FromQuery] int limit = 4, CancellationToken ct = default)
        => Ok(await _projects.GetRelatedAsync(id, limit, ct));
}
