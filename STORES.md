# Publishing to the app stores

Everything that can be automated is done. The app builds for both platforms in the
cloud with no Mac and nothing installed on your machine. What is left needs your
own accounts, because store accounts are tied to a real person and a payment method.

---

## What it costs

| | Cost | Notes |
|---|---|---|
| Google Play | **$25, one time** | Pay once, publish forever |
| Apple Developer | **$99 a year** | Lapses if you stop paying, and your app comes down |
| Building the apps | **$0** | Runs on GitHub's machines, free because the repo is public |

Start with Google. It is a quarter of the price, the review is faster, and it will
tell you whether anyone wants this before you commit to Apple's yearly fee.

---

## Getting a build

1. Go to the **Actions** tab of the repo
2. Pick **Build mobile apps** on the left
3. Press **Run workflow**, choose `android`, `ios` or `both`
4. Wait a few minutes, then download from the **Artifacts** box at the bottom of the run

You get:

- `android-play-store-bundle` — the `.aab` file Google Play wants
- `android-test-apk` — install this on any Android phone to try it yourself first
- `ios-unsigned-build` — proves the iPhone app compiles

---

## Google Play, step by step

1. Sign up at **play.google.com/console** and pay the $25
2. **Create app**, name it `Resume Rubric`, pick English, choose **App** and **Free**
3. Fill in the sections it marks as required. The text you need is at the bottom of
   this file, ready to paste
4. Under **Privacy policy**, paste:
   `https://resume-rubric-production.up.railway.app/privacy`
5. In **Data safety**, answer **no** to collecting or sharing data. That is genuinely
   true here, which makes this section unusually easy
6. Upload the `.aab` under **Production**, or use **Internal testing** first if you
   want to try it privately
7. Submit. First review usually takes a few days

**One thing to know about signing.** Google will ask about an upload key. Choose
**Google Play App Signing** and let Google manage it. That is the default now and it
saves you keeping a key file safe for the life of the app.

---

## Apple, step by step

Harder, because Apple requires the final upload to be signed with your certificate.

1. Sign up at **developer.apple.com** and pay the $99
2. In **App Store Connect**, create a new app with bundle id
   `app.resumerubric.checker`
3. Signing needs one of:
   - A Mac with Xcode, open `app/ios/App/App.xcworkspace` and press Archive
   - Or a service like Codemagic, which has a free tier and can sign and upload for you
4. Upload, then fill in the listing using the text below
5. Submit. Review usually takes a day or two

### The rejection to plan for

Apple's guideline **4.2** rejects apps that are only a website in a wrapper. If they
push back, these are all true and are the reasons this is not that:

- The whole engine is inside the app. It works in aeroplane mode with no connection
- It reads PDF and Word files from the phone and writes files back out
- It exports through the system share sheet
- There is no login and nothing is fetched from a server to make it work

Say that plainly in the review notes when you submit. Most rejections of this kind
are resolved by explaining, not by rebuilding.

---

## Listing text, ready to paste

**App name**
```
Resume Rubric
```

**Short description, 80 characters**
```
Score your resume against any job. Private, offline, and it shows its work.
```

**Full description**
```
Resume Rubric scores your resume against a real job posting and shows you exactly
what to fix.

It works on your phone with no connection, and your resume never leaves the device.
There is no account, no signup, and nothing is uploaded.

WHAT IT DOES

- Scores your resume out of 100 across six areas, and shows the exact line behind
  every point it takes off
- Publishes the whole scoring rubric, so you can see how the score was reached
- Rewrites your weak bullet points into something a recruiter can act on
- Guides you through the three fixes worth the most points
- Exports a clean Word file, then reads it back to prove it still parses correctly
- Writes interview questions from your own bullet points
- Keeps your resume versions and job applications in one place

BUILT FOR EVERY KIND OF WORK

Nurses, electricians, teachers, drivers, accountants, veterans and office workers.
Each field is scored on what actually counts as evidence in that job, not on rules
written for software engineers.

IT WILL NOT MAKE THINGS UP

Where a number belongs and you have not given one, it marks the gap and stops. It
will never write a figure onto your resume that you cannot defend in an interview.

PRIVATE BY DESIGN

Everything runs on your device. There is no server to send your resume to and no
account to create. Turn off your data and it still works.

Free, with no adverts and nothing locked away.
```

**Category:** Productivity, or Business
**Content rating:** Everyone
**Contains ads:** No
**In app purchases:** No

**Privacy policy URL**
```
https://resume-rubric-production.up.railway.app/privacy
```

---

## Screenshots

Both stores want screenshots and neither will accept a submission without them.
Google needs at least two, Apple needs them at specific sizes.

The easy way: install the test APK on an Android phone, or open the site on your
phone, and take normal screenshots of these four screens.

1. The home screen with the score showing
2. The action plan with the three steps
3. A before and after bullet rewrite
4. The export screen showing the round trip check passing

Use the healthcare sample if you would rather not show your own resume.
