package com.assemblytrack.service;

import com.assemblytrack.dto.MasterItemRequest;
import com.assemblytrack.entity.MasterItem;
import com.assemblytrack.repository.MasterItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
public class MasterService {

    @Autowired
    private MasterItemRepository masterItemRepository;

    public List<MasterItem> getByType(MasterItem.MasterType type) {
        return masterItemRepository.findByTypeOrderByNameAsc(type);
    }

    public MasterItem create(MasterItem.MasterType type, MasterItemRequest request) {
        MasterItem item = new MasterItem();
        applyRequest(type, request, item, null);
        return masterItemRepository.save(item);
    }

    public MasterItem update(MasterItem.MasterType type, Long id, MasterItemRequest request) {
        MasterItem existing = masterItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Master item not found"));

        if (existing.getType() != type) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Master item type mismatch");
        }

        applyRequest(type, request, existing, id);
        return masterItemRepository.save(existing);
    }

    public void delete(MasterItem.MasterType type, Long id) {
        MasterItem existing = masterItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Master item not found"));

        if (existing.getType() != type) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Master item type mismatch");
        }

        existing.setActive(Boolean.FALSE);
        masterItemRepository.save(existing);
    }

    private void applyRequest(MasterItem.MasterType type, MasterItemRequest request, MasterItem target, Long id) {
        target.setType(type);

        String normalizedName;
        if (type == MasterItem.MasterType.PRODUCT) {
            if (request.getDurationMinutes() == null || request.getDurationMinutes() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duration minutes must be greater than zero");
            }
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
            }
            normalizedName = request.getName().trim();
            target.setDurationMinutes(request.getDurationMinutes());
        } else {
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
            }
            normalizedName = request.getName().trim();
            target.setDurationMinutes(null);
        }

        boolean duplicate = id == null
                ? masterItemRepository.existsByTypeAndNameIgnoreCase(type, normalizedName)
                : masterItemRepository.existsByTypeAndNameIgnoreCaseAndIdNot(type, normalizedName, id);

        if (duplicate) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Item with same name already exists");
        }

        target.setName(normalizedName);
        target.setDescription(request.getDescription() == null ? null : request.getDescription().trim());
        target.setActive(request.getActive() == null ? Boolean.TRUE : request.getActive());
    }
}
