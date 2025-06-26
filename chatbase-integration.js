// MediFlow - Chatbase Integration
// This script integrates the Chatbase chat with MediFlow's hospital management system

;(() => {
  // Check if we're using the custom chat interface
  const isCustomChat = document.querySelector(".chat-container") !== null

  // Wait for Chatbase to be initialized
  function waitForChatbase() {
    if (window.chatbase && typeof window.chatbase === "function") {
      initializeChatbaseIntegration()
    } else if (isCustomChat) {
      // If we're using the custom chat interface, we don't need to wait for Chatbase
      setupCustomChatIntegration()
    } else {
      setTimeout(waitForChatbase, 500)
    }
  }

  // Function to set up integration with our custom chat interface
  function setupCustomChatIntegration() {
    console.log("MediFlow: Setting up custom chat integration")

    // We'll handle the chat functionality directly in the chat.html file
    // This function is just a placeholder for any additional integration needed
  }

  // Initialize the integration once Chatbase is loaded
  function initializeChatbaseIntegration() {
    console.log("MediFlow: Initializing Chatbase integration")

    // Set up message interceptor
    setupMessageInterceptor()

    // Add custom actions to Chatbase
    extendChatbase()
  }

  // Set up a message interceptor to process user messages
  function setupMessageInterceptor() {
    // Store the original send message function
    const originalSendMessage = window.chatbase.sendMessage

    // Override the send message function to intercept user messages
    window.chatbase.sendMessage = function (message) {
      // Process the message to detect actions
      processUserMessage(message)

      // Call the original function
      return originalSendMessage.apply(this, arguments)
    }
  }

  // Process user messages to detect action requests
  function processUserMessage(message) {
    const lowerMessage = message.toLowerCase()

    // Check for ambulance booking
    if (lowerMessage.includes("book") && lowerMessage.includes("ambulance")) {
      setTimeout(() => performAction("BOOK_AMBULANCE"), 1000)
    }

    // Check for appointment booking
    else if (lowerMessage.includes("book") && lowerMessage.includes("appointment")) {
      // Extract appointment details if available
      const appointmentData = extractAppointmentData(message)
      setTimeout(() => performAction("BOOK_APPOINTMENT", appointmentData), 1000)
    }

    // Check for hospital navigation
    else if (lowerMessage.includes("choose") && lowerMessage.includes("hospital")) {
      setTimeout(() => performAction("NAVIGATE_TO_HOSPITAL"), 1000)
    }

    // Check for page navigation
    else if (lowerMessage.includes("open") && lowerMessage.includes("page")) {
      const pageName = extractPageName(message)
      if (pageName) {
        setTimeout(() => performAction("NAVIGATE_TO_PAGE", { page: pageName }), 1000)
      }
    }
  }

  // Extract appointment data from message
  function extractAppointmentData(message) {
    // This is a simple implementation - in a real system, you would use NLP
    // to extract structured data from the message
    const data = {
      doctor: null,
      department: null,
      hospital: null,
      date: null,
      time: null,
      reason: "General checkup",
    }

    // Extract doctor
    const doctorMatch = message.match(/doctor\s*:?\s*([A-Za-z\s.]+)/i)
    if (doctorMatch) data.doctor = doctorMatch[1].trim()

    // Extract department
    const departmentMatch = message.match(/department\s*:?\s*([A-Za-z\s]+)/i)
    if (departmentMatch) data.department = departmentMatch[1].trim()

    // Extract hospital
    const hospitalMatch = message.match(/hospital\s*:?\s*([A-Za-z\s]+)/i)
    if (hospitalMatch) data.hospital = hospitalMatch[1].trim()

    // Extract date
    const dateMatch = message.match(/date\s*:?\s*([0-9\-/]+)/i)
    if (dateMatch) data.date = dateMatch[1].trim()

    // Extract time
    const timeMatch = message.match(/time\s*:?\s*([0-9:]+\s*[ap]m)/i)
    if (timeMatch) data.time = timeMatch[1].trim()

    // Extract reason
    const reasonMatch = message.match(/reason\s*:?\s*([A-Za-z\s.,]+)/i)
    if (reasonMatch) data.reason = reasonMatch[1].trim()

    return data
  }

  // Extract page name from message
  function extractPageName(message) {
    const pageMatches = {
      appointment: "appointments.html",
      hospital: "hospitals.html",
      emergency: "emergency.html",
      chat: "chat.html",
      home: "index-2.html",
    }

    for (const [keyword, page] of Object.entries(pageMatches)) {
      if (message.toLowerCase().includes(keyword)) {
        return page
      }
    }

    return null
  }

  // Perform the requested action
  function performAction(action, data = {}) {
    console.log(`MediFlow: Performing action ${action}`, data)

    // Call our API endpoint
    fetch("/api/chat-actions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, data }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          // Handle successful action
          handleActionSuccess(action, result)
        } else {
          // Handle action failure
          console.error("Action failed:", result.error)
          sendSystemMessage(`I'm sorry, I couldn't complete that action. ${result.error || ""}`)
        }
      })
      .catch((error) => {
        console.error("Error performing action:", error)
        sendSystemMessage("I'm sorry, there was an error processing your request.")

        // Fallback for offline development/testing
        if (action === "BOOK_APPOINTMENT") {
          // Create a mock appointment
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)

          const appointment = {
            id: Date.now().toString(),
            doctor: data.doctor || "Dr. Sarah Johnson",
            department: data.department || "Cardiology",
            hospital: data.hospital || "City General Hospital",
            date: data.date || tomorrow.toISOString().split("T")[0],
            time: data.time || "10:00 AM",
            reason: data.reason || "General checkup",
            queueNumber: Math.floor(Math.random() * 30) + 1,
            status: "confirmed",
          }

          // Store the appointment
          localStorage.setItem("lastBookedAppointment", JSON.stringify(appointment))

          // Show confirmation
          sendSystemMessage(
            `Appointment booked successfully! Your appointment with ${appointment.doctor} at ${appointment.hospital} is scheduled for ${appointment.date} at ${appointment.time}. Your queue number is #${appointment.queueNumber}.`,
          )

          // Redirect to appointments page
          setTimeout(() => {
            window.location.href = "appointments.html"
          }, 2000)
        }
      })
  }

  // Handle successful action
  function handleActionSuccess(action, result) {
    switch (action) {
      case "BOOK_AMBULANCE":
        sendSystemMessage(result.message)
        // Set flag for emergency page
        sessionStorage.setItem("ambulanceRequested", "true")
        // Redirect to emergency page
        setTimeout(() => {
          window.location.href = "emergency.html"
        }, 2000)
        break

      case "BOOK_APPOINTMENT":
        sendSystemMessage(result.message)
        // Store appointment details in localStorage for the appointments page
        localStorage.setItem("lastBookedAppointment", JSON.stringify(result.appointment))
        // Redirect to appointments page
        setTimeout(() => {
          window.location.href = "appointments.html"
        }, 2000)
        break

      case "NAVIGATE_TO_HOSPITAL":
        sendSystemMessage("Opening the hospitals page for you.")
        // Redirect to hospitals page
        setTimeout(() => {
          window.location.href = result.redirect
        }, 1000)
        break

      case "NAVIGATE_TO_PAGE":
        sendSystemMessage(
          `Opening the ${result.redirect.replace(".html", "").replace("index-2", "home")} page for you.`,
        )
        // Redirect to the requested page
        setTimeout(() => {
          window.location.href = result.redirect
        }, 1000)
        break
    }
  }

  // Send a system message to the chat
  function sendSystemMessage(message) {
    // Check if we can add a message to the chat
    if (window.chatbase && window.chatbase.addMessage) {
      window.chatbase.addMessage({
        role: "assistant",
        content: message,
      })
    } else {
      // Fallback: alert the message
      alert(message)
    }
  }

  // Extend Chatbase with custom actions
  function extendChatbase() {
    // Add custom actions to Chatbase if needed
    if (window.chatbase) {
      window.chatbase.bookAmbulance = () => {
        performAction("BOOK_AMBULANCE")
      }

      window.chatbase.bookAppointment = (data) => {
        performAction("BOOK_APPOINTMENT", data)
      }

      window.chatbase.navigateToHospital = () => {
        performAction("NAVIGATE_TO_HOSPITAL")
      }

      window.chatbase.navigateToPage = (page) => {
        performAction("NAVIGATE_TO_PAGE", { page })
      }
    }
  }

  // Start the initialization process
  waitForChatbase()
})()

