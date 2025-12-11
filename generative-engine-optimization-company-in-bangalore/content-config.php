<?php
/**
 * Content Configuration Template
 * 
 * Copy this file and modify the content below to generate a new page.
 * All sections from geo.html are included here.
 * 
 * Usage: php generate-page.php content-config.php output.html
 */

return [
    // ============================================
    // PAGE META INFORMATION
    // ============================================
    'page_title' => 'Your Page Title Here',
    'page_description' => 'Your page description for SEO',
    'page_keywords' => 'your, keywords, here',
    'canonical_url' => 'https://brandstory.in/your-page-url/',
    
    // ============================================
    // BANNER SECTION
    // ============================================
    'banner' => [
        'title' => 'Your Main Banner Title Here',
        'cta_text' => 'Book Your Free Consultation Now!',
        'cta_link' => 'https://brandstory.in/contact-us/',
    ],
    
    // ============================================
    // INTRO SECTION (AI Search Section)
    // ============================================
    'intro' => [
        'paragraph_1' => 'Your first intro paragraph here. This appears in the AI search section.',
        'paragraph_2' => 'Your second intro paragraph here. This continues the introduction.',
    ],
    
    // ============================================
    // TRUSTED BRANDS SECTION
    // ============================================
    'trusted_brands' => [
        'image' => 'assets/images/geo-location/robotic.png',
        'heading' => 'Trusted by 500+ brands across India',
        'description' => 'Your description about trusted brands and client success.',
    ],
    
    // ============================================
    // REVIEWED BY VERIFIED EXPERTS SECTION
    // ============================================
    'reviewed_experts' => [
        'heading' => 'Reviewed by Verified Experts',
        'reviews' => [
            [
                'image' => 'assets/images/web-development-company/clutch.svg',
                'class' => 'bg-review',
                'alt' => 'Clutch',
            ],
            [
                'image' => 'assets/images/geo-location/g2.svg',
                'class' => 'bg-review-02',
                'alt' => 'G2',
            ],
            [
                'image' => 'assets/images/geo-location/trust-pilot.svg',
                'class' => 'bg-review-trustpilot',
                'alt' => 'Trustpilot',
            ],
            [
                'image' => 'assets/images/geo-location/good.svg',
                'class' => 'bg-review-goodfirms',
                'alt' => 'GoodFirms',
            ],
            [
                'image' => 'assets/images/web-development-company/google-logo.svg',
                'class' => '',
                'alt' => 'Google',
            ],
        ],
    ],
    
    // ============================================
    // TRACK RECORD SECTION
    // ============================================
    'track_record' => [
        'heading' => 'Our Track Record',
        'stats' => [
            [
                'title' => 'Years of Experience',
                'description' => 'Over 12 years of strategic expertise.',
            ],
            [
                'title' => 'Expert Team',
                'description' => '120+ skilled professionals',
            ],
            [
                'title' => 'Client Success',
                'description' => '500+ clients with proven search growth.',
            ],
            [
                'title' => 'Industry Reach',
                'description' => 'Serving 30+ diverse, dynamic industries.',
            ],
        ],
    ],
    
    // ============================================
    // KEY BENEFITS SECTION
    // ============================================
    'key_benefits' => [
        'heading' => 'Key Benefits of Your Services',
        'benefits' => [
            [
                'icon' => 'assets/images/geo-location/key-01.svg',
                'title' => 'Benefit 1 Title',
                'description' => 'Benefit 1 description goes here.',
            ],
            [
                'icon' => 'assets/images/geo-location/key-02.svg',
                'title' => 'Benefit 2 Title',
                'description' => 'Benefit 2 description goes here.',
            ],
            [
                'icon' => 'assets/images/geo-location/key-03.svg',
                'title' => 'Benefit 3 Title',
                'description' => 'Benefit 3 description goes here.',
            ],
            [
                'icon' => 'assets/images/geo-location/key-04.svg',
                'title' => 'Benefit 4 Title',
                'description' => 'Benefit 4 description goes here.',
            ],
            [
                'icon' => 'assets/images/geo-location/key-05.svg',
                'title' => 'Benefit 5 Title',
                'description' => 'Benefit 5 description goes here.',
            ],
            [
                'icon' => 'assets/images/geo-location/key-06.svg',
                'title' => 'Benefit 6 Title',
                'description' => 'Benefit 6 description goes here.',
            ],
        ],
    ],
    
    // ============================================
    // SERVICES SECTION (Generative Engine)
    // ============================================
    'services' => [
        'heading' => 'Your Services Heading',
        'description' => 'Your services description goes here.',
        'services_list' => [
            [
                'title' => 'Service 1 Title',
                'description' => 'Service 1 description goes here.',
            ],
            [
                'title' => 'Service 2 Title',
                'description' => 'Service 2 description goes here.',
            ],
            [
                'title' => 'Service 3 Title',
                'description' => 'Service 3 description goes here.',
            ],
            [
                'title' => 'Service 4 Title',
                'description' => 'Service 4 description goes here.',
            ],
            [
                'title' => 'Service 5 Title',
                'description' => 'Service 5 description goes here.',
            ],
            [
                'title' => 'Service 6 Title',
                'description' => 'Service 6 description goes here.',
            ],
            [
                'title' => 'Service 7 Title',
                'description' => 'Service 7 description goes here.',
            ],
            [
                'title' => 'Service 8 Title',
                'description' => 'Service 8 description goes here.',
            ],
            [
                'title' => 'Service 9 Title',
                'description' => 'Service 9 description goes here.',
            ],
            [
                'title' => 'Service 10 Title',
                'description' => 'Service 10 description goes here.',
            ],
            [
                'title' => 'Service 11 Title',
                'description' => 'Service 11 description goes here.',
            ],
            [
                'title' => 'Service 12 Title',
                'description' => 'Service 12 description goes here.',
            ],
            [
                'title' => 'Service 13 Title',
                'description' => 'Service 13 description goes here.',
            ],
        ],
    ],
    
    // ============================================
    // PROCESS SECTION (5-Stage Process)
    // ============================================
    'process' => [
        'heading' => 'Your Process Heading',
        'description' => 'Your process description goes here.',
        'process_image' => 'assets/images/geo-location/ai-robot.png',
        'steps' => [
            [
                'number' => '01',
                'title' => 'Step 1 Title',
                'subtitle' => 'Step 1 subtitle',
                'description' => 'Step 1 description goes here.',
            ],
            [
                'number' => '02',
                'title' => 'Step 2 Title',
                'subtitle' => 'Step 2 subtitle',
                'description' => 'Step 2 description goes here.',
            ],
            [
                'number' => '03',
                'title' => 'Step 3 Title',
                'subtitle' => 'Step 3 subtitle',
                'description' => 'Step 3 description goes here.',
            ],
            [
                'number' => '04',
                'title' => 'Step 4 Title',
                'subtitle' => 'Step 4 subtitle',
                'description' => 'Step 4 description goes here.',
            ],
            [
                'number' => '05',
                'title' => 'Step 5 Title',
                'subtitle' => 'Step 5 subtitle',
                'description' => 'Step 5 description goes here.',
            ],
        ],
    ],
    
    // ============================================
    // WHY PARTNER SECTION
    // ============================================
    'why_partner' => [
        'heading' => 'Why Partner with Us',
        'description' => 'Your why partner description goes here.',
        'image' => 'assets/images/geo-location/human-robot.png',
    ],
    
    // ============================================
    // WHY ESSENTIAL SECTION
    // ============================================
    'why_essential' => [
        'heading' => 'Why This Is Essential for Modern Search Visibility',
        'heading_span' => 'Search Visibility', // Text that appears on new line with .db class
        'description' => 'Your why essential description goes here.',
        'image' => 'assets/images/geo-location/laptop.png',
        'points' => [
            'Point 1 goes here...',
            'Point 2 goes here...',
            'Point 3 goes here...',
            'Point 4 goes here...',
            'Point 5 goes here...',
        ],
    ],
    
    // ============================================
    // BENEFITS OF WORKING SECTION
    // ============================================
    'benefits_working' => [
        'heading' => 'Benefits of Working With Our Experts',
        'description' => 'Your benefits of working description goes here.',
        'benefits' => [
            [
                'icon' => 'assets/images/geo-location/goe-01.svg',
                'title' => 'Benefit 1 Title',
                'description' => 'Benefit 1 description goes here.',
            ],
            [
                'icon' => 'assets/images/geo-location/goe-02.svg',
                'title' => 'Benefit 2 Title',
                'description' => 'Benefit 2 description goes here.',
            ],
            [
                'icon' => 'assets/images/geo-location/goe-03.svg',
                'title' => 'Benefit 3 Title',
                'description' => 'Benefit 3 description goes here.',
            ],
            [
                'icon' => 'assets/images/geo-location/goe-04.svg',
                'title' => 'Benefit 4 Title',
                'description' => 'Benefit 4 description goes here.',
            ],
        ],
    ],
    
    // ============================================
    // TESTIMONIALS SECTION
    // ============================================
    'testimonials' => [
        'heading' => 'Testimonials',
        'testimonials_list' => [
            [
                'quote' => 'Testimonial quote 1 goes here.',
                'author' => '— Author Name, Company Name',
            ],
            [
                'quote' => 'Testimonial quote 2 goes here.',
                'author' => '— Author Name, Company Name',
            ],
            [
                'quote' => 'Testimonial quote 3 goes here.',
                'author' => '— Author Name, Company Name',
            ],
        ],
    ],
    
    // ============================================
    // INDUSTRIES SECTION
    // ============================================
    'industries' => [
        'heading' => 'Industries We Help Succeed',
        'description' => 'Your industries description goes here.',
        'description_span' => 'AI-driven visibility creates real impact, from SaaS to regulated sectors.', // Text with .db class
        'industries_list' => [
            'Industry 1',
            'Industry 2',
            'Industry 3',
            'Industry 4',
            'Industry 5',
            'Industry 6',
            'Industry 7',
            'Industry 8',
            'Industry 9',
        ],
    ],
    
    // ============================================
    // AI TOOLS & TECHNOLOGIES SECTION
    // ============================================
    'ai_tools' => [
        'heading' => 'AI Tools & Technologies Powering Our Services',
        'description' => 'Your AI tools description goes here.',
        'tools' => [
            [
                'icon' => 'assets/images/geo-location/ai-01.svg',
                'title' => 'Tool 1 Name',
                'description' => 'Tool 1 description goes here.',
            ],
            [
                'icon' => 'assets/images/geo-location/ai-02.svg',
                'title' => 'Tool 2 Name',
                'description' => 'Tool 2 description goes here.',
            ],
            [
                'icon' => 'assets/images/geo-location/ai-03.svg',
                'title' => 'Tool 3 Name',
                'description' => 'Tool 3 description goes here.',
            ],
            [
                'icon' => 'assets/images/geo-location/ai-04.svg',
                'title' => 'Tool 4 Name',
                'description' => 'Tool 4 description goes here.',
            ],
            [
                'icon' => 'assets/images/geo-location/ai-05.svg',
                'title' => 'Tool 5 Name',
                'description' => 'Tool 5 description goes here.',
            ],
            [
                'icon' => 'assets/images/geo-location/ai-06.svg',
                'title' => 'Tool 6 Name',
                'description' => 'Tool 6 description goes here.',
            ],
            [
                'icon' => 'assets/images/geo-location/ai-07.svg',
                'title' => 'Tool 7 Name',
                'description' => 'Tool 7 description goes here.',
            ],
            [
                'icon' => 'assets/images/geo-location/ai-08.svg',
                'title' => 'Tool 8 Name',
                'description' => 'Tool 8 description goes here.',
            ],
        ],
    ],
    
    // ============================================
    // FAQ SECTION
    // ============================================
    'faqs' => [
        'heading' => 'FAQ\'s',
        'faqs_list' => [
            [
                'question' => 'FAQ Question 1?',
                'answer' => 'FAQ Answer 1 goes here.',
                'expanded' => true, // First FAQ is expanded by default
            ],
            [
                'question' => 'FAQ Question 2?',
                'answer' => 'FAQ Answer 2 goes here.',
                'expanded' => false,
            ],
            [
                'question' => 'FAQ Question 3?',
                'answer' => 'FAQ Answer 3 goes here.',
                'expanded' => false,
            ],
            [
                'question' => 'FAQ Question 4?',
                'answer' => 'FAQ Answer 4 goes here.',
                'expanded' => false,
            ],
            [
                'question' => 'FAQ Question 5?',
                'answer' => 'FAQ Answer 5 goes here.',
                'expanded' => false,
            ],
            [
                'question' => 'FAQ Question 6?',
                'answer' => 'FAQ Answer 6 goes here.',
                'expanded' => false,
            ],
            [
                'question' => 'FAQ Question 7?',
                'answer' => 'FAQ Answer 7 goes here.',
                'expanded' => false,
            ],
            [
                'question' => 'FAQ Question 8?',
                'answer' => 'FAQ Answer 8 goes here.',
                'expanded' => false,
            ],
            [
                'question' => 'FAQ Question 9?',
                'answer' => 'FAQ Answer 9 goes here.',
                'expanded' => false,
            ],
            [
                'question' => 'FAQ Question 10?',
                'answer' => 'FAQ Answer 10 goes here.',
                'expanded' => false,
            ],
            [
                'question' => 'FAQ Question 11?',
                'answer' => 'FAQ Answer 11 goes here.',
                'expanded' => false,
            ],
            [
                'question' => 'FAQ Question 12?',
                'answer' => 'FAQ Answer 12 goes here.',
                'expanded' => false,
            ],
            [
                'question' => 'FAQ Question 13?',
                'answer' => 'FAQ Answer 13 goes here.',
                'expanded' => false,
            ],
            [
                'question' => 'FAQ Question 14?',
                'answer' => 'FAQ Answer 14 goes here.',
                'expanded' => false,
            ],
            [
                'question' => 'FAQ Question 15?',
                'answer' => 'FAQ Answer 15 goes here.',
                'expanded' => false,
            ],
            [
                'question' => 'FAQ Question 16?',
                'answer' => 'FAQ Answer 16 goes here.',
                'expanded' => false,
            ],
        ],
    ],
    
    // ============================================
    // FINAL CTA SECTION
    // ============================================
    'final_cta' => [
        'heading' => 'Let Your Brand Be Part of the Conversation',
        'description' => 'Your final CTA description goes here.',
        'description_span' => 'brand is present, referenced, and trusted where it matters most.', // Text with .db class
        'cta_text' => 'Book Your Free Consultation Now!',
        'cta_link' => 'https://brandstory.in/contact-us/',
    ],
];

