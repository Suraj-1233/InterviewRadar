package com.interviewradar.backend.controller;

import com.interviewradar.backend.model.Company;
import com.interviewradar.backend.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyRepository companyRepository;

    // Get all companies (public)
    @GetMapping
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    // Get company by ID (public)
    @GetMapping("/{id}")
    public ResponseEntity<Company> getById(@PathVariable UUID id) {
        return companyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get company by slug (public)
    @GetMapping("/slug/{slug}")
    public ResponseEntity<Company> getBySlug(@PathVariable String slug) {
        Company company = companyRepository.findBySlug(slug);
        if (company == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(company);
    }

    // Create new company (protected)
    @PostMapping
    public ResponseEntity<Company> createCompany(@RequestBody Company company) {
        if (company.getName() == null || company.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        String slug = company.getName().toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        company.setSlug(slug);
        Company existing = companyRepository.findBySlug(slug);
        if (existing != null) {
            return ResponseEntity.ok(existing);
        }
        return ResponseEntity.ok(companyRepository.save(company));
    }
}
