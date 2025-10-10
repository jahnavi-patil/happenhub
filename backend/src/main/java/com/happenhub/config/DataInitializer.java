package com.happenhub.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.happenhub.model.Event;
import com.happenhub.repository.EventRepository;
import com.happenhub.model.Organizer;
import com.happenhub.repository.OrganizerRepository;
import com.happenhub.model.User;
import com.happenhub.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner init(UserRepository userRepository, 
                         OrganizerRepository organizerRepository,
                         EventRepository eventRepository,
                         PasswordEncoder passwordEncoder) {
        return args -> {
            // Clear existing data
            userRepository.deleteAll();
            organizerRepository.deleteAll();
            eventRepository.deleteAll();

            // Create sample users
            User user1 = new User();
            user1.setUsername("john_doe");
            user1.setEmail("john@example.com");
            user1.setPassword(passwordEncoder.encode("password123"));
            userRepository.save(user1);

            User user2 = new User();
            user2.setUsername("jane_smith");
            user2.setEmail("jane@example.com");
            user2.setPassword(passwordEncoder.encode("password123"));
            userRepository.save(user2);

            // Create sample organizers
            Organizer organizer1 = new Organizer();
            organizer1.setUsername("event_master");
            organizer1.setEmail("organizer1@example.com");
            organizer1.setPassword(passwordEncoder.encode("password123"));
            organizer1.setCompanyName("EventMaster Productions");
            organizerRepository.save(organizer1);

            Organizer organizer2 = new Organizer();
            organizer2.setUsername("party_planner");
            organizer2.setEmail("organizer2@example.com");
            organizer2.setPassword(passwordEncoder.encode("password123"));
            organizer2.setCompanyName("Party Perfect");
            organizerRepository.save(organizer2);

            // Create sample events
            List<Event> events = Arrays.asList(
                new Event(
                    "Tech Conference 2025",
                    "Join us for the biggest tech conference of the year!",
                    LocalDateTime.now().plusDays(30).toString(),
                    "San Francisco Convention Center",
                    100,
                    299.99,
                    "🎯",
                    organizer1.getId(),
                    organizer1.getEmail(),
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
                    new String[] {"tech", "conference", "innovation"}
                ),
                new Event(
                    "Summer Music Festival",
                    "A day of amazing music and fun under the sun!",
                    LocalDateTime.now().plusDays(45).toString(),
                    "Central Park",
                    500,
                    49.99,
                    "🎵",
                    organizer1.getId(),
                    organizer1.getEmail(),
                    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop",
                    new String[] {"music", "festival", "summer", "outdoor"}
                ),
                new Event(
                    "Art Exhibition",
                    "Featuring works from renowned local artists",
                    LocalDateTime.now().plusDays(15).toString(),
                    "City Art Gallery",
                    200,
                    25.00,
                    "🎨",
                    organizer2.getId(),
                    organizer2.getEmail(),
                    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop",
                    new String[] {"art", "exhibition", "culture"}
                ),
                new Event(
                    "Food & Wine Festival",
                    "Taste the finest cuisines and wines from around the world",
                    LocalDateTime.now().plusDays(60).toString(),
                    "Downtown Food Court",
                    300,
                    75.00,
                    "🍷",
                    organizer2.getId(),
                    organizer2.getEmail(),
                    "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&h=600&fit=crop",
                    new String[] {"food", "wine", "festival", "culinary"}
                )
            );

            eventRepository.saveAll(events);
        };
    }
}