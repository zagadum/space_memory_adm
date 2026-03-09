const fs = require('fs');

const vueFile = fs.readFileSync('src/tabs/PaymentsTab.vue', 'utf8');
const lines = vueFile.split('\n');
const startMatch = lines.findIndex(line => line.includes('function openTxEditInvoice(p: Program, tx: any) {'));
const endMatch = lines.findIndex((line, index) => index > startMatch && line.includes('}'));

console.log(lines.slice(startMatch, endMatch + 1).join('\n'));
