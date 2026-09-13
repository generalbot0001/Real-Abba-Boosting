/* =========================================================
   REAL ABBA BOOSTING
   Customer App Logic
   Supabase + Manual Funding
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     PRODUCT PRICES
     ========================================================= */

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

  /* =========================================================
     RECEIVING BANK DETAILS
     ========================================================= */

  const RECEIVING_BANK = {
    bank: "Opay",
    accountName: "Abdulmajeed Yunusa Aliyu",
    accountNumber: "8103397413"
  };

  /* =========================================================
     HELPERS
     ========================================================= */

  const formatNaira = (amount) => {
    return "₦" + Number(amount || 0).toLocaleString("en-NG");
  };

  const getPrice = (service) => {
    return PRICE_LIST[service] || 0;
  };

  const calculatePrice = (service, quantity) => {
    const pricePer1000 = getPrice(service);
    const qty = Number(quantity || 0);

    if (!pricePer1000 || !qty) {
      return 0;
    }

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
     LOCAL WALLET
     ========================================================= */

  function walletStorageKey(user) {
    if (!user) {
      return "realAbbaWallet_guest";
    }

    return `realAbbaWallet_${user.id}`;
  }

  function loadWallet() {
    try {
      const saved = localStorage.getItem(
        walletStorageKey(currentUser)
      );

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
     FUND ACCOUNT BUTTON
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
      <span>Fund Account</span>
    `;

    button.addEventListener(
      "click",
      openTopUpModal
    );

    const locations = [
      document.getElementById("walletCard"),
      document.getElementById("balanceCard"),
      document.getElementById("page-home"),
      document.getElementById("page-account"),
      document.querySelector(".wallet-card"),
      document.querySelector(".balance-card")
    ];

    const target = locations.find(
      (element) => element
    );

    if (target) {
      target.appendChild(button);
    } else {
      document.body.appendChild(button);
    }
  }

  /* =========================================================
     FUNDING MODAL
     ========================================================= */

  function openTopUpModal() {
    let modal = document.getElementById(
      "realAbbaTopUpModal"
    );

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
              aria-label="Close"
            >
              ×
            </button>

            <div class="topup-icon">
              💳
            </div>

            <h2>
              Fund Your Account
            </h2>

            <p class="topup-description">
              Transfer money to the account below,
              then submit your payment details.
            </p>

            <!-- RECEIVING ACCOUNT -->

            <div class="payment-details">

              <h3>
                Transfer To
              </h3>

              <div class="payment-detail-row">
                <span>Bank</span>
                <strong>
                  ${escapeHtml(RECEIVING_BANK.bank)}
                </strong>
              </div>

              <div class="payment-detail-row">
                <span>Account Name</span>
                <strong>
                  ${escapeHtml(
                    RECEIVING_BANK.accountName
                  )}
                </strong>
              </div>

              <div class="payment-detail-row">
                <span>Account Number</span>
                <strong>
                  ${escapeHtml(
                    RECEIVING_BANK.accountNumber
                  )}
                </strong>
              </div>

            </div>

            <div class="funding-instructions">
              After making the transfer,
              enter the details of the bank account
              you used to send the money.
            </div>

            <!-- CUSTOMER BANK -->

            <label for="customerBankName">
              Your Bank Name
            </label>

            <input
              type="text"
              id="customerBankName"
              placeholder="e.g. Access Bank"
              autocomplete="organization"
            />

            <!-- CUSTOMER ACCOUNT NAME -->

            <label for="customerAccountName">
              Your Account Name
            </label>

            <input
              type="text"
              id="customerAccountName"
              placeholder="Name on the account you paid from"
              autocomplete="name"
            />

            <!-- AMOUNT -->

            <label for="topUpAmount">
              Amount Sent
            </label>

            <input
              type="number"
              id="topUpAmount"
              min="100"
              step="100"
              placeholder="Enter amount sent"
              inputmode="numeric"
            />

            <div class="quick-topup">

              <button
                type="button"
                data-amount="1000"
              >
                ₦1,000
              </button>

              <button
                type="button"
                data-amount="2000"
              >
                ₦2,000
              </button>

              <button
                type="button"
                data-amount="5000"
              >
                ₦5,000
              </button>

              <button
                type="button"
                data-amount="10000"
              >
                ₦10,000
              </button>

            </div>

            <!-- REFERENCE -->

            <label for="transactionReference">
              Transaction Reference
            </label>

            <input
              type="text"
              id="transactionReference"
              placeholder="Enter transfer reference"
              autocomplete="off"
            />

            <button
              type="button"
              class="confirm-topup-btn"
              id="confirmTopUp"
            >
              Submit Funding Request
            </button>

            <p class="topup-note">
              Your request will remain pending until
              the payment is verified and approved.
            </p>

          </div>

        </div>
      `;

      document.body.appendChild(modal);

      const closeButton =
        document.getElementById(
          "closeTopUpModal"
        );

      if (closeButton) {
        closeButton.addEventListener(
          "click",
          closeTopUpModal
        );
      }

      const confirmButton =
        document.getElementById(
          "confirmTopUp"
        );

      if (confirmButton) {
        confirmButton.addEventListener(
          "click",
          processTopUp
        );
      }

      modal
        .querySelectorAll("[data-amount]")
        .forEach((button) => {

          button.addEventListener(
            "click",
            () => {

              const amountInput =
                document.getElementById(
                  "topUpAmount"
                );

              if (amountInput) {
                amountInput.value =
                  button.dataset.amount;
              }
            }
          );
        });

      const overlay =
        modal.querySelector(
          ".topup-overlay"
        );

      if (overlay) {
        overlay.addEventListener(
          "click",
          (event) => {

            if (
              event.target.classList.contains(
                "topup-overlay"
              )
            ) {
              closeTopUpModal();
            }

          }
        );
      }
    }

    modal.classList.add("show");

    const bankInput =
      document.getElementById(
        "customerBankName"
      );

    if (bankInput) {
      setTimeout(() => {
        bankInput.focus();
      }, 100);
    }
  }

  /* =========================================================
     CLOSE FUNDING MODAL
     ========================================================= */

  function closeTopUpModal() {
    const modal = document.getElementById(
      "realAbbaTopUpModal"
    );

    if (modal) {
      modal.classList.remove("show");
    }
  }

  /* =========================================================
     CLEAR FUNDING FORM
     ========================================================= */

  function clearFundingForm() {

    const fields = [
      "customerBankName",
      "customerAccountName",
      "topUpAmount",
      "transactionReference"
    ];

    fields.forEach((id) => {

      const element =
        document.getElementById(id);

      if (element) {
        element.value = "";
      }

    });
  }

  /* =========================================================
     SUBMIT MANUAL FUNDING REQUEST
     ========================================================= */

  async function processTopUp() {

    if (!currentUser) {

      showAppMessage(
        "Please log in before submitting a funding request.",
        "error"
      );

      return;
    }

    const bankInput =
      document.getElementById(
        "customerBankName"
      );

    const accountNameInput =
      document.getElementById(
        "customerAccountName"
      );

    const amountInput =
      document.getElementById(
        "topUpAmount"
      );

    const referenceInput =
      document.getElementById(
        "transactionReference"
      );

    const bankName =
      bankInput?.value.trim() || "";

    const accountName =
      accountNameInput?.value.trim() || "";

    const amount =
      Number(amountInput?.value || 0);

    const transactionReference =
      referenceInput?.value.trim() || "";

    /* VALIDATION */

    if (!bankName) {

      showAppMessage(
        "Please enter the bank name you used to make the payment.",
        "error"
      );

      bankInput?.focus();

      return;
    }

    if (!accountName) {

      showAppMessage(
        "Please enter the account name you used to make the payment.",
        "error"
      );

      accountNameInput?.focus();

      return;
    }

    if (!amount || amount < 100) {

      showAppMessage(
        "Please enter a valid amount of at least ₦100.",
        "error"
      );

      amountInput?.focus();

      return;
    }

    if (!transactionReference) {

      showAppMessage(
        "Please enter your transaction reference.",
        "error"
      );

      referenceInput?.focus();

      return;
    }

    const supabase = getSupabase();

    if (!supabase) {

      showAppMessage(
        "Database connection is not available. Please try again.",
        "error"
      );

      return;
    }

    /* BUTTON */

    const submitButton =
      document.getElementById(
        "confirmTopUp"
      );

    const originalText =
      submitButton?.textContent ||
      "Submit Funding Request";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent =
        "Submitting...";
    }

    try {

      /* CREATE FUNDING REQUEST */

      const {
        data,
        error
      } = await supabase
        .from("funding_requests")
        .insert({
          user_id: currentUser.id,
          customer_bank_name: bankName,
          customer_account_name: accountName,
          amount: amount,
          transaction_reference:
            transactionReference,
          status: "pending"
        })
        .select()
        .single();

      if (error) {

        console.error(
          "Funding request error:",
          error
        );

        throw error;
      }

      console.log(
        "Funding request created:",
        data
      );

      clearFundingForm();

      closeTopUpModal();

      showAppMessage(
        `Funding request for ${formatNaira(
          amount
        )} submitted successfully. It is now pending admin approval.`,
        "success"
      );

      await loadFundingRequests();

    } catch (error) {

      console.error(
        "Could not submit funding request:",
        error
      );

      showAppMessage(
        error?.message ||
          "Could not submit funding request. Please try again.",
        "error"
      );

    } finally {

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent =
          originalText;
      }

    }
  }

  /* =========================================================
     FUNDING REQUEST HISTORY
     ========================================================= */

  async function loadFundingRequests() {

    const container =
      document.getElementById(
        "fundingRequestsList"
      ) ||
      document.getElementById(
        "fundingHistory"
      );

    if (!container || !currentUser) {
      return;
    }

    const supabase = getSupabase();

    if (!supabase) {
      return;
    }

    try {

      const {
        data,
        error
      } = await supabase
        .from("funding_requests")
        .select(
          "id, customer_bank_name, customer_account_name, amount, transaction_reference, status, admin_note, created_at, reviewed_at"
        )
        .eq(
          "user_id",
          currentUser.id
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );

      if (error) {
        throw error;
      }

      renderFundingRequests(
        data || []
      );

    } catch (error) {

      console.warn(
        "Could not load funding requests:",
        error
      );

      container.innerHTML = `
        <div class="empty-state">
          <div>⚠️</div>
          <h3>Unable to load funding history</h3>
          <p>Please try again later.</p>
        </div>
      `;
    }
  }

  /* =========================================================
     RENDER FUNDING REQUESTS
     ========================================================= */

  function renderFundingRequests(
    requests
  ) {

    const container =
      document.getElementById(
        "fundingRequestsList"
      ) ||
      document.getElementById(
        "fundingHistory"
      );

    if (!container) {
      return;
    }

    if (!requests.length) {

      container.innerHTML = `
        <div class="empty-state">
          <div>💳</div>
          <h3>No funding requests</h3>
          <p>
            Your manual funding requests
            will appear here.
          </p>
        </div>
      `;

      return;
    }

    container.innerHTML =
      requests
        .map((request) => {

          const date =
            request.created_at
              ? new Date(
                  request.created_at
                ).toLocaleString(
                  "en-NG"
                )
              : "";

          const status =
            String(
              request.status ||
                "pending"
            ).toLowerCase();

          const statusText =
            status.charAt(0)
              .toUpperCase() +
            status.slice(1);

          let adminNote = "";

          if (request.admin_note) {

            adminNote = `
              <div class="funding-admin-note">
                <strong>Admin Note:</strong>
                <span>
                  ${escapeHtml(
                    request.admin_note
                  )}
                </span>
              </div>
            `;
          }

          return `
            <div class="funding-request-card">

              <div class="funding-request-top">

                <strong>
                  ${formatNaira(
                    request.amount
                  )}
                </strong>

                <span
                  class="funding-status ${escapeHtml(
                    status
                  )}"
                >
                  ${escapeHtml(
                    statusText
                  )}
                </span>

              </div>

              <div class="funding-request-info">

                <p>
                  <span>Bank</span>
                  <strong>
                    ${escapeHtml(
                      request.customer_bank_name
                    )}
                  </strong>
                </p>

                <p>
                  <span>Account Name</span>
                  <strong>
                    ${escapeHtml(
                      request.customer_account_name
                    )}
                  </strong>
                </p>

                <p>
                  <span>Reference</span>
                  <strong>
                    ${escapeHtml(
                      request.transaction_reference
                    )}
                  </strong>
                </p>

                <p>
                  <span>Date</span>
                  <strong>
                    ${escapeHtml(
                      date
                    )}
                  </strong>
                </p>

              </div>

              ${adminNote}

            </div>
          `;

        })
        .join("");
  }

  /* =========================================================
     SERVICES
     ========================================================= */

  function setupServicePricing() {

    const serviceSelect =
      document.getElementById(
        "serviceType"
      ) ||
      document.getElementById(
        "service"
      ) ||
      document.getElementById(
        "orderService"
      );

    const quantityInput =
      document.getElementById(
        "orderQuantity"
      ) ||
      document.getElementById(
        "quantity"
      );

    const totalElement =
      document.getElementById(
        "orderTotal"
      ) ||
      document.getElementById(
        "total"
      ) ||
      document.getElementById(
        "calculatedTotal"
      );

    if (
      !serviceSelect ||
      !quantityInput
    ) {
      return;
    }

    function updateTotal() {

      const service =
        serviceSelect.value;

      const quantity =
        Number(
          quantityInput.value || 0
        );

      const total =
        calculatePrice(
          service,
          quantity
        );

      if (totalElement) {

        totalElement.textContent =
          formatNaira(total);
      }

      const priceElement =
        document.getElementById(
          "servicePrice"
        ) ||
        document.getElementById(
          "pricePer1000"
        );

      if (priceElement) {

        const price =
          getPrice(service);

        priceElement.textContent =
          price > 0
            ? `${formatNaira(
                price
              )} per 1,000`
            : "Select a service";
      }

      const hiddenTotal =
        document.getElementById(
          "hiddenOrderTotal"
        );

      if (hiddenTotal) {
        hiddenTotal.value =
          total;
      }
    }

    serviceSelect.addEventListener(
      "change",
      updateTotal
    );

    quantityInput.addEventListener(
      "input",
      updateTotal
    );

    updateTotal();
  }

  /* =========================================================
     PRICE LIST
     ========================================================= */

  function renderPriceList() {

    const container =
      document.getElementById(
        "priceList"
      ) ||
      document.getElementById(
        "servicesList"
      );

    if (!container) {
      return;
    }

    const entries =
      Object.entries(
        PRICE_LIST
      );

    container.innerHTML =
      entries
        .map(
          ([service, price]) => {

            return `
              <div class="price-item">

                <div>
                  <strong>
                    ${escapeHtml(
                      service
                    )}
                  </strong>

                  <small>
                    Per 1,000
                  </small>
                </div>

                <strong>
                  ${formatNaira(
                    price
                  )}
                </strong>

              </div>
            `;
          }
        )
        .join("");
  }

  /* =========================================================
     ORDER DETAILS
     ========================================================= */

  function getOrderDetails() {

    const serviceElement =
      document.getElementById(
        "serviceType"
      ) ||
      document.getElementById(
        "service"
      ) ||
      document.getElementById(
        "orderService"
      );

    const quantityElement =
      document.getElementById(
        "orderQuantity"
      ) ||
      document.getElementById(
        "quantity"
      );

    const linkElement =
      document.getElementById(
        "orderLink"
      ) ||
      document.getElementById(
        "url"
      ) ||
      document.getElementById(
        "link"
      );

    const service =
      serviceElement?.value || "";

    const quantity =
      Number(
        quantityElement?.value || 0
      );

    const link =
      linkElement?.value?.trim() ||
      "";

    const total =
      calculatePrice(
        service,
        quantity
      );

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

    const details =
      getOrderDetails();

    if (!details.service) {

      showAppMessage(
        "Please select a service.",
        "error"
      );

      return;
    }

    if (
      !details.quantity ||
      details.quantity <= 0
    ) {

      showAppMessage(
        "Please enter a valid quantity.",
        "error"
      );

      return;
    }

    if (!details.link) {

      showAppMessage(
        "Please enter the required link.",
        "error"
      );

      return;
    }

    if (
      !details.total ||
      details.total <= 0
    ) {

      showAppMessage(
        "Unable to calculate the order price.",
        "error"
      );

      return;
    }

    if (
      walletBalance <
      details.total
    ) {

      showAppMessage(
        `Insufficient balance. You need ${formatNaira(
          details.total -
            walletBalance
        )} more.`,
        "error"
      );

      openTopUpModal();

      return;
    }

    const order = {

      id:
        "local-" +
        Date.now(),

      user_id:
        currentUser?.id ||
        null,

      service:
        details.service,

      quantity:
        details.quantity,

      link:
        details.link,

      amount:
        details.total,

      status:
        "pending",

      created_at:
        new Date().toISOString()

    };

    /* LOCAL ORDER */

    const orders =
      getLocalOrders();

    orders.unshift(order);

    localStorage.setItem(
      "realAbbaOrders",
      JSON.stringify(
        orders
      )
    );

    /* DEDUCT LOCAL BALANCE */

    walletBalance -=
      details.total;

    saveWallet();

    /* SUPABASE ORDER */

    try {

      const supabase =
        getSupabase();

      if (
        supabase &&
        currentUser
      ) {

        const {
          error
        } = await supabase
          .from("orders")
          .insert({
            user_id:
              currentUser.id,

            service:
              details.service,

            quantity:
              details.quantity,

            link:
              details.link,

            amount:
              details.total,

            status:
              "pending"
          });

        if (error) {

          console.warn(
            "Supabase order save:",
            error
          );
        }
      }

    } catch (error) {

      console.warn(
        "Order database error:",
        error
      );
    }

    showAppMessage(
      `Order placed successfully for ${formatNaira(
        details.total
      )}.`,
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
        localStorage.getItem(
          "realAbbaOrders"
        ) || "[]"
      );

    } catch (error) {

      return [];
    }
  }

  /* =========================================================
     RENDER ORDERS
     ========================================================= */

  function renderOrders() {

    const container =
      document.getElementById(
        "ordersList"
      ) ||
      document.getElementById(
        "orderHistory"
      );

    if (!container) {
      return;
    }

    const orders =
      getLocalOrders();

    if (!orders.length) {

      container.innerHTML = `
        <div class="empty-state">
          <div>📦</div>
          <h3>No orders yet</h3>
          <p>
            Your orders will appear here.
          </p>
        </div>
      `;

      return;
    }

    container.innerHTML =
      orders
        .map(
          (order) => {

            const date =
              new Date(
                order.created_at
              );

            return `
              <div class="order-card">

                <div class="order-card-top">

                  <strong>
                    ${escapeHtml(
                      order.service
                    )}
                  </strong>

                  <span
                    class="order-status ${String(
                      order.status ||
                        "pending"
                    ).toLowerCase()}"
                  >
                    ${escapeHtml(
                      order.status ||
                        "pending"
                    )}
                  </span>

                </div>

                <div class="order-info">

                  <p>
                    <span>
                      Quantity
                    </span>

                    <strong>
                      ${Number(
                        order.quantity ||
                          0
                      ).toLocaleString()}
                    </strong>
                  </p>

                  <p>
                    <span>
                      Amount
                    </span>

                    <strong>
                      ${formatNaira(
                        order.amount
                      )}
                    </strong>
                  </p>

                  <p>
                    <span>
                      Date
                    </span>

                    <strong>
                      ${date.toLocaleString(
                        "en-NG"
                      )}
                    </strong>
                  </p>

                </div>

                <div class="order-link">
                  ${escapeHtml(
                    order.link ||
                      ""
                  )}
                </div>

              </div>
            `;
          }
        )
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

      const element =
        document.getElementById(
          id
        );

      if (element) {
        element.value = "";
      }

    });

    [
      "orderTotal",
      "total",
      "calculatedTotal"
    ].forEach((id) => {

      const element =
        document.getElementById(
          id
        );

      if (element) {
        element.textContent =
          "₦0";
      }

    });
  }

  /* =========================================================
     USER ACCOUNT
     ========================================================= */

  async function loadCurrentUser() {

    const supabase =
      getSupabase();

    if (!supabase) {
      return;
    }

    try {

      const {
        data: {
          user
        },
        error
      } =
        await supabase.auth.getUser();

      if (error) {

        console.warn(
          error
        );

        return;
      }

      currentUser =
        user || null;

      updateUserDisplay();

      loadWallet();

      await loadFundingRequests();

    } catch (error) {

      console.warn(
        "Could not load user:",
        error
      );
    }
  }

  /* =========================================================
     USER DISPLAY
     ========================================================= */

  function updateUserDisplay() {

    if (!currentUser) {
      return;
    }

    const name =
      currentUser
        .user_metadata
        ?.name ||
      currentUser
        .user_metadata
        ?.display_name ||
      currentUser.email
        ?.split("@")[0] ||
      "Customer";

    const email =
      currentUser.email ||
      "";

    [
      "welcomeName",
      "accountName",
      "profileName"
    ].forEach((id) => {

      const element =
        document.getElementById(
          id
        );

      if (element) {
        element.textContent =
          name;
      }

    });

    [
      "accountEmail",
      "accountEmail2",
      "profileEmail"
    ].forEach((id) => {

      const element =
        document.getElementById(
          id
        );

      if (element) {
        element.textContent =
          email;
      }

    });
  }

  /* =========================================================
     SIGN OUT
     ========================================================= */

  async function signOut() {

    const supabase =
      getSupabase();

    try {

      if (supabase) {
        await supabase.auth.signOut();
      }

    } catch (error) {

      console.warn(
        "Sign out error:",
        error
      );
    }

    currentUser = null;

    walletBalance = 0;

    if (
      typeof window.showAuth ===
      "function"
    ) {

      window.showAuth();

    } else {

      window.location.reload();
    }
  }

  /* =========================================================
     APP MESSAGE
     ========================================================= */

  function showAppMessage(
    message,
    type = "info"
  ) {

    let toast =
      document.getElementById(
        "appToast"
      );

    if (!toast) {

      toast =
        document.createElement(
          "div"
        );

      toast.id =
        "appToast";

      document.body.appendChild(
        toast
      );
    }

    toast.className =
      `app-toast ${type}`;

    toast.textContent =
      message;

    requestAnimationFrame(
      () => {
        toast.classList.add(
          "show"
        );
      }
    );

    setTimeout(
      () => {
        toast.classList.remove(
          "show"
        );
      },
      4500
    );
  }

  /* =========================================================
     ESCAPE HTML
     ========================================================= */

  function escapeHtml(value) {

    return String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }

  /* =========================================================
     GLOBAL FUNCTIONS
     ========================================================= */

  window.openTopUpModal =
    openTopUpModal;

  window.closeTopUpModal =
    closeTopUpModal;

  window.placeOrder =
    placeOrder;

  window.renderOrders =
    renderOrders;

  window.signOut =
    signOut;

  window.getOrderDetails =
    getOrderDetails;

  window.loadFundingRequests =
    loadFundingRequests;

  window.processTopUp =
    processTopUp;

  /* =========================================================
     INITIALIZE
     ========================================================= */

  async function initializeApp() {

    await loadCurrentUser();

    setupServicePricing();

    renderPriceList();

    renderOrders();

    createTopUpButton();

    await loadFundingRequests();

    /* SUPABASE AUTH LISTENER */

    const supabase =
      getSupabase();

    if (supabase) {

      supabase.auth.onAuthStateChange(
        async (
          event,
          session
        ) => {

          currentUser =
            session?.user ||
            null;

          updateUserDisplay();

          if (currentUser) {

            loadWallet();

            await loadFundingRequests();

          } else {

            walletBalance = 0;

            updateWalletDisplay();
          }

        }
      );
    }
  }

  /* =========================================================
     START APP
     ========================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initializeApp
    );

  } else {

    initializeApp();
  }

})();
