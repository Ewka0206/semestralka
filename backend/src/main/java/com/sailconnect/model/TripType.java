package com.sailconnect.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TripType {
    TRAINING, ADVENTURE, RELAX;

    /** Serializuje jako PascalCase — shoduje se s frontendem: "Training" | "Adventure" | "Relax" */
    @JsonValue
    public String toJson() {
        String lower = name().toLowerCase();
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }

    @JsonCreator
    public static TripType fromJson(String value) {
        return valueOf(value.toUpperCase());
    }
}
