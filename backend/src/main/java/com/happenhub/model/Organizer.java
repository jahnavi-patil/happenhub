package com.happenhub.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "organizers")
public class Organizer {

    @Id
    private String id;
    private String username;
    private String email;
    private String password;
    private String companyName;
    private String description;

    public Organizer() {}

    public Organizer(String username, String email, String password, String companyName, String description) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.companyName = companyName;
        this.description = description;
    }

    // Getters and setters
    public String getId() { return id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getName() { 
        return username != null ? username : (companyName != null ? companyName : email); 
    }
    
    public String getOrganization() { 
        return companyName; 
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
