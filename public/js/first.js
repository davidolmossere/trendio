const primaryNav = document.querySelector(".primary-navigation");
const navToggle = document.querySelector(".mobile-nav-toggle");
const primarySub = document.querySelector(".primary-submenu");
const subToggle = document.querySelector(".submenu-toggle");

navToggle.addEventListener('click', () => {
     const visibility = primaryNav.getAttribute("data-visible");
     if (visibility === 'false') {
         primaryNav.setAttribute("data-visible",true);
         navToggle.setAttribute("aria-expanded",true);
     } else {
        primaryNav.setAttribute("data-visible",false);
        navToggle.setAttribute("aria-expanded",false);
     }
 });

 subToggle.addEventListener('click', () => {
    const visibility = primarySub.getAttribute("data-visible");
    if (visibility === 'false') {
        primarySub.setAttribute("data-visible",true);
    } else {
       primarySub.setAttribute("data-visible",false);
    }
});