export interface LearnTopic {
  id: string;
  title: string;
  summary: string;
  content: string[];
}

export const LEARN_TOPICS: LearnTopic[] = [
  {
    id: "what-is-phishing",
    title: "What is phishing?",
    summary: "The basics of the most common cyberattack.",
    content: [
      "Phishing is a type of attack where someone pretends to be a trustworthy source — a bank, a coworker, a well-known company — in order to trick you into handing over sensitive information or taking a harmful action.",
      "It usually arrives as an email, text message, or chat message that creates a sense of urgency, fear, or excitement, pushing you to act before you think carefully.",
      "The goal is almost always one of: stealing your login credentials, getting you to send money, installing malware on your device, or gaining access to a company's internal systems.",
    ],
  },
  {
    id: "how-phishing-works",
    title: "How phishing works",
    summary: "The typical anatomy of an attack.",
    content: [
      "Most phishing attacks follow a similar pattern: a believable pretext (a security alert, an invoice, a delivery notice), a call to action (click here, verify now, pay this fee), and a fake destination that looks like the real thing.",
      "Attackers often register lookalike domains (like 'paypa1.com' or 'amazon-secure-login.net') and copy real logos and formatting to make the fake page indistinguishable from the original at a glance.",
      "Because phishing is cheap to send at scale, attackers only need a small percentage of recipients to fall for it to make the campaign worthwhile.",
    ],
  },
  {
    id: "identify-urls",
    title: "How to identify suspicious URLs",
    summary: "What to check before you click.",
    content: [
      "Hover over a link before clicking to see the real destination — the visible text and the actual URL are often different.",
      "Watch for IP addresses instead of domain names, unusual top-level domains (.top, .xyz, .click), excessive subdomains, and misspelled brand names.",
      "Shortened links (bit.ly, tinyurl.com) hide the real destination entirely — treat any shortened link in an unsolicited message with extra caution.",
    ],
  },
  {
    id: "social-engineering",
    title: "How social engineering works",
    summary: "The psychology behind the attack.",
    content: [
      "Social engineering exploits human psychology rather than technical vulnerabilities. Common levers include urgency ('act within 24 hours'), authority ('this is your CEO'), fear ('your account has been compromised'), and reward ('you've won a prize').",
      "Attackers often combine several of these levers at once to overwhelm careful judgment and push for a fast, unconsidered response.",
      "Slowing down and verifying independently — through a channel you already trust — is the single most effective defense against social engineering.",
    ],
  },
  {
    id: "verify-emails",
    title: "How to verify emails",
    summary: "Confirming a message is really from who it claims.",
    content: [
      "Check the full sender address, not just the display name — attackers can set the display name to anything they want.",
      "Look for domain mismatches: a message claiming to be from a bank sent from a free consumer email address (like a gmail.com address) is a red flag.",
      "When in doubt, contact the organization directly using a phone number or website you already know to be genuine — never the contact details provided in the suspicious message itself.",
    ],
  },
  {
    id: "password-security",
    title: "Password security",
    summary: "Reducing the damage if credentials are ever exposed.",
    content: [
      "Use a unique, long password for every important account, ideally generated and stored by a password manager rather than reused or memorized.",
      "Never enter your password after clicking a link in an unsolicited email or message — navigate to the site directly instead.",
      "If you ever suspect a password has been exposed, change it immediately and check for any account activity you don't recognize.",
    ],
  },
  {
    id: "mfa",
    title: "Multi-factor authentication",
    summary: "An extra layer that stops most account takeovers.",
    content: [
      "Multi-factor authentication (MFA) requires a second proof of identity beyond your password, such as a code from an authenticator app or a physical security key.",
      "Even if a phishing attack successfully steals your password, MFA can prevent the attacker from completing the login.",
      "Prefer app-based or hardware-based MFA over SMS codes where possible, since SMS can be intercepted through SIM-swapping attacks.",
    ],
  },
  {
    id: "safe-browsing",
    title: "Safe browsing",
    summary: "Everyday habits that reduce your exposure.",
    content: [
      "Keep your browser and operating system updated so known vulnerabilities are patched.",
      "Be cautious of pop-ups, unexpected download prompts, and browser extensions from unverified sources.",
      "Use bookmarks for sites you visit often (banking, email) instead of clicking search results or links to reduce exposure to lookalike domains.",
    ],
  },
  {
    id: "qr-phishing",
    title: "QR phishing (quishing)",
    summary: "The newer variant hiding in a scan.",
    content: [
      "QR phishing embeds a malicious link inside a QR code, relying on the fact that people can't visually inspect the destination before scanning.",
      "Common lures include fake parking tickets, fake delivery notices, and QR codes pasted over legitimate ones on posters or at payment terminals.",
      "Before scanning, consider whether you were expecting the QR code, and check the preview URL your phone shows before opening it.",
    ],
  },
  {
    id: "bec",
    title: "Business Email Compromise (BEC)",
    summary: "Targeted phishing aimed at organizations.",
    content: [
      "BEC attacks impersonate an executive, vendor, or trusted colleague to trick an employee into making a wire transfer, purchasing gift cards, or sharing sensitive data.",
      "These attacks are often highly targeted and researched, referencing real names, projects, or recent events to appear credible.",
      "Organizations reduce risk with out-of-band verification: confirming unusual financial requests through a phone call or in person before acting.",
    ],
  },
];
