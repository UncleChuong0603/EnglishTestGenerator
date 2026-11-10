"""Optional Edge TTS backend; dependencies are local to .tmp/video-tts."""
import asyncio
import sys

import edge_tts


async def main():
    for attempt in range(8):
        try:
            speech = edge_tts.Communicate(
                sys.argv[1], voice="vi-VN-HoaiMyNeural", rate="+6%"
            )
            await speech.save(sys.argv[2])
            return
        except (edge_tts.exceptions.NoAudioReceived, ConnectionError):
            if attempt == 7:
                raise
            await asyncio.sleep(2)


if __name__ == "__main__":
    asyncio.run(main())
