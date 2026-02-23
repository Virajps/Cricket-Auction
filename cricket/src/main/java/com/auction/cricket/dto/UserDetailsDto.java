package com.auction.cricket.dto;


import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailsDto {
    private String username;
    private String email;
    private String role;
    private Set<String> roles;
}
