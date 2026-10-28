
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
            // Demo configuration: CSRF is disabled.
            // For production, configure CSRF protection appropriately.
            .csrf(csrf -> csrf.disable())

            // Allow H2 Console to display its frames.
            .headers(headers ->
                headers.frameOptions(frame -> frame.sameOrigin())
            )

            .authorizeHttpRequests(auth -> auth

                // H2 Console for local development
                .requestMatchers("/h2-console/**").permitAll()

                // Staff dashboard requires staff login
                .requestMatchers("/staff.html").hasRole("STAFF")

                // Staff order-status updates require staff login
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/orders/*/preparing",
                    "/api/orders/*/ready",
                    "/api/orders/*/collected"
                ).hasRole("STAFF")

                // Public student pages and static resources
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

                // Public student APIs
                .requestMatchers(
                    "/api/food",
                    "/api/timings",
                    "/api/orders"
                ).permitAll()

                // All other requests require authentication
                .anyRequest().authenticated()
            )

            // Staff login
            .formLogin(form -> form
                .loginPage("/staff-login.html")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/staff.html", true)
                .failureUrl("/staff-login.html?error=true")
                .permitAll()
            )

            // Staff logout
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/staff-login.html?logout=true")
                .permitAll()
            );

        return http.build();
    }
}
