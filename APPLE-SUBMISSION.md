# Apple App Store, step by step

Apple is easier than Google in one way and harder in another.

**Easier:** there is no 12 tester rule. Nothing like it. You can submit the day you
sign up, and review is usually 24 to 72 hours, though a brand new app can wait 2 to
5 days. That gap matters more now the app is paid, because Google makes closed
testers buy a paid app and Apple asks for no testers at all. Apple is the faster
route to actually being on sale.

**Harder:** every upload must be cryptographically signed with your certificate.
That is the part that needs care, and it is why people say you need a Mac.

---

## Cost

**$99 a year**, and it recurs. Stop paying and your app comes off the store. That is
the real difference from Google's $25 once.

Apple then keeps **15%** of each sale once you are in the Small Business Program, or
**30%** if you are not. At $4.99 that is $4.24 a sale against $3.49, so it is worth
getting right. See the next section, it is on a clock.

At 15% you need **24 sales a year** to cover the $99.

---

## Account type

| | Individual | Organization |
|---|---|---|
| D-U-N-S needed | **No** | Yes, 30 days to 8 weeks |
| Published under | Your own name | A company name |
| Cost | $99 a year | $99 a year |

**Choose Individual.** Same as Google, the organization route costs weeks and buys
you only a company name on the listing. Your app will show as published by
Francis Mercado, which is fine.

---

## 1. Enrol

Go to **developer.apple.com/programs** and enrol with your Apple ID. You need photo
ID and Apple usually verifies within a day or two. Pay the $99.

## 1b. The money paperwork, do this before anything else

A price cannot be set until this is done, and one part of it is on a clock, so start
it the day you enrol.

**App Store Connect**, then **Business**, then **Agreements, Tax, and Banking**.

1. Accept the **Paid Apps agreement**, which Apple also calls Schedule 2. Nothing
   about selling works until this is active.
2. Add a bank account.
3. Fill in the tax forms. In the US that is a W-9.

Allow a day or two for Apple to accept it.

### Then enrol in the Small Business Program, immediately

This is what takes Apple's cut from **30% down to 15%**. It is not automatic and you
have to apply for it: **developer.apple.com/app-store/small-business-program**.

You qualify. It is for anyone who made under $1M in proceeds last year, and anyone
new to the App Store.

**The catch is the timing.** The reduced rate starts **15 days after the end of the
month in which your enrolment is approved**. Approved in March, and 15% begins around
14 April. Anything you sell before that is charged at 30%.

So enrol now, while the rest of the listing is being built, rather than in the week
you go on sale. Getting this wrong costs you 15% of every early sale, which is the
exact period when you are trying to earn back the $99.

You have to accept the Paid Apps agreement before you can enrol, so the order is:
agreement, then Small Business Program, then everything else.

---

## 1c. Set the price

**App Store Connect**, your app, then **Pricing and Availability**. Choose the
**$4.99** price point. Apple converts it for every other country itself, so take the
defaults.

Apple lets you change this whenever you want, unlike Google. Nothing here is a one
way door.

## 2. Create the app record

In **App Store Connect**, go to **My Apps**, press **+**, then **New App**.

| Field | Answer |
|---|---|
| Platform | iOS |
| Name | `Resume Rubric` |
| Primary language | English (U.S.) |
| Bundle ID | `app.resumerubric.checker` |
| SKU | `resumerubric001` |
| User access | Full access |

The bundle ID has to match the app exactly. It is already set to that in
`app/capacitor.config.json`, so do not change it.

## 3. Getting a signed build up, without a Mac

This is the only genuinely awkward step. Three options, cheapest first.

### Option A: Codemagic, free tier. Already set up.

The build is fully described in `codemagic.yaml` at the root of this repo, so
Codemagic reads it and knows what to do. Two workflows are defined, one that sends
a build to TestFlight and one that submits for review.

Follow **CODEMAGIC-SETUP.md** for the parts that need your login. It is four short
steps and takes about fifteen minutes.

No Mac, and no making certificates by hand.

### Option B: Borrow a Mac for an hour

Any Mac with Xcode installed. Open `app/ios/App/App.xcworkspace`, sign in with your
Apple ID under Xcode settings, pick your team, then **Product, Archive**, then
**Distribute App**. About twenty minutes if the Mac already has Xcode.

### Option C: Rent one

Services like MacinCloud rent a Mac by the hour for a few dollars. Only worth it if
the other two are blocked.

---

## 4. Fill in the listing

**Name**
```
Resume Rubric
```

**Subtitle**, 30 characters
```
Resume checker that explains
```

**Promotional text**, 170 characters, editable any time without review
```
Private, and works with no connection. Score your resume against a real job posting and see the exact line behind every point.
```

**Description**
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

One payment. No subscription, no adverts, and nothing inside the app is locked away.
```

**Keywords**, 100 characters total, comma separated
```
resume,cv,job,ats,career,checker,scanner,nurse,trades,interview,hiring,application
```

**Support URL**
```
https://resume-rubric-production.up.railway.app
```

**Privacy Policy URL**
```
https://resume-rubric-production.up.railway.app/privacy
```

**Category:** Primary Productivity, Secondary Business
**Age rating:** 4+, answer No to everything in the questionnaire
**Price:** $4.99, one time. See PRICING.md.

**Screenshots:** the six `ios67-*.png` files from `app/store/screenshots/`. They are
1290 x 2796, which is the 6.7 inch size. Apple reuses them for smaller phones, so
that one set is enough.

---

## 5. App Privacy, the important part

Apple asks what data you collect. Answer **"Data Not Collected"**.

That is the whole section. It is true, and it earns you the best possible privacy
label on your listing, which is worth having in a category full of apps that upload
your resume.

---

## 5b. TestFlight, optional

Apple does not require any testers, so you can skip this entirely and submit.

If you do want a few people to try it first, TestFlight builds are **free to testers
whatever the app costs**. There is no promo code dance like the one Google needs. Up
to 100 internal testers and 10,000 external, though external testers need a short
review of the build first.

---

## 6. Submit

Attach the build, fill in the review notes below, and press **Submit for Review**.

---

## The review notes to paste

This is the most important box on the page. Copy this in.

```
Thank you for reviewing.

TO TEST QUICKLY
Open the app and tap "Load a sample". That fills in both a sample resume and a
sample job posting so you can see the full scoring, rewriting and export flow
without typing anything.

ABOUT GUIDELINE 4.2
This is not a web view of a website. The entire scoring engine is compiled into
the app bundle and runs on device:

- It works fully in Airplane Mode, with no network connection of any kind
- It reads PDF and Word files from the device and parses them locally
- It writes a Word document to the device and shares it through the system
  share sheet
- There is no account, no login, and no server call needed for any feature

The only optional network feature is a job search that reads public job listings,
and it does nothing until the user taps a button.

NO ACCOUNT NEEDED
There is no sign in, so no demo credentials are required.

PRIVACY
The app collects no data at all. Nothing is transmitted. This is verifiable by
running it in Airplane Mode.
```

---

## What to expect

Most first submissions from a new developer take 2 to 5 days. Apple says 90 percent
are done in under 24 hours, but new apps are looked at harder.

If it is rejected, the message tells you which guideline. Paste it here and I will
tell you exactly what to change. Rejections at this stage are usually a
misunderstanding rather than a real problem, and are fixed by explaining, not
rebuilding.

---

## After it is live

Updates need the version number raised in Xcode or in
`app/ios/App/App/Info.plist`, then a new build uploaded the same way.

Remember the $99 renews yearly. If you let it lapse the app is removed from the
store, though people who already installed it keep it.
