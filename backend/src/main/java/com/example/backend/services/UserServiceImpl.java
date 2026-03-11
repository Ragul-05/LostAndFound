package com.example.backend.services;

import com.example.backend.dtos.LoginDto;
import com.example.backend.dtos.UpdateUserDto;
import com.example.backend.dtos.UserRegistrationDto;
import com.example.backend.exception.AccessDeniedException;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.models.Role;
import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User registerUser(UserRegistrationDto registrationDto) {
        if (userRepository.existsByUsername(registrationDto.getUsername())) {
            throw new BadRequestException("Username already exists");
        }
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setEmail(registrationDto.getEmail());
        user.setPassword(BCrypt.hashpw(registrationDto.getPassword(), BCrypt.gensalt()));
        user.setRole(Role.USER);
        return userRepository.save(user);
    }

    @Override
    public User authenticateUser(LoginDto loginDto) {
        Optional<User> userOptional = userRepository.findByUsername(loginDto.getUsername());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            boolean passwordMatches;
            try {
                passwordMatches = BCrypt.checkpw(loginDto.getPassword(), user.getPassword());
            } catch (Exception e) {
                passwordMatches = user.getPassword().equals(loginDto.getPassword());
            }
            if (passwordMatches) {
                return user;
            }
        }
        throw new BadRequestException("Invalid username or password");
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Override
    public User updateUser(Long id, UpdateUserDto dto, String requestingUsername) {
        User requester = userRepository.findByUsername(requestingUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requestingUsername));

        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        boolean isAdmin = requester.getRole() == Role.ADMIN;
        boolean isSelf  = requester.getId().equals(target.getId());

        // Only ADMIN or the user themselves can update
        if (!isAdmin && !isSelf) {
            throw new AccessDeniedException("You can only update your own profile");
        }

        // Update email if provided
        if (StringUtils.hasText(dto.getEmail())) {
            // Check uniqueness only if changed
            if (!dto.getEmail().equalsIgnoreCase(target.getEmail())) {
                if (userRepository.existsByEmail(dto.getEmail())) {
                    throw new BadRequestException("Email already in use");
                }
            }
            target.setEmail(dto.getEmail());
        }

        // Update password if provided
        if (StringUtils.hasText(dto.getPassword())) {
            target.setPassword(BCrypt.hashpw(dto.getPassword(), BCrypt.gensalt()));
        }

        // Only ADMIN can change roles
        if (StringUtils.hasText(dto.getRole())) {
            if (!isAdmin) {
                throw new AccessDeniedException("Only admins can change roles");
            }
            try {
                target.setRole(Role.valueOf(dto.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role: " + dto.getRole() + ". Must be USER or ADMIN");
            }
        }

        return userRepository.save(target);
    }

    @Override
    public void deleteUser(Long id, String requestingUsername) {
        User requester = userRepository.findByUsername(requestingUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requestingUsername));

        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        boolean isAdmin = requester.getRole() == Role.ADMIN;
        boolean isSelf  = requester.getId().equals(target.getId());

        // Only ADMIN can delete any user; a user cannot delete themselves
        if (!isAdmin) {
            if (isSelf) {
                throw new AccessDeniedException("Users cannot delete their own account");
            }
            throw new AccessDeniedException("Only admins can delete users");
        }

        // Prevent deleting the last admin
        if (target.getRole() == Role.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN).count();
            if (adminCount <= 1) {
                throw new BadRequestException("Cannot delete the last admin account");
            }
        }

        userRepository.deleteById(id);
    }
}
