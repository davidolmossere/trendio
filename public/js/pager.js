const selectMenu = document.querySelector(".page-size");
const selectMenuToggle = document.querySelector(".selectmenu-toggle");
const selectMenuItems = document.querySelector(".selectmenu-items");
selectMenuToggle.addEventListener('click', () => {
    selectMenu.classList.toggle("_active"); 
    selectMenuToggle.classList.toggle("_active");
    selectMenuItems.classList.toggle("_active"); 
 });