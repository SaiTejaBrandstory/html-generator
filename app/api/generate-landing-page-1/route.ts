import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import archiver from 'archiver'
import { createReadStream, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { Readable } from 'stream'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper function to escape HTML
function escapeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Generate complete HTML page with all sections for landing-page-1
function generateHTMLPage(content: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(content.page_title || 'Generated Landing Page')}</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <style>
        * {
            font-family: 'Hanken Grotesk', sans-serif !important;
        }
        body {
            font-family: 'Hanken Grotesk', sans-serif !important;
            background-color: #050505;
            color: #ffffff;
        }
        .bg-gradient-hero {
            background: radial-gradient(circle at 50% 0%, #2e1065 0%, #050505 60%);
        }
        @keyframes scroll-left {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
            from { transform: translateX(-50%); }
            to { transform: translateX(0); }
        }
        .logo-scroll-left {
            animation: scroll-left 40s linear infinite;
            will-change: transform;
        }
        .logo-scroll-right {
            animation: scroll-right 40s linear infinite;
            will-change: transform;
        }
        .benefits-carousel {
            --carousel-offset: 100%;
        }
        @media (min-width: 1024px) {
            .benefits-carousel {
                --carousel-offset: calc(50% + 0.75rem);
            }
        }
        @media (max-width: 768px) {
            .logo-scroll-left { animation: scroll-left 30s linear infinite; }
            .logo-scroll-right { animation: scroll-right 30s linear infinite; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="antialiased overflow-x-hidden scroll-smooth">
    <!-- Hero Section -->
    <section class="relative pt-20 pb-20 lg:pt-32 lg:pb-32 bg-gradient-hero overflow-hidden">
        <div class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80" style="background-image: url('assets/images/template-2/hero-banner.png');"></div>

        <div class="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <h1 class="font-bold text-center capitalize mb-6 md:mb-8" style="color: #F0EFEE; font-size: clamp(24px, 5vw, 52px); line-height: 120%; letter-spacing: 0%;">
                ${escapeHtml(content.hero?.title || '')}
            </h1>
            
            <div class="flex justify-center mb-8 md:mb-12 lg:mb-20">
                <a href="${escapeHtml(content.hero?.cta_link || 'https://brandstory.in/contact-us/')}" class="group flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-3 lg:py-4 rounded-full border border-white/20 hover:border-fuchsia-500 bg-white/5 hover:bg-white/10 transition-all duration-300 text-xs sm:text-sm md:text-base lg:text-lg font-medium">
                    <span class="whitespace-nowrap">${escapeHtml(content.hero?.cta_text || 'Book Your Free Consultation Now!')}</span>
                    <i data-lucide="chevron-right" class="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-fuchsia-500 group-hover:translate-x-1 transition-transform flex-shrink-0"></i>
                </a>
            </div>
        </div>

        <!-- Client Logos Carousel -->
        <div class="relative w-full mt-16 pb-12">
            <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 md:mb-16">
                <p class="text-center capitalize font-semibold" style="color: #FFFFFF; font-size: 22px; line-height: 130%; letter-spacing: 0%;">${escapeHtml(content.hero?.trusted_text || 'Trusted by 500+ Brands Across India')}</p>
            </div>
            
            <div class="overflow-hidden mb-12 md:mb-20 w-full">
                <div class="flex logo-scroll-left items-center" style="width: max-content;">
                    ${Array.from({ length: 2 }, (_, i) => `
                    <div class="flex items-center gap-8 md:gap-16 px-4 md:px-8" style="flex-shrink: 0;">
                        ${Array.from({ length: 10 }, (_, j) => `
                        <img src="assets/images/template-2/client-logos/client-logo-${j + 1}.svg" alt="Client Logo ${j + 1}" class="h-8 md:h-12 w-auto object-contain opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300" style="flex-shrink: 0;">
                        `).join('')}
                    </div>
                    `).join('')}
                </div>
            </div>

            <div class="overflow-hidden w-full">
                <div class="flex logo-scroll-right items-center" style="width: max-content;">
                    ${Array.from({ length: 2 }, (_, i) => `
                    <div class="flex items-center gap-8 md:gap-16 px-4 md:px-8" style="flex-shrink: 0;">
                        ${Array.from({ length: 11 }, (_, j) => `
                        <img src="assets/images/template-2/client-logos/client-logo-${j + 11}.svg" alt="Client Logo ${j + 11}" class="h-8 md:h-12 w-auto object-contain opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300" style="flex-shrink: 0;">
                        `).join('')}
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </section>

    <!-- Intro Text -->
    <section class="py-20 bg-[#0a0a0a]">
        <div class="max-w-6xl mx-auto px-4 text-center">
            <p class="font-medium mb-8" style="color: #FFFFFF; font-size: clamp(16px, 2.5vw, 20px); line-height: 160%; letter-spacing: 0%;">
                ${escapeHtml(content.intro?.paragraph_1 || '')}
            </p>
            <p class="font-medium" style="color: #FFFFFF; font-size: clamp(16px, 2.5vw, 20px); line-height: 160%; letter-spacing: 0%;">
                ${escapeHtml(content.intro?.paragraph_2 || '')}
            </p>
        </div>
    </section>

    <!-- Reviews Section -->
    <section class="py-20 bg-white text-black">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div class="lg:w-1/3">
                <h2 class="font-bold capitalize mb-4 md:mb-6" style="color: #000000; font-size: clamp(28px, 4vw, 38px); line-height: 130%; letter-spacing: 0%;">${escapeHtml(content.reviews?.heading || 'Reviews & Recognition')}</h2>
                <p class="font-medium" style="color: #000000; font-size: clamp(16px, 2.5vw, 20px); line-height: 150%; letter-spacing: 0%;">
                    ${escapeHtml(content.reviews?.description || '')}
                </p>
            </div>
            <div class="lg:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                ${(content.reviews?.logos || []).map((logo: any, index: number) => `
                <div class="bg-[#181818] p-3 sm:p-4 rounded flex flex-col items-center justify-center h-16 sm:h-20 ${index === 4 ? 'col-span-2 sm:col-span-1' : ''}">
                    <img src="${escapeHtml(logo.image || '')}" alt="${escapeHtml(logo.alt || '')}" class="w-20 h-10 sm:w-24 sm:h-12 object-contain">
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Track Record -->
    <section class="py-32 bg-[#050505] relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        
        <div class="max-w-7xl mx-auto px-4 relative z-10">
            <h2 class="font-bold text-center capitalize mb-12 md:mb-20" style="color: #FFFFFF; font-size: clamp(28px, 4vw, 38px); line-height: 130%; letter-spacing: 0%;">${escapeHtml(content.track_record?.heading || 'Our Track Record')}</h2>
            
            <div class="relative h-[600px] w-full max-w-4xl mx-auto hidden md:block">
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20 flex items-center justify-center">
                    <img src="assets/images/template-2/brandstory-logo.svg" alt="BrandStory" class="h-10 w-auto object-contain">
                </div>
                
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full border border-white/5"></div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/5"></div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/5"></div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full border border-white/5"></div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1300px] h-[1300px] rounded-full border border-white/5"></div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1600px] h-[1600px] rounded-full border border-white/5"></div>

                ${(content.track_record?.stats || []).map((stat: any, index: number) => {
                  const positions = [
                    { top: '5%', left: '5%' },
                    { top: '5%', right: '5%' },
                    { bottom: '5%', left: '5%' },
                    { bottom: '5%', right: '5%' }
                  ]
                  const pos = positions[index] || positions[0]
                  return `
                <div class="absolute ${pos.top ? `top-[${pos.top}]` : ''} ${pos.bottom ? `bottom-[${pos.bottom}]` : ''} ${pos.left ? `left-[${pos.left}]` : ''} ${pos.right ? `right-[${pos.right}]` : ''} w-56 h-56 rounded-full backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 sm:p-5 md:p-6 border border-white/10 hover:border-fuchsia-500/50 transition-colors overflow-hidden" style="background-color: rgba(18, 19, 23, 0.3);">
                    <h4 class="font-bold mb-1 sm:mb-2 text-center break-words px-2" style="color: #FFFFFF; font-size: clamp(18px, 2.5vw, 24px); line-height: 130%; letter-spacing: 0%;">${escapeHtml(stat.title || '')}</h4>
                    <p class="font-medium text-center break-words px-2" style="color: #FFFFFF; font-size: clamp(14px, 2vw, 16px); line-height: 140%; letter-spacing: 0%;">${escapeHtml(stat.description || '')}</p>
                </div>
                `
                }).join('')}
            </div>

            <div class="md:hidden grid grid-cols-1 gap-6">
                ${(content.track_record?.stats || []).map((stat: any) => `
                <div class="p-8 rounded-2xl text-center border border-white/10" style="background-color: rgba(18, 19, 23, 0.3);">
                    <h4 class="font-bold mb-2" style="color: #FFFFFF; font-size: 24px; line-height: 130%;">${escapeHtml(stat.title || '')}</h4>
                    <p class="font-medium" style="color: #FFFFFF; font-size: 16px; line-height: 140%;">${escapeHtml(stat.description || '')}</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Key Benefits -->
    <section class="py-12 sm:py-16 md:py-20 bg-[#050505]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-12">
                <div class="lg:w-1/3">
                    <h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-5 md:mb-6 lg:mb-8 leading-tight">${escapeHtml(content.key_benefits?.heading || 'Key Benefits')}</h2>
                    <div class="flex gap-3 md:gap-4 mb-4 sm:mb-0">
                        <button onclick="scrollBenefits(-1)" class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 hover:text-white transition-all duration-150 flex-shrink-0">
                            <i data-lucide="arrow-left" class="w-4 h-4 md:w-5 md:h-5"></i>
                        </button>
                        <button onclick="scrollBenefits(1)" class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 hover:text-white transition-all duration-150 flex-shrink-0">
                            <i data-lucide="arrow-right" class="w-4 h-4 md:w-5 md:h-5"></i>
                        </button>
                    </div>
                </div>
                <div class="lg:w-2/3 overflow-hidden">
                    <div id="benefits-carousel" class="flex transition-transform duration-500 ease-in-out">
                        ${(content.key_benefits?.benefits || []).map((benefit: any) => {
                            return '<div class="w-full lg:w-[calc(50%-12px)] flex-shrink-0 mr-4 md:mr-6 bg-[#1F2937] p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-white/5">' +
                                '<div class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mb-3 sm:mb-4 md:mb-6 text-fuchsia-500 flex-shrink-0">' +
                                '<i data-lucide="' + escapeHtml(benefit.icon || 'cpu') + '" class="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"></i>' +
                                '</div>' +
                                '<h3 class="font-bold mb-2 sm:mb-3 md:mb-4 text-white" style="font-size: clamp(18px, 4vw, 24px); line-height: 130%;">' + escapeHtml(benefit.title || '') + '</h3>' +
                                '<p class="font-medium text-gray-300 sm:text-gray-400" style="font-size: clamp(14px, 3vw, 20px); line-height: 150%;">' +
                                escapeHtml(benefit.description || '') +
                                '</p>' +
                                '</div>'
                        }).join('')}
                    </div>
                    <!-- Navigation Dots -->
                    <div id="benefits-dots" class="flex gap-2 justify-center mt-6 sm:mt-8">
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Services Grid -->
    <section class="py-20 bg-[#050505]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-8 sm:mb-12 md:mb-16">
                <h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">${escapeHtml(content.services?.heading || 'Our Services')}</h2>
                 <p class="font-medium text-gray-400 max-w-7xl mx-auto" style="font-size: clamp(16px, 3vw, 20px);">
                     ${escapeHtml(content.services?.description || '')}
                 </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${(content.services?.services_list || []).map((service: any) => `
                <div class="group bg-[#1F2937] hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 p-5 sm:p-6 md:p-8 rounded-2xl relative overflow-hidden transition-all duration-300 cursor-pointer">
                    <h3 class="font-bold mb-3 sm:mb-4" style="font-size: clamp(20px, 4vw, 24px); line-height: 130%;">${escapeHtml(service.title || '')}</h3>
                    <p class="font-medium mb-6 sm:mb-8 relative z-10 text-gray-400 group-hover:text-white transition-colors" style="font-size: clamp(16px, 3vw, 20px);">
                        ${escapeHtml(service.description || '')}
                    </p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Process Section -->
    <section class="py-20 bg-[#050505]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-8 sm:mb-12 md:mb-16">
                <h2 class="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">${escapeHtml(content.process?.heading || 'Our Process')}</h2>
                 <p class="font-medium text-center text-gray-400" style="font-size: clamp(16px, 3vw, 20px);">
                     ${escapeHtml(content.process?.description || '')}
                 </p>
            </div>

            <div class="space-y-4">
                ${(content.process?.steps || []).map((step: any) => `
                <div class="group bg-[#181818] hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-purple-600 rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 md:gap-8 border border-white/5 transition-all duration-300 cursor-pointer">
                    <div class="font-bold text-white group-hover:text-white/90 transition-colors" style="font-size: clamp(40px, 8vw, 64px);">${escapeHtml(step.number || '')}</div>
                    <div class="flex-shrink-0 w-full md:w-64">
                        <h3 class="font-bold mb-2 md:mb-0" style="font-size: clamp(20px, 4vw, 24px); line-height: 130%;">${escapeHtml(step.title || '')}</h3>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold mb-2 text-white group-hover:text-white/90 transition-colors" style="font-size: clamp(18px, 3vw, 20px);">${escapeHtml(step.subtitle || '')}</h4>
                        <p class="font-medium text-gray-400 group-hover:text-white/80 transition-colors" style="font-size: clamp(16px, 2.5vw, 18px);">
                            ${escapeHtml(step.description || '')}
                        </p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- White CTA Box -->
    <section class="py-12 sm:py-16 md:py-20 px-4">
        <div class="max-w-6xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 lg:p-20 text-center">
            <h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-4 sm:mb-6 md:mb-8 leading-tight">
                ${escapeHtml(content.white_cta?.heading || '')}
            </h2>
            <p class="font-medium mb-6 sm:mb-8 md:mb-10 max-w-4xl mx-auto text-center text-gray-600" style="font-size: clamp(16px, 3vw, 20px);">
                ${escapeHtml(content.white_cta?.description || '')}
            </p>
            <a href="${escapeHtml(content.white_cta?.cta_link || 'https://brandstory.in/contact-us/')}" class="group inline-flex items-center gap-2 bg-[#111] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 hover:shadow-lg transition-all duration-300 ease-in-out text-sm sm:text-base">
                <i data-lucide="chevron-right" class="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300"></i>
                <span class="whitespace-nowrap">${escapeHtml(content.white_cta?.cta_text || 'Book Your Free Consultation Now!')}</span>
            </a>
        </div>
    </section>

    <!-- Why GEO Essential -->
    <section class="py-12 sm:py-16 md:py-20 bg-[#050505]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 sm:gap-12 md:gap-16">
            <div class="lg:w-1/2">
                <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">${escapeHtml(content.why_essential?.heading || 'Why This Is Essential')}</h2>
                <p class="font-medium mb-4 sm:mb-6 text-gray-400" style="font-size: clamp(16px, 3vw, 20px);">
                    ${escapeHtml(content.why_essential?.description || '')}
                </p>
            </div>
            <div class="lg:w-1/2">
                <ul class="space-y-4 sm:space-y-6">
                    ${(content.why_essential?.points || []).map((point: string) => `
                    <li class="flex items-start gap-3">
                        <div class="w-1.5 h-1.5 rounded-full bg-white mt-2.5 flex-shrink-0"></div>
                        <p class="font-medium text-gray-300" style="font-size: clamp(16px, 3vw, 20px);">${escapeHtml(point)}</p>
                    </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    </section>

    <!-- Why GEO Essential with Accordion -->
    <section class="py-12 sm:py-16 md:py-20 bg-[#0a0a1a]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 sm:gap-12 md:gap-16">
            <div class="lg:w-1/2">
                <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">${escapeHtml(content.why_essential_accordion?.heading || 'Why This Is Essential')}</h2>
                 <p class="font-medium mb-4 sm:mb-6 text-gray-400" style="font-size: clamp(16px, 3vw, 20px); letter-spacing: 0%;">
                     ${escapeHtml(content.why_essential_accordion?.description || '')}
                 </p>
            </div>
            <div class="lg:w-1/2 space-y-4 sm:space-y-6 md:space-y-8">
                ${(content.why_essential_accordion?.items || []).map((item: any, index: number) => `
                <div class="bg-[#1F2937] rounded-lg overflow-hidden">
                    <div class="p-3 sm:p-4 flex justify-between items-center cursor-pointer hover:bg-[#2d3748] transition-colors duration-200" onclick="toggleAccordion(${index})">
                        <span class="font-bold capitalize pr-2 sm:pr-4" style="font-size: clamp(18px, 4vw, 24px); line-height: 130%;">${escapeHtml(item.title || '')}</span>
                        <button id="accordion-btn-${index}" class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-in-out bg-white text-black">
                            <svg id="accordion-icon-${index}" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                    </div>
                    <div id="accordion-content-${index}" class="grid overflow-hidden" style="grid-template-rows: 0fr; transition: grid-template-rows 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out; opacity: 0;">
                        <div class="min-h-0 overflow-hidden">
                            <div class="p-3 sm:p-4 pt-3 sm:pt-4 text-gray-400" style="font-size: clamp(16px, 2.5vw, 18px); letter-spacing: 0%;">
                                ${escapeHtml(item.content || '')}
                            </div>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Testimonials -->
    <section class="py-12 sm:py-16 md:py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
                <div>
                    <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 text-black">${escapeHtml(content.testimonials?.heading || 'What Clients Say')}</h2>
                    <div class="flex gap-3 sm:gap-4 mb-8 sm:mb-12">
                        <button onclick="scrollTestimonials(-1)" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 transition-all duration-150">
                            <i data-lucide="arrow-left" class="w-4 h-4 sm:w-5 sm:h-5"></i>
                        </button>
                        <button onclick="scrollTestimonials(1)" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-purple-600 transition-all duration-150">
                            <i data-lucide="arrow-right" class="w-4 h-4 sm:w-5 sm:h-5"></i>
                        </button>
                    </div>
                </div>

                <div class="relative w-full">
                    <div class="overflow-hidden w-full">
                        <div id="testimonials-carousel" class="flex transition-transform duration-500 ease-in-out">
                            ${(content.testimonials?.testimonials_list || []).map((testimonial: any) => `
                            <div class="min-w-full w-full flex-shrink-0 px-1 sm:px-2">
                                <div class="bg-[#111] p-5 sm:p-6 md:p-8 rounded-2xl border border-gray-200 h-full flex flex-col">
                                    <svg class="w-8 h-8 sm:w-10 sm:h-10 text-gray-600 mb-3 sm:mb-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.608l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.608l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                                    </svg>
                                    <p class="mb-4 sm:mb-6 text-white flex-grow" style="font-size: clamp(16px, 3vw, 20px);">
                                        ${escapeHtml(testimonial.quote || '')}
                                    </p>
                                    <div class="flex items-center gap-2 mt-auto">
                                        <div class="w-6 sm:w-8 h-0.5 bg-white"></div>
                                        <span class="font-bold text-white text-sm sm:text-base">${escapeHtml(testimonial.author || '')}</span>
                                    </div>
                                </div>
                            </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="flex gap-2 justify-center mt-6">
                        ${(content.testimonials?.testimonials_list || []).map((_: any, index: number) => `
                        <button onclick="goToTestimonial(${index})" class="h-2 rounded-full transition-all duration-300 cursor-pointer testimonial-dot ${index === 0 ? 'bg-black w-8' : 'bg-gray-300 w-2 hover:bg-gray-500 hover:w-4'}" data-index="${index}"></button>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-12 sm:py-16 md:py-20 bg-[#050505]">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-12">FAQ's</h2>
            <div class="space-y-3 sm:space-y-4">
                ${(content.faqs?.faqs_list || []).map((faq: any, index: number) => `
                <div class="bg-[#1F2937] rounded-lg overflow-hidden">
                    <div class="p-4 sm:p-5 flex justify-between items-center cursor-pointer hover:bg-[#2d3748] transition-colors duration-200" onclick="toggleFAQ(${index})">
                        <span class="font-bold capitalize pr-2 sm:pr-4 text-left" style="font-size: clamp(18px, 4vw, 24px); line-height: 140%; letter-spacing: 0%;">${escapeHtml(faq.question || '')}</span>
                        <button id="faq-btn-${index}" class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-in-out bg-white text-black">
                            <svg id="faq-icon-${index}" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                    </div>
                    <div id="faq-content-${index}" class="grid overflow-hidden" style="grid-template-rows: ${faq.expanded ? '1fr' : '0fr'}; transition: grid-template-rows 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out; opacity: ${faq.expanded ? '1' : '0'};">
                        <div class="min-h-0 overflow-hidden">
                            <div class="p-4 sm:p-5 pt-3 sm:pt-4" style="font-size: clamp(16px, 3vw, 20px); line-height: 140%; letter-spacing: 0%; color: #9CA3AF;">
                                ${escapeHtml(faq.answer || '')}
                            </div>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <script>
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons()
        }

        // Benefits carousel
        let currentBenefitsIndex = 0
        const totalCards = ${(content.key_benefits?.benefits || []).length}
        
        function isDesktop() {
            return window.innerWidth >= 1024
        }
        
        function getMaxIndex() {
            return isDesktop() ? Math.max(0, totalCards - 2) : Math.max(0, totalCards - 1)
        }
        
        function updateCarousel() {
            const carousel = document.getElementById('benefits-carousel')
            if (!carousel) return
            
            const maxIndex = getMaxIndex()
            if (currentBenefitsIndex > maxIndex) currentBenefitsIndex = maxIndex
            
            if (isDesktop()) {
                carousel.style.transform = \`translateX(calc(-\${currentBenefitsIndex} * (50% + 12px)))\`
            } else {
                carousel.style.transform = \`translateX(calc(-\${currentBenefitsIndex} * (100% + 16px)))\`
            }
            
            // Update dots
            updateDots()
        }
        
        function updateDots() {
            const dotsContainer = document.getElementById('benefits-dots')
            if (!dotsContainer) return
            
            const numDots = isDesktop() ? Math.max(1, totalCards - 1) : totalCards
            dotsContainer.innerHTML = ''
            
            for (let i = 0; i < numDots; i++) {
                const dot = document.createElement('button')
                dot.className = \`h-2 rounded-full transition-all duration-300 cursor-pointer \${i === currentBenefitsIndex ? 'bg-fuchsia-500 w-8' : 'bg-gray-600 w-2 hover:bg-gray-500 hover:w-4'}\`
                dot.onclick = () => goToBenefits(i)
                dotsContainer.appendChild(dot)
            }
        }
        
        function scrollBenefits(direction) {
            const maxIndex = getMaxIndex()
            currentBenefitsIndex += direction
            if (currentBenefitsIndex < 0) currentBenefitsIndex = maxIndex
            if (currentBenefitsIndex > maxIndex) currentBenefitsIndex = 0
            updateCarousel()
        }
        
        function goToBenefits(index) {
            const maxIndex = getMaxIndex()
            if (index < 0 || index > maxIndex) return
            currentBenefitsIndex = index
            updateCarousel()
        }
        
        window.addEventListener('resize', updateCarousel)
        setTimeout(updateCarousel, 100)

        // Testimonials carousel
        let currentTestimonial = 0
        const testimonialsCount = ${(content.testimonials?.testimonials_list || []).length}
        function scrollTestimonials(direction) {
            currentTestimonial += direction
            if (currentTestimonial < 0) currentTestimonial = testimonialsCount - 1
            if (currentTestimonial >= testimonialsCount) currentTestimonial = 0
            
            const carousel = document.getElementById('testimonials-carousel')
            carousel.style.transform = \`translateX(-\${currentTestimonial * 100}%)\`
            
            // Update dots
            document.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
                if (i === currentTestimonial) {
                    dot.classList.add('bg-black', 'w-8')
                    dot.classList.remove('bg-gray-300', 'w-2')
                } else {
                    dot.classList.remove('bg-black', 'w-8')
                    dot.classList.add('bg-gray-300', 'w-2')
                }
            })
        }
        
        function goToTestimonial(index) {
            currentTestimonial = index
            const carousel = document.getElementById('testimonials-carousel')
            carousel.style.transform = \`translateX(-\${currentTestimonial * 100}%)\`
            
            document.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
                if (i === currentTestimonial) {
                    dot.classList.add('bg-black', 'w-8')
                    dot.classList.remove('bg-gray-300', 'w-2')
                } else {
                    dot.classList.remove('bg-black', 'w-8')
                    dot.classList.add('bg-gray-300', 'w-2')
                }
            })
        }

        // Accordion functions
        function toggleAccordion(index) {
            const content = document.getElementById(\`accordion-content-\${index}\`)
            const icon = document.getElementById(\`accordion-icon-\${index}\`)
            const btn = document.getElementById(\`accordion-btn-\${index}\`)
            const isOpen = content.style.gridTemplateRows === '1fr'
            
            // Close all other accordion items
            const allAccordionContents = document.querySelectorAll('[id^="accordion-content-"]')
            const allAccordionIcons = document.querySelectorAll('[id^="accordion-icon-"]')
            const allAccordionBtns = document.querySelectorAll('[id^="accordion-btn-"]')
            
            allAccordionContents.forEach((accContent, i) => {
                if (i !== index) {
                    accContent.style.gridTemplateRows = '0fr'
                    accContent.style.opacity = '0'
                    if (allAccordionIcons[i]) {
                        allAccordionIcons[i].innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>'
                        allAccordionIcons[i].classList.remove('text-white')
                        allAccordionIcons[i].classList.add('text-black')
                    }
                    if (allAccordionBtns[i]) {
                        allAccordionBtns[i].classList.remove('bg-gradient-to-r', 'from-fuchsia-500', 'to-purple-600')
                        allAccordionBtns[i].classList.add('bg-white', 'text-black')
                    }
                }
            })
            
            if (isOpen) {
                content.style.gridTemplateRows = '0fr'
                content.style.opacity = '0'
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>'
                btn.classList.remove('bg-gradient-to-r', 'from-fuchsia-500', 'to-purple-600')
                btn.classList.add('bg-white', 'text-black')
                icon.classList.remove('text-white')
                icon.classList.add('text-black')
            } else {
                content.style.gridTemplateRows = '1fr'
                content.style.opacity = '1'
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>'
                btn.classList.add('bg-gradient-to-r', 'from-fuchsia-500', 'to-purple-600')
                btn.classList.remove('bg-white', 'text-black')
                icon.classList.add('text-white')
                icon.classList.remove('text-black')
            }
        }

        function toggleFAQ(index) {
            const content = document.getElementById(\`faq-content-\${index}\`)
            const icon = document.getElementById(\`faq-icon-\${index}\`)
            const btn = document.getElementById(\`faq-btn-\${index}\`)
            const isOpen = content.style.gridTemplateRows === '1fr'
            
            // Close all other FAQ items
            const allFAQContents = document.querySelectorAll('[id^="faq-content-"]')
            const allFAQIcons = document.querySelectorAll('[id^="faq-icon-"]')
            const allFAQBtns = document.querySelectorAll('[id^="faq-btn-"]')
            
            allFAQContents.forEach((faqContent, i) => {
                if (i !== index) {
                    faqContent.style.gridTemplateRows = '0fr'
                    faqContent.style.opacity = '0'
                    if (allFAQIcons[i]) {
                        allFAQIcons[i].innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>'
                        allFAQIcons[i].classList.remove('text-white')
                        allFAQIcons[i].classList.add('text-black')
                    }
                    if (allFAQBtns[i]) {
                        allFAQBtns[i].classList.remove('bg-gradient-to-r', 'from-fuchsia-500', 'to-purple-600')
                        allFAQBtns[i].classList.add('bg-white', 'text-black')
                    }
                }
            })
            
            if (isOpen) {
                content.style.gridTemplateRows = '0fr'
                content.style.opacity = '0'
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>'
                btn.classList.remove('bg-gradient-to-r', 'from-fuchsia-500', 'to-purple-600')
                btn.classList.add('bg-white', 'text-black')
                icon.classList.remove('text-white')
                icon.classList.add('text-black')
            } else {
                content.style.gridTemplateRows = '1fr'
                content.style.opacity = '1'
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>'
                btn.classList.add('bg-gradient-to-r', 'from-fuchsia-500', 'to-purple-600')
                btn.classList.remove('bg-white', 'text-black')
                icon.classList.add('text-white')
                icon.classList.remove('text-black')
            }
        }
    </script>
</body>
</html>`
}

// Recursively add directory to zip
function addDirectoryToZip(archive: archiver.Archiver, dirPath: string, zipPath: string) {
  const files = readdirSync(dirPath)
  
  for (const file of files) {
    const filePath = join(dirPath, file)
    const stat = statSync(filePath)
    
    if (stat.isDirectory()) {
      addDirectoryToZip(archive, filePath, `${zipPath}/${file}`)
    } else {
      archive.file(filePath, { name: `${zipPath}/${file}` })
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userInput } = await request.json()

    if (!userInput || !userInput.trim()) {
      return NextResponse.json(
        { error: 'Content input is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    // Create the prompt for content generation
    const prompt = `Generate complete content structure for a landing page. User input: "${userInput}"

CRITICAL: Generate ALL sections. All sections are required:
1. Hero (title, cta_text, cta_link, trusted_text)
2. Intro (paragraph_1, paragraph_2)
3. Reviews (heading, description, logos array with image and alt)
4. Track Record (heading, 4 stats with title and description)
5. Key Benefits (heading, 6 benefits with icon, title, description)
6. Services (heading, description, 6 services with title and description)
7. Process (heading, description, 5 steps with number, title, subtitle, description)
8. White CTA (heading, description, cta_text, cta_link)
9. Why Essential (heading, description, 5 points)
10. Why Essential Accordion (heading, description, 4 items with title and content)
11. Testimonials (heading, 6 testimonials with quote and author)
12. FAQs (heading, 16 FAQs with question, answer, expanded boolean)

IMPORTANT: 
- Generate ALL sections - do not skip any
- Write detailed, comprehensive descriptions (3-4 sentences, 60-100 words minimum)
- Make content rich and informative
- Return ONLY valid JSON, no markdown:

{
  "page_title": "SEO-optimized page title (60 characters max)",
  "hero": {
    "title": "Compelling main headline (50-70 characters)",
    "cta_text": "Call-to-action button text",
    "cta_link": "https://brandstory.in/contact-us/",
    "trusted_text": "Trusted By 500+ Brands Across India"
  },
  "intro": {
    "paragraph_1": "First paragraph (4-5 sentences, 150-200 words) based on user input. Make it detailed, informative, and specific.",
    "paragraph_2": "Second paragraph (4-5 sentences, 150-200 words) based on user input. Continue with more specific details."
  },
  "reviews": {
    "heading": "Reviews & Recognition",
    "description": "Description about reviews and recognition (3-4 sentences, 100-150 words)",
    "logos": [
      {"image": "assets/images/web-development-company/clutch.svg", "alt": "Clutch"},
      {"image": "assets/images/geo-location/g2.svg", "alt": "G2"},
      {"image": "assets/images/geo-location/trust-pilot.svg", "alt": "Trustpilot"},
      {"image": "assets/images/geo-location/good.svg", "alt": "GoodFirms"},
      {"image": "assets/images/web-development-company/google-logo.svg", "alt": "Google"}
    ]
  },
  "track_record": {
    "heading": "Our Track Record",
    "stats": [
      {"title": "Years of Experience", "description": "Over 12 years of strategic expertise"},
      {"title": "Expert Team", "description": "120+ skilled professionals"},
      {"title": "Client Success", "description": "500+ clients with proven search growth"},
      {"title": "Industry Reach", "description": "Serving 30+ diverse, dynamic industries"}
    ]
  },
  "key_benefits": {
    "heading": "Key Benefits Of Services For AI Search Engines",
    "benefits": [
      {"icon": "cpu", "title": "Generate specific benefit title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"icon": "search", "title": "Generate another benefit title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"icon": "zap", "title": "Generate another benefit title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"icon": "trending-up", "title": "Generate another benefit title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"icon": "target", "title": "Generate another benefit title", "description": "Detailed description (3-4 sentences, 60-100 words)"},
      {"icon": "globe", "title": "Generate another benefit title", "description": "Detailed description (3-4 sentences, 60-100 words)"}
    ]
  },
  "services": {
    "heading": "Generate services heading",
    "description": "Services overview (3-4 sentences, 80-120 words)",
    "services_list": [
      {"title": "Generate specific service title", "description": "Detailed service description (3-4 sentences, 60-100 words)"},
      {"title": "Generate another service title", "description": "Detailed service description (3-4 sentences, 60-100 words)"},
      {"title": "Generate another service title", "description": "Detailed service description (3-4 sentences, 60-100 words)"},
      {"title": "Generate another service title", "description": "Detailed service description (3-4 sentences, 60-100 words)"},
      {"title": "Generate another service title", "description": "Detailed service description (3-4 sentences, 60-100 words)"},
      {"title": "Generate another service title", "description": "Detailed service description (3-4 sentences, 60-100 words)"}
    ]
  },
  "process": {
    "heading": "Our 5-Stage Process For Success",
    "description": "Process overview (3-4 sentences, 80-120 words)",
    "steps": [
      {"number": "01", "title": "Generate step 1 title", "subtitle": "Generate step 1 subtitle", "description": "Detailed step description (3-4 sentences, 60-100 words)"},
      {"number": "02", "title": "Generate step 2 title", "subtitle": "Generate step 2 subtitle", "description": "Detailed step description (3-4 sentences, 60-100 words)"},
      {"number": "03", "title": "Generate step 3 title", "subtitle": "Generate step 3 subtitle", "description": "Detailed step description (3-4 sentences, 60-100 words)"},
      {"number": "04", "title": "Generate step 4 title", "subtitle": "Generate step 4 subtitle", "description": "Detailed step description (3-4 sentences, 60-100 words)"},
      {"number": "05", "title": "Generate step 5 title", "subtitle": "Generate step 5 subtitle", "description": "Detailed step description (3-4 sentences, 60-100 words)"}
    ]
  },
  "white_cta": {
    "heading": "Generate compelling CTA heading",
    "description": "CTA description (3-4 sentences, 80-120 words)",
    "cta_text": "Book Your Free Consultation Now!",
    "cta_link": "https://brandstory.in/contact-us/"
  },
  "why_essential": {
    "heading": "Why This Is Essential",
    "description": "Why essential description (3-4 sentences, 100-150 words)",
    "points": [
      "Point 1 (3-4 sentences, 60-100 words)",
      "Point 2 (3-4 sentences, 60-100 words)",
      "Point 3 (3-4 sentences, 60-100 words)",
      "Point 4 (3-4 sentences, 60-100 words)",
      "Point 5 (3-4 sentences, 60-100 words)"
    ]
  },
  "why_essential_accordion": {
    "heading": "Why This Is Essential",
    "description": "Why essential description (3-4 sentences, 100-150 words)",
    "items": [
      {"title": "Generate item title", "content": "Detailed content (3-4 sentences, 60-100 words)"},
      {"title": "Generate another item title", "content": "Detailed content (3-4 sentences, 60-100 words)"},
      {"title": "Generate another item title", "content": "Detailed content (3-4 sentences, 60-100 words)"},
      {"title": "Generate another item title", "content": "Detailed content (3-4 sentences, 60-100 words)"}
    ]
  },
  "testimonials": {
    "heading": "What Clients Say About Our Expertise",
    "testimonials_list": [
      {"quote": "Realistic testimonial (3-4 sentences, 60-100 words)", "author": "Realistic author name with title"},
      {"quote": "Another realistic testimonial (3-4 sentences, 60-100 words)", "author": "Another realistic author name"},
      {"quote": "Another realistic testimonial (3-4 sentences, 60-100 words)", "author": "Another realistic author name"},
      {"quote": "Another realistic testimonial (3-4 sentences, 60-100 words)", "author": "Another realistic author name"},
      {"quote": "Another realistic testimonial (3-4 sentences, 60-100 words)", "author": "Another realistic author name"},
      {"quote": "Another realistic testimonial (3-4 sentences, 60-100 words)", "author": "Another realistic author name"}
    ]
  },
  "faqs": {
    "heading": "FAQ's",
    "faqs_list": [
      {"question": "Realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": true},
      {"question": "Another realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": false},
      {"question": "Another realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": false},
      {"question": "Another realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": false},
      {"question": "Another realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": false},
      {"question": "Another realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": false},
      {"question": "Another realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": false},
      {"question": "Another realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": false},
      {"question": "Another realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": false},
      {"question": "Another realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": false},
      {"question": "Another realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": false},
      {"question": "Another realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": false},
      {"question": "Another realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": false},
      {"question": "Another realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": false},
      {"question": "Another realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": false},
      {"question": "Another realistic FAQ question", "answer": "Detailed answer (3-4 sentences, 60-100 words)", "expanded": false}
    ]
  }
}

CRITICAL REQUIREMENTS:
- Generate ALL content sections based on user input: "${userInput}"
- Fill EVERY field with real, specific content - NO placeholders
- All content must be specific to the user's input topic
- Use SEO keywords naturally throughout
- Write in professional, conversion-focused tone
- Descriptions should be 3-4 sentences (60-100 words minimum)
- Return ONLY valid JSON, no markdown, no code blocks`

    // Call OpenAI API
    const models = [
      { name: 'gpt-4o', maxTokens: 16384 },
      { name: 'gpt-4-turbo', maxTokens: 4096 },
      { name: 'gpt-3.5-turbo', maxTokens: 4096 },
    ]

    let completion
    let lastError: any = null
    let responseContent = ''

    for (const modelConfig of models) {
      try {
        console.log(`Trying model: ${modelConfig.name} with max_tokens: ${modelConfig.maxTokens}`)
        completion = await openai.chat.completions.create({
          model: modelConfig.name,
          max_tokens: modelConfig.maxTokens,
          messages: [
            {
              role: 'system',
              content: 'You are an expert SEO content writer specializing in creating high-quality, humanized content with optimal readability scores. Always return valid JSON format with ALL sections filled based on the user input. Never use placeholder text or generic examples.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        })

        responseContent = completion.choices[0]?.message?.content || ''
        
        if (completion.choices[0]?.finish_reason === 'length') {
          console.warn(`⚠ Response was truncated (max_tokens reached) for model ${modelConfig.name}`)
          const currentIndex = models.findIndex(m => m.name === modelConfig.name)
          if (currentIndex < models.length - 1) {
            console.log(`Response truncated, trying next model with higher token limit...`)
            continue
          }
        }
        
        console.log(`✓ Successfully used model: ${modelConfig.name}`)
        break
      } catch (error: any) {
        lastError = error
        console.log(`✗ Model ${modelConfig.name} failed: ${error.message || 'Unknown error'}`)
      }
    }

    if (!responseContent && lastError) {
      throw new Error(`All models failed. Last error: ${lastError.message || 'Unknown error'}. Please check your API key and model access.`)
    }

    // Parse JSON from response
    let contentData
    try {
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || responseContent.match(/```\n([\s\S]*?)\n```/)
      let jsonString = jsonMatch ? jsonMatch[1] : responseContent
      contentData = JSON.parse(jsonString)
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError)
      throw new Error(`Failed to parse content from API response: ${parseError.message}. Please try again.`)
    }

    // Generate HTML
    const htmlContent = generateHTMLPage(contentData)

    // Create ZIP file with HTML and assets
    const archive = archiver('zip', { zlib: { level: 9 } })
    const chunks: Buffer[] = []

    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })

    // Add HTML file
    archive.append(htmlContent, { name: 'index.html' })

    // Add assets directory
    const assetsPath = join(process.cwd(), 'public', 'assets')
    addDirectoryToZip(archive, assetsPath, 'assets')

    // Finalize the archive and wait for completion
    await new Promise<void>((resolve, reject) => {
      archive.on('end', () => resolve())
      archive.on('error', (err) => reject(err))
      archive.finalize()
    })

    const zipBuffer = Buffer.concat(chunks)

    // Return ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="generated-landing-page-1-${Date.now()}.zip"`,
      },
    })
  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate content',
        message: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

