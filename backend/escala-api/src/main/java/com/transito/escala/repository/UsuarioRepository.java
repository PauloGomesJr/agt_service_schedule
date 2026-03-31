package com.transito.escala.repository;

import com.transito.escala.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.List;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    UserDetails findByLogin(String login);
    
    // === NOVO MÉTODO: Busca todos os usuários onde aprovado é igual a false ===
    List<Usuario> findAllByAprovadoFalse();
}