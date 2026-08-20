# Google Play, step by step

Everything you need is already built. This is the order to do things in, and the
exact answers to the questions the console asks.

---

## Before you start

Have these ready:

- **$25** and a card
- **Photo ID.** Google verifies who you are now, and it can take a few days
- The `.aab` file from the Actions tab of the repo
- The screenshots from `app/store/screenshots/`, the six named `play-*`
- The icon at `app/store/play-icon-512.png`
- A bank account and tax details, for the payments profile
- Twelve people who will tap a link, and a promo code for each of them

---

## The 12 tester rule, decide this first

A **personal** account created after November 2023 cannot publish publicly until it
has run a closed test with **12 testers opted in for 14 continuous days**.

An **organization** account is exempt from that, but needs a free D-U-N-S number
from Dun and Bradstreet. Google says that can take up to 30 days, and in practice
people report 4 to 8 weeks. An organization account also expects a real registered
business.

| | Personal | Organization |
|---|---|---|
| D-U-N-S needed | No | Yes, 30 days to 8 weeks |
| 12 testers for 14 days | Yes | No |
| Real business needed | No | Yes |
| Realistic time to live | **About 3 weeks** | 6 to 10 weeks |

**Go personal.** Waiting two months to skip a two week test is a bad trade.

Pick before you sign up, because changing account type later is painful.

Start the closed test on day one and fill in the rest of the listing while the 14
days run, so nothing is wasted waiting.

### What a tester actually has to do

Less than it sounds. They do not review anything or send feedback. They need to:

1. Have a Google account
2. Tap the opt in link you send them
3. Leave it accepted for 14 days

Twelve people who will tap a link once. If you cannot find twelve, there are groups
where developers opt into each other's tests. Those are real people, which is what
Google is asking for.

---

## Paid apps and the 12 testers, read this before creating the app

Google's own documentation, on the page about setting up tests:

> Testers must purchase paid apps when participating in open or closed tests.
> For paid apps, testers can install your internal test version for free.

And the requirement you have to satisfy is a **closed** test, not an internal one.
Internal testing does not count towards production access.

Put together, that means your twelve testers would each be asked to pay $4.99 to do
you a favour. That is not a workable ask.

**The way round it is promo codes.** In Play Console, under **Monetize**, then
**Promotions**, you can generate one time codes that give 100% off. Send each tester
a code with the opt in link and they install without paying. You get up to 500 codes
per quarter, so twelve is nothing.

**Check this with your first tester before you invite the other eleven.** Send one
person the opt in link and a code, and confirm they were not charged. Developers
report the codes behaving inconsistently while an app is still unpublished, and it is
far better to find that out with one person than with twelve.

If codes turn out not to work for you, the fallback is to let the twelve pay and send
each of them $4.99 back. You receive 85% of each sale, so twelve sales at $4.99 return
about $50.88 to you and refunding them $59.88 leaves you about $9 down. Cheap, but it
is twelve awkward conversations.

Neither of these applies to Apple. Apple has no tester minimum at all.

---

## 1. Sign up

Go to **play.google.com/console**, sign in with a Google account, pay the $25, and
complete identity verification. The fee is once, not yearly.

## 1b. Set up the payments profile, before you create the app

A price does nothing until this exists, and it is the slowest part.

**Setup**, then **Payments profile**. You are creating a Google payments merchant
account: business or individual details, a bank account, and tax details. Do it now
so it is settled by the time the rest is ready.

## 2. Create the app

**All apps** then **Create app**.

| Field | Answer |
|---|---|
| App name | `Resume Rubric` |
| Default language | English (United States) |
| App or game | App |
| Free or paid | **Paid**. This cannot be changed later, see PRICING.md |

Tick the declarations and create.

## 2b. Set the price

**Monetize**, then **Products**, then **App pricing**. Set **$4.99**.

Play converts that into every other currency for you. Take the defaults unless you
have a reason not to.

Then generate the tester codes: **Monetize**, then **Promotions**, then create a
one time promotion at 100% off and produce twelve codes.

## 3. Work through Dashboard tasks

The console gives you a checklist. These are the answers.

### App access
Choose **All functionality is available without special access**. There is no
login, so this is true.

### Ads
**No, my app does not contain ads.** True, there are none.

### Content rating
Fill in the questionnaire. Everything is **No**: no violence, no sexual content,
no profanity, no drugs, no gambling, no user to user communication, no sharing of
location or personal information. You should come out rated for everyone.

### Target audience
Age group **18 and over**. It is a tool for people applying for jobs. Saying it is
not aimed at children keeps you out of the extra rules that apply to family apps.

### Data safety
This is normally the hardest section and for your app it is the easiest, because
the honest answer to nearly everything is no.

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data encrypted in transit? | Not applicable, nothing is sent |
| Do you provide a way for users to request deletion? | **Yes**, they delete it themselves in the app |

If it insists on detail, the truthful statement is that the app processes the
resume entirely on the device and transmits nothing.

### Privacy policy
Paste this into the privacy policy box:

```
https://resume-rubric-production.up.railway.app/privacy
```

### Government apps
No.

### Financial features
None.

---

## 4. Store listing

**App name**
```
Resume Rubric
```

**Short description**, 80 characters maximum
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

One payment. No subscription, no adverts, and nothing inside the app is locked away.
```

**Graphics**

| Asset | File |
|---|---|
| App icon, 512 x 512 | `app/store/play-icon-512.png` |
| Phone screenshots | the six `play-*.png` files |
| Feature graphic, 1024 x 500 | `app/store/feature-graphic-1024x500.png` |

**Category:** Productivity
**Tags:** resume, job search, career
**Contact email:** vfranmer29@gmail.com

---

## 5. Upload the app

Go to **Release**, then either:

- **Testing, Closed testing** if you took the personal account route. Create a track,
  add your 12 testers by email, and start the clock. Send each of them a promo code
  with the opt in link, or they will be asked to pay
- **Production** if you have an organization account

Internal testing would let testers install a paid app for free, but it does not count
towards production access. It has to be a closed test.

Upload `app-release.aab`.

When it asks about app signing, choose **Google Play App Signing** and let Google
hold the key. That is the default and it means you never have to keep a key file
safe yourself.

## 6. Countries

Select all countries, or just the ones you care about. There is no reason to limit
it, the app works anywhere.

## 7. Send for review

Press **Send for review**. First reviews usually take a few days, sometimes longer
for a brand new account.

---

## If it gets rejected

The likely reasons and what to say.

**Broken functionality.** Reviewers sometimes miss that they need to paste a job
posting. In the review notes tell them to press **Load a sample**, which fills both
boxes in one tap.

**Minimum functionality.** Point out that the app works with no connection, reads
and writes files on the device, and contains its own scoring engine rather than
loading a web page.

**Data safety mismatch.** If they question the "collects no data" answer, the app
genuinely makes no network requests during use. They can verify it in aeroplane mode.

---

## After it is live

The listing can be edited any time. Updates are a new `.aab` from the Actions tab,
uploaded to a new release. Version numbers live in
`app/android/app/build.gradle` as `versionCode` and `versionName`, and both need to
go up for each release.
