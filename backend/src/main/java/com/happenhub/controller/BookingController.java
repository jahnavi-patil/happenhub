package com.happenhub.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.happenhub.model.Booking;
import com.happenhub.model.Event;
import com.happenhub.repository.BookingRepository;
import com.happenhub.repository.EventRepository;
import com.happenhub.util.JwtUtil;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private JwtUtil jwtUtil;


    // Create a booking
    @PostMapping({"/add", "/create"})
    public ResponseEntity<?> addBooking(@RequestHeader("Authorization") String authHeader,
                             @RequestBody Booking booking) {
        try {
            String token = authHeader.replace("Bearer ", "");
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "❌ Invalid or expired token!"));
            }

            String userEmail = jwtUtil.extractEmail(token);
            booking.setUserEmail(userEmail);

            // Check if event exists
            Optional<Event> eventOpt = eventRepository.findById(booking.getEventId());
            if (!eventOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "❌ Event not found!"));
            }

            Event event = eventOpt.get();

            // Check if enough tickets available
            if (event.getAvailableTickets() < booking.getNumberOfTickets()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "❌ Not enough tickets available! Only " + event.getAvailableTickets() + " left."));
            }

            // Update available tickets
            event.setAvailableTickets(event.getAvailableTickets() - booking.getNumberOfTickets());
            eventRepository.save(event);

            // Save booking
            Booking savedBooking = bookingRepository.save(booking);
            
            return ResponseEntity.ok(Map.of(
                "message", "✅ Booking confirmed for event: " + booking.getEventTitle(),
                "booking", savedBooking
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "❌ Booking failed: " + e.getMessage()));
        }
    }


    // Get bookings by user (requires auth)
    @GetMapping("/user")
    public ResponseEntity<?> getBookingsByUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.ok(List.of());
            }
            String userEmail = jwtUtil.extractEmail(token);
            List<Booking> bookings = bookingRepository.findByUserEmail(userEmail);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    // Get bookings by event ID
    @GetMapping("/event/{eventId}")
    public ResponseEntity<?> getBookingsByEvent(@PathVariable String eventId,
                                                 @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "❌ Unauthorized"));
            }
            
            List<Booking> bookings = bookingRepository.findByEventId(eventId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "❌ Failed to fetch bookings"));
        }
    }

    // Cancel booking
    @PutMapping("/cancel/{bookingId}")
    public ResponseEntity<?> cancelBooking(@PathVariable String bookingId,
                                          @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "❌ Unauthorized"));
            }

            Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
            if (!bookingOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "❌ Booking not found"));
            }

            Booking booking = bookingOpt.get();
            booking.setStatus("CANCELLED");
            bookingRepository.save(booking);

            // Restore tickets to event
            Optional<Event> eventOpt = eventRepository.findById(booking.getEventId());
            if (eventOpt.isPresent()) {
                Event event = eventOpt.get();
                event.setAvailableTickets(event.getAvailableTickets() + booking.getNumberOfTickets());
                eventRepository.save(event);
            }

            return ResponseEntity.ok(Map.of("message", "✅ Booking cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "❌ Failed to cancel booking"));
        }
    }
}
