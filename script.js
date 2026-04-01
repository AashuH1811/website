// ===== AUTO LOGIN CHECK ONLY FOR DONOR LOGIN PAGE =====
if (window.location.pathname.split("/").pop() === "login.html") {

    let currentDonor = localStorage.getItem("currentDonor");

    if (currentDonor) {
        window.location.href = "donor-dashboard.html";
    }
}
// ================= REGISTER =================
document.getElementById("registerForm")?.addEventListener("submit", function(e){

e.preventDefault();

let firstName = document.getElementById("firstName").value.trim();
let lastName = document.getElementById("lastName").value.trim();
let email = document.getElementById("email").value.trim();
let contact = document.getElementById("contact").value.trim();
let address = document.getElementById("address").value.trim();
let password = document.getElementById("password").value;

let namePattern = /^[A-Za-z]+$/;

if(!namePattern.test(firstName)){
alert("First name must contain only letters");
return;
}

if(!namePattern.test(lastName)){
alert("Last name must contain only letters");
return;
}

let phonePattern = /^[0-9]{10}$/;

if(!phonePattern.test(contact)){
alert("Contact number must be 10 digits");
return;
}

let passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{1,12}$/;

if(!passwordPattern.test(password)){
alert("Password must contain 1 uppercase and 1 special character");
return;
}

let donor = {
firstName:firstName,
lastName:lastName,
email:email,
contact:contact,
address:address,
password:password,
donations:[]
};

let donors = JSON.parse(localStorage.getItem("donors")) || [];

if(donors.some(d => d.email === donor.email)){
alert("Email already registered!");
return;
}

donors.push(donor);
localStorage.setItem("donors", JSON.stringify(donors));

alert("Registered Successfully!");
window.location.href="login.html";

});
function goBack(){
    window.location.href = "index.html";
}

// ================= DONOR LOGIN =================
document.getElementById("loginForm")?.addEventListener("submit", function(e){
    e.preventDefault();

    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    let donors = JSON.parse(localStorage.getItem("donors")) || [];

    let found = donors.find(d => d.email === email && d.password === password);

    if(found){
        localStorage.setItem("currentDonor", JSON.stringify(found));
        window.location.href = "donor-dashboard.html";
    } else {
        alert("Invalid Login!");
    }
});


// ================= LOAD DONOR DASHBOARD =================
if(document.getElementById("name")){

    let donor = JSON.parse(localStorage.getItem("currentDonor"));

    if(!donor){
        window.location.href = "login.html";
    }

    document.getElementById("name").innerText = donor.firstName + " " + donor.lastName;
    document.getElementById("email").innerText = donor.email;
    document.getElementById("contact").innerText = donor.contact;
}

// ================= PROCESS PAYMENT =================
function processPayment(){

    let amount = document.getElementById("amount").value;

    if(!amount || amount <= 0){
        alert("Enter valid amount!");
        return;
    }

    let donor = JSON.parse(localStorage.getItem("currentDonor"));
    let donors = JSON.parse(localStorage.getItem("donors"));

    let donationID = "DON" + Math.floor(Math.random()*100000);

    donor.donations.push(amount);

    let index = donors.findIndex(d => d.email === donor.email);
    donors[index] = donor;

    localStorage.setItem("donors", JSON.stringify(donors));
    localStorage.setItem("currentDonor", JSON.stringify(donor));

    showReceipt(donationID, amount);
    updateSummary();

    document.getElementById("amount").value = "";
}



// ================= WHATSAPP CASH =================
function sendWhatsApp(){

    let amount = document.getElementById("amount").value || "a donation";

    let message = `Hello NGO 🙏

I would like to donate ₹${amount} in cash to support your noble cause ❤️

Please let me know how I can hand over the donation.

Thank you 🌸`;

    let phone = "919699258832";

    let url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url,"_blank");
}


// ================= ADMIN LOGIN =================
document.getElementById("adminLoginForm")?.addEventListener("submit", function(e){
    e.preventDefault();

    let name = document.getElementById("adminName").value;
    let pass = document.getElementById("adminPassword").value;

    if(name === "admin" && pass === "1234"){
        window.location.href = "admin-dashboard.html";
    } else {
        alert("Invalid Admin Login!");
    }
});


// ================= LOAD ADMIN DASHBOARD =================
if(document.getElementById("allDonors")){

    let donors = JSON.parse(localStorage.getItem("donors")) || [];
    let container = document.getElementById("allDonors");
    let searchInput = document.getElementById("searchInput");

    function displayDonors(list){
        container.innerHTML = "";

        if(!list.length){
            container.innerHTML = "No donors found.";
            return;
        }

        list.forEach(d => {

            let total = 0;

            if (Array.isArray(d.donations)) {
                total = d.donations.reduce((sum, donation) => {
                    return sum + Number(donation.amount || donation);
                }, 0);
            }

         container.innerHTML += `
    <div class="donor-card">
        <div>
            <h3>${d.firstName} ${d.lastName}</h3>
            <p>${d.email}</p>
        </div>

        <div>
            <p>📞 ${d.contact}</p>
            <p>📍 ${d.address}</p>
        </div>

        <div class="donor-total">
            ₹ ${total}
        </div>
    </div>
`;
        });
    }

    displayDonors(donors);

    searchInput.addEventListener("keyup", function(){
        let value = this.value.toLowerCase();

        let filtered = donors.filter(d =>
            d.firstName.toLowerCase().includes(value) ||
            d.lastName.toLowerCase().includes(value) ||
            d.email.toLowerCase().includes(value)
        );

        displayDonors(filtered);
    });
}
// ===== OPEN PAYMENT MODAL =====
function openPaymentApps(){

    let amount = document.getElementById("amount").value;

    if(!amount || amount <= 0){
        alert("Enter valid amount!");
        return;
    }

    document.getElementById("paymentModal").style.display = "flex";
}

// ===== CLOSE MODAL =====
function closePayment(){
    document.getElementById("paymentModal").style.display = "none";
}




// ===== PAY ONLINE (SUCCESS + SOUND + AUTO UPDATE) =====
function payUPI(app){

    let amount = document.getElementById("amount").value;

    if(!amount || amount <= 0){
        alert("Enter valid amount!");
        return;
    }

    // Detect if device is mobile
    let isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if(!isMobile){
        alert("Online payment works only on mobile device 📱");
        return;
    }

    // ===== YOUR REAL UPI ID =====
    let upiID = "9699258832@upi";   // 🔴 CHANGE THIS
    let name = "NGO Donation";

    let upiURL = `upi://pay?pa=${upiID}&pn=${name}&am=${amount}&cu=INR`;

    window.location.href = upiURL;
saveDonation(amount);
showReceipt(amount);

    closePayment();
}


// ===== QR CODE =====
// ===== QR MODAL OPEN =====
function openQR() {

    let amount = document.getElementById("amount").value;

    if(!amount || amount <= 0){
        alert("Enter valid amount!");
        return;
    }

    document.getElementById("qrModal").style.display = "flex";
}

// ===== QR MODAL CLOSE =====
function closeQR(){
    document.getElementById("qrModal").style.display = "none";
}
function goBack(){
    window.history.back();
}
function closePaymentModal(){
    document.getElementById("paymentModal").style.display = "none";
}
// ================= HOME PAGE AUTO SLIDER =================
if (document.querySelector(".slide")) {

    let slides = document.querySelectorAll(".slide");
    let current = 0;

    function showNextSlide() {
        slides[current].classList.remove("active");

        current++;
        if (current >= slides.length) {
            current = 0;
        }

        slides[current].classList.add("active");
    }

    // Change image every 3 seconds
    setInterval(showNextSlide, 3000);
}
// ===== LOGOUT FUNCTION =====
function logout(){

if(confirm("Are you sure you want to logout?")){

localStorage.clear();
window.location.href="login.html";

}

}

// ===== SAVE DONATION =====
function saveDonation(amount){

let donor = JSON.parse(sessionStorage.getItem("currentDonor"));
    let donors = JSON.parse(localStorage.getItem("donors"));

    let donation = {
        id: "DON" + Math.floor(Math.random()*100000),
        amount: Number(amount),
        date: new Date().toLocaleString()
    };

    donor.donations.push(donation);

    let index = donors.findIndex(d => d.email === donor.email);
    donors[index] = donor;

    localStorage.setItem("donors", JSON.stringify(donors));
    localStorage.setItem("currentDonor", JSON.stringify(donor));

    updateSummary();

}
