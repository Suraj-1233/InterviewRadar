package com.interviewradar.backend.controller;

import com.interviewradar.backend.dto.response.VoteResponseDTO;
import com.interviewradar.backend.model.User;
import com.interviewradar.backend.model.Vote;
import com.interviewradar.backend.service.VoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    // Get current vote status for a post
    @GetMapping("/post/{postId}")
    public ResponseEntity<VoteResponseDTO> getVoteStatus(
            @PathVariable UUID postId,
            @AuthenticationPrincipal User currentUser) {
        VoteResponseDTO response = voteService.getVoteStatus(postId, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    // Toggle vote (Upvote or Downvote)
    @PostMapping("/post/{postId}")
    public ResponseEntity<VoteResponseDTO> vote(
            @PathVariable UUID postId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {
        Vote.VoteType type = Vote.VoteType.valueOf(body.get("voteType"));
        VoteResponseDTO response = voteService.toggleVote(postId, currentUser.getId(), type);
        return ResponseEntity.ok(response);
    }

    // Remove vote explicitly
    @DeleteMapping("/post/{postId}")
    public ResponseEntity<VoteResponseDTO> removeVote(
            @PathVariable UUID postId,
            @AuthenticationPrincipal User currentUser) {
        VoteResponseDTO response = voteService.removeVote(postId, currentUser.getId());
        return ResponseEntity.ok(response);
    }
}
