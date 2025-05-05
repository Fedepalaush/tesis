import requests
from bs4 import BeautifulSoup

def obtener_tickers_cedears():
    url = "https://www.comafi.com.ar/custodiaglobal/Programas-CEDEARs-2483.note.aspx"
    response = requests.get(url)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')
    table = soup.find('table', {'class': 'tableCedear'})

    tickers = []
    if table:
        for row in table.find('tbody').find_all('tr'):
            cells = row.find_all('td')
            if len(cells) >= 7:
                ticker = cells[6].get_text(strip=True)
                tickers.append(ticker)
    return sorted(tickers)
