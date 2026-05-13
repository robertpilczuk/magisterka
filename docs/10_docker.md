# Przewodnik Docker — kompletna dokumentacja
## Od zera do uruchomionej aplikacji

---

## 1. Co to jest Docker i dlaczego warto go używać?

### Problem który Docker rozwiązuje

Wyobraź sobie typową sytuację:

> "U mnie działa!" — developer  
> "U mnie nie działa." — promotor/użytkownik

Aplikacja działa na Twoim MacBooku z Python 3.12, ale promotor ma Windowsa
z Python 3.9. Inna wersja biblioteki, inne ścieżki systemowe, brakujący pakiet —
i projekt przestaje działać mimo że kod jest identyczny.

**Docker eliminuje ten problem całkowicie.**

### Jak to działa — analogia

Wyobraź sobie że gotowanie zupy to uruchamianie aplikacji:

**Bez Dockera:** dajesz komuś przepis i listę składników. Musi sam kupić składniki,
może kupić złą markę, może mieć inną kuchenkę — zupa wychodzi inaczej.

**Z Dockerem:** dajesz komuś szczelnie zamknięty termos z gotową zupą.
Otwiera termos i zupa jest gotowa — identyczna jak u Ciebie.

Ten "termos" to **kontener Docker**.

### Dlaczego to jest dobre dla projektu magisterskiego

1. **Reprodukowalność** — promotor uruchamia jedną komendę i widzi dokładnie to samo co Ty
2. **Niezależność od systemu** — działa na Windows, Mac, Linux identycznie
3. **Profesjonalizm** — Docker to standard w przemyśle, warto umieć go używać
4. **Izolacja** — aplikacja nie "bruździ" w systemie operacyjnym
5. **Łatwe przywracanie** — coś się zepsuło? `docker-compose down && docker-compose up --build`

---

## 2. Kluczowe pojęcia

### Dockerfile

Plik tekstowy z instrukcjami jak zbudować kontener. Każda linia to jeden krok.

```dockerfile
FROM python:3.12-slim      # zacznij od gotowego obrazu z Pythonem
WORKDIR /app               # ustaw folder roboczy
COPY requirements.txt .    # skopiuj plik z zależnościami
RUN pip install -r requirements.txt  # zainstaluj zależności
COPY . .                   # skopiuj kod aplikacji
CMD ["uvicorn", "main:app"] # komenda startowa
```

Analogia: Dockerfile to przepis kulinarny.

### Image (obraz)

Wynik zbudowania Dockerfile. Nieruchomalny "szablon" kontenera.
Możesz mieć jeden obraz i uruchomić z niego wiele kontenerów.

Analogia: Image to gotowe ciasto przed włożeniem do piekarnika.

### Container (kontener)

Uruchomiony obraz. To jest "żywa" aplikacja.
Kontener jest izolowany — ma własny system plików, sieć, procesy.

Analogia: Kontener to ciasto w piekarniku — pracuje.

### docker-compose

Narzędzie do zarządzania wieloma kontenerami naraz.
Nasz projekt ma dwa kontenery (backend + frontend) — `docker-compose`
uruchamia je jedną komendą i pozwala im się komunikować.

Analogia: docker-compose to catering — organizuje całe przyjęcie, nie jedną potrawę.

### Volume (wolumin)

Sposób na dzielenie plików między komputerem a kontenerem.
Używamy go żeby kontener miał dostęp do danych MovieLens i modeli ML.

```yaml
volumes:
  - ./data:/app/data:ro    # folder ./data na komputerze → /app/data w kontenerze
                           # :ro = read only (tylko do odczytu)
```

### Port mapping

Kontener działa w izolowanej sieci. Port mapping "przekierowuje" port
kontenera na port komputera.

```yaml
ports:
  - "8000:8000"  # port komputera : port kontenera
```

`http://localhost:8000` na komputerze → port 8000 w kontenerze.

---

## 3. Struktura plików Docker w projekcie

```
magisterka/
├── docker-compose.yml         ← główny plik konfiguracji
├── requirements.txt           ← zależności Pythona
├── backend/
│   └── Dockerfile             ← instrukcja budowania backendu
└── frontend/
    └── Dockerfile             ← instrukcja budowania frontendu
```

### backend/Dockerfile — wyjaśnienie linijka po linijce

```dockerfile
FROM python:3.12-slim
```
Startujemy od oficjalnego obrazu Pythona 3.12 w wersji "slim" (mniejszy rozmiar).
`python:3.12-slim` jest pobierany z Docker Hub — publicznego repozytorium obrazów.

```dockerfile
WORKDIR /app
```
Ustawia folder roboczy wewnątrz kontenera. Wszystkie następne komendy
wykonują się w `/app`. Jeśli folder nie istnieje — zostaje utworzony.

```dockerfile
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
```
Kopiujemy `requirements.txt` i instalujemy zależności.
`--no-cache-dir` nie zapisuje cache pip — zmniejsza rozmiar obrazu.
Te dwie linie są przed `COPY . .` celowo — Docker cache'uje warstwy.
Jeśli `requirements.txt` się nie zmienił, Docker pominie instalację przy kolejnym buildzie.

```dockerfile
COPY . .
```
Kopiujemy cały kod backendu do kontenera.

```dockerfile
EXPOSE 8000
```
Informuje Docker że kontener "nasłuchuje" na porcie 8000.
To tylko dokumentacja — faktyczne przekierowanie portów jest w `docker-compose.yml`.

```dockerfile
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```
Komenda uruchamiana gdy kontener startuje.
`--host 0.0.0.0` — nasłuchuj na wszystkich interfejsach sieciowych
(bez tego kontener byłby niedostępny z zewnątrz).

### frontend/Dockerfile — wyjaśnienie

```dockerfile
FROM node:20-slim
```
Oficjalny obraz Node.js 20 LTS w wersji slim.

```dockerfile
COPY package*.json .
RUN npm install
```
Kopiujemy `package.json` i `package-lock.json`, instalujemy zależności.
Tak samo jak w backendzie — najpierw zależności, potem kod (cache optymalizacja).

```dockerfile
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```
`--` oddziela argumenty npm od argumentów Vite.
`--host 0.0.0.0` — Vite musi nasłuchiwać na wszystkich interfejsach żeby
był dostępny spoza kontenera.

### docker-compose.yml — wyjaśnienie

```yaml
services:
  backend:
    build:
      context: .              # kontekst budowania = główny folder projektu
      dockerfile: backend/Dockerfile  # gdzie jest Dockerfile
    ports:
      - "8000:8000"           # komputer:kontener
    volumes:
      - ./data:/app/data:ro   # dane MovieLens (tylko do odczytu)
      - ./backend/model:/app/model  # wytrenowane modele
    environment:
      - PYTHONUNBUFFERED=1    # logi Pythona bez buforowania (widoczne na żywo)

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    depends_on:
      - backend               # frontend startuje dopiero gdy backend jest gotowy
```

`depends_on` nie czeka aż backend będzie "zdrowy" — tylko że proces się uruchomił.
W praktyce frontend może zacząć się łączyć zanim backend obsłuży pierwsze zapytanie.

---

## 4. Instalacja Dockera

### Mac

1. Wejdź na `docker.com/products/docker-desktop`
2. Pobierz wersję dla Mac (Apple Silicon lub Intel — sprawdź w  → O tym Macu)
3. Otwórz pobrany `.dmg` i przeciągnij Docker do Applications
4. Uruchom Docker z Applications — pojawi się ikona wieloryba w menu bar
5. Poczekaj aż ikona przestanie się animować (Docker gotowy)
6. Sprawdź w terminalu:

```bash
docker --version
docker-compose --version
```

### Windows

1. Zainstaluj **WSL2** (Windows Subsystem for Linux):
```powershell
wsl --install
```
Uruchom ponownie komputer.

2. Pobierz Docker Desktop z `docker.com/products/docker-desktop`
3. Zainstaluj — podczas instalacji zaznacz "Use WSL2 instead of Hyper-V"
4. Uruchom Docker Desktop
5. Sprawdź w PowerShell:
```powershell
docker --version
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker  # lub wyloguj i zaloguj się ponownie
```

---

## 5. Uruchomienie projektu z Dockerem

### Wymagania wstępne

Przed uruchomieniem Dockera musisz mieć:
- Pliki `ratings.dat`, `movies.dat`, `users.dat` w folderze `data/`
- Wytrenowane modele w `backend/model/` (pliki `.pkl`)

Jeśli nie masz modeli — uruchom najpierw notebooki:
```bash
source venv/bin/activate
jupyter notebook
# uruchom 01_eda.ipynb → 02_preprocessing.ipynb → 03_model.ipynb
```

### Pierwsze uruchomienie

```bash
# 1. przejdź do głównego folderu projektu
cd magisterka

# 2. zbuduj obrazy i uruchom kontenery
docker-compose up --build
```

Pierwsze uruchomienie trwa kilka minut — Docker:
- Pobiera obrazy Python i Node.js z internetu (~200MB)
- Instaluje wszystkie biblioteki Python i Node.js
- Buduje obrazy

Zobaczysz dużo logów — to normalne. Czekaj aż pojawi się:
```
backend   | INFO: Application startup complete.
frontend  | VITE ready in XXXms
```

### Sprawdź że działa

Otwórz w przeglądarce:
- `http://localhost:8000` → powinno pokazać `{"status":"ok","message":"Film Recommender API działa"}`
- `http://localhost:8000/docs` → Swagger UI z dokumentacją API
- `http://localhost:5173` → główna aplikacja React

---

## 6. Codzienne komendy

### Uruchamianie

```bash
# uruchom (obrazy są już zbudowane)
docker-compose up

# uruchom w tle (terminal pozostaje wolny)
docker-compose up -d
```

### Zatrzymywanie

```bash
# zatrzymaj (Ctrl+C gdy uruchomiony bez -d)

# zatrzymaj gdy uruchomiony w tle
docker-compose down

# zatrzymaj i usuń woluminy (dane tymczasowe)
docker-compose down -v
```

### Przebudowanie po zmianach w kodzie

```bash
# gdy zmieniłeś requirements.txt lub package.json
docker-compose up --build

# gdy zmieniłeś tylko kod Pythona/React (bez nowych bibliotek)
docker-compose up  # wystarczy restart
```

---

## 7. Diagnostyka i rozwiązywanie problemów

### Sprawdzanie stanu kontenerów

```bash
# lista działających kontenerów
docker-compose ps

# przykładowy output:
# NAME                    STATUS          PORTS
# magisterka-backend-1    Up 2 minutes    0.0.0.0:8000->8000/tcp
# magisterka-frontend-1   Up 2 minutes    0.0.0.0:5173->5173/tcp
```

### Przeglądanie logów

```bash
# logi obu kontenerów naraz
docker-compose logs

# logi na żywo (follow)
docker-compose logs -f

# logi tylko backendu
docker-compose logs -f backend

# logi tylko frontendu
docker-compose logs -f frontend

# ostatnie 50 linii logów backendu
docker-compose logs --tail=50 backend
```

### Wejście do kontenera (jak SSH)

```bash
# wejdź do kontenera backendu
docker-compose exec backend bash

# wejdź do kontenera frontendu
docker-compose exec frontend sh

# sprawdź czy pliki są w kontenerze
docker-compose exec backend ls /app
docker-compose exec backend ls /app/model
```

### Typowe błędy i rozwiązania

**Błąd: port już zajęty**
```
Error: bind: address already in use
```
Rozwiązanie:
```bash
# znajdź co używa portu 8000
lsof -i :8000          # Mac/Linux
netstat -ano | findstr :8000  # Windows

# zabij proces
kill -9 <PID>          # Mac/Linux

# lub zmień port w docker-compose.yml
ports:
  - "8001:8000"        # użyj portu 8001 zamiast 8000
```

**Błąd: brak plików modeli**
```
FileNotFoundError: linear_model.pkl
```
Rozwiązanie: uruchom notebooki i wygeneruj modele przed startem Dockera.

**Błąd: brak plików danych**
```
FileNotFoundError: ratings.dat
```
Rozwiązanie: sprawdź czy pliki `.dat` są w folderze `data/`:
```bash
ls data/
# powinno pokazać: movies.dat  ratings.dat  users.dat
```

**Kontenery startują ale aplikacja nie działa**
```bash
# sprawdź logi po błędach
docker-compose logs backend | grep -i error
docker-compose logs frontend | grep -i error
```

**Wszystko inne**
```bash
# nuclear option — usuń wszystko i zacznij od nowa
docker-compose down -v
docker system prune -f
docker-compose up --build
```

---

## 8. Najlepsze praktyki

### .dockerignore

Utwórz plik `.dockerignore` w `backend/` żeby Docker nie kopiował niepotrzebnych plików:

```
__pycache__/
*.pyc
*.pyo
venv/
.env
*.pkl
*.npy
```

I w `frontend/`:
```
node_modules/
dist/
.env
```

To przyspiesza budowanie i zmniejsza rozmiar obrazów.

### Nie przechowuj danych w kontenerze

Kontenery są "efemeryczne" — po `docker-compose down -v` dane znikają.
Zawsze używaj **volumes** dla danych które mają przetrwać restart:

```yaml
volumes:
  - ./data:/app/data         # dane na dysku komputera, nie w kontenerze
  - ./backend/model:/app/model
```

### Używaj wersji slim

`python:3.12-slim` zamiast `python:3.12` — mniejszy obraz, szybsze pobieranie.
Różnica: ~900MB vs ~150MB.

### Kolejność warstw w Dockerfile

Zawsze kopiuj `requirements.txt` i instaluj zależności PRZED kopiowaniem kodu:

```dockerfile
# DOBRZE — Docker cache'uje instalację bibliotek
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

# ŹLE — każda zmiana kodu wymaga reinstalacji bibliotek
COPY . .
RUN pip install -r requirements.txt
```

Docker buduje obrazy warstwami i cache'uje każdą warstwę.
Jeśli warstwa się nie zmieniła, jest pobierana z cache — budowanie jest szybsze.

---

## 9. Słownik pojęć Docker

| Pojęcie | Definicja |
|---------|-----------|
| **Dockerfile** | Plik z instrukcjami budowania obrazu |
| **Image** | Zbudowany szablon kontenera (nieruchomalny) |
| **Container** | Uruchomiony obraz (żywa aplikacja) |
| **docker-compose** | Narzędzie do zarządzania wieloma kontenerami |
| **Volume** | Mechanizm współdzielenia plików między hostem a kontenerem |
| **Port mapping** | Przekierowanie portu kontenera na port komputera |
| **Build context** | Folder który Docker wysyła do demona podczas budowania |
| **Layer** | Pojedyncza warstwa obrazu (wynik jednej instrukcji Dockerfile) |
| **Cache** | Zapisane warstwy — przyspieszają kolejne budowania |
| **Registry** | Repozytorium obrazów (np. Docker Hub) |
| **docker-compose up** | Uruchom kontenery |
| **docker-compose down** | Zatrzymaj i usuń kontenery |
| **docker-compose build** | Zbuduj obrazy bez uruchamiania |
| **docker-compose logs** | Pokaż logi kontenerów |
| **docker-compose exec** | Wykonaj komendę w działającym kontenerze |

---

*Dokumentacja Docker dla projektu Film Recommender*
*Projekt: Wykorzystanie regresji liniowej w procesie predykcyjnym doboru treści audiowizualnych*
