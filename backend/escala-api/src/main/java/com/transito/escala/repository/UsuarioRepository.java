package com.transito.escala.repository;

import com.transito.escala.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // O Spring Security vai usar isso para achar o usuário pelo login
    UserDetails findByLogin(String login);
    
}