
package com.quickbite;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(
            PasswordEncoder passwordEncoder) {

        UserDetails staff = User.builder()
                .username("staff")
                .password(passwordEncoder.encode("QuickBite@123"))
                .roles("STAFF")
                .build();

        return new InMemoryUserDetailsManager(staff);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            // Demo configuration: API requests use JSON.
            // For production, configure CSRF protection appropriately.
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth

                // Staff dashboard must require staff login
                .requestMatchers("/staff.html").hasRole("STAFF")

                // Staff order-status actions require staff login
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/orders/*/preparing",
                    "/api/orders/*/ready",
                    "/api/orders/*/collected"
                ).hasRole("STAFF")

                // Login page and public student pages
                .requestMatchers(
                    "/",
                    "/index.html",
                    "/staff-login.html",
                    "/style.css",
                    "/script.js",
                    "/staff.css",
                    "/staff.js",
                    "/images/**",
                    "/favicon.ico"
                ).permitAll()

                // Student food, timing, and order APIs
                .requestMatchers("/api/food", "/api/timings",
                                 "/api/orders").permitAll()

                .anyRequest().authenticated()
            )

            .formLogin(form -> form
                .loginPage("/staff-login.html")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/staff.html", true)
                .failureUrl("/staff-login.html?error=true")
                .permitAll()
            )

            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/staff-login.html?logout=true")
                .permitAll()
            );

        return http.build();
    }
}
