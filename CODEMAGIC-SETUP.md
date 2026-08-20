# Codemagic setup

Codemagic builds and signs the iPhone app in the cloud and sends it to Apple. No
Mac needed.

The build itself is already described in `codemagic.yaml` at the root of the repo.
Codemagic reads that file, so there is nothing to configure in their interface
beyond connecting things once.

**Free tier: 500 build minutes a month.** A build here takes about 8 minutes, so
that is roughly 60 builds a month. Far more than you need.

---

## What you need first

The $99 Apple Developer account has to exist. Everything below depends on it.

---

## Step 1: Make an Apple key for Codemagic

This lets Codemagic talk to Apple on your behalf, without you handing over your
password.

1. Go to **App Store Connect**, then **Users and Access**, then the
   **Integrations** tab, then **App Store Connect API**
2. Press **+** to generate a key
3. Name it `Codemagic`
4. Access: **App Manager**
5. Press Generate

Now note down three things, because two of them are only shown once:

| Item | Where it is |
|---|---|
| **Issuer ID** | At the top of the page, a long code |
| **Key ID** | In the row of the key you just made |
| **The .p8 file** | Press Download. **You can only download it once.** Keep it somewhere safe |

---

## Step 2: Connect Codemagic

1. Go to **codemagic.io** and sign in **with GitHub**
2. Allow it to see your repositories
3. Find **resume-rubric** in the list and press **Set up build**
4. It will detect `codemagic.yaml` on its own. If it asks, choose the
   **codemagic.yaml** option rather than the visual editor

---

## Step 3: Give Codemagic the Apple key

1. In Codemagic, go to **Teams**, then your team, then **Integrations**
2. Find **App Store Connect** and press **Manage keys**
3. Press **Add key** and fill in:

| Field | Value |
|---|---|
| Name | `ResumeRubricKey` |
| Issuer ID | from step 1 |
| Key ID | from step 1 |
| Private key | upload the .p8 file |

**The name has to be exactly `ResumeRubricKey`**, because that is what
`codemagic.yaml` refers to. If you name it something else, change it in the file
too or the build will not find it.

---

## Step 4: Create the app in App Store Connect

Codemagic can only upload to an app that already exists.

In App Store Connect, **My Apps**, **+**, **New App**:

| Field | Value |
|---|---|
| Platform | iOS |
| Name | Resume Rubric |
| Language | English (U.S.) |
| Bundle ID | `app.resumerubric.checker` |
| SKU | `resumerubric001` |

If the bundle ID is not in the dropdown, create it first under
**Certificates, Identifiers and Profiles**, then **Identifiers**, then **+**.

---

## Step 5: Build

In Codemagic, press **Start new build** and pick a workflow:

| Workflow | What it does |
|---|---|
| **iPhone app, to TestFlight** | Builds, signs, sends to TestFlight. Use this first |
| **iPhone app, submit for review** | Same build, and submits to Apple for review |

Run the **TestFlight** one first. That puts the app on your own phone through the
TestFlight app so you can check it works properly before Apple ever sees it.

Codemagic emails you when it finishes, pass or fail.

---

## What the build actually does

1. Installs the dependencies
2. Bundles the web app into the native shell, so everything runs on device
3. Installs CocoaPods
4. Raises the build number, since Apple rejects a repeat
5. Fetches or creates your signing certificate and profile automatically
6. Builds and signs the .ipa
7. Uploads to Apple

Signing is handled by the `fetch-signing-files --create` step, so you do not have
to make certificates by hand. That is the part that normally needs a Mac.

---

## If a build fails

Codemagic shows the log for the step that failed. Common ones:

**No matching profiles.** The bundle ID in App Store Connect does not match
`app.resumerubric.checker`. They have to be identical.

**Integration not found.** The key in Codemagic is not named exactly
`ResumeRubricKey`.

**App not found.** Step 4 was skipped. The app record must exist before uploading.

**Build number already used.** Apple has seen that number. Run again, it increments
each time.

Paste any failure here and I will tell you what to change.

---

## Later, updating the app

Push a change, press **Start new build**, pick the App Store workflow. That is the
whole process. Build numbers look after themselves.
