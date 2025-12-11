// Variables to store the previous scroll position and header height
let prevScrollpos = window.pageYOffset;
const header = document.querySelector('.header');
const headerHeight = header ? header.offsetHeight : 0;

// Event listener for scroll behavior only on desktop (screen width > 1080px)
if (header) {
window.addEventListener('scroll', () => {
  if (window.innerWidth > 1080) {
    const currentScrollPos = window.pageYOffset;

    if (currentScrollPos > prevScrollpos) {
      // Scrolling down
      header.classList.add('hidden');
    } else {
      // Scrolling up
      header.classList.remove('hidden');
    }

    if (currentScrollPos > 0) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    prevScrollpos = currentScrollPos;
  } 
  else {
    // For mobile view, always show the header
    header.classList.remove('hidden');
  }
});
}

// Get references to the button and the element to toggle
const toggleButton = document.getElementById('toggleButton');
const elementToToggle = document.getElementById('mobile-nav-overly');
const navbarCollapse = document.getElementById('navbarSupportedContent');

// Add a click event listener to the button
if (toggleButton && elementToToggle && navbarCollapse) {
toggleButton.addEventListener('click', function() {
  // Toggle the 'hidden' class on the overlay
  elementToToggle.classList.toggle('hidden');
  
  // Toggle the 'show' class on the navbar collapse
  navbarCollapse.classList.toggle('show');
  
  // Toggle the icons
  const menuIcon = this.querySelector('.bi-list');
  const closeIcon = this.querySelector('.bi-x-lg');
  
  if (menuIcon && closeIcon) {
    menuIcon.classList.toggle('hidden');
    closeIcon.classList.toggle('hidden');
  }
});
}

// Close menu when clicking outside
if (toggleButton && elementToToggle && navbarCollapse) {
document.addEventListener('click', function(event) {
  const isClickInside = navbarCollapse.contains(event.target) || toggleButton.contains(event.target);
  
  if (!isClickInside && navbarCollapse.classList.contains('show')) {
    navbarCollapse.classList.remove('show');
    elementToToggle.classList.add('hidden');
    
    // Reset icons
    const menuIcon = toggleButton.querySelector('.bi-list');
    const closeIcon = toggleButton.querySelector('.bi-x-lg');
    
    if (menuIcon && closeIcon) {
      menuIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    }
  }
});
}

/**
 * Animation on scroll
 */
window.addEventListener('load', () => {
  if (typeof AOS !== 'undefined') {
  AOS.init({
    duration: 1000,
    easing: "ease-in-out",
  });
  }
});

document.addEventListener("DOMContentLoaded", function(){
  
  // make it as accordion for smaller screens
  if (window.innerWidth < 992) {

    // close all inner dropdowns when parent is closed
    document.querySelectorAll('.navbar .dropdown').forEach(function(everydropdown){
      everydropdown.addEventListener('hidden.bs.dropdown', function () {
        // after dropdown is hidden, then find all submenus
        this.querySelectorAll('.submenu').forEach(function(everysubmenu){
          // hide every submenu as well
          everysubmenu.style.display = 'none';
        });
      })
    });
    
    document.querySelectorAll('.dropdown-menu a').forEach(function(element){
      element.addEventListener('click', function (e) {

        let nextEl = this.nextElementSibling;
        if(nextEl && nextEl.classList.contains('submenu')) {	
          // prevent opening link if link needs to open dropdown
          e.preventDefault();

          if(nextEl.style.display == 'block'){
            nextEl.style.display = 'none';
          } else {
            nextEl.style.display = 'block';
          }

        }
      });
    });
  }
  // end if innerWidth

}); 
// DOMContentLoaded  end

document.addEventListener("DOMContentLoaded", function(){
  /////// Prevent closing from click inside dropdown
  document.querySelectorAll('.dropdown-menu').forEach(function(element){
    element.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  })
});
if (typeof $ !== 'undefined') {
$(document).ready(function(){
  $("#toggleButton").click(function(){
    // Toggle the icons on each click
    $("#toggleButton i").toggleClass("hidden");
  });
});
}

document.addEventListener("DOMContentLoaded", function() {
  var items = document.querySelectorAll('.list-group-item');
  
  items.forEach(function(item) {
    item.classList.remove('active'); // Remove 'active' class initially

    item.addEventListener('click', function() {
      // Remove 'active' class from all items
      items.forEach(function(item) {
        item.classList.remove('active');
      });
      
      // Add 'active' class to the clicked item
      this.classList.add('active');
    });
  });
});

/* Tabs slider*/

if (typeof Swiper !== 'undefined' && document.querySelector(".proSlider")) {
var swiper = new Swiper(".proSlider", {

  spaceBetween: 0,

  slidesPerView: 2,
  autoplay : {
    
    delay: 2500,
},
speed: 2500,
loop: true,

lazy: true,

  freeMode: true,

  watchSlidesProgress: true,

breakpoints: {

  767: {

    slidesPerView: 4

  },

  1080: {

    slidesPerView: 4

  },

1200: {

    slidesPerView: 6

  }

} 

});
}

if (typeof Swiper !== 'undefined' && document.querySelector(".proSlider2")) {
var swiper2 = new Swiper(".proSlider2", {

  spaceBetween: 10,

lazy: true, 
autoplay : {
    delay: 2500,
    pauseOnMouseEnter: true,
},

speed: 2500,
loop: true,

  navigation: {

    nextEl: ".tab-next",

    prevEl: ".tab-prev",

  },

  thumbs: {

    swiper: swiper,

  },  

});
}