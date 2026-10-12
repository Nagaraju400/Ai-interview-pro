<!-- BEGIN:debug-mode-rule -->
# Debug Mode Usage

Never leave debug mode on outside our local machine. It should NOT be active on staging, dev, or production environments.
<!-- END:debug-mode-rule -->

<!-- BEGIN:non-public-subdomain-rule -->
# Non-Public Subdomain Protection

Protect non-public subdomains behind authentication, a VPN, or an IP allowlist.
<!-- END:non-public-subdomain-rule -->

<!-- BEGIN:cert-transparency-logs-rule -->
# Certificate Transparency Logs

Monitor certificate transparency logs.
<!-- END:cert-transparency-logs-rule -->

<!-- BEGIN:subdomain-enumeration-rule -->
# Subdomain Enumeration

Run subdomain enumeration scans against our own domain regularly.
<!-- END:subdomain-enumeration-rule -->

<!-- BEGIN:ddos-and-unauthorized-access-protection-rule -->
# DDoS and Unauthorized User Protection

Implement strict rate limiting, web application firewall (WAF) policies, anti-DDoS measures, and enforce robust authentication and authorization controls on all non-public endpoints to prevent unauthorized access and DDoS attacks.
<!-- END:ddos-and-unauthorized-access-protection-rule -->
