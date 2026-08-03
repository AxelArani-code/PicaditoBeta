# 1. Etapa de construcción usando .NET 10
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiamos todo el repositorio al contenedor
COPY . .

# Restauramos las dependencias
RUN dotnet restore "apps/api/src/Picadito.Api/Picadito.Api.csproj"

# Compilamos el proyecto para producción
RUN dotnet publish "apps/api/src/Picadito.Api/Picadito.Api.csproj" -c Release -o /app/publish

# 2. Etapa final usando .NET 10
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Le indicamos a la app que escuche en el puerto que Render necesita
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Picadito.Api.dll"]
