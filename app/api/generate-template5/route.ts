import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import archiver from 'archiver'
import { createReadStream, readdirSync, statSync, readFileSync } from 'fs'
import { join } from 'path'

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

// Helper function to add directory to ZIP
function addDirectoryToZip(archive: archiver.Archiver, dirPath: string, zipPath: string) {
  try {
    const items = readdirSync(dirPath)
    for (const item of items) {
      const fullPath = join(dirPath, item)
      const stat = statSync(fullPath)
      const relativePath = join(zipPath, item).replace(/\\/g, '/')
      
      if (stat.isDirectory()) {
        addDirectoryToZip(archive, fullPath, relativePath)
      } else {
        archive.append(createReadStream(fullPath), { name: relativePath })
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not add directory ${dirPath} to ZIP:`, error)
  }
}

// Generate complete HTML page by reading original and replacing content
function generateHTMLPage(content: any): string {
  // Read the original HTML file
  const originalHtmlPath = join(process.cwd(), 'landing-page5.html')
  let htmlContent = readFileSync(originalHtmlPath, 'utf-8')
  
  // Fix button width in banner section - add style override before </head>
  // Add a style tag with button width override
  if (!htmlContent.includes('.btn[_ngcontent-sc621] { width: auto !important')) {
    htmlContent = htmlContent.replace(
      /<\/head>/,
      `<style>.btn[_ngcontent-sc621], a.btn[_ngcontent-sc621] { width: auto !important; }</style></head>`
    )
  }
  
  // Replace title
  htmlContent = htmlContent.replace(
    /<title>.*?<\/title>/i,
    `<title>${escapeHtml(content.page_title || 'Generated Page')}</title>`
  )
  
  // Replace banner title
  htmlContent = htmlContent.replace(
    /<span _ngcontent-sc621="" class="bs-text-white">.*?<\/span>/,
    `<span _ngcontent-sc621="" class="bs-text-white">${escapeHtml(content.banner?.title || '')}</span>`
  )
  
  // Replace banner description
  htmlContent = htmlContent.replace(
    /<p _ngcontent-sc621="" class="text-white pt-2 cen" style="font-size: 18px; font-weight: 300;">.*?<\/p>/,
    `<p _ngcontent-sc621="" class="text-white pt-2 cen" style="font-size: 18px; font-weight: 300;">${escapeHtml(content.banner?.description || '')}</p>`
  )
  
  // Replace banner CTA text
  htmlContent = htmlContent.replace(
    /<a _ngcontent-sc621="" href="https:\/\/brandstory\.in\/contact-us\/" class="btn txn btn-primary text-center border-0">.*?<\/a>/,
    `<a _ngcontent-sc621="" href="${escapeHtml(content.banner?.cta_link || 'https://brandstory.in/contact-us/')}" class="btn txn btn-primary text-center border-0">${escapeHtml(content.banner?.cta_text || 'Explore more')}</a>`
  )
  
  // Replace intro heading
  htmlContent = htmlContent.replace(
    /<h3 _ngcontent-sc621="" class="need-head" style="font-weight: 700;">.*?<\/h3>/,
    `<h3 _ngcontent-sc621="" class="need-head" style="font-weight: 700;">${escapeHtml(content.intro?.heading || '')}</h3>`
  )
  
  // Replace intro paragraphs
  const introParagraphs = (content.intro?.paragraphs || []).map((para: string) => 
    `<p _ngcontent-sc621="" class="pt-2" style="font-weight: 500;">${escapeHtml(para)}</p>`
  ).join('')
  htmlContent = htmlContent.replace(
    /<p _ngcontent-sc621="" class="pt-2" style="font-weight: 500;">.*?<\/p><p _ngcontent-sc621="" style="font-weight: 500;">.*?<\/p>/,
    introParagraphs || '<p _ngcontent-sc621="" class="pt-2" style="font-weight: 500;">Content placeholder</p>'
  )
  
  // Replace intro CTA link text
  htmlContent = htmlContent.replace(
    /<p _ngcontent-sc621="" style="color: #845EF7; font-weight: 500; text-decoration: underline; text-decoration-color: #845EF7;"><a _ngcontent-sc621="" href="https:\/\/brandstory\.in\/contact-us\/">.*?<\/a><\/p>/,
    `<p _ngcontent-sc621="" style="color: #845EF7; font-weight: 500; text-decoration: underline; text-decoration-color: #845EF7;"><a _ngcontent-sc621="" href="https://brandstory.in/contact-us/">${escapeHtml(content.intro?.cta_text || "Let's build your next project!")}</a></p>`
  )
  
  // Replace entire services section - first row (3 services)
  const servicesFirstRow = (content.services?.services_list || []).slice(0, 3).map((service: any, index: number) => {
    const icons = [
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/angularjs.png',
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-consult.png',
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-migration.png'
    ]
    const alts = ['expertize', 'proven', 'customize']
    return `<div _ngcontent-sc621="" class="col-md-4 d-flex"><div _ngcontent-sc621="" class="card pt-2 bk border-0 flex-fill"><div _ngcontent-sc621="" class="card-body"><img _ngcontent-sc621="" src="${escapeHtml(service.icon || icons[index])}" width="82" height="82" alt="${alts[index]}" style="margin-bottom: 10px;"><h3 _ngcontent-sc621="" class="py-2 pt-2" style="font-size: 20px; font-weight: 600;">${escapeHtml(service.title || '')}</h3><p _ngcontent-sc621="" class="cef" style="font-weight: 500;">${escapeHtml(service.description || '')}</p></div></div></div>`
  }).join('')
  
  // Replace services - second row (2 services from services 4-5, then 6th service as CTA card)
  const servicesSecondRow = (content.services?.services_list || []).slice(3, 5).map((service: any, index: number) => {
    const icons = [
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-uiux.png',
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-enterprise.png'
    ]
    const alts = ['market-understanding', 'workshop-idea']
    return `<div _ngcontent-sc621="" class="col-md-4 d-flex ${index === 0 ? 'flex-fill' : ''}"><div _ngcontent-sc621="" class="card pt-2 bk border-0${index === 0 ? '' : ' flex-fill'}"><div _ngcontent-sc621="" class="card-body"><img _ngcontent-sc621="" src="${escapeHtml(service.icon || icons[index])}" width="82" height="82" alt="${alts[index]}" style="margin-bottom: 10px;"><h3 _ngcontent-sc621="" class="py-2 pt-2" style="font-size: 20px; font-weight: 600;">${escapeHtml(service.title || '')}</h3><p _ngcontent-sc621="" class="cef" style="font-weight: 500;">${escapeHtml(service.description || '')}</p></div></div></div>`
  }).join('')
  
  // Use 6th service title as CTA card heading
  const sixthService = (content.services?.services_list || [])[5]
  const ctaCardTitle = sixthService?.title || content.services?.cta_title || 'Expert AngularJS Developers Tailoring Success for Your Business'
  const ctaCard = `<div _ngcontent-sc621="" class="col-md-4 d-flex"><div _ngcontent-sc621="" class="card pt-5 smm-banner-red2 text-center flex-fill"><div _ngcontent-sc621="" class="card-body d-flex flex-column align-items-center text-center"><h3 _ngcontent-sc621="" style="font-size: 22px; color: white; margin-top: 10px; font-weight: 700;">${escapeHtml(ctaCardTitle)}</h3><br _ngcontent-sc621=""><a _ngcontent-sc621="" href="https://brandstory.in/contact-us/" class="btn txn btn-primary text-center border-0">Explore more</a></div></div></div>`
  
  // Replace entire services section (both rows) - more robust regex
  const servicesSectionRegex = /<h2 _ngcontent-sc621="" class="text-center">[\s\S]*?<\/h2><div _ngcontent-sc621="" class="row pt-3">[\s\S]*?<\/div><div _ngcontent-sc621="" class="row pt-3">[\s\S]*?<\/div><\/div><div _ngcontent-sc621="" class="container py-5 rounded bg-blu">/
  htmlContent = htmlContent.replace(
    servicesSectionRegex,
    `<h2 _ngcontent-sc621="" class="text-center">${escapeHtml(content.services?.heading || 'Our Services')}</h2><div _ngcontent-sc621="" class="row pt-3">${servicesFirstRow}</div><div _ngcontent-sc621="" class="row pt-3">${servicesSecondRow}${ctaCard}</div></div><div _ngcontent-sc621="" class="container py-5 rounded bg-blu">`
  )
  
  // Replace why choose us section - match from heading through ALL rows
  const whyChooseUsBenefitsArray = (content.why_choose_us?.benefits || []).map((benefit: any) => 
    `<div _ngcontent-sc621="" class="col-12 col-lg-6 mb-4"><div _ngcontent-sc621="" class="smm-check"><div _ngcontent-sc621="" class="d-flex align-items-center mb-3"><h3 _ngcontent-sc621="" style="font-size: 24px; font-weight: 600; line-height: 38px; margin: 0;">${escapeHtml(benefit.title || '')}</h3></div><p _ngcontent-sc621="" style="font-size: 16px; font-weight: 500;">${escapeHtml(benefit.description || '')}</p></div></div>`
  )
  
  // Split benefits into rows of 2 (6 benefits = 3 rows)
  const benefitsRows: string[] = []
  for (let i = 0; i < whyChooseUsBenefitsArray.length; i += 2) {
    const rowBenefits = whyChooseUsBenefitsArray.slice(i, i + 2).join('')
    benefitsRows.push(`<div _ngcontent-sc621="" class="row">${rowBenefits}</div>`)
  }
  const allBenefitsRows = benefitsRows.join('')
  
  // Replace entire why choose us section (heading + all 3 rows) - match everything from heading to closing div
  htmlContent = htmlContent.replace(
    /<h2 _ngcontent-sc621="" class="text-center mb-5">Choose Us For High-Performance &amp; Efficient Angularjs Applications<\/h2>[\s\S]*?<\/div><br _ngcontent-sc621=""><br _ngcontent-sc621=""><div _ngcontent-sc621="" class="container-fluid smm-banner-red py-5">/,
    `<h2 _ngcontent-sc621="" class="text-center mb-5">${escapeHtml(content.why_choose_us?.heading || 'Choose Us For High-Performance & Efficient Angularjs Applications')}</h2>${allBenefitsRows}</div><br _ngcontent-sc621=""><br _ngcontent-sc621=""><div _ngcontent-sc621="" class="container-fluid smm-banner-red py-5">`
  )
  
  // Replace edge heading
  htmlContent = htmlContent.replace(
    /<h2 _ngcontent-sc621="" class="text-white">Unraveling Our Unmatchable Edge Amongst AngularJS Development Companies in Bangalore<\/h2>/,
    `<h2 _ngcontent-sc621="" class="text-white">${escapeHtml(content.edge?.heading || 'Unraveling Our Unmatchable Edge Amongst AngularJS Development Companies in Bangalore')}</h2>`
  )
  
  // Replace edge cards
  const edgeCards = (content.edge?.cards || []).map((card: any, index: number) => {
    const bgClasses = ['bk1', 'bk2', 'bk3', 'bk10']
    const icons = [
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/estimate.png',
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-code.png',
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/idea.png',
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-comm.png'
    ]
    const alts = ['expertize', 'proven', 'workshop-idea', 'workshop-idea']
    return `<div _ngcontent-sc621="" class="card pt-2 ${bgClasses[index] || 'bk1'} border-0"><div _ngcontent-sc621="" class="card-body"><img _ngcontent-sc621="" src="${escapeHtml(card.icon || icons[index])}" width="64" height="64" alt="${alts[index]}"><h3 _ngcontent-sc621="" class="py-2 text-white" style="font-size: 22px; font-weight: 700;">${escapeHtml(card.title || '')}</h3><p _ngcontent-sc621="" class="cef text-white" style="font-size: 16px; font-weight: 400;">${escapeHtml(card.description || '')}</p></div></div>`
  }).join('')
  
  // Replace edge cards - EXACTLY 4 cards only, split into two card-decks (2+2)
  const edgeCardsList = (content.edge?.cards || []).slice(0, 4) // Only take first 4 cards
  const firstTwoCards = edgeCardsList.slice(0, 2).map((card: any, index: number) => {
    const bgClasses = ['bk1', 'bk2']
    const icons = [
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/estimate.png',
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-code.png'
    ]
    return `<div _ngcontent-sc621="" class="card pt-2 ${bgClasses[index]} border-0"><div _ngcontent-sc621="" class="card-body"><img _ngcontent-sc621="" src="${escapeHtml(card.icon || icons[index])}" width="64" height="64" alt="expertize"><h3 _ngcontent-sc621="" class="py-2 text-white" style="font-size: 22px; font-weight: 700;">${escapeHtml(card.title || '')}</h3><p _ngcontent-sc621="" class="cef text-white" style="font-size: 16px; font-weight: 400;">${escapeHtml(card.description || '')}</p></div></div>`
  }).join('')
  
  const lastTwoCards = edgeCardsList.slice(2, 4).map((card: any, index: number) => {
    const bgClasses = ['bk3', 'bk10']
    const icons = [
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/idea.png',
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-comm.png'
    ]
    return `<div _ngcontent-sc621="" class="card pt-2 ${bgClasses[index]} border-0"><div _ngcontent-sc621="" class="card-body"><img _ngcontent-sc621="" src="${escapeHtml(card.icon || icons[index])}" width="64" height="64" alt="workshop-idea"><h3 _ngcontent-sc621="" class="py-2 text-white" style="font-size: 22px; font-weight: 700;">${escapeHtml(card.title || '')}</h3><p _ngcontent-sc621="" class="cef text-white" style="font-size: 16px; font-weight: 400;">${escapeHtml(card.description || '')}</p></div></div>`
  }).join('')
  
  // Replace edge cards section completely
  htmlContent = htmlContent.replace(
    /<div _ngcontent-sc621="" class="card-deck pt-3">[\s\S]*?<\/div><div _ngcontent-sc621="" class="card-deck pt-3 mb-0">[\s\S]*?<\/div><\/div><div _ngcontent-sc621="" class="mx-auto pt-5 text-center">/,
    `<div _ngcontent-sc621="" class="card-deck pt-3">${firstTwoCards}</div><div _ngcontent-sc621="" class="card-deck pt-3 mb-0">${lastTwoCards}</div></div><div _ngcontent-sc621="" class="mx-auto pt-5 text-center">`
  )
  
  // Replace benefits heading
  htmlContent = htmlContent.replace(
    /<h2 _ngcontent-sc621="" class="pt-4 pb-2 text-center">Benefits of Using AngularJS for Web Application Development<\/h2>/,
    `<h2 _ngcontent-sc621="" class="pt-4 pb-2 text-center">${escapeHtml(content.benefits?.heading || 'Benefits of Using AngularJS for Web Application Development')}</h2>`
  )
  
  // Replace benefits list
  const benefitsList = (content.benefits?.benefits_list || []).map((benefit: any, index: number) => {
    const ptClasses = ['pt-5', 'pt-4', 'pt-3', 'pt-3', 'pt-2']
    const icons = [
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-better.png',
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-integrate.png',
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-dynamics.png',
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-support.png',
      'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-modular.png'
    ]
    const alts = ['Brand Logo', 'Catalog Designs', 'Social Media Designs', 'Graphics for Websites', 'Advertisement Designs']
    return `<div _ngcontent-sc621="" class="row ${ptClasses[index] || 'pt-2'} mx-auto"><div _ngcontent-sc621="" class="col-md-2 mx-auto"><img _ngcontent-sc621="" width="98" height="98" src="${escapeHtml(benefit.icon || icons[index])}" alt="${alts[index]}" class="img-responsive"></div><div _ngcontent-sc621="" class="col-md-3 mx-auto"><h3 _ngcontent-sc621="" class="py-2 text-left" style="font-size: 24px; line-height: 36px; font-weight: 500;">${escapeHtml(benefit.title || '')}</h3></div><div _ngcontent-sc621="" class="col-md-6 mx-auto"><p _ngcontent-sc621="" style="font-weight: 500;">${escapeHtml(benefit.description || '')}</p></div></div>`
  }).join('')
  
  htmlContent = htmlContent.replace(
    /<div _ngcontent-sc621=""><div _ngcontent-sc621="" class="row pt-5 mx-auto">([\s\S]*?)<\/div><\/div><\/div><br _ngcontent-sc621=""><br _ngcontent-sc621=""><div _ngcontent-sc621="" class="container py-5">/,
    `<div _ngcontent-sc621="">${benefitsList}</div></div><br _ngcontent-sc621=""><br _ngcontent-sc621=""><div _ngcontent-sc621="" class="container py-5">`
  )
  
  // Replace testimonials
  const testimonials = (content.testimonials?.testimonials_list || []).map((testimonial: any) => 
    `<div _ngcontent-sc621="" class="col-md-4"><div _ngcontent-sc621="" class="card h-100 rounded-3 bs-cmo-card-body"><div _ngcontent-sc621="" class="card-body d-flex flex-column"><p _ngcontent-sc621="" class="card-text text-muted" style="font-weight: 500;">"${escapeHtml(testimonial.quote || '')}"</p><h4 _ngcontent-sc621="" class="card-title bs-cmo-card-title mt-auto"><b _ngcontent-sc621="">${escapeHtml(testimonial.author || '')}</b></h4></div></div></div>`
  ).join('')
  
  htmlContent = htmlContent.replace(
    /<div _ngcontent-sc621="" class="row pt-3"><div _ngcontent-sc621="" class="col-md-4">([\s\S]*?)<\/div><\/div><br _ngcontent-sc621=""><br _ngcontent-sc621=""><\/div><\/div><div _ngcontent-sc621="" class="container-fluid pt-5 smm-banner-red circle-hide">/,
    `<div _ngcontent-sc621="" class="row pt-3">${testimonials}</div><br _ngcontent-sc621=""><br _ngcontent-sc621=""></div></div><div _ngcontent-sc621="" class="container-fluid pt-5 smm-banner-red circle-hide">`
  )
  
  // Replace contact CTA heading
  htmlContent = htmlContent.replace(
    /<h2 _ngcontent-sc621="" class="text-center text-white">Experience actionable strategies\. Customizable to fit your goals\.<\/h2>/,
    `<h2 _ngcontent-sc621="" class="text-center text-white">${escapeHtml(content.contact_cta?.heading || 'Experience actionable strategies. Customizable to fit your goals.')}</h2>`
  )
  
  // Replace FAQs
  const faqs = (content.faqs?.faqs_list || []).map((faq: any, index: number) => {
    const isFirst = index === 0
    return `<accordion-group _ngcontent-sc621="" heading="${escapeHtml(faq.question || '')}" class="panel ${isFirst ? 'panel-open' : ''}" style="display: block;" _nghost-sc71=""><div _ngcontent-sc71="" class="panel card panel-default"><div _ngcontent-sc71="" role="tab" class="panel-heading card-header panel-enabled"><div _ngcontent-sc71="" class="panel-title"><div _ngcontent-sc71="" role="button" class="accordion-toggle" aria-expanded="${isFirst ? 'true' : 'false'}"><button _ngcontent-sc71="" type="button" class="btn btn-link"> ${escapeHtml(faq.question || '')} </button><!----></div></div></div><div _ngcontent-sc71="" role="tabpanel" class="panel-collapse collapse ${isFirst ? 'in show' : ''}" style="display:${isFirst ? 'block' : 'none'};overflow:;" aria-expanded="${isFirst ? 'true' : 'false'}" aria-hidden="${isFirst ? 'false' : 'true'}"><div _ngcontent-sc71="" class="panel-body card-block card-body"><p _ngcontent-sc621="" class="faq-content p-0">${escapeHtml(faq.answer || '')}</p></div></div></div></accordion-group>`
  }).join('')
  
  htmlContent = htmlContent.replace(
    /<accordion _ngcontent-sc621="" role="tablist" class="panel-group" style="display: block;" aria-multiselectable="true">([\s\S]*?)<\/accordion>/,
    `<accordion _ngcontent-sc621="" role="tablist" class="panel-group" style="display: block;" aria-multiselectable="true">${faqs}</accordion>`
  )
  
  return htmlContent
}

// OLD FUNCTION - keeping for reference but not using
function generateHTMLPageOld(content: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>${escapeHtml(content.page_title || 'Generated Page')}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="https://blr1.digitaloceanspaces.com/brandstory/2018/04/favicon.png" type="image/x-icon">
    
    <!-- Bootstrap 4 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-xOolHFLEh07PJGoPkLv1IbcEPTNtaed2xpHsD9ESMhqIYd0nLMwNLD69Npy4HI+N" crossorigin="anonymous">
    
    <!-- Main App CSS -->
    <link rel="stylesheet" href="https://blr1.digitaloceanspaces.com/brandstory/css/app.css">
    
    <!-- Poppins Font -->
    <link rel="stylesheet" href="https://blr1.digitaloceanspaces.com/brandstory/fonts/poppins_all.css">
    
    <!-- Roboto Font -->
    <link rel="stylesheet" href="https://blr1.digitaloceanspaces.com/brandstory/fonts/roboto_all.css">
    
    <!-- Career Page Styles -->
    <link rel="stylesheet" href="https://blr1.digitaloceanspaces.com/brandstory/assets_bslead/css/career.css">
    
    <!-- Remix Icon CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/2.5.0/remixicon.css" integrity="sha512-resGm4dJ9yO+KlYS15kAuwTd+BYzWuyd581JE3xYgaV6jVT8T25kP8cm/eBxeyhd3MvJS8XjXKLvxwlh7xYw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" integrity="sha384-4LISF5TTJX/fLmGSsOcH37WJ4pDVJq/4hK4xq4xY4U6Q1h4B4N1WU1T7M1h1w==" crossorigin="anonymous" />
    
    <style>
      a.btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        vertical-align: middle;
        text-decoration: none;
      }
      a.btn.txn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .smm-check .d-flex {
        position: relative;
      }
      .smm-check .d-flex.align-items-center {
        align-items: baseline !important;
      }
      .smm-check .d-flex::before {
        content: "" !important;
        display: inline-block !important;
        width: 20px !important;
        height: 20px !important;
        background: url(https://blr1.digitaloceanspaces.com/brandstory/2023/technology/blue-tick.png) no-repeat !important;
        background-size: contain !important;
        margin-right: 10px !important;
        flex-shrink: 0 !important;
      }
      .smm-check::before {
        display: none !important;
      }
      .smm-check h3 {
        margin: 0 !important;
      }
      .smm-check p {
        display: block !important;
        margin-top: 0 !important;
      }
      .accordion-toggle .btn-link,
      .accordion-toggle button.btn-link {
        outline: none !important;
        border: none !important;
        box-shadow: none !important;
      }
      .accordion-toggle .btn-link:focus,
      .accordion-toggle button.btn-link:focus,
      .accordion-toggle .btn-link:active,
      .accordion-toggle button.btn-link:active {
        outline: none !important;
        border: none !important;
        box-shadow: none !important;
      }
      @media (max-width: 768px) {
        .accordion-toggle .btn-link,
        .accordion-toggle button.btn-link {
          text-align: left !important;
        }
        .faq-content,
        .panel-body {
          text-align: left !important;
        }
        .vc_gitem-zone-imgnew {
          width: calc(50% - 10px) !important;
          max-width: calc(50% - 10px) !important;
          margin: 5px !important;
        }
      }
      .panel-collapse.collapse.show,
      .panel-collapse.collapse.in {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        height: auto !important;
      }
      .panel-collapse.collapse:not(.show):not(.in) {
        display: none !important;
      }
      .panel-body {
        display: block !important;
        visibility: visible !important;
      }
    </style>
</head>
<body class="ng-tns-0-0">
    <app-root _nghost-sc76="" ng-version="12.2.17"><router-outlet _ngcontent-sc76=""></router-outlet><app-angular-development-company _nghost-sc621=""><div _ngcontent-sc621="" class="container-fluid smm-banner-red"><div _ngcontent-sc621="" class="container"><div _ngcontent-sc621="" class="banner-space-init"></div><div _ngcontent-sc621="" class="row pt-5 mx-auto"><div _ngcontent-sc621="" class="col-md-7 my-auto"><h1 _ngcontent-sc621="" class="seo-banner-head"><span _ngcontent-sc621="" class="bs-text-white">${escapeHtml(content.banner?.title || '')}</span></h1><p _ngcontent-sc621="" class="text-white pt-2 cen" style="font-size: 18px; font-weight: 300;">${escapeHtml(content.banner?.description || '')}</p><a _ngcontent-sc621="" href="${escapeHtml(content.banner?.cta_link || 'https://brandstory.in/contact-us/')}" class="btn txn btn-primary text-center border-0">${escapeHtml(content.banner?.cta_text || 'Explore more')}</a></div><div _ngcontent-sc621="" class="col-md-5 btop"><img _ngcontent-sc621="" src="${escapeHtml(content.banner?.image || 'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-banner.png')}" alt="Banner" class="img-fluid"></div></div><br _ngcontent-sc621=""><br _ngcontent-sc621=""></div></div>
    
<div _ngcontent-sc621="" class="container-fluid pt-5 smm-banner-red1"><div _ngcontent-sc621="" class="row"><div _ngcontent-sc621="" class="col-md-6" style="margin-bottom: 50px;"><img _ngcontent-sc621="" src="${escapeHtml(content.intro?.image || 'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-dev.png')}" alt="conference" class="img-fluid" style="margin-left: -30px;"></div><div _ngcontent-sc621="" class="col-md-6 pt-5"><h3 _ngcontent-sc621="" class="need-head" style="font-weight: 700;">${escapeHtml(content.intro?.heading || '')}</h3>${(content.intro?.paragraphs || []).map((para: string) => `<p _ngcontent-sc621="" class="pt-2" style="font-weight: 500;">${escapeHtml(para)}</p>`).join('')}<p _ngcontent-sc621="" style="color: #845EF7; font-weight: 500; text-decoration: underline; text-decoration-color: #845EF7;"><a _ngcontent-sc621="" href="https://brandstory.in/contact-us/">${escapeHtml(content.intro?.cta_text || "Let's build your next project!")}</a></p></div></div></div>
    
<div _ngcontent-sc621="" class="container py-5"><h2 _ngcontent-sc621="" class="text-center">${escapeHtml(content.services?.heading || 'Our Services')}</h2><div _ngcontent-sc621="" class="row pt-3">${(content.services?.services_list || []).slice(0, 3).map((service: any) => `<div _ngcontent-sc621="" class="col-md-4 d-flex"><div _ngcontent-sc621="" class="card pt-2 bk border-0 flex-fill"><div _ngcontent-sc621="" class="card-body"><img _ngcontent-sc621="" src="${escapeHtml(service.icon || 'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/angularjs.png')}" width="82" height="82" alt="expertize" style="margin-bottom: 10px;"><h3 _ngcontent-sc621="" class="py-2 pt-2" style="font-size: 20px; font-weight: 600;">${escapeHtml(service.title || '')}</h3><p _ngcontent-sc621="" class="cef" style="font-weight: 500;">${escapeHtml(service.description || '')}</p></div></div></div>`).join('')}</div><div _ngcontent-sc621="" class="row pt-3">${(content.services?.services_list || []).slice(3, 5).map((service: any) => `<div _ngcontent-sc621="" class="col-md-4 d-flex flex-fill"><div _ngcontent-sc621="" class="card pt-2 bk border-0"><div _ngcontent-sc621="" class="card-body"><img _ngcontent-sc621="" src="${escapeHtml(service.icon || 'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-uiux.png')}" width="82" height="82" alt="market-understanding" style="margin-bottom: 10px;"><h3 _ngcontent-sc621="" class="py-2 pt-2" style="font-size: 20px; font-weight: 600;">${escapeHtml(service.title || '')}</h3><p _ngcontent-sc621="" class="cef" style="font-weight: 500;">${escapeHtml(service.description || '')}</p></div></div></div>`).join('')}<div _ngcontent-sc621="" class="col-md-4 d-flex"><div _ngcontent-sc621="" class="card pt-5 smm-banner-red2 text-center flex-fill"><div _ngcontent-sc621="" class="card-body d-flex flex-column align-items-center text-center"><h3 _ngcontent-sc621="" style="font-size: 22px; color: white; margin-top: 10px; font-weight: 700;">${escapeHtml(content.services?.cta_title || 'Expert AngularJS Developers Tailoring Success for Your Business')}</h3><br _ngcontent-sc621=""><a _ngcontent-sc621="" href="https://brandstory.in/contact-us/" class="btn txn btn-primary text-center border-0">Explore more</a></div></div></div></div></div>
    
<div _ngcontent-sc621="" class="container py-5 rounded bg-blu"><h2 _ngcontent-sc621="" class="text-center mb-5">${escapeHtml(content.why_choose_us?.heading || 'Choose Us For High-Performance & Efficient Angularjs Applications')}</h2><div _ngcontent-sc621="" class="row">${(content.why_choose_us?.benefits || []).map((benefit: any) => `<div _ngcontent-sc621="" class="col-12 col-lg-6 mb-4"><div _ngcontent-sc621="" class="smm-check"><div _ngcontent-sc621="" class="d-flex align-items-center mb-3"><h3 _ngcontent-sc621="" style="font-size: 24px; font-weight: 600; line-height: 38px; margin: 0;">${escapeHtml(benefit.title || '')}</h3></div><p _ngcontent-sc621="" style="font-size: 16px; font-weight: 500;">${escapeHtml(benefit.description || '')}</p></div></div>`).join('')}</div></div><br _ngcontent-sc621=""><br _ngcontent-sc621="">
    
<div _ngcontent-sc621="" class="container-fluid smm-banner-red py-5"><div _ngcontent-sc621="" class="container"><div _ngcontent-sc621="" class="col-md-10 mx-auto text-center"><h2 _ngcontent-sc621="" class="text-white">${escapeHtml(content.edge?.heading || 'Unraveling Our Unmatchable Edge Amongst AngularJS Development Companies in Bangalore')}</h2></div><div _ngcontent-sc621="" class="card-deck pt-3">${(content.edge?.cards || []).slice(0, 2).map((card: any, index: number) => `<div _ngcontent-sc621="" class="card pt-2 ${index === 0 ? 'bk1' : 'bk2'} border-0"><div _ngcontent-sc621="" class="card-body"><img _ngcontent-sc621="" src="${escapeHtml(card.icon || 'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/estimate.png')}" width="64" height="64" alt="expertize"><h3 _ngcontent-sc621="" class="py-2 text-white" style="font-size: 22px; font-weight: 700;">${escapeHtml(card.title || '')}</h3><p _ngcontent-sc621="" class="cef text-white" style="font-size: 16px; font-weight: 400;">${escapeHtml(card.description || '')}</p></div></div>`).join('')}</div><div _ngcontent-sc621="" class="card-deck pt-3 mb-0">${(content.edge?.cards || []).slice(2, 4).map((card: any, index: number) => `<div _ngcontent-sc621="" class="card pt-2 ${index === 0 ? 'bk3' : 'bk10'} border-0"><div _ngcontent-sc621="" class="card-body"><img _ngcontent-sc621="" src="${escapeHtml(card.icon || 'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/idea.png')}" width="64" height="64" alt="workshop-idea"><h3 _ngcontent-sc621="" class="py-2 text-white" style="font-size: 22px; font-weight: 700;">${escapeHtml(card.title || '')}</h3><p _ngcontent-sc621="" class="cef text-white" style="font-size: 16px; font-weight: 400;">${escapeHtml(card.description || '')}</p></div></div>`).join('')}</div></div><div _ngcontent-sc621="" class="mx-auto pt-5 text-center"><a _ngcontent-sc621="" href="https://brandstory.in/contact-us/" class="btn txn btn-primary text-center border-0">Get In Touch</a></div></div><br _ngcontent-sc621=""><br _ngcontent-sc621="">
    
<div _ngcontent-sc621="" class="container bk py-5"><div _ngcontent-sc621="" class="col-md-11 mx-auto"><div _ngcontent-sc621="" class="justify-content-center"><h2 _ngcontent-sc621="" class="pt-4 pb-2 text-center">${escapeHtml(content.benefits?.heading || 'Benefits of Using AngularJS for Web Application Development')}</h2></div></div><div _ngcontent-sc621="">${(content.benefits?.benefits_list || []).map((benefit: any, index: number) => {
  const ptClass = index === 0 ? 'pt-5' : index === 1 ? 'pt-4' : index === 2 ? 'pt-3' : index === 3 ? 'pt-3' : 'pt-2'
  const altText = index === 0 ? 'Brand Logo' : index === 1 ? 'Catalog Designs' : index === 2 ? 'Social Media Designs' : index === 3 ? 'Graphics for Websites' : 'Advertisement Designs'
  return `<div _ngcontent-sc621="" class="row ${ptClass} mx-auto"><div _ngcontent-sc621="" class="col-md-2 mx-auto"><img _ngcontent-sc621="" width="98" height="98" src="${escapeHtml(benefit.icon || 'https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-better.png')}" alt="${altText}" class="img-responsive"></div><div _ngcontent-sc621="" class="col-md-3 mx-auto"><h3 _ngcontent-sc621="" class="py-2 text-left" style="font-size: 24px; line-height: 36px; font-weight: 500;">${escapeHtml(benefit.title || '')}</h3></div><div _ngcontent-sc621="" class="col-md-6 mx-auto"><p _ngcontent-sc621="" style="font-weight: 500;">${escapeHtml(benefit.description || '')}</p></div></div>`
}).join('')}</div></div><br _ngcontent-sc621=""><br _ngcontent-sc621="">
    
<div _ngcontent-sc621="" class="container py-5"><div _ngcontent-sc621="" class="clients text-center"><div _ngcontent-sc621="" class="uvc-heading-spacer line_only" style="margin-bottom: 12px; height: 2px;"><span _ngcontent-sc621="" class="uvc-headings-line" style="border-style: solid; border-bottom-width: 2px; border-color: rgb(218, 31, 38); width: 30px; margin: 0px auto;"></span></div><h3 _ngcontent-sc621="" class="clients-heading-clone">CLIENTS</h3><h3 _ngcontent-sc621="" class="clients-heading">THE GREATEST</h3></div><div _ngcontent-sc621="" class="row pt-2 margin_t7"><div _ngcontent-sc621="" class="pt-5 col-md-12 text-center">${Array.from({ length: 24 }, (_, i) => {
  const brandNames = ['whitegold', 'brand_1', 'brand_3', 'brand_4', 'brand_5', 'brand_6', 'brand_7', 'brand_8', 'brand_9', 'brand_10', 'brand_11', 'brand_12', 'brand_13', 'brand_14', 'brand_15', 'brand_16', 'brand_17', 'brand_18', 'brand_19', 'brand_20', 'brand_21', 'brand_22', 'brand_23', 'brand_24']
  const brandIndex = i % brandNames.length
  const brandName = brandNames[brandIndex]
  const altTexts = ['whitegold', 'Internet Marketing Company', 'Digital Marketing Consultant', 'Digital Marketing Firms', 'marketing agency', 'digital agency', 'digital marketing agencies/Companies', 'online marketing companies', 'online marketing company', 'Best Digital Media Agencies', 'top digital marketing agencies', 'Best Digital Marketing Services', 'best performance marketing agencies', 'Digital Marketing Companies in India', 'Digital Marketing Company in India', 'Digital Marketing Agency in India', 'Digital Marketing Services in India', 'Online Marketing Companies in India', 'Best Digital Marketing Companies in India', 'Top Digital Marketing Agencies in India', 'Best Digital Marketing Agency in India', 'Digital Marketing Services in India', 'Indian Digital Marketing Companies', 'Indian Digital Marketing Agency']
  const altText = altTexts[brandIndex] || 'Digital Marketing Companies'
  return `<img _ngcontent-sc621="" lazyload="https://blr1.digitaloceanspaces.com/brandstory/images/homePage_brands/${brandName}.png" defaultimage="https://blr1.digitaloceanspaces.com/brandstory/images/homePage_brands/${brandName}.png" alt="${altText}" title="Digital Marketing Companies" class="vc_gitem-zone-imgnew">`
}).join('')}</div></div></div>
    
<div _ngcontent-sc621="" class="container-fluid bg-col p-0"><div _ngcontent-sc621="" class="container py-5"><h3 _ngcontent-sc621="" class="text-left">Client Testimonials </h3><div _ngcontent-sc621="" class="row pt-3">${(content.testimonials?.testimonials_list || []).map((testimonial: any) => `<div _ngcontent-sc621="" class="col-md-4"><div _ngcontent-sc621="" class="card h-100 rounded-3 bs-cmo-card-body"><div _ngcontent-sc621="" class="card-body d-flex flex-column"><p _ngcontent-sc621="" class="card-text text-muted" style="font-weight: 500;">"${escapeHtml(testimonial.quote || '')}"</p><h4 _ngcontent-sc621="" class="card-title bs-cmo-card-title mt-auto"><b _ngcontent-sc621="">${escapeHtml(testimonial.author || '')}</b></h4></div></div></div>`).join('')}</div><br _ngcontent-sc621=""><br _ngcontent-sc621=""></div></div>
    
<div _ngcontent-sc621="" class="container-fluid pt-5 smm-banner-red circle-hide"><div _ngcontent-sc621="" class="container"><h2 _ngcontent-sc621="" class="text-center text-white">${escapeHtml(content.contact_cta?.heading || 'Experience actionable strategies. Customizable to fit your goals.')}</h2><div _ngcontent-sc621="" class="text-center text-center pb-5 mb-5 mt-4"><button _ngcontent-sc621="" class="btn2 btn-swiper"><a _ngcontent-sc621="" href="https://brandstory.in/contact-us/" style="color: black;">Contact Us</a></button></div><img _ngcontent-sc621="" src="https://blr1.digitaloceanspaces.com/brandstory/2023/video-production/contact.png" alt="contact" class="col-container pt-5"></div></div>
    
<div _ngcontent-sc621="" class="container py-5"><div _ngcontent-sc621="" class="clients text-center"><div _ngcontent-sc621="" class="uvc-heading-spacer line_only" style="margin-bottom: 12px; height: 2px;"><span _ngcontent-sc621="" class="uvc-headings-line" style="border-style: solid; border-bottom-width: 2px; border-color: rgb(218, 31, 38); width: 30px; margin: 0px auto;"></span></div><h3 _ngcontent-sc621="" class="clients-heading-clone">FAQs</h3><h3 _ngcontent-sc621="" class="clients-heading">QUESTIONS</h3><br _ngcontent-sc621=""><br _ngcontent-sc621=""></div><div _ngcontent-sc621="" class="faq"><accordion _ngcontent-sc621="" role="tablist" class="panel-group" style="display: block;" aria-multiselectable="true">${(content.faqs?.faqs_list || []).map((faq: any, index: number) => {
  const isFirst = index === 0
  return `<accordion-group _ngcontent-sc621="" heading="${escapeHtml(faq.question || '')}" class="panel ${isFirst ? 'panel-open' : ''}" style="display: block;" _nghost-sc71=""><div _ngcontent-sc71="" class="panel card panel-default"><div _ngcontent-sc71="" role="tab" class="panel-heading card-header panel-enabled"><div _ngcontent-sc71="" class="panel-title"><div _ngcontent-sc71="" role="button" class="accordion-toggle" aria-expanded="${isFirst ? 'true' : 'false'}"><button _ngcontent-sc71="" type="button" class="btn btn-link"> ${escapeHtml(faq.question || '')} </button><!----></div></div></div><div _ngcontent-sc71="" role="tabpanel" class="panel-collapse collapse ${isFirst ? 'in show' : ''}" style="display:${isFirst ? 'block' : 'none'};overflow:;" aria-expanded="${isFirst ? 'true' : 'false'}" aria-hidden="${isFirst ? 'false' : 'true'}"><div _ngcontent-sc71="" class="panel-body card-block card-body"><p _ngcontent-sc621="" class="faq-content p-0">${escapeHtml(faq.answer || '')}</p></div></div></div></accordion-group>`
}).join('')}</accordion></div></div><br _ngcontent-sc621=""><br _ngcontent-sc621=""><div _ngcontent-sc621="" class="col-sm-8"><!----></div></app-angular-development-company></app-root>
    
    <!-- Bootstrap 4 JS (compatible with Angular) -->
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-Fy6S3B9q64WdZWQUiU+q4/2Lc9npb8tCaSX9FK7E8HnRr0Jz8D6OP9dO5Vg3Q9ct" crossorigin="anonymous"></script>
    
    <script src="https://brandstory.in/runtime-es2015.fb2a1dd67f168b55c2ea.js" type="module"></script><script src="https://brandstory.in/runtime-es5.fb2a1dd67f168b55c2ea.js" nomodule="" defer=""></script><script src="https://brandstory.in/polyfills-es5.9b348caa68107674da0f.js" nomodule="" defer=""></script><script src="https://brandstory.in/polyfills-es2015.fad36233b3ac84537bbb.js" type="module"></script><script src="https://brandstory.in/scripts.bfb8b7192841abfac751.js" defer=""></script><script src="https://brandstory.in/main-es2015.b54a6790ec3398b75e80.js" type="module"></script><script src="https://brandstory.in/main-es5.b54a6790ec3398b75e80.js" nomodule="" defer=""></script>
    
    <!-- Fix for lazy loading images and FAQ accordion -->
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        // Handle lazy loading images
        const lazyImages = document.querySelectorAll('img[lazyload]');
        lazyImages.forEach(function(img) {
          const lazySrc = img.getAttribute('lazyload');
          const defaultSrc = img.getAttribute('defaultimage');
          if (lazySrc) {
            img.src = lazySrc;
          } else if (defaultSrc) {
            img.src = defaultSrc;
          }
          img.removeAttribute('lazyload');
          img.removeAttribute('defaultimage');
        });
        
        // Initialize FAQ Accordion
        var accordionButtons = document.querySelectorAll('.accordion-toggle button.btn-link, .accordion-toggle .btn-link');
        
        accordionButtons.forEach(function(button) {
          button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var panel = this.closest('accordion-group') || this.closest('.panel');
            if (!panel) return;
            
            var collapse = panel.querySelector('.panel-collapse, .collapse');
            if (!collapse) return;
            
            var isOpen = collapse.style.display === 'block' || 
                        collapse.classList.contains('show') || 
                        collapse.classList.contains('in');
            
            var accordion = panel.closest('accordion') || panel.closest('.panel-group');
            if (accordion) {
              var allPanels = accordion.querySelectorAll('accordion-group, .panel');
              allPanels.forEach(function(otherPanel) {
                if (otherPanel !== panel) {
                  var otherCollapse = otherPanel.querySelector('.panel-collapse, .collapse');
                  var otherButton = otherPanel.querySelector('.accordion-toggle button, .accordion-toggle .btn-link');
                  if (otherCollapse) {
                    otherCollapse.style.display = 'none';
                    otherCollapse.classList.remove('show', 'in');
                    otherCollapse.setAttribute('aria-expanded', 'false');
                    otherCollapse.setAttribute('aria-hidden', 'true');
                  }
                  if (otherButton) {
                    otherButton.setAttribute('aria-expanded', 'false');
                  }
                  otherPanel.classList.remove('panel-open');
                }
              });
            }
            
            if (isOpen) {
              collapse.style.display = 'none';
              collapse.classList.remove('show', 'in');
              collapse.setAttribute('aria-expanded', 'false');
              collapse.setAttribute('aria-hidden', 'true');
              this.setAttribute('aria-expanded', 'false');
              panel.classList.remove('panel-open');
            } else {
              collapse.style.display = 'block';
              collapse.classList.add('show', 'in');
              collapse.setAttribute('aria-expanded', 'true');
              collapse.setAttribute('aria-hidden', 'false');
              this.setAttribute('aria-expanded', 'true');
              panel.classList.add('panel-open');
            }
          });
        });
      });
    </script>
</body>
</html>`
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
    const prompt = `I need you to act like an expert SEO content writer who achieves humanized content with Flesch Kincaid's score between 60 to 70 and also with the Surfer SEO score of 90 and above.

Generate complete content structure for a landing page based on the following user input: "${userInput}"

IMPORTANT: The user input describes the topic/theme of the landing page. Generate ALL content based on this input. Do NOT use generic AngularJS content unless the user input specifically mentions AngularJS.

CRITICAL: Generate ALL sections with EXACT counts. All sections are required:
1. Banner (title, description, cta_text, cta_link, image)
2. Intro (heading, paragraphs array with 2-3 paragraphs, cta_text, image)
3. Services (heading, services_list with EXACTLY 6 services - each with title, description, icon) - The 6th service will be used as CTA card
4. Why Choose Us (heading, benefits array with EXACTLY 6 benefits - each with title, description)
5. Edge (heading, cards array with EXACTLY 4 cards - each with title, description, icon)
6. Benefits (heading, benefits_list with EXACTLY 5 benefits - each with title, description, icon)
7. Testimonials (testimonials_list with 3 testimonials - each with quote, author)
8. Contact CTA (heading)
9. FAQs (faqs_list with EXACTLY 15 FAQs - each with question, answer)

IMPORTANT: 
- Generate ALL sections - do not skip any
- Write detailed, comprehensive descriptions (2-3 sentences minimum)
- Make content rich and informative
- Return ONLY valid JSON, no markdown:

{
  "page_title": "SEO-optimized page title (60 characters max)",
  "banner": {
    "title": "Compelling main headline for the banner section (H1, 50-60 characters)",
    "description": "Banner description paragraph (2-3 sentences, 80-120 words)",
    "cta_text": "Call-to-action button text",
    "cta_link": "https://brandstory.in/contact-us/",
    "image": "https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-banner.png"
  },
  "intro": {
    "heading": "Generate a compelling intro heading based on user input",
    "paragraphs": [
      "Generate first paragraph (2-3 sentences, 80-120 words) based on user input",
      "Generate second paragraph (2-3 sentences, 80-120 words) based on user input"
    ],
    "cta_text": "Let's build your next project!",
    "image": "https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-dev.png"
  },
  "services": {
    "heading": "Our Services",
    "services_list": [
      {
        "title": "Generate a specific service title based on user input - NOT 'Service 1 Title'",
        "description": "Generate detailed service description (2-3 sentences, 60-100 words) explaining what this service is, how it works, and what benefits it provides.",
        "icon": "https://blr1.digitaloceanspaces.com/brandstory/2023/technology/angularjs.png"
      },
      {
        "title": "Generate another specific service title based on user input",
        "description": "Generate detailed service description (2-3 sentences, 60-100 words)",
        "icon": "https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-consult.png"
      },
      {
        "title": "Generate another specific service title based on user input",
        "description": "Generate detailed service description (2-3 sentences, 60-100 words)",
        "icon": "https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-migration.png"
      },
      {
        "title": "Generate another specific service title based on user input",
        "description": "Generate detailed service description (2-3 sentences, 60-100 words)",
        "icon": "https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-uiux.png"
      },
      {
        "title": "Generate another specific service title based on user input",
        "description": "Generate detailed service description (2-3 sentences, 60-100 words)",
        "icon": "https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-enterprise.png"
      },
      {
        "title": "Generate a compelling CTA title for the 6th service card (this will be displayed as CTA card with button)",
        "description": "This will be used as CTA card text",
        "icon": ""
      }
    ],
    "cta_title": "Expert Developers Tailoring Success for Your Business"
  },
  "why_choose_us": {
    "heading": "Choose Us For High-Performance & Efficient Applications",
    "benefits": [
      {
        "title": "Generate a specific benefit title based on user input - NOT 'Benefit 1 Title'",
        "description": "Generate detailed description (2-3 sentences, 60-100 words) describing this specific benefit, explaining what it is, how it helps, and why it matters."
      },
      {
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (2-3 sentences, 60-100 words)"
      },
      {
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (2-3 sentences, 60-100 words)"
      },
      {
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (2-3 sentences, 60-100 words)"
      },
      {
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (2-3 sentences, 60-100 words)"
      },
      {
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (2-3 sentences, 60-100 words)"
      }
    ]
  },
  "edge": {
    "heading": "Unraveling Our Unmatchable Edge",
    "cards": [
      {
        "title": "Generate a specific edge card title based on user input - NOT 'Card 1 Title'",
        "description": "Generate detailed description (2-3 sentences, 60-100 words) explaining this edge/advantage.",
        "icon": "https://blr1.digitaloceanspaces.com/brandstory/2023/technology/estimate.png"
      },
      {
        "title": "Generate another specific edge card title based on user input",
        "description": "Generate detailed description (2-3 sentences, 60-100 words)",
        "icon": "https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-code.png"
      },
      {
        "title": "Generate another specific edge card title based on user input",
        "description": "Generate detailed description (2-3 sentences, 60-100 words)",
        "icon": "https://blr1.digitaloceanspaces.com/brandstory/2023/technology/idea.png"
      },
      {
        "title": "Generate another specific edge card title based on user input",
        "description": "Generate detailed description (2-3 sentences, 60-100 words)",
        "icon": "https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-comm.png"
      }
    ]
  },
  "benefits": {
    "heading": "Benefits of Using Our Services",
    "benefits_list": [
      {
        "title": "Generate a specific benefit title based on user input - NOT 'Benefit 1 Title'",
        "description": "Generate detailed description (2-3 sentences, 60-100 words) explaining this benefit.",
        "icon": "https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-better.png"
      },
      {
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (2-3 sentences, 60-100 words)",
        "icon": "https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-integrate.png"
      },
      {
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (2-3 sentences, 60-100 words)",
        "icon": "https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-dynamics.png"
      },
      {
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (2-3 sentences, 60-100 words)",
        "icon": "https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-support.png"
      },
      {
        "title": "Generate another specific benefit title based on user input",
        "description": "Generate detailed description (2-3 sentences, 60-100 words)",
        "icon": "https://blr1.digitaloceanspaces.com/brandstory/2023/technology/ng-modular.png"
      }
    ]
  },
  "testimonials": {
    "testimonials_list": [
      {
        "quote": "Generate a realistic testimonial quote (2-3 sentences, 60-100 words) related to user input topic. Make it sound like a real customer review with specific results and experiences.",
        "author": "Generate a realistic author name - NOT 'Author Name'. Format like 'John Smith' or 'Sarah Johnson'"
      },
      {
        "quote": "Generate another realistic testimonial quote (2-3 sentences, 60-100 words) related to user input.",
        "author": "Generate another realistic author name"
      },
      {
        "quote": "Generate another realistic testimonial quote (2-3 sentences, 60-100 words) related to user input.",
        "author": "Generate another realistic author name"
      }
    ]
  },
  "contact_cta": {
    "heading": "Experience actionable strategies. Customizable to fit your goals."
  },
  "faqs": {
    "faqs_list": [
      {
        "question": "Generate a realistic FAQ question based on user input - NOT 'FAQ Question 1?'. Make it a question customers would actually ask about the topic.",
        "answer": "Generate detailed FAQ answer (2-3 sentences, 60-100 words) based on user input - NOT 'FAQ Answer 1'. Provide comprehensive, helpful information that directly answers the question."
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (2-3 sentences, 60-100 words) based on user input."
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (2-3 sentences, 60-100 words) based on user input."
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (2-3 sentences, 60-100 words) based on user input."
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (2-3 sentences, 60-100 words) based on user input."
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (2-3 sentences, 60-100 words) based on user input."
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (2-3 sentences, 60-100 words) based on user input."
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (2-3 sentences, 60-100 words) based on user input."
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (2-3 sentences, 60-100 words) based on user input."
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (2-3 sentences, 60-100 words) based on user input."
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (2-3 sentences, 60-100 words) based on user input."
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (2-3 sentences, 60-100 words) based on user input."
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (2-3 sentences, 60-100 words) based on user input."
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (2-3 sentences, 60-100 words) based on user input."
      },
      {
        "question": "Generate another realistic FAQ question based on user input",
        "answer": "Generate detailed FAQ answer (2-3 sentences, 60-100 words) based on user input."
      }
    ]
  }
}

CRITICAL REQUIREMENTS:
- THE USER INPUT IS: "${userInput}" - ALL content MUST be generated based on this specific input
- Generate ALL content sections based EXCLUSIVELY on the user input: "${userInput}"
- Fill EVERY field with real, specific content related to "${userInput}" - NO placeholders, NO generic content
- If user input is about "React development", generate React content. If it's about "Vue.js services", generate Vue.js content. If it's about "Python development", generate Python content. ALWAYS match the user's input topic.
- EXACT counts required: 6 services (6th will be CTA card), 6 why_choose_us benefits, 4 edge cards, 5 benefits, 3 testimonials, 15 FAQs
- All content must be specific to the user's input topic: "${userInput}"
- Use SEO keywords from the user input naturally throughout
- Write in professional, conversion-focused tone
- Descriptions should be 2-3 sentences (60-100 words minimum) - make content rich and detailed
- Return ONLY valid JSON, no markdown, no code blocks
- Generate complete content - do not leave any section empty
- DO NOT use generic AngularJS content unless the user input specifically mentions AngularJS
- IMPORTANT: Services section needs EXACTLY 6 services. The 6th service title will be used as CTA card heading`

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
              content: 'You are a person. A real human being. You are an expert SEO content writer who writes exactly like a human would write - naturally, conversationally, with imperfections and personality. Achieve Flesch Kincaid\'s score between 60 to 70 and Surfer SEO score of 90 and above. Write as a real person, not as an AI. Always return valid JSON format with ALL sections filled based on the user input. Never use placeholder text or generic examples.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.9,
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
      
      // Try to fix truncated JSON if needed
      if (!jsonString.trim().endsWith('}')) {
        console.warn('⚠ JSON appears truncated, attempting to fix...')
        // Remove trailing comma and close structures
        jsonString = jsonString.replace(/,\s*$/, '')
        const openBraces = (jsonString.match(/{/g) || []).length - (jsonString.match(/}/g) || []).length
        for (let i = 0; i < openBraces; i++) jsonString += '}'
      }
      
      contentData = JSON.parse(jsonString)
      console.log('Received content data keys:', Object.keys(contentData))
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError)
      console.error('Response content (first 1000 chars):', responseContent.substring(0, 1000))
      throw new Error(`Failed to parse content from API response: ${parseError.message}. Please try again.`)
    }

    // Validate required sections
    const requiredSections = ['banner', 'intro', 'services', 'why_choose_us', 'edge', 'benefits', 'testimonials', 'contact_cta', 'faqs']
    const missingSections = requiredSections.filter(section => !contentData[section])
    
    if (missingSections.length > 0) {
      console.warn(`Warning: Missing sections: ${missingSections.join(', ')}`)
    }

    // Generate HTML
    const htmlContent = generateHTMLPage(contentData)

    // Create ZIP file with HTML only (no assets folder)
    const archive = archiver('zip', { zlib: { level: 9 } })
    const chunks: Buffer[] = []

    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })

    // Add HTML file only
    archive.append(htmlContent, { name: 'index.html' })

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
        'Content-Disposition': `attachment; filename="generated-page-${Date.now()}.zip"`,
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

