/* =========================================================
   REAL ABBA BOOSTING
   Customer App Logic
   Supabase-compatible
   ========================================================= */

(() => {
  "use strict";

  const PRICE_LIST = {
    "TikTok Followers": 6000,
    "TikTok Likes": 1000,
    "TikTok Views": 400,

    "Instagram Followers": 5500,
    "Instagram Likes": 800,
    "Instagram Views": 300,

    "YouTube Subscribers": 65000,
    "YouTube Views": 2500,

    "Facebook Followers": 5300,

    "Telegram Members": 5000
  };

  const formatNaira = (amount) => {
    return "₦" + Number(amount || 0).toLocaleString("en-NG");
  };

  const getPrice = (service) => {
    return PRICE_LIST[service] || 0;
  };

  const calculatePrice = (service, quantity) => {
    const pricePer1000 = getPrice(service);
    const qty = Number(quantity || 0);

    if (!pricePer1000 || !qty) return 0;

    return (pricePer1000 / 1000) * qty;
  };

  /* =========================================================
     GLOBAL STATE
     ========================================================= */

  window.realAbbaPrices = PRICE_LIST;

  window.realAbbaFormatNaira = formatNaira;

  window.realAbbaCalculatePrice = calculatePrice;

  let currentUser = null;
  let walletBalance = 0;

  /* =========================================================
     SUPABASE
     ========================================================= */

  const getSupabase = () => {
    return window.supabaseClient || null;
  };

  /* =========================================================
     LOCAL WALLET FALLBACK
     ========================================================= */

  function walletStorageKey(user) {
    if (!user) return "realAbbaWallet_guest";
    return `realAbbaWallet_${user.id}`;
  }

  function loadWallet() {
    try {
      const saved = localStorage.getItem(walletStorageKey(currentUser));

      if (saved !== null) {
        walletBalance = Number(saved) || 0;
      } else {
        walletBalance = 0;
      }
    } catch (error) {
      walletBalance = 0;
    }

    updateWalletDisplay();
  }

  function saveWallet() {
    try {
      localStorage.setItem(
        walletStorageKey(currentUser),
        String(walletBalance)
      );
    } catch (error) {
      console.warn("Could not save wallet balance.");
    }

    updateWalletDisplay();
  }

  /* =========================================================
     WALLET DISPLAY
     ========================================================= */

  function updateWalletDisplay() {
    const possibleIds = [
      "walletBalance",
      "balance",
      "accountBalance",
      "homeBalance",
      "walletAmount"
    ];

    possibleIds.forEach((id) => {
      const element = document.getElementById(id);

      if (element) {
        element.textContent = formatNaira(walletBalance);
      }
    });
  }

  /* =========================================================
     TOP UP BUTTON
     ========================================================= */

  function createTopUpButton() {
    if (document.getElementById("realAbbaTopUpButton")) {
      return;
    }

    const button = document.createElement("button");

    button.id = "realAbbaTopUpButton";
    button.type = "button";
    button.className = "topup-btn";
    button.innerHTML = `
      <span>💳</span>
      <span>Top Up Account</span>
    `;

    button.addEventListener("click", openTopUpModal);

    const locations = [
      document.getElementById("walletCard"),
      document.getElementById("balanceCard"),
      document.getElementById("page-home"),
      document.getElementById("page-account"),
      document.querySelector(".wallet-card"),
      document.querySelector(".balance-card")
    ];

    const target = locations.find((element) => element);

    if (target) {
      target.appendChild(button);
    } else {
      document.body.appendChild(button);
    }
  }

  /* =========================================================
     TOP UP MODAL
     ========================================================= */

  function openTopUpModal() {
    let modal = document.getElementById("realAbbaTopUpModal");

    if (!modal) {
      modal = document.createElement("div");

      modal.id = "realAbbaTopUpModal";

      modal.innerHTML = `
        <div class="topup-overlay">
          <div class="topup-modal">

            <button
              type="button"
              class="topup-close"
              id="closeTopUpModal"
            >
              ×
            </button>

            <div class="topup-icon">💳</div>

            <h2>Fund Your Account</h2>

            <p class="topup-description">
              Add money to your REAL ABBA BOOSTING wallet
              and use your balance to place orders.
            </p>

            <label for="topUpAmount">
              Amount
            </label>

            <input
              type="number"
              id="topUpAmount"
              min="100"
              step="100"
              placeholder="Enter amount"
            />

            <div class="quick-topup">
              <button type="button" data-amount="1000">₦1,000</button>
              <button type="button" data-amount="2000">₦2,000</button>
              <button type="button" data-amount="5000">₦5,000</button>
              <button type="button" data-amount="10000">₦10,000</button>
            </div>

            <button
              type="button"
              class="confirm-topup-btn"
              id="confirmTopUp"
            >
              Continue to Payment
            </button>

            <p class="topup-note">
              Your payment will be processed securely.
            </p>

          </div>
        </div>
      `;

      document.body.appendChild(modal);

      document
        .getElementById("closeTopUpModal")
        .addEventListener("click", closeTopUpModal);

      document
        .getElementById("confirmTopUp")
        .addEventListener("click", processTopUp);

      modal.querySelectorAll("[data-amount]").forEach((button) => {
        button.addEventListener("click", () => {
          document.getElementById("topUpAmount").value =
            button.dataset.amount;
        });
      });

      modal
        .querySelector(".topup-overlay")
        .addEventListener("click", (event) => {
          if (event.target.classList.contains("topup-overlay")) {
            closeTopUpModal();
          }
        });
    }

    modal.classList.add("show");

    const amountInput = document.getElementById("topUpAmount");

    if (amountInput) {
      amountInput.focus();
    }
  }

  function closeTopUpModal() {
    const modal = document.getElementById("realAbbaTopUpModal");

    if (modal) {
      modal.classList.remove("show");
    }
  }

  /* =========================================================
     TOP UP PROCESS
     ========================================================= */

  async function processTopUp() {
    const amountInput = document.getElementById("topUpAmount");
    const amount = Number(amountInput?.value || 0);

    if (!amount || amount < 100) {
      showAppMessage(
        "Please enter a valid top-up amount of at least ₦100.",
        "error"
      );
      return;
    }

    /*
      IMPORTANT:
      We do NOT automatically add money to the wallet here.

      A real payment gateway must confirm payment first.
      This prevents customers from giving themselves
      free wallet credit.

      The button below creates a pending top-up request.
    */

    try {
      const supabase = getSupabase();

      if (supabase && currentUser) {
        const { error } = await supabase
          .from("topups")
          .insert({
            user_id: currentUser.id,
            amount: amount,
            status: "pending"
          });

        if (error) {
          console.warn("Top-up request could not be saved:", error);
        }
      }
    } catch (error) {
      console.warn("Top-up request error:", error);
    }

    closeTopUpModal();

    showAppMessage(
      `Top-up request created for ${formatNaira(amount)}. Payment processing will be connected next.`,
      "success"
    );
  }

  /* =========================================================
     SERVICES
     ========================================================= */

  function setupServicePricing() {
    const serviceSelect =
      document.getElementById("serviceType") ||
      document.getElementById("service") ||
      document.getElementById("orderService");

    const quantityInput =
      document.getElementById("orderQuantity") ||
      document.getElementById("quantity");

    const totalElement =
      document.getElementById("orderTotal") ||
      document.getElementById("total") ||
      document.getElementById("calculatedTotal");

    if (!serviceSelect || !quantityInput) {
      return;
    }

    function updateTotal() {
      const service = serviceSelect.value;
      const quantity = Number(quantityInput.value || 0);

      const total = calculatePrice(service, quantity);

      if (totalElement) {
        totalElement.textContent = formatNaira(total);
      }

      const priceElement =
        document.getElementById("servicePrice") ||
        document.getElementById("pricePer1000");

      if (priceElement) {
        const price = getPrice(service);

        priceElement.textContent =
          price > 0
            ? `${formatNaira(price)} per 1,000`
            : "Select a service";
      }

      const hiddenTotal = document.getElementById("hiddenOrderTotal");

      if (hiddenTotal) {
        hiddenTotal.value = total;
      }
    }

    serviceSelect.addEventListener("change", updateTotal);
    quantityInput.addEventListener("input", updateTotal);

    updateTotal();
  }

  /* =========================================================
     PRICE TABLE
     ========================================================= */

  function renderPriceList() {
    const container =
      document.getElementById("priceList") ||
      document.getElementById("servicesList");

    if (!container) return;

    const entries = Object.entries(PRICE_LIST);

    container.innerHTML = entries
      .map(([service, price]) => {
        return `
          <div class="price-item">
            <div>
              <strong>${service}</strong>
              <small>Per 1,000</small>
            </div>

            <strong>
              ${formatNaira(price)}
            </strong>
          </div>
        `;
      })
      .join("");
  }

  /* =========================================================
     ORDER CALCULATION
     ========================================================= */

  function getOrderDetails() {
    const serviceElement =
      document.getElementById("serviceType") ||
      document.getElementById("service") ||
      document.getElementById("orderService");

    const quantityElement =
      document.getElementById("orderQuantity") ||
      document.getElementById("quantity");

    const linkElement =
      document.getElementById("orderLink") ||
      document.getElementById("url") ||
      document.getElementById("link");

    const service = serviceElement?.value || "";
    const quantity = Number(quantityElement?.value || 0);
    const link = linkElement?.value?.trim() || "";

    const total = calculatePrice(service, quantity);

    return {
      service,
      quantity,
      link,
      total
    };
  }

  /* =========================================================
     PLACE ORDER
     ========================================================= */

  async function placeOrder() {
    const details = getOrderDetails();

    if (!details.service) {
      showAppMessage("Please select a service.", "error");
      return;
    }

    if (!details.quantity || details.quantity <= 0) {
      showAppMessage("Please enter a valid quantity.", "error");
      return;
    }

    if (!details.link) {
      showAppMessage("Please enter the required link.", "error");
      return;
    }

    if (!details.total || details.total <= 0) {
      showAppMessage("Unable to calculate the order price.", "error");
      return;
    }

    if (walletBalance < details.total) {
      showAppMessage(
        `Insufficient balance. You need ${formatNaira(
          details.total - walletBalance
        )} more.`,
        "error"
      );

      openTopUpModal();
      return;
    }

    const order = {
      id: "local-" + Date.now(),
      user_id: currentUser?.id || null,
      service: details.service,
      quantity: details.quantity,
      link: details.link,
      amount: details.total,
      status: "pending",
      created_at: new Date().toISOString()
    };

    /*
      Save locally so the customer can see the order immediately.
    */

    const orders = getLocalOrders();

    orders.unshift(order);

    localStorage.setItem(
      "realAbbaOrders",
      JSON.stringify(orders)
    );

    /*
      Deduct wallet balance.
    */

    walletBalance -= details.total;
    saveWallet();

    /*
      Try saving to Supabase if an orders table exists.
    */

    try {
      const supabase = getSupabase();

      if (supabase && currentUser) {
        const { error } = await supabase
          .from("orders")
          .insert({
            user_id: currentUser.id,
            service: details.service,
            quantity: details.quantity,
            link: details.link,
            amount: details.total,
            status: "pending"
          });

        if (error) {
          console.warn("Supabase order save:", error);
        }
      }
    } catch (error) {
      console.warn("Order database error:", error);
    }

    showAppMessage(
      `Order placed successfully for ${formatNaira(details.total)}.`,
      "success"
    );

    clearOrderForm();
    renderOrders();
  }

  /* =========================================================
     LOCAL ORDERS
     ========================================================= */

  function getLocalOrders() {
    try {
      return JSON.parse(
        localStorage.getItem("realAbbaOrders") || "[]"
      );
    } catch (error) {
      return [];
    }
  }

  function renderOrders() {
    const container =
      document.getElementById("ordersList") ||
      document.getElementById("orderHistory");

    if (!container) return;

    const orders = getLocalOrders();

    if (!orders.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div>📦</div>
          <h3>No orders yet</h3>
          <p>Your orders will appear here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = orders
      .map((order) => {
        const date = new Date(order.created_at);

        return `
          <div class="order-card">

            <div class="order-card-top">
              <strong>${escapeHtml(order.service)}</strong>

              <span class="order-status ${String(
                order.status || "pending"
              ).toLowerCase()}">
                ${escapeHtml(order.status || "pending")}
              </span>
            </div>

            <div class="order-info">
              <p>
                <span>Quantity</span>
                <strong>${Number(
                  order.quantity || 0
                ).toLocaleString()}</strong>
              </p>

              <p>
                <span>Amount</span>
                <strong>${formatNaira(order.amount)}</strong>
              </p>

              <p>
                <span>Date</span>
                <strong>${date.toLocaleString("en-NG")}</strong>
              </p>
            </div>

            <div class="order-link">
              ${escapeHtml(order.link || "")}
            </div>

          </div>
        `;
      })
      .join("");
  }

  /* =========================================================
     CLEAR ORDER FORM
     ========================================================= */

  function clearOrderForm() {
    [
      "serviceType",
      "service",
      "orderService",
      "orderQuantity",
      "quantity",
      "orderLink",
      "url",
      "link"
    ].forEach((id) => {
      const element = document.getElementById(id);

      if (element) {
        element.value = "";
      }
    });

    [
      "orderTotal",
      "total",
      "calculatedTotal"
    ].forEach((id) => {
      const element = document.getElementById(id);

      if (element) {
        element.textContent = "₦0";
      }
    });
  }

  /* =========================================================
     USER ACCOUNT
     ========================================================= */

  async function loadCurrentUser() {
    const supabase = getSupabase();

    if (!supabase) {
      return;
    }

    try {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error) {
        console.warn(error);
        return;
      }

      currentUser = user || null;

      updateUserDisplay();
      loadWallet();
    } catch (error) {
      console.warn("Could not load user:", error);
    }
  }

  function updateUserDisplay() {
    if (!currentUser) return;

    const name =
      currentUser.user_metadata?.name ||
      currentUser.user_metadata?.display_name ||
      currentUser.email?.split("@")[0] ||
      "Customer";

    const email = currentUser.email || "";

    [
      "welcomeName",
      "accountName",
      "profileName"
    ].forEach((id) => {
      const element = document.getElementById(id);

      if (element) {
        element.textContent = name;
      }
    });

    [
      "accountEmail",
      "accountEmail2",
      "profileEmail"
    ].forEach((id) => {
      const element = document.getElementById(id);

      if (element) {
        element.textContent = email;
      }
    });
  }

  /* =========================================================
     SIGN OUT
     ========================================================= */

  async function signOut() {
    const supabase = getSupabase();

    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.warn("Sign out error:", error);
    }

    currentUser = null;
    walletBalance = 0;

    if (typeof window.showAuth === "function") {
      window.showAuth();
    } else {
      window.location.reload();
    }
  }

  /* =========================================================
     APP MESSAGE
     ========================================================= */

  function showAppMessage(message, type = "info") {
    let toast = document.getElementById("appToast");

    if (!toast) {
      toast = document.createElement("div");

      toast.id = "appToast";

      document.body.appendChild(toast);
    }

    toast.className = `app-toast ${type}`;
    toast.textContent = message;

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");
    }, 4500);
  }

  /* =========================================================
     ESCAPE HTML
     ========================================================= */

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =========================================================
     GLOBAL FUNCTIONS
     ========================================================= */

  window.openTopUpModal = openTopUpModal;
  window.closeTopUpModal = closeTopUpModal;
  window.placeOrder = placeOrder;
  window.renderOrders = renderOrders;
  window.signOut = signOut;
  window.getOrderDetails = getOrderDetails;

  /* =========================================================
     INITIALIZE
     ========================================================= */

  async function initializeApp() {
    await loadCurrentUser();

    setupServicePricing();
    renderPriceList();
    renderOrders();
    createTopUpButton();

    /*
      If Supabase authentication changes, update the UI.
    */

    const supabase = getSupabase();

    if (supabase) {
      supabase.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;

        updateUserDisplay();

        if (currentUser) {
          loadWallet();
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeApp
    );
  } else {
    initializeApp();
  }

})();
