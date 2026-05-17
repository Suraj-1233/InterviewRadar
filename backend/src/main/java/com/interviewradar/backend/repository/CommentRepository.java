package com.interviewradar.backend.repository;

import com.interviewradar.backend.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    // Fetch ALL comments for a post in one query — tree is built in memory (LLD strategy)
    List<Comment> findByPostIdOrderByCreatedAtAsc(UUID postId);

    void deleteByPostId(UUID postId);
}
