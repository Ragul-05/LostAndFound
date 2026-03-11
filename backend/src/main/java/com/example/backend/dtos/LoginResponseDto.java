package com.example.backend.dtos;

import com.example.backend.models.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDto {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private String message;
    private String token;
}
