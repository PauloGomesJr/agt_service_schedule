package com.transito.escala.repository;

import com.transito.escala.model.TipoServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

public interface TipoServicoRepository extends JpaRepository<TipoServico, Long>{
    Optional<TipoServico> findByCodigo(String codigo);
}
