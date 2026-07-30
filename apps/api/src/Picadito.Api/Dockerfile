# Etapa 1: Construcción (Equivale a tu compilación)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Picadito.Api.csproj", "./"]
RUN dotnet restore "Picadito.Api.csproj"
COPY . .
RUN dotnet publish "Picadito.Api.csproj" -c Release -o /app/publish

# Etapa 2: Arranque (Equivale a tu dotnet run)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Picadito.Api.dll"]
