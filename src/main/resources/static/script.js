
/* =========================================
   QUICKBITE - FOOD IMAGE PATHS
   Images are stored in static/images/
========================================= */

// Update these paths if your image filenames are different.
const foodImages = {
    "pizza": "/images/pizza.png",
    "biryani": "/images/biryani.png",
    "burger": "/images/burger.png",
    "sandwich": "/images/sandwich.png",
    "dosa": "/images/dosa.png",
    "idli": "/images/idli.png",
    "rice": "/images/rice.png",
    "samosa": "/images/samosa.png",
    "noodles": "/images/noodles.png"
};

/* Find the correct local image for each food */
function getFoodImage(name) {
    const key = String(name || "").toLowerCase().trim();

    for (const foodName of Object.keys(foodImages)) {
        if (key.includes(foodName)) {
            return foodImages[foodName];
        }
    }

    return "/images/meals.png";
}

/* Safely display text received from the API */
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

/* =========================================
   COLOURFUL ORDER SUCCESS POPUP
========================================= */

function showOrderPopup(order) {
    // Remove an existing popup, if any.
    document.getElementById("orderPopupOverlay")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "orderPopupOverlay";
    overlay.className = "order-popup-overlay";

    const orderId = order?.id ?? "Confirmed";
    const foodName = order?.foodName ?? "Your selected food";

    overlay.innerHTML = `
        <div class="order-popup"
             role="dialog"
             aria-modal="true"
             aria-labelledby="orderPopupTitle">

            <div class="order-popup-icon">✓</div>

            <h2 id="orderPopupTitle">
                🎉 Thank You for Your Order!
            </h2>

            <p class="popup-subtitle">
                Your order has been booked successfully!
            </p>

            <div class="order-popup-food">
                🍽️ ${escapeHTML(foodName)}
            </div>

            <div class="order-popup-id">
                Order ID: ${escapeHTML(orderId)}
            </div>

            <p>
                Thank you for choosing QuickBite.
                Fresh food, less waiting!
            </p>

            <p class="popup-note">
                Keep your Order ID to track your order status.
            </p>

            <button type="button" id="closeOrderPopup">
                Continue
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    const closeButton = document.getElementById("closeOrderPopup");

    function closePopup() {
        overlay.remove();
        document.removeEventListener("keydown", handleEscape);
    }

    function handleEscape(event) {
        if (event.key === "Escape") {
            closePopup();
        }
    }

    closeButton.addEventListener("click", closePopup);

    // Clicking outside the popup also closes it.
    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            closePopup();
        }
    });

    document.addEventListener("keydown", handleEscape);

    closeButton.focus();
}

/* =========================================
   LOAD CANTEEN TIMINGS
========================================= */

function loadTimings() {
    fetch("/api/timings")
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load canteen timings.");
            }

            return response.json();
        })
        .then(data => {
            const container = document.getElementById("timings");

            if (!container) return;

            if (!Array.isArray(data) || data.length === 0) {
                container.textContent = "No canteen timings available.";
                return;
            }

            container.innerHTML = data.map(timing => {
                const meal = escapeHTML(timing.mealType);

                const color = String(timing.mealType || "")
                    .toLowerCase()
                    .replace(/[^a-z0-9_-]/g, "");

                return `
                    <div class="timing-card ${color}">
                        <h3>${meal}</h3>
                        <p>
                            ${escapeHTML(timing.startTime)} -
                            ${escapeHTML(timing.endTime)}
                        </p>
                    </div>
                `;
            }).join("");
        })
        .catch(error => {
            const container = document.getElementById("timings");

            if (container) {
                container.textContent =
                    "Unable to load canteen timings.";
            }

            console.error("Timings error:", error);
        });
}

/* =========================================
   LOAD AVAILABLE FOOD
========================================= */

function loadFood() {
    const container = document.getElementById("food");

    if (!container) return;

    container.textContent = "Loading available food...";

    fetch("/api/food")
        .then(response => {
            if (!response.ok) {
                throw new Error(
                    "Could not load available food. HTTP " +
                    response.status
                );
            }

            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                container.textContent =
                    "No food is available right now.";
                return;
            }

            container.innerHTML = data.map(food => {
                const name = escapeHTML(food.name);
                const meal = escapeHTML(food.mealType);
                const image = getFoodImage(food.name);

                const price = Number(food.price);

                const displayPrice = Number.isFinite(price)
                    ? price.toFixed(price % 1 === 0 ? 0 : 2)
                    : escapeHTML(food.price);

                const foodId = Number(food.id);

                return `
                    <article class="food-card">
                        <img
                            class="food-image"
                            src="${escapeHTML(image)}"
                            alt="${name}"
                            loading="lazy"
                            onerror="this.onerror=null;
                                     this.src='/images/meals.png';"
                        >

                        <div class="food-info">
                            <h3>${name}</h3>

                            <p class="food-price">
                                ₹${displayPrice}
                            </p>

                            <div class="food-bottom">
                                <span class="meal-tag">
                                    ${meal}
                                </span>

                                <button
                                    class="add-button"
                                    type="button"
                                    data-food-id="${escapeHTML(foodId)}"
                                    data-food-name="${name}"
                                    aria-label="Book ${name}">
                                    +
                                </button>
                            </div>
                        </div>
                    </article>
                `;
            }).join("");
        })
        .catch(error => {
            container.textContent =
                "Unable to load available food. Please refresh the page.";

            console.error("Food loading error:", error);
        });
}

/* =========================================
   HANDLE FOOD BOOKING BUTTONS
========================================= */

document.addEventListener("click", event => {
    const button = event.target.closest(".add-button");

    if (!button) return;

    const foodId = Number(button.dataset.foodId);
    const foodName = button.dataset.foodName;

    bookFood(foodId, foodName);
});

/* =========================================
   BOOK FOOD
========================================= */

async function bookFood(foodId, foodName) {
    const message = document.getElementById("booking-message");

    if (!Number.isFinite(foodId) || foodId <= 0) {
        if (message) {
            message.textContent =
                "This food item has no valid ID. Check the food API.";
        }

        return;
    }

    const studentName = prompt("Enter your name:");

    if (!studentName || !studentName.trim()) {
        return;
    }

    const pickupTime = prompt(
        "Enter pickup date and time in this format:\n" +
        "YYYY-MM-DDTHH:MM:SS\n\n" +
        "Choose a time at least 30 minutes from now."
    );

    if (!pickupTime) return;

    const selectedTime = new Date(pickupTime);
    const now = new Date();

    if (
        Number.isNaN(selectedTime.getTime()) ||
        selectedTime.getTime() < now.getTime() + 30 * 60 * 1000
    ) {
        if (message) {
            message.textContent =
                "Choose a valid pickup time at least 30 minutes from now.";
        } else {
            alert(
                "Choose a valid pickup time at least 30 minutes from now."
            );
        }

        return;
    }

    if (message) {
        message.textContent = "Booking your order...";
    }

    try {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                studentName: studentName.trim(),
                foodName: foodName,
                quantity: 1,
                pickupTime: pickupTime
            })
        });

        const order = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                order.message ||
                order.error ||
                "Booking failed. Please try again."
            );
        }

        // Update the booking message after successful booking.
        if (message) {
            message.textContent =
                `Booking successful! Your Order ID is ${order.id}.`;
        }

        // Fill the order tracking input automatically.
        const orderIdInput = document.getElementById("orderId");

        if (orderIdInput && order.id != null) {
            orderIdInput.value = order.id;
        }

        // Show the colourful popup only after the server confirms.
        showOrderPopup({
            ...order,
            foodName: order.foodName || foodName
        });

    } catch (error) {
        if (message) {
            message.textContent = "Booking failed: " + error.message;
        } else {
            alert("Booking failed: " + error.message);
        }

        console.error("Booking error:", error);
    }
}

/* =========================================
   TRACK ORDER STATUS
========================================= */

async function trackOrder() {
    const orderIdInput = document.getElementById("orderId");
    const statusArea = document.getElementById("orderStatus");

    if (!orderIdInput || !statusArea) {
        console.error(
            "Order tracking HTML elements were not found."
        );

        return;
    }

    const orderId = orderIdInput.value.trim();

    if (!orderId || Number(orderId) < 1) {
        statusArea.textContent = "Please enter a valid Order ID.";
        return;
    }

    statusArea.textContent = "Checking your order...";

    try {
        const response = await fetch("/api/orders");

        if (!response.ok) {
            throw new Error("Could not load orders.");
        }

        const orders = await response.json();

        if (!Array.isArray(orders)) {
            throw new Error("Invalid order list received.");
        }

        const order = orders.find(item =>
            String(item.id) === String(orderId)
        );

        if (!order) {
            throw new Error("Order not found.");
        }

        const status = String(order.status || "").toUpperCase();

        const statuses = [
            "BOOKED",
            "PREPARING",
            "READY",
            "COLLECTED"
        ];

        const currentIndex = statuses.indexOf(status);

        document.querySelectorAll(".progress-step")
            .forEach((step, index) => {
                step.classList.toggle(
                    "done",
                    currentIndex >= 0 && index < currentIndex
                );

                step.classList.toggle(
                    "active",
                    index === currentIndex
                );
            });

        statusArea.textContent =
            `Order #${order.id}: ${status || "Status unavailable"} — ` +
            (
                currentIndex === 3
                    ? "Enjoy your meal!"
                    : currentIndex >= 0
                        ? "Your order is progressing!"
                        : "Please check the order status."
            );

    } catch (error) {
        document.querySelectorAll(".progress-step")
            .forEach(step => {
                step.classList.remove("done", "active");
            });

        statusArea.textContent = error.message;
    }
}

/* =========================================
   START QUICKBITE
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadTimings();
    loadFood();
});
