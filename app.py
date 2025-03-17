
import requests


url = 'https://paulogomesjr.github.io/agt_service_schedule/employees.json'

response = requests.get(url)
print(response)


if response.status_code == 200:
    dados_json = response.json()
    dados_agt = {}
    
     
else:
    print(f'O erro foi {response.status_code}')

