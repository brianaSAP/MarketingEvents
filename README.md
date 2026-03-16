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
