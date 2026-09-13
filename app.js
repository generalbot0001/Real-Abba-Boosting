/* =========================================================
   ABDUL VIRAL BOOSTER
   app.js
   Mobile Social Media Boosting Dashboard
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       SUPABASE
       ===================================================== */

    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error("Supabase client was not found.");
    }

    /* =====================================================
       PRODUCT PRICES
       Price is PER 1,000 units
       ===================================================== */

    const PRODUCTS = {
        "TikTok Followers": {
            platform: "TikTok",
            type: "Followers",
            price: 6000
        },

        "TikTok Likes": {
            platform: "TikTok",
            type: "Likes",
            price: 1000
        },

        "TikTok Views": {
            platform: "TikTok",
            type: "Views",
            price: 400
        },

        "Instagram Followers": {
            platform: "Instagram",
            type: "Followers",
            price: 5500
        },

        "Instagram Likes": {
            platform: "Instagram",
            type: "Likes",
            price: 800
        },

        "Instagram Views": {
            platform: "Instagram",
            type: "Views",
            price: 300
        },

        "YouTube Subscribers": {
            platform: "YouTube",
            type: "Subscribers",
            price: 65000
        },

        "YouTube Views": {
            platform: "YouTube",
            type: "Views",
            price: 2500
        },

        "Facebook Followers": {
            platform: "Facebook",
            type: "Followers",
            price: 5300
        },

        "Telegram Members": {
            platform: "Telegram",
            type: "Members",
            price: 5000
        }
    };

    /* =====================================================
       STATE
       ===================================================== */

    let currentUser = null;
    let currentProduct = null;
    let walletBalance = 0;

    /* =====================================================
       HELPERS
       ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }

    function formatMoney(amount) {
        return "₦" + Number(amount || 0).toLocaleString("en-NG");
    }

    function showToast(message, type = "info") {
        let toast = $("toast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toast";
            document.body.appendChild(toast);
        }

        toast.textContent = message;

        toast.className = "toast show " + type;

        clearTimeout(window.__toastTimer);

        window.__toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3500);
    }

    function hideElement(element) {
        if (element) {
            element.classList.add("hidden");
        }
    }

    function showElement(element) {
        if (element) {
            element.classList.remove("hidden");
        }
    }

    /* =====================================================
       PRICE CALCULATOR
       ===================================================== */

    function calculatePrice(productName, quantity) {
        const product = PRODUCTS[productName];

        if (!product) {
            return 0;
        }

        quantity = Number(quantity);

        if (!Number.isFinite(quantity) || quantity <= 0) {
            return 0;
        }

        return (quantity / 1000) * product.price;
    }

    window.calculatePrice = calculatePrice;

    /* =====================================================
       DISPLAY PRODUCTS
       ===================================================== */

    function renderProducts() {
        const container =
            $("productsContainer") ||
            $("servicesContainer") ||
            $("serviceList") ||
            $("servicesList");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        Object.entries(PRODUCTS).forEach(([name, product]) => {
            const card = document.createElement("div");

            card.className = "service-card";

            card.innerHTML = `
                <div class="service-card-icon">
                    ${getPlatformIcon(product.platform)}
                </div>

                <div class="service-card-info">
                    <h3>${name}</h3>
                    <p>${formatMoney(product.price)} per 1,000</p>
                </div>

                <button
                    type="button"
                    class="service-order-btn"
                    onclick="selectProduct('${escapeAttribute(name)}')"
                >
                    Order
                </button>
            `;

            container.appendChild(card);
        });
    }

    function getPlatformIcon(platform) {
        const icons = {
            TikTok: "♪",
            Instagram: "◎",
            YouTube: "▶",
            Facebook: "f",
            Telegram: "✈"
        };

        return icons[platform] || "★";
    }

    function escapeAttribute(value) {
        return String(value)
            .replace(/\\/g, "\\\\")
            .replace(/'/g, "\\'");
    }

    /* =====================================================
       SELECT PRODUCT
       ===================================================== */

    window.selectProduct = function (productName) {
        if (!PRODUCTS[productName]) {
            showToast("Product not found.", "error");
            return;
        }

        currentProduct = productName;

        const serviceInput =
            $("service") ||
            $("serviceType") ||
            $("selectedService");

        if (serviceInput) {
            if ("value" in serviceInput) {
                serviceInput.value = productName;
            } else {
                serviceInput.textContent = productName;
            }
        }

        const serviceName =
            $("selectedServiceName") ||
            $("orderServiceName");

        if (serviceName) {
            serviceName.textContent = productName;
        }

        showPageByName("order");

        updateOrderPrice();
    };

    /* =====================================================
       ORDER PRICE
       ===================================================== */

    function getOrderQuantity() {
        const input =
            $("quantity") ||
            $("orderQuantity");

        if (!input) {
            return 0;
        }

        return Number(input.value || 0);
    }

    function getSelectedProduct() {
        if (currentProduct && PRODUCTS[currentProduct]) {
            return currentProduct;
        }

        const input =
            $("service") ||
            $("serviceType") ||
            $("selectedService");

        if (input && input.value && PRODUCTS[input.value]) {
            return input.value;
        }

        return "";
    }

    function updateOrderPrice() {
        const productName = getSelectedProduct();
        const quantity = getOrderQuantity();

        const total = calculatePrice(productName, quantity);

        const totalElements = [
            $("total"),
            $("orderTotal"),
            $("totalPrice"),
            $("price"),
            $("orderPrice")
        ];

        totalElements.forEach(element => {
            if (element) {
                element.textContent = formatMoney(total);

                if ("value" in element && element.tagName === "INPUT") {
                    element.value = total;
                }
            }
        });

        const priceInput = $("totalInput");

        if (priceInput) {
            priceInput.value = total;
        }

        return total;
    }

    window.updateOrderPrice = updateOrderPrice;

    /* =====================================================
       ORDER INPUT LISTENERS
       ===================================================== */

    function setupOrderCalculator() {
        const quantity =
            $("quantity") ||
            $("orderQuantity");

        if (quantity) {
            quantity.addEventListener("input", updateOrderPrice);
            quantity.addEventListener("change", updateOrderPrice);
        }

        const service =
            $("service") ||
            $("serviceType");

        if (service) {
            service.addEventListener("change", () => {
                currentProduct = service.value;
                updateOrderPrice();
            });
        }
    }

    /* =====================================================
       PAGE NAVIGATION
       ===================================================== */

    window.showPageByName = function (pageName) {
        const pages = document.querySelectorAll(
            ".app-page, .page, [data-page]"
        );

        let found = false;

        pages.forEach(page => {
            const pageId = page.id || "";
            const dataPage = page.dataset.page || "";

            const matches =
                pageId === "page-" + pageName ||
                pageId === pageName ||
                dataPage === pageName;

            if (matches) {
                page.classList.remove("hidden");
                page.style.display = "";
                found = true;
            } else if (
                page.classList.contains("app-page") ||
                page.dataset.page
            ) {
                page.classList.add("hidden");
            }
        });

        document.querySelectorAll(
            ".nav-item, .bottom-nav-item, [data-nav]"
        ).forEach(item => {
            const nav =
                item.dataset.nav ||
                item.dataset.page ||
                item.getAttribute("data-page");

            item.classList.toggle("active", nav === pageName);
        });

        if (!found) {
            console.warn("Page not found:", pageName);
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    window.showPage = window.showPageByName;

    /* =====================================================
       NAVIGATION BUTTONS
       ===================================================== */

    function setupNavigation() {
        document.addEventListener("click", event => {
            const button = event.target.closest(
                "[data-page], [data-nav]"
            );

            if (!button) {
                return;
            }

            const page =
                button.dataset.page ||
                button.dataset.nav;

            if (!page) {
                return;
            }

            event.preventDefault();

            showPageByName(page);
        });
    }

    /* =====================================================
       USER INFORMATION
       ===================================================== */

    function displayUser(user) {
        if (!user) {
            return;
        }

        const metadata = user.user_metadata || {};

        const name =
            metadata.full_name ||
            metadata.name ||
            metadata.display_name ||
            user.email?.split("@")[0] ||
            "Customer";

        const email = user.email || "";

        const nameElements = [
            $("welcomeName"),
            $("accountName"),
            $("profileName"),
            $("userName"),
            $("customerName")
        ];

        nameElements.forEach(element => {
            if (element) {
                element.textContent = name;
            }
        });

        const emailElements = [
            $("accountEmail"),
            $("accountEmail2"),
            $("profileEmail"),
            $("userEmail"),
            $("customerEmail")
        ];

        emailElements.forEach(element => {
            if (element) {
                element.textContent = email;
            }
        });
    }

    /* =====================================================
       AUTH STATE
       ===================================================== */

    async function loadCurrentUser() {
        if (!supabase) {
            return;
        }

        try {
            const {
                data: { user },
                error
            } = await supabase.auth.getUser();

            if (error) {
                console.error(error);
                return;
            }

            currentUser = user || null;

            if (currentUser) {
                displayUser(currentUser);
                await loadWallet();
                await loadOrders();
            }
        } catch (error) {
            console.error("Could not load user:", error);
        }
    }

    /* =====================================================
       WALLET
       ===================================================== */

    async function loadWallet() {
        if (!supabase || !currentUser) {
            return;
        }

        /*
         * The wallet table will be used when it exists.
         * Expected structure:
         *
         * wallets
         * - id
         * - user_id
         * - balance
         */

        try {
            const { data, error } = await supabase
                .from("wallets")
                .select("balance")
                .eq("user_id", currentUser.id)
                .maybeSingle();

            if (error) {
                console.warn(
                    "Wallet table is not available yet:",
                    error.message
                );

                walletBalance = 0;
                updateWalletDisplay();
                return;
            }

            walletBalance = Number(data?.balance || 0);

            updateWalletDisplay();
        } catch (error) {
            console.warn("Wallet loading failed:", error);
            walletBalance = 0;
            updateWalletDisplay();
        }
    }

    function updateWalletDisplay() {
        const elements = [
            $("walletBalance"),
            $("balance"),
            $("walletAmount"),
            $("accountBalance"),
            $("homeBalance")
        ];

        elements.forEach(element => {
            if (element) {
                element.textContent = formatMoney(walletBalance);
            }
        });
    }

    window.loadWallet = loadWallet;

    /* =====================================================
       TOP UP
       ===================================================== */

    window.openTopUp = function () {
        const modal =
            $("topupModal") ||
            $("topUpModal") ||
            $("fundModal");

        if (modal) {
            modal.classList.remove("hidden");
            modal.style.display = "flex";
            return;
        }

        showTopUpFallback();
    };

    window.closeTopUp = function () {
        const modal =
            $("topupModal") ||
            $("topUpModal") ||
            $("fundModal");

        if (modal) {
            modal.classList.add("hidden");
            modal.style.display = "none";
        }
    };

    function showTopUpFallback() {
        const amount = prompt(
            "Enter the amount you want to fund your account (₦):"
        );

        if (amount === null) {
            return;
        }

        const numericAmount = Number(
            String(amount).replace(/,/g, "")
        );

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount < 100
        ) {
            showToast(
                "Please enter a valid amount of at least ₦100.",
                "error"
            );
            return;
        }

        createTopUpRequest(numericAmount);
    }

    window.submitTopUp = async function () {
        const input =
            $("topupAmount") ||
            $("topUpAmount") ||
            $("fundAmount");

        if (!input) {
            showTopUpFallback();
            return;
        }

        const amount = Number(
            String(input.value).replace(/,/g, "")
        );

        if (
            !Number.isFinite(amount) ||
            amount < 100
        ) {
            showToast(
                "Enter a valid amount of at least ₦100.",
                "error"
            );
            return;
        }

        await createTopUpRequest(amount);
    };

    async function createTopUpRequest(amount) {
        if (!currentUser) {
            showToast(
                "Please log in before funding your account.",
                "error"
            );
            return;
        }

        /*
         * This creates a pending top-up request when the
         * top_up_requests table exists.
         *
         * The actual balance should ONLY be increased after
         * successful payment verification.
         */

        if (!supabase) {
            showToast("Supabase is not connected.", "error");
            return;
        }

        try {
            const { error } = await supabase
                .from("top_up_requests")
                .insert({
                    user_id: currentUser.id,
                    amount: amount,
                    status: "pending"
                });

            if (error) {
                console.error(error);

                showToast(
                    "Top-up system is not connected yet.",
                    "error"
                );

                return;
            }

            closeTopUp();

            showToast(
                `${formatMoney(amount)} top-up request created.`,
                "success"
            );
        } catch (error) {
            console.error(error);

            showToast(
                "Unable to create top-up request.",
                "error"
            );
        }
    }

    /* =====================================================
       ORDER SUBMISSION
       ===================================================== */

    window.submitOrder = async function (event) {
        if (event) {
            event.preventDefault();
        }

        if (!currentUser) {
            showToast(
                "Please log in before placing an order.",
                "error"
            );
            return;
        }

        const productName = getSelectedProduct();
        const quantity = getOrderQuantity();

        const linkInput =
            $("url") ||
            $("orderLink") ||
            $("link");

        const link = linkInput
            ? linkInput.value.trim()
            : "";

        if (!productName || !PRODUCTS[productName]) {
            showToast(
                "Please select a service.",
                "error"
            );
            return;
        }

        if (!quantity || quantity <= 0) {
            showToast(
                "Please enter a valid quantity.",
                "error"
            );
            return;
        }

        if (!link) {
            showToast(
                "Please enter your social media link.",
                "error"
            );
            return;
        }

        const total = calculatePrice(
            productName,
            quantity
        );

        if (total <= 0) {
            showToast(
                "Unable to calculate order price.",
                "error"
            );
            return;
        }

        if (walletBalance < total) {
            showToast(
                `Insufficient balance. You need ${formatMoney(
                    total - walletBalance
                )} more.`,
                "error"
            );

            openTopUp();

            return;
        }

        if (!supabase) {
            showToast(
                "Supabase is not connected.",
                "error"
            );
            return;
        }

        const product = PRODUCTS[productName];

        try {
            const orderData = {
                user_id: currentUser.id,
                email: currentUser.email,
                service: productName,
                platform: product.platform,
                service_type: product.type,
                quantity: quantity,
                link: link,
                amount: total,
                status: "pending"
            };

            const { data, error } = await supabase
                .from("orders")
                .insert(orderData)
                .select()
                .single();

            if (error) {
                console.error(error);

                showToast(
                    "Order could not be created. Check your Supabase orders table.",
                    "error"
                );

                return;
            }

            showToast(
                "Order submitted successfully!",
                "success"
            );

            await loadWallet();
            await loadOrders();

            clearOrderForm();

            showPageByName("orders");
        } catch (error) {
            console.error(error);

            showToast(
                "Something went wrong while creating your order.",
                "error"
            );
        }
    };

    /* =====================================================
       CLEAR ORDER FORM
       ===================================================== */

    function clearOrderForm() {
        const form =
            $("orderForm");

        if (form) {
            form.reset();
        }

        currentProduct = null;

        updateOrderPrice();
    }

    /* =====================================================
       LOAD ORDERS
       ===================================================== */

    async function loadOrders() {
        if (!supabase || !currentUser) {
            return;
        }

        const container =
            $("ordersContainer") ||
            $("ordersList") ||
            $("orderList");

        if (!container) {
            return;
        }

        try {
            const {
                data,
                error
            } = await supabase
                .from("orders")
                .select("*")
                .eq("user_id", currentUser.id)
                .order("created_at", {
                    ascending: false
                });

            if (error) {
                console.warn(
                    "Could not load orders:",
                    error.message
                );

                return;
            }

            container.innerHTML = "";

            if (!data || data.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📦</div>
                        <h3>No orders yet</h3>
                        <p>Your orders will appear here.</p>
                    </div>
                `;

                return;
            }

            data.forEach(order => {
                const card = document.createElement("div");

                card.className = "order-card";

                const status = String(
                    order.status || "pending"
                ).toLowerCase();

                card.innerHTML = `
                    <div class="order-card-top">
                        <div>
                            <h3>${escapeHTML(
                                order.service || "Service"
                            )}</h3>

                            <small>
                                Order #${escapeHTML(
                                    order.id || ""
                                )}
                            </small>
                        </div>

                        <span class="order-status ${status}">
                            ${escapeHTML(
                                capitalize(status)
                            )}
                        </span>
                    </div>

                    <div class="order-card-details">
                        <div>
                            <span>Quantity</span>
                            <strong>
                                ${Number(
                                    order.quantity || 0
                                ).toLocaleString()}
                            </strong>
                        </div>

                        <div>
                            <span>Amount</span>
                            <strong>
                                ${formatMoney(
                                    order.amount || 0
                                )}
                            </strong>
                        </div>
                    </div>

                    <div class="order-link">
                        ${escapeHTML(
                            order.link || ""
                        )}
                    </div>
                `;

                container.appendChild(card);
            });
        } catch (error) {
            console.error(
                "Order loading failed:",
                error
            );
        }
    }

    window.loadOrders = loadOrders;

    /* =====================================================
       HTML ESCAPING
       ===================================================== */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function capitalize(value) {
        return String(value)
            .charAt(0)
            .toUpperCase() +
            String(value).slice(1);
    }

    /* =====================================================
       LOGOUT
       ===================================================== */

    window.logoutUser = async function () {
        if (!supabase) {
            return;
        }

        try {
            const { error } =
                await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            currentUser = null;
            walletBalance = 0;

            window.location.reload();
        } catch (error) {
            console.error(error);

            showToast(
                "Could not log out.",
                "error"
            );
        }
    };

    /* =====================================================
       WHATSAPP
       ===================================================== */

    window.contactWhatsApp = function () {
        /*
         * Replace this number with the official ABDUL VIRAL
         * BOOSTER WhatsApp number when you have it.
         */

        const phone = "2340000000000";

        const message = encodeURIComponent(
            "Hello ABDUL VIRAL BOOSTER, I need help with my account."
        );

        window.open(
            `https://wa.me/${phone}?text=${message}`,
            "_blank"
        );
    };

    /* =====================================================
       AUTH STATE LISTENER
       ===================================================== */

    function setupAuthListener() {
        if (!supabase) {
            return;
        }

        supabase.auth.onAuthStateChange(
            async (event, session) => {
                currentUser =
                    session?.user || null;

                if (currentUser) {
                    displayUser(currentUser);

                    /*
                     * Avoid heavy database calls inside the
                     * auth callback where possible.
                     */
                    setTimeout(async () => {
                        await loadWallet();
                        await loadOrders();
                    }, 0);
                }
            }
        );
    }

    /* =====================================================
       TOP UP BUTTONS
       ===================================================== */

    function setupTopUpButtons() {
        document.addEventListener("click", event => {
            const button = event.target.closest(
                "#topupBtn, #topUpBtn, #fundAccountBtn, [data-topup]"
            );

            if (!button) {
                return;
            }

            event.preventDefault();

            openTopUp();
        });
    }

    /* =====================================================
       ORDER FORM BUTTON
       ===================================================== */

    function setupOrderForm() {
        const form =
            $("orderForm");

        if (!form) {
            return;
        }

        form.addEventListener(
            "submit",
            window.submitOrder
        );
    }

    /* =====================================================
       INITIALIZATION
       ===================================================== */

    async function initializeApp() {
        console.log(
            "ABDUL VIRAL BOOSTER app.js loaded."
        );

        renderProducts();

        setupNavigation();

        setupOrderCalculator();

        setupOrderForm();

        setupTopUpButtons();

        setupAuthListener();

        await loadCurrentUser();

        /*
         * If the index page has a services container,
         * populate it.
         */
        renderProducts();

        updateOrderPrice();
    }

    /* =====================================================
       START
       ===================================================== */

    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeApp
        );
    } else {
        initializeApp();
    }

})();
