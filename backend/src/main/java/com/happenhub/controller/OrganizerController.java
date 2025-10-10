package com.happenhub.controller;

import com.happenhub.model.Organizer;
import com.happenhub.repository.OrganizerRepository;
import com.happenhub.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/organizers")
public class OrganizerController {

    @Autowired
    private OrganizerRepository organizerRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Signup
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Organizer organizer) {
        if (organizerRepository.findByEmail(organizer.getEmail()) != null) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "❌ Organizer already exists!"));
        }
        // Encode password before saving
        organizer.setPassword(passwordEncoder.encode(organizer.getPassword()));
        organizerRepository.save(organizer);
        return ResponseEntity.ok()
            .body(Map.of("message", "✅ Organizer registered successfully!"));
    }

    // Login -> Return JWT Token with user data
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Organizer organizer) {
        Organizer existing = organizerRepository.findByEmail(organizer.getEmail());
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "No account found with this email."));
        }
        if (!passwordEncoder.matches(organizer.getPassword(), existing.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Incorrect password."));
        }

        String token = jwtUtil.generateToken(existing.getEmail());
        
        // Create a sanitized organizer object without sensitive information
        Map<String, Object> userResponse = Map.of(
            "id", existing.getId(),
            "email", existing.getEmail(),
            "name", existing.getName() != null ? existing.getName() : existing.getEmail(),
            "organization", existing.getOrganization() != null ? existing.getOrganization() : "",
            "role", "ORGANIZER"
        );
        
        return ResponseEntity.ok(Map.of(
            "user", userResponse,
            "token", token,
            "message", "Login successful!"
        ));
    }
}

