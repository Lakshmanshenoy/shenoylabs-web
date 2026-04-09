const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../src/components/layout/theme-toggle.tsx');
let i = 0;
let max = 40;

function pulse() {
  try {
    let src = fs.readFileSync(file, 'utf8');
    const marker = '/* HMR_PULSE */';
    if (src.includes(marker)) {
      src = src.replace(marker, `/* HMR_PULSE_${i} */`);
    } else {
      // insert marker near top
      src = src.replace('</Button>', `</Button>\n  ${marker}`);
    }
    fs.writeFileSync(file, src, 'utf8');
    console.log('pulse', i);
    i++;
    if (i >= max) {
      console.log('done pulses');
      process.exit(0);
    }
  } catch (e) {
    console.error('pulse error', e.message);
    process.exit(1);
  }
}

const t = setInterval(pulse, 1200);
pulse();
