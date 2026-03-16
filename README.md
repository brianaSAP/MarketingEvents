# Marketing Events Tracker

A simple web app for tracking upcoming marketing events from an Excel spreadsheet.

## What it does

This app lets you:

- Upload an Excel file (`.xlsx`, `.xls`, or `.csv`)
- View upcoming marketing events
- Search by event name, owner, or location
- Filter events by date window
- See event details like:
  - status
  - format
  - quarter
  - expected pipeline
  - budget
  - notes
  - website link

## Excel columns supported

This app is designed around the structure of the Global Events Tracker and supports these columns:

- `Event Name (with Industry)`
- `Start Date`
- `Finish Date`
- `Geo Location `
- `Format (In-Person, Virtual, Hybrid)`
- `Status (Confirmed, TBD, Cancelled)`
- `Estimated Budget`
- `Expected Pipeline`
- `Main Event contact`
- `Website Link(s)`
- `Notes`
- `Quarter`

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Upload your spreadsheet

Click **Upload Excel File** and select your `.xlsx`, `.xls`, or `.csv` file. The app will parse the first sheet and display all events.

### 4. Search and filter

- Use the **Search** box to find events by name, owner, or location.
- Use the **Start Date** and **End Date** pickers to filter events within a date window.
- Click the **▼** button on any row to expand and see notes and website links.
