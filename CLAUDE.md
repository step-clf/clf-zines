# CLF weekly zine run: runbook

This repo turns each weekly Cute Little Fuckers (CLF) email into a 6-page zine and schedules it as **draft** posts in Postiz. Steph (founder and toy designer) reviews and approves every post. **Never publish or schedule live; always create drafts.**

The run happens every Monday morning (Pacific).

## 0. Setup (fresh session)
```bash
cd kit && npm install --no-audit --no-fund   # fonts, roughjs, playwright (Chromium at /opt/pw-browsers)
```
Character art is already trimmed in `kit/img/`, so `prep_assets.py` is only needed when new art is added. Raw art comes from Drive (IDs in the style guide below). Download it with the Drive tool, then run `jq -r .content <saved-file> | base64 -d > "<title>"`.

## 1. Pick the email
1. Download the calendar as xlsx and read every row. The Drive read tool only returns samples.
   - Drive file `1rYUaEg9gilTBtwOHsWNyV409qUhKMe0et2f4_tz-iR0` ("CLF Blog & Email Calendar").
   - Use `download_file_content` with `exportMimeType` = `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.
   - Decode it to a file, then open it with openpyxl.
2. Use the sheet **"<year> Email Schedule"**. Its columns are: complete?, Link, month, day, Type, Keywords, Title.
3. Pick the **earliest email dated after today** whose `complete?` = `yes` and that has **no entry in `log.json`**.
4. Read the Google Doc (the ID is in the Link column) with `read_file_content`.
5. If nothing qualifies (not written yet, or already done), make no posts. Tell Steph which email is next and that it isn't marked complete yet.

## 2. Make the zine
Follow the **Style guide** below.
1. Choose the style and the lead character. Check `log.json`: don't repeat last week's style or lead, and don't reuse any lead from the last 3 weeks if you can avoid it.
2. Copy the closest example HTML in `kit/` to `kit/<YYYY-MM-DD>-<slug>.html`. Keep the `common.css`, `b_style.css`, `helpers.js` and `img/` paths.
3. Render it:
   ```bash
   cd kit && node render.js <file>.html <slug> 1 && python3 sheet.py <slug>
   ```
   This writes `kit/out/<slug>_1..6.png` and `<slug>_sheet.jpg`.
4. **Look at the sheet with Read and fix every problem.** Common ones:
   - text overlapping other elements
   - titles wrapping into the next element
   - speech-bubble tails not pointing at the character
   - characters covering text
   - text overflowing its box
   - flex bubbles splitting text into columns (wrap the text in a `<div>`)

   Re-render until the sheet is clean. Then check page 1 at full size.

## 3. Host the pages and load them into Postiz
1. Copy the PNGs to `pages/<YYYY-MM-DD>-<slug>/`, commit, and `git push origin main`.
2. The public URL for each page is `https://raw.githubusercontent.com/step-clf/clf-zines/main/pages/<dir>/<slug>_N.png`.
3. Load each page with Postiz `uploadFromUrlTool` (in order 1–6) and keep the returned `path` values.
4. Verify all six uploaded, then **delete `pages/<dir>/`**, commit and push. Postiz keeps its own copies.

## 4. Create the Postiz drafts
Use `integrationSchedulePostTool` with `type: "draft"`. The date is the email's date at **10:00 AM Pacific**:
- PST (Nov–early Mar) = 18:00Z
- PDT = 17:00Z
- Sale or launch posts can go at 8:00 AM.

| Channel | integrationId | Format |
|---|---|---|
| Instagram (Cute Little Fuckers, @cutelittlefkers) | `cmw5fypo40pr5oj071sp65nqd` | All 6 pages. Setting `post_type: post`. Full caption (max 2200), hashtags at the end, "link in bio". |
| Facebook (CLF Toys) | `cmw5gk2y80q7foj07i8lmaitf` | All 6 pages. Setting `post_type: post`. Same caption without hashtags; end with cutelittlefuckers.com. |
| Tumblr (Cute Little Fuckers) | `cmw5gj5fj0q78oj073lqc8xex` | All 6 pages. Settings `title`, `link` (https://cutelittlefuckers.com) and `tags` (comma-separated). Shorter body. |
| Bluesky (Cute Little Fuckers) | `cmw5giusp0prkmm08ixwut0i9` | Max 4 images and 300 characters. Post = pages 1–4 + a short caption ending 🧵. Reply = pages 5–6 + a CTA with cutelittlefuckers.com. **Alt text on every image.** |
| Pinterest | `cmw5gn3qm0qaaoj07fwrx1u58` | **Skip.** There's no public board yet. |

Content is HTML: wrap every paragraph in `<p>` and escape `&` as `&amp;`.

**Caption voice:**
- Playful, cheeky, queer and warm, like the email itself. Reuse the email's own lines.
- No explicit language beyond the brand name. Censor swears (bullsh*t).
- Don't invent facts, dates, prices or codes.

Example hashtags: `#sexualwellness #genderinclusive #queerjoy #comicart #zine #cutelittlefuckers` plus 2–3 for the topic.

## 5. Log and report
1. Add the zine to `log.json` with `email_date`, `title`, `slug`, `style`, `lead`, `status: "draft"` and the Postiz post IDs.
2. Commit `kit/<file>.html` and `log.json`, then push.
3. Send Steph **one message** (use SendUserMessage; also push-notify if available) with:
   - the email and date
   - the style and lead
   - the overview sheet image (SendUserFile with `kit/out/<slug>_sheet.jpg`)
   - the Instagram previewUrl
   - anything that needs a decision, such as an email placeholder like "INSERT SHIPPING INFO" or a risky claim

   Tell her the posts are drafts and she needs to schedule them in Postiz.

## Style guide (summary of the project doc "CLF Zine Style Guide & Build Method")
**Format:**
- 6 pages, 1080×1350.
- Page arc:
  1. Cover: subject as title, subhed as a hand line, lead character, "swipe →".
  2. Setup.
  3. Core facts.
  4. A fun or relatable moment.
  5. How-to or proof.
  6. CTA: closing line, "link in bio", logo.
- Information goes in the image. One idea per page, big type. Use the email's wording.
- Page numbers ("2/6") go bottom-right on pages 2–5.

**Palette:**
- purple `#8628AE`
- magenta `#E44CFC`
- aqua `#92F0F0`
- butter `#F6E47A`
- ink `#2E0F40`
- tints `#FBDCFF` `#D4FAFA` `#FBF3C0` `#EFE3FF`
- riso pink `#FF48B0`

**Styles (rotate them; consecutive posts must not look alike):**
1. **Character comic** (`style1_character_comic__silicone.html`). Steph's favourite.
   - Cream graph paper, Shrikhand titles, Gaegu hand lettering.
   - Wobbly rough.js boxes, a character host per page in a speech bubble, doodles.
2. **Comic book** (`style2_comic_book__rumblies.html`).
   - Purple dotted background, cream panels, "cute little comics ISSUE #n" masthead.
   - Yellow caption boxes, Patrick Hand caps, Shrikhand sound effects.
   - Ends with a "to be continued... LINK IN BIO" banner. Great for sensory topics.
3. **Retro riso poster** (`style3_riso_poster__sale.html`).
   - Purple + fluoro pink on cream, Anton caps, Special Elite body, Caveat notes.
   - Halftones, starbursts, duotoned characters. Great for sales, activism and announcements.

The sticker journal is a possible alternate. **Never use the photocopy/ransom style; it's off-brand.**

**Characters (`kit/img/`):**
- `princette_purp`, `princette_plat`
- `starsi_coral`, `starsi_rose`, plus expressions `starsi_hmm` and `starsi_no`
- `jix_lav`, `jix_peri`
- `zeep_green`, `zeep_mint`
- `shimmer` (yellow only)
- `morrie_hop`, `morrie_butt` (alternate between them)
- `logo`

Character rules:
- Trinity is discontinued; never use it.
- All-toys topics: every toy appears, and a different host leads each page.
- Single-subject topics: one toy can present the whole zine.
- **Never show a CLF toy as the "bad" example.** Use a generic grey drawn object instead.
- Match the expression to the moment: Starsi nooooo for bad news, hmm for questions, Morrie butt for cheeky lines.

**Instagram-safe:**
- Text-forward and educational, with no explicit imagery.
- Flag anything risky to Steph.

**Rendering gotchas:**
- Riso text inside a starburst must not use `mix-blend-mode:multiply`.
- The comic-book title outline uses `-webkit-text-stroke` with `paint-order:stroke fill`.

**Art Drive IDs** (account step@cutelittlefuckers.com, for re-downloading):
- Starsi Coral `1vaYNLTYYxQlYZCg-9rg03C4NStlbys6u`, Rose `1OwCVBK-_qaNgk0phpBLViQ32bL-2YYMs`
- Jix Lavender `1uqW37dKXSF8nSXXyQtzgXJt0zaeVD8m_`, Periwinkle `1-MtUKilt0I5hY3Z35syNNRhQdPuwI4td`
- Princette Platinum `1tQvGJ5zJIHbtgF8ZIJoeMfr1PusOfaWx`, Purple `1ecTjkSIuXbxS_JRpCOY99qIiIs2P4ie2`
- Zeep Green `1cC5sUlDzKNE0NH6TJvyIqDrQLE7UzBqt`, Mint `1KSONUnPAOK2bEQEHpgrlnGEdTGiC41wQ`
- Shimmer `1ulgjaT6qL-J6SUUyxA6_3ab5BktkjMli`
- Morrie hop `1OLL_kULLM3g9Ljo8V0rWCDQ9AvOofpy3`, butt `1RTjB4r6UGJClAvRCVYNj2ZzSQCe57cpl`
- Starsi hmm `1KjQP1hfPvQEJmRCQBuEOr2tUO8oUn6vw`, nooooo `1gstD5cYuBPLDeXdrTcrGwMCt9a4syL5I`
- Logo `1K5mGJy9V52kqO8yvUSoPsUNFR5BrQtcb`
