import tinytuya

# --- CONFIGURACIÓ ---
# Totes aquestes dades les tens de quan has fet el 'wizard' o del web de Tuya
API_KEY = 'rm7d3kfh9tvxvdecruaj'      # Access ID del web
API_SECRET = '75420445fc8741b7ba4e0b3bcd946009' # Access Secret del web
DEVICE_ID = 'bf582f53ae830e711fqhrf'         # La ID del teu sensor
REGION = 'eu'                     # Europe

print("Connectant via Núvol...")

# Connectem al núvol en lloc de localment
c = tinytuya.Cloud(
    apiRegion=REGION, 
    apiKey=API_KEY, 
    apiSecret=API_SECRET, 
    apiDeviceID=DEVICE_ID
)

# Demanem l'estat
data = c.getstatus(DEVICE_ID)

print("\n--- Resultat ---")
print(data)