package com.transito.escala.model;

import com.transito.escala.enums.SituacaoServidor;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;

@Data // Gera Getters, Setters, toString, equals, hashcode automaticamente
@Entity // Diz ao Spring que isso é uma tabela no banco
@Table(name = "servidores") // Nome da tabela no PostgreSQL (plural é boa prática)
public class Servidor implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incremento do Postgres (SERIAL)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    // Matrícula deve ser única para evitar duplicidade de cadastro
    @Column(nullable = false, unique = true, length = 20)
    private String matricula;

    @Column(nullable = false, length = 100)
    private String email;

    @Enumerated(EnumType.STRING) // Salva o texto "ATIVO" no banco, não o número 0
    @Column(nullable = false)
    private SituacaoServidor situacao;
}