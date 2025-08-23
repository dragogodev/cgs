import json
import os
import time
from bs4 import BeautifulSoup
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Set up Selenium with headless Chrome
options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.add_argument('--window-size=1920,1080')

driver = webdriver.Chrome(options=options)

BASE_URL = "https://en.cf-vanguard.com/cardlist/"
SLEEP_BETWEEN = 0.5

def scroll_to_bottom():
    last_height = driver.execute_script("return document.body.scrollHeight")
    while True:
        driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.END)
        time.sleep(1.5)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height

def scrape_cards(productUrl):
    driver.get(productUrl)
    # Get product name from the page's h3.style-h3.margin-half
    try:
        productName = driver.find_element(By.CSS_SELECTOR, ".cardlist_head h3.style-h3.margin-half").text.strip()
    except Exception:
        productName = ""
    # Set productNumber as the value of the 'expansion' query parameter
    import urllib.parse
    parsed_url = urllib.parse.urlparse(productUrl)
    query_params = urllib.parse.parse_qs(parsed_url.query)
    productNumber = query_params.get('expansion', [''])[0]
    # Click on "List Detail View" to get more info
    try:
        list_view_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//a[contains(@class, 'setView') and contains(text(), 'List Detail View')]"))
        )
        list_view_btn.click()
        time.sleep(2)
    except Exception as e:
        print("Could not click List Detail View:", e)
    # Wait for the card list to load
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "#cardlist-container ul li"))
    )
    scroll_to_bottom()  # Load all cards via infinite scroll if needed
    cards = []
    items = driver.find_elements(By.CSS_SELECTOR, "#cardlist-container ul li")
    for li in items:
        try:
            a = li.find_element(By.TAG_NAME, "a")
            url = a.get_attribute('href')
            img = li.find_element(By.CSS_SELECTOR, ".image img")
            image_url = img.get_attribute('src')
            card_name = li.find_element(By.CSS_SELECTOR, ".text h5").text.strip()
            card_number = li.find_element(By.CSS_SELECTOR, ".text .number").text.strip()
            status_text = li.find_element(By.CSS_SELECTOR, ".text .status").text.strip()
            status_parts = [s.strip() for s in status_text.split('｜')]
            # Map status fields and parse numbers
            status_fields = {}
            status_labels = ["type", "clan", "grade", "power", "shield"]
            for i, val in enumerate(status_parts):
                key = status_labels[i] if i < len(status_labels) else None
                if key:
                    if key in ["grade", "power", "shield"]:
                        # Remove non-digit characters and try to parse as int
                        num = ''.join(filter(str.isdigit, val))
                        status_fields[key] = int(num) if num else None
                    else:
                        status_fields[key] = val
            effect = li.find_element(By.CSS_SELECTOR, ".text p").text.strip() if li.find_elements(By.CSS_SELECTOR, ".text p") else ""
            card = {
                "name": card_name,
                "number": card_number,
                "url": url,
                "image_url": image_url,
                "effect": effect,
                "productNumber": productNumber,
                "productName": productName
            }
            card.update(status_fields)
            cards.append(card)
        except Exception as e:
            print(f"Error parsing card: {e}")
    return cards

def load_existing_cards(filename):
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except Exception:
                return []
    return []
TIMEOUT = 15
RETRIES = 3
SLEEP_BETWEEN = 0.5
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
}

def get_with_retries(url, **kwargs):
    for attempt in range(RETRIES):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT, **kwargs)
            resp.raise_for_status()
            return resp
        except Exception as e:
            print(f"Request failed for {url} (attempt {attempt+1}/{RETRIES}): {e}")
            time.sleep(2)
    print(f"Failed to fetch {url} after {RETRIES} attempts.")
    return None

def get_product_links():
    resp = get_with_retries(BASE_URL)
    if not resp:
        return []
    soup = BeautifulSoup(resp.text, 'html.parser')
    links = set()
    for a in soup.find_all('a', href=True):
        href = a['href']
        if href.startswith('/cardlist/cardsearch/?expansion='):
            links.add('https://en.cf-vanguard.com' + href)
    return sorted(links)

def main():
    all_cards = load_existing_cards('AllCards.json')
    product_links = get_product_links()
    print(f"Found {len(product_links)} product links.")
    scraped_links = set()
    if os.path.exists('scraped_links.txt'):
        with open('scraped_links.txt', 'r') as f:
            scraped_links = set(line.strip() for line in f)
    for idx, link in enumerate(product_links, 1):
        if link in scraped_links:
            print(f"Skipping already scraped: {link}")
            continue
        print(f"Scraping product {idx}/{len(product_links)}: {link}")
        cards = scrape_cards(link)
        all_cards.extend(cards)
        # Save progress after each product
        with open('AllCards.json', 'w', encoding='utf-8') as f:
            json.dump(all_cards, f, ensure_ascii=False, indent=2)
        with open('scraped_links.txt', 'a', encoding='utf-8') as f:
            f.write(link + '\n')
        time.sleep(SLEEP_BETWEEN)
    print(f"Scraped {len(all_cards)} cards.")
    driver.quit()

if __name__ == "__main__":
    main()
