#!/bin/bash
# Test del protocollo di upload a blocchi
set -e
BASE="http://localhost:3000/api/upload"
cd /home/z/my-project

# 1) sequenza corretta: 3 blocchi da 10 byte
printf '%.0sA' {1..10} > /tmp/chunk_a.bin
printf '%.0sB' {1..10} > /tmp/chunk_b.bin
printf '%.0sC' {1..5}  > /tmp/chunk_c.bin   # ultimo blocco più corto
cat /tmp/chunk_a.bin /tmp/chunk_b.bin /tmp/chunk_c.bin > /tmp/chunk_expected.bin

echo "--- blocco 1 (offset 0) ---"
curl -s -X POST --data-binary @/tmp/chunk_a.bin -H "Content-Type: application/octet-stream" "$BASE?filename=test-chunks.bin&offset=0"
echo; echo "--- blocco 2 (offset 10) ---"
curl -s -X POST --data-binary @/tmp/chunk_b.bin -H "Content-Type: application/octet-stream" "$BASE?filename=test-chunks.bin&offset=10"
echo; echo "--- blocco 3 (offset 20, last) ---"
curl -s -X POST --data-binary @/tmp/chunk_c.bin -H "Content-Type: application/octet-stream" "$BASE?filename=test-chunks.bin&offset=20&last=1"
echo

echo "--- integrità (aspettato AAAAAABBBBBCCCCC) ---"
if cmp -s /tmp/chunk_expected.bin uploads/test-chunks.bin; then echo "OK byte-identical ($(stat -c%s uploads/test-chunks.bin) byte)"; else echo "MISMATCH!"; xxd uploads/test-chunks.bin | head -3; exit 1; fi

# 2) retry dello stesso offset dopo fallimento parziale: sovrascrive, non duplica
echo "--- retry stesso offset (simula blocco ritentato) ---"
curl -s -X POST --data-binary @/tmp/chunk_a.bin -H "Content-Type: application/octet-stream" "$BASE?filename=test-retry.bin&offset=0" > /dev/null
printf 'XX' > /tmp/chunk_partial.bin
curl -s -X POST --data-binary @/tmp/chunk_partial.bin -H "Content-Type: application/octet-stream" "$BASE?filename=test-retry.bin&offset=10" > /dev/null  # fallimento parziale
curl -s -X POST --data-binary @/tmp/chunk_b.bin -H "Content-Type: application/octet-stream" "$BASE?filename=test-retry.bin&offset=10&last=1" > /dev/null  # retry completo
cat /tmp/chunk_a.bin /tmp/chunk_b.bin > /tmp/retry_expected.bin
if cmp -s /tmp/retry_expected.bin uploads/test-retry.bin; then echo "OK retry senza duplicati ($(stat -c%s uploads/test-retry.bin) byte)"; else echo "RETRY MISMATCH! atteso 20 byte, trovati $(stat -c%s uploads/test-retry.bin)"; xxd uploads/test-retry.bin; exit 1; fi

# 3) 409 restart: offset>0 senza .part
echo "--- 409 restart (offset senza temporaneo) ---"
CODE=$(curl -s -o /tmp/resp409.json -w "%{http_code}" -X POST --data-binary @/tmp/chunk_a.bin -H "Content-Type: application/octet-stream" "$BASE?filename=test-409.bin&offset=50")
echo "HTTP $CODE → $(cat /tmp/resp409.json)"
[ "$CODE" = "409" ] || { echo "FAIL: atteso 409"; exit 1; }

# 4) la lista GET nasconde i .part
echo "--- lista GET (nessun .part visibile) ---"
curl -s "$BASE" | head -c 300; echo

# 5) file grande a blocchi via script node (simula il client)
echo "--- file 20MB in blocchi da 4MB via fetch ---"
node -e "
const fs = require('fs');
const buf = Buffer.alloc(20*1024*1024);
for (let i=0;i<buf.length;i++) buf[i] = (i*31+7)%256;
fs.writeFileSync('/tmp/big20.bin', buf);
(async () => {
  const CHUNK = 4*1024*1024;
  for (let off = 0; off < buf.length; off += CHUNK) {
    const blob = new Blob([buf.slice(off, Math.min(off+CHUNK, buf.length))]);
    const last = off+CHUNK >= buf.length ? '&last=1' : '';
    const r = await fetch('http://localhost:3000/api/upload?filename=test-big20.bin&offset='+off+last, {method:'POST', body: blob});
    const d = await r.json();
    if (!r.ok) throw new Error('chunk @'+off+' → '+r.status);
    if (d.complete) console.log('  completato:', d.filename, d.size, 'byte');
  }
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
"
sleep 0.5
if cmp -s /tmp/big20.bin uploads/test-big20.bin; then echo "OK 20MB byte-identical"; else echo "BIG MISMATCH!"; exit 1; fi

# pulizia
rm -f /tmp/chunk_*.bin /tmp/retry_expected.bin /tmp/resp409.json /tmp/big20.bin uploads/test-chunks.bin uploads/test-retry.bin uploads/test-big20.bin
echo; echo "=== TUTTI I TEST DEI BLOCCHI PASSATI ==="