// Wspólny adres backendu dla całego frontendu.
// Konfigurowalny przez zmienną środowiskową VITE_API_URL (np. w docker-compose);
// domyślnie 127.0.0.1, a nie localhost — na macOS localhost potrafi rozwiązać się
// do IPv6 (::1), pod którym uvicorn nie nasłuchuje (zob. CLAUDE.md).
export const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
