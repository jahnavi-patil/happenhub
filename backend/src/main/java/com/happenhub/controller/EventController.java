package com.happenhub.controller;

import com.happenhub.model.Event;
import com.happenhub.repository.EventRepository;
import com.happenhub.util.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private JwtUtil jwtUtil;


    // Add event
    @PostMapping({"/add", "/create"})
    public Object addEvent(@RequestHeader("Authorization") String authHeader,
                           @RequestBody Event event) {
        try {
            String token = authHeader.replace("Bearer ", "");
            if (!jwtUtil.validateToken(token)) {
                return "❌ Invalid or expired token!";
            }

            String organizerEmail = jwtUtil.extractEmail(token);
            event.setOrganizerEmail(organizerEmail);
            
            // Set availableTickets to capacity if not set
            if (event.getAvailableTickets() == 0 && event.getCapacity() > 0) {
                event.setAvailableTickets(event.getCapacity());
            }
            
            // Set default image if not provided
            if (event.getImageUrl() == null || event.getImageUrl().isEmpty()) {
                event.setImageUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop");
            }
            
            return eventRepository.save(event);

        } catch (Exception e) {
            return "❌ Authorization header missing or invalid!";
        }
    }


    // Get all events
    @GetMapping({"", "/all"})
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }


    // Get events by organizer email
    @GetMapping("/organizer/{email}")
    public List<Event> getEventsByOrganizer(@PathVariable String email) {
        return eventRepository.findByOrganizerEmail(email);
    }

    // Update event
    @PutMapping("/update/{id}")
    public String updateEvent(@PathVariable String id, @RequestBody Event updatedEvent) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();
            
            // Update all fields
            if (updatedEvent.getTitle() != null) event.setTitle(updatedEvent.getTitle());
            if (updatedEvent.getDescription() != null) event.setDescription(updatedEvent.getDescription());
            if (updatedEvent.getLocation() != null) event.setLocation(updatedEvent.getLocation());
            if (updatedEvent.getDate() != null) event.setDate(updatedEvent.getDate());
            if (updatedEvent.getMood() != null) event.setMood(updatedEvent.getMood());
            if (updatedEvent.getImageUrl() != null) event.setImageUrl(updatedEvent.getImageUrl());
            
            // Update capacity and available tickets
            if (updatedEvent.getCapacity() > 0) {
                int oldCapacity = event.getCapacity();
                int newCapacity = updatedEvent.getCapacity();
                int ticketsSold = oldCapacity - event.getAvailableTickets();
                
                event.setCapacity(newCapacity);
                // Recalculate available tickets: new capacity - tickets already sold
                event.setAvailableTickets(Math.max(0, newCapacity - ticketsSold));
            }
            
            // Update price (price >= 0 is valid)
            if (updatedEvent.getPrice() >= 0) event.setPrice(updatedEvent.getPrice());
            
            // Update tags
            if (updatedEvent.getTags() != null) event.setTags(updatedEvent.getTags());
            
            eventRepository.save(event);
            return "✅ Event updated successfully!";
        } else {
            return "❌ Event not found!";
        }
    }

    // Get single event by id (public)
    @GetMapping("/{id}")
    public Object getEventById(@PathVariable String id) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isPresent()) {
            return eventOpt.get();
        }
        return "❌ Event not found!";
    }

    // Delete event
    @DeleteMapping("/delete/{id}")
    public String deleteEvent(@PathVariable String id) {
        if (eventRepository.existsById(id)) {
            eventRepository.deleteById(id);
            return "✅ Event deleted successfully!";
        }
        return "❌ Event not found!";
    }

    // Search events by keyword (title)
    @GetMapping("/search/{keyword}")
    public List<Event> searchEvents(@PathVariable String keyword) {
        return eventRepository.findByTitleContainingIgnoreCase(keyword);
    }

    // Filter events by location
    @GetMapping("/location/{location}")
    public List<Event> getEventsByLocation(@PathVariable String location) {
        return eventRepository.findByLocationIgnoreCase(location);
    }

}

