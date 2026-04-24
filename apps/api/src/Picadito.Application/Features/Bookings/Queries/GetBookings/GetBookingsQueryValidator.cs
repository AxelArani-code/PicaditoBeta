using FluentValidation;

namespace Picadito.Application.Features.Bookings.Queries.GetBookings;

/// <summary>
/// Validador para GetBookingsQuery.
/// </summary>
public class GetBookingsQueryValidator : AbstractValidator<GetBookingsQuery>
{
    public GetBookingsQueryValidator()
    {
        var valoresValidosStatus = new[] { "pending", "confirmed", "rejected", "cancelled" };
        var valoresValidosPaymentStatus = new[] { "pending", "paid", "refunded", "failed" };

        RuleFor(x => x.Status)
            .Must(status => string.IsNullOrEmpty(status) || valoresValidosStatus.Contains(status))
            .WithMessage($"El estado de reserva no es válido. Los valores permitidos son: {string.Join(", ", valoresValidosStatus)}.");

        RuleFor(x => x.PaymentStatus)
            .Must(paymentStatus => string.IsNullOrEmpty(paymentStatus) || valoresValidosPaymentStatus.Contains(paymentStatus))
            .WithMessage($"El estado de pago no es válido. Los valores permitidos son: {string.Join(", ", valoresValidosPaymentStatus)}.");

        RuleFor(x => x.PitchId)
            .NotEqual(Guid.Empty)
            .When(x => x.PitchId.HasValue)
            .WithMessage("El ID de la cancha proporcionado no es válido.");
    }
}
