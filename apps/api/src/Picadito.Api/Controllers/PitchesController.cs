using Microsoft.AspNetCore.Mvc;
using Picadito.Application.Features.Pitches.Queries.GetAllPitches;
using ErrorOr;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Picadito.Api.Controllers;

/// <summary>
/// Controlador para gestionar las operaciones relacionadas con las canchas.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PitchesController : ControllerBase
{
    private readonly GetAllPitchesHandler _getAllPitchesHandler;

    public PitchesController(GetAllPitchesHandler getAllPitchesHandler)
    {
        _getAllPitchesHandler = getAllPitchesHandler;
    }

    /// <summary>
    /// Obtiene todas las canchas activas.
    /// </summary>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Lista de canchas o errores.</returns>
    [HttpGet]
    public async Task<IActionResult> GetAllPitches(CancellationToken cancellationToken)
    {
        var query = new GetAllPitchesQuery();
        var result = await _getAllPitchesHandler.Handle(query, cancellationToken);

        return result.Match(
            pitches => Ok(pitches),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Maneja los errores y los convierte a una respuesta HTTP apropiada.
    /// </summary>
    private IActionResult Problem(List<Error> errors)
    {
        if (errors.Count == 0) return Problem();

        // Si todos los errores son de validación, devolvemos un 400 con los detalles
        if (errors.All(error => error.Type == ErrorType.Validation))
        {
            var modelStateDictionary = new ModelStateDictionary();
            foreach (var error in errors)
            {
                modelStateDictionary.AddModelError(error.Code, error.Description);
            }
            return ValidationProblem(modelStateDictionary);
        }

        // Si hay errores de distintos tipos, tomamos el primero para decidir el StatusCode
        var firstError = errors[0];
        
        var statusCode = firstError.Type switch
        {
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status500InternalServerError,
        };

        return Problem(statusCode: statusCode, title: firstError.Description);
    }
}
