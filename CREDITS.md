# Credits

## Music
| Track | Where it plays | Source / licence |
|---|---|---|
| welcome-theme (`frontend/public/audio/welcome-theme.mp3`, plus `.ogg` transcoded from it) | Welcome screen only. It is a seamless Web Audio loop at volume 0.22, fades in over 3s on the first tap and fades out over 1.2s when she leaves | Original score, made for Weave Him. No licence needed |

## Sound
Every sound in Weave Him is **synthesised live in the browser with the Web Audio API** (`frontend/src/lib/sound.js`).
The sound effects use no audio files. They are generated once, after the first tap.

| Sound | Where it plays | How it's made | Source / licence |
|---|---|---|---|
| Thread pluck | Option or chip selected; each strand woven in on the weaving screen | Karplus–Strong plucked string | Original, synthesised in code · CC0 1.0 |
| Wicker tick | Slider moves past every 10% | Band-passed noise click | Original, synthesised in code · CC0 1.0 |
| Wicker creak | Slider crosses a caption step | Amplitude-modulated band-passed noise | Original, synthesised in code · CC0 1.0 |
| Page turn | "Weave this strand", next or back, "Commission", "Weave another" | Swept band-pass noise with a soft envelope | Original, synthesised in code · CC0 1.0 |
| Weaving rustle (loop) | Weaving screen background | Low-passed noise with slow swell and sparse crackle | Original, synthesised in code · CC0 1.0 |
| Harp flourish | Reveal of him (1.7s) | Five-note D-major Karplus–Strong arpeggio | Original, synthesised in code · CC0 1.0 |
| Quill scratch | Each vow appearing; reweaving a vow | High-passed noise in three strokes | Original, synthesised in code · CC0 1.0 |
| Wax-seal press | Signature and seal appearing | Pitch-dropping sine thump plus low-passed noise | Original, synthesised in code · CC0 1.0 |
| Share reveal | The card rising in the share overlay (~2.2s) | A low timpani swell and roll, then a harp glissando and a bell shimmer | Original, synthesised in code · CC0 1.0 |
| Paper rustle | Share, Save image, Copy link, Send as a text | Short band-passed noise crinkles | Original, synthesised in code · CC0 1.0 |

The master level is about -18 dB, and the page turn is the loudest sound. Sound starts only after the first tap. It is muted by default when the device prefers reduced motion. Where supported (`navigator.audioSession.type = "ambient"`), it respects the phone's silent switch. The speaker icon's choice is saved in localStorage (`weave-him-muted`).

## Fonts
Grenze Gotisch, Cormorant Garamond, Cormorant SC and EB Garamond come from Google Fonts and are self-hosted in `frontend/public/fonts`. All are SIL Open Font License 1.1.

## Images
- The share-card assets (frame, sky, sun, stars, scrolls) were supplied by the project owner.
- The screen illustrations were extracted unchanged from the supplied storyboard (`scripts/extract_art.py`).
- Icons are from lucide-react (ISC licence).
