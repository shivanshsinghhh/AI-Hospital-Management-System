// Common JavaScript for all pages

document.addEventListener("DOMContentLoaded", () => {
  // Loading screen animation
  if (document.getElementById("loading-screen")) {
    const loadingScreen = document.getElementById("loading-screen")
    const mainContent = document.getElementById("main-content")
    const loadingProgress = document.getElementById("loading-progress")

    // Simulate loading progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      loadingProgress.style.width = progress + "%"

      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          loadingScreen.classList.add("fade-out")
          mainContent.classList.add("fade-in")
          setTimeout(() => {
            loadingScreen.style.display = "none"
          }, 500)
        }, 500)
      }
    }, 100)
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn")
  const nav = document.getElementById("main-nav")

  if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener("click", function () {
      this.classList.toggle("active")
      nav.classList.toggle("active")
    })
  }

  // Set active nav item based on current page
  const currentPage = window.location.pathname.split("/").pop()
  const navLinks = document.querySelectorAll("nav ul li a")

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href")
    if (currentPage === linkPage || (currentPage === "" && linkPage === "index.html")) {
      link.classList.add("active")
    } else {
      link.classList.remove("active")
    }
  })
})

// Function to get URL parameters
function getUrlParameter(name) {
  name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]")
  const regex = new RegExp("[\\?&]" + name + "=([^&#]*)")
  const results = regex.exec(location.search)
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "))
}

// Function to format date
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

