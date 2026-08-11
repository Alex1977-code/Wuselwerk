import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const ROW = {walking:0,falling:1,floating:2,climbing:3,hoisting:4,building:5,bashing:6,mining:7,digging:8,blocking:9,saving:10,dying:11};
const files = process.argv.slice(3);
const data = files.map(f=>({n:f, r:ROW[f], b:readFileSync(`art-src/proben/${f}.png`).toString('base64')}));
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport:{width:400,height:400} });
const out = await page.evaluate(async (data) => {
  const S=7, W=224, H=28;
  const c=document.createElement('canvas'); c.width=W*S+76; c.height=H*S*data.length;
  const x=c.getContext('2d'); x.fillStyle='#241c14'; x.fillRect(0,0,c.width,c.height);
  for (let i=0;i<data.length;i++){
    const img=new Image(); img.src='data:image/png;base64,'+data[i].b; await img.decode();
    x.imageSmoothingEnabled=false;
    x.drawImage(img,0,data[i].r*H,W,H,76,i*H*S,W*S,H*S);
    x.imageSmoothingEnabled=true;
    x.fillStyle='#9ab'; x.font='15px system-ui'; x.textBaseline='middle';
    x.fillText(data[i].n, 6, i*H*S + H*S/2);
  }
  return c.toDataURL('image/png');
}, data);
writeFileSync(process.argv[2], Buffer.from(out.split(',')[1],'base64'));
await browser.close();
