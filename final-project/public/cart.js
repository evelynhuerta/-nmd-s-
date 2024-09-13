/**
 * Author: Evelyn Huerta
 * CS 132 Spring 2024
 * Date: June 14, 2024
 * 
 * This file contains the functions to populate the Cart section of Sonic Seats.
 */

(function () {
    "use strict";
    let totalPrice = 0;
    let payMethod;

    /**
     * Adds event listeners for purchase button and initializes the cart with items from localStorage.
     */
    function init() {
        populateCart();
        let priceDisplay = qs("#total-price");
        priceDisplay.textContent = "Total Price: $" + totalPrice + ".00";
        let purchaseButton = qs("#purchase-btn");
        purchaseButton.addEventListener("click", pay);
    }

    /**
     * Populates the cart section with items from localStorage, fetching concert details from the server.
     */
    async function populateCart() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        for (let i = 0; i < cart.length; i++) {
            const item = cart[i];
            let concertId = item["concertID"];
            let concert;
            try {
                let response = await fetch("/concert/" + concertId);
                checkStatus(response);
                concert = await response.json();
            } catch (err) {
                handleError(err);
            }

            let cartSection = qs("#cart-section");
            let ticket = gen("div");
            ticket.classList.add("ticket");

            let concertInfo = gen("div");
            concertInfo.classList.add("concert-info");

            let artist = gen("h3");
            artist.textContent = concert["artist"];

            let img = gen("img");
            img.src = "images/" + (artist.textContent.toLowerCase().split(' ')).join('-') + ".png";
            img.alt = (artist.textContent.toLowerCase().split(' ')).join('-');
            
            let utc = concert["UTC_time"];
            let utcTime = new Date(utc);
            let pstTime = utcTime.toLocaleString("en-US", {
                timeZone: "America/Los_Angeles"
            });

            utcTime = String(utcTime).split(" ");
            pstTime = String(pstTime).split(" ");
            let time = gen("p");
            time.textContent =  utcTime[1] + " " + utcTime[2] + " " + utcTime[3] + " - " + (pstTime[1]).slice(0, 4) + pstTime[2];

            let place = gen("p");
            place.textContent = concert["venue"] + ", " + concert["location"];

            concertInfo.appendChild(artist);
            concertInfo.appendChild(time);
            concertInfo.appendChild(place);
            ticket.appendChild(img);
            ticket.appendChild(concertInfo);
            cartSection.appendChild(ticket);

            let seat = cart[i]["seat"];
            let pSeat = gen("p");
            pSeat.textContent = "Seat: " + seat;

            let price = cart[i]["price"];
            totalPrice = totalPrice + price;
            let priceDisplay = qs("#total-price");
            priceDisplay.textContent = "Total Price: $" + totalPrice + ".00"
            let pPrice = gen("p");
            pPrice.textContent = "Price: $" + price + ".00";

            let removeButton = gen("button");
            removeButton.id = "remove-btn";
            removeButton.textContent = "Remove";
            removeButton.data = concert;
            removeButton.name = seat;
            removeButton.addEventListener("click", removeFromCart);

            concertInfo.appendChild(pSeat);
            concertInfo.appendChild(pPrice);
            ticket.append(removeButton);
        }
    }

    /**
     * Removes an item from the cart and updates localStorage and the displayed total price.
     */
    function removeFromCart() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const concertId = this.data["concert_id"];
        const concertSeat = this.name;
        let cartSection = qs("#cart-section");
        totalPrice = totalPrice - this.data["tickets"][concertSeat[0]]["price"];
        let priceDisplay = qs("#total-price");
        priceDisplay.textContent = "Total Price: $" + totalPrice + ".00";

        cart = cart.filter(item => item.concertID != concertId || item.seat != concertSeat);
        localStorage.setItem('cart', JSON.stringify(cart));
        cartSection.removeChild(this.parentElement);
    }

    /**
     * Displays payment method options and allows the user to choose a payment method.
     */
    function pay() {
        let payArea = qs("#pay-area");
        let cashButton = gen("button");
        cashButton.textContent = "Cash";
        cashButton.id = "cash";
        let cardButton = gen("button");
        cardButton.textContent = "Credit Card";
        cardButton.id = "credit-card";
        payArea.append(cashButton);
        payArea.append(cardButton);
        cashButton.addEventListener("click", cashOrCard);
        cardButton.addEventListener("click", cashOrCard);
        payArea.removeChild(payArea.children[1]);
    }

    /**
     * Sets the payment method and proceeds to purchase the items in the cart.
     */
    function  cashOrCard() {
        payMethod = this.id;
        purchase();
    }

    /**
     * Purchases the items in the cart by sending the data to the server which then deleted those items 
     * from the inventory, then clears the cart.
     */
    async function purchase() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        for (let i = 0; i < cart.length; i++){
            const item = cart[i];
            let concertId = item["concertID"];
            let formData = new FormData();
            console.log(payMethod.split("-").join(" "));
            formData.append("concertId", concertId);
            formData.append("seats", `["${item["seat"]}"]`);
            formData.append("paymentMethod", payMethod);
            try {
                let resp = await fetch("/purchase", {method : "POST", body: formData});
                checkStatus(resp);
            } catch (err) {
                handleError(err);
            }
        }
        localStorage.clear();
        let cartSection = qs("#cart-section");
        cartSection.innerHTML = "";
        totalPrice = 0;

        let payArea = qs("#pay-area");
        payArea.removeChild(payArea.children[1]);
        payArea.removeChild(payArea.children[1]);

        let priceDisplay = qs("#total-price");
        priceDisplay.textContent = "Total Price: $" + totalPrice + ".00";
        
        let purchaseButton = gen("button");
        purchaseButton.id = "purchase-btn";
        purchaseButton.textContent = " Purchase ";
        payArea.appendChild(purchaseButton);
        purchaseButton.addEventListener("click", pay);
        successfulPurchase();
    }

    /**
     * Displays a success message in the cart section for a successful purchase,
     * then removes the message after 3 seconds.
     */
    function successfulPurchase() {
        let cartSection = qs("#cart-section");
        let message = gen("p");
        message.textContent = "Successful Purchase!";
        cartSection.appendChild(message);
        setTimeout(() => { 
            message.remove();
        }, 3000);
    }

    /**
       * Displays an error message on the page with customized error message if applicable.
       * @param {String} err - specific error message to display.
       */
    function handleError(err) {
        if (typeof err === "string") {
            qs("#cart-section").textContent = err;
        } else {
            qs("#cart-section").textContent =
                "An error ocurred fetching from the Sonic Seats data. Please try again later.";
        }
    }

    init();
})();