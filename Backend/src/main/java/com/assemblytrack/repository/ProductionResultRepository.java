package com.assemblytrack.repository;

import com.assemblytrack.entity.ProductionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductionResultRepository extends JpaRepository<ProductionResult, Long> {
}