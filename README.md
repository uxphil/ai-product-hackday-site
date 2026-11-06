# Event website

A small static site for participants: what the event is, the agenda, a short "Get ready" checklist with three ways to take part (personal laptop, LBG laptop, phone or tablet), a guided hello-world warm-up, safety reminders, resources, help and project themes.

No framework, no build step, no database, no analytics, no cookies. Five pages collect something: `share.html` sends a participant’s name, project, app link, product page link and PRD to the organiser, `vote.html` sends a device’s favourite picks, the day companion (`join.html`, `me.html`) keeps a participant’s name, nickname, job title, ticked stops and calls for help (see below), and `feedback.html` sends anonymous answers to the feedback questions, with an optional email. Plain HTML, one CSS file, one small JavaScript file. Anyone (or any AI tool) can edit it with a text editor.

## Files

| Path | Purpose |
|---|---|
| `index.html` … `themes.html` | One file per page. Each has the same header and navigation. |
| `route-work-laptop.html`, `route-phone.html` | Routes for people without a personal laptop (LBG laptop with Figma Make; phone or tablet). Linked from Get ready, not in the main navigation. |
| `assets/style.css` | All styling, including dark mode. Colours and radius are variables at the top, matching the bonhard.ai look (DM Sans, olive-black and sage). |
| `assets/fonts/` | DM Sans, self-hosted (SIL Open Font License) so visitors never contact Google. |
| `assets/icons.svg` | Icon sprite. Interface icons are from Lucide (ISC licence); GitHub, Claude and Replit marks are from Simple Icons (CC0). Use an icon with `<svg class="icon"><use href="assets/icons.svg#i-NAME"/></svg>`. Brand names start with `b-`. |
| `assets/site.js` | Password gate, tick-box progress (saved in the browser only), copy buttons, Mac/Windows switch. |
| `talks/` | Talk slides. Generated from `talks/<name>/deck` in the planning repository by `scripts/build-talk-page.py`; don't edit by hand. These pages have a slim header instead of the shared navigation. |
| `talks/takeaway.html`, `talks/takeaway.pdf` | The take-away (added 6 November 2026), a guide participants keep: every step, prompt and link, written to be read alone and with no dates, places or speakers, so it works for every event. On a phone its sheets reflow to readable cards. The page sits behind the password gate; the PDF is a plain file with no gate, so it’s the copy to keep. Built from `talks/takeaway/deck` by `scripts/build-talk-page.py`, with prompts pulled from the site’s pages and `PARTICIPANT-PROMPTS.md`; don’t edit by hand. Linked from Resources, The day, My day and the event summary. |
| `share.html` | “Share your PRD” for the demos, added on the day. Not in the main navigation; linked from Home and The day. Participants upload their PRD file (Markdown, text or Word, read in the browser: nothing to copy and paste) or link to it on GitHub. Sends the form to the organiser’s Cloudflare Worker at `hackday-api.bonhard.ai` (code and checks in `worker/README.md` in the planning repository). Its script is inline in the page. Says what happens to the data: first name and project name go on the event summary once voting closes, the rest is deleted. On load it asks the Worker whether sharing is open: if so it shows “Sharing for: <event>”, otherwise it says sharing is closed and hides the form (the organiser opens sharing in the demo control’s Live tab; it closes by itself after the event’s date). |
| `vote.html` | After-event vote for favourite projects, added on the day. Lists each shared project (first names, project, app and product page links; never surnames or the PRD) in a random order per voter; each device picks up to three. Each card shows a live, scaled-down preview of the app (a sandboxed, lazy-loaded frame; hosts that refuse framing, such as claude.ai, get a coloured initials tile instead), so the page loads participants’ sites; the footer says so. Linked from Home and the share page. Its script is inline. A note near the top (added 2 November 2026) says the event summary will show first names and project names, and how to opt out. Close it with the Close voting switch in the demo control’s People’s choice tab. Once closed, the page shows no cards, search or Send button, only a “Voting has closed” note, with a link to the event’s summary once it’s published. When the Worker’s `/entries` names an `event`, the page shows “Voting for: <event>, <date>”, sends that event id with the picks, and forgets picks saved for a different event, so nobody votes in the wrong event. |
| `join.html` | “Join the day”, the day companion’s sign-up (approved 29 October 2026). Name, nickname, day-job title and an optional personal email (for materials afterwards), sent to the Worker’s `/join` for the event the organiser has opened for joining (the switch in the demo control’s Room tab); then opens the person’s board. It joins whichever event the organiser has opened, whether or not it’s in the event menu, so a test event needs no site change. If this browser already has a board for that event, it offers that first (and still lets a second person join on a shared laptop). Says what we keep and that it’s deleted 30 days after the event. Not in the navigation; linked from My day. |
| `me.html` | “My day”, a participant’s board, under The day in the navigation. The board’s private code is in its address (`me.html#K7QM4TXP2A`), so each board is its own bookmark, titled with the nickname, and boards never clash. It shows the call button first (“Call a helper”, with an optional note; the organiser sees it in the demo control’s Room tab and the board shows “Phil is on the way”), a boarding pass with the code, and five stops with a plane that moves along a track: warm-up done, GitHub connected, hello world pushed, PRD shared, app live (ticked by the participant, on trust). **Getting back to a lost board:** opened with no code, the page goes straight to this browser’s board for the chosen event, or lists the boards opened here (`me.html#boards`), and anyone can type their code; a helper can also look the code up and show a QR code from the Room tab. “Forget me” deletes the board at once. It checks for updates every 30 seconds, every 8 while a hand is up. Script inline. |
| `summary.html` | “The day in review”, one page per event (`summary.html?event=<id>`; without it, the latest published one). Reads the Worker’s public `GET /summary`, which answers only once the organiser has published the summary and voting for that event has closed; until then the page says it isn’t out yet. Opens with an intro and the numbers as tiles (added 4 November 2026): people largest, with a dot per person, projects with each project’s emoji, voters, then the feedback highlights’ numbers when there are some (the highest percentage first, on solid colour); they count up and drift in on load. Under them, a row of section links (The numbers, AI judge, The people, Prizes, What got built, From the day, and A note from Phil when there is one) docks under the header as you scroll and lights up the section you’re reading; on phones the same links sit indented under Event summary in the floating Menu, which opens at them, and the Menu button’s label shows the section (“Summary · Prizes”). The links are added by the page’s script, so the Menu still matches the main navigation for `check-site.py`. Then **Round one: the AI judge** (the reveal buttons sit above the board; places 6 and below show at once, the top five are revealed one click at a time, 5th to 1st), then **Round two: the people**, which unlocks once the AI’s winner is out (or straight away with “skip straight to the results”), with “Did the AI agree?” comparing both places. The prizes stay hidden until both rounds are revealed (one per project: people’s choice first, then the demo control’s seven AI categories). Then what got built, the feedback highlights, when the organiser has added them: big numbers that count up as they scroll into view, with a bar for percentages, stars for a score out of 5 and the highest percentage inverted, then a grid of anonymous quotes in mixed sizes (the first and every fourth large, short ones on solid colour), the feedback sheets, the photos as a mosaic (the first one large, landscape ones wide, portrait ones tall, plus a “moments from the day” tile; they drift in as you scroll), the event’s reel played in the page (the same video as `reel.html`: the organiser’s upload, or else `assets/reels/<event>.mp4`; in the preview it loads from the published site), with a link to `reel.html` to share it on its own, and “A note from Phil” when there is one. Any photo opens in a lightbox with ✕, arrows, arrow keys and swipe. First names and project names only, never PRDs, links or the AI’s comments. How far a visitor has revealed is remembered in their browser only; “Show everything” skips the reveal. Sits under “The day” in the navigation, after Vote for favourites; the link carries the chosen event. Script inline; preview against a local Worker with `?api=http://localhost:<port>`. **Preview:** the demo control serves this same file at `hackday-control.bonhard.ai/preview/summary.html?event=<id>` (fetched from the published site, so publish the site after changing it), behind Cloudflare Access; there the page reads the draft and adds editing: intro, head count, thank-you note, feedback highlights (numbers as `value | label` lines, one quote per line), photo order (arrows or drag), captions and hide/show, plus a bar with Save draft, Versions (restore an older one) and Publish. The bar turns green with “Live. This is what everyone sees” when the live version matches the draft, and says “not live yet” when there are changes; after Publish, an “It’s live” dialog gives the public link (Open, Copy link). `site.js` skips the password box on `/preview/` pages. |
| `reel.html` | “The reel”, a short video per event (`reel.html?event=<id>`), with a link back to that event’s summary or plan. **Before the day** plays `assets/reels/<id>-before.mp4` if there is one. **The day in review** appears once the event’s summary is published and plays the video chosen in the demo control’s Summary tab: an upload (from `GET /summary`’s `reel.video`, served by the Worker) or the one made with Claude Code, `assets/reels/<id>.mp4`. A switch picks either when both exist (`?mode=before` forces the first). Reels are made with `reel/maker.html` in the planning repository, not on the site. `reel.html?embed` is the bare player, shown in a frame on the homepage. Not in the navigation; linked from Home and the summary. Script inline. |
| `feedback.html` | After-event feedback, added 3 November 2026 in place of the MS Forms survey. The same eight questions: stars, five aspects of the day, recommend 0–10, expectations, three optional comments and an optional email. Not in the main navigation; linked from The day and the vote page. Sends the answers to the Worker (`worker/src/feedback.js`) against a random code kept in the browser, so sending again replaces them. Takes answers only while the demo control's Feedback tab has it open. Its script is inline. |
| `robots.txt`, `<meta name="robots">` | Ask search engines not to index the site. |

## Themes

The default theme is sage (matching bonhard.ai). A bottom-left toggle switches to a neutral "Clean" theme (white, navy and blue). The choice is remembered in the visitor's browser only. Both themes follow the visitor's light/dark setting. Colours live in `:root` and `:root[data-style="clean"]` in `assets/style.css`. No third-party brand identity is used in either theme.

## Preview locally

```bash
cd site
python3 -m http.server 8765
```

Open <http://localhost:8765>. Use the server rather than opening files directly: the icon sprite is loaded as a separate file.

## Edit

- Change text directly in the HTML file. Keep one `<h1>` per page.
- Mark anything unconfirmed with `<span class="tbc">To be confirmed</span>` (or the `tbc-box` block). **Never invent venue, speaker, helper, signup or endorsement details.**
- **Event picker.** The header shows which hackathon the event-specific pages are for (`site.js` adds it next to the brand; `venue.html` loads no script, so it has none). Since 3 November 2026 the list comes from the Worker's `GET /events`: the events the organiser has switched to **On the site** in the demo control's header, newest first. The browser keeps the last list for the next page; `FALLBACK` in `site.js` (28 Oct 2026 · Manchester) is used until it has loaded once. Which event a page is for: `?event=<id>` in the address (links from the demo control carry it), else the one picked earlier in this visit, else the page's default: the **next** event (today or later; the latest if none is to come), or the **last** one (today or earlier) on `summary.html`, `vote.html` and `feedback.html`, which happen after an event (`<html data-event-default="last">`). A choice lasts for the visit only, so a new visit lands on the default. Once someone has chosen, links to `share.html`, `vote.html`, `reel.html` and `summary.html` carry it as `?event=<id>`. A link that names an event that isn't on the site (not switched on yet, or no such event) is set aside: the page uses its default and a note under the header says so, and `?event=` is taken out of the address. `vote.html` and `feedback.html` refuse to take answers only when someone chose a different event from the one the Worker has open. **Test links** (added 4 November 2026): `?test=<key>` from the demo control's **Copy test link** is kept in this browser (`localStorage`, up to five keys) and taken out of the address; the picker then asks `GET /events?test=<keys>` and also lists those events, labelled “not public yet”, so the organiser can try an event's pages before it's on the site. `?test=off` forgets the keys. To add an event, create it in the demo control, try it with its test link, then press **Not on the site** to show it. The home page's date, venue and times are still written into the pages.
- `vote.html` and `summary.html` sit under “The day” in the navigation.
- If you add, rename or remove a page, update the `<nav>` list **and** the mobile `fab-menu` list in **every** page. On phones the header keeps only a "Get ready" link (the `cta` item) and the rest sits in a floating Menu button at the bottom right, as on bonhard.ai. The check script fails if the navigation differs between pages or from the mobile menu.
- The exact safety sentence is repeated on several pages. Search for `personal learning exercise` and change all copies together. The LBG laptop route (`route-work-laptop.html`) deliberately uses a different sentence about LBG’s normal rules.
- Keep external links to official documentation and re-check them before the event (`--external` below).

## After changing CSS or JavaScript

```bash
python3 scripts/version-assets.py
```

This stamps a content hash onto the `style.css` and `site.js` links (for example `style.css?v=d9ecfdfd`). Browsers and Cloudflare cache these files for hours, and without a new address visitors get the new page with the old styles. `check-site.py` fails if the hashes are stale.

## Check before publishing

```bash
python3 scripts/check-site.py             # structure, shared nav, internal links and anchors
python3 scripts/check-site.py --external  # also requests every external link
```

Sites such as github.com/signup return 403 to scripts; open those in a browser instead.

## Password gate: what it is and isn't

The site is protected by a shared password, but the check runs in the visitor's browser. It keeps casual visitors out; **it is not real security**. Anyone who reads the page source can find the check and bypass it, and the content is in the files whether or not the gate is shown. Put nothing confidential on the site. The password is not case-sensitive.

`venue.html` is deliberately outside the gate: it loads no JavaScript, has no password box, forms or outside links, so it can be opened on locked-down work machines. Keep it that way (`check-site.py` fails if it loads a script).

To change it, compute the new hash and replace `GATE_HASH` in `assets/site.js`:

```bash
node -e 'const c=s=>{let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<s.length;i++){const ch=s.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return 4294967296*(2097151&h2)+(h1>>>0)};console.log(c(process.argv[1].toLowerCase()))' 'newpassword'
```

To remove the gate (for example when the site is made open), set `GATE_HASH = 0`.

For real access control, host behind something that enforces it (for example Cloudflare Access) instead.

## Publish

Live at **https://hackday.bonhard.ai** (GitHub Pages, custom domain set by the `CNAME` file). This public repository, `uxphil/ai-product-hackday-site`, contains only the contents of `site/` from the private planning repository, which also holds internal notes and must never be published.

Edit in the private repo, then from its root:

```bash
git subtree split --prefix=site -b site-publish
git push site-public site-publish:main --force
git branch -D site-publish
```

(`site-public` is the remote `https://github.com/uxphil/ai-product-hackday-site.git`.) Pages usually updates within a few minutes and can take up to 10 minutes.

DNS: in Cloudflare, `hackday` is a **CNAME** to `uxphil.github.io`, set to **DNS only** (grey cloud) so GitHub can issue the HTTPS certificate. Keep "Enforce HTTPS" on in the repository's Pages settings once the certificate is ready.

Public repo, public site: the content must stay safe to be public, and the password hash is visible.

## Working on this with Claude or Codex

Open the repository, point the tool at `site/`, and ask for the change. After any edit run `python3 scripts/check-site.py`. Conventions for AI tools are in `AGENTS.md` in the private planning repository.
