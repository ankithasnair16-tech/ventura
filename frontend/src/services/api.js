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

/**
 * Fetch personalized recommendations from POST /api/plan.
 * Payload matches PlanRequest in api/main.py:
 * {
 *   focus: string,
 *   household: string,
 *   routine: string,
 *   dismissed_ids: string[],
 *   dominant_pollutant?: string
 * }
 */
export async function getPersonalPlan({
  focus,
  household,
  routine,
  dismissed_ids = [],
  dominant_pollutant,
}) {
  const url = `${API_BASE_URL}/api/plan`;
  const body = {
    focus,
    household,
    routine,
    dismissed_ids,
  };
  if (dominant_pollutant) {
    body.dominant_pollutant = dominant_pollutant;
  }

  const makeRequest = async (fetchUrl) => {
    const res = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Plan service returned status ${res.status}`);
    }
    return await res.json();
  };

  try {
    return await makeRequest(url);
  } catch (error) {
    if (API_BASE_URL === '' && !window.location.port.includes('8000')) {
      try {
        return await makeRequest('http://localhost:8000/api/plan');
      } catch {
        // Fall through
      }
    }
    console.error('Failed to generate personal plan:', error);
    throw new Error('Could not generate recommendations. Please ensure the backend is running.');
  }
}
