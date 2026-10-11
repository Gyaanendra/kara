# 03. Meeting Bot & Transcription Pipeline

## 1. The Problems with the Previous Bot Runner
In the legacy `self-attendee` prototype:
1. Every 3 seconds of speech triggered an individual `process_utterance` task.
2. Long polling loops (`time.sleep(10)` up to 120 times) blocked worker processes for 20 minutes.
3. Multiple utterances attempting to finalize the `Recording` state resulted in deadlock exceptions: `OperationalError: database is locked`.

---

## 2. Kara Stateless Bot Architecture (Deepgram Nova-3 Multilingual)

```
[ Calendar Sync / Manual URL ]
              │
              ▼
   [ BullMQ: "bot.dispatch" ]
              │
              ▼
  [ apps/meeting-bot Runner ]
  (Stateless Chromium Container)
              │
              ├──> 1. Joins Call (Google Meet, Zoom, MS Teams)
              ├──> 2. Streams Audio directly to RustFS S3 (Multipart Upload)
              └──> 3. Posts Webhook Event: "meeting.recording.completed"
                          │
                          ▼
           [ BullMQ: "transcription.process" ]
                          │
                          ▼
      [ Deepgram Nova-3 Multilingual API ]
      - Model: nova-3 (Flagship multilingual STT)
      - Automatic Language Detection: detect_language=true
      - Native code-switching & multilingual transcription
      - Diarization: speaker turns (SPEAKER_00, SPEAKER_01)
      - Word-level timestamps & Smart formatting
      - Speed: ~40x real-time (~10s for 60m meeting)
                          │
                          ▼
        [ Laya Reflex Utterance Classifier ]
        - Tags: ACTION_ITEM, DECISION, QUESTION, INFO (33ms)
                          │
                          ▼
           [ Single Transactional Batch Insert ]
           (Utterances, Transcripts, Timeline in PG 18)
                          │
                          ▼
             [ Mastra MOM Synthesis Job ]
```

---

## 3. Why Deepgram Nova-3 for Enterprise Meeting Intelligence
1. **Multilingual Detection & Code-Switching**: Deepgram's **Nova-3** natively detects spoken languages across global meeting calls (`detect_language=true`). It transcribes multilingual conversations and code-switching mid-sentence without requiring a pre-set monolingual dictionary.
2. **Industry-Leading Diarization**: Deepgram's `diarize=true` accurately separates distinct speaker turns with millisecond `start` and `end` offsets without needing external pyannote containers.
3. **Zero Database Locking**: The bot runner makes no direct SQL queries. It uploads audio to RustFS S3, and Deepgram results are ingested in a single transactional batch insert into PostgreSQL 18.
4. **Smart Formatting & Punctuation**: Deepgram Nova-3 automatically applies capitalization, punctuation, and numerals, improving downstream MOM generation and Laya classifier accuracy.
5. **Automatic Reconnection & Max Duration**: Bots enforce a strict timeout (`MAX_MEETING_DURATION_MINUTES=120`) to prevent zombie containers.

---

## 4. Deepgram Nova-3 API Configuration
```env
# Deepgram Speech-to-Text API (Nova-3 Multilingual)
DEEPGRAM_API_KEY="your_deepgram_api_key_here"
DEEPGRAM_MODEL="nova-3"
DEEPGRAM_DETECT_LANGUAGE="true"
DEEPGRAM_DIARIZE="true"
DEEPGRAM_SMART_FORMAT="true"
DEEPGRAM_PUNCTUATE="true"
```

The transcription worker submits audio URLs from RustFS S3:
```typescript
const queryParams = new URLSearchParams({
  model: process.env.DEEPGRAM_MODEL || "nova-3",
  detect_language: "true",
  diarize: "true",
  smart_format: "true",
  punctuate: "true",
});

const response = await fetch(`https://api.deepgram.com/v1/listen?${queryParams.toString()}`, {
  method: "POST",
  headers: {
    Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ url: presignedAudioDownloadUrl }),
});

const data = await response.json();
const detectedLanguage = data.results?.channels?.[0]?.detected_language || "en";
```
