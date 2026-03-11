package com.example.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final JwtAuthEntryPoint jwtAuthEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          JwtAuthEntryPoint jwtAuthEntryPoint,
                          JwtAccessDeniedHandler jwtAccessDeniedHandler) {
        this.jwtAuthFilter         = jwtAuthFilter;
        this.jwtAuthEntryPoint     = jwtAuthEntryPoint;
        this.jwtAccessDeniedHandler = jwtAccessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — stateless JWT API
            .csrf(AbstractHttpConfigurer::disable)

            // CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Stateless session — no HTTP session
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Custom error handlers
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jwtAuthEntryPoint)
                .accessDeniedHandler(jwtAccessDeniedHandler)
            )

            // Route-level authorisation
            .authorizeHttpRequests(auth -> auth
                // Public: auth endpoints
                .requestMatchers(HttpMethod.POST, "/api/users/register", "/api/users/login").permitAll()

                // Public: browse all items, stats, single item
                .requestMatchers(HttpMethod.GET, "/api/items/all", "/api/items/stats").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/items/{itemId:[0-9]+}").permitAll()

                // Public: Swagger UI & OpenAPI docs
                .requestMatchers(
                    "/swagger-ui/**", "/swagger-ui.html",
                    "/v3/api-docs/**", "/v3/api-docs"
                ).permitAll()

                // Admin-only: item lifecycle actions
                .requestMatchers(HttpMethod.POST,
                    "/api/items/*/report-found",
                    "/api/items/*/claim",
                    "/api/items/*/dispatch"
                ).hasRole("ADMIN")

                // Authenticated: update or delete items (service layer enforces owner/admin)
                .requestMatchers(HttpMethod.PUT,    "/api/items/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/items/**").authenticated()

                // Admin-only: list all users, delete user
                .requestMatchers(HttpMethod.GET,    "/api/users/all").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")

                // Authenticated: get own profile, update profile
                .requestMatchers(HttpMethod.GET,    "/api/users/**").authenticated()
                .requestMatchers(HttpMethod.PUT,    "/api/users/**").authenticated()

                // Any authenticated user: report items, view own items
                .anyRequest().authenticated()
            )

            // JWT filter before Spring's username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
