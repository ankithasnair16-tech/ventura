/**
 * API service for Ventura frontend.
 * Communicates with the FastAPI backend at http://localhost:8000 (or Vite proxy).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Fetch current Delhi air quality from GET /api/air-quality.
 * Response schema matches AirQualityResponse in api/main.py.
 */
export async function getAirQuality() {
  const url = `${API_BASE_URL}/api/air-quality`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Air quality service returned status ${response.status}`);
    }

    const data = await response.json();

    // Validate expected fields per Pydantic model
    if (typeof data.aqi !== 'number' || !data.dominant_pollutant || !data.category) {
      throw new Error('Received incomplete air quality payload from server');
    }

    return data;
  } catch (error) {
    // If running Vite without the proxy and backend is on port 8000
    if (API_BASE_URL === '' && !window.location.port.includes('8000')) {
      try {
        const directRes = await fetch('http://localhost:8000/api/air-quality', {
          headers: { 'Accept': 'application/json' },
        });
        if (directRes.ok) {
          return await directRes.json();
        }
      } catch {
        // Fall through to original error handling
      }
    }
    console.error('Failed to retrieve air quality data:', error);
    throw new Error('Unable to connect to air quality sensors. Please ensure the backend is running.');
  }
}
