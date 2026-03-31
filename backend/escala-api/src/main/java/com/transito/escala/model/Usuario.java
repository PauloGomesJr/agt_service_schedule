package com.transito.escala.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "usuarios")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String login; // Pode ser a matrícula ou email

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private String role; // "ADMIN" (Escalante) ou "USER" (Servidor Comum)

    public Usuario() {}

    public Usuario(String login, String senha, String role) {
        this.login = login;
        this.senha = senha;
        this.role = role;
    }

    // Getters e Setters Padrões
    public Long getId() { return id; }
    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    // === MÉTODOS OBRIGATÓRIOS DO SPRING SECURITY ===
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Se for ADMIN, tem permissão de ADMIN e USER. Se for USER, só USER.
        if (this.role.equals("ADMIN")) {
            return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_USER"));
        } else {
            return List.of(new SimpleGrantedAuthority("ROLE_USER"));
        }
    }

    @Override
    public String getPassword() { return senha; }

    @Override
    public String getUsername() { return login; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    // ... dentro da classe Usuario ...
    @Column(nullable = false)
    private boolean aprovado = false; // Todo usuário novo começa "bloqueado"

    // Atualize o método que o Spring Security usa para validar o acesso
    @Override
    public boolean isEnabled() { 
        return aprovado; // O usuário só "existe" para o sistema se for aprovado
    }

    // Adicione o Getter e Setter para o campo aprovado
    public boolean isAprovado() { return aprovado; }
    public void setAprovado(boolean aprovado) { this.aprovado = aprovado; }
}
