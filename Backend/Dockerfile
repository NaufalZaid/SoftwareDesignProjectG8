# Uses Java 21 to run your Spring Boot app
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Copies your jar into the container
COPY target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]