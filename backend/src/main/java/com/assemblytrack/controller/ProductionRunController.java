package com.assemblytrack.controller;

import com.assemblytrack.dto.ProductionRunRequest;
import com.assemblytrack.model.Product;
import com.assemblytrack.model.ProductionRun;
import com.assemblytrack.repository.ProductRepository;
import com.assemblytrack.repository.ProductionRunRepository;
import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/production-runs")
@CrossOrigin
public class ProductionRunController {

    private final ProductionRunRepository productionRunRepository;
    private final ProductRepository productRepository;

    public ProductionRunController(ProductionRunRepository productionRunRepository, ProductRepository productRepository) {
        this.productionRunRepository = productionRunRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<ProductionRun> list() {
        return productionRunRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<ProductionRun> create(@Valid @RequestBody ProductionRunRequest request) {
        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (product == null) {
            return ResponseEntity.badRequest().build();
        }

        ProductionRun run = new ProductionRun();
        run.setProduct(product);
        run.setQuantity(request.getQuantity());
        run.setStatus(request.getStatus());
        run.setStartedAt(request.getStartedAt());
        run.setCompletedAt(request.getCompletedAt());
        return new ResponseEntity<>(productionRunRepository.save(run), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<ProductionRun> update(@PathVariable Long id, @Valid @RequestBody ProductionRunRequest request) {
        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (product == null) {
            return ResponseEntity.badRequest().build();
        }

        return productionRunRepository.findById(id)
            .map(run -> {
                run.setProduct(product);
                run.setQuantity(request.getQuantity());
                run.setStatus(request.getStatus());
                run.setStartedAt(request.getStartedAt());
                run.setCompletedAt(request.getCompletedAt());
                return ResponseEntity.ok(productionRunRepository.save(run));
            }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> uploadImage(@PathVariable Long id, @RequestParam("image") MultipartFile image) throws IOException {
        if (image.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return productionRunRepository.findById(id).map(run -> {
            try {
                String contentType = image.getContentType();
                Map<String, String> allowedTypes = Map.of(
                    "image/jpeg", ".jpg",
                    "image/png", ".png",
                    "image/webp", ".webp"
                );
                if (contentType == null || !allowedTypes.containsKey(contentType)) {
                    return ResponseEntity.badRequest().build();
                }

                Path uploadDir = Paths.get("uploads");
                Files.createDirectories(uploadDir);
                String safeName = UUID.randomUUID() + allowedTypes.get(contentType);
                Path target = uploadDir.resolve(safeName);
                Files.copy(image.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                run.setImagePath(target.toString());
                return ResponseEntity.ok(productionRunRepository.save(run));
            } catch (IOException ex) {
                return ResponseEntity.internalServerError().build();
            }
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
