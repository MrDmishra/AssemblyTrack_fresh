package com.assemblytrack.repository;

import com.assemblytrack.entity.MasterItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MasterItemRepository extends JpaRepository<MasterItem, Long> {
    List<MasterItem> findByTypeOrderByNameAsc(MasterItem.MasterType type);

    boolean existsByTypeAndNameIgnoreCase(MasterItem.MasterType type, String name);

    boolean existsByTypeAndNameIgnoreCaseAndIdNot(MasterItem.MasterType type, String name, Long id);
}
