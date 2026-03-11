package com.example.backend.controllers;

import com.example.backend.dtos.LoginDto;
import com.example.backend.dtos.LoginResponseDto;
import com.example.backend.dtos.UpdateUserDto;
import com.example.backend.dtos.UserRegistrationDto;
import com.example.backend.models.User;
import com.example.backend.security.JwtUtil;
import com.example.backend.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Autowired
    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil     = jwtUtil;
    }

    // ── Auth ─────────────────────────────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<LoginResponseDto> registerUser(@Valid @RequestBody UserRegistrationDto dto) {
        User user    = userService.registerUser(dto);
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(new LoginResponseDto(
                user.getId(), user.getUsername(), user.getEmail(), user.getRole(),
                "User registered successfully", token));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> loginUser(@RequestBody LoginDto loginDto) {
        User user    = userService.authenticateUser(loginDto);
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(new LoginResponseDto(
                user.getId(), user.getUsername(), user.getEmail(), user.getRole(),
                "Login successful", token));
    }

    // ── Read ─────────────────────────────────────────────────────────────────

    /** Admin only — list all users */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userService.getAllUsers().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    /** Admin or self — get single user by id */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getUserById(
            @PathVariable Long id,
            @AuthenticationPrincipal String callerUsername) {
        User caller = userService.findByUsername(callerUsername);
        User target = userService.getUserById(id);
        // Only admin or the user themselves
        if (!caller.getRole().name().equals("ADMIN") && !caller.getId().equals(target.getId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(toMap(target));
    }

    // ── Update ────────────────────────────────────────────────────────────────

    /**
     * PUT /api/users/{id}
     * Admin can update any user (including role).
     * A USER can only update their own email/password.
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserDto dto,
            @AuthenticationPrincipal String callerUsername) {
        User updated = userService.updateUser(id, dto, callerUsername);
        return ResponseEntity.ok(toMap(updated));
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    /**
     * DELETE /api/users/{id}
     * Admin only. Cannot delete the last admin.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal String callerUsername) {
        userService.deleteUser(id, callerUsername);
        Map<String, Object> body = new HashMap<>();
        body.put("message", "User deleted successfully");
        body.put("deletedId", id);
        return ResponseEntity.ok(body);
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Map<String, Object> toMap(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",       u.getId());
        m.put("username", u.getUsername());
        m.put("email",    u.getEmail());
        m.put("role",     u.getRole().toString());
        return m;
    }
}
