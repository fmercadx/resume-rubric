# Selling the app, step by step

The app is sold on both stores for one payment. The website stays free.

---

## Read this before you publish anything on Google Play

**A free app on Google Play can never be made paid.** Not later, not ever, not by
support. You can go the other way, paid to free, but not back.

So when you create the app in Play Console, set it to **Paid** on the very first
screen. If you publish it free to get the 12 tester process moving and plan to charge
afterwards, that door is shut permanently and the only way out is a new listing with
a new package name, starting the tester count again from zero.

Apple has no such rule. You can change an Apple price whenever you like.

---

## The price

**$4.99, one payment.** Set the same on both stores.

Why that number rather than $2.99:

| | $2.99 | $4.99 |
|---|---|---|
| You keep, at 15% | $2.54 | $4.24 |
| Sales to cover Apple's $99 a year | 39 | 24 |
| Sales to cover Google's $25 once | 10 | 6 |

This is a considered purchase, not an impulse one. Somebody deciding whether a resume
tool is worth paying for does not flip that decision over two dollars, so the lower
price mostly costs you money per sale without winning many more sales. Every rival
charges a subscription, usually ten to thirty dollars a month, so one payment of $4.99
is an easy story to tell.

You can change it later on both stores. Only the free to paid direction is locked, and
only on Google.

---

## What the stores take

| | Their cut | Notes |
|---|---|---|
| Apple | 15% | Only after you join the **App Store Small Business Program**. It is not automatic, you have to apply. Without it you pay 30%. |
| Google | 15% | Automatic on your first $1M of earnings each year. |

Both stores collect and pay sales tax and VAT for you in most countries, so you are not
registering for tax in places you have never been.

---

## The step everybody forgets

**A price does nothing until the money paperwork is finished.** You can set a price and
the app will still refuse to publish, or publish free, if this is not done.

**Apple:** App Store Connect, then **Business**, then **Agreements, Tax, and Banking**.
Accept the Paid Apps agreement, add a bank account, and fill in the tax forms. In the
US that is a W-9. Allow a day or two for it to be accepted.

**Google:** Play Console, then **Setup**, then **Payments profile**. You are creating a
Google payments merchant account. Bank details and tax details again.

Do this first. It is the slowest part and none of the rest works without it.

---

## Setting the price

**Google Play**
1. When you create the app, choose **Paid**. This is the irreversible one.
2. Monetize, then **Products**, then set the price.
3. Play shows you the converted price in every currency. Take the defaults.

**Apple**
1. App Store Connect, your app, then **Pricing and Availability**.
2. Pick the $4.99 price point. Apple converts for other countries itself.

---

## Testing without charging your testers

Google still wants 12 testers for 14 days on a personal account, and a paid app would
normally charge them.

In Play Console, go to **Setup**, then **License testing**, and add your testers' Gmail
addresses there. They can then install without being charged. Set this up before you
invite anyone, and confirm with the first tester that they were not asked to pay before
you invite the other eleven.

---

## What changed in the build, and why

The website and the app are built from the same file. The website has a pricing section
that says the product is free and costs **$0 always**, which is true of the website and
untrue of the thing somebody just paid for on the store.

`app/prepare-www.js` now strips that section from the app build only, along with the two
menu links that pointed at it and the share card text calling it a free resume checker.
The website is untouched and still says free, because it is.

The Play feature graphic said **FREE** on it. It now says **Nothing uploaded**.

One thing deliberately left in the app: the comparison table still says the full
analysis is on the landing page with no email and no card. That is true, and somebody
who paid is entitled to know it. Removing it would be hiding something rather than
fixing a contradiction.

---

## Things that will come up

**The same tool is free on your website, and the source is public.** Some buyers will
find that out and some will ask for a refund. Google refunds automatically within two
hours of purchase and you cannot block it. Expect a share of sales to come back.

**The licence lets anyone republish it.** The AGPL means another person can take the
source, build it, and put a free copy on the same store. Nothing stops that. You would
have the original listing and any reviews, and that is the whole of your advantage.

**Being paid removes you from most people's search results.** A lot of people filter to
free, and every "best free resume checker" list is closed to you now.

**Nobody is searching for the app yet.** A price does not create demand. The eight field
pages on your website are still the part that brings people in, and they point at the
free web version, so plan on the site being your traffic and the app being a small
extra.

---

## If you change your mind

Apple: change the price to free whenever you want, no consequences.

Google: you can go paid to free at any time. You cannot go back. Once it is free it is
free for the life of that listing, so treat dropping the Play price as a one way door
too.
