#!/usr/bin/env bash
set -euo pipefail

rg -n   --glob '!**/rbm.tokens.css'   --glob '!**/tokens/**'   '(#(?:[0-9a-fA-F]{3,8})\b|\brgba?\(|\bhsl[a]?\()' src   && { echo "Hard-coded colours detected. Use RBM tokens only."; exit 1; }   || exit 0
