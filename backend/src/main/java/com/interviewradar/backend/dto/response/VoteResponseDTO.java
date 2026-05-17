package com.interviewradar.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class VoteResponseDTO {
    private long upvotes;
    private long downvotes;
    private String userVote;    // "Upvote", "Downvote", or null (no vote)
}
