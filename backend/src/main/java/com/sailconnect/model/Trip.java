package com.sailconnect.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String location;

    private String country;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TripType type;

    @Column(nullable = false)
    private String startDate;

    @Column(nullable = false)
    private String endDate;

    private int priceCzk;
    private int capacity;
    private int booked = 0;
    private boolean skipperIncluded = false;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> highlights = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String description;

    private String imageUrl;
    private String ownerUserId;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public TripType getType() { return type; }
    public void setType(TripType type) { this.type = type; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public int getPriceCzk() { return priceCzk; }
    public void setPriceCzk(int priceCzk) { this.priceCzk = priceCzk; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public int getBooked() { return booked; }
    public void setBooked(int booked) { this.booked = booked; }
    public boolean isSkipperIncluded() { return skipperIncluded; }
    public void setSkipperIncluded(boolean skipperIncluded) { this.skipperIncluded = skipperIncluded; }
    public List<String> getHighlights() { return highlights; }
    public void setHighlights(List<String> highlights) { this.highlights = highlights; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(String ownerUserId) { this.ownerUserId = ownerUserId; }
}
