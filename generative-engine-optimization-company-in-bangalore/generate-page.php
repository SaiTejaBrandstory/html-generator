<?php
/**
 * Complete Page Generator Script
 * 
 * Generates a complete HTML page (1000+ lines) with all sections from geo.html
 * 
 * Usage: php generate-page.php content-config.php output.html
 */

if ($argc < 3) {
    die("Usage: php generate-page.php <config-file> <output-file>\nExample: php generate-page.php content-config.php new-page.html\n");
}

$configFile = $argv[1];
$outputFile = $argv[2];

if (!file_exists($configFile)) {
    die("Error: Config file not found: $configFile\n");
}

$content = require $configFile;

if (!is_array($content)) {
    die("Error: Config file must return an array\n");
}

// Helper function to escape HTML
function e($str) {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

// Start output buffering
ob_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo e($content['page_title']); ?></title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Text&family=Hanken+Grotesk&family=Roboto&display=swap" rel="stylesheet">

    <!-- CSS -->
    <link href="assets/css/menu.css?key=<?php echo time(); ?>" rel="stylesheet">
    <link href="assets/css/bootstrap.min.css" rel="stylesheet">
    <link href="assets/css/global.css?key=<?php echo time(); ?>" rel="stylesheet">
    <link href="assets/css/style.css?key=<?php echo time(); ?>" rel="stylesheet">
    <link href="assets/css/swiper.css?key=<?php echo time(); ?>" rel="stylesheet">
    <link href="assets/css/aos.css?key=<?php echo time(); ?>" rel="stylesheet">

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <link rel="icon" type="image/png" sizes="32x32" href="<?php echo isset($base) ? $base : ''; ?>assets/images/home/favicon.png">
</head>
<body>
    <!-- Include Header-->

    <!-- Banner Section -->
    <section class="home-banner bg-black mt-100">
        <div class="container-fluid p-0">
            <div class="bnr-slide01 bg-bnr h-600 d-flex align-items-center"<?php if (!empty($content['banner']['bg_image'])): ?> style="background-image: url('<?php echo e($content['banner']['bg_image']); ?>'); background-size: cover; background-position: center;"<?php endif; ?>>
                <div class="container">
                    <div class="row">
                        <div class="col-md-8 text-white">
                            <h1 class="mb-4" data-aos="fade-up" data-aos-duration="1000"><?php echo e($content['banner']['title']); ?></h1>
                            <div class="smm-uae-btn w-fit" data-aos="fade-up" data-aos-duration="1400">
                                <a href="<?php echo e($content['banner']['cta_link']); ?>" class="fs-22 cnt-btn fw-700 text-white d-flex align-items-center gap-2"><?php echo e($content['banner']['cta_text']); ?></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Intro Section (AI Search) -->
    <section class="ai-search bg-bnr sp-100"<?php if (!empty($content['intro']['bg_image'])): ?> style="background-image: url('<?php echo e($content['intro']['bg_image']); ?>'); background-size: cover; background-position: center;"<?php endif; ?>>
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <p class="text-white text-center" data-aos="fade-up" data-aos-duration="1000"><?php echo e($content['intro']['paragraph_1']); ?></p>
                    <p class="text-white text-center mb-0" data-aos="fade-up" data-aos-duration="1300"><?php echo e($content['intro']['paragraph_2']); ?></p>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Trusted Brands Section -->
    <section class="sp-70">
        <div class="container">
            <div class="row">
                <div class="col-lg-6 col-md-12">
                    <img src="<?php echo e($content['trusted_brands']['image']); ?>" class="img-fluid mb-4" alt="" data-aos="fade-up" data-aos-duration="1500">
                    <h2 class="text-white mb-4" data-aos="fade-up" data-aos-duration="1600"><?php echo e($content['trusted_brands']['heading']); ?></h2>
                    <p class="text-white mb-4 mb-md-4 mb-lg-0" data-aos="fade-up" data-aos-duration="1700"><?php echo e($content['trusted_brands']['description']); ?></p>
                </div>
                <div class="col-md-12 col-lg-3">
                    <!-- Swiper 01 -->
                    <div class="swiper clients-swiper" data-aos="fade-up" data-aos-duration="1000">
                        <div class="swiper-wrapper">
                            <?php for ($i = 1; $i <= 13; $i++): ?>
                            <div class="swiper-slide">
                                <img src="assets/images/web-development-company/client-<?php echo str_pad($i, 2, '0', STR_PAD_LEFT); ?>.svg" class="img-fluid active" alt="">
                            </div>
                            <?php endfor; ?>
                        </div>
                    </div>
                </div>
                <div class="col-md-12 col-lg-3">
                    <!-- Swiper 02 -->
                    <div class="swiper clients-swiper02 pt-5" data-aos="fade-up" data-aos-duration="1000">
                        <div class="swiper-wrapper">
                            <?php for ($i = 1; $i <= 13; $i++): ?>
                            <div class="swiper-slide">
                                <img src="assets/images/web-development-company/slider-logo<?php echo str_pad($i, 2, '0', STR_PAD_LEFT); ?>.svg" class="img-fluid active" alt="">
                            </div>
                            <?php endfor; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Reviewed by Verified Experts Section -->
    <section class="meet-bsd spb-100 cus-overflow-x">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <h2 class="text-white text-center mb-5" data-aos="fade-up"><?php echo e($content['reviewed_experts']['heading']); ?></h2>
                    <div class="d-flex flex-wrap justify-content-center text-center">
                        <?php foreach ($content['reviewed_experts']['reviews'] as $review): ?>
                        <div class="p-2 custom-col">
                            <div class="review-card <?php echo e($review['class']); ?>" data-aos="fade-up">
                                <img src="<?php echo e($review['image']); ?>" class="img-fluid cus-w-100" alt="<?php echo e($review['alt']); ?>">
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Track Record Section -->
    <section class="track-record-section bg-bnr sp-100">
        <div class="container">
            <h2 class="text-center mb-5 text-white fw-bold" data-aos="fade-up"><?php echo e($content['track_record']['heading']); ?></h2>
            <div class="row g-4">
                <?php 
                $firstCard = true;
                foreach ($content['track_record']['stats'] as $stat): 
                ?>
                <div class="col-md-3" data-aos="fade-up">
                    <div class="custom-card <?php echo $firstCard ? 'first-card' : ''; ?> text-center px-4">
                        <h5><?php echo e($stat['title']); ?></h5>
                        <p><?php echo e($stat['description']); ?></p>
                    </div>
                </div>
                <?php 
                $firstCard = false;
                endforeach; 
                ?>
            </div>
        </div>
    </section>
    
    <!-- Key Benefits Section -->
    <section class="key-benefits bg-bnr sp-100 cus-overflow-x"<?php if (!empty($content['key_benefits']['bg_image'])): ?> style="background-image: url('<?php echo e($content['key_benefits']['bg_image']); ?>'); background-size: cover; background-position: center;"<?php endif; ?>>
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <h2 class="text-white text-center mb-5" data-aos="fade-up"><?php echo e($content['key_benefits']['heading']); ?></h2>
                    <div class="row g-3">
                        <?php 
                        $animations = ['fade-left', 'fade-up', 'fade-right', 'fade-left', 'fade-down', 'fade-right'];
                        foreach ($content['key_benefits']['benefits'] as $index => $benefit): 
                        ?>
                        <div class="col-md-4">
                            <div class="feature-card" data-aos="<?php echo $animations[$index % count($animations)]; ?>">
                                <span class="circle-feature-box"></span>
                                <img src="<?php echo e($benefit['icon']); ?>" class="img-fluid mb-4" alt="">
                                <h3 class="text-white mb-3"><?php echo e($benefit['title']); ?></h3>
                                <p class="text-white fs-18 mb-0"><?php echo e($benefit['description']); ?></p>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Services Section (Generative Engine) -->
    <section class="sp-100 gen-engine-main">
        <div class="container">
            <div class="row">
                <div class="col-md-6" data-aos="fade-up">
                    <div class="gen-engine">
                        <h2 class="text-white mb-4"><?php echo e($content['services']['heading']); ?></h2>
                        <p class="text-white fs-18 mb-5 mb-md-0"><?php echo e($content['services']['description']); ?></p>
                    </div>
                </div>
                <div class="col-md-6">
                    <?php foreach ($content['services']['services_list'] as $service): ?>
                    <div class="gen-en-card text-center px-4 mb-3" data-aos="fade-up">
                        <h4 class="card-title text-start fw-bold fs-24 text-white mb-3"><?php echo e($service['title']); ?></h4>
                        <p class="card-text text-start text-white fs-18 mb-0"><?php echo e($service['description']); ?></p>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Process Section (5-Stage Process) -->
    <section class="spb-70">
        <div class="container">
            <h2 class="text-white mb-4 text-center" data-aos="fade-up"><?php echo e($content['process']['heading']); ?></h2>
            <p class="text-white fs-18 text-center mb-5" data-aos="fade-up"><?php echo e($content['process']['description']); ?></p>
            <div class="ai-first p-0" data-aos="fade-up">
                <div class="row">
                    <div class="col-md-4 d-flex">
                        <img src="<?php echo e($content['process']['process_image']); ?>" class="w-cus-50 w-100 mb-0" alt="">
                    </div>
                    <div class="col-md-8 py-4">
                        <?php foreach ($content['process']['steps'] as $index => $step): ?>
                        <div class="process-sec mb-3 me-4 cus-dott" data-aos="fade-up">
                            <div class="row align-items-center inner-p-sec text-white p-2 mb-3">
                                <div class="col-auto">
                                    <span class="p-2 fs-58"><?php echo e($step['number']); ?></span>
                                </div>
                                <div class="col">
                                    <h5 class="fw-bold mb-1 fs-24"><?php echo e($step['title']); ?></h5>
                                    <p class="fs-18 mb-2 fw-700"><?php echo e($step['subtitle']); ?></p>
                                    <p class="mb-0 fs-16"><?php echo e($step['description']); ?></p>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Why Partner Section -->
    <section class="spb-100 spt-70">
        <div class="container">
            <div class="why-prt-card" data-aos="fade-up">
                <div class="row">
                    <div class="col-md-8 why-p-card px-5 py-4">
                        <h2 class="text-white mb-3"><?php echo e($content['why_partner']['heading']); ?></h2>
                        <p class="text-white fs-18 mb-2"><?php echo e($content['why_partner']['description']); ?></p>
                    </div>
                    <div class="col-md-4 d-flex">
                        <img src="<?php echo e($content['why_partner']['image']); ?>" class="img-fluid w-100 hum-robot mb-0" alt="">
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Why Essential Section -->
    <section class="spb-100">
        <div class="container">
            <h2 class="text-white text-center mb-3" data-aos="fade-up"><?php echo e($content['why_essential']['heading']); ?><?php if (!empty($content['why_essential']['heading_span'])): ?> <span class="db"><?php echo e($content['why_essential']['heading_span']); ?></span><?php endif; ?></h2>
            <p class="text-white text-center fs-18 mb-5" data-aos="fade-up"><?php echo e($content['why_essential']['description']); ?></p>
            <div class="row d-flex align-items-center">
                <div class="col-md-6">
                    <img src="<?php echo e($content['why_essential']['image']); ?>" class="img-fluid mb-4 mb-md-0" alt="" data-aos="fade-up" data-aos-duration="1600">
                </div>
                <div class="col-md-6">
                    <ul class="text-white fs-18">
                        <?php 
                        $durations = [1000, 1200, 1400, 1600, 1800];
                        foreach ($content['why_essential']['points'] as $index => $point): 
                        ?>
                        <li class="mb-3" data-aos="fade-up" data-aos-duration="<?php echo $durations[$index % count($durations)]; ?>"><?php echo e($point); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Benefits of Working Section -->
    <section class="sp-100 bg-bnr benefits-work">
        <div class="container">
            <div class="row mb-4">
                <div class="col-md-5">
                    <h2 class="text-white mb-0" data-aos="fade-up"><?php echo e($content['benefits_working']['heading']); ?></h2>
                </div>
                <div class="col-md-7">
                    <p class="text-white fs-18 mb-0 mt-2" data-aos="fade-up"><?php echo e($content['benefits_working']['description']); ?></p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-5"></div>
                <div class="col-md-7">
                    <div class="row g-3">
                        <?php 
                        $benefitAnimations = ['fade-left', 'fade-right', 'fade-left', 'fade-right'];
                        foreach ($content['benefits_working']['benefits'] as $index => $benefit): 
                        ?>
                        <div class="col-md-6">
                            <div class="feature-card p-3 border-benefits" data-aos="<?php echo $benefitAnimations[$index % count($benefitAnimations)]; ?>">
                                <img src="<?php echo e($benefit['icon']); ?>" class="img-fluid mb-4" alt="">
                                <h3 class="text-white mb-3"><?php echo e($benefit['title']); ?></h3>
                                <p class="text-white fs-18 mb-0"><?php echo e($benefit['description']); ?></p>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Testimonials Section -->
    <section class="spt-70 spb-100">
        <div class="container">
            <h2 class="mb-5 text-center text-white" data-aos="fade-up"><?php echo e($content['testimonials']['heading']); ?></h2>
            <div class="swiper bsd-testi-swiper" data-aos="fade-up">
                <div class="swiper-wrapper">
                    <?php foreach ($content['testimonials']['testimonials_list'] as $testimonial): ?>
                    <div class="swiper-slide">
                        <div class="card shadow bg-aa rounded-4 p-4 h-100">
                            <img src="assets/images/web-development-company/quotes.svg" class="w-11" alt="UX Animation">
                            <div class="card-body p-0 mt-3 mb-2">
                                <p class="card-text mb-4 fs-18 text-white"><?php echo e($testimonial['quote']); ?></p>
                                <p class="card-text mb-0 fs-18 text-white fw-700"><?php echo e($testimonial['author']); ?></p>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Industries Section -->
    <section class="spb-100">
        <div class="container">
            <h2 class="text-white text-center mb-3" data-aos="fade-up"><?php echo e($content['industries']['heading']); ?></h2>
            <p class="text-white text-center fs-18 mb-5" data-aos="fade-up"><?php echo e($content['industries']['description']); ?><?php if (!empty($content['industries']['description_span'])): ?> <span class="db"><?php echo e($content['industries']['description_span']); ?></span><?php endif; ?></p>
            <div class="row g-4">
                <?php 
                $industryDurations = [1000, 1000, 1000, 1500, 1500, 1500, 2000, 2000, 2000];
                foreach ($content['industries']['industries_list'] as $index => $industry): 
                ?>
                <div class="col-md-4">
                    <div class="feature-card" data-aos="fade-up" data-aos-duration="<?php echo $industryDurations[$index % count($industryDurations)]; ?>">
                        <h4 class="fs-20 text-center text-white mb-0"><?php echo e($industry); ?></h4>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    
    <!-- AI Tools & Technologies Section -->
    <section class="explore-sec ai-tools bg-bnr spt-100 spb-70 cus-overflow-x"<?php if (!empty($content['ai_tools']['bg_image'])): ?> style="background-image: url('<?php echo e($content['ai_tools']['bg_image']); ?>'); background-size: cover; background-position: center;"<?php endif; ?>>
        <div class="container">
            <div class="heading d-flex flex-column align-items-center px-md-5 px-2 mx-md-5 mx-0" data-aos="fade-up">
                <h2 class="text-center text-white mb-4"><?php echo e($content['ai_tools']['heading']); ?></h2>
                <p class="text-white text-center fs-18 mb-5"><?php echo e($content['ai_tools']['description']); ?></p>
            </div>
            <div class="content-slider position-relative mt-5" data-aos="fade-up">
                <div class="main-next-prev cus">
                    <div class="explore-swiper-button-prev"></div>
                    <div class="explore-swiper-button-next"></div>
                </div>
                <div class="swiper contentSwiper">
                    <div class="swiper-wrapper">
                        <?php foreach ($content['ai_tools']['tools'] as $index => $tool): ?>
                        <div class="swiper-slide">
                            <div class="card bg-aa shadow rounded-4 p-3 h-100">
                                <div class="card-body p-0 mb-2">
                                    <h4 class="card-title fw-bold fs-24 text-white"><?php echo e($tool['title']); ?></h4>
                                    <p class="card-text mb-4 fs-18 text-white"><?php echo e($tool['description']); ?></p>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- FAQ Section -->
    <section class="sp-100">
        <div class="container">
            <h2 class="text-center text-white mb-5" data-aos="fade-up"><?php echo e($content['faqs']['heading']); ?></h2>
            <div class="row g-4 d-flex align-items-center">
                <div class="col-md-12">
                    <div class="accordion custom-accordion faq-cus-acc" id="faqAccordion">
                        <?php foreach ($content['faqs']['faqs_list'] as $index => $faq): 
                            $faqNum = str_pad($index + 1, 2, '0', STR_PAD_LEFT);
                            $isExpanded = isset($faq['expanded']) && $faq['expanded'];
                        ?>
                        <div class="accordion-item" data-aos="fade-up">
                            <h2 class="accordion-header" id="heading<?php echo $faqNum; ?>">
                                <button class="accordion-button <?php echo $isExpanded ? 'show' : 'collapsed'; ?> fs-24 fw-700" type="button" data-bs-toggle="collapse" data-bs-target="#collapse<?php echo $faqNum; ?>" aria-expanded="<?php echo $isExpanded ? 'true' : 'false'; ?>" aria-controls="collapse<?php echo $faqNum; ?>">
                                    <?php echo e($faq['question']); ?>
                                </button>
                            </h2>
                            <div id="collapse<?php echo $faqNum; ?>" class="accordion-collapse collapse <?php echo $isExpanded ? 'show' : ''; ?>" aria-labelledby="heading<?php echo $faqNum; ?>" data-bs-parent="#faqAccordion">
                                <div class="accordion-body">
                                    <p><?php echo e($faq['answer']); ?></p>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Final CTA Section -->
    <section class="spb-100">
        <div class="container">
            <div class="card bg-aa shadow rounded-4 h-100 sp-70 px-5" data-aos="fade-up">
                <div class="card-body p-0 mt-3 mb-2 text-center">
                    <h2 class="text-center text-white mb-4" data-aos="fade-up" data-aos-duration="1000"><?php echo e($content['final_cta']['heading']); ?></h2>
                    <p class="text-white text-center fs-18 mb-5" data-aos="fade-up" data-aos-duration="1500"><?php echo e($content['final_cta']['description']); ?><?php if (!empty($content['final_cta']['description_span'])): ?> <span class="db"><?php echo e($content['final_cta']['description_span']); ?></span><?php endif; ?></p>
                    <div class="smm-uae-btn w-fit">
                        <a href="<?php echo e($content['final_cta']['cta_link']); ?>" class="fs-22 cnt-btn fw-700 text-white d-flex align-items-center gap-2 w-100" data-aos-duration="2000"><?php echo e($content['final_cta']['cta_text']); ?></a>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <script src="assets/js/swiper-bundle.min.js"></script>
    <script src="assets/js/jquery.min.js"></script>
    <script src="assets/js/site.js"></script>
    <script src="assets/js/aos.js"></script>
    <script src="assets/js/menu.js"></script>
    <script src="assets/js/counter.js"></script>
    
    <!-- Initialize AOS -->
    <script>
        AOS.init({
            duration: 1000,
            once: true
        });
    </script>
</body>
</html>
<?php
$html = ob_get_clean();

// Write to file
if (file_put_contents($outputFile, $html) === false) {
    die("Error: Could not write to file: $outputFile\n");
}

echo "✓ Page generated successfully!\n";
echo "  Output file: $outputFile\n";
echo "  File size: " . number_format(filesize($outputFile)) . " bytes\n";
echo "  Lines: " . substr_count($html, "\n") . "\n";
?>

