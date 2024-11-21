import serial
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize global variables
aa = 0
bb = 0

app = FastAPI()

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Open the serial port
ser = serial.Serial('/dev/ttyACM0', 115200)  # Updated port

@app.get("/")
def read_root():
    return {"message": "Backend is running"}

@app.get("/data")
def get_data():
    global aa, bb  # Declare global variables to modify them

    if ser.in_waiting > 0:
        raw_data = ser.readline().decode('utf-8').strip()
        print(f"Raw data: {raw_data}")  # For debugging

        try:
            # Extract the axis data
            data = raw_data.split(',')
            ax_str = data[0].split('=')[1].strip()
            ay_str = data[2].split('=')[1].strip()

            # Convert to float and apply transformations
            ax = float(ax_str)
            ay = float(ay_str)

            # Transform the values for smoother drawing
            ax = int(((ax*100) +500))  # Adjust these values based on your screen dimensions
            ay = int(((ay*100) +500))

            # Ensure values are within the range of 0 to 1000
            ax = max(0, min(1000, ax))
            ay = max(0, min(1000, ay))

            # Update global variables
            aa = ax
            bb = ay

            # Return the data as JSON
            return {"ax": ax, "ay": ay}

        except Exception as e:
            print(f"Error processing data: {e}")
            return {"error": str(e)}
    else:
        # Return the last known values if no new data is available
        return {"ax": aa, "ay": bb}
