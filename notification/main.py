import decimal
import json
import os
import html
import logging
import time
import random

import requests

DEFAULT_START_BLOCK = 0x4EE8F93  # 82743187
LAST_BLOCK_FILE = "last_block.txt"
TELEGRAM_BOT_TOKEN = "8606701408:AAGcTAnMImfCpMIqoGuzVsuTeL3br1eLOuc"
CHAT_IDS = [
    "-1003623028891",
]
POLL_INTERVAL = 60  # seconds between polls (if BscScan busy consider increasing)
TELEGRAM_SENDPHOTO = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendPhoto"
MAX_BACKOFF = 10.0
BASE_BACKOFF = 0.6
MAX_RETRIES = 4
PHOTO_FILE_PATH = "photo.jpg"
DEFAULT_BLOCK_CHUNK = 1000
MIN_BLOCK_CHUNK = 1
RPC_TIMEOUT = 30
CONTRACT_ADDRESS = "0xB1027A8CAEDd97fbb809Ef9F3258d55DB71F6f92"
EVENT_TOPIC0 = "0xa91e0c3165215fe453f5bf3de083d5fd6c4e62c491849155a042a647588c53a0"

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
    topics = log.get("topics", [])
    if len(topics) < 2:
        raise ValueError("missing indexed user topic")

    addr = "0x" + topics[1][-40:]
    hex_data = log.get("data", "0x")[2:]
    parts = [hex_data[i : i + 64] for i in range(0, len(hex_data), 64)]
    nums = [int(p, 16) for p in parts]

    if len(nums) >= 3:
        # Legacy payload shape: planId, amount, timestamp
        plan_id = nums[0]
        amount_raw = nums[1]
        timestamp = nums[2]
    elif len(nums) == 2:
        # NewDeposit(address,uint256,uint256) => amount, timestamp
        plan_id = None
        amount_raw = nums[0]
        timestamp = nums[1]
    elif len(nums) == 1:
        plan_id = None
        amount_raw = nums[0]
        timestamp = None
    else:
        raise ValueError("empty event data")

    return {
        "user": addr,
        "planId": plan_id,
        "amount": float(decimal.Decimal(amount_raw) / 10**18),
        "timestamp": timestamp,
        "block": int(log["blockNumber"], 16),
        "transactionHash": log["transactionHash"],
    }


def rpc_call(method, params):
    headers = {"Content-Type": "application/json"}
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": method,
        "params": params,
    }

    response = requests.post(
        url, headers=headers, data=json.dumps(payload), timeout=RPC_TIMEOUT
    )
    response.raise_for_status()
    return response.json()


def get_latest_block():
    response_json = rpc_call("eth_blockNumber", [])
    if "error" in response_json:
        raise RuntimeError(f"eth_blockNumber failed: {response_json['error']}")
    return int(response_json["result"], 16)


def fetch_logs(from_block, to_block):
    logging.info(
        "Starting scan from block: %d (%s) to block: %d (%s)",
        from_block,
        hex(from_block),
        to_block,
        hex(to_block),
    )

    response_json = rpc_call(
        "eth_getLogs",
        [
            {
                "fromBlock": hex(from_block),
                "toBlock": hex(to_block),
                "address": CONTRACT_ADDRESS,
                "topics": [EVENT_TOPIC0],
            }
        ],
    )
    if "error" in response_json:
        return None, response_json["error"]

    return response_json.get("result", []), None


def is_block_range_too_large(error):
    message = str(error.get("message", "")).lower()
    return error.get("code") == -32062 or "range is too large" in message


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
    latest_block = get_latest_block()

    if from_block > latest_block:
        logging.info("No new blocks yet. Current head is %d.", latest_block)
        return

    chunk_size = min(DEFAULT_BLOCK_CHUNK, latest_block - from_block + 1)
    to_block = from_block + chunk_size - 1

    while True:
        logs, error = fetch_logs(from_block, to_block)
        if error is None:
            break
        if is_block_range_too_large(error) and chunk_size > MIN_BLOCK_CHUNK:
            chunk_size = max(MIN_BLOCK_CHUNK, chunk_size // 2)
            to_block = min(latest_block, from_block + chunk_size - 1)
            logging.warning(
                "RPC rejected block range (%s). Reducing chunk size to %d blocks.",
                error,
                chunk_size,
            )
            continue

        logging.error("Error from API: %s", error)
        return

    if not logs:
        logging.info("No new logs found in blocks %d-%d.", from_block, to_block)
        save_last_block(to_block + 1)
        return

    decoded_logs = []
    for raw_log in logs:
        try:
            decoded_logs.append(decode_log(raw_log))
        except (KeyError, ValueError, IndexError) as e:
            tx_hash = raw_log.get("transactionHash", "unknown")
            logging.warning("Skipping undecodable log %s: %s", tx_hash, e)

    if not decoded_logs:
        logging.info(
            "All logs in blocks %d-%d were skipped due to decode issues.", from_block, to_block
        )
        save_last_block(to_block + 1)
        return

    for log_data in decoded_logs:
        logging.info("New stake found: %s", log_data)
        caption = build_caption(
            amount=log_data["amount"],
            tx_from=log_data["user"],
            tx_hash=log_data["transactionHash"],
        )

        for chat_id in CHAT_IDS:
            send_photo_file(chat_id, PHOTO_FILE_PATH, caption)

    next_block = to_block + 1
    save_last_block(next_block)
    logging.info(
        "Processed blocks %d-%d. Next scan will start from block %d.",
        from_block,
        to_block,
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
