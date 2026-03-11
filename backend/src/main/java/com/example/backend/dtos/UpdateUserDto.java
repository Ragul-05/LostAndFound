package com.example.backend.dtos;

import lombok.Data;

@Data
public class UpdateUserDto {
    private String email;       // optional — only updated if non-null
    private String password;    // optional — only updated if non-null
    private String role;        // optional — ADMIN-only field
}
