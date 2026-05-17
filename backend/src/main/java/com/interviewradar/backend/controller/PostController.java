package com.interviewradar.backend.controller;

import com.interviewradar.backend.dto.request.CreatePostRequest;
import com.interviewradar.backend.dto.response.PostResponseDTO;
import com.interviewradar.backend.model.User;
import com.interviewradar.backend.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // ── Public endpoints ─────────────────────────────────────────────────────

    @GetMapping
    public Page<PostResponseDTO> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "latest") String sort) {
        return postService.getFeed(page, size, sort);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(postService.getById(id));
    }

    // ── Protected endpoints ──────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<PostResponseDTO> createPost(
            @Valid @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal User currentUser) {
        PostResponseDTO created = postService.createPost(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponseDTO> updatePost(
            @PathVariable UUID id,
            @Valid @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(postService.updatePost(id, request, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletePost(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        postService.deletePost(id, currentUser.getId());
        return ResponseEntity.ok(Map.of("message", "Post deleted"));
    }

    @GetMapping("/drafts")
    public List<PostResponseDTO> getMyDrafts(@AuthenticationPrincipal User currentUser) {
        return postService.getDrafts(currentUser.getId());
    }
}
