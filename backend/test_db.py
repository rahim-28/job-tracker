from database import engine

try:
    conn = engine.connect()
    print("Database connected")
    conn.close()
except Exception as e:
    print(e)
