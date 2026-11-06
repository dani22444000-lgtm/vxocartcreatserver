const express = require('express');
const { createCanvas, loadImage, registerFont } = require('canvas');
const bwipjs = require('bwip-js');
const path = require('path');

const app = express();
// برای خواندن دیتای POST از فرم‌ها
app.use(express.urlencoded({ extended: true }));

// ثبت فونت (مطمئن شوید فایل arial.ttf در پوشه پروژه است)
registerFont(path.join(__dirname, 'arial.ttf'), { family: 'ArialCustom' });

app.post('/generate-card', async (req, res) => {
    try {
        // دریافت داده‌ها از POST Body
        const walletID = req.body.wltid || ' ';
        const colorcart = req.body.clrcrt || ' ';
        const userName = req.body.usernm || ' ';

        // ابعاد بوم (دقیقا مثل کد PHP)
        const pageW = 2480;
        const pageH = 3508;

        // ایجاد بوم
        const canvas = createCanvas(pageW, pageH);
        const ctx = canvas.getContext('2d');

        // ۱. تولید بارکد با bwip-js
        // (چون بارکد رو در جاوااسکریپت می‌سازیم، مستقیم به بافر PNG تبدیل می‌کنیم)
        const barcodeBuffer = await bwipjs.toBuffer({
            bcid: 'code128',
            text: walletID,
            scale: 4,            // معادل سایز ۵۰۰ در کد قبلی شما
            height: 25,          // ارتفاع
            includetext: true,   // نمایش متن زیر بارکد
            textxalign: 'center',
            backgroundcolor: 'FFFFFF'
        });

        // ۲. بارگذاری بارکد روی Canvas
        const barcodeImage = await loadImage(barcodeBuffer);
        
        // قرار دادن بارکد در مختصات کد قبلی شما (990, 2600)
        // توجه: عرض/ارتفاع بارکد ممکنه کمی با QR فرق کنه، پس وسط‌چینش می‌کنیم
        const barcodeX = 990; 
        const barcodeY = 2600;
        ctx.drawImage(barcodeImage, barcodeX, barcodeY);

        // ۳. انتخاب و بارگذاری تصویر کارت
        let cardFileName = '';
        switch (colorcart) {
            case 'vil': cardFileName = 'viltcrtclr.png'; break;
            case 'prp': cardFileName = 'prplcrtclr.png'; break;
            case 'grn': cardFileName = 'grncrtclr.png'; break;
            case 'gry': cardFileName = 'grycrtclr.png'; break;
            case 'red': cardFileName = 'redcrtclr.png'; break;
            case 'rng': cardFileName = 'orngcrtclr.png'; break;
            case 'vipl': cardFileName = 'viplcrtclr.png'; break;
            case 'blu': cardFileName = 'blucrtclr.png'; break;
            default: cardFileName = 'prplcrtclr.png'; // یک پیش‌فرض
        }

        const cardImage = await loadImage(path.join(__dirname, cardFileName));

        // ۴. کشیدن کارت روی بوم (وسط‌چین افقی، در مختصات y=300)
        const cw = cardImage.width;
        const ch = cardImage.height;
        const cardX = (pageW - cw) / 2;
        const cardY = 300;
        ctx.drawImage(cardImage, cardX, cardY, cw, ch);

        // ۵. نوشتن نام کاربری
        ctx.font = '90px ArialCustom'; // استفاده از فونت ثبت‌شده
        ctx.fillStyle = '#FFFFFF';     // رنگ سفید
        ctx.textAlign = 'center';      // برای وسط‌چین کردن راحت‌تر
        ctx.textBaseline = 'alphabetic';

        // در PHP از y=2850 استفاده کرده بودید
        ctx.fillText(userName, pageW / 2, 2850);

        // ۶. ارسال خروجی PNG
        res.set('Content-Type', 'image/png');
        res.send(canvas.toBuffer('image/png'));

    } catch (error) {
        console.error('خطا:', error);
        res.status(500).send('خطا در تولید تصویر');
    }
});

app.listen(3000, () => {
    console.log('سرور روی http://localhost:3000 اجرا شد');
});