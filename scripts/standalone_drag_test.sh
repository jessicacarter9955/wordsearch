#!/usr/bin/env bash
# E2E: trascina tutte le parole del crucipuzzle standalone via agent-browser mouse
set -u
DBG=/home/z/my-project/scripts/standalone_dbg.json

python3 - "$DBG" <<'EOF' > /home/z/my-project/scripts/standalone_drag_cmds.sh
import json, sys
raw = json.load(open(sys.argv[1]))  # il file contiene una stringa JSON quotata
words = json.loads(raw) if isinstance(raw, str) else raw
print('#!/usr/bin/env bash')
print('set -u')
for w in words:
    (x1, y1), (x2, y2) = w['from'], w['to']
    print(f"echo 'drag: {w['word']}'")
    print(f"agent-browser mouse move {x1} {y1}")
    print("agent-browser mouse down left")
    steps = 4
    for i in range(1, steps + 1):
        xi = round(x1 + (x2 - x1) * i / steps)
        yi = round(y1 + (y2 - y1) * i / steps)
        print(f"agent-browser mouse move {xi} {yi}")
    print("agent-browser mouse up left")
    print("agent-browser wait 150")
EOF
chmod +x /home/z/my-project/scripts/standalone_drag_cmds.sh
bash /home/z/my-project/scripts/standalone_drag_cmds.sh 2>&1 | grep -E "drag:|✗" 
echo "--- stato finale ---"
agent-browser eval "(function(){ const p = state.puzzle; return JSON.stringify({found: p.placements.filter(x=>x.found).length, total: p.placements.length, won: state.won, overlay: !document.getElementById('win-overlay').classList.contains('hidden'), score: state.score, record: state.isNewRecord}) })()"
