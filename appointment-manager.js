// MediFlow - Appointment Manager
// This script manages appointments and integrates with the AI system

;(() => {
  // Store for appointments
  const appointmentStore = {
    // Get all appointments
    getAll: () => {
      const appointments = localStorage.getItem("mediflow_appointments")
      return appointments ? JSON.parse(appointments) : []
    },

    // Add a new appointment
    add: function (appointment) {
      const appointments = this.getAll()

      // Generate an ID if not provided
      if (!appointment.id) {
        appointment.id = Date.now().toString()
      }

      // Add timestamp for sorting
      appointment.timestamp = Date.now()

      // Add to the beginning of the array (newest first)
      appointments.unshift(appointment)

      // Save to localStorage
      localStorage.setItem("mediflow_appointments", JSON.stringify(appointments))

      return appointment
    },

    // Remove an appointment by ID
    remove: function (id) {
      const appointments = this.getAll()
      const updatedAppointments = appointments.filter((app) => app.id !== id)
      localStorage.setItem("mediflow_appointments", JSON.stringify(updatedAppointments))
    },

    // Update an appointment
    update: function (updatedAppointment) {
      const appointments = this.getAll()
      const index = appointments.findIndex((app) => app.id === updatedAppointment.id)

      if (index !== -1) {
        appointments[index] = { ...appointments[index], ...updatedAppointment }
        localStorage.setItem("mediflow_appointments", JSON.stringify(appointments))
        return true
      }

      return false
    },
  }

  // Initialize when the DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    // Check if we're on the appointments page
    if (window.location.pathname.includes("appointments")) {
      initializeAppointmentsPage()
    }

    // Check for last booked appointment from chat
    checkForLastBookedAppointment()
  })

  // Initialize the appointments page
  function initializeAppointmentsPage() {
    console.log("MediFlow: Initializing appointments page")

    // Load and display existing appointments
    loadAppointments()

    // Set up AI-driven queue management
    setupQueueManagement()

    // Set up smart appointment scheduling
    setupSmartScheduling()

    // Set up appointment form submission
    setupAppointmentForm()
  }

  // Load and display existing appointments
  function loadAppointments() {
    const upcomingTab = document.getElementById("upcoming-tab")
    const historyTab = document.getElementById("history-tab")

    if (!upcomingTab || !historyTab) return

    // Clear existing content
    upcomingTab.innerHTML = ""
    historyTab.innerHTML = ""

    // Get all appointments
    const allAppointments = appointmentStore.getAll()

    // Current date for comparison
    const currentDate = new Date()

    // Filter upcoming and past appointments
    const upcomingAppointments = allAppointments.filter((app) => {
      const appDate = new Date(app.date)
      return appDate >= currentDate && app.status !== "cancelled"
    })

    const pastAppointments = allAppointments.filter((app) => {
      const appDate = new Date(app.date)
      return appDate < currentDate || app.status === "cancelled"
    })

    // Display upcoming appointments
    if (upcomingAppointments.length > 0) {
      upcomingAppointments.forEach((appointment) => {
        const appointmentCard = createAppointmentCard(appointment)
        upcomingTab.appendChild(appointmentCard)
      })
    } else {
      upcomingTab.innerHTML =
        '<p style="text-align: center; padding: 30px; color: #666;">You have no upcoming appointments.</p>'
    }

    // Display past appointments
    if (pastAppointments.length > 0) {
      pastAppointments.forEach((appointment) => {
        const historyCard = createHistoryCard(appointment)
        historyTab.appendChild(historyCard)
      })
    } else {
      historyTab.innerHTML =
        '<p style="text-align: center; padding: 30px; color: #666;">You have no appointment history.</p>'
    }
  }

  // Add this function after the loadAppointments function

  // Refresh appointments when new ones are added
  function refreshAppointments() {
    // Load and display existing appointments
    loadAppointments()

    // Scroll to the top of the appointments list
    const upcomingTab = document.getElementById("upcoming-tab")
    if (upcomingTab) {
      upcomingTab.scrollTop = 0
    }
  }

  // Create an appointment card element
  function createAppointmentCard(appointment) {
    const appointmentCard = document.createElement("div")
    appointmentCard.className = "appointment-card"
    appointmentCard.dataset.id = appointment.id

    // Format date for display
    const dateObj = new Date(appointment.date)
    const day = dateObj.getDate()
    const month = dateObj.toLocaleString("default", { month: "short" })

    appointmentCard.innerHTML = `
      <div class="appointment-header">
        <div class="appointment-hospital">${appointment.hospital}</div>
        <div class="appointment-status status-${appointment.status || "confirmed"}">${capitalizeFirstLetter(appointment.status || "Confirmed")}</div>
      </div>
      <div class="appointment-details">
        <div class="appointment-date">
          <div class="date-day">${day}</div>
          <div class="date-month">${month}</div>
        </div>
        <div class="appointment-info">
          <div class="info-row">
            <div class="info-label">Doctor:</div>
            <div class="info-value">${appointment.doctor}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Department:</div>
            <div class="info-value">${appointment.department}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Time:</div>
            <div class="info-value">${appointment.time}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Queue No:</div>
            <div class="info-value">#${appointment.queueNumber}</div>
          </div>
        </div>
      </div>
      <div class="appointment-actions">
        <button class="action-btn reschedule-btn">Reschedule</button>
        <button class="action-btn cancel-btn">Cancel</button>
        <button class="action-btn directions-btn">Get Directions</button>
      </div>
    `

    // Add event listeners to buttons
    const rescheduleBtn = appointmentCard.querySelector(".reschedule-btn")
    const cancelBtn = appointmentCard.querySelector(".cancel-btn")
    const directionsBtn = appointmentCard.querySelector(".directions-btn")

    rescheduleBtn.addEventListener("click", () => {
      document.querySelector('.tab[data-tab="book"]').click()

      // Pre-fill the form with current appointment details
      prefillAppointmentForm(appointment)
    })

    cancelBtn.addEventListener("click", () => {
      if (confirm(`Are you sure you want to cancel your appointment with ${appointment.doctor}?`)) {
        // Update the appointment status
        appointment.status = "cancelled"
        appointmentStore.update(appointment)

        // Reload appointments
        loadAppointments()
      }
    })

    directionsBtn.addEventListener("click", () => {
      alert(`Opening directions to ${appointment.hospital} in Google Maps.`)
    })

    return appointmentCard
  }

  // Create a history card element
  function createHistoryCard(appointment) {
    const historyCard = document.createElement("div")
    historyCard.className = "history-card"
    historyCard.dataset.id = appointment.id

    // Format date for display
    const dateObj = new Date(appointment.date)
    const day = dateObj.getDate()
    const month = dateObj.toLocaleString("default", { month: "short" })

    // Determine status
    const status = appointment.status || (dateObj < new Date() ? "completed" : "confirmed")

    historyCard.innerHTML = `
      <div class="appointment-header">
        <div class="appointment-hospital">${appointment.hospital}</div>
        <div class="appointment-status status-${status}">${capitalizeFirstLetter(status)}</div>
      </div>
      <div class="appointment-details">
        <div class="appointment-date">
          <div class="date-day">${day}</div>
          <div class="date-month">${month}</div>
        </div>
        <div class="appointment-info">
          <div class="info-row">
            <div class="info-label">Doctor:</div>
            <div class="info-value">${appointment.doctor}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Department:</div>
            <div class="info-value">${appointment.department}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Time:</div>
            <div class="info-value">${appointment.time}</div>
          </div>
        </div>
      </div>
      <div class="history-actions">
        <button class="action-btn rebook-btn">Book Follow-up</button>
        ${status === "completed" ? '<button class="action-btn feedback-btn">Leave Feedback</button>' : ""}
      </div>
    `

    // Add event listeners to buttons
    const rebookBtn = historyCard.querySelector(".rebook-btn")
    rebookBtn.addEventListener("click", () => {
      document.querySelector('.tab[data-tab="book"]').click()

      // Pre-fill the form with current appointment details
      prefillAppointmentForm(appointment)
    })

    const feedbackBtn = historyCard.querySelector(".feedback-btn")
    if (feedbackBtn) {
      feedbackBtn.addEventListener("click", () => {
        alert(`Opening feedback form for your appointment with ${appointment.doctor} at ${appointment.hospital}.`)
      })
    }

    return historyCard
  }

  // Pre-fill the appointment form with existing appointment details
  function prefillAppointmentForm(appointment) {
    const hospitalSelect = document.getElementById("hospital")
    const departmentSelect = document.getElementById("department")
    const doctorSelect = document.getElementById("doctor")
    const dateInput = document.getElementById("date")
    const reasonInput = document.getElementById("reason")

    if (hospitalSelect) {
      // Set hospital
      for (let i = 0; i < hospitalSelect.options.length; i++) {
        if (hospitalSelect.options[i].text === appointment.hospital) {
          hospitalSelect.selectedIndex = i
          break
        }
      }

      // Trigger change event to load departments
      const event = new Event("change")
      hospitalSelect.dispatchEvent(event)
    }

    // Set department (after a short delay to allow the options to load)
    setTimeout(() => {
      if (departmentSelect) {
        for (let i = 0; i < departmentSelect.options.length; i++) {
          if (departmentSelect.options[i].text === appointment.department) {
            departmentSelect.selectedIndex = i
            break
          }
        }

        // Trigger change event to load doctors
        const event = new Event("change")
        departmentSelect.dispatchEvent(event)
      }

      // Set doctor (after another short delay)
      setTimeout(() => {
        if (doctorSelect) {
          for (let i = 0; i < doctorSelect.options.length; i++) {
            if (doctorSelect.options[i].text === appointment.doctor) {
              doctorSelect.selectedIndex = i
              break
            }
          }
        }
      }, 100)
    }, 100)

    // Set date
    if (dateInput && appointment.date) {
      // Set to a future date (tomorrow if the original date is in the past)
      const appointmentDate = new Date(appointment.date)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      dateInput.value = appointmentDate > tomorrow ? appointment.date : tomorrow.toISOString().split("T")[0]
    }

    // Set reason
    if (reasonInput && appointment.reason) {
      reasonInput.value = appointment.reason
    }
  }

  // Modify the checkForLastBookedAppointment function to call refreshAppointments
  function checkForLastBookedAppointment() {
    const lastBookedAppointment = localStorage.getItem("lastBookedAppointment")

    if (lastBookedAppointment) {
      try {
        const appointment = JSON.parse(lastBookedAppointment)

        // Add to appointment store
        appointmentStore.add(appointment)

        // Display a notification about the appointment
        showAppointmentNotification(appointment)

        // If we're on the appointments page, reload the appointments
        if (window.location.pathname.includes("appointments")) {
          refreshAppointments()
        }

        // Clear the stored appointment
        localStorage.removeItem("lastBookedAppointment")
      } catch (error) {
        console.error("Error processing last booked appointment:", error)
      }
    }
  }

  // Show a notification about the booked appointment
  function showAppointmentNotification(appointment) {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = "appointment-notification"
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #32007d;
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      max-width: 300px;
    `

    notification.innerHTML = `
      <h3 style="margin: 0 0 10px; font-size: 16px;">Appointment Confirmed</h3>
      <p style="margin: 0 0 5px; font-size: 14px;">Doctor: ${appointment.doctor}</p>
      <p style="margin: 0 0 5px; font-size: 14px;">Date: ${appointment.date}</p>
      <p style="margin: 0 0 5px; font-size: 14px;">Time: ${appointment.time}</p>
      <p style="margin: 0 0 5px; font-size: 14px;">Queue #: ${appointment.queueNumber}</p>
    `

    // Add close button
    const closeButton = document.createElement("button")
    closeButton.innerHTML = "&times;"
    closeButton.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    `
    closeButton.addEventListener("click", () => {
      document.body.removeChild(notification)
    })

    notification.appendChild(closeButton)
    document.body.appendChild(notification)

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 10000)
  }

  // Set up appointment form submission
  function setupAppointmentForm() {
    const appointmentForm = document.getElementById("appointmentForm")

    if (appointmentForm) {
      appointmentForm.addEventListener("submit", function (e) {
        e.preventDefault()

        // Get form data
        const hospital = document.getElementById("hospital")
        const department = document.getElementById("department")
        const doctor = document.getElementById("doctor")
        const date = document.getElementById("date").value
        const time = document.getElementById("time").value
        const reason = document.getElementById("reason").value

        // Validate form
        if (!hospital.value || !department.value || !doctor.value || !date || !time || !reason) {
          alert("Please fill in all fields")
          return
        }

        // Generate queue number (in a real app, this would come from the server)
        const queueNumber = Math.floor(Math.random() * 30) + 1

        // Create appointment object
        const appointment = {
          id: Date.now().toString(),
          hospital: hospital.options[hospital.selectedIndex].text,
          department: department.options[department.selectedIndex].text,
          doctor: doctor.options[doctor.selectedIndex].text,
          date: date,
          time: time,
          reason: reason,
          queueNumber: queueNumber,
          status: "confirmed",
        }

        // Add to appointment store
        appointmentStore.add(appointment)

        // Show confirmation
        alert(
          `Appointment booked successfully!\n\nHospital: ${appointment.hospital}\nDoctor: ${appointment.doctor}\nDate: ${appointment.date}\nTime: ${appointment.time}\n\nYour queue number is: #${appointment.queueNumber}`,
        )

        // Reset form
        this.reset()
        document.querySelectorAll(".time-slot").forEach((s) => s.classList.remove("selected"))

        // Reload appointments
        loadAppointments()

        // Switch to upcoming tab
        document.querySelector('.tab[data-tab="upcoming"]').click()
      })
    }
  }

  // Set up AI-driven queue management
  function setupQueueManagement() {
    // This would connect to your backend AI system for queue predictions
    // For now, we'll simulate it with random wait times that update periodically

    // Update wait times for existing appointments
    const waitingTimes = document.querySelectorAll(".waiting-time")
    if (waitingTimes.length > 0) {
      setInterval(() => {
        waitingTimes.forEach((element) => {
          // Generate a random wait time between 5-45 minutes
          const waitMinutes = Math.floor(Math.random() * 40) + 5
          element.innerHTML = `<i class="fas fa-clock"></i> Current wait: ${waitMinutes} minutes`
        })
      }, 60000) // Update every minute
    }
  }

  // Set up smart appointment scheduling
  function setupSmartScheduling() {
    // This would connect to your backend AI system for smart scheduling
    // For now, we'll add some basic intelligence to the appointment form

    const appointmentForm = document.getElementById("appointmentForm")
    if (appointmentForm) {
      const hospitalSelect = document.getElementById("hospital")
      const departmentSelect = document.getElementById("department")
      const doctorSelect = document.getElementById("doctor")
      const dateInput = document.getElementById("date")
      const timeSlots = document.querySelectorAll(".time-slot")

      // When hospital changes, update departments based on availability
      if (hospitalSelect) {
        hospitalSelect.addEventListener("change", function () {
          // In a real system, this would fetch available departments from the AI backend
          // For now, we'll just simulate it

          // Reset department options
          departmentSelect.innerHTML = '<option value="">-- Select Department --</option>'

          // Add departments based on selected hospital
          const hospital = this.value
          if (hospital) {
            const departments = getAvailableDepartments(hospital)
            departments.forEach((dept) => {
              const option = document.createElement("option")
              option.value = dept.value
              option.textContent = dept.name
              departmentSelect.appendChild(option)
            })
          }
        })
      }

      // When department changes, update doctors based on availability
      if (departmentSelect) {
        departmentSelect.addEventListener("change", function () {
          // Reset doctor options
          doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>'

          // Add doctors based on selected department
          const department = this.value
          const hospital = hospitalSelect.value

          if (department && hospital) {
            const doctors = getAvailableDoctors(hospital, department)
            doctors.forEach((doctor) => {
              const option = document.createElement("option")
              option.value = doctor.value
              option.textContent = doctor.name
              doctorSelect.appendChild(option)
            })
          }
        })
      }

      // When doctor changes, update available dates
      if (doctorSelect) {
        doctorSelect.addEventListener("change", () => {
          // In a real system, this would fetch available dates from the AI backend
          // For now, we'll just set a minimum date of tomorrow

          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)

          const minDate = tomorrow.toISOString().split("T")[0]
          dateInput.min = minDate

          // Clear any previously selected date
          dateInput.value = ""
        })
      }

      // When date changes, update available time slots
      if (dateInput) {
        dateInput.addEventListener("change", () => {
          // In a real system, this would fetch available time slots from the AI backend
          // For now, we'll randomly disable some time slots

          timeSlots.forEach((slot) => {
            // Reset all slots
            slot.classList.remove("selected")
            slot.style.opacity = "1"
            slot.style.cursor = "pointer"
            slot.onclick = function () {
              // Remove selected class from all slots
              timeSlots.forEach((s) => s.classList.remove("selected"))

              // Add selected class to current slot
              this.classList.add("selected")

              // Update hidden input
              document.getElementById("time").value = this.getAttribute("data-time")
            }

            // Randomly disable some slots (30% chance)
            if (Math.random() < 0.3) {
              slot.style.opacity = "0.5"
              slot.style.cursor = "not-allowed"
              slot.onclick = null

              // Add tooltip explaining why it's unavailable
              slot.title = "This slot is already booked"
            }
          })
        })
      }
    }
  }

  // Get available departments for a hospital
  function getAvailableDepartments(hospital) {
    // In a real system, this would come from your AI backend
    // For now, we'll return a static list based on the hospital

    const departments = [
      { value: "cardiology", name: "Cardiology" },
      { value: "neurology", name: "Neurology" },
      { value: "orthopedics", name: "Orthopedics" },
      { value: "pediatrics", name: "Pediatrics" },
      { value: "dermatology", name: "Dermatology" },
    ]

    // Simulate different availability for different hospitals
    if (hospital === "city-general") {
      return departments.filter((d) => d.value !== "dermatology")
    } else if (hospital === "memorial-medical") {
      return departments.filter((d) => d.value !== "pediatrics")
    } else if (hospital === "riverside-health") {
      return departments.filter((d) => d.value !== "neurology")
    } else {
      return departments
    }
  }

  // Get available doctors for a hospital and department
  function getAvailableDoctors(hospital, department) {
    // In a real system, this would come from your AI backend
    // For now, we'll return a static list

    const allDoctors = {
      cardiology: [
        { value: "dr-johnson", name: "Dr. Sarah Johnson" },
        { value: "dr-patel", name: "Dr. Anita Patel" },
      ],
      neurology: [
        { value: "dr-chen", name: "Dr. Michael Chen" },
        { value: "dr-rodriguez", name: "Dr. Carlos Rodriguez" },
      ],
      orthopedics: [
        { value: "dr-smith", name: "Dr. John Smith" },
        { value: "dr-williams", name: "Dr. Emily Williams" },
      ],
      pediatrics: [
        { value: "dr-garcia", name: "Dr. Maria Garcia" },
        { value: "dr-kim", name: "Dr. David Kim" },
      ],
      dermatology: [
        { value: "dr-brown", name: "Dr. Robert Brown" },
        { value: "dr-lee", name: "Dr. Jennifer Lee" },
      ],
    }

    return allDoctors[department] || []
  }

  // Helper function to capitalize the first letter of a string
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }
})()

