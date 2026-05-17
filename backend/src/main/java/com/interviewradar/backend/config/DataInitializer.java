package com.interviewradar.backend.config;

import com.interviewradar.backend.model.Company;
import com.interviewradar.backend.model.Post;
import com.interviewradar.backend.model.User;
import com.interviewradar.backend.repository.CompanyRepository;
import com.interviewradar.backend.repository.PostRepository;
import com.interviewradar.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final PostRepository postRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .fullName("Admin User")
                    .username("admin")
                    .email("admin@test.com")
                    .password(passwordEncoder.encode("password123"))
                    .isAdmin(true)
                    .isEmailVerified(true)
                    .build();
            userRepository.save(admin);

            User testUser = User.builder()
                    .fullName("Test User")
                    .username("testuser")
                    .email("user@test.com")
                    .password(passwordEncoder.encode("password123"))
                    .isAdmin(false)
                    .isEmailVerified(true)
                    .build();
            userRepository.save(testUser);
        }

        if (companyRepository.count() == 0) {
            Company google = Company.builder()
                    .name("Google").slug("google")
                    .industry("Technology").headquarters("Mountain View, CA")
                    .description("Global tech giant known for Search, Android, and Cloud.")
                    .websiteUrl("https://google.com").build();
            companyRepository.save(google);

            Company amazon = Company.builder()
                    .name("Amazon").slug("amazon")
                    .industry("E-Commerce / Cloud").headquarters("Seattle, WA")
                    .description("Earth's most customer-centric company and AWS cloud leader.")
                    .websiteUrl("https://amazon.com").build();
            companyRepository.save(amazon);

            Company microsoft = Company.builder()
                    .name("Microsoft").slug("microsoft")
                    .industry("Technology").headquarters("Redmond, WA")
                    .description("Empowering every person and organization on the planet to achieve more.")
                    .websiteUrl("https://microsoft.com").build();
            companyRepository.save(microsoft);

            Company meta = Company.builder()
                    .name("Meta").slug("meta")
                    .industry("Social Media / Technology").headquarters("Menlo Park, CA")
                    .description("Building the future of social connection and the metaverse.")
                    .websiteUrl("https://meta.com").build();
            companyRepository.save(meta);

            Company flipkart = Company.builder()
                    .name("Flipkart").slug("flipkart")
                    .industry("E-Commerce").headquarters("Bengaluru, India")
                    .description("India's leading e-commerce marketplace.")
                    .websiteUrl("https://flipkart.com").build();
            companyRepository.save(flipkart);

            Company tcs = Company.builder()
                    .name("TCS").slug("tcs")
                    .industry("IT Services").headquarters("Mumbai, India")
                    .description("Tata Consultancy Services – global IT services leader.")
                    .websiteUrl("https://tcs.com").build();
            companyRepository.save(tcs);

            Company infosys = Company.builder()
                    .name("Infosys").slug("infosys")
                    .industry("IT Services").headquarters("Bengaluru, India")
                    .description("Next-generation digital services and consulting.")
                    .websiteUrl("https://infosys.com").build();
            companyRepository.save(infosys);

            Company wipro = Company.builder()
                    .name("Wipro").slug("wipro")
                    .industry("IT Services").headquarters("Bengaluru, India")
                    .description("Global information technology, consulting, and business process services.")
                    .websiteUrl("https://wipro.com").build();
            companyRepository.save(wipro);
        }

        if (postRepository.count() == 0) {
            Company google = companyRepository.findBySlug("google");
            if (google != null) {
                Post p1 = Post.builder()
                        .title("Google SDE-1 Interview Experience")
                        .content("It was a 3-round process. First round was DS/Algo. Second round was System Design. Third round was Googlyness.")
                        .role("SDE-1")
                        .company(google)
                        .author(userRepository.findByEmail("user@test.com").orElse(null))
                        .difficulty("Hard")
                        .result("Selected")
                        .salaryPackage(new BigDecimal("3500000"))
                        .build();
                postRepository.save(p1);
            }
        }
    }
}
