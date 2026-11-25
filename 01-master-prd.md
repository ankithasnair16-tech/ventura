# Ventura: Master PRD

## 1. Summary
Ventura is a web app that helps people cope with severe winter smog and air pollution. It checks the current air quality for Delhi and gives each user simple, personal steps to breathe cleaner air and reduce their own pollution.

## 2. Problem
Winter smog is hard to live with. People know the air is bad, but they don't know what to do about it in their own daily life. Generic AI tips give the same advice to everyone, with no link to the air on that day or to how the person lives.

## 3. Goal
Give each user a short, personal plan based on real air data, and show clearly what each action changes.

## 4. Target users
- Families, especially parents with young children and elderly members.
- People with breathing conditions, such as asthma.
- Commuters and anyone who spends time outdoors in Delhi.

## 5. Scope: the four required areas
1. **Low-emission daily routines:** simple habits for the day, such as when to travel and how to cook.
2. **Indoor air quality hacks:** easy steps to keep air cleaner at home.
3. **Sustainable alternatives:** options that fit the user's location and lifestyle. This is the most highlighted part of the app.
4. **Direct impact of actions:** each suggestion says what it changes, in simple levels (high, medium, low).

## 6. Core features
- **Quick start questions:** 3 to 4 short questions (see the Flow PRD).
- **Live air reading for Delhi:** shows the current level in plain words, with the main pollutant.
- **Pollutant-matched advice:** if fine dust (PM2.5) is the main problem, advice focuses on masks and purifiers. If NO2 is high, advice focuses on traffic and cooking sources.
- **Impact levels:** each tip shows a qualitative level (high, medium, low), with a short note that these are general guidance, not medical advice.
- **Sustainable alternatives chat:** a small chat box that only answers questions about sustainable alternatives. It asks follow-up questions and replies with two or three short cards.
- **"Not for me" button:** each suggestion can be dismissed, so users stay in control.

## 7. Optional extra (only if time allows)
- **Air-quality alert banner:** when the level crosses a set point, a banner appears at the top with the two most important actions for that day.

## 8. Out of scope
- Other cities. Ventura covers Delhi only for this hackathon.
- Hourly timing and side-by-side simulators.
- User accounts, saved history, and cloud storage.
- Sourced medical or research citations for impact figures.

## 9. Data sources
- **Primary:** Open-Meteo air quality API. Free, no key. Delhi coordinates: latitude 28.61, longitude 77.21.
- **Backup:** WAQI (aqicn.org). Needs a free token.
- If the live data fails, the app shows the last saved reading with its time, or a built-in sample reading for demo mode.

## 10. Success criteria
- All four required areas are visible and personal.
- Every tip shows its impact level.
- The app works on a phone and on a laptop.
- The live link opens without login, and the repo is public.

## 11. Submission requirements (PromptWars Virtual)
- Public GitHub repo, under 10 MB, with public access.
- Live deployed app link.
- Demo video as an unlisted YouTube link, or a Drive link with access on.
- LinkedIn post about the build-in-public journey.
- Up to 3 attempts. Attempts 1 and 2 get feedback. Attempt 3 is the final one, so only submit it if it is clearly better.
- Window: November 16, 2026 4:00 PM IST to November 29, 2026 11:59 PM IST.

## 12. Evaluation areas
Code quality, security, efficiency, testing, accessibility, and problem statement alignment. Weights are not published, so treat them as equal.

## 13. Timeline
- Nov 24–25: set up the data source and the free host.
- Nov 26: first upload (app and repo only).
- Nov 27–28: sustainable alternatives section, testing, accessibility fixes, video, and LinkedIn post.
- Nov 28: second upload (complete).
- Nov 29: third upload only if clearly better. Submit well before the deadline.

## 14. Build tool
The app will be built in Antigravity. Use the Technical PRD, Design PRD, and Flow PRD as the build guide.
