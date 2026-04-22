package com.assemblytrack.repository;

import com.assemblytrack.model.ProductionRun;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductionRunRepository extends JpaRepository<ProductionRun, Long> {
    long countByStatusIgnoreCase(String status);
    List<ProductionRun> findTop5ByOrderByStartedAtDesc();
}
