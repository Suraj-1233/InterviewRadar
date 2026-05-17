package com.interviewradar.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateCommentRequest {

    @NotBlank(message = "Comment content cannot be empty")
    private String content;

    private UUID parentId;          // null = root comment, non-null = reply
    private boolean isAnonymous = false;
}
