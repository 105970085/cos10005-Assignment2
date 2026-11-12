document.addEventListener("DOMContentLoaded", function () {

    // =========================================================================
    // Common Error Modal Window
    // =========================================================================

    function showErrorModal(errors) {

        // Create background overlay
        const overlay = document.createElement("div");
        overlay.id = "scrnOverlay";

        // Create error window
        const errorWindow = document.createElement("section");
        errorWindow.id = "errWin";

        // Create heading
        const heading = document.createElement("h3");
        heading.textContent = "Please correct the following errors:";

        // Create error list
        const errorList = document.createElement("ul");

        errors.forEach(error => {
            const item = document.createElement("li");
            item.textContent = error.replace(/^・/, "");
            errorList.appendChild(item);
        });

        // Create Close button
        const closeButton = document.createElement("button");
        closeButton.id = "errBtn";
        closeButton.type = "button";
        closeButton.textContent = "Close";

        // Add elements to the error window
        errorWindow.appendChild(heading);
        errorWindow.appendChild(errorList);
        errorWindow.appendChild(closeButton);

        // Add elements to the page
        document.body.appendChild(overlay);
        document.body.appendChild(errorWindow);

        // Display the modal window
        overlay.style.display = "block";
        errorWindow.style.display = "block";

        // Close the modal window
        closeButton.addEventListener("click", function () {
            overlay.remove();
            errorWindow.remove();
        });

        // Also close when clicking the dark background
        overlay.addEventListener("click", function () {
            overlay.remove();
            errorWindow.remove();
        });
    }

    // =========================================================================
    // Reservation screen: Automatic deposit renewal process
    // =========================================================================

    // Get the restaurant selection element
    const resDropdown = document.getElementById("resRestaurant");

    const resPeopleInput = document.getElementById("resPeople");
    const opt1 = document.getElementById("opt1");
    const opt2 = document.getElementById("opt2");

    // Monitor restaurant selection
    if (resDropdown) {
        resDropdown.addEventListener("change", updateDeposit);
    }

    // Monitor number of people
    if (resPeopleInput) {
        resPeopleInput.addEventListener("input", updateDeposit);
    }

    // Monitor add-on selections
    if (opt1) {
        opt1.addEventListener("change", updateDeposit);
    }

    if (opt2) {
        opt2.addEventListener("change", updateDeposit);
    }

    // Calculate the total deposit
    function updateDeposit() {
        if (!resDropdown) return;

        const selectedOption = resDropdown.options[resDropdown.selectedIndex];

        if (!selectedOption) return;

        // Deposit per person
        const depositPerPerson =
            parseInt(selectedOption.getAttribute("data-deposit")) || 0;

        // Number of people
        const peopleCount = resPeopleInput
            ? parseInt(resPeopleInput.value) || 1
            : 1;

        // Add-on costs per person
        let addOnPerPerson = 0;

        if (opt1 && opt1.checked) {
            addOnPerPerson += parseInt(opt1.value) || 0;
        }

        if (opt2 && opt2.checked) {
            addOnPerPerson += parseInt(opt2.value) || 0;
        }

        // Calculate total deposit
        const totalDeposit = (depositPerPerson + addOnPerPerson) * peopleCount;

        // Display the calculated deposit
        const displayDeposit = document.getElementById("displayDeposit");

        if (displayDeposit) {
            displayDeposit.innerText = "¥" + totalDeposit.toLocaleString();
        }

        // Update hidden field for form submission
        const hiddenDeposit = document.getElementById("hiddenDeposit");

        if (hiddenDeposit) {
            hiddenDeposit.value = totalDeposit;
        }
    }

    // =========================================================================
    // Process for transferring restaurant and add-on selections
    // to the reservation screen
    // =========================================================================

    const urlParams = new URLSearchParams(window.location.search);

    // Transfer restaurant selection
    const selectedRes = urlParams.get("restaurant");

    if (resDropdown && selectedRes) {
        resDropdown.value = selectedRes;
    }

    // Transfer optional add-on selections
    const selectedopt1 = urlParams.get("opt1");
    const selectedopt2 = urlParams.get("opt2");

    if (opt1 && selectedopt1 === "true") {
        opt1.checked = true;
    }

    if (opt2 && selectedopt2 === "true") {
        opt2.checked = true;
    }

    // Recalculate the deposit after transferring all selections
    updateDeposit();

    // =========================================================================
    // Reservation screen：Conditional display control based on payment method
    // =========================================================================

    const payMethodDropdown = document.getElementById("resPaymentMethod");

    function updatePaymentDisplay() {
        const voucherField = document.getElementById("voucherField");
        const creditField = document.getElementById("creditCardField");

        if (!payMethodDropdown || !voucherField || !creditField) return;

        if (payMethodDropdown.value === "voucher") {
            voucherField.style.display = "block";
            creditField.style.display = "none";
        } else {
            voucherField.style.display = "none";
            creditField.style.display = "block";
        }
    }

    if (payMethodDropdown) {
        payMethodDropdown.addEventListener("change", updatePaymentDisplay);

        // initial display
        updatePaymentDisplay();
    }

    // =========================================================================
    // Reservation screen：Synchronising the billing email address
    // =========================================================================

    const syncCheckbox = document.getElementById("syncEmail");
    const primaryEmailInput = document.getElementById("resEmail");
    const billingEmailInput = document.getElementById("resBillingEmail");

    if (syncCheckbox && primaryEmailInput && billingEmailInput) {

        function syncBillingEmail() {
            if (syncCheckbox.checked) {
                billingEmailInput.value = primaryEmailInput.value;
            }
        }

        syncCheckbox.addEventListener("change", syncBillingEmail);

        primaryEmailInput.addEventListener("input", syncBillingEmail);

        // Check the initial state as well
        syncBillingEmail();
    }

    // =========================================================================
    // Registration Form：Input validation
    // =========================================================================

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener("submit", function (e) {

            let errors = [];

            const username = document.getElementById("regUsername").value.trim();
            const email = document.getElementById("regEmail").value.trim();
            const phone = document.getElementById("regPhone").value.trim();
            const password = document.getElementById("regPassword").value;
            const confirmPassword = document.getElementById("regConfirmPassword").value;

            const genderSelected =
                document.querySelector('input[name="gender"]:checked');

            // 1. All fields must be completed
            if (
                !username ||
                !email ||
                !phone ||
                !password ||
                !confirmPassword ||
                !genderSelected
            ) {
                errors.push("・All fields are required. Please fill in all the information.");
            }

            // 2. username（minimum 5 characters;  letters, numbers, and underscores only）
            const usernameRegex = /^[A-Za-z0-9_]{5,}$/;

            if (username && !usernameRegex.test(username)) {
                errors.push("・Usernames must be at least 5 characters and can only contain letters, numbers, and underscores (_).");
            }

            // 3. Email address validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (email && !emailRegex.test(email)) {
                errors.push("・Please enter a valid email address.");
            }

            // 4. Phone number validation (numbers only, 8-15 digits)
            const phoneRegex = /^[0-9]{8,15}$/;

            if (phone && !phoneRegex.test(phone)) {
                errors.push("・Please enter a valid phone number (8-15 digits).");
            }

            // 5. Password strength
            // At least 10 characters, with uppercase, lowercase, numbers, and special characters
            const passRegex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{10,}$/;

            if (password && !passRegex.test(password)) {
                errors.push("・Password must be at least 10 characters and include uppercase, lowercase, numbers, and special characters.");
            }

            // 6. Confirm password match
            if (password !== confirmPassword) {
                errors.push("・Confirm password does not match the password.");
            }

            // If there are any errors, prevent form submission and show a modal window
            if (errors.length > 0) {
                e.preventDefault();
                showErrorModal(errors);
            }

        });
    }

    // =========================================================================
    // Input validation for the reservation form (reservation.html)
    // =========================================================================
    const reservationForm = document.getElementById("reservationForm");
    if (reservationForm) {
        reservationForm.addEventListener("submit", function (e) {
            let errors = [];

            // Retrieve values safely whilst checking whether each element exists
            const name = document.getElementById("resName").value.trim();
            const email = document.getElementById("resEmail").value.trim();
            const phone = document.getElementById("resPhone").value.trim();
            const restaurant = document.getElementById("resRestaurant").value;
            const dateStr = document.getElementById("resDate").value;
            const people = parseInt(document.getElementById("resPeople").value) || 0;
            const payMethod = document.getElementById("resPaymentMethod").value;
            const billingEmail = document.getElementById("resBillingEmail").value.trim();

            // 1. Check that required fields are not left blank
            if (!name || !email || !phone || !restaurant || !dateStr || !billingEmail) {
                errors.push("・All required fields must be completed.");
            }

            // 2. Email Format Check
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email)) {
                errors.push("・The email address is not in the correct format.");
            }
            if (billingEmail && !emailRegex.test(billingEmail)) {
                errors.push("・The format of the billing email address is incorrect.");
            }

            // 3. Minimum number of digits in a telephone number (10 digits or more)
            if (phone && phone.replace(/\D/g, "").length < 10) {
                errors.push("・Please enter a telephone number consisting of at least 10 digits.");
            }

            // 4. Check number of people (error if 0 or fewer)
            if (people <= 0) {
                errors.push("・Please specify a number of at least one person.");
            }

            // 5. Input past dates and times
            if (dateStr) {
                const selectedDate = new Date(dateStr);
                const now = new Date();
                if (selectedDate < now) {
                    errors.push("・You cannot select a past time for your reservation.");
                }
            }

            // 6. Card number verification during online payments (performed only if applicable)
            if (payMethod === "online") {
                const cardNumEl = document.getElementById("resCardNum");
                if (cardNumEl) {
                    const cardNum = cardNumEl.value.replace(/\s+/g, "");
                    if (!/^\d+$/.test(cardNum)) {
                        errors.push("・Please enter your credit card number using numbers only.");
                    } else if (cardNum.length !== 15 && cardNum.length !== 16) {
                        errors.push("・The number of digits in the card number is incorrect (Visa/Mastercard has 16 digits, Amex has 15 digits).");
                    }
                } 
            }

            // If an error occurs, stop the submission and display a modal window
            if (errors.length > 0) {
                e.preventDefault();
                showErrorModal(errors);
            }
        });
    }


    // =========================================================================
    // Recommended Features (recommend.html)：Rule-based matching
    // =========================================================================

    const btnRecommend = document.getElementById("btnRecommend");

    if (btnRecommend) {

        const restaurantsData = [
            { name: "Yoroi Sushi", diet: "none", budget: "medium", purpose: "date" },
            { name: "Yoshimura-ya", diet: "none", budget: "low", purpose: "family" },
            { name: "Bikkuri Donkey", diet: "none", budget: "low", purpose: "family" },
            { name: "Yomenya Goemon", diet: "none", budget: "low", purpose: "family" },
            { name: "Yakiniku no Mise Shinjuku", diet: "halal", budget: "high", purpose: "date" },
            { name: "CoCo Ichibanya", diet: "halal", budget: "low", purpose: "family" },
            { name: "Daigo", diet: "vegan", budget: "high", purpose: "business" },
            { name: "Ise Sueyoshi", diet: "vegan", budget: "high", purpose: "date" },
            { name: "Ningyocho Imahan", diet: "halal", budget: "high", purpose: "business" }
        ];

        btnRecommend.addEventListener("click", function () {

            const userDiet = document.getElementById("dietPreference").value;
            const userBudget = document.getElementById("budgetRange").value;
            const userPurpose = document.getElementById("diningPurpose").value;

            // Search for restaurants that match your criteria
            const matches = restaurantsData.filter(res => {

                if (userDiet !== "none" && res.diet !== userDiet) {
                    return false;
                }

                return (
                    res.budget === userBudget &&
                    res.purpose === userPurpose
                );
            });

            const resultsSection =
                document.getElementById("recommendResults");

            if (!resultsSection) return;

            // If there is no match
            if (matches.length === 0) {

                resultsSection.innerHTML =
                    "No perfect matches found. Try adjusting your preferences!";

            } else {

                // Result Title
                resultsSection.innerHTML = "";

                const title = document.createElement("p");
                title.className = "match-title";
                title.textContent = "We found the following matches for you:";

                resultsSection.appendChild(title);

                // Create cards for each restaurant
                matches.forEach(res => {

                    const card = document.createElement("div");
                    card.className = "match-card";

                    const restaurantName = document.createElement("h3");
                    restaurantName.textContent = res.name;

                    const description = document.createElement("p");
                    description.textContent =
                        "Perfect match for your current preference!";

                    // View Restaurant button
                    const viewButton = document.createElement("button");
                    viewButton.textContent = "View Restaurant";

                    viewButton.addEventListener("click", function () {

                        const restaurantIds = {
                            "Yoroi Sushi": "yoroi-sushi",
                            "Yoshimura-ya": "yoshimura-ya",
                            "Bikkuri Donkey": "bikkuri-donkey",
                            "Yomenya Goemon": "yomenya-goemon",
                            "Yakiniku no Mise Shinjuku": "yakiniku-no-mise-shinjuku",
                            "CoCo Ichibanya": "coco-ichibanya",
                            "Daigo": "daigo",
                            "Ise Sueyoshi": "ise-sueyoshi",
                            "Ningyocho Imahan": "ningyocho-imahan"
                        };

                        const restaurantId = restaurantIds[res.name];

                        if (restaurantId) {
                            window.location.href = `restaurants.html#${restaurantId}`;
                        }

                    });

                    // Select & Book button
                    const bookButton = document.createElement("button");
                    bookButton.textContent = "Select & Book This Restaurant";

                    bookButton.addEventListener("click", function () {

                        window.location.href =
                            `reservation.html?restaurant=${encodeURIComponent(res.name)}`;

                    });

                    // Button container
                    const buttonContainer = document.createElement("div");
                    buttonContainer.className = "match-buttons";

                    // Add buttons to container
                    buttonContainer.appendChild(viewButton);
                    buttonContainer.appendChild(bookButton);

                    // Add elements to card
                    card.appendChild(restaurantName);
                    card.appendChild(description);
                    card.appendChild(buttonContainer);

                    // Add the card to the results section
                    resultsSection.appendChild(card);

                });
            }

        });
    }

    // =========================================================================
    // Bill Total Calculator (bill.html)
    // =========================================================================

    const billRes = document.getElementById("billRestaurant");
    const billPeople = document.getElementById("billPeople");

    const opt11 = document.getElementById("opt1");
    const opt22 = document.getElementById("opt2");

    const svcRadios = document.getElementsByName("serviceFee");

    const btnGoToReserve =
        document.getElementById("btnGoToReserve");

    if (billRes && billPeople) {

        // Monitoring the entry and modification of amounts
        [billRes, billPeople, opt11, opt22].forEach(element => {

            if (element) {
                element.addEventListener("input", calculateBill);
                element.addEventListener("change", calculateBill);
            }

        });

        // Monitoring changes to service charges
        svcRadios.forEach(radio => {
            radio.addEventListener("change", calculateBill);
        });

        // Calculation of the total amount
        function calculateBill() {

            const basePrice = parseInt(billRes.value) || 0;
            const peopleCount = parseInt(billPeople.value) || 1;

            let addOnPerPerson = 0;

            if (opt11 && opt11.checked) {
                addOnPerPerson += parseInt(opt11.value) || 0;
            }

            if (opt22 && opt22.checked) {
                addOnPerPerson += parseInt(opt22.value) || 0;
            }

            const totalBase = basePrice * peopleCount;
            const totalOptions = addOnPerPerson * peopleCount;

            const subtotal = totalBase + totalOptions;

            // Calculation of service charges
            let feeRate = 0;

            for (const radio of svcRadios) {

                if (radio.checked) {
                    feeRate = parseFloat(radio.value) || 0;
                    break;
                }

            }

            const totalFee = Math.round(subtotal * feeRate);
            const finalTotal = subtotal + totalFee;

            // Display of calculation results
            const outBase = document.getElementById("outBase");
            const outOptions = document.getElementById("outOptions");
            const outFee = document.getElementById("outFee");
            const outTotal = document.getElementById("outTotal");

            if (outBase) {
                outBase.innerText = "¥" + totalBase.toLocaleString();
            }

            if (outOptions) {
                outOptions.innerText = "¥" + totalOptions.toLocaleString();
            }

            if (outFee) {
                outFee.innerText = "¥" + totalFee.toLocaleString();
            }

            if (outTotal) {
                outTotal.innerText = "¥" + finalTotal.toLocaleString();
            }

        }

        // Calculate on initial display
        calculateBill();

        // Redirect to the booking page
        if (btnGoToReserve) {

            btnGoToReserve.addEventListener("click", function () {

                const selectedOption =
                    billRes.options[billRes.selectedIndex];

                const resName = selectedOption
                    ? selectedOption.getAttribute("data-name")
                    : null;

                if (resName && resName !== "None") {

                    // Transfer restaurant and add-on selections
                    const params = new URLSearchParams();

                    params.set("restaurant", resName);

                    if (opt11 && opt11.checked) {
                        params.set("opt1", "true");
                    }

                    if (opt22 && opt22.checked) {
                        params.set("opt2", "true");
                    }

                    window.location.href =
                        `reservation.html?${params.toString()}`;

                } else {

                    showErrorModal([
                        "Please select a valid restaurant before proceeding to booking."
                    ]);

                }

            });
        }
    }

});