package com.interviewradar.backend.dto.response;

import com.interviewradar.backend.model.Post;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class PostResponseDTO {
    private UUID id;
    private String title;
    private String content;
    private UUID authorId;           // always present — used for ownership checks
    private String authorName;       // "Anonymous" or real username
    private UUID companyId;
    private String companyName;
    private String companySlug;
    private String companyLogo;
    private Post.PostType type;
    private String role;
    private String location;
    private String currency;
    private BigDecimal salaryPackage;
    private String difficulty;
    private String result;
    private boolean isAnonymous;
    private boolean isDraft;
    private int viewCount;
    private double trendingScore;
    private LocalDateTime createdAt;

    public static PostResponseDTO fromEntity(Post post) {
        // ── Anonymous identity masking (LLD Rule) ────────────────────────────
        String authorName = "Anonymous";
        if (!post.isAnonymous()) {
            authorName = (post.getAuthor() != null)
                    ? post.getAuthor().getHandle()
                    : "Deleted User";
        }
        // ─────────────────────────────────────────────────────────────────────

        return PostResponseDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .authorId(post.getAuthor() != null ? post.getAuthor().getId() : null)
                .authorName(authorName)
                .companyId(post.getCompany() != null ? post.getCompany().getId() : null)
                .companyName(post.getCompany() != null ? post.getCompany().getName() : null)
                .companySlug(post.getCompany() != null ? post.getCompany().getSlug() : null)
                .companyLogo(post.getCompany() != null ? post.getCompany().getLogoUrl() : null)
                .type(post.getType())
                .role(post.getRole())
                .location(post.getLocation())
                .currency(post.getCurrency())
                .salaryPackage(post.getSalaryPackage())
                .difficulty(post.getDifficulty())
                .result(post.getResult())
                .isAnonymous(post.isAnonymous())
                .isDraft(post.isDraft())
                .viewCount(post.getViewCount())
                .trendingScore(post.getTrendingScore())
                .createdAt(post.getCreatedAt())
                .build();
    }
}
