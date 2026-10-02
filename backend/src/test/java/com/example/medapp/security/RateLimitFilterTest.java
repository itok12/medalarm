package com.example.medapp.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitFilterTest {

    private static MockHttpServletRequest request(String path, String remoteAddr, String forwardedFor) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
        request.setRemoteAddr(remoteAddr);
        if (forwardedFor != null) {
            request.addHeader("X-Forwarded-For", forwardedFor);
        }
        return request;
    }

    private static int send(RateLimitFilter filter, MockHttpServletRequest request) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response.getStatus();
    }

    @Test
    void limitsRepeatedLoginsFromOneClient() throws Exception {
        RateLimitFilter filter = new RateLimitFilter(false);
        for (int i = 0; i < RateLimitFilter.REQUESTS_PER_MINUTE; i++) {
            assertThat(send(filter, request("/api/auth/login", "203.0.113.5", null))).isEqualTo(200);
        }
        assertThat(send(filter, request("/api/auth/login", "203.0.113.5", null))).isEqualTo(429);
    }

    @Test
    void neverLimitsTokenRefresh() throws Exception {
        // Every app launch refreshes; behind a proxy all users can share one address.
        RateLimitFilter filter = new RateLimitFilter(false);
        for (int i = 0; i < RateLimitFilter.REQUESTS_PER_MINUTE * 3; i++) {
            assertThat(send(filter, request("/api/auth/refresh", "10.0.0.1", null))).isEqualTo(200);
        }
    }

    @Test
    void behindAProxy_eachForwardedClientGetsItsOwnBudget() throws Exception {
        RateLimitFilter filter = new RateLimitFilter(true);
        for (int i = 0; i < RateLimitFilter.REQUESTS_PER_MINUTE; i++) {
            send(filter, request("/api/auth/login", "10.0.0.1", "198.51.100.7, 10.0.0.1"));
        }

        assertThat(send(filter, request("/api/auth/login", "10.0.0.1", "198.51.100.7"))).isEqualTo(429);
        // Same proxy address, different real client: not affected.
        assertThat(send(filter, request("/api/auth/login", "10.0.0.1", "198.51.100.8"))).isEqualTo(200);
    }

    @Test
    void ignoresForwardedForUnlessConfiguredToTrustIt() {
        RateLimitFilter filter = new RateLimitFilter(false);
        assertThat(filter.clientAddress(request("/api/auth/login", "203.0.113.5", "1.2.3.4"))).isEqualTo("203.0.113.5");
    }
}
