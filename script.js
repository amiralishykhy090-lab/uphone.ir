"use strict";


/* =====================================================
   ELEMENTS
===================================================== */

const menuBtn = document.getElementById("menuBtn");
const closeMenu = document.getElementById("closeMenu");
const mobileMenu = document.getElementById("mobileMenu");
const menuOverlay = document.getElementById("menuOverlay");

const searchBtn = document.getElementById("searchBtn");
const searchBox = document.getElementById("searchBox");
const closeSearch = document.getElementById("closeSearch");
const searchInput = document.getElementById("searchInput");

const productModal = document.getElementById("productModal");
const productModalClose =
    document.getElementById("productModalClose");

const productModalContent =
    document.getElementById("productModalContent");

const cartBtn =
    document.getElementById("cartBtn");

const cartModal =
    document.getElementById("cartModal");

const cartClose =
    document.getElementById("cartClose");

const cartItems =
    document.getElementById("cartItems");

const cartCount =
    document.getElementById("cartCount");

const cartTotal =
    document.getElementById("cartTotal");

const startCheckout =
    document.getElementById("startCheckout");

const checkoutModal =
    document.getElementById("checkoutModal");

const checkoutClose =
    document.getElementById("checkoutClose");

const checkoutCartItems =
    document.getElementById("checkoutCartItems");

const orderSummary =
    document.getElementById("orderSummary");

const copyOrder =
    document.getElementById("copyOrder");

const finishOrder =
    document.getElementById("finishOrder");



/* =====================================================
   CART
===================================================== */

let cart = [];


/* باز کردن سبد خرید */

cartBtn.addEventListener("click", () => {

    renderCart();

    openModal(cartModal);

});


/* بستن سبد */

cartClose.addEventListener("click", () => {

    closeModal(cartModal);

});


/* =====================================================
   GENERIC MODAL
===================================================== */

function openModal(modal) {

    modal.classList.add("active");

    document.body.style.overflow = "hidden";

}


function closeModal(modal) {

    modal.classList.remove("active");

    if (
        !document.querySelector(".modal-overlay.active")
    ) {

        document.body.style.overflow = "";

    }

}


/* کلیک روی فضای بیرون Modal */

document.querySelectorAll(".modal-overlay")
    .forEach(overlay => {

        overlay.addEventListener("click", event => {

            if (event.target === overlay) {

                closeModal(overlay);

            }

        });

    });



/* =====================================================
   PRODUCT MODAL
===================================================== */

document.querySelectorAll(".product-card")
    .forEach(card => {

        const viewButton =
            card.querySelector(".view-product");

        viewButton.addEventListener("click", () => {

            openProductModal(card);

        });

    });


function openProductModal(card) {

    const data =
        card.querySelector(".product-modal-data");

    if (!data) return;


    /*
       innerHTML فقط هنگام باز کردن Modal
       استفاده می‌شود تا در حالت عادی
       DOM سنگین نشود.
    */

    productModalContent.innerHTML =
        data.innerHTML;


    openModal(productModal);


const addButton =
    productModalContent.querySelector(".add-to-cart-modal");

if (addButton) {

    addButton.addEventListener("click", () => {

        // افزودن محصول به سبد خرید
        addProductToCart(card);

        // بستن Modal محصول
        closeModal(productModal);

        // نمایش پیام موفقیت
        showCartSuccessModal();

    });

}

}


productModalClose.addEventListener(
    "click",
    () => closeModal(productModal)
);



/* =====================================================
   ADD PRODUCT TO CART
===================================================== */

function addProductToCart(card) {

    const name = card.dataset.name;
    const price = Number(card.dataset.price);

    // اعتبارسنجی
    if (!name || isNaN(price)) {
        showSmallNotice("❌ خطا: اطلاعات محصول کامل نیست!");
        return;
    }

    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();

    // ✅ پیام موفقیت با ایموجی
    showSmallNotice("✅ محصول با موفقیت به سبد خرید انتقال یافت");
}



/* =====================================================
   CART RENDER
===================================================== */

function renderCart() {

    cartItems.innerHTML = "";


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div style="
                padding:30px;
                text-align:center;
                color:#777;
            ">
                سبد خرید شما خالی است.
            </div>
        `;

        cartTotal.textContent =
            "۰ تومان";

        return;

    }


    let total = 0;


    cart.forEach((item, index) => {

        const itemTotal =
            item.price * item.quantity;

        total += itemTotal;


        const div =
            document.createElement("div");


        div.className = "cart-item";


        div.innerHTML = `

            <div class="cart-item-info">

                <strong>
                    ${escapeHTML(item.name)}
                </strong>

                <span>
                    تعداد: ${item.quantity}
                </span>

                <span>
                    ${formatPrice(itemTotal)}
                </span>

            </div>

            <button
                class="remove-cart"
                data-index="${index}">

                حذف

            </button>

        `;


        cartItems.appendChild(div);

    });


    cartTotal.textContent =
        formatPrice(total);


    cartItems
        .querySelectorAll(".remove-cart")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(button.dataset.index);

                    cart.splice(index, 1);

                    saveCart();

                    updateCartCount();

                    renderCart();

                }
            );

        });

}



/* =====================================================
   CART STORAGE
===================================================== */

function saveCart() {

    localStorage.setItem(
        "digitalStoreCart",
        JSON.stringify(cart)
    );

}


function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                "digitalStoreCart"
            );


        if (saved) {

            cart = JSON.parse(saved);

        }

    } catch {

        cart = [];

    }

}


function updateCartCount() {

    const count =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    cartCount.textContent =
        count.toLocaleString("fa-IR");

}



/* =====================================================
   CHECKOUT
===================================================== */

let currentStep = 1;


startCheckout.addEventListener(
    "click",
    () => {

        if (cart.length === 0) {

            showSmallNotice(
                "ابتدا حداقل یک محصول به سبد خرید اضافه کنید."
            );

            return;

        }


        currentStep = 1;

        updateCheckout();

        closeModal(cartModal);

        openModal(checkoutModal);

    }
);


checkoutClose.addEventListener(
    "click",
    () => closeModal(checkoutModal)
);



/* دکمه‌های مرحله بعد */

document.querySelectorAll(".next-step")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (
                    currentStep === 1 &&
                    !validateCustomer()
                ) {

                    return;

                }


                if (currentStep < 4) {

                    currentStep++;

                    updateCheckout();

                }

            }
        );

    });



/* دکمه‌های مرحله قبل */

document.querySelectorAll(".prev-step")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (currentStep > 1) {

                    currentStep--;

                    updateCheckout();

                }

            }
        );

    });



function updateCheckout() {

    document.querySelectorAll(".checkout-step")
        .forEach(step => {

            step.classList.remove("active");

            if (
                Number(step.dataset.step)
                === currentStep
            ) {

                step.classList.add("active");

            }

        });


    document.querySelectorAll(".checkout-progress .step")
        .forEach((step, index) => {

            step.classList.toggle(
                "active",
                index + 1 <= currentStep
            );

        });


    if (currentStep === 2) {

        renderCheckoutCart();

    }


    if (currentStep === 3) {

        renderOrderSummary();

    }

}



/* =====================================================
   CUSTOMER VALIDATION
===================================================== */

function validateCustomer() {

    const name =
        document.getElementById(
            "customerName"
        ).value.trim();


    const phone =
        document.getElementById(
            "customerPhone"
        ).value.trim();


    const address =
        document.getElementById(
            "customerAddress"
        ).value.trim();


    if (!name || !phone || !address) {

        showSmallNotice(
            "لطفاً تمام اطلاعات را تکمیل کنید."
        );

        return false;

    }


    if (
        !/^0?9\d{9}$/.test(
            phone.replace(/\s/g, "")
        )
    ) {

        showSmallNotice(
            "شماره تماس وارد شده صحیح نیست."
        );

        return false;

    }


    return true;

}



/* =====================================================
   CHECKOUT CART
===================================================== */

function renderCheckoutCart() {

    checkoutCartItems.innerHTML = "";


    cart.forEach((item, index) => {

        const div =
            document.createElement("div");


        div.className =
            "checkout-item";


        div.innerHTML = `

            <span>
                ${escapeHTML(item.name)}
                × ${item.quantity}
            </span>

            <button
                class="remove-cart"
                data-index="${index}">

                حذف

            </button>

        `;


        checkoutCartItems.appendChild(div);

    });


    checkoutCartItems
        .querySelectorAll(".remove-cart")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    cart.splice(
                        Number(button.dataset.index),
                        1
                    );

                    saveCart();

                    updateCartCount();

                    renderCheckoutCart();

                }
            );

        });

}



/* =====================================================
   ORDER SUMMARY
===================================================== */

function renderOrderSummary() {

    let total = 0;


    let rows = "";


    cart.forEach(item => {

        const itemTotal =
            item.price * item.quantity;

        total += itemTotal;


        rows += `

            <tr>

                <td>
                    ${escapeHTML(item.name)}
                </td>

                <td>
                    ${item.quantity}
                </td>

                <td>
                    ${formatPrice(item.price)}
                </td>

                <td>
                    ${formatPrice(itemTotal)}
                </td>

            </tr>

        `;

    });


    const name =
        document.getElementById(
            "customerName"
        ).value;


    const phone =
        document.getElementById(
            "customerPhone"
        ).value;


    const address =
        document.getElementById(
            "customerAddress"
        ).value;


    orderSummary.innerHTML = `

        <div style="
            background:#f6fafc;
            padding:15px;
            border-radius:14px;
            margin-bottom:15px;
            line-height:2;
            font-size:13px;
        ">

            <strong>
                اطلاعات مشتری
            </strong>

            <br>

            نام:
            ${escapeHTML(name)}

            <br>

            تماس:
            ${escapeHTML(phone)}

            <br>

            آدرس:
            ${escapeHTML(address)}

        </div>


        <table class="order-table">

            <thead>

                <tr>

                    <th>
                        محصول
                    </th>

                    <th>
                        تعداد
                    </th>

                    <th>
                        قیمت
                    </th>

                    <th>
                        مجموع
                    </th>

                </tr>

            </thead>

            <tbody>

                ${rows}

            </tbody>

            <tfoot>

                <tr>

                    <th colspan="3">
                        مبلغ نهایی
                    </th>

                    <th>
                        ${formatPrice(total)}
                    </th>

                </tr>

            </tfoot>

        </table>

    `;

}



/* =====================================================
   COPY ORDER
===================================================== */

copyOrder.addEventListener(
    "click",
    async () => {

        const text =
            createOrderText();


        try {

            await navigator.clipboard.writeText(text);

            showSmallNotice(
                "جدول سفارش کپی شد."
            );

        } catch {

            fallbackCopy(text);

        }

    }
);



function createOrderText() {

    const name =
        document.getElementById(
            "customerName"
        ).value;


    const phone =
        document.getElementById(
            "customerPhone"
        ).value;


    const address =
        document.getElementById(
            "customerAddress"
        ).value;


    let text =
        "اطلاعات سفارش\n\n";


    text +=
        `نام: ${name}\n`;

    text +=
        `شماره تماس: ${phone}\n`;

    text +=
        `آدرس: ${address}\n\n`;


    text +=
        "محصولات:\n";


    cart.forEach((item, index) => {

        text +=
            `${index + 1}. ${item.name} | تعداد: ${item.quantity} | قیمت: ${formatPrice(item.price)}\n`;

    });


    let total =
        cart.reduce(
            (sum, item) =>
                sum + item.price * item.quantity,
            0
        );


    text +=
        `\nمبلغ نهایی: ${formatPrice(total)}`;


    return text;

}



/* =====================================================
   FINISH
===================================================== */

finishOrder.addEventListener(
    "click",
    () => {

        showSmallNotice(
            "اطلاعات سفارش آماده ارسال است."
        );

    }
);



/* =====================================================
   CATEGORY FILTER
===================================================== */

document.querySelectorAll(".category")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document.querySelectorAll(".category")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );


                button.classList.add("active");


                const category =
                    button.dataset.category;


                document.querySelectorAll(".product-card")
                    .forEach(card => {

                        if (
                            category === "all" ||
                            card.dataset.category === category
                        ) {

                            card.style.display =
                                "inline-flex";

                        } else {

                            card.style.display =
                                "none";

                        }

                    });

            }
        );

    });



/* =====================================================
   SEARCH
===================================================== */

searchBtn.addEventListener(
    "click",
    () => {

        searchBox.classList.toggle("show");

        if (searchBox.classList.contains("show")) {

            setTimeout(
                () => searchInput.focus(),
                100
            );

        }

    }
);


closeSearch.addEventListener(
    "click",
    () => {

        searchBox.classList.remove("show");

        searchInput.value = "";

        showAllProducts();

    }
);


searchInput.addEventListener(
    "input",
    () => {

        const query =
            searchInput.value
                .trim()
                .toLowerCase();


        document.querySelectorAll(".product-card")
            .forEach(card => {

                const name =
                    card.dataset.name.toLowerCase();


                card.style.display =
                    !query ||
                    name.includes(query)
                        ? "inline-flex"
                        : "none";

            });

    }
);



function showAllProducts() {

    document.querySelectorAll(".product-card")
        .forEach(card => {

            card.style.display =
                "inline-flex";

        });

}



/* =====================================================
   MOBILE MENU
===================================================== */

function openMenu() {

    mobileMenu.classList.add("active");

    menuOverlay.classList.add("active");

    document.body.style.overflow = "hidden";

}


function closeMobileMenu() {

    mobileMenu.classList.remove("active");

    menuOverlay.classList.remove("active");

    if (
        !document.querySelector(".modal-overlay.active")
    ) {

        document.body.style.overflow = "";

    }

}


menuBtn.addEventListener(
    "click",
    openMenu
);


closeMenu.addEventListener(
    "click",
    closeMobileMenu
);


menuOverlay.addEventListener(
    "click",
    closeMobileMenu
);


document.querySelectorAll(".mobile-menu a")
    .forEach(link => {

        link.addEventListener(
            "click",
            closeMobileMenu
        );

    });



/* =====================================================
   ADMIN MESSAGE
===================================================== */

closeAdminMessage.addEventListener(
    "click",
    () => {

        adminMessage.classList.add("hide");

        localStorage.setItem(
            "adminMessageClosed",
            "1"
        );

    }
);


/*
   اگر کاربر قبلاً پیام را نبسته باشد،
   پیام نمایش داده می‌شود.
*/

if (
    localStorage.getItem(
        "adminMessageClosed"
    ) === "1"
) {

    adminMessage.classList.add("hide");

}



/* =====================================================
   HELPERS
===================================================== */

function formatPrice(price) {

    return (
        Number(price)
            .toLocaleString("fa-IR")
        + " تومان"
    );

}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value);

    return div.innerHTML;

}


function fallbackCopy(text) {

    const textarea =
        document.createElement("textarea");

    textarea.value = text;

    document.body.appendChild(textarea);

    textarea.select();

    document.execCommand("copy");

    textarea.remove();

    showSmallNotice(
        "اطلاعات سفارش کپی شد."
    );

}


let noticeTimer;


function showSmallNotice(message) {

    // پاک کردن نوتیفیکیشن قبلی
    const oldNotice = document.querySelector(".small-notice");
    if (oldNotice) {
        oldNotice.remove();
    }

    // پاک کردن تایمر قبلی
    if (window.noticeTimer) {
        clearTimeout(window.noticeTimer);
        window.noticeTimer = null;
    }

    // ساخت نوتیفیکیشن جدید
    const notice = document.createElement("div");
    notice.className = "small-notice";
    notice.textContent = message;
    
    // استایل دهی
    notice.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) scale(0.9);
        z-index: 99999;
        background: #0079b1;
        color: white;
        padding: 20px 35px;
        border-radius: 16px;
        font-size: 18px;
        font-weight: 700;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        direction: rtl;
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        text-align: center;
        min-width: 300px;
        max-width: 90%;
        border: 2px solid rgba(255,255,255,0.2);
    `;

    document.body.appendChild(notice);

    // نمایش با انیمیشن
    setTimeout(() => {
        notice.style.opacity = "1";
        notice.style.transform = "translate(-50%, -50%) scale(1)";
    }, 50);

    // تنظیم تایمر برای حذف خودکار بعد از 3 ثانیه
    window.noticeTimer = setTimeout(() => {
        notice.style.opacity = "0";
        notice.style.transform = "translate(-50%, -50%) scale(0.9)";
        setTimeout(() => {
            if (notice.parentNode) {
                notice.remove();
            }
        }, 400);
    }, 3000);
}

/* =====================================================
   ESC KEY
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") return;


        closeMobileMenu();

        closeModal(productModal);

        closeModal(cartModal);

        closeModal(checkoutModal);

    }
);



/* =====================================================
   INITIALIZE
===================================================== */

loadCart();

updateCartCount();






// map






 







