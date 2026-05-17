package com.interviewradar.backend.repository;

import com.interviewradar.backend.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoteRepository extends JpaRepository<Vote, UUID> {
    Optional<Vote> findByUserIdAndPostId(UUID userId, UUID postId);

    @Query("SELECT COUNT(v) FROM Vote v WHERE v.post.id = :postId AND v.voteType = 'Upvote'")
    long countUpvotesByPostId(UUID postId);

    @Query("SELECT COUNT(v) FROM Vote v WHERE v.post.id = :postId AND v.voteType = 'Downvote'")
    long countDownvotesByPostId(UUID postId);

    void deleteByPostId(UUID postId);
}
