

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
        responsive: [
            {
              breakpoint: 768,
              settings: {
                arrows: true,
                dots: true
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
    const response = await fetch('/submit-form', {
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

