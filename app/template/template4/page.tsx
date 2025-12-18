'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function Template4() {
  useEffect(() => {
    // Add CSS links
    const links = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap' },
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css' },
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css' },
      { rel: 'stylesheet', href: 'https://brandstory.in/pr-agency-in-bangalore/assets/css/bootstrap.min.css' },
      { rel: 'stylesheet', href: 'https://brandstory.in/pr-agency-in-bangalore/assets/css/menu.css?key=1765973977' },
      { rel: 'stylesheet', href: 'https://brandstory.in/pr-agency-in-bangalore/assets/css/global.css?key=1765973977' },
      { rel: 'stylesheet', href: 'https://brandstory.in/pr-agency-in-bangalore/assets/css/style.css?key=1765973977' },
      { rel: 'stylesheet', href: 'https://brandstory.in/pr-agency-in-bangalore/assets/css/mystyle.css?key=1765973977' },
      { rel: 'stylesheet', href: 'https://unpkg.com/aos@2.3.1/dist/aos.css' },
    ]

    links.forEach(linkData => {
      const existingLink = document.querySelector(`link[href="${linkData.href}"]`)
      if (!existingLink) {
        const link = document.createElement('link')
        Object.entries(linkData).forEach(([key, value]) => {
          if (key === 'crossOrigin') {
            link.setAttribute('crossorigin', value as string)
          } else {
            link.setAttribute(key, value as string)
          }
        })
        document.head.appendChild(link)
      }
    })

    // Add custom styles
    const style = document.createElement('style')
    style.id = 'template4-custom-styles'
    style.textContent = `
      .blog-form-main select.budget {
        width: 210px;
        padding: 8px 35px 8px 8px;
        border: 1px solid #ccc;
        border-radius: 12px;
        box-sizing: border-box;
      }
      .multiselect {
        position: relative;
        width: 100%;
      }
      .multiselect-btn {
        width: 100%;
        padding: 8px 35px 8px 8px;
        border: 1px solid #ccc;
        border-radius: 12px;
        background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='none' stroke='%23000' stroke-width='1.5' d='M1 1l4 4 4-4'/%3E%3C/svg%3E") no-repeat right 10px center;
        background-size: 12px auto;
        cursor: pointer;
        box-sizing: border-box;
      }
      .checkbox-list {
        display: none;
        position: absolute;
        width: 100%;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 8px;
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
        box-sizing: border-box;
      }
      .checkbox-list label {
        display: block;
        padding: 5px 10px;
        cursor: pointer;
      }
      .checkbox-list label:hover {
        background-color: #f0f0f0;
      }
      body.pr-company-in-blr {
        font-family: 'Hanken Grotesk', sans-serif;
      }
      /* Accordion visibility fixes - only show when expanded */
      .accordion-collapse.show .accordion-body {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .custom-accordion .accordion-collapse.show .accordion-body {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .real-pr-accordion .accordion-collapse.show .accordion-body {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .real-pr-accordion .accordion-collapse.show {
        display: block !important;
      }
      .faq-accordion .accordion-collapse.show .accordion-body {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .faq-accordion .accordion-collapse.show {
        display: block !important;
      }
      .accordion-collapse.show .solution-box {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .accordion-body ul {
        list-style-type: disc !important;
        padding-left: 1.5rem !important;
      }
      .accordion-body ul li {
        list-style-type: disc !important;
        display: list-item !important;
      }
    `
    const existingStyle = document.getElementById('template4-custom-styles')
    if (existingStyle) {
      existingStyle.remove()
    }
    document.head.appendChild(style)

    // Initialize AOS
    const initAOS = () => {
      if (typeof window !== 'undefined' && (window as any).AOS) {
        (window as any).AOS.init({
          duration: 1000,
          once: true
        })
      }
    }

    // Initialize with retry
    const initWithRetry = (retries = 15, delay = 200) => {
      if (typeof window !== 'undefined' && (window as any).AOS) {
        initAOS()
      } else if (retries > 0) {
        setTimeout(() => {
          initWithRetry(retries - 1, delay)
        }, delay)
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initWithRetry()
      })
    } else {
      initWithRetry()
    }

    // Multiselect functions
    const toggleCheckboxList = () => {
      const list = document.getElementById('checkboxList')
      if (list) {
        list.style.display = (list.style.display === 'block') ? 'none' : 'block'
      }
    }

    const updateSelected = () => {
      const checked = Array.from(document.querySelectorAll('#checkboxList input:checked'))
        .map((cb: any) => cb.value)
      const btn = document.querySelector('.multiselect-btn') as HTMLElement
      if (btn) {
        btn.innerText = checked.length ? checked.join(', ') : 'Select services'
      }
    }

    // Attach event listeners
    const multiselectBtn = document.querySelector('.multiselect-btn')
    if (multiselectBtn) {
      multiselectBtn.addEventListener('click', toggleCheckboxList)
    }

    const checkboxes = document.querySelectorAll('#checkboxList input')
    checkboxes.forEach(cb => {
      cb.addEventListener('change', updateSelected)
    })

    document.addEventListener('click', function (e: any) {
      const multiselect = document.querySelector('.multiselect')
      if (multiselect && !multiselect.contains(e.target)) {
        const list = document.getElementById('checkboxList')
        if (list) {
          list.style.display = 'none'
        }
      }
    })

    return () => {
      if (multiselectBtn) {
        multiselectBtn.removeEventListener('click', toggleCheckboxList)
      }
      checkboxes.forEach(cb => {
        cb.removeEventListener('change', updateSelected)
      })
    }
  }, [])

  return (
    <>
      <div className="pr-company-in-blr">
        {/* Hero Banner */}
        <section className="sp-100 pr-banner cus-pr-banner" style={{ fetchPriority: 'high' } as any}>
          <div className="container">
            <div className="row" data-aos="fade-up">
              <div className="col-lg-8 col-12">
                <h1 className="text-white">PR Agency in Bangalore <span className="db">- For the Brands Driving Tomorrow</span></h1>
                <p className="text-start text-white">As a leading public relations agency in Bangalore, we help companies craft, protect, and amplify their story through strategic PR campaigns, digital-first storytelling, and real media relationships that move the needle. Brandstory, a PR agency in Bangalore, actively manages communication, public perception, and brand reputation for businesses. We create and spread positive messages through media coverage, digital PR, event management, strategic communication, and crisis management to build a strong brand image, influence public perception, achieve business goals, and boost overall visibility.</p>
                <div className="my-5" data-aos="fade-up">
                  <a href="https://brandstory.in/contact-us/" className="explore-btn my-4">Talk to Our Strategy Team</a>
                </div>
              </div>
              <div className="col-lg-4 d-lg-block d-none col-12"></div>
            </div>
          </div>
        </section>

        {/* PR Agency Hero Section with Image */}
        <section className="sp-60 bg-white" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="container">
            <div className="row align-items-center justify-content-center">
              {/* Image Column */}
              <div className="col-lg-6 mb-4 mb-lg-0 order-lg-1 order-2" data-aos="fade-up">
                <div className="text-center">
                  <img src="https://brandstory.in/pr-agency-in-bangalore/assets/images/pr-company-in-blr/what-makes-bsd.png" loading="lazy" alt="PR Agency" className="img-fluid rounded-4 shadow" style={{ maxWidth: '100%', height: 'auto' }} />
                </div>
              </div>
              {/* Text Column */}
              <div className="col-lg-6 order-lg-2 order-1" data-aos="fade-up">
                <h2 className="fw-bold mb-3">A <span className="text-violet">Top PR Agency</span> In Bangalore.<br />For Businesses To Build Stories That Travel.</h2>
                <p className="mb-3">In India&apos;s startup capital, reputation isn&apos;t a nice-to-have; it&apos;s a growth lever. Whether you&apos;re building a tech product, scaling a D2C brand, or making waves in fintech or healthcare, what people hear about you often matters as much as what you&apos;re building.</p>
                <p className="mb-3">BrandStory, a top PR agency in Bangalore, covers startup PR to corporate reputation management and product launches to crisis communication. We&apos;re the partner behind the scenes shaping the perception that powers your growth.</p>
                <p className="mb-md-0 mb-4">We understand how quickly your category evolves, how media habits shift, and how crucial it is to get your positioning right from the start. Our job? To ensure your story doesn&apos;t just get told—it gets remembered, trusted, and acted on.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PR Challenges Section */}
        <section className="pr-challenges-section py-3">
          <div className="container">
            <h2 className="fw-bold mb-4 text-center">Solving Real <span className="text-violet">PR Challenges</span> for Brands of Bangalore</h2>
            <div className="row align-items-center">
              <div className="col-lg-7 mb-4 mb-lg-0" data-aos="fade-up">
                <div className="accordion custom-accordion real-pr-accordion" id="prChallengesAccordion">
                  {[
                    {
                      id: 'One',
                      challenge: 'We have a great product, but no one knows about us.',
                      solution: 'BrandStory builds visibility from scratch.',
                      desc: 'We get you in front of the right media, groups, and digital channels with a public relations plan that is just as well thought out as your product roadmap.'
                    },
                    {
                      id: 'Two',
                      challenge: 'We struggle to explain what we do, especially in the media.',
                      solution: 'We turn complexity into clarity.',
                      desc: 'We make your story easier for media, stakeholders, and end users, whether you\'re in the deep tech or direct-to-consumer space, so your message gets through.'
                    },
                    {
                      id: 'Three',
                      challenge: 'We don\'t have media connections or know how to pitch.',
                      solution: 'We bring the network and the know-how.',
                      desc: 'The experts on our team can shape and pitch your story to national and regional newspapers, as well as niche internet platforms.',
                      open: true
                    },
                    {
                      id: 'Four',
                      challenge: 'We need more than PR; we need someone who understands growth.',
                      solution: 'We don\'t do PR in isolation.',
                      desc: 'At BrandStory, your PR integrates with your SEO, digital marketing, and brand strategy, so every mention helps you reach your business goals.'
                    },
                    {
                      id: 'Five',
                      challenge: 'We have great wins, but no one is talking about them.',
                      solution: 'We turn milestones into momentum.',
                      desc: 'We craft news about funding, new products, and relationships as stories that help the market trust and believe us.'
                    },
                    {
                      id: 'six',
                      challenge: 'We\'re worried about handling bad press or online backlash.',
                      solution: 'Our crisis response plans protect your reputation.',
                      desc: 'We help you deal with problems while being open and honest, from planning ahead of time to responding in real time.'
                    },
                    {
                      id: '7',
                      challenge: 'Our founder is building the company, but not their own voice.',
                      solution: 'We build thought leadership strategically.',
                      desc: 'BrandStory assists founders in building a personal brand on their own making their voices authoritative and knowledgeable in their field.'
                    }
                  ].map((item) => (
                    <div key={item.id} className="accordion-item border-0 mb-2">
                      <h2 className="accordion-header" id={`challenge${item.id}`}>
                        <button className={`accordion-button ${item.open ? '' : 'collapsed'} d-flex align-items-center`} type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${item.id}`} aria-expanded={item.open ? 'true' : 'false'} aria-controls={`collapse${item.id}`}>
                          <span className="icon-circle bg-danger me-3"><i className="bi bi-x-lg text-white"></i></span>
                          <span className="fw-semibold">&quot;{item.challenge}&quot;</span>
                        </button>
                      </h2>
                      <div id={`collapse${item.id}`} className={`accordion-collapse collapse ${item.open ? 'show' : ''}`} aria-labelledby={`challenge${item.id}`} data-bs-parent="#prChallengesAccordion">
                        <div className="accordion-body p-0">
                          <div className="solution-box mt-3 mb-2 p-3">
                            <div className="d-flex align-items-center mb-2">
                              <span className="icon-circle bg-success me-2"><i className="bi bi-check-lg text-white"></i></span>
                              <span className="fw-bold text-success">{item.solution}</span>
                            </div>
                            <div className="solution-desc text-muted ps-4">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-5 text-center" data-aos="fade-up">
                <img src="https://brandstory.in/pr-agency-in-bangalore/assets/images/pr-company-in-blr/solv-pr-challenge-sec.png" loading="lazy" alt="PR Challenges Meeting" className="img-fluid rounded-4 shadow mb-4 mb-md-0" style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Strategic PR Services Section */}
        <section className="pr-services-section sp-60" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="container" data-aos="fade-up">
            <h2 className="fw-bold text-center mb-3">Strategic <span className="text-violet">PR Services</span> for Brands Based in Bangalore</h2>
            <p className="text-center mb-4">
              We don&apos;t just chase mentions; we align every bit of the PR Strategy with your business outcomes. We build stories about your brand&apos;s current stage and future goals, whether that&apos;s trust-building, funding visibility, market expansion, or reputation recovery. As a trusted PR services company in Bangalore, we work across formats, audiences, and platforms to get your message right, and get it heard.
            </p>
            <ul className="nav nav-tabs pr-services-tabs justify-content-center mb-4" id="prServicesTab" role="tablist">
              {[
                { label: 'Brand PR', id: 'brand-pr' },
                { label: 'Leadership PR', id: 'leadership-pr' },
                { label: 'Community & Influencer PR', id: 'community-influencer-pr' },
                { label: 'Event PR', id: 'event-pr' },
                { label: 'Crisis PR', id: 'crisis-pr' }
              ].map((tab, idx) => (
                <li key={idx} className="nav-item" role="presentation">
                  <button className={`nav-link ${idx === 0 ? 'active' : ''}`} id={`${tab.id}-tab`} data-bs-toggle="tab" data-bs-target={`#${tab.id}`} type="button" role="tab" aria-controls={tab.id} aria-selected={idx === 0 ? 'true' : 'false'}>{tab.label}</button>
                </li>
              ))}
            </ul>
            <div className="tab-content pr-services-tab-content" id="prServicesTabContent">
              <div className="tab-pane fade show active" id="brand-pr" role="tabpanel" aria-labelledby="brand-pr-tab">
                <div className="row align-items-start g-4">
                  <div className="col-lg-6" data-aos="fade-up">
                    <p>Reputation isn&apos;t a byproduct of your brand&apos;s good work. It&apos;s the outcome of how clearly we communicate it. If people don&apos;t hear your story in the right way, they won&apos;t remember it, or trust it. Our Brand PR service ensures your narrative is clear, relevant, and seen by the people who matter.</p>
                    <ul>
                      <li>Media Relations</li>
                      <li>Digital PR</li>
                      <li>Press Release</li>
                      <li>Launch Campaigns</li>
                      <li>Brand Storytelling</li>
                      <li>Influencer outreach</li>
                    </ul>
                  </div>
                  <div className="col-lg-6 text-center" data-aos="fade-up">
                    <img src="https://brandstory.in/pr-agency-in-bangalore/assets/images/pr-company-in-blr/str-serv-img1.png" loading="lazy" alt="Brand PR" className="img-fluid rounded-4 shadow" style={{ maxWidth: '100%', height: 'auto' }} />
                  </div>
                </div>
              </div>
              <div className="tab-pane fade" id="leadership-pr" role="tabpanel" aria-labelledby="leadership-pr-tab">
                <div className="row align-items-start g-4">
                  <div className="col-lg-6" data-aos="fade-up">
                    <p>People buy into companies, but they trust people first. We help position your leadership team to earn that trust. Our experts work with founders and CXOs to build their visibility and shape public perception around their expertise, opinions, and presence in the market.</p>
                    <ul>
                      <li>Personal Branding</li>
                      <li>Speaker Placements</li>
                      <li>Thought Leadership</li>
                      <li>Crisis Comms for Leaders</li>
                    </ul>
                  </div>
                  <div className="col-lg-6 text-center" data-aos="fade-up">
                    <img src="https://brandstory.in/pr-agency-in-bangalore/assets/images/pr-company-in-blr/str-serv-img2.png" loading="lazy" alt="Leadership PR" className="img-fluid rounded-4 shadow" style={{ maxWidth: '100%', height: 'auto' }} />
                  </div>
                </div>
              </div>
              <div className="tab-pane fade" id="community-influencer-pr" role="tabpanel" aria-labelledby="community-influencer-pr-tab">
                <div className="row align-items-start g-4">
                  <div className="col-lg-6" data-aos="fade-up">
                    <p>Your audience is no longer passive. They listen to voices they trust. We help you connect through them. We help brands engage with the creators, communities, and micro-networks that shape opinions, so your story gets shared from the right sources.</p>
                    <ul>
                      <li>Influencer Collabs</li>
                      <li>Community Engagement</li>
                      <li>Grassroots PR</li>
                      <li>UGC Campaigns</li>
                    </ul>
                  </div>
                  <div className="col-lg-6 text-center" data-aos="fade-up">
                    <img src="https://brandstory.in/pr-agency-in-bangalore/assets/images/pr-company-in-blr/str-serv-img3.png" loading="lazy" alt="Community & Influencer PR" className="img-fluid rounded-4 shadow" style={{ maxWidth: '100%', height: 'auto' }} />
                  </div>
                </div>
              </div>
              <div className="tab-pane fade" id="event-pr" role="tabpanel" aria-labelledby="event-pr-tab">
                <div className="row align-items-start g-4">
                  <div className="col-lg-6" data-aos="fade-up">
                    <p>Events make an impression only if they&apos;re communicated the right way. We handle that from end to end. We build the PR narrative around your key events, ensuring the right people know it&apos;s happening, engage with it live, and keep talking about it after.</p>
                    <ul>
                      <li>Pre-Event Buzz</li>
                      <li>Live Coverage</li>
                      <li>Post-Event PR</li>
                      <li>Viral Moments</li>
                    </ul>
                  </div>
                  <div className="col-lg-6 text-center" data-aos="fade-up">
                    <img src="https://brandstory.in/pr-agency-in-bangalore/assets/images/pr-company-in-blr/str-serv-img4.png" loading="lazy" alt="Event PR" className="img-fluid rounded-4 shadow" style={{ maxWidth: '100%', height: 'auto' }} />
                  </div>
                </div>
              </div>
              <div className="tab-pane fade" id="crisis-pr" role="tabpanel" aria-labelledby="crisis-pr-tab">
                <div className="row align-items-start g-4">
                  <div className="col-lg-6" data-aos="fade-up">
                    <p>When something goes wrong, what you say, and how fast you say it can protect or damage everything. We build crisis communication plans that keep your leadership prepared and your brand trusted, even in high-pressure situations.</p>
                    <ul>
                      <li>Crisis Radar Monitoring</li>
                      <li>War Room Strategy</li>
                      <li>Stakeholder Firewalls</li>
                      <li>Post-Crisis Renaissance</li>
                    </ul>
                  </div>
                  <div className="col-lg-6 text-center" data-aos="fade-up">
                    <img src="https://brandstory.in/pr-agency-in-bangalore/assets/images/pr-company-in-blr/str-serv-img5.png" loading="lazy" alt="Crisis PR" className="img-fluid rounded-4 shadow" style={{ maxWidth: '100%', height: 'auto' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes BrandStory Your Right PR Partner Section */}
        <section className="pr-right-partner-section py-5 bg-black what-makes-bsd-sec">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-12 mb-4" data-aos="fade-up">
                <h2 className="fw-bold mb-2 pr-right-heading">
                  What Makes BrandStory Your Right <br />
                  <span className="text-violet" style={{ color: '#8f5fe8' }}>PR Partner in Bangalore?</span>
                </h2>
                <p className="pr-right-desc" style={{ color: '#d1d1d1', textAlign: 'left', maxWidth: '700px' }}>
                  BrandStory, one of the leading PR agencies in Bangalore, doesn&apos;t just act as your PR team. We plug into your business like a growth partner, building a communication engine that runs across earned media, owned content, and influential voices, without losing sight of your end goal.
                </p>
              </div>
              <div className="col-lg-6 mb-4 mb-lg-0" data-aos="fade-up">
                <img src="https://brandstory.in/pr-agency-in-bangalore/assets/images/pr-company-in-blr/what-makes-bsd.png" loading="lazy" alt="Team Meeting" className="img-fluid rounded-4 shadow" style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
              <div className="col-lg-6" data-aos="fade-up">
                <div className="accordion custom-accordion" id="rightPartnerAccordion">
                  {[
                    {
                      id: 'OneRight',
                      title: 'Sector Intelligence',
                      content: 'We understand the nuances between a Series A SaaS pitch and a consumer lifestyle launch. Our cross-sector experience means we speak your industry\'s language and help others understand it.',
                      open: true
                    },
                    {
                      id: 'TwoRight',
                      title: 'Story Engineering',
                      content: 'We don\'t chase headlines. We engineer stories that create relevance, be it around your technology, your mission, or your market disruption. Everything we create is meant to be part of every format and touchpoint.'
                    },
                    {
                      id: 'ThreeRight',
                      title: 'Media + Digital Synchronization',
                      content: 'Every media pitch, every quote, and every LinkedIn post is made sure to be in alignment with your digital presence, content themes, and brand goals. One voice everywhere it matters.'
                    },
                    {
                      id: 'FourRight',
                      title: 'Bangalore-Rooted. India-Ready.',
                      content: 'We know how this city works. Also, we know how to take your story deep into it. Whether you need national visibility or a regional push, we shape your message to speak clearly across audiences, markets, and languages.'
                    },
                    {
                      id: 'FiveRight',
                      title: 'Transparent Reporting. Real Metrics',
                      content: 'We\'re as accountable as we are creative. You\'ll see what\'s working, what\'s landing, and what needs iteration with regular sentiment reports, media dashboards, and action-linked insights.'
                    }
                  ].map((item) => (
                    <div key={item.id} className="accordion-item mb-2">
                      <h2 className="accordion-header" id={`heading${item.id}`}>
                        <button className={`accordion-button ${item.open ? '' : 'collapsed'}`} type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${item.id}`} aria-expanded={item.open ? 'true' : 'false'} aria-controls={`collapse${item.id}`}>
                          {item.title}
                          <span className="accordion-arrow"></span>
                        </button>
                      </h2>
                      <div id={`collapse${item.id}`} className={`accordion-collapse collapse ${item.open ? 'show' : ''}`} aria-labelledby={`heading${item.id}`} data-bs-parent="#rightPartnerAccordion">
                        <div className="accordion-body">
                          {item.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Industries We Serve Section */}
        <section className="industries-section py-5 bg-light custom-pr-industries">
          <div className="container">
            <h2 className="fw-bold text-center mb-3" style={{ fontSize: '2.1rem', color: '#18171d' }}>
              We Are A Well-Known <span className="text-violet">PR Company</span> Trusted<br />
              Across Industries In Bangalore
            </h2>
            <p className="text-center mb-5 mx-auto" style={{ maxWidth: '1010px', color: '#444' }}>
              Every industry speaks a different language. We make sure your brand communicates with clarity, market relevance, and lasting impact. At BrandStory, we&apos;ve worked closely with businesses across sectors—not just learning what they do, but understanding how their audience thinks, behaves, and makes decisions. Whether you&apos;re building next-gen technology, driving social change, or reshaping lifestyle experiences—we position your story where it matters and to those who matter most.
            </p>
            <div className="industries-grid bg-white rounded-4 p-4 mt-4 shadow-sm">
              <div className="row g-3 justify-content-start">
                {[
                  { icon: 'icon-01.svg', name: 'Advertising' },
                  { icon: 'icon-02.svg', name: 'Automotive' },
                  { icon: 'icon-03.svg', name: 'Defense' },
                  { icon: 'icon-04.svg', name: 'Fashion & Beauty' },
                  { icon: 'icon-05.svg', name: 'Real Estate' },
                  { icon: 'icon-06.svg', name: 'Pharma' },
                  { icon: 'icon-07.svg', name: 'NGO' },
                  { icon: 'icon-08.svg', name: 'Hospitality & Tourism' },
                  { icon: 'icon-09.svg', name: 'Energy' },
                  { icon: 'icon-10.svg', name: 'Startups' },
                  { icon: 'icon-11.svg', name: 'Health' },
                  { icon: 'icon-12.svg', name: 'Architecture & Interior Design' },
                  { icon: 'icon-13.svg', name: 'Education' },
                  { icon: 'icon-14.svg', name: 'Sustainability' },
                  { icon: 'icon-15.svg', name: 'Wellness' },
                  { icon: 'icon-16.svg', name: 'Consumer Products' },
                  { icon: 'icon-17.svg', name: 'Technology & AI' },
                  { icon: 'icon-18.svg', name: 'Food & Beverage' }
                ].map((industry, idx) => (
                  <div key={idx} className="col-6 col-md-3 d-flex align-items-center mb-3">
                    <img src={`https://brandstory.in/pr-agency-in-bangalore/assets/images/pr-company-in-blr/${industry.icon}`} loading="lazy" alt={industry.name} className="me-2 me-md-3" width="38" height="38" />
                    <p className="mb-0 fw-600 fs-20">{industry.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section py-5 faq-pr-sec">
          <div className="container">
            <h2 className="fw-bold text-center mb-4">Frequently Asked Questions</h2>
            <div className="accordion faq-accordion" id="faqAccordion">
              {[
                {
                  id: 'One',
                  question: 'As a PR agency, what kind of brands does BrandStory work with for its clients?',
                  answer: 'We work with early-stage startups, established enterprises, and high-growth consumer brands. Whether you\'re launching a new product, building your founder\'s reputation, or scaling visibility across India, our PR services in Bangalore are designed to support ambitious growth at every stage.',
                  open: true
                },
                {
                  id: 'Two',
                  question: 'What makes BrandStory a preferred PR agency in Bangalore?',
                  answer: 'Unlike many firms that focus only on media placements, we function as a strategic partner. As a PR agency in Bangalore, we combine editorial storytelling, digital amplification, influencer engagement, and reputation management—so your communication efforts lead to real business outcomes.'
                },
                {
                  id: 'Three',
                  question: 'Are your PR services limited to Bangalore-based markets?',
                  answer: 'No. While we are a PR company based in Bangalore, our work spans national and international markets. We help brands headquartered in Bangalore gain visibility across Tier-1 Indian cities, regional media, and even global platforms—depending on the communication goals.'
                },
                {
                  id: 'Four',
                  question: 'How do you measure the success of a PR campaign?',
                  answer: 'We look beyond vanity metrics. Our success benchmarks include quality of media, brand sentiment, digital impact, leadership visibility, and long-term recall. As a performance-led PR company in Bangalore, we deliver detailed campaign reports that connect PR outcomes to your business KPIs.'
                },
                {
                  id: 'Five',
                  question: 'Can you support leadership profiling and founder visibility?',
                  answer: 'Absolutely. Our PR services in Bangalore include positioning founders and CXOs through authored articles, interviews, podcasts, keynote placements, and more. We build executive presence in a way that complements the brand\'s credibility and voice.'
                },
                {
                  id: 'Six',
                  question: 'Do you provide crisis communication and reputation repair services?',
                  answer: 'Yes. As a seasoned PR agency in Bangalore, we help brands manage crises through early detection, clear messaging, media control, and stakeholder communication. We also support post-crisis recovery by reframing your narrative and rebuilding public trust.'
                },
                {
                  id: 'Seven',
                  question: 'Do you handle influencer PR and content-driven campaigns?',
                  answer: 'Yes. We integrate influencer engagement into our strategy when it aligns with your audience and brand goals. Our PR services in Bangalore include everything from curated influencer partnerships to community-led storytelling and user-generated content strategies.'
                },
                {
                  id: 'Eight',
                  question: 'How is BrandStory different from other PR companies in Bangalore?',
                  answer: 'We combine brand strategy, digital expertise, and media intelligence. Unlike traditional PR companies in Bangalore, we don\'t just chase mentions—we build a structured communication layer around your business goals, customer journey, and leadership voice.'
                }
              ].map((faq) => (
                <div key={faq.id} className="accordion-item mb-2">
                  <h2 className="accordion-header" id={`faqHeading${faq.id}`}>
                    <button className={`accordion-button ${faq.open ? '' : 'collapsed'}`} type="button" data-bs-toggle="collapse" data-bs-target={`#faqCollapse${faq.id}`} aria-expanded={faq.open ? 'true' : 'false'} aria-controls={`faqCollapse${faq.id}`} style={{ fontWeight: 600 }}>
                      {faq.question}
                    </button>
                  </h2>
                  <div id={`faqCollapse${faq.id}`} className={`accordion-collapse collapse ${faq.open ? 'show' : ''}`} aria-labelledby={`faqHeading${faq.id}`} data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="spt-60 bg-black" style={{ paddingTop: '3rem' }}>
          <div className="container">
            <h2 className="text-white mb-3 text-center mb-4">Experience actionable strategies. Customizable to fit your goals.</h2>
            <div className="goalsbtn d-flex justify-content-center mb-5">
              <a className="text-black bg-white text-decoration-none px-4 py-2 rounded-pill" href="https://brandstory.in/contact-us/">Contact Us</a>
            </div>
            <div className="row">
              <div className="col-md-4 col-4 text-center"><img className="w-90 image-fluid" src="https://brandstory.in/pr-agency-in-bangalore/assets/images/real-estate-video-production-company/call-semi.svg" alt="pr agency in bangalore" /></div>
              <div className="col-md-4 col-4 text-center"><img className="w-90 image-fluid" src="https://brandstory.in/pr-agency-in-bangalore/assets/images/real-estate-video-production-company/mail-semi.svg" alt="best pr agency in bangalore" /></div>
              <div className="col-md-4 col-4 text-center"><img className="w-90 image-fluid" src="https://brandstory.in/pr-agency-in-bangalore/assets/images/real-estate-video-production-company/c-semi.svg" loading="lazy" alt="pr firms in bangalore" /></div>
            </div>
          </div>
        </section>
      </div>

      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js"
        strategy="afterInteractive"
        integrity="sha384-k6d4wzSIapyDyv1kpU366/PK5hCdSbCRGRCMv+eplOQJWyd1fbcAu9OCUj5zNLiq"
        crossOrigin="anonymous"
      />
      <Script
        src="https://brandstory.in/pr-agency-in-bangalore/assets/js/jquery.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://brandstory.in/pr-agency-in-bangalore/assets/js/site.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://brandstory.in/pr-agency-in-bangalore/assets/js/menu.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://unpkg.com/aos@2.3.1/dist/aos.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).AOS) {
            (window as any).AOS.init({
              duration: 1000,
              once: true
            })
          }
        }}
      />
    </>
  )
}

