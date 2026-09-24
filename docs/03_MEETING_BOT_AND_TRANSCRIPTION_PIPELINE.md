# 03. Meeting Bot & Transcription Pipeline

## 1. The Problems with the Previous Bot Runner
In `self-attendee`:
1. Every 3 seconds of speech triggered an individual `process_utterance` task.
2. Long polling loops (`time.sleep(10)` up to 120 times) blocked worker processes for 20 minutes.
3. Multiple utterances attempting to finalize the `Recording` state resulted in deadlock exceptions: `OperationalError: database is locked`.

---

## 2. Kara Stateless Bot Architecture

```
[ Calendar Sync / Manual URL ]
              ¦
              ?
   [ BullMQ: "bot.dispatch" ]
              ¦
              ?
  [ apps/meeting-bot Runner ]
  (Stateless Chromium Container)
              ¦
              +--> 1. Joins Call (Zoom, Meet, Teams)
              +--> 2. Streams Audio directly to RustFS S3 (Multipart Upload)
              +--> 3. Posts Webhook Event: "meeting.recording.completed"
                          ¦
                          ?
           [ BullMQ: "transcription.process" ]
                          ¦
                          ?
             [ Groq Whisper Diarization ]
                          ¦
                          ?
           [ Single Transactional Batch Insert ]
           (Utterances, Transcripts, Timeline)
                          ¦
                          ?
             [ Mastra MOM Synthesis Job ]
```

---

## 3. Guarantees & Safeguards
1. **Zero Database Locking**: The bot runner makes no SQL queries. It communicates only via authenticated HTTP webhooks with idempotency keys.
2. **Batch Persistence**: Transcripts are inserted in a single atomic database transaction once transcription completes.
3. **Automatic Reconnection & Max Duration**: Bots enforce a strict timeout (`MAX_MEETING_DURATION_MINUTES=120`) to prevent zombie containers.

