const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
<<<<<<< HEAD
const app = express();

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // ৫৮৭ পোর্টের জন্য এটি false রাখতে হয়
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // কানেকশন নিশ্চিত করার জন্য এটি জরুরি
    }
});

    auth: {
        user: 'pb7001365166@gmail.com', // এখানে আপনার জিমেইল দিন
        pass: ' dykdhlzmusjvdupk'    // এখানে আপনার ১৬ ডিজিটের অ্যাপ পাসওয়ার্ড দিন
    }
});

app.post('/send-otp', (req, res) => {
    const { email, otp } = req.body;
    const mailOptions = {
        from: 'yourgmail.@gmail.com',
        to: email,
        subject: 'Pratiksha Finance - OTP Verification',
        text: `Your OTP is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        res.status(200).send('OTP Sent Successfully!');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
=======
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors()); // এটি আপনার ওয়েবসাইটকে সার্ভারের সাথে কানেক্ট হতে দেবে

const otps = {}; // সাময়িকভাবে ওটিপি সেভ রাখার জন্য

// ইমেইল ট্রান্সপোর্টার সেটআপ
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // আপনার জিমেইল
        pass: process.env.EMAIL_PASS  // জিমেইল অ্যাপ পাসওয়ার্ড (১৬ ডিজিট)
    }
});

// ওটিপি পাঠানোর এন্ডপয়েন্ট
app.post('/api/send-email-otp', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps[email] = otp;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Pratiksha Finance',
        text: `Your OTP is: ${otp}. This code is valid for 5 minutes.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
        res.json({ success: true, message: 'OTP sent successfully!' });
    } catch (error) {
        console.error('Email Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
});

// ওটিপি ভেরিফাই করার এন্ডপয়েন্ট
app.post('/api/verify-email-otp', (req, res) => {
    const { email, otp } = req.body;
    if (otps[email] === otp) {
        delete otps[email];
        res.json({ success: true, message: 'OTP Verified!' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
});

// ফর্ম সাবমিট করার এন্ডপয়েন্ট
app.post('/api/apply', (req, res) => {
    console.log('Application Received:', req.body);
    res.json({ success: true, message: 'Application submitted successfully!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
>>>>>>> 44424fe (Added OTP and Server logic)
    console.log(`Server is running on port ${PORT}`);
});
