import decimal
import json
import os
import html
import logging
import time
import random

import requests

DEFAULT_START_BLOCK = 0x4D5CC0C  # 81120268
LAST_BLOCK_FILE = "last_block.txt"
TELEGRAM_BOT_TOKEN = "8606701408:AAGcTAnMImfCpMIqoGuzVsuTeL3br1eLOuc"
CHAT_IDS = [
    "-1003623028891",
]
POLL_INTERVAL = 30  # seconds between polls (if BscScan busy consider increasing)
TELEGRAM_SENDPHOTO = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendPhoto"
MAX_BACKOFF = 10.0
BASE_BACKOFF = 0.6
MAX_RETRIES = 4
PHOTO_FILE_PATH = "photo.jpg"

url = "https://go.getblock.us/952741213f7543d6b9d4ba87585fc070"
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")


def save_last_block(block_number):
    with open(LAST_BLOCK_FILE, "w") as f:
        f.write(str(block_number))


def get_last_block():
    if not os.path.exists(LAST_BLOCK_FILE):
        return DEFAULT_START_BLOCK
    try:
        with open(LAST_BLOCK_FILE, "r") as f:
            content = f.read().strip()
            if content:
                return int(content)
            return DEFAULT_START_BLOCK
    except (IOError, ValueError):
        return DEFAULT_START_BLOCK


def decode_log(log):
    addr = "0x" + log["topics"][1][-40:]
    hex_data = log["data"][2:]
    parts = [hex_data[i : i + 64] for i in range(0, len(hex_data), 64)]
    nums = [int(p, 16) for p in parts]
    return {
        "user": addr,
        "planId": nums[0],
        "amount": float(decimal.Decimal(nums[1]) / 10**18),
        "timestamp": nums[2],
        "block": int(log["blockNumber"], 16),
        "transactionHash": log["transactionHash"],
    }


def fetch_logs(from_block):
    print(f"Starting scan from block: {from_block} ({hex(from_block)})")

    headers = {"Content-Type": "application/json"}
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "eth_getLogs",
        "params": [
            {
                "fromBlock": hex(from_block),
                "address": "0x090d9DA00f48008eFEb97ac451e50EACA65a8D23",
                "topics": [
                    "0xa91e0c3165215fe453f5bf3de083d5fd6c4e62c491849155a042a647588c53a0"
                ],
            }
        ],
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))
    response.raise_for_status()

    response_json = response.json()
    if "error" in response_json:
        print(f"Error from API: {response_json['error']}")
        return None

    return response_json.get("result", [])


def build_caption(amount, tx_from, tx_hash):
    safe_amount = html.escape(
        f"{amount:.2f}".rstrip("0").rstrip(".")
        if isinstance(amount, float)
        else str(amount)
    )
    safe_from = html.escape(tx_from)
    safe_tx = html.escape(tx_hash)

    message = (
        "🎉  <b>New Deposit Received – USDBIT</b> \n\n"
        f"💰 Amount Deposited: <b>{safe_amount} USDT</b>\n"
        f"👤 <b>Wallet:</b> <code>{safe_from}</code> \n\n"
        f"<a href='https://bscscan.com/tx/{safe_tx}'>View on BscScan</a>\n\n"
        "✨ Daily Profit. Simple. Transparent.\n"
        "🌐 Website:\n"
        "<b>Stake. Grow. Enjoy.</b>\n\n"
        "<a href='https://usdbit.net'>USDBit.net</a>"
    )

    return message


def send_photo_file(chat_id: str, file_path: str, caption_html: str) -> bool:
    # send photo with retries
    attempt = 0
    while attempt < 4:
        attempt += 1
        try:
            with open(file_path, "rb") as fileobj:
                files = {"photo": fileobj}
                data = {
                    "chat_id": chat_id,
                    "caption": caption_html,
                    "parse_mode": "HTML",
                    "disable_web_page_preview": False,
                }
                resp = requests.post(
                    TELEGRAM_SENDPHOTO, data=data, files=files, timeout=30
                )
            if resp.status_code == 200:
                logging.info("Photo sent to chat %s", chat_id)
                return True
            else:
                logging.warning(
                    "Failed to send photo to %s: %s %s (attempt %d/%d)",
                    chat_id,
                    resp.status_code,
                    resp.text[:200],
                    attempt,
                    MAX_RETRIES,
                )
        except requests.RequestException as e:
            logging.warning(
                "Error sending photo to %s: %s (attempt %d/%d)",
                chat_id,
                e,
                attempt,
                MAX_RETRIES,
            )
        time.sleep(
            min(MAX_BACKOFF, BASE_BACKOFF * (2 ** (attempt - 1)))
            + random.uniform(0, 0.25)
        )
    return False


def main():
    from_block = get_last_block()
    logs = fetch_logs(from_block)

    if logs is None:  # Error occurred during fetch
        return

    if not logs:
        logging.info("No new logs found.")
        return

    decoded_logs = [decode_log(l) for l in logs]
    max_block = 0
    for log_data in decoded_logs:
        logging.info("New stake found: %s", log_data)
        if log_data["block"] > max_block:
            max_block = log_data["block"]

        caption = build_caption(
            amount=log_data["amount"],
            tx_from=log_data["user"],
            tx_hash=log_data["transactionHash"],
        )

        for chat_id in CHAT_IDS:
            send_photo_file(chat_id, PHOTO_FILE_PATH, caption)

    if max_block > 0:
        next_block = max_block + 1
        save_last_block(next_block)
        logging.info(
            "Processed up to block %d. Next scan will start from block %d.",
            max_block,
            next_block,
        )


if __name__ == "__main__":
    while True:
        try:
            main()
        except Exception as e:
            logging.error("An error occurred in the main loop: %s", e, exc_info=True)
        logging.info("Waiting for %d seconds before next poll...", POLL_INTERVAL)
        time.sleep(POLL_INTERVAL)
