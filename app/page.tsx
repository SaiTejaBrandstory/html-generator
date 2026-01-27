export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                HTML Generator
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Home
                </a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  About
                </a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Contact
                </a>
              </nav>
              <a
                href="/generate"
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]"
              >
                Generate
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
               HTML Templates
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our collection of premium templates and generate custom HTML pages with AI-powered content
            </p>
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="pb-20">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Template 1 */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="aspect-video w-full">
                  <img 
                    src="/assets/images/home-page/template1-banner.png" 
                    alt="Geo Service Template" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                    Template 1
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Landing Page Template 1</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A comprehensive GEO services template with 15 content sections including process workflow, AI tools showcase, industries served, testimonials, FAQs, and AI-powered content generation for service-based businesses.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="/template/template1" 
                    className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    View Template
                  </a>
                  <a 
                    href="/template/template1/generate" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    Generate
                  </a>
                </div>
              </div>
            </div>

            {/* Template 2 */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="aspect-video w-full">
                  <img 
                    src="/assets/images/home-page/template2-banner.png" 
                    alt="Landing Page Template" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                    Template 2
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Landing Page Template 2</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A modern, conversion-focused landing page template with 12 content sections featuring infinite carousels, interactive accordions, process workflow, reviews showcase, testimonials, FAQs, and AI-powered content generation.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="/template/template2" 
                    className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    View Template
                  </a>
                  <a 
                    href="/template/template2/generate" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    Generate
                  </a>
                </div>
              </div>
            </div>

            {/* Template 3 */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-teal-50">
                <div className="aspect-video w-full">
                  <img 
                    src="/assets/images/home-page/template3-banner.png" 
                    alt="Landing Page Template 3" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                    Template 3
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Landing Page Template 3</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A comprehensive ecommerce-focused landing page template with 17 content sections including interactive accordions, tools & technologies showcase, success stories, testimonials, FAQs, and AI-powered content generation for dynamic customization.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="/template/template3" 
                    className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    View Template
                  </a>
                  <a 
                    href="/template/template3/generate" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    Generate
                  </a>
                </div>
              </div>
            </div>

            {/* Template 4 */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50">
                <div className="aspect-video w-full">
                  <img 
                    src="/assets/images/home-page/template4-banner.png" 
                    alt="Landing Page Template 4" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                    Template 4
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Landing Page Template 4</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A modern, feature-rich landing page template with 8 dynamic content sections designed for maximum conversion. Includes interactive accordions, service tabs, industry showcases, FAQs, and AI-powered content generation capabilities.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="/template/template4" 
                    className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    View Template
                  </a>
                  <a 
                    href="/template/template4/generate" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    Generate
                  </a>
                </div>
              </div>
            </div>

            {/* Template 5 */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-cyan-50">
                <div className="aspect-video w-full">
                  <img 
                    src="/assets/images/home-page/template5-banner.png" 
                    alt="Landing Page Template 5" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                    Template 5
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Landing Page Template 5</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A professional landing page template with 10 content sections including banner, intro, services showcase, why choose us, edge highlights, benefits, testimonials, contact CTA, FAQs (15 questions), client logos, and AI-powered content generation for service-based businesses.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="/template/template5" 
                    className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    View Template
                  </a>
                  <a 
                    href="/template/template5/generate" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    Generate
                  </a>
                </div>
              </div>
            </div>

            {/* Template 6 */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50">
                <div className="aspect-video w-full">
                  <img 
                    src="/assets/images/home-page/template6-banner.png" 
                    alt="Landing Page Template 6" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                    Template 6
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Landing Page Template 6</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A comprehensive service-based landing page template with 17 sections including banner with stats, trusted brands, portfolio gallery, services showcase, process workflow, case studies, testimonials, trending blogs, and FAQs (20+ questions) with AI-powered content generation adaptable to any service or industry.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="/template/template6" 
                    className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    View Template
                  </a>
                  <a 
                    href="/template/template6/generate" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    Generate
                  </a>
                </div>
              </div>
            </div>

            {/* Template 7 */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
                <div className="aspect-video w-full">
                  <img 
                    src="/assets/images/home-page/template7-banner.png" 
                    alt="Villa Interior Design Template" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                    Template 7
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Landing Page Template 7</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A professional service-based landing page template with 10 content sections including banner, design types showcase, process workflow, services tabs, projects gallery, stats & features, client logos, service packages, trending blogs, and comprehensive FAQs (20+ questions) with AI-powered content generation. Perfect for interior design, architecture, and service-based businesses.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="/template/template7" 
                    className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    View Template
                  </a>
                  <a 
                    href="/template/template7/generate" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    Generate
                  </a>
                </div>
              </div>
            </div>

            {/* Template 8 */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50">
                <div className="aspect-video w-full">
                  <img 
                    src="/assets/images/home-page/template8-banner.png" 
                    alt="Landing Page Template 8" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                    Template 8
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Landing Page Template 8</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A comprehensive service-based landing page template with 10 content sections including banner with CTA, multiple service showcases, design solutions, additional features, process workflow, why choose section, benefits showcase, testimonials, and comprehensive FAQs (20+ questions) with AI-powered content generation. Perfect for service-based businesses, contractors, and companies offering multiple service tiers.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="/template/template8" 
                    className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    View Template
                  </a>
                  <a 
                    href="/template/template8/generate" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    Generate
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Templates Section */}
      <section className="pb-20">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">
            Blog Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Blog Template 1 */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="aspect-video w-full">
                  <img 
                    src="/assets/images/home-page/blog1-banner.png" 
                    alt="Blog Template 1" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                    Blog Template 1
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Blog Template 1</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A comprehensive blog template with sticky navigation sidebar, multiple content sections, and interactive table of contents. Features SEO-optimized structure, featured banner, and CTA sections. Perfect for long-form articles with structured content.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="/blog/template1" 
                    className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    View Template
                  </a>
                  <a 
                    href="/blog/template1/generate" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    Generate
                  </a>
                </div>
              </div>
            </div>

            {/* Blog Template 2 */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="aspect-video w-full">
                  <img 
                    src="/assets/images/home-page/blog2-banner.png" 
                    alt="Blog Template 2" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                    Blog Template 2
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Blog Template 2</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A modern blog template with numbered content sections, integrated lead generation form sidebar, and clean two-column layout. Features SEO-optimized structure, featured banner, and CTA sections. Perfect for creating professional blog posts with lead capture functionality.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="/blog/template2" 
                    className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    View Template
                  </a>
                  <a 
                    href="/blog/template2/generate" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    Generate
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar Pages Section */}
      <section className="pb-20">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">
            Pillar pages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Pillar Page 1 */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="aspect-video w-full">
                  <img 
                    src="/assets/images/home-page/pillar1-banner.png" 
                    alt="Pillar Page 1" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                    Pillar Page 1
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pillar Page 1</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A comprehensive pillar page template designed for SEO and content marketing. Features structured content sections, internal linking opportunities, and AI-powered content generation for maximum search visibility and user engagement.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="/pillar-page1" 
                    className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    View Template
                  </a>
                  <a 
                    href="/pillar-page1/generate" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    Generate
                  </a>
                </div>
              </div>
            </div>

            {/* Pillar Page 1 - Humanizer */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="aspect-video w-full">
                  <img 
                    src="/assets/images/home-page/pillar1-banner.png" 
                    alt="Pillar Page 1 - Humanizer" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                    Pillar Page 1 - Humanizer
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pillar Page 1 - Humanizer</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A comprehensive pillar page template designed for SEO and content marketing. Features structured content sections, internal linking opportunities, and AI-powered content generation for maximum search visibility and user engagement.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="/pillar-page1-humanizer" 
                    className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    View Template
                  </a>
                  <a 
                    href="/pillar-page1-humanizer/generate" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 text-center shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    Generate
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm py-8">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center text-gray-600">
            <p className="text-sm">© 2025 HTML Generator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

