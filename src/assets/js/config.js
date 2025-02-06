"use strict";

/* -------------------------------------------------------------------------- */
/*                              Config                                        */
/* -------------------------------------------------------------------------- */
var CONFIG = {
  isNavbarVerticalCollapsed: false,
  theme: 'light',
  isRTL: false,
  isFluid: false,
  navbarStyle: 'transparent',
  navbarPosition: 'vertical'
};

Object.keys(CONFIG).forEach(function (key) {
  if (localStorage.getItem(key) === null) {
    localStorage.setItem(key, CONFIG[key]);
  }
});

function updateThemeIcon(selectedTheme) {
  const themeIcons = {
    light: '<span class="fas fa-sun fs-7"></span>',
    dark: '<span class="fas fa-moon fs-7"></span>',
    auto: '<span class="fas fa-adjust fs-7"></span>'
  };

  const dropdownToggle = document.getElementById('themeSwitchDropdown');
  if (dropdownToggle) {
    dropdownToggle.innerHTML = themeIcons[selectedTheme];
  }
}

let theme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-bs-theme', theme === 'auto'
  ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  : theme);
updateThemeIcon(theme);

if (JSON.parse(localStorage.getItem('isNavbarVerticalCollapsed'))) {
  document.documentElement.classList.add('navbar-vertical-collapsed');
}

document.querySelectorAll('[data-theme-control="theme"]').forEach((button) => {
  button.addEventListener('click', function () {
    const selectedTheme = this.value;
    localStorage.setItem('theme', selectedTheme);
    document.documentElement.setAttribute('data-bs-theme', selectedTheme === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : selectedTheme);
    updateThemeIcon(selectedTheme);
  });
});
