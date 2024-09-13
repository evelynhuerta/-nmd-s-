/**
 * Author: Evelyn Huerta
 * CS 132 Spring 2024
 * Date: June 14, 2024
 * 
 * This file contains the functions that add the functionality to the concerts page of Sonic Seats,
 * which involves toggling from single and all product view, loading concerts, filtering concerts,
 * and adding to cart.
 */

(function () {
    "use strict";
    let concertID;

    /**
     * Initializes the application by loading concerts and adding event listeners
     * to filter, back, and search buttons.
     */
    function init() {
        loadConcerts();
        let filterButton = qs("#filter-btn");
        filterButton.addEventListener("click", filterConcerts);
        let backButton = qs("#back-btn");
        backButton.addEventListener("click", toggleView);
        let searchButton = qs("#search-btn");
        searchButton.addEventListener("click", populateSeats);
    }

    /**
     * Toggles between the all-product-view and product-view. 
     * Calls populateProductView when showing the product view.
     */
    function toggleView() {
        qs("#all-product-view").classList.toggle("hidden");
        qs("#product-view").classList.toggle("hidden");

        if (qs("#product-view").classList.value != "hidden"){
            populateProductView(this);
        }else {
            let seats = qs("#seats");
            qs("#venue-section").value = "none";  
            seats.innerHTML = "";
        }
    }

    /**
     * Populates the concert section with concert data and adds event listeners
     * to each concert container for toggling the view.
     * @param {Array} concerts - Array of concert objects to display.
     */
    function populateConcerts(concerts) {
        let concertSection = qs("#concerts");
        for (const concert of concerts){
            let concertContainer = gen("div");
            concertContainer.classList.add("concert-container");
            concertContainer.id = concert["concert_id"];

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
            concertContainer.appendChild(img);
            concertContainer.appendChild(concertInfo);
            concertSection.appendChild(concertContainer);
        }
        let concertContainers = qsa(".concert-container");

        for (let i = 0; i < concertContainers.length; i++) {
            concertContainers[i].addEventListener("click", toggleView);
        }
    }

    /**
     * Loads concert data from the server, populates the concert section,
     * and loads genres and artists for filtering.
     */
    async function loadConcerts() {
        let concerts;
        try {
            let response = await fetch("/concerts");
            checkStatus(response);
            concerts = await response.json();
        } catch (err) {
            handleError(err);
        }
        populateConcerts(concerts);
        loadTypes(concerts, "genre");
        loadTypes(concerts, "artist");
    }

    /**
     * Filters concerts based on selected genre and artist, 
     * then updates the concert section with the filtered concerts.
     */
    async function filterConcerts() {
        let genreOption = qs("#genre-option");
        let genre = (genreOption.children[1]).value;

        let artistOption = qs("#artist-option");
        let artist = (artistOption.children[1]).value;
        
        let url = "";
        if (genre != "none") {
            url = url + "?genre=" + genre;
        }
        if (artist != "none") {
            if (url == "") {
                url = url +"?artist=" + artist;
            }else {
                url = url + "&artist=" + artist;
            }
        }
        let concerts;
        try {
            let response = await fetch("/concerts" + url);
            checkStatus(response);
            concerts = await response.json();
        } catch (err) {
            handleError(err);
        }

        (genreOption.children[1]).value = "none";
        (artistOption.children[1]).value = "none";
        let concertSection = qs("#concerts");
        concertSection.innerHTML = "";
        populateConcerts(concerts);
    }

    /**
     * Populates the genre and artist filter dropdowns with unique values.
     * @param {Array} concerts - Array of concert objects.
     * @param {String} type - Type of filter to populate (genre or artist).
     */
    function loadTypes(concerts, type){
        let items = new Set();
        for (const concert of concerts){
            items.add(concert[type]);
        }
        let typeOption = qs("#" + type.toLowerCase() + "-option");
        let select = typeOption.children[1];
        for (const item of items){
            let option = gen("option")
            option.value = item;
            option.textContent = item;
            select.appendChild(option);
        } 
    }

    /**
     * Populates the product view with selected concert's details.
     * @param {HTMLElement} concertContainer - The selected concert container element.
     */
    function populateProductView(concertContainer) {
        let concert = concertContainer.children;
        let info = concert[1].children;

        let backButton = qs("#back-btn");
        backButton.addEventListener("click", toggleView);

        let concertInfo = qs("#info").children;
        concertInfo[0].textContent = info[0].textContent;
        concertInfo[1].textContent = info[1].textContent;
        concertInfo[2].textContent = info[2].textContent;
 
        let ticketImage = qs("#ticket-img");
        ticketImage.src = concert[0].src;
        ticketImage.alt = concert[0].alt;

        concertID = concertContainer.id;
    }

    /**
     * Populates the seats section with available seats for the selected concert.
     */
    async function populateSeats(){
        let seats = qs("#seats");
        seats.innerHTML = "";
        let concert;
        try {
            let response = await fetch("/concert/" + concertID);
            checkStatus(response);
            concert = await response.json();
        } catch (err) {
            handleError(err);
        }
        let sectionLetter = qs("#venue-section").value;

        if (sectionLetter != "none"){
            let availableSeats = concert["tickets"][sectionLetter]["seats"];
            for (const availableSeat of availableSeats){
                let seat = gen("div");
                seat.classList.add("seat");
                seat.classList.add(availableSeat)
                let pSeat = gen("p");
                pSeat.textContent = "Section " + sectionLetter + " Seat " + availableSeat.slice(1);
                let price = gen("p");
                price.textContent = "$" + concert["tickets"][sectionLetter]["price"] + ".00";
                let addButton = gen("button");
                addButton.classList.add("add-to-cart");
                addButton.textContent = " Add To Cart ";
                addButton.classList.add(availableSeat);
                
                seat.appendChild(pSeat);
                seat.appendChild(price);
                seat.appendChild(addButton);
                seats.appendChild(seat);
                addButton.addEventListener("click", addToCart);
            }
        }
    }

    /**
     * Adds the selected seat to the cart and stores it in local storage.
     */
    async function addToCart() {
        let concert;
        try {
            let response = await fetch("/concert/" + concertID);
            checkStatus(response);
            concert = await response.json();
        } catch (err) {
            handleError(err);
        }
        let seats = qs("#seats");
        let seat = this.parentElement.className.split(" ")[1];
        let price = concert["tickets"][seat[0]]["price"];
        seats.removeChild(this.parentElement);
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push({concertID, seat: seat, price: price});
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    /**
       * Displays an error message on the page with customized error message if applicable.
       * @param {String} err - specific error message to display.
       */
    function handleError(err) {
        if (typeof err === "string") {
            qs("#message-area").textContent = err;
        } else {
            qs("#message-area").textContent =
                "An error ocurred fetching from the Sonic Seats data. Please try again later.";
        }
    }

    init();
})();