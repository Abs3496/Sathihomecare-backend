package com.sathihomecare.backend.dto.partner;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AttendanceResponse {

    private Long attendanceId;
    private Long partnerUserId;
    private String employeeId;
    private String partnerName;
    private LocalDate attendanceDate;
    private LocalDateTime checkInAt;
    private LocalDateTime checkOutAt;
    private boolean checkedIn;
    private boolean checkedOut;
}
