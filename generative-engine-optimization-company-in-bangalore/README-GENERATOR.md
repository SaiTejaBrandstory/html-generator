# Page Generator System

This system allows you to generate complete HTML pages (1000+ lines) with the same design as `geo.html` by simply providing content in a configuration file.

## How It Works

1. **Content Config File** (`content-config.php`) - Contains all your page content in a structured PHP array
2. **Generator Script** (`generate-page.php`) - Reads the config and generates the complete HTML page

## Quick Start

### Step 1: Create Your Content Config

Copy `content-config.php` to a new file (e.g., `my-new-page-config.php`) and fill in your content:

```bash
cp content-config.php my-new-page-config.php
```

### Step 2: Edit Your Content

Open `my-new-page-config.php` and replace all the placeholder content with your actual content. The file is well-organized with comments showing what each section is for.

### Step 3: Generate Your Page

Run the generator script:

```bash
php generate-page.php my-new-page-config.php my-new-page.html
```

That's it! Your complete HTML page will be generated in `my-new-page.html`.

## What Sections Are Included?

The generator creates a complete page with ALL sections from geo.html:

1. ✅ **Banner Section** - Hero banner with title and CTA
2. ✅ **Intro Section** - AI search introduction paragraphs
3. ✅ **Trusted Brands** - Client logos and brand trust section
4. ✅ **Reviewed by Experts** - Review platform badges
5. ✅ **Track Record** - Statistics and achievements (4 cards)
6. ✅ **Key Benefits** - 6 benefit cards with icons
7. ✅ **Services Section** - 13 service cards
8. ✅ **5-Stage Process** - Process steps with images
9. ✅ **Why Partner** - Partnership benefits section
10. ✅ **Why Essential** - Essential points with image
11. ✅ **Benefits of Working** - 4 benefit cards
12. ✅ **Testimonials** - 3 testimonial cards (swiper)
13. ✅ **Industries** - 9 industry cards
14. ✅ **AI Tools & Technologies** - 8 tool cards (swiper)
15. ✅ **FAQ Section** - 16 FAQ accordion items
16. ✅ **Final CTA** - Call-to-action section

## Example Usage

```bash
# Generate a page from your config
php generate-page.php content-config.php output.html

# The output will be a complete HTML file with all sections
```

## File Structure

```
generative-engine-optimization-company-in-bangalore/
├── content-config.php          # Template config file (copy this)
├── generate-page.php          # Generator script
├── geo.html                    # Original reference file
└── README-GENERATOR.md         # This file
```

## Tips

- **Keep the structure**: Don't change the array keys in the config file, only the values
- **Image paths**: Make sure image paths are correct relative to your HTML file
- **Content length**: You can adjust content length, but keep it reasonable for design
- **FAQ expansion**: Set `'expanded' => true` for the first FAQ to have it open by default
- **Multiple pages**: Create multiple config files for different pages

## Customization

All sections are customizable through the config file:
- Change headings, descriptions, and content
- Update image paths
- Modify CTA links and text
- Add/remove items in arrays (services, benefits, FAQs, etc.)

The HTML structure and CSS classes remain the same, ensuring consistent design across all generated pages.

