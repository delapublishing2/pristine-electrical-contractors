
/* filepath: /Users/jazzyme/Downloads/Projects/Websites/Pristine-Electrical-Contractors/Pristine-Electricians-Website/pristine-electrical-contactors/public/js/script.js */

$(document).ready(function(){
  $('.project-gallery-slider').slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      dots: true,
      arrows: true,
      fade: true,
      infinite: true,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 3000,
      cssEase: 'ease-in-out',
      prevArrow: '<button type="button" class="slick-prev">Previous</button>',
      nextArrow: '<button type="button" class="slick-next">Next</button>',
      responsive: [
          {
              breakpoint: 768,
              settings: {
                  arrows: true,
                  dots: true,
                  adaptiveHeight: true
              }
          }
      ]
  });
});

document.getElementById('contactForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(this);
  const formObject = {};

  formData.forEach((value, key) => {
    formObject[key] = value.trim() !== "" ? value : null; // Convert empty fields to null
  });

  try {
    const response = await fetch('/.netlify/functions/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formObject),
    });

    const result = await response.text();
    alert(result);
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('An error occurred while submitting the form.');
  }
});



