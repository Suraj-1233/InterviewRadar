package com.interviewradar.backend.service;

import com.interviewradar.backend.dto.response.VoteResponseDTO;
import com.interviewradar.backend.model.Post;
import com.interviewradar.backend.model.User;
import com.interviewradar.backend.model.Vote;
import com.interviewradar.backend.repository.PostRepository;
import com.interviewradar.backend.repository.UserRepository;
import com.interviewradar.backend.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteRepository voteRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    /**
     * Vote toggle logic (from LLD):
     *
     *  POST /votes/post/{postId}  with  { voteType: "Upvote" }
     *       ↓
     *  voteRepository.findByUserIdAndPostId(userId, postId)
     *       ↓
     *    Found?
     *    ├── YES, same type  → DELETE vote (toggle off)
     *    ├── YES, diff type  → UPDATE vote type (switch vote)
     *    └── NO              → INSERT new vote
     *       ↓
     *  Return {upvotes, downvotes, userVote}
     */
    @Transactional
    public VoteResponseDTO toggleVote(UUID postId, UUID userId, Vote.VoteType requestedType) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Vote> existing = voteRepository.findByUserIdAndPostId(userId, postId);
        String userVote = null;

        if (existing.isPresent()) {
            Vote vote = existing.get();
            if (vote.getVoteType() == requestedType) {
                // Same type → toggle OFF (remove vote)
                voteRepository.delete(vote);
                userVote = null;
            } else {
                // Different type → switch vote
                vote.setVoteType(requestedType);
                voteRepository.save(vote);
                userVote = requestedType.name();
            }
        } else {
            // No existing vote → create new
            Vote newVote = Vote.builder()
                    .user(user)
                    .post(post)
                    .voteType(requestedType)
                    .build();
            voteRepository.save(newVote);
            userVote = requestedType.name();
        }

        return buildResponse(postId, userVote);
    }

    @Transactional
    public VoteResponseDTO removeVote(UUID postId, UUID userId) {
        voteRepository.findByUserIdAndPostId(userId, postId)
                .ifPresent(voteRepository::delete);
        return buildResponse(postId, null);
    }

    public VoteResponseDTO getVoteStatus(UUID postId, UUID userId) {
        Optional<Vote> existing = voteRepository.findByUserIdAndPostId(userId, postId);
        String userVote = existing.map(v -> v.getVoteType().name()).orElse(null);
        return buildResponse(postId, userVote);
    }

    private VoteResponseDTO buildResponse(UUID postId, String userVote) {
        return VoteResponseDTO.builder()
                .upvotes(voteRepository.countUpvotesByPostId(postId))
                .downvotes(voteRepository.countDownvotesByPostId(postId))
                .userVote(userVote)
                .build();
    }
}
