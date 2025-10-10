package com.happenhub.controller;

import com.happenhub.model.User;
import com.happenhub.repository.UserRepository;
import com.happenhub.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "❌ Email already exists!"));
        }
        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok()
                .body("✅ User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        User existing = userRepository.findByEmail(user.getEmail());
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "No account found with this email."));
        }
        if (!passwordEncoder.matches(user.getPassword(), existing.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Incorrect password."));
        }

        String token = jwtUtil.generateToken(existing.getEmail());
        
        // Create a sanitized user object without sensitive information
        Map<String, Object> userResponse = Map.of(
            "id", existing.getId(),
            "email", existing.getEmail(),
            "name", existing.getName() != null ? existing.getName() : existing.getEmail(),
            "location", existing.getLocation() != null ? existing.getLocation() : "",
            "role", "USER"
        );
        
        return ResponseEntity.ok(Map.of(
            "user", userResponse,
            "token", token,
            "message", "Login successful!"
        ));
    }

    // Update user profile (requires auth token in header)
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                           @RequestBody User updated) {
        try {
            String token = authHeader != null ? authHeader.replace("Bearer ", "") : null;
            if (token == null || !jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "❌ Unauthorized"));
            }
            String email = jwtUtil.extractEmail(token);
            User existing = userRepository.findByEmail(email);
            if (existing == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "❌ User not found"));

            // Update allowed fields
            if (updated.getName() != null && !updated.getName().isEmpty()) existing.setName(updated.getName());
            if (updated.getLocation() != null && !updated.getLocation().isEmpty()) existing.setLocation(updated.getLocation());
            if (updated.getPhone() != null && !updated.getPhone().isEmpty()) existing.setPhone(updated.getPhone());
            if (updated.getBio() != null && !updated.getBio().isEmpty()) existing.setBio(updated.getBio());

            User savedUser = userRepository.save(existing);
            
            // Return updated user data
            Map<String, Object> userResponse = Map.of(
                "id", savedUser.getId(),
                "email", savedUser.getEmail(),
                "name", savedUser.getName() != null ? savedUser.getName() : savedUser.getEmail(),
                "location", savedUser.getLocation() != null ? savedUser.getLocation() : "",
                "phone", savedUser.getPhone() != null ? savedUser.getPhone() : "",
                "bio", savedUser.getBio() != null ? savedUser.getBio() : "",
                "message", "✅ Profile updated successfully"
            );
            return ResponseEntity.ok(userResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "❌ Failed to update"));
        }
    }

    // Get user favorites (placeholder)
    @GetMapping("/favorites")
    public ResponseEntity<?> getFavorites(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String token = authHeader != null ? authHeader.replace("Bearer ", "") : null;
            if (token == null || !jwtUtil.validateToken(token)) {
                return ResponseEntity.ok().body(new String[]{});
            }
            // For now return empty list or sample
            return ResponseEntity.ok(new String[]{});
        } catch (Exception e) {
            return ResponseEntity.ok(new String[]{});
        }
    }
}
