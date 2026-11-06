const express = require('express');
const { createCanvas, loadImage, registerFont } = require('canvas');
const bwipjs = require('bwip-js');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: true }));


registerFont(path.join(__dirname, 'arial.ttf'), { family: 'ArialCustom' });

app.post('/generate-card', async (req, res) => {
    try {
        
        const walletID = req.body.wltid || ' ';
        const colorcart = req.body.clrcrt || ' ';
        const userName = req.body.usernm || ' ';

        
        const pageW = 2480;
        const pageH = 3508;

        
        const canvas = createCanvas(pageW, pageH);
        const ctx = canvas.getContext('2d');

      
       
        const barcodeBuffer = await bwipjs.toBuffer({
            bcid: 'code128',
            text: walletID,
            scale: 4,           
            height: 25,          
            includetext: true,   
            textxalign: 'center',
            backgroundcolor: 'FFFFFF'
        });

        const barcodeImage = await loadImage(barcodeBuffer);
        
        
        
        const barcodeX = 990; 
        const barcodeY = 2600;
        ctx.drawImage(barcodeImage, barcodeX, barcodeY);

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

        
        const cw = cardImage.width;
        const ch = cardImage.height;
        const cardX = (pageW - cw) / 2;
        const cardY = 300;
        ctx.drawImage(cardImage, cardX, cardY, cw, ch);

        ctx.font = '90px ArialCustom'; 
        ctx.fillStyle = '#FFFFFF';     
        ctx.textAlign = 'center';      
        ctx.textBaseline = 'alphabetic';

        
        ctx.fillText(userName, pageW / 2, 2850);

        
        res.set('Content-Type', 'image/png');
        res.send(canvas.toBuffer('image/png'));

    } catch (error) {
        console.error('خطا:', error);
        res.status(500).send('err in making cart');
    }
});

app.listen(3000, () => {
    console.log('سرور روی http://localhost:3000 اجرا شد');
});
