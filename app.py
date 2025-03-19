
import requests


url = 'https://paulogomesjr.github.io/agt_service_schedule/service_records.json'

response = requests.get(url)
print(response)


if response.status_code == 200:
    dados_json = response.json()
    dados_service = {}
    for item in dados_json:
        service_assig = item['assignments']
        if service_assig not in dados_service:
            dados_service[service_assig] = []

        dados_service[service_assig].append({
            "service_reg": item['service_register'],
            "place": item['place'],
            "address": item['address'],
            "workers": item['workers'],
            "equipments": item['workers'],
        })
else:
    print(f'O erro foi {response.status_code}')


print(dados_service['Plumbing'])

