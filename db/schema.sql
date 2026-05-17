-- InterviewRadar Database Schema (PostgreSQL)

-- Types
CREATE TYPE post_type AS ENUM ('InterviewExperience', 'SalaryDiscussion', 'HiringUpdate', 'OAReport');
CREATE TYPE difficulty_level AS ENUM ('Easy', 'Medium', 'Hard');
CREATE TYPE result_status AS ENUM ('Selected', 'Rejected', 'Waitlisted', 'Pending');
CREATE TYPE vote_type AS ENUM ('Upvote', 'Downvote');
CREATE TYPE followed_type AS ENUM ('User', 'Company', 'Tag');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    full_name VARCHAR(255),
    username VARCHAR(100) UNIQUE NOT NULL,
    profile_pic_url TEXT,
    bio TEXT,
    college_name VARCHAR(255),
    current_company VARCHAR(255),
    experience_years INT,
    skills TEXT[],
    is_admin BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies Table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    website_url TEXT,
    industry VARCHAR(100),
    headquarters VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags Table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts Table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    type post_type DEFAULT 'InterviewExperience',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    role VARCHAR(100),
    location VARCHAR(100),
    salary_package DECIMAL,
    stipend DECIMAL,
    currency VARCHAR(10),
    difficulty difficulty_level,
    result result_status,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_draft BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post-Tag Mapping
CREATE TABLE post_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Interview Rounds
CREATE TABLE post_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    round_name VARCHAR(100),
    description TEXT,
    difficulty difficulty_level,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions in Rounds
CREATE TABLE round_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id UUID REFERENCES post_rounds(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    topic_tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interactions
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    vote vote_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bookmarks (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE follows (
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    followed_type followed_type NOT NULL,
    followed_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (follower_id, followed_type, followed_id)
);

-- Indexes for Search Performance
CREATE INDEX idx_posts_title ON posts USING GIN (to_tsvector('english', title));
CREATE INDEX idx_posts_content ON posts USING GIN (to_tsvector('english', content));
CREATE INDEX idx_posts_company ON posts (company_id);
CREATE INDEX idx_posts_type ON posts (type);
CREATE INDEX idx_comments_post ON comments (post_id);
CREATE INDEX idx_votes_post ON votes (post_id);
