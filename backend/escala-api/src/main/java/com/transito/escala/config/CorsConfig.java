package com.transito.escala.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Libera todos os caminhos da API (login, escalas, etc)
                .allowedOrigins(
                    "https://agt-service-schedule.vercel.app", // O seu Angular na Nuvem!
                    "http://localhost:4200" // O seu Angular no seu computador (para testes)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD") // Ações permitidas
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}