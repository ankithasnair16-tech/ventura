# Ventura: Flow PRD

## 1. Main user journey
1. The user opens the Ventura link.
2. The home screen shows Delhi's current air level.
3. The user answers 3 to 4 quick questions.
4. The app shows a personal plan with four areas.
5. The user can open the sustainable alternatives chat for more detail.
6. The user can dismiss any suggestion with "Not for me."

## 2. Screens

### Screen 1: Home
- Headline and Delhi air status card.
- Quick start card with a "Start" button.
- Area cards are shown, but they fill in after the quick start.

### Screen 2: Quick start questions
Ask 3 to 4 questions, one at a time or on one short page. Suggested questions:
1. "Who lives with you?" Options: just me, family with children, older adults at home, someone with asthma.
2. "How do you usually travel?" Options: walk or cycle, public transport, car or two-wheeler, mostly work from home.
3. "What do you cook with?" Options: LPG or gas, induction or electric, wood or coal, not sure.
4. "How much time do you spend outdoors?" Options: little, some, a lot.

Each answer must be a tap, not free text. Free text is only in the chat.

### Screen 3: Personal plan (one scrolling screen)
All four areas are on one screen, as cards in a single scrolling page, not separate screens. This keeps the app fast to use on a phone, and judges can see everything without extra taps.
- Air status at the top, with the main pollutant.
- Four area cards, in this order: sustainable alternatives (highlighted, first), daily routines, indoor air hacks, impact of actions.
- Only the chat opens on its own screen.
- Each suggestion card shows:
  - The tip in one short line.
  - Its impact level (high, medium, low).
  - A "Not for me" button.

### Screen 4: Sustainable alternatives chat
1. The user opens the chat from the round button.
2. The assistant asks what they want to change, in one short question.
3. The user types freely.
4. After up to about 5 exchanges, or when the user taps "Show options," the assistant replies with two or three short cards.
5. If the user asks something off-topic, the assistant politely says it only covers sustainable alternatives.
6. Leaving the page clears the chat.

### Screen 5: Air alert banner (optional)
- Appears at the top of the home screen when the air level is high.
- Shows the two most important actions for the day.
- Can be closed.

## 3. Error and fallback flow
- **Live data fails:** show the last saved reading with its time. If there is none, show the demo reading and label it "Sample data."
- **AI fails:** show the rule-based tips without the written explanation, plus a short note that the text is unavailable.
- **Chat limit reached:** show a friendly message and the option to see the cards instead.

## 4. Demo flow (for judges)
1. Open the live link.
2. Show the current Delhi level on the home screen.
3. Answer the quick start questions.
4. Show the personal plan with the highlighted sustainable alternatives.
5. Open the chat and ask one question.
6. Show that "Not for me" removes a suggestion.

## 5. Accessibility in the flow
- Each step can be completed with the keyboard.
- Screen readers announce the air level and each impact label.
- Error messages are plain and short.
