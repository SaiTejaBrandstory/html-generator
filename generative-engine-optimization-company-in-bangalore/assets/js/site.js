document.addEventListener('DOMContentLoaded', function () {

  // Scroll Header Effect
  const banner = document.querySelector('.banner');
  if (banner) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 0) {
        banner.classList.add('scrolled');
      } else {
        banner.classList.remove('scrolled');
      }
    });
  }

  // Content Swiper
  const contentSwiper = new Swiper(".contentSwiper", {
    spaceBetween: 20,
    speed: 2000,
    navigation: {
      nextEl: ".explore-swiper-button-next",
      prevEl: ".explore-swiper-button-prev",
    },
    breakpoints: {
      640: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 10,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 10,
      },
    },
  });

  // Accordion Image Preview
  const accordionButtons = document.querySelectorAll('.accordion-button');
  const previewImages = document.querySelectorAll('.col-md-5.d-none img');

  const activateImage = (index) => {
    previewImages.forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });
  };

  accordionButtons.forEach((button, index) => {
    button.addEventListener('click', () => activateImage(index));
  });

  activateImage(0); // Set first image active

  // Exterior Swiper
  const exteriorSwiper = new Swiper(".exteriorSwiper", {
    slidesPerView: 2,
    spaceBetween: 2,
    speed: 2000,
    navigation: {
      nextEl: ".ext-next",
      prevEl: ".ext-prev",
    },
    autoplay: {
      delay: 2500,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      640: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 2,
      },
      1024: {
        slidesPerView: 2.4,
        spaceBetween: 2,
      },
    },
  });

  // Interior Swiper
  const interiorSwiper = new Swiper(".interiorSwiper", {
    slidesPerView: 2,
    spaceBetween: 2,
    speed: 2000,
    navigation: {
      nextEl: ".int-next",
      prevEl: ".int-prev",
    },
    autoplay: {
      delay: 2500,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      640: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 2,
      },
      1024: {
        slidesPerView: 2.4,
        spaceBetween: 2,
      },
    },
  });

  // Banner Swiper
  const bannerSwiper = new Swiper(".bannerSwiper", {
    loop: true,
    speed: 2000,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  // Clients Swiper 01 - Vertical Version
// Function to get direction based on screen width (767 breakpoint)
function getSwiperDirection() {
  return window.innerWidth <= 1099 ? 'horizontal' : 'vertical';
}
const clientsSwiper = new Swiper(".clients-swiper", {
  direction: getSwiperDirection(),
  slidesPerView: 2,
  spaceBetween: 10,
  loop: true,
  speed: 4000,
  autoplay: {
    delay: 1,
    disableOnInteraction: false,
    reverseDirection: true,
  },
  breakpoints: {
    640: {
      slidesPerView: 2,
      spaceBetween: 10,
    },
    768: {
      slidesPerView: 3,
      spaceBetween: 20,
    },
    1024: {
      slidesPerView: 4,
      spaceBetween: 20,
    },
  },
});
// Re-initialize direction on resize if screen crosses 767px
window.addEventListener("resize", () => {
  const newDirection = getSwiperDirection();
  if (clientsSwiper.params.direction !== newDirection) {
    clientsSwiper.changeDirection(newDirection);
  }
});


// Function to get direction based on screen width (767px breakpoint)
function getSwiper02Direction() {
  return window.innerWidth <= 1099 ? 'horizontal' : 'vertical';
}

// Initialize Swiper with dynamic direction
const clientsSwiper02 = new Swiper(".clients-swiper02", {
  direction: getSwiper02Direction(),
  slidesPerView: 2,
  spaceBetween: 10,
  loop: true,
  speed: 4000,
  autoplay: {
    delay: 1,
    disableOnInteraction: false,
  },
  breakpoints: {
    640: {
      slidesPerView: 2,
      spaceBetween: 10,
    },
    768: {
      slidesPerView: 3,
      spaceBetween: 10,
    },
    1024: {
      slidesPerView: 4,
      spaceBetween: 10,
    },
  },
});

// Re-initialize direction if screen crosses 767px
window.addEventListener("resize", () => {
  const newDirection = getSwiper02Direction();
  if (clientsSwiper02.params.direction !== newDirection) {
    clientsSwiper02.changeDirection(newDirection);
  }
});

// section sticky 
document.addEventListener("DOMContentLoaded", function () {
  if (window.innerWidth >= 768) { // Only run on tablet & desktop
    const genSection = document.querySelector(".gen-engine-main");
    const genSticky = document.querySelector(".gen-engine");

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            genSticky.style.position = "relative"; // unstick
          } else {
            genSticky.style.position = "sticky";   // restick
          }
        });
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "0px 0px -100% 0px"
      }
    );

    observer.observe(genSection);
  }
});





  // Testimonial Swiper 01
  const bsdSwiper = new Swiper(".bsd-testi-swiper", {
    slidesPerView: 1,
    spaceBetween: 10,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    breakpoints: {
      640: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 10,
      },
      1024: {
        slidesPerView: 2,
        spaceBetween: 10,
      },
    },
  });

  // Testimonial Swiper 02
  const trendingSwiper = new Swiper(".trendingSwiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: ".trend-swiper-button-next",
      prevEl: ".trend-swiper-button-prev",
    },
    breakpoints: {
      640: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 2,
      },
    },
  });

});





