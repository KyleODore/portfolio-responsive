// Select DOM items
const menuBtn = document.querySelector(".menu-btn");
const menu = document.querySelector(".menu");
const menuBranding = document.querySelector(".menu-branding");
const menuNav = document.querySelector(".menu-nav");
const navItem = document.querySelectorAll(".nav-item");

// Influence background color based on local time of user
var date = new Date();
var hour = date.getHours();
var bgColorFactor = 50 * Math.sin((Math.PI * (hour - 6)) / 12) + 50;
var body = document.querySelector("body");
body.setAttribute("bg-color-factor", bgColorFactor);

// Set initial state of menu
let showMenu = false;

menuBtn.addEventListener("click", toggleMenu);

function toggleMenu() {
	if (!showMenu) {
		menuBtn.classList.add("close");
		menu.classList.add("show");
		menuBranding.classList.add("show");
		menuNav.classList.add("show");
		navItem.forEach(item => item.classList.add("show"));

		// Set menu state
		showMenu = true;
	} else {
		menuBtn.classList.remove("close");
		menu.classList.remove("show");
		menuBranding.classList.remove("show");
		menuNav.classList.remove("show");
		navItem.forEach(item => item.classList.remove("show"));

		// Set menu state
		showMenu = false;
	}
}
