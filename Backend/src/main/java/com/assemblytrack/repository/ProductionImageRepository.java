package com.assemblytrack.repository;

import com.assemblytrack.entity.ProductionImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductionImageRepository extends JpaRepository<ProductionImage, Long> {
    List<ProductionImage> findByProductionRunId(Long productionRunId);
}
