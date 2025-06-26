// MediFlow - Emergency Manager
// This script manages emergency services and integrates with the AI system

;(() => {
  // Declare drawAmbulanceMap to avoid errors if it's not defined elsewhere
  window.drawAmbulanceMap =
    window.drawAmbulanceMap ||
    (() => {
      console.warn("drawAmbulanceMap function is not defined.  Ensure it is loaded separately.")
    })

  // Initialize when the DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    // Check if we're on the emergency page
    if (window.location.pathname.includes("emergency")) {
      initializeEmergencyPage()
    }
  })

  // Initialize the emergency page
  function initializeEmergencyPage() {
    console.log("MediFlow: Initializing emergency page")

    // Set up ambulance tracking
    setupAmbulanceTracking()

    // Set up emergency chat integration
    setupEmergencyChatIntegration()
  }

  // Set up ambulance tracking
  function setupAmbulanceTracking() {
    const requestBtn = document.getElementById("request-ambulance")
    const requestForm = document.getElementById("emergency-request-form")
    const tracking = document.getElementById("emergency-tracking")

    if (requestBtn && requestForm && tracking) {
      // Check if there's an ambulance already requested via chat
      const ambulanceRequested = sessionStorage.getItem("ambulanceRequested")

      if (ambulanceRequested) {
        // Show tracking interface immediately
        requestForm.style.display = "none"
        tracking.style.display = "block"

        // Draw ambulance map
        if (typeof drawAmbulanceMap === "function") {
          drawAmbulanceMap()
        }

        // Clear the flag
        sessionStorage.removeItem("ambulanceRequested")
      }

      // Add enhanced functionality to the request button
      requestBtn.addEventListener("click", () => {
        const phoneNumber = document.getElementById("phone-number").value
        if (!phoneNumber) {
          alert("Please enter your phone number")
          return
        }

        requestBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...'
        requestBtn.disabled = true

        // Get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // Success - we have the user's location
              const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }

              // In a real system, send this to your backend
              console.log("User location:", location)

              // Simulate request processing
              setTimeout(() => {
                requestForm.style.display = "none"
                tracking.style.display = "block"

                // Draw ambulance map
                if (typeof drawAmbulanceMap === "function") {
                  drawAmbulanceMap()
                }
              }, 2000)
            },
            (error) => {
              // Error getting location
              console.error("Error getting location:", error)

              // Still proceed, but without precise location
              setTimeout(() => {
                requestForm.style.display = "none"
                tracking.style.display = "block"

                // Draw ambulance map
                if (typeof drawAmbulanceMap === "function") {
                  drawAmbulanceMap()
                }
              }, 2000)
            },
          )
        } else {
          // Geolocation not supported
          console.error("Geolocation is not supported by this browser")

          // Still proceed, but without precise location
          setTimeout(() => {
            requestForm.style.display = "none"
            tracking.style.display = "block"

            // Draw ambulance map
            if (typeof drawAmbulanceMap === "function") {
              drawAmbulanceMap()
            }
          }, 2000)
        }
      })
    }
  }

  // Set up emergency chat integration
  function setupEmergencyChatIntegration() {
    const showChatBtn = document.getElementById("show-chat")
    const guidance = document.getElementById("emergency-guidance")
    const chat = document.getElementById("emergency-chat")

    if (showChatBtn && guidance && chat) {
      showChatBtn.addEventListener("click", () => {
        guidance.style.display = "none"
        chat.style.display = "flex"
      })
    }
  }
})()

