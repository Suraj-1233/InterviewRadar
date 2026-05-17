package com.interviewradar.backend.repository;

import com.interviewradar.backend.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    Page<Post> findByIsDraftFalse(Pageable pageable);
    Page<Post> findByCompanySlugAndIsDraftFalse(String slug, Pageable pageable);
    List<Post> findByAuthorIdAndIsDraftTrue(UUID authorId);
    List<Post> findByTypeAndIsDraftFalse(Post.PostType type);
}
