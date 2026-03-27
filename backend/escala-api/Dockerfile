# 1. Pega o Java 21 e o Maven para compilar o projeto
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# 2. Pega apenas o Java 21 levinho para rodar o projeto
FROM eclipse-temurin:21-jre
WORKDIR /app
# Copia o arquivo .jar gerado no passo 1
COPY --from=build /app/target/*.jar app.jar
# Libera a porta 8081 que você configurou
EXPOSE 8081
# Comando para ligar o servidor
ENTRYPOINT ["java", "-jar", "app.jar"]