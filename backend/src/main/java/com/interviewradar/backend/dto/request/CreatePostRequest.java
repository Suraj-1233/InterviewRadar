package com.interviewradar.backend.dto.request;

import com.interviewradar.backend.model.Post;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CreatePostRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private UUID companyId;

    private Post.PostType type = Post.PostType.InterviewExperience;

    private String role;
    private String location;
    private BigDecimal salaryPackage;
    private BigDecimal stipend;
    private String currency;

    private String difficulty;
    private String result;

    private boolean isAnonymous = false;
    private boolean isDraft = false;

    private List<UUID> tagIds;
    private List<RoundRequest> rounds;

    @Data
    public static class RoundRequest {
        private int roundNumber;
        private String roundName;
        private String description;
        private String difficulty;
        private List<QuestionRequest> questions;
    }

    @Data
    public static class QuestionRequest {
        private String questionText;
        private List<String> topicTags;
    }
}
