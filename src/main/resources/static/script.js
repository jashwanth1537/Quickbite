
/* =========================================
   QUICKBITE - FOOD IMAGE MAPPING
========================================= */

const foodImages = {
    "chicken fried rice": "/images/chicken%20fried%20rice.png",
    "egg fried rice": "/images/egg%20fried%20rice.png",
    "veg fried rice": "/images/veg%20fried%20rice.png",
    "vegetable fried rice": "/images/veg%20fried%20rice.png",
    "paneer fried rice": "/images/paneer%20fried%20rice.png",
    "biryani": "/images/biryani.png",
    "meals": "/images/meals.png",
    "rice": "/images/veg%20fried%20rice.png",
    "chicken noodles": "/images/chicken%20noodles.png",
    "egg noodles": "/images/egg%20noodles.png",
    "veg noodles": "/images/veg%20noodles.png",
    "vegetable noodles": "/images/veg%20noodles.png",
    "samosa": "/images/samosa.png",
    "masala dosa": "/images/masala%20dosa.png",
    "onion dosa": "/images/onion%20dosa.png",
    "plain dosa": "/images/plain%20dosa.png",
    "idly": "/images/idly.png",
    "idli": "/images/idly.png",
    "mysore bonda": "/images/mysore%20bonda.png",
    "vada": "/images/vada.png",
    "puri": "/images/puri.png",
    "chapathi": "/images/chapathi.png"
};

function getFoodImage(name) {
    const key = String(name || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

    return foodImages[key] || "/images/meals.png";
}

/* =========================================
   ESCAPE HTML
========================================= */

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
   ORDER SUCCESS POPUP
========================================= */

function showOrderPopup(order) {
    document.getElementById("orderPopupOverlay")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "orderPopupOverlay";
    overlay.className = "order-popup-overlay";

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
                🍽️ ${escapeHTML(order?.foodName || "Your selected food")}
            </div>

            <div class="order-popup-id">
                Order ID: ${escapeHTML(order?.id ?? "Confirmed")}
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
        if (event.key === "Escape") closePopup();
    }

    closeButton.addEventListener("click", closePopup);

    overlay.addEventListener("click", event => {
        if (event.target === overlay) closePopup();
    });

    document.addEventListener("keydown", handleEscape);
    closeButton.focus();
}

/* =========================================
   LOAD CANTEEN TIMINGS
========================================= */

async function loadTimings() {
    const container = document.getElementById("timings");
    if (!container) return;

    try {
        const response = await fetch("/api/timings", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Unable to load timings.");
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            container.textContent = "No canteen timings available.";
            return;
        }

        container.innerHTML = data.map(timing => {
            const mealType = String(timing.mealType || "");
            const color = mealType.toLowerCase()
                .replace(/[^a-z0-9_-]/g, "");

            return `
                <div class="timing-card ${color}">
                    <h3>${escapeHTML(mealType)}</h3>
                    <p>
                        ${escapeHTML(timing.startTime)} -
                        ${escapeHTML(timing.endTime)}
                    </p>
                </div>
            `;
        }).join("");
    } catch (error) {
        container.textContent = "Unable to load canteen timings.";
        console.error("Timings error:", error);
    }
}

/* =========================================
   LOAD ALL AVAILABLE FOOD
   No weekday restrictions.
========================================= */

async function loadFood() {
    const container = document.getElementById("food");
    if (!container) return;

    container.textContent = "Loading available food...";

    try {
        const response = await fetch("/api/food", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                "Food API returned HTTP " + response.status
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Food API did not return a list.");
        }

        // Display every food item marked as available.
        const availableFood = data.filter(food =>
            food.available === true ||
            String(food.available).toLowerCase() === "true"
        );

        if (availableFood.length === 0) {
            container.textContent =
                "No food available. Please check your food database.";
            return;
        }

        container.innerHTML = availableFood.map(food => {
            const name = escapeHTML(food.name);
            const meal = escapeHTML(food.mealType || "Food");
            const image = getFoodImage(food.name);
            const price = Number(food.price);
            const foodId = Number(food.id);

            const displayPrice = Number.isFinite(price)
                ? price.toFixed(price % 1 === 0 ? 0 : 2)
                : escapeHTML(food.price);

            return `
                <article class="food-card">
                    <img
                        class="food-image"
                        src="${escapeHTML(image)}"
                        alt="${name}"
                        loading="lazy"
                        onerror="this.onerror=null;this.src='/images/meals.png';"
                    >

                    <div class="food-info">
                        <h3>${name}</h3>

                        <p class="food-price">
                            ₹${displayPrice}
                        </p>

                        <div class="food-bottom">
                            <span class="meal-tag">${meal}</span>

                            <button
                                class="add-button"
                                type="button"
                                data-food-id="${foodId}"
                                data-food-name="${name}"
                                aria-label="Book ${name}">
                                +
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

    } catch (error) {
        container.textContent =
            "Unable to load food. Please refresh the page.";

        console.error("Food loading error:", error);
    }
}

/* =========================================
   HANDLE FOOD BOOKING BUTTONS
========================================= */

document.addEventListener("click", event => {
    const button = event.target.closest(".add-button");
    if (!button) return;

    bookFood(
        Number(button.dataset.foodId),
        button.dataset.foodName
    );
});

/* =========================================
   BOOK FOOD
========================================= */

async function bookFood(foodId, foodName) {
    const message = document.getElementById("booking-message");

    if (!Number.isFinite(foodId) || foodId <= 0) {
        const errorMessage = "Invalid food ID. Please check /api/food.";

        if (message) message.textContent = errorMessage;
        else alert(errorMessage);

        return;
    }

    const studentName = prompt("Enter your name:");

    if (!studentName || !studentName.trim()) return;

    const pickupTime = prompt(
        "Enter pickup date and time:\n" +
        "YYYY-MM-DDTHH:MM:SS\n\n" +
        "Choose a time at least 30 minutes from now."
    );

    if (!pickupTime) return;

    const selectedTime = new Date(pickupTime);

    if (
        Number.isNaN(selectedTime.getTime()) ||
        selectedTime.getTime() < Date.now() + 30 * 60 * 1000
    ) {
        const errorMessage =
            "Choose a valid pickup time at least 30 minutes from now.";

        if (message) message.textContent = errorMessage;
        else alert(errorMessage);

        return;
    }

    if (message) message.textContent = "Booking your order...";

    try {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                studentName: studentName.trim(),
                foodName,
                quantity: 1,
                pickupTime
            })
        });

        const order = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                order.message || order.error || "Booking failed."
            );
        }

        if (message) {
            message.textContent =
                `Booking successful! Order ID: ${order.id}.`;
        }

        const orderIdInput = document.getElementById("orderId");

        if (orderIdInput && order.id != null) {
            orderIdInput.value = order.id;
        }

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
        console.error("Order tracking elements were not found.");
        return;
    }

    const orderId = orderIdInput.value.trim();

    if (!orderId || Number(orderId) < 1) {
        statusArea.textContent = "Please enter a valid Order ID.";
        return;
    }

    statusArea.textContent = "Checking your order...";

    try {
        const response = await fetch("/api/orders", {
            cache: "no-store"
        });

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

        document.querySelectorAll(".progress-step").forEach(
            (step, index) => {
                step.classList.toggle(
                    "done",
                    currentIndex >= 0 && index < currentIndex
                );

                step.classList.toggle(
                    "active",
                    index === currentIndex
                );
            }
        );

        statusArea.textContent =
            `Order #${order.id}: ${status || "Status unavailable"}`;

    } catch (error) {
        document.querySelectorAll(".progress-step").forEach(step => {
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
