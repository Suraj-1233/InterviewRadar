package com.interviewradar.backend.service;

import com.interviewradar.backend.dto.request.UpdateProfileRequest;
import com.interviewradar.backend.model.User;
import com.interviewradar.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getCollegeName() != null) user.setCollegeName(request.getCollegeName());
        if (request.getCurrentCompany() != null) user.setCurrentCompany(request.getCurrentCompany());
        if (request.getExperienceYears() != null) user.setExperienceYears(request.getExperienceYears());
        if (request.getSkills() != null) user.setSkills(request.getSkills());

        return userRepository.save(user);
    }
    
    public User getProfile(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
