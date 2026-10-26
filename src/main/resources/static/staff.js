
const ordersContainer = document.getElementById("ordersContainer");
const message = document.getElementById("message");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const lastUpdated = document.getElementById("lastUpdated");

let allOrders = [];

const statusActions = {
    BOOKED: {
        label: "Start Preparing",
        endpoint: "preparing"
    },
    PREPARING: {
        label: "Mark Ready",
        endpoint: "ready"
    },
    READY: {
        label: "Mark Collected",
        endpoint: "collected"
    }
};

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function formatPickupTime(value) {
    if (!value) return "Not specified";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString();
}

function updateSummary(orders) {
    document.getElementById("totalOrders").textContent = orders.length;

    document.getElementById("preparingOrders").textContent =
        orders.filter(order =>
            String(order.status ?? "").toUpperCase() === "PREPARING"
        ).length;

    document.getElementById("readyOrders").textContent =
        orders.filter(order =>
            String(order.status ?? "").toUpperCase() === "READY"
        ).length;

    document.getElementById("collectedOrders").textContent =
        orders.filter(order =>
            String(order.status ?? "").toUpperCase() === "COLLECTED"
        ).length;
}

function renderOrders() {
    const search = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;

    const filteredOrders = allOrders.filter(order => {
        const status = String(order.status ?? "").toUpperCase();

        const matchesSearch = [
            order.id,
            order.studentName,
            order.foodName
        ].some(value =>
            String(value ?? "").toLowerCase().includes(search)
        );

        const matchesStatus =
            selectedStatus === "ALL" || status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    if (filteredOrders.length === 0) {
        ordersContainer.innerHTML = allOrders.length === 0
            ? "<p>No orders found yet.</p>"
            : "<p>No matching orders found.</p>";
        return;
    }

    ordersContainer.innerHTML = filteredOrders.map(order => {
        const status = String(order.status ?? "").toUpperCase();
        const action = statusActions[status];

        const actionButton = action
            ? `<button type="button"
                 class="status-button"
                 data-id="${escapeHTML(order.id)}"
                 data-endpoint="${action.endpoint}">
                 ${action.label}
               </button>`
            : "";

        return `
            <article class="order-card">
                <h3>Order #${escapeHTML(order.id)}</h3>
                <p><strong>Student:</strong>
                   ${escapeHTML(order.studentName)}</p>
                <p><strong>Food:</strong>
                   ${escapeHTML(order.foodName)}</p>
                <p><strong>Quantity:</strong>
                   ${escapeHTML(order.quantity ?? 1)}</p>
                <p><strong>Pickup:</strong>
                   ${escapeHTML(formatPickupTime(order.pickupTime))}</p>
                <p><strong>Status:</strong>
                   <span class="status">
                       ${escapeHTML(status || "UNKNOWN")}
                   </span>
                </p>
                <div class="order-actions">
                    ${actionButton}
                </div>
            </article>
        `;
    }).join("");
}

async function loadOrders() {
    try {
        const response = await fetch("/api/orders");

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const orders = await response.json();

        if (!Array.isArray(orders)) {
            throw new Error("The orders API did not return a list.");
        }

        allOrders = orders;

        updateSummary(allOrders);
        renderOrders();

        lastUpdated.textContent =
            "Last updated: " + new Date().toLocaleTimeString();

    } catch (error) {
        ordersContainer.innerHTML =
            "<p>Could not load orders. Check that QuickBite is running.</p>";

        message.textContent = error.message;
    }
}

searchInput.addEventListener("input", renderOrders);
statusFilter.addEventListener("change", renderOrders);

ordersContainer.addEventListener("click", async event => {
    const button = event.target.closest(".status-button");

    if (!button) return;

    const orderId = button.dataset.id;
    const endpoint = button.dataset.endpoint;

    if (!orderId || !endpoint) {
        message.textContent = "Missing order information.";
        return;
    }

    button.disabled = true;
    message.textContent = "Updating order...";

    try {
        const response = await fetch(
            `/api/orders/${encodeURIComponent(orderId)}/${endpoint}`,
            { method: "PUT" }
        );

        if (!response.ok) {
            throw new Error(`Update failed: HTTP ${response.status}`);
        }

        message.textContent =
            `Order #${orderId} updated successfully.`;

        await loadOrders();

    } catch (error) {
        message.textContent = error.message;
        button.disabled = false;
    }
});

document.getElementById("refreshBtn")
    .addEventListener("click", loadOrders);

// Load orders when the dashboard opens.
loadOrders();

// Refresh the dashboard every 15 seconds.
setInterval(loadOrders, 15000);
