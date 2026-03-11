package org.hartford.surehealth;

import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DbCheckRunner implements CommandLineRunner {
    private final UserRepository userRepository;

    public DbCheckRunner(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("--- DB CHECK START ---");
        List<User> users = userRepository.findAll();
        for (User u : users) {
            System.out.println("User: " + u.getUsername() + ", Role: [" + u.getRole() + "]");
        }
        System.out.println("--- DB CHECK END ---");
    }
}

