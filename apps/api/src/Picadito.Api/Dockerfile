# 1. Etapa de construcción
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiamos todo el repositorio al contenedor (para incluir todas las capas de tu Clean Architecture)
COPY . .

# Restauramos las dependencias usando la ruta completa desde la raíz de tu GitHub
RUN dotnet restore "apps/api/src/Picadito.Api/Picadito.Api.csproj"

# Compilamos el proyecto para producción
RUN dotnet publish "apps/api/src/Picadito.Api/Picadito.Api.csproj" -c Release -o /app/publish

# 2. Etapa final (el servidor que correrá en Render)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Le indicamos a la app que escuche en el puerto que Render necesita
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Picadito.Api.dll"]
