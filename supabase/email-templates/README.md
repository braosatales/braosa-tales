# Supabase Auth email templates

Paste into Supabase -> Authentication -> Emails -> Templates (Source / HTML view).

| Template in Supabase   | File                    | Subject line                          |
|------------------------|-------------------------|---------------------------------------|
| Confirm signup         | 1-confirm-signup.html   | Confirm your Braosa Tales account     |
| Reset password         | 2-reset-password.html   | Reset your Braosa Tales password      |
| Change email address   | 3-change-email.html     | Confirm your new email — Braosa Tales |

Links point straight at {{ .SiteURL }}/auth/callback with {{ .TokenHash }} (verified server-side with verifyOtp).
Works across browsers/devices and doesn't depend on the Redirect URLs allow-list. Site URL must be https://braosatales.com.
