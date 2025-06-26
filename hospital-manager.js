// MediFlow - Hospital Manager
// This script manages hospital data and integrates with the AI system

;(() => {
  // Initialize when the DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    // Check if we're on the hospitals page
    if (window.location.pathname.includes("hospitals")) {
      initializeHospitalsPage()
    }
  })

  // Initialize the hospitals page
  function initializeHospitalsPage() {
    console.log("MediFlow: Initializing hospitals page")

    // Set up AI-driven hospital recommendations
    setupHospitalRecommendations()

    // Set up real-time wait time updates
    setupWaitTimeUpdates()

    // Set up bed availability tracking
    setupBedAvailabilityTracking()
  }

  // Set up AI-driven hospital recommendations
  function setupHospitalRecommendations() {
    // This would connect to your backend AI system for hospital recommendations
    // For now, we'll add a simple recommendation system based on search

    const searchInput = document.getElementById("hospitalSearch")
    if (searchInput) {
      // Store the original hospital data
      const hospitalCards = document.querySelectorAll(".hospital-card")
      const originalHospitals = Array.from(hospitalCards).map((card) => ({
        element: card,
        name: card.querySelector(".hospital-name").textContent.toLowerCase(),
        address: card.querySelector(".hospital-address").textContent.toLowerCase(),
        specialty: card.querySelector(".detail-text:last-child").textContent.toLowerCase(),
      }))

      // Add an enhanced search function
      searchInput.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase()
        const hospitalsGrid = document.getElementById("hospitalsGrid")

        if (!searchTerm) {
          // Reset to original order
          hospitalsGrid.innerHTML = ""
          originalHospitals.forEach((hospital) => {
            hospitalsGrid.appendChild(hospital.element)
          })
          return
        }

        // Score each hospital based on the search term
        const scoredHospitals = originalHospitals.map((hospital) => {
          let score = 0

          // Check name match (highest priority)
          if (hospital.name.includes(searchTerm)) {
            score += 10
          }

          // Check address match
          if (hospital.address.includes(searchTerm)) {
            score += 5
          }

          // Check specialty match
          if (hospital.specialty.includes(searchTerm)) {
            score += 8
          }

          return {
            hospital,
            score,
          }
        })

        // Filter out non-matches and sort by score
        const filteredHospitals = scoredHospitals.filter((item) => item.score > 0).sort((a, b) => b.score - a.score)

        // Update the display
        hospitalsGrid.innerHTML = ""

        if (filteredHospitals.length === 0) {
          hospitalsGrid.innerHTML =
            '<p style="grid-column: 1/-1; text-align: center; padding: 30px; color: #fff;">No hospitals found matching your search criteria.</p>'
          return
        }

        filteredHospitals.forEach((item) => {
          hospitalsGrid.appendChild(item.hospital.element)
        })
      })
    }
  }

  // Set up real-time wait time updates
  function setupWaitTimeUpdates() {
    // This would connect to your backend AI system for wait time predictions
    // For now, we'll simulate it with random wait times that update periodically

    const waitingTimes = document.querySelectorAll(".waiting-time")
    if (waitingTimes.length > 0) {
      // Initial update
      updateWaitTimes()

      // Update every minute
      setInterval(updateWaitTimes, 60000)
    }

    function updateWaitTimes() {
      waitingTimes.forEach((element) => {
        // Generate a random wait time between 5-45 minutes
        const waitMinutes = Math.floor(Math.random() * 40) + 5
        element.innerHTML = `<i class="fas fa-clock"></i> Current wait: ${waitMinutes} minutes`

        // Add color coding based on wait time
        if (waitMinutes < 15) {
          element.style.color = "#00b65b" // Green for short wait
        } else if (waitMinutes < 30) {
          element.style.color = "#ffa500" // Orange for medium wait
        } else {
          element.style.color = "#f70000" // Red for long wait
        }
      })
    }
  }

  // Set up bed availability tracking
  function setupBedAvailabilityTracking() {
    // This would connect to your backend AI system for bed availability predictions
    // For now, we'll simulate it with random availability that updates periodically

    const hospitalDetails = document.querySelectorAll(".hospital-details")
    if (hospitalDetails.length > 0) {
      // Add bed availability information to each hospital card
      hospitalDetails.forEach((element) => {
        // Create a new detail element for bed availability
        const bedDetail = document.createElement("div")
        bedDetail.className = "detail"

        const detailIcon = document.createElement("div")
        detailIcon.className = "detail-icon"
        detailIcon.innerHTML = '<i class="fas fa-bed"></i>'

        const detailText = document.createElement("span")
        detailText.className = "detail-text bed-availability"

        bedDetail.appendChild(detailIcon)
        bedDetail.appendChild(detailText)
        element.appendChild(bedDetail)
      })

      // Initial update
      updateBedAvailability()

      // Update every 5 minutes
      setInterval(updateBedAvailability, 300000)
    }

    function updateBedAvailability() {
      const bedAvailability = document.querySelectorAll(".bed-availability")

      bedAvailability.forEach((element) => {
        // Generate a random availability percentage between 10-90%
        const availabilityPercent = Math.floor(Math.random() * 80) + 10
        element.textContent = `${availabilityPercent}% Available`

        // Add color coding based on availability
        if (availabilityPercent > 50) {
          element.style.color = "#00b65b" // Green for high availability
        } else if (availabilityPercent > 20) {
          element.style.color = "#ffa500" // Orange for medium availability
        } else {
          element.style.color = "#f70000" // Red for low availability
        }
      })
    }
  }
})()

