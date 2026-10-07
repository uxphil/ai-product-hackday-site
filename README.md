# Event website

A small static site for participants: what the event is, the agenda, a short "Get ready" checklist, a guided hello-world warm-up, safety reminders, resources, help and project themes.

No framework, no build step, no database, no analytics, no cookies. Plain HTML, one CSS file, one small JavaScript file. Anyone (or any AI tool) can edit it with a text editor.

## Files

| Path | Purpose |
|---|---|
| `index.html` … `themes.html` | One file per page. Each has the same header and navigation. |
| `assets/style.css` | All styling, including dark mode. Colours and radius are variables at the top, matching the bonhard.ai look (DM Sans, olive-black and sage). |
| `assets/fonts/` | DM Sans, self-hosted (SIL Open Font License) so visitors never contact Google. |
| `assets/icons.svg` | Icon sprite. Interface icons are from Lucide (ISC licence); GitHub, Claude and Replit marks are from Simple Icons (CC0). Use an icon with `<svg class="icon"><use href="assets/icons.svg#i-NAME"/></svg>`. Brand names start with `b-`. |
| `assets/site.js` | Password gate, tick-box progress (saved in the browser only), copy buttons, Mac/Windows switch. |
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
- If you add, rename or remove a page, update the `<nav>` list **and** the mobile `fab-menu` list in **every** page. On phones the header keeps only a "Get ready" link (the `cta` item) and the rest sits in a floating Menu button at the bottom right, as on bonhard.ai. The check script fails if the navigation differs between pages or from the mobile menu.
- The exact safety sentence is repeated on several pages. Search for `personal learning exercise` and change all copies together.
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
