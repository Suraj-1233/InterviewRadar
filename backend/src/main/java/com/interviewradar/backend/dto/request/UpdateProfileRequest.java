package com.interviewradar.backend.dto.request;

import lombok.Data;
import java.util.Set;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String bio;
    private String collegeName;
    private String currentCompany;
    private Integer experienceYears;
    private Set<String> skills;
}
