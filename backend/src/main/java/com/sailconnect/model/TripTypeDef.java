package com.sailconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "trip_type_def")
public class TripTypeDef {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String label;

    public TripTypeDef() {}

    public TripTypeDef(String code, String label) {
        this.code = code;
        this.label = label;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
}
