package com.assemblytrack.controller;

import com.assemblytrack.dto.MasterItemRequest;
import com.assemblytrack.entity.MasterItem;
import com.assemblytrack.service.MasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/masters")
public class MasterController {

    @Autowired
    private MasterService masterService;

    @GetMapping("/types")
    public ResponseEntity<List<String>> getTypes() {
        List<String> types = Arrays.stream(MasterItem.MasterType.values())
                .map(Enum::name)
                .toList();
        return ResponseEntity.ok(types);
    }

    @GetMapping("/{type}")
    public ResponseEntity<List<MasterItem>> getByType(@PathVariable String type) {
        MasterItem.MasterType masterType = parseType(type);
        return ResponseEntity.ok(masterService.getByType(masterType));
    }

    @PostMapping("/{type}")
    public ResponseEntity<MasterItem> create(@PathVariable String type, @RequestBody MasterItemRequest request) {
        MasterItem.MasterType masterType = parseType(type);
        return ResponseEntity.ok(masterService.create(masterType, request));
    }

    @PutMapping("/{type}/{id}")
    public ResponseEntity<MasterItem> update(
            @PathVariable String type,
            @PathVariable Long id,
            @RequestBody MasterItemRequest request) {
        MasterItem.MasterType masterType = parseType(type);
        return ResponseEntity.ok(masterService.update(masterType, id, request));
    }

    @DeleteMapping("/{type}/{id}")
    public ResponseEntity<Void> delete(@PathVariable String type, @PathVariable Long id) {
        MasterItem.MasterType masterType = parseType(type);
        masterService.delete(masterType, id);
        return ResponseEntity.noContent().build();
    }

    private MasterItem.MasterType parseType(String type) {
        try {
            return MasterItem.MasterType.valueOf(type.toUpperCase().replace('-', '_'));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid master type: " + type);
        }
    }
}
