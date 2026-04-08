# Google OAuth + GitHub OAuth Setup Guide

## 1. Frontend — Add OAuth buttons (already in auth-form.tsx)

The auth form already has a GitHub button skeleton. Wire it up:

```tsx
// In auth-form.tsx - the GitHub button
<button
  type="button"
  onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/github`}
>
  Continue with GitHub
</button>
```

For Google, add another button:
```tsx
<button
  type="button"
  onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`}
>
  Continue with Google
</button>
```

---

## 2. Backend — pom.xml additions

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

---

## 3. Backend — application.yaml

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: openid, profile, email
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_CLIENT_SECRET}
            scope: user:email, read:user
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
        provider:
          google:
            authorization-uri: https://accounts.google.com/o/oauth2/v2/auth
            token-uri: https://oauth2.googleapis.com/token
            user-info-uri: https://www.googleapis.com/oauth2/v3/userinfo
            user-name-attribute: sub
```

---

## 4. Backend — OAuth2UserService

Create `OAuth2AuthenticationSuccessHandler.java`:

```java
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthUtil authUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        // Find or create user
        User user = userRepository.findByUsernameAndDeletedAtIsNull(email)
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setUsername(email);
                newUser.setName(name != null ? name : email);
                newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                newUser.setRole(UserRole.USER);
                return userRepository.save(newUser);
            });

        String token = authUtil.generateAccessToken(user);

        // Redirect to frontend with token
        String redirectUrl = frontendUrl + "/auth/callback?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
```

---

## 5. Backend — WebSecurityConfig additions

```java
.oauth2Login(oauth2 -> oauth2
    .successHandler(oAuth2AuthenticationSuccessHandler)
)
```

---

## 6. Frontend — OAuth callback page

Create `app/auth/callback/page.tsx`:

```tsx
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuthToken } from "@/services/token";
import { useAuthStore } from "@/store/useAuthStore";

export default function OAuthCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      setAuthToken(token);
      useAuthStore.getState().loadUser().then(() => {
        router.replace("/dashboard");
      });
    } else {
      router.replace("/login?error=oauth_failed");
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
    </div>
  );
}
```

---

## 7. Environment variables needed

Add to `.env`:
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret
APP_FRONTEND_URL=http://localhost:3000
```

Google Console: https://console.cloud.google.com
- Create OAuth 2.0 credentials
- Authorized redirect URI: `http://localhost:8080/login/oauth2/code/google`

GitHub: https://github.com/settings/developers
- Homepage URL: `http://localhost:3000`
- Callback URL: `http://localhost:8080/login/oauth2/code/github`
