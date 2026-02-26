package com.transito.escala.controller;

import com.transito.escala.dto.AuthenticationDTO;
import com.transito.escala.dto.LoginResponseDTO;
import com.transito.escala.dto.RegisterDTO;
import com.transito.escala.model.Usuario;
import com.transito.escala.repository.UsuarioRepository;
import com.transito.escala.security.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody AuthenticationDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.login(), data.senha());
        var auth = this.authenticationManager.authenticate(usernamePassword);
        
        var token = tokenService.gerarToken((Usuario) auth.getPrincipal());
        
        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @PostMapping("/registrar")
    public ResponseEntity register(@RequestBody RegisterDTO data) {
        if(this.repository.findByLogin(data.login()) != null) return ResponseEntity.badRequest().build();

        // Criptografa a senha antes de salvar no banco
        String encryptedPassword = passwordEncoder.encode(data.senha());
        
        Usuario newUser = new Usuario(data.login(), encryptedPassword, data.role());
        this.repository.save(newUser);
        
        return ResponseEntity.ok().build();
    }
}