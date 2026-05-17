package com.interviewradar.backend.service;

import com.interviewradar.backend.dto.request.CreatePostRequest;
import com.interviewradar.backend.dto.response.PostResponseDTO;
import com.interviewradar.backend.model.Company;
import com.interviewradar.backend.model.Post;
import com.interviewradar.backend.model.PostRound;
import com.interviewradar.backend.model.RoundQuestion;
import com.interviewradar.backend.model.User;
import com.interviewradar.backend.repository.CompanyRepository;
import com.interviewradar.backend.repository.PostRepository;
import com.interviewradar.backend.repository.UserRepository;
import com.interviewradar.backend.repository.VoteRepository;
import com.interviewradar.backend.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final VoteRepository voteRepository;
    private final CommentRepository commentRepository;

    @Transactional(readOnly = true)
    public Page<PostResponseDTO> getFeed(int page, int size, String sort) {
        Sort sorting = sort.equals("trending")
                ? Sort.by("trendingScore").descending()
                : Sort.by("createdAt").descending();
        Pageable pageable = PageRequest.of(page, size, sorting);
        return postRepository.findByIsDraftFalse(pageable)
                .map(PostResponseDTO::fromEntity);
    }

    @Transactional
    public PostResponseDTO getById(UUID id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        // Increment view count
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);
        return PostResponseDTO.fromEntity(post);
    }

    @Transactional
    public PostResponseDTO createPost(CreatePostRequest req, UUID authorId) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Company company = req.getCompanyId() != null
                ? companyRepository.findById(req.getCompanyId()).orElse(null)
                : null;

        Post post = Post.builder()
                .author(author)
                .company(company)
                .type(req.getType())
                .title(req.getTitle())
                .content(req.getContent())
                .role(req.getRole())
                .location(req.getLocation())
                .salaryPackage(req.getSalaryPackage())
                .stipend(req.getStipend())
                .currency(req.getCurrency())
                .difficulty(req.getDifficulty())
                .result(req.getResult())
                .isAnonymous(req.isAnonymous())
                .isDraft(req.isDraft())
                .trendingScore(0.0)
                .build();

        // Attach rounds and questions
        if (req.getRounds() != null) {
            List<PostRound> rounds = new ArrayList<>();
            for (CreatePostRequest.RoundRequest rr : req.getRounds()) {
                PostRound round = PostRound.builder()
                        .post(post)
                        .roundNumber(rr.getRoundNumber())
                        .roundName(rr.getRoundName())
                        .description(rr.getDescription())
                        .difficulty(rr.getDifficulty())
                        .build();
                if (rr.getQuestions() != null) {
                    List<RoundQuestion> questions = rr.getQuestions().stream()
                            .map(q -> RoundQuestion.builder()
                                    .round(round)
                                    .questionText(q.getQuestionText())
                                    .topicTags(q.getTopicTags())
                                    .build())
                            .toList();
                    round.setQuestions(questions);
                }
                rounds.add(round);
            }
            post.setRounds(rounds);
        }

        return PostResponseDTO.fromEntity(postRepository.save(post));
    }

    @Transactional
    public PostResponseDTO updatePost(UUID postId, CreatePostRequest req, UUID requestingUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Ownership check — as per LLD rule
        User requester = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!post.getAuthor().getId().equals(requestingUserId) && !requester.isAdmin()) {
            throw new AccessDeniedException("You cannot edit this post");
        }

        Company company = req.getCompanyId() != null
                ? companyRepository.findById(req.getCompanyId()).orElse(null)
                : null;
        post.setCompany(company);

        post.setTitle(req.getTitle());
        post.setContent(req.getContent());
        post.setRole(req.getRole());
        post.setLocation(req.getLocation());
        post.setCurrency(req.getCurrency());
        post.setSalaryPackage(req.getSalaryPackage());
        post.setType(req.getType());
        post.setDifficulty(req.getDifficulty());
        post.setResult(req.getResult());
        post.setAnonymous(req.isAnonymous());
        post.setDraft(req.isDraft());

        return PostResponseDTO.fromEntity(postRepository.save(post));
    }

    @Transactional
    public void deletePost(UUID postId, UUID requestingUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User requester = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!post.getAuthor().getId().equals(requestingUserId) && !requester.isAdmin()) {
            throw new AccessDeniedException("You cannot delete this post");
        }

        voteRepository.deleteByPostId(postId);
        commentRepository.deleteByPostId(postId);
        postRepository.delete(post);
    }

    @Transactional(readOnly = true)
    public List<PostResponseDTO> getDrafts(UUID userId) {
        return postRepository.findByAuthorIdAndIsDraftTrue(userId)
                .stream().map(PostResponseDTO::fromEntity).toList();
    }
}
