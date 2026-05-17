package com.interviewradar.backend.controller;

import com.interviewradar.backend.dto.request.CreateCommentRequest;
import com.interviewradar.backend.dto.response.CommentResponseDTO;
import com.interviewradar.backend.model.User;
import com.interviewradar.backend.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // Public — anyone can read comments
    @GetMapping("/post/{postId}")
    public List<CommentResponseDTO> getComments(@PathVariable UUID postId) {
        return commentService.getCommentTree(postId);
    }

    // Protected — must be logged in to comment
    @PostMapping("/post/{postId}")
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable UUID postId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal User currentUser) {
        CommentResponseDTO comment = commentService.addComment(postId, request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentResponseDTO> editComment(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {
        CommentResponseDTO updated = commentService.editComment(id, body.get("content"), currentUser.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteComment(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        commentService.deleteComment(id, currentUser.getId(), currentUser.isAdmin());
        return ResponseEntity.ok(Map.of("message", "Comment deleted"));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Integer>> likeComment(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        int newCount = commentService.likeComment(id);
        return ResponseEntity.ok(Map.of("likeCount", newCount));
    }
}
