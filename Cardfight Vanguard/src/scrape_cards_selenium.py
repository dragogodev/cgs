import json
import os
import time
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
    # Retry logic for loading the product page
    max_retries = 3
    for attempt in range(max_retries):
        try:
            driver.get(productUrl)
            break
        except Exception as e:
            print(f"Error loading {productUrl} (attempt {attempt+1}/{max_retries}): {e}")
            if attempt == max_retries - 1:
                print(f"Failed to load {productUrl} after {max_retries} attempts. Skipping.")
                return []
            time.sleep(10)
    # Get product name from the page's h3.style-h3.margin-half
    try:
        productName = driver.find_element(By.CSS_SELECTOR, ".cardlist_head h3.style-h3.margin-half").text.strip()
    except Exception:
        productName = ""
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
                "image_file_type": image_url.split('.')[-1] if image_url else "",
                "effect": effect,
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

def main():
    all_sets = []
    if os.path.exists('AllSets.json'):
        with open('AllSets.json', 'r', encoding='utf-8') as f:
            try:
                all_sets = json.load(f)
            except Exception:
                all_sets = []
    scraped_links = set(obj['url'] for obj in all_sets if 'url' in obj)
    for i in sorted(range(240)):
        link = 'https://en.cf-vanguard.com/cardlist/cardsearch/?expansion=' + str(i)
        if link in scraped_links:
            print(f"Skipping already scraped: {link}")
            continue
        print(f"Scraping product {i}/240: {link}")
        cards = scrape_cards(link)
        # Save cards for this set to {expansion}.json
        import urllib.parse
        parsed_url = urllib.parse.urlparse(link)
        query_params = urllib.parse.parse_qs(parsed_url.query)
        productNumber = query_params.get('expansion', [''])[0]
        if productNumber:
            filename = f"{productNumber}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(cards, f, ensure_ascii=False, indent=2)
        cards_url = 'https://raw.githubusercontent.com/dragogodev/cgs/master/Cardfight%20Vanguard/sets/' + productNumber + '.json'
        all_sets.append({'url': link, 'code': productNumber, 'cardsUrl': cards_url})
        with open('AllSets.json', 'w', encoding='utf-8') as f:
            json.dump(all_sets, f, ensure_ascii=False, indent=2)
        time.sleep(0.5)
    print(f"Scraped {len(all_sets)} sets.")
    driver.quit()

if __name__ == "__main__":
    main()
