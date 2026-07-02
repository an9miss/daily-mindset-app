# Daily Mindset App

A mobile-first daily reminder app built with Next.js, React, and Tailwind CSS. It helps iPhone Safari users start the day with an encouraging sentence, set three small goals, track completion, celebrate a perfect day, and review yesterday plus weekly progress.

## V1.1 features

- Daily encouraging sentence for a calm start.
- Add up to three small goals per day.
- Mark goals as complete and see the completion rate plus progress bar update immediately.
- Edit a goal by tapping its text, then save with Enter or the save button.
- Empty edits are ignored so blank goal content is never saved.
- Delete a goal with a simple delete button and confirmation prompt before removal.
- Review yesterday's completion and this week's average progress.
- Mobile-first milk-tea, cream, and minimal UI designed to feel smooth on iPhone Safari.

## Data storage

Daily Mindset App currently stores all records only on the user's own device with `localStorage`. There is no login, cloud sync, AI suggestion, or copy-yesterday feature in V1.1.

## Scripts

```bash
npm run dev
npm run build
npm run start
```
