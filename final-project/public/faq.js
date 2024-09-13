/**
 * Author: Evelyn Huerta
 * CS 132 Spring 2024
 * Date: June 14, 2024
 * 
 * This file contains the functions to populate the FAQ section of Sonic Seats.
 */

(function () {
    "use strict";

    /**
     * Calls populate FAQ section by calling populateFAQ().
     */
    function init() {
        populateFAQ();
    }

    /**
     * Fetches the FAQ data from the server and populates the FAQ section with the data.
     * If an error occurs during the fetch operation, it displays an error message.
     */
    async function populateFAQ() {
        let faqs;
        try {
            let response = await fetch("/faq");
            checkStatus(response);
            faqs = await response.json();
        } catch (err) {
            handleError(err);
        }
        let faqSection = qs("#faq-section");
        for (const faq of faqs){
            let qa = gen("div");
            let question = gen("p");
            let answer = gen("p");
            qa.classList.add("qa");
            question.textContent = "Q: " + faq["question"];
            answer.textContent = "A: " + faq["answer"];
            qa.appendChild(question);
            qa.appendChild(answer);
            faqSection.append(qa);
        }
    }

    /**
       * Displays an error message on the page with customized error message if applicable.
       * @param {String} err - specific error message to display.
       */
    function handleError(err) {
        if (typeof err === "string") {
            qs("#faq-section").textContent = err;
        } else {
            qs("#faq-section").textContent =
                "An error ocurred fetching from the Sonic Seats data. Please try again later.";
        }
    }

    init();
})();