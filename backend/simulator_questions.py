"""
simulator_questions.py
-------------------------------------------------------------------
Static question bank for the "Can You Spot the Phish?" simulator.
All examples use fictional people, fictional companies, and fictional
domains -- see project spec section 24.
"""

QUESTIONS = [
    {
        "id": "banking-01",
        "category": "Banking phishing",
        "sender": "security-alert@northgate-bank-secure.com",
        "subject": "URGENT: Your account will be suspended",
        "body": "We detected suspicious activity on your account. Verify your identity immediately or your account will be suspended within 24 hours.\n\n[ VERIFY ACCOUNT ]",
        "options": [
            {"id": "a", "text": "Click the link and verify"},
            {"id": "b", "text": "Reply asking for more details"},
            {"id": "c", "text": "Report it and log in via the official app instead"},
            {"id": "d", "text": "Forward it to a friend to ask what they think"},
        ],
        "correct_option": "c",
        "explanation": "Never use links in unexpected security alerts. Open your banking app or type the official website address directly, then check for real notices there.",
    },
    {
        "id": "job-scam-01",
        "category": "Job scam",
        "sender": "hr@brightpath-careers.net",
        "subject": "Congratulations! You've been selected for a remote position",
        "body": "You've been selected for a $45/hour remote data-entry role. To begin onboarding, send a $150 refundable deposit for your starter equipment kit.",
        "options": [
            {"id": "a", "text": "Pay the deposit to secure the job"},
            {"id": "b", "text": "Ask them to deduct it from the first paycheck instead"},
            {"id": "c", "text": "Decline and research the company independently"},
            {"id": "d", "text": "Share your bank details for the 'deposit refund'"},
        ],
        "correct_option": "c",
        "explanation": "Legitimate employers never ask candidates to pay for equipment upfront. Any job offer that requires you to pay money first is a scam.",
    },
    {
        "id": "delivery-01",
        "category": "Delivery scam",
        "sender": "no-reply@swiftpost-tracking.info",
        "subject": "Delivery failed - action required",
        "body": "Your package could not be delivered due to an incomplete address. Pay a $2.99 redelivery fee within 12 hours to avoid return to sender.\n\n[ PAY REDELIVERY FEE ]",
        "options": [
            {"id": "a", "text": "Pay the small fee quickly since it's cheap"},
            {"id": "b", "text": "Click the link to check the tracking details"},
            {"id": "c", "text": "Look up the tracking number directly on the courier's official site"},
            {"id": "d", "text": "Enter your card details to confirm your address"},
        ],
        "correct_option": "c",
        "explanation": "Small 'redelivery fee' messages are a common scam pattern designed to harvest card details. Always track packages through the courier's official site or app.",
    },
    {
        "id": "social-takeover-01",
        "category": "Social media takeover",
        "sender": "support@instagrarm-help.com",
        "subject": "Your account has been reported for copyright violation",
        "body": "Your account has been reported. Log in within 24 hours to appeal or your account will be permanently disabled.\n\n[ APPEAL NOW ]",
        "options": [
            {"id": "a", "text": "Log in through the link right away"},
            {"id": "b", "text": "Ignore the message completely"},
            {"id": "c", "text": "Open the app directly and check the official notifications tab"},
            {"id": "d", "text": "Reply with your username and password for verification"},
        ],
        "correct_option": "c",
        "explanation": "The sender domain is a lookalike ('instagrarm-help.com'). Always check account status by opening the official app directly, not through emailed links.",
    },
    {
        "id": "password-reset-01",
        "category": "Password reset",
        "sender": "accounts@secure-cloudmail-reset.com",
        "subject": "Password reset requested",
        "body": "We received a request to reset your password. If this wasn't you, click below to secure your account immediately.\n\n[ SECURE MY ACCOUNT ]",
        "options": [
            {"id": "a", "text": "Click the link since it seems safety-related"},
            {"id": "b", "text": "Go directly to the real site and change your password there"},
            {"id": "c", "text": "Forward it to IT without checking"},
            {"id": "d", "text": "Reply confirming you didn't request it"},
        ],
        "correct_option": "b",
        "explanation": "Whether or not you requested a reset, always navigate to the official site yourself rather than clicking email links, which can lead to a fake look-alike login page.",
    },
    {
        "id": "it-support-01",
        "category": "Fake IT support",
        "sender": "it-helpdesk@corp-support-desk.com",
        "subject": "Mandatory security update - action needed today",
        "body": "IT has detected an outdated security certificate on your device. Install the attached update tool and enter your network credentials to continue working.",
        "options": [
            {"id": "a", "text": "Install the tool and enter your credentials"},
            {"id": "b", "text": "Verify the request with IT through a known internal channel first"},
            {"id": "c", "text": "Forward the email to coworkers so they can install it too"},
            {"id": "d", "text": "Enter your credentials on the attached form only"},
        ],
        "correct_option": "b",
        "explanation": "Real IT departments rarely ask you to install unsolicited tools or enter your password into an emailed form. Confirm any 'IT' request through a verified internal channel like a helpdesk ticket or known phone line.",
    },
    {
        "id": "scholarship-01",
        "category": "Scholarship scam",
        "sender": "awards@globalscholars-fund.org",
        "subject": "You've been awarded a $5,000 scholarship!",
        "body": "Congratulations! To release your scholarship funds, please pay a $75 processing and verification fee within 48 hours.",
        "options": [
            {"id": "a", "text": "Pay the processing fee to unlock the funds"},
            {"id": "b", "text": "Ask a friend to pay it for you"},
            {"id": "c", "text": "Decline - legitimate scholarships never require an upfront fee"},
            {"id": "d", "text": "Give your bank account number for direct deposit of the 'award'"},
        ],
        "correct_option": "c",
        "explanation": "Legitimate scholarships never require you to pay a fee to receive an award. This 'pay to get paid' pattern is a classic advance-fee scam.",
    },
    {
        "id": "crypto-01",
        "category": "Cryptocurrency scam",
        "sender": "support@coinboost-exchange.io",
        "subject": "Double your crypto in 24 hours - limited slots",
        "body": "Send 0.05 BTC to the address below and receive 0.1 BTC back within 24 hours as part of our anniversary promotion. Limited to the first 100 participants!",
        "options": [
            {"id": "a", "text": "Send the crypto to claim the doubled return"},
            {"id": "b", "text": "Ask friends to also send funds so everyone benefits"},
            {"id": "c", "text": "Ignore it - guaranteed-return crypto offers are always scams"},
            {"id": "d", "text": "Send a smaller test amount first"},
        ],
        "correct_option": "c",
        "explanation": "No legitimate exchange or promotion 'doubles' cryptocurrency you send them. This is a well-known advance-fee crypto scam pattern.",
    },
    {
        "id": "gov-impersonation-01",
        "category": "Government impersonation",
        "sender": "notice@irs-taxrefund-gov.com",
        "subject": "You are eligible for a tax refund of $1,240",
        "body": "Our records show you are eligible for a refund. Submit your bank account and social security number within 3 days to receive your payment.",
        "options": [
            {"id": "a", "text": "Submit your SSN and bank details as requested"},
            {"id": "b", "text": "Call the number in the email to confirm"},
            {"id": "c", "text": "Go directly to the official government tax website to check refund status"},
            {"id": "d", "text": "Reply asking for a smaller refund faster"},
        ],
        "correct_option": "c",
        "explanation": "Government agencies do not request your Social Security number or bank details by email. Verify refund status only through the official government website you type in yourself.",
    },
    {
        "id": "bec-01",
        "category": "Corporate email phishing",
        "sender": "ceo.office@yourcompany-executives.com",
        "subject": "Quick task - need this handled discreetly",
        "body": "Hi, I'm in back-to-back meetings. I need you to purchase $500 in gift cards for a client gift and send me the codes. Keep this between us for now. - CEO",
        "options": [
            {"id": "a", "text": "Buy the gift cards quickly since it's the CEO"},
            {"id": "b", "text": "Reply asking for the client's name only"},
            {"id": "c", "text": "Verify the request directly with the CEO through a known phone number or in person"},
            {"id": "d", "text": "Send the gift card codes by text instead of email"},
        ],
        "correct_option": "c",
        "explanation": "This is a classic Business Email Compromise (BEC) pattern: urgency, secrecy, gift cards, and a slightly-off sender domain. Always verify unusual executive requests through a separate, known channel.",
    },
]

QUESTIONS_BY_ID = {q["id"]: q for q in QUESTIONS}
