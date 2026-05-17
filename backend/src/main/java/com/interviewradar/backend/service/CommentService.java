package com.interviewradar.backend.service;

import com.interviewradar.backend.dto.request.CreateCommentRequest;
import com.interviewradar.backend.dto.response.CommentResponseDTO;
import com.interviewradar.backend.model.Comment;
import com.interviewradar.backend.model.Post;
import com.interviewradar.backend.model.User;
import com.interviewradar.backend.repository.CommentRepository;
import com.interviewradar.backend.repository.PostRepository;
import com.interviewradar.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository    postRepository;
    private final UserRepository    userRepository;

    /**
     * Fetches all comments for a post and builds a nested tree in memory.
     *
     * Strategy (as per LLD):
     * - One DB query to fetch all comments for the post
     * - Build a Map<UUID, CommentResponseDTO>
     * - Second pass: attach each reply to its parent's replies list
     * - Return only root comments (parentId == null) — which now carry full nested tree
     *
     * This is efficient for typical comment counts and avoids N+1 recursive DB queries.
     */
    public List<CommentResponseDTO> getCommentTree(UUID postId) {
        List<Comment> allComments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId);

        // Step 1: Convert all to DTOs and map by ID
        Map<UUID, CommentResponseDTO> dtoMap = new LinkedHashMap<>();
        for (Comment c : allComments) {
            dtoMap.put(c.getId(), CommentResponseDTO.fromEntity(c));
        }

        // Step 2: Build tree — attach replies to parent
        List<CommentResponseDTO> roots = new ArrayList<>();
        for (Comment c : allComments) {
            CommentResponseDTO dto = dtoMap.get(c.getId());
            if (c.getParent() == null) {
                roots.add(dto);                                         // root comment
            } else {
                CommentResponseDTO parent = dtoMap.get(c.getParent().getId());
                if (parent != null) {
                    parent.getReplies().add(dto);                       // nested reply
                }
            }
        }

        return roots;
    }

    @Transactional
    public CommentResponseDTO addComment(UUID postId, CreateCommentRequest req, UUID userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment parent = null;
        if (req.getParentId() != null) {
            parent = commentRepository.findById(req.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
        }

        Comment comment = Comment.builder()
                .post(post)
                .user(user)
                .parent(parent)
                .content(req.getContent())
                .isAnonymous(req.isAnonymous())
                .likeCount(0)
                .build();

        return CommentResponseDTO.fromEntity(commentRepository.save(comment));
    }

    @Transactional
    public CommentResponseDTO editComment(UUID commentId, String newContent, UUID requestingUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Ownership check
        if (!comment.getUser().getId().equals(requestingUserId)) {
            throw new AccessDeniedException("You cannot edit this comment");
        }

        comment.setContent(newContent);
        return CommentResponseDTO.fromEntity(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(UUID commentId, UUID requestingUserId, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Ownership check
        if (!comment.getUser().getId().equals(requestingUserId) && !isAdmin) {
            throw new AccessDeniedException("You cannot delete this comment");
        }

        commentRepository.delete(comment);
    }

    @Transactional
    public int likeComment(UUID commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setLikeCount(comment.getLikeCount() + 1);
        return commentRepository.save(comment).getLikeCount();
    }
}
