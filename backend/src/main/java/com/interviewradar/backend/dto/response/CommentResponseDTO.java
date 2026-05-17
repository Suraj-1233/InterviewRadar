package com.interviewradar.backend.dto.response;

import com.interviewradar.backend.model.Comment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class CommentResponseDTO {

    private UUID id;
    private String authorName;      // "Anonymous" or real username
    private String authorAvatar;
    private String content;
    private boolean isAnonymous;
    private int likeCount;
    private UUID parentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Nested replies — populated by CommentService tree builder
    @Builder.Default
    private List<CommentResponseDTO> replies = new ArrayList<>();

    public static CommentResponseDTO fromEntity(Comment comment) {
        // ── Anonymous identity masking ────────────────────────────────────────
        String authorName = "Anonymous";
        String authorAvatar = null;
        if (!comment.isAnonymous() && comment.getUser() != null) {
            authorName   = comment.getUser().getHandle();
            authorAvatar = comment.getUser().getProfilePicUrl();
        }
        // ─────────────────────────────────────────────────────────────────────

        return CommentResponseDTO.builder()
                .id(comment.getId())
                .authorName(authorName)
                .authorAvatar(authorAvatar)
                .content(comment.getContent())
                .isAnonymous(comment.isAnonymous())
                .likeCount(comment.getLikeCount())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .replies(new ArrayList<>())       // replies populated by tree builder
                .build();
    }
}
