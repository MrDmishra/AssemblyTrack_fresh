package com.assemblytrack.repository;

import com.assemblytrack.entity.ProductionRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductionRunRepository extends JpaRepository<ProductionRun, Long> {

    List<ProductionRun> findByStatus(ProductionRun.Status status);

    @Query("SELECT pr FROM ProductionRun pr WHERE pr.startTime BETWEEN :startDate AND :endDate")
    List<ProductionRun> findByDateRange(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    List<ProductionRun> findByCategory(String category);

    List<ProductionRun> findByEmployeeEmployeeId(String employeeId);
}