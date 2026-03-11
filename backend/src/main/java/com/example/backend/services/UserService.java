package com.example.backend.services;

import com.example.backend.dtos.LoginDto;
import com.example.backend.dtos.UpdateUserDto;
import com.example.backend.dtos.UserRegistrationDto;
import com.example.backend.models.User;
import java.util.List;

public interface UserService {
    User registerUser(UserRegistrationDto registrationDto);

    User authenticateUser(LoginDto loginDto);

    User findByUsername(String username);

    List<User> getAllUsers();

    User getUserById(Long id);

    User updateUser(Long id, UpdateUserDto dto, String requestingUsername);

    void deleteUser(Long id, String requestingUsername);
}
