package com.example.medapp.service;

import com.example.medapp.entity.User;
import com.example.medapp.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new AccessDeniedException("Unauthorized");
        }

        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Authenticated user not found"));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
