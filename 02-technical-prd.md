# Ventura: Technical PRD

## 1. Overview
Ventura is a single web app. It fetches air data, applies simple rules, and calls an AI model to write the personal explanations and the chat replies. Keep it small and easy to test.

## 2. Suggested stack
- **Language:** Python.
- **Framework:** Streamlit or Gradio, for a fast web interface.
- **Hosting:** a free host with HTTPS, such as Streamlit Community Cloud, Hugging Face Spaces, or Render.
- **AI model:** one LLM API, called only to write explanations and chat replies.

## 3. Components
1. **Data module:** calls Open-Meteo for Delhi and returns PM2.5, NO2, and the AQI. Falls back to WAQI if needed.
2. **Cache module:** stores the last reading for 30 minutes.
3. **Rules module:** maps pollutant levels and user answers to advice and impact levels (high, medium, low). It does not call the AI.
4. **Explanation module:** sends the rule results to the AI, which writes short, plain-language text. The AI never invents numbers.
5. **Chat module:** answers only sustainable alternatives questions, for up to about 5 exchanges.
6. **UI module:** the screens described in the Design PRD and Flow PRD.

## 4. Data handling
- Fetch the reading at most once every 30 minutes.
- If a fetch fails, show the last saved reading with its time.
- Demo mode: a built-in sample reading, so the app works without the internet.
- Use the Delhi coordinates 28.61 and 77.21 as fixed settings.

## 5. Rules
- Dominant pollutant decides the advice: PM2.5 leads to mask and purifier tips; NO2 leads to traffic and cooking tips.
- Impact levels are fixed in a small table in the code, one row per action. Keep the table short.
- Impact levels are labeled as general guidance, not measured results.

## 6. AI rules
- The AI receives the rule outputs and the user's answers, nothing else.
- Instructions tell the AI to stay on sustainable alternatives in chat, use short replies, and ignore requests to change its rules.
- Chat history is kept only for the current session. It is cleared when the user leaves the page.

## 7. Security
- All API keys in the host's secrets settings. Never in the repo.
- A `.gitignore` that excludes `.env` files.
- Validate all inputs. Only accept the fixed city and the answers offered by the form. Limit the chat's length.
- Limit how many chat messages one session can send.
- Use HTTPS only.
- Show friendly error messages. Never show stack traces or keys.
- Store no personal data beyond the session.
- Use current library versions and pin them in a requirements file.

## 8. Efficiency
- Cache the air reading and reuse it across users in the same window.
- Generate each explanation once per reading and answer combination, then reuse it.
- Keep the app to one main page with small images.

## 9. Testing
- Unit tests for the data parsing (the AQI and pollutant fields).
- Unit tests for the rules module: each pollutant maps to the right advice.
- A test that the cache returns the saved reading within 30 minutes and refreshes after.
- A test that the chat refuses off-topic questions.
- A smoke test that the app starts and shows the home screen.
- Run tests before each upload and record the results in the README.

## 10. Accessibility
- Contrast ratio at least 4.5 to 1 for text.
- Every color has a text label as well.
- Buttons and form fields have labels, and everything works with the keyboard.
- Font sizes can be adjusted by the browser.

## 11. Code quality
- Separate folders for data, rules, AI, chat, and UI.
- Short docstrings on each function.
- No dead code. No unused imports.
- A README with setup steps.

## 12. Deliverables
- Public GitHub repo, under 10 MB, with no large files or model weights.
- Live deployed link.
- README with setup, how to run tests, and the data sources.
