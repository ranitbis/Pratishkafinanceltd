        // 🟢 User's Direct & Smooth Touch Logic 🟢
        const touchDot = document.getElementById("touchPointer");

        document.addEventListener("touchstart", function(e){
            let touch = e.touches[0];
            touchDot.style.left = touch.clientX + "px";
            touchDot.style.top = touch.clientY + "px";
            touchDot.style.display = "block";
        }, {passive: true});

        document.addEventListener("touchmove", function(e){
            let touch = e.touches[0];
            touchDot.style.left = touch.clientX + "px";
            touchDot.style.top = touch.clientY + "px";
        }, {passive: true});

        document.addEventListener("touchend", function(){
            touchDot.style.display = "none";
        });

        document.addEventListener("touchcancel", function(){
            touchDot.style.display = "none";
        });

        // ---------------------------------------------------------------- //

        // 1. Strict PAN Checking Logic (unchanged)
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

        // 2. EMAIL VERIFICATION (Using Nodemailer Backend)
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
                // Show loading state on button
                const btn = event.target;
                const originalText = btn.innerText;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                
                const response = await fetch('https://pratishkafinanceltd.onrender.com/api/send-email-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                const data = await response.json();
                
                btn.innerHTML = originalText; // Restore button text
                
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
                console.error("Email OTP Error:", error);
            }
        };
        
        window.verifyEmailOTP = async function() {
            const email = document.getElementById('email').value;
            const otp = document.getElementById('emailOTP').value;
            const emailError = document.getElementById('emailError');
            const emailSuccess = document.getElementById('emailSuccess');
            
            if (!otp || otp.length !== 6) {
                emailError.innerText = 'Please enter 6-digit OTP';
                emailError.style.display = 'block';
                return;
            }
            
            try {
                // Show loading
                const btn = event.target;
                const originalText = btn.innerText;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
                
                const response = await fetch('https://pratishkafinanceltd.onrender.com/api/verify-email-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp })
                });
                
                const data = await response.json();
                
                btn.innerHTML = originalText;
                
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
                console.error("Email Verify Error:", error);
            }
        };

        // 3. BANK LOGIC (unchanged)
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
                error.style.display = "block"; document.getElementById('submitBtn').disabled = true;
            } else {
                error.style.display = "none"; document.getElementById('submitBtn').disabled = false;
            }
        }

        async function verifyIFSC() {
            const ifscInput = document.getElementById("ifsc").value.toUpperCase();
            const bankSelect = document.getElementById("bankName");
            const selectedOption = bankSelect.options[bankSelect.selectedIndex];
            const expectedPrefix = selectedOption.getAttribute("data-prefix");
            const errorMsg = document.getElementById("ifscError");
            const loader = document.getElementById("ifscLoader");
            const successMsg = document.getElementById("ifscSuccess");
            const branchName = document.getElementById("branchName");
            const submitBtn = document.getElementById('submitBtn');

            errorMsg.style.display = "none"; successMsg.style.display = "none"; branchName.value = ""; submitBtn.disabled = true;

            if (ifscInput.length === 0) return;
            if (!expectedPrefix) { errorMsg.innerHTML = "Select a Bank first."; errorMsg.style.display = "block"; return; }
            if (ifscInput.length >= 4 && !ifscInput.startsWith(expectedPrefix)) {
                errorMsg.innerHTML = `Mismatch: Selected bank code starts with ${expectedPrefix}.`; errorMsg.style.display = "block"; return;
            }

            if (ifscInput.length === 11) {
                loader.style.display = "block";
                try {
                    const response = await fetch(`https://ifsc.razorpay.com/${ifscInput}`);
                    loader.style.display = "none";
                    if (response.status === 200) {
                        const data = await response.json();
                        if (data.STATE.toUpperCase() !== "WEST BENGAL") {
                            errorMsg.innerHTML = `Location Error: We only accept West Bengal branches.`; errorMsg.style.display = "block"; return;
                        }
                        branchName.value = `${data.BRANCH}, ${data.CITY}`;
                        successMsg.innerHTML = `<i class="fas fa-check-circle"></i> Verified: ${data.BANK} (WB)`;
                        successMsg.style.display = "block";
                        if(document.getElementById("accNumber").value === document.getElementById("confirmAccNumber").value) { submitBtn.disabled = false; }
                    } else { throw new Error("Invalid IFSC"); }
                } catch (error) { loader.style.display = "none"; errorMsg.innerHTML = "Invalid IFSC Code."; errorMsg.style.display = "block"; }
            }
        }

        // 4. PIN CODE LOGIC (unchanged)
        async function fetchAddress() {
            const pin = document.getElementById('pincode').value;
            const errorMsg = document.getElementById('pinError');
            const loader = document.getElementById('pinLoader');
            const districtInput = document.getElementById('district');
            const areaSelect = document.getElementById('areaSelect');

            if (pin.length === 6) {
                loader.style.display = 'block'; errorMsg.style.display = 'none';
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                    const data = await response.json();
                    loader.style.display = 'none';
                    if (data[0].Status === "Success") {
                        const postOffices = data[0].PostOffice;
                        if (postOffices[0].State !== "West Bengal") {
                            errorMsg.style.display = 'block'; errorMsg.innerText = "Error: West Bengal PIN codes only.";
                            districtInput.value = ""; areaSelect.innerHTML = '<option value="">Invalid Location</option>';
                            document.getElementById('submitBtn').disabled = true; return;
                        }
                        districtInput.value = postOffices[0].District;
                        areaSelect.innerHTML = '<option value="">Select your area...</option>';
                        postOffices.forEach(po => {
                            let option = document.createElement('option'); option.value = po.Name; option.innerText = po.Name + " (" + po.Block + ")";
                            areaSelect.appendChild(option);
                        });
                    } else {
                        errorMsg.style.display = 'block'; errorMsg.innerText = "Invalid PIN.";
                        districtInput.value = ""; areaSelect.innerHTML = '<option value="">Enter valid PIN</option>';
                    }
                } catch (error) { loader.style.display = 'none'; errorMsg.style.display = 'block'; errorMsg.innerText = "Network error."; }
            } else { districtInput.value = ""; areaSelect.innerHTML = '<option value="">Enter PIN code first</option>'; errorMsg.style.display = 'none'; }
        }

        // 5. FINAL FORM SUBMISSION (Modified - only checks email verification)
        document.getElementById("loanForm").addEventListener("submit", async function(e) {
            e.preventDefault();
            
            // Only check email verification now (mobile verification removed)
            if(!isEmailVerified) { 
                alert("Please verify your email address before final submission."); 
                return; 
            }
            
            const btn = document.getElementById("submitBtn");
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Application...';
            btn.disabled = true;
            
            // ফর্মের সমস্ত ডেটা একসাথে করা
            const formData = {
                fullName: document.getElementById("fullName").value,
                mobile: document.getElementById("mobile").value,
                email: document.getElementById("email").value,
                amount: document.getElementById("amount").value,
                pan: document.getElementById("pan").value,
                aadhaar: document.getElementById("aadhaar").value,
                bankName: document.getElementById("bankName").value,
                accNumber: document.getElementById("accNumber").value,
                ifsc: document.getElementById("ifsc").value,
                branchName: document.getElementById("branchName").value,
                pincode: document.getElementById("pincode").value,
                state: document.getElementById("state").value,
                district: document.getElementById("district").value,
                area: document.getElementById("areaSelect").value,
                fullAddress: document.getElementById("fullAddress").value
            };

            try {
                // আপনার লোকাল সার্ভারে ডেটা পাঠানো
                const response = await fetch('https://pratishkafinanceltd.onrender.com/api/apply', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if(data.success) {
                    alert("✅ Application Submitted Successfully to Pratiksha Finance Ltd. servers!");
                    this.reset(); // ফর্ম ক্লিয়ার করা
                    
                    // Reset email verification state
                    isEmailVerified = false; 
                    document.getElementById("emailSuccess").style.display = "none";
                    document.querySelector('button[onclick="sendEmailOTP()"]').disabled = false;
                    document.getElementById("ifscSuccess").style.display = "none";
                    document.getElementById("bankLogo").style.display = "none";
                } else {
                    alert("❌ Error: " + data.message);
                }
            } catch (error) {
                console.error("Submission Error:", error);
                alert("⚠️ Cannot connect to server! Ensure Termux backend is running.");
            } finally {
                btn.innerHTML = 'Submit Secure Application <i class="fa-solid fa-arrow-right"></i>';
                btn.disabled = false;
            }
        });
