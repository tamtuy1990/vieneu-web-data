# vieneu-web-data

Data files for the "Ngọc Huyền" voice (VieNeu-TTS v3 Turbo) running fully in the browser inside a Google Flow tool.
The model weights themselves are loaded from Hugging Face; this repository only holds what has no browser-ready host.

| File | What it is | Source / licence |
|---|---|---|
| `sea_g2p_rs.wasm` | Vietnamese/English text → phoneme converter, compiled for `wasm32-unknown-unknown` (`--no-default-features --features capi`) | [sea-g2p](https://github.com/pnnbao97/sea-g2p) 0.10.0 (commit in `patch/sea-g2p-commit.txt`), Apache-2.0, modified: `patch/sea-g2p-wasm.patch` |
| `sea_g2p_vi.bin.gz.00`, `.01` | sea-g2p phoneme dictionary with the Thai and Indonesian sections removed (`patch/locTuDien.mjs`), gzip, split in two (jsDelivr serves ≤ 20 MB per file). Concatenate, then gunzip: 50 090 973 bytes | sea-g2p `python/sea_g2p/sea_g2p.bin`, Apache-2.0 |
| `ngoc-huyen.json` | The "Ngọc Huyền" preset voice: 192-d speaker embedding + 63 MOSS reference frames | [VieNeu-TTS](https://github.com/pnnbao97/VieNeu-TTS) `voices_v3_turbo.json` (commit in `patch/vieneu-commit.txt`), Apache-2.0 |
| `voices.json` | All 25 preset voices of VieNeu-TTS v3 Turbo, keyed by tool voice id (`vieneu_ngoc` = Ngọc Huyền, `vieneu_<name>` for the others): name, 192-d speaker embedding, MOSS reference frames (trailing encoder pad frame 455 removed) | [VieNeu-TTS](https://github.com/pnnbao97/VieNeu-TTS) `voices_v3_turbo.json`, Apache-2.0 |

## Changes made to sea-g2p (summary of `patch/sea-g2p-wasm.patch`)

- On `wasm32`, the dictionary is read from bytes handed over by JavaScript instead of a memory-mapped file; `memmap2` is only a native dependency.
- Three exports for the JavaScript host: `sea_g2p_alloc`, `sea_g2p_free`, `sea_g2p_set_dict`.
- Phonemisation itself is unchanged. The output matched the Python `sea-g2p` package on 21 test sentences that include numbers, dates, English and abbreviations.

Licensed under the Apache License 2.0 (see `LICENSE`), as are the upstream projects.
