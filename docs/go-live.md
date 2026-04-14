# Go-Live Guide — kaschief.com

One-time walkthrough to ship this portfolio to production at `https://kaschief.com`.

Two phases. **Phase A** is me (the assistant) pushing code and you verifying Vercel's default URL. **Phase B** is you in the Vercel and Namecheap dashboards pointing your domain at the deployed site.

---

## Prerequisites (check before starting)

- [ ] GitHub repo `kaschief/kaschief-by-kash` exists and your local `main` is in sync with `origin/main`. *(I will verify this with `git fetch` before merging — if it's diverged I'll stop and tell you.)*
- [ ] Vercel project is connected to the GitHub repo. *(You confirmed this.)*
- [ ] Namecheap: you own `kaschief.com`. *(You confirmed this.)*
- [ ] Dev server can be stopped — we don't need it for deployment, but it's fine to leave running.

---

## Phase A — Deploy to Vercel's default URL

**Goal:** get the site running on Vercel's own URL (something like `kaschief-by-kash.vercel.app`) so we can verify the build works before touching DNS.

### A.1 — I fast-forward `main` and push

I will run, in order:

```bash
git fetch origin
git checkout main
git pull origin main
git merge --ff-only v0/kaschief-7e512204
git push origin main
```

If the fast-forward fails (shouldn't, but possible if `main` has commits that aren't on your current branch), I'll stop and ask how to resolve.

### A.2 — Vercel auto-deploys

No action from you. Vercel sees the push to `main`, builds, and deploys to its production environment.

**What to watch:**
- Open [vercel.com/dashboard](https://vercel.com/dashboard) in a browser.
- Click your project.
- You should see a new deployment appear within ~15 seconds of the push.
- Click into it to watch the build log if you want.
- Build typically takes 1–3 minutes.

### A.3 — You verify Vercel's URL

Once the deployment shows **Ready** (green check), click it to open. It'll be at a URL like:

- `https://kaschief-by-kash.vercel.app`
- or `https://kaschief-by-kash-<random>.vercel.app`

**Click through the site.** Scroll top to bottom. Check:
- [ ] Favicon shows the KJ monogram in the tab.
- [ ] Hero → Portrait → Act I (Nurse) → Act II (Engineer) → Act III (Leader) → Contact all load.
- [ ] Hash refresh on `#engineer` still works.
- [ ] `/lab` returns 404 (it should — Vercel prod has `NEXT_PUBLIC_ENABLE_LAB` unset).
- [ ] Paste the Vercel URL into Slack or iMessage — the preview card should show portrait photo + `Kaschief Johnson` + `NURSE · ENGINEER · LEADER`.

**If anything is broken**, tell me what and I'll iterate. Do NOT continue to Phase B until the site on the Vercel URL is correct.

---

## Phase B — Point kaschief.com at the Vercel site

**Goal:** when someone types `https://kaschief.com`, they see the site instead of Namecheap's parking page.

This is two dashboards: Vercel (add the domain) and Namecheap (point DNS records at Vercel).

### B.1 — Add the domain in Vercel

1. In the Vercel dashboard, go to your project.
2. Click **Settings** (top nav).
3. Click **Domains** in the left sidebar.
4. You'll see a text input labeled "Add Domain". Type: `kaschief.com`
5. Click **Add**.
6. Vercel will show a modal asking which redirect to set. Choose:
   - **Redirect `www.kaschief.com` to `kaschief.com`** (apex as canonical, www redirects)
   - This is the standard choice. The alternative is the inverse, which is fine too but slightly out of fashion.
7. Click **Add**.
8. Vercel will now show you a panel with "Invalid Configuration" next to each domain. **This is expected** — it means DNS isn't pointed at Vercel yet. Below each domain, Vercel displays the exact DNS record(s) you need to add. Something like:

   | Type  | Name | Value                  |
   |-------|------|------------------------|
   | A     | @    | `76.76.21.21`          |
   | CNAME | www  | `cname.vercel-dns.com` |

   **The exact values may differ — use whatever Vercel shows you, not what's in this guide.** Leave the Vercel tab open; you'll copy these values into Namecheap next.

### B.2 — Set DNS records in Namecheap

1. Open a new tab, go to [namecheap.com](https://www.namecheap.com), log in.
2. Click **Domain List** in the left sidebar.
3. Find `kaschief.com` in the list, click **Manage** on the right.
4. Click the **Advanced DNS** tab.
5. **You will see some records already there by default.** Namecheap pre-fills:
   - A **URL Redirect Record** pointing at a parking page
   - A **CNAME Record** like `www` → `parkingpage.namecheap.com`

   **Delete both of these.** Click the trash icon next to each. They will conflict with Vercel if you leave them.

6. Click **Add New Record**. A row appears with dropdowns.
7. Set the type dropdown to **A Record**.
8. In Host, type `@` (this represents the root domain `kaschief.com`).
9. In Value, paste the IP Vercel gave you (typically `76.76.21.21`).
10. Leave TTL at **Automatic**.
11. Click the green checkmark to save the row.

12. Click **Add New Record** again.
13. Set the type to **CNAME Record**.
14. In Host, type `www`.
15. In Value, paste the CNAME Vercel gave you (typically `cname.vercel-dns.com`).
16. Leave TTL at **Automatic**.
17. Click the green checkmark to save.

Your DNS tab should now look roughly like this:

| Type  | Host | Value                    | TTL       |
|-------|------|--------------------------|-----------|
| A     | @    | `76.76.21.21`            | Automatic |
| CNAME | www  | `cname.vercel-dns.com.`  | Automatic |

*(Namecheap sometimes appends a trailing dot to CNAME values — that's fine, it's valid DNS.)*

### B.3 — Wait for DNS + Vercel cert

Namecheap propagation is usually **5–15 minutes**. Occasionally longer. Here's what to watch:

1. Go back to the Vercel Domains panel (the tab you left open in B.1).
2. Wait, refreshing every minute or so.
3. Each domain's "Invalid Configuration" warning will turn into a green **Valid Configuration** check once Vercel sees the DNS records resolving.
4. After that, Vercel automatically issues an HTTPS cert via Let's Encrypt. Takes another 30–60 seconds.
5. Both domains (`kaschief.com` and `www.kaschief.com`) should end up in a valid + secured state.

### B.4 — Verify

In a new browser tab, visit:

- `https://kaschief.com` — should load the portfolio
- `https://www.kaschief.com` — should redirect to `https://kaschief.com`

Use an **incognito window** to avoid any stale DNS cache from your browser.

If you see "This site can't be reached" or the Namecheap parking page, wait a few more minutes — DNS is still propagating. You can check propagation at [dnschecker.org](https://dnschecker.org/) by entering `kaschief.com` and looking for `76.76.21.21` (or whatever IP Vercel gave you).

---

## Optional: enable lab on preview deployments

This is unrelated to the production go-live, but since you want to keep iterating on `/lab` features after launch, you'll want preview branches to have lab visible.

1. In Vercel → Project → Settings → **Environment Variables**
2. Click **Add New**
3. Key: `NEXT_PUBLIC_ENABLE_LAB`
4. Value: `true`
5. Environments: check **Preview** and **Development**. **Leave Production unchecked.**
6. Click **Save**.

**Important:** existing preview deployments won't pick up the new variable. Push a new commit to any non-main branch to trigger a fresh preview build with the flag set.

---

## Troubleshooting

### The Vercel production deploy fails during build

- Open the build log in Vercel.
- Look for the first error. Typical causes:
  - TypeScript error (run `pnpm tsc --noEmit` locally to reproduce)
  - ESLint error (run `pnpm lint` locally)
  - Missing environment variable the build expects
- Tell me the error, I'll fix.

### The site loads on `kaschief-by-kash.vercel.app` but OG preview card is wrong

- Paste the URL into a clean Slack message (not one you've sent before — Slack caches OG cards). Or use [opengraph.xyz](https://www.opengraph.xyz/) and paste your URL to see what the card looks like.
- If the card is blank / wrong, visit `https://kaschief-by-kash.vercel.app/opengraph-image` directly to see the generated PNG.
- If the PNG is broken, tell me the error from Vercel's function logs.

### DNS doesn't propagate after 30+ minutes

- Double-check Namecheap: did both records save? (The checkmarks were clicked, the rows aren't showing "Unsaved".)
- Check [dnschecker.org](https://dnschecker.org/) — are some regions showing the new IP?
- Namecheap takes longer than average sometimes. Up to a few hours is not abnormal for fresh domains.
- Your local browser / OS may be caching old DNS. Try `dscacheutil -flushcache` on macOS, then use incognito.

### `https://kaschief.com` loads but `https://www.kaschief.com` does not (or vice versa)

- One of the two records isn't set correctly.
- Back in Vercel → Domains, look at which domain has the red "Invalid Configuration".
- Compare the DNS record Vercel asks for vs. what Namecheap shows you. Spelling of `cname.vercel-dns.com` is easy to miss.

### I see the old cached v0 template favicon on kaschief.com

- Browser favicon cache (yes, still, even here).
- Incognito window, then cmd-shift-R.
- If it persists, DevTools → Application → Storage → Clear site data.

---

## Status checkboxes — track your progress

Phase A:
- [ ] Assistant pushed `main` (A.1)
- [ ] Vercel deployment shows **Ready** (A.2)
- [ ] Site verified on Vercel default URL (A.3)

Phase B:
- [ ] Domain added in Vercel, DNS records noted (B.1)
- [ ] Namecheap default records deleted (B.2)
- [ ] Namecheap `A` record added (B.2)
- [ ] Namecheap `CNAME` record added (B.2)
- [ ] Vercel shows "Valid Configuration" for both domains (B.3)
- [ ] HTTPS cert issued (B.3)
- [ ] `https://kaschief.com` loads in incognito (B.4)
- [ ] `https://www.kaschief.com` redirects to apex (B.4)

Optional:
- [ ] `NEXT_PUBLIC_ENABLE_LAB=true` set on Vercel Preview + Development

---

## When you're ready

Tell me **"go Phase A"** and I start the merge + push. I will stop after the push and wait for you to confirm the Vercel URL works before Phase B.
