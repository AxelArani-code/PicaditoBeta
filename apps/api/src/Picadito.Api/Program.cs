using System;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Picadito.Application.Common.Interfaces;
using Picadito.Domain.Enums;
using Picadito.Infrastructure.Persistence.Repositories;
using Picadito.Infrastructure.Persistence;
using Picadito.Application.Features.Bookings.Commands.CreateBooking;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.MapEnum<BookingStatus>("booking_status");
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(dataSource));
// Registra todos los validadores del assembly actual
builder.Services.AddValidatorsFromAssemblyContaining<CreateBookingCommandValidator>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<ITimeSlotRepository, TimeSlotRepository>();
builder.Services.AddScoped<CreateBookingHandler>();
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
