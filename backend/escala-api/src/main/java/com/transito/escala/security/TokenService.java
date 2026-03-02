package com.transito.escala.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.transito.escala.model.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class TokenService {

    // Puxa a senha secreta que colocamos no application.properties
    @Value("${api.security.token.secret}")
    private String secret;

    public String gerarToken(Usuario usuario) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("escala-api") // Quem está emitindo
                    .withSubject(usuario.getLogin()) // Quem é o dono do token
                    .withClaim("role", usuario.getRole().toString())
                    .withExpiresAt(gerarDataExpiracao()) // Quando expira
                    .sign(algorithm); // Assina com a nossa senha secreta
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar token JWT", exception);
        }
    }

    public String validarToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("escala-api")
                    .build()
                    .verify(token)
                    .getSubject(); // Retorna o login (username) se o token for válido
        } catch (JWTVerificationException exception) {
            return ""; // Se o token for falso, expirado ou nulo, retorna vazio
        }
    }

    private Instant gerarDataExpiracao() {
        // Define que o token dura 2 horas (após isso, o usuário tem que logar de novo)
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }
}
