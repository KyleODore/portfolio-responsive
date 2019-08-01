// Select DOM items
const menuBtn = document.querySelector(".menu-btn");
const menu = document.querySelector(".menu");
const menuBranding = document.querySelector(".menu-branding");
const menuNav = document.querySelector(".menu-nav");
const navItem = document.querySelectorAll(".nav-item");
const copyItem = document.querySelector("#copy-popup");
const copyItemH3 = document.querySelector("#copy-popup-h3");

// Influence background color based on local time of user (FOR A LATER DATE)
// var date = new Date();
// var hour = date.getHours();
// var bgColorFactor = 50 * Math.sin((Math.PI * (hour - 6)) / 12) + 50;
// var body = document.querySelector("body");
// body.setAttribute("bg-color-factor", bgColorFactor);

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

function copyToClipboard(buttonId) {
	const copyObj = {
		email: "kyleodore@gmail.com",
		phoneNumber: "+1 (206) 434 9661",
		address: "1812 N 40TH ST, APT B, SEATTLE WA 98103-8352"
	};

	const copyDiv = document.getElementById("copy-popup");
	const copyH3 = document.getElementById("copy-popup-h3");

	navigator.clipboard.writeText(copyObj[buttonId]).then(
		function() {
			/* clipboard successfully set */
			copyItem.classList.remove("hidden");
			copyH3.innerText = "Copied the text: " + copyObj[buttonId];
			setTimeout(function() {
				copyItem.classList.add("hidden");
			}, 1500);
		},
		function() {
			/* clipboard write failed */
			copyItem.classList.add("failed");
			copyItem.classList.remove("hidden");
			copyH3.innerText = "Couldn't copy the text. Please try again";
			setTimeout(function() {
				copyItem.classList.add("hidden");
			}, 1500);
		}
	);
}
