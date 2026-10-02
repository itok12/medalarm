package com.example.medapp.entity;

public enum CaregiverStatus {
    /** Requested by the caregiver; nothing is shared yet. */
    PENDING,
    /** Accepted by the patient; the caregiver can read their medication history. */
    ACCEPTED
}
