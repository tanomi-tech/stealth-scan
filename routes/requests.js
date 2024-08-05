const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");
const Botpoison = require('@botpoison/node');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const botpoison = new Botpoison({
    secretKey: process.env.SS_BP_SECRET
});

router.post('/', async (req, res) => {
    const {email, message, type, _botpoison} = req.body;
    try {
        const { ok } = await botpoison.verify(_botpoison);
        if (!ok) {
            console.error('Invalid Botpoison solution');
            res.status(400).send();
        }
        const info = await transporter.sendMail({
            from: process.env.SS_RQST_FROM,
            to: process.env.SS_RQST_TO,
            subject: "Stealth Scan - Website Request",
            text: `Email: ${email},\nType: ${type},\nMessage:\n${message}`,
          });
        res.json({
            success: true
        }) 
    } catch(e) {
        console.error(e);
        res.status(500).send();
    }
});

module.exports = router;