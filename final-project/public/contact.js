/**
 * Author: Evelyn Huerta
 * CS 132 Spring 2024
 * Date: June 14, 2024
 * 
 * This file contains the functions to populate and submit the contact form to Sonic Seats.
 */

(function () {
    "use strict";

    /**
    * Adds event listener for contact form.
    */
    function init() {
        let form = qs("#contact-form");
        form.addEventListener("submit", (event) => submitForm(event));
    }

    /**
     * Handles the form submission, validates the input, and submits the form data to the server.
     * @param {Event} event - The form submission event.
     */
    async function submitForm(event) {
        event.preventDefault();
        let phone = qs("#user-phone").value;
        phone = phone.match(/\d+/g).join("");
        let category = qs("#categories").value;
        let description = qs("#description").value;

        if (category == "none") {
            constructMessage("Select a category!");
        }else if (phone.length != 10) {
            constructMessage("Enter a valid phone number!");
        }else if (description == ""){
            constructMessage("Enter a description!");
        }else {
            phone = phone.slice(0, 3) + "-" + phone.slice(3, 6) + "-" + phone.slice(6);
            qs("#user-phone").value = phone;
            let params = new FormData(qs("#contact-form"));
            try {
                let resp = await fetch("/contact", { method : "POST", body : params });
                checkStatus(resp);
                formSubmitted();
            } catch (err) {
                handleError(err);
            }
        }
    }

    /**
     * Constructs and displays a message on the page.
     * @param {String} messageText - The text of the message to display.
     */
    function constructMessage(messageText){
        let message = gen("p");
        message.textContent = messageText;
        let contactSection = qs("#contact-section");
        contactSection.append(message);
        setTimeout(() => { 
            message.remove();
        }, 
        3000);

    }

    /**
     * Handles form submission success by displaying a success message and resetting the form.
     */
    function formSubmitted() {
        let message = gen("p");
        message.textContent = "Form Submitted!";
        let contactSection = qs("#contact-section");
        contactSection.append(message);

        let form = qs("#contact-form");
        form.reset();
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
            qs("#contact-section").textContent = err;
        } else {
            qs("#contact-section").textContent =
                "An error ocurred fetching from the Sonic Seats data. Please try again later.";
        }
    }

    init();
})();