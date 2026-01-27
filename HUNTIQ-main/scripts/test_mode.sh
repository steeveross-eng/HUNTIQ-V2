#!/bin/bash
# ===========================================
# Test Mode Manager - Gestion automatique du mode site pour les tests
# Usage:
#   ./test_mode.sh start   - Active le mode live pour tests
#   ./test_mode.sh stop    - Remet en mode maintenance
#   ./test_mode.sh status  - Affiche l'état actuel
# ===========================================

API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)

case "$1" in
    start|on|live)
        echo "🔓 Activation du mode TEST (site en ligne)..."
        RESPONSE=$(curl -s -X PUT "$API_URL/api/site/mode" -H "Content-Type: application/json" -d '{"mode": "live"}')
        echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'✅ {d[\"mode_label\"]} - Fonctionnalités restaurées: {d.get(\"features_sync\", {}).get(\"count\", 0)}')"
        echo "⚠️  N'oubliez pas: ./test_mode.sh stop après les tests"
        ;;
    stop|off|maintenance)
        echo "🔒 Retour en mode MAINTENANCE..."
        RESPONSE=$(curl -s -X PUT "$API_URL/api/site/mode" -H "Content-Type: application/json" -d '{"mode": "maintenance"}')
        echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'✅ {d[\"mode_label\"]} - Fonctionnalités désactivées: {d.get(\"features_sync\", {}).get(\"count\", 0)}')"
        echo "🔐 Site sécurisé - Confidentialité préservée"
        ;;
    status|state)
        echo "📊 État actuel du site:"
        curl -s "$API_URL/api/site/status" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Mode: {d[\"mode\"]} | Message: {d.get(\"message\", \"N/A\")[:50]}')"
        curl -s "$API_URL/api/feature-controls/status" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Fonctionnalités: {d[\"summary\"][\"enabled\"]}/{d[\"summary\"][\"total\"]} activées')"
        ;;
    *)
        echo "Usage: $0 {start|stop|status}"
        echo "  start  - Met le site en ligne pour les tests"
        echo "  stop   - Remet le site en maintenance"
        echo "  status - Affiche l'état actuel"
        exit 1
        ;;
esac
